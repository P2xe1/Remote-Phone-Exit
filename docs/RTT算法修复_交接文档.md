# RTT 算法修复 · 交接文档（给另一个 AI）

> 生成时间：2026-10-04
> 任务：修复 NOC 大屏「跨境出口物理链路全景遥测」卡片的 RTT 算法（用户已选定 **A + C 合并方案**）
> 本文档分三部分：① 可直接粘贴的提示词 ② 完整技术步骤 ③ 验收标准 / 坑位 / 回滚点

---

# ① 提示词（整段复制给另一个 AI）

```
你是资深 Cloudflare Workers + Android shell 工程师。请修复一个生产环境 NOC 监控系统的 RTT 显示算法。

【项目位置】C:\Users\SURFACELAPTOP STUDIO\Desktop\goofy-planck
【必读】先读同目录下的《RTT算法修复_交接文档.md》全文，里面有你需要的全部上下文、精确代码锚点、验收标准和必须遵守的操作纪律。不要凭记忆改代码，每一处改动前先用 read/grep 确认当前行号与代码。

【系统架构】
- Cloudflare Worker（脚本名 my-worker，域名 ${WORKER_HOST}），主文件 worker_deploy.js（约 6800 行，HTML/CSS/JS 全部内嵌其中）
- 手机（${DEVICE_NAME}，adb 序列号 ${PHONE_SERIAL}）跑 xray + cloudflared，脚本在 /data/local/tmp/
- 数据流：手机每 ~6 秒 POST 遥测到 /api/report_traffic → Worker 存快照 → 大屏 /admin 轮询 /api/stats_data + 长轮询 /api/live
- 本地仓库里的 phone_report_traffic.sh 是手机 /data/local/tmp/report_traffic.sh 的镜像；ping_scheduler.sh / fast_scan.sh / node_probe.sh / traffic_daemon.sh / run_daemon.sh / sync_worker.sh 同名对应

【要修的问题】
卡片「跨境出口物理链路全景遥测」底部的"各段真实 RTT 之和"在 200ms ~ 900ms 之间乱跳。根因是把 4 个不同设备、不同时刻、不同口径的数字硬加在一起，其中最大的一段根本不是网络时延：
1. 浏览器↔边缘：/api/rtt 探针的 performance.now() 差，单次采样无中位数
2. 边缘计算耗时 serverMs：Worker 自己跑代码的耗时（含 KV 读），被当成网络时延加进总和
3. 手机↔边缘：手机 curl %{time_appconnect} 到 cloudflare.com anycast IP，TLS 握手 ≈2×RTT
4. 手机↔公网：手机 curl %{time_connect} 到 8.8.8.8，TCP 1×RTT（与第 3 段口径不同却直接相加）

【要实现的目标（方案 A + C）】
A. 口径纠正：
   - 把 serverMs 从"RTT 之和"里彻底剔除，单独灰字显示并标注"边缘计算耗时（非网络）"
   - 浏览器侧 /api/rtt 改为滚动中位数（最近 5 次采样的中位数，节流 15 秒不变、请求数不增加）
   - 手机侧新增探针：对 https://${TUNNEL_HOST}/kl 测 %{time_connect}（TCP 1×RTT），连测 3 次取中位数，作为第 3 段替代 pings.kl，使口径与浏览器侧统一为 RTT
   - 新的总和 = 浏览器↔边缘中位 + 手机↔边缘中位 + 手机↔公网中位，标题注明"三段单次 RTT 之和（非单条端到端路径）"
C. 统计化抗抖：
   - 每段维护最近 10 个样本（浏览器内存维护，零额外网络请求）
   - 每段显示"中位 X ms"，鼠标悬停 title 显示"波动 min~max（N 个样本）"
   - 样本不足 3 个时如实显示 "--"，绝不编造

【硬约束（违反即失败）】
1. 对用户网络性能的影响必须 ≤8%：本方案实测影响约 0.01%（手机每 60 秒多 1 次探测 ≈ 7MB/天，且不经过 xray 转发路径）。不要新增任何高频请求，不要改 xray 配置与转发逻辑。
2. KV 免费额度：read 100,000/天、write 1,000/天。不得新增 KV 读。
3. 不允许任何假数据：没有数据就显示 "--" / "未测到"。
4. 6 大地区矩阵卡片的 pings/jitters/pingTimes 语义保持原样，不要改动 measure_anchor。

【必须遵守的操作纪律（这个项目踩过的坑）】
1. 手机 /system/bin/sh 是 32 位算术：date +%s%N（约1.79e18）一进 $(()) 就溢出成负数。绝对时刻只能用 date +%s；要亚秒精度只能取纳秒串后 9 位（date +%s%N | tail -c 9）。
2. PowerShell 内联 Python / 复杂引号必炸：一律用 write 工具写 .py / .sh 文件再执行；adb 多语句写成文件 push 后 adb shell 'sh 文件'。
3. pgrep -f 会匹配自己的命令行：数进程用 ps -A -o PID,PPID,ARGS。
4. 手机脚本改完必须重启进程才生效：用 sh /data/local/tmp/run_daemon.sh（已修好，会杀掉全部旧进程再拉起）。
5. 部署输出绝对不能截断（曾因此误判成功很久），要看完整输出。
6. 部署后至少等 30 秒再验证线上版本。
7. 判定部署成功要比对三处 BUILD_ID：worker_deploy.js 里的 const BUILD_ID、页面里的 window.__pageBuild、/api/live 返回的 buildId，三者必须一致。
8. 杀进程只用精确 PID，不要用宽匹配 pkill -f xray。
9. 手机是 shell uid=2000 非 root（/data/data 不可读）。手机脚本必须 LF 换行。
10. 仓库根目录的 report_traffic.sh 是旧版本，手机对应的是 phone_report_traffic.sh，两者 md5 必须一致，别改错文件。
11. 部署命令：python cf_deploy.py <CF_API_TOKEN>（token 存在项目目录的 .cf_token 文件里）。部署器会自动备份、注入 BUILD_ID（失败即中止）、内嵌 Chart.js、合并 bindings、失败自动回滚。

【交付要求】
1. 按文档②的步骤逐项实施，每条改动前后都用 read/grep 确认代码位置
2. 部署 Worker + 部署手机脚本 + 重启进程
3. 按文档③逐条验收，并给出实测证据（命令输出），不要只说"应该可以"
4. 如果某一步失败，如实报告失败现象与完整错误输出，不要跳过
5. 最后输出：改了哪些文件、每个文件改了什么、验收结果、回滚点路径

现在开始。先读《RTT算法修复_交接文档.md》，然后报告你确认到的当前代码锚点（文件:行号），再动手。
```

