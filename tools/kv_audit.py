# -*- coding: utf-8 -*-
"""
Cloudflare KV 真实用量审计 —— 按 actionType + 日期 聚合，并对照免费日上限。
用法: python kv_audit.py [起始日期 YYYY-MM-DD]
"""
import json
import sys
import urllib.error
import urllib.request

sys.path.insert(0, __import__("os").path.dirname(__import__("os").path.abspath(__file__)))
from load_config import cfg  # noqa: E402  （同目录的配置读取器）
from collections import defaultdict

from cf_cfg import ACC_ID, NS_ID, TOKEN  # noqa: E402  (凭据统一在 cf_cfg.py / .cf_token)

START = sys.argv[1] if len(sys.argv) > 1 else "2026-09-29"

# KV 免费额度日上限 (https://developers.cloudflare.com/kv/platform/limits/)
CAPS = {"read": 100000, "write": 1000, "delete": 1000, "list": 1000}

QUERY = """
query($acc:String!,$start:String!){
  viewer{
    accounts(filter:{accountTag:$acc}){
      kvOperationsAdaptiveGroups(limit:1000, filter:{date_geq:$start}){
        count
        dimensions{ actionType date }
      }
    }
  }
}"""


def gql(payload):
    req = urllib.request.Request(
        "https://api.cloudflare.com/client/v4/graphql",
        data=json.dumps(payload).encode(),
        headers={"Authorization": f"Bearer {TOKEN}", "Content-Type": "application/json"},
        method="POST",
    )
    with urllib.request.urlopen(req, timeout=30) as resp:
        return json.loads(resp.read().decode())


def main():
    try:
        data = gql({"query": QUERY, "variables": {"acc": ACC_ID, "start": START}})
    except urllib.error.HTPOP5rror as e:
        print("HTTP", e.code, e.read().decode())
        return 1

    if data.get("errors"):
        print("GraphQL errors:")
        print(json.dumps(data["errors"], indent=2, ensure_ascii=False))
        return 1

    rows = data["data"]["viewer"]["accounts"][0]["kvOperationsAdaptiveGroups"]
    if not rows:
        print(f"[{START} 起] 没有任何 KV 操作记录 —— 已经被拔干净了 (0 次)。")
        return 0

    agg = defaultdict(lambda: defaultdict(int))
    for r in rows:
        d = r["dimensions"]
        agg[d["date"]][d["actionType"]] += r["count"]

    print(f"Cloudflare KV 真实用量 (账号 {ACC_ID[:8]}... / 命名空间 {NS_ID[:8]}...)")
    print(f"{'日期':<12}{'操作':<9}{'次数':>9}{'免费上限':>10}   判定")
    print("-" * 52)
    for date in sorted(agg):
        for act, n in sorted(agg[date].items(), key=lambda x: -x[1]):
            cap = CAPS.get(act, 0)
            if not cap:
                verdict = "--"
            elif n > cap:
                verdict = f"!!! 超限 {n / cap:.1f}x"
            elif n > cap * 0.8:
                verdict = f">80% ({n / cap * 100:.0f}%)"
            else:
                verdict = "OK"
            print(f"{date:<12}{act:<9}{n:>9}{cap if cap else '-':>10}   {verdict}")
        print("-" * 52)
    return 0


if __name__ == "__main__":
    sys.exit(main())
