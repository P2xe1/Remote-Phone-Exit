# -*- coding: utf-8 -*-
"""
check_secrets.py —— 提交前的凭据自检（建议放进 pre-commit / CI）

用法:
    python tools/check_secrets.py            # 扫当前仓库
    python tools/check_secrets.py <目录>      # 扫指定目录

判定分两级：
  致命（exit 1，禁止提交）：API 令牌、私钥、明文口令、账号/命名空间 ID、真实自有域名
  提示（exit 0，只列出来给你看一眼）：公开的 CDN 地址段、公共 DNS、示例值

为什么要分级：如果连 Cloudflare 公开网段都算"失败"，这个脚本每天都会红，
久了就没人看它了 —— 那才是真正的风险。
"""
import io
import os
import re
import sys

ROOT = sys.argv[1] if len(sys.argv) > 1 else '.'
SKIP_DIRS = {'.git', '__pycache__', 'node_modules', '.venv', 'venv'}
SKIP_EXT = {'.png', '.jpg', '.jpeg', '.gif', '.webp', '.ico', '.zip', '.gz',
            '.pdf', '.woff', '.woff2', '.map'}

# 允许出现的公开地址 / 示例值 / 变量名 / 常见误报词
ALLOW_SUBSTR = (
    'example.com', 'example.org', 'example.net', 'your_', 'change_me',
    'WORKER_HOST', 'TUNNEL_HOST', 'CF_ANCHOR', 'RELAY_TARGET_IP', 'USER_TOKEN',
    '198.51.100.', '203.0.113.', '192.0.2.',                      # RFC 5737 文档段
    '127.0.0.1', '0.0.0.0', '255.255.255.255',
    '8.8.8.8', '8.8.4.4', '1.1.1.1', '1.0.0.1', '9.9.9.9',        # 公共 DNS
    '223.5.5.5', '223.6.6.6', '119.29.29.29', '114.114.114.114', '180.76.76.76',
    'LASTEXITCODE', 'SURFACELAPTOP', 'USERPROFILE', 'LOCALAPPDATA', 'APPDATA',
    'localhost', 'github.com', 'cloudflare.com', 'workers.dev',
)

# 公开的 CDN 地址段（Cloudflare 官方公布）—— 出现它们不算泄密
PUBLIC_CDN = re.compile(
    r'^(?:'
    r'103\.21\.244\.|103\.22\.200\.|103\.31\.4\.|'
    r'104\.16\.|104\.17\.|104\.18\.|104\.19\.|104\.20\.|104\.21\.|104\.22\.|'
    r'104\.23\.|104\.24\.|104\.25\.|104\.26\.|104\.27\.|'
    r'131\.0\.72\.|141\.101\.64\.|'
    r'162\.158\.|162\.159\.|172\.64\.|172\.65\.|172\.66\.|172\.67\.|'
    r'173\.245\.48\.|188\.114\.96\.|188\.114\.97\.|190\.93\.240\.|197\.234\.240\.'
    r')')

FATAL = [
    ('Cloudflare API 令牌', re.compile(r'cfut_[A-Za-z0-9_\-]{20,}')),
    ('GitHub 令牌', re.compile(r'gh[pousr]_[A-Za-z0-9]{20,}')),
    ('私钥内容', re.compile(r'-----BEGIN [A-Z ]*PRIVATE KEY-----')),
    ('AWS Access Key', re.compile(r'\bAKIA[0-9A-Z]{16}\b')),
    ('平台密钥样式', re.compile(r'\b(?:sk|xox[baprs])[-_][A-Za-z0-9_\-]{20,}')),
    ('32 位十六进制 ID（账号 / KV 命名空间）', re.compile(r'\b(?=[0-9a-f]*[a-f])[0-9a-f]{32}\b')),
    ('明文口令赋值', re.compile(
        r'(?i)(?:password|passwd|secret|api_?key)\s*[:=]\s*["\']'
        r'(?!\$\{|change_me|your_|<|YOUR_)[^"\'\s]{8,}["\']')),
    ('自有域名（可注册后缀，非 example）', re.compile(
        r'\b[a-z0-9][a-z0-9\-]{2,30}\.(?:xyz|top|stream|site|online|shop|club|icu|fun|live|vip)\b', re.I)),
]

INFO = [
    ('公网 IPv4（含公开 CDN 段）', re.compile(r'\b(?:\d{1,3}\.){3}\d{1,3}\b')),
]


def allowed(s):
    return any(a in s for a in ALLOW_SUBSTR)


fatal, info = [], []
scanned = 0

