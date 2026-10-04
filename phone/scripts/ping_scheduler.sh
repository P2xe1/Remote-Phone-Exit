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
# ========================================================
# 6 区域物理握手时延与抖动精准时钟槽位调度器 (方案 C)
# 严格对齐 Unix 时间戳整点秒数:
# 00s ~ 09s: Slot 0 -> 接入点1 POP1
# 10s ~ 19s: Slot 1 -> 接入点6 POP6
# 20s ~ 29s: Slot 2 -> 接入点2 POP2
# 30s ~ 39s: Slot 3 -> 接入点3 POP3
# 40s ~ 49s: Slot 4 -> 接入点4 POP4
# 50s ~ 59s: Slot 5 -> 接入点5 POP5
# 下一分钟 00s 循环返回 Slot 0
# ========================================================

PING_CACHE="/data/local/tmp/ping_cache.txt"
LAST_PINGS_FILE="/data/local/tmp/last_pings.txt"
LAST_JITTERS_FILE="/data/local/tmp/last_jitters.txt"
LAST_TIMES_FILE="/data/local/tmp/last_ping_times.txt"
LAST_LOSSES_FILE="/data/local/tmp/last_losses.txt"
# 【RTT 修复】手机 ↔ CF 边缘 的真实单次 RTT(TCP time_connect), 单独一个文件存单值,
# 刻意不动上面 6 列格式的文件 —— 6 大地区矩阵卡片继续按原语义解析。
EDGE_RTT_FILE="/data/local/tmp/last_edge_rtt.txt"
P_EDGE_RTT=0
# 【第二行】国际出口质量: 六地区真单播锚点, 由独立进程 intl_probe.sh 每 60 秒轮测 1 区
INTL_FILE="/data/local/tmp/last_intl.txt"
INTL_TIMES_FILE="/data/local/tmp/last_intl_times.txt"
INTL_BASE_FILE="/data/local/tmp/last_intl_base.txt"
# 【方案 A+C】CF 锚点实测落点(colo): 每 5 分钟重新测一次
COLO_FILE="/data/local/tmp/last_colo.txt"

# 全量扫描周期(秒): 每轮把 6 个区域全部测一遍, 然后休眠到下一个周期
# 全量扫描周期(秒)
SWEEP_INTERVAL=45
# 【2026-10-03】区域之间的间隔(秒)。原设计是 10 秒一个区域, 但 6x10=60 秒
# 的周期 + 投递延迟必然超过 65 秒要求。这里用 6 秒间隔:
#   单区域(测量约1.5s + 歇6s) => 相邻两区域约 7.5 秒, 接近原本的 10 秒手感
#   6 个区域一轮约 48 秒, 最大年龄 48+8(投递) = 56 秒 < 65 秒 ✅
# 为什么要留间隔而不是连续测完: 连续测完会让手机在那 10 秒内连跑 30 个 curl,
# 与 Xray 抢 CPU, 可能给用户造成延迟尖峰。留间隔后每次只连续工作约 1.5 秒。
SLOT_GAP=6

# --------------------------------------------------------
# 【方案 A+C 2026-10-04】取一个 anycast IP 的【实测落点机房码】。
#   Cloudflare 的 /cdn-cgi/trace 会返回 colo=XXX(如 POP2/POP1/POP4), 这是边缘自己
#   判定的"你这个包实际进了哪个机房"。失败/无字段返回空串, 由调用方置 '?'。
# --------------------------------------------------------
curl_colo() {
  /system/bin/curl -k --connect-timeout 1 -m 2 --resolve "cloudflare.com:443:$1" -s \
    "https://cloudflare.com/cdn-cgi/trace" 2>/dev/null | awk -F= '/^colo=/{print $2; exit}'
}

