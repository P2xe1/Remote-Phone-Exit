# -*- coding: utf-8 -*-
"""
一键.py —— 唯一的入口。菜单式，按序号选；也可以直接命令行调用。

用法:
    python 一键.py              # 打开菜单
    python 一键.py 1            # 只做环境体检
    python 一键.py 1 2 4        # 依次体检 -> 部署边缘 -> 验收
    python 一键.py all          # 体检 -> 部署边缘 -> 部署节点 -> 验收
    python 一键.py export       # 导出脱敏副本 + 推送 GitHub

菜单项:
    1  环境体检（不修改任何东西）
    2  部署边缘 Worker（自动填节点地址 / 注入版本 / 上传）
    3  部署节点脚本（adb 推送 + 完整重启）
    4  线上验收（部署后必跑）
    5  导出脱敏副本（生成可公开的干净目录）
    6  推送 GitHub（需要令牌文件路径）
    9  全部执行（1 → 2 → 3 → 4）
    0  退出
"""
import os
import subprocess
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)
PY = sys.executable

STEPS = {
    '1': ('环境体检', os.path.join(HERE, 'step1_check.py')),
    '2': ('部署边缘 Worker', os.path.join(HERE, 'step2_deploy_edge.py')),
    '3': ('部署节点脚本', os.path.join(HERE, 'step3_deploy_node.py')),
    '4': ('线上验收', os.path.join(HERE, 'step4_verify.py')),
    # 【2026-10-05 修复 D20】原来这里还有两项：
    #   '5' 导出脱敏副本 -> 指向 _export_clean.py
    #   '6' 推送 GitHub   -> 指向 push_to_github.ps1
    #   前者是【作者本机的导出脚本】，公开仓库里根本没有这个文件，
    #   点了只会报"找不到脚本"；后者是作者自己推仓库用的，对使用者没意义。
    #   已移除，菜单同步精简。
}

BANNER = r"""
   ____                  __     _   _      _     _
  / ___|_      _____  __ \ \   / | | | ___| |__ (_)_ __   __ _
 | |  _\ \ /\ / / _ \/ _` \ \ / /| |_| / __| '_ \| | '_ \ / _` |
 | |_| |\ V  V /  __/ (_| |\ V / |  _  \__ \ | | | | | | | (_| |
  \____| \_/\_/ \___|\__,_| \_/  |_| |_|___/_| |_|_|_| |_|\__, |
                                                          |___/
"""

MENU = """
  ┌──────────────────────────────────────────────────────────┐
  │  1  环境体检          检查配置/令牌/域名/设备（不改任何东西） │
  │  2  部署边缘 Worker   自动填节点地址 + 注入版本 + 上传        │
  │  3  部署节点脚本      adb 推送脚本并完整重启                 │
  │  4  线上验收          接口/版本/数据流/占位符残留            │
  │  9  全部执行          1 → 2 → 3 → 4                        │
  │  0  退出                                                  │
  └──────────────────────────────────────────────────────────┘

  用法：在仓库根目录执行  python deploy/一键.py
       （必须用这个路径 —— 菜单靠自身所在目录定位各步骤脚本）
"""


def run_script(path, extra=None):
    if not os.path.exists(path):
        print('[!] 找不到脚本: %s' % path)
        return 1
    cmd = [PY, path] + (extra or [])
    if path.endswith('.ps1'):
        cmd = ['powershell', '-ExecutionPolicy', 'Bypass', '-File', path] + (extra or [])
    print('\n' + '─' * 62)
    print(' ▶ 执行: %s' % os.path.basename(path))
    print('─' * 62)
    p = subprocess.run(cmd, cwd=ROOT)
    return p.returncode


def run_all():
    rc = 0
    for k in ('1', '2', '3', '4'):
        name, path = STEPS[k]
        r = run_script(path)
        if r != 0:
            print('\n[!] 第 %s 步（%s）失败，后续步骤已停止' % (k, name))
            return r
        rc = 0
    print('\n' + '=' * 62)
    print(' 全部完成 ✅')
    print('=' * 62)
    return rc


def main():
    args = sys.argv[1:]
    if args:
        if args[0] == 'all':
            return run_all()
        for a in args:
            if a not in STEPS:
                print('[!] 未知步骤: %s' % a)
                print('    可用: %s / all' % ' '.join(sorted(STEPS)))
                return 1
            r = run_script(STEPS[a][1])
            if r != 0:
                return r
        return 0

    print(BANNER)
    while True:
        print(MENU)
        try:
            choice = input('  请输入序号: ').strip()
        except (EOFError, KeyboardInterrupt):
            print()
            return 0
        if choice in ('0', 'q', 'quit', 'exit'):
            return 0
        if choice == '9':
            run_all()
            continue
        if choice in STEPS:
            run_script(STEPS[choice][1])
            continue
        print('  ? 无效选项')


if __name__ == '__main__':
    sys.exit(main())
