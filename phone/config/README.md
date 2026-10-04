# phone/config —— 设备上的配置从哪来

两份配置的来源**完全不同**，别搞混：

| 设备上的文件 | 内容 | 从哪来 |
|---|---|---|
| `/data/local/tmp/config.yml` | cloudflared 隧道配置（连哪条隧道、各路径转发到哪个端口） | **你手工填 + 部署脚本推送**（本目录的 `config.yml.example`） |
| `/data/local/tmp/config.json` | Xray 入站配置（监听哪些端口、哪些用户、什么传输） | **手机运行时自己从 Worker 拉**，不需要你推 |
| `/data/local/tmp/tunnel_creds.json` | 隧道凭据 | 在 Cloudflare 创建隧道时下载，自己推上去 |

## 关于 config.json（Xray）

**不要手工部署它。** 手机上的 `sync_worker.sh` 会定期访问：

```
https://<WORKER_HOST>/api/phone_xray_config
```

拿到的配置先经过 `xray run -test` 校验，通过后才写入 `/data/local/tmp/config.json`
并重启 Xray。这样做的好处是：**后台改了用户，设备自动生效，不用重新部署。**

本目录的 `config.json.example` 只是**格式参考** —— 它由 Worker 里那个生成函数
（`generatePhoneXrayConfig()`）的真实输出导出而来，所以格式一定是对的。
注意这几处必须与隧道配置对齐：

```
tag        port    network   path
proxy-in   8080    xhttp     /          <- 无 path 的兜底入口
in-kl      8081    xhttp     /kl
in-hk      8082    xhttp     /hk
in-sg      8083    xhttp     /sg
in-tw      8084    xhttp     /tw
in-jp      8085    xhttp     /jp
```

`config.yml` 里每个 `path` 的 `service` 端口必须和这里对上，错一个那个地区就全不通。

## 关于 config.yml（cloudflared）

运行文件名**必须**是 `config.yml`（`run_daemon.sh` 里写死的）。
里面这两行是隧道身份，**必须自己填**：

```yaml
tunnel: <你的隧道 ID>
credentials-file: /data/local/tmp/tunnel_creds.json
```

`${TUNNEL_HOST}` / `${TUNNEL_ID}` 这类占位符由部署脚本（`deploy/step3_deploy_node.py`）
按 `.env` 替换；如果替换后还有残留占位符，脚本会**直接中止**，不会推上去。

## 历史文件（已不再使用）

- `phone_config.json` / `phone_active_config.json` —— 早期用 WS/gRPC 传输时的配置快照，
  与现在真机使用的 **XHTTP** 不一致，留着只会误导。已从导出中移除。
- `termux_config.yml` —— 上面那份 cloudflared 配置的早期版本，缺 `tunnel` 与
  `credentials-file` 两行，照它配隧道起不来。已被 `config.yml.example` 取代。
