# -*- coding: utf-8 -*-
"""Worker 真实请求量审计: 按天/脚本/状态聚合, 用于量化手机上报链路负载。"""
import json
import sys
import urllib.request

sys.path.insert(0, __import__("os").path.dirname(__import__("os").path.abspath(__file__)))
from load_config import cfg  # noqa: E402  （同目录的配置读取器）
from collections import defaultdict

sys.stdout.reconfigure(encoding="utf-8")

from cf_cfg import ACC_ID, TOKEN  # noqa: E402  (凭据统一在 cf_cfg.py / .cf_token)

QUERY = """
query($acc:String!,$start:String!){
  viewer{
    accounts(filter:{accountTag:$acc}){
      workersInvocationsAdaptive(limit:1000, filter:{date_geq:$start}){
        sum{ requests subrequests errors }
        dimensions{ scriptName status date }
      }
    }
  }
}"""

body = json.dumps({"query": QUERY, "variables": {"acc": ACC_ID, "start": "2026-09-30"}}).encode()
req = urllib.request.Request(
    "https://api.cloudflare.com/client/v4/graphql",
    data=body,
    headers={"Authorization": f"Bearer {TOKEN}", "Content-Type": "application/json"},
    method="POST",
)
try:
    data = json.loads(urllib.request.urlopen(req, timeout=30).read().decode())
except Exception as e:
    print("Error:", e)
    sys.exit(1)

if data.get("errors"):
    print(json.dumps(data["errors"], indent=2, ensure_ascii=False))
    sys.exit(1)

rows = data["data"]["viewer"]["accounts"][0]["workersInvocationsAdaptive"]
by_day = defaultdict(lambda: defaultdict(int))
for r in rows:
    d = r["dimensions"]
    key = f"{d['scriptName']} | {d['status']}"
    by_day[d["date"]][key] += r["sum"]["requests"]

print("Workers 免费额度: 100,000 请求/天\n")
for date in sorted(by_day):
    total = sum(by_day[date].values())
    print(f"--- {date}   合计 {total:,} 请求 ({total / 100000 * 100:.1f}% 额度) ---")
    for k, v in sorted(by_day[date].items(), key=lambda x: -x[1]):
        print(f"    {k:<34} {v:>10,}")
    print()
