# -*- coding: utf-8 -*-
"""
NOC 大屏现状审计
1) CF Token 有效性
2) D1 权限探测 (决定用户库能否迁到跨机房强一致的 D1)
3) Worker 脚本版本与绑定
4) 两个入口 /admin 的用户列表对比 -> 验证跨机房不一致是否仍存在
5) 今日 KV 用量
"""
import json
import re
import sys
import urllib.error
import urllib.request

sys.path.insert(0, __import__("os").path.dirname(__import__("os").path.abspath(__file__)))
from load_config import cfg  # noqa: E402  （同目录的配置读取器）
from collections import defaultdict

sys.stdout.reconfigure(encoding="utf-8")
from cf_cfg import ACC_ID, NS_ID, SCRIPT_NAME, TOKEN

API = "https://api.cloudflare.com/client/v4"
ADMIN_PWD = "${ADMIN_PASSWORD}"


def api(path, method="GET", body=None):
    req = urllib.request.Request(
        API + path,
        data=json.dumps(body).encode() if body is not None else None,
        headers={"Authorization": f"Bearer {TOKEN}", "Content-Type": "application/json"},
        method=method,
    )
    try:
        with urllib.request.urlopen(req, timeout=40) as r:
            return r.status, json.loads(r.read().decode())
    except urllib.error.HTPOP5rror as e:
        raw = e.read().decode(errors="replace")
        try:
            return e.code, json.loads(raw)
        except Exception:
            return e.code, raw


def http_get(url):
    req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
    with urllib.request.urlopen(req, timeout=30) as r:
        return r.status, r.read().decode("utf-8", errors="replace")


print("=" * 66)
print("1) Token 与权限")
print("=" * 66)
st, d = api("/user/tokens/verify")
print(f"  verify HTTP {st}  ->  {json.dumps(d.get('result') if isinstance(d, dict) else d, ensure_ascii=False)}")

st, d = api(f"/accounts/{ACC_ID}/d1/database")
if st == 200 and isinstance(d, dict) and d.get("success"):
    dbs = d.get("result", [])
    print(f"  [有 D1 权限] 现有 D1 库 {len(dbs)} 个: {[x.get('name') for x in dbs]}")
    for x in dbs:
        print(f"      - {x.get('name')}  uuid={x.get('uuid')}  version={x.get('version')}")
else:
    print(f"  [无 D1 权限或失败] HTTP {st} -> {json.dumps(d, ensure_ascii=False)[:300]}")

print()
print("=" * 66)
print("2) Worker 脚本")
print("=" * 66)
st, d = api(f"/accounts/{ACC_ID}/workers/scripts/{SCRIPT_NAME}/bindings")
if st == 200 and isinstance(d, dict):
    print(f"  bindings ({len(d.get('result', []))}): {json.dumps(d.get('result'), ensure_ascii=False)}")
st, d = api(f"/accounts/{ACC_ID}/workers/scripts/{SCRIPT_NAME}/versions?per_page=3")
if st == 200 and isinstance(d, dict):
    for it in d.get("result", {}).get("items", []):
        print(f"  版本 #{it['number']}  {it['metadata']['created_on']}  source={it['metadata'].get('source')}")

print()
print("=" * 66)
print("3) 两个入口的 /admin 用户列表对比 (跨机房一致性)")
print("=" * 66)
HOSTS = ["${WORKER_HOST}", "my-worker.example-pixel.workers.dev"]
lists = {}
for h in HOSTS:
    try:
        st, html = http_get(f"https://{h}/admin?pwd={ADMIN_PWD}")
        toks = re.findall(r"token=([a-zA-Z0-9_\-]+)&(?:amp;)?type=", html)
        # 同时抓取姓名列
        names = re.findall(r'font-weight:600;">([^<]+)</td>', html)
        seen, uniq = set(), []
        for t in toks:
            if t not in seen:
                seen.add(t)
                uniq.append(t)
        lists[h] = uniq
        print(f"  {h}")
        print(f"      HTTP {st}  HTML {len(html)} B  用户 {len(uniq)} 个")
        print(f"      tokens: {uniq}")
        print(f"      names : {names}")
    except Exception as e:
        print(f"  {h}  失败: {e}")

if len(lists) == 2:
    a, b = list(lists.values())
    sa, sb = set(a), set(b)
    if sa == sb:
        print("\n  [一致] 两个入口用户列表完全相同")
    else:
        print("\n  [不一致] <== 跨机房用户库不同步仍然存在")
        print(f"      仅 {HOSTS[0]} 有: {sorted(sa - sb)}")
        print(f"      仅 {HOSTS[1]} 有: {sorted(sb - sa)}")

print()
print("=" * 66)
print("4) 今日 KV 用量")
print("=" * 66)
Q = """query($acc:String!,$start:String!){viewer{accounts(filter:{accountTag:$acc}){
kvOperationsAdaptiveGroups(limit:200,filter:{date_geq:$start}){count dimensions{actionType date}}}}}"""
req = urllib.request.Request(
    "https://api.cloudflare.com/client/v4/graphql",
    data=json.dumps({"query": Q, "variables": {"acc": ACC_ID, "start": "2026-10-03"}}).encode(),
    headers={"Authorization": f"Bearer {TOKEN}", "Content-Type": "application/json"},
    method="POST",
)
try:
    with urllib.request.urlopen(req, timeout=40) as r:
        g = json.loads(r.read().decode())
    rows = g["data"]["viewer"]["accounts"][0]["kvOperationsAdaptiveGroups"]
    if not rows:
        print("  今日 KV 操作 = 0")
    else:
        agg = defaultdict(int)
        for x in rows:
            agg[(x["dimensions"]["date"], x["dimensions"]["actionType"])] += x["count"]
        for (dt, act), n in sorted(agg.items()):
            print(f"  {dt}  {act:<8} {n}")
except Exception as e:
    print(f"  查询失败: {e}")
