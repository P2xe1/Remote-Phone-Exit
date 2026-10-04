# ============================================================================
#  push_to_github.ps1 —— 建仓库并推送（不把令牌写进任何文件、不进聊天记录）
#
#  两种用法：
#    A) 自己跑（推荐，令牌只在你本机）：
#         powershell -ExecutionPolicy Bypass -File push_to_github.ps1 -Owner <用户名> -Repo <仓库名>
#       脚本会用安全提示框式输入读取令牌。
#
#    B) 让 AI 代跑：先把令牌写进一个【工作区之外】的文件，例如
#         C:\Users\<你>\token.txt
#       然后：
#         powershell -ExecutionPolicy Bypass -File push_to_github.ps1 -Owner <用户名> -Repo <仓库名> `
#                    -TokenFile C:\Users\<你>\token.txt -DeleteTokenFile
#       脚本用完会删掉那个文件；令牌也不会出现在命令行或聊天里。
#
#  说明：-Public 才会建公开仓库，默认私有。
# ============================================================================
param(
  [Parameter(Mandatory=$true)][string]$Owner,
  [Parameter(Mandatory=$true)][string]$Repo,
  [string]$WorkDir = '',
  [string]$TokenFile = '',
  [switch]$DeleteTokenFile,
  [switch]$Public,
  [switch]$SkipSecretCheck
)

$ErrorActionPreference = 'Stop'
function Info($m) { Write-Host "[*] $m" -ForegroundColor Cyan }
function Ok($m)   { Write-Host "[+] $m" -ForegroundColor Green }
function Bad($m)  { Write-Host "[!] $m" -ForegroundColor Red }

# ---------- 0. 环境 ----------
$git = "C:\Program Files\Git\cmd\git.exe"
if (-not (Test-Path $git)) { $git = (Get-Command git -ErrorAction SilentlyContinue).Source }
if (-not $git) { Bad "没找到 git。先装：winget install --id Git.Git -e --source winget"; exit 1 }
Ok "git: $git"

if (-not $WorkDir) { $WorkDir = (Get-Location).Path }
Set-Location $WorkDir
Info "工作目录: $WorkDir"
if (-not (Test-Path '.\.gitignore')) { Bad "缺少 .gitignore，已中止"; exit 1 }

# ---------- 1. 凭据自检（硬门槛） ----------
if (-not $SkipSecretCheck -and (Test-Path '.\tools\check_secrets.py')) {
  Info "提交前凭据自检 ..."
  python .\tools\check_secrets.py
  if ($LASTEXITCODE -ne 0) { Bad "自检发现真实凭据（见上），已中止"; exit 1 }
}
foreach ($f in @('.env','config.json','users.json','tunnel_creds.json','.cf_token')) {
  if (Test-Path $f) { Bad "目录里存在敏感文件 $f，已中止"; exit 1 }
}
Ok "本地敏感文件检查通过"

# ---------- 2. 取令牌 ----------
$tok = $null
if ($TokenFile) {
  if (-not (Test-Path $TokenFile)) { Bad "令牌文件不存在: $TokenFile"; exit 1 }
  $tok = (Get-Content $TokenFile -Raw).Trim()
  Ok "已从文件读取令牌（$TokenFile）"
} else {
  $sec = Read-Host "请粘贴 GitHub 令牌（输入时不显示）" -AsSecureString
  $tok = [Runtime.InteropServices.Marshal]::PtrToStringAuto(
           [Runtime.InteropServices.Marshal]::SecureStringToBSTR($sec))
}
if (-not $tok) { Bad "未获取到令牌"; exit 1 }

$hdr = @{ Authorization = "Bearer $tok"; 'User-Agent' = 'push-to-github'; Accept = 'application/vnd.github+json' }
try {
  $me = Invoke-RestMethod -Uri 'https://api.github.com/user' -Headers $hdr -TimeoutSec 30
  Ok "令牌有效，身份: $($me.login)"
  if ($me.login -ne $Owner) { Bad "令牌属于 $($me.login)，但 -Owner 写的是 $Owner，两者必须一致"; exit 1 }
} catch { Bad "令牌校验失败: $($_.Exception.Message)"; exit 1 }

