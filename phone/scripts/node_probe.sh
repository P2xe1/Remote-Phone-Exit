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
# 【不要加 trap ... EXIT 清锁】mksh 会把 EXIT trap 继承给子 shell,
#   脚本里任何 $(...) / 管道 / 后台任务退出都会把锁删掉 -> 锁失效。
#   锁的清理交给"PID 存活检查": 实例被杀后锁残留, 下次启动发现
#   锁内 PID 已不存在就会清锁重建, 无需 trap。
# ============================================================
# 节点连通性探测 (2026-10-03)
#   每 10 秒探 1 个节点, 同一节点连探 2 次(抗抖动)
#   判据: HTTP 400/403/404 => 请求成功到达隧道, Xray 正常响应 => 连通
#         000 / 超时        => 不通
#   2 次都失败 => 立即标红, 不等整轮, 直接进下一个节点
#   独立进程运行, 不与 ping_scheduler 的 10 秒槽位争时序
# ============================================================
NODES_FILE="/data/local/tmp/nodes.txt"          # 由 report_traffic.sh 从 Worker 下发
STATUS_FILE="/data/local/tmp/node_status.txt"   # 上报给 Worker 的结果
IDX_FILE="/data/local/tmp/node_idx.txt"
HOST="${TUNNEL_HOST}"

[ ! -f "$NODES_FILE" ] && { echo "无节点清单, 等待下发" > "$STATUS_FILE"; }