---

# ② 完整技术步骤

## 0. 现状确认（动手前必须自己 grep 验证行号，本文件行号为 2026-10-04 快照）

| 段落 | 变量 | 代码位置 | 真实含义 |
|---|---|---|---|
| 浏览器↔边缘 | `lastClientRttMs` | `worker_deploy.js:6743` `probeClientRtt()` | `fetch('/api/rtt')` 的 performance.now() 差，15 秒节流，**单次采样** |
| 边缘计算耗时 | `d.serverMs` | `worker_deploy.js:4395` `payload.serverMs = Date.now() - reqStartMs` | Worker 处理 `/api/stats_data` 的耗时（KV 读+合并+序列化），**非网络** |
| 手机↔边缘 | `d.pings.kl` | `ping_scheduler.sh:46-78` `measure_anchor()` | 手机 `curl %{time_appconnect}` 到 `cloudflare.com` 的 anycast IP，**TLS 握手 ≈2×RTT**，10 次中位 |
| 手机↔公网 | `d.pings.egress` | `ping_scheduler.sh:262-268` | 手机 `curl %{time_connect}` 到 `8.8.8.8`，**TCP 1×RTT**，单次 |

前端求和位置：`worker_deploy.js:6247-6275`
- `clientEdgeVal` = `lastClientRttMs`
- `serverProcVal` = `d.serverMs`
- `argoPhoneVal` = `d.pings.kl`
- `phoneEgressVal` = `d.pings.egress`
- `totalE2eEl` = 四者相加 → 显示在 `#totalE2E`

