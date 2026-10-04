# -*- coding: utf-8 -*-
"""
cf_deploy.py - NOC Worker 部署器 (2026-10-04 重写: T9.1/T9.2/T9.3/T8.8)

T9.1: bindings 改为【读取现有 + 合并】(只确保 SUB_DB 存在, 保留其它绑定),
      不再写死覆盖 —— 将来加 Durable Object 等绑定不会被抹掉。
T9.2: BUILD_ID 注入失败立即中止; 部署前自动备份, 失败自动恢复备份。
T9.3: 日志改纯 ASCII(避免 GBK 乱码); metadata 增加 migrations 字段。
T8.8: 部署时下载 Chart.js 内嵌进 Worker(/chart.js 本地直出), 下载失败则保留 CDN 兜底。
"""
import json
import shutil
import sys
import time
import re
import urllib.error
import urllib.request

sys.path.insert(0, __import__("os").path.dirname(__import__("os").path.abspath(__file__)))
from load_config import cfg  # noqa: E402  （同目录的配置读取器）

ACCOUNT_ID = cfg("CF_ACCOUNT_ID", required=True)
SCRIPT_NAME = cfg("CF_SCRIPT_NAME", "my-worker")
WORKER_FILE = "worker_deploy.js"
SUB_DB_NS_ID = cfg("CF_KV_NAMESPACE_ID", required=True)

CHART_JS_SOURCES = [
    "https://cdn.jsdelivr.net/npm/chart.js@4.4.1/dist/chart.umd.min.js",
    "https://cdnjs.cloudflare.com/ajax/libs/Chart.js/4.4.1/chart.umd.min.js",
    "https://unpkg.com/chart.js@4.4.1/dist/chart.umd.min.js",
]


def log(msg):
    print("[*] " + msg)


def download_chartjs():
    for url in CHART_JS_SOURCES:
        try:
            req = urllib.request.Request(url, headers={"User-Agent": "noc-deploy/1.0"})
            with urllib.request.urlopen(req, timeout=30) as r:
                body = r.read().decode("utf-8", "replace")
            if len(body) > 50000 and "Chart" in body:
                log("Chart.js downloaded from " + url + " (" + str(len(body)) + " bytes)")
                return body
        except Exception as e:
            log("Chart.js source failed " + url + ": " + str(e))
    return None


