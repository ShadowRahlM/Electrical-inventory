<#
.SYNOPSIS
  ESMS - Electrical Shop Management System - Windows Setup Script
.DESCRIPTION
  Installs prerequisites (WSL2, Docker Desktop) and starts the full stack.
  Run this script in PowerShell as Administrator.
#>

$ErrorActionPreference = "Stop"
$PROJECT_DIR = Split-Path -Parent (Split-Path -Parent $PSCommandPath)

function Write-Step($msg) {
  Write-Host "`n=== $msg ===" -ForegroundColor Cyan
}

function Write-Info($msg) {
  Write-Host "  $msg" -ForegroundColor Yellow
}

function Write-OK($msg) {
  Write-Host "  [OK] $msg" -ForegroundColor Green
}

function Write-Fail($msg) {
  Write-Host "  [FAIL] $msg" -ForegroundColor Red
}

# ─── 1. Check if running as Administrator ───
Write-Step "Checking Administrator privileges"
$isAdmin = ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
if (-not $isAdmin) {
  Write-Fail "This script must be run as Administrator. Right-click PowerShell and select 'Run as Administrator'."
  exit 1
}
Write-OK "Running as Administrator"

# ─── 2. Check & install WSL2 if needed ───
Write-Step "Checking WSL2"
$wsl = Get-Command "wsl.exe" -ErrorAction SilentlyContinue
if (-not $wsl) {
  Write-Info "WSL not found. Installing WSL2..."
  wsl --install -d Ubuntu
  Write-Info "WSL installed. You may need to reboot after this script completes."
} else {
  $wslVer = wsl --status 2>$null | Select-String "Default Version"
  if ($wslVer) {
    Write-OK "WSL2 is available"
  } else {
    Write-Info "Setting WSL2 as default..."
    wsl --set-default-version 2
  }
}

# ─── 3. Check & install Docker Desktop if needed ───
Write-Step "Checking Docker Desktop"
$docker = Get-Command "docker.exe" -ErrorAction SilentlyContinue
if (-not $docker) {
  Write-Fail "Docker Desktop not found. Please install it from:"
  Write-Fail "  https://www.docker.com/products/docker-desktop/"
  Write-Fail "  Make sure to enable WSL2 integration during installation."
  Write-Fail "  Then restart this script."
  exit 1
}
Write-OK "Docker Desktop found"

Write-Info "Checking Docker engine status..."
$dockerOk = $false
for ($i = 0; $i -lt 10; $i++) {
  $out = docker info 2>&1
  if ($LASTEXITCODE -eq 0) {
    $dockerOk = $true
    break
  }
  Write-Info "Waiting for Docker engine to start (attempt $($i+1)/10)..."
  Start-Sleep -Seconds 3
}
if (-not $dockerOk) {
  Write-Info "Starting Docker Desktop..."
  Start-Process "$env:ProgramFiles\Docker\Docker\Docker Desktop.exe"
  Start-Sleep -Seconds 15
  for ($i = 0; $i -lt 10; $i++) {
    $out = docker info 2>&1
    if ($LASTEXITCODE -eq 0) {
      $dockerOk = $true
      break
    }
    Write-Info "Waiting for Docker engine (attempt $($i+1)/10)..."
    Start-Sleep -Seconds 5
  }
}
if (-not $dockerOk) {
  Write-Fail "Docker engine failed to start. Check Docker Desktop manually."
  exit 1
}
Write-OK "Docker engine is running"

# ─── 4. Setup .env file ───
Write-Step "Configuring environment"
$envFile = Join-Path $PROJECT_DIR ".env"
$envExample = Join-Path $PROJECT_DIR ".env.example"

if (-not (Test-Path $envFile)) {
  if (Test-Path $envExample) {
    Copy-Item $envExample $envFile
    Write-OK "Created .env from .env.example"
  } else {
    Write-Fail ".env.example not found at $envExample"
    exit 1
  }
} else {
  Write-OK ".env already exists"
}

# Generate a random Django secret key
Write-Info "Generating DJANGO_SECRET_KEY..."
try {
  $rng = [System.Security.Cryptography.RandomNumberGenerator]::Create()
  $bytes = New-Object byte[] 50
  $rng.GetBytes($bytes)
  $secret = -join ($bytes | ForEach-Object { "{0:x2}" -f $_ })
  $content = Get-Content $envFile -Raw
  $content = $content -replace "DJANGO_SECRET_KEY=.*", "DJANGO_SECRET_KEY=$secret"
  Set-Content $envFile $content
  Write-OK "DJANGO_SECRET_KEY generated"
} catch {
  Write-Info "Could not auto-generate secret key. Update DJANGO_SECRET_KEY manually in .env"
}

# Set safe defaults for local Windows development
$content = Get-Content $envFile -Raw
$content = $content -replace "DJANGO_DEBUG=False", "DJANGO_DEBUG=True"
$content = $content -replace "DJANGO_ALLOWED_HOSTS=.*", "DJANGO_ALLOWED_HOSTS=localhost"
$content = $content -replace "CORS_ALLOWED_ORIGINS=.*", "CORS_ALLOWED_ORIGINS=http://localhost"
Set-Content $envFile $content
Write-OK "Dev-safe defaults written to .env"

# ─── 5. Build & start the stack ───
Write-Step "Building Docker images"
Set-Location $PROJECT_DIR
docker compose -f docker-compose.prod.yml build
Write-OK "Build complete"

Write-Step "Starting services"
docker compose -f docker-compose.prod.yml up -d
Write-OK "Stack started"

Write-Step "Running database migrations"
docker compose -f docker-compose.prod.yml exec -T backend python manage.py migrate --noinput
Write-OK "Migrations complete"

Write-Step "Collecting static files"
docker compose -f docker-compose.prod.yml exec -T backend python manage.py collectstatic --noinput 2>$null
Write-OK "Static files collected"

Write-Step "Creating admin user (if not exists)"
docker compose -f docker-compose.prod.yml exec -T backend python manage.py shell -c "
from django.contrib.auth import get_user_model;
User = get_user_model();
if not User.objects.filter(is_superuser=True).exists():
    User.objects.create_superuser('admin', 'admin@example.com', 'admin123');
    print('Admin user created: admin / admin123');
else:
    print('Admin user already exists');
"
Write-OK "Admin user ready"

# ─── 6. Verify health ───
Start-Sleep -Seconds 5
Write-Step "Verifying service health"
docker compose -f docker-compose.prod.yml ps

Write-Step "Setup complete!"
Write-Host "  Access the application at:" -ForegroundColor Green
Write-Host "    http://localhost" -ForegroundColor Cyan
Write-Host "  Login credentials:" -ForegroundColor Green
Write-Host "    Username: admin" -ForegroundColor Cyan
Write-Host "    Password: admin123" -ForegroundColor Cyan
Write-Host ""
Write-Host "  Useful commands:" -ForegroundColor Green
Write-Host "    View logs:       docker compose -f docker-compose.prod.yml logs -f" -ForegroundColor Gray
Write-Host "    Stop stack:      docker compose -f docker-compose.prod.yml down" -ForegroundColor Gray
Write-Host "    Rebuild:         docker compose -f docker-compose.prod.yml build" -ForegroundColor Gray

Set-Location $PROJECT_DIR