实测证据（供参考）：
- `payload.serverMs` 在 **25 ~ 165ms** 之间跳，冷读 KV 时可达 400ms —— 这一项就能单独造成 300ms+ 的波动
- 连续 10 次 `/api/rtt`：104 / 218 / 105 / 104 / 122 / 116 / 125 / 107 / 123 / 116 ms → **极差 114ms（1 倍）**
- 手机 `kl` 段与 `egress` 段口径不同（2×RTT vs 1×RTT）

---

## 1. 手机端改动

### 1.1 `ping_scheduler.sh`

**（a）新增文件变量**（放在 `LAST_PINGS_FILE` 附近，约 15 行处）

```sh
EDGE_RTT_FILE="/data/local/tmp/last_edge_rtt.txt"
P_EDGE_RTT=0
```

**（b）新增函数 `measure_edge_rtt()`**（放在 `measure_anchor()` 之后）

```sh
# 面向真实域名 ${TUNNEL_HOST} 的 TCP 连接时延(1×RTT), 与浏览器侧口径统一。
# 连测 3 次取中位数; 全部失败返回 0(前端显示 --)。
# 注意: 这里刻意使用 time_connect 而非 time_appconnect —— 后者是 TLS 握手(≈2×RTT),
#       与浏览器实测的一个网络往返不是一个量纲, 不能相加。
measure_edge_rtt() {
  _n=0; _v1=0; _v2=0; _v3=0
  for _i in 1 2 3; do
    _T=$(/system/bin/curl --connect-timeout 1 -m 2 -o /dev/null -s \
         -w "%{time_connect}" "https://${TUNNEL_HOST}/kl" 2>/dev/null)
    _V=$(awk -v t="$_T" 'BEGIN{v=int(t*1000); print (v>0?v:0)}')
    if [ "$_V" -gt 0 ]; then
      _n=$((_n + 1))
      case $_n in 1) _v1=$_V;; 2) _v2=$_V;; 3) _v3=$_V;; esac
    fi
  done
  awk -v a="$_v1" -v b="$_v2" -v c="$_v3" 'BEGIN{
    n=0
    if(a>0){v[++n]=a} if(b>0){v[++n]=b} if(c>0){v[++n]=c}
    if(n==0){print 0; exit}
    for(x=1;x<=n;x++) for(y=x+1;y<=n;y++) if(v[x]>v[y]){t=v[x];v[x]=v[y];v[y]=t}
    print v[int((n+1)/2)]
  }'
}
```

**（c）初始化 + 循环开头读取**（初始化放 90 行附近；读取放 `while true` 循环内、`flush_state` 被调用之前）

```sh
# 初始化(仅首次)
[ ! -f "$EDGE_RTT_FILE" ] && echo "0" > "$EDGE_RTT_FILE"

# 循环内(每个区域测量之前)
P_EDGE_RTT=$(cat "$EDGE_RTT_FILE" 2>/dev/null)
[ -z "$P_EDGE_RTT" ] && P_EDGE_RTT=0
```

**（d）`flush_state()` 里输出该字段**（约 103-110 行，JSON 里新增一个键）

```sh
  echo "\"pings\":{...},\"jitters\":{...},\"pingTimes\":{...},\"losses\":{...},\"edgeRtt\":${P_EDGE_RTT:-0},\"activeSlot\":$SLOT,\"activeNode\":\"$ACTIVE_KEY\"," > "$PING_CACHE.tmp" && mv "$PING_CACHE.tmp" "$PING_CACHE"
```
> 注意：现有 `flush_state` 已是"写 .tmp + mv"原子写，保持该写法。

**（e）每轮更新一次**（放在 262-268 行的公网出口探测块旁边）

```sh
  # 手机 ↔ Cloudflare 边缘 (真实域名, TCP 1×RTT)
  P_EDGE_RTT=$(measure_edge_rtt)
  echo "$P_EDGE_RTT" > "$EDGE_RTT_FILE.tmp" && mv "$EDGE_RTT_FILE.tmp" "$EDGE_RTT_FILE"
```

