import urllib.request

sys.path.insert(0, __import__("os").path.dirname(__import__("os").path.abspath(__file__)))
from load_config import cfg  # noqa: E402  （同目录的配置读取器）
import json
import time
import subprocess
import socket
import base64
import os
import sys

sys.stdout.reconfigure(encoding='utf-8')

CHROME_PATH = r"C:\Program Files\Google\Chrome\Application\chrome.exe"
PORT = 9222
ADMIN_PWD = "${ADMIN_PASSWORD}"
BASE_URL = "https://${WORKER_HOST}"

def test_api_stats():
    print("--- [1/4] Auditing /api/stats_data ---")
    url = f"{BASE_URL}/api/stats_data?pwd={ADMIN_PWD}&_t={int(time.time()*1000)}"
    req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
    t0 = time.time()
    with urllib.request.urlopen(req, timeout=10) as resp:
        elapsed = (time.time() - t0) * 1000
        assert resp.status == 200, f"HTTP status is {resp.status}"
        data = json.loads(resp.read().decode('utf-8'))
    
    print(f"  [+] HTTP Status: 200 OK ({elapsed:.1f}ms)")
    print(f"  [+] isOnline: {data.get('isOnline')}")
    
    tel = data.get('telemetry', {})
    print(f"  [+] Telemetry: Battery {tel.get('battery',{}).get('level')}% ({tel.get('battery',{}).get('temp')}°C) | Wi-Fi {tel.get('wifi',{}).get('ssid')} ({tel.get('wifi',{}).get('rssi')}dBm) | Uptime {tel.get('uptime')} | Sockets {tel.get('sockets')}")
    
    pings = data.get('pings', {})
    jitters = data.get('jitters', {})
    print(f"  [+] Gateways: KL={pings.get('kl')}ms (±{jitters.get('kl')}) | HK={pings.get('hk')}ms | SG={pings.get('sg')}ms | TW={pings.get('tw')}ms | JP={pings.get('jp')}ms | Egress={pings.get('egress')}ms")
    
    hist = data.get('history15m', [])
    print(f"  [+] Oscilloscope history: {len(hist)}/30 sample points (Latest: {hist[-1] if hist else 'N/A'})")
    
    users = data.get('users', [])
    print(f"  [+] Authorized Users: {len(users)} users configured")
    for u in users:
        print(f"      - {u.get('name')}: Online={u.get('online')} | RateDown={u.get('rateDown')}B/s | RateUp={u.get('rateUp')}B/s | LastActive={u.get('lastActive')} | Total={u.get('totalTraffic')}B")
        assert 'online' in u, "Missing 'online' in user object"
        assert 'rateDown' in u, "Missing 'rateDown' in user object"
        assert 'rateUp' in u, "Missing 'rateUp' in user object"
    
    tot_down = data.get('downBytes', 0)
    tot_up = data.get('upBytes', 0)
    print(f"  [+] Grand Total: {(tot_down+tot_up)/(1024**3):.2f} GB (Down: {tot_down/(1024**3):.2f} GB, Up: {tot_up/(1024**2):.2f} MB)")
    return True

