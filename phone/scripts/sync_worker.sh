#!/system/bin/sh
# ============================================================
# sync_worker.sh —— 独立配置/用户库同步进程 (2026-10-04 修复 T3.3)
# ============================================================
# 背景: 原来的同步逻辑(拉用户库 / 回推用户库 / 拉 xray 配置 / 校验并重启)
#       在 report_traffic.sh 内串行执行, 最坏约 19 秒; 被 daemon 硬超时腰斩。
# 现在: report_traffic.sh 每次上报只把 REMOTE_VER 落盘并【后台拉起】本脚本,
#       本脚本独立完成同步, 失败不阻塞上报; 下一轮上报会再拉一次(天然重试)。
#
# 失败处理约定:
#   本轮任何一步失败 -> 不推进版本号、不清除待同步标记、不发确认、保留旧配置,
#   直接结束本轮; 下一轮上报会自然重试。
#
# 【2026-10-06 修复】
#   ① 锁改为 mkdir 原子锁(原来"先判断再 touch", 两个实例可能同时进入)。
#      锁过期(卡死 > 40 秒)则接管。兼容旧版留下的同名普通文件。
#   ② 只有同步真正成功(配置校验通过且 xray 在跑)才写 sync_acked.txt,
#      report_traffic.sh 据此向 Worker 发 syncAck —— 不再"收到指令就确认"。
#   ③ 回推被判 stale 时保留 force_sync, 下一轮继续重试(原来会删掉, 手动刷新被吞)。
# ============================================================
BAK_DIR=/data/local/tmp
LOCK=/data/local/tmp/sync_worker.lock
if ! mkdir "$LOCK" 2>/dev/null; then
  LOCK_TS=$(stat -c %Y "$LOCK" 2>/dev/null || echo 0)
  AGE=$(( $(date +%s) - LOCK_TS ))
  if [ "$AGE" -lt 40 ]; then
    exit 0        # 上个实例还在跑, 不叠加
  fi
  rm -rf "$LOCK"  # 锁过期(或是旧版留下的普通文件), 接管
  mkdir "$LOCK" 2>/dev/null || exit 0
fi

finish() {
  rm -rf "$LOCK"
  exit 0
}

REPORT_SECRET="${SYNC_SECRET}"
USERS_URL="https://${WORKER_HOST}/api/phone_users"
CONFIG_URL="https://${WORKER_HOST}/api/phone_xray_config"
USERS_FILE="/data/local/tmp/users.json"
VER_FILE="/data/local/tmp/user_version.txt"

REMOTE_VER=$(cat /data/local/tmp/sync_remote_ver.txt 2>/dev/null)
[ -z "$REMOTE_VER" ] && finish

LOCAL_VER=""
[ -f "$VER_FILE" ] && LOCAL_VER=$(cat "$VER_FILE" 2>/dev/null)
FORCE_SYNC=0
[ -f /data/local/tmp/force_sync ] && FORCE_SYNC=1

# 需要重新拉取的两种情况:
#   ① 成员变更 (REMOTE_VER != LOCAL_VER) —— 自动同步
#   ② 后台点了【刷新】 (force_sync 标记)  —— 手动强制同步
if [ "$REMOTE_VER" = "$LOCAL_VER" ] && [ "$FORCE_SYNC" != "1" ]; then
  finish
fi

# ---- 拉用户库 ----
# 先删目标文件: 否则 curl 失败时, 上一轮的文件会被当成"本轮的结果"。
rm -f /data/local/tmp/new_users.json
U_HTTP=$(/system/bin/curl --connect-timeout 3 -m 5 -s -w "%{http_code}" \
         -H "X-Sync-Key: $REPORT_SECRET" \
         "$USERS_URL" -o /data/local/tmp/new_users.json 2>/dev/null)
U_RC=$?
if [ "$U_RC" -ne 0 ] || [ "$U_HTTP" != "200" ] || [ ! -s /data/local/tmp/new_users.json ]; then
  finish            # 拉取失败 -> 保留待同步状态, 下一轮重试
fi
FIRST_CHAR=$(head -c 1 /data/local/tmp/new_users.json 2>/dev/null)
if [ "$FIRST_CHAR" != "{" ]; then
  finish            # 200 但不是合法 JSON -> 不推进, 避免用坏数据覆盖
fi
cp /data/local/tmp/new_users.json "$USERS_FILE"

