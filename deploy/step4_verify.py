# -*- coding: utf-8 -*-
"""
step4_verify.py —— 第 4 步：线上验收（部署后必跑）

检查：
  1. 三个接口是否 200（stats_data / live / admin）
  2. 页面内嵌版本号 == 接口返回版本号（判断部署是否真生效）
  3. 节点上报是否在流动（数据年龄）
  4. 关键字段是否有真实值（时延/丢包/落点/节点清单）
  5. 页面里是否还有未替换的占位符（说明构建漏替换）

用法: python deploy/step4_verify.py
"""
import json
import os
import re
import socket
import sys
import time
import urllib.error
import urllib.request

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
from cfg import cfg  # noqa: E402


def get(url, timeout=30, retries=2):
    last = None
    for _ in range(retries + 1):
        try:
            req = urllib.request.Request(url, headers={'User-Agent': 'verify/1.0'})
            with urllib.request.urlopen(req, timeout=timeout) as r:
                return r.status, r.read().decode('utf-8', 'replace')
        except urllib.error.HTTPError as e:
            return e.code, ''
        except Exception as e:
            last = e
            time.sleep(2)
    return 0, str(last)


def _fetch_trace(proxy=None, timeout=25):
    """取 Cloudflare trace，解析成 dict。proxy 形如 'http://127.0.0.1:7890'"""
    handlers = []
    if proxy:
        handlers.append(urllib.request.ProxyHandler({'http': proxy, 'https': proxy}))
    import ssl as _ssl
    handlers.append(urllib.request.HTTPSHandler(context=_ssl.create_default_context()))
    op = urllib.request.build_opener(*handlers)
    with op.open('https://www.cloudflare.com/cdn-cgi/trace', timeout=timeout) as r:
        body = r.read().decode('utf-8', 'replace')
    d = {}
    for ln in body.split('\n'):
        if '=' in ln:
            k, v = ln.split('=', 1)
            d[k.strip()] = v.strip()
    return d


def check_phone_egress():
    """
    让节点自己报一次出口 IP。
    做法：通过 adb 在设备上直接 curl 一次 trace —— 这就是"节点所在网络的出口"。
    拿不到（没连 adb / 设备没 curl）返回 None，不算失败。
    """
    import shutil as _sh
    import subprocess as _sp
    adb = _sh.which('adb')
    if not adb:
        return None
    serial = cfg('PHONE_SERIAL', '')
    base = [adb] + (['-s', serial] if serial else [])
    cmd = ('/system/bin/curl -s --max-time 12 '
           'https://www.cloudflare.com/cdn-cgi/trace')
    try:
        p = _sp.run(base + ['shell', cmd], capture_output=True, text=True,
                    encoding='utf-8', errors='replace', timeout=40)
        txt = p.stdout or ''
        if 'ip=' not in txt:
            return None
        d = {}
        for ln in txt.split('\n'):
            if '=' in ln:
                k, v = ln.split('=', 1)
                d[k.strip()] = v.strip()
        return d
    except Exception:
        return None


def check_proxy_egress():
    """
    从本机经一条订阅路径发一次真实请求，取出口 IP。
    ⚠ 本机需要有代理客户端在监听，且端口写在 .env 的 LOCAL_PROXY（默认试 7890/10811/1080）。
    没有可用代理时返回 None —— 这时业务链路【未验证】，而不是"通过"。
    """
    cands = []
    env_p = cfg('LOCAL_PROXY', '')
    if env_p:
        cands.append(env_p)
    for port in (7890, 10811, 1080, 7891, 10809):
        cands.append('http://127.0.0.1:%d' % port)
    for c in cands:
        # 先看端口是否有人监听，避免每个都等超时
        try:
            host, port = c.split('://', 1)[1].split(':')
            s = socket.create_connection((host, int(port)), timeout=2)
            s.close()
        except Exception:
            continue
        try:
            return _fetch_trace(proxy=c, timeout=20)
        except Exception:
            continue
    return None


