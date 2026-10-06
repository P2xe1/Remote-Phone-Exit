#!/system/bin/sh
# ============================================================
# 手动触发·全速扫描 (2026-10-03)
#   由大屏"手动刷新"按钮触发:
#     大屏 -> POST /api/manual_scan -> Worker 记 flag
#     -> 手机下次上报(约6秒)拿到 flag -> report_traffic.sh 落一个标记文件
#     -> ping_scheduler.sh 发现标记 -> 启动本脚本 -> 本脚本跑完删除标记
#   特点:
#     - 独立进程, 完全不改动 ping_scheduler 已稳定的 10 秒槽位时序
#     - 六大地区【背靠背】连续测(去掉 10 秒间隔), 每区域仍 15 次采样
#        (2026-10-04 与 ping_scheduler 同步: 10 -> 15, 保证两条链路口径一致)
#     - 每测完一个区域立即落盘 => 大屏逐个点亮
#   预计耗时: 6 区域 x 15 样本 x 约0.24s + 出口探测 ≈ 24s, 加 30% 余量 ≈ 31s
# ============================================================
HOST="${TUNNEL_HOST}"
PING_CACHE="/data/local/tmp/ping_cache.txt"
LAST_PINGS_FILE="/data/local/tmp/last_pings.txt"
LAST_JITTERS_FILE="/data/local/tmp/last_jitters.txt"
LAST_TIMES_FILE="/data/local/tmp/last_ping_times.txt"
LAST_LOSSES_FILE="/data/local/tmp/last_losses.txt"
# 【RTT 修复】手机 ↔ CF 边缘 的真实单次 RTT(TCP time_connect), 单值文件
EDGE_RTT_FILE="/data/local/tmp/last_edge_rtt.txt"
# 全局探测通行证(硬性最多 2 个并发探测); 文件缺失时退化为不限制, 不会让脚本报错
if [ -f /data/local/tmp/probe_gate.sh ]; then . /data/local/tmp/probe_gate.sh; fi
if ! command -v probe_slot_acquire >/dev/null 2>&1; then
  probe_slot_acquire() { echo 0; }
  probe_slot_release() { :; }
fi
FLAG="/data/local/tmp/scan_req"
SCAN_START_TS=$(date +%s)   # 【2026-10-04 T6.6】记录启动时刻, 用于判断是否有新指令在扫描期间到达

# 测一个锚点: 15 次 TCP+TLS 握手, 取中位数 + 丢包率
# 输出: "<中位ms> <失败数> <成功数>"
fast_measure() {
  _URL="$1"; _HOST="$2"; _IP="$3"
  _n=0; _fail=0; _v=""
  for _i in 1 2 3 4 5 6 7 8 9 10 11 12 13 14 15; do
    # 【槽位保护 2026-10-04】累计 8 次失败即早停 + 连接超时 0.5 秒(与 ping_scheduler 同步):
    # 最坏耗时从 15x1s=16s 降到 8x0.5s≈4s。丢包率按实际尝试次数算(见调用处)。
    [ "$_fail" -ge 8 ] && break
    _T=$(/system/bin/curl -k --connect-timeout 0.5 -m 1 --resolve "$_HOST:443:$_IP" \
         -o /dev/null -s -w "%{time_appconnect}" "$_URL" 2>/dev/null)
    _X=$(awk -v t="$_T" 'BEGIN{v=int(t*1000); print (v>0?v:0)}')
    if [ "$_X" -gt 0 ]; then
      _n=$((_n + 1)); _v="$_v $_X"
    else
      _fail=$((_fail + 1))
    fi
  done
  # 【统一口径 2026-10-04 用户决策】与 ping_scheduler 完全一致:
  # 丢弃 <10ms 的无效样本 -> 取最低 3 个有效样本的中位数 -> 不足 3 个输出 0(显示 --)。
  # 两条链路(周期扫描 / 手动刷新)必须同口径, 否则手动一刷数字就跳变。
  _MED=$(echo $_v | awk '{n=0; for(i=1;i<=NF;i++){ if($i>=10) v[++n]=$i }
    if(n<3){print 0; exit}
    for(x=1;x<=n;x++) for(y=x+1;y<=n;y++) if(v[x]>v[y]){t=v[x];v[x]=v[y];v[y]=t}
    print v[2]}')
  echo "$_MED $_fail $_n"
}

# --------------------------------------------------------
# 【RTT 修复 2026-10-04】与 ping_scheduler.sh 中的同名函数保持一致:
#   time_connect(TCP 1×RTT) 连测 3 次取中位数, 全失败返回 0。
#   手动刷新的整个目的是"让大屏看到最新真实值", 所以这里的 edgeRtt 也必须刷新,
#   否则手动刷新后第 3 段仍是上一轮的旧数字。
# --------------------------------------------------------
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