# --------------------------------------------------------
# 统一测点采样 (2026-10-03 重写; 2026-10-04 样本 10 -> 15, 口径 中位数 -> 最低3均值)
#   每个区域采 15 次 TCP+TLS 握手, 取【最低 3 次的平均值】, 并统计失败次数得到丢包率。
#   【为什么是 15】用户 2026-10-04 决策: 保持 60 秒全区一轮(最大年龄仍 ~58 秒,
#   不破坏 65 秒新鲜度要求), 只把每区样本从 10 提到 15。探测总量 60 -> 90 次/分钟
#   (单核约 0.6% -> 0.9%, 仍远低于 8% 预算)。刻意不做"30 秒 1 区": 那会把最大
#   年龄推到 180 秒。
#   注意: 15 个样本仍在同一个 10 秒槽位内连发, 实测单区约 2 秒, 未越过槽位边界;
#         但若锚点【不可达】, 15 次各要等 1 秒连接超时 => 单区约 16 秒会越槽位(已知边界)。
#   【最低3均值的含义】它反映该出口的【最优可达时延/链路地板】, 不是典型时延;
#   因此界面上必须写明口径, 否则会被误读成"一般要这么久"。
#   为什么统一用 time_appconnect:
#     旧实现 5 个区域用 time_appconnect (TCP+TLS ≈ 2 个 RTT),
#     唯独"接入点6"用 time_connect (仅 TCP ≈ 1 个 RTT) →
#     接入点6天然少一个 RTT, 与其它区域【不可横向比较】。
#     现在 6 个区域口径完全一致。
#   【2026-10-04 用户要求】阿里 DoH(223.5.5.5) 已彻底移除 —— 该槽位(gz)现在也是
#   Cloudflare 边缘 IP(${CF_ANCHOR_2}, 实测落 POP1)。下面这段历史说明保留作记录:
#   接入点6锚点曾从 119.29.29.29(腾讯) 换成 223.5.5.5(阿里 DoH):
#     实测腾讯那个 IP 从本机网络【完全不可达】(带 SNI 也握手失败),
#     而丢包率指标一上线就报了 gz=100% —— 这正是丢包率的价值所在。
#   【已知局限】这 5 个 Cloudflare 锚点都是 anycast: 实测 colo 显示
#     ${CF_ANCHOR_1} -> POP1, 其余 3 个 -> POP2, 也就是说"接入点3/接入点4/接入点5"三张卡
#     实际测的是同一个接入点2机房。要真测地区必须换单播锚点(另行决策)。
#   输出: "<最低3均值ms> <失败次数> <总次数>"  全失败时为 0
# --------------------------------------------------------
measure_anchor() {
  _URL="$1"; _HOST="$2"; _IP="$3"
  _n=0; _fail=0; _v1=0; _v2=0; _v3=0; _v4=0; _v5=0
  _v6=0; _v7=0; _v8=0; _v9=0; _v10=0; _v11=0; _v12=0; _v13=0; _v14=0; _v15=0
  for _i in 1 2 3 4 5 6 7 8 9 10 11 12 13 14 15; do
    # 【槽位保护 2026-10-04】累计 8 次失败就停止本轮采样(再测多半还是失败)。
    # 配合下面的 0.5 秒连接超时, 最坏耗时从"15 x 1s = 16 秒"降到"8 x 0.5s ≈ 4 秒",
    # 不会再把这个 10 秒槽位挤爆(实测曾出现 hk 落到第 38 秒、把 jp 挤到第 40 秒)。
    # 注意: 丢包率必须按【实际尝试次数】算, 不能用固定 15 当分母 —— 否则早停会把
    #       丢包率算低, 那是造假。见调用处的 LOSS 计算。
    [ "$_fail" -ge 8 ] && break
    if [ -n "$_IP" ]; then
      _T=$(/system/bin/curl -k --connect-timeout 0.5 -m 1 --resolve "$_HOST:443:$_IP" \
           -o /dev/null -s -w "%{time_appconnect}" "$_URL" 2>/dev/null)
    else
      _T=$(/system/bin/curl -k --connect-timeout 0.5 -m 1 \
           -o /dev/null -s -w "%{time_appconnect}" "$_URL" 2>/dev/null)
    fi
    _V=$(awk -v t="$_T" 'BEGIN{v=int(t*1000); print (v>0?v:0)}')
    if [ "$_V" -gt 0 ]; then
      _n=$((_n+1))
      case $_n in 1) _v1=$_V;; 2) _v2=$_V;; 3) _v3=$_V;; 4) _v4=$_V;; 5) _v5=$_V;;
                  6) _v6=$_V;; 7) _v7=$_V;; 8) _v8=$_V;; 9) _v9=$_V;; 10) _v10=$_V;;
                  11) _v11=$_V;; 12) _v12=$_V;; 13) _v13=$_V;; 14) _v14=$_V;; 15) _v15=$_V;; esac
    else
      _fail=$((_fail+1))
    fi
  done
  _BEST3=$(awk -v a="$_v1" -v b="$_v2" -v c="$_v3" -v d="$_v4" -v e="$_v5" \
            -v f="$_v6" -v g="$_v7" -v h="$_v8" -v i="$_v9" -v j="$_v10" \
            -v k="$_v11" -v l="$_v12" -v m="$_v13" -v n2="$_v14" -v o="$_v15" 'BEGIN{
    # 【统一口径 2026-10-04 用户决策】丢弃 <10ms 的无效样本, 取最低 3 个有效样本的中位数;
    # 有效样本不足 3 个输出 0(界面显示 --, 不编造)。
    n=0
    if(a>=10){v[++n]=a} if(b>=10){v[++n]=b} if(c>=10){v[++n]=c}
    if(d>=10){v[++n]=d} if(e>=10){v[++n]=e} if(f>=10){v[++n]=f}
    if(g>=10){v[++n]=g} if(h>=10){v[++n]=h} if(i>=10){v[++n]=i}
    if(j>=10){v[++n]=j} if(k>=10){v[++n]=k} if(l>=10){v[++n]=l}
    if(m>=10){v[++n]=m} if(n2>=10){v[++n]=n2} if(o>=10){v[++n]=o}
    if(n<3){print 0; exit}
    for(x=1;x<=n;x++) for(y=x+1;y<=n;y++) if(v[x]>v[y]){t=v[x];v[x]=v[y];v[y]=t}
    print v[2]
  }')
  echo "$_BEST3 $_fail $_n"
}

# --------------------------------------------------------
# 【RTT 修复 2026-10-04】面向真实域名 ${TUNNEL_HOST} 的 TCP 连接时延(1×RTT)。
#   为什么必须新增这一段:
#     浏览器侧量的是 fetch('/api/rtt') 的一个网络往返 = 1×RTT;
#     而 6 大地区矩阵用的 time_appconnect 是 TLS 握手 ≈ 2×RTT。
#     两个量纲直接相加是错的 —— 这里取 time_connect, 与浏览器侧统一到"一次往返"。
#   连测 3 次取中位数(抗单次拖尾); 全失败返回 0, 由前端如实显示 "--"。
#   成本: 每轮(60 秒)只多 3 次连接, 不经过 xray 转发路径。
# --------------------------------------------------------
measure_edge_rtt() {
  _n=0; _v1=0; _v2=0; _v3=0
  for _i in 1 2 3; do
    _T=$(/system/bin/curl --connect-timeout 1 -m 2 -o /dev/null -s \
         -w "%{time_connect}" "https://${TUNNEL_HOST}/kl" 2>/dev/null)
    _V=$(awk -v t="$_T" 'BEGIN{v=int(t*1000); print (v>0?v:0)}')
    if [ "$_V" -gt 0 ]; then
      _n=$((_n + 1))
      case $_n in 1) _v1=$_V;; 2) _v2=$_V;; 3) _v3=$_V;; esac
    fi
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

