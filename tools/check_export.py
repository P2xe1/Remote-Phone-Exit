# -*- coding: utf-8 -*-
"""导出产物自检（CI 门禁之一）。

它守护的是一类【曾经真实发生过】的缺陷：导出的 Worker 看起来完整、
`node --check` 也能过，但部署出去根本跑不通。两种典型：
  1) 顶层 `const X = _cfg('X', 默认值)` 在模块加载期求值，那时还没有 env，
     于是永远拿默认值 —— 部署"成功"，但口令是 CHANGE_ME、域名指向 example.com。
  2) Worker 自己在渲染期插值的 ${KEY} 被部署脚本误判成"漏填占位符"，
     于是对外部署被自己的检查拦住，一步也走不动。

用法: python tools/check_export.py [仓库根目录]
"""
import os
import re
import sys

ROOT = sys.argv[1] if len(sys.argv) > 1 else '.'
WORKER = os.path.join(ROOT, 'edge', 'worker_deploy.js')
STEP2 = os.path.join(ROOT, 'deploy', 'step2_deploy_edge.py')

fails = []
warns = []


def fail(m):
    fails.append(m)


def warn(m):
    warns.append(m)


def read(p):
    with open(p, encoding='utf-8', errors='replace') as f:
        return f.read()


def build_time_keys():
    """从 step2 的 BUILD_SUBS 里读出"构建期会被文本替换"的键。"""
    if not os.path.exists(STEP2):
        return set()
    return set(re.findall(r"'([A-Z_][A-Z0-9_]*)'\s*:\s*cfg\(", read(STEP2)))


def check_worker():
    if not os.path.exists(WORKER):
        fail('找不到 %s' % WORKER)
        return
    src = read(WORKER)
    if 'function _applyCfg(env)' not in src:
        fail('Worker 里没有 _applyCfg(env) —— 顶层 _cfg 常量将永远取默认值')
    elif re.search(r'^\s*_applyCfg\(env\);', src, re.M) is None:
        fail('_applyCfg(env) 定义了但没有在请求入口调用')
    consts = re.findall(r"^let ([A-Z_][A-Z0-9_]*) = (_cfg\([^\n]*?\));", src, re.M)
    if not consts:
        warn('没发现顶层 `let X = _cfg(...)` 常量；若改了写法请同步本检查')
    body = ''
    m = re.search(r'function _applyCfg\(env\) \{(.*?)\n\}', src, re.S)
    if m:
        body = m.group(1)
    for name, _expr in consts:
        if not re.search(r'^\s*%s\s*=' % re.escape(name), body, re.M):
            fail('_applyCfg 里没有重新赋值 %s —— 该配置会停留在默认值' % name)
    defined = set(re.findall(r'(?:const|let|var)\s+([A-Z_][A-Z0-9_]*)\s*=', src))
    build_keys = build_time_keys()
    ph = sorted(set(re.findall(r'\$\{([A-Z_][A-Z0-9_]*)\}', src)))
    unknown = []
    for k in ph:
        if k.startswith('NODE_'):
            continue
        # 只被 \{...} 转义形式引用的（例如注释里的示例）不算问题
        if not re.search(r'(?<!\\)\$\{%s\}' % re.escape(k), src):
            continue
        if k in defined or k in build_keys:
            continue
        unknown.append(k)
    if unknown:
        fail('这些 ${KEY} 既不是 NODE_* 构建期占位符、也不在 step2 的 BUILD_SUBS 里、'
             'Worker 里还没有同名定义：%s'
             % ', '.join(unknown[:10]))
    if not re.search(r'\$\{NODE_\d+_IP\}', src):
        warn('Worker 里没有 ${NODE_nn_IP} 占位符 —— 节点清单可能已被写死')


def check_step2():
    if not os.path.exists(STEP2):
        warn('找不到 %s，跳过部署脚本检查' % STEP2)
        return
    src = read(STEP2)
    if 'runtime_defined' not in src:
        fail('step2 的占位符检查没有排除"渲染期插值"的键 —— 会把合法占位符当漏填')
    if "'--dry-run' in sys.argv" not in src:
        warn('step2 没有 --dry-run 干跑模式（不影响正确性，但不利于排查）')


def check_env_example():
    env = os.path.join(ROOT, '.env.example')
    if not os.path.exists(env):
        warn('找不到 .env.example')
        return
    keys = set(re.findall(r'^([A-Z_][A-Z0-9_]*)\s*=', read(env), re.M))
    # 【2026-10-05】补上部署脚本真正会读的键 —— 少一个就是"设备看着在跑、
    #   上报静默失效"（这轮修的就是这一类）。
    need = set(['CF_API_TOKEN', 'CF_ACCOUNT_ID', 'CF_KV_NAMESPACE_ID', 'CF_SCRIPT_NAME',
                'WORKER_HOST', 'TUNNEL_HOST', 'TUNNEL_ID', 'TUNNEL_CREDS_FILE',
                'ADMIN_PASSWORD', 'SYNC_SECRET', 'VLESS_UUID',
                'RELAY_TARGET_IP', 'PHONE_SERIAL',
                'CF_ANCHOR_1', 'CF_ANCHOR_2', 'CF_ANCHOR_3',
                'CF_ANCHOR_4', 'CF_ANCHOR_5', 'CF_ANCHOR_6'])
    miss = sorted(need - keys)
    if miss:
        fail('.env.example 缺少这些键：%s' % ', '.join(miss))


def main():
    check_worker()
    check_step2()
    check_env_example()
    for w in warns:
        print('  [!!] %s' % w)
    if fails:
        print()
        for f in fails:
            print('  [XX] %s' % f)
        print('\n导出产物自检未通过：%d 项' % len(fails))
        return 1
    print('  [OK] 导出产物自检通过（运行期配置注入 / 占位符归类 / .env 键齐全）')
    return 0


if __name__ == '__main__':
    sys.exit(main())

