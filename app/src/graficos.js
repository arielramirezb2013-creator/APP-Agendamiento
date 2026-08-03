/* ============================================================
   GRÁFICOS E INFOGRAFÍAS · SVG generado a mano
   Sin librerías. Sin CDN. Todo se dibuja aquí.
   Paleta: identidad Rehavid.
   ============================================================ */

const PAL = ['#4025CE','#02E577','#8478B2','#00A055','#6952DA','#B8770F','#B23B5C','#2A1788','#6FF0AC'];
const TINTA = '#1F1042', TINTA3 = '#5A4A95', TINTA4 = '#8478B2', LINEA = '#E5DFF6';

const esc = s => String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
const svgAbre = (w,h,extra='') =>
  `<svg viewBox="0 0 ${w} ${h}" style="width:100%;height:auto" role="img" ${extra}>`;

/* Envoltorio de figura con título, subtítulo y pie */
function figura(titulo, sub, cuerpo, pie, leyenda) {
  return `<figure>
    <div class="fig-titulo">${esc(titulo)}</div>
    ${sub ? `<div class="fig-sub">${esc(sub)}</div>` : ''}
    ${cuerpo}
    ${leyenda ? `<div class="leyenda">${leyenda}</div>` : ''}
    ${pie ? `<figcaption>${pie}</figcaption>` : ''}
  </figure>`;
}
const leyendaDe = pares => pares.map(([c,t]) =>
  `<span><i style="background:${c}"></i>${esc(t)}</span>`).join('');

/* ------------------------------------------------------------
   Barras horizontales
   datos: [[etiqueta, valor], ...]
   ------------------------------------------------------------ */
function barrasH(datos, opc = {}) {
  const anchoEtq = opc.anchoEtq || 190;
  const alturaFila = opc.alturaFila || 26;
  const W = 760, H = datos.length * alturaFila + 34;
  const max = Math.max(...datos.map(d => d[1]), 1);
  const x0 = anchoEtq, ancho = W - x0 - 58;
  let s = svgAbre(W, H);

  // rejilla
  for (let i = 0; i <= 4; i++) {
    const x = x0 + ancho * i / 4;
    s += `<line x1="${x}" y1="14" x2="${x}" y2="${H-20}" stroke="${LINEA}" stroke-width="1"/>`;
    s += `<text x="${x}" y="${H-7}" font-size="9.5" fill="${TINTA4}" text-anchor="middle">${Math.round(max*i/4)}</text>`;
  }
  datos.forEach((d, i) => {
    const y = 18 + i * alturaFila;
    const w = Math.max(ancho * d[1] / max, d[1] > 0 ? 2 : 0);
    const col = opc.color ? (typeof opc.color === 'function' ? opc.color(d, i) : opc.color) : PAL[0];
    s += `<text x="${x0-9}" y="${y+13}" font-size="11" fill="${TINTA}" text-anchor="end">${esc(d[0])}</text>`;
    s += `<rect x="${x0}" y="${y+3}" width="${w}" height="${alturaFila-11}" fill="${col}" rx="1"><title>${esc(d[0])}: ${d[1]}</title></rect>`;
    s += `<text x="${x0+w+7}" y="${y+13}" font-size="10.5" fill="${TINTA3}" font-weight="600">${d[1]}</text>`;
  });
  return s + '</svg>';
}

/* ------------------------------------------------------------
   Barras verticales apiladas
   series: [{nombre, color, valores:[]}]  cats: []
   ------------------------------------------------------------ */
function barrasApiladas(cats, series, opc = {}) {
  const W = 760, H = opc.alto || 300;
  const mIzq = 46, mDer = 14, mSup = 14, mInf = 46;
  const ancho = W - mIzq - mDer, alto = H - mSup - mInf;
  const totales = cats.map((_, i) => series.reduce((a, s) => a + (s.valores[i] || 0), 0));
  const max = Math.max(...totales, 1);
  const paso = ancho / cats.length, bw = Math.min(paso * 0.62, 54);
  let s = svgAbre(W, H);

  for (let i = 0; i <= 4; i++) {
    const y = mSup + alto - alto * i / 4;
    s += `<line x1="${mIzq}" y1="${y}" x2="${W-mDer}" y2="${y}" stroke="${LINEA}"/>`;
    s += `<text x="${mIzq-7}" y="${y+3.5}" font-size="9.5" fill="${TINTA4}" text-anchor="end">${fmt(max*i/4)}</text>`;
  }
  cats.forEach((c, i) => {
    const cx = mIzq + paso * i + paso / 2;
    let acum = 0;
    series.forEach(se => {
      const v = se.valores[i] || 0;
      if (!v) return;
      const h = alto * v / max;
      const y = mSup + alto - alto * acum / max - h;
      s += `<rect x="${cx-bw/2}" y="${y}" width="${bw}" height="${h}" fill="${se.color}"><title>${esc(c)} · ${esc(se.nombre)}: ${fmt(v)}</title></rect>`;
      acum += v;
    });
    s += `<text x="${cx}" y="${H-28}" font-size="10" fill="${TINTA3}" text-anchor="middle">${esc(c)}</text>`;
  });
  return s + '</svg>';
}