def test_subscription():
    print("\n--- [2/4] Auditing /sub (Clash & V2Ray) ---")
    # Clash
    clash_url = f"{BASE_URL}/sub?token=USER_TOKEN_1&type=clash"
    req = urllib.request.Request(clash_url, headers={'User-Agent': 'ClashMeta'})
    with urllib.request.urlopen(req, timeout=10) as resp:
        content = resp.read().decode('utf-8')
        node_count = content.count('- name:')
        has_proxy = 'PROXY' in content
        has_auto = 'AUTO - 自动选优' in content
        has_fallback = 'FALLBACK - 故障转移' in content
        # 【2026-10-06 修复 · Bug6】订阅分组已按用户决策精简为
        #   PROXY / AUTO / FALLBACK 三个核心组，专线组与地区组全部删除。
        #   这里原来还断言旧组存在 => 脚本第 2 步必然崩溃（0 项通过）。
        print(f"  [+] Clash Subscription: {node_count} nodes | PROXY={has_proxy} | AUTO={has_auto} | FALLBACK={has_fallback}")
        assert node_count >= 50, f"Expected >= 50 nodes, got {node_count}"
        assert has_proxy and has_auto and has_fallback, "Missing core proxy groups"

    # V2Ray
    v2ray_url = f"{BASE_URL}/sub?token=USER_TOKEN_2&type=v2ray"
    req2 = urllib.request.Request(v2ray_url, headers={'User-Agent': 'v2rayNG'})
    with urllib.request.urlopen(req2, timeout=10) as resp2:
        raw_b64 = resp2.read().decode('utf-8')
        decoded = base64.b64decode(raw_b64).decode('utf-8')
        vless_count = decoded.count('vless://')
        print(f"  [+] V2Ray Subscription: Decoded {vless_count} vless:// links (Base64 Valid)")
        assert vless_count >= 50, f"Expected >= 50 vless links, got {vless_count}"
    return True

def test_admin_html():
    print("\n--- [3/4] Auditing /admin HTML DOM Elements ---")
    url = f"{BASE_URL}/admin?pwd={ADMIN_PWD}"
    req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
    with urllib.request.urlopen(req, timeout=10) as resp:
        html = resp.read().decode('utf-8')
    
    checks = {
        '2s Polling Button': 'id="btnFreq2s"' in html,
        '60s Polling Button': 'id="btnFreq60s"' in html,
        'Default 60s Active': 'id="btnFreq60s" class="freq-btn active"' in html,
        'Data Freshness Tag': 'id="dataFreshnessTag"' in html,
        'Client->Edge Badge': 'id="pipeClientEdge"' in html,
        'Edge->Argo Badge': 'id="pipeEdgeArgo"' in html,
        'Argo->Phone Badge': 'id="pipeArgoPhone"' in html,
        'Phone->Egress Badge': 'id="pipePhoneEgress"' in html,
        'Total E2E Badge': 'id="totalE2E"' in html,
        # 【2026-10-06 修复】原检查项"5 Regional Gateways"要求页面上存在
        #   gwKlRtt..gwJpRtt 五个区域网关元素，但该 UI 区块已按用户要求从大屏删除
        #   （线上实测 5 个 id 命中均为 0），断言永远失败。改为检查现在真实存在、
        #   且有实际数据来源的两个带宽峰值面板（手机端 bwPeak 上报 -> 大屏显示）。
        'Bandwidth Peak Panels': all(f'id="{_b}"' in html for _b in ['bwPeak15m', 'bwPeakDay']),
        'User Table': 'id="userTableBody"' in html,
        # 【2026-10-06 修复】原检查依赖旧表头文字"连接状态 (5秒检测)"，
        #   该文案已随 UI 改版改为"连接状态（独立板块）"，断言永远失败。
        #   改为检查该板块真实存在的两个元素 id（连接数/峰值）。
        'Connection Status Section': ('id="connCount"' in html and 'id="connPeak"' in html),
        'Rank List': 'id="rankList"' in html,
        'Oscilloscope Canvas': 'id="liveChart"' in html,
        'Bandwidth Gauge Canvas': 'id="gaugeChart"' in html
    }
    for name, ok in checks.items():
        print(f"  [{'PASS' if ok else 'FAIL'}] {name}")
        assert ok, f"Check failed for {name}"
    return True

