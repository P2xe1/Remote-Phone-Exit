# -*- coding: utf-8 -*-
"""
Cloudflare 凭据统一读取处 —— 全项目唯一持有 Token 的地方。

优先级:
  1) 环境变量 CF_API_TOKEN
  2) 同目录下的 .cf_token 文件 (一行, 不要提交到任何仓库)

轮换方法:
  在 Cloudflare 面板吊销旧 Token -> 新建一个带
  (Account: Workers KV Storage:Read / Workers Scripts:Read+Edit /
   Account Analytics:Read) 权限的 Token -> 写进 .cf_token。
"""
import os
import pathlib
import sys

_here = pathlib.Path(__file__).resolve().parent


def _load_token() -> str:
    t = os.environ.get("CF_API_TOKEN", "").strip()
    if t:
        return t
    p = _here / ".cf_token"
    if p.exists():
        v = p.read_text(encoding="utf-8").strip()
        if v:
            return v
    print("缺少 Cloudflare API Token。", file=sys.stderr)
    print("  方式一: setx CF_API_TOKEN \"你的新Token\"  (需重开终端)", file=sys.stderr)
    print(f"  方式二: 把 Token 写进 {p}", file=sys.stderr)
    raise SystemExit(2)


TOKEN = _load_token()
ACC_ID = "${CF_ACCOUNT_ID}"
NS_ID = "${CF_KV_NAMESPACE_ID}"
SCRIPT_NAME = cfg("CF_SCRIPT_NAME", "my-worker")
