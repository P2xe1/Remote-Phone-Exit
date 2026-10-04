# NOC 数据架构报告 · 手机主库 + 按需推送

- 时间：2026-10-03 11:40（某地时间）
- 线上版本：**#76**（回滚点 #75 / #74 / #73）
- 需求方三点要求：① KV 用量符合 Cloudflare 限额 ② 数据尽量保存在手机（服务端）③ 仅在成员变更时推送到 Cloudflare

**结论：三点全部达成，已上线，服务零中断。**

---

## 一、数据归属（谁存什么）

| 数据 | 存放位置 | 持久性 | 进 KV 吗 |
|---|---|---|---|
| **用户库**（增/减/禁用/删除） | 手机 `users.json` + `users_backup.json` | 永久 | ✅ **仅此一项**，单 key |
| Xray 配置 | 手机 `config.json` | 永久 | ❌ |
| 流量基线 / 历史 15 分钟 | 手机 `user_traffic_base.txt` / `history_15m.txt` | 永久 | ❌ |
| 在线状态 / 速率 | 手机 `online_*.txt` + Worker 内存 | 易失 | ❌ |
| 测速 / 抖动 / 槽位 | 手机 `ping_cache.txt` + Worker 内存 | 易失 | ❌ |
| 大屏聚合数据 | Worker 内存 + Cache API | 易失 | ❌ |
| 用户版本号 | 手机 `user_version.txt` | 永久 | ❌ |

> **Cloudflare 的持久存储里只有一个 key：`noc:users:master`。** 其余全部是易失的（内存 / Cache API），
> 符合"数据尽量保存在手机"的要求。

---

## 二、需求 ①：KV 用量合规

### 硬数据（Cloudflare 官方 GraphQL 实测）

| 日期 | read / 上限 | **write / 上限** | list / 上限 |
|---|---|---|---|
| 2026-10-01 | 12,990 / 100,000 | **1,905 / 1,000 超限 1.9×** | 1,782 / 1,000 超限 |
| 2026-10-02 | 5,251 / 100,000 | **1,471 / 1,000 超限 1.5×** | 1,188 / 1,000 超限 |
| **2026-10-03（修复后）** | **100 / 100,000 (0.1%)** | **1 / 1,000 (0.1%)** | **1 / 1,000 (0.1%)** |

唯一的 1 次写入是初始化播种用户库。

### 四道防线

1. **结构性保证**：`saveCachedUsers()`（唯一写 KV 的函数）只有 4 个调用点 ——
   `/api/phone_users` POST（手机回推）与 `/admin` 的 add/toggle/delete。
   **任何请求路径都不会触发写入。**
2. **写入熔断器**：只哈希 `token/enabled/name/uuid` 稳定字段；内容未实质变化则**跳过 KV 写入**。
   实测：手机回推完全相同的名单 → 0 新增写入。
3. **读取边缘缓存**：`get(..., { cacheTtl: 60 })` —— 60 秒内重复读走 Cloudflare 边缘缓存。
   实测：140 请求压力测试后 **KV read 新增 = 0**。
4. **写入预算保险丝**：单 isolate 每天最多 200 次写入，超出则拒绝并告警。防将来代码改错。

### 压力测试证据

| 项目 | 结果 |
|---|---|
| 发送请求 | 140 个（40× `/sub`、20× 后台上报、20× 大屏、20× 用户库、20× 配置、20× `/admin`）|
| 返回 | 全部 HTTP 200 |
| **KV write 新增** | **0** |
| **KV read 新增** | **0** |

---

## 三、需求 ②：数据保存在手机

手机 `/data/local/tmp/` 持有全部权威数据：

| 文件 | 内容 |
|---|---|
| `users.json` | 用户库（权威） |
| `users_backup.json` | **成员变更时自动生成的备份**（灾难恢复源） |
| `config.json` | Xray 配置 |
| `user_version.txt` | 已同步的云端版本号 |
| `ping_cache.txt` / `last_pings.txt` / `last_jitters.txt` | 六区域测速与抖动 |
| `user_traffic_base.txt` / `history_15m.txt` | 流量基线与历史 |

**灾难恢复工具**（手机 → 云端）：

```powershell
cd "C:\Users\SURFACELAPTOP STUDIO\Desktop\goofy-planck"
python restore_users_from_phone.py --dry-run   # 只比对差异
python restore_users_from_phone.py             # 用 users.json 恢复
python restore_users_from_phone.py --backup     # 用备份恢复
```