# 初始化默认历史数据 (防止首次读取空值)
NOW_INIT=$(date +%s)
# [真实性修复 2026-10-04] 这一段原来还会【编造】抖动与测量时刻:
#   LAST_JITTERS_FILE 初始化为 "4 4 4 4 4 4"      -> 假抖动 ±4ms
#   LAST_TIMES_FILE   初始化为 NOW-50/-40/.../NOW -> 假装"10~50 秒前刚测过"
# 这些假值一发上大屏, 就变成"看起来刚测过、抖动很稳"的假象。
# 现全部如实初始化为 0:
#   抖动 0 = 从未测到
#   时刻 0 = 从未成功测量(前端按"未测到"渲染, 红色), 而不会伪装成刚刚
# 时延(LST_PINGS_FILE)此前已修为 0, 保持不变。
[ ! -f "$LAST_PINGS_FILE" ] && echo "0 0 0 0 0 0" > "$LAST_PINGS_FILE"
[ ! -f "$LAST_JITTERS_FILE" ] && echo "0 0 0 0 0 0" > "$LAST_JITTERS_FILE"
[ ! -f "$LAST_TIMES_FILE" ] && echo "0 0 0 0 0 0" > "$LAST_TIMES_FILE"
[ ! -f "$LAST_LOSSES_FILE" ] && echo "0 0 0 0 0 0" > "$LAST_LOSSES_FILE"
# 【RTT 修复】单值文件: 0 = 从未测到, 前端按 "--" 渲染, 不编造
[ ! -f "$EDGE_RTT_FILE" ] && echo "0" > "$EDGE_RTT_FILE"
# 【方案 A+C】落点文件初值: 全是 '?'(未测到), 前端按"未知机房"渲染, 不编造
[ ! -f "$COLO_FILE" ] && echo "? ? ? ? ? ?" > "$COLO_FILE"

