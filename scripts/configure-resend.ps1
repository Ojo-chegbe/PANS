param([string]$SenderAddress = 'onboarding@resend.dev')
$ErrorActionPreference = 'Stop'
$pansWorkspace = (Resolve-Path (Join-Path $PSScriptRoot '..')).Path
$pansEnvPath = Join-Path $pansWorkspace '.env.local'
$pansAddress = [System.Net.Mail.MailAddress]::new($SenderAddress)
if ($pansAddress.Address -ne $SenderAddress -or $SenderAddress -match '[\r\n]') {
  throw 'Enter a plain sender email address without a display name.'
}
$pansSecureKey = Read-Host 'Paste your Resend API key (input is hidden)' -AsSecureString
$pansKeyPointer = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($pansSecureKey)
try {
  $pansKey = [Runtime.InteropServices.Marshal]::PtrToStringBSTR($pansKeyPointer)
  if ($pansKey -notmatch '^re_[A-Za-z0-9_-]+$') { throw 'The Resend key must begin with re_. Nothing was saved.' }
  $pansEnv = if (Test-Path -LiteralPath $pansEnvPath) { [IO.File]::ReadAllText($pansEnvPath) } else { '' }
  $pansSettings = [ordered]@{
    RESEND_API_KEY = $pansKey
    EMAIL_FROM_ADDRESS = $SenderAddress
    EMAIL_FROM_NAME = 'PANS UNIJOS'
  }
  foreach ($pansSetting in $pansSettings.Keys) {
    $pansPattern = '(?m)^' + [regex]::Escape($pansSetting) + '=.*$'
    $pansLine = $pansSetting + '=' + $pansSettings[$pansSetting]
    if ([regex]::IsMatch($pansEnv, $pansPattern)) {
      # MatchEvaluator keeps key contents literal, with no replacement expansion.
      $pansEnv = [regex]::Replace($pansEnv, $pansPattern, [System.Text.RegularExpressions.MatchEvaluator]{ param($pansMatch) $pansLine })
    } else { $pansEnv = $pansEnv.TrimEnd("`r", "`n") + "`r`n" + $pansLine + "`r`n" }
  }
  [IO.File]::WriteAllText($pansEnvPath, $pansEnv, [Text.UTF8Encoding]::new($false))
} finally {
  [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($pansKeyPointer)
  $pansKey = $null
  $pansSecureKey.Dispose()
}
Write-Output 'Resend settings saved in the ignored .env.local file. Restart the app to apply them.'
if ($SenderAddress -eq 'onboarding@resend.dev') {
  Write-Output 'Without a verified domain, use the same recipient email address as your Resend account.'
}