# 用户库回推 Cloudflare —— 只在【版本真的不同】时才回推; force_sync 只拉不推。
if [ "$REMOTE_VER" != "$LOCAL_VER" ] && [ -s "$USERS_FILE" ]; then
  cp "$USERS_FILE" /data/local/tmp/users_backup.json 2>/dev/null
  printf '{"version":"%s","users":' "$REMOTE_VER" > /data/local/tmp/users_push.json
  cat "$USERS_FILE" >> /data/local/tmp/users_push.json
  printf '}' >> /data/local/tmp/users_push.json
  rm -f /data/local/tmp/users_push_resp.json
  P_HTTP=$(/system/bin/curl --connect-timeout 3 -m 5 -s -X POST "$USERS_URL" \
           -H "Content-Type: application/json" \
           -H "X-Sync-Key: $REPORT_SECRET" \
           -w "%{http_code}" \
           -d @/data/local/tmp/users_push.json -o /data/local/tmp/users_push_resp.json 2>/dev/null)
  P_RC=$?
  if grep -q '"status":"stale"' /data/local/tmp/users_push_resp.json 2>/dev/null; then
    # 云端已被后台改动, 本地这份已失效: 丢弃本地版本号并结束本轮。
    # 【保留 force_sync】下一轮拿到新版本后继续完成用户点的那次刷新。
    rm -f "$VER_FILE"
    finish
  fi
  if [ "$P_RC" -ne 0 ] || [ "$P_HTTP" != "200" ]; then
    finish          # 回推失败 -> 本轮终止(不推进版本, 不动配置)
  fi
fi

# ---- 拉 xray 配置 ----
rm -f /data/local/tmp/new_config.json
C_HTTP=$(/system/bin/curl --connect-timeout 3 -m 5 -s -w "%{http_code}" \
         -H "X-Sync-Key: $REPORT_SECRET" \
         "$CONFIG_URL" -o /data/local/tmp/new_config.json 2>/dev/null)
C_RC=$?
if [ "$C_RC" -ne 0 ] || [ "$C_HTTP" != "200" ] || [ ! -s /data/local/tmp/new_config.json ]; then
  finish
fi
if ! /data/local/tmp/xray run -test -c /data/local/tmp/new_config.json >/dev/null 2>&1; then
  finish            # 新配置校验不过 -> 保留旧配置
fi

# 配置内容没变就不重启 xray —— 避免在线朋友无谓掉线约 1 秒
CONFIG_CHANGED=1
cmp -s /data/local/tmp/new_config.json /data/local/tmp/config.json && CONFIG_CHANGED=0
XRAY_UP=0
pgrep -f "/data/local/tmp/xray run -c" >/dev/null 2>&1 && XRAY_UP=1

# 先把旧配置留一份底, 再替换 —— 新配置起不来就回滚
cp -f /data/local/tmp/config.json "$BAK_DIR/config.json.syncbak" 2>/dev/null
cp -f /data/local/tmp/new_config.json /data/local/tmp/config.json

RESTARTED=0
if [ "$CONFIG_CHANGED" = "1" ] || [ "$XRAY_UP" = "0" ]; then
  RESTARTED=1
  pkill -f "/data/local/tmp/xray run"
  sleep 0.3
  nohup /data/local/tmp/xray run -c /data/local/tmp/config.json </dev/null >/sdcard/xray_live.log 2>&1 &
  sleep 2
fi

# 确认 xray 真的在跑, 才承认本轮同步成功
if ! pgrep -f "/data/local/tmp/xray run -c" >/dev/null 2>&1; then
  if [ "$RESTARTED" = "1" ] && [ -f "$BAK_DIR/config.json.syncbak" ]; then
    cp -f "$BAK_DIR/config.json.syncbak" /data/local/tmp/config.json
    nohup /data/local/tmp/xray run -c /data/local/tmp/config.json </dev/null >/sdcard/xray_live.log 2>&1 &
  fi
  finish
fi

# 到这里才写版本号 / 清待同步标记 / 写确认
rm -f "$BAK_DIR/config.json.syncbak"
echo "$REMOTE_VER" > "$VER_FILE"
if [ "$FORCE_SYNC" = "1" ] && [ -f /data/local/tmp/last_sync_req.txt ]; then
  cp -f /data/local/tmp/last_sync_req.txt /data/local/tmp/sync_acked.txt
fi
rm -f /data/local/tmp/force_sync
finish