/* ------------------------------------------------------------
   Línea con umbral (DSCR por periodo)
   ------------------------------------------------------------ */
function lineaUmbral(cats, valores, umbral, opc = {}) {
  const W = 760, H = opc.alto || 270;
  const mIzq = 48, mDer = 16, mSup = 16, mInf = 42;
  const ancho = W - mIzq - mDer, alto = H - mSup - mInf;
  const validos = valores.filter(v => v !== null && isFinite(v));
  const max = Math.max(...validos, umbral || 0, 1) * 1.18;
  const paso = valores.length > 1 ? ancho / (valores.length - 1) : ancho;
  const X = i => mIzq + paso * i;
  const Y = v => mSup + alto - alto * v / max;
  let s = svgAbre(W, H);

  for (let i = 0; i <= 4; i++) {
    const y = mSup + alto - alto * i / 4;
    s += `<line x1="${mIzq}" y1="${y}" x2="${W-mDer}" y2="${y}" stroke="${LINEA}"/>`;
    s += `<text x="${mIzq-7}" y="${y+3.5}" font-size="9.5" fill="${TINTA4}" text-anchor="end">${(max*i/4).toFixed(2)}</text>`;
  }
  if (umbral != null) {
    const yu = Y(umbral);
    s += `<line x1="${mIzq}" y1="${yu}" x2="${W-mDer}" y2="${yu}" stroke="#B23B5C" stroke-width="1.4" stroke-dasharray="5 3"/>`;
    s += `<text x="${W-mDer}" y="${yu-5}" font-size="10" fill="#B23B5C" text-anchor="end" font-weight="600">covenant ${umbral.toFixed(2)}</text>`;
  }
  // trazo, saltando los no calculables
  let d = '', abierto = false;
  valores.forEach((v, i) => {
    if (v === null || !isFinite(v)) { abierto = false; return; }
    d += (abierto ? 'L' : 'M') + X(i) + ' ' + Y(v) + ' ';
    abierto = true;
  });
  s += `<path d="${d}" fill="none" stroke="${PAL[0]}" stroke-width="2" stroke-linejoin="round"/>`;
  valores.forEach((v, i) => {
    if (v === null || !isFinite(v)) {
      s += `<text x="${X(i)}" y="${mSup+alto-6}" font-size="8.5" fill="${TINTA4}" text-anchor="middle">n/c</text>`;
      return;
    }
    const rompe = umbral != null && v < umbral;
    s += `<circle cx="${X(i)}" cy="${Y(v)}" r="3.6" fill="${rompe ? '#B23B5C' : PAL[0]}" stroke="#fff" stroke-width="1.4"><title>${esc(cats[i])}: ${v.toFixed(2)}</title></circle>`;
  });
  cats.forEach((c, i) => {
    if (cats.length > 14 && i % 2) return;
    s += `<text x="${X(i)}" y="${H-24}" font-size="9.5" fill="${TINTA3}" text-anchor="middle">${esc(c)}</text>`;
  });
  return s + '</svg>';
}

/* ------------------------------------------------------------
   Área de caja con línea de mínimo
   ------------------------------------------------------------ */