### 1.2 `fast_scan.sh`

同样新增 `measure_edge_rtt()`（可直接复制），并在收尾（126-133 行的公网出口探测之后、最后一次 `flush_state` 之前）更新：

```sh
  P_EDGE_RTT=$(measure_edge_rtt)
  echo "$P_EDGE_RTT" > /data/local/tmp/last_edge_rtt.txt.tmp && mv /data/local/tmp/last_edge_rtt.txt.tmp /data/local/tmp/last_edge_rtt.txt
```
并在 `fast_scan.sh` 的 `flush_state()` JSON 里也加上 `"edgeRtt":${P_EDGE_RTT:-0},`；
初值从 `/data/local/tmp/last_edge_rtt.txt` 读取。

### 1.3 不改动
- `measure_anchor()`（6 大地区矩阵继续用 time_appconnect，保持原语义）
- `report_traffic.sh` / `sync_worker.sh`（`edgeRtt` 随 `ping_cache` 自动被上报带走）

---

## 2. Worker 端改动（`worker_deploy.js`）

### 2.1 上报处理：新增快照字段（约 3844 行，pings 合并处）

```js
// 【RTT 修复】手机↔边缘 的真实单次 RTT(TCP time_connect, 与浏览器侧同口径)
const prevEdge = (globalMemoryStats && typeof globalMemoryStats.edgeRtt === 'number') ? globalMemoryStats.edgeRtt : 0;
const mergedEdgeRtt = (typeof body.edgeRtt === 'number' && body.edgeRtt > 0) ? body.edgeRtt : prevEdge;
```
在快照对象（与 `pings:` 同一层，约 3870-3905 行）里加：
```js
            edgeRtt: mergedEdgeRtt,
```

### 2.2 `/api/stats_data` 出参（约 4185 行，`if (s.pings) payload.pings = s.pings;` 附近）

```js
        if (typeof s.edgeRtt === 'number' && s.edgeRtt > 0) payload.edgeRtt = s.edgeRtt;
```

### 2.3 `/api/live` 出参（`readLiveSnapshot()`，约 3247 行）

```js
    edgeRtt: (typeof s.edgeRtt === 'number' && s.edgeRtt > 0) ? s.edgeRtt : null,
```

### 2.4 前端：滚动中位数工具（放在 `probeClientRtt` 之前，约 6735 行）

```js
            // 【RTT 修复 · 方案 C】最近 N 个样本的中位数与极值(纯内存, 零额外请求)
            function pushSample(arr, v, maxLen) {
              if (typeof v !== 'number' || !isFinite(v) || v <= 0) return arr;
              arr.push(v);
              while (arr.length > (maxLen || 10)) arr.shift();
              return arr;
            }
            function medianOf(arr) {
              if (!arr || arr.length === 0) return null;
              var s = arr.slice().sort(function (a, b) { return a - b; });
              var m = Math.floor(s.length / 2);
              return (s.length % 2) ? s[m] : Math.round((s[m - 1] + s[m]) / 2);
            }
            function rangeOf(arr) {
              if (!arr || arr.length === 0) return null;
              var s = arr.slice().sort(function (a, b) { return a - b; });
              return { min: s[0], max: s[s.length - 1], n: s.length };
            }
            var rttSamples = { client: [], server: [], edge: [], egress: [] };
```

### 2.5 前端：`probeClientRtt()` 里累积样本（约 6743 行）

```js
                if (ms > 0 && ms < 60000) {
                  lastClientRttMs = Math.round(ms);
                  pushSample(rttSamples.client, lastClientRttMs, 10);   // 【新增】
                }
```

### 2.6 前端：全链路卡片重算（替换 6247-6275 行的整段逻辑）

