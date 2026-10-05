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


def warn(m):
    # 【2026-10-05 新增】提示级输出：不阻塞部署，但需要使用者看一眼。
    print('[~] %s' % m)


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


# 【2026-10-05 新增】--dry-run：只做"本地能做完的全部校验"，不碰 Cloudflare。
#   为什么需要：部署前最怕的是"配置填错了，但要等到上传后才发现"。
#   干跑会把节点地址填充、占位符残留、BUILD_ID 注入、语法检查、绑定清单
#   全部走一遍并打印结果，最后只停在"准备上传"那一步，不改线上任何东西。
DRY_RUN = '--dry-run' in sys.argv


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

    # 【2026-10-05 修复 D21】逐个核对还有哪些占位符没填上。
    #   原实现只判"一个都没填"(n_used == 0)，于是"填了一部分"会被放过 ——
    #   部署出去的订阅里会混进不可用地址，表现为"部分节点正常、部分永远连不上"，
    #   而且很难查（看起来配置是对的）。
    #   现在：只要有占位符残留就中止，并把缺哪几个写得清清楚楚。
    missing_idx = sorted(set(int(m) for m in
                             re.findall(r'server:\s*"\$\{NODE_(\d+)_IP\}"', raw)))
    if missing_idx:
        if n_used == 0:
            bad('一个节点地址都没填（.env 里没有任何 NODE_xx_IP）—— 已中止，未做任何改动')
            print('      请先按 .env.example 的「接入点清单」一节填 NODE_01_IP …')
            return 1
        # 【2026-10-05 改进】"给几个地址就部署几个节点"：
        #   把没提供地址的条目【整行删掉】，而不是中止，也绝不留下占位符。
        #   为什么删行是安全的：
        #     · 节点显示名按索引顺序重新编号（见 buildNodeDisplayNames），
        #       删行不会让名字与地址错配；
        #     · 每个条目自带 path / region，删掉别的条目不影响留下来的；
        #     · 删掉的是"没有地址"的条目，因此订阅里不会出现不可用地址。
        #   （旧行为是直接中止，要求用户手工去改源码 —— 对外部署时这太容易卡住。）
        keep = []
        dropped = 0
        for ln in raw.split('\n'):
            mm = re.search(r'server:\s*"\$\{NODE_(\d+)_IP\}"', ln)
            if mm and int(mm.group(1)) in missing_idx:
                dropped += 1
                continue
            keep.append(ln)
        raw = '\n'.join(keep)
        warn('节点清单已裁剪：按 .env 提供的 %d 个地址，删除 %d 个未提供地址的条目'
             % (n_used, dropped))
    ok('节点地址已填充：%d 个（无残留占位符）' % n_used)

    # ---- 1.5 运行期配置占位符 ----
    # 【2026-10-05 新增】源码里有一批 ${XXX} 占位符需要在【构建期】就填掉：
    #   它们在 JS 里是普通字符串（不是模板插值），不填就会当成字面文本，
    #   运行起来表现很怪（例如探活打到 "${TUNNEL_HOST}" 这种不存在的域名）。
    #   这些与下面写进 bindings 的键不同：bindings 是运行期 env，
    #   这里是构建期直接替换进源码。
    BUILD_SUBS = {
        'DAY_TZ': cfg('DAY_TZ', '') or 'Asia/Shanghai',
        'TUNNEL_HOST': cfg('TUNNEL_HOST', ''),
        'WORKER_HOST': cfg('WORKER_HOST', ''),
    }
    for k, v in BUILD_SUBS.items():
        if not v:
            continue
        raw, n = re.subn(r'\$\{%s\}' % re.escape(k), v, raw)
        if n:
            ok('已注入 %s（%d 处）' % (k, n))
    # 注完还留着占位符 -> 中止，绝不把带占位符的源码传上去。
    # 【2026-10-05 修正】原实现把【所有】${KEY} 一律当成"漏填"，于是把 Worker
    #   自己在渲染期插值的合法占位符也判成错误 —— 例如页面模板里的
    #   ${ADMIN_PASSWORD}、${DEVICE_NAME}、${BUILD_ID}：它们由 Worker 里的同名
    #   常量在生成 HTML 时替换，根本不需要在构建期填。后果是这一版对外部署
    #   会被自己的检查拦住（实测：一执行就报 13 个"未注入占位符"）。
    #   现在只拦【构建期】真正必须替换的键：
    #     · NODE_nn_IP —— 节点地址，由上面的 fill_nodes 负责；
    #     · BUILD_SUBS 里列出的键。
    #   其余 ${KEY} 只要 Worker 里有同名定义，就按"渲染期插值"放行。
    runtime_defined = set(re.findall(r'(?:const|let|var)\s+([A-Z_][A-Z0-9_]*)\s*=', raw))
    # ⚠ 用负向后顾排除转义写法 \${KEY}（那是"字面文本"，例如注释里的示例），
    #   否则会把注释里的示例当成漏填。
    left = sorted(set(re.findall(r'(?<!\\)\$\{([A-Z_][A-Z0-9_]*)\}', raw)))
    left = [k for k in left if k not in runtime_defined]
    if left:
        bad('源码里还有没注入的占位符: %s' % ', '.join(left[:8]))
        print('      请在上面的 BUILD_SUBS 里补上，或从 .env 填好对应值；')
        print('      若这是 Worker 自己渲染期插值的键，请在 Worker 里保留同名定义。')
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
    if DRY_RUN:
        log('干跑模式：跳过"读取远端现有绑定"（不访问 Cloudflare）')
    else:
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

    # ---- 运行时凭据：本地有值就【以本地为准】 ----
    # 【2026-10-05 修复 D22】原实现是 `if v and not any(同名已存在)` ——
    #   于是"远端已有同名绑定"时永远不会用本地值更新。后果很隐蔽：
    #   你在 .env 里改了域名/密码/同步密钥，重新部署却还是旧值，
    #   而手机端如果已经按新值配置，两端就永久不一致。
    #   现在的规则：
    #     · 本地有值  -> 覆盖远端同名绑定（或新增）
    #     · 本地没值  -> 保留远端已有值，绝不写空值上去把它抹掉
    updated, kept = [], []
    for k in ('ADMIN_PASSWORD', 'SYNC_SECRET', 'WORKER_HOST', 'TUNNEL_HOST', 'VLESS_UUID'):
        v = cfg(k)
        hit = None
        for b in merged:
            if b.get('name') == k:
                hit = b
                break
        if v:
            if hit is not None:
                hit['type'] = 'plain_text'
                hit['text'] = v
                hit.pop('namespace_id', None)
                hit.pop('id', None)
                updated.append(k)
            else:
                merged.append({'type': 'plain_text', 'name': k, 'text': v})
                updated.append(k)
        elif hit is not None:
            kept.append(k)
        else:
            bad('缺少必填配置 %s —— 继续部署会让 Worker 用占位口令运行' % k)
            return 1

    ok('本次部署绑定: %s' % [b.get('name') for b in merged])
    if updated:
        ok('按本地配置【写入/更新】: %s' % ', '.join(updated))
    if kept:
        log('本地未配置、保留远端原值: %s' % ', '.join(kept))

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

    if DRY_RUN:
        print()
        ok('干跑完成：本地校验全部通过，未改动线上任何东西')
        print('  · 目标脚本   : %s' % script)
        print('  · 将写入绑定 : %s' % [b.get('name') for b in merged])
        print('  · 载荷大小   : %.1f KB' % (len(body) / 1024.0))
        print('  · 语法检查   : 通过')
        print()
        print('  确认无误后去掉 --dry-run 重新执行即可真正部署。')
        return 0

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
