// Genera la página compartible del documento para Lovable a partir de
// LOVABLE.md (una sola fuente de verdad). La página incrusta el markdown en
// base64, lo renderiza con un conversor mínimo y ofrece dos botones de copia:
// el documento completo y el prompt maestro (las líneas "> " de la sección 1).

import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const raiz = dirname(fileURLToPath(import.meta.url));
const md = readFileSync(resolve(raiz, '../LOVABLE.md'), 'utf8');
const b64 = Buffer.from(md, 'utf8').toString('base64');

const salida = process.argv[2];
if (!salida) {
  console.error('uso: node generar-doc-lovable.mjs <salida.html>');
  process.exit(1);
}

const html = `<title>Amanecer para Lovable</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Bitter:wght@600;700&family=Atkinson+Hyperlegible:wght@400;700&display=swap">
<style>
  :root {
    --pagina: #FAF1E4;
    --hero: #FBE2C7;
    --tarjeta: #FFFCF7;
    --tinta: #43302B;
    --suave: #7A6357;
    --acento: #B4532A;
    --acento-suave: #F6DFD0;
    --linea: #EADFCE;
    --codigo: #F3E7D5;
  }
  @media (prefers-color-scheme: dark) {
    :root:not([data-theme="light"]) {
      --pagina: #211913;
      --hero: #33241A;
      --tarjeta: #2A211A;
      --tinta: #F1EAE0;
      --suave: #B5A996;
      --acento: #E0906B;
      --acento-suave: #45301F;
      --linea: #3E3126;
      --codigo: #362A20;
    }
  }
  :root[data-theme="dark"] {
    --pagina: #211913;
    --hero: #33241A;
    --tarjeta: #2A211A;
    --tinta: #F1EAE0;
    --suave: #B5A996;
    --acento: #E0906B;
    --acento-suave: #45301F;
    --linea: #3E3126;
    --codigo: #362A20;
  }

  * { box-sizing: border-box; }
  body {
    margin: 0;
    background: var(--pagina);
    color: var(--tinta);
    font-family: 'Atkinson Hyperlegible', system-ui, sans-serif;
    font-size: 1.02rem;
    line-height: 1.6;
  }
  .lienzo { max-width: 760px; margin: 0 auto; padding: 0 20px 80px; }

  header.portada {
    background: linear-gradient(180deg, var(--hero), var(--pagina));
    margin: 0 -20px;
    padding: 44px 20px 26px;
    text-align: center;
    border-radius: 0 0 34px 34px;
  }
  .sol { width: 46px; height: 46px; }
  h1.titulo {
    font-family: Bitter, Georgia, serif;
    font-size: 1.9rem;
    margin: 8px 0 4px;
    text-wrap: balance;
  }
  .subtitulo { color: var(--suave); margin: 0 auto; max-width: 46ch; }

  .acciones {
    display: flex; flex-wrap: wrap; justify-content: center; gap: 10px;
    margin: 22px 0 6px;
  }
  .acciones button {
    font: inherit; font-weight: 700; cursor: pointer;
    border: 0; border-radius: 999px;
    padding: 12px 20px; min-height: 48px;
    background: var(--acento); color: #fff;
    box-shadow: 0 6px 18px rgba(140,90,50,.22);
  }
  .acciones button.secundario {
    background: var(--tarjeta); color: var(--acento);
    box-shadow: 0 2px 10px rgba(140,90,50,.12);
  }
  .acciones button:focus-visible { outline: 3px solid #1A73E8; outline-offset: 2px; }
  .nota-uso { color: var(--suave); font-size: .85rem; text-align: center; margin: 4px 0 0; }

  main.doc { margin-top: 26px; }
  main.doc h1 { font-family: Bitter, Georgia, serif; font-size: 1.5rem; margin: 40px 0 8px; text-wrap: balance; }
  main.doc h2 {
    font-family: Bitter, Georgia, serif; font-size: 1.25rem;
    margin: 36px 0 10px; padding-top: 18px; border-top: 1px solid var(--linea);
    text-wrap: balance;
  }
  main.doc h3 { font-family: Bitter, Georgia, serif; font-size: 1.05rem; margin: 24px 0 6px; }
  main.doc p { margin: 10px 0; }
  main.doc ul, main.doc ol { margin: 10px 0; padding-left: 24px; }
  main.doc li { margin: 5px 0; }
  main.doc hr { border: 0; border-top: 1px solid var(--linea); margin: 26px 0; }
  main.doc code {
    background: var(--codigo); border-radius: 6px; padding: 1px 6px;
    font-size: .88em;
  }
  main.doc blockquote {
    margin: 14px 0; padding: 16px 18px;
    background: var(--tarjeta); border-left: 4px solid var(--acento);
    border-radius: 0 18px 18px 0;
    box-shadow: 0 2px 10px rgba(140,90,50,.10);
  }
  main.doc blockquote p { margin: 8px 0; }
  .envoltorio-tabla { overflow-x: auto; margin: 12px 0; border-radius: 14px; }
  main.doc table {
    border-collapse: collapse; width: 100%; min-width: 460px;
    background: var(--tarjeta); font-size: .92rem;
  }
  main.doc th, main.doc td {
    text-align: left; padding: 8px 12px; border-bottom: 1px solid var(--linea);
    vertical-align: top;
  }
  main.doc th { font-weight: 700; background: var(--acento-suave); }
  main.doc tr:last-child td { border-bottom: 0; }
</style>

<div class="lienzo">
  <header class="portada">
    <svg class="sol" viewBox="0 0 64 64" aria-hidden="true">
      <path d="M18 40a14 14 0 0 1 28 0z" fill="#B4532A"/>
      <rect x="8" y="40" width="48" height="3" rx="1.5" fill="currentColor"/>
      <g stroke="#D98E2B" stroke-width="3" stroke-linecap="round">
        <line x1="32" y1="16" x2="32" y2="9"/>
        <line x1="18" y1="22" x2="13" y2="17"/>
        <line x1="46" y1="22" x2="51" y2="17"/>
      </g>
    </svg>
    <h1 class="titulo">Amanecer — documento para Lovable</h1>
    <p class="subtitulo">Todo lo construido y decidido en el prototipo, listo para pegarse en Lovable y desarrollar la app.</p>
    <div class="acciones">
      <button type="button" id="copiar-prompt">Copiar el prompt maestro</button>
      <button type="button" id="copiar-doc" class="secundario">Copiar el documento completo</button>
    </div>
    <p class="nota-uso">En Lovable: pegue el prompt maestro como primer mensaje y el documento completo como Knowledge.</p>
  </header>

  <main class="doc" id="doc"></main>
</div>

<script>
  const B64 = '${b64}';
  const bytes = Uint8Array.from(atob(B64), (c) => c.charCodeAt(0));
  const MD = new TextDecoder().decode(bytes);

  // ——— conversor mínimo de markdown (los constructos que usa este documento) ———
  const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  const inline = (s) =>
    esc(s)
      .replace(/\`([^\`]+)\`/g, '<code>$1</code>')
      .replace(/\\*\\*([^*]+)\\*\\*/g, '<strong>$1</strong>')
      .replace(/\\*([^*]+)\\*/g, '<em>$1</em>');

  function render(md) {
    const lineas = md.split('\\n');
    const salida = [];
    let i = 0;
    const parrafo = [];
    const cerrarParrafo = () => {
      if (parrafo.length) {
        salida.push('<p>' + inline(parrafo.join(' ')) + '</p>');
        parrafo.length = 0;
      }
    };
    while (i < lineas.length) {
      const ln = lineas[i];
      if (/^\\s*$/.test(ln)) { cerrarParrafo(); i++; continue; }
      if (/^---\\s*$/.test(ln)) { cerrarParrafo(); salida.push('<hr>'); i++; continue; }
      const h = ln.match(/^(#{1,3})\\s+(.*)$/);
      if (h) { cerrarParrafo(); const n = h[1].length; salida.push('<h' + n + '>' + inline(h[2]) + '</h' + n + '>'); i++; continue; }
      if (/^>\\s?/.test(ln)) {
        cerrarParrafo();
        const q = [];
        while (i < lineas.length && /^>\\s?/.test(lineas[i])) { q.push(lineas[i].replace(/^>\\s?/, '')); i++; }
        const inner = q.map((l) => (l.trim() === '' ? '</p><p>' : inline(l))).join(' ');
        salida.push('<blockquote><p>' + inner + '</p></blockquote>');
        continue;
      }
      if (/^\\|/.test(ln)) {
        cerrarParrafo();
        const filas = [];
        while (i < lineas.length && /^\\|/.test(lineas[i])) { filas.push(lineas[i]); i++; }
        const celdas = (f) => f.replace(/^\\||\\|$/g, '').split('|').map((c) => c.trim());
        let t = '<div class="envoltorio-tabla"><table>';
        filas.forEach((f, idx) => {
          if (/^\\|[\\s:-]+\\|/.test(f) && idx === 1) return; // separador
          const tag = idx === 0 ? 'th' : 'td';
          t += '<tr>' + celdas(f).map((c) => '<' + tag + '>' + inline(c) + '</' + tag + '>').join('') + '</tr>';
        });
        t += '</table></div>';
        salida.push(t);
        continue;
      }
      const li = ln.match(/^\\s*[-*]\\s+(.*)$/);
      const on = ln.match(/^\\s*(\\d+)\\.\\s+(.*)$/);
      if (li || on) {
        cerrarParrafo();
        const tag = li ? 'ul' : 'ol';
        const items = [];
        while (i < lineas.length) {
          const m1 = lineas[i].match(/^\\s*[-*]\\s+(.*)$/);
          const m2 = lineas[i].match(/^\\s*\\d+\\.\\s+(.*)$/);
          if (li && m1) { items.push(m1[1]); i++; }
          else if (!li && m2) { items.push(m2[1]); i++; }
          else break;
        }
        salida.push('<' + tag + '>' + items.map((x) => '<li>' + inline(x) + '</li>').join('') + '</' + tag + '>');
        continue;
      }
      parrafo.push(ln.trim());
      i++;
    }
    cerrarParrafo();
    return salida.join('\\n');
  }

  document.getElementById('doc').innerHTML = render(MD);

  // ——— prompt maestro: las líneas "> " de la sección 1 ———
  function extraerPrompt() {
    const desde = MD.indexOf('## 1.');
    const corte = MD.indexOf('\\n---', desde);
    return MD.slice(desde, corte)
      .split('\\n')
      .filter((l) => /^>\\s?/.test(l))
      .map((l) => l.replace(/^>\\s?/, ''))
      .join('\\n')
      .trim();
  }

  async function copiar(boton, texto, etiqueta) {
    try {
      await navigator.clipboard.writeText(texto);
    } catch {
      const ta = document.createElement('textarea');
      ta.value = texto;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      ta.remove();
    }
    const original = boton.textContent;
    boton.textContent = etiqueta;
    setTimeout(() => { boton.textContent = original; }, 2200);
  }

  document.getElementById('copiar-doc').addEventListener('click', (e) => {
    void copiar(e.currentTarget, MD, 'Documento copiado ✓');
  });
  document.getElementById('copiar-prompt').addEventListener('click', (e) => {
    void copiar(e.currentTarget, extraerPrompt(), 'Prompt copiado ✓');
  });
</script>
`;

writeFileSync(resolve(salida), html);
console.log('página generada:', salida, (html.length / 1024).toFixed(0) + ' KB');
