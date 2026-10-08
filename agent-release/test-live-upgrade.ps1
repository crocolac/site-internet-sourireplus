$ErrorActionPreference = 'Stop'
# Disposable CI account: prove that the installed compiled launcher delegates
# signed update without administrator rights. No patient data or clinic access.
$Name = 'spci' + [Guid]::NewGuid().ToString('N').Substring(0, 10)
$Password = ConvertTo-SecureString ([Guid]::NewGuid().ToString('N') + '!aA9') -AsPlainText -Force
$Root = Join-Path $env:ProgramData $Name
$Launcher = Join-Path ([Environment]::GetFolderPath('ProgramFiles')) 'SourirePlus\Bridge\SourirePlusLauncher.exe'
$User = $null
try {
    $User = New-LocalUser -Name $Name -Password $Password -AccountNeverExpires
    $Users = Get-LocalGroup -SID 'S-1-5-32-545'
    Add-LocalGroupMember -Group $Users -Member $User
    New-Item -ItemType Directory -Path $Root | Out-Null
    & icacls.exe $Root /grant ($Name + ':(OI)(CI)F') | Out-Null
    if ($LASTEXITCODE -ne 0) { throw 'Test directory ACL failed.' }
    @'
param([string]$Launcher, [string]$Output)
$ErrorActionPreference = 'Stop'
try {
    $Principal = New-Object Security.Principal.WindowsPrincipal([Security.Principal.WindowsIdentity]::GetCurrent())
    if ($Principal.IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)) { throw 'Test account is elevated.' }
    $Before = (& $Launcher --launcher-diagnose | Out-String) | ConvertFrom-Json
    if ($Before.selected_version -ne '0.6.0' -or $Before.payload_source -ne 'seed') { throw 'Expected installed production seed.' }
    $Update = (& $Launcher --check-updates-now | Out-String) | ConvertFrom-Json
    if ($LASTEXITCODE -ne 0 -or $Update.update_status -ne 'updated') { throw 'Signed update failed.' }
    $After = (& $Launcher --launcher-diagnose | Out-String) | ConvertFrom-Json
    if ($LASTEXITCODE -ne 0 -or $After.selected_version -ne '0.6.1' -or $After.selected_release -ne 7 -or $After.payload_source -eq 'seed') { throw 'Updated payload not selected.' }
    $Again = (& $Launcher --check-updates-now | Out-String) | ConvertFrom-Json
    if ($LASTEXITCODE -ne 0 -or $Again.update_status -ne 'up_to_date') { throw 'Repeated check failed.' }
    $Preflight = (& $Launcher --preflight | Out-String) | ConvertFrom-Json
    if ($LASTEXITCODE -ne 0 -or $Preflight.clinical_ready -ne $false) { throw 'Updated maintenance delegation failed.' }
    'PASS: live signed upgrade 0.6.0 to 0.6.1, standard Windows user' | Set-Content -LiteralPath $Output
    exit 0
} catch {
    'FAIL: ' + $_.Exception.Message | Set-Content -LiteralPath $Output
    exit 1
}
'@ | Set-Content -LiteralPath (Join-Path $Root 'verify.ps1') -Encoding ASCII
    Start-Service seclogon
    $Credential = New-Object Management.Automation.PSCredential(($env:COMPUTERNAME + '\' + $Name), $Password)
    $Output = Join-Path $Root 'result.txt'
    $Process = Start-Process powershell.exe -Credential $Credential -LoadUserProfile -PassThru `
        -ArgumentList ('-NoProfile -ExecutionPolicy Bypass -File "' + (Join-Path $Root 'verify.ps1') + '" -Launcher "' + $Launcher + '" -Output "' + $Output + '"')
    if (-not $Process.WaitForExit(180000)) { $Process.Kill(); throw 'Standard-user test timed out.' }
    if (Test-Path -LiteralPath $Output) { Get-Content -LiteralPath $Output }
    if ($Process.ExitCode -ne 0 -or -not (Test-Path -LiteralPath $Output)) { throw 'Standard-user compiled check failed.' }
} finally {
    if ($null -ne $User) { Remove-LocalUser -Name $Name -ErrorAction SilentlyContinue }
    if (Test-Path -LiteralPath $Root) { Remove-Item -LiteralPath $Root -Recurse -Force }
}

