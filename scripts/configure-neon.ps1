$ErrorActionPreference = 'Stop'
$pansWorkspace = (Resolve-Path (Join-Path $PSScriptRoot '..')).Path
$pansEnvPath = Join-Path $pansWorkspace '.env.local'
if (!(Test-Path -LiteralPath $pansEnvPath)) { throw 'Set up .env.local before configuring Neon.' }
$pansSecureURL = Read-Host 'Paste the pooled Neon connection URL only (input is hidden)' -AsSecureString
$pansURLPointer = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($pansSecureURL)
try {
  $pansURL = [Runtime.InteropServices.Marshal]::PtrToStringBSTR($pansURLPointer).Trim()
  try { $pansURI = [Uri]$pansURL } catch { throw 'Enter the PostgreSQL connection URL only, without psql or surrounding quotes.' }
  if ($pansURI.Scheme -notin @('postgres', 'postgresql') -or $pansURI.Host -notmatch '^ep-[a-z0-9-]+-pooler\.[a-z0-9.-]+\.neon\.tech$' -or !$pansURI.UserInfo.Contains(':') -or $pansURI.AbsolutePath -eq '/' -or $pansURL -match '[\r\n"'']') {
    throw 'Use the pooled PostgreSQL URL from the Neon Connect dialog. Nothing was changed.'
  }
  if ($pansURI.Query -notmatch '(?:^\?|&)sslmode=(require|verify-full)(?:&|$)') { throw 'Keep sslmode=require in the Neon URL.' }
  $pansDirectBuilder = [UriBuilder]::new($pansURI)
  $pansDirectBuilder.Host = $pansURI.Host.Replace('-pooler.', '.')
  $pansSettings = [ordered]@{
    NEON_DATABASE_URL = $pansURL
    NEON_DATABASE_URL_UNPOOLED = $pansDirectBuilder.Uri.AbsoluteUri
  }
  $pansEnv = [IO.File]::ReadAllText($pansEnvPath)
  foreach ($pansSetting in $pansSettings.Keys) {
    $pansPattern = '(?m)^' + [regex]::Escape($pansSetting) + '=.*$'
    $pansLine = $pansSetting + '=' + $pansSettings[$pansSetting]
    if ([regex]::IsMatch($pansEnv, $pansPattern)) {
      $pansEnv = [regex]::Replace($pansEnv, $pansPattern, [System.Text.RegularExpressions.MatchEvaluator]{ param($pansMatch) $pansLine })
    } else { $pansEnv = $pansEnv.TrimEnd("`r", "`n") + "`r`n" + $pansLine + "`r`n" }
  }
  [IO.File]::WriteAllText($pansEnvPath, $pansEnv, [Text.UTF8Encoding]::new($false))
} finally {
  [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($pansURLPointer)
  $pansURL = $null
  $pansSecureURL.Dispose()
}
Write-Output 'Neon connection saved securely in .env.local. The app is still using its existing database.'
Write-Output 'Tell Codex the connection is saved so the existing data can be transferred before switching.'
