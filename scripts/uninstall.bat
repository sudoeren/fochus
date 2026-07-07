@echo off
setlocal

set "SCRIPT_DIR=%~dp0"
set "SCRIPT_DIR=%SCRIPT_DIR:~0,-1%"

echo Removing Fochus data...
rmdir /s /q "%SCRIPT_DIR%\data" 2>nul

echo Removing Fochus...
cd /d "%SCRIPT_DIR%\.."
rmdir /s /q "%SCRIPT_DIR%"

echo Done.
pause
