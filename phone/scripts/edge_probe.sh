#!/system/bin/sh

# ============================================================
# 【2026-10-04】单实例原子锁。
#   为什么需要: traffic_daemon(看门狗) 与 ping_scheduler 的保活逻辑,
#   加上手工重启, 三方可能在同一个瞬间都判断"进程不在了" -> 各拉起一个,
#   结果同时跑 2~3 份, 探测频率翻倍, 白白消耗用户的网络(用户明确在意带宽)。
#   mkdir 是原子操作, 拿不到锁说明已有实例在跑; 锁里 PID 已死则清锁重建。
# ============================================================
_LOCK="/data/local/tmp/$(basename "$0").lock"
if ! mkdir "$_LOCK" 2>/dev/null; then
  # 【竞态防护】刚拿到锁的实例可能还没把 pid 写进去(窗口 <1 秒),
  #   此时不能立刻删锁重建, 否则两个实例会同时跑起来。先等 3 秒再确认。
  _OLDPID=$(cat "$_LOCK/pid" 2>/dev/null)
  if [ -z "$_OLDPID" ]; then
    sleep 3
    _OLDPID=$(cat "$_LOCK/pid" 2>/dev/null)
  fi
  if [ -n "$_OLDPID" ] && kill -0 "$_OLDPID" 2>/dev/null; then
    echo "[$(date +%H:%M:%S)] 已有实例 PID=$_OLDPID, 本实例退出" >> /data/local/tmp/dup_guard.log
    exit 0
  fi
  # 等过仍是空 / 持有者已死 -> 真残留, 清锁重建
  rm -rf "$_LOCK"
  mkdir "$_LOCK" 2>/dev/null || exit 0
fi
echo $$ > "$_LOCK/pid"
# 全局探测通行证(硬性最多 2 个并发探测); 文件缺失时退化为不限制, 不会让脚本报错
if [ -f /data/local/tmp/probe_gate.sh ]; then . /data/local/tmp/probe_gate.sh; fi
if ! command -v probe_slot_acquire >/dev/null 2>&1; then
  probe_slot_acquire() { echo 0; }
  probe_slot_release() { :; }
fi
# 【不要加 trap ... EXIT 清锁】mksh 会把 EXIT trap 继承给子 shell,
#   脚本里任何 $(...) / 管道 / 后台任务退出都会把锁删掉 -> 锁失效。
#   锁的清理交给"PID 存活检查": 实例被杀后锁残留, 下次启动发现
#   锁内 PID 已不存在就会清锁重建, 无需 trap。
# ============================================================
# 手机 ↔ Cloudflare 边缘 · 真实单次 RTT 探针 (2026-10-04 RTT 提速 · 方案 A)
# ------------------------------------------------------------
# 为什么单独一个进程, 而不是塞进 ping_scheduler 的 60 秒轮次里:
#   ping_scheduler 的槽位时序(每 10 秒一个区域)是整块矩阵卡片的命脉,
#   任何插进去的探测都可能把某个区域推过槽位边界。独立进程 + 独立文件,
#   ping_scheduler 只在 flush 时读一次文件 => 对槽位时序【零影响】。
# 口径: TCP time_connect = 1×RTT, 与浏览器侧 /api/rtt 同口径;
#       连测 3 次取中位(抗单次拖尾), 全失败写 0(前端如实显示 --)。
# 节奏: 对齐墙上时钟的每 15 秒整点, 一分钟 4 次, 不累积漂移。
# 成本(实测): 单次探测 619 字节 / 0.04s CPU; 12 次/分钟 ≈ 8MB/天 ≈ 隧道流量 0.02%
# ============================================================

EDGE_RTT_FILE="/data/local/tmp/last_edge_rtt.txt"

# 与 ping_scheduler.sh / fast_scan.sh 中的同名函数保持逐字一致
measure_edge_rtt() {
  _n=0; _v1=0; _v2=0; _v3=0
  # 【2026-10-06 修复】原来固定测 3 次且必须 3 次全有效, 丢 1 个样本整次作废(显示 --)。
  #   现在最多尝试 5 次, 凑够 3 个有效样本(>=10ms)即停。
  for _i in 1 2 3 4 5; do
    _T=$(/system/bin/curl --connect-timeout 1 -m 2 -o /dev/null -s \
         -w "%{time_connect}" "https://${TUNNEL_HOST}/kl" 2>/dev/null)
    _V=$(awk -v t="$_T" 'BEGIN{v=int(t*1000); print (v>0?v:0)}')
    if [ "$_V" -ge 10 ]; then
      _n=$((_n + 1))
      case $_n in 1) _v1=$_V;; 2) _v2=$_V;; 3) _v3=$_V;; esac
    fi
    [ "$_n" -ge 3 ] && break
  done
  awk -v a="$_v1" -v b="$_v2" -v c="$_v3" 'BEGIN{
    # 【统一口径 2026-10-04 用户决策】丢弃 <10ms 的无效样本, 取最低 3 个有效样本的中位数;
    # 有效样本不足 3 个输出 0(界面显示 --, 不编造)。
    n=0
    if(a>=10){v[++n]=a} if(b>=10){v[++n]=b} if(c>=10){v[++n]=c}
    if(n<3){print 0; exit}
    for(x=1;x<=n;x++) for(y=x+1;y<=n;y++) if(v[x]>v[y]){t=v[x];v[x]=v[y];v[y]=t}
    print v[2]
  }'
}

[ ! -f "$EDGE_RTT_FILE" ] && echo "0" > "$EDGE_RTT_FILE"

while true; do
  # 等到下一个 15 秒整点再测 —— 对齐墙上时钟, 4 次/分钟, 不会漂移。
  # (注意: 这里只用 date +%s, 约 1.79e9, 在 32 位算术范围内;
  #  绝对不能用 date +%s%N, 那会溢出成负数。)
  NOW=$(date +%s)
  NEXT=$(( (NOW / 15 + 1) * 15 ))
  while true; do
    [ "$(date +%s)" -ge "$NEXT" ] && break
    sleep 1
  done
  _slot=$(probe_slot_acquire)
  V=$(measure_edge_rtt)
  probe_slot_release "$_slot"
  echo "$V" > "$EDGE_RTT_FILE.tmp" && mv "$EDGE_RTT_FILE.tmp" "$EDGE_RTT_FILE"
done
