#!/system/bin/sh
# ============================================================
# 完整重启入口
#   T3.1(2026-10-04): 把全部调度脚本一并杀掉再拉起, 否则旧进程会继续跑旧代码
#   2026-10-05 修复 B11: 启动后【真正检查】进程是否起来, 不再无条件报成功
# ============================================================
# 顺序不能变: 先杀 traffic_daemon(否则它不断复活子进程), 再杀其余。
# 【2026-10-06 修复 · Bug8】原来先杀 xray/cloudflared —— 在"核心已死、看门狗还活着"
#   的那个窗口里，traffic_daemon 会检测到核心缺失并立刻用旧配置把它们拉起来，
#   于是出现"刚重启完又跑了旧进程/两份进程"。现在严格按注释的顺序：先杀看门狗。
pkill -f traffic_daemon.sh
pkill -f xray
pkill -f cloudflared
pkill -f ping_scheduler.sh
pkill -f node_probe.sh
pkill -f edge_probe.sh
pkill -f intl_probe.sh
pkill -f fast_scan.sh
pkill -f report_traffic.sh
sleep 1

# ---- 启动前先确认必需文件在, 否则报清楚原因后退出(不假装成功) ----
RC=0
for f in /data/local/tmp/xray /data/local/tmp/cloudflared_native \
         /data/local/tmp/config.json /data/local/tmp/config.yml \
         /data/local/tmp/tunnel_creds.json \
         /data/local/tmp/traffic_daemon.sh; do
  if [ ! -e "$f" ]; then
    echo "MISSING: $f"
    RC=1
  fi
done
if [ "$RC" != "0" ]; then
  echo "启动失败: 上面这些必需文件不存在 —— 没有拉起任何进程。"
  exit 1
fi

nohup /data/local/tmp/xray run -c /data/local/tmp/config.json </dev/null > /sdcard/xray_live.log 2>&1 &
nohup /data/local/tmp/cloudflared_native tunnel --config /data/local/tmp/config.yml --no-autoupdate --edge-ip-version 4 --protocol quic run </dev/null > /sdcard/cf_named.log 2>&1 &
nohup /data/local/tmp/traffic_daemon.sh </dev/null > /dev/null 2>&1 &
sleep 3

# ---- 真正的存活检查 ----
# 注意: cloudflared 进程存在只能说明"程序起来了",
#       隧道是否真的连上要看日志, 所以这里额外提示去哪看。
FAIL=""
pgrep -f "/data/local/tmp/xray run"      >/dev/null 2>&1 || FAIL="$FAIL xray"
pgrep -f "cloudflared_native"            >/dev/null 2>&1 || FAIL="$FAIL cloudflared"
pgrep -f "traffic_daemon.sh"             >/dev/null 2>&1 || FAIL="$FAIL traffic_daemon"

if [ -n "$FAIL" ]; then
  echo "启动失败: 以下进程没有起来:$FAIL"
  echo "  排查: tail -20 /sdcard/xray_live.log"
  echo "        tail -20 /sdcard/cf_named.log"
  exit 1
fi

echo "核心进程已启动: xray / cloudflared / traffic_daemon"
echo "  日志: /sdcard/xray_live.log  /sdcard/cf_named.log"
echo "  注意: cloudflared 进程在 ≠ 隧道已连上, 请看上面日志确认。"
exit 0
