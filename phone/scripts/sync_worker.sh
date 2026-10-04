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

# ============================================================
# 【2026-10-05 修复】失败处理约定（依据《链路完整修改方案》补充项 2）
#   核心原则: 本轮任何一步失败 -> 不推进版本号、不清除待同步标记、
#             保留旧配置, 直接结束本轮; 下一轮上报会自然重试。
#   绝不把"上一轮的残留文件"当成本轮的成功结果。
# ============================================================
BAK_DIR=/data/local/tmp
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
  # ---- 拉用户库 ----
  # 【修复 a】先删目标文件: 否则 curl 失败时, 上一轮的文件会被当成
  #   "本轮的结果"覆盖到本地用户库。
  rm -f /data/local/tmp/new_users.json
  U_HTTP=$(/system/bin/curl --connect-timeout 3 -m 5 -s -w "%{http_code}" \
           "$USERS_URL?key=$REPORT_SECRET" -o /data/local/tmp/new_users.json 2>/dev/null)
  U_RC=$?
  if [ "$U_RC" -ne 0 ] || [ "$U_HTTP" != "200" ] || [ ! -s /data/local/tmp/new_users.json ]; then
    # 拉取失败 -> 本轮终止, 保留待同步状态, 下一轮重试
    rm -f "$LOCK"
    exit 0
  fi
  FIRST_CHAR=$(head -c 1 /data/local/tmp/new_users.json 2>/dev/null)
  if [ "$FIRST_CHAR" = "{" ]; then
    cp /data/local/tmp/new_users.json "$USERS_FILE"
  else
    # 拿到 200 但不是合法 JSON -> 同样不推进, 避免用坏数据覆盖
    rm -f "$LOCK"
    exit 0
  fi

  # 用户库回推 Cloudflare —— 【2026-10-04 修复 T5.2】只在【版本真的不同】
  # (成员增删改)时才回推; force_sync(后台点刷新)只拉不推, 不再每刷新一次就
  # 全量 push 一遍用户库, 避免无谓 KV 写与失败重试风暴。
  if [ "$REMOTE_VER" != "$LOCAL_VER" ] && [ -s "$USERS_FILE" ]; then
    cp "$USERS_FILE" /data/local/tmp/users_backup.json 2>/dev/null
    printf '{"version":"%s","users":' "$REMOTE_VER" > /data/local/tmp/users_push.json
    cat "$USERS_FILE" >> /data/local/tmp/users_push.json
    printf '}' >> /data/local/tmp/users_push.json
    # 【修复 a】同样先删残留响应文件
    rm -f /data/local/tmp/users_push_resp.json
    P_HTTP=$(/system/bin/curl --connect-timeout 3 -m 5 -s -X POST "$USERS_URL?key=$REPORT_SECRET" \
             -H "Content-Type: application/json" \
             -H "X-Sync-Key: $REPORT_SECRET" \
             -w "%{http_code}" \
             -d @/data/local/tmp/users_push.json -o /data/local/tmp/users_push_resp.json 2>/dev/null)
    P_RC=$?
    if [ "$P_RC" -ne 0 ] || [ "$P_HTTP" != "200" ]; then
      # 回推失败 -> 本轮终止（不推进版本, 不管配置）
      rm -f "$LOCK"
      exit 0
    fi
    if grep -q '"status":"stale"' /data/local/tmp/users_push_resp.json 2>/dev/null; then
      # 【修复 b】云端已被后台改动, 本地这份已失效:
      #   丢弃本地版本号, 并【立即结束本轮】——
      #   原实现继续往下走, 会用被拒绝的旧用户库去推配置、写版本号。
      rm -f "$VER_FILE"
      rm -f /data/local/tmp/force_sync
      rm -f "$LOCK"
      exit 0
    fi
  fi

  # ---- 拉 xray 配置 ----
  # 【修复 c】先删残留, 再查退出码与 HTTP 状态
  rm -f /data/local/tmp/new_config.json
  C_HTTP=$(/system/bin/curl --connect-timeout 3 -m 5 -s -w "%{http_code}" \
           "$CONFIG_URL?key=$REPORT_SECRET" -o /data/local/tmp/new_config.json 2>/dev/null)
  C_RC=$?
  if [ "$C_RC" -eq 0 ] && [ "$C_HTTP" = "200" ] && [ -s /data/local/tmp/new_config.json ]; then
    /data/local/tmp/xray run -test -c /data/local/tmp/new_config.json >/dev/null 2>&1
    if [ $? -eq 0 ]; then
      # 配置内容没变就不重启 xray —— 避免在线朋友无谓掉线约 1 秒
      CONFIG_CHANGED=1
      cmp -s /data/local/tmp/new_config.json /data/local/tmp/config.json && CONFIG_CHANGED=0
      XRAY_UP=0
      pgrep -f "/data/local/tmp/xray run" >/dev/null 2>&1 && XRAY_UP=1

      # 【修复 d】先把旧配置留一份底, 再替换 —— 新配置起不来就回滚
      cp -f /data/local/tmp/config.json "$BAK_DIR/config.json.syncbak" 2>/dev/null
      cp -f /data/local/tmp/new_config.json /data/local/tmp/config.json

      RESTARTED=0
      if [ "$CONFIG_CHANGED" = "1" ] || [ "$XRAY_UP" = "0" ]; then
        RESTARTED=1
        pkill -f "/data/local/tmp/xray run"
        sleep 0.3
        nohup /data/local/tmp/xray run -c /data/local/tmp/config.json </dev/null >/sdcard/xray_live.log 2>&1 &
        # 给它一点时间起来
        sleep 2
      fi

      # 【修复 d】确认 xray 真的在跑, 才承认本轮同步成功
      XRAY_NOW=0
      pgrep -f "/data/local/tmp/xray run" >/dev/null 2>&1 && XRAY_NOW=1
      if [ "$XRAY_NOW" = "0" ]; then
        # 启动失败 -> 回滚旧配置并尝试恢复, 保留待同步状态供下一轮重试
        if [ "$RESTARTED" = "1" ] && [ -f "$BAK_DIR/config.json.syncbak" ]; then
          cp -f "$BAK_DIR/config.json.syncbak" /data/local/tmp/config.json
          nohup /data/local/tmp/xray run -c /data/local/tmp/config.json </dev/null >/sdcard/xray_live.log 2>&1 &
        fi
        rm -f "$LOCK"
        exit 0
      fi

      # 到这里才写版本号 / 清待同步标记
      rm -f "$BAK_DIR/config.json.syncbak"
      echo "$REMOTE_VER" > "$VER_FILE"
      rm -f /data/local/tmp/force_sync
    fi
  fi
fi

rm -f "$LOCK"
exit 0
