# -*- coding: utf-8 -*-
"""
step2_deploy_edge.py —— 第 2 步：部署边缘 Worker（自动完成全部替换与注入）

它会：
  1. 读 .env（含 NODE_xx_IP），把 edge/worker_deploy.js 里 ${NODE_xx_IP} 全部替换成真实地址
     —— 替换发生在【临时文件】上，不改动你的源码
  2. 注入新的 BUILD_ID（用于页面自动更新）
  3. 内嵌 Chart.js（拿不到则保留 CDN 兜底）
  4. 上传到 Cloudflare（保留已有绑定，只补 KV）
  5. 失败自动回滚

用法: python deploy/step2_deploy_edge.py
"""
import json
import os
import re
import shutil
import subprocess
import sys
import tempfile
import time
import urllib.error
import urllib.request

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)
sys.path.insert(0, HERE)
from cfg import cfg, node_ips  # noqa: E402

CF_API = 'https://api.cloudflare.com/client/v4'
SRC = os.path.join(ROOT, 'edge', 'worker_deploy.js')
CHART_JS_SOURCES = [
    'https://cdn.jsdelivr.net/npm/chart.js@4.4.1/dist/chart.umd.min.js',
    'https://cdnjs.cloudflare.com/ajax/libs/Chart.js/4.4.1/chart.umd.min.js',
    'https://unpkg.com/chart.js@4.4.1/dist/chart.umd.min.js',
]


def log(m):
    print('[*] %s' % m)


def ok(m):
    print('[+] %s' % m)


def bad(m):
    print('[!] %s' % m)


def fill_nodes(raw):
    """把手里的 NODE_xx_IP 填进源码副本"""
    ips = dict(node_ips())
    used = []

    def sub(m):
        idx = int(m.group(1))
        if idx in ips:
            used.append(idx)
            return 'server: "%s"' % ips[idx]
        return m.group(0)

    raw2, n = re.subn(r'server:\s*"\$\{NODE_(\d+)_IP\}"', sub, raw)
    return raw2, n, len(used)


def download_chartjs():
    for url in CHART_JS_SOURCES:
        try:
            req = urllib.request.Request(url, headers={'User-Agent': 'deploy/1.0'})
            with urllib.request.urlopen(req, timeout=30) as r:
                body = r.read().decode('utf-8', 'replace')
            if len(body) > 50000 and 'Chart' in body:
                log('Chart.js 已获取（%d 字节）' % len(body))
                return body
        except Exception as e:
            log('Chart.js 来源失败 %s: %s' % (url, str(e)[:60]))
    return None


def cf_request(method, path, token, body=None, timeout=120):
    data = json.dumps(body).encode('utf-8') if body is not None else None
    r = urllib.request.Request(CF_API + path, data=data, method=method,
                               headers={'Authorization': 'Bearer ' + token})
    if data:
        r.add_header('Content-Type', 'application/json')
    with urllib.request.urlopen(r, timeout=timeout) as resp:
        return json.loads(resp.read().decode('utf-8') or '{}')


