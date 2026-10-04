# -*- coding: utf-8 -*-
"""
step3_deploy_node.py —— 第 3 步：把 8 个脚本 + 配置推到节点设备并重启

它会：
  1. 找到 adb 与在线设备（可用 PHONE_SERIAL 指定）
  2. 把 phone/scripts/*.sh 推到 /data/local/tmp/（自动转 LF 行尾）
  3. 按 phone/config/*.example 生成真实配置文件（把 WORKER_HOST / SYNC_SECRET 等填进去）
  4. 在设备上执行 run_daemon.sh 完整重启
  5. 打印设备上进程与数据文件状态

用法:
    python deploy/step3_deploy_node.py
    python deploy/step3_deploy_node.py --dry     # 只看要做啥，不真的推
"""
import io
import os
import shutil
import subprocess
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)
sys.path.insert(0, HERE)
from cfg import cfg  # noqa: E402

REMOTE = '/data/local/tmp'


def log(m):
    print('[*] %s' % m)


def ok(m):
    print('[+] %s' % m)


def bad(m):
    print('[!] %s' % m)


def find_adb():
    a = shutil.which('adb')
    if a:
        return a
    for c in (os.path.expanduser(r'~\AppData\Local\Android\platform-tools\adb.exe'),
              r'C:\platform-tools\adb.exe',
              os.path.expanduser(r'~\platform-tools\adb.exe')):
        if os.path.exists(c):
            return c
    return None


def adb_run(adb, serial, args, timeout=60):
    cmd = [adb] + (['-s', serial] if serial else []) + args
    p = subprocess.run(cmd, capture_output=True, text=True, encoding='utf-8',
                       errors='replace', timeout=timeout)
    return p.returncode, (p.stdout or '').strip(), (p.stderr or '').strip()


def main():
    dry = '--dry' in sys.argv
    print('=' * 62)
    print(' 第 3 步 · 部署节点脚本')
    print('=' * 62)

    adb = find_adb()
    if not adb:
        bad('找不到 adb。装 Android platform-tools，或本步跳过（边缘已可用，节点需手工部署）')
        return 1

    rc, out, err = adb_run(adb, None, ['devices'])
    devices = [l.split('\t')[0] for l in out.split('\n')[1:] if '\tdevice' in l]
    serial = cfg('PHONE_SERIAL') or (devices[0] if devices else None)
    if not serial or serial not in devices:
        bad('没有在线设备（adb devices 为空）。检查数据线/USB 调试/授权弹窗')
        if devices:
            log('可用设备: %s' % devices)
        return 1
    ok('设备: %s' % serial)

    # ---- 1. 推脚本 ----
    sdir = os.path.join(ROOT, 'phone', 'scripts')
    scripts = sorted(f for f in os.listdir(sdir) if f.endswith('.sh'))
    log('待推送脚本 %d 个: %s' % (len(scripts), ', '.join(scripts)))
    if dry:
        log('--dry 模式：不做实际推送')
        return 0

    for fn in scripts:
        src = os.path.join(sdir, fn)
        # 确保 LF 行尾（CRLF 会让 shell 报语法错误）
        with io.open(src, encoding='utf-8', errors='replace') as f:
            txt = f.read()
        txt = txt.replace('\r\n', '\n').replace('\r', '\n')
        tmp = os.path.join(os.environ.get('TEMP', '.'), fn)
        with io.open(tmp, 'w', encoding='utf-8', newline='\n') as f:
            f.write(txt)
        rc, out, err = adb_run(adb, serial, ['push', tmp, '%s/%s' % (REMOTE, fn)], timeout=120)
        if rc != 0:
            bad('推送 %s 失败: %s' % (fn, err[:200]))
            return 1
        ok('已推送 %s' % fn)

    # ---- 2. 生成配置文件 ----
    cfg_dir = os.path.join(ROOT, 'phone', 'config')
    subs = {
        '${WORKER_HOST}': cfg('WORKER_HOST', ''),
        '${TUNNEL_HOST}': cfg('TUNNEL_HOST', ''),
        '${SYNC_SECRET}': cfg('SYNC_SECRET', ''),
        '${ADMIN_PASSWORD}': cfg('ADMIN_PASSWORD', ''),
        '${VLESS_UUID}': cfg('VLESS_UUID', ''),
        '${PHONE_SERIAL}': serial,
    }
    for fn in sorted(os.listdir(cfg_dir)) if os.path.isdir(cfg_dir) else []:
        if not fn.endswith('.example'):
            continue
        real = fn[:-len('.example')]
        with io.open(os.path.join(cfg_dir, fn), encoding='utf-8', errors='replace') as f:
            txt = f.read()
        for k, v in subs.items():
            txt = txt.replace(k, v or k)
        tmp = os.path.join(os.environ.get('TEMP', '.'), real)
        with io.open(tmp, 'w', encoding='utf-8', newline='\n') as f:
            f.write(txt)
        rc, out, err = adb_run(adb, serial, ['push', tmp, '%s/%s' % (REMOTE, real)], timeout=120)
        ok('已推送配置 %s' % real if rc == 0 else '配置 %s 推送失败' % real)

    # ---- 3. 完整重启 ----
    log('在设备上完整重启（会先杀旧进程再拉起）...')
    rc, out, err = adb_run(adb, serial, ['shell', 'sh %s/run_daemon.sh' % REMOTE], timeout=120)
    print('    ' + (out or err or '').replace('\n', '\n    '))
    if rc != 0:
        bad('重启脚本返回非 0，请检查设备')
        return 1
    ok('重启命令已执行')

    # ---- 4. 状态 ----
    import time
    time.sleep(8)
    rc, out, err = adb_run(adb, serial, ['shell',
        'ps -A -o PID,PPID,ARGS | grep -E "xray|cloudflared|ping_scheduler|node_probe|traffic_daemon|edge_probe" | grep -v grep'])
    print('\n  设备上运行的进程:')
    for l in (out or '(无)').split('\n'):
        if l.strip():
            print('    ' + l.strip()[:120])

    rc, out, err = adb_run(adb, serial, ['shell',
        'ls -l %s/last_pings.txt %s/last_ping_times.txt 2>/dev/null' % (REMOTE, REMOTE)])
    print('\n  数据文件:')
    for l in (out or '(无)').split('\n'):
        if l.strip():
            print('    ' + l.strip()[:120])

    print()
    print('  下一步：python deploy/step4_verify.py')
    return 0


if __name__ == '__main__':
    sys.exit(main())
