$ErrorActionPreference = 'Stop'

$serviceName = 'MySQL95'
$mysqldPath = 'C:\Program Files\MySQL\MySQL Server 9.5\bin\mysqld.exe'
$mysqlPath = 'C:\Program Files\MySQL\MySQL Server 9.5\bin\mysql.exe'
$defaultsFile = 'C:\ProgramData\MySQL\MySQL Server 9.5\my.ini'
$newRootPassword = 'will1234'
$startupLog = Join-Path $PSScriptRoot 'mysql-safe-start.log'
$startupErrLog = Join-Path $PSScriptRoot 'mysql-safe-start.err.log'

function Invoke-MySql {
	param(
		[Parameter(Mandatory = $true)]
		[string[]]$Args,
		[Parameter(Mandatory = $true)]
		[string]$FailureMessage
	)

	& $mysqlPath @Args
	if ($LASTEXITCODE -ne 0) {
		throw "$FailureMessage (exit code $LASTEXITCODE)"
	}
}

Write-Host "Stopping service $serviceName..."
Stop-Service -Name $serviceName -Force

Start-Sleep -Seconds 2

Write-Host 'Starting mysqld in safe mode...'
$mysqldArgs = @(
	"--defaults-file=$defaultsFile",
	"--skip-grant-tables",
	"--console",
	$serviceName
)
$mysqldProc = Start-Process -FilePath $mysqldPath -ArgumentList $mysqldArgs -PassThru -RedirectStandardOutput $startupLog -RedirectStandardError $startupErrLog

Write-Host 'Waiting for safe-mode MySQL to accept connections...'
$maxAttempts = 20
$connected = $false
$safeModeArgs = $null
for ($i = 1; $i -le $maxAttempts; $i++) {
	if ($mysqldProc.HasExited) {
		break
	}

	& $mysqlPath -h 127.0.0.1 -P 3306 -u root --protocol=TCP -e "SELECT 1;" | Out-Null
	if ($LASTEXITCODE -eq 0) {
		$connected = $true
		$safeModeArgs = @("-h", "127.0.0.1", "-P", "3306", "-u", "root", "--protocol=TCP")
		break
	}

	& $mysqlPath -u root -e "SELECT 1;" | Out-Null
	if ($LASTEXITCODE -eq 0) {
		$connected = $true
		$safeModeArgs = @("-u", "root")
		break
	}

	Start-Sleep -Seconds 1
}

if (-not $connected) {
	if ($mysqldProc.HasExited) {
		Write-Host 'mysqld exited during safe-mode startup.'
	}

	if (Test-Path $startupLog) {
		Write-Host 'Safe-mode startup log:'
		Get-Content $startupLog -Tail 100
	}

	if (Test-Path $startupErrLog) {
		Write-Host 'Safe-mode startup error log:'
		Get-Content $startupErrLog -Tail 100
	}

	throw 'Unable to start MySQL in safe mode.'
}

Write-Host 'Resetting root password...'
$sql = @"
FLUSH PRIVILEGES;
ALTER USER 'root'@'localhost' IDENTIFIED BY '$newRootPassword';
FLUSH PRIVILEGES;
"@

Invoke-MySql -Args ($safeModeArgs + @("-e", $sql)) -FailureMessage 'Failed to run root password reset SQL in safe mode'

Write-Host 'Stopping safe-mode mysqld...'
if (-not $mysqldProc.HasExited) {
	Stop-Process -Id $mysqldProc.Id -Force
}

Start-Sleep -Seconds 2

Write-Host "Starting service $serviceName normally..."
Start-Service -Name $serviceName

Start-Sleep -Seconds 2

Write-Host 'Verifying new root login...'
Invoke-MySql -Args @("-h", "localhost", "-P", "3306", "-u", "root", "-p$newRootPassword", "-e", "SELECT 1 AS ok;") -FailureMessage 'Root login verification failed after reset'

Write-Host 'MySQL root password reset completed.'
