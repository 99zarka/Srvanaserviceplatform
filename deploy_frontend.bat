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
npm run build

if %errorlevel% neq 0 (
    echo Error: npm run build failed
    pause
    exit /b 1
)

echo.
echo Build completed successfully!
echo.

REM Check if deploy script exists in package.json
findstr /c:"\"deploy\":" package.json >nul
if %errorlevel% equ 0 (
    echo Deploying to GitHub Pages...
    npm run deploy
    
    if %errorlevel% neq 0 (
        echo Error: npm run deploy failed
        pause
        exit /b 1
    )
    
    echo.
    echo Frontend deployed successfully to GitHub Pages!
    echo Your site is available at: https://99zarka.github.io/Srvanaserviceplatform
) else (
    echo Deploy script not found in package.json.
    echo Build output is available in the 'dist' folder.
    echo You can manually deploy the 'dist' folder contents to your web server.
    echo To add GitHub Pages deployment, add this to your package.json scripts:
    echo   "predeploy": "npm run build",
    echo   "deploy": "gh-pages -d dist"
)

echo.
pause
