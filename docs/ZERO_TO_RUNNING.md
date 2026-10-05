# 从零到跑通

本文是**唯一的部署清单**：照着从上往下做，不需要再看别的东西。

> 预计 30~60 分钟。最终你会得到：一个边缘 Worker（订阅分发 + 遥测聚合 + 监控台）、
> 一台常驻设备（出口 + 采集）、以及一个能实时看到"哪一段坏了"的监控大屏。

---

## 0. 整体形状

```
客户端 ──HTTPS/443──▶ Cloudflare 边缘（Worker）        ← 你要部署的第 1 件东西
                          │
                          ├─ 反向隧道（cloudflared）    ← 第 2 件：跑在设备上
                          ▼
                      常驻设备（代理核心 + 采集脚本）   ← 第 3 件：跑在设备上
                          │
                          ▼
                       目标网络（出口 = 这台设备的网络）
```

三件东西里，**边缘用脚本一键部署**，设备侧靠 adb 推送 + 一条命令启动。

---

## 1. 先准备这五样

| # | 需要什么 | 说明 |
| --- | --- | --- |
| 1 | 一个域名，DNS 托管在 Cloudflare | 免费即可；会用到两个子域（边缘 + 隧道） |
| 2 | Cloudflare 账号 | 免费额度足够；需能看到 Account ID |
| 3 | 一台常驻设备 | Android 手机 / 迷你主机 / 软路由，能长期供电联网 |
| 4 | 一台电脑 | 装好 Python 3 与 Node.js，并能 adb 连上设备 |
| 5 | 设备的 USB 调试 | 手机：开发者选项 → USB 调试；电脑装 platform-tools |

---

## 2. 六步部署

> **方式 B：一键部署按钮（只覆盖边缘那半）**
> 仓库首页有 **Deploy to Cloudflare** 按钮：点击 → 授权 → 填变量 → 边缘就建好了
> （Worker + KV 命名空间自动创建）。它【不】部署设备侧，设备侧仍要走下面的步骤 6。
> 三条前提，缺一条就跑不起来：
> 1. `wrangler.toml` 里的 **`NODES` 必须填**（格式 `路径:地址`，逗号分隔）——
>    默认清单里的地址是构建期占位符，按钮路径没有构建期；
> 2. 三个机密（`ADMIN_PASSWORD` / `SYNC_SECRET` / `VLESS_UUID`）在控制台
>    用 **Encrypt** 或 `wrangler secret put` 单独设置，不要写进 `wrangler.toml`；
> 3. `WORKER_HOST` / `TUNNEL_HOST` 改成你自己的域名。
> 下面的一~六步是**完整路径**（也是唯一能把设备侧一起做完的路径）。

### 步骤 1 · 建键值存储（KV）

控制台 → **Storage & Databases → KV → Create namespace**，名字随意（例如 `noc`）。
建好后页面上会给出 **Namespace ID**（32 位十六进制）——后面要填进 `.env` 的
`CF_KV_NAMESPACE_ID`。

> 为什么要它：用户库与全局快照放这里。免费额度下**写入每天只有 1000 次**，
> 所以本项目只把"必须全球一致"的数据放进去，实时遥测一律走内存与边缘缓存。

### 步骤 2 · 建 API 令牌

控制台 → 右上角头像 → **My Profile → API Tokens → Create Token** →
用 **Custom token**，权限只给两项：

| 权限 | 级别 |
| --- | --- |
| Account → Workers Scripts | Edit |
| Account → Workers KV Storage | Edit |

建完复制令牌（只显示一次）与 **Account ID**（控制台右侧栏可见）。

### 步骤 3 · 建隧道（拿凭据）

控制台 → **Networks → Tunnels → Create a tunnel**（选 cloudflared）→ 起个名字。
然后：

1. 在 **Public Hostnames** 里加一条：子域填 `vpn`（或你喜欢的），
   Service 先随便填 `http://127.0.0.1:8080`（部署完节点会改成本地实际端口）；
2. 在 **Install connector** 里下载**凭据 JSON**（`<隧道ID>.json`），
   待会儿要放到设备上；
3. 记下**隧道 ID**（用于生成设备侧 `config.yml`）。

### 步骤 4 · 填配置并生成密钥

```bash
cp .env.example .env
python deploy/gen_secrets.py     # 把三个占位口令换成强随机值（只改占位项）
```

然后按 `.env` 里的注释逐项填：

