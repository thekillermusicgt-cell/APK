<!doctype html>
<html lang="es">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width,initial-scale=1.0" />
    <title>SRTSync — Generación local por bloques</title>
    <style>
      :root {
        --bg: #0b0d12;
        --panel: #111827;
        --panel-2: #151d2a;
        --border: #2b384d;
        --text: #eef3ff;
        --muted: #a3afc5;
        --accent: #9bea5d;
        --accent-2: #78d0ff;
        --danger: #ff7d7d;
      }
      * { box-sizing: border-box; }
      body {
        margin: 0;
        font-family: Inter, system-ui, sans-serif;
        background: var(--bg);
        color: var(--text);
      }
      main.app-shell {
        max-width: 1240px;
        margin: 0 auto;
        padding: 24px 18px 60px;
      }
      .topbar {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 16px;
        padding: 14px 18px;
        border: 1px solid var(--border);
        border-radius: 18px;
        background: rgba(17, 24, 39, 0.85);
        margin-bottom: 24px;
      }
      .brand { color: var(--text); text-decoration: none; font-size: 1.8rem; font-weight: 700; }
      .brand span.accent { color: var(--accent); }
      .status-dot {
        display: inline-flex;
        align-items: center;
        gap: 8px;
        color: var(--muted);
        font-size: 0.9rem;
      }
      .status-dot::before {
        content: ""; width: 10px; height: 10px; border-radius: 50%; background: var(--accent); box-shadow: 0 0 12px rgba(155, 234, 93, 0.9);
      }
      .hero {
        margin: 28px 0 20px;
        padding: 18px 4px;
      }
      .eyebrow {
        color: var(--muted);
        text-transform: uppercase;
        letter-spacing: 0.12em;
        font-size: 0.72rem;
        margin: 0 0 12px;
      }
      h1 {
        margin: 0;
        font-size: clamp(2.3rem, 6vw, 5rem);
        line-height: 0.94;
      }
      .hero .accent { color: var(--accent); }
      .hero .intro {
        margin-top: 18px;
        color: var(--muted);
        font-size: 1.06rem;
      }
      .grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 20px;
      }
      .panel {
        background: rgba(21, 29, 42, 0.92);
        border: 1px solid var(--border);
        border-radius: 18px;
        padding: 18px 18px 20px;
      }
      .panel h2 {
        margin: 0 0 16px;
        font-size: 1.2rem;
      }
      .panel p { margin-top: 0; color: var(--muted); }
      .stack { display: grid; gap: 12px; }
      label {
        display: block;
        color: var(--muted);
        font-size: 0.86rem;
        margin-bottom: 6px;
      }
      textarea, input, select, button {
        width: 100%;
        font: inherit;
        border-radius: 10px;
        border: 1px solid var(--border);
        background: rgba(9, 12, 18, 0.8);
        color: var(--text);
        padding: 10px 12px;
      }
      textarea {
        min-height: 160px;
        resize: vertical;
      }
      .inline-grid {
        display: grid;
        grid-template-columns: repeat(3, minmax(120px, 1fr));
        gap: 12px;
        margin-top: 8px;
      }
      button {
        cursor: pointer;
        width: auto;
        font-weight: 700;
        transition: transform 0.12s ease, opacity 0.12s ease;
      }
      button:hover { transform: translateY(-1px); }
      button.primary {
        background: var(--accent);
        color: #0b0d12;
        border-color: transparent;
      }
      button.secondary {
        background: transparent;
        color: var(--text);
      }
      .row-actions {
        display: flex;
        flex-wrap: wrap;
        gap: 10px;
        margin-top: 14px;
      }
      .status {
        margin-top: 12px;
        min-height: 24px;
        color: #d6edb8;
        white-space: pre-wrap;
      }
      .gallery {
        margin-top: 18px;
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(190px, 1fr));
        gap: 12px;
      }
      .thumb {
        border: 1px solid var(--border);
        border-radius: 12px;
        overflow: hidden;
        background: rgba(9, 12, 18, 0.8);
      }
      .thumb img {
        width: 100%;
        display: block;
        aspect-ratio: 4 / 3;
        object-fit: cover;
      }
      .thumb .cap {
        padding: 8px 10px;
        color: var(--muted);
        font-size: 0.75rem;
      }
      .muted { color: var(--muted); }
      .warning { color: #ffd585; }
      @media (max-width: 820px) {
        .grid { grid-template-columns: 1fr; }
        .inline-grid { grid-template-columns: repeat(2, minmax(120px, 1fr)); }
      }
    </style>
  </head>
  <body>
    <main class="app-shell">
      <header class="topbar">
        <div class="brand">SRT<span class="accent">Sync</span></div>
        <div class="status-dot">Procesamiento local</div>
      </header>

      <section class="hero">
        <p class="eyebrow">Subtitle workspace</p>
        <h1>Audio dentro.<br /><span class="accent">Subtítulos listos.</span></h1>
        <p class="intro">Genera escenas y frames por bloques desde prompts locales sin saturar tu GPU.</p>
      </section>

      <section class="panel">
        <h2>Quitar silencios</h2>
        <p>Primero prepara el audio limpio. Luego usa el archivo resultante para las siguientes tareas.</p>
        <div class="stack">
          <div>
            <label for="silence-audio-input">Audio</label>
            <input id="silence-audio-input" type="file" accept="audio/*" />
          </div>
          <div class="inline-grid">
            <div>
              <label for="silence-min">Silencio mínimo</label>
              <input id="silence-min" type="number" min="0.05" step="0.05" value="0.45" />
            </div>
            <div>
              <label for="silence-threshold">Umbral (dB)</label>
              <input id="silence-threshold" type="number" min="-80" max="0" step="1" value="-42" />
            </div>
            <div>
              <label>Archivo</label>
              <button id="process-silence-btn" class="secondary" type="button">Procesar</button>
            </div>
          </div>
          <div id="silence-status" class="status"></div>
          <div class="row-actions">
            <button id="download-silence-btn" class="primary" type="button" disabled>Descargar audio sin silencios</button>
          </div>
        </div>
      </section>

      <div class="grid">
        <section class="panel">
          <h2>Tu guion</h2>
          <textarea id="script-input" placeholder="Pega aquí el texto de tu guion, una frase por línea..."></textarea>
          <div id="script-count" class="muted">0 líneas</div>
        </section>

        <section class="panel">
          <h2>Generación local por bloques</h2>
          <div class="stack">
            <div>
              <label for="local-prompts">Prompts</label>
              <textarea id="local-prompts" placeholder="Pega aquí tus prompts, uno por línea o por IMAGEN 1, IMAGEN 2..."></textarea>
            </div>
            <div class="inline-grid">
              <div>
                <label for="local-block-size">Bloque</label>
                <input id="local-block-size" type="number" min="1" value="4" />
              </div>
              <div>
                <label for="local-width">Ancho</label>
                <input id="local-width" type="number" min="256" step="64" value="768" />
              </div>
              <div>
                <label for="local-height">Alto</label>
                <input id="local-height" type="number" min="256" step="64" value="432" />
              </div>
              <div>
                <label for="local-steps">Steps</label>
                <input id="local-steps" type="number" min="1" max="80" value="25" />
              </div>
              <div>
                <label for="local-cfg">CFG</label>
                <input id="local-cfg" type="number" min="1" max="20" step="0.5" value="7" />
              </div>
              <div>
                <label for="local-pause">Pausa (s)</label>
                <input id="local-pause" type="number" min="0" max="30" value="3" />
              </div>
            </div>
            <div>
              <label for="comfy-model">Nombre del modelo</label>
              <input id="comfy-model" type="text" value="model.safetensors" placeholder="model.safetensors" />
            </div>
            <div class="row-actions">
              <button id="generate-local-btn" class="primary" type="button">Generar por bloques</button>
              <button id="stop-local-btn" class="secondary" type="button">Detener</button>
            </div>
            <div id="local-status" class="status"></div>
          </div>
        </section>
      </div>

      <section class="panel">
        <h2>Imágenes generadas</h2>
        <div id="local-gallery" class="gallery"></div>
      </section>
    </main>

    <script src="app.js"></script>
  </body>
</html>
