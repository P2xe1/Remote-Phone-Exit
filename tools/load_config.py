# -*- coding: utf-8 -*-
"""
load_config.py —— 统一读取配置（环境变量优先，其次读同目录/上级目录的 .env）

用法：
    from load_config import cfg
    token = cfg('CF_API_TOKEN', required=True)

原则：仓库里永远不写真实凭据；真实值只存在于 .env 或环境变量里。
"""
import io
import os
import sys

_cache = {}


def _parse_env_file(path):
    data = {}
    try:
        with io.open(path, encoding='utf-8') as f:
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


def _load_all():
    if _cache:
        return _cache
    # 依次尝试：当前目录、上级目录、项目根
    here = os.path.dirname(os.path.abspath(__file__))
    for cand in (os.path.join(os.getcwd(), '.env'),
                 os.path.join(here, '.env'),
                 os.path.join(os.path.dirname(here), '.env'),
                 os.path.join(os.path.dirname(os.path.dirname(here)), '.env')):
        if os.path.exists(cand):
            _cache.update(_parse_env_file(cand))
    _cache.update({k: v for k, v in os.environ.items() if k.startswith(('CF_', 'WORKER_', 'TUNNEL_', 'ADMIN_', 'SYNC_', 'VLESS_', 'PHONE_', 'RELAY_'))})
    return _cache


def cfg(key, default=None, required=False):
    val = _load_all().get(key, default)
    if required and (val is None or val == '' or str(val).startswith('your_')):
        print('[!] 缺少配置项 %s' % key)
        print('    请复制 .env.example 为 .env 并填入真实值。' % ())
        sys.exit(2)
    return val


if __name__ == '__main__':
    # 自检：python tools/load_config.py
    need = ['CF_API_TOKEN', 'CF_ACCOUNT_ID', 'CF_SCRIPT_NAME', 'CF_KV_NAMESPACE_ID']
    print('配置文件查找结果：')
    for k in need:
        v = cfg(k)
        shown = (v[:6] + '…' + v[-4:]) if v and len(v) > 12 else (v or '(未设置)')
        print('   %-22s %s' % (k, shown))