```js
                  // ==========================================================
                  // 全链路遥测 · 三段真实单次 RTT (2026-10-04 算法修复)
                  //   第1段 浏览器 ↔ CF 边缘 : 滚动中位数(最近 5~10 次)
                  //   第2段 CF 边缘处理耗时   : 单列显示, 【不参与求和】(它不是网络时延)
                  //   第3段 手机 ↔ CF 边缘    : 手机实测 TCP time_connect(1×RTT)
                  //   第4段 手机 ↔ 公网出口   : 手机实测 TCP time_connect(1×RTT)
                  //   总和 = 第1 + 第3 + 第4 段的中位数之和
                  // ==========================================================
                  pushSample(rttSamples.server, (typeof d.serverMs === 'number' ? d.serverMs : null), 10);
                  pushSample(rttSamples.edge, (typeof d.edgeRtt === 'number' ? d.edgeRtt : null), 10);
                  if (d.pings && typeof d.pings.egress === 'number') pushSample(rttSamples.egress, d.pings.egress, 10);

                  const clientEdgeVal = medianOf(rttSamples.client);   // 中位数, 抗单次抖动
                  const serverProcVal = medianOf(rttSamples.server);   // 仅展示
                  const argoPhoneVal = (medianOf(rttSamples.edge) !== null)
                        ? medianOf(rttSamples.edge)
                        : ((d.pings && d.pings.kl > 0) ? d.pings.kl : null);   // 回退旧口径
                  const edgeHopsrc = (medianOf(rttSamples.edge) !== null) ? 'TCP time_connect(1×RTT)' : 'TLS time_appconnect(≈2×RTT, 回退值)';
                  const phoneEgressVal = (medianOf(rttSamples.egress) !== null)
                        ? medianOf(rttSamples.egress)
                        : ((d.pings && d.pings.egress > 0) ? d.pings.egress : null);

                  const fmtMs = function (v) {
                    return (v === null || v === undefined || isNaN(v) || v <= 0) ? '-- ms' : (Math.round(v) + ' ms');
                  };
                  const setHop = function (id, val, samples, note) {
                    const el = document.getElementById(id);
                    if (!el) return;
                    el.innerText = fmtMs(val);
                    const r = rangeOf(samples);
                    el.title = (note ? note + '｜' : '') +
                      (r ? ('中位 ' + fmtMs(val) + '，波动 ' + r.min + '~' + r.max + ' ms（' + r.n + ' 个样本）') : '样本不足，显示 --');
                  };

                  setHop('pipeClientEdge', clientEdgeVal, rttSamples.client, '浏览器实测往返(含该次 Worker 处理)');
                  setHop('pipeEdgeArgo', serverProcVal, rttSamples.server, 'CF 边缘处理耗时，非网络时延，不参与求和');
                  setHop('pipeArgoPhone', argoPhoneVal, rttSamples.edge, '手机↔边缘 ' + edgeHopsrc);
                  setHop('pipePhoneEgress', phoneEgressVal, rttSamples.egress, '手机↔公网 锚点 TCP 连接');

                  const totalE2eEl = document.getElementById('totalE2E');
                  if (totalE2eEl) {
                    const parts = [clientEdgeVal, argoPhoneVal, phoneEgressVal]
                        .filter(function (v) { return typeof v === 'number' && v > 0; });
                    totalE2eEl.innerText = parts.length === 3
                        ? (Math.round(parts.reduce(function (a, b) { return a + b; }, 0)) + ' ms')
                        : '-- ms';
                    totalE2eEl.title = '三段单次 RTT 的中位数之和（浏览器↔边缘 + 手机↔边缘 + 手机↔公网）；' +
                                       '边缘计算耗时不计入';
                  }
```

### 2.7 文案修正（约 4954 行）

把 `各段真实 RTT 之和: <b id="totalE2E">-- ms</b>` 改为：
```html
三段真实单次 RTT 之和: <b id="totalE2E">-- ms</b>
```
并把第 2 段（`pipeEdgeArgo`）的 title 改成"CF 边缘处理本次请求的耗时（**非网络时延**，不参与 RTT 求和）"。

---

## 3. 部署

