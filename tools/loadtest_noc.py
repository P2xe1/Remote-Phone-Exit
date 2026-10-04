# -*- coding: utf-8 -*-
"""NOC 压力测试 + KV 写入量验证

目的: 证明"用户库迁到 KV"之后，即使请求量很大，KV 写入依然是 0。
      旧实现在 /sub 的每次拉取都会写 KV —— 这正是当初配额爆掉的原因。
"""
import json
import random
import string
import sys
import time
import urllib.error
import urllib.request

sys.path.insert(0, __import__("os").path.dirname(__import__("os").path.abspath(__file__)))
from load_config import cfg  # noqa: E402  （同目录的配置读取器）
from collections import defaultdict

sys.stdout.reconfigure(encoding="utf-8")
from cf_cfg import ACC_ID, TOKEN

BASE = "https://${WORKER_HOST}"
SYNC = "${SYNC_SECRET}"
PWD = "${ADMIN_PASSWORD}"


def req(method, path, body=None, headers=None):
    h = {"User-Agent": "NOC-LoadTest/1.0"}
    if headers:
        h.update(headers)
    data = None
    if body is not None:
        data = json.dumps(body).encode()
        h["Content-Type"] = "application/json"
    r = urllib.request.Request(BASE + path, data=data, headers=h, method=method)
    try:
        with urllib.request.urlopen(r, timeout=30) as resp:
            return resp.status, len(resp.read())
    except urllib.error.HTPOP5rror as e:
        return e.code, len(e.read())
    except Exception as e:
        return -1, str(e)


def kv_ops(start):
    Q = """query($acc:String!,$start:String!){viewer{accounts(filter:{accountTag:$acc}){
    kvOperationsAdaptiveGroups(limit:200,filter:{date_geq:$start}){count dimensions{actionType date}}}}}"""
    r = urllib.request.Request(
        "https://api.cloudflare.com/client/v4/graphql",
        data=json.dumps({"query": Q, "variables": {"acc": ACC_ID, "start": start}}).encode(),
        headers={"Authorization": f"Bearer {TOKEN}", "Content-Type": "application/json"},
        method="POST",
    )
    with urllib.request.urlopen(r, timeout=40) as resp:
        g = json.loads(resp.read().decode())
    rows = g["data"]["viewer"]["accounts"][0]["kvOperationsAdaptiveGroups"]
    agg = defaultdict(int)
    for x in rows:
        agg[x["dimensions"]["actionType"]] += x["count"]
    return agg


TODAY = time.strftime("%Y-%m-%d")

print("=" * 66)
print("负载前 KV 用量")
print("=" * 66)
before = kv_ops(TODAY)
print("  " + (json.dumps(before) if before else "0 次"))

N = 20
plan = []
for _ in range(N):
    plan.append(("GET", "/sub?token=USER_TOKEN_1", None, None))
    rnd = "".join(random.choices(string.ascii_lowercase + string.digits, k=10))
    plan.append(("GET", f"/sub?token=zz{rnd}", None, None))
    plan.append(("GET", f"/api/stats_data?pwd={PWD}", None, None))
    plan.append(("GET", f"/api/phone_users?key={SYNC}", None, None))
    plan.append(("GET", f"/api/phone_xray_config?key={SYNC}", None, None))
    plan.append(("POST", "/api/report_traffic",
                 {"pings": {"kl": 100, "gz": 100, "sg": 100, "hk": 100, "jp": 100, "tw": 100, "egress": 5},
                  "activeSlot": 0, "activeNode": "kl"},
                 {"X-Sync-Key": SYNC}))
    plan.append(("GET", f"/admin?pwd={PWD}", None, None))

print()
print("=" * 66)
print(f"发送 {len(plan)} 个请求 (其中 /sub 拉订阅 {N*2} 次, 手机上报 {N} 次)")
print("=" * 66)
codes = defaultdict(int)
t0 = time.time()
for i, (m, p, b, h) in enumerate(plan):
    st, ln = req(m, p, b, h)
    codes[f"{m} {p.split('?')[0]} -> {st}"] += 1
    if (i + 1) % 35 == 0:
        print(f"  ...{i+1}/{len(plan)}")
el = time.time() - t0
for k in sorted(codes):
    print(f"  {codes[k]:>3}x  {k}")
print(f"  耗时 {el:.1f}s")

print()
print("  等待 150 秒让 Cloudflare 分析数据落库 ...")
time.sleep(150)

print()
print("=" * 66)
print("负载后 KV 用量 (write 必须与负载前一致)")
print("=" * 66)
after = kv_ops(TODAY)
print("  " + (json.dumps(after) if after else "0 次"))
print()
for act in sorted(set(list(before.keys()) + list(after.keys()))):
    d = after.get(act, 0) - before.get(act, 0)
    print(f"  {act:<8} 前 {before.get(act,0):>5}  后 {after.get(act,0):>5}  本次新增 {d}")
w = after.get("write", 0) - before.get("write", 0)
print()
if w == 0:
    print("  [✅ 通过] 负载期间 KV 写入 = 0 —— 请求路径完全没有碰 KV 写入")
else:
    print(f"  [⚠️ 注意] 负载期间出现 {w} 次 KV 写入, 需要复查调用链")