function areaLiquidez(cats, caja, minimo, opc = {}) {
  const W = 760, H = opc.alto || 260;
  const mIzq = 60, mDer = 16, mSup = 16, mInf = 42;
  const ancho = W - mIzq - mDer, alto = H - mSup - mInf;
  const todos = caja.concat(minimo);
  const max = Math.max(...todos, 0) * 1.15;
  const min = Math.min(...todos, 0) * 1.15;
  const rango = (max - min) || 1;
  const paso = caja.length > 1 ? ancho / (caja.length - 1) : ancho;
  const X = i => mIzq + paso * i;
  const Y = v => mSup + alto - alto * (v - min) / rango;
  let s = svgAbre(W, H);

  for (let i = 0; i <= 4; i++) {
    const val = min + rango * i / 4, y = Y(val);
    s += `<line x1="${mIzq}" y1="${y}" x2="${W-mDer}" y2="${y}" stroke="${LINEA}"/>`;
    s += `<text x="${mIzq-7}" y="${y+3.5}" font-size="9.5" fill="${TINTA4}" text-anchor="end">${fmt(val)}</text>`;
  }
  const y0 = Y(0);
  s += `<line x1="${mIzq}" y1="${y0}" x2="${W-mDer}" y2="${y0}" stroke="${TINTA4}" stroke-width="1"/>`;

  let area = `M ${X(0)} ${y0} `;
  caja.forEach((v, i) => { area += `L ${X(i)} ${Y(v)} `; });
  area += `L ${X(caja.length-1)} ${y0} Z`;
  s += `<path d="${area}" fill="${PAL[0]}" opacity="0.13"/>`;
  let d = '';
  caja.forEach((v, i) => { d += (i ? 'L' : 'M') + X(i) + ' ' + Y(v) + ' '; });
  s += `<path d="${d}" fill="none" stroke="${PAL[0]}" stroke-width="2"/>`;
  let dm = '';
  minimo.forEach((v, i) => { dm += (i ? 'L' : 'M') + X(i) + ' ' + Y(v) + ' '; });
  s += `<path d="${dm}" fill="none" stroke="#B23B5C" stroke-width="1.4" stroke-dasharray="5 3"/>`;

  caja.forEach((v, i) => {
    const falla = v < minimo[i];
    s += `<circle cx="${X(i)}" cy="${Y(v)}" r="3.4" fill="${falla ? '#B23B5C' : PAL[0]}" stroke="#fff" stroke-width="1.3"><title>${esc(cats[i])}: ${fmt(v)}</title></circle>`;
  });
  cats.forEach((c, i) => {
    if (cats.length > 14 && i % 2) return;
    s += `<text x="${X(i)}" y="${H-24}" font-size="9.5" fill="${TINTA3}" text-anchor="middle">${esc(c)}</text>`;
  });
  return s + '</svg>';
}

/* ------------------------------------------------------------
   Anillo de proporciones
   ------------------------------------------------------------ */
function anillo(datos, opc = {}) {
  const W = 300, H = 300, cx = 150, cy = 150, r = 108, gr = 34;
  const total = datos.reduce((a, d) => a + d[1], 0) || 1;
  let ang = -Math.PI / 2;
  let s = svgAbre(W, H);
  datos.forEach((d, i) => {
    const frac = d[1] / total, delta = frac * Math.PI * 2;
    const x1 = cx + r*Math.cos(ang), y1 = cy + r*Math.sin(ang);
    const x2 = cx + r*Math.cos(ang+delta), y2 = cy + r*Math.sin(ang+delta);
    const ri = r - gr;
    const x3 = cx + ri*Math.cos(ang+delta), y3 = cy + ri*Math.sin(ang+delta);
    const x4 = cx + ri*Math.cos(ang), y4 = cy + ri*Math.sin(ang);
    const grande = delta > Math.PI ? 1 : 0;
    s += `<path d="M${x1} ${y1} A${r} ${r} 0 ${grande} 1 ${x2} ${y2} L${x3} ${y3} A${ri} ${ri} 0 ${grande} 0 ${x4} ${y4} Z" fill="${PAL[i%PAL.length]}"><title>${esc(d[0])}: ${d[1]} (${(frac*100).toFixed(1)}%)</title></path>`;
    if (frac > 0.06) {
      const am = ang + delta/2, rm = r - gr/2;
      s += `<text x="${cx+rm*Math.cos(am)}" y="${cy+rm*Math.sin(am)+4}" font-size="12" font-weight="700" fill="#fff" text-anchor="middle">${d[1]}</text>`;
    }
    ang += delta;
  });
  s += `<text x="${cx}" y="${cy-4}" font-size="30" font-weight="800" fill="${TINTA}" text-anchor="middle">${total}</text>`;
  s += `<text x="${cx}" y="${cy+16}" font-size="10.5" fill="${TINTA4}" text-anchor="middle">${esc(opc.centro||'total')}</text>`;
  return s + '</svg>';
}