### 3.1 Worker
```powershell
cd "C:\Users\SURFACELAPTOP STUDIO\Desktop\goofy-planck"
# 先语法检查
Copy-Item worker_deploy.js "$env:TEMP\x.mjs" -Force
& "<node.exe 路径>" --check "$env:TEMP\x.mjs"     # rc=0 才继续
# 部署(token 在 .cf_token)
python cf_deploy.py (Get-Content .cf_token -Raw).Trim()
```
> **看完整输出**，不能截断。成功会打印 `[SUCCESS] Worker deployed. BUILD_ID=...`；失败会自动回滚。
> 然后**等 30 秒**再验证。

### 3.2 手机
```powershell
cd "C:\Users\SURFACELAPTOP STUDIO\Desktop\goofy-planck"
adb -s ${PHONE_SERIAL} push ping_scheduler.sh /data/local/tmp/_p2.sh
adb -s ${PHONE_SERIAL} push fast_scan.sh     /data/local/tmp/_p3.sh
adb -s ${PHONE_SERIAL} shell "sh -n /data/local/tmp/_p2.sh && sh -n /data/local/tmp/_p3.sh && echo OK"
# 备份 + 安装 + 完整重启(会杀掉全部旧进程并拉起新代码)
adb -s ${PHONE_SERIAL} shell "cp -f /data/local/tmp/ping_scheduler.sh /data/local/tmp/ping_scheduler.sh.bak_rtt_\$(date +%Y%m%d_%H%M%S)"
adb -s ${PHONE_SERIAL} shell "cp -f /data/local/tmp/fast_scan.sh /data/local/tmp/fast_scan.sh.bak_rtt_\$(date +%Y%m%d_%H%M%S)"
adb -s ${PHONE_SERIAL} shell "cp -f /data/local/tmp/_p2.sh /data/local/tmp/ping_scheduler.sh && cp -f /data/local/tmp/_p3.sh /data/local/tmp/fast_scan.sh && chmod 755 /data/local/tmp/ping_scheduler.sh /data/local/tmp/fast_scan.sh"
adb -s ${PHONE_SERIAL} shell "sh /data/local/tmp/run_daemon.sh"
```
> 等 15 秒后确认进程。数进程用 `ps -A -o PID,PPID,ARGS`，**不要用 pgrep -f**（会匹配自己）。

---

# ③ 验收标准（逐条给出命令与期望输出）

| # | 验收项 | 命令 | 期望 |
|---|---|---|---|
| 1 | Worker 三处 BUILD_ID 一致 | 页面 `__pageBuild` / `/api/live` 的 `buildId` / `worker_deploy.js` 的 `const BUILD_ID` | 三者完全相同 |
| 2 | 接口存活 | `curl -o NUL -w "%{http_code}" https://${WORKER_HOST}/api/stats_data?pwd=${ADMIN_PASSWORD}` 等 | 200 / 200 / 200（stats_data / live / chart.js）|
| 3 | **edgeRtt 真的上来了** | `curl "https://${WORKER_HOST}/api/stats_data?pwd=${ADMIN_PASSWORD}"` | JSON 里出现 `"edgeRtt":<正整数>`；数值与手机 `/data/local/tmp/last_edge_rtt.txt` 一致 |
| 4 | 手机探针文件在更新 | `adb shell "ls -l /data/local/tmp/last_edge_rtt.txt; cat /data/local/tmp/last_edge_rtt.txt"` | mtime 每 60 秒更新一次，值为正整数（几十~几百 ms）|
| 5 | ping_cache 带 edgeRtt | `adb shell "cat /data/local/tmp/ping_cache.txt"` | JSON 含 `"edgeRtt":<值>` |
| 6 | 上报节奏未受影响 | `adb shell "tail -n 5 /data/local/tmp/cycle_timing.txt"` | 仍为 `cycle=6000ms ... rc=0` |
| 7 | 进程数正常 | `ps -A -o PID,PPID,ARGS` | daemon / ping_scheduler / node_probe / xray / cloudflared 各 1 个 |
| 8 | 手机负载未上升 | `adb shell "cat /proc/loadavg"` | 与改动前同量级（本项目基线 ~2.5~3.2）|
| 9 | KV 未超限 | `python kv_audit.py` | read < 100k/天、write < 1k/天 |
| 10 | 页面无 undefined | 抓 `/admin` 页面 HTML 或浏览器控制台 | 无 `undefined ms` / `NaN` |
| 11 | 总和不再乱跳 | 浏览器观察 5 分钟（默认 60 秒采集） | 总和波动明显收敛；第 2 段灰字显示且不计入总和 |

