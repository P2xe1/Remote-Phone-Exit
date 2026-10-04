#!/system/bin/sh
API_SERVER="${RELAY_TARGET_IP}:10085"
WORKER_URL="https://${WORKER_HOST}/api/report_traffic"
CONFIG_URL="https://${WORKER_HOST}/api/phone_xray_config"
USERS_URL="https://${WORKER_HOST}/api/phone_users"
USERS_FILE="/data/local/tmp/users.json"
REPORT_SECRET="${SYNC_SECRET}"
PING_CACHE="/data/local/tmp/ping_cache.txt"
LOCK_PING="/data/local/tmp/ping.lock"
VER_FILE="/data/local/tmp/user_version.txt"
BASE_FILE="/data/local/tmp/user_traffic_base.txt"
LAST_RAW_FILE="/data/local/tmp/last_raw_xray.txt"
HIST_FILE="/data/local/tmp/history_15m.txt"
HIST_TIME_FILE="/data/local/tmp/last_hist_time.txt"
HIST_BYTES_FILE="/data/local/tmp/last_hist_bytes.txt"
ONLINE_TIME_FILE="/data/local/tmp/online_time.txt"
ONLINE_USERS_FILE="/data/local/tmp/online_users.txt"
ONLINE_5S_RAW="/data/local/tmp/online_5s_raw.txt"
ONLINE_LAST_ACTIVE="/data/local/tmp/online_last_active.txt"
ONLINE_CACHE_FILE="/data/local/tmp/online_cache.txt"
# 【新增】xray 权威在线名单的"当前/上一份"快照 + 每个用户的连接时刻
ONLINE_PREV_SET="/data/local/tmp/online_prev_set.txt"
CONN_STATE_FILE="/data/local/tmp/online_conn_state.txt"

NOW=$(date +%s)

# ========================================================
# 1. 物理层遥测采集 (硬件电池、Wi-Fi 6、内核在线时间、活动连接)
# ========================================================
# 【2026-10-04 真实性修复】以下 4 组指标原来的兜底值全是【编造的】:
#   电量 88% / 26.0°C / Charging · WiFi ${WIFI_SSID} / -35dBm / 864Mbps · uptime 20d 15h
# 一旦 dumpsys / cmd wifi / /proc/uptime 读不到, 大屏就会显示这些假数字,
# 而且看起来完全正常, 无法察觉。现改为如实上报"无数据":
#   数值型用 0(前端按缺值显示 "--"), 字符串型用空串。
# 绝不编造 —— 宁可显示 "--", 也不要假数字。
BAT_INFO=$(dumpsys battery 2>/dev/null)
BAT_LVL=$(echo "$BAT_INFO" | awk '/level:/ {print $2; exit}')
BAT_TEMP=$(echo "$BAT_INFO" | awk '/temperature:/ {printf "%.1f", $2/10; exit}')
BAT_CHG=$(echo "$BAT_INFO" | awk '/status:/ {print ($2==2||$2==5)?"Charging":"Discharging"; exit}')
[ -z "$BAT_LVL" ] && BAT_LVL=0
[ -z "$BAT_TEMP" ] && BAT_TEMP=""
[ -z "$BAT_CHG" ] && BAT_CHG=""

WIFI_STATUS=$(cmd wifi status 2>/dev/null)
WIFI_SSID=$(echo "$WIFI_STATUS" | awk -F'"' '/Wifi is connected to/ {print $2; exit}')
WIFI_RSSI=$(echo "$WIFI_STATUS" | awk -F'RSSI: ' '/RSSI:/ {split($2, a, ","); print a[1]; exit}')
WIFI_SPEED=$(echo "$WIFI_STATUS" | awk -F'Link speed: ' '/Link speed:/ {split($2, a, ","); print a[1]; exit}')
[ -z "$WIFI_SSID" ] && WIFI_SSID=""
[ -z "$WIFI_RSSI" ] && WIFI_RSSI=0
[ -z "$WIFI_SPEED" ] && WIFI_SPEED=""

UPTIME_STR=$(awk '{d=int($1/86400); h=int(($1%86400)/3600); m=int(($1%3600)/60); printf "%dd %dh %dm", d, h, m}' /proc/uptime 2>/dev/null)
[ -z "$UPTIME_STR" ] && UPTIME_STR=""

RAW_CONNS=$(grep -E '^[ ]*[0-9]+: [0-9A-Fa-f]+:1F9[0-5] ' /proc/net/tcp /proc/net/tcp6 2>/dev/null | grep ' 01 ' | wc -l)
[ -z "$RAW_CONNS" ] && RAW_CONNS=0
ACTIVE_CONNS=$((RAW_CONNS > 0 ? RAW_CONNS - 1 : 0))

# [新增真活探测] 实时检测 Xray 进程及 10085 API 端口状态
XRAY_LIVE=0
X_PID=$(pgrep -f "/data/local/tmp/xray run" 2>/dev/null | head -n1)
if [ -n "$X_PID" ]; then
  if /data/local/tmp/xray api statsquery --server=${RELAY_TARGET_IP}:10085 >/dev/null 2>&1; then
    XRAY_LIVE=1
  fi
fi

# [新增真活探测] 抓取最近 10 秒内 Cloudflare 隧道 502/连接中断错误数
# 【2026-10-03 修复】原实现统计"最后 60 行中匹配 failed to serve incoming request
# 或 connection refused 的行数"。但那 60 行里 99% 是用户关页面/跳转产生的
# "context canceled"（正常现象，不是故障），所以这个数字长期恒等于 30，什么都没测。
# 现改为只统计【真正连不上源站】的失败。
CF_502_ERRS=$(tail -n 800 /sdcard/cf_named.log 2>/dev/null | grep -c "connection refused\|Unable to reach the origin" 2>/dev/null)
[ -z "$CF_502_ERRS" ] && CF_502_ERRS=0

