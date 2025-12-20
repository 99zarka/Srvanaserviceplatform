@echo off
echo Building and deploying Srvana Service Platform frontend...
echo.

REM Change to the frontend directory
cd /d "%~dp0"

REM Check if node_modules exists
if not exist "node_modules" (
    echo Error: node_modules not found. Please run setup_frontend.bat first.
    pause
    exit /b 1
)

REM Check if package.json exists
if not exist "package.json" (
    echo Error: package.json not found.
    pause
    exit /b 1
)

echo Building project for production...
npm run deploy



echo.
pause