def deploy(api_token):
    # ---- T9.2: 部署前备份(含当前 BUILD_ID), 失败自动恢复 ----
    ts = time.strftime("%Y%m%d_%H%M%S")
    bak = WORKER_FILE + ".bak_before_deploy_" + ts
    try:
        shutil.copy(WORKER_FILE, bak)
        log("backup saved -> " + bak)
    except Exception as e:
        print("[!] backup failed: " + str(e))
        return False

    try:
        raw = open(WORKER_FILE, encoding="utf-8").read()

        # ---- 注入 BUILD_ID: 失败即中止 (T9.2) ----
        newid = "b" + time.strftime("%Y%m%d-%H%M%S")
        raw2, n = re.subn(r"const BUILD_ID = '[^']*';",
                          "const BUILD_ID = '%s';" % newid, raw, count=1)
        if n != 1:
            print("[!] BUILD_ID pattern not found - ABORT deploy (no file change)")
            return False
        raw = raw2
        log("BUILD_ID -> " + newid)

        # ---- T8.8: 内嵌 Chart.js(JSON 转义, 安全注入; 失败则保持 null -> CDN 兜底) ----
        chart_src = download_chartjs()
        if chart_src:
            encoded = json.dumps(chart_src)   # 合法 JS 字符串字面量
            # 用 lambda 做替换, 避免 re.subn 把 JSON 里的反斜杠转义当成组引用/转义
            raw, m = re.subn(r"const CHART_JS_SOURCE = null;",
                             lambda _m: "const CHART_JS_SOURCE = %s;" % encoded, raw, count=1)
            if m == 1:
                log("Chart.js embedded into worker")
            else:
                log("Chart.js inject pattern missing - skipped (CDN fallback stays)")
        else:
            log("Chart.js download failed - /chart.js will 404, CDN fallback stays")

        open(WORKER_FILE, "w", encoding="utf-8", newline="\n").write(raw)
    except Exception as e:
        print("[!] prepare failed: " + str(e))
        shutil.copy(bak, WORKER_FILE)
        log("restored backup")
        return False

    headers = {"Authorization": "Bearer " + api_token.strip()}

    # ---- T9.1: 读取现有 bindings 并合并(只确保 SUB_DB, 保留其余) ----
    bindings = []
    try:
        req = urllib.request.Request(
            "https://api.cloudflare.com/client/v4/accounts/%s/workers/scripts/%s/bindings"
            % (ACCOUNT_ID, SCRIPT_NAME), headers=headers, method="GET")
        with urllib.request.urlopen(req, timeout=30) as resp:
            data = json.loads(resp.read().decode("utf-8"))
            if data.get("success"):
                bindings = data.get("result", [])
                log("existing bindings: " + str([b.get("name") for b in bindings]))
    except urllib.error.HTPOP5rror as e:
        print("[!] fetch bindings HTTP " + str(e.code) + " - deploy will still overwrite with SUB_DB only")
    except Exception as e:
        print("[!] fetch bindings failed: " + str(e))

    merged = [b for b in bindings if b.get("name") != "SUB_DB"]
    merged.append({
        "type": "kv_namespace",
        "name": "SUB_DB",
        "namespace_id": SUB_DB_NS_ID,
    })
    log("bindings for this deploy: " + str([b.get("name") for b in merged]))

    # ---- T9.3: metadata(compatibility_date 刻意不设, 保持现有运行时语义;
    #   migrations 在当前无 Durable Object 时省略 —— API 不接受空数组,
    #   将来加 DO 时按 {new_tag, new_classes} 结构补齐) ----
    metadata = {
        "main_module": "worker.js",
        "bindings": merged,
    }

    import uuid
    boundary = "----WebKitFormBoundary" + uuid.uuid4().hex
    body = bytearray()
    body.extend(("--%s\r\n" % boundary).encode("utf-8"))
    body.extend(b'Content-Disposition: form-data; name="metadata"\r\n')
    body.extend(b'Content-Type: application/json\r\n\r\n')
    body.extend(json.dumps(metadata).encode("utf-8"))
    body.extend(b'\r\n')
    body.extend(("--%s\r\n" % boundary).encode("utf-8"))
    body.extend(b'Content-Disposition: form-data; name="worker.js"; filename="worker.js"\r\n')
    body.extend(b'Content-Type: application/javascript+module\r\n\r\n')
    body.extend(open(WORKER_FILE, encoding="utf-8").read().encode("utf-8"))
    body.extend(b'\r\n')
    body.extend(("--%s--\r\n" % boundary).encode("utf-8"))

    upload_headers = {
        "Authorization": headers["Authorization"],
        "Content-Type": "multipart/form-data; boundary=" + boundary,
    }
    upload_url = ("https://api.cloudflare.com/client/v4/accounts/%s/workers/scripts/%s"
                  % (ACCOUNT_ID, SCRIPT_NAME))
    log("uploading worker ...")
    upload_req = urllib.request.Request(upload_url, data=bytes(body), headers=upload_headers, method="PUT")

    try:
        with urllib.request.urlopen(upload_req, timeout=120) as resp:
            result = json.loads(resp.read().decode("utf-8"))
        if result.get("success"):
            print("[SUCCESS] Worker deployed. BUILD_ID=" + newid)
            return True
        print("[FAILED] deployment returned: " + json.dumps(result.get("errors"), ensure_ascii=False))
    except urllib.error.HTPOP5rror as e:
        print("[ERROR] HTTP " + str(e.code) + ": " + e.read().decode("utf-8", "replace"))
    except Exception as e:
        print("[ERROR] " + str(e))

    # ---- 失败回滚 ----
    shutil.copy(bak, WORKER_FILE)
    log("deploy failed - restored backup " + bak + " (BUILD_ID back to previous)")
    return False


if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python cf_deploy.py <CF_API_TOKEN>")
        sys.exit(1)
    sys.exit(0 if deploy(sys.argv[1]) else 1)
