#!/system/bin/sh
# ============================================================
# 完整重启入口 (2026-10-04 修复 T3.1)
# ============================================================
# 【T3.1】旧版本只杀 xray/cloudflared/traffic_daemon —— ping_scheduler /
# node_probe / fast_scan 不会被杀, 而 traffic_daemon 的保活逻辑又只在它们
# 不存在时才拉起 => 更新脚本后旧进程永远继续跑旧代码(修复永远到不了运行态)。
# 现在把全部调度脚本一并杀掉, 再由新 daemon 统一拉起最新代码。
# 顺序不能变: 先杀 traffic_daemon(否则它不断复活子进程), 再杀其余。
pkill -f xray
pkill -f cloudflared
pkill -f traffic_daemon.sh
pkill -f ping_scheduler.sh
pkill -f node_probe.sh
pkill -f edge_probe.sh
pkill -f intl_probe.sh
pkill -f fast_scan.sh
pkill -f report_traffic.sh
sleep 1
nohup /data/local/tmp/xray run -c /data/local/tmp/config.json </dev/null > /sdcard/xray_live.log 2>&1 &
nohup /data/local/tmp/cloudflared_native tunnel --config /data/local/tmp/config.yml --no-autoupdate --edge-ip-version 4 --protocol http2 run </dev/null > /sdcard/cf_named.log 2>&1 &
nohup /data/local/tmp/traffic_daemon.sh </dev/null > /dev/null 2>&1 &
sleep 2
echo "All daemons started successfully."
