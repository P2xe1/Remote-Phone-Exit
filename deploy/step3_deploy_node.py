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


def warn(m):
    print('[~] %s' % m)


def http_get(url, headers=None, timeout=30):
    """取一个文本资源；失败抛异常，由调用方决定怎么降级。"""
    import urllib.request
    req = urllib.request.Request(url, headers=headers or {})
    with urllib.request.urlopen(req, timeout=timeout) as r:
        return r.read().decode('utf-8', 'replace')


def apply_subs(text, subs):
    """把 ${KEY} 替换成真实值；返回 (新文本, 替换次数)。"""
    n = 0
    for k, v in subs.items():
        if v and k in text:
            n += text.count(k)
            text = text.replace(k, v)
    return text, n


def leftover_placeholders(text):
    """还剩哪些 ${KEY}（转义写法 \\${KEY} 不算）。"""
    return sorted(set(re.findall(r'(?<!\\)\$\{([A-Z_][A-Z0-9_]*)\}', text)))


def defined_vars(text):
    """脚本里自己定义的变量名 —— 这些 ${X} 是脚本内部引用，不是待填占位符。"""
    return set(re.findall(r'^\s*([A-Z_][A-Z0-9_]*)=', text, re.M))


def real_leftovers(text):
    """真正没被填上的占位符 = 残留的 ${KEY} 里排除脚本自定义的那些。"""
    own = defined_vars(text)
    return [k for k in leftover_placeholders(text) if k not in own]


def strip_bad_clients(cfg_obj):
    """删掉 id 仍是占位标记（含 << >>）的客户端项。

    为什么：config.json.example 里除主 UUID 外还有两处
    `"id": "<<USER_TOKEN_1 的 UUID>>"` 之类的历史占位 —— 它们不是合法 UUID，
    原样下发会让代理核心拒绝启动。全新部署用不到这些额外客户端，
    真正完整的用户列表由 Worker 的 /api/phone_xray_config 在运行时生成。
    """
    removed = 0
    for ib in cfg_obj.get('inbounds', []):
        cl = ib.get('settings', {}).get('clients')
        if isinstance(cl, list):
            keep = []
            for c in cl:
                cid = str((c or {}).get('id', ''))
                if '<<' in cid or '>>' in cid or not cid:
                    removed += 1
                    continue
                keep.append(c)
            ib['settings']['clients'] = keep
    return cfg_obj, removed


