const $ = (selector) => document.querySelector(selector);

const audioInput = $('#silence-audio-input');
const scriptInput = $('#script-input');
const scriptCount = $('#script-count');
const silenceStatus = $('#silence-status');
const localStatus = $('#local-status');
const localGallery = $('#local-gallery');
let processedAudioBlob = null;

const linesFromText = (text) => {
  return (text || '')
    .replace(/\r/g, '')
    .split(/\n+/)
    .map((line) => line.trim())
    .filter(Boolean);
};

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
    silenceStatus.textContent = 'Selecciona primero un archivo de audio.';
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
      if (rms >= threshold) {
        ranges.push([Math.max(0, i - minFrames / 4), Math.min(decoded.length, end + minFrames / 4)]);
      }
    }

    if (!ranges.length) throw new Error('No se encontró audio por encima del umbral. Prueba con un valor menos agresivo.');

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

function formatSrtTime(seconds) {
  const totalMs = Math.max(0, seconds) * 1000;
  const h = Math.floor(totalMs / 3600000);
  const m = Math.floor((totalMs % 3600000) / 60000);
  const s = Math.floor((totalMs % 60000) / 1000);
  const ms = Math.floor(totalMs % 1000);
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')},${String(ms).padStart(3, '0')}`;
}

function parsePromptList(text) {
  const raw = (text || '').replace(/\r/g, '');
  if (!raw.trim()) return [];
  const lines = raw.split(/\n+/).map((x) => x.trim()).filter(Boolean);
  const list = [];
  for (const line of lines) {
    if (/^IMAGEN\s*\d+/i.test(line)) {
      const clean = line.replace(/^IMAGEN\s*\d+\s*[:.-]?\s*/i, '').trim();
      if (clean) list.push(clean);
    } else {
      list.push(line);
    }
  }
  return list.filter(Boolean);
}

let localGenerationToken = 0;
let localBusy = false;

function renderLocalGallery(items) {
  localGallery.innerHTML = '';
  items.forEach((item) => {
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
  });
}

async function buildComfyWorkflow(prompt, width, height, steps, cfg, modelName) {
  const selectedModel = (modelName || '').trim() || 'model.safetensors';
  return {
    3: {
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
    4: {
      inputs: { ckpt_name: selectedModel },
      class_type: 'CheckpointLoaderSimple'
    },
    5: {
      inputs: { width, height, batch_size: 1 },
      class_type: 'EmptyLatentImage'
    },
    6: {
      inputs: { text: prompt, clip: ['4', 1] },
      class_type: 'CLIPTextEncode'
    },
    7: {
      inputs: { text: 'blurry, low quality, watermark, text, distorted face, bad anatomy, noisy background', clip: ['4', 1] },
      class_type: 'CLIPTextEncode'
    },
    8: {
      inputs: { samples: ['3', 0], vae: ['4', 2] },
      class_type: 'VAEDecode'
    },
    9: {
      inputs: { pixels: ['8', 0], filename_prefix: 'SRTSync' },
      class_type: 'SaveImage'
    }
  };
}

async function waitForComfyResult(promptId) {
  const url = `http://127.0.0.1:8188/history/${promptId}`;
  for (let i = 0; i < 120; i++) {
    const res = await fetch(url);
    if (!res.ok) throw new Error('ComfyUI no respondió correctamente.');
    const history = await res.json();
    const entry = history && history[promptId];
    if (entry && entry.status && entry.status.status === 'completed') {
      return entry;
    }
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }
  throw new Error('ComfyUI tardó demasiado en responder.');
}

async function generateLocalPrompt(prompt, settings) {
  const workflow = await buildComfyWorkflow(prompt, settings.width, settings.height, settings.steps, settings.cfg, settings.modelName);
  const res = await fetch('http://127.0.0.1:8188/prompt', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt: workflow })
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(errorText || 'No se pudo enviar el prompt a ComfyUI.');
  }

  const data = await res.json();
  const history = await waitForComfyResult(data.prompt_id);
  const saveNode = Object.keys(history.outputs || {}).find((key) => history.outputs[key]?.images);
  const imageEntry = history.outputs[saveNode]?.images?.[0];
  if (!imageEntry) throw new Error('ComfyUI no devolvió ninguna imagen.');

  const filename = encodeURIComponent(imageEntry.filename);
  const subfolder = encodeURIComponent(imageEntry.subfolder || '');
  const type = encodeURIComponent(imageEntry.type || 'output');
  return {
    url: `http://127.0.0.1:8188/view?filename=${filename}&subfolder=${subfolder}&type=${type}`,
    label: prompt.slice(0, 40)
  };
}

async function startLocalGeneration() {
  const prompts = parsePromptList($('#local-prompts').value);
  if (!prompts.length) {
    localStatus.textContent = 'Pega primero al menos un prompt.';
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

  const allImages = [];
  const blocks = [];
  for (let i = 0; i < prompts.length; i += blockSize) {
    blocks.push(prompts.slice(i, i + blockSize));
  }

  for (let blockIndex = 0; blockIndex < blocks.length; blockIndex++) {
    if (!localBusy) break;
    const block = blocks[blockIndex];
    localStatus.textContent = `Bloque ${blockIndex + 1}/${blocks.length}: generando ${block.length} imágenes...`;
    const generated = [];

    for (let p = 0; p < block.length; p++) {
      if (!localBusy) break;
      const prompt = block[p];
      localStatus.textContent = `Bloque ${blockIndex + 1}/${blocks.length}: ${p + 1}/${block.length} — ${prompt.slice(0, 60)}`;
      try {
        const item = await generateLocalPrompt(prompt, settings);
        generated.push(item);
        allImages.push(item);
        renderLocalGallery(allImages);
      } catch (error) {
        localStatus.textContent = `Error en bloque ${blockIndex + 1}, prompt ${p + 1}: ${error.message}`;
        continue;
      }
      if (pauseSeconds > 0 && p < block.length - 1) {
        await new Promise((resolve) => setTimeout(resolve, pauseSeconds * 1000));
      }
    }

    if (blockIndex < blocks.length - 1 && localBusy) {
      await new Promise((resolve) => setTimeout(resolve, 1500));
    }
  }

  if (localBusy) {
    localStatus.textContent = `Listo. ${allImages.length} imágenes generadas.`;
  } else {
    localStatus.textContent = 'Generación detenida por el usuario.';
  }
  localBusy = false;
}

$('#generate-local-btn').addEventListener('click', async () => {
  try {
    const res = await fetch('http://127.0.0.1:8188/system_stats');
    if (!res.ok) {
      throw new Error('ComfyUI no está corriendo en 127.0.0.1:8188');
    }
    startLocalGeneration();
  } catch (error) {
    localStatus.textContent = `ComfyUI no disponible: ${error.message}. Abre ComfyUI primero.`;
  }
});

$('#stop-local-btn').addEventListener('click', () => {
  localBusy = false;
  localStatus.textContent = 'Se canceló la generación actual.';
});

$('#local-prompts').addEventListener('input', () => {
  const prompts = parsePromptList($('#local-prompts').value);
  localStatus.textContent = `${prompts.length} prompts detectados.`;
});

window.addEventListener('load', () => {
  scriptCount.textContent = `${linesFromText(scriptInput.value).length} líneas`;
});

window.renderLocalGallery = renderLocalGallery;
