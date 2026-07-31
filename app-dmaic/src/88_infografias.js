/* ============================================================================
   INFOGRAFÍAS DEL MANUAL · recreadas como SVG/HTML nativo
   Ninguna imagen del documento original se pega: cada esquema se vuelve a
   dibujar con la paleta de Rehavid, se adapta al ancho, se imprime nítido y,
   donde aporta, responde al puntero.
   Se montan sobre los capítulos de la GUÍA sin tocar sus textos.
   ========================================================================== */
'use strict';

const INFO = (function(){

  const P1 = '#3B26D3', P2 = '#6B4DE8', P3 = '#0FE17B', P4 = '#2A1AA6';
  const TX = 'var(--tx,#171043)', TX2 = 'var(--tx2,#544D80)', TX3 = 'var(--tx3,#8B85AE)';
  const BD = 'var(--bd,rgba(59,38,211,.16))', SUP = 'var(--d3,#F6F5FE)';

  /** Envuelve un SVG para que escale al ancho y no desborde nunca. */
  const svg = (w, h, cuerpo, titulo) =>
    '<figure class="ig">' +
    '<svg viewBox="0 0 ' + w + ' ' + h + '" width="100%" preserveAspectRatio="xMidYMid meet" ' +
    'role="img" aria-label="' + esc(titulo || '') + '">' + cuerpo + '</svg>' +
    (titulo ? '<figcaption>' + esc(titulo) + '</figcaption>' : '') + '</figure>';

  /** Texto centrado con ajuste de línea: el contenido SIEMPRE cae dentro de su caja. */
  function txt(x, y, ancho, s, o){
    o = o || {};
    const fs = o.fs || 12, lh = o.lh || fs * 1.28;
    const cpl = Math.max(4, Math.floor(ancho / (fs * 0.56)));
    const palabras = String(s || '').split(/\s+/).filter(Boolean);
    const lineas = []; let cur = '';
    palabras.forEach(p => {
      if (!cur) cur = p;
      else if ((cur + ' ' + p).length <= cpl) cur += ' ' + p;
      else { lineas.push(cur); cur = p; }
    });
    if (cur) lineas.push(cur);
    const n = lineas.length;
    const y0 = y - (n - 1) * lh / 2;
    return lineas.map((l, i) =>
      '<text x="' + x + '" y="' + (y0 + i * lh + fs * 0.35) + '" text-anchor="' + (o.anchor || 'middle') +
      '" font-size="' + fs + '" font-weight="' + (o.fw || 600) + '"' +
      (o.ls ? ' letter-spacing="' + o.ls + '"' : '') +
      ' fill="' + (o.fill || TX) + '">' + esc(l) + '</text>').join('');
  }
  const alto = (s, ancho, fs) => {
    const cpl = Math.max(4, Math.floor(ancho / ((fs || 12) * 0.56)));
    return Math.max(1, Math.ceil(String(s || '').length / cpl));
  };
  const caja = (x, y, w, h, r, fill, stroke, sw) =>
    '<rect x="' + x + '" y="' + y + '" width="' + w + '" height="' + h + '" rx="' + (r || 8) +
    '" fill="' + (fill || SUP) + '" stroke="' + (stroke || BD) + '" stroke-width="' + (sw || 1.4) + '"/>';

  /* ══════════════════════════════════════════════ 1 · EL CICLO DMAIC ═══ */
  function cicloDMAIC(){
    const F = [
      { l:'D', n:'DEFINIR',   q:'¿Cuál es el problema?',        c:'#2A1AA6' },
      { l:'M', n:'MEDIR',     q:'¿De qué tamaño es?',           c:'#3B26D3' },
      { l:'A', n:'ANALIZAR',  q:'¿Por qué ocurre?',             c:'#6B4DE8' },
      { l:'I', n:'MEJORAR',   q:'¿Cómo lo resolvemos?',         c:'#0E9E8F' },
      { l:'C', n:'CONTROLAR', q:'¿Cómo lo sostenemos?',         c:'#0A9E5C' }
    ];
    const W = 1040, H = 250, bw = 178, gap = 26, y = 44, bh = 132;
    let s = '';
    F.forEach((f, i) => {
      const x = 20 + i * (bw + gap);
      // flecha de continuidad hacia la siguiente fase
      if (i < F.length - 1)
        s += '<path d="M' + (x + bw + 4) + ' ' + (y + bh / 2) + ' h' + (gap - 9) + '" stroke="' + BD +
             '" stroke-width="2.4" marker-end="url(#igflecha)"/>';
      s += '<g class="ig-fase">' +
        caja(x, y, bw, bh, 12, 'var(--d2,#fff)', f.c, 2) +
        '<rect x="' + x + '" y="' + y + '" width="' + bw + '" height="34" rx="12" fill="' + f.c + '"/>' +
        '<rect x="' + x + '" y="' + (y + 22) + '" width="' + bw + '" height="12" fill="' + f.c + '"/>' +
        '<text x="' + (x + 16) + '" y="' + (y + 24) + '" font-size="19" font-weight="800" fill="#fff">' + f.l + '</text>' +
        '<text x="' + (x + 40) + '" y="' + (y + 23) + '" font-size="12" font-weight="800" fill="#fff" letter-spacing="1.2">' +
          esc(f.n) + '</text>' +
        txt(x + bw / 2, y + 76, bw - 26, f.q, { fs:13, fw:600, fill:TX }) +
        '<text x="' + (x + bw / 2) + '" y="' + (y + bh - 14) + '" text-anchor="middle" font-size="10.5" ' +
          'font-weight="800" fill="' + TX3 + '" letter-spacing="1">FASE ' + (i + 1) + '</text>' +
        '</g>';
    });
    // lazo de mejora continua
    s += '<path d="M' + (20 + bw / 2) + ' ' + (y + bh + 16) + ' V' + (H - 26) + ' H' +
         (20 + 4 * (bw + gap) + bw / 2) + ' V' + (y + bh + 16) + '" fill="none" stroke="' + P3 +
         '" stroke-width="2.4" stroke-dasharray="6 5" marker-end="url(#igflechav)"/>';
    s += '<rect x="' + (W / 2 - 118) + '" y="' + (H - 40) + '" width="236" height="26" rx="13" fill="' + SUP + '" stroke="' + P3 + '"/>';
    s += '<text x="' + (W / 2) + '" y="' + (H - 22) + '" text-anchor="middle" font-size="12" font-weight="800" fill="' + TX + '">' +
         'El ciclo se repite: mejora continua</text>';
    s += '<text x="20" y="26" font-size="12" font-weight="800" fill="' + TX3 + '" letter-spacing="1.4">' +
         'RUTA DE SOLUCIÓN DE PROBLEMAS</text>';
    return svg(W, H, defs() + s, 'Las cinco fases de DMAIC y la pregunta que responde cada una');
  }

  const defs = () =>
    '<defs>' +
    '<marker id="igflecha" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto">' +
      '<path d="M0 1 L9 5 L0 9 z" fill="' + BD + '"/></marker>' +
    '<marker id="igflechav" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto">' +
      '<path d="M0 1 L9 5 L0 9 z" fill="' + P3 + '"/></marker>' +
    '<marker id="igflechap" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto">' +
      '<path d="M0 1 L9 5 L0 9 z" fill="' + P1 + '"/></marker>' +
    '</defs>';

  /* ═════════════════════════════════════════ 2 · LOS 7 DESPERDICIOS ═══ */
  const DESP = [
    { n:'Sobreproducción', d:'Producir más o antes de lo que el cliente pide.',
      e:'Imprimir 200 informes cuando se usan 30.', f:'Producir contra demanda real.' },
    { n:'Exceso de inventario', d:'Acumular más de lo necesario para operar.',
      e:'Insumos de terapia para seis meses.', f:'Reponer por consumo, no por lote.' },
    { n:'Transporte', d:'Mover materiales o documentos sin necesidad.',
      e:'Llevar la historia clínica entre tres oficinas.', f:'Acercar el proceso al punto de uso.' },
    { n:'Esperas', d:'Tiempo en que nada avanza.',
      e:'El paciente espera 20 minutos al terapeuta.', f:'Nivelar la carga y sincronizar.' },
    { n:'Movimientos', d:'Desplazamientos innecesarios de la persona.',
      e:'Buscar el equipo en otra sala.', f:'Ordenar el puesto de trabajo (5S).' },
    { n:'Sobreprocesamiento', d:'Hacer más de lo que el cliente valora.',
      e:'Tres firmas para autorizar una sesión.', f:'Eliminar pasos que no agregan valor.' },
    { n:'Defectos', d:'Errores que obligan a rehacer o reponer.',
      e:'Cita mal agendada que hay que reprogramar.', f:'A prueba de errores (poka yoke).' }
  ];
  function desperdicios(){
    return '<div class="ig-grid7">' + DESP.map((w, i) =>
      '<article class="ig-desp"><header><span class="n">' + (i + 1) + '</span>' +
      '<h4>' + esc(w.n) + '</h4></header>' +
      '<p class="q">' + esc(w.d) + '</p>' +
      '<p class="e"><b>Ejemplo</b>' + esc(w.e) + '</p>' +
      '<p class="f"><b>Cómo eliminarlo</b>' + esc(w.f) + '</p></article>').join('') +
      '<article class="ig-desp ig-desp8"><header><span class="n">+</span>' +
      '<h4>Talento no aprovechado</h4></header>' +
      '<p class="q">El octavo desperdicio: no usar el conocimiento de quien hace el trabajo.</p>' +
      '<p class="e"><b>Ejemplo</b>Nadie preguntó al terapeuta por qué se cae la agenda.</p>' +
      '<p class="f"><b>Cómo eliminarlo</b>Involucrar al equipo desde el brainstorming.</p></article>' +
      '</div>';
  }

  /* ══════════════════════════════════════ 3 · VALOR AGREGADO / NO ═══ */
  function valorAgregado(){
    const pasos = [
      { n:'Recibir autorización', t:14, c:'NVAR' }, { n:'Buscar cupo', t:11, c:'NVA' },
      { n:'Confirmar', t:8, c:'NVAR' }, { n:'Registrar', t:6, c:'NVAR' },
      { n:'Esperar', t:12, c:'NVA' }, { n:'Evaluar', t:9, c:'VA' },
      { n:'Terapia', t:45, c:'VA' }, { n:'Registrar evolución', t:7, c:'VA' },
      { n:'Reagendar', t:9, c:'NVA' }
    ];
    const COL = { VA:P3, NVAR:'#E8890C', NVA:'#D92D46' };
    const total = pasos.reduce((a, p) => a + p.t, 0);
    const W = 1040, H = 210, x0 = 20, ancho = W - 40, y = 74, h = 46;
    let s = '', x = x0;
    pasos.forEach(p => {
      const w = ancho * p.t / total;
      s += '<g class="ig-paso"><rect x="' + x + '" y="' + y + '" width="' + (w - 2) + '" height="' + h +
        '" rx="4" fill="' + COL[p.c] + '" opacity="' + (p.c === 'VA' ? '.95' : '.8') + '">' +
        '<title>' + esc(p.n + ' · ' + p.t + ' min · ' + p.c) + '</title></rect>';
      if (w > 34) s += '<text x="' + (x + w / 2 - 1) + '" y="' + (y + h / 2 + 4) + '" text-anchor="middle" ' +
        'font-size="11" font-weight="800" fill="' + (p.c === 'VA' ? '#05341C' : '#fff') + '">' + p.t + '</text>';
      s += '</g>';
      x += w;
    });
    const va = pasos.filter(p => p.c === 'VA').reduce((a, p) => a + p.t, 0);
    s += '<line x1="' + x0 + '" y1="' + (y - 12) + '" x2="' + (x0 + ancho * va / total) + '" y2="' + (y - 12) +
         '" stroke="' + P3 + '" stroke-width="4" stroke-linecap="round"/>';
    s += '<text x="' + x0 + '" y="' + (y - 20) + '" font-size="11.5" font-weight="800" fill="' + P3 + '">' +
         'VALOR AGREGADO ' + Math.round(va / total * 100) + ' %</text>';
    s += '<text x="' + (x0 + ancho) + '" y="' + (y - 20) + '" text-anchor="end" font-size="11.5" font-weight="800" fill="' + TX3 + '">' +
         'TIEMPO TOTAL ' + total + ' MIN</text>';
    s += '<text x="' + x0 + '" y="26" font-size="12" font-weight="800" fill="' + TX3 + '" letter-spacing="1.4">' +
         'LÍNEA DE TIEMPO DE UN CICLO COMPLETO</text>';
    // leyenda
    const leyenda = [['VA','Agrega valor: el cliente lo pagaría'],
                     ['NVAR','No agrega valor pero hoy es necesario'],
                     ['NVA','No agrega valor: es desperdicio puro']];
    leyenda.forEach((l, i) => {
      const lx = x0 + i * 340;
      s += '<rect x="' + lx + '" y="' + (y + h + 22) + '" width="13" height="13" rx="3" fill="' + COL[l[0]] + '"/>' +
        '<text x="' + (lx + 20) + '" y="' + (y + h + 33) + '" font-size="11.5" font-weight="700" fill="' + TX + '">' +
        esc(l[0]) + '</text>' +
        '<text x="' + (lx + 20) + '" y="' + (y + h + 49) + '" font-size="11" fill="' + TX2 + '">' + esc(l[1]) + '</text>';
    });
    return svg(W, H, s, 'Tiempo que agrega valor frente al que no lo agrega en un ciclo de atención');
  }

  /* ════════════════════════════════ 4 · 3σ vs 6σ (ejemplo de las donas) */
  function campanaSigma(){
    const W = 1040, H = 300, mid = W / 2 - 16;
    const panel = (x0, sd, titulo, color, fuera) => {
      // altura de la campana menor que la distancia al título: el pico no lo toca
      const w = mid - 20, h = 138, base = 232, cx = x0 + w / 2;
      const lsl = x0 + w * 0.16, usl = x0 + w * 0.84;
      const esc0 = (usl - lsl) / 60;                     // 60 g de tolerancia total
      let d = '', n = 90;
      for (let i = 0; i <= n; i++){
        const g = -34 + 68 * i / n;
        const yv = Math.exp(-(g * g) / (2 * sd * sd));
        const px = cx + g * esc0, py = base - yv * h;
        d += (i ? ' L' : 'M') + px.toFixed(1) + ' ' + py.toFixed(1);
      }
      let s = caja(x0 - 8, 40, w + 16, 214, 12, 'var(--d2,#fff)', BD, 1.4);
      s += '<text x="' + cx + '" y="64" text-anchor="middle" font-size="13" font-weight="800" fill="' + color + '">' +
           esc(titulo) + '</text>';
      // zona fuera de especificación
      s += '<path d="' + d + ' L' + (cx + 34 * esc0) + ' ' + base + ' L' + (cx - 34 * esc0) + ' ' + base + ' Z" fill="' +
           color + '" opacity=".13"/>';
      s += '<path d="' + d + '" fill="none" stroke="' + color + '" stroke-width="2.6"/>';
      [[lsl, 'LSL 70 g'], [usl, 'USL 130 g']].forEach(l => {
        s += '<line x1="' + l[0] + '" y1="82" x2="' + l[0] + '" y2="' + base + '" stroke="' + '#D92D46' +
             '" stroke-width="2" stroke-dasharray="5 4"/>' +
             '<text x="' + l[0] + '" y="78" text-anchor="middle" font-size="10.5" font-weight="800" fill="#D92D46">' +
             esc(l[1]) + '</text>';
      });
      s += '<line x1="' + cx + '" y1="96" x2="' + cx + '" y2="' + base + '" stroke="' + TX3 + '" stroke-width="1.4"/>';
      s += '<text x="' + cx + '" y="' + (base + 16) + '" text-anchor="middle" font-size="10.5" fill="' + TX3 + '">100 g</text>';
      s += '<line x1="' + (x0 - 8) + '" y1="' + base + '" x2="' + (x0 + w + 8) + '" y2="' + base + '" stroke="' + BD + '"/>';
      s += '<text x="' + cx + '" y="' + (base + 34) + '" text-anchor="middle" font-size="11.5" font-weight="700" fill="' + TX2 + '">' +
           esc(fuera) + '</text>';
      return s;
    };
    let s = '<text x="20" y="26" font-size="12" font-weight="800" fill="' + TX3 + '" letter-spacing="1.4">' +
      'MISMO PROMEDIO, DISTINTA VARIACIÓN — DONAS DE 100 g CON TOLERANCIA ±30 g</text>';
    s += panel(20, 10, 'Proceso en 3 sigma  ·  σ = 10 g', '#D92D46', '66.800 de cada millón fuera de especificación');
    s += panel(mid + 28, 5, 'Proceso en 6 sigma  ·  σ = 5 g', P3, '3,4 de cada millón fuera de especificación');
    return svg(W, H, s, 'La misma tolerancia con dos niveles de variación: el proceso en 6σ casi no produce defectos');
  }

  /* ══════════════════════════════════ 5 · TABLA DE NIVEL SIGMA ═══ */
  function escaleraSigma(){
    const N = [[1,691462,30.9],[2,308538,69.1],[3,66807,93.32],[4,6210,99.379],
               [5,233,99.977],[6,3.4,99.99966]];
    const W = 1040, H = 292, x0 = 60, base = 236, bw = 118, gap = 34;
    let s = '<text x="20" y="26" font-size="12" font-weight="800" fill="' + TX3 + '" letter-spacing="1.4">' +
      'CADA NIVEL SIGMA REDUCE LOS DEFECTOS EN UN ORDEN DE MAGNITUD (LARGO PLAZO, CON CORRIMIENTO DE 1,5σ)</text>';
    const maxL = Math.log10(691462);
    N.forEach((n, i) => {
      const x = x0 + i * (bw + gap);
      const hh = Math.max(10, (Math.log10(Math.max(n[1], 1.1)) / maxL) * 150);
      const col = i < 2 ? '#D92D46' : i < 4 ? '#E8890C' : P3;
      s += '<g class="ig-esc">' +
        '<rect x="' + x + '" y="' + (base - hh) + '" width="' + bw + '" height="' + hh + '" rx="6" fill="' + col + '" opacity=".9">' +
        '<title>' + n[0] + 'σ · ' + fmt(n[1], 'n1') + ' DPMO · ' + n[2] + ' % conforme</title></rect>' +
        '<text x="' + (x + bw / 2) + '" y="' + (base - hh - 22) + '" text-anchor="middle" font-size="14" ' +
          'font-weight="800" fill="' + TX + '">' + n[0] + 'σ</text>' +
        '<text x="' + (x + bw / 2) + '" y="' + (base - hh - 7) + '" text-anchor="middle" font-size="11" ' +
          'font-weight="700" fill="' + col + '">' + fmt(n[1], n[1] < 10 ? 'n1' : 'n0') + ' DPMO</text>' +
        '<text x="' + (x + bw / 2) + '" y="' + (base + 17) + '" text-anchor="middle" font-size="11" fill="' + TX2 + '">' +
          n[2] + ' %</text>' +
        '<text x="' + (x + bw / 2) + '" y="' + (base + 32) + '" text-anchor="middle" font-size="9.5" fill="' + TX3 + '">conforme</text>' +
        '</g>';
    });
    s += '<line x1="40" y1="' + base + '" x2="' + (W - 24) + '" y2="' + base + '" stroke="' + BD + '" stroke-width="1.4"/>';
    s += '<text x="' + (x0 + 2 * (bw + gap) + bw / 2) + '" y="' + (base + 58) + '" text-anchor="middle" ' +
         'font-size="11" font-weight="700" fill="' + TX3 + '">Muchas operaciones viven aquí</text>';
    s += '<text x="' + (x0 + 5 * (bw + gap) + bw / 2) + '" y="' + (base + 58) + '" text-anchor="middle" ' +
         'font-size="11" font-weight="700" fill="' + P3 + '">Clase mundial</text>';
    return svg(W, H, s, 'Escalera de nivel sigma: defectos por millón de oportunidades y porcentaje conforme');
  }

  /* ══════════════════════════════════ 6 · ESTRUCTURA DE ROLES ═══ */
  function rolesLSS(){
    const R = [
      { n:'CHAMPION', d:'Ejecutivo que abre las puertas y asegura los recursos.', w:0.42, c:P4 },
      { n:'MASTER BLACK BELT', d:'Guía metodológico. Forma y audita a los demás cinturones.', w:0.56, c:P1 },
      { n:'BLACK BELT', d:'Lidera proyectos grandes de tiempo completo.', w:0.70, c:P2 },
      { n:'GREEN BELT', d:'Lidera proyectos de su área junto con su trabajo diario.', w:0.84, c:'#0E9E8F' },
      { n:'YELLOW / WHITE BELT', d:'Participan en el equipo y aportan el conocimiento del proceso.', w:1, c:'#0A9E5C' }
    ];
    const W = 1040, H = 322, cx = W / 2, y0 = 34, bh = 52, gap = 8;
    let s = '<text x="20" y="20" font-size="12" font-weight="800" fill="' + TX3 + '" letter-spacing="1.4">' +
      'QUIÉN HACE QUÉ EN UN PROYECTO LEAN SIX SIGMA</text>';
    R.forEach((r, i) => {
      const w = 560 * r.w, x = cx - w / 2 - 130, y = y0 + i * (bh + gap);
      s += '<g class="ig-rol">' + caja(x, y, w, bh, 8, r.c, r.c, 0) +
        '<text x="' + (x + 16) + '" y="' + (y + bh / 2 + 5) + '" font-size="12.5" font-weight="800" ' +
        'fill="#fff" letter-spacing=".6">' + esc(r.n) + '</text>' +
        '<line x1="' + (x + w + 6) + '" y1="' + (y + bh / 2) + '" x2="' + (x + w + 26) + '" y2="' + (y + bh / 2) +
        '" stroke="' + BD + '" stroke-width="1.4"/>' +
        txt(x + w + 34, y + bh / 2, 300, r.d, { fs:11.5, fw:500, fill:TX2, anchor:'start' }) +
        '</g>';
    });
    s += '<text x="' + (cx - 320) + '" y="' + (y0 + 5 * (bh + gap) + 22) + '" font-size="11.5" font-weight="700" fill="' + TX3 + '">' +
      'Además: Dueño del proceso, Finanzas (valida el ahorro) y el equipo que vive el proceso todos los días.</text>';
    return svg(W, H, s, 'Estructura de roles de un proyecto Lean Six Sigma');
  }

  /* ══════════════════════ 7 · PROBLEMA REAL → ESTADÍSTICO → SOLUCIÓN */
  function cicloEstadistico(){
    const W = 1040, H = 260, bw = 268, bh = 88;
    const N = [
      { t:'PROBLEMA DEL MUNDO REAL', d:'«Se reprograman demasiadas citas»', x:40,  y:44,  c:P1 },
      { t:'PROBLEMA ESTADÍSTICO',    d:'«El 32,4 % de 1.847 citas se reprograma»', x:W - 40 - bw, y:44,  c:P2 },
      { t:'SOLUCIÓN ESTADÍSTICA',    d:'«Con sobrecupo del 15 % la proporción baja a 7,4 % (p < 0,05)»', x:W - 40 - bw, y:150, c:'#0E9E8F' },
      { t:'SOLUCIÓN DEL MUNDO REAL', d:'«El paciente recibe su terapia en la fecha pactada»', x:40,  y:150, c:'#0A9E5C' }
    ];
    let s = '<text x="20" y="24" font-size="12" font-weight="800" fill="' + TX3 + '" letter-spacing="1.4">' +
      'CÓMO SE TRADUCE UN PROBLEMA DEL NEGOCIO A DATOS Y VUELVE CONVERTIDO EN SOLUCIÓN</text>';
    N.forEach(n => {
      s += caja(n.x, n.y, bw, bh, 10, 'var(--d2,#fff)', n.c, 2) +
        '<rect x="' + n.x + '" y="' + n.y + '" width="5" height="' + bh + '" rx="2.5" fill="' + n.c + '"/>' +
        '<text x="' + (n.x + 16) + '" y="' + (n.y + 22) + '" font-size="10.5" font-weight="800" fill="' + n.c +
        '" letter-spacing=".9">' + esc(n.t) + '</text>' +
        txt(n.x + 16 + (bw - 32) / 2, n.y + 56, bw - 34, n.d, { fs:11.5, fw:500, fill:TX2 });
    });
    const fl = (x1, y1, x2, y2, lbl, lx, ly) =>
      '<path d="M' + x1 + ' ' + y1 + ' L' + x2 + ' ' + y2 + '" stroke="' + P1 +
      '" stroke-width="2.2" marker-end="url(#igflechap)"/>' +
      '<text x="' + lx + '" y="' + ly + '" text-anchor="middle" font-size="10.5" font-weight="800" fill="' + P1 + '">' +
      esc(lbl) + '</text>';
    s += fl(40 + bw + 6, 88, W - 40 - bw - 12, 88, 'MEDIR', W / 2, 82);
    s += fl(W - 40 - bw / 2, 44 + bh + 6, W - 40 - bw / 2, 144, 'ANALIZAR', W - 40 - bw / 2 + 54, 128);
    s += fl(W - 40 - bw - 6, 194, 40 + bw + 12, 194, 'MEJORAR', W / 2, 188);
    s += fl(40 + bw / 2, 150 - 6, 40 + bw / 2, 138 - 44 + 6, 'CONTROLAR', 40 + bw / 2 - 62, 128);
    return svg(W, H, defs() + s, 'El puente entre el problema real y los datos');
  }

  /* ══════════════════════════ 8 · EMBUDO DE SELECCIÓN DE PROYECTOS */
  function embudoProyectos(){
    const E = [
      { t:'Estrategia y metas de la empresa', d:'De dónde nacen los proyectos', w:1,    c:P4 },
      { t:'Problemas y oportunidades',        d:'Datos, quejas, indicadores fuera de meta', w:0.82, c:P1 },
      { t:'Proyectos potenciales',            d:'Los que valen la pena estudiar', w:0.64, c:P2 },
      { t:'Matriz de priorización',           d:'Cliente × Costo × Éxito × Empresa × Beneficio', w:0.46, c:'#0E9E8F' },
      { t:'EL PROYECTO',                      d:'Uno solo, con Project Charter firmado', w:0.3,  c:'#0A9E5C' }
    ];
    const W = 1040, H = 300, cx = 330, y0 = 34, bh = 46, gap = 8;
    let s = '<text x="20" y="20" font-size="12" font-weight="800" fill="' + TX3 + '" letter-spacing="1.4">' +
      'DE LA ESTRATEGIA AL PROYECTO: EL EMBUDO DE SELECCIÓN</text>';
    E.forEach((e, i) => {
      const w = 560 * e.w, x = cx - w / 2, y = y0 + i * (bh + gap);
      s += caja(x, y, w, bh, 7, e.c, e.c, 0) +
        txt(cx, y + bh / 2, w - 22, e.t, { fs:12, fw:800, fill:'#fff' }) +
        '<line x1="' + (cx + 290) + '" y1="' + (y + bh / 2) + '" x2="' + (cx + 312) + '" y2="' + (y + bh / 2) +
        '" stroke="' + BD + '" stroke-width="1.4"/>' +
        txt(cx + 320, y + bh / 2, 350, e.d, { fs:11.5, fw:500, fill:TX2, anchor:'start' });
      if (i < E.length - 1)
        s += '<path d="M' + cx + ' ' + (y + bh + 1) + ' v' + (gap - 3) + '" stroke="' + BD + '" stroke-width="2"/>';
    });
    return svg(W, H, s, 'Embudo de selección de proyectos Lean Six Sigma');
  }

  /* ══════════════════════════════════ 9 · NIVELES DE CAUSA (iceberg) */
  function nivelesCausa(){
    const W = 1040, H = 300, cx = W / 2;
    let s = '<text x="20" y="22" font-size="12" font-weight="800" fill="' + TX3 + '" letter-spacing="1.4">' +
      'LO QUE SE VE NO ES LA CAUSA: HAY QUE BAJAR HASTA LA RAÍZ</text>';
    s += '<line x1="30" y1="112" x2="' + (W - 30) + '" y2="112" stroke="' + P2 +
         '" stroke-width="2" stroke-dasharray="7 5"/>';
    s += '<text x="' + (W - 34) + '" y="106" text-anchor="end" font-size="10.5" font-weight="800" fill="' + P2 + '">' +
         'LÍNEA DE LO EVIDENTE</text>';
    const N = [
      { t:'SÍNTOMA', d:'Lo que se ve y molesta. «Los pacientes se quejan de que los citan muy separado.»',
        y:48, c:'#D92D46', w:400 },
      { t:'CAUSA APARENTE', d:'La primera explicación, casi siempre incompleta. «Falta capacidad en la sede.»',
        y:140, c:'#E8890C', w:520 },
      { t:'CAUSA RAÍZ', d:'La que, si se elimina, el problema no vuelve. «El agendamiento se implantó sin regla de sobrecupo.»',
        y:224, c:'#0A9E5C', w:640 }
    ];
    N.forEach(n => {
      const x = cx - n.w / 2;
      s += caja(x, n.y, n.w, 64, 10, 'var(--d2,#fff)', n.c, 2) +
        '<rect x="' + x + '" y="' + n.y + '" width="' + n.w + '" height="22" rx="10" fill="' + n.c + '"/>' +
        '<rect x="' + x + '" y="' + (n.y + 12) + '" width="' + n.w + '" height="10" fill="' + n.c + '"/>' +
        '<text x="' + (x + 14) + '" y="' + (n.y + 16) + '" font-size="10.5" font-weight="800" fill="#fff" letter-spacing="1">' +
        esc(n.t) + '</text>' +
        txt(cx, n.y + 44, n.w - 30, n.d, { fs:11.5, fw:500, fill:TX2 });
    });
    s += '<path d="M' + cx + ' 114 v20" stroke="' + P1 + '" stroke-width="2.2" marker-end="url(#igflechap)"/>';
    s += '<path d="M' + cx + ' 206 v12" stroke="' + P1 + '" stroke-width="2.2" marker-end="url(#igflechap)"/>';
    s += '<text x="' + (cx + 14) + '" y="130" font-size="10.5" font-weight="800" fill="' + P1 + '">¿POR QUÉ?</text>';
    s += '<text x="' + (cx + 14) + '" y="216" font-size="10.5" font-weight="800" fill="' + P1 + '">¿POR QUÉ?</text>';
    return svg(W, H, defs() + s, 'Del síntoma a la causa raíz');
  }

  /* ═══════════════════════════ 10 · MATRIZ IMPACTO / ESFUERZO ═══ */
  function impactoEsfuerzo(){
    const W = 720, H = 420, x0 = 78, y0 = 34, w = 580, h = 320;
    const Q = [
      { t:'GANANCIA RÁPIDA', d:'Hazlo ya', x:0, y:0, c:P3, tx:'#05341C' },
      { t:'PROYECTO MAYOR',  d:'Planifícalo', x:1, y:0, c:P1, tx:'#fff' },
      { t:'RELLENO',         d:'Si sobra tiempo', x:0, y:1, c:'#E8890C', tx:'#fff' },
      { t:'INGRATO',         d:'Descártalo', x:1, y:1, c:'#D92D46', tx:'#fff' }
    ];
    let s = '';
    Q.forEach(q => {
      const x = x0 + q.x * w / 2, y = y0 + q.y * h / 2;
      s += '<rect x="' + x + '" y="' + y + '" width="' + (w / 2 - 3) + '" height="' + (h / 2 - 3) +
        '" rx="8" fill="' + q.c + '" opacity=".92"/>' +
        '<text x="' + (x + w / 4) + '" y="' + (y + h / 4 - 4) + '" text-anchor="middle" font-size="14" ' +
        'font-weight="800" fill="' + q.tx + '" letter-spacing=".6">' + esc(q.t) + '</text>' +
        '<text x="' + (x + w / 4) + '" y="' + (y + h / 4 + 18) + '" text-anchor="middle" font-size="11.5" ' +
        'fill="' + q.tx + '" opacity=".85">' + esc(q.d) + '</text>';
    });
    s += '<text x="' + (x0 + w / 2) + '" y="' + (y0 + h + 30) + '" text-anchor="middle" font-size="12" ' +
      'font-weight="800" fill="' + TX2 + '">ESFUERZO  →</text>';
    s += '<text x="' + (x0 - 26) + '" y="' + (y0 + h / 2) + '" text-anchor="middle" font-size="12" font-weight="800" ' +
      'fill="' + TX2 + '" transform="rotate(-90 ' + (x0 - 26) + ' ' + (y0 + h / 2) + ')">←  BENEFICIO</text>';
    s += '<text x="' + x0 + '" y="' + (y0 + h + 30) + '" font-size="10.5" fill="' + TX3 + '">bajo</text>';
    s += '<text x="' + (x0 + w) + '" y="' + (y0 + h + 30) + '" text-anchor="end" font-size="10.5" fill="' + TX3 + '">alto</text>';
    s += '<text x="' + x0 + '" y="' + (y0 - 10) + '" font-size="12" font-weight="800" fill="' + TX3 + '" letter-spacing="1.2">' +
      'DÓNDE EMPEZAR CON LAS SOLUCIONES</text>';
    return svg(W, H, s, 'Matriz de impacto contra esfuerzo para priorizar soluciones');
  }

  /* ═════════════════ 11 · LÍMITES DE CONTROL vs ESPECIFICACIÓN ═══ */
  function controlVsEspec(){
    const casos = [
      { t:'En control y dentro de especificación', d:'El proceso es estable y cumple. Sólo hay que sostenerlo.', ok:1, cap:1 },
      { t:'En control pero fuera de especificación', d:'Es estable, pero no sirve: hay que rediseñar el proceso.', ok:1, cap:0 },
      { t:'Fuera de control y dentro de especificación', d:'Hoy cumple por suerte. Elimina las causas especiales.', ok:0, cap:1 },
      { t:'Fuera de control y fuera de especificación', d:'Lo peor: estabiliza primero, después mejora la capacidad.', ok:0, cap:0 }
    ];
    const W = 1040, H = 300, pw = 236, gap = 24, y0 = 46, ph = 140;
    let s = '<text x="20" y="24" font-size="12" font-weight="800" fill="' + TX3 + '" letter-spacing="1.4">' +
      'LOS LÍMITES DE CONTROL SON LA VOZ DEL PROCESO; LOS DE ESPECIFICACIÓN, LA VOZ DEL CLIENTE</text>';
    casos.forEach((c, i) => {
      const x = 20 + i * (pw + gap), cy = y0 + ph / 2;
      const col = (c.ok && c.cap) ? P3 : (!c.ok && !c.cap) ? '#D92D46' : '#E8890C';
      s += caja(x, y0, pw, ph, 10, 'var(--d2,#fff)', col, 2);
      // límites de especificación (rojo) y de control (índigo)
      const eA = y0 + 22, eB = y0 + ph - 22;
      const cA = c.cap ? y0 + 40 : y0 + 12, cB = c.cap ? y0 + ph - 40 : y0 + ph - 12;
      s += '<line x1="' + (x + 10) + '" y1="' + eA + '" x2="' + (x + pw - 10) + '" y2="' + eA +
           '" stroke="#D92D46" stroke-width="1.8" stroke-dasharray="5 4"/>';
      s += '<line x1="' + (x + 10) + '" y1="' + eB + '" x2="' + (x + pw - 10) + '" y2="' + eB +
           '" stroke="#D92D46" stroke-width="1.8" stroke-dasharray="5 4"/>';
      s += '<line x1="' + (x + 10) + '" y1="' + cA + '" x2="' + (x + pw - 10) + '" y2="' + cA + '" stroke="' + P1 + '" stroke-width="1.6"/>';
      s += '<line x1="' + (x + 10) + '" y1="' + cB + '" x2="' + (x + pw - 10) + '" y2="' + cB + '" stroke="' + P1 + '" stroke-width="1.6"/>';
      // serie
      let d = '';
      for (let k = 0; k <= 12; k++){
        const px = x + 16 + k * (pw - 32) / 12;
        const amp = c.ok ? 14 : 34;
        const dy = Math.sin(k * 1.1) * amp + (c.ok ? 0 : (k === 8 ? 30 : 0));
        d += (k ? ' L' : 'M') + px.toFixed(1) + ' ' + (cy + dy).toFixed(1);
      }
      s += '<path d="' + d + '" fill="none" stroke="' + TX2 + '" stroke-width="1.8"/>';
      s += txt(x + pw / 2, y0 + ph + 26, pw - 8, c.t, { fs:11.5, fw:800, fill:col });
      s += txt(x + pw / 2, y0 + ph + 66, pw - 6, c.d, { fs:10.8, fw:500, fill:TX2 });
    });
    s += '<line x1="760" y1="20" x2="784" y2="20" stroke="#D92D46" stroke-width="1.8" stroke-dasharray="5 4"/>' +
      '<text x="790" y="24" font-size="10.5" font-weight="700" fill="' + TX2 + '">especificación</text>' +
      '<line x1="898" y1="20" x2="922" y2="20" stroke="' + P1 + '" stroke-width="1.8"/>' +
      '<text x="928" y="24" font-size="10.5" font-weight="700" fill="' + TX2 + '">control</text>';
    return svg(W, H, s, 'Los cuatro escenarios de control y capacidad');
  }

  /* ═════════════════════════════════ 12 · NIVELES DE POKA YOKE ═══ */
  function pokaYoke(){
    const N = [
      { r:'I', t:'EVITAR', d:'El error no puede ocurrir. El sistema no deja guardar una cancelación sin motivo.', f:'El más fuerte', c:'#0A9E5C' },
      { r:'II', t:'PREVENIR', d:'El error se detecta antes de volverse defecto. Alerta si a 24 h no hay confirmación.', f:'Intermedio', c:'#E8890C' },
      { r:'III', t:'DETECTAR', d:'El defecto ya ocurrió pero no llega al cliente. Revisión al cierre del día.', f:'El más débil', c:'#D92D46' }
    ];
    const W = 1040, H = 220, bw = 320, gap = 30;
    let s = '<text x="20" y="24" font-size="12" font-weight="800" fill="' + TX3 + '" letter-spacing="1.4">' +
      'TRES NIVELES A PRUEBA DE ERRORES — SIEMPRE INTENTA SUBIR AL NIVEL I</text>';
    N.forEach((n, i) => {
      const x = 20 + i * (bw + gap), y = 44, bh = 130;
      s += caja(x, y, bw, bh, 10, 'var(--d2,#fff)', n.c, 2) +
        '<circle cx="' + (x + 34) + '" cy="' + (y + 32) + '" r="19" fill="' + n.c + '"/>' +
        '<text x="' + (x + 34) + '" y="' + (y + 38) + '" text-anchor="middle" font-size="14" font-weight="800" fill="#fff">' +
        n.r + '</text>' +
        '<text x="' + (x + 62) + '" y="' + (y + 30) + '" font-size="14" font-weight="800" fill="' + n.c + '" letter-spacing=".8">' +
        esc(n.t) + '</text>' +
        '<text x="' + (x + 62) + '" y="' + (y + 46) + '" font-size="10.5" font-weight="700" fill="' + TX3 + '">' +
        esc(n.f) + '</text>' +
        txt(x + bw / 2, y + 92, bw - 30, n.d, { fs:11.5, fw:500, fill:TX2 });
      if (i < N.length - 1)
        s += '<path d="M' + (x + bw + 6) + ' ' + (y + bh / 2) + ' h' + (gap - 12) +
             '" stroke="' + BD + '" stroke-width="2" marker-end="url(#igflecha)"/>';
    });
    s += '<text x="' + (W / 2) + '" y="' + (H - 12) + '" text-anchor="middle" font-size="11.5" font-weight="700" fill="' + TX2 + '">' +
      'Si tu solución sólo detecta, pregúntate qué haría falta para que el error ni siquiera pueda ocurrir.</text>';
    return svg(W, H, defs() + s, 'Los tres niveles de un dispositivo poka yoke');
  }

  /* ═══════════════════════ 13 · MAPA DE HERRAMIENTAS POR FASE ═══ */
  function mapaHerramientas(){
    const mods = FASES;
    return '<div class="ig-mapa">' + mods.map(m => {
      const ts = toolsOf(m.id);
      return '<section class="ig-col" style="--fc:' + m.color + '">' +
        '<header><span class="d">' + (ICO.fase[m.id] || m.letter) + '</span>' +
        '<h4>' + esc(m.name) + '</h4><small>' + ts.length + ' formatos</small></header>' +
        '<ol>' + ts.map(t => '<li><button class="ig-li" data-goto="' + t.id + '">' +
          esc(t.title) + (t.extra ? '<i>del manual</i>' : '') + '</button></li>').join('') + '</ol>' +
        '</section>';
    }).join('') + '</div>';
  }

  /* ════════════════════════════════════ 14 · FLUJO CONTINUO ═══ */
  function flujoContinuo(){
    const W = 1040, H = 226;
    const fila = (y, titulo, lotes, nota, color) => {
      let s = '<text x="20" y="' + (y - 12) + '" font-size="12" font-weight="800" fill="' + color + '" letter-spacing=".6">' +
        esc(titulo) + '</text>';
      let x = 210;
      lotes.forEach((g, gi) => {
        g.forEach((u, ui) => {
          s += '<rect x="' + (x + ui * 17) + '" y="' + y + '" width="14" height="26" rx="3" fill="' + color +
               '" opacity="' + (0.55 + ui * 0.12) + '"/>';
        });
        x += g.length * 17 + 10;
        if (gi < lotes.length - 1){
          s += '<path d="M' + (x - 4) + ' ' + (y + 13) + ' h16" stroke="' + BD + '" stroke-width="1.8" marker-end="url(#igflecha)"/>';
          x += 26;
        }
      });
      s += '<text x="' + (x + 16) + '" y="' + (y + 18) + '" font-size="11.5" font-weight="700" fill="' + TX2 + '">' +
        esc(nota) + '</text>';
      return s;
    };
    let s = '<text x="20" y="24" font-size="12" font-weight="800" fill="' + TX3 + '" letter-spacing="1.4">' +
      'POR QUÉ EL FLUJO DE UNA PIEZA ENTREGA ANTES QUE EL LOTE GRANDE</text>';
    s += fila(64, 'POR LOTES', [[1,1,1,1,1],[1,1,1,1,1],[1,1,1,1,1]], 'La primera unidad sale al final: 15 tiempos.', '#D92D46');
    s += fila(154, 'FLUJO CONTINUO', [[1],[1],[1]], 'La primera unidad sale casi de inmediato: 3 tiempos.', P3);
    return svg(W, H, defs() + s, 'Trabajo por lotes frente a flujo de una pieza');
  }

  /* ==================================================================
     MONTAJE sobre los capítulos de la guía
     ================================================================ */
  const EN = {
    'guia.inicio':             [{ pos:1, f:cicloDMAIC }, { pos:-1, f:mapaHerramientas }],
    'guia.que_es_lean':        [{ pos:1, f:desperdicios }, { pos:2, f:valorAgregado }, { pos:3, f:flujoContinuo }],
    'guia.que_es_six_sigma':   [{ pos:1, f:campanaSigma }, { pos:3, f:escaleraSigma }],
    'guia.lean_six_sigma':     [{ pos:1, f:rolesLSS }],
    'guia.que_es_dmaic':       [{ pos:1, f:cicloDMAIC }, { pos:2, f:cicloEstadistico }],
    'guia.seleccion_proyectos':[{ pos:1, f:embudoProyectos }],
    'guia.fase_analizar':      [{ pos:1, f:nivelesCausa }],
    'guia.fase_mejorar':       [{ pos:1, f:impactoEsfuerzo }, { pos:2, f:pokaYoke }],
    'guia.fase_controlar':     [{ pos:1, f:controlVsEspec }]
  };

  /** Inserta los bloques de infografía en los capítulos, sin tocar sus textos. */
  function montar(){
    Object.keys(EN).forEach(id => {
      const t = TOOL_BY_ID[id]; if (!t || t._ig) return;
      t._ig = true;
      // se insertan de atrás hacia adelante para que las posiciones no se corran
      EN[id].slice().sort((a, b) => (b.pos < 0 ? 1e9 : b.pos) - (a.pos < 0 ? 1e9 : a.pos)).forEach(x => {
        const blk = { type:'html', render: x.f, ig:true };
        if (x.pos < 0) t.blocks.push(blk);
        else t.blocks.splice(Math.min(x.pos, t.blocks.length), 0, blk);
      });
    });
  }

  return { montar, cicloDMAIC, desperdicios, valorAgregado, campanaSigma, escaleraSigma,
           rolesLSS, cicloEstadistico, embudoProyectos, nivelesCausa, impactoEsfuerzo,
           controlVsEspec, pokaYoke, mapaHerramientas, flujoContinuo };
})();
