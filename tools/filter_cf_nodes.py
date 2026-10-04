# -*- coding: utf-8 -*-
"""用 TLS 握手 + SNI 验证筛掉无法路由到隧道的死 IP, 只保留可用的。

    判据: 与 IP:443 完成 TLS 握手且证书对你的隧道域名有效
          => 该 IP 确实服务于你的隧道。
    (注: 这里只验证"可达且路由正确", 实际的延迟排名仍需你在目标网络里实测)

    域名从 .env 读取，不在代码里写死。
"""
import concurrent.futures as cf
import io
import os
import socket
import ssl
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
try:
    from tools.load_config import cfg          # 从仓库根运行
except ImportError:
    from load_config import cfg                # 从 tools/ 里运行

sys.stdout.reconfigure(encoding="utf-8")

# 【2026-10-05】原来这里写死了域名（注释里的那份还漏了脱敏）。
#   现在统一从 .env 读 TUNNEL_HOST。
HOST = cfg("TUNNEL_HOST", required=True)

ips = [l.strip() for l in io.open("cf_candidates.txt", encoding="utf-8") if l.strip()]
print(f"待测: {len(ips)} 个")


def check(ip):
    ctx = ssl.create_default_context()
    try:
        with socket.create_connection((ip, 443), timeout=3) as raw:
            with ctx.wrap_socket(raw, server_hostname=HOST) as s:
                cert = s.getpeercert()
                if cert:
                    return (ip, True, "")
                return (ip, False, "no-cert")
    except Exception as e:
        return (ip, False, type(e).__name__)


good, bad = [], []
with cf.ThreadPoolExecutor(max_workers=60) as ex:
    for ip, ok, err in ex.map(check, ips):
        (good if ok else bad).append(ip)

print(f"✅ 可用(能正确路由到隧道): {len(good)}")
print(f"❌ 不可用(剔除):          {len(bad)}")

io.open("cf_candidates_ok.txt", "w", encoding="utf-8", newline="\n").write("\n".join(good) + "\n")
print("[OK] cf_candidates_ok.txt")

# ---------- 用可用 IP 重新生成 Clash 配置 ----------
UUID = "${VLESS_UUID}"
PATH = "/kl"
L = []
L.append("# Cloudflare 节点优选测速配置 (已剔除无法路由到隧道的 %d 个死 IP)" % len(bad))
L.append("# 协议: VLESS + xhttp  |  域名: %s  |  端口 443" % HOST)
L.append("# ⚠️ 必须用 mihomo / Clash.Meta (原版 Clash 不支持 xhttp)")
L.append("mixed-port: 7890")
L.append("allow-lan: true")
L.append("mode: rule")
L.append("log-level: warning")
L.append("")
L.append("proxies:")
for i, ip in enumerate(good, 1):
    L.append('  - {name: "%03d-%s", type: vless, server: %s, port: 443, uuid: %s, udp: true, tls: true, servername: %s, network: xhttp, xhttp-opts: {path: "%s", host: "%s", mode: auto}}'
             % (i, ip, ip, UUID, HOST, PATH, HOST))
L.append("")
L.append("proxy-groups:")
L.append('  - name: "自动优选"')
L.append("    type: url-test")
L.append('    url: "http://www.gstatic.com/generate_204"')
L.append("    interval: 120")
L.append("    tolerance: 30")
L.append("    proxies:")
for i, ip in enumerate(good, 1):
    L.append('      - "%03d-%s"' % (i, ip))
L.append("")
L.append("rules:")
L.append("  - MATCH,自动优选")
io.open("clash_cf_test.yaml", "w", encoding="utf-8", newline="\n").write("\n".join(L) + "\n")
print("[OK] clash_cf_test.yaml 已用 %d 个可用 IP 重新生成" % len(good))