# 载入上一轮的值(测失败时沿用, 且不刷新时间戳 —— 与主循环规则一致)
read_state() {
  H_P=$(cat "$LAST_PINGS_FILE" 2>/dev/null)
  H_J=$(cat "$LAST_JITTERS_FILE" 2>/dev/null)
  H_T=$(cat "$LAST_TIMES_FILE" 2>/dev/null)
  H_L=$(cat "$LAST_LOSSES_FILE" 2>/dev/null)
  P1=$(echo "$H_P" | awk '{print $1+0}'); P2=$(echo "$H_P" | awk '{print $2+0}')
  P3=$(echo "$H_P" | awk '{print $3+0}'); P4=$(echo "$H_P" | awk '{print $4+0}')
  P5=$(echo "$H_P" | awk '{print $5+0}'); P6=$(echo "$H_P" | awk '{print $6+0}')
  J1=$(echo "$H_J" | awk '{print $1+0}'); J2=$(echo "$H_J" | awk '{print $2+0}')
  J3=$(echo "$H_J" | awk '{print $3+0}'); J4=$(echo "$H_J" | awk '{print $4+0}')
  J5=$(echo "$H_J" | awk '{print $5+0}'); J6=$(echo "$H_J" | awk '{print $6+0}')
  T1=$(echo "$H_T" | awk '{print $1+0}'); T2=$(echo "$H_T" | awk '{print $2+0}')
  T3=$(echo "$H_T" | awk '{print $3+0}'); T4=$(echo "$H_T" | awk '{print $4+0}')
  T5=$(echo "$H_T" | awk '{print $5+0}'); T6=$(echo "$H_T" | awk '{print $6+0}')
  L1=$(echo "$H_L" | awk '{print $1+0}'); L2=$(echo "$H_L" | awk '{print $2+0}')
  L3=$(echo "$H_L" | awk '{print $3+0}'); L4=$(echo "$H_L" | awk '{print $4+0}')
  L5=$(echo "$H_L" | awk '{print $5+0}'); L6=$(echo "$H_L" | awk '{print $6+0}')
}

# 立即落盘 -> 上报脚本约6秒内带走 -> 大屏逐个点亮
# 【2026-10-04 修复 T6.2】写 .tmp + mv 原子替换, 与 ping_scheduler 并发写时
#   读者(上报脚本)永远看不到半截文件。
flush_state() {
  echo "$P1 $P2 $P3 $P4 $P5 $P6" > "$LAST_PINGS_FILE.tmp" && mv "$LAST_PINGS_FILE.tmp" "$LAST_PINGS_FILE"
  echo "$J1 $J2 $J3 $J4 $J5 $J6" > "$LAST_JITTERS_FILE.tmp" && mv "$LAST_JITTERS_FILE.tmp" "$LAST_JITTERS_FILE"
  echo "$T1 $T2 $T3 $T4 $T5 $T6" > "$LAST_TIMES_FILE.tmp" && mv "$LAST_TIMES_FILE.tmp" "$LAST_TIMES_FILE"
  echo "$L1 $L2 $L3 $L4 $L5 $L6" > "$LAST_LOSSES_FILE.tmp" && mv "$LAST_LOSSES_FILE.tmp" "$LAST_LOSSES_FILE"
  echo "\"pings\":{\"kl\":$P1,\"gz\":$P2,\"sg\":$P3,\"hk\":$P4,\"jp\":$P5,\"tw\":$P6,\"egress\":${PGW:-0}},\"jitters\":{\"kl\":$J1,\"gz\":$J2,\"sg\":$J3,\"hk\":$J4,\"jp\":$J5,\"tw\":$J6},\"pingTimes\":{\"kl\":$T1,\"gz\":$T2,\"sg\":$T3,\"hk\":$T4,\"jp\":$T5,\"tw\":$T6},\"losses\":{\"kl\":$L1,\"gz\":$L2,\"sg\":$L3,\"hk\":$L4,\"jp\":$L5,\"tw\":$L6},\"edgeRtt\":${P_EDGE_RTT:-0},\"scanning\":\"$SCAN_LABEL\",\"activeSlot\":-1,\"activeNode\":\"\"," > "$PING_CACHE.tmp" && mv "$PING_CACHE.tmp" "$PING_CACHE"
}

read_state
PGW=0
SCAN_LABEL=""
# 【RTT 修复】初值取自持久化文件: 守住上一轮的 edgeRtt, 手动刷新不会把它清成 0
P_EDGE_RTT=$(cat "$EDGE_RTT_FILE" 2>/dev/null)
P_EDGE_RTT=$(awk -v v="$P_EDGE_RTT" 'BEGIN{print (v>0?int(v):0)}')

