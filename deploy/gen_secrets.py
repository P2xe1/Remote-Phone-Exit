# -*- coding: utf-8 -*-
"""第 0 步 · 自动生成运行时密钥（写回 .env）。

解决什么：
    .env.example 里的 ADMIN_PASSWORD / SYNC_SECRET / VLESS_UUID 是占位值
    （change_me_to_a_long_random_string / 全零 UUID）。人手填容易出三种错：
      · 直接沿用了示例值  -> 管理口令等于公开在仓库里的字符串；
      · 填得太短或太规律  -> 口令可被猜；
      · UUID 格式写错      -> 代理核心拒绝启动。

本脚本只做一件事：把【仍然是占位值】的那几项换成强随机值，其它一律不碰。

用法:
    python deploy/gen_secrets.py            # 生成并写回 .env
    python deploy/gen_secrets.py --show     # 只看状态，不修改

安全约定：
    · 已经有真实值（非占位）的项【绝不覆盖】，避免把正在用的密钥换掉；
    · 写回时保留注释与顺序，只替换等号右边；
    · 生成的管理口令会打印一次，便于登录监控台（它也写在 .env 里）。
"""
import os
import re
import secrets
import sys
import uuid

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)
ENV = os.path.join(ROOT, '.env')

PLACEHOLDER_VALUES = {
    'ADMIN_PASSWORD': 'change_me_to_a_long_random_string',
    'SYNC_SECRET': 'change_me_to_another_long_random_string',
    'VLESS_UUID': '00000000-0000-0000-0000-000000000000',
}

ALPHABET = 'abcdefghijkmnopqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789'


def log(m):
    print('  ' + m)


def ok(m):
    print('  [OK] ' + m)


def warn(m):
    print('  [!!] ' + m)


def bad(m):
    print('  [XX] ' + m)


def gen_password(n=28):
    return ''.join(secrets.choice(ALPHABET) for _ in range(n))


def is_placeholder(key, value):
    if not value:
        return True
    if value == PLACEHOLDER_VALUES.get(key, ''):
        return True
    if value.startswith('your_') or value.startswith('change_me'):
        return True
    if key == 'VLESS_UUID' and set(value) <= set('0-'):
        return True
    return False


def main():
    show_only = '--show' in sys.argv[1:]

    print('=' * 62)
    print(' 第 0 步 · 运行时密钥')
    print('=' * 62)
    if not os.path.exists(ENV):
        bad('找不到 %s —— 请先执行：cp .env.example .env' % os.path.relpath(ENV, ROOT))
        return 1

    with open(ENV, encoding='utf-8') as f:
        text = f.read()

    new_values = {}
    changed = []
    for key in PLACEHOLDER_VALUES:
        m = re.search(r'^%s\s*=\s*(.*)$' % re.escape(key), text, re.M)
        if not m:
            warn('%s 不在 .env 里（跳过）' % key)
            continue
        cur = m.group(1).strip()
        if not is_placeholder(key, cur):
            ok('%s 已有真实值（长度 %d）—— 保持不动' % (key, len(cur)))
            continue
        new_values[key] = str(uuid.uuid4()) if key == 'VLESS_UUID' else gen_password()
        changed.append(key)
        if show_only:
            warn('%s 仍是占位值（--show 模式，不修改）' % key)

    if show_only:
        if not changed:
            ok('三项都已是真实值，无需处理')
        return 0

    if not changed:
        ok('三项都已是真实值，无需处理')
        return 0

    for key, val in new_values.items():
        text = re.sub(r'^%s\s*=.*$' % re.escape(key),
                      '%s=%s' % (key, val), text, count=1, flags=re.M)
    tmp = ENV + '.tmp'
    with open(tmp, 'w', encoding='utf-8', newline='\n') as f:
        f.write(text)
    os.replace(tmp, ENV)

    ok('已写入 %s：%s' % (os.path.relpath(ENV, ROOT), ', '.join(changed)))
    print()
    if 'ADMIN_PASSWORD' in new_values:
        print('  监控台口令（请记下，只在这里显示这一次）：')
        print('    %s' % new_values['ADMIN_PASSWORD'])
        print('  登录地址：https://<你的 WORKER_HOST>/admin?pwd=<上面的口令>')
        print()
    print('  提示：这三项也可以手动改。改完必须重新部署边缘，并同步更新节点侧配置。')
    return 0


if __name__ == '__main__':
    sys.exit(main())

