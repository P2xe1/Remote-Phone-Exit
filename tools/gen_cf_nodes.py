# -*- coding: utf-8 -*-
"""生成 Cloudflare 优选候选 IP + 可直接导入 mihomo/Clash.Meta 的测速配置

    参数一律从 .env 读取（VLESS + xhttp）。代码里不写死域名或 UUID ——
    既避免泄露，也避免"改了配置却忘了改脚本"。
"""
import io
import ipaddress
import os
import random
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
try:
    from tools.load_config import cfg          # 从仓库根运行
except ImportError:
    from load_config import cfg                # 从 tools/ 里运行

sys.stdout.reconfigure(encoding="utf-8")

# 【2026-10-05】原来这里是写死的明文，脱敏时被换成 ${VLESS_UUID} 占位符，
#   而 Python 不会替换它 —— 脚本会直接产出无效配置，且很难看出原因。
#   现在改为读 .env；缺了就在启动时明确报错。
UUID = cfg("VLESS_UUID", required=True)
HOST = cfg("TUNNEL_HOST", required=True)
PORT = 443
PATH = "/kl"

HOST = "${TUNNEL_HOST}"
PORT = 443
PATH = "/kl"

# Cloudflare 面向客户站点的 anycast 网段 (优选IP 通常出自这些段)
RANGES = [
    ("104.16.0.0/13", 90),      # 104.16-23  最常用
    ("104.24.0.0/14", 50),      # 104.24-27
    ("172.64.0.0/13", 90),      # 172.64-71
    ("162.159.0.0/16", 40),
    ("188.114.96.0/22", 12),
    ("190.93.240.0/20", 12),
    ("197.234.240.0/22", 12),
    ("198.41.128.0/17", 30),
    ("141.101.64.0/18", 20),
    ("108.162.192.0/18", 20),
    ("173.245.48.0/20", 12),
    ("103.21.244.0/22", 6),
    ("103.22.200.0/22", 6),
    ("131.0.72.0/22", 6),
]

random.seed(20261003)
ips = []
for cidr, n in RANGES:
    net = ipaddress.ip_network(cidr)
    hosts = list(net.hosts())
    pick = random.sample(hosts, min(n, len(hosts)))
    ips.extend(str(x) for x in pick)

# 去重 + 补上已知稳定的常用优选 IP (国内实测常见最优)
KNOWN = [
    "${CF_ANCHOR_1}", "104.16.132.229", "${CF_ANCHOR_2}", "${CF_ANCHOR_3}", "104.19.0.1",
    "${CF_ANCHOR_5}", "${CF_ANCHOR_4}", "104.22.0.1", "104.23.0.1", "${CF_ANCHOR_6}",
    "104.25.0.1", "104.26.0.1", "104.27.0.1", "172.64.0.1", "172.65.0.1",
    "172.66.0.1", "172.67.182.204", "172.68.0.1", "172.69.0.1", "172.70.0.1",
    "172.71.0.1", "162.159.0.1", "162.159.36.1", "188.114.96.1", "188.114.97.1",
    "190.93.240.1", "197.234.240.1", "198.41.128.1", "141.101.64.1", "108.162.192.1",
]
seen = set()
out = []
for ip in KNOWN + ips:
    if ip not in seen:
        seen.add(ip)
        out.append(ip)

print(f"生成候选 IP: {len(out)} 个")

io.open("cf_candidates.txt", "w", encoding="utf-8", newline="\n").write("\n".join(out) + "\n")
print("[OK] cf_candidates.txt")

# ---------- 生成 mihomo/Clash.Meta 测速配置 ----------
lines = []
lines.append("# Cloudflare 节点优选测速配置 (自动生成)")
lines.append("# 协议: VLESS + xhttp | 域名: %s | 需要 mihomo / Clash.Meta (不支持原版 Clash)" % HOST)
lines.append("mixed-port: 7890")
lines.append("allow-lan: true")
lines.append("mode: rule")
lines.append("log-level: warning")
lines.append("")
lines.append("proxies:")

for idx, ip in enumerate(out, 1):
    lines.append('  - name: "%03d-%s"' % (idx, ip))
    lines.append("    type: vless")
    lines.append("    server: %s" % ip)
    lines.append("    port: %d" % PORT)
    lines.append("    uuid: %s" % UUID)
    lines.append("    udp: true")
    lines.append("    tls: true")
    lines.append("    servername: %s" % HOST)
    lines.append("    skip-cert-verify: false")
    lines.append("    network: xhttp")
    lines.append("    xhttp-opts:")
    lines.append("      path: \"%s\"" % PATH)
    lines.append("      host: \"%s\"" % HOST)
    lines.append("      mode: auto")

lines.append("")
lines.append("proxy-groups:")
lines.append('  - name: "自动优选"')
lines.append("    type: url-test")
lines.append("    url: \"http://www.gstatic.com/generate_204\"")
lines.append("    interval: 300")
lines.append("    tolerance: 30")
lines.append("    proxies:")
for idx, ip in enumerate(out, 1):
    lines.append('      - "%03d-%s"' % (idx, ip))
lines.append("")
lines.append('  - name: "手动选择"')
lines.append("    type: select")
lines.append("    proxies:")
lines.append('      - "自动优选"')
for idx, ip in enumerate(out, 1):
    lines.append('      - "%03d-%s"' % (idx, ip))
lines.append("")
lines.append("rules:")
lines.append("  - MATCH,自动优选")

io.open("clash_cf_test.yaml", "w", encoding="utf-8", newline="\n").write("\n".join(lines) + "\n")
print("[OK] clash_cf_test.yaml  (%d 个节点)" % len(out))
print()
print("前 10 个候选:", out[:10])
