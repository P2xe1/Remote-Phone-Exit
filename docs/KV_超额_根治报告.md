# Cloudflare KV 超额 —— 根因定位与根治报告

- 报告时间：2026-10-03
- 账号：`${CF_ACCOUNT_ID}` / Worker 脚本：`my-worker` / 域名：`${WORKER_HOST}`
- KV 命名空间：`${CF_KV_NAMESPACE_ID}`

---

## 一、结论

**根因：把「每 6~10 秒变化一次的实时遥测」和「每次打开后台就整表遍历」写进了 Cloudflare KV。**

**现状：问题已经彻底解决。** 2026-10-03 当日 KV 写入 = **0**，KV REST API 读取返回 HTTP 200（不再报 `10048`），
线上 Worker（版本 **#73**）对 KV 的引用为 **0**，KV 绑定已从 Worker 上物理摘除。

---

## 二、现场铁证（Cloudflare GraphQL 实测）

| 日期 | read | write | list | delete | 判定 |
|---|---|---|---|---|---|
| 2026-10-01 | 12,990 | **1,905** | **1,782** | 0 | write 超限 1.9×、list 超限 1.8× |
| 2026-10-02 | 5,251 | **1,471** | **1,188** | 1 | write 超限 1.5×、list 超限 1.2× |
| 2026-10-03 | 1 | **0** | 1 | 0 | ✅ 正常（这 1 读 1 列是诊断脚本自身产生） |

免费额度日上限：[官方文档](https://developers.cloudflare.com/kv/platform/limits/)
read 100,000 / **write 1,000** / **delete 1,000** / **list 1,000**，另外 **同一 key 每秒只能写 1 次**。
超限即返回 `{"code": 10048, "message": "your account has reached the free usage limit for this operation for today"}`。

---

## 三、泄漏点（旧版 `worker_deploy_backup_20261001.js`）

```js
// ① 每次手机上报都写同一个 key
await db.put('stats:latest', JSON.stringify(globalMemoryStats));      // :207

// ② 每次打开 /admin 都 list + 逐 key get（无条件，无节流）
const list = await db.list({ prefix: 'user:' });                      // :505
for (const k of list.keys) { const item = await db.get(k.name); ... } // :507

// ③ 每次 /sub 拉订阅都读 + 回写
const userRaw = await db.get(`user:${token}`);                        // :339
if (db) await db.put(`user:${token}`, JSON.stringify(user));          // :382
```

**流量放大链路（实测频率）**

| 上报源 | 实测周期 | 次数/天 |
|---|---|---|
| `report_traffic.sh`（由 `traffic_daemon.sh` 驱动） | **~6 秒** | ~14,400 |
| `ping_scheduler.sh`（独立 POST，**纯重复**） | 10 秒 | ~8,640 |
| 合计 | | **~23,000 次/天** |

*`ping_scheduler.sh` 的 POST 是 100% 冗余的：它只写 `ping_cache.txt`，而 `report_traffic.sh:111` 已经直接读同一个文件，
连 `activeSlot` / `activeNode` 都一起转发。*

**两个致命机制**

1. **节流阀失效**：旧版用 `if (Date.now() - lastKvPersistenceTime > 1800000)` 试图「30 分钟才写一次」。
   但 `lastKvPersistenceTime` 是**模块级内存变量，每个 isolate 各自独立**。Cloudflare 边缘会不断冷启动新 isolate，
   于是实际写频率 ≈ (isolate 冷启动次数) × (1 次/30 分钟)，一天累积到 1,905 次。
2. **踩中同 key 限速**：`stats:latest` 是同一个 key，而 KV 限制「同一 key 每秒只能写 1 次」。
   两个循环并存时必然在同一秒内碰撞，触发 429 —— 这就是你代码里那句注释「不受 KV 429 影响」的来源。

**已实测排除的猜测**：KV 里**没有垃圾 key**。命名空间总共只有 5 个 key
（`stats:latest` + 4 个真实用户），`stats:latest` 仅 3,882 字节，**没有存储空间问题**。

---

## 四、本次已执行的修复

| # | 修复内容 | 文件 / 位置 | 验证结果 |
|---|---|---|---|
| 1 | 部署脚本主动剥离所有 KV 绑定 | `cf_deploy.py` | 线上 bindings = **0**，版本 #73 |
| 2 | 删除手机端冗余上报循环 | 手机 `/data/local/tmp/ping_scheduler.sh` | MD5 双方一致，POST 已注释，`activeSlot`/`pings` 仍实时 |
| 3 | 修复本地脚本编码（UTF-16LE → UTF-8） | `report_traffic.sh` | 原本会让 `encoding="utf-8"` 的脚本直接崩 |
| 4 | API Token 收敛到单点 | `.cf_token` + `cf_cfg.py` | 全项目仅剩 1 处 |
| 5 | 新增审计工具 | `kv_audit.py`、`kv_inspect.py`、`invocations_audit.py`、`deployed_worker_diff.py` | 均回归通过 |

**回滚点**：线上版本 #72（改动前）。如需回滚可在 Cloudflare 面板 Deployments 里选 #72。
**手机回滚**：`/data/local/tmp/ping_scheduler.sh.bak_20261003`、`report_traffic.sh.bak_20261003`。

---

## 五、效果

- Worker 侧 KV 操作：**0 次/天**（写、读、列表全为 0）
- 手机请求量：**~23,000 → ~14,400 次/天（↓37%）**
- Workers 免费额度占用：从 ~30% 降到 ~14%（上限 100,000 请求/天）

---

## 六、仍需你处理 / 待决策

1. **轮换 API Token（重要）**：旧 Token `${CF_API_TOKEN}…` 已出现在明文文件与对话记录中。
   去 Cloudflare 面板吊销后新建，把新值写进 `.cf_token` 即可（全项目已只需改这一处）。
   建议权限：Account Analytics:Read + Workers KV Storage:Read + Workers Scripts:Read/Edit。

2. **后台轮询档位**：大屏有「⚡2秒极速」档。若长期开着，**仅这一项就是 43,200 请求/天**。
   建议日常用默认「1 分钟采集」。

3. **`/sub` 自愈逻辑（真实缺陷）**：`worker_deploy.js:767-782` 会给**任何 ≥6 位的未知 token**
   自动创建用户并写入共享用户库。建议改为直接返回 403。

4. **用户列表在不同机房不一致（架构限制）**：用户库存在 Cache API + 各 isolate 内存里，而 **Cache 是分机房独立的**。
   实测：`${WORKER_HOST}/admin` 与 `my-worker.example-pixel.workers.dev/admin` 显示的**用户列表不同**
   （一边多一个重复的「用户D」、一边少一个「用户F」）。
   若要账号增删改在各机房强一致，需要真正的全局存储 —— 推荐 **D1**（免费 10 万写 / 500 万读 每天），
   而不是重新启用 KV。

---

## 七、如何重新启用 KV（如将来确有必要）

1. 在 `cf_cfg.py` 之外，把 `cf_deploy.py` 里那句 `bindings = [b for b in bindings if ...]` 去掉；
2. 重新在 Cloudflare 面板加回 KV 绑定；
3. **务必遵守三条铁律**：
   - 永远不要在每个请求里写 KV；
   - 永远不要在渲染后台时 `list()`；
   - 同一 key 一秒内不要写两次。
