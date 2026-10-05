#!/system/bin/sh
# ============================================================
# 节点侧一键安装/启动入口（在设备上执行）
#
#   用法:
#     sh /data/local/tmp/install_node.sh          # 体检 -> 启动 -> 复查
#     sh /data/local/tmp/install_node.sh --check  # 只体检，不启动任何进程
#
#   它做的事:
#     1) 检查两个二进制、两份配置、各调度脚本是否都在
#     2) 报告会影响常驻的电源/自启状态（只读，不改系统设置）
#     3) 调用 run_daemon.sh 启动（它会先杀旧进程再拉起）
#     4) 复查进程是否真的起来了，并打印日志路径
#
#   它不做的事: 不改系统设置、不申请权限、不下载任何东西。
#     缺二进制 -> 按提示在电脑上执行 deploy/fetch_binaries.py 推送。
# ============================================================

TMP=/data/local/tmp
CHECK_ONLY=0
[ "$1" = "--check" ] && CHECK_ONLY=1

echo "============================================================"
echo " 节点侧安装/启动检查"
echo "============================================================"

RC=0

# ---- 1) 必需文件 ----
echo "[1/4] 必需文件"
for f in "$TMP/xray" "$TMP/cloudflared_native" "$TMP/config.json" "$TMP/config.yml" \
         "$TMP/run_daemon.sh" "$TMP/traffic_daemon.sh" "$TMP/report_traffic.sh" \
         "$TMP/ping_scheduler.sh" "$TMP/node_probe.sh" "$TMP/edge_probe.sh" \
         "$TMP/probe_gate.sh"; do
  if [ -e "$f" ]; then
    echo "  [OK] $f"
  else
    echo "  [XX] missing $f"
    RC=1
  fi
done

if [ "$RC" != "0" ]; then
  echo
  echo "  缺文件时的处理方式:"
  echo "    - 二进制(xray / cloudflared_native): 在电脑上执行"
  echo "        python deploy/fetch_binaries.py"
  echo "      它会下载、校验后推到 $TMP/ 下。"
  echo "    - 脚本与配置: 在电脑上执行"
  echo "        python deploy/step3_deploy_node.py"
  echo
  echo "  未启动任何进程。"
  exit 1
fi

# ---- 2) 可执行权限 ----
echo "[2/4] 可执行权限"
for f in "$TMP/xray" "$TMP/cloudflared_native"; do
  if [ -x "$f" ]; then
    echo "  [OK] $f exec ok"
  else
    echo "  [!!] $f 没有执行权限，补 chmod 755"
    chmod 755 "$f" 2>/dev/null
    if [ -x "$f" ]; then
      echo "  [OK] 已修复"
    else
      echo "  [XX] 仍不可执行(存储可能挂载为 noexec)"
      RC=1
    fi
  fi
done

# ---- 3) 常驻环境提示(只读) ----
echo "[3/4] 常驻环境(只读检查, 不修改系统设置)"
if command -v dumpsys >/dev/null 2>&1; then
  WL=$(dumpsys deviceidle whitelist 2>/dev/null | grep -c "com.termux")
  if [ "$WL" = "0" ]; then
    echo "  [!!] 未发现电池优化豁免记录: 系统休眠时可能挂起上报"
    echo "       建议在系统设置里给运行本脚本的程序开启「不受电池优化限制」"
  else
    echo "  [OK] 已有电池优化豁免记录"
  fi
  STAY=$(dumpsys power 2>/dev/null | grep -c "mStayOn=true")
  if [ "$STAY" = "0" ]; then
    echo "  [!!] 未保持唤醒(充电场景建议开启, 避免深度休眠)"
  else
    echo "  [OK] 已保持唤醒"
  fi
else
  echo "  [!!] 无法读取系统状态(非 Android 或权限受限), 跳过"
fi

if [ "$CHECK_ONLY" = "1" ]; then
  echo "[4/4] --check 模式: 不启动任何进程"
  if [ "$RC" = "0" ]; then
    echo "体检通过。去掉 --check 即可启动。"
  else
    echo "体检未通过, 见上面的 [XX]。"
  fi
  exit $RC
fi

# ---- 4) 启动 + 复查 ----
echo "[4/4] 启动节点"
sh "$TMP/run_daemon.sh"
START_RC=$?
if [ "$START_RC" != "0" ]; then
  echo "  [XX] run_daemon.sh 返回 $START_RC : 启动失败, 看它上面的输出"
  exit $START_RC
fi

sleep 3
echo
echo "复查进程:"
MISS=""
pgrep -f "/data/local/tmp/xray run" >/dev/null 2>&1 || MISS="$MISS xray"
pgrep -f "cloudflared_native"       >/dev/null 2>&1 || MISS="$MISS cloudflared"
pgrep -f "traffic_daemon.sh"        >/dev/null 2>&1 || MISS="$MISS traffic_daemon"
if [ -n "$MISS" ]; then
  echo "  [XX] 未起来:$MISS"
  echo "  排查: tail -20 /sdcard/xray_live.log"
  echo "        tail -20 /sdcard/cf_named.log"
  exit 1
fi
echo "  [OK] xray / cloudflared / traffic_daemon 都在运行"
echo
echo "日志:"
echo "  /sdcard/xray_live.log   (代理核心)"
echo "  /sdcard/cf_named.log    (隧道客户端)"
echo
echo "提示: 进程在 != 隧道已连上。请到监控台确认「节点设备段」为活跃、"
echo "      数据年龄持续小于 30 秒。"
exit 0

