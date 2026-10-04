# -*- coding: utf-8 -*-
"""
step1_check.py —— 第 1 步：环境体检（不修改任何东西）

检查项：
  1. .env 是否存在、必填项是否齐
  2. 节点地址是否还是示例值（RFC 5737 文档段）
  3. Cloudflare 令牌/账号/KV 命名空间是否真的可用
  4. 域名是否已指向 Cloudflare
  5. 本机工具（node）是否可用
  6. 节点设备（adb）是否在线
退出码 0 = 全绿可以部署；1 = 有阻塞项
"""
import io
import json
import os
import re
import shutil
import subprocess
import sys
import urllib.error
import urllib.request

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from cfg import cfg, env_file, node_ips  # noqa: E402

API = 'https://api.github.com'  # 占位，避免误用
CF_API = 'https://api.cloudflare.com/client/v4'

DOC_IPS = ('198.51.100.', '203.0.113.', '192.0.2.')


def ok(m):
    print('  \033[32m[OK]\033[0m %s' % m)


def warn(m):
    print('  \033[33m[!!]\033[0m %s' % m)


def bad(m):
    print('  \033[31m[XX]\033[0m %s' % m)


def cf_get(path, token):
    r = urllib.request.Request(CF_API + path,
                               headers={'Authorization': 'Bearer ' + token,
                                        'Content-Type': 'application/json'})
    try:
        with urllib.request.urlopen(r, timeout=30) as resp:
            return resp.status, json.loads(resp.read().decode('utf-8') or '{}')
    except urllib.error.HTTPError as e:
        try:
            return e.code, json.loads(e.read().decode('utf-8') or '{}')
        except Exception:
            return e.code, {}
    except Exception as e:
        return 0, {'err': str(e)}


def main():
    blockers = []
    print('=' * 62)
    print(' 第 1 步 · 环境体检')
    print('=' * 62)

    # ---- 1. .env ----
    print('\n[1/6] 配置文件')
    ef = env_file()
    if not ef:
        bad('没找到 .env（请复制 .env.example 为 .env 并填写）')
        blockers.append('.env 缺失')
    else:
        ok('.env 位于 %s' % ef)

    required = ['CF_API_TOKEN', 'CF_ACCOUNT_ID', 'CF_SCRIPT_NAME', 'CF_KV_NAMESPACE_ID',
                'WORKER_HOST', 'TUNNEL_HOST', 'ADMIN_PASSWORD', 'SYNC_SECRET', 'VLESS_UUID']
    missing = [k for k in required if not cfg(k)]
    if missing:
        bad('缺少必填项: %s' % ', '.join(missing))
        blockers.append('配置缺项')
    else:
        ok('必填项齐全（%d 项）' % len(required))
    for k in ('ADMIN_PASSWORD', 'SYNC_SECRET'):
        v = cfg(k) or ''
        if v and len(v) < 12:
            warn('%s 偏短（%d 字符），建议 ≥16 位随机串' % (k, len(v)))

    # ---- 2. 节点地址 ----
    print('\n[2/6] 接入点清单')
    ips = node_ips()
    if not ips:
        bad('没有 NODE_xx_IP（节点清单为空，客户端会没有可用节点）')
        blockers.append('节点清单为空')
    else:
        doc = [x for _, x in ips if x.startswith(DOC_IPS)]
        if doc:
            warn('有 %d 个地址仍是示例值（%s），需要换成你自己的实测地址' % (len(doc), doc[0]))
        else:
            ok('%d 个接入点地址已填写' % len(ips))

    # ---- 3. Cloudflare 令牌 ----
    print('\n[3/6] Cloudflare 令牌与资源')
    token = cfg('CF_API_TOKEN')
    if token:
        st, res = cf_get('/user/tokens/verify', token)
        if st == 200 and res.get('success'):
            ok('令牌有效（状态 %s）' % res.get('result', {}).get('status', '?'))
        else:
            bad('令牌校验失败（HTTP %s）：%s' % (st, (res.get('errors') or [{}])[0].get('message', '')))
            blockers.append('CF 令牌无效')

        acct = cfg('CF_ACCOUNT_ID')
        if acct:
            st, res = cf_get('/accounts/%s/workers/scripts' % acct, token)
            if st == 200:
                names = [s.get('id') for s in (res.get('result') or [])]
                ok('账号可访问，已有 Worker: %s' % (', '.join(names) if names else '（暂无）'))
                if cfg('CF_SCRIPT_NAME') in names:
                    ok('脚本 %s 已存在（本次为更新部署）' % cfg('CF_SCRIPT_NAME'))
                else:
                    ok('脚本 %s 尚未创建（本次为首次部署）' % cfg('CF_SCRIPT_NAME'))
            else:
                bad('账号 %s 不可访问（HTTP %s），检查 CF_ACCOUNT_ID 与令牌权限' % (acct, st))
                blockers.append('CF 账号不可访问')

        ns = cfg('CF_KV_NAMESPACE_ID')
        if ns and acct:
            st, res = cf_get('/accounts/%s/storage/kv/namespaces' % acct, token)
            if st == 200:
                ids = [n.get('id') for n in (res.get('result') or [])]
                if ns in ids:
                    ok('KV 命名空间存在')
                else:
                    bad('KV 命名空间 %s 不在账号下' % ns)
                    blockers.append('KV 命名空间不匹配')
            else:
                warn('无法列出 KV 命名空间（HTTP %s）' % st)

    # ---- 4. 域名 ----
    print('\n[4/6] 域名解析')
    import socket
    for key, label in (('WORKER_HOST', '入口域名（订阅/大屏）'), ('TUNNEL_HOST', '隧道域名')):
        h = cfg(key)
        if not h:
            continue
        try:
            ip = socket.gethostbyname(h)
            ok('%s %s -> %s' % (label, h, ip))
        except Exception:
            bad('%s %s 解析失败' % (label, h))
            blockers.append('%s 无法解析' % key)

    # ---- 5. node ----
    print('\n[5/6] 本机工具')
    node = shutil.which('node') or ''
    if node:
        ok('node: %s' % node)
    else:
        warn('未找到 node（部署前语法检查会跳过，建议安装 Node.js）')

    # ---- 6. adb ----
    print('\n[6/6] 节点设备（可选，只有要部署手机端时才需要）')
    adb = shutil.which('adb')
    if not adb:
        for c in (os.path.expanduser(r'~\AppData\Local\Android\platform-tools\adb.exe'),
                  r'C:\platform-tools\adb.exe'):
            if os.path.exists(c):
                adb = c
                break
    if adb:
        p = subprocess.run([adb, 'devices'], capture_output=True, text=True, timeout=30)
        lines = [l for l in p.stdout.split('\n')[1:] if l.strip()]
        online = [l for l in lines if '\tdevice' in l]
        if online:
            ok('设备已连接: %s' % online[0].split('\t')[0])
        else:
            warn('adb 可用，但没有设备（手机脚本部署会跳过）')
    else:
        warn('未找到 adb（不影响边缘部署）')

    # ---- 汇总 ----
    print()
    print('=' * 62)
    if blockers:
        print(' 结果：有 %d 项阻塞，暂不能部署' % len(blockers))
        for b in blockers:
            print('   · %s' % b)
        print('=' * 62)
        return 1
    print(' 结果：全部通过 ✅  可以执行第 2 步（部署边缘）')
    print('=' * 62)
    return 0


if __name__ == '__main__':
    sys.exit(main())
