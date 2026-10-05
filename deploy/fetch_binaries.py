# -*- coding: utf-8 -*-
"""第 0 步 · 获取节点侧二进制（代理核心 + 隧道客户端）并推到设备。

为什么单独有这一步：
    节点脚本对文件路径与文件名是【写死】的 ——
        /data/local/tmp/xray                代理核心
        /data/local/tmp/cloudflared_native  隧道客户端
    而仓库里不带这两个二进制。没有这一步，新人跑到"启动节点"时会卡住：
    不知道去哪下、下哪个架构、该叫什么名字、放哪。

用法（在电脑上执行，需要 adb 与已开启 USB 调试的设备）:
    python deploy/fetch_binaries.py                 # 下载 -> 校验 -> 推到设备
    python deploy/fetch_binaries.py --check         # 只看设备上有没有
    python deploy/fetch_binaries.py --download-only # 只下载到本地缓存
    python deploy/fetch_binaries.py --force         # 覆盖设备上已存在的同名文件

校验策略（两条都做，缺一条就中止）:
    1. 代理核心：官方 release 自带 .dgst，取其中 SHA2-256 逐字节比对。
    2. 隧道客户端：官方未提供校验文件，因此除了走官方 HTTPS 源之外，
       额外解析 ELF 头 —— 确认是 64 位、小端、AArch64 可执行文件。
       （最常见的错误就是下成了 amd64 版，装上去只会报 "not executable"。）

安全约定：
    · 不覆盖设备上已有的同名文件，除非显式 --force。
      （节点可能正在运行，静默替换二进制属于破坏性操作。）
    · 只推文件、只 chmod，不改任何系统设置、不重启任何进程。
"""
import hashlib
import io
import json
import os
import shutil
import struct
import subprocess
import sys
import urllib.request
import zipfile

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)
CACHE = os.path.join(ROOT, '.cache_binaries')

XRAY_REPO = 'XTLS/Xray-core'
CFD_REPO = 'cloudflare/cloudflared'
ASSET_XRAY = 'Xray-android-arm64-v8a.zip'
ASSET_CFD = 'cloudflared-linux-arm64'

REMOTE_DIR = '/data/local/tmp'
REMOTE_XRAY = REMOTE_DIR + '/xray'
REMOTE_CFD = REMOTE_DIR + '/cloudflared_native'

UA = {'User-Agent': 'fetch-binaries/1.0'}


def log(m):
    print('  ' + m)


def ok(m):
    print('  [OK] ' + m)


def warn(m):
    print('  [!!] ' + m)


def bad(m):
    print('  [XX] ' + m)


def http_json(url):
    req = urllib.request.Request(url, headers=dict(UA, Accept='application/vnd.github+json'))
    with urllib.request.urlopen(req, timeout=60) as r:
        return json.loads(r.read().decode('utf-8'))


def http_bytes(url):
    req = urllib.request.Request(url, headers=UA)
    with urllib.request.urlopen(req, timeout=300) as r:
        return r.read()


def latest_tag(repo, override):
    if override:
        return override
    data = http_json('https://api.github.com/repos/%s/releases/latest' % repo)
    return data['tag_name']


def asset_url(repo, tag, name):
    return 'https://github.com/%s/releases/download/%s/%s' % (repo, tag, name)


def sha256_of(data):
    return hashlib.sha256(data).hexdigest()


def elf_machine(data):
    """返回 (位数, e_machine)；不是 ELF 则返回 (None, None)。"""
    if len(data) < 20 or data[:4] != b'\x7fELF':
        return (None, None)
    ei_class = data[4]
    ei_data = data[5]
    endian = '<' if ei_data == 1 else '>'
    machine = struct.unpack(endian + 'H', data[18:20])[0]
    bits = {1: 32, 2: 64}.get(ei_class)
    return (bits, machine)


def find_adb():
    a = shutil.which('adb')
    if a:
        return a
    for c in (os.path.expanduser(r'~\AppData\Local\Android\platform-tools\adb.exe'),
              r'C:\platform-tools\adb.exe',
              os.path.expanduser(r'~\platform-tools\adb.exe'),
              os.path.join(ROOT, '_tools', 'platform-tools', 'adb.exe')):
        if os.path.exists(c):
            return c
    return None


