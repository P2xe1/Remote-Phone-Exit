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
        (ok if n else warn)('%s: %s' % (label, ('%d 项' % n) if n else '无数据（未测到）')))

    print('\n[5/5] 页面是否残留未替换的占位符')
    leftovers = re.findall(r'\$\{(NODE_\d+_IP|WORKER_HOST|TUNNEL_HOST|ADMIN_PASSWORD|SYNC_SECRET)\}', html)
    if leftovers:
        bad('页面里有 %d 处未替换的占位符: %s' % (len(leftovers), sorted(set(leftovers))[:5]))
    else:
        ok('没有未替换的占位符')

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