# 【2026-10-04 修复 T3.4】这里原来的"超过 5MB 截断式轮转"有致命缺陷:
#   cloudflared 以重定向方式持有该文件句柄, `: > file` 截断后它继续从旧偏移写,
#   在文件头留下 NUL 空洞 -> stat 恒 >5MB -> 每 6 秒触发一次轮转 + tail 读到
#   空洞使 cfErrors 指标失真。
# 用户决定: 保留全部日志不清理(实测增长 3.2MB/天, /sdcard 还有 181GB, 一年约
# 1.2GB, 无实质影响), 所以这里直接【删除轮转逻辑】, 只保留日志读取。
CF_LOG="/sdcard/cf_named.log"
[ -z "$CF_502_ERRS" ] && CF_502_ERRS=0

# 【2026-10-04】真机信息: 页头/流水线原来写死 "${DEVICE_NAME}"、"${SOC}",
# 实测确实就是这台机器, 但写死的值换机后会说谎。改为每次上报带真值, 前端优先用上报值。
DEV_BRAND=$(getprop ro.product.brand 2>/dev/null)
DEV_MODEL=$(getprop ro.product.model 2>/dev/null)
DEV_ABI=$(getprop ro.product.cpu.abi 2>/dev/null)
ANDROID_VER=$(getprop ro.build.version.release 2>/dev/null)
CARRIER=$(getprop gsm.operator.alpha 2>/dev/null)
[ -z "$DEV_BRAND" ] && DEV_BRAND="unknown"
[ -z "$DEV_MODEL" ] && DEV_MODEL="unknown"
[ -z "$DEV_ABI" ] && DEV_ABI="unknown"
[ -z "$ANDROID_VER" ] && ANDROID_VER="unknown"
[ -z "$CARRIER" ] && CARRIER="unknown"

TELEMETRY_JSON="\"telemetry\":{\"battery\":{\"level\":$BAT_LVL,\"temp\":\"$BAT_TEMP\",\"status\":\"$BAT_CHG\"},\"wifi\":{\"ssid\":\"$WIFI_SSID\",\"rssi\":$WIFI_RSSI,\"speed\":\"$WIFI_SPEED\"},\"uptime\":\"$UPTIME_STR\",\"sockets\":$ACTIVE_CONNS,\"brand\":\"$DEV_BRAND\",\"model\":\"$DEV_MODEL\",\"abi\":\"$DEV_ABI\",\"android\":\"$ANDROID_VER\",\"carrier\":\"$CARRIER\",\"xrayLive\":$XRAY_LIVE,\"cfErrors\":$CF_502_ERRS},\"xrayStatus\":$XRAY_LIVE,"

# ========================================================
# 2. 6大出口物理链路延迟与抖动
#    数据源: ping_scheduler.sh 每 60 秒一轮、每区域 10 次 TCP+TLS 握手取中位数,
#            每测完一个区域立即落盘到 $PING_CACHE。
#
# 【2026-10-04 重做算法 —— 原实现的问题】
#   原代码:
#     [ -z "$PINGS_JSON" ] && PINGS_JSON="\"pings\":{\"kl\":186,\"gz\":140,...}"
#   只要 ping_cache.txt 缺失/为空, 就直接把【编造的延迟】当成真实数据发上去,
#   而且假 pingTimes 取 $NOW -> 大屏显示成"刚刚测的", 属于伪装新鲜度。
#
#   新算法(只用真实数据, 三级取材, 绝不编造):
#     ① 首选 $PING_CACHE(调度器刚落的盘) —— 最新鲜
#     ② 缓存缺失/为空时, 用【本地持久化的上一次真实测量结果】
#        (last_pings.txt 时延 / last_jitters.txt 抖动 / last_times.txt
#         真实测量时刻 / last_losses.txt 丢包率) 重新组装 ——
#        这些是历史上真实测到的数字, 只是旧了一点; 配合各自真实的
#        pingTimes, 大屏会如实显示"XX 秒前", 不会伪装成刚刚。
#     ③ 连持久化记录都没有(全新设备/从未跑过调度器) -> 全部输出 0,
#        大屏按缺值渲染 "-- ms"。0 = 未测到, 不是 0 毫秒。
#
#   全部 0 时仍然会发送完整的键结构(而不是整段丢弃), 这样:
#     - Worker 的逐字段合并会如实更新, 不会残留上一轮的旧数字
#     - 前端 setGw() 见到 0 显示 "-- ms"
# ========================================================
emit_ping_json() {
  # ① 调度器刚落盘的新鲜结果
  if [ -s "$PING_CACHE" ]; then
    cat "$PING_CACHE" 2>/dev/null
    return 0
  fi

  # ② 用上一次真实测量结果重组(真实值 + 真实时刻)
  if [ -s /data/local/tmp/last_pings.txt ]; then
    _LP=$(cat /data/local/tmp/last_pings.txt 2>/dev/null)
    _LJ=$(cat /data/local/tmp/last_jitters.txt 2>/dev/null)
    _LT=$(cat /data/local/tmp/last_ping_times.txt 2>/dev/null)   # 【2026-10-04 T1.3】原名写错成 last_times.txt
    _LL=$(cat /data/local/tmp/last_losses.txt 2>/dev/null)
    awk -v lp="$_LP" -v lj="$_LJ" -v lt="$_LT" -v ll="$_LL" 'BEGIN{
      split(lp,a," "); split(lj,b," "); split(lt,c," "); split(ll,d," ");
      K[1]="kl"; K[2]="gz"; K[3]="sg"; K[4]="hk"; K[5]="jp"; K[6]="tw";
      printf "\"pings\":{";
      for(i=1;i<=6;i++){ v=a[i]+0; if(v<0)v=0; printf "%s\"%s\":%d", (i>1?",":""), K[i], v }
      # egress 不在六区内, 无持久化值 -> 如实报 0(未测到)
      printf ",\"egress\":0},\"jitters\":{";
      for(i=1;i<=6;i++){ v=b[i]+0; if(v<0)v=0; printf "%s\"%s\":%d", (i>1?",":""), K[i], v }
      printf "},\"pingTimes\":{";
      for(i=1;i<=6;i++){ v=c[i]+0; if(v<0)v=0; printf "%s\"%s\":%d", (i>1?",":""), K[i], v }
      printf "},\"losses\":{";
      for(i=1;i<=6;i++){ v=d[i]+0; if(v<0)v=0; printf "%s\"%s\":%d", (i>1?",":""), K[i], v }
      printf "},\"activeSlot\":0,\"activeNode\":\"\",";
    }'
    return 0
  fi

  # ③ 从未测过 -> 全部 0(未测到), 仍然是完整结构
  echo "\"pings\":{\"kl\":0,\"gz\":0,\"sg\":0,\"hk\":0,\"jp\":0,\"tw\":0,\"egress\":0},\"jitters\":{\"kl\":0,\"gz\":0,\"sg\":0,\"hk\":0,\"jp\":0,\"tw\":0},\"pingTimes\":{\"kl\":0,\"gz\":0,\"sg\":0,\"hk\":0,\"jp\":0,\"tw\":0},\"losses\":{\"kl\":0,\"gz\":0,\"sg\":0,\"hk\":0,\"jp\":0,\"tw\":0},\"activeSlot\":0,\"activeNode\":\"\","
}
PINGS_JSON=$(emit_ping_json)

