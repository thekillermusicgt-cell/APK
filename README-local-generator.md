# SRTSync local generation launcher

Esta carpeta incluye dos lanzadores para Windows:

- `start-comfyui.bat`: abre ComfyUI local en `http://127.0.0.1:8188`
- `start-app.bat`: abre la app `index.html`

## Requisitos

- ComfyUI debe estar instalado en `C:\comfyui-directml`
- Debe tener Python 3.10 y un modelo SD 1.5 en `models/checkpoints`
- La app usa la URL `http://127.0.0.1:8188`

## Importante

El navegador no puede iniciar directamente procesos del sistema operativo ni controlar la GPU. Por eso la solución correcta es:

1. lanzar ComfyUI local;
2. abrir la app desde `start-app.bat`;
3. generar prompts por bloques;
4. mantener la resolución inicial baja (768x432) y ampliar despues a 1080p si quieres calidad para YouTube.

## Configuracion recomendada para RX 580

- Modelo: SD 1.5
- Resolucion: 768x432
- Bloque: 4 prompts
- Steps: 25
- CFG: 7
- Pausa entre imagenes: 3s
- Pausa entre bloques: 15s

La app no puede generar sin ComfyUI activo.
