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

:: Sync database schema (use local Prisma)
call .\node_modules\.bin\prisma db push --skip-generate 2>nul
if %ERRORLEVEL% NEQ 0 call .\node_modules\.bin\prisma db push

:: Start server in background
set PORT=5800
start /B "" node dist/index.js > "%SCRIPT_DIR%\fochus.log" 2>&1

echo.
echo   Fochus is running at http://localhost:5800
echo.
echo   To stop: delete the fochus folder or close the terminal.
echo.
