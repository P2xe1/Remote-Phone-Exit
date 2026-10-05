#!/system/bin/sh
# ============================================================
# probe_gate.sh —— 全局探测通行证 (硬性限制: 任意时刻最多 2 个探测)
#
#   背景: 手机上同时跑着 4 个会发探测请求的脚本
#     ping_scheduler.sh / fast_scan.sh / node_probe.sh / edge_probe.sh
#   每个脚本内部是串行的, 但进程之间会叠加 —— 峰值出现过 3~4 个同时探测。
#   本文件提供 2 个"名额"(目录), 探测前先占名额, 占不到就等, 测完立刻释放。
#
#   用法(在被改造的脚本里):
#     [ -f /data/local/tmp/probe_gate.sh ] && . /data/local/tmp/probe_gate.sh
#     _slot=$(probe_slot_acquire)     # 输出 1 或 2; 会一直等到有名额
#     ... 探测 ...
#     probe_slot_release "$_slot"
#
#   原理: mkdir 是原子操作, 两个槽位目录 = 两个名额。
#   死锁防护: 名额里记着持有者的 PID, 持有者已死则下一个等待者回收该名额。
# ============================================================

GATE_DIR=/data/local/tmp/probe_gate
GATE_LOG=/data/local/tmp/probe_gate.log

probe_slot_release() {
  if [ -n "$1" ] && [ "$1" != "0" ]; then
    rm -rf "$GATE_DIR/$1" 2>/dev/null
  fi
}

probe_slot_acquire() {
  mkdir -p "$GATE_DIR" 2>/dev/null
  _waited=0
  while true; do
    for _s in 1 2; do
      if mkdir "$GATE_DIR/$_s" 2>/dev/null; then
        echo $$ > "$GATE_DIR/$_s/pid" 2>/dev/null
        echo "$_s"
        return 0
      fi
      # 回收"持有者已死"的名额(被杀/崩溃留下的残留)
      _p=$(cat "$GATE_DIR/$_s/pid" 2>/dev/null)
      if [ -z "$_p" ] || ! kill -0 "$_p" 2>/dev/null; then
        rm -rf "$GATE_DIR/$_s" 2>/dev/null
      fi
    done
    sleep 1
    _waited=$((_waited + 1))
    if [ "$_waited" = "30" ]; then
      echo "[$(date '+%m-%d %H:%M:%S')] pid=$$ 等待探测名额已超 30 秒" >> "$GATE_LOG" 2>/dev/null
    fi
  done
}
