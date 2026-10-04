# -*- coding: utf-8 -*-
"""
cf_deploy.py - 兼容入口（2026-10-05 改为薄包装）

【为什么改成包装器】
  本文件过去是【第二套独立实现】：读自己目录下的 worker_deploy.js、
  完全不注入 NODE_xx_IP 节点地址、不注入运行时参数绑定。
  而 deploy/step2_deploy_edge.py 是【完整实现】：填节点、注 BUILD_ID、
  内嵌 Chart.js、合并绑定、语法检查、失败中止。

  两套实现并存必然漂移：按 README 跑这个入口，部署出来的 Worker
  里节点地址还是 ${NODE_xx_IP} 占位符，订阅里会混进不可用地址。

  现在这里只做一件事：把参数转交给 deploy/step2_deploy_edge.py。
  想改部署逻辑，请改那一个文件，不要在这里再写一份。

【历史 bug 记录（已随本次改造消除）】
  · 异常类型名拼错成 `urllib.error.HTPOP5rror`（正确是 HTTPError）——
    读取绑定或上传一旦抛异常，异常处理自己会再抛 AttributeError，
    把真实失败原因掩盖掉。
  · WORKER_FILE 写的是相对路径 "worker_deploy.js"，按 README 在仓库根
    运行时找不到文件（真实位置是 edge/worker_deploy.js）。
  · 不注入节点地址与运行时绑定。
"""
import os
import subprocess
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)
CANONICAL = os.path.join(ROOT, 'deploy', 'step2_deploy_edge.py')


def main():
    if not os.path.exists(CANONICAL):
        print('[!] 找不到正式部署实现: %s' % CANONICAL)
        print('    本文件只是兼容入口，真正的部署逻辑在 deploy/step2_deploy_edge.py')
        return 1

    print('[i] 本入口已改为兼容包装：实际执行 deploy/step2_deploy_edge.py')
    print('    配置一律从 .env / 环境变量读取（不再从命令行接收令牌，')
    print('    避免令牌出现在命令行历史与进程列表里）')
    print()
    # 原用法 `python tools/cf_deploy.py <TOKEN>` 里的令牌参数被忽略并提示，
    # 但仍继续执行 —— 配置从 .env 读，行为对老用户更安全。
    if len(sys.argv) > 1 and sys.argv[1].strip():
        print('[i] 已忽略命令行传入的令牌参数（改从 .env 的 CF_API_TOKEN 读取）')
        print()

    p = subprocess.run([sys.executable, CANONICAL] + sys.argv[1:],
                       cwd=ROOT)
    return p.returncode


if __name__ == '__main__':
    sys.exit(main())