---

# ④ 必须遵守的操作纪律（项目踩坑史）

1. **手机 `/system/bin/sh` 是 32 位算术**：`date +%s%N`（约 1.79e18）一进 `$(())` 必然溢出成负数。绝对时刻只能用 `date +%s`；要亚秒精度只能取纳秒串**后 9 位**（`date +%s%N | tail -c 9`）。
2. **PowerShell 内联 Python / 复杂引号必炸**：一律用 write 工具写 `.py` / `.sh` 文件再执行；adb 多语句写成文件 push 后 `adb shell 'sh 文件'`。
3. **`pgrep -f` 会匹配自己的命令行**：数进程用 `ps -A -o PID,PPID,ARGS > /tmp/ps.txt; grep ... /tmp/ps.txt`。
4. **手机脚本改完必须重启进程才生效**：`sh /data/local/tmp/run_daemon.sh`（已修好，会杀全部旧进程再拉起；早期版本不杀 ping_scheduler/node_probe，导致修复到不了运行态）。
5. **部署输出绝不能截断**：历史上因为截断输出误判"已成功"很久。
6. **部署后至少等 30 秒**再验证线上版本（等 6~8 秒会读到上一个版本）。
7. **判定部署成功必须比对三处 BUILD_ID**（源码 / 页面 `window.__pageBuild` / `/api/live` 的 `buildId`）。
8. **杀进程只用精确 PID**，不要用宽匹配 `pkill -f xray`（会误杀）。
9. 手机是 **shell uid=2000 非 root**（`/data/data` 不可读）；手机脚本必须 **LF** 换行。
10. 仓库根目录的 `report_traffic.sh` 是**旧版本**，手机对应文件是 `phone_report_traffic.sh`（md5 必须一致），别改错。
11. 部署器 `cf_deploy.py` 行为：自动备份 → 注入 BUILD_ID（正则没命中即中止）→ 下载并内嵌 Chart.js → 读取现有 bindings 并合并（不写死覆盖）→ 上传；**失败自动回滚**。
12. 不要改 `measure_anchor()`：6 大地区矩阵卡片（接入点1/接入点6/接入点2/接入点3/接入点4/接入点5）依赖它的 `time_appconnect` 语义。
13. 不允许任何假数据：无数据就显示 `--` / "未测到"。

---

# ⑤ 回滚点

| 对象 | 位置 |
|---|---|
| Worker 源码 | `worker_deploy.js.bak_before_deploy_<时间戳>`（部署器每次自动生成）|
| Cloudflare 侧 | 面板 Workers → Deployments 可回退历史版本 |
| 手机脚本 | `/data/local/tmp/ping_scheduler.sh.bak_rtt_<时间戳>`、`fast_scan.sh.bak_rtt_<时间戳>`（本方案建议的命名）|
| 手机整体 | `sh /data/local/tmp/run_daemon.sh` 即可用当前脚本全量重启 |

---

# 附：为什么这样改（给 AI 的推理依据，便于它自己判断边界）

- `serverMs` 是 Worker 自身执行耗时（实测 25~165ms，冷读 KV 可达 400ms），把它当网络时延相加是**量纲错误**，且它占旧总和的比例最高可达 60%+，是 200↔900ms 抖动的主要来源。
- 浏览器侧只有单次采样（实测极差 104~218ms），必须中位数化才稳定；用**滚动中位数**可以在**不增加任何请求**的前提下抗抖（优于"连发 3 次"）。
- 手机侧 `time_appconnect` 是 TLS 握手（≈2×RTT），`time_connect` 是纯 TCP（1×RTT）。要和浏览器实测的"一个网络往返"相加，必须统一到 `time_connect`。
- 四段来自三个设备、三个时刻，物理上不存在"一条端到端路径的和"；改为"三段单次 RTT 的中位数之和"并在标题注明口径，是诚实且有意义的口径。