# ========================================================
# 【2026-10-03 重写】把当前 6 个区域的状态立即落盘 (含 ping_cache)。
# 每测完一个区域就调用一次 => 上报脚本下一次(约 6 秒内)就会把它带走,
# 这就是你要的"一个区域测完立即推送", 不必等整轮 6 个都测完。
# 【2026-10-04 修复 T6.2】全部改为"写 .tmp + mv"原子替换:
#   手动刷新时本脚本与 fast_scan.sh 会并发写这组文件, 原来的 `echo > file`
#   直写会在截断瞬间让上报脚本读到半截/空文件, 触发假兜底。
# ========================================================
flush_state() {
  # 【RTT 提速 2026-10-04】edgeRtt 现在由独立进程 edge_probe.sh 每 15 秒更新一次,
  # 所以每次落盘前重读该文件 —— 这样每一轮上报带的都是最新真实值, 而不是
  # 60 秒才换一次。用 shell 内建 read + 纯数字校验: 不额外 fork 任何进程,
  # 且绝不让非数字/超长内容拼进 JSON(拼坏 ping_cache = 整份上报体变非法 JSON)。
  _ER=""
  read -r _ER < "$EDGE_RTT_FILE" 2>/dev/null
  case "$_ER" in
    ''|*[!0-9]*) P_EDGE_RTT=0 ;;
    *) if [ ${#_ER} -le 6 ]; then P_EDGE_RTT=$_ER; else P_EDGE_RTT=0; fi ;;
  esac

  # --------------------------------------------------------
  # 【第二行 2026-10-04】国际出口质量(六地区真单播目标, 每 60 秒轮测 1 个地区)
  # 由独立进程 intl_probe.sh 维护; 这里只读文件 —— 用 shell 内建 read 一次取 6 个数,
  # 不 fork 任何进程; 每个值都做"纯数字 + 长度"校验, 绝不让脏值拼坏 ping_cache。
  # 时间戳是 10 位 epoch, 所以长度上限给 11。
  # --------------------------------------------------------
  I_KL=0; I_GZ=0; I_SG=0; I_HK=0; I_JP=0; I_TW=0
  IT_KL=0; IT_GZ=0; IT_SG=0; IT_HK=0; IT_JP=0; IT_TW=0
  I_BASE=0
  read -r I_KL I_GZ I_SG I_HK I_JP I_TW < "$INTL_FILE" 2>/dev/null
  read -r IT_KL IT_GZ IT_SG IT_HK IT_JP IT_TW < "$INTL_TIMES_FILE" 2>/dev/null
  read -r I_BASE < "$INTL_BASE_FILE" 2>/dev/null
  case "$I_KL" in ''|*[!0-9]*) I_KL=0 ;; *) [ ${#I_KL} -gt 6 ] && I_KL=0 ;; esac
  case "$I_GZ" in ''|*[!0-9]*) I_GZ=0 ;; *) [ ${#I_GZ} -gt 6 ] && I_GZ=0 ;; esac
  case "$I_SG" in ''|*[!0-9]*) I_SG=0 ;; *) [ ${#I_SG} -gt 6 ] && I_SG=0 ;; esac
  case "$I_HK" in ''|*[!0-9]*) I_HK=0 ;; *) [ ${#I_HK} -gt 6 ] && I_HK=0 ;; esac
  case "$I_JP" in ''|*[!0-9]*) I_JP=0 ;; *) [ ${#I_JP} -gt 6 ] && I_JP=0 ;; esac
  case "$I_TW" in ''|*[!0-9]*) I_TW=0 ;; *) [ ${#I_TW} -gt 6 ] && I_TW=0 ;; esac
  case "$IT_KL" in ''|*[!0-9]*) IT_KL=0 ;; *) [ ${#IT_KL} -gt 11 ] && IT_KL=0 ;; esac
  case "$IT_GZ" in ''|*[!0-9]*) IT_GZ=0 ;; *) [ ${#IT_GZ} -gt 11 ] && IT_GZ=0 ;; esac
  case "$IT_SG" in ''|*[!0-9]*) IT_SG=0 ;; *) [ ${#IT_SG} -gt 11 ] && IT_SG=0 ;; esac
  case "$IT_HK" in ''|*[!0-9]*) IT_HK=0 ;; *) [ ${#IT_HK} -gt 11 ] && IT_HK=0 ;; esac
  case "$IT_JP" in ''|*[!0-9]*) IT_JP=0 ;; *) [ ${#IT_JP} -gt 11 ] && IT_JP=0 ;; esac
  case "$IT_TW" in ''|*[!0-9]*) IT_TW=0 ;; *) [ ${#IT_TW} -gt 11 ] && IT_TW=0 ;; esac
  case "$I_BASE" in ''|*[!0-9]*) I_BASE=0 ;; *) [ ${#I_BASE} -gt 6 ] && I_BASE=0 ;; esac

  # --------------------------------------------------------
  # 【方案 A+C】CF 锚点实测落点(colo)。字符串字段, 只接受 3 位大写机房码或 '?',
  # 否则一律 '?' —— 保证拼进 JSON 的永远是安全值(不会出现引号/控制字符)。
  # --------------------------------------------------------
  C_KL="?"; C_GZ="?"; C_SG="?"; C_HK="?"; C_JP="?"; C_TW="?"
  read -r C_KL C_GZ C_SG C_HK C_JP C_TW < "$COLO_FILE" 2>/dev/null
  case "$C_KL" in [A-Z][A-Z][A-Z]) ;; *) C_KL="?" ;; esac
  case "$C_GZ" in [A-Z][A-Z][A-Z]) ;; *) C_GZ="?" ;; esac
  case "$C_SG" in [A-Z][A-Z][A-Z]) ;; *) C_SG="?" ;; esac
  case "$C_HK" in [A-Z][A-Z][A-Z]) ;; *) C_HK="?" ;; esac
  case "$C_JP" in [A-Z][A-Z][A-Z]) ;; *) C_JP="?" ;; esac
  case "$C_TW" in [A-Z][A-Z][A-Z]) ;; *) C_TW="?" ;; esac
  echo "$P_KL $P_GZ $P_SG $P_HK $P_JP $P_TW" > "$LAST_PINGS_FILE.tmp" && mv "$LAST_PINGS_FILE.tmp" "$LAST_PINGS_FILE"
  echo "$J_KL $J_GZ $J_SG $J_HK $J_JP $J_TW" > "$LAST_JITTERS_FILE.tmp" && mv "$LAST_JITTERS_FILE.tmp" "$LAST_JITTERS_FILE"
  echo "$T_KL $T_GZ $T_SG $T_HK $T_JP $T_TW" > "$LAST_TIMES_FILE.tmp" && mv "$LAST_TIMES_FILE.tmp" "$LAST_TIMES_FILE"
  echo "$L_KL $L_GZ $L_SG $L_HK $L_JP $L_TW" > "$LAST_LOSSES_FILE.tmp" && mv "$LAST_LOSSES_FILE.tmp" "$LAST_LOSSES_FILE"
  echo "\"pings\":{\"kl\":$P_KL,\"gz\":$P_GZ,\"sg\":$P_SG,\"hk\":$P_HK,\"jp\":$P_JP,\"tw\":$P_TW,\"egress\":${P_GW:-0}},\"jitters\":{\"kl\":$J_KL,\"gz\":$J_GZ,\"sg\":$J_SG,\"hk\":$J_HK,\"jp\":$J_JP,\"tw\":$J_TW},\"pingTimes\":{\"kl\":$T_KL,\"gz\":$T_GZ,\"sg\":$T_SG,\"hk\":$T_HK,\"jp\":$T_JP,\"tw\":$T_TW},\"losses\":{\"kl\":$L_KL,\"gz\":$L_GZ,\"sg\":$L_SG,\"hk\":$L_HK,\"jp\":$L_JP,\"tw\":$L_TW},\"edgeRtt\":${P_EDGE_RTT:-0},\"intlPings\":{\"kl\":$I_KL,\"gz\":$I_GZ,\"sg\":$I_SG,\"hk\":$I_HK,\"jp\":$I_JP,\"tw\":$I_TW},\"intlTimes\":{\"kl\":$IT_KL,\"gz\":$IT_GZ,\"sg\":$IT_SG,\"hk\":$IT_HK,\"jp\":$IT_JP,\"tw\":$IT_TW},\"intlBaseline\":${I_BASE:-0},\"colos\":{\"kl\":\"$C_KL\",\"gz\":\"$C_GZ\",\"sg\":\"$C_SG\",\"hk\":\"$C_HK\",\"jp\":\"$C_JP\",\"tw\":\"$C_TW\"},\"activeSlot\":$SLOT,\"activeNode\":\"$ACTIVE_KEY\"," > "$PING_CACHE.tmp" && mv "$PING_CACHE.tmp" "$PING_CACHE"
}