def test_headless_chrome():
    print("\n--- [4/4] Auditing Live Browser UI with Headless Chrome (CDP) ---")
    cmd = [
        CHROME_PATH,
        "--headless=new",
        f"--remote-debugging-port={PORT}",
        "--disable-gpu",
        "--no-sandbox",
        "--user-data-dir=" + os.path.join(os.environ.get("TEMP", "C:\\temp"), "chrome_full_audit")
    ]
    proc = subprocess.Popen(cmd, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    time.sleep(2)

    try:
        url = f"{BASE_URL}/admin?pwd={ADMIN_PWD}"
        new_tab_url = f"http://127.0.0.1:{PORT}/json/new?{url}"
        req = urllib.request.Request(new_tab_url, method="PUT")
        with urllib.request.urlopen(req) as resp:
            tab = json.loads(resp.read().decode())
        
        ws_url = tab.get("webSocketDebuggerUrl")
        path = "/" + ws_url.split("/", 3)[3]
        s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        s.connect(("127.0.0.1", PORT))
        
        key = base64.b64encode(os.urandom(16)).decode()
        handshake = (
            f"GET {path} HTTP/1.1\r\n"
            f"Host: 127.0.0.1:{PORT}\r\n"
            "Upgrade: websocket\r\n"
            "Connection: Upgrade\r\n"
            f"Sec-WebSocket-Key: {key}\r\n"
            "Sec-WebSocket-Version: 13\r\n\r\n"
        )
        s.sendall(handshake.encode())
        
        buf = b""
        while b"\r\n\r\n" not in buf:
            buf += s.recv(4096)
        
        def send_ws(msg):
            data = json.dumps(msg).encode()
            frame = bytearray()
            frame.append(0x81)
            length = len(data)
            mask = os.urandom(4)
            if length < 126:
                frame.append(0x80 | length)
            elif length <= 65535:
                frame.append(0x80 | 126)
                frame.extend(length.to_bytes(2, "big"))
            else:
                frame.append(0x80 | 127)
                frame.extend(length.to_bytes(8, "big"))
            frame.extend(mask)
            masked = bytearray(b ^ mask[i % 4] for i, b in enumerate(data))
            frame.extend(masked)
            s.sendall(frame)

        def recv_ws():
            s.settimeout(5.0)
            hdr = s.recv(2)
            if not hdr: return None
            b1, b2 = hdr[0], hdr[1]
            length = b2 & 0x7F
            if length == 126:
                length = int.from_bytes(s.recv(2), "big")
            elif length == 127:
                length = int.from_bytes(s.recv(8), "big")
            payload = bytearray()
            while len(payload) < length:
                payload.extend(s.recv(length - len(payload)))
            return json.loads(payload.decode('utf-8', errors='ignore'))

        def eval_js(expr):
            msg_id = int(time.time() * 1000) % 100000
            send_ws({"id": msg_id, "method": "Runtime.evaluate", "params": {"expression": expr, "returnByValue": True}})
            while True:
                res = recv_ws()
                if res and res.get("id") == msg_id:
                    return res.get("result", {}).get("result", {}).get("value")

        print("  [*] Waiting 3 seconds for initial page render...")
        time.sleep(3)

        # Check initial default 60s mode
        initial_state = eval_js("""(() => {
            return {
                b2Active: document.getElementById('btnFreq2s')?.classList.contains('active'),
                b60Active: document.getElementById('btnFreq60s')?.classList.contains('active'),
                freshness: document.getElementById('dataFreshnessTag')?.innerText,
                totalBytes: document.getElementById('totalBytes')?.innerText
            };
        })()""")
        print(f"  [+] Initial State: 60s active={initial_state.get('b60Active')} | 2s active={initial_state.get('b2Active')} | Freshness={initial_state.get('freshness')} | TotalBytes={initial_state.get('totalBytes')}")
        assert initial_state.get('b60Active') is True, "Default mode should be 60s active"

        # Switch to 2s sampling mode
        print("  [*] Clicking '⚡ 2秒极速' button...")
        eval_js("document.getElementById('btnFreq2s').click()")

        # Verify button switch
        switched_state = eval_js("""(() => {
            return {
                b2Active: document.getElementById('btnFreq2s')?.classList.contains('active'),
                b60Active: document.getElementById('btnFreq60s')?.classList.contains('active')
            };
        })()""")
        print(f"  [+] Switch Result: 2s active={switched_state.get('b2Active')} | 60s active={switched_state.get('b60Active')}")
        assert switched_state.get('b2Active') is True and switched_state.get('b60Active') is False

        # Sample across two 2s polls
        print("  [*] Sampling DOM values across 2s polls...")
        time.sleep(2.5)
        poll1 = eval_js("""(() => {
            return {
                ce: document.getElementById('pipeClientEdge')?.innerText,
                ea: document.getElementById('pipeEdgeArgo')?.innerText,
                ap: document.getElementById('pipeArgoPhone')?.innerText,
                pe: document.getElementById('pipePhoneEgress')?.innerText,
                e2e: document.getElementById('totalE2E')?.innerText,
                p15: document.getElementById('bwPeak15m')?.innerText,
                pdy: document.getElementById('bwPeakDay')?.innerText,
                freshness: document.getElementById('dataFreshnessTag')?.innerText
            };
        })()""")
        print(f"      Poll 1: Freshness={poll1.get('freshness')} | E2E={poll1.get('e2e')} (Hops: {poll1.get('ce')} -> {poll1.get('ea')} -> {poll1.get('ap')} -> {poll1.get('pe')}) | Peak15m={poll1.get('p15')} PeakDay={poll1.get('pdy')}")

        time.sleep(2.5)
        poll2 = eval_js("""(() => {
            return {
                ce: document.getElementById('pipeClientEdge')?.innerText,
                ea: document.getElementById('pipeEdgeArgo')?.innerText,
                ap: document.getElementById('pipeArgoPhone')?.innerText,
                pe: document.getElementById('pipePhoneEgress')?.innerText,
                e2e: document.getElementById('totalE2E')?.innerText,
                p15: document.getElementById('bwPeak15m')?.innerText,
                pdy: document.getElementById('bwPeakDay')?.innerText,
                freshness: document.getElementById('dataFreshnessTag')?.innerText
            };
        })()""")
        print(f"      Poll 2: Freshness={poll2.get('freshness')} | E2E={poll2.get('e2e')} (Hops: {poll2.get('ce')} -> {poll2.get('ea')} -> {poll2.get('ap')} -> {poll2.get('pe')}) | Peak15m={poll2.get('p15')} PeakDay={poll2.get('pdy')}")

        # Inspect table rows
        rows = eval_js("""(() => {
            const list = [];
            document.querySelectorAll('#userTableBody tr').forEach(tr => {
                const tds = tr.querySelectorAll('td');
                if (tds.length >= 8) {
                    list.push({
                        name: tds[0].innerText.trim(),
                        status: tds[2].innerText.trim(),
                        conn: tds[3].innerText.trim().replace(/\\n/g, ' '),
                        pulls: tds[4].innerText.trim()
                    });
                }
            });
            return list;
        })()""")
        print("\n  [+] Live User Table DOM Status:")
        for r in rows:
            print(f"      - {r.get('name'):<8} | {r.get('status')} | {r.get('conn')} | Sync: {r.get('pulls')}")

        # Inspect rank items
        ranks = eval_js("""(() => {
            const list = [];
            document.querySelectorAll('#rankList .rank-item').forEach(el => {
                list.push(el.innerText.trim().replace(/\\n/g, ' '));
            });
            return list;
        })()""")
        print("\n  [+] Live Rank List DOM Badges:")
        for r in ranks:
            print(f"      - {r}")

    finally:
        proc.terminate()
    return True

if __name__ == "__main__":
    print("==================================================")
    print("      END-TO-END FULL SYSTEM HEALTH AUDIT        ")
    print("==================================================")
    
    t_start = time.time()
    ok1 = test_api_stats()
    ok2 = test_subscription()
    ok3 = test_admin_html()
    ok4 = test_headless_chrome()
    
    print("\n==================================================")
    if ok1 and ok2 and ok3 and ok4:
        print(f"ALL SYSTEMS VERIFIED & 100% OPERATIONAL! ({time.time()-t_start:.2f}s)")
    else:
        print("AUDIT ENCOUNTERED ISSUES")
    print("==================================================")
