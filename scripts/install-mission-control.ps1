#requires -Version 7.0

[CmdletBinding()]
param(
    [string]$CodexHome = (Join-Path ([Environment]::GetFolderPath([Environment+SpecialFolder]::UserProfile)) '.codex'),
    [switch]$Check
)

$ErrorActionPreference = 'Stop'
Set-StrictMode -Version Latest

$repoRoot = Split-Path -Parent $PSScriptRoot
$toolkit = Join-Path $repoRoot 'bin\toolkit.mjs'
$node = Get-Command node -ErrorAction Stop

$arguments = @($toolkit, 'mission-control')
if ($Check) {
    $arguments += 'check'
}
$arguments += @('--codex-home', $CodexHome)

& $node.Source @arguments
if ($LASTEXITCODE -ne 0) {
    exit $LASTEXITCODE
}
