# ============================================================================
#  setup_github.ps1 —— 一次性把当前目录推到 GitHub
#
#  设计原则：令牌不落盘、不进 shell 历史、不进仓库。
#    · 第一次（创建仓库）：脚本会安全提示你粘贴令牌，只用于调 GitHub API 建仓库；
#      之后 git 自己会向你要一次密码（粘贴同一个令牌），由 Windows 凭据管理器保存。
#    · 之后（再次推送）：直接 git add/commit/push 即可，不用再给令牌。
#
#  用法：
#    powershell -ExecutionPolicy Bypass -File setup_github.ps1 -Owner <用户名> -Repo <仓库名>
# ============================================================================
param(
  [Parameter(Mandatory=$true)][string]$Owner,
  [Parameter(Mandatory=$true)][string]$Repo,
  [ValidateSet('create','push')][string]$Mode = 'create',
  [string]$WorkDir = ''
)

$ErrorActionPreference = 'Stop'
function Info($m) { Write-Host "[*] $m" -ForegroundColor Cyan }
function Ok($m)   { Write-Host "[+] $m" -ForegroundColor Green }
function Bad($m)  { Write-Host "[!] $m" -ForegroundColor Red }

if (-not $WorkDir) { $WorkDir = (Get-Location).Path }
Set-Location $WorkDir
Info "工作目录: $WorkDir"

# ---------- 0. 检查 git ----------
$git = (Get-Command git -ErrorAction SilentlyContinue).Source
if (-not $git) {
  Bad "没找到 git。请先安装其中一种："
  Bad "  A) winget install --id Git.Git -e --source winget"
  Bad "  B) 或装 GitHub Desktop（自带 git，且用浏览器登录，最省事）"
  exit 1
}
Ok "git: $git"

# ---------- 1. 硬门槛：凭据自检 ----------
if (Test-Path '.\tools\check_secrets.py') {
  Info "提交前凭据自检 ..."
  python .\tools\check_secrets.py
  if ($LASTEXITCODE -ne 0) { Bad "自检发现问题（见上方列表），已中止。确认误报后再手动提交。"; exit 1 }
}
if (-not (Test-Path '.\.gitignore')) { Bad "缺少 .gitignore，已中止"; exit 1 }
foreach ($f in @('.env','config.json','users.json','tunnel_creds.json','.cf_token')) {
  if (Test-Path $f) { Bad "目录里存在敏感文件 $f，已中止（请先移走或确认被忽略）"; exit 1 }
}

# ---------- 2. 初始化仓库 ----------
if (-not (Test-Path '.\.git')) { git init -b main | Out-Null; Ok "已初始化仓库（main）" }
else { Ok "仓库已存在" }

if (-not (git config user.name))  { git config user.name  $Owner }
if (-not (git config user.email)) { git config user.email "$Owner@users.noreply.github.com" }
Ok "提交身份: $(git config user.name) <$(git config user.email)>"

# ---------- 3. 远端 ----------
$pushUrl = "https://$Owner@github.com/$Owner/$Repo.git"
if ($Mode -eq 'create') {
  $sec = Read-Host "请粘贴 GitHub 令牌（输入时不显示）" -AsSecureString
  $tok = [Runtime.InteropServices.Marshal]::PtrToStringAuto(
           [Runtime.InteropServices.Marshal]::SecureStringToBSTR($sec))
  Info "校验令牌 ..."
  $hdr = @{ Authorization = "Bearer $tok"; 'User-Agent' = 'noc-setup'; Accept = 'application/vnd.github+json' }
  try   { $me = Invoke-RestMethod -Uri 'https://api.github.com/user' -Headers $hdr -TimeoutSec 30
          Ok "令牌有效，身份: $($me.login)" }
  catch { Bad "令牌校验失败: $($_.Exception.Message)"; exit 1 }

  Info "创建仓库 $Owner/$Repo（默认私有）..."
  $body = @{ name = $Repo; private = $true; auto_init = $false
             description = '边缘节点与链路监控 · 节点与边缘监控系统' } | ConvertTo-Json
  try   { Invoke-RestMethod -Uri 'https://api.github.com/user/repos' -Method Post -Headers $hdr `
            -Body $body -ContentType 'application/json' -TimeoutSec 30 | Out-Null
          Ok "仓库已创建" }
  catch {
    if ($_.Exception.Response.StatusCode.value__ -eq 422) { Ok "仓库已存在，继续" }
    else { Bad "创建失败: $($_.Exception.Message)"; exit 1 }
  }
  git config --local credential.helper manager
  $tok = $null; [GC]::Collect()
}

git remote remove origin 2>$null
git remote add origin $pushUrl
Ok "远端: $pushUrl"

# ---------- 4. 提交 ----------
git add -A
$staged = (git diff --cached --name-only | Measure-Object).Count
Ok "待提交 $staged 个文件"

$risky = git diff --cached --name-only | Select-String -Pattern '(^|/)\.env$|\.bak|SESSION_TRANSCRIPT|users\.json$|_creds|\.cf_token'
if ($risky) { Bad "暂存区里出现敏感文件，已中止:"; $risky | ForEach-Object { Bad "   $_" }; exit 1 }
Ok "暂存区已确认无敏感文件"

if (-not (git log --oneline -1 2>$null)) {
  git commit -m "初始提交：边缘节点与链路监控（边缘 Worker + 节点脚本 + 监控大屏 + 教程）" | Out-Null
  Ok "已创建首个提交"
} else {
  $msg = Read-Host "输入本次提交信息（回车使用默认）"
  if (-not $msg) { $msg = "更新：$(Get-Date -Format 'yyyy-MM-dd HH:mm')" }
  git commit -m $msg | Out-Null
  Ok "已提交"
}

$branch = 'main'
foreach ($b in @('main','master')) { if (git show-ref --verify --quiet "refs/heads/$b") { $branch = $b; break } }
Info "推送到 origin/$branch ...（首次会要求输入用户名与令牌作为密码）"
git push -u origin $branch
if ($LASTEXITCODE -ne 0) { Bad "推送失败：常见原因是令牌权限不足 / 仓库名冲突 / 网络问题"; exit 1 }

Ok "完成 → https://github.com/$Owner/$Repo"
Write-Host ""
Write-Host "后续推送：" -ForegroundColor Cyan
Write-Host "  git add -A; git commit -m `"说明`"; git push" -ForegroundColor Gray
Write-Host ""
Write-Host "安全提示：令牌只用于建仓库与首次推送，git 会交给 Windows 凭据管理器保管。" -ForegroundColor Yellow
Write-Host "         不想保留可随时到 GitHub 设置里吊销，不影响已推送内容。" -ForegroundColor Yellow
