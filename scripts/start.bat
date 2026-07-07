@echo off
setlocal

set "SCRIPT_DIR=%~dp0"
set "SCRIPT_DIR=%SCRIPT_DIR:~0,-1%"

:: Prefer bundled Node.js if available
if exist "%SCRIPT_DIR%\node\node.exe" (
  set "PATH=%SCRIPT_DIR%\node;%PATH%"
)

:: Create .env with defaults if missing
if not exist "%SCRIPT_DIR%\backend\.env" (
  if not exist "%SCRIPT_DIR%\data" mkdir "%SCRIPT_DIR%\data"
  for /f "tokens=*" %%a in ('node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"') do set "JWT=%%a"
  (
    echo DATABASE_URL="file:%SCRIPT_DIR%\data\fochus.db"
    echo JWT_SECRET=%JWT%
    echo NODE_ENV=production
  ) > "%SCRIPT_DIR%\backend\.env"
)

cd /d "%SCRIPT_DIR%\backend"

:: Sync database schema
call npx prisma db push --skip-generate 2>nul
if %ERRORLEVEL% NEQ 0 call npx prisma db push

echo.
echo   Fochus is starting at http://localhost:5800
echo Press Ctrl+C to stop.
echo.

node dist/index.js
pause
