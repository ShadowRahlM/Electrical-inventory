@echo off
REM Electrical Shop Management System - Windows Setup
REM Double-click this file to run (no PowerShell restrictions)

echo === ESMS Windows Setup ===
echo.

REM Check if running as Administrator
net session >nul 2>&1
if %errorLevel% neq 0 (
    echo Requesting Administrator privileges...
    powershell -Command "Start-Process '%~f0' -Verb RunAs"
    exit /b
)

cd /d "%~dp0.."

echo Starting setup script...
powershell -NoProfile -ExecutionPolicy Bypass -File "scripts\setup.ps1"

pause