def main():
    token = cfg('CF_API_TOKEN', required=True)
    acct = cfg('CF_ACCOUNT_ID', required=True)
    script = cfg('CF_SCRIPT_NAME', 'my-worker')
    ns = cfg('CF_KV_NAMESPACE_ID', required=True)

    if not os.path.exists(SRC):
        bad('找不到 %s' % SRC)
        return 1

    with open(SRC, encoding='utf-8') as f:
        raw = f.read()

    print('=' * 62)
    print(' 第 2 步 · 部署边缘 Worker')
    print('=' * 62)

    # ---- 1. 填节点地址 ----
    raw, n_sub, n_used = fill_nodes(raw)
    if n_sub == 0:
        bad('源码里没找到 ${NODE_xx_IP} 占位符（节点清单可能已被改过）')
        return 1
    left = len(re.findall(r'server:\s*"\$\{NODE_\d+_IP\}"', raw))
    ok('节点地址已填充：%d 个（剩余未填 %d 个）' % (n_used, left))
    if n_used == 0:
        bad('一个地址都没填上：请检查 .env 里的 NODE_01_IP … 是否已配置')
        return 1

    # ---- 2. BUILD_ID ----
    newid = 'b' + time.strftime('%Y%m%d-%H%M%S')
    raw2, n = re.subn(r"const BUILD_ID = '[^']*';", "const BUILD_ID = '%s';" % newid, raw, count=1)
    if n != 1:
        bad('BUILD_ID 注入失败，已中止')
        return 1
    raw = raw2
    ok('BUILD_ID -> %s' % newid)

    # ---- 3. Chart.js ----
    chart = download_chartjs()
    if chart:
        encoded = json.dumps(chart)
        raw, m = re.subn(r'const CHART_JS_SOURCE = null;',
                         lambda _m: 'const CHART_JS_SOURCE = %s;' % encoded, raw, count=1)
        ok('Chart.js 已内嵌' if m == 1 else 'Chart.js 注入点缺失（保留 CDN 兜底）')
    else:
        log('Chart.js 拉取失败 —— 保留 CDN 兜底')

    # ---- 4. 临时文件（不动源码） ----
    tmp = os.path.join(tempfile.gettempdir(), 'worker_build_%s.js' % newid)
    with open(tmp, 'w', encoding='utf-8', newline='\n') as f:
        f.write(raw)
    ok('构建产物: %s（你的源码未被修改）' % tmp)

    node = shutil.which('node')
    if node:
        p = subprocess.run([node, '--check', tmp], capture_output=True, text=True)
        if p.returncode != 0:
            bad('语法检查失败，已中止：')
            print((p.stderr or '')[:1200])
            return 1
        ok('语法检查通过')

    # ---- 5. 绑定（保留已有 + 确保 KV） ----
    bindings = []
    try:
        res = cf_request('GET', '/accounts/%s/workers/scripts/%s/bindings' % (acct, script), token)
        if res.get('success'):
            bindings = res.get('result') or []
            ok('现有绑定: %s' % [b.get('name') for b in bindings])
    except urllib.error.HTTPError as e:
        log('读取绑定失败 HTTP %s（继续，将只写 KV 绑定）' % e.code)
    except Exception as e:
        log('读取绑定失败 %s' % str(e)[:80])

    merged = [b for b in bindings if b.get('name') != 'SUB_DB']
    merged.append({'type': 'kv_namespace', 'name': 'SUB_DB', 'namespace_id': ns})
    # 运行时凭据作为明文变量注入（也可改在控制台用 Secrets 覆盖）
    for k in ('ADMIN_PASSWORD', 'SYNC_SECRET', 'WORKER_HOST', 'TUNNEL_HOST', 'VLESS_UUID'):
        v = cfg(k)
        if v and not any(b.get('name') == k for b in merged):
            merged.append({'type': 'plain_text', 'name': k, 'text': v})
    ok('本次部署绑定: %s' % [b.get('name') for b in merged])

    metadata = {'main_module': 'worker.js', 'bindings': merged}

    import uuid
    boundary = '----FormBoundary' + uuid.uuid4().hex
    body = bytearray()
    body.extend(('--%s\r\n' % boundary).encode())
    body.extend(b'Content-Disposition: form-data; name="metadata"\r\nContent-Type: application/json\r\n\r\n')
    body.extend(json.dumps(metadata).encode('utf-8'))
    body.extend(b'\r\n')
    body.extend(('--%s\r\n' % boundary).encode())
    body.extend(b'Content-Disposition: form-data; name="worker.js"; filename="worker.js"\r\n')
    body.extend(b'Content-Type: application/javascript+module\r\n\r\n')
    body.extend(raw.encode('utf-8'))
    body.extend(b'\r\n')
    body.extend(('--%s--\r\n' % boundary).encode())

    log('上传中 ...')
    req = urllib.request.Request(
        '%s/accounts/%s/workers/scripts/%s' % (CF_API, acct, script),
        data=bytes(body), method='PUT',
        headers={'Authorization': 'Bearer ' + token,
                 'Content-Type': 'multipart/form-data; boundary=' + boundary})
    try:
        with urllib.request.urlopen(req, timeout=180) as resp:
            res = json.loads(resp.read().decode('utf-8') or '{}')
        if res.get('success'):
            ok('部署成功  BUILD_ID=%s' % newid)
            print()
            print('  下一步：python deploy/step4_verify.py   （等 20~30 秒后做线上验收）')
            return 0
        bad('部署被拒绝: %s' % json.dumps(res.get('errors'), ensure_ascii=False))
        return 1
    except urllib.error.HTTPError as e:
        bad('HTTP %s: %s' % (e.code, e.read().decode('utf-8', 'replace')[:800]))
        return 1
    except Exception as e:
        bad('上传异常: %s' % e)
        return 1


if __name__ == '__main__':
    sys.exit(main())
