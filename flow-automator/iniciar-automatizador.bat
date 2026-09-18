@echo off
setlocal
cd /d "%~dp0"
set "NODE_PATH=C:\Program Files\nodejs"
if exist "%NODE_PATH%\node.exe" set "PATH=%NODE_PATH%;%PATH%"
if exist "%ProgramFiles(x86)%\nodejs\node.exe" set "PATH=%ProgramFiles(x86)%\nodejs;%PATH%"
echo Iniciando SRTSync Flow Automator conectado a tu Chrome...
call npm start
pause
