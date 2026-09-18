@echo off
setlocal
cd /d "%~dp0"

if not exist "C:\comfyui-directml\main.py" (
  echo.
  echo ERROR: ComfyUI no encontrado en C:\comfyui-directml.
  echo Instala ComfyUI DirectML primero y luego vuelve a ejecutar este lanzador.
  echo.
  echo Descarga: https://github.com/comfyanonymous/ComfyUI
  echo O usa la rama DirectML/AMD con soporte para RX 580.
  echo.
  pause
  exit /b 1
)

cd /d "C:\comfyui-directml"
start "ComfyUI" cmd /k "python main.py"

start "SRTSync" "http://127.0.0.1:8188"

echo.
echo ComfyUI se ha lanzado.
echo Abre la app y usa la generacion local por bloques.
echo.
pause