| 键 | 从哪来 |
| --- | --- |
| `CF_API_TOKEN` | 步骤 2 |
| `CF_ACCOUNT_ID` | 步骤 2 |
| `CF_KV_NAMESPACE_ID` | 步骤 1 |
| `CF_SCRIPT_NAME` | 你给 Worker 起的名字（随意，例如 `noc-edge`） |
| `WORKER_HOST` | 边缘子域，例如 `sub.example.com` |
| `TUNNEL_HOST` | 步骤 3 里那条 Public Hostname，例如 `vpn.example.com` |
| `ADMIN_PASSWORD` | 步骤 4 已自动生成（记下它，登录监控台要用） |
| `SYNC_SECRET` | 同上 |
| `VLESS_UUID` | 同上 |
| `DAY_TZ` | 统计日界线时区，例如 `Asia/Shanghai` |
| `PHONE_SERIAL` | 设备序列号（`adb devices` 第一列） |

填完先跑一次体检：

```bash
python deploy/一键.py 1          # = python deploy/step1_check.py
```

**必须 0 项阻塞**才继续。它会检查：配置文件、节点清单、令牌与资源、DNS、本机工具、设备。

### 步骤 5 · 部署边缘

```bash
python deploy/一键.py 2          # = step2_deploy_edge.py
```

想先不动线上、只看"会不会成功"，加一个参数干跑：

```bash
python deploy/step2_deploy_edge.py --dry-run
```

成功标准：三处版本号一致 —— 源码里的 `BUILD_ID`、`/api/live` 返回的、页面内嵌的。

### 步骤 6 · 部署设备侧并启动

```bash
python deploy/fetch_binaries.py  # 官方源下载 + 校验 + 推到 /data/local/tmp
python deploy/一键.py 3          # = step3_deploy_node.py（推脚本与配置）
```

然后在设备上：

```bash
sh /data/local/tmp/install_node.sh --check   # 先体检
sh /data/local/tmp/install_node.sh           # 体检通过后启动
```

打开监控台：`https://<WORKER_HOST>/admin?pwd=<ADMIN_PASSWORD>`

---

## 3. 验收清单（7 条）

| # | 检查项 | 判定 |
| --- | --- | --- |
| A1 | 边缘可访问 | 订阅地址返回 200，且内容是有效订阅 |
| A2 | 隧道已建立 | 监控台"节点设备段"显示活跃 |
| A3 | 遥测连续 | 数据年龄持续 < 30 s，无长时间空窗 |
| A4 | 会话判定有效 | 客户端连上后 10 s 内，该用户变为"会话活跃" |
| A5 | 分段指标齐备 | 五段都有实测值或明确的空值（**不得出现推测值**） |
| A6 | 探测并发受限 | 设备侧探测并发 ≤ 2，无许可等待超时告警 |
| A7 | 计量单调 | 逐用户累计流量在观察期内不减 |

```bash
python deploy/一键.py 4          # = step4_verify.py（自动核对上面大部分项）
```

---

## 4. 常见卡点

| 现象 | 原因 | 处理 |
| --- | --- | --- |
| `install_node.sh` 报 `missing /data/local/tmp/xray` | 没跑取二进制那一步 | `python deploy/fetch_binaries.py` |
| 同上报 `cloudflared_native` 缺失 | 同上 | 同上 |
| 设备上 `not executable` | 下错架构（拿到了 amd64） | 重新执行 `fetch_binaries.py`（脚本会校验 AArch64） |
| 监控台能开但**登录不上** | 部署时没写绑定，口令停在 `CHANGE_ME` | 确认 `.env` 已填，重跑 `一键.py 2` |
| 有页面但**数据年龄一直涨** | 设备侧没起来 / 隧道断了 | `sh install_node.sh --check`，再看 `/sdcard/xray_live.log` |
| `step2` 报"还有没注入的占位符" | `.env` 有项为空 | 按提示补齐后重跑 |
| KV 写入超额告警 | 快照写入周期被改短了 | 恢复默认周期，见 `docs/KV_超额_根治报告.md` |

---

## 5. 回滚

| 对象 | 方式 |
| --- | --- |
| 边缘 | 部署脚本每次都会留下带时间戳的备份，覆盖回去重新部署即可 |
| 设备侧脚本 | 覆盖回备份文件；脚本按轮次重新执行，**不需要重启** |
| 设备侧二进制 | 用 `fetch_binaries.py --force` 重新推送（默认不覆盖，避免打断运行中的节点） |

---

## 6. 想更省事

```bash
python deploy/一键.py all        # 5 → 6 → 1 → 2 → 3 → 4 全流程
```

前置条件是"五样准备"都齐了、`.env` 填好了。中途任何一步失败都会**立即停止**，
并告诉你卡在哪一步、下一步该看什么。

