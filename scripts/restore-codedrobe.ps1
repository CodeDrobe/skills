[CmdletBinding()]
param(
  [int]$Port = 9335,
  [switch]$Uninstall,
  [switch]$RestoreBaseTheme
)

$ErrorActionPreference = 'Stop'
$node = (Get-Command node -ErrorAction Stop).Source
$injector = Join-Path $PSScriptRoot 'injector.mjs'
$StateRoot = Join-Path $env:LOCALAPPDATA 'CodeDrobe'
$StatePath = Join-Path $StateRoot 'state.json'

function Stop-DreamInjector([int]$ProcessId) {
  if ($ProcessId -le 0) { return }
  try {
    $process = Get-CimInstance Win32_Process -Filter "ProcessId = $ProcessId"
    if ($process.CommandLine -like "*$injector*" -and $process.CommandLine -like '*--watch*') {
      Stop-Process -Id $ProcessId -Force -ErrorAction SilentlyContinue
    }
  } catch {}
}

if (Test-Path -LiteralPath $StatePath) {
  try {
    $state = Get-Content -LiteralPath $StatePath -Raw | ConvertFrom-Json
    if ($state.port -and -not $PSBoundParameters.ContainsKey('Port')) { $Port = [int]$state.port }
    if ($state.injectorPid) { Stop-DreamInjector ([int]$state.injectorPid) }
  } catch {}
  Remove-Item -LiteralPath $StatePath -Force -ErrorAction SilentlyContinue
}
Start-Sleep -Milliseconds 250
try { & $node $injector --remove --port $Port --timeout-ms 3000 } catch {}

if ($Uninstall) {
  $desktop = [Environment]::GetFolderPath('Desktop')
  $startMenu = Join-Path $env:APPDATA 'Microsoft\Windows\Start Menu\Programs'
  @(
    (Join-Path $desktop 'CodeDrobe.lnk'),
    (Join-Path $desktop 'CodeDrobe - Restore.lnk'),
    (Join-Path $startMenu 'CodeDrobe.lnk')
  ) | ForEach-Object { Remove-Item -LiteralPath $_ -Force -ErrorAction SilentlyContinue }
}

if ($RestoreBaseTheme) {
  $backup = Join-Path $StateRoot 'config.before-codedrobe.toml'
  $config = Join-Path $HOME '.codex\config.toml'
  if (-not (Test-Path -LiteralPath $backup)) { throw 'No pre-install config backup is available.' }
  & $node (Join-Path $PSScriptRoot 'theme-tool.mjs') restore --config $config --backup $backup
  if ($LASTEXITCODE -ne 0) { throw 'Failed to restore the base theme.' }
}

Write-Host 'The live CodeDrobe was removed.'
