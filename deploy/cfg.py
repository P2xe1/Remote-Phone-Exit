# -*- coding: utf-8 -*-
"""
cfg.py —— 统一的配置读取（环境变量优先，其次 .env）

所有脚本都通过它拿配置，所以只有一处需要维护 .env。
"""
import io
import os
import sys

_cache = {}


def _parse_env(path):
    data = {}
    try:
        with io.open(path, encoding='utf-8-sig') as f:
            for line in f:
                line = line.strip()
                if not line or line.startswith('#') or '=' not in line:
                    continue
                k, v = line.split('=', 1)
                k, v = k.strip(), v.strip().strip('"').strip("'")
                if k:
                    data[k] = v
    except Exception:
        pass
    return data


def _find_env():
    here = os.path.dirname(os.path.abspath(__file__))
    cands = [os.path.join(os.getcwd(), '.env'),
             os.path.join(here, '.env'),
             os.path.join(os.path.dirname(here), '.env'),
             os.path.join(os.path.dirname(os.path.dirname(here)), '.env')]
    for c in cands:
        if os.path.exists(c):
            return c
    return None


def all_config():
    if _cache:
        return _cache
    p = _find_env()
    if p:
        _cache['__env_file__'] = p
        _cache.update(_parse_env(p))
    # 环境变量覆盖 .env
    for k, v in os.environ.items():
        if k.startswith(('CF_', 'WORKER_', 'TUNNEL_', 'ADMIN_', 'SYNC_',
                         'VLESS_', 'PHONE_', 'RELAY_', 'NODE_')):
            _cache[k] = v
    return _cache


def cfg(key, default=None, required=False):
    v = all_config().get(key, default)
    if required and (not v or str(v).startswith(('your_', 'CHANGE_ME'))):
        print('[!] 缺少配置项 %s' % key)
        print('    请复制 .env.example 为 .env 并填入真实值。')
        sys.exit(2)
    return v


def env_file():
    return all_config().get('__env_file__')


def node_ips():
    """返回 [(序号, IP), ...]，按 NODE_01_IP … NODE_99_IP 顺序。"""
    c = all_config()
    out = []
    for k, v in c.items():
        if k.startswith('NODE_') and k.endswith('_IP'):
            try:
                idx = int(k[5:-3])
            except ValueError:
                continue
            out.append((idx, v))
    return sorted(out)


if __name__ == '__main__':
    print('.env 文件 :', env_file() or '(未找到)')
    for k in ('CF_API_TOKEN', 'CF_ACCOUNT_ID', 'CF_SCRIPT_NAME', 'CF_KV_NAMESPACE_ID',
              'WORKER_HOST', 'TUNNEL_HOST', 'ADMIN_PASSWORD', 'SYNC_SECRET', 'VLESS_UUID'):
        v = cfg(k)
        show = (v[:6] + '…' + v[-4:]) if v and len(v) > 12 else (v or '(未设置)')
        print('  %-20s %s' % (k, show))
    ips = node_ips()
    print('  节点地址            %d 个' % len(ips))