while true; do
  # 【严格 60 秒周期】本轮起点 = 当前整分钟。锚定墙上时钟,
  # 无论本轮测量快慢, 下一轮必定在下一个整分钟开始 => 物理上不可能漂移或拉长。
  CYCLE_START=$(( ($(date +%s) / 60) * 60 ))
  NOW=$(date +%s)
  SEC=$((NOW % 60))

  # ========================================================
  # 保活节点连通性探测进程 (node_probe.sh)
  #   ping_scheduler 已被 traffic_daemon.sh 看门狗保活, 所以这里顺带
  #   保活 node_probe, 它就间接获得了"被杀自动复活"与"开机后重生"的能力,
  #   不需要额外改动看门狗脚本。
  # ========================================================
  if ! pgrep -f "node_probe.sh" >/dev/null 2>&1; then
    nohup sh /data/local/tmp/node_probe.sh </dev/null >/dev/null 2>&1 &
  fi

  # 【RTT 提速 2026-10-04】edgeRtt 探针(每 15 秒一次)同样保活 —— 与 node_probe
  # 同一模式, 于是它自动获得"被杀自动复活/开机后重生"的能力, 不需要改看门狗。
  # 注意: 只有命令行为 edge_probe.sh 的进程会被匹配, 不会误伤别的脚本。
  if ! pgrep -f "edge_probe.sh" >/dev/null 2>&1; then
    nohup sh /data/local/tmp/edge_probe.sh </dev/null >/dev/null 2>&1 &
  fi

  # 【2026-10-04 用户要求】原来的"国际出口质量"整块已从看板删除, 对应的 intl_probe
  #   探针不再需要 —— 这里【不再保活它】, 避免白跑流量(每次探测约 2 KB)。
  #   如将来要恢复该功能: 重新加上这段保活, 并还原看板里的 intlRow 即可。

  # ========================================================
  # 【方案 A+C 2026-10-04】CF 锚点落点(colo)实测 —— 每 5 分钟一轮(5 次 curl)
  #   为什么必须实测而不是照抄城市名: 这 5 个锚点【全是 anycast】, 实测
  #     ${CF_ANCHOR_1} -> POP1, 其余 3 个(接入点3/接入点4/接入点5标签) -> POP2。
  #   硬把卡片命名成"接入点3/接入点4/接入点5"就是让卡片名撒谎 —— 数字是真的, 名字是假的。
  #   成本: 5 次 curl + 5 次 awk / 5 分钟 ≈ 1 次/分钟, 相对 90 次/分钟可忽略。
  #   用 CYCLE_START % 300 对齐到 5 分钟整点, 不额外引入漂移。
  # ========================================================
  if [ $((CYCLE_START % 300)) -eq 0 ]; then
    # 【2026-10-04 用户要求】彻底去掉阿里(223.5.5.5), 六个锚点全部换成 Cloudflare 边缘 IP,
    # 且每个 IP 的落点都逐个实测确认过(读 /cdn-cgi/trace 的 colo):
    #   ${CF_ANCHOR_1} -> POP1   ${CF_ANCHOR_2} -> POP1   ${CF_ANCHOR_3} -> POP1
    #   ${CF_ANCHOR_4} -> POP2   ${CF_ANCHOR_5} -> POP2   ${CF_ANCHOR_6} -> POP2
    C_KL=$(curl_colo "${CF_ANCHOR_1}")
    C_GZ=$(curl_colo "${CF_ANCHOR_2}")
    C_SG=$(curl_colo "${CF_ANCHOR_3}")
    C_HK=$(curl_colo "${CF_ANCHOR_4}")
    C_JP=$(curl_colo "${CF_ANCHOR_5}")
    C_TW=$(curl_colo "${CF_ANCHOR_6}")
    # 校验: 只接受 3 位大写机房码, 脏值一律 '?' —— 绝不把原始输出拼进 JSON
    for _cv in C_KL C_GZ C_SG C_HK C_JP C_TW; do
      eval "_vv=\$$_cv"
      case "$_vv" in [A-Z][A-Z][A-Z]) ;; *) eval "$_cv=?" ;; esac
    done
    echo "$C_KL $C_GZ $C_SG $C_HK $C_JP $C_TW" > "$COLO_FILE.tmp" && mv "$COLO_FILE.tmp" "$COLO_FILE"
  fi

  # 【手动刷新·全速扫描】大屏点刷新后 report_traffic 会落一个 scan_req 标记,
  # 这里发现标记就启动 fast_scan.sh: 6 个区域背靠背连续测(去掉 10 秒间隔),
  # 每区域仍 10 次采样; 每测完一个立即落盘 => 大屏逐个点亮。
  # 独立进程运行, 完全不动本循环的槽位时序。
  if [ -f /data/local/tmp/scan_req ] && ! pgrep -f "fast_scan.sh" >/dev/null 2>&1; then
    nohup sh /data/local/tmp/fast_scan.sh </dev/null >/dev/null 2>&1 &
  fi
  # [全量扫描改造] SLOT 不再使用: SLOT=$((SEC / 10))
  SLOT_START_SEC=$(( (NOW / 10) * 10 ))
  # [全量扫描改造] NEXT_SLOT_SEC 不再使用: NEXT_SLOT_SEC=$(( SLOT_START_SEC + 10 ))
  # [全量扫描改造] PUSH_TARGET_SEC 不再使用: PUSH_TARGET_SEC=$(( NEXT_SLOT_SEC - 1 ))

  # 读取历史值 (kl gz sg hk jp tw)
  HIST_P=$(cat "$LAST_PINGS_FILE" 2>/dev/null)
  P_KL=$(echo "$HIST_P" | awk '{print $1+0}'); [ "$P_KL" -le 0 ] 2>/dev/null && P_KL=0   # [真实性修复] 原本编造 186
  P_GZ=$(echo "$HIST_P" | awk '{print $2+0}'); [ "$P_GZ" -le 0 ] 2>/dev/null && P_GZ=0   # [真实性修复] 原本编造 140
  P_SG=$(echo "$HIST_P" | awk '{print $3+0}'); [ "$P_SG" -le 0 ] 2>/dev/null && P_SG=0   # [真实性修复] 原本编造 213
  P_HK=$(echo "$HIST_P" | awk '{print $4+0}'); [ "$P_HK" -le 0 ] 2>/dev/null && P_HK=0   # [真实性修复] 原本编造 192
  P_JP=$(echo "$HIST_P" | awk '{print $5+0}'); [ "$P_JP" -le 0 ] 2>/dev/null && P_JP=0   # [真实性修复] 原本编造 186
  P_TW=$(echo "$HIST_P" | awk '{print $6+0}'); [ "$P_TW" -le 0 ] 2>/dev/null && P_TW=0   # [真实性修复] 原本编造 185

  HIST_J=$(cat "$LAST_JITTERS_FILE" 2>/dev/null)
  J_KL=$(echo "$HIST_J" | awk '{print $1+0}'); [ "$J_KL" -le 0 ] 2>/dev/null && J_KL=0   # [真实性修复] 原本编造 4
  J_GZ=$(echo "$HIST_J" | awk '{print $2+0}'); [ "$J_GZ" -le 0 ] 2>/dev/null && J_GZ=0   # [真实性修复] 原本编造 4
  J_SG=$(echo "$HIST_J" | awk '{print $3+0}'); [ "$J_SG" -le 0 ] 2>/dev/null && J_SG=0   # [真实性修复] 原本编造 4
  J_HK=$(echo "$HIST_J" | awk '{print $4+0}'); [ "$J_HK" -le 0 ] 2>/dev/null && J_HK=0   # [真实性修复] 原本编造 4
  J_JP=$(echo "$HIST_J" | awk '{print $5+0}'); [ "$J_JP" -le 0 ] 2>/dev/null && J_JP=0   # [真实性修复] 原本编造 4
  J_TW=$(echo "$HIST_J" | awk '{print $6+0}'); [ "$J_TW" -le 0 ] 2>/dev/null && J_TW=0   # [真实性修复] 原本编造 4

  HIST_T=$(cat "$LAST_TIMES_FILE" 2>/dev/null)
  # 【2026-10-04 修复 T1.2】原来 T_*<=0 时回填 NOW-50/-40/-30/-20/-10/NOW,
  #   把"从未测到"伪装成"10~50 秒前刚测过"且永远保留。现在 T=0 如实上报,
  #   大屏按红色"未测到"渲染 —— 绝不编造。
  T_KL=$(echo "$HIST_T" | awk '{print $1+0}'); [ "$T_KL" -le 0 ] 2>/dev/null && T_KL=0
  T_GZ=$(echo "$HIST_T" | awk '{print $2+0}'); [ "$T_GZ" -le 0 ] 2>/dev/null && T_GZ=0
  T_SG=$(echo "$HIST_T" | awk '{print $3+0}'); [ "$T_SG" -le 0 ] 2>/dev/null && T_SG=0
  T_HK=$(echo "$HIST_T" | awk '{print $4+0}'); [ "$T_HK" -le 0 ] 2>/dev/null && T_HK=0
  T_JP=$(echo "$HIST_T" | awk '{print $5+0}'); [ "$T_JP" -le 0 ] 2>/dev/null && T_JP=0
  T_TW=$(echo "$HIST_T" | awk '{print $6+0}'); [ "$T_TW" -le 0 ] 2>/dev/null && T_TW=0

  # 丢包率历史 (百分比 0~100)
  HIST_L=$(cat "$LAST_LOSSES_FILE" 2>/dev/null)
  L_KL=$(echo "$HIST_L" | awk '{print $1+0}'); [ -z "$L_KL" ] && L_KL=0
  L_GZ=$(echo "$HIST_L" | awk '{print $2+0}'); [ -z "$L_GZ" ] && L_GZ=0
  L_SG=$(echo "$HIST_L" | awk '{print $3+0}'); [ -z "$L_SG" ] && L_SG=0
  L_HK=$(echo "$HIST_L" | awk '{print $4+0}'); [ -z "$L_HK" ] && L_HK=0
  L_JP=$(echo "$HIST_L" | awk '{print $5+0}'); [ -z "$L_JP" ] && L_JP=0
  L_TW=$(echo "$HIST_L" | awk '{print $6+0}'); [ -z "$L_TW" ] && L_TW=0

  # 【RTT 修复】本轮开始时读入上一轮探测到的 edgeRtt(TCP 1×RTT)。
  # 用 awk 归一化: 文件被写坏/为空时一律取 0, 绝不让非数字拼进 JSON
  # (拼坏 ping_cache 会让手机的整份上报体变成非法 JSON, 那是生产事故)。
  P_EDGE_RTT=$(cat "$EDGE_RTT_FILE" 2>/dev/null)
  P_EDGE_RTT=$(awk -v v="$P_EDGE_RTT" 'BEGIN{print (v>0?int(v):0)}')

  # ========================================================
  # 【全量扫描改造 2026-10-03】原来每 10 秒只测 1 个区域, 靠槽位对齐轮转。
  # 问题: 单次迭代要 2.5~3.3 秒, 一旦越过 10 秒槽位边界, 该区域整轮被跳过,
  #       年龄直接跳到 120 秒 (实测 kl/tw 在 75 秒内推进了 120 秒)。
  # 现在改成: 每一轮把 6 个区域全部测一遍, 然后统一休眠到下一个周期。
  #       不再有任何槽位对齐 => 不可能跳过; 6 个区域年龄完全一致。
  # ========================================================
  SWEEP_START=$(date +%s)
  for SLOT in 0 1 2 3 4 5; do
  # 【严格 60 秒周期】本区域的测量时刻 = 整分钟 + SLOT x 10 秒。
  # 6 个区域固定落在第 -2/8/18/28/38/48 秒。提前 2 秒是为了补偿测量本身
  # 约 1.5 秒的耗时: 这样同一区域两次测量之间的间隔稳定落在 60 秒内,
  # 界面显示年龄的最大值约 58 秒, 不会出现 62 秒这样的瞬时越界。
  SLOT_TARGET=$(( CYCLE_START + SLOT * 10 - 2 ))
  while true; do
    CURR_W=$(date +%s)
    [ "$CURR_W" -ge "$SLOT_TARGET" ] && break
    sleep 1
  done
  NOW=$(date +%s)
  VAL=0
  OLD_VAL=0
  OLD_JIT=0
  ACTIVE_KEY="kl"
  # 【2026-10-03】采样 5 次 -> 10 次
  # 【2026-10-04】10 次 -> 15 次(用户决策: 频率不变, 只加样本)
  # 注意: PROBES 同时是丢包率的分母(LOSS = FAILS*100/PROBES), 必须与上面的循环次数一致
  PROBES=15          # 目标样本数(仅作文档; 丢包率的分母是【实际尝试次数】, 见下)
  FAILS=0
  BEST=0
  ANCHOR_IP="${CF_ANCHOR_1}"
  ANCHOR_URL="https://cloudflare.com/cdn-cgi/trace"
  ANCHOR_HOST="cloudflare.com"

  case $SLOT in
    # 【2026-10-04 用户要求】3 个 POP1 + 3 个 POP2, 全部是 Cloudflare 边缘 IP(已逐个实测落点):
    #   kl/gz/sg -> POP1 锚点 1/2/3      hk/jp/tw -> POP2 锚点 1/2/3
    0) ACTIVE_KEY="kl"; OLD_VAL=$P_KL; OLD_JIT=$J_KL; ANCHOR_IP="${CF_ANCHOR_1}" ;;
    1) ACTIVE_KEY="gz"; OLD_VAL=$P_GZ; OLD_JIT=$J_GZ; ANCHOR_IP="${CF_ANCHOR_2}" ;;
    2) ACTIVE_KEY="sg"; OLD_VAL=$P_SG; OLD_JIT=$J_SG; ANCHOR_IP="${CF_ANCHOR_3}" ;;
    3) ACTIVE_KEY="hk"; OLD_VAL=$P_HK; OLD_JIT=$J_HK; ANCHOR_IP="${CF_ANCHOR_4}" ;;
    4) ACTIVE_KEY="jp"; OLD_VAL=$P_JP; OLD_JIT=$J_JP; ANCHOR_IP="${CF_ANCHOR_5}" ;;
    5) ACTIVE_KEY="tw"; OLD_VAL=$P_TW; OLD_JIT=$J_TW; ANCHOR_IP="${CF_ANCHOR_6}" ;;
  esac

  # 统一采样: 15 次 TCP+TLS 握手 -> 最低3均值(最优可达时延) + 丢包率
  MEAS=$(measure_anchor "$ANCHOR_URL" "$ANCHOR_HOST" "$ANCHOR_IP")
  BEST=$(echo "$MEAS" | awk '{print $1+0}')
  FAILS=$(echo "$MEAS" | awk '{print $2+0}')
  OKS=$(echo "$MEAS" | awk '{print $3+0}')
  # 【真实性 2026-10-04】丢包率 = 失败数 / 【实际尝试次数】(失败+成功)。
  # 原来用固定的 PROBES(15) 当分母 —— 失败早停后尝试次数变少, 用 15 会把丢包率算低,
  # 等于把"测了 8 次全失败"粉饰成"15 次里 8 次失败"(53% vs 100%)。
  ATT=$((FAILS + OKS))
  LOSS=$(awk -v f="$FAILS" -v n="$ATT" 'BEGIN{ printf "%d", (n>0 ? f*100/n : 100) }')

  if [ "$BEST" -gt 0 ]; then
    # 测量成功: 更新时延 / 抖动 / 丢包率 / 真实测量时间
    VAL=$BEST
    NEW_J=$(awk -v p="$VAL" -v o="$OLD_VAL" -v j="$OLD_JIT" 'BEGIN {d=(p>=o?p-o:o-p); nj=int(j+(d-j)/8); print (nj<1?1:nj)}')
  else
    # 全部失败: 沿用旧值, 并且【绝不更新时间戳】—— 这是真实性的根本,
    # 旧实现无论成功失败都把时间戳刷成当前时间, 导致"很久没测到"被伪装成"刚刚".
    VAL=$OLD_VAL
    NEW_J=$OLD_JIT
  fi

  case $SLOT in
    0) P_KL=$VAL; J_KL=$NEW_J; L_KL=$LOSS; [ "$BEST" -gt 0 ] && T_KL=$NOW ;;
    1) P_GZ=$VAL; J_GZ=$NEW_J; L_GZ=$LOSS; [ "$BEST" -gt 0 ] && T_GZ=$NOW ;;
    2) P_SG=$VAL; J_SG=$NEW_J; L_SG=$LOSS; [ "$BEST" -gt 0 ] && T_SG=$NOW ;;
    3) P_HK=$VAL; J_HK=$NEW_J; L_HK=$LOSS; [ "$BEST" -gt 0 ] && T_HK=$NOW ;;
    4) P_JP=$VAL; J_JP=$NEW_J; L_JP=$LOSS; [ "$BEST" -gt 0 ] && T_JP=$NOW ;;
    5) P_TW=$VAL; J_TW=$NEW_J; L_TW=$LOSS; [ "$BEST" -gt 0 ] && T_TW=$NOW ;;
  esac

  # 【立即推送】本区域一测完马上落盘, 上报脚本下次(约6秒内)即带走。
  # 区域之间的间隔由上面的"等到目标时刻"自然形成(固定 10 秒一个),
  # 不需要再单独 sleep —— 测量本身约 1.5 秒, 其余时间都在等待, CPU 占用极低。
  flush_state
  done
  # 本轮 6 个区域已全部测完; 不再有"正在测某个区域"的状态
  SLOT=-1
  ACTIVE_KEY=""

  # 公网出口探测 (2026-10-03 修复)
  # --------------------------------------------------------
  # 旧实现: ping -c 1 -W 1 ${RELAY_TARGET_IP} —— 那是【自家路由器】,
  #         量到的是局域网内时延(约 2ms), 对跨境链路毫无参考价值,
  #         却被大屏当成"手机 → ISP 出口"显示, 属于测点错误。
  # 现实现: 实测到公网锚点的 TCP 连接时延, 才算真正的出口那一跳。
  #         8.8.8.8 优先, 失败退 1.1.1.1; 都失败就如实报 0,
  #         大屏会显示 "-- ms", 而不是编造一个数字。
  # --------------------------------------------------------
  # 【统一口径 2026-10-04 用户决策】原来单次采样, 现改为 3 次采样 + 统一口径:
  # 丢弃 <10ms 的无效样本, 取最低 3 个有效样本的中位数; 不足 3 个则本锚点作废, 换下一个。
  P_GW=0
  for ANCHOR in 8.8.8.8 1.1.1.1; do
    _e1=0; _e2=0; _e3=0; _en=0
    for _ei in 1 2 3; do
      RAW_E=$(/system/bin/curl --connect-timeout 1 -m 1 -o /dev/null -s -w "%{time_connect}" "http://$ANCHOR/" 2>/dev/null)
      V_E=$(awk -v t="$RAW_E" 'BEGIN{v=int(t*1000); print (v>0?v:0)}')
      if [ "$V_E" -ge 10 ]; then
        _en=$((_en + 1))
        case $_en in 1) _e1=$V_E;; 2) _e2=$V_E;; 3) _e3=$V_E;; esac
      fi
    done
    P_GW=$(awk -v a="$_e1" -v b="$_e2" -v c="$_e3" 'BEGIN{
      n=0
      if(a>=10){v[++n]=a} if(b>=10){v[++n]=b} if(c>=10){v[++n]=c}
      if(n<3){print 0; exit}
      for(x=1;x<=n;x++) for(y=x+1;y<=n;y++) if(v[x]>v[y]){t=v[x];v[x]=v[y];v[y]=t}
      print v[2]
    }')
    [ "$P_GW" -gt 0 ] && break
  done
  [ "$P_GW" -le 0 ] && P_GW=0

  # --------------------------------------------------------
  # 【RTT 提速 2026-10-04 · 方案 A】原来这里每 60 秒测一次 edgeRtt。
  #   现已移交独立进程 edge_probe.sh(每 15 秒一次, 对齐整点), 本循环不再探测:
  #     · 对槽位时序零影响(探测不在本进程内跑)
  #     · 探测密度 4 倍, 而 flush_state 每次都会重读文件 => 上报值跟着变密
  #   fast_scan.sh 仍保留自己的收尾探测, 保证"手动刷新"后立刻是新值。
  # --------------------------------------------------------

  # 精准计算推送到 Cloudflare 的时刻: 在下一个地区测速开始前 1 秒准时推送本地区最新成果
  # [全量扫描改造] 原"在下一个槽位开始前 1 秒推送"的逻辑随槽位机制一并取消

  # 持久化数组记录 + 本地统一 JSON 缓存
  # 【2026-10-04 T6.2】复用 flush_state(原子写 .tmp+mv), 不再直写文件
  flush_state

  # ========================================================
  # 【冗余上报切除 - 2026-10-03】
  # 原逻辑在这里额外向 /api/report_traffic 发一次 POST。
  # 但 report_traffic.sh 第 111 行已经直接读取下面这个 $PING_CACHE
  # 文件(含 pings/jitters/pingTimes/activeSlot/activeNode)，并在它
  # 自己每 ~12 秒的那次 POST 里原样带上。也就是说这一次 POST 是
  # 100% 重复的，白白多打一倍请求(约 8640 次/天)。
  # 现在只保留本地测量 + 落盘，由 report_traffic.sh 统一上报。
  # ========================================================
  RAW_PUSH=$(sed 's/,$//' "$PING_CACHE")
  echo "{$RAW_PUSH}" > /data/local/tmp/ping_push.json
  # /system/bin/curl --connect-timeout 3 -m 3 -s -X POST "https://${WORKER_HOST}/api/report_traffic" \
  #   -H "Content-Type: application/json" \
  #   -H "X-Sync-Key: ${SYNC_SECRET}" \
  #   -d @/data/local/tmp/ping_push.json >/dev/null 2>&1 &

  # ========================================================
  # 周期休眠: 让"上一轮开始 -> 下一轮开始"稳定为 SWEEP_INTERVAL 秒。
  # 扣掉本轮实际耗时, 这样无论测量快慢周期都恒定, 不会漂移。
  # 45 秒的选型: 最大年龄 = 45(周期) + 约8(投递) ≈ 53 秒 < 你要求的 65 秒;
  #              CPU 占用约 23%, 比改造前的 28% 更低。
  # ========================================================
  # 【严格 60 秒周期】等到下一个整分钟。
  # 旧实现是"扣掉本轮耗时再睡", 测量一慢周期就被拉长(实测漂到 89 秒),
  # 现在锚定墙上时钟, 周期恒为 60 秒。
  NEXT_CYCLE=$(( CYCLE_START + 60 ))
  while true; do
    CURR_C=$(date +%s)
    [ "$CURR_C" -ge "$NEXT_CYCLE" ] && break
    sleep 1
  done
done
