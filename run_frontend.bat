@echo off
echo Starting Srvana Service Platform frontend development server...
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

echo Launching development server...
echo.
echo The frontend will be available at http://localhost:3000
echo Press Ctrl+C to stop the server.
echo.

REM Start the development server
npm run dev

if %errorlevel% neq 0 (
    echo Error: npm run dev failed
    pause
    exit /b 1
)

echo.
echo Development server stopped.
pause
