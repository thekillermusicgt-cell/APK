# SRTSync Flow Automator

Programa independiente opcional que conecta la página SRTSync con Google Flow mediante un servidor local y Playwright.

## Requisitos

- Node.js 18 o superior.
- Google Chrome/Chromium.
- Una cuenta con acceso a Google Flow.

## Instalación

Desde esta carpeta ejecuta:

```bash
npm install
npm run install-browser
npm start
```

Luego abre SRTSync, entra en **Prompts para Flow**, prepara los lotes y pulsa **Enviar al automatizador**.

La primera vez se abrirá una ventana de Chromium. Inicia sesión manualmente en Google Flow. El perfil queda guardado en `flow-automator/.flow-profile`; SRTSync nunca recibe ni almacena tu contraseña.

## Funcionamiento

- Escucha únicamente en `127.0.0.1:8787`.
- Recibe lotes mediante `POST /enqueue`.
- Abre Flow, pega el lote, intenta pulsar un botón cuyo texto sea `Generate`, `Create`, `Generar` o `Crear`, espera y continúa.
- Consulta el estado en `GET /status`.
- Detiene la cola con `POST /stop`.

La interfaz de Google Flow puede cambiar. Si no encuentra el cuadro de prompt o el botón de generación, el programa se detiene en estado `needs_action` y puedes completar ese lote manualmente. No es una API oficial de Google Flow y debes respetar sus límites, términos y políticas.
