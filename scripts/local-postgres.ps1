$ErrorActionPreference = 'Stop'
$pansWorkspace = (Resolve-Path (Join-Path $PSScriptRoot '..')).Path
$pansPgBin = 'C:\Program Files\PostgreSQL\18\bin'
if (!(Test-Path -LiteralPath (Join-Path $pansPgBin 'initdb.exe'))) { throw 'PostgreSQL 18 is not installed. Set DATABASE_URL, or use the documented SQLite development option.' }
$pansDataRoot = Join-Path $pansWorkspace '.data'
$pansPgData = Join-Path $pansDataRoot 'postgres'
$pansEnvPath = Join-Path $pansWorkspace '.env.local'
New-Item -ItemType Directory -Force -Path $pansDataRoot | Out-Null
if (!(Test-Path -LiteralPath (Join-Path $pansPgData 'PG_VERSION'))) {
 if (Test-Path -LiteralPath $pansEnvPath) { throw '.env.local already exists. Configure DATABASE_URL explicitly to preserve your settings.' }
 $pansRandom = [byte[]]::new(32)
 $pansRng = [System.Security.Cryptography.RandomNumberGenerator]::Create()
 $pansRng.GetBytes($pansRandom)
 $pansPassword = [Convert]::ToBase64String($pansRandom)
 $pansPasswordPath = Join-Path $pansDataRoot 'postgres-password'
 [System.IO.File]::WriteAllText($pansPasswordPath, $pansPassword)
 & (Join-Path $pansPgBin 'initdb.exe') -D $pansPgData --username=pans --auth=scram-sha-256 --encoding=UTF8 --locale=C --pwfile=$pansPasswordPath
 if ($LASTEXITCODE -ne 0) { throw 'Could not initialize PostgreSQL.' }
 $pansSecretBytes = [byte[]]::new(48)
 $pansRng.GetBytes($pansSecretBytes)
 $pansSecret = [Convert]::ToBase64String($pansSecretBytes)
 $pansRng.Dispose()
 $pansDatabaseURL = 'postgresql://pans:' + [Uri]::EscapeDataString($pansPassword) + '@127.0.0.1:55432/postgres'
 [System.IO.File]::WriteAllLines($pansEnvPath, @("DATABASE_URL=$pansDatabaseURL", "PAYLOAD_SECRET=$pansSecret", 'NEXT_PUBLIC_SERVER_URL=http://localhost:3000'))
}
& (Join-Path $pansPgBin 'pg_ctl.exe') -D $pansPgData status | Out-Null
if ($LASTEXITCODE -ne 0) {
 & (Join-Path $pansPgBin 'pg_ctl.exe') -D $pansPgData -l (Join-Path $pansDataRoot 'postgres.log') -o '-h 127.0.0.1 -p 55432' -w start
 if ($LASTEXITCODE -ne 0) { throw 'Could not start the local database. Inspect .data/postgres.log.' }
}
Write-Output 'Local PostgreSQL is ready on 127.0.0.1:55432. Connection settings are in .env.local.'

