param([switch]$Verify)
$ErrorActionPreference='Stop'
$pansWorkspace=(Resolve-Path (Join-Path $PSScriptRoot '..')).Path
$pansPgBin='C:\Program Files\PostgreSQL\18\bin'
$pansEnvPath=Join-Path $pansWorkspace '.env.local'
$pansDatabaseLine=Get-Content -LiteralPath $pansEnvPath | Where-Object { $_.StartsWith('DATABASE_URL=') } | Select-Object -First 1
if(!$pansDatabaseLine){throw 'DATABASE_URL is required for the local PostgreSQL backup.'}
$pansDatabaseUri=[Uri]$pansDatabaseLine.Substring(13)
$pansUserInfo=$pansDatabaseUri.UserInfo.Split(':',2)
$pansDbUser=[Uri]::UnescapeDataString($pansUserInfo[0])
$pansDbPassword=[Uri]::UnescapeDataString($pansUserInfo[1])
$pansDbName=$pansDatabaseUri.AbsolutePath.TrimStart('/')
$pansStamp=[DateTime]::UtcNow.ToString('yyyyMMddHHmmss')
$pansBackupPath=[IO.Path]::GetFullPath((Join-Path $pansWorkspace ('.data\backups\'+$pansStamp)))
if(!$pansBackupPath.StartsWith($pansWorkspace+[IO.Path]::DirectorySeparatorChar,[StringComparison]::OrdinalIgnoreCase)){throw 'Backup target must remain in the project workspace.'}
New-Item -ItemType Directory -Force -Path $pansBackupPath | Out-Null
$pansPreviousPassword=$env:PGPASSWORD
$env:PGPASSWORD=$pansDbPassword
$pansRestoreDatabase='pans_restorecheck_'+$pansStamp+'_'+[Guid]::NewGuid().ToString('N').Substring(0,8)
$pansCreatedRestoreDatabase=$false
try {
 & (Join-Path $pansPgBin 'pg_dump.exe') -h $pansDatabaseUri.Host -p $pansDatabaseUri.Port -U $pansDbUser -Fc -f (Join-Path $pansBackupPath 'database.dump') $pansDbName
 if($LASTEXITCODE -ne 0){throw 'Database backup failed.'}
 foreach($pansUploadFolder in @('media','files')){ $pansUploadPath=Join-Path $pansWorkspace ('.data\'+$pansUploadFolder);if(Test-Path -LiteralPath $pansUploadPath){Copy-Item -LiteralPath $pansUploadPath -Destination (Join-Path $pansBackupPath $pansUploadFolder) -Recurse} }
 if($Verify){
  if($pansRestoreDatabase -notmatch '^pans_restorecheck_\d{14}_[a-f0-9]{8}$'){throw 'Invalid temporary restore database name.'}
  & (Join-Path $pansPgBin 'createdb.exe') -h $pansDatabaseUri.Host -p $pansDatabaseUri.Port -U $pansDbUser $pansRestoreDatabase
  if($LASTEXITCODE -ne 0){throw 'Could not create the temporary restore database.'}
  $pansCreatedRestoreDatabase=$true
  & (Join-Path $pansPgBin 'pg_restore.exe') -h $pansDatabaseUri.Host -p $pansDatabaseUri.Port -U $pansDbUser --no-owner --exit-on-error -d $pansRestoreDatabase (Join-Path $pansBackupPath 'database.dump')
  if($LASTEXITCODE -ne 0){throw 'Backup restoration verification failed.'}
  $pansCountQuery='SELECT (SELECT count(*) FROM products), (SELECT count(*) FROM leadership), (SELECT count(*) FROM events), (SELECT count(*) FROM photos);'
  $pansOriginalCounts=& (Join-Path $pansPgBin 'psql.exe') -h $pansDatabaseUri.Host -p $pansDatabaseUri.Port -U $pansDbUser -d $pansDbName -t -A -c $pansCountQuery
  $pansRestoredCounts=& (Join-Path $pansPgBin 'psql.exe') -h $pansDatabaseUri.Host -p $pansDatabaseUri.Port -U $pansDbUser -d $pansRestoreDatabase -t -A -c $pansCountQuery
  if(($pansOriginalCounts -join '') -ne ($pansRestoredCounts -join '')){throw 'Restored record counts do not match the source.'}
  Write-Output 'Restoration verified against the catalogue, leadership, events, and gallery records.'
 }
 $pansManifest=@{createdAt=[DateTime]::UtcNow.ToString('o');database='database.dump';uploads=@('media','files');restorationVerified=[bool]$Verify;note='Preserve environment configuration separately. Off-site and object-storage backups require deployment configuration.'}|ConvertTo-Json
 [IO.File]::WriteAllText((Join-Path $pansBackupPath 'manifest.json'),$pansManifest)
 Write-Output ('Backup saved in .data/backups/'+$pansStamp)
} finally {
 if($pansCreatedRestoreDatabase -and $pansRestoreDatabase -match '^pans_restorecheck_\d{14}_[a-f0-9]{8}$'){
  & (Join-Path $pansPgBin 'dropdb.exe') -h $pansDatabaseUri.Host -p $pansDatabaseUri.Port -U $pansDbUser $pansRestoreDatabase
 }
 $env:PGPASSWORD=$pansPreviousPassword
}

