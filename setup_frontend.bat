@echo off
echo Setting up Srvana Service Platform frontend...
echo.

REM Change to the frontend directory
cd /d "%~dp0"

REM Check if node_modules exists
if exist "node_modules" (
    echo node_modules directory already exists.
    echo Running npm install to update dependencies...
) else (
    echo Installing dependencies...
)

REM Install dependencies
npm install

if %errorlevel% neq 0 (
    echo Error: npm install failed
    pause
    exit /b 1
)

echo.
echo Frontend setup completed successfully!
echo.
echo You can now run the development server with: run_frontend.bat
echo Or build the project with: deploy_frontend.bat
echo.
pause