def adb_run(adb, serial, args, timeout=180):
    cmd = [adb] + (['-s', serial] if serial else []) + args
    p = subprocess.run(cmd, capture_output=True, text=True, encoding='utf-8',
                       errors='replace', timeout=timeout)
    return p.returncode, (p.stdout or ''), (p.stderr or '')


def fetch_xray(tag, force_dl):
    os.makedirs(CACHE, exist_ok=True)
    zpath = os.path.join(CACHE, ASSET_XRAY)
    dpath = zpath + '.dgst'
    if force_dl or not os.path.exists(zpath) or not os.path.exists(dpath):
        log('下载 %s ...' % ASSET_XRAY)
        zdata = http_bytes(asset_url(XRAY_REPO, tag, ASSET_XRAY))
        ddata = http_bytes(asset_url(XRAY_REPO, tag, ASSET_XRAY + '.dgst'))
        with open(zpath, 'wb') as f:
            f.write(zdata)
        with open(dpath, 'wb') as f:
            f.write(ddata)
    with open(zpath, 'rb') as f:
        zdata = f.read()
    with open(dpath, 'r', encoding='utf-8', errors='replace') as f:
        dgst = f.read()

    expect = None
    for line in dgst.splitlines():
        line = line.strip()
        if line.upper().startswith('SHA2-256'):
            expect = line.split('=', 1)[1].strip().lower()
            break
    if not expect:
        bad('官方校验文件里没有 SHA2-256 行，无法校验，已中止')
        return None, None
    got = sha256_of(zdata)
    if got != expect:
        bad('校验失败！期望 %s... 实际 %s...' % (expect[:16], got[:16]))
        return None, None
    ok('代理核心校验通过（SHA2-256 %s...）' % got[:16])

    with zipfile.ZipFile(io.BytesIO(zdata)) as z:
        member = None
        for n in z.namelist():
            if n.lower().endswith('/xray') or n.lower() == 'xray':
                member = n
                break
        if not member:
            bad('压缩包里没找到 xray 可执行文件')
            return None, None
        data = z.read(member)
    bits, machine = elf_machine(data)
    if bits != 64 or machine != 183:
        bad('xray 不是 64 位 AArch64 可执行文件（bits=%s machine=%s）' % (bits, machine))
        return None, None
    ok('代理核心是 AArch64 可执行文件（%d 位）' % bits)
    return data, tag


def fetch_cloudflared(tag, force_dl):
    os.makedirs(CACHE, exist_ok=True)
    path = os.path.join(CACHE, ASSET_CFD)
    if force_dl or not os.path.exists(path):
        log('下载 %s ...' % ASSET_CFD)
        data = http_bytes(asset_url(CFD_REPO, tag, ASSET_CFD))
        with open(path, 'wb') as f:
            f.write(data)
    with open(path, 'rb') as f:
        data = f.read()
    bits, machine = elf_machine(data)
    if bits != 64 or machine != 183:
        bad('cloudflared 不是 64 位 AArch64 可执行文件（bits=%s machine=%s）' % (bits, machine))
        return None, None
    ok('隧道客户端是 AArch64 可执行文件（%d 位，%d 字节）' % (bits, len(data)))
    warn('隧道客户端官方未提供校验文件 —— 已走官方 HTTPS 源 + 架构校验；'
         '如需更强校验请自行核对官方发布页的哈希')
    return data, tag


def device_status(adb, serial):
    """返回 (xray存在, cfd存在, 版本字符串)。"""
    cmd = ('test -e %s && echo X1 || echo X0;'
           'test -e %s && echo C1 || echo C0;'
           '%s --version 2>/dev/null | head -n1;'
           '%s --version 2>/dev/null | head -n1'
           % (REMOTE_XRAY, REMOTE_CFD, REMOTE_XRAY, REMOTE_CFD))
    rc, out, _ = adb_run(adb, serial, ['shell', cmd])
    lines = [l.strip() for l in out.splitlines() if l.strip()]
    has_x = 'X1' in lines
    has_c = 'C1' in lines
    vers = [l for l in lines if l not in ('X0', 'X1', 'C0', 'C1')]
    return has_x, has_c, ' | '.join(vers)


