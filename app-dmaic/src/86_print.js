/* ============================================================================
   IMPRESIÓN · informe paginado
   Genera un documento estático (sin campos de formulario) con control real de
   saltos de página: ninguna tabla, gráfico o ficha queda partida entre hojas.
   Alcances: una herramienta, un módulo completo o el proyecto entero.
   ========================================================================== */
'use strict';

const PRINT = (function(){

  let _seq = 0;                       // testigo de impresión en curso
  const V = v => (v === null || v === undefined) ? '' : String(v);

  /* ---------------------------------------------------- bloques a texto */
  function bloque(b, t, d, ctx){
    if (b.when && !b.when(d, ctx)) return '';
    switch (b.type){

      case 'fields': {
        const items = (callv(b.items, d, ctx) || []).filter(f => !f.when || f.when(d, ctx));
        const filas = items.map(f => {
          let v = d[f.k];
          if (f.calc){ const r = f.calc(d, ctx);
            v = (typeof r === 'number' && !isFinite(r)) ? '' : (f.fmt ? fmt(r, f.fmt) : r); }
          else if (f.input === 'date' && v) v = fmt(v, 'date');
          if (!V(v).trim()) return '';
          return '<tr><th>' + esc(f.label) + '</th><td>' + esc(V(v)) + '</td></tr>';
        }).join('');
        if (!filas) return '';
        return caja(b.title, '<table class="p-kv">' + filas + '</table>');
      }

      case 'grid': {
        const rows = arr(d[b.key]);
        const cols = callv(b.cols, d, ctx) || [];
        const conDatos = rows.filter(r => hasContent(r));
        if (!conDatos.length) return '';
        const comp = rows.map((r, i) => {
          const o = {}; cols.forEach(c => { o[c.k] = c.calc ? c.calc(r, i, rows, d, ctx) : r[c.k]; }); return o;
        });
        // con muchas columnas el ancho mínimo del contenido desborda el papel y
        // las últimas columnas se pierden: se marca la tabla para que ajuste
        const anchas = cols.length >= 12 ? ' p-wide' : (cols.length >= 7 ? ' p-media' : '');
        let h = '<table class="p-tab' + anchas + '"><thead><tr><th class="n">#</th>' +
          cols.map(c => '<th' + (colNum(c) ? ' class="num"' : '') + '>' +
            esc(String(c.label).replace(/\n/g, ' ')) + '</th>').join('') +
          '</tr></thead><tbody>';
        rows.forEach((r, i) => {
          if (!hasContent(r)) return;
          h += '<tr><td class="n">' + (i + 1) + '</td>' + cols.map(c => {
            let v = comp[i][c.k];
            if (typeof v === 'number' && !isFinite(v)) v = '';
            else if (c.fmt) v = fmt(v, c.fmt);
            else if (c.input === 'date' && v) v = fmt(v, 'date');
            const al = colNum(c) ? ' class="num"' : '';
            return '<td' + al + '>' + esc(V(v)) + '</td>';
          }).join('') + '</tr>';
        });
        h += '</tbody>';
        if (b.foot){
          const fs = callv(b.foot, rows, d, ctx) || [];
          h += '<tfoot><tr><td class="n"></td>' + cols.map((c, ci) => {
            const f = fs.find(x => x.k === c.k);
            // un pie puede traer un rótulo fijo en vez de un cálculo: si se
            // llamaba f.calc a ciegas, la tabla entera se caía del informe
            if (f && typeof f.calc === 'function')
              return '<td class="num">' + esc(V(fmt(f.calc(rows, d, ctx, comp), f.fmt))) + '</td>';
            if (f && (f.label !== undefined || f.value !== undefined))
              return '<td>' + esc(V(f.label !== undefined ? f.label : f.value)) + '</td>';
            if (ci === 0){
              const lb = fs.find(x => x.k === '__label');
              return '<td>' + esc(lb && lb.label !== undefined ? lb.label : 'TOTAL') + '</td>';
            }
            return '<td></td>';
          }).join('') + '</tr></tfoot>';
        }
        h += '</table>';
        // una tabla de 12 columnas o más se lee mucho mejor en una hoja horizontal
        return caja(b.title, anchas === ' p-wide' ? '<div class="p-land">' + h + '</div>' : h);
      }

      case 'matrix': {
        const M = d[b.key] || {};
        const rws = callv(b.rows, d, ctx) || [], cls = callv(b.cols, d, ctx) || [];
        let algo = false;
        let h = '<table class="p-tab' + (cls.length >= 12 ? ' p-wide' : (cls.length >= 7 ? ' p-media' : '')) +
          '"><thead><tr><th></th>' +
          cls.map(c => '<th>' + esc(c.label) + '</th>').join('') + '</tr></thead><tbody>';
        rws.forEach(rw => {
          const rk = rw.k !== undefined ? rw.k : rw, rl = rw.l !== undefined ? rw.l : rw;
          h += '<tr><th>' + esc(rl) + '</th>' + cls.map(c => {
            const key = rk + '.' + c.k;
            let v = (b.calc && b.calc[key]) ? b.calc[key](M, d, ctx) : M[key];
            if (typeof v === 'number' && !isFinite(v)) v = '';
            else if (c.fmt) v = fmt(v, c.fmt);
            if (V(v).trim()) algo = true;
            return '<td class="num">' + esc(V(v)) + '</td>';
          }).join('') + '</tr>';
        });
        h += '</tbody></table>';
        return algo ? caja(b.title, h) : '';
      }

      case 'chart': {
        let data; try { data = callv(b.data, d, ctx) || {}; } catch(e){ return ''; }
        let svg; try { svg = CHART.draw(b.kind, data, { h: b.h || 300, print:true }); } catch(e){ return ''; }
        if (!svg || svg.indexOf('<svg') < 0) return '';
        return caja(b.title, '<div class="p-graf">' + svg + '</div>');
      }

      case 'diagram': {
        let svg = '';
        try { svg = DIAG.svg ? DIAG.svg(b.kind, d, b.key, { w:1100, print:true }) : ''; } catch(e){}
        if (svg && svg.indexOf('<svg') >= 0) return caja(b.title, '<div class="p-graf">' + svg + '</div>');
        const txt = (typeof GEN !== 'undefined') ? '' : '';
        return txt ? caja(b.title, '<pre class="p-pre">' + esc(txt) + '</pre>') : '';
      }

      case 'cards': {
        const items = callv(b.items, d, ctx) || [];
        if (!items.length) return '';
        return caja(b.title, '<div class="p-kpis">' + items.map(k =>
          '<div class="p-kpi"><span class="l">' + esc(k.label) + '</span>' +
          '<span class="v">' + esc(V(k.value)) + '</span>' +
          (k.hint ? '<span class="h">' + esc(k.hint) + '</span>' : '') + '</div>').join('') + '</div>');
      }

      case 'a3': {
        const areas = callv(b.areas, d, ctx) || [];
        const partes = areas.map(a => {
          if (a.kind === 'image') return d[a.k] ? '<div class="p-a3"><h4>' + esc(a.label) +
            '</h4><img src="' + d[a.k] + '"></div>' : '';
          if (a.kind === 'ref') return '';
          if (!V(d[a.k]).trim()) return '';
          return '<div class="p-a3"><h4>' + esc(a.label) + '</h4><p>' + esc(d[a.k]) + '</p></div>';
        }).join('');
        return partes ? caja(b.title, '<div class="p-a3g">' + partes + '</div>') : '';
      }

      case 'upload':
        return d[b.k] ? caja(b.label || b.title, '<img class="p-img" src="' + d[b.k] + '">') : '';

      case 'insight': {
        const list = (typeof ENGINE !== 'undefined') ? ENGINE.forTool(t, d, ctx) : [];
        if (!list || !list.length) return '';
        return caja('Interpretación y sugerencia de decisión',
          '<ul class="p-ins">' + list.map(i => '<li><b>[' + esc(i.sev || 'info') + ']</b> ' +
            esc(String(i.text).replace(/<[^>]+>/g, '')) + '</li>').join('') + '</ul>');
      }

      case 'note': {
        const txt = callv(b.text, d, ctx);
        if (!txt) return '';
        return '<p class="p-nota">' + esc(String(txt).replace(/<[^>]+>/g, '')) + '</p>';
      }
    }
    return '';
  }

  const caja = (titulo, cuerpo) =>
    '<section class="p-blk">' + (titulo ? '<h3>' + esc(titulo) + '</h3>' : '') + cuerpo + '</section>';

  /* -------------------------------------------------------- herramienta */
  function herramienta(t, ctx, n){
    const d = ST.d(t.id);
    const cuerpo = (t.blocks || []).map(b => { try { return bloque(b, t, d, ctx); }
      catch(e){ console.warn('print', t.id, b.type, e); return ''; } }).join('');
    if (!cuerpo.trim()) return '';
    const m = MOD_BY_ID[t.mod];
    return '<article class="p-tool"><header class="p-th">' +
      '<span class="p-tag" style="background:' + m.color + '">' + esc(m.name) + '</span>' +
      '<h2>' + (n ? n + '. ' : '') + esc(t.title) + '</h2>' +
      (enPlantilla(t) ? '<span class="p-hoja">Hoja Excel: ' + esc(t.sheet) + '</span>' : '') +
      '</header>' + cuerpo + '</article>';
  }

  /* ------------------------------------------------------------ portada */
  function portada(titulo, sub){
    const p = ST.proj(), c = ST.cfg;
    const logos = [c.logos.rehavid || REHAVID_LOGO_PNG, c.logos.arl, c.logos.empresa]
      .filter(Boolean).map(s => '<img src="' + s + '">').join('');
    return '<div class="p-cover">' +
      '<div class="p-logos">' + logos + '</div>' +
      '<h1>' + esc(titulo) + '</h1>' +
      (sub ? '<p class="p-sub">' + esc(sub) + '</p>' : '') +
      '<table class="p-kv p-cov">' +
        fila('Proyecto', p.nombre) + fila('Empresa atendida', p.empresa) +
        fila('ARL contratante', p.arl) + fila('Área o proceso', p.area) +
        fila('Líder del proyecto', p.lider) +
        fila('Avance DMAIC', fmt(projProgress(), 'p1')) +
        fila('Emitido', new Date().toLocaleString('es-CO')) +
      '</table>' +
      '<p class="p-pie">Metodología Lean Six Sigma · DMAIC — Documento generado por la herramienta Rehavid</p>' +
      '</div>';
  }
  const fila = (k, v) => V(v).trim() ? '<tr><th>' + esc(k) + '</th><td>' + esc(v) + '</td></tr>' : '';

  /* ------------------------------------------------------ resumen (todo) */
  function resumen(ctx){
    let g = null; try { g = ENGINE.global(ctx); } catch(e){}
    if (!g) return '';
    let h = '<article class="p-tool"><header class="p-th"><h2>Resumen ejecutivo</h2></header>';
    let nar = ''; try { nar = ENGINE.narrativa(ctx); } catch(e){}
    if (nar) h += caja('', String(nar).split(/\n+/).map(x => '<p>' + esc(x) + '</p>').join(''));
    h += caja('Avance por fase', '<table class="p-tab"><thead><tr><th>Fase</th><th>Formatos</th>' +
      '<th>Diligenciados</th><th>Avance</th></tr></thead><tbody>' +
      ST.activeMods().map(m => { const ts = toolsOf(m.id);
        return '<tr><td>' + m.n + '. ' + esc(m.name) + '</td><td class="num">' + ts.length +
          '</td><td class="num">' + ts.filter(x => toolFilled(x)).length + '</td><td class="num">' +
          fmt(modProgress(m.id), 'p0') + '</td></tr>'; }).join('') +
      '</tbody></table>');
    const dec = arr(g.decisiones).concat(arr(g.riesgos));
    if (dec.length) h += caja('Decisiones y riesgos', '<ul class="p-ins">' + dec.slice(0, 30).map(x =>
      '<li><b>[' + esc((x && x.sev) || 'info') + ']</b> ' +
      esc(String((x && x.text) || x).replace(/<[^>]+>/g, '')) + '</li>').join('') + '</ul>');
    return h + '</article>';
  }

  /* --------------------------------------------------------------- API */
  /** alcance: 'tool' | 'modulo' | 'todo' */
  function imprimir(alcance, id){
    const ctx = ST.ctx(), p = ST.proj();
    let titulo = '', sub = '', cuerpo = '';

    if (alcance === 'tool'){
      const t = TOOL_BY_ID[id] || TOOL_BY_ID[ROUTE.tool];
      if (!t) { toast('No hay una herramienta abierta para imprimir', 'warn'); return; }
      titulo = t.title; sub = MOD_BY_ID[t.mod].name;
      cuerpo = herramienta(t, ctx);
      if (!cuerpo){ toast('Esta herramienta todavía no tiene información que imprimir', 'warn'); return; }
    }
    else if (alcance === 'modulo'){
      const m = MOD_BY_ID[id || ROUTE.mod];
      if (!m) { toast('Elige primero un módulo', 'warn'); return; }
      titulo = 'Fase ' + (m.n || '') + ' · ' + m.name;
      sub = m.desc;
      const partes = toolsOf(m.id).map((t, i) => herramienta(t, ctx, i + 1)).filter(Boolean);
      if (!partes.length){ toast('Este módulo todavía no tiene información', 'warn'); return; }
      cuerpo = partes.join('');
    }
    else {
      titulo = 'Informe DMAIC completo';
      sub = 'Las cinco fases de la metodología';
      cuerpo = resumen(ctx);
      ST.activeMods().forEach(m => {
        const partes = toolsOf(m.id).map((t, i) => herramienta(t, ctx, i + 1)).filter(Boolean);
        if (!partes.length) return;
        // la primera herramienta de la fase continúa en la hoja del separador:
        // Chrome no respeta «break-before:avoid», así que se le quita el salto
        partes[0] = partes[0].replace('class="p-tool"', 'class="p-tool p-tool-1"');
        cuerpo += '<div class="p-sep"><span style="background:' + m.color + '"></span>' +
          '<h2>Fase ' + m.n + ' · ' + esc(m.name) + '</h2><p>' + esc(m.desc) + '</p></div>' + partes.join('');
      });
    }

    const informe = portada(titulo, sub) + cuerpo;

    // Dentro de un iframe (la versión publicada como página web) el navegador
    // bloquea el diálogo de impresión sin avisar: el botón parecía no hacer
    // nada. Ahí el informe se abre en una pestaña propia, que sí puede imprimir.
    if (enMarco()){ aparte(titulo, informe); return; }

    let host = $('#printarea');
    if (!host){ host = document.createElement('div'); host.id = 'printarea'; document.body.appendChild(host); }
    host.innerHTML = informe;
    document.body.classList.add('printing');

    // Cada impresión lleva su propio testigo: así el temporizador de una
    // impresión anterior no borra el informe que se acaba de construir.
    const testigo = ++_seq;
    const limpiar = () => {
      if (testigo !== _seq) return;
      document.body.classList.remove('printing');
      window.removeEventListener('afterprint', limpiar);
      setTimeout(() => { if (testigo === _seq && host) host.innerHTML = ''; }, 500);
    };
    window.addEventListener('afterprint', limpiar);
    setTimeout(() => { window.print(); setTimeout(limpiar, 2000); }, 150);
  }

  /* ------------------------------------------------- impresión en marco */
  function enMarco(){
    try { return window.top !== window.self; } catch(e){ return true; }
  }

  /** Hoja de estilos del informe, lista para una ventana aparte: se reutilizan
   *  tal cual las reglas de @media print y se añade lo justo para que además
   *  se vea en pantalla mientras el usuario decide. */
  /** Repite fuera de @media print las reglas que hay dentro, para que la
   *  ventana aparte se vea en pantalla igual que saldrá en el papel. */
  function sinMediaPrint(css){
    const MARCA = '@media print{';
    let extra = '', desde = 0;
    for (;;){
      const i = css.indexOf(MARCA, desde);
      if (i < 0) break;
      let j = i + MARCA.length, prof = 1;
      while (j < css.length && prof > 0){
        const c = css.charAt(j);
        if (c === '{') prof++; else if (c === '}') prof--;
        j++;
      }
      extra += css.slice(i + MARCA.length, j - 1) + '\n';
      desde = j;
    }
    return extra;
  }

  function hojaEstilos(){
    let css = '';
    try {
      const ss = document.querySelectorAll('style');
      for (let i = 0; i < ss.length; i++) css += ss[i].textContent + '\n';
    } catch(e){}
    css += '\n' + sinMediaPrint(css) + '\n';
    return css + '\n' +
      'html,body{height:auto;overflow:visible;margin:0;background:#EEEDF7}\n' +
      '#app,#toasts{display:none!important}\n' +
      '#printarea{display:block;background:#fff;max-width:210mm;margin:0 auto;\n' +
      '  padding:14mm 12mm;box-shadow:0 2px 18px rgba(0,0,0,.18);font-size:10.5pt;\n' +
      '  line-height:1.45;color:#16123A;font-family:\'Segoe UI\',system-ui,sans-serif}\n' +
      '@media print{ #printarea{max-width:none;margin:0;padding:0;box-shadow:none} }\n' +
      '#barra{position:sticky;top:0;z-index:9;display:flex;gap:10px;align-items:center;\n' +
      '  background:#3B26D3;color:#fff;padding:9px 14px;font:600 13px/1.3 \'Segoe UI\',sans-serif}\n' +
      '#barra button{font:700 13px \'Segoe UI\',sans-serif;padding:6px 14px;border:none;\n' +
      '  border-radius:7px;background:#0FE17B;color:#05341C;cursor:pointer}\n' +
      '@media print{ #barra{display:none} }\n';
  }

  function docInforme(titulo, informe){
    return '<!DOCTYPE html><html lang="es"><head><meta charset="utf-8">' +
      '<title>' + esc(titulo) + ' · Rehavid</title><style>' + hojaEstilos() + '</style></head><body>' +
      '<div id="barra"><button onclick="window.print()">Imprimir</button>' +
      '<span>' + esc(titulo) + ' — si el diálogo no aparece, usa Ctrl+P</span></div>' +
      '<div id="printarea">' + informe + '</div>' +
      '<script>setTimeout(function(){try{window.print();}catch(e){}},400);<\/script>' +
      '</body></html>';
  }

  /** Abre el informe en una pestaña propia; si el navegador bloquea la ventana,
   *  lo entrega como archivo para abrirlo e imprimirlo a mano. */
  function aparte(titulo, informe){
    const doc = docInforme(titulo, informe);
    let w = null;
    try { w = window.open('', '_blank'); } catch(e){ w = null; }
    if (w && w.document){
      try {
        w.document.open(); w.document.write(doc); w.document.close();
        toast('Informe abierto en una pestaña nueva: pulsa Imprimir allí', 'ok', 6000);
        return;
      } catch(e){}
    }
    try {
      download(new Blob([doc], { type:'text/html;charset=utf-8' }),
               titulo.replace(/[\\/:*?"<>|]/g, '-') + ' - informe.html');
      toast('El navegador bloqueó la ventana: se descargó el informe, ábrelo y pulsa Ctrl+P', 'warn', 9000);
    } catch(e){
      toast('No se pudo abrir el informe para imprimir', 'bad', 6000);
    }
  }

  return { imprimir, herramienta, portada };
})();
