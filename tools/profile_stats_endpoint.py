# -*- coding: utf-8 -*-
"""定位 /api/stats_data 的 200ms 服务端耗时来源

思路: /api/rtt 是不做任何工作的纯探针, 它的耗时就是"网络 + CF 最简开销"的基准。
      拿 stats_data 的耗时减去该基准, 差值即为 CF 边缘真实处理成本。
      再连续请求多次, 观察冷/热 isolate 的差异(判断是否是 KV 读取导致)。
"""
import json
import sys
import time
import urllib.request

sys.path.insert(0, __import__("os").path.dirname(__import__("os").path.abspath(__file__)))
from load_config import cfg  # noqa: E402  （同目录的配置读取器）

sys.stdout.reconfigure(encoding="utf-8")
UA = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) NOC-Profile/1.0"}


def probe(url):
    r = urllib.request.Request(url, headers=UA)
    t = time.perf_counter()
    with urllib.request.urlopen(r, timeout=30) as resp:
        body = resp.read()
        status = resp.status
    return (time.perf_counter() - t) * 1000, status, body


print("=" * 62)
print("基准: /api/rtt 纯探针 (不做任何计算, 不读任何存储)")
print("=" * 62)
base = []
for i in range(4):
    ms, st, _ = probe("https://${WORKER_HOST}/api/rtt?_t=%d" % (time.time() * 1000))
    base.append(ms)
    print(f"  第{i+1}次: HTTP {st}   {ms:6.1f} ms")
    time.sleep(0.8)
print(f"  中位数基准 ≈ {sorted(base)[len(base)//2]:.1f} ms")

print()
print("=" * 62)
print("/api/stats_data 连续 8 次 (观察冷/热 isolate 差异)")
print("=" * 62)
rows = []
for i in range(8):
    ms, st, body = probe("https://${WORKER_HOST}/api/stats_data?pwd=${ADMIN_PASSWORD}&_t=%d" % (time.time() * 1000))
    d = json.loads(body.decode())
    rows.append((ms, d.get("serverMs"), len(d.get("data") or []), len(d.get("users") or [])))
    print(f"  第{i+1}次: 客户端 {ms:6.1f} ms | serverMs {str(d.get('serverMs')):>5} | data {len(d.get('data') or []):>4} 条 | users {len(d.get('users') or [])}")
    time.sleep(1)

warm = [r[1] for r in rows if isinstance(r[1], (int, float))]
if warm:
    print(f"\n  serverMs: 最小 {min(warm)} / 最大 {max(warm)} / 中位 {sorted(warm)[len(warm)//2]}")
    print(f"  非服务端部分(网络) ≈ 客户端耗时 - serverMs ≈ {rows[-1][0] - (rows[-1][1] or 0):.0f} ms")

print()
print("=" * 62)
print("载荷构成")
print("=" * 62)
ms, st, body = probe("https://${WORKER_HOST}/api/stats_data?pwd=${ADMIN_PASSWORD}&_t=%d" % (time.time() * 1000))
d = json.loads(body.decode())
print(f"  总 JSON: {len(body)} 字节")
for k in ["data", "history15m", "userDomains", "userTraffics", "users", "phoneMaster", "pings"]:
    if k in d and d[k] is not None:
        print(f"    {k:<14} {len(json.dumps(d[k], ensure_ascii=False).encode()):>7} 字节")
