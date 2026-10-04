#!/system/bin/sh
# ============================================================
# 国际出口质量探针 (2026-10-04) —— 六地区【真单播】目标
# ------------------------------------------------------------
# 为什么必须独立于 ping_scheduler 的 10 秒槽位:
#   第一行(CF anycast 锚点)握手 20~100ms, 15 个样本 2 秒就够了;
#   第二行是真单播跨境目标, 实测 130~700ms, 单样本超时 3 秒,
#   若塞进 10 秒槽位必然挤爆(这正是之前 hk 落到第 38 秒的成因放大版)。
#   所以: 独立进程 + 每 60 秒只轮测【1 个地区】, 六地区一轮 6 分钟。
# 成本: 3 次/分钟(相对第一行 90 次/分钟可忽略), 且不碰槽位时序。
#
# 同时测【接入链路基线】(手机->最近 CF 机房 POP1):
#   实测手机自己的 5G 接入链路 10 秒内可在 20~137ms 之间摆动(6.8 倍),
#   不给出这个基线, 第二行的数字会被误读成"地区链路差"。
#   基线值随第二行一起上报, 前端并列显示。
#
# 目标选择依据(全部实测验证为真单播, 非 anycast CDN):
#   每个可达分片(path)各绑一个目标, 用于测"该分片的真实往返"。
#   判据: 目标必须落在单一物理站点上 —— 用 anycast CDN 的站点会落到
#         就近机房, 测出来的是"到 CDN 的距离", 不是"到该地区的距离"。
#   排除过程: 逐个实测候选, 凡是解析到 anycast 网络的(Cloudflare /
#             Akamai / Fastly / AWS 等)一律排除, 只保留真单播站点。
#   各目标的实测值见上方"实测 XXms"注释, 目标地址按需替换即可。
# ============================================================

INTL_FILE="/data/local/tmp/last_intl.txt"
INTL_TIMES_FILE="/data/local/tmp/last_intl_times.txt"
INTL_BASE_FILE="/data/local/tmp/last_intl_base.txt"
INTL_ROTATE_FILE="/data/local/tmp/intl_rotate.txt"
INTL_SAMPLES=3            # 每地区样本数
INTL_TIMEOUT=3            # 单样本连接超时(秒) —— 跨境目标必须给足
INTL_MAXFAIL=2            # 连续失败上限, 避免一个坏目标把这一轮拖到 9 秒

# 初始化: 6 个 0(未测到), 6 个时刻 0
[ ! -f "$INTL_FILE" ] && echo "0 0 0 0 0 0" > "$INTL_FILE"
[ ! -f "$INTL_TIMES_FILE" ] && echo "0 0 0 0 0 0" > "$INTL_TIMES_FILE"
[ ! -f "$INTL_BASE_FILE" ] && echo "0" > "$INTL_BASE_FILE"
[ ! -f "$INTL_ROTATE_FILE" ] && echo "0" > "$INTL_ROTATE_FILE"

# 测一个真单播目标: N 次 TCP+TLS 握手, 取中位数
# 输出 "<中位ms> <失败数> <成功数>"; 全失败为 0
intl_measure() {
  _URL="$1"; _HOST="$2"
  _n=0; _fail=0; _v=""
  for _i in 1 2 3 4 5; do
    [ "$_i" -gt "$INTL_SAMPLES" ] && break
    [ "$_fail" -ge "$INTL_MAXFAIL" ] && break
    _T=$(/system/bin/curl -k --connect-timeout "$INTL_TIMEOUT" -m "$INTL_TIMEOUT" \
         -o /dev/null -s -w "%{time_appconnect}" "$_URL" 2>/dev/null)
    _X=$(awk -v t="$_T" 'BEGIN{v=int(t*1000); print (v>0?v:0)}')
    if [ "$_X" -gt 0 ]; then
      _n=$((_n + 1)); _v="$_v $_X"
    else
      _fail=$((_fail + 1))
    fi
  done
  # 【统一口径 2026-10-04 用户决策】丢弃 <10ms 的无效样本, 取最低 3 个有效样本的中位数;
  # 有效样本不足 3 个输出 0(界面显示 --, 不编造)。
  _MED=$(echo $_v | awk '{n=0; for(i=1;i<=NF;i++){ if($i>=10) v[++n]=$i }
    if(n<3){print 0; exit}
    for(x=1;x<=n;x++) for(y=x+1;y<=n;y++) if(v[x]>v[y]){t=v[x];v[x]=v[y];v[y]=t}
    print v[2]}')
  echo "$_MED $_fail $_n"
}

