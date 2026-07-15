[CmdletBinding()]
param(
  [int]$Port = 9335,
  [string]$Theme = 'dream',
  [string]$ScreenshotPath
)

$ErrorActionPreference = 'Stop'
$node = (Get-Command node -ErrorAction Stop).Source
$injector = Join-Path $PSScriptRoot 'injector.mjs'
$arguments = @($injector, '--verify', '--port', "$Port", '--theme', $Theme)
if ($ScreenshotPath) { $arguments += @('--screenshot', $ScreenshotPath) }
& $node @arguments
exit $LASTEXITCODE