# ---- 6 个区域背靠背连续测 (无 10 秒间隔) ----
IDX=0
for SPEC in \
  "kl|${CF_ANCHOR_1}|https://cloudflare.com/cdn-cgi/trace|cloudflare.com" \
  "gz|${CF_ANCHOR_2}|https://cloudflare.com/cdn-cgi/trace|cloudflare.com" \
  "sg|${CF_ANCHOR_3}|https://cloudflare.com/cdn-cgi/trace|cloudflare.com" \
  "hk|${CF_ANCHOR_4}|https://cloudflare.com/cdn-cgi/trace|cloudflare.com" \
  "jp|${CF_ANCHOR_5}|https://cloudflare.com/cdn-cgi/trace|cloudflare.com" \
  "tw|${CF_ANCHOR_6}|https://cloudflare.com/cdn-cgi/trace|cloudflare.com" ; do
  K=$(echo "$SPEC" | cut -d'|' -f1)
  IP=$(echo "$SPEC" | cut -d'|' -f2)
  URL=$(echo "$SPEC" | cut -d'|' -f3)
  HN=$(echo "$SPEC" | cut -d'|' -f4)
  SCAN_LABEL="$K"
  NOWS=$(date +%s)
  _slot=$(probe_slot_acquire)
  M=$(fast_measure "$URL" "$HN" "$IP")
  probe_slot_release "$_slot"
  MED=$(echo "$M" | awk '{print $1+0}')
  FAIL=$(echo "$M" | awk '{print $2+0}')
  OKN=$(echo "$M" | awk '{print $3+0}')
  # 【2026-10-04】丢包率分母 = 实际尝试次数(失败+成功), 不是固定 15:
  # 早停后尝试次数会少于 15, 用 15 当分母会把丢包率算低(把 8/8 粉饰成 8/15)。
  LOSS=$(awk -v f="$FAIL" -v n="$((FAIL + OKN))" 'BEGIN{printf "%d", (n>0 ? f*100/n : 100)}')
  case $K in
    kl) OV=$P1; OJ=$J1 ;;
    gz) OV=$P2; OJ=$J2 ;;
    sg) OV=$P3; OJ=$J3 ;;
    hk) OV=$P4; OJ=$J4 ;;
    jp) OV=$P5; OJ=$J5 ;;
    tw) OV=$P6; OJ=$J6 ;;
  esac
  if [ "$MED" -gt 0 ]; then
    NV=$MED
    NJ=$(awk -v p="$NV" -v o="$OV" -v j="$OJ" 'BEGIN{d=(p>=o?p-o:o-p); nj=int(j+(d-j)/8); print (nj<1?1:nj)}')
    NT=$NOWS
  else
    NV=$OV; NJ=$OJ; NT=""
  fi
  case $K in
    kl) P1=$NV; J1=$NJ; L1=$LOSS; [ -n "$NT" ] && T1=$NT ;;
    gz) P2=$NV; J2=$NJ; L2=$LOSS; [ -n "$NT" ] && T2=$NT ;;
    sg) P3=$NV; J3=$NJ; L3=$LOSS; [ -n "$NT" ] && T3=$NT ;;
    hk) P4=$NV; J4=$NJ; L4=$LOSS; [ -n "$NT" ] && T4=$NT ;;
    jp) P5=$NV; J5=$NJ; L5=$LOSS; [ -n "$NT" ] && T5=$NT ;;
    tw) P6=$NV; J6=$NJ; L6=$LOSS; [ -n "$NT" ] && T6=$NT ;;
  esac
  flush_state        # ← 测完一个立即落盘, 大屏逐个点亮
  IDX=$((IDX + 1))
done

# ---- 公网出口探测 ----
# 【统一口径 2026-10-04】单次 -> 3 次采样, 丢弃 <10ms, 取最低 3 个有效样本的中位数。
PGW=0
_slot=$(probe_slot_acquire)
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
  PGW=$(awk -v a="$_e1" -v b="$_e2" -v c="$_e3" 'BEGIN{
    n=0
    if(a>=10){v[++n]=a} if(b>=10){v[++n]=b} if(c>=10){v[++n]=c}
    if(n<3){print 0; exit}
    for(x=1;x<=n;x++) for(y=x+1;y<=n;y++) if(v[x]>v[y]){t=v[x];v[x]=v[y];v[y]=t}
    print v[2]
  }')
  [ "$PGW" -gt 0 ] && break
done
[ -z "$PGW" ] && PGW=0
probe_slot_release "$_slot"

# 【RTT 修复】收尾时把 手机 ↔ CF 边缘 的 TCP 1×RTT 也刷新一次,
#   这样"手动刷新"之后第 3 段立刻是新值, 而不是上一轮 60 秒周期的旧值。
_slot=$(probe_slot_acquire)
P_EDGE_RTT=$(measure_edge_rtt)
probe_slot_release "$_slot"
echo "$P_EDGE_RTT" > "$EDGE_RTT_FILE.tmp" && mv "$EDGE_RTT_FILE.tmp" "$EDGE_RTT_FILE"

SCAN_LABEL=""
flush_state

# 【2026-10-04 修复 T6.6】原来无条件 rm -f 删除指令标记: 快扫的 ~21 秒窗口内
#   如果又点了第二次"手动刷新", 新指令会被这次收尾误删 -> 请求丢失。
#   现在比较标记文件 mtime: 若晚于本脚本启动时刻, 说明有新请求到达,
#   保留标记让 scheduler 下一轮再跑一轮; 否则(本脚本消费掉的)才删除。
if [ -f "$FLAG" ]; then
  F_MT=$(date -r "$FLAG" +%s 2>/dev/null)
  if [ -z "$F_MT" ] || [ "$F_MT" -lt "$SCAN_START_TS" ]; then
    rm -f "$FLAG"
  fi
fi
