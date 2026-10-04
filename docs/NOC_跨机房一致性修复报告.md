# NOC 大屏修复报告 · 跨机房用户列表不一致

- 时间：2026-10-03 11:32（某地时间）
- 项目：`C:\Users\SURFACELAPTOP STUDIO\Desktop\goofy-planck`
- 线上版本：**#75**（回滚点 #74 / #73）
- 结论：**已修复并上线，零服务中断**

---

## 一、被修复的缺陷

NOC 后台的「已授权成员用户列表」**在不同机房显示不同结果**，实测：

| 入口 | 人数 | 差异 |
|---|---|---|
| `${WORKER_HOST}/admin` | 7 | 含 `USER_TOKEN_1`（用户F）|
| `my-worker.example-pixel.workers.dev/admin` | 6 | **缺** `用户F`，且 `用户D` **重复一行** |

### 病根

用户库只存在 **Cache API + isolate 内存**里。而 Cloudflare 的缓存是**按机房（data center）独立的**：

- 手机推 `users.json` 时，请求只会落到**某一个**机房 → 只有那个机房学到新名单
- 其它机房永远学不到 → 各机房按自己的旧缓存渲染后台
- isolate 内存同理，冷启动即丢失

于是「同名用户重复」「新增用户只在部分机房可见」「删除的用户在别的机房还能拉到订阅」这类问题会反复出现。

---

## 二、修复方案

把用户库提升为 **KV 单 key 全局权威源**，内存与 Cache API 降级为纯加速层。

### 数据结构

| 层 | 角色 | 生效范围 |
|---|---|---|
| isolate 内存 | 最快，20 秒 TTL | 单实例 |
| **KV `noc:users:master`** | **权威源** | **全局一致** |
| Cache API | 兜底（兼容迁移前旧数据） | 单机房 |

### 三条安全设计（防止重演配额事故）

1. **写入只发生在两处**：后台增删改用户、手机同步用户库。
   `/sub` 拉订阅路径**绝不写 KV** —— 旧实现正是在这里每次拉取都 `saveCachedUsers()`，这是当初一天上万次写入、打爆 1000 次/天配额的直接原因。
2. **读取带 `cacheTtl: 60`**：60 秒内的重复读由 Cloudflare 边缘缓存承接，不消耗 KV 读配额。
3. **写入熔断器**：`saveCachedUsers()` 内置"实质变化"判断，只哈希 `token/enabled/name/uuid` 这类稳定字段（不含 `lastSeen`/`pullCount` 等展示字段）。**即使将来有人误在请求路径上调用它，也不会产生写入。**
4. **容灾路径不再入库**：未知 token 仍下发配置（避免冷机房误判 403），但改为纯临时对象，不写 KV、不进用户列表 —— 这同时消除了之前「重复用户」的污染源。

---

## 三、改动清单（含备份）

| 文件 | 改动 | 备份 |
|---|---|---|
| `worker_deploy.js` | 用户库读写层重写；`/sub` 容灾不再入库；展示字段走 `touchUser()` 不写 KV | `worker_deploy.js.bak_20261003_112705` |
| `cf_deploy.py` | 不再剥离 KV，改为**强制写死** `SUB_DB` 绑定，避免"代码要用 KV 但绑定被剥掉"的静默失效 | `cf_deploy.py.bak_20261003_112705` |
| `cf_cfg.py` / `.cf_token` | 凭据收敛到单点（早前已完成） | — |

新增工具：

| 脚本 | 用途 |
|---|---|
| `noc_audit.py` | NOC 现状审计（Token 权限 / 绑定 / 双入口列表对比 / KV 用量）|
| `seed_kv_users.py` | 把权威用户库播种进 KV 单 key |
| `verify_noc_fix.py` | 修复效果验证（一致性 + 接口健康 + KV 用量）|
| `loadtest_noc.py` | 压力测试 + 证明请求路径 KV 写入为 0 |

**回滚方法**：`Copy-Item worker_deploy.js.bak_20261003_112705 worker_deploy.js` 后重新 `python cf_deploy.py <token>`；
或在 Cloudflare 面板 Deployments 里选 **#74 / #73**。

---

## 四、验证结果

### 4.1 一致性（核心）

```
${WORKER_HOST}                  用户 7 人
my-worker.example-pixel.workers.dev     用户 7 人
[✅ 修复成功] 两个入口用户列表完全一致
   ['USER_TOKEN_2','USER_TOKEN_3','USER_TOKEN_4','USER_TOKEN_5','USER_TOKEN_6','USER_TOKEN_7','USER_TOKEN_8']
```

### 4.2 配额安全（压力测试）

发送 **140 个请求**（40 次 `/sub` 拉订阅、20 次后台上报、20 次大屏轮询、20 次用户库/配置拉取、20 次后台页面），全部 HTTP 200，耗时 23.2 秒：

| 指标 | 负载前 | 负载后 | 新增 |
|---|---|---|---|
| KV write | 0 | 0 | **0** ✅ |
| KV read | 1 | 1 | **0** ✅ |
| KV list | 1 | 1 | **0** ✅ |

### 4.3 服务零中断

- 手机 4 个进程全部在跑（`ping_scheduler` / `traffic_daemon` / `xray` / `cloudflared`）
- `user_version.txt` 与 `config.json` 仍为 01:14 —— 版本哈希未变化，**未触发 xray 重载，朋友连接零中断**
- `/api/stats_data` 数据时差 5.6 秒，`xrayLive=1`，7 用户

---

## 五、遗留事项

1. **CF API Token 需要轮换**（重要）
   旧 Token 曾以明文存在于 `check_kv_usage.py` / `check_invocations.py`，也出现在对话记录里。
   已收敛到 `.cf_token` 单点 → 面板吊销后只需改这一个文件。建议权限：
   Account Analytics:Read + Workers KV Storage:Read + Workers Scripts:Read/Edit。

2. **`/sub` 对未知 token 仍下发配置**（当前为容灾保留）
   任何 ≥6 位字符串都能拿到节点。现在 KV 已是权威源、7 个真实用户都在库里，
   **收紧成 403 的风险已大幅降低**，随时可做。是否收紧由你决定。

3. **手机侧 `cfErrors: 30`** 尚未深挖
   这是手机遥测里 Cloudflare 隧道的错误计数，需要看 `/sdcard/cf_named.log` 才能定位。

4. **D1 权限**
   当前 Token 无 D1 权限（401）。若你希望把用户库/会话数据放到更强的 SQL 存储上，
   需要新建一个带 D1:Edit 权限的 Token。

---

## 六、日常自检

```powershell
cd "C:\Users\SURFACELAPTOP STUDIO\Desktop\goofy-planck"
python verify_noc_fix.py     # 一致性 + 接口健康 + KV 用量
python noc_audit.py          # 含双入口对比
```