def build_xray_config(example_text, subs):
    """生成设备上的 config.json，返回 (文本, 来源说明)。

    优先从 Worker 的 /api/phone_xray_config 拉【权威配置】（与订阅、统计口径一致）；
    拉不到（Worker 还没起来 / 网络不通）时，用仓库样例 + 注入真实值兜底，
    并把样例里那些非法占位客户端项（id 含 << >>）删掉 —— 否则 xray 拒绝启动。
    """
    import json as _json
    host = (subs.get('${WORKER_HOST}') or '').strip()
    key = (subs.get('${SYNC_SECRET}') or '').strip()
    if host and key:
        url = 'https://%s/api/phone_xray_config' % host
        try:
            body = http_get(url, headers={'X-Sync-Key': key, 'User-Agent': 'step3/1.0'})
            obj = _json.loads(body)
            if isinstance(obj, dict) and obj.get('inbounds'):
                return (_json.dumps(obj, ensure_ascii=False, indent=2),
                        'Worker /api/phone_xray_config（权威配置）')
            warn('Worker 返回的配置结构不完整，改用本地样例兜底')
        except Exception as e:
            warn('从 Worker 拉取配置失败（%s），改用本地样例兜底' % str(e)[:90])
    txt, _ = apply_subs(example_text, subs)
    txt, _ = apply_subs(example_text, subs)
    # 样例里的"主 UUID"是脱敏时写成字面量的（不是 ${VLESS_UUID}），
    #   必须换成 .env 里的真实 UUID —— 否则设备上的代理核心认的是一串
    #   占位 UUID，而订阅下发给客户端的又是另一串，连上立刻被拒。
    #   （完整的多用户列表仍由 Worker 的 /api/phone_xray_config 在运行时下发。）
    _uuid = (subs.get('${VLESS_UUID}') or '').strip()
    if _uuid:
        for _ph in ('00000000-0000-4000-8000-000000000001',
                    '00000000-0000-4000-8000-000000000011',
                    '00000000-0000-4000-8000-000000000013',
                    '00000000-0000-4000-8000-000000000014'):
            if _ph in txt:
                txt = txt.replace(_ph, _uuid)
    try:
        obj = _json.loads(txt)
    except Exception as e:
        bad('本地样例注入后不是合法 JSON: %s' % str(e)[:120])
        return txt, '本地样例（JSON 解析失败）'
    obj, removed = strip_bad_clients(obj)
    if removed:
        warn('样例里有 %d 个占位客户端项（id 含 << >>），已删除（真实用户列表由 Worker 运行时下发）'
             % removed)
    return _json.dumps(obj, ensure_ascii=False, indent=2), '本地样例 + 注入真实值（兜底）'


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
    serial = None
    devices = []
    if adb:
        rc, out, err = adb_run(adb, None, ['devices'])
        devices = [l.split('\t')[0] for l in out.split('\n')[1:] if '\tdevice' in l]
        serial = cfg('PHONE_SERIAL') or (devices[0] if devices else None)
    if not adb or not serial or serial not in devices:
        # 【2026-10-05 新增】--dry 允许离线核对：没有设备也把"将推送到设备的内容"
        #   生成到本地目录 —— 这样能在不接设备的情况下检查占位符是否都替换了。
        if dry:
            warn('--dry 且没有在线设备：只生成、不推送（离线核对用）')
            serial = serial or cfg('PHONE_SERIAL') or 'DRY-RUN'
            adb = adb or 'adb'
        else:
            if not adb:
                bad('找不到 adb。装 Android platform-tools，或本步跳过'
                    '（边缘已可用，节点需手工部署）')
            else:
                bad('没有在线设备（adb devices 为空）。检查数据线/USB 调试/授权弹窗')
                if devices:
                    log('可用设备: %s' % devices)
            return 1
    ok('设备: %s' % serial)

    # ---- 1. 推脚本 ----
    sdir = os.path.join(ROOT, 'phone', 'scripts')
    scripts = sorted(f for f in os.listdir(sdir) if f.endswith('.sh'))
    log('待推送脚本 %d 个: %s' % (len(scripts), ', '.join(scripts)))

    # ---- 先备好"要注入到脚本与配置里的真实值" ----
    #   【2026-10-05 修复 · 严重】原来本步只推脚本、不替换里面的 ${WORKER_HOST}
    #   之类的占位符 —— 于是新设备上 `WORKER_URL="https://${WORKER_HOST}/..."`
    #   原样生效，shell 里那个变量根本没人定义，URL 变成 https:///api/...
    #   上报与同步全部静默失效（设备看着在跑，大屏永远没有数据）。
    #   真机上的脚本里是【真实字面值】（部署时写进去的），这里就按同样方式做。
    subs = {
        '${WORKER_HOST}': cfg('WORKER_HOST', ''),
        '${TUNNEL_HOST}': cfg('TUNNEL_HOST', ''),
        '${TUNNEL_ID}': cfg('TUNNEL_ID', ''),
        '${SYNC_SECRET}': cfg('SYNC_SECRET', ''),
        '${ADMIN_PASSWORD}': cfg('ADMIN_PASSWORD', ''),
        '${VLESS_UUID}': cfg('VLESS_UUID', ''),
        '${RELAY_TARGET_IP}': cfg('RELAY_TARGET_IP', ''),
        '${PHONE_SERIAL}': serial,
        # 六个 CF 锚点：fast_scan / ping_scheduler / intl_probe 用它们量"客户端↔CF
        # 边缘"的往返时延。必须是个真实可达的 Cloudflare anycast 地址。
        '${CF_ANCHOR_1}': cfg('CF_ANCHOR_1', ''),
        '${CF_ANCHOR_2}': cfg('CF_ANCHOR_2', ''),
        '${CF_ANCHOR_3}': cfg('CF_ANCHOR_3', ''),
        '${CF_ANCHOR_4}': cfg('CF_ANCHOR_4', ''),
        '${CF_ANCHOR_5}': cfg('CF_ANCHOR_5', ''),
        '${CF_ANCHOR_6}': cfg('CF_ANCHOR_6', ''),
        # 下面几个只出现在注释里（真机信息示例），给个中性默认值，免得注释里
        # 留着 ${...} 让人误以为漏填。
        '${DAY_TZ}': cfg('DAY_TZ', '') or 'UTC',
        '${DEVICE_NAME}': cfg('DEVICE_NAME', '') or '设备',
        '${SOC}': cfg('SOC', '') or 'SoC',
        '${WIFI_SSID}': cfg('WIFI_SSID', '') or 'Wi-Fi',
    }
    REQUIRED = ['${WORKER_HOST}', '${SYNC_SECRET}', '${RELAY_TARGET_IP}', '${VLESS_UUID}',
                '${CF_ANCHOR_1}', '${CF_ANCHOR_2}', '${CF_ANCHOR_3}',
                '${CF_ANCHOR_4}', '${CF_ANCHOR_5}', '${CF_ANCHOR_6}']
    miss = [k.strip('${}') for k in REQUIRED if not subs[k]]
    if miss:
        bad('这些必填项在 .env 里是空的：%s' % ', '.join(miss))
        print('      它们会被写进设备侧脚本（URL / 上报密钥 / 统计接口 / 传输 UUID），')
        print('      少了任意一项，设备即使启动也拉不到配置、上报不上去。')
        return 1

    # --dry 模式下把所有"将推送到设备的内容"落到本地目录，便于离线核对
    stage = None
    if dry:
        stage = os.path.join(os.environ.get('TEMP', '.'), 'step3_stage')
        if os.path.isdir(stage):
            shutil.rmtree(stage, ignore_errors=True)
        os.makedirs(stage, exist_ok=True)
        log('--dry 模式：不推送、不重启；生成物写到 %s' % stage)

    for fn in scripts:
        src = os.path.join(sdir, fn)
        # 确保 LF 行尾（CRLF 会让 shell 报语法错误）
        with io.open(src, encoding='utf-8', errors='replace') as f:
            txt = f.read()
        txt = txt.replace('\r\n', '\n').replace('\r', '\n')
        # 注入真实值，并拒绝"带着未替换占位符"上设备
        txt, n_sub = apply_subs(txt, subs)
        left = real_leftovers(txt)
        if left:
            bad('%s 里还有没替换的占位符: %s' % (fn, ', '.join(left)))
            print('      请在 .env 里补齐对应项后重跑（带占位符推上去 = 设备静默失效）')
            return 1
        tmp = os.path.join(os.environ.get('TEMP', '.'), fn)
        with io.open(tmp, 'w', encoding='utf-8', newline='\n') as f:
            f.write(txt)
        if dry:
            shutil.copyfile(tmp, os.path.join(stage, fn))
            ok('(dry) 已生成 %s（注入 %d 处）' % (fn, n_sub))
            continue
        rc, out, err = adb_run(adb, serial, ['push', tmp, '%s/%s' % (REMOTE, fn)], timeout=120)
        if rc != 0:
            bad('推送 %s 失败: %s' % (fn, (err or '')[:200]))
            return 1
        ok('已推送 %s（注入 %d 处）' % (fn, n_sub))

    if dry:
        log('--dry：脚本已生成到 %s，继续生成配置以做核对' % stage)

    # ---- 1.5 确保可执行权限 ----
    # 【2026-10-05 修复 B9】run_daemon.sh 里是 `nohup /data/local/tmp/traffic_daemon.sh`，
    #   直接执行该文件、不经过 sh。adb push 不保证带执行位，而部署流程也没 chmod ——
    #   新设备上守护进程会启动失败（老设备因为之前手工设过权限，看不出来）。
    #   这里统一补权限；同时把 run_daemon.sh 自身也纳入（它由 step3 用 sh 调用，
    #   但手工执行时同样需要执行位）。
    #   ⚠ 干跑模式不做任何设备操作（离线核对的机器上根本没有 adb）。
    if dry:
        log('--dry：跳过程序执行权限设置（属于设备操作）')
    else:
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
        # 【2026-10-05 修复 · 严重】原来这里是 None（"由手机运行时自己拉"），
        #   但 run_daemon.sh 启动前会检查 /data/local/tmp/config.json 是否存在，
        #   缺了就直接 exit 1 —— 新设备【永远起不来】，所谓"运行时自己拉"根本
        #   没机会执行（鸡生蛋）。现在改为：本步就生成并推送一份可用的 config.json
        #   （优先从 Worker 拉取权威配置，拉不到再用样例兜底），
        #   之后仍由 sync_worker.sh 在运行时替换成最新版本。
        'config.json.example': 'config.json',          # xray 配置
        'termux_config.yml.example': None,             # 历史参考，不推送
        'phone_config.json.example': None,             # 历史参考，不推送
        'phone_active_config.json.example': None,      # 历史参考，不推送
    }

    # 隧道身份：config.yml 里的 tunnel / credentials-file 靠这两项
    tunnel_id = cfg('TUNNEL_ID', '')
    creds_file = cfg('TUNNEL_CREDS_FILE', '')
    creds_json = cfg('TUNNEL_CREDS_JSON', '')
    if not tunnel_id:
        bad('缺少 TUNNEL_ID —— 没有它 cloudflared 不知道该连哪条隧道')
        print('      在 .env 里补上 TUNNEL_ID=<隧道ID>（Cloudflare 控制台 → Networks → Tunnels）')
        return 1
    if not creds_file and not creds_json:
        bad('缺少隧道凭据：TUNNEL_CREDS_FILE 与 TUNNEL_CREDS_JSON 都没设置')
        print('      下载隧道凭据 JSON 后，在 .env 里写 TUNNEL_CREDS_FILE=<该文件路径>；')
        print('      或把内容整段填给 TUNNEL_CREDS_JSON。')
        return 1

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

        if real == 'config.json':
            txt, src_desc = build_xray_config(txt, subs)
            log('config.json 来源: %s' % src_desc)
        else:
            txt, _ = apply_subs(txt, subs)

        # 【修复 B7】把没填上的占位符直接判为失败（配置没配全就推上去 = 设备起不来）
        still = leftover_placeholders(txt)
        if still:
            bad('%s 里还有没填上的占位符: %s' % (fn, ', '.join(still)))
            print('      请先在 .env 里补上这些值，再重跑本步（否则设备起不来）')
            return 1

        tmp = os.path.join(os.environ.get('TEMP', '.'), real)
        with io.open(tmp, 'w', encoding='utf-8', newline='\n') as f:
            f.write(txt)
        if dry:
            shutil.copyfile(tmp, os.path.join(stage, real))
            ok('(dry) 已生成 %s' % real)
            pushed_cfg.append(real)
            continue
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

    # ---- 2.5 隧道凭据（cloudflared 要读它才算"有身份"） ----
    #   config.yml 里的 credentials-file 指向 /data/local/tmp/tunnel_creds.json，
    #   这个文件【必须】在设备上存在且内容合法，否则隧道起不来。
    #   来源二选一：TUNNEL_CREDS_FILE（本地文件路径）或 TUNNEL_CREDS_JSON（整段内容）。
    import json as _json
    creds_text = creds_json or ''
    if not creds_text:
        if not os.path.isfile(creds_file):
            bad('TUNNEL_CREDS_FILE 指向的文件不存在: %s' % creds_file)
            return 1
        with io.open(creds_file, encoding='utf-8', errors='replace') as f:
            creds_text = f.read()
    try:
        cobj = _json.loads(creds_text)
    except Exception as e:
        bad('隧道凭据不是合法 JSON: %s' % str(e)[:120])
        return 1
    if not isinstance(cobj, dict) or not (cobj.get('TunnelID') or cobj.get('TunnelSecret')):
        bad('隧道凭据内容不像 cloudflared 凭据（缺 TunnelID / TunnelSecret）')
        return 1
    if str(cobj.get('TunnelID', '')) and str(cobj.get('TunnelID')) != tunnel_id:
        warn('凭据里的 TunnelID（%s…）与 .env 的 TUNNEL_ID（%s…）不一致 —— 请确认是同一'
             '条隧道' % (str(cobj.get('TunnelID'))[:8], tunnel_id[:8]))
    tmpc = os.path.join(os.environ.get('TEMP', '.'), 'tunnel_creds.json')
    with io.open(tmpc, 'w', encoding='utf-8', newline='\n') as f:
        f.write(creds_text)
    if dry:
        shutil.copyfile(tmpc, os.path.join(stage, 'tunnel_creds.json'))
        ok('(dry) 已生成 tunnel_creds.json')
    else:
        rc, out, err = adb_run(adb, serial, ['push', tmpc, '%s/tunnel_creds.json' % REMOTE], timeout=120)
        if rc != 0:
            bad('推送隧道凭据失败，已中止: %s' % (err or '')[:200])
            return 1
        # 凭据是敏感文件：收权限（只给属主读写）
        adb_run(adb, serial, ['shell', 'chmod 600 %s/tunnel_creds.json' % REMOTE])
        ok('已推送隧道凭据 -> %s/tunnel_creds.json（权限 600）' % REMOTE)

    if dry:
        print()
        ok('--dry 完成：以下内容已生成到 %s，未推送到设备、未重启' % stage)
        for n in sorted(os.listdir(stage)):
            p = os.path.join(stage, n)
            print('    %-24s %6d 字节' % (n, os.path.getsize(p)))
        print()
        print('  核对要点：脚本里不应再出现 ${...}；config.yml 里 tunnel 与')
        print('  credentials-file 都要有值；config.json 必须是合法 JSON。')
        return 0

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
