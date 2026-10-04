# -*- coding: utf-8 -*-
"""
1) 从 multipart 响应中提取线上 Worker 的真实 JS 源码
2) 扫描它是否引用 env.* / KV
3) 与本地 worker_deploy.js 逐行 diff
"""
import difflib
import json
import re
import sys
import urllib.request

sys.path.insert(0, __import__("os").path.dirname(__import__("os").path.abspath(__file__)))
from load_config import cfg  # noqa: E402  （同目录的配置读取器）

sys.stdout.reconfigure(encoding="utf-8")

from cf_cfg import ACC_ID as ACC, SCRIPT_NAME as SCRIPT, TOKEN  # noqa: E402
LOCAL = "worker_deploy.js"


def fetch(url):
    r = urllib.request.Request(url, headers={"Authorization": f"Bearer {TOKEN}"})
    with urllib.request.urlopen(r, timeout=60) as resp:
        return resp.read()


raw = fetch(f"https://api.cloudflare.com/client/v4/accounts/{ACC}/workers/scripts/{SCRIPT}/content/v2")
text = raw.decode("utf-8", errors="replace")

# --- 提取 multipart 里的 JS 部分 ---
m = re.search(r'name="worker\.js"[^\r\n]*\r?\n(?:[^\r\n]*\r?\n)*?\r?\n', text)
if not m:
    print("!! 无法定位 worker.js 分片头")
    sys.exit(1)
body_start = m.end()
# 结束边界: 下一个 --<boundary>
nb = re.search(r"\r?\n--[0-9a-f]{20,}", text[body_start:])
js = text[body_start: body_start + nb.start()] if nb else text[body_start:]

with open("_deployed_worker_clean.js", "w", encoding="utf-8", newline="\n") as f:
    f.write(js)

print(f"线上 JS 提取完成: {len(js)} 字节, {js.count(chr(10)) + 1} 行 -> _deployed_worker_clean.js")

# --- 扫描 KV / env 引用 ---
print("\n===== 扫描线上代码里的 KV / env 引用 =====")
pats = {
    "env.": r"\benv\b\s*\.",
    "SUB_DB": r"SUB_DB",
    "db.put": r"\bdb\s*\.\s*put",
    "db.get": r"\bdb\s*\.\s*get",
    "db.list": r"\bdb\s*\.\s*list",
    "db.delete": r"\bdb\s*\.\s*delete",
    "stats:latest": r"stats:latest",
    "caches.default": r"caches\s*\.\s*default",
    "cache.put": r"cache\s*\.\s*put",
}
for label, pat in pats.items():
    hits = [i + 1 for i, ln in enumerate(js.split("\n")) if re.search(pat, ln)]
    print(f"  {label:<16} {len(hits):>3} 处" + (f"  行号: {hits[:12]}" if hits else ""))

# --- 与本地 diff ---
print("\n===== 与本地 worker_deploy.js 比对 =====")
local = open(LOCAL, encoding="utf-8").read()


def norm(s):
    return [ln.rstrip() for ln in s.replace("\r\n", "\n").replace("\r", "\n").split("\n")]


a, b = norm(js), norm(local)
print(f"线上 {len(a)} 行 ({len(js)} B)   本地 {len(b)} 行 ({len(local)} B)")
if a == b:
    print("[完全一致] 本地文件 == 线上版本")
else:
    d = list(difflib.unified_diff(a, b, fromfile="LIVE", tofile="LOCAL", lineterm="", n=2))
    print(f"[不同] diff 共 {len(d)} 行, 前 80 行:")
    for line in d[:80]:
        print("   " + line)