def main():
    argv = sys.argv[1:]
    check_only = '--check' in argv
    download_only = '--download-only' in argv
    force = '--force' in argv
    force_dl = '--refresh' in argv

    print('=' * 62)
    print(' 第 0 步 · 节点侧二进制（代理核心 + 隧道客户端）')
    print('=' * 62)

    adb = find_adb()
    serial = None
    if adb:
        rc, out, _ = adb_run(adb, None, ['devices'])
        online = [l.split('\t')[0] for l in out.splitlines()[1:] if '\tdevice' in l]
        serial = online[0] if online else None
    if not adb:
        warn('未找到 adb —— 可以只下载不推送（--download-only）')
    elif not serial:
        warn('adb 可用但没有在线设备 —— 检查数据线 / USB 调试授权弹窗')

    if check_only:
        if not serial:
            bad('没有设备可检查')
            return 1
        has_x, has_c, vers = device_status(adb, serial)
        ok('设备 %s：xray=%s cloudflared=%s'
           % (serial, '有' if has_x else '缺', '有' if has_c else '缺'))
        if vers:
            log('版本：%s' % vers)
        return 0 if (has_x and has_c) else 1

    xray_tag = os.environ.get('XRAY_VERSION') or latest_tag(XRAY_REPO, None)
    cfd_tag = os.environ.get('CLOUDFLARED_VERSION') or latest_tag(CFD_REPO, None)
    log('代理核心版本：%s' % xray_tag)
    log('隧道客户端版本：%s' % cfd_tag)

    xray_data, _ = fetch_xray(xray_tag, force_dl)
    if xray_data is None:
        return 1
    cfd_data, _ = fetch_cloudflared(cfd_tag, force_dl)
    if cfd_data is None:
        return 1
    ok('两个二进制都已就绪（本地缓存目录：%s）' % os.path.relpath(CACHE, ROOT))

    if download_only or not serial:
        if not download_only:
            warn('没有可用设备，跳过推送。接上设备后重跑本脚本即可。')
        return 0

    has_x, has_c, vers = device_status(adb, serial)
    if vers:
        log('设备上现有版本：%s' % vers)
    plan = []
    if has_x and not force:
        warn('%s 已存在 —— 跳过（要覆盖请加 --force）' % REMOTE_XRAY)
    else:
        plan.append((xray_data, REMOTE_XRAY, 'xray'))
    if has_c and not force:
        warn('%s 已存在 —— 跳过（要覆盖请加 --force）' % REMOTE_CFD)
    else:
        plan.append((cfd_data, REMOTE_CFD, 'cloudflared'))

    if not plan:
        ok('设备上两个文件都已存在，无需推送')
        return 0

    tmp = os.path.join(CACHE, '_push.tmp')
    for data, remote, label in plan:
        with open(tmp, 'wb') as f:
            f.write(data)
        rc, out, err = adb_run(adb, serial, ['push', tmp, remote])
        if rc != 0:
            bad('推送 %s 失败：%s' % (label, (err or out)[:200]))
            return 1
        rc, out, err = adb_run(adb, serial, ['shell', 'chmod 755 %s' % remote])
        if rc != 0:
            bad('chmod %s 失败：%s' % (remote, (err or out)[:200]))
            return 1
        ok('已推送 %s -> %s' % (label, remote))
    try:
        os.remove(tmp)
    except OSError:
        pass

    has_x, has_c, vers = device_status(adb, serial)
    ok('复查：xray=%s cloudflared=%s' % ('有' if has_x else '缺', '有' if has_c else '缺'))
    if vers:
        log('设备上可执行文件版本：%s' % vers)
    if not (has_x and has_c):
        bad('推送后仍缺少文件，请检查设备存储权限')
        return 1
    print()
    print('  下一步：把配置与脚本也推上去（python deploy/step3_deploy_node.py），')
    print('          然后在设备上执行 sh /data/local/tmp/install_node.sh 启动。')
    return 0


if __name__ == '__main__':
    sys.exit(main())