for dirpath, dirnames, filenames in os.walk(ROOT):
    dirnames[:] = [d for d in dirnames if d not in SKIP_DIRS]
    for fn in filenames:
        if os.path.splitext(fn)[1].lower() in SKIP_EXT:
            continue
        path = os.path.join(dirpath, fn)
        try:
            if os.path.getsize(path) > 5_000_000:
                continue
            with io.open(path, encoding='utf-8', errors='ignore') as f:
                txt = f.read()
        except Exception:
            continue
        scanned += 1
        rel = path.replace(ROOT, '.').replace('\\', '/').lstrip('/')
        for i, line in enumerate(txt.split('\n'), 1):
            for label, rx in FATAL:
                for m in rx.finditer(line):
                    s = m.group(0)
                    if allowed(s) or allowed(line):
                        continue
                    fatal.append((rel, i, label, s[:6] + '…' + s[-4:] if len(s) > 12 else s))
            for label, rx in INFO:
                for m in rx.finditer(line):
                    s = m.group(0)
                    if allowed(s) or allowed(line):
                        continue
                    parts = s.split('.')
                    if len(parts) != 4 or any(int(p) > 255 for p in parts):
                        continue
                    if parts[0] in ('10', '127') or (parts[0] == '192' and parts[1] == '168'):
                        continue
                    if parts[0] == '172' and 16 <= int(parts[1]) <= 31:
                        continue
                    if PUBLIC_CDN.match(s):
                        info.append((rel, i, '公开 CDN 地址段（无需处理）', s))
                    else:
                        info.append((rel, i, '非公开网段的公网 IP（请确认是否必要）', s))

print('已扫描 %d 个文件\n' % scanned)

# ---------------------------------------------------------------
# 专项检查：节点清单（RAW_NODES）里不允许出现写死的地址
#   为什么单列这一条：节点清单是使用者自己的配置资产，属于"你的系统"，
#   不该出现在外发模板里；而它长得像普通 IP，容易被通用规则漏掉。
# ---------------------------------------------------------------
node_leaks = []
for dirpath, dirnames, filenames in os.walk(ROOT):
    dirnames[:] = [d for d in dirnames if d not in SKIP_DIRS]
    for fn in filenames:
        if not fn.endswith(('.js', '.mjs', '.json', '.py', '.sh')):
            continue
        path = os.path.join(dirpath, fn)
        rel = path.replace(ROOT, '.').replace('\\', '/').lstrip('/')
        try:
            with io.open(path, encoding='utf-8', errors='ignore') as f:
                txt = f.read()
        except Exception:
            continue
        m = re.search(r'RAW_NODES\s*=\s*\[(.*?)\n\s*\];', txt, re.S)
        if not m:
            continue
        for sm in re.finditer(r'server:\s*"([^"]+)"', m.group(1)):
            val = sm.group(1)
            if '${' in val or val.startswith('your_'):
                continue                      # 占位符 = 正确做法
            line = txt[:m.start(1) + sm.start()].count('\n') + 1
            node_leaks.append((rel, line, val))

if node_leaks:
    print('❌ 致命：节点清单里有 %d 处写死的地址（应改为占位符）:\n' % len(node_leaks))
    for rel, line, val in node_leaks[:20]:
        print('  %-50s :%-6d server: "%s"' % (rel, line, val))
    if len(node_leaks) > 20:
        print('  … 其余 %d 处省略' % (len(node_leaks) - 20))
    print('\n  改法：server 值写成 ${NODE_01_IP} 这类占位符，真实值放 .env（已被忽略）\n')
    fatal.extend(node_leaks)

if fatal:
    print('❌ 致命：发现 %d 处疑似真实凭据 —— 不要提交！\n' % len(fatal))
    for rel, line, label, masked in fatal[:60]:
        print('  %-50s :%-6d [%s] %s' % (rel, line, label, masked))
    if len(fatal) > 60:
        print('  … 其余 %d 处省略' % (len(fatal) - 60))
    print()
else:
    print('✅ 致命项：未发现真实凭据\n')

if info:
    # 只按类型汇总 + 取样，避免刷屏
    by_label = {}
    for rel, line, label, s in info:
        by_label.setdefault(label, []).append((rel, line, s))
    print('ℹ 提示：%d 处地址类内容（不阻塞提交）：' % len(info))
    for label, items in by_label.items():
        files = sorted({r for r, _, _ in items})
        print('   [%s] %d 处，涉及 %d 个文件' % (label, len(items), len(files)))
        for r, ln, s in items[:3]:
            print('      %s :%d  %s' % (r, ln, s))
        if len(items) > 3:
            print('      … 其余 %d 处省略' % (len(items) - 3))
    print()

sys.exit(1 if fatal else 0)
