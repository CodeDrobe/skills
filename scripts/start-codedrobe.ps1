[CmdletBinding()]
param(
  [int]$Port = 9335,
  [string]$Theme = 'dream',
  [switch]$RestartExisting,
  [string]$ProfilePath,
  [switch]$ForegroundInjector
)

$ErrorActionPreference = 'Stop'
$SkillRoot = Split-Path -Parent $PSScriptRoot
$Injector = Join-Path $PSScriptRoot 'injector.mjs'
$StateRoot = Join-Path $env:LOCALAPPDATA 'CodeDrobe'
$StatePath = Join-Path $StateRoot 'state.json'
$StdoutPath = Join-Path $StateRoot 'injector.log'
$StderrPath = Join-Path $StateRoot 'injector-error.log'
New-Item -ItemType Directory -Force -Path $StateRoot | Out-Null

function Test-CodexDebugPort([int]$CandidatePort) {
  try {
    $targets = Invoke-RestMethod "http://127.0.0.1:$CandidatePort/json/list" -TimeoutSec 1
    return [bool]($targets | Where-Object { $_.type -eq 'page' -and $_.url -like 'app://*' })
  } catch {
    return $false
  }
}

function Stop-CodeDrobeInjector([int]$ProcessId) {
  if ($ProcessId -le 0) { return }
  try {
    $process = Get-CimInstance Win32_Process -Filter "ProcessId = $ProcessId"
    if ($process.CommandLine -like "*$Injector*" -and $process.CommandLine -like '*--watch*') {
      Stop-Process -Id $ProcessId -Force -ErrorAction SilentlyContinue
    }
  } catch {}
}

$node = (Get-Command node -ErrorAction Stop).Source
& $node (Join-Path $PSScriptRoot 'theme-tool.mjs') info --theme $Theme --platform win32 *> $null
if ($LASTEXITCODE -ne 0) { throw "Theme '$Theme' is invalid." }
$debugReady = Test-CodexDebugPort $Port
$mainProcesses = @(Get-Process ChatGPT -ErrorAction SilentlyContinue | Where-Object { $_.MainWindowHandle -ne 0 })

if (-not $debugReady -and -not $ProfilePath -and $mainProcesses.Count -gt 0) {
  if (-not $RestartExisting) {
    throw "Codex is already running without CodeDrobe debugging on port $Port. Close Codex or rerun with -RestartExisting."
  }
  foreach ($process in $mainProcesses) { [void]$process.CloseMainWindow() }
  Start-Sleep -Seconds 2
  Get-Process ChatGPT -ErrorAction SilentlyContinue | Stop-Process -Force
  Start-Sleep -Milliseconds 600
}

if (-not (Test-CodexDebugPort $Port)) {
  if (Get-NetTCPConnection -LocalPort $Port -State Listen -ErrorAction SilentlyContinue) {
    throw "Port $Port is occupied by another process."
  }
  $package = Get-AppxPackage OpenAI.Codex | Sort-Object Version -Descending | Select-Object -First 1
  if (-not $package) { throw 'The OpenAI.Codex Store package is not installed.' }
  $exe = Join-Path $package.InstallLocation 'app\ChatGPT.exe'
  if (-not (Test-Path -LiteralPath $exe)) { throw "Codex executable not found: $exe" }
  $arguments = @('--remote-debugging-address=127.0.0.1', "--remote-debugging-port=$Port")
  if ($ProfilePath) {
    New-Item -ItemType Directory -Force -Path $ProfilePath | Out-Null
    $arguments += "--user-data-dir=$ProfilePath"
  }
  Start-Process -FilePath $exe -ArgumentList $arguments
}

$deadline = (Get-Date).AddSeconds(30)
while (-not (Test-CodexDebugPort $Port)) {
  if ((Get-Date) -ge $deadline) { throw "Codex did not expose CDP on port $Port within 30 seconds." }
  Start-Sleep -Milliseconds 400
}

if (Test-Path -LiteralPath $StatePath) {
  try {
    $old = Get-Content -LiteralPath $StatePath -Raw | ConvertFrom-Json
    if ($old.injectorPid) { Stop-CodeDrobeInjector ([int]$old.injectorPid) }
  } catch {}
}

if ($ForegroundInjector) {
  & $node $Injector --watch --port $Port --theme $Theme
  exit $LASTEXITCODE
}

$injectorArgs = @("`"$Injector`"", '--watch', '--port', "$Port", '--theme', "`"$Theme`"")
$daemon = Start-Process -FilePath $node -ArgumentList $injectorArgs -WindowStyle Hidden -PassThru -RedirectStandardOutput $StdoutPath -RedirectStandardError $StderrPath
@{
  port = $Port
  injectorPid = $daemon.Id
  startedAt = (Get-Date).ToString('o')
  skillRoot = $SkillRoot
  profilePath = $ProfilePath
  theme = $Theme
} | ConvertTo-Json | Set-Content -LiteralPath $StatePath -Encoding utf8

$verified = $false
for ($attempt = 0; $attempt -lt 45; $attempt++) {
  Start-Sleep -Milliseconds 700
  & $node $Injector --verify --port $Port --theme $Theme --timeout-ms 3000 *> $null
  if ($LASTEXITCODE -eq 0) { $verified = $true; break }
}
if (-not $verified) { throw 'CodeDrobe launched but verification failed. See injector logs.' }
Write-Host "CodeDrobe theme '$Theme' is active on port $Port."