while true; do
  if [ ! -s "$NODES_FILE" ]; then
    sleep 10
    continue
  fi

  TOTAL=$(wc -l < "$NODES_FILE" 2>/dev/null)
  [ -z "$TOTAL" ] && TOTAL=0
  if [ "$TOTAL" -le 0 ]; then sleep 10; continue; fi

  IDX=$(cat "$IDX_FILE" 2>/dev/null)
  [ -z "$IDX" ] && IDX=0
  [ "$IDX" -ge "$TOTAL" ] && IDX=0

  # 【2026-10-04 用户要求】把"当前正在探测第几个节点"(按 nodes.txt 顺序)写出来,
  #   随上报带给大屏 —— 大屏的【测速中】据此按顺序推进。
  #   为什么不能用时间戳判断: 打开大屏会触发 55 节点并发全量扫描, 完成顺序随机,
  #   按时间戳高亮就会出现"乱跳"。
  echo "$IDX" > /data/local/tmp/node_current.txt
  echo "$TOTAL" > /data/local/tmp/node_total.txt

  # 取第 IDX+1 行: 格式 ip|path
  LINE=$(sed -n "$((IDX + 1))p" "$NODES_FILE" 2>/dev/null)
  NIP_ORIG=$(echo "$LINE" | cut -d'|' -f1)
  NPATH=$(echo "$LINE" | cut -d'|' -f2)
  [ -z "$NPATH" ] && NPATH="/kl"
  NIP="$NIP_ORIG"

  # 【2026-10-04 修复 T6.3】域名式节点(如 auto.cf.relay-node.invalid)原来直接塞进
  #   --resolve 会失败(实测 000, 永远标红)。现在先 DNS 解析成 IP 再 --resolve;
  #   解析失败本轮如实标 0 跳过, 不消耗两次 5 秒的无效探测。
  IS_IP=$(echo "$NIP" | grep -cE '^[0-9]+\.[0-9]+\.[0-9]+\.[0-9]+$')
  if [ "$IS_IP" = "0" ]; then
    RESOLVED=$(getent hosts "$NIP" 2>/dev/null | awk '{print $1; exit}')
    if [ -n "$RESOLVED" ]; then
      NIP="$RESOLVED"
    else
      NIP=""
    fi
  fi

  OK=0
  RTT=0
  if [ -n "$NIP" ]; then
    # ============================================================
    # 【2026-10-04 核查修复】原来是【单次采样】, 而手机 5G 接入网的 TCP 握手
    #   抖动可达 5 倍(独立复测: 同节点 90/19/122/45/56 ms), 页面显示的就是
    #   "碰巧抽到的那一次" —— 数字真实但不可信。
    #   现在改成【全站统一口径】: 采 N 次 -> 丢弃 <10ms 的无效样本 ->
    #   取最低 3 个有效样本的中位数; 有效样本不足 3 个记 0(页面显示 --), 不编造。
    #   常规模式 N=5(每次间隔 1 秒); 提速巡检 N=3(连续发, 避免拖慢提速)。
    # ============================================================
    N_SAMPLE=5
    S_GAP=1
    if [ "${FAST_LEFT:-0}" -gt 0 ]; then
      N_SAMPLE=3
      S_GAP=0
    fi
    : > /data/local/tmp/_np_samples.tmp
    K=1
    while [ $K -le "$N_SAMPLE" ]; do
      OUT=$(/system/bin/curl -k --connect-timeout 2 -m 3 \
            --resolve "$HOST:443:$NIP" -o /dev/null -s \
            -w "%{http_code} %{time_connect}" "https://$HOST$NPATH" 2>/dev/null)
      CODE=$(echo "$OUT" | awk '{print $1}')
      TV=$(echo "$OUT" | awk '{print $2}')
      case "$CODE" in
        400|403|404)
          OK=$((OK + 1))
          echo "$TV" >> /data/local/tmp/_np_samples.tmp
          ;;
      esac
      K=$((K + 1))
      [ "$S_GAP" -gt 0 ] && sleep "$S_GAP"
    done
    # 统一口径: 丢弃 <10ms 无效样本 -> 升序 -> 取最低 3 个的中位数(=第 2 小)
    RTT=$(awk '
      { v = int($1 * 1000); if (v >= 10) a[++n] = v }
      END {
        if (n < 3) { print 0; exit }
        for (i = 1; i <= n; i++) for (j = i + 1; j <= n; j++) if (a[j] < a[i]) { t = a[i]; a[i] = a[j]; a[j] = t }
        print a[2]
      }' /data/local/tmp/_np_samples.tmp 2>/dev/null)
    [ -z "$RTT" ] && RTT=0
    rm -f /data/local/tmp/_np_samples.tmp
  fi

  # 【2026-10-04 核查产出】顺带读一次【实测落点机房】(colo):
  #   核查发现"接入点3-01"实测落 POP2、"接入点4-04"实测落 POP2 —— 这些 IP 全是
  #   Cloudflare anycast, 落点由手机网络位置决定, 订阅里的城市名只是名字。
  #   响应只有 ~600 字节, 代价可忽略; 读不到就留空, 页面显示 --。
  NCOLO=""
  if [ -n "$NIP" ] && [ "$OK" -gt 0 ]; then
    NCOLO=$(/system/bin/curl -k -s --connect-timeout 2 -m 3 \
            --resolve "$HOST:443:$NIP" "https://$HOST/cdn-cgi/trace" 2>/dev/null \
            | sed -n 's/^colo=//p' | head -1)
    case "$NCOLO" in
      [A-Z][A-Z][A-Z]) ;;
      *) NCOLO="" ;;
    esac
  fi

  NOWS=$(date +%s)
  # 记录: ip path ok 时刻 rtt毫秒  (ok=1 连通, ok=0 不通; rtt=0 表示未测到)
  if [ "$OK" -gt 0 ]; then
    echo "$NIP_ORIG|$NPATH|1|$NOWS|$RTT|$NCOLO" >> "$STATUS_FILE"
  else
    echo "$NIP_ORIG|$NPATH|0|$NOWS|0|" >> "$STATUS_FILE"
  fi
  # 【2026-10-04 修复 T6.4】按 nodes.txt 全量重建 STATUS_FILE:
  #   ① 已删除的节点不再出现(清幽灵行)
  #   ② 顺序与 nodes.txt 一致(原来 awk for(k in line) 哈希序随机)
  #   ③ 同节点只保留最后一条
  # 注意: 这里按前两个字段(ip|path)做键, 自动兼容 4 字段(旧)与 5 字段(新)行
  awk -F'|' 'NR==FNR { v[$1"|"$2]=$0; next }
             { p=$2; if (p=="") p="/kl"; k=$1"|"p; if (v[k]) print v[k] }' \
    "$STATUS_FILE" "$NODES_FILE" > "$STATUS_FILE.tmp" 2>/dev/null \
    && mv "$STATUS_FILE.tmp" "$STATUS_FILE"
  # 超过 300 条时裁掉最旧的
  LN=$(wc -l < "$STATUS_FILE" 2>/dev/null)
  if [ -n "$LN" ] && [ "$LN" -gt 300 ]; then
    tail -n 300 "$STATUS_FILE" > "$STATUS_FILE.tmp" && mv "$STATUS_FILE.tmp" "$STATUS_FILE"
  fi

  # ============================================================
  # ============================================================
  # 【2026-10-04 用户要求 · 改版】"点击测速 / 打开大屏" -> 【顺序提速巡检】
  #   原实现用 10 路并发把 55 个节点同时打一遍, 导致 55 个探测时刻几乎相同,
  #   大屏上 44 张卡同时显示"2 分钟前" —— 年龄全撞在一起, 用户明确不接受。
  #   现在: 收到指令后把节奏从 10 秒/个 提速到 2 秒/个, 从当前节点【按顺序】
  #   跑完一整轮(55 个 ≈ 110 秒), 年龄天然呈 2 秒梯度、全部错开; 跑完自动恢复。
  #   带宽: 2 KB / 2 秒 = 1 KB/s ≈ 0.008 Mbps, 占 150Mbps 上限的 0.006%,
  #   远低于 8%(12 Mbps) 预算。
  # ============================================================
  FAST_LEFT_FILE="/data/local/tmp/node_fast_left"
  SPOP6_TS=$(ls -l /data/local/tmp/scan_req 2>/dev/null | awk '{print $6$7$8}' | tr -d ':')
  [ -z "$SPOP6_TS" ] && SPOP6_TS="none"
  LAST_FULL=$(cat /data/local/tmp/node_full_at 2>/dev/null)
  [ -z "$LAST_FULL" ] && LAST_FULL="none"
  if [ "$SPOP6_TS" != "none" ] && [ "$SPOP6_TS" != "$LAST_FULL" ]; then
    echo "$SPOP6_TS" > /data/local/tmp/node_full_at
    echo "$TOTAL" > "$FAST_LEFT_FILE"     # 整轮提速: 还剩 TOTAL 个节点
  fi
  FAST_LEFT=$(cat "$FAST_LEFT_FILE" 2>/dev/null)
  [ -z "$FAST_LEFT" ] && FAST_LEFT=0

  IDX=$((IDX + 1))
  [ "$IDX" -ge "$TOTAL" ] && IDX=0
  echo "$IDX" > "$IDX_FILE"

  # 提速模式: 本轮剩余节点还没跑完 -> 2 秒一个; 否则常规 10 秒一个
  if [ "$FAST_LEFT" -gt 0 ]; then
    FAST_LEFT=$((FAST_LEFT - 1))
    echo "$FAST_LEFT" > "$FAST_LEFT_FILE"
    # 【2026-10-04 用户强制要求】提速节奏与手机上报周期(6 秒)对齐。
    #   手机上报告诉大屏"现在正在测第几个节点"; 若巡检比上报快(原 2 秒/格),
    #   两次上报之间手机已经换了 3 个节点, 大屏只能显示其中一个 -> 框会"跳格"。
    #   改成 6 秒/格后, 每次上报恰好前进一格: 框必定落在手机上真实正在测的节点,
    #   既不跳格也不跳回。(常规模式 10 秒/格, 同样只会走 0 或 1 格, 不会跳。)
    sleep 6
  else
    sleep 10
  fi
done