# ---------- 3. 建仓库（已存在则复用） ----------
Info ("检查/创建仓库 $Owner/$Repo（" + $(if($Public){'公开'}else{'私有'}) + "）...")
$exists = $true
try { Invoke-RestMethod -Uri "https://api.github.com/repos/$Owner/$Repo" -Headers $hdr -TimeoutSec 30 | Out-Null }
catch { $exists = $false }

if (-not $exists) {
  $body = @{ name = $Repo; private = (-not $Public); auto_init = $false
             description = '边缘节点与链路监控 · 节点与边缘监控系统' } | ConvertTo-Json
  try {
    Invoke-RestMethod -Uri 'https://api.github.com/user/repos' -Method Post -Headers $hdr `
      -Body $body -ContentType 'application/json' -TimeoutSec 30 | Out-Null
    Ok "仓库已创建"
  } catch {
    $code = $_.Exception.Response.StatusCode.value__; $msg = ''
    try { $sr = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream()); $msg = $sr.ReadToEnd() } catch {}
    Bad "建仓失败 HTTP $code : $msg"; exit 1
  }
} else { Ok "仓库已存在，直接推送" }

# ---------- 4. 初始化与提交 ----------
if (-not (Test-Path '.\.git')) { & $git init -b main | Out-Null; Ok "已初始化仓库（main）" }
& $git config user.name  $Owner
& $git config user.email "$Owner@users.noreply.github.com"
& $git config core.autocrlf false

& $git add -A
$staged = & $git diff --cached --name-only
if (-not $staged) { Ok "没有新改动需要提交" } else {
  Ok "待提交 $($staged.Count) 个文件"
  $risky = $staged | Select-String -Pattern '(^|/)\.env$|\.bak|SESSION_TRANSCRIPT|users\.json$|creds|cf_token'
  if ($risky) { Bad "暂存区含敏感文件，已中止:"; $risky | ForEach-Object { Bad "   $_" }; exit 1 }
  $hasCommit = $false
  & $git rev-parse --verify HEAD 2>$null | Out-Null
  if ($LASTEXITCODE -eq 0) { $hasCommit = $true }
  if ($hasCommit) { & $git commit -m "更新：$(Get-Date -Format 'yyyy-MM-dd HH:mm')" | Out-Null }
  else { & $git commit -m "初始提交：边缘节点与链路监控（边缘 Worker + 节点脚本 + 监控大屏 + 完整教程）" | Out-Null }
  Ok "已提交"
}

$branch = & $git branch --show-current
if (-not $branch) { $branch = 'main' }

# ---------- 5. 推送（令牌只在这条命令里出现，不写进 .git/config） ----------
& $git remote remove origin 2>$null
& $git remote add origin "https://$Owner`:$tok@github.com/$Owner/$Repo.git"
Info "推送到 origin/$branch ..."
& $git push -u origin $branch
$rc = $LASTEXITCODE
& $git remote set-url origin "https://github.com/$Owner/$Repo.git"
Ok "远端 URL 已还原为不含令牌的形式"

if ($DeleteTokenFile -and $TokenFile -and (Test-Path $TokenFile)) {
  Remove-Item $TokenFile -Force
  Ok "已删除令牌文件 $TokenFile"
}

# ---------- 6. 清掉可能被 git 记进凭据管理器的令牌 ----------
& cmdkey /delete:git:https://github.com 2>$null | Out-Null
Ok "已尝试清理 Windows 凭据管理器中的 github 项（如无该项属正常）"

if ($rc -ne 0) { Bad "推送失败（令牌权限不足 / 网络问题 / 仓库冲突）"; exit 1 }
Ok "完成 → https://github.com/$Owner/$Repo"
Write-Host ""
Write-Host "接下来请立刻吊销这个令牌：" -ForegroundColor Yellow
Write-Host "  https://github.com/settings/tokens" -ForegroundColor Gray