# ========================================================
# 2.5 5秒在线连接与实时速率检测 (零网络开销，纯本地内存)
# ========================================================
LAST_ONLINE=0
[ -f "$ONLINE_TIME_FILE" ] && LAST_ONLINE=$(cat "$ONLINE_TIME_FILE" 2>/dev/null)
[ -z "$LAST_ONLINE" ] && LAST_ONLINE=0

IS_ONLINE_TICK=0
if [ $((NOW - LAST_ONLINE)) -ge 5 ]; then
  IS_ONLINE_TICK=1
  echo $NOW > "$ONLINE_TIME_FILE"
  /data/local/tmp/xray api statsgetallonlineusers --server=$API_SERVER 2>/dev/null > /data/local/tmp/online_raw.tmp
  # 【修正】xray 的用户名是 <inboundTag>.<email>，且 tag 不一定是 in-kl
  #   原来写死找 "user_ 前缀" —— 与 phones 的 stats 命名不符，会全部解析不到。
  #   这里按 json 字段取值，再去掉 "user>>>" 前缀（stats 命令两种写法都兼容）。
  grep -o '"user":[ ]*"[^"]*"' /data/local/tmp/online_raw.tmp 2>/dev/null \
    | sed 's/.*"user":[ ]*"//; s/"$//' \
    | sed 's/^user>>>//' | sed 's/^user_//' > "$ONLINE_USERS_FILE.tmp"
  mv -f "$ONLINE_USERS_FILE.tmp" "$ONLINE_USERS_FILE" 2>/dev/null
fi

# ========================================================
# 3. 提取 Xray 统计并处理用户累计流量基线与实时状态
# ========================================================
RAW=$(/data/local/tmp/xray api statsquery --server=$API_SERVER 2>/dev/null)

# 【新增】从 awk 输出里摘出在线名单 -> 每次上报都带（6 秒级新鲜度）
ONLINE_NOW=$(echo "$RAW" | sed -n 's/.*#ONLINE#//p' | head -n 1)
RAW=$(echo "$RAW" | sed 's/#ONLINE#.*//')
ONLINE_USERS_JSON=""
if [ -f "$ONLINE_USERS_FILE" ] && [ ! -s "$ONLINE_USERS_FILE" ]; then
  # 名单确实是空的（当前无人连接）: 明确上报空数组, 不能省略
  ONLINE_USERS_JSON="\"onlineUsers\":[],"
elif [ -n "$ONLINE_NOW" ]; then
  ONLINE_USERS_JSON="\"onlineUsers\":[$(echo "$ONLINE_NOW" | sed 's/\([^,]*\)/"\1"/g')],"
else
  # 本次没跑到在线结算（例如 isOnlineTick 未命中）: 不带该字段, Worker 沿用上次
  ONLINE_USERS_JSON=""
fi