/* ------------------------------------------------------------
   INFOGRAFÍA · Ciclo del producto
   ------------------------------------------------------------ */
function infoCiclo(pasos) {
  const W = 700, H = 480, cx = 350, cy = 232, R = 168;
  let s = svgAbre(W, H);
  s += `<circle cx="${cx}" cy="${cy}" r="${R}" fill="none" stroke="${LINEA}" stroke-width="26"/>`;
  s += `<circle cx="${cx}" cy="${cy}" r="86" fill="#FBFAFE" stroke="${LINEA}"/>`;
  s += `<text x="${cx}" y="${cy-8}" font-size="15" font-weight="800" fill="${PAL[0]}" text-anchor="middle">CICLO</text>`;
  s += `<text x="${cx}" y="${cy+11}" font-size="11.5" fill="${TINTA3}" text-anchor="middle">del producto</text>`;
  s += `<text x="${cx}" y="${cy+29}" font-size="9.5" fill="${TINTA4}" text-anchor="middle">§3 del documento</text>`;

  const n = pasos.length;
  pasos.forEach((p, i) => {
    const a = -Math.PI/2 + (i / n) * Math.PI * 2;
    const x = cx + R*Math.cos(a), y = cy + R*Math.sin(a);
    const col = PAL[i % 2 === 0 ? 0 : 1];
    s += `<circle cx="${x}" cy="${y}" r="25" fill="${col}" stroke="#fff" stroke-width="3"/>`;
    s += `<text x="${x}" y="${y+5}" font-size="13" font-weight="800" fill="${i%2===0?'#fff':'#0B3D24'}" text-anchor="middle">${i+1}</text>`;
    const rt = R + 46;
    const tx = cx + rt*Math.cos(a), ty = cy + rt*Math.sin(a);
    const anc = Math.abs(Math.cos(a)) < 0.34 ? 'middle' : (Math.cos(a) > 0 ? 'start' : 'end');
    s += `<text x="${tx}" y="${ty+4}" font-size="12" font-weight="600" fill="${TINTA}" text-anchor="${anc}">${esc(p)}</text>`;
    // flecha al siguiente
    const a2 = -Math.PI/2 + ((i+0.5) / n) * Math.PI * 2;
    const fx = cx + R*Math.cos(a2), fy = cy + R*Math.sin(a2);
    s += `<circle cx="${fx}" cy="${fy}" r="2.6" fill="${TINTA4}"/>`;
  });
  return s + '</svg>';
}

/* ------------------------------------------------------------
   INFOGRAFÍA · Capas de arquitectura con sus componentes
   ------------------------------------------------------------ */
function infoCapas(capas, componentes) {
  const filaH = 74, W = 760, H = capas.length * filaH + 16;
  let s = svgAbre(W, H);
  capas.forEach(([nombre, detalle], i) => {
    const y = i * filaH + 8;
    const col = PAL[i % PAL.length];
    s += `<rect x="0" y="${y}" width="${W}" height="${filaH-10}" fill="#FBFAFE" stroke="${LINEA}" rx="2"/>`;
    s += `<rect x="0" y="${y}" width="5" height="${filaH-10}" fill="${col}"/>`;
    s += `<text x="18" y="${y+24}" font-size="13.5" font-weight="700" fill="${TINTA}">${esc(nombre)}</text>`;
    const mios = componentes.filter(c => c[3] === nombre);
    let x = 18;
    mios.forEach(c => {
      const w = 8.2 * c[1].length + 52;   // hueco para el código más el nombre
      s += `<rect x="${x}" y="${y+34}" width="${w}" height="22" fill="${col}" opacity="0.13" rx="2" stroke="${col}" stroke-opacity="0.35"/>`;
      s += `<text x="${x+9}" y="${y+49}" font-size="9.5" font-weight="700" fill="${col}">${esc(c[0])}</text>`;
      s += `<text x="${x+47}" y="${y+49}" font-size="10.5" fill="${TINTA}">${esc(c[1])}</text>`;
      x += w + 7;
    });
    if (!mios.length) {
      s += `<text x="18" y="${y+49}" font-size="10.5" fill="${TINTA4}">${esc(detalle)}</text>`;
    }
  });
  return s + '</svg>';
}

/* ------------------------------------------------------------
   INFOGRAFÍA · Flujo de estados
   ------------------------------------------------------------ */
