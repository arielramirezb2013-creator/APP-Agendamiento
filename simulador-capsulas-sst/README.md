# Simulador Cápsulas SST (Rehavid S.A.S.)

Asesor de SST por WhatsApp (simulado) para ARL SURA · Independiente Empresa: cápsulas de formación, matriz de peligros
IPEVR (GTC 45:2012) y FURAT diligenciado por voz que se entrega en PDF, Excel y JSON. Un solo archivo HTML sin backend,
100 % autónomo desde v17 y con conexión simulada a la base de la ARL desde v18: librerías de exporte y fuente incrustadas, cero peticiones de red.

- Usar: abre `dist/simulador_capsulas_sst_v18.html` en Google Chrome o Microsoft Edge. Todo funciona sin conexión;
  solo la voz necesita internet (el reconocimiento del navegador se procesa en servidores de Google).
- Publicar: sube ese único archivo a cualquier hosting estático con HTTPS (GitHub Pages, Netlify, Cloudflare Pages,
  Vercel). Con HTTPS el navegador recuerda el permiso del micrófono y el modo manos libres queda sin fricción.
- Desarrollar: edita `src/`, ejecuta `python3 build.py`, prueba con `tests/` (ver `CLAUDE.md`).
- Documentación: `docs/`.
