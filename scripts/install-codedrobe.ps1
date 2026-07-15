[CmdletBinding()]
param(
  [int]$Port = 9335,
  [string]$Theme = 'dream',
  [switch]$NoShortcuts
)

$ErrorActionPreference = 'Stop'
$SkillRoot = Split-Path -Parent $PSScriptRoot
$StateRoot = Join-Path $env:LOCALAPPDATA 'CodeDrobe'
New-Item -ItemType Directory -Force -Path $StateRoot | Out-Null
$ConfigPath = Join-Path $HOME '.codex\config.toml'
$BackupPath = Join-Path $StateRoot 'config.before-codedrobe.toml'
if (-not (Test-Path -LiteralPath $ConfigPath)) { throw "Codex config not found: $ConfigPath" }
$node = (Get-Command node -ErrorAction Stop).Source
$themeTool = Join-Path $PSScriptRoot 'theme-tool.mjs'
& $node $themeTool apply --theme $Theme --platform win32 --config $ConfigPath --backup $BackupPath
if ($LASTEXITCODE -ne 0) { throw "Failed to configure base theme '$Theme'." }

if (-not $NoShortcuts) {
  $shell = New-Object -ComObject WScript.Shell
  $desktop = [Environment]::GetFolderPath('Desktop')
  $startMenu = Join-Path $env:APPDATA 'Microsoft\Windows\Start Menu\Programs'
  $powershell = (Get-Command powershell.exe).Source
  $startScript = Join-Path $PSScriptRoot 'start-codedrobe.ps1'
  $restoreScript = Join-Path $PSScriptRoot 'restore-codedrobe.ps1'
  foreach ($folder in @($desktop, $startMenu)) {
    $shortcut = $shell.CreateShortcut((Join-Path $folder 'CodeDrobe.lnk'))
    $shortcut.TargetPath = $powershell
    $shortcut.Arguments = "-NoProfile -ExecutionPolicy Bypass -File `"$startScript`" -Port $Port -Theme `"$Theme`""
    $shortcut.WorkingDirectory = $SkillRoot
    $shortcut.Description = 'Launch Codex with the Dream/Fiona full interface skin'
    $shortcut.Save()
  }
  $restore = $shell.CreateShortcut((Join-Path $desktop 'CodeDrobe - Restore.lnk'))
  $restore.TargetPath = $powershell
  $restore.Arguments = "-NoProfile -ExecutionPolicy Bypass -File `"$restoreScript`" -Port $Port"
  $restore.WorkingDirectory = $SkillRoot
  $restore.Description = 'Remove the live CodeDrobe'
  $restore.Save()
}

Write-Host "CodeDrobe theme '$Theme' installed. Launch it with the created shortcut or start-codedrobe.ps1."
