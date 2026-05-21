param(
  [string]$OutputDir = "docs/commit-plan"
)

$ErrorActionPreference = "Stop"
$Utf8NoBom = [System.Text.UTF8Encoding]::new($false)

function Add-Path {
  param(
    [hashtable]$Groups,
    [string]$Group,
    [string]$Path
  )

  if (-not $Groups.ContainsKey($Group)) {
    $Groups[$Group] = New-Object System.Collections.Generic.List[string]
  }
  if (-not $Groups[$Group].Contains($Path)) {
    $Groups[$Group].Add($Path)
  }
}

function Normalize-Path {
  param([string]$Path)
  return ($Path -replace "\\", "/").Trim()
}

function Get-Group {
  param(
    [string]$Path,
    [string]$Status,
    [bool]$PackageJsonChanged
  )

  $p = Normalize-Path $Path

  if ($p -match "^(\.claude/|\.codex/|\.agent/|\.ai/|node_modules/|dist/|dist_old_|dist_locked_)" -or
      $p -match "\.tmp\.|~$|\.bak$") {
    return "99-excluded-local-workflow"
  }

  if ($p -eq "package-lock.json" -and -not $PackageJsonChanged) {
    return "98-review-needed"
  }

  if ($p -eq "AGENTS.md" -or $p -eq "CLAUDE.md" -or
      $p -match "^\.agents/" -or
      $p -match "^docs/(agent-handoff-notes|content-audit|superpowers/|commit-plan/)" -or
      $p -match "/AGENTS\.md$") {
    return "04-agent-project-docs"
  }

  if ($p -match "^src/content/(houses|villa)/" -or
      $p -eq "src/inventory/inventory.json" -or
      $p -eq "src/data/siteCopy.json" -or
      $p -eq "src/types.ts" -or
      $p -eq "src/components/AtAGlance.astro") {
    return "01-product-content-data"
  }

  if ($p -match "^src/components/" -or
      $p -match "^src/pages/" -or
      $p -eq "src/styles/global.css" -or
      $p -eq "tailwind.config.js" -or
      $p -eq "src/layouts/Base.astro") {
    return "02-ui-map-behavior"
  }

  if ($p -eq ".gitignore" -or
      $p -eq "astro.config.mjs" -or
      $p -eq "tsconfig.json" -or
      $p -eq "inject_srcset.cjs" -or
      $p -eq "update_data.js" -or
      $p -match "^public/_headers(\.txt)?$") {
    return "03-build-deploy-tooling"
  }

  return "98-review-needed"
}

$statusLines = git status --porcelain=v1
$changedPaths = New-Object System.Collections.Generic.List[object]

foreach ($line in $statusLines) {
  if ([string]::IsNullOrWhiteSpace($line)) { continue }
  $status = $line.Substring(0, 2)
  $path = $line.Substring(3).Trim()
  if ($path -match " -> ") {
    $parts = $path -split " -> ", 2
    $path = $parts[1]
  }
  $changedPaths.Add([pscustomobject]@{
    Status = $status
    Path = Normalize-Path $path
  })
}

$packageJsonChanged = $changedPaths.Path -contains "package.json"
$groups = @{}

foreach ($item in $changedPaths) {
  $group = Get-Group -Path $item.Path -Status $item.Status -PackageJsonChanged:$packageJsonChanged
  Add-Path -Groups $groups -Group $group -Path $item.Path
}

$groupDir = Join-Path $OutputDir "groups"
New-Item -ItemType Directory -Force -Path $groupDir | Out-Null

$orderedGroups = @(
  "01-product-content-data",
  "02-ui-map-behavior",
  "03-build-deploy-tooling",
  "04-agent-project-docs",
  "98-review-needed",
  "99-excluded-local-workflow"
)

foreach ($group in $orderedGroups) {
  $file = Join-Path $groupDir "$group.txt"
  $rawPaths = if ($groups.ContainsKey($group)) {
    $groups[$group]
  } else {
    @()
  }
  $paths = @($rawPaths | Where-Object { $_ } | Sort-Object)
  [System.IO.File]::WriteAllLines((Resolve-Path -LiteralPath (Split-Path -Parent $file)).Path + [System.IO.Path]::DirectorySeparatorChar + (Split-Path -Leaf $file), [string[]]$paths, $Utf8NoBom)
}

$report = New-Object System.Collections.Generic.List[string]
$report.Add("# Clean Commit Plan")
$report.Add("")
$report.Add("Generated: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')")
$report.Add("")
$report.Add("## Summary")
$report.Add("")

foreach ($group in $orderedGroups) {
  $count = if ($groups.ContainsKey($group)) { $groups[$group].Count } else { 0 }
  $report.Add("- ``$group``: $count path(s)")
}

$report.Add("")
$report.Add("## Recommended Commit Order")
$report.Add("")
$report.Add("1. ``01-product-content-data`` - property copy, inventory facts, content display data.")
$report.Add("2. ``02-ui-map-behavior`` - UI, maps, templates, shared visual behavior.")
$report.Add("3. ``03-build-deploy-tooling`` - build/deploy config and scripts after review.")
$report.Add("4. ``04-agent-project-docs`` - only if project agent docs/skills should be versioned.")
$report.Add("")
$report.Add("## Stage Commands")
$report.Add("")

foreach ($group in $orderedGroups | Where-Object { $_ -notmatch "^(98|99)-" }) {
  $pathspecFile = Normalize-Path (Join-Path $groupDir "$group.txt")
  $report.Add('```powershell')
  $report.Add("git add --pathspec-from-file=$pathspecFile")
  $report.Add("git diff --cached --stat")
  $report.Add("npm run build")
  $report.Add("npm run typecheck")
  $report.Add('```')
  $report.Add("")
}

$report.Add("## Review Notes")
$report.Add("")
$report.Add("- Do not stage ``99-excluded-local-workflow`` unless explicitly requested.")
$report.Add("- Inspect ``98-review-needed`` manually before deciding where each path belongs.")
$report.Add("- If staging deploy header changes, confirm whether ``public/_headers.txt`` was intentionally renamed to ``public/_headers``.")
$report.Add("- If ``package-lock.json`` is in review-needed, commit it only if npm lockfile metadata churn is intentional.")
$report.Add("")

foreach ($group in $orderedGroups) {
  $report.Add("## $group")
  $report.Add("")
  if ($groups.ContainsKey($group) -and $groups[$group].Count -gt 0) {
    foreach ($path in ($groups[$group] | Sort-Object)) {
      $report.Add("- ``$path``")
    }
  } else {
    $report.Add("- None")
  }
  $report.Add("")
}

New-Item -ItemType Directory -Force -Path $OutputDir | Out-Null
[System.IO.File]::WriteAllLines((Resolve-Path -LiteralPath $OutputDir).Path + [System.IO.Path]::DirectorySeparatorChar + "clean-commit-plan.md", [string[]]$report, $Utf8NoBom)

Write-Output "Wrote $OutputDir/clean-commit-plan.md"
Write-Output "Wrote pathspec files under $groupDir"