while true; do
  # 对齐到 60 秒整点(与第一行同一节拍, 便于前端一起刷新)
  NOW=$(date +%s)
  NEXT=$(( (NOW / 60 + 1) * 60 ))
  while true; do
    [ "$(date +%s)" -ge "$NEXT" ] && break
    sleep 1
  done

  IDX=$(cat "$INTL_ROTATE_FILE" 2>/dev/null)
  case "$IDX" in 0|1|2|3|4|5) ;; *) IDX=0 ;; esac

  case "$IDX" in
    0) KEY="kl"; URL="https://www.uitm.edu.my/";          HOST="www.uitm.edu.my" ;;
    1) KEY="gz"; URL="https://www.21cn.com/";             HOST="www.21cn.com" ;;
    2) KEY="sg"; URL="https://www.smu.edu.sg/";           HOST="www.smu.edu.sg" ;;
    3) KEY="hk"; URL="https://www.polyu.edu.hk/";         HOST="www.polyu.edu.hk" ;;
    4) KEY="jp"; URL="https://www.nic.ad.jp/";            HOST="www.nic.ad.jp" ;;
    5) KEY="tw"; URL="https://www.seed.net.tw/";          HOST="www.seed.net.tw" ;;
  esac

  M=$(intl_measure "$URL" "$HOST")
  VAL=$(echo "$M" | awk '{print $1+0}')
  VALS=$(cat "$INTL_FILE" 2>/dev/null)
  [ -z "$VALS" ] && VALS="0 0 0 0 0 0"
  TIMES=$(cat "$INTL_TIMES_FILE" 2>/dev/null)
  [ -z "$TIMES" ] && TIMES="0 0 0 0 0 0"

  # 只更新本轮测的那个槽位; 失败(VAL=0)时【不刷新时间戳】, 与第一行规则一致
  POS=$((IDX + 1))
  NEWVALS=$(echo "$VALS" | awk -v p="$POS" -v v="$VAL" '{ for(i=1;i<=6;i++) if(i==p) $i=v; print }')
  if [ "$VAL" -gt 0 ]; then
    TS=$(date +%s)
    NEWTIMES=$(echo "$TIMES" | awk -v p="$POS" -v t="$TS" '{ for(i=1;i<=6;i++) if(i==p) $i=t; print }')
  else
    NEWTIMES="$TIMES"
  fi

  echo "$NEWVALS" > "$INTL_FILE.tmp" && mv "$INTL_FILE.tmp" "$INTL_FILE"
  echo "$NEWTIMES" > "$INTL_TIMES_FILE.tmp" && mv "$INTL_TIMES_FILE.tmp" "$INTL_TIMES_FILE"

  # 接入链路基线: 手机 -> 最近的 CF 机房(接入点1), 单次采样
  # 【统一口径 2026-10-04】基线也纳入统一口径: 3 次采样, 丢弃 <10ms, 取最低 3 个的中位数。
  _b1=0; _b2=0; _b3=0; _bn=0
  for _bi in 1 2 3; do
    BASE=$(/system/bin/curl -k --connect-timeout 2 -m 3 --resolve "cloudflare.com:443:${CF_ANCHOR_1}" \
           -o /dev/null -s -w "%{time_connect}" "https://cloudflare.com/cdn-cgi/trace" 2>/dev/null)
    BASEV=$(awk -v t="$BASE" 'BEGIN{v=int(t*1000); print (v>0?v:0)}')
    if [ "$BASEV" -ge 10 ]; then
      _bn=$((_bn + 1))
      case $_bn in 1) _b1=$BASEV;; 2) _b2=$BASEV;; 3) _b3=$BASEV;; esac
    fi
  done
  BASEV=$(awk -v a="$_b1" -v b="$_b2" -v c="$_b3" 'BEGIN{
    n=0
    if(a>=10){v[++n]=a} if(b>=10){v[++n]=b} if(c>=10){v[++n]=c}
    if(n<3){print 0; exit}
    for(x=1;x<=n;x++) for(y=x+1;y<=n;y++) if(v[x]>v[y]){t=v[x];v[x]=v[y];v[y]=t}
    print v[2]
  }')
  echo "$BASEV" > "$INTL_BASE_FILE.tmp" && mv "$INTL_BASE_FILE.tmp" "$INTL_BASE_FILE"

  # 轮转指针
  NEXTIDX=$(( (IDX + 1) % 6 ))
  echo "$NEXTIDX" > "$INTL_ROTATE_FILE.tmp" && mv "$INTL_ROTATE_FILE.tmp" "$INTL_ROTATE_FILE"
done
