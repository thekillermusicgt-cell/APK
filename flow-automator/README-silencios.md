# Procesador de silencios

Se añadió `quitar-silencios.html`. Ábrelo con doble clic, selecciona el audio, ajusta:

- **Silencio mínimo:** 0,45 segundos por defecto.
- **Umbral:** -42 dB por defecto.

Pulsa **Procesar audio** y luego **Descargar audio sin silencios**. El archivo se procesa localmente en el navegador y se descarga como WAV; después selecciónalo en el primer apartado de SRTSync para sincronizarlo con el guion.

La salida es WAV porque es un formato fiable para exportar desde Web Audio sin instalar FFmpeg. El audio original no se modifica.
