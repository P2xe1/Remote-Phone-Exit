#!/system/bin/sh
# ============================================================
# traffic_daemon.sh —— 看门狗 + 上报调度器
#
# 【2026-10-03 修复: 上报节奏漂移】
#   旧实现:
#       sh report_traffic.sh &                     # 后台跑
#       while kill -0 $PID; do sleep 1; done       # 每秒轮询一次
#       sleep 4                                    # 固定睡 4 秒
#   问题: 周期 = 脚本耗时 + 轮询误差(0~1 秒) + 4 秒。
#         脚本偶尔变慢或系统抖动时周期会漂到 13.5 秒(跳一轮),
#         大屏"服务可靠性"及时率掉到 60% 多。
#
#   新实现:
#       1) 同步等待上报脚本结束(不再每秒轮询), 消除 0~1 秒轮询误差;
#       2) 周期锚定: 记循环起点, 结束时 sleep(目标周期 - 已耗时),
#          脚本变慢时自动压缩休眠, 周期恒定;
#       3) 脚本耗时超过目标周期时立即开下一轮(周期 = 实际耗时),
#          不叠加"欠账", 避免后续连续背靠背上报;
#       4) 8 秒硬超时保留(防单轮挂死), 超时立即进入下一轮;
#       5) 每轮把耗时写入 cycle_timing.txt(封顶 120 行), 便于事后复盘。
#
#   ⚠ 本机 shell 的重要限制(实测确认, 务必遵守):
#       /system/bin/sh 的算术是 **32 位**。date +%s%N 约 1.79e18,
#       一旦进入 $(()) 就会被截断成 32 位(出现负数)。
#       因此**绝不能**对 date +%s%N 的结果做算术!
#       本脚本对绝对时刻只用 date +%s(约 1.79e9, 32 位安全),
#       毫秒精度只取纳秒串的后段(数值 < 1e9, 安全)。
#
#   实测(修复前, 服务端观测): 上报间隔中位 6.6 秒, 46% 超过 8 秒, 最大 81 秒。
#   实测(受控对照, 各 15 轮): 旧逻辑 6~7 秒 / 新逻辑 6~7 秒(隔离环境两者都稳)。
# ============================================================

TARGET_MS=6000    # 目标周期(毫秒)
# 【2026-10-04 修复 T3.3】硬超时从 8s 放宽到 15s: 配置同步已拆到独立的
# sync_worker.sh 后台执行, 上报本身 ~2s 完成; 15s 只是防挂死的保险丝,
# 不会再腰斩任何正常链路。
HARD_TIMEOUT=15
TIMING_FILE=/data/local/tmp/cycle_timing.txt
MAX_TIMING_LINES=120

# 取当前毫秒的小数部分(0~999): date +%s%N 后 9 位 / 1e6
# 【2026-10-04 修复 T6.1】原 tail -c 10 取的是"1 位秒+9 位纳秒"(最大 9.99e9),
#   超过 32 位有符号上限 -> 约 70% 概率溢出成负数。改 tail -c 9 只取 9 位纳秒。
sub_ms() {
  F=$(date +%s%N | tail -c 9)
  echo $(( F / 1000000 ))
}

# ---- 启动时清理上一世代残留的孤儿上报进程(父进程已死 -> PPID=1) ----
# 只在守护进程启动这一刻做一次, 不影响正在运行的上报。
ps -A -o PID,PPID,ARGS 2>/dev/null | while read -r P PP ARGS; do
  case "$ARGS" in
    *report_traffic.sh*|*fast_scan.sh*)
      if [ "$PP" = "1" ]; then
        kill -9 "$P" 2>/dev/null
      fi
      ;;
  esac
done

echo "[$(date '+%Y-%m-%d %H:%M:%S')] traffic_daemon v2 启动: 目标周期 ${TARGET_MS}ms, 硬超时 ${HARD_TIMEOUT}s, 进程 $$" >> "$TIMING_FILE"

while true; do
  # 周期起点用整数秒(32 位安全), 用于算补偿休眠
  CYCLE_START_S=$(date +%s)

  # 1. 确保 Xray 存活
  if ! pgrep -f "/data/local/tmp/xray run" >/dev/null 2>&1; then
    nohup /data/local/tmp/xray run -c /data/local/tmp/config.json </dev/null >/sdcard/xray_live.log 2>&1 &
  fi

  # 2. 确保 cloudflared 存活
  if ! pgrep -f "cloudflared_native" >/dev/null 2>&1; then
    nohup /data/local/tmp/cloudflared_native tunnel --config /data/local/tmp/config.yml --no-autoupdate --edge-ip-version 4 --protocol http2 run </dev/null >/sdcard/cf_named.log 2>&1 &
  fi

  # 3. 确保 ping_scheduler 存活
  if ! pgrep -f "ping_scheduler.sh" >/dev/null 2>&1; then
    nohup sh /data/local/tmp/ping_scheduler.sh </dev/null >/dev/null 2>&1 &
  fi

  # 4. 上报: 同步等待, 硬超时保护
  RPT_START_S=$(date +%s)
  RPT_START_MS=$(sub_ms)
  timeout -k 1 "$HARD_TIMEOUT" sh /data/local/tmp/report_traffic.sh >/dev/null 2>&1
  RC=$?
  RPT_END_MS=$(sub_ms)

  # 上报耗时(毫秒): 秒差*1000 + 小数部分差; 跨秒回绕时补 1000
  RPT_MS=$(( ($(date +%s) - RPT_START_S) * 1000 + RPT_END_MS - RPT_START_MS ))
  [ "$RPT_MS" -lt 0 ] && RPT_MS=$((RPT_MS + 1000))
  RPT_S=$((RPT_MS / 1000))

  # 5. 周期锚定: 只按整数秒算补偿(整数运算, 32 位安全),
  #    亚秒部分留给下一轮自动吸收, 不会累积漂移。
  ELAPSED_S=$(( $(date +%s) - CYCLE_START_S ))
  NAP=$(( TARGET_MS / 1000 - ELAPSED_S ))
  if [ "$NAP" -gt 0 ]; then
    sleep "$NAP"
    OVER=0
  else
    NAP=0
    OVER=$(( (ELAPSED_S - TARGET_MS / 1000) * 1000 ))
  fi

  CYCLE_MS=$(( ($(date +%s) - CYCLE_START_S) * 1000 ))

  # 6. 记录本轮时序(不涉及用户数据; 行数封顶)
  echo "$(date +%s) cycle=${CYCLE_MS}ms report=${RPT_MS}ms(${RPT_S}s) rc=$RC nap=${NAP}s over=${OVER}ms" >> "$TIMING_FILE"
  LINES=$(wc -l < "$TIMING_FILE" 2>/dev/null)
  if [ -n "$LINES" ] && [ "$LINES" -gt "$MAX_TIMING_LINES" ]; then
    tail -n "$MAX_TIMING_LINES" "$TIMING_FILE" > "$TIMING_FILE.tmp" 2>/dev/null && mv "$TIMING_FILE.tmp" "$TIMING_FILE"
  fi
done