function infoEstados(estados) {
  const W = 760, H = 260;
  const pos = [[62,60],[242,60],[422,60],[602,60],[422,175],[602,175],[242,175]];
  const cols = [PAL[2],PAL[0],PAL[0],PAL[5],PAL[1],PAL[2],PAL[2]];
  const flechas = [[0,1],[1,2],[2,3],[2,4],[4,1],[3,5],[3,6],[5,6]];
  let s = svgAbre(W, H);
  s += `<defs><marker id="pf" markerWidth="7" markerHeight="7" refX="6" refY="3.5" orient="auto">
    <path d="M0 0 L7 3.5 L0 7 z" fill="${TINTA4}"/></marker></defs>`;
  flechas.forEach(([a,b]) => {
    const [x1,y1] = pos[a], [x2,y2] = pos[b];
    const dx = x2-x1, dy = y2-y1, L = Math.hypot(dx,dy);
    const rx = 66, ry = 20;
    const ux = dx/L, uy = dy/L;
    const sx = x1 + ux*(Math.abs(ux)>0.5?rx:ry), sy = y1 + uy*(Math.abs(ux)>0.5?ry:ry+4);
    const ex = x2 - ux*(Math.abs(ux)>0.5?rx+8:ry+8), ey = y2 - uy*(Math.abs(ux)>0.5?ry:ry+12);
    s += `<line x1="${sx}" y1="${sy}" x2="${ex}" y2="${ey}" stroke="${TINTA4}" stroke-width="1.3" marker-end="url(#pf)" opacity="0.75"/>`;
  });
  estados.forEach(([nombre, regla], i) => {
    const [x,y] = pos[i], c = cols[i];
    s += `<rect x="${x-66}" y="${y-21}" width="132" height="42" rx="2" fill="#fff" stroke="${c}" stroke-width="1.6"/>`;
    s += `<rect x="${x-66}" y="${y-21}" width="132" height="4" fill="${c}"/>`;
    s += `<text x="${x}" y="${y+2}" font-size="11" font-weight="700" fill="${TINTA}" text-anchor="middle">${esc(nombre)}</text>`;
    s += `<text x="${x}" y="${y+15}" font-size="8.5" fill="${TINTA4}" text-anchor="middle">${esc(regla.slice(0,30))}</text>`;
  });
  return s + '</svg>';
}

/* ------------------------------------------------------------
   INFOGRAFÍA · Ruta formativa U1..U8
   ------------------------------------------------------------ */
function infoRuta(unidades) {
  const W = 760, cajaH = 62, H = unidades.length * cajaH + 20;
  let s = svgAbre(W, H);
  unidades.forEach((u, i) => {
    const y = 10 + i * cajaH;
    const col = i < 1 ? PAL[2] : (i < 5 ? PAL[0] : (i < 7 ? PAL[1] : PAL[4]));
    s += `<line x1="34" y1="${y+30}" x2="34" y2="${y + (i<unidades.length-1?cajaH+30:30)}" stroke="${LINEA}" stroke-width="2"/>`;
    s += `<circle cx="34" cy="${y+26}" r="17" fill="${col}"/>`;
    s += `<text x="34" y="${y+31}" font-size="12" font-weight="800" fill="${col===PAL[1]?'#0B3D24':'#fff'}" text-anchor="middle">${u.codigo}</text>`;
    s += `<text x="64" y="${y+21}" font-size="13" font-weight="700" fill="${TINTA}">${esc(u.titulo)}</text>`;
    const comp = u.competencia.length > 108 ? u.competencia.slice(0,105) + '…' : u.competencia;
    s += `<text x="64" y="${y+37}" font-size="10.5" fill="${TINTA3}">${esc(comp)}</text>`;
    s += `<text x="64" y="${y+51}" font-size="9.5" fill="${TINTA4}">→ ${esc(u.aplicacion.slice(0,88))}</text>`;
  });
  return s + '</svg>';
}

/* ------------------------------------------------------------
   Matriz de riesgos por dominio
   ------------------------------------------------------------ */