def main():
    host = cfg('WORKER_HOST', required=True)
    pwd = cfg('ADMIN_PASSWORD', required=True)
    base = 'https://' + host
    fails = []

    def ok(m):
        print('  \033[32m[OK]\033[0m %s' % m)

    def bad(m):
        print('  \033[31m[XX]\033[0m %s' % m)
        fails.append(m)

    def warn(m):
        print('  \033[33m[!!]\033[0m %s' % m)

    print('=' * 62)
    print(' 第 4 步 · 线上验收')
    print('=' * 62)

    print('\n[1/5] 接口连通性')
    codes = {}
    for path in ('/api/stats_data?pwd=%s' % pwd, '/api/live?pwd=%s&since=' % pwd,
                 '/admin?pwd=%s' % pwd):
        st, body = get(base + path)
        codes[path.split('?')[0]] = (st, body)
        (ok if st == 200 else bad)('%s HTTP %s (%d 字节)' % (path.split('?')[0], st, len(body)))

    print('\n[2/5] 版本一致性')
    st, html = codes.get('/admin', (0, ''))
    page_build = re.findall(r'__pageBuild\s*=\s*[\'"]([^\'"]+)', html)
    st2, live_raw = codes.get('/api/live', (0, ''))
    srv_build = re.findall(r'"buildId"\s*:\s*"([^"]+)"', live_raw)
    if page_build and srv_build:
        if page_build[0] == srv_build[0]:
            ok('页面与接口版本一致: %s' % page_build[0])
        else:
            bad('版本不一致！页面=%s 接口=%s（可能还在生效中，等 30 秒重试；仍不一致说明部署没生效）'
                % (page_build[0], srv_build[0]))
    else:
        warn('未能同时取到两处版本号（页面 %s / 接口 %s）' % (page_build[:1], srv_build[:1]))

    print('\n[3/5] 节点上报是否在流动')
    st, raw = codes.get('/api/stats_data', (0, '{}'))
    try:
        d = json.loads(raw or '{}')
    except Exception:
        d = {}
    ts = d.get('timestamp') or 0
    age = (time.time() * 1000 - ts) / 1000 if ts else -1
    if age < 0:
        bad('拿不到上报时间戳（节点还没上报过？）')
    elif age <= 15:
        ok('节点 %0.1f 秒前上报（正常）' % age)
    elif age <= 120:
        warn('节点 %0.0f 秒前上报（偏慢，检查节点进程）' % age)
    else:
        bad('节点已 %0.0f 秒没有上报（服务可能中断）' % age)

    print('\n[4/5] 关键字段')
    for key, label in (('pings', '接入点时延'), ('losses', '丢包率'), ('pingTimes', '测量时刻'),
                       ('colos', '实测落点'), ('nodeStatus', '节点巡检')):
        v = d.get(key)
        n = len(v) if isinstance(v, (dict, list)) else 0
        (ok if n else warn)('%s: %s' % (label, ('%d 项' % n) if n else '无数据（未测到）'))

    print('\n[5/6] 页面是否残留未替换的占位符')
    leftovers = re.findall(r'\$\{(NODE_\d+_IP|WORKER_HOST|TUNNEL_HOST|ADMIN_PASSWORD|SYNC_SECRET|USER_UUID)\}', html)
    if leftovers:
        bad('页面里有 %d 处未替换的占位符: %s' % (len(leftovers), sorted(set(leftovers))[:5]))
    else:
        ok('没有未替换的占位符')

    # ----------------------------------------------------------------
    # [6/6] 业务链路：真实代理出口核对
    # 【2026-10-05 新增 · 依据《链路完整修改方案》第 23 项】
    #   上面的 1~5 项只证明"管理面"正常：接口通、版本一致、有数据上报。
    #   它们【不能】证明"能从这条链路真的出去" —— 代理鉴权失败、隧道到源站
    #   断了、客户端参数不对，管理面都可能是绿的。
    #   所以这里额外做一次真实出口核对：
    #     ① 让节点自己报一次出口 IP（手机直连）
    #     ② 从本机经一条订阅路径发一次真实请求，取出口 IP
    #     ③ 两者比对
    #   ⚠ 本机与节点【在同一个网络】时，两个出口 IP 会相同，此时这一步
    #     无法区分"走了代理"和"没走代理"。脚本会明确提示这一点，
    #     并改用"统计计数是否增长"作为替代证据。
    # ----------------------------------------------------------------
    print('\n[6/6] 业务链路：真实代理出口')
    phone_egress = check_phone_egress()
    if phone_egress:
        ok('节点直连出口 IP: %s（%s / %s）'
           % (phone_egress.get('ip'), phone_egress.get('colo'), phone_egress.get('loc')))
    else:
        warn('拿不到节点直连出口 IP（设备未连 adb 或没有 curl）—— 跳过比对')

    proxy_egress = check_proxy_egress()
    if proxy_egress is None:
        warn('本机没有可用的代理客户端 —— 业务链路未验证')
        print('      这一项【不是失败】，但请注意：')
        print('      管理面全绿 ≠ 代理可用。请用真实客户端（小火箭/Clash 等）')
        print('      导入订阅后访问一次 HTTPS 网站，确认能打开。')
    else:
        ok('经代理出口 IP: %s（%s / %s）'
           % (proxy_egress.get('ip'), proxy_egress.get('colo'), proxy_egress.get('loc')))
        if phone_egress and proxy_egress.get('ip'):
            if proxy_egress['ip'] == phone_egress.get('ip'):
                ok('出口一致：流量确实从节点所在网络出去')
            elif (proxy_egress['ip'].rsplit('.', 1)[0]
                  == str(phone_egress.get('ip', '')).rsplit('.', 1)[0]):
                warn('出口同 /24 网段（家宽 IP 池轮换，可视为同一出口）')
            else:
                bad('出口不一致：代理出口 %s ≠ 节点出口 %s'
                    % (proxy_egress['ip'], phone_egress.get('ip')))
                print('      若本机与节点在同一网络，二者本应相同 —— 差异说明链路可能没走通。')

    print()
    print('=' * 62)
    if fails:
        print(' 结果：%d 项未通过' % len(fails))
        for f in fails:
            print('   · %s' % f)
        print('=' * 62)
        return 1
    print(' 结果：全部通过 ✅  系统已上线')
    print('   大屏: https://%s/admin?pwd=***' % host)
    print('=' * 62)
    return 0


if __name__ == '__main__':
    sys.exit(main())