USER_TRAFFICS_JSON=$(echo "$RAW" | awk \
  -v baseFile="$BASE_FILE" \
  -v lastRawFile="$LAST_RAW_FILE" \
  -v isOnlineTick="$IS_ONLINE_TICK" \
  -v now="$NOW" \
  -v onlineUsersFile="$ONLINE_USERS_FILE" \
  -v onlinePrevRawFile="$ONLINE_5S_RAW" \
  -v onlineLastActiveFile="$ONLINE_LAST_ACTIVE" \
  -v onlineCacheFile="$ONLINE_CACHE_FILE" \
  -v onlinePrevSetFile="$ONLINE_PREV_SET" \
  -v connStateFile="$CONN_STATE_FILE" '
BEGIN {
  # 1. 加载持久化基线
  while ((getline line < baseFile) > 0) {
    n = split(line, f, " ");
    if (n >= 3) {
      base_up[f[1]] = f[2] + 0;
      base_down[f[1]] = f[3] + 0;
    }
  }
  close(baseFile);

  # 2. 加载上一次 raw 读数
  while ((getline line < lastRawFile) > 0) {
    n = split(line, f, " ");
    if (n >= 3) {
      last_up[f[1]] = f[2] + 0;
      last_down[f[1]] = f[3] + 0;
    }
  }
  close(lastRawFile);

  # 3. 加载 5 秒在线用户、速率基线与活跃时间
  while ((getline line < onlineUsersFile) > 0) {
    gsub(/[ \r\n\t]/, "", line);
    if (line != "") online_set[line] = 1;
  }
  close(onlineUsersFile);

  while ((getline line < onlinePrevRawFile) > 0) {
    n = split(line, f, " ");
    if (n >= 4) {
      prev_5s_up[f[1]] = f[2] + 0;
      prev_5s_down[f[1]] = f[3] + 0;
      prev_5s_time[f[1]] = f[4] + 0;
    }
  }
  close(onlinePrevRawFile);

  while ((getline line < onlineLastActiveFile) > 0) {
    n = split(line, f, " ");
    if (n >= 2) {
      last_active[f[1]] = f[2] + 0;
    }
  }
  close(onlineLastActiveFile);

  while ((getline line < onlineCacheFile) > 0) {
    n = split(line, f, " ");
    if (n >= 5) {
      cached_online[f[1]] = f[2] + 0;
      cached_rate_down[f[1]] = f[3] + 0;
      cached_rate_up[f[1]] = f[4] + 0;
      cached_last_active[f[1]] = f[5] + 0;
    }
  }
  close(onlineCacheFile);

  # 【新增】上一份 xray 在线名单：用来判断"谁刚刚离开"
  while ((getline line < onlinePrevSetFile) > 0) {
    gsub(/[ \r\n\t]/, "", line);
    if (line != "") prev_set[line] = 1;
  }
  close(onlinePrevSetFile);

  # 【新增】每个用户的最后连接时刻（epoch 秒）
  while ((getline line < connStateFile) > 0) {
    n = split(line, f, " ");
    if (n >= 2) conn_at[f[1]] = f[2] + 0;
  }
  close(connStateFile);
}
/"name": "user>>>/ {
  n = split($0, parts, ">>>");
  if (n >= 4) {
    u = parts[2];
    dir = parts[4];
    sub(/^user_/, "", u);
    sub(/[" ,]+/, "", dir);
    if (u == "shared_legacy") u = "USER_TOKEN_1";
  }
}
/"value": [0-9]+/ {
  if (u != "" && dir != "") {
    n = split($0, vparts, ":");
    if (n >= 2) {
      val = vparts[2] + 0;
      if (dir ~ /uplink/) cur_raw_up[u] = val;
      if (dir ~ /downlink/) cur_raw_down[u] = val;
      tokens[u] = 1;
    }
    u = ""; dir = "";
  }
}
END {
  for (t in base_up) tokens[t] = 1;

  update_base = 0;
  for (t in tokens) {
    rup = cur_raw_up[t] + 0;
    rdown = cur_raw_down[t] + 0;
    lup = last_up[t] + 0;
    ldown = last_down[t] + 0;

    if (rup < lup) {
      base_up[t] += lup;
      update_base = 1;
    }
    if (rdown < ldown) {
      base_down[t] += ldown;
      update_base = 1;
    }

    final_up[t] = base_up[t] + rup;
    final_down[t] = base_down[t] + rdown;
    final_total[t] = final_up[t] + final_down[t];

    # ============================================================
    # 【2026-10-04 重写】在线判定改为【xray 活动连接列表】为权威
    #   原因: 原实现用"字节是否增长"猜在线 —— 挂着不下载的用户（只刷文字、
    #   待命状态）会被误判成离线。xray 的 statsgetallonlineusers 才是
    #   真正的"连接在不在"。
    #   字节增长降级为【速率】参考，不再参与在线判定。
    #   本段与 isOnlineTick 解耦: 每轮上报都结算, 否则状态会有 3/4 时间不更新。
    # ============================================================
    conn_on[t] = (online_set[t] == 1) ? 1 : 0;
    if (conn_on[t] == 1) {
      conn_at[t] = now;              # 在列表里 -> 刷新"最后连接时刻"
      last_active[t] = now;          # 兼容旧字段
    }
    cur_online[t] = conn_on[t];

    # 速率：有 xray 读数差就算，与在线判定无关
    ptime = prev_5s_time[t] + 0;
    dt = (ptime > 0 && now > ptime) ? (now - ptime) : 5;
    if (dt <= 0) dt = 5;
    pup = prev_5s_up[t] + 0;
    pdown = prev_5s_down[t] + 0;
    dup = (rup >= pup) ? (rup - pup) : 0;
    ddown = (rdown >= pdown) ? (rdown - pdown) : 0;
    cur_rate_up[t] = int(dup / dt);
    cur_rate_down[t] = int(ddown / dt);

    if (0) {
      cur_online[t] = cached_online[t] + 0;
      cur_rate_down[t] = cached_rate_down[t] + 0;
      cur_rate_up[t] = cached_rate_up[t] + 0;
      if (cached_last_active[t] > 0) last_active[t] = cached_last_active[t];
    }
  }

  if (update_base == 1) {
    for (t in tokens) {
      print t, base_up[t], base_down[t] > baseFile;
    }
    close(baseFile);
  }

  for (t in tokens) {
    print t, (cur_raw_up[t]+0), (cur_raw_down[t]+0) > lastRawFile;
  }
  close(lastRawFile);

  if (isOnlineTick == 1) {
    for (t in tokens) {
      print t, (cur_raw_up[t]+0), (cur_raw_down[t]+0), now > onlinePrevRawFile;
      print t, (last_active[t]+0) > onlineLastActiveFile;
      print t, cur_online[t], cur_rate_down[t], cur_rate_up[t], (last_active[t]+0) > onlineCacheFile;
      # 【新增】连接状态: token conn_on conn_at（供大屏算"多少分钟前在线"）
      print t, conn_on[t], (conn_at[t]+0) > connStateFile;
    }
    close(onlinePrevRawFile);
    close(onlineLastActiveFile);
    close(onlineCacheFile);
    close(connStateFile);
  }

  # 【新增】把"本次 xray 报的在线名单"原样输出, 供上报使用（权威）
  printf "\n#ONLINE#";
  firstOn = 1;
  for (t in online_set) {
    if (online_set[t] != 1) continue;
    if (!firstOn) printf ",";
    printf "%s", t;
    firstOn = 0;
  }
  printf "\n";

  printf "\"userTraffics\":{";
  first = 1;
  for (t in tokens) {
    if (!first) printf ",";
    printf "\"%s\":{\"up\":%.0f,\"down\":%.0f,\"total\":%.0f,\"online\":%.0f,\"rateDown\":%.0f,\"rateUp\":%.0f,\"lastActive\":%.0f}", t, final_up[t], final_down[t], final_total[t], cur_online[t], cur_rate_down[t], cur_rate_up[t], (last_active[t]+0);
    first = 0;
  }
  printf "},";
}')

# ========================================================
# 4. 15分钟全真滑动时序历史记录 (每30秒记录一个真实波次)
# ========================================================
LAST_HIST=0
[ -f "$HIST_TIME_FILE" ] && LAST_HIST=$(cat "$HIST_TIME_FILE" 2>/dev/null)
[ -z "$LAST_HIST" ] && LAST_HIST=0

if [ $((NOW - LAST_HIST)) -ge 30 ]; then
  echo $NOW > "$HIST_TIME_FILE"

  # 计算当前各入境总字节数以换算真实 Mbps 吞吐率
  BYTES_DATA=$(echo "$RAW" | awk '
  /"name": "inbound>>>in-[a-z]+>>>traffic>>>(downlink|uplink)"/ {
    if ($0 ~ /downlink/) dir = "downlink";
    else if ($0 ~ /uplink/) dir = "uplink";
    else dir = "";
  }
  /"value": [0-9]+/ {
    if (dir != "") {
      n = split($0, vparts, ":");
      val = vparts[2] + 0;
      if (dir == "downlink") td += val;
      if (dir == "uplink") tu += val;
      dir = "";
    }
  }
  END {
    printf "%.0f %.0f", td, tu;
  }')

  CURR_TD=$(echo "$BYTES_DATA" | awk '{print $1}')
  CURR_TU=$(echo "$BYTES_DATA" | awk '{print $2}')
  [ -z "$CURR_TD" ] && CURR_TD=0
  [ -z "$CURR_TU" ] && CURR_TU=0

  LAST_TS=0
  LAST_TD=0
  LAST_TU=0
  if [ -f "$HIST_BYTES_FILE" ]; then
    PREV_BYTES=$(cat "$HIST_BYTES_FILE" 2>/dev/null)
    LAST_TS=$(echo "$PREV_BYTES" | awk '{print $1}')
    LAST_TD=$(echo "$PREV_BYTES" | awk '{print $2}')
    LAST_TU=$(echo "$PREV_BYTES" | awk '{print $3}')
  fi
  [ -z "$LAST_TS" ] && LAST_TS=0
  [ -z "$LAST_TD" ] && LAST_TD=0
  [ -z "$LAST_TU" ] && LAST_TU=0

  DELTA_T=$((NOW - LAST_TS))
  if [ $DELTA_T -gt 0 ] && [ $LAST_TS -gt 0 ]; then
    DELTA_D=$((CURR_TD - LAST_TD))
    DELTA_U=$((CURR_TU - LAST_TU))
    [ $DELTA_D -lt 0 ] && DELTA_D=0
    [ $DELTA_U -lt 0 ] && DELTA_U=0
    # 【2026-10-03 修复 P1】旧实现在真实速率低于阈值时, 用
    #   "0.25 + (字节数%5)*0.05" / "0.08 + (字节数%3)*0.02"
    # 【凭空造一个数】。实测你大屏上绝大部分 0.25 / 0.30 / 0.35 / 0.45 波形
    # 全部命中该公式 —— 那些是填充值, 不是真实网速。
    # 现在真实值是多少就报多少, 低频时如实接近 0。
    D_MBPS=$(awk -v b="$DELTA_D" -v t="$DELTA_T" 'BEGIN {printf "%.3f", (b*8)/(t*1000000)}')
    U_MBPS=$(awk -v b="$DELTA_U" -v t="$DELTA_T" 'BEGIN {printf "%.3f", (b*8)/(t*1000000)}')
  else
    # 首次运行尚无基线: 如实报 0, 不编造
    D_MBPS="0"
    U_MBPS="0"
  fi
  echo "$NOW $CURR_TD $CURR_TU" > "$HIST_BYTES_FILE"

  TIME_STR=$(date +"%H:%M:%S")
  echo "$TIME_STR,$D_MBPS,$U_MBPS,$ACTIVE_CONNS" >> "$HIST_FILE"
  tail -n 30 "$HIST_FILE" > /data/local/tmp/hist.tmp 2>/dev/null && mv /data/local/tmp/hist.tmp "$HIST_FILE"

  # ========================================================
  # 【2026-10-05 新增】总带宽峰值统计（15 分钟窗口 + 当日峰值）
  # ========================================================
  # 口径（注意是【上行+下行合计】，与原来只看上行的口径不同）:
  #   · 总带宽      = 上行 Mbps + 下行 Mbps（两次上报之间的真实字节差算出）
  #   · 15 分钟峰值 = history_15m.txt 最近 30 个采样点的总带宽最大值
  #                   （采样间隔 30 秒 x 30 点 = 正好覆盖 15 分钟）
  #   · 当日峰值    = 当日观察到的总带宽最大值；日界线与流量榜一致
  #                   （${DAY_TZ} 零点，与 Worker 的 todayDateStr 同口径）
  #
  # 为什么放手机端算: 大屏原来那个"15 分钟峰值"其实只统计【当前浏览器会话】,
  #   刷新页面就归零, 并不是真的 15 分钟。放这里算, 刷新/换浏览器都不丢。
  # 放在 30 秒块内: 15 分钟峰值只在新采样点到来时才可能变化,
  #   没必要每 6 秒（本脚本被调用的周期）重算一次。
  BW_PEAK_FILE="/data/local/tmp/bw_peak.txt"
  BW_15M=$(awk -F',' '
    NF >= 3 { d = $2 + 0; u = $3 + 0; t = d + u; if (t > mx) mx = t; }
    END { printf "%.2f", mx + 0 }' "$HIST_FILE" 2>/dev/null)
  [ -z "$BW_15M" ] && BW_15M=0

  # 时区不再写死：从 Worker 下发的 xray 配置里取 dayTz（见 generatePhoneXrayConfig）。
  #   这样手机与 Worker 的日界线永远同一个值；取不到就退回设备本地时区。
  BW_DAY_TZ=$(grep -o '"dayTz"[[:space:]]*:[[:space:]]*"[^"]*"' /data/local/tmp/config.json 2>/dev/null \
              | sed 's/.*"\([^"]*\)"$/\1/')
  if [ -n "$BW_DAY_TZ" ]; then
    BW_DAY_KEY=$(TZ="$BW_DAY_TZ" date +%Y-%m-%d 2>/dev/null)
  else
    BW_DAY_KEY=$(date +%Y-%m-%d 2>/dev/null)
  fi
  [ -z "$BW_DAY_KEY" ] && BW_DAY_KEY="unknown"

  BW_PREV_KEY=""
  BW_PREV_PEAK=0
  if [ -f "$BW_PEAK_FILE" ]; then
    BW_PREV_KEY=$(awk 'NR==1{print $1}' "$BW_PEAK_FILE" 2>/dev/null)
    BW_PREV_PEAK=$(awk 'NR==1{printf "%.2f", $2+0}' "$BW_PEAK_FILE" 2>/dev/null)
  fi
  [ -z "$BW_PREV_PEAK" ] && BW_PREV_PEAK=0

  # 同一天 -> 接着累计；跨日/首次 -> 从 0 重新开始
  if [ "$BW_PREV_KEY" = "$BW_DAY_KEY" ]; then
    BW_DAY_PEAK="$BW_PREV_PEAK"
  else
    BW_DAY_PEAK=0
  fi
  # 保证不变式: 日峰值 >= 15 分钟峰值（15 分钟窗口可能跨过零点）
  if awk -v a="$BW_15M" -v b="$BW_DAY_PEAK" 'BEGIN{exit !(a > b)}'; then
    BW_DAY_PEAK="$BW_15M"
  fi
  # 只在峰值真的变大（或换了天）时落盘，减少写次数
  if [ "$BW_PREV_KEY" != "$BW_DAY_KEY" ] \
     || awk -v a="$BW_DAY_PEAK" -v b="$BW_PREV_PEAK" 'BEGIN{exit !(a > b)}'; then
    echo "$BW_DAY_KEY $BW_DAY_PEAK" > "$BW_PEAK_FILE" 2>/dev/null
  fi
  BW_PEAK_JSON="\"bwPeak\":{\"total15m\":$BW_15M,\"day\":$BW_DAY_PEAK,\"dayKey\":\"$BW_DAY_KEY\"},"
fi

# 格式化 15 分钟历史波次为 JSON (严格剥除任何 \r 防止破坏 JSON 语法)
HISTORY_JSON=$(awk -F',' '
BEGIN { printf "\"history15m\":["; first=1; }
{
  gsub(/\r/, "", $0);
  if (NF >= 4) {
    if (!first) printf ",";
    printf "{\"time\":\"%s\",\"down\":%s,\"up\":%s,\"conns\":%s}", $1, $2, $3, $4;
    first=0;
  }
}
END { printf "],"; }' "$HIST_FILE" 2>/dev/null)

# ========================================================
# 5. 用户访问域名网站统计 (解析 /sdcard/xray_live.log)
# ========================================================
DOMAIN_JSON=$(tail -n 300 /sdcard/xray_live.log 2>/dev/null | awk '/accepted tcp:/ {
  target = ""; user = "";
  for (i=1; i<=NF; i++) {
    if ($i == "accepted" && $(i+1) ~ /^tcp:/) {
      split($(i+1), a, ":");
      target = a[2];
    }
    if ($i == "email:") {
      user = $(i+1);
    }
  }
  if (target != "" && user != "") {
    sub(/^user_/, "", user);
    if (user == "shared_legacy") user = "USER_TOKEN_2";
    n = split(target, p, ".");
    if (n >= 2) {
      if (n >= 3 && (p[n-1] == "com" || p[n-1] == "net" || p[n-1] == "org" || p[n-1] == "co")) domain = p[n-2]"."p[n-1]"."p[n];
      else domain = p[n-1]"."p[n];
    } else domain = target;
    counts[user"|"domain]++;
  }
} END {
  printf "\"domainStats\":{";
  first=1;
  for (k in counts) {
    split(k, parts, "|");
    if (!first) printf ",";
    printf "\"%s|%s\":%d", parts[1], parts[2], counts[k];
    first=0;
  }
  printf "},";
}' 2>/dev/null)

# ========================================================
# 6. 上报至 Cloudflare Worker 接收远端状态 (严格3秒超时)
# ========================================================
# ========================================================
# 5.9 手机主库状态 (随本次上报一起带给 Worker, 不产生任何额外请求)
#     phoneVersion: 本机已生效的用户库版本 -> Worker 据此判断"手机主库已同步"
#     phoneTokens : 本机 Xray 配置里实际生效的账号 -> 后台可逐人比对
#     syncAck     : 已处理的手动刷新指令 id -> Worker 收到后撤销该指令
# ========================================================
PV_MASTER=""
[ -f "$VER_FILE" ] && PV_MASTER=$(cat "$VER_FILE" 2>/dev/null)
SA_MASTER=""
[ -f /data/local/tmp/last_sync_req.txt ] && SA_MASTER=$(cat /data/local/tmp/last_sync_req.txt 2>/dev/null)
PT_MASTER=""
if [ -f /data/local/tmp/config.json ]; then
  PT_MASTER=$(grep -o 'user_[a-zA-Z0-9_-]*' /data/local/tmp/config.json 2>/dev/null | sed 's/^user_/"/; s/$/"/' | sort -u | tr '\n' ',' | sed 's/,$//')
fi
MASTER_JSON="\"phoneVersion\":\"$PV_MASTER\",\"phoneTokens\":[$PT_MASTER],\"syncAck\":\"$SA_MASTER\","

RESP=""
if [ -n "$RAW" ]; then
  # ========================================================
  # 【轻重载荷拆分 · 2026-10-03】
  #   轻载荷(每次上报)  : 遥测 / 时延 / 连接数           约 1.2 KB
  #   重载荷(按需)      : 每人流量 / 域名统计            约 1.4 KB -> 12 小时或按需触发
  #   历史波形(变更时)  : 15 分钟带宽历史                约 1.8 KB -> 内容变化才发(约 30 秒一次)
  # 设计要点:
  #   - 时延数据必须保持新鲜(你要的 65 秒内), 所以轻载荷仍然每次都发;
  #   - 每人流量是"累计值", 排行榜不需要 6 秒级刷新 -> 12 小时足够;
  #   - 历史波形每 30 秒才产生一个新采样点, 原来每 6 秒原样重发,
  #     5/6 是纯冗余 -> 改成内容变了才发;
  #   - 任何以下情况立即强制发重载荷: ① 满 12 小时 ② 点了后台 ⟳ 刷新
  #     ③ 用户库版本变化(新增/禁用/删除) —— 与你的要求一致。
  # ========================================================
  HEAVY_FILE="/data/local/tmp/last_heavy_push.txt"
  HEAVY_VER_FILE="/data/local/tmp/last_heavy_ver.txt"
  HIST_SENT_FILE="/data/local/tmp/last_hist_sent.txt"
  HEAVY_INTERVAL=43200
  NOW_H=$(date +%s)
  LAST_HEAVY=$(cat "$HEAVY_FILE" 2>/dev/null)
  [ -z "$LAST_HEAVY" ] && LAST_HEAVY=0
  HEAVY_DUE=0
  [ $((NOW_H - LAST_HEAVY)) -ge $HEAVY_INTERVAL ] && HEAVY_DUE=1
  [ -f /data/local/tmp/force_sync ] && HEAVY_DUE=1
  if [ -f "$VER_FILE" ]; then
    CUR_VER=$(cat "$VER_FILE" 2>/dev/null)
    OLD_VER=$(cat "$HEAVY_VER_FILE" 2>/dev/null)
    [ "$CUR_VER" != "$OLD_VER" ] && HEAVY_DUE=1
  fi
  if [ "$HEAVY_DUE" = "1" ]; then
    echo "$NOW_H" > "$HEAVY_FILE"
    [ -f "$VER_FILE" ] && cp -f "$VER_FILE" "$HEAVY_VER_FILE" 2>/dev/null
    HEAVY_STATE="heavy"
  else
    USER_TRAFFICS_JSON=""
    DOMAIN_JSON=""
    HEAVY_STATE="light"
  fi
  # 历史波形: 内容未变则不重复发送
  HIST_NOW="$(wc -c < "$HIST_FILE" 2>/dev/null)-$(tail -n 1 "$HIST_FILE" 2>/dev/null)"
  HIST_LAST=$(cat "$HIST_SENT_FILE" 2>/dev/null)
  if [ -n "$HIST_NOW" ] && [ "$HIST_NOW" = "$HIST_LAST" ]; then
    HISTORY_JSON=""
  else
    echo "$HIST_NOW" > "$HIST_SENT_FILE"
  fi

  # ========================================================
  # 节点连通性状态 (由独立的 node_probe.sh 每 10 秒探 1 个节点产生)
  #   格式: ip|path|ok|时刻   -> 打包成 JSON 随上报带给 Worker
  # ========================================================
  NODE_STATUS_JSON=""
  if [ -f /data/local/tmp/node_status.txt ]; then
    # 【2026-10-04 用户要求】nodeStatus 增加 rtt(手机 → 该中转节点的 TCP 1×RTT,
    #   单位毫秒, 0 表示未测到)。旧格式只有 4 个字段时 rtt 输出 0, 向后兼容。
    NODE_STATUS_JSON=$(awk -F'|' '
      BEGIN { printf "\"nodeStatus\":["; first=1; }
      NF >= 4 {
        gsub(/\r/, "", $0);
        rtt = (NF >= 5 ? $5 + 0 : 0);
        colo = (NF >= 6 ? $6 : "");
        gsub(/[^A-Z]/, "", colo);
        if (!first) printf ",";
        printf "{\"ip\":\"%s\",\"path\":\"%s\",\"ok\":%s,\"at\":%s,\"rtt\":%d,\"colo\":\"%s\"}", $1, $2, $3, $4, rtt, colo;
        first=0;
      }
      END { printf "],"; }' /data/local/tmp/node_status.txt 2>/dev/null)
  fi

  # 【2026-10-04 用户要求】当前探测索引(测速中按它顺序推进)
  NODE_IDX_JSON=""
  if [ -f /data/local/tmp/node_current.txt ]; then
    _ci=$(cat /data/local/tmp/node_current.txt 2>/dev/null)
    _ct=$(cat /data/local/tmp/node_total.txt 2>/dev/null)
    case "$_ci" in ''|*[!0-9]*) _ci="" ;; esac
    case "$_ct" in ''|*[!0-9]*) _ct="0" ;; esac
    # 【2026-10-04】把当前节奏也报上去: 提速巡检时 2 秒/个, 常规 10 秒/个。
    #   大屏据此在两次上报之间【本地插值】, 让"测速中"平滑推进而不是一次跳 3 格。
    _fl=$(cat /data/local/tmp/node_fast_left 2>/dev/null)
    case "$_fl" in ''|*[!0-9]*) _fl=0 ;; esac
    _nf=0
    [ "$_fl" -gt 0 ] && _nf=1
    [ -n "$_ci" ] && NODE_IDX_JSON="\"nodeIdx\": $_ci, \"nodeTotal\": $_ct, \"nodeFast\": $_nf,"
  fi

  STRIPPED_RAW=$(echo "$RAW" | sed '1s/^[ \t\r\n]*{//')
  # 【2026-10-04 T7.3】把当前待处理/已消费的扫描指令 id 作为 scanAck 上报:
  #   Worker 据此确认"手机已收到该指令"后才删除 KV 里的 noc:cmd,
  #   未确认前会持续补发(修复指令在网络丢失时被永久吞掉的问题)。
  SCAN_ACK_JSON=""
  [ -s /data/local/tmp/scan_req ] && SCAN_ACK_JSON="\"scanAck\":\"$(cat /data/local/tmp/scan_req)\","
  # 【2026-10-05】总带宽峰值（15 分钟窗口 / 当日）。在 30 秒采样块里算出，
  #   这里只负责带上；块没跑到时变量为空，用空串兜底（不编造数字）。
  [ -z "$BW_PEAK_JSON" ] && BW_PEAK_JSON=""
  echo "{$TELEMETRY_JSON $MASTER_JSON $SCAN_ACK_JSON $ONLINE_USERS_JSON $PINGS_JSON $USER_TRAFFICS_JSON $HISTORY_JSON $BW_PEAK_JSON $DOMAIN_JSON $NODE_STATUS_JSON $NODE_IDX_JSON \"conns\": $ACTIVE_CONNS, $STRIPPED_RAW" > /data/local/tmp/traffic_payload.json
  PAYLOAD_BYTES=$(wc -c < /data/local/tmp/traffic_payload.json 2>/dev/null)
  [ -z "$PAYLOAD_BYTES" ] && PAYLOAD_BYTES=0
  echo "$HEAVY_STATE $PAYLOAD_BYTES $(date +%s)" > /data/local/tmp/last_payload_size.txt
  RESP=$(/system/bin/curl --connect-timeout 2 -m 3 -s -X POST "$WORKER_URL" \
    -H "Content-Type: application/json" \
    -H "X-Sync-Key: $REPORT_SECRET" \
    -d @/data/local/tmp/traffic_payload.json 2>/dev/null)
fi

# ========================================================
# 7. 无线 OTA 动态配置与用户主库热重载 (方案 B 硬件主库双向同步)
# ========================================================
# 【新增】把本次名单存档成"上一份"，下一轮用来判断谁刚离开
if [ -f "$ONLINE_USERS_FILE" ]; then
  cp -f "$ONLINE_USERS_FILE" "$ONLINE_PREV_SET" 2>/dev/null
fi

if [ -n "$RESP" ]; then
  REMOTE_VER=$(echo "$RESP" | /system/bin/sed -n 's/.*"version":"\([^"]*\)".*/\1/p')

  # ---- 手动刷新指令 (只有在后台点【刷新】时才会出现) ----
  # Worker 下发 syncRequest -> 这里打 force_sync 标记。
  # 注意: 下面第 7 节紧接着就会读这个标记, 所以本次运行内立即强制重新拉取,
  #       不需要多等一个上报周期。
  SYNC_REQ=$(echo "$RESP" | /system/bin/sed -n 's/.*"syncRequest":"\([^"]*\)".*/\1/p')

  # ========================================================
  # 解析 Worker 下发的"节点清单"(来自 RAW_NODES) -> nodes.txt
  #   这样 Worker 里增删节点后, 手机下一轮就自动拿到新清单, 保持同步。
  # ========================================================
  NODES_JSON=$(echo "$RESP" | /system/bin/sed -n 's/.*"nodeList":\(\[[^]]*\]\).*/\1/p')
  if [ -n "$NODES_JSON" ]; then
    echo "$NODES_JSON" | tr '}' '\n' | /system/bin/sed -n 's/.*"ip":"\([^"]*\)".*"path":"\([^"]*\)".*/\1|\2/p' > /data/local/tmp/nodes.txt.new
    if [ -s /data/local/tmp/nodes.txt.new ]; then
      mv /data/local/tmp/nodes.txt.new /data/local/tmp/nodes.txt
    fi
  fi

  # ========================================================
  # 手动刷新指令: 大屏点"手动刷新" -> Worker 记 flag -> 这里落标记
  # -> ping_scheduler 发现标记后启动 fast_scan.sh 做全速扫描(去掉10秒间隔)
  # ========================================================
  SCAN_REQ=$(echo "$RESP" | /system/bin/sed -n 's/.*"scanReq":"\([^"]*\)".*/\1/p')
  if [ -n "$SCAN_REQ" ]; then
    echo "$SCAN_REQ" > /data/local/tmp/scan_req
  fi
  if [ -n "$SYNC_REQ" ]; then
    LAST_SYNC_REQ=""
    [ -f /data/local/tmp/last_sync_req.txt ] && LAST_SYNC_REQ=$(cat /data/local/tmp/last_sync_req.txt 2>/dev/null)
    if [ "$SYNC_REQ" != "$LAST_SYNC_REQ" ]; then
      echo "$SYNC_REQ" > /data/local/tmp/last_sync_req.txt
      touch /data/local/tmp/force_sync
    fi
  fi

  if [ -n "$REMOTE_VER" ]; then
    # 【2026-10-04 修复 T3.3】原来的配置同步(拉用户库 / 回推用户库 / 拉配置 /
    # 校验并重启 xray)都在本进程内串行执行, 最坏约 19 秒, 会被 daemon 8 秒硬超时
    # 腰斩 -> force_sync 永不完成 + 每 6 秒重试风暴。
    # 现在只把 REMOTE_VER 落盘, 由独立的 sync_worker.sh 后台执行;
    # 本进程 ~2 秒内返回, 上报周期不受同步影响, 同步结果下一轮自然生效。
    echo "$REMOTE_VER" > /data/local/tmp/sync_remote_ver.txt
    LOCAL_VER=""
    [ -f "$VER_FILE" ] && LOCAL_VER=$(cat "$VER_FILE" 2>/dev/null)
    FORCE_SYNC=0
    [ -f /data/local/tmp/force_sync ] && FORCE_SYNC=1
    if [ "$REMOTE_VER" != "$LOCAL_VER" ] || [ "$FORCE_SYNC" = "1" ]; then
      nohup sh /data/local/tmp/sync_worker.sh </dev/null >/dev/null 2>&1 &
    fi
  fi
fi
