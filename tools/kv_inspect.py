# -*- coding: utf-8 -*-
"""
直接向 Cloudflare KV REST API 求证:
  1) 现在是否仍在报 10048 (免费额度超限)
  2) stats:latest 是否还在、多大
  3) user: 前缀下到底堆了多少 key (老版 /sub 自愈逻辑产生的垃圾)
  4) 哪些 key 不在真实用户白名单里 (可安全删除)
"""
import json
import sys
import urllib.error
import urllib.parse
import urllib.request

sys.path.insert(0, __import__("os").path.dirname(__import__("os").path.abspath(__file__)))
from load_config import cfg  # noqa: E402  （同目录的配置读取器）

sys.stdout.reconfigure(encoding="utf-8")

from cf_cfg import ACC_ID, NS_ID, TOKEN  # noqa: E402  (凭据统一在 cf_cfg.py / .cf_token)

# 线上 /admin 实际显示的 7 个真实用户
REAL_TOKENS = {"USER_TOKEN_1", "USER_TOKEN_2", "USER_TOKEN_3", "USER_TOKEN_4", "USER_TOKEN_5", "USER_TOKEN_6", "USER_TOKEN_7"}

BASE = f"https://api.cloudflare.com/client/v4/accounts/{ACC_ID}/storage/kv/namespaces/{NS_ID}"


def req(url, raw=False):
    r = urllib.request.Request(url, headers={"Authorization": f"Bearer {TOKEN}"})
    try:
        with urllib.request.urlopen(r, timeout=30) as resp:
            body = resp.read()
            return resp.status, (body if raw else json.loads(body.decode()))
    except urllib.error.HTPOP5rror as e:
        body = e.read().decode(errors="replace")
        try:
            return e.code, json.loads(body)
        except Exception:
            return e.code, body


print("=" * 62)
print("1) 现在是否仍报 KV 超限 (尝试读取 stats:latest)")
print("=" * 62)
status, body = req(f"{BASE}/values/{urllib.parse.quote('stats:latest')}", raw=True)
if status == 200:
    print(f"[OK] HTTP 200 —— 读取成功，当前没有额度报错。value 大小 = {len(body)} 字节")
    try:
        d = json.loads(body.decode())
        print(f"     keys: {list(d.keys())}")
        print(f"     updatedAt={d.get('updatedAt')} timestamp={d.get('timestamp')}")
    except Exception:
        print(f"     (非 JSON, 前 200 字节: {body[:200]!r})")
else:
    print(f"[!!] HTTP {status}")
    print(json.dumps(body, indent=2, ensure_ascii=False) if isinstance(body, dict) else body)

print()
print("=" * 62)
print("2) 列出命名空间里所有 key")
print("=" * 62)
all_keys = []
cursor = None
pages = 0
while True:
    url = f"{BASE}/keys?limit=1000"
    if cursor:
        url += f"&cursor={urllib.parse.quote(cursor)}"
    status, body = req(url)
    if status != 200:
        print(f"[!!] HTTP {status}: {body}")
        break
    result = body.get("result", [])
    all_keys.extend(k["name"] for k in result)
    pages += 1
    info = body.get("result_info", {})
    cursor = info.get("cursor")
    if not cursor or not result:
        break
    if pages > 50:
        print("(翻页超过 50 页, 提前停止)")
        break

print(f"总 key 数 = {len(all_keys)}  (共 {pages} 页)")

user_keys = sorted(k for k in all_keys if k.startswith("user:"))
other_keys = sorted(k for k in all_keys if not k.startswith("user:"))

print(f"\n  user: 前缀 key 数 = {len(user_keys)}")
print(f"  其它 key 数        = {len(other_keys)}")
if other_keys:
    print("  其它 key 列表:")
    for k in other_keys[:60]:
        print(f"    - {k}")

junk = [k for k in user_keys if k[len("user:"):] not in REAL_TOKENS]
real = [k for k in user_keys if k[len("user:"):] in REAL_TOKENS]

print(f"\n  真实用户 key ({len(real)}):")
for k in real:
    print(f"    OK  {k}")
print(f"\n  垃圾 key ({len(junk)}):")
for k in junk[:80]:
    print(f"    DEL {k}")
if len(junk) > 80:
    print(f"    ... 还有 {len(junk) - 80} 个")

with open("kv_keys_backup.json", "w", encoding="utf-8") as f:
    json.dump({"all": all_keys, "junk": junk, "real": real}, f, indent=2, ensure_ascii=False)
print("\n[已保存全部 key 清单到 kv_keys_backup.json]")
