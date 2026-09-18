@echo off
cd /d "%~dp0"
title SRTSync Flow Automator
echo.
echo ==============================================
echo   SRTSync Flow Automator
echo ==============================================
echo.
echo Iniciando el automatizador local...
echo No cierres esta ventana mientras uses SRTSync.
echo.
npm start
if errorlevel 1 (
  echo.
  echo El automatizador no pudo iniciarse.
  echo Ejecuta instalar-automatizador.bat y vuelve a intentarlo.
)
pause
