@echo off
setlocal
set "CHROME=%ProgramFiles%\Google\Chrome\Application\chrome.exe"
if not exist "%CHROME%" set "CHROME=%ProgramFiles(x86)%\Google\Chrome\Application\chrome.exe"
if not exist "%CHROME%" set "CHROME=%LocalAppData%\Google\Chrome\Application\chrome.exe"
if not exist "%CHROME%" (
  echo No se encontro Google Chrome.
  pause
  exit /b 1
)
echo Abriendo Chrome con tu perfil predeterminado...
start "SRTSync Chrome" "%CHROME%" --remote-debugging-port=9222 --user-data-dir="%LocalAppData%\Google\Chrome\User Data" --profile-directory="Default" "https://flow.google.com/"
echo Chrome se abrio con tu perfil. Inicia sesion si hace falta.
pause
