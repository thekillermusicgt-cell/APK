<!doctype html>
<html lang="es">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width,initial-scale=1.0" />
    <title>SRTSync — Generación por bloques y quitar silencios</title>
    <style>
      :root {
        --bg: #0b0d12;
        --panel: #121925;
        --panel-2: #171f2e;
        --border: #2b3a50;
        --text: #edf4ff;
        --muted: #a8b5c9;
        --success: #9bea5d;
        --warning: #ffd77b;
        --info: #90caff;
      }
      * { box-sizing: border-box; }
      html, body {
        margin: 0;
        background: var(--bg);
        color: var(--text);
        font-family: Inter, system-ui, -apple-system, Segoe UI, sans-serif;
      }
      body {
        padding: 24px;
      }
      main {
        max-width: 1280px;
        margin: 0 auto;
      }
      .topbar {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 16px;
        background: rgba(18,25,37,0.9);
        border: 1px solid var(--border);
        border-radius: 16px;
        padding: 14px 18px;
      }
      .brand {
        font-weight: 800;
        font-size: clamp(1.4rem, 1.4vw + 1rem, 2rem);
      }
      .brand .accent { color: var(--success); }
      .status-pill {
        color: var(--muted);
        display: inline-flex;
        align-items: center;
        gap: 8px;
      }
      .status-pill::before {
        content: "";
        width: 10px;
        height: 10px;
        border-radius: 50%;
        background: var(--success);
        box-shadow: 0 0 10px rgba(155,234,93,.9);
      }
      .hero {
        margin: 22px 0 24px;
      }
      .eyebrow {
        text-transform: uppercase;
        letter-spacing: 0.12em;
        color: var(--muted);
        font-size: 0.72rem;
        margin: 0 0 12px;
      }
      h1 {
        margin: 0;
        font-size: clamp(2.3rem, 5vw, 5rem);
        line-height: 0.92;
      }
      h1 .accent { color: var(--success); }
      .intro {
        color: var(--muted);
        margin-top: 18px;
        font-size: 1.05rem;
      }
      .layout {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 18px;
      }
      .panel {
        background: rgba(18,25,37,0.9);
        border: 1px solid var(--border);
        border-radius: 18px;
        padding: 18px 18px 20px;
      }
      h2 {
        margin: 0 0 12px;
        font-size: 1.2rem;
      }
      .stack {
        display: grid;
        gap: 14px;
      }
      label {
        display: block;
        color: var(--muted);
        font-size: 0.86rem;
        margin-bottom: 6px;
      }
      input, textarea, select, button {
        width: 100%;
        border-radius: 10px;
        border: 1px solid var(--border);
        background: rgba(8, 12, 19, 0.8);
        color: var(--text);
        padding: 11px 12px;
        font: inherit;
      }
      textarea {
        min-height: 160px;
        resize: vertical;
      }
      button {
        cursor: pointer;
        width: auto;
        font-weight: 700;
      }
      .primary {
        background: var(--success);
        color: #0d1220;
        border-color: transparent;
      }
      .secondary {
        background: transparent;
        color: var(--text);
      }
      .inline-grid {
        display: grid;
        grid-template-columns: repeat(3, minmax(110px, 1fr));
        gap: 12px;
      }
      .row-actions {
        display: flex;
        flex-wrap: wrap;
        gap: 10px;
      }
      .status {
        min-height: 24px;
        color: #d5ebba;
        white-space: pre-wrap;
      }
      .muted {
        color: var(--muted);
      }
      .gallery {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
        gap: 12px;
        margin-top: 16px;
      }
      .thumb {
        border: 1px solid var(--border);
        border-radius: 12px;
        overflow: hidden;
        background: rgba(9,12,19,0.8);
      }
      .thumb img {
        display: block;
        width: 100%;
        aspect-ratio: 4/3;
        object-fit: cover;
      }
      .thumb .cap {
        padding: 8px 10px;
        color: var(--muted);
        font-size: 0.75rem;
      }
      @media (max-width: 900px) {
        .layout {
          grid-template-columns: 1fr;
        }
        .inline-grid {
          grid-template-columns: repeat(2, minmax(110px, 1fr));
        }
      }
    </style>
  </head>
  <body>
    <main>
      <header class="topbar">
        <div class="brand">SRT<span class="accent">Sync</span></div>
        <div class="status-pill">Procesamiento local</div>
      </header>

      <section class="hero">
        <p class="eyebrow">Subtitle workspace</p>
        <h1>Audio dentro.<br><span class="accent">Subtítulos listos.</span></h1>
        <p class="intro">Antes elimina silencios, luego sincroniza el audio limpio y genera imágenes en bloques localmente para no saturar tu GPU.</p>
      </section>

      <section class="panel" style="margin-bottom:18px;">
        <h2>01 · Quitar silencios</h2>
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

      <div class="layout">
        <section class="panel">
          <h2>02 · Tu guion</h2>
          <textarea id="script-input" placeholder="Pega aquí tu guion, una frase por línea..."></textarea>
          <div id="script-count" class="muted">0 líneas</div>
        </section>

        <section class="panel">
          <h2>03 · Generación local por bloques</h2>
          <div class="stack">
            <div>
              <label for="local-prompts">Prompts</label>
              <textarea id="local-prompts" placeholder="Pega tus prompts, uno por línea o en formato IMAGEN 1, IMAGEN 2..."></textarea>
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
              <label for="comfy-model">Modelo ComfyUI</label>
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

      <section class="panel" style="margin-top:18px;">
        <h2>04 · Imágenes generadas</h2>
        <div id="local-gallery" class="gallery"></div>
      </section>
    </main>

    <script>
      const $ = (selector) => document.querySelector(selector);
      const audioInput = $('#silence-audio-input');
      const scriptInput = $('#script-input');
      const scriptCount = $('#script-count');
      const silenceStatus = $('#silence-status');
      const localStatus = $('#local-status');
      const localGallery = $('#local-gallery');
      let processedAudioBlob = null;
      let localBusy = false;

      function linesFromText(text) {
        return (text || '')
          .replace(/\r/g, '')
          .split(/\n+/)
          .map((line) => line.trim())
          .filter(Boolean);
      }

      scriptInput.addEventListener('input', () => {
        scriptCount.textContent = `${linesFromText(scriptInput.value).length} líneas`;
      });

      function wavFromChannels(channels, sampleRate) {
        const length = channels[0].length;
        const bytes = 44 + length * channels.length * 2;
        const buffer = new ArrayBuffer(bytes);
        const view = new DataView(buffer);
        let ptr = 0;

        const writeAscii = (str) => {
          for (let i = 0; i < str.length; i++) view.setUint8(ptr++, str.charCodeAt(i));
        };
        const writeU32 = (value) => { view.setUint32(ptr, value, true); ptr += 4; };
        const writeU16 = (value) => { view.setUint16(ptr, value, true); ptr += 2; };

        writeAscii('RIFF');
        writeU32(bytes - 8);
        writeAscii('WAVE');
        writeAscii('fmt ');
        writeU32(16);
        writeU16(1);
        writeU16(channels.length);
        writeU32(sampleRate);
        writeU32(sampleRate * channels.length * 2);
        writeU16(channels.length * 2);
        writeU16(16);
        writeAscii('data');
        writeU32(length * channels.length * 2);

        for (let i = 0; i < length; i++) {
          for (const channel of channels) {
            const sample = Math.max(-1, Math.min(1, channel[i]));
            const intSample = sample < 0 ? sample * 0x8000 : sample * 0x7fff;
            view.setInt16(ptr, intSample, true);
            ptr += 2;
          }
        }

        return new Blob([buffer], { type: 'audio/wav' });
      }

      $('#process-silence-btn').addEventListener('click', async () => {
        const file = audioInput.files && audioInput.files[0];
        if (!file) {
          silenceStatus.textContent = 'Selecciona un audio primero.';
          return;
        }

        silenceStatus.textContent = 'Analizando silencios...';
        try {
          const audioCtx = new AudioContext();
          const arrayBuffer = await file.arrayBuffer();
          const decoded = await audioCtx.decodeAudioData(arrayBuffer);
          const sampleRate = decoded.sampleRate;
          const channelData = Array.from({ length: decoded.numberOfChannels }, (_, i) => decoded.getChannelData(i));
          const frameSize = Math.max(1, Math.floor(sampleRate * 0.01));
          const minFrames = Math.floor(sampleRate * Number($('#silence-min').value || 0.45));
          const threshold = Math.pow(10, Number($('#silence-threshold').value || -42) / 20);
          const ranges = [];

          for (let i = 0; i < decoded.length; i += frameSize) {
            const end = Math.min(decoded.length, i + frameSize);
            let sum = 0;
            for (let j = i; j < end; j++) {
              let avg = 0;
              for (const channel of channelData) avg += Math.abs(channel[j]);
              sum += avg / channelData.length;
            }
            const rms = sum / (end - i);
            if (rms >= threshold) ranges.push([Math.max(0, i - minFrames / 4), Math.min(decoded.length, end + minFrames / 4)]);
          }

          if (!ranges.length) throw new Error('No se encontró audio por encima del umbral. Prueba un valor más bajo.');

          const merged = [];
          for (const range of ranges) {
            if (merged.length && range[0] <= merged[merged.length - 1][1] + minFrames) {
              merged[merged.length - 1][1] = range[1];
            } else {
              merged.push(range);
            }
          }

          const totalSamples = merged.reduce((total, [start, end]) => total + (end - start), 0);
          const outputChannels = channelData.map(() => new Float32Array(totalSamples));
          let cursor = 0;
          for (const [start, end] of merged) {
            for (let ch = 0; ch < channelData.length; ch++) {
              outputChannels[ch].set(channelData[ch].subarray(start, end), cursor);
            }
            cursor += end - start;
          }

          processedAudioBlob = wavFromChannels(outputChannels, sampleRate);
          $('#download-silence-btn').disabled = false;
          silenceStatus.textContent = `Listo. Se eliminaron ${(decoded.duration - totalSamples / sampleRate).toFixed(2)} segundos de silencio.`;
          await audioCtx.close();
        } catch (error) {
          silenceStatus.textContent = `Error: ${error.message}`;
        }
      });

      $('#download-silence-btn').addEventListener('click', () => {
        if (!processedAudioBlob) return;
        const link = document.createElement('a');
        link.href = URL.createObjectURL(processedAudioBlob);
        link.download = 'audio-sin-silencios.wav';
        link.click();
        setTimeout(() => URL.revokeObjectURL(link.href), 1500);
      });

      function parsePromptList(text) {
        const raw = (text || '').replace(/\r/g, '');
        if (!raw.trim()) return [];
        const items = raw.split(/\n+/).map((line) => line.trim()).filter(Boolean);
        const out = [];
        for (const item of items) {
          const match = item.match(/^IMAGEN\s*\d+\s*[:.-]?\s*(.*)$/i);
          out.push(match ? match[1].trim() : item);
        }
        return out.filter(Boolean);
      }

      function renderGallery(items) {
        localGallery.innerHTML = '';
        for (const item of items) {
          const card = document.createElement('div');
          card.className = 'thumb';
          const img = document.createElement('img');
          img.src = item.url;
          img.loading = 'lazy';
          const cap = document.createElement('div');
          cap.className = 'cap';
          cap.textContent = item.label;
          card.appendChild(img);
          card.appendChild(cap);
          localGallery.appendChild(card);
        }
      }

      async function buildComfyWorkflow(prompt, width, height, steps, cfg, modelName) {
        const selectedModel = (modelName || '').trim() || 'model.safetensors';
        return {
          '3': {
            inputs: {
              seed: Math.floor(Math.random() * 100000000),
              steps,
              cfg,
              sampler_name: 'dpmpp_2m',
              scheduler: 'karras',
              denoise: 1,
              model: ['4', 0],
              positive: ['6', 0],
              negative: ['7', 0],
              latent_image: ['5', 0]
            },
            class_type: 'KSampler'
          },
          '4': {
            inputs: { ckpt_name: selectedModel },
            class_type: 'CheckpointLoaderSimple'
          },
          '5': {
            inputs: { width, height, batch_size: 1 },
            class_type: 'EmptyLatentImage'
          },
          '6': {
            inputs: { text: prompt, clip: ['4', 1] },
            class_type: 'CLIPTextEncode'
          },
          '7': {
            inputs: { text: 'blurry, low quality, watermark, text, distorted face, bad anatomy, extra fingers, noisy background', clip: ['4', 1] },
            class_type: 'CLIPTextEncode'
          },
          '8': {
            inputs: { samples: ['3', 0], vae: ['4', 2] },
            class_type: 'VAEDecode'
          },
          '9': {
            inputs: { pixels: ['8', 0], filename_prefix: 'SRTSync' },
            class_type: 'SaveImage'
          }
        };
      }

      async function waitForComfyHistory(promptId) {
        const url = `http://127.0.0.1:8188/history/${promptId}`;
        for (let i = 0; i < 120; i++) {
          const res = await fetch(url);
          if (!res.ok) throw new Error('ComfyUI no respondió correctamente.');
          const history = await res.json();
          const entry = history && history[promptId];
          if (entry && entry.status && entry.status.status === 'completed') return entry;
          await new Promise((resolve) => setTimeout(resolve, 1000));
        }
        throw new Error('ComfyUI tardó demasiado en responder.');
      }

      async function generateLocalPrompt(prompt, settings) {
        const workflow = await buildComfyWorkflow(prompt, settings.width, settings.height, settings.steps, settings.cfg, settings.modelName);
        const response = await fetch('http://127.0.0.1:8188/prompt', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ prompt: workflow })
        });

        if (!response.ok) {
          const text = await response.text();
          throw new Error(text || 'No se pudo enviar el prompt a ComfyUI.');
        }

        const data = await response.json();
        const entry = await waitForComfyHistory(data.prompt_id);
        const saveKey = Object.keys(entry.outputs || {}).find((key) => entry.outputs[key]?.images);
        const image = entry.outputs[saveKey]?.images?.[0];
        if (!image) throw new Error('ComfyUI no devolvió ninguna imagen.');

        const imageUrl = `http://127.0.0.1:8188/view?filename=${encodeURIComponent(image.filename)}&subfolder=${encodeURIComponent(image.subfolder || '')}&type=${encodeURIComponent(image.type || 'output')}`;
        return { url: imageUrl, label: prompt.slice(0, 40) };
      }

      async function runBlocks() {
        const prompts = parsePromptList($('#local-prompts').value);
        if (!prompts.length) {
          localStatus.textContent = 'Pega al menos un prompt.';
          return;
        }

        localBusy = true;
        const blockSize = Math.max(1, Number($('#local-block-size').value || 4));
        const pauseSeconds = Number($('#local-pause').value || 3);
        const settings = {
          width: Number($('#local-width').value || 768),
          height: Number($('#local-height').value || 432),
          steps: Number($('#local-steps').value || 25),
          cfg: Number($('#local-cfg').value || 7),
          modelName: $('#comfy-model').value || 'model.safetensors'
        };

        const all = [];
        const blocks = [];
        for (let i = 0; i < prompts.length; i += blockSize) {
          blocks.push(prompts.slice(i, i + blockSize));
        }

        for (let blockIndex = 0; blockIndex < blocks.length; blockIndex++) {
          if (!localBusy) break;
          const block = blocks[blockIndex];
          localStatus.textContent = `Bloque ${blockIndex + 1}/${blocks.length}: generando ${block.length} imágenes...`;

          for (let index = 0; index < block.length; index++) {
            if (!localBusy) break;
            const prompt = block[index];
            localStatus.textContent = `Bloque ${blockIndex + 1}/${blocks.length} · ${index + 1}/${block.length} · ${prompt.slice(0, 60)}`;
            try {
              const image = await generateLocalPrompt(prompt, settings);
              all.push(image);
              renderGallery(all);
            } catch (error) {
              localStatus.textContent = `Error en bloque ${blockIndex + 1}, prompt ${index + 1}: ${error.message}`;
            }
            if (pauseSeconds > 0 && index < block.length - 1) {
              await new Promise((resolve) => setTimeout(resolve, pauseSeconds * 1000));
            }
          }

          if (blockIndex < blocks.length - 1 && localBusy) {
            await new Promise((resolve) => setTimeout(resolve, 1500));
          }
        }

        if (localBusy) {
          localStatus.textContent = `Listo. ${all.length} imágenes generadas.`;
        } else {
          localStatus.textContent = 'Generación detenida por el usuario.';
        }
        localBusy = false;
      }

      $('#generate-local-btn').addEventListener('click', async () => {
        try {
          const res = await fetch('http://127.0.0.1:8188/system_stats');
          if (!res.ok) throw new Error('ComfyUI no está corriendo.');
          runBlocks();
        } catch (error) {
          localStatus.textContent = `ComfyUI no disponible: ${error.message}. Debes abrirlo en http://127.0.0.1:8188`;
        }
      });

      $('#stop-local-btn').addEventListener('click', () => {
        localBusy = false;
      });

      $('#local-prompts').addEventListener('input', () => {
        localStatus.textContent = `${parsePromptList($('#local-prompts').value).length} prompts detectados.`;
      });

      window.addEventListener('load', () => {
        scriptCount.textContent = `${linesFromText(scriptInput.value).length} líneas`;
      });
    </script>
  </body>
</html>
