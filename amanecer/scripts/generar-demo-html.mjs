// Genera la página de demo: la app compilada a un solo archivo (dist-demo)
// embebida en base64 dentro de un marco de teléfono. En celular real la app
// ocupa toda la pantalla; en escritorio se ve dentro de un bisel de 390×844.
// El iframe usa srcdoc SIN sandbox: hereda el origen y IndexedDB funciona
// (los datos de prueba persisten entre visitas en el mismo navegador).

import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const raiz = dirname(fileURLToPath(import.meta.url));
const appHtml = readFileSync(resolve(raiz, '../dist-demo/index.html'));
const b64 = appHtml.toString('base64');

const salida = process.argv[2];
if (!salida) {
  console.error('uso: node generar-demo-html.mjs <ruta-salida.html>');
  process.exit(1);
}

const shell = `<title>Amanecer</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Bitter:wght@600&family=Atkinson+Hyperlegible:wght@400;700&display=swap">
<style>
  /* Tokens del escritorio de demo, derivados de la paleta de la app (§10.1):
     lino, café tostado, esmeralda. La app dentro del marco trae su propio
     sistema de diseño completo; este marco solo la sostiene. */
  :root {
    --escritorio: #ECE5D8;
    --escritorio-veta: #E3DACA;
    --texto: #292019;
    --texto-suave: #5C5248;
    --bisel: #292019;
    --bisel-borde: #443627;
    --acento: #0B6B5D;
    --pantalla: #FAF7F2;
    --superficie: #FFFFFF;
  }
  @media (prefers-color-scheme: dark) {
    :root:not([data-theme="light"]) {
      --escritorio: #201A15;
      --escritorio-veta: #2A231C;
      --texto: #F1EAE0;
      --texto-suave: #B5A996;
      --bisel: #0E0B08;
      --bisel-borde: #3A2F24;
      --acento: #4FB39F;
      --superficie: #2A231C;
    }
  }
  :root[data-theme="dark"] {
    --escritorio: #201A15;
    --escritorio-veta: #2A231C;
    --texto: #F1EAE0;
    --texto-suave: #B5A996;
    --bisel: #0E0B08;
    --bisel-borde: #3A2F24;
    --acento: #4FB39F;
    --superficie: #2A231C;
  }

  * { box-sizing: border-box; }
  html, body { margin: 0; height: 100%; }
  body {
    background:
      radial-gradient(1200px 600px at 50% -10%, var(--escritorio-veta), transparent 70%),
      var(--escritorio);
    color: var(--texto);
    font-family: 'Atkinson Hyperlegible', system-ui, sans-serif;
    display: flex;
    flex-direction: column;
    align-items: center;
    min-height: 100dvh;
  }
  :focus-visible { outline: 3px solid #1A73E8; outline-offset: 2px; border-radius: 8px; }

  header.marca {
    display: flex; align-items: center; gap: 10px;
    padding: 20px 16px 10px;
  }
  .sol { width: 30px; height: 30px; flex: none; }
  h1 {
    margin: 0;
    font-family: Bitter, Georgia, serif;
    font-weight: 600;
    font-size: 1.35rem;
    letter-spacing: 0.01em;
  }
  .marca small {
    display: block;
    color: var(--texto-suave);
    font-size: 0.78rem;
  }

  .telefono {
    height: min(844px, calc(100dvh - 224px));
    aspect-ratio: 402 / 872;
    background: linear-gradient(160deg, var(--bisel-borde), var(--bisel) 30%);
    border-radius: 44px;
    padding: 10px;
    box-shadow: 0 24px 60px rgba(20, 12, 4, 0.35), 0 2px 0 rgba(255,255,255,0.06) inset;
    position: relative;
  }
  .telefono::after { /* botón lateral, puro gesto de bisel */
    content: ""; position: absolute; right: -3px; top: 22%;
    width: 3px; height: 64px; border-radius: 2px; background: var(--bisel-borde);
  }
  .pantalla {
    width: 100%; height: 100%;
    border-radius: 34px;
    overflow: hidden;
    background: var(--pantalla);
    position: relative;
  }
  .isla { /* cámara frontal */
    position: absolute; top: 10px; left: 50%; transform: translateX(-50%);
    width: 96px; height: 24px; border-radius: 14px;
    background: var(--bisel); z-index: 2; pointer-events: none;
    opacity: 0.92;
  }
  iframe {
    display: block; width: 100%; height: 100%;
    border: 0; background: var(--pantalla);
  }

  footer.notas {
    max-width: 460px;
    padding: 14px 20px 26px;
    display: flex; flex-direction: column; gap: 8px;
    text-align: center;
    font-size: 0.82rem;
    color: var(--texto-suave);
    line-height: 1.45;
  }
  footer.notas p { margin: 0; }
  .reiniciar {
    align-self: center;
    font: inherit; font-weight: 700;
    color: var(--acento);
    background: none; border: none; cursor: pointer;
    text-decoration: underline;
    padding: 8px 12px; border-radius: 8px;
    min-height: 40px;
  }
  .reiniciar[disabled] { opacity: 0.5; cursor: wait; }

  .barra-movil { display: none; }

  /* En un celular real: la app a pantalla completa, solo una barra fina de demo. */
  @media (max-width: 560px) {
    header.marca, footer.notas { display: none; }
    body { display: block; }
    .barra-movil {
      display: flex; align-items: center; justify-content: space-between;
      height: 38px; padding: 0 12px;
      font-size: 0.8rem; color: var(--texto-suave);
      background: var(--escritorio);
    }
    .barra-movil .reiniciar { min-height: 38px; padding: 0 8px; }
    .telefono {
      height: calc(100dvh - 38px);
      aspect-ratio: auto; width: 100%;
      border-radius: 0; padding: 0; box-shadow: none; background: none;
    }
    .telefono::after { display: none; }
    .pantalla { border-radius: 0; }
    .isla { display: none; }
  }

  @media (prefers-reduced-motion: reduce) {
    * { transition: none !important; animation: none !important; }
  }
</style>

<div class="barra-movil" role="banner">
  <span>☀️ Amanecer · demo de prueba</span>
  <button type="button" class="reiniciar" data-reinicio>Reiniciar</button>
</div>

<header class="marca">
  <svg class="sol" viewBox="0 0 64 64" aria-hidden="true">
    <path d="M18 38a14 14 0 0 1 28 0z" fill="#0B6B5D"/>
    <rect x="8" y="38" width="48" height="3" rx="1.5" fill="currentColor"/>
    <g stroke="#0E8271" stroke-width="3" stroke-linecap="round">
      <line x1="32" y1="14" x2="32" y2="8"/>
      <line x1="18" y1="20" x2="14" y2="16"/>
      <line x1="46" y1="20" x2="50" y2="16"/>
    </g>
  </svg>
  <div>
    <h1>Amanecer</h1>
    <small>Demo interactiva — la app real, tal como se ve en el celular</small>
  </div>
</header>

<div class="telefono">
  <div class="pantalla">
    <div class="isla"></div>
    <iframe id="app" title="App Amanecer en demo"></iframe>
  </div>
</div>

<footer class="notas">
  <p>Es la aplicación completa: pruebe el check-in, los episodios, la comida,
  el directorio y el modo cuidador (el primer arranque pide nombre y PIN del
  cuidador). Lo que registre queda guardado solo en este navegador.</p>
  <p>La grabación de voz y las llamadas dependen de los permisos del
  dispositivo; en esta demo pueden no estar disponibles.</p>
  <button type="button" class="reiniciar" data-reinicio>Reiniciar la demo (borra los datos de prueba)</button>
</footer>

<script>
  const B64 = '__APP_B64__';

  function decodificar() {
    const bytes = Uint8Array.from(atob(B64), (c) => c.charCodeAt(0));
    return new TextDecoder().decode(bytes);
  }

  const marco = document.getElementById('app');
  const html = decodificar();
  marco.srcdoc = html;

  async function reiniciar(boton) {
    boton.disabled = true;
    marco.srcdoc = '<!doctype html><body style="background:#FAF7F2">';
    await new Promise((r) => setTimeout(r, 250));
    await new Promise((resolver) => {
      try {
        const peticion = indexedDB.deleteDatabase('amanecer');
        peticion.onsuccess = peticion.onerror = peticion.onblocked = () => resolver();
        setTimeout(resolver, 1500);
      } catch {
        resolver();
      }
    });
    marco.srcdoc = html;
    boton.disabled = false;
  }

  document.querySelectorAll('[data-reinicio]').forEach((b) => {
    b.addEventListener('click', () => void reiniciar(b));
  });
</script>
`;

const final = shell.replace('__APP_B64__', b64);
mkdirSync(dirname(resolve(salida)), { recursive: true });
writeFileSync(resolve(salida), final);
console.log(`demo generada: ${salida} (${(final.length / 1024 / 1024).toFixed(2)} MB)`);
