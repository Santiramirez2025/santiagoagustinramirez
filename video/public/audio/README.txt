AUDIO DEL REEL — poné acá los archivos y activá el sonido.

Archivos esperados (mp3, 44.1kHz):
  vo.mp3      → voz en off (~20s). Generala en ElevenLabs con el guion + settings que te pasé.
  music.mp3   → cama de música (~20s o loopeable). Elegante, cálida, moderna.
  whoosh.mp3  → transición corta (~0.4s) entre escenas.
  pop.mp3     → "pop"/confirmación corta (~0.2s) para seña y notificaciones.
  riser.mp3   → riser cinematográfico (~1.5s) entrando al cierre.

Cómo activar:
  1) Copiá los 5 archivos en esta carpeta (video/public/audio/).
  2) En video/src/Video.tsx cambiá:  const AUDIO = false;  ->  const AUDIO = true;
  3) cd video && npm run render

Todos los tiempos ya están sincronizados con la animación:
  - whoosh en frames 75, 180, 330, 420, 510 (cambios de escena)
  - pop en cada fila de la agenda + en las 2 burbujas de WhatsApp
  - riser entrando al CTA (frame ~496)
  - música con fade in/out y volumen bajo para que la voz mande
