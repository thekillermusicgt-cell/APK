@echo off
setlocal
cd /d "%~dp0"
title Instalar SRTSync Flow Automator

echo.
echo ==============================================
echo   Instalador SRTSync Flow Automator
echo ==============================================
echo.

where node >nul 2>nul
if errorlevel 1 (
  echo Node.js no esta instalado. Intentando instalar Node.js LTS con winget...
  winget install --id OpenJS.NodeJS.LTS -e
  if errorlevel 1 (
    echo.
    echo No se pudo instalar Node.js automaticamente.
    echo Descargalo desde https://nodejs.org/en/download
    pause
    exit /b 1
  )
  echo.
  echo Node.js fue instalado. Cierra esta ventana y abre otra para continuar.
  pause
  exit /b 0
)

echo Node.js detectado:
node --version
npm --version

echo.
echo Instalando dependencias del automatizador...
npm install
if errorlevel 1 (
  echo.
  echo ERROR: npm install no pudo completarse.
  pause
  exit /b 1
)

echo.
echo Instalando el navegador necesario para Playwright...
npm run install-browser
if errorlevel 1 (
  echo.
  echo ERROR: no se pudo instalar el navegador.
  pause
  exit /b 1
)

echo.
echo Instalacion completada correctamente.
echo Ahora puedes ejecutar iniciar-automatizador.bat
pause