function matrizRiesgos(riesgos) {
  const dominios = [...new Set(riesgos.map(r => r[3]))];
  const W = 760, filaH = 30, H = riesgos.length * filaH + 42;
  let s = svgAbre(W, H);
  s += `<text x="0" y="12" font-size="9.5" font-weight="700" fill="${TINTA4}">RIESGO</text>`;
  s += `<text x="300" y="12" font-size="9.5" font-weight="700" fill="${TINTA4}">EFECTO</text>`;
  s += `<text x="560" y="12" font-size="9.5" font-weight="700" fill="${TINTA4}">CONTROL DEFINIDO</text>`;
  riesgos.forEach((r, i) => {
    const y = 22 + i * filaH;
    const ci = dominios.indexOf(r[3]);
    const col = PAL[ci % PAL.length];
    if (i % 2 === 0) s += `<rect x="0" y="${y}" width="${W}" height="${filaH}" fill="#FBFAFE"/>`;
    s += `<rect x="0" y="${y+6}" width="3" height="${filaH-12}" fill="${col}"/>`;
    s += `<text x="11" y="${y+19}" font-size="10.5" font-weight="650" fill="${TINTA}">${esc(r[0])}</text>`;
    s += `<text x="300" y="${y+19}" font-size="9.5" fill="${TINTA3}">${esc(r[1].slice(0,44))}</text>`;
    s += `<text x="560" y="${y+19}" font-size="9.5" fill="${TINTA3}">${esc(r[2].slice(0,38))}</text>`;
  });
  return s + '</svg>';
}

/* ------------------------------------------------------------
   Base probatoria: segundos citados frente a lo derivado
   ------------------------------------------------------------ */
function infoBaseProbatoria(fuentes) {
  const W = 760, H = 210;
  const trans = fuentes.filter(f => f[3] === 'Transcripción');
  const total = trans.reduce((a, f) => a + f[5], 0);
  let s = svgAbre(W, H);
  s += `<text x="0" y="14" font-size="10.5" font-weight="700" fill="${TINTA4}">SEGMENTOS CITADOS DE LA TRANSCRIPCIÓN</text>`;
  const escalaX = 640 / 186;   // el rango declarado dura 186 s
  s += `<rect x="0" y="26" width="${186*escalaX}" height="26" fill="${LINEA}" rx="2"/>`;
  s += `<text x="${186*escalaX+9}" y="44" font-size="10" fill="${TINTA4}">186 s declarados</text>`;
  const inicios = [0, 52, 120];  // 02:10:14 = 0 s, 02:11:06 = 52 s, 02:12:14 = 120 s
  trans.forEach((f, i) => {
    const x = inicios[i] * escalaX, w = f[5] * escalaX;
    s += `<rect x="${x}" y="26" width="${w}" height="26" fill="${PAL[0]}" rx="2"><title>${esc(f[0])}: ${f[5]} s</title></rect>`;
    s += `<text x="${x+w/2}" y="${43}" font-size="9.5" font-weight="700" fill="#fff" text-anchor="middle">${f[5]}s</text>`;
    s += `<text x="${x+w/2}" y="${66}" font-size="9" fill="${TINTA4}" text-anchor="middle">${esc(f[0])}</text>`;
  });
  s += `<text x="0" y="96" font-size="11.5" fill="${TINTA}">De esos <tspan font-weight="800" fill="${PAL[0]}">${total} segundos</tspan> se derivan:</text>`;
  const items = [['32','requisitos funcionales'],['14','no funcionales'],['8','unidades formativas'],['16','casos de prueba']];
  items.forEach(([n, t], i) => {
    const x = i * 190;
    s += `<rect x="${x}" y="112" width="176" height="62" fill="#FBFAFE" stroke="${LINEA}" rx="2"/>`;
    s += `<text x="${x+14}" y="146" font-size="26" font-weight="800" fill="${PAL[0]}">${n}</text>`;
    s += `<text x="${x+14}" y="162" font-size="10" fill="${TINTA3}">${esc(t)}</text>`;
  });
  s += `<text x="0" y="196" font-size="9.5" fill="${TINTA4}">Cálculo: 34 s + 30 s + 66 s. El rango declarado 02:10:14–02:13:20 abarca 186 s; 56 s no están citados.</text>`;
  return s + '</svg>';
}

/* Formato numérico compacto */
function fmt(v) {
  if (v === null || v === undefined || !isFinite(v)) return '—';
  const a = Math.abs(v);
  if (a >= 1e9) return (v/1e9).toFixed(1).replace('.',',') + ' MM';
  if (a >= 1e6) return (v/1e6).toFixed(1).replace('.',',') + ' M';
  if (a >= 1e3) return Math.round(v/1e3).toLocaleString('es-CO') + ' k';
  return Math.round(v).toLocaleString('es-CO');
}
function fmtN(v, d = 2) {
  if (v === null || v === undefined || !isFinite(v)) return 'No calculable';
  return v.toFixed(d).replace('.', ',');
}
