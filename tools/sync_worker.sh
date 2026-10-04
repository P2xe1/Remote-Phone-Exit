#!/system/bin/sh
# ============================================================
# sync_worker.sh —— 独立配置/用户库同步进程 (2026-10-04 修复 T3.3)
# ============================================================
# 背景: 原来的同步逻辑(拉用户库 / 回推用户库 / 拉 xray 配置 / 校验并重启)
#       在 report_traffic.sh 内串行执行, 最坏约 19 秒; 被 daemon 8 秒硬超时
#       腰斩 -> force_sync 永不完成 + 每 6 秒重试风暴。
# 现在: report_traffic.sh 每次上报只把 REMOTE_VER 落盘并【后台拉起】本脚本,
#       本脚本独立完成同步, 失败不阻塞上报; 下一轮上报会再拉一次(天然重试)。
#
# 单实例保护: 锁文件; 上一个实例还在跑(锁<40秒)就直接退出。
# 锁过期(卡死>40秒)则接管。
# ============================================================

LOCK=/data/local/tmp/sync_worker.lock
if [ -e "$LOCK" ]; then
  LOCK_TS=$(stat -c %Y "$LOCK" 2>/dev/null)
  AGE=$(( $(date +%s) - LOCK_TS ))
  if [ "$AGE" -lt 40 ]; then
    exit 0        # 上个实例还在跑, 不叠加
  fi
  rm -f "$LOCK"   # 锁过期, 接管
fi
touch "$LOCK"

REPORT_SECRET="${SYNC_SECRET}"
USERS_URL="https://${WORKER_HOST}/api/phone_users"
CONFIG_URL="https://${WORKER_HOST}/api/phone_xray_config"
USERS_FILE="/data/local/tmp/users.json"
VER_FILE="/data/local/tmp/user_version.txt"

REMOTE_VER=$(cat /data/local/tmp/sync_remote_ver.txt 2>/dev/null)
if [ -z "$REMOTE_VER" ]; then
  rm -f "$LOCK"
  exit 0
fi

LOCAL_VER=""
[ -f "$VER_FILE" ] && LOCAL_VER=$(cat "$VER_FILE" 2>/dev/null)
FORCE_SYNC=0
[ -f /data/local/tmp/force_sync ] && FORCE_SYNC=1

# 需要重新拉取的两种情况(与旧逻辑一致):
#   ① 成员变更 (REMOTE_VER != LOCAL_VER) —— 自动同步
#   ② 后台点了【刷新】 (force_sync 标记)  —— 手动强制同步
if [ "$REMOTE_VER" != "$LOCAL_VER" ] || [ "$FORCE_SYNC" = "1" ]; then
  /system/bin/curl --connect-timeout 3 -m 5 -s "$USERS_URL?key=$REPORT_SECRET" -o /data/local/tmp/new_users.json
  if [ -s /data/local/tmp/new_users.json ]; then
    FIRST_CHAR=$(head -c 1 /data/local/tmp/new_users.json 2>/dev/null)
    if [ "$FIRST_CHAR" = "{" ]; then
      cp /data/local/tmp/new_users.json "$USERS_FILE"
    fi
  fi

  # 用户库回推 Cloudflare —— 【2026-10-04 修复 T5.2】只在【版本真的不同】
  # (成员增删改)时才回推; force_sync(后台点刷新)只拉不推, 不再每刷新一次就
  # 全量 push 一遍用户库, 避免无谓 KV 写与失败重试风暴。
  if [ "$REMOTE_VER" != "$LOCAL_VER" ] && [ -s "$USERS_FILE" ]; then
    cp "$USERS_FILE" /data/local/tmp/users_backup.json 2>/dev/null
    printf '{"version":"%s","users":' "$REMOTE_VER" > /data/local/tmp/users_push.json
    cat "$USERS_FILE" >> /data/local/tmp/users_push.json
    printf '}' >> /data/local/tmp/users_push.json
    /system/bin/curl --connect-timeout 3 -m 5 -s -X POST "$USERS_URL?key=$REPORT_SECRET" \
      -H "Content-Type: application/json" \
      -H "X-Sync-Key: $REPORT_SECRET" \
      -d @/data/local/tmp/users_push.json -o /data/local/tmp/users_push_resp.json 2>/dev/null
    if grep -q '"status":"stale"' /data/local/tmp/users_push_resp.json 2>/dev/null; then
      # 云端已被后台改动, 丢弃本地版本号, 下一轮强制重新拉取
      rm -f "$VER_FILE"
    fi
  fi

  /system/bin/curl --connect-timeout 3 -m 5 -s "$CONFIG_URL?key=$REPORT_SECRET" -o /data/local/tmp/new_config.json
  if [ -s /data/local/tmp/new_config.json ]; then
    /data/local/tmp/xray run -test -c /data/local/tmp/new_config.json >/dev/null 2>&1
    if [ $? -eq 0 ]; then
      # 配置内容没变就不重启 xray —— 避免在线朋友无谓掉线约 1 秒
      CONFIG_CHANGED=1
      cmp -s /data/local/tmp/new_config.json /data/local/tmp/config.json && CONFIG_CHANGED=0
      XRAY_UP=0
      pgrep -f "/data/local/tmp/xray run" >/dev/null 2>&1 && XRAY_UP=1
      cp /data/local/tmp/new_config.json /data/local/tmp/config.json
      echo "$REMOTE_VER" > "$VER_FILE"
      rm -f /data/local/tmp/force_sync
      if [ "$CONFIG_CHANGED" = "1" ] || [ "$XRAY_UP" = "0" ]; then
        pkill -f "/data/local/tmp/xray run"
        sleep 0.3
        nohup /data/local/tmp/xray run -c /data/local/tmp/config.json </dev/null >/sdcard/xray_live.log 2>&1 &
      fi
    fi
  fi
fi

rm -f "$LOCK"
exit 0