安全设计：手机侧为空时**拒绝**覆盖云端（防误清空）。

---

## 四、需求 ③：仅在成员变更时推送

### 触发条件

手机 `report_traffic.sh` 中，回推代码位于这段判断**内部**：

```sh
if [ "$REMOTE_VER" != "$LOCAL_VER" ]; then     # 版本变化 == 成员发生增/减/禁用/删除
    ... 拉取新名单并持久化 ...
    ... 回推 Cloudflare（新增代码在这里）...
fi
```

版本号只由 `token/enabled/name/uuid` 决定，因此**只有成员变更才会改变版本号**，
也就只有成员变更才会触发回推。日常上报（每约 6 秒一次）永远不会推送用户库。

### 乐观并发校验（防覆盖）

手机回推的载荷带 `version`：

```json
{ "version": "v_xhttp_764f84b0", "users": { ... } }
```

Worker 行为：

| 情况 | 响应 | 效果 |
|---|---|---|
| 版本与云端一致 | `200 {"status":"ok"}` | 应用（内容相同则熔断跳过 KV 写入）|
| 版本已过期（后台期间又改过）| `409 {"status":"stale"}` | **拒绝写入**，手机删除本地版本号，下一轮重新拉取 |

### 实测证据

```
=== 1) 构造载荷（与脚本中完全相同的三条命令）===
载荷大小: 1723 字节
头部: {"version":"v_xhttp_764f84b0","users":{
=== 3) 回推 ===
HTTP 响应: {"status":"ok","version":"v_xhttp_764f84b0","restored":7}
=== 4) 建立本地备份 ===
-rwxrwxrwx 1 shell shell 1684 2026-10-03 11:38 /data/local/tmp/users_backup.json
```

接口契约测试（`python test_sync_endpoint.py`）：

```
[A] 版本正确回推 -> HTTP 200  status=ok
[B] 过期版本回推 -> HTTP 409  status=stale   (乐观并发校验生效)
[C] 回推后用户库 = 7 人, 与之前一致: True
```

---

## 五、改动清单与回滚

| 文件 | 改动 | 备份 |
|---|---|---|
| `worker_deploy.js` | 用户库迁移到 KV 单 key；`/api/phone_users` 加乐观并发；写入熔断 + 预算保险丝；`/sub` 容灾不入库 | `worker_deploy.js.bak_20261003_112705` |
| 手机 `report_traffic.sh` | 版本变更分支内新增用户库回推 + 本地备份 | 手机 `/data/local/tmp/report_traffic.sh.bak_before_push` |
| `cf_deploy.py` | 强制写死 `SUB_DB` 绑定 | `cf_deploy.py.bak_20261003_112705` |

**回滚**：
- Worker：面板 Deployments 选 **#75**，或还原 `.bak` 后 `python cf_deploy.py <token>`
- 手机：`adb shell 'cp /data/local/tmp/report_traffic.sh.bak_before_push /data/local/tmp/report_traffic.sh'`

---

## 六、工具清单

| 脚本 | 用途 |
|---|---|
| `noc_audit.py` | NOC 现状审计（Token / 绑定 / 双入口列表对比 / KV 用量）|
| `verify_noc_fix.py` | 修复效果验证（一致性 + 接口健康 + KV 用量）|
| `loadtest_noc.py` | 压力测试 + 证明请求路径 KV 写入为 0 |
| `seed_kv_users.py` | 播种用户库到 KV |
| `restore_users_from_phone.py` | **灾难恢复：手机 → 云端** |
| `test_sync_endpoint.py` | 同步接口契约测试（乐观并发）|
| `kv_audit.py` | KV 真实用量审计 |

---

## 七、遗留事项

1. **轮换 CF API Token**（重要）：旧 Token 曾明文存在于脚本中并出现在对话记录里。
   已收敛到 `.cf_token` 单点，面板吊销后只需改这一个文件。
2. **`/sub` 对未知 token 仍下发配置**（容灾保留，但已不入库）。
   现在 KV 是权威源、7 个真实用户都在库里，收紧成 403 的风险已很低，随时可做。
3. **D1 权限**：当前 Token 无 D1 权限。若将来用户量大幅增长（例如上千人批量导入），
   建议改用 D1（免费 10 万写/天），届时本方案可平滑迁移。
4. **手机 `cfErrors: 30`** 未深挖，需看 `/sdcard/cf_named.log`。
