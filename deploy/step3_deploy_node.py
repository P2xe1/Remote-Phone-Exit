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
import re
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
            bad('推送 %s 失败: %s' % (fn, (err or '')[:200]))
            return 1
        ok('已推送 %s' % fn)

    # ---- 1.5 确保可执行权限 ----
    # 【2026-10-05 修复 B9】run_daemon.sh 里是 `nohup /data/local/tmp/traffic_daemon.sh`，
    #   直接执行该文件、不经过 sh。adb push 不保证带执行位，而部署流程也没 chmod ——
    #   新设备上守护进程会启动失败（老设备因为之前手工设过权限，看不出来）。
    #   这里统一补权限；同时把 run_daemon.sh 自身也纳入（它由 step3 用 sh 调用，
    #   但手工执行时同样需要执行位）。
    allsh = ' '.join('%s/%s' % (REMOTE, fn) for fn in scripts)
    rc, out, err = adb_run(adb, serial,
                           ['shell', 'chmod 755 %s' % allsh], timeout=60)
    if rc != 0:
        bad('设置脚本执行权限失败: %s' % (err or '')[:200])
        return 1
    # 复查：用 test -x 确认关键脚本真的可执行（比解析 ls -l 可靠）
    rc, out, err = adb_run(adb, serial, ['shell',
        'for f in %s/traffic_daemon.sh %s/run_daemon.sh %s/ping_scheduler.sh %s/sync_worker.sh; '
        'do if [ -x "$f" ]; then echo "OK $f"; else echo "NOEXEC $f"; fi; done'
        % (REMOTE, REMOTE, REMOTE, REMOTE)], timeout=30)
    listing = (out or '')
    for l in listing.split('\n'):
        if l.strip():
            log('  ' + l.strip())
    if 'NOEXEC' in listing:
        bad('仍有脚本没有执行权限，设备上会启动失败（已中止，不会继续重启）')
        return 1
    if 'OK' not in listing:
        bad('无法确认脚本执行权限，已中止（避免推送成功但起不来）')
        return 1
    ok('脚本执行权限已确认（chmod 755 + test -x 复查）')

    # ---- 2. 生成并推送配置文件 ----
    # 【2026-10-05 修复 B5】原来用 `real = fn[:-len('.example')]` 推断运行文件名，
    #   于是把 phone_active_config.json / termux_config.yml 推上去了 ——
    #   而设备实际读的是 config.json 与 config.yml。结果：
    #   新设备缺启动所需配置；老设备继续跑旧配置（推送成功 ≠ 新配置生效）。
    #   现在改成【显式映射】：源样例名 -> 设备上的运行文件名。
    cfg_dir = os.path.join(ROOT, 'phone', 'config')

    # 运行文件名映射。None = 不在本步推送。
    CFG_MAP = {
        'config.yml.example': 'config.yml',            # cloudflared 隧道配置
        'config.json.example': None,                   # 见下方说明：由手机自行拉取
        'termux_config.yml.example': None,             # 历史参考，不推送
        'phone_config.json.example': None,             # 历史参考，不推送
        'phone_active_config.json.example': None,      # 历史参考，不推送
    }

    subs = {
        '${WORKER_HOST}': cfg('WORKER_HOST', ''),
        '${TUNNEL_HOST}': cfg('TUNNEL_HOST', ''),
        '${SYNC_SECRET}': cfg('SYNC_SECRET', ''),
        '${ADMIN_PASSWORD}': cfg('ADMIN_PASSWORD', ''),
        '${VLESS_UUID}': cfg('VLESS_UUID', ''),
        '${PHONE_SERIAL}': serial,
    }

    if not os.path.isdir(cfg_dir):
        bad('找不到 %s —— 无法生成设备配置' % cfg_dir)
        return 1

    pushed_cfg = []
    for fn in sorted(os.listdir(cfg_dir)):
        if not fn.endswith('.example'):
            continue
        if fn not in CFG_MAP:
            bad('配置样例 %s 没有映射到运行文件名，已中止（避免推错名字）' % fn)
            print('      请在 step3_deploy_node.py 的 CFG_MAP 里补上它的目标名')
            return 1
        real = CFG_MAP[fn]
        if real is None:
            log('跳过 %s（历史参考，不作为运行配置）' % fn)
            continue
        with io.open(os.path.join(cfg_dir, fn), encoding='utf-8', errors='replace') as f:
            txt = f.read()

        # 【修复 B7】把没填上的占位符直接判为失败。
        #   原来只做 `v or k` 的兜底替换 —— 配置没配全就把 ${XXX} 原样推上去，
        #   设备上 xray/cloudflared 起不来，而且报错很难懂。
        left_ph = sorted(set(re.findall(r'\$\{([A-Z_]+)\}', txt)))
        if left_ph:
            for k in left_ph:
                txt = txt.replace('${%s}' % k, subs.get('${%s}' % k, '') or '')
        still = sorted(set(re.findall(r'\$\{([A-Z_]+)\}', txt)))
        if still:
            bad('%s 里还有没填上的占位符: %s' % (fn, ', '.join(still)))
            print('      请先在 .env 里补上这些值，再重跑本步（否则设备起不来）')
            return 1

        tmp = os.path.join(os.environ.get('TEMP', '.'), real)
        with io.open(tmp, 'w', encoding='utf-8', newline='\n') as f:
            f.write(txt)
        rc, out, err = adb_run(adb, serial, ['push', tmp, '%s/%s' % (REMOTE, real)], timeout=120)
        # 【修复 B10】推送失败必须立即中止 —— 原来只打印一行就继续重启，
        #   结果是"在缺少新配置/仍是旧配置"的状态下重启，部署结果不可信。
        if rc != 0:
            bad('推送配置 %s 失败，已中止（不会继续重启）: %s' % (real, (err or '')[:200]))
            return 1
        ok('已推送配置 %s -> %s' % (fn, real))
        pushed_cfg.append(real)

    if not pushed_cfg:
        log('本步没有需要推送的配置文件')

    # 【说明】xray 的 config.json 不在这里推：
    #   手机上的 xray 配置是【运行时从 Worker 拉的】（/api/phone_xray_config），
    #   由 sync_worker.sh 校验通过后写入 /data/local/tmp/config.json。
    #   这样改用户库后不用重新部署。样例 config.json.example 仅作格式参考。
    log('xray 的 config.json 由手机运行时从 %s/api/phone_xray_config 拉取'
        % (cfg('WORKER_HOST', '<WORKER_HOST>') or '<WORKER_HOST>'))

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
