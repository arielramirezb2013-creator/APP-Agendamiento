/* ============ Visor de los documentos sintéticos: hojas de papel y figuras ============
   docHtml(doc, opc) pinta un documento de src/docs/ (formato en src/docs/FORMATO.md) como una o varias hojas
   de papel; docFigura(fig) dibuja sus figuras en SVG en línea: audiograma, espirometría, resonancia de columna,
   radiografía de tórax con lectura OIT, neuroconducción y series.
   · Todo texto variable pasa por esc(). Ningún atributo id: varios documentos pueden estar en la misma página.
   · Sin azar ni fechas: lo que parece variable (el código de verificación de la firma, la posición de las
     opacidades de la radiografía) se deriva del contenido, de modo que el mismo documento se pinta igual.
   · opc.visible(i) decide qué campos de la ruta están a la vista. Lo que no lo está se tacha y su valor no
     viaja en el HTML: ni en el texto, ni en etiquetas accesibles, ni en las figuras.
   · Colores explícitos: la hoja conserva el aspecto de papel aunque la interfaz esté en modo oscuro. */
const docR = (function () {
  const MARCA = "DOCUMENTO SINTÉTICO · SIMULACIÓN ACADÉMICA";
  const PIE = "Documento sintético para simulación académica. No corresponde a ninguna persona ni lo expidió la entidad que figura como emisora.";
  const ROTULO_IMG = "Esquema sintético dibujado a partir de los hallazgos; no es una imagen diagnóstica real.";
  const FUENTE = "Arial, Helvetica, sans-serif";

  /* ---------- Números y texto ---------- */
  const esNum = v => typeof v === "number" && isFinite(v);
  function decs(v) { if (!esNum(v)) return 0; for (let d = 0; d <= 3; d++) { const m = v * Math.pow(10, d); if (Math.abs(Math.round(m) - m) < 1e-6) return d; } return 3; }
  const decsDe = vs => vs.reduce((m, v) => Math.max(m, decs(v)), 0);
  // Formato colombiano: punto de miles y coma decimal; el signo menos es el tipográfico.
  function fmt(v, dec) {
    if (!esNum(v)) return "—";
    const d = dec == null ? decs(v) : dec, s = Math.abs(v).toFixed(d).split(".");
    return (v < 0 && Number(s.join(".")) !== 0 ? "−" : "") + s[0].replace(/\B(?=(\d{3})+(?!\d))/g, ".") + (s[1] ? "," + s[1] : "");
  }
  const pesos = v => "$" + fmt(Math.round(v), 0);
  const val = v => esNum(v) ? fmt(v) : String(v == null ? "" : v);
  const txt = v => esc(val(v)).replace(/\n/g, "<br>");
  const r1 = v => Math.round(v * 10) / 10;
  const ancho = (s, f) => String(s).length * f * 0.56;   // ancho aproximado de un texto en Arial

  /* ---------- Huellas deterministas ---------- */
  function hash(s, semilla) { let h = ((semilla || 0) ^ 0x811c9dc5) >>> 0; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 0x01000193); } return h >>> 0; }
  function azar(semilla) { let a = semilla >>> 0; return () => { a = (a + 0x6D2B79F5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
  const cuatro = h => String(h % 10000).padStart(4, "0");
  const codigo = (huella, que) => "SIM-FE-" + [1, 2, 3].map(k => cuatro(hash(huella + "|" + que, k))).join("-");

  /* ---------- SVG ---------- */
  function svg(w, h, etiqueta, cls, cuerpo) {
    return `<svg class="doc-svg${cls ? " " + cls : ""}" viewBox="0 0 ${w} ${h}" width="100%" role="img" aria-label="${esc(etiqueta)}" xmlns="http://www.w3.org/2000/svg" font-family="${FUENTE}">${cuerpo}</svg>`;
  }
  const tx = (x, y, s, a) => `<text x="${r1(x)}" y="${r1(y)}"${a ? " " + a : ""}>${esc(s)}</text>`;
  const ln = (x1, y1, x2, y2, c, w, a) => `<line x1="${r1(x1)}" y1="${r1(y1)}" x2="${r1(x2)}" y2="${r1(y2)}" stroke="${c}" stroke-width="${w}"${a ? " " + a : ""}/>`;
  const poli = pts => pts.map(p => r1(p[0]) + "," + r1(p[1])).join(" ");
  // Curva suave (Catmull-Rom) por una lista de puntos.
  function suave(pts, cerrada) {
    if (pts.length < 3) return "M" + poli(pts).replace(/ /g, " L");
    const P = cerrada ? [pts[pts.length - 1]].concat(pts, [pts[0], pts[1]]) : [pts[0]].concat(pts, [pts[pts.length - 1]]);
    let d = "M" + r1(P[1][0]) + "," + r1(P[1][1]);
    for (let i = 1; i < P.length - 2; i++) {
      const p0 = P[i - 1], p1 = P[i], p2 = P[i + 1], p3 = P[i + 2];
      d += " C" + r1(p1[0] + (p2[0] - p0[0]) / 6) + "," + r1(p1[1] + (p2[1] - p0[1]) / 6) + " " + r1(p2[0] - (p3[0] - p1[0]) / 6) + "," + r1(p2[1] - (p3[1] - p1[1]) / 6) + " " + r1(p2[0]) + "," + r1(p2[1]);
    }
    return d + (cerrada ? " Z" : "");
  }
  // Marcas de eje «redondas» (1, 2, 5 × 10^k).
  function paso(rango, n) {
    const bruto = rango / (n || 5), e = Math.pow(10, Math.floor(Math.log10(bruto || 1))), f = bruto / e;
    return (f <= 1 ? 1 : f <= 2 ? 2 : f <= 5 ? 5 : 10) * e;
  }
  function tablaFig(cols, filas, cls) {
    return `<div class="doc-tabla doc-tabla-fig"><table${cls ? ` class="${cls}"` : ""}><thead><tr>${cols.map(c => `<th scope="col">${c}</th>`).join("")}</tr></thead><tbody>${filas.map(f => `<tr>${f.map(c => `<td>${c}</td>`).join("")}</tr>`).join("")}</tbody></table></div>`;
  }

  /* =====================================================================================================
     Audiograma: frecuencias en escala logarítmica arriba, dB HL de −10 a 120 hacia abajo, franja normal
     hasta 25 dB; oído derecho con círculos rojos unidos por línea continua, izquierdo con equis azules y
     línea discontinua (vía ósea: < y >, sin unir).
     ===================================================================================================== */
  const ROJO = "#c62828", AZUL = "#1f4fbf";
  function audiograma(d) {
    const W = 360, H = 356, L = 50, R = 348, T = 46, B = 304;
    const fx = f => L + 16 + (R - L - 32) * Math.log2(f / 250) / 5;
    const dy = db => T + (B - T) * (Math.max(-10, Math.min(120, db)) + 10) / 130;
    const osea = /[óo]sea/i.test(d.via || ""), via = osea ? "vía ósea" : "vía aérea";
    const frecs = v => Object.keys(v || {}).map(Number).filter(f => f >= 250 && f <= 8000 && esNum(v[f])).sort((a, b) => a - b);
    let g = `<rect x="0" y="0" width="${W}" height="${H}" fill="#ffffff"/>`;
    g += `<rect x="${L}" y="${dy(-10)}" width="${R - L}" height="${r1(dy(25) - dy(-10))}" fill="#e2f1e6"/>`;
    for (let db = -10; db <= 120; db += 10) {
      g += ln(L, dy(db), R, dy(db), db === 0 ? "#7c8591" : "#d4d9df", db === 0 ? 1.1 : 0.8);
      g += tx(L - 6, dy(db) + 3.6, db < 0 ? "−" + Math.abs(db) : String(db), 'font-size="10.5" text-anchor="end" fill="#39404a"');
    }
    [250, 500, 1000, 2000, 3000, 4000, 6000, 8000].forEach(f => {
      const media = f === 3000 || f === 6000;
      g += ln(fx(f), T, fx(f), B, media ? "#c3c9d1" : "#bfc6ce", media ? 0.8 : 1, media ? 'stroke-dasharray="3 3"' : "");
      g += media ? tx(fx(f), T - 5, String(f), 'font-size="8.5" text-anchor="middle" fill="#6a717b"') : tx(fx(f), T - 16, String(f), 'font-size="10.5" text-anchor="middle" fill="#39404a"');
    });
    g += `<rect x="${L}" y="${T}" width="${R - L}" height="${B - T}" fill="none" stroke="#59616c" stroke-width="1"/>`;
    g += tx((L + R) / 2, 13, "Frecuencia (Hz)", 'font-size="10.5" text-anchor="middle" font-weight="bold" fill="#2a3039"');
    g += `<text transform="translate(13 ${r1((T + B) / 2)}) rotate(-90)" font-size="10.5" text-anchor="middle" font-weight="bold" fill="#2a3039">Nivel de audición (dB HL)</text>`;
    g += tx(R - 5, dy(25) - 4, "Audición normal: hasta 25 dB HL", 'font-size="9" text-anchor="end" fill="#2e6b45"');
    const simbolo = (x, y, oido) => {
      if (osea) return oido === "od" ? `<path d="M${r1(x - 1)},${r1(y - 6)} L${r1(x - 7)},${r1(y)} L${r1(x - 1)},${r1(y + 6)}" fill="none" stroke="${ROJO}" stroke-width="2"/>` : `<path d="M${r1(x + 1)},${r1(y - 6)} L${r1(x + 7)},${r1(y)} L${r1(x + 1)},${r1(y + 6)}" fill="none" stroke="${AZUL}" stroke-width="2"/>`;
      return oido === "od" ? `<circle cx="${r1(x)}" cy="${r1(y)}" r="5" fill="#ffffff" stroke="${ROJO}" stroke-width="1.9"/>` : ln(x - 4.6, y - 4.6, x + 4.6, y + 4.6, AZUL, 2.1) + ln(x - 4.6, y + 4.6, x + 4.6, y - 4.6, AZUL, 2.1);
    };
    ["oi", "od"].forEach(o => {
      const v = d[o], fs = frecs(v), pts = fs.map(f => [fx(f), dy(v[f])]);
      if (!osea && pts.length > 1) g += `<polyline points="${poli(pts)}" fill="none" stroke="${o === "od" ? ROJO : AZUL}" stroke-width="1.7"${o === "oi" ? ' stroke-dasharray="5 3"' : ""}/>`;
      pts.forEach(p => { g += simbolo(p[0], p[1], o); });
    });
    const ly = B + 30;
    g += simbolo(L + 8, ly - 4, "od") + tx(L + 20, ly, "Oído derecho", 'font-size="10.5" fill="#2a3039"');
    g += simbolo(L + 128, ly - 4, "oi") + tx(L + 140, ly, "Oído izquierdo", 'font-size="10.5" fill="#2a3039"');
    g += tx(R, ly, via.charAt(0).toUpperCase() + via.slice(1), 'font-size="10.5" text-anchor="end" fill="#59616c"');
    const lista = o => frecs(d[o]).map(f => f + " Hz " + fmt(d[o][f]) + " dB").join(", ");
    const etiqueta = "Audiograma, " + via + ", umbrales en dB HL. Oído derecho: " + (lista("od") || "sin datos") + ". Oído izquierdo: " + (lista("oi") || "sin datos") + ". Franja de audición normal hasta 25 dB HL.";
    const todas = frecs(d.od).concat(frecs(d.oi)).filter((f, i, a) => a.indexOf(f) === i).sort((a, b) => a - b);
    const celda = (o, f) => esNum((d[o] || {})[f]) ? esc(fmt(d[o][f])) : "—";
    const tabla = tablaFig(["Umbral (dB HL)"].concat(todas.map(f => esc(String(f)) + " Hz")), [["Oído derecho"].concat(todas.map(f => celda("od", f))), ["Oído izquierdo"].concat(todas.map(f => celda("oi", f)))], "doc-t-num");
    return { titulo:"Audiograma tonal · " + via, html:svg(W, H, etiqueta, "doc-svg-audiograma", g) + tabla };
  }

  /* =====================================================================================================
     Espirometría: curva flujo-volumen (medida continua, predicha discontinua) y curva volumen-tiempo,
     calculadas con CVF, VEF1 y FEP. La rama espiratoria cambia de forma con el patrón: restrictivo,
     pequeña pero proporcionada; obstructivo, cóncava («excavada»).
     ===================================================================================================== */
  const FORMA_FV = {
    normal:{ sube:0.11, f:u => 1 - Math.pow(u, 1.25) },
    restrictivo:{ sube:0.13, f:u => 1 - Math.pow(u, 1.7) },
    obstructivo:{ sube:0.075, f:u => Math.pow(1 - u, 2.4) },
    mixto:{ sube:0.085, f:u => Math.pow(1 - u, 2.0) }
  };
  function lazo(V, P, fm) {
    const pts = [[0, 0]], vp = V * fm.sube, N = 50, I = P * 0.66;
    for (let k = 1; k <= 8; k++) { const s = k / 8; pts.push([vp * s, P * (1 - Math.pow(1 - s, 2.2))]); }
    for (let k = 1; k <= N; k++) { const u = k / N; pts.push([vp + (V - vp) * u, P * fm.f(u)]); }
    for (let k = 1; k <= N; k++) { const u = k / N; pts.push([V * (1 - u), -I * Math.pow(Math.sin(Math.PI * u), 0.7)]); }
    return pts;
  }
  // k tal que v(t) = V·(1 − e^(−kt)) / (1 − e^(−kT)) dé v(1) = VEF1 y v(T) = CVF.
  function kDe(r, T) { let lo = 0.005, hi = 14; for (let i = 0; i < 60; i++) { const m = (lo + hi) / 2, v = (1 - Math.exp(-m)) / (1 - Math.exp(-m * T)); if (v < r) lo = m; else hi = m; } return (lo + hi) / 2; }
  function espirometria(d) {
    const fvc = d.fvc, fvcP = d.fvcPred, fev1 = d.fev1, fev1P = d.fev1Pred;
    const hayPef = esNum(d.pef), hayPefP = esNum(d.pefPred);
    const pef = hayPef ? d.pef : fev1 * 2.7, pefP = hayPefP ? d.pefPred : fev1P * 2.7;
    const ratio = fev1 / fvc, ratioP = fev1P / fvcP, pctF = fvc / fvcP;
    let patron = String(d.patron || "").toLowerCase();
    if (!FORMA_FV[patron]) patron = ratio < 0.7 ? (pctF < 0.8 ? "mixto" : "obstructivo") : (pctF < 0.8 ? "restrictivo" : "normal");
    const L = 44, R = 330, T = 22, B = 250, W = 340, H = 292;
    const vMax = Math.ceil(Math.max(fvc, fvcP) * 1.1 + 0.2), fPos = Math.ceil(Math.max(pef, pefP) * 1.1 / 2) * 2, fNeg = Math.ceil(Math.max(pef, pefP) * 0.66 * 1.15 / 2) * 2;
    const X = v => L + (R - L) * v / vMax, Y = f => T + (B - T) * (fPos - f) / (fPos + fNeg);
    const camino = pts => "M" + pts.map(p => r1(X(p[0])) + "," + r1(Y(p[1]))).join(" L") + " Z";
    const ejes = (xMax, xPaso, yMin, yMax, yPaso, Xf, Yf, xt, yt, xFmt) => {
      let g = "";
      for (let y = yMin; y <= yMax + 1e-9; y += yPaso) { g += ln(L, Yf(y), R, Yf(y), Math.abs(y) < 1e-9 ? "#59616c" : "#e1e5ea", Math.abs(y) < 1e-9 ? 1.1 : 0.8); g += tx(L - 5, Yf(y) + 3.5, fmt(y), 'font-size="10" text-anchor="end" fill="#39404a"'); }
      for (let x = 0; x <= xMax + 1e-9; x += xPaso) { g += ln(Xf(x), T, Xf(x), B, x === 0 ? "#59616c" : "#e1e5ea", x === 0 ? 1.1 : 0.8); g += tx(Xf(x), B + 13, xFmt ? xFmt(x) : fmt(x), 'font-size="10" text-anchor="middle" fill="#39404a"'); }
      g += `<rect x="${L}" y="${T}" width="${R - L}" height="${B - T}" fill="none" stroke="#9aa3ae" stroke-width="0.8"/>`;
      g += tx((L + R) / 2, H - 6, xt, 'font-size="10.5" text-anchor="middle" font-weight="bold" fill="#2a3039"');
      g += `<text transform="translate(12 ${r1((T + B) / 2)}) rotate(-90)" font-size="10.5" text-anchor="middle" font-weight="bold" fill="#2a3039">${esc(yt)}</text>`;
      return g;
    };
    const leyenda = (x, y) => ln(x, y, x + 18, y, "#1f4e8c", 2.2) + tx(x + 23, y + 3.5, "Medida", 'font-size="10" fill="#2a3039"') + ln(x + 72, y, x + 90, y, "#7b8490", 1.5, 'stroke-dasharray="5 3"') + tx(x + 95, y + 3.5, "Predicha", 'font-size="10" fill="#2a3039"');
    // Flujo-volumen
    let g = `<rect x="0" y="0" width="${W}" height="${H}" fill="#ffffff"/>` + ejes(vMax, 1, -fNeg, fPos, 2, X, Y, "Volumen (L)", "Flujo (L/s)");
    g += `<path d="${camino(lazo(fvcP, pefP, FORMA_FV.normal))}" fill="none" stroke="#7b8490" stroke-width="1.5" stroke-dasharray="5 3" stroke-linejoin="round"/>`;
    const medido = lazo(fvc, pef, FORMA_FV[patron]);
    g += `<path d="${camino(medido)}" fill="rgba(31,78,140,0.07)" stroke="#1f4e8c" stroke-width="2.2" stroke-linejoin="round"/>`;
    const pico = medido.reduce((m, p) => p[1] > m[1] ? p : m, [0, 0]);
    if (hayPef) { g += `<circle cx="${r1(X(pico[0]))}" cy="${r1(Y(pico[1]))}" r="3" fill="#1f4e8c"/>`; g += tx(X(pico[0]) + 7, Y(pico[1]) - 4, "FEP " + fmt(pef) + " L/s", 'font-size="10" font-weight="bold" fill="#1f4e8c" stroke="#ffffff" stroke-width="3" paint-order="stroke"'); }
    const cvfEt = "CVF " + fmt(fvc, 2) + " L", aDer = X(fvc) + 8 + ancho(cvfEt, 10) < R;
    g += `<circle cx="${r1(X(fvc))}" cy="${r1(Y(0))}" r="3" fill="#1f4e8c"/>` + tx(aDer ? X(fvc) + 6 : X(fvc) - 6, Y(0) + 14, cvfEt, `font-size="10" font-weight="bold"${aDer ? "" : ' text-anchor="end"'} fill="#1f4e8c" stroke="#ffffff" stroke-width="3" paint-order="stroke"`);
    g += leyenda(R - 140, T + 10);
    const fv = svg(W, H, "Curva flujo-volumen: capacidad vital forzada medida " + fmt(fvc, 2) + " L frente a " + fmt(fvcP, 2) + " L predicha" + (hayPef ? "; flujo espiratorio pico " + fmt(pef) + " L/s frente a " + (hayPefP ? fmt(pefP) : "—") + " L/s predicho" : "") + ". La curva predicha va en línea discontinua.", "doc-svg-mitad", g);
    // Volumen-tiempo
    const tMax = 6, kM = kDe(ratio, tMax), kP = kDe(ratioP, tMax);
    const Xt = t => L + (R - L) * t / tMax, Yv = v => T + (B - T) * (vMax - v) / vMax;
    const curva = (V, k) => { const pts = []; for (let i = 0; i <= 60; i++) { const t = tMax * i / 60; pts.push([Xt(t), Yv(V * (1 - Math.exp(-k * t)) / (1 - Math.exp(-k * tMax)))]); } return "M" + poli(pts).replace(/ /g, " L"); };
    let h = `<rect x="0" y="0" width="${W}" height="${H}" fill="#ffffff"/>` + ejes(tMax, 1, 0, vMax, 1, Xt, Yv, "Tiempo (s)", "Volumen (L)", x => String(x));
    h += `<path d="${curva(fvcP, kP)}" fill="none" stroke="#7b8490" stroke-width="1.5" stroke-dasharray="5 3"/>`;
    h += `<path d="${curva(fvc, kM)}" fill="none" stroke="#1f4e8c" stroke-width="2.2"/>`;
    h += ln(Xt(1), Yv(fev1), Xt(1), B, "#1f4e8c", 1, 'stroke-dasharray="2 2"') + ln(L, Yv(fev1), Xt(1), Yv(fev1), "#1f4e8c", 1, 'stroke-dasharray="2 2"');
    h += `<circle cx="${r1(Xt(1))}" cy="${r1(Yv(fev1))}" r="3.2" fill="#1f4e8c"/>`;
    h += `<text x="${r1(Xt(1) + 7)}" y="${r1(Yv(fev1) + 14)}" font-size="10" font-weight="bold" fill="#1f4e8c" stroke="#ffffff" stroke-width="3" paint-order="stroke">VEF<tspan font-size="8" dy="2">1</tspan><tspan dy="-2"> ${esc(fmt(fev1, 2))} L</tspan></text>`;
    h += tx(R - 4, Yv(fvc) + 14, "CVF " + fmt(fvc, 2) + " L", 'font-size="10" font-weight="bold" text-anchor="end" fill="#1f4e8c" stroke="#ffffff" stroke-width="3" paint-order="stroke"');
    if (Math.abs(fvcP - fvc) > vMax * 0.09) h += tx(R - 4, Yv(fvcP) - 5, "Predicha " + fmt(fvcP, 2) + " L", 'font-size="9.5" text-anchor="end" fill="#59616c" stroke="#ffffff" stroke-width="3" paint-order="stroke"');
    h += leyenda(R - 140, B - 10);
    const vt = svg(W, H, "Curva volumen-tiempo: volumen espiratorio forzado en el primer segundo " + fmt(fev1, 2) + " L frente a " + fmt(fev1P, 2) + " L predicho; capacidad vital forzada " + fmt(fvc, 2) + " L; relación " + fmt(Math.round(ratio * 100), 0) + " %.", "doc-svg-mitad", h);
    const pct = (a, b) => esNum(a) && esNum(b) && b > 0 ? fmt(Math.round(a / b * 100), 0) + " %" : "—";
    const filas = [
      ["CVF (L)", fmt(fvc, 2), fmt(fvcP, 2), pct(fvc, fvcP)],
      ["VEF<sub>1</sub> (L)", fmt(fev1, 2), fmt(fev1P, 2), pct(fev1, fev1P)],
      ["VEF<sub>1</sub>/CVF", fmt(Math.round(ratio * 100), 0) + " %", fmt(Math.round(ratioP * 100), 0) + " %", pct(ratio, ratioP)]
    ];
    if (hayPef) filas.push(["FEP (L/s)", fmt(d.pef), hayPefP ? fmt(pefP) : "—", hayPefP ? pct(pef, pefP) : "—"]);
    const tabla = tablaFig(["Parámetro", "Medido", "Predicho", "% del predicho"], filas.map(f => [f[0], esc(f[1]), esc(f[2]), esc(f[3])]), "doc-t-num");
    return { titulo:"Espirometría forzada · curvas flujo-volumen y volumen-tiempo", html:`<div class="doc-fig-par">${fv}${vt}</div>` + tabla };
  }

  /* =====================================================================================================
     Resonancia magnética de columna, corte sagital esquemático en escala de grises (T2: el líquido
     cefalorraquídeo claro, la médula gris, los discos sanos claros y los degenerados oscuros). Anterior a
     la izquierda. Cada hallazgo se dibuja en su nivel.
     ===================================================================================================== */
  const NOMBRE_HALLAZGO = { hernia:"Hernia discal", protrusion:"Protrusión discal", estenosis:"Estenosis del canal", artrodesis:"Artrodesis", mielopatia:"Mielopatía" };
  const normNivel = s => String(s || "").toUpperCase().replace(/\s+/g, "").replace(/[–—/]/g, "-");
  function rmColumna(d) {
    const lumbar = String(d.region || "").toLowerCase() === "lumbar";
    const NIV = lumbar ? ["T12", "L1", "L2", "L3", "L4", "L5", "S1"] : ["C2", "C3", "C4", "C5", "C6", "C7", "T1"];
    const W = 340, H = 400, n = NIV.length;
    const bw = lumbar ? 48 : 40, hb = lumbar ? 33 : 30, hd = lumbar ? 11 : 9, cw = lumbar ? 17 : 15;
    const cc = bw / 2 + 2 + cw / 2, cpw = bw / 2 + 2 + cw;           // centro del canal y pared posterior, en el marco local
    const total = n * hb + (n - 1) * hd + (lumbar ? hb * 0.7 : 0);
    const y0 = (H - total) / 2 + hb / 2 + (lumbar ? 4 : 12), cx = 108, A = lumbar ? 17 : 15;
    const yTop = y0 - hb / 2 - 14, yBot = y0 + (n - 1) * (hb + hd) + hb / 2 + 14;
    const dx = y => -A * Math.sin(Math.PI * (y - yTop) / (yBot - yTop));
    const ang = y => -Math.atan(-A * Math.PI / (yBot - yTop) * Math.cos(Math.PI * (y - yTop) / (yBot - yTop))) * 180 / Math.PI;
    const marco = y => ({ x:cx + dx(y), y, a:ang(y) });
    const cuerpos = NIV.map((nv, i) => { const m = marco(y0 + i * (hb + hd)); if (nv === "S1") { m.a -= 28; m.x += 6; } return m; });
    const discos = NIV.slice(0, -1).map((nv, i) => { const a = cuerpos[i], b = cuerpos[i + 1]; return { x:(a.x + b.x) / 2, y:(a.y + b.y) / 2, a:(a.a + b.a) / 2 + (NIV[i + 1] === "S1" ? 6 : 0) }; });
    const glob = (m, px, py) => { const r = m.a * Math.PI / 180; return [m.x + px * Math.cos(r) - py * Math.sin(r), m.y + px * Math.sin(r) + py * Math.cos(r)]; };
    const tr = m => `transform="translate(${r1(m.x)} ${r1(m.y)}) rotate(${r1(m.a)})"`;
    // Hallazgos por disco (índice del disco entre NIV[i] y NIV[i+1]).
    const porDisco = NIV.slice(0, -1).map(() => []), fuera = [];
    (Array.isArray(d.hallazgos) ? d.hallazgos : []).forEach(h => {
      const p = normNivel(h.nivel).split("-").filter(Boolean), a = NIV.indexOf(p[0]), b = p.length > 1 ? NIV.indexOf(p[p.length - 1]) : a + 1;
      if (a < 0 || b <= a || b > n - 1) { fuera.push(h); return; }
      for (let i = a; i < b; i++) if (porDisco[i].indexOf(h.tipo) < 0) porDisco[i].push(h.tipo);
    });
    const tiene = (i, t) => porDisco[i].indexOf(t) >= 0;
    let g = `<rect x="0" y="0" width="${W}" height="${H}" fill="#060606"/>`;
    // Partes blandas: prevertebrales y musculatura posterior con grasa subcutánea.
    const ejes = [marco(yTop - 40)].concat(cuerpos.slice(0, lumbar ? -1 : n), [marco(yBot + 40)]);
    const borde = (o) => ejes.map(m => glob(m, o, 0));
    g += `<path d="${suave(borde(-bw / 2 - 16).concat(borde(cpw + 62).reverse()), true)}" fill="#262626"/>`;
    g += `<path d="${suave(borde(cpw + 62).concat(borde(cpw + 74).reverse()), true)}" fill="#5b5b5b"/>`;
    // Canal: líquido cefalorraquídeo (claro en T2).
    const canal = [glob(marco(yTop - 40), cc, 0)];
    cuerpos.forEach((m, i) => { canal.push(glob(m, cc, 0)); if (discos[i]) canal.push(glob(discos[i], cc, 0)); });
    canal.push(glob(cuerpos[n - 1], cc, hb * (lumbar ? 1.6 : 1.2)));
    if (!lumbar) canal.push(glob(marco(yBot + 40), cc, 0));
    g += `<path d="${suave(canal)}" fill="none" stroke="#efefef" stroke-width="${cw}" stroke-linecap="butt" stroke-linejoin="round"/>`;
    // Elementos posteriores (láminas y apófisis espinosas).
    const espinosa = lumbar ? [32, 34, 35, 35, 33, 30] : [30, 22, 22, 24, 28, 38, 36];
    cuerpos.forEach((m, i) => {
      if (NIV[i] === "S1") return;
      const e = espinosa[i] || 28, caida = lumbar ? hb * 0.1 : hb * 0.45;
      g += `<path ${tr(m)} d="M${r1(cpw + 1)},${r1(-hb * 0.36)} L${r1(cpw + e * 0.55)},${r1(-hb * 0.22 + caida * 0.3)} L${r1(cpw + e)},${r1(caida - 3)} L${r1(cpw + e - 3)},${r1(caida + 6)} L${r1(cpw + e * 0.5)},${r1(hb * 0.22 + caida * 0.5)} L${r1(cpw + 1)},${r1(hb * 0.3)} Z" fill="#6e6e6e" stroke="#151515" stroke-width="1"/>`;
    });
    // Cuerpos vertebrales.
    cuerpos.forEach((m, i) => {
      if (NIV[i] === "S1") {
        g += `<path ${tr(m)} d="M${r1(-bw / 2 - 2)},${r1(-hb / 2)} L${r1(bw / 2 + 1)},${r1(-hb / 2 + 2)} L${r1(bw / 2 - 4)},${r1(hb * 1.25)} L${r1(-bw * 0.05)},${r1(hb * 1.35)} Z" fill="#878787" stroke="#141414" stroke-width="1.2" stroke-linejoin="round"/>`;
        g += `<path ${tr(m)} d="M${r1(-bw / 2 + 4)},${r1(hb * 0.42)} L${r1(bw / 2 - 6)},${r1(hb * 0.46)}" stroke="#4a4a4a" stroke-width="2.2"/>`;
        return;
      }
      g += `<rect ${tr(m)} x="${r1(-bw / 2)}" y="${r1(-hb / 2)}" width="${bw}" height="${hb}" rx="4" fill="#8a8a8a" stroke="#141414" stroke-width="1.2"/>`;
      if (NIV[i] === "C2") {
        g += `<path ${tr(m)} d="M${r1(-bw * 0.16)},${r1(-hb / 2)} L${r1(-bw * 0.12)},${r1(-hb / 2 - 15)} Q${r1(bw * 0.04)},${r1(-hb / 2 - 24)} ${r1(bw * 0.2)},${r1(-hb / 2 - 15)} L${r1(bw * 0.22)},${r1(-hb / 2)} Z" fill="#8a8a8a" stroke="#141414" stroke-width="1.2"/>`;
        g += `<ellipse ${tr(m)} cx="${r1(-bw / 2 + 1)}" cy="${r1(-hb / 2 - 12)}" rx="5" ry="7" fill="#7a7a7a" stroke="#141414" stroke-width="1"/>`;
        g += `<ellipse ${tr(m)} cx="${r1(cpw + 14)}" cy="${r1(-hb / 2 - 12)}" rx="9" ry="5" fill="#6e6e6e" stroke="#151515" stroke-width="1"/>`;
      }
    });
    // Discos intervertebrales (o la caja de la artrodesis).
    discos.forEach((m, i) => {
      if (tiene(i, "artrodesis")) { g += `<rect ${tr(m)} x="${r1(-bw / 2 + 4)}" y="${r1(-hd / 2 - 0.5)}" width="${bw - 8}" height="${hd + 1}" rx="1.5" fill="#2e2e2e" stroke="#cfd6de" stroke-width="1.3"/>` + `<path ${tr(m)} d="M${r1(-bw / 6)},${r1(-hd / 2)} V${r1(hd / 2)} M${r1(bw / 6)},${r1(-hd / 2)} V${r1(hd / 2)}" stroke="#cfd6de" stroke-width="0.9"/>`; return; }
      const degen = tiene(i, "hernia") || tiene(i, "protrusion") || tiene(i, "estenosis"), h = degen ? hd * 0.82 : hd;
      if (NIV[i + 1] === "S1") g += `<path ${tr(m)} d="M${r1(-bw / 2)},${r1(-h * 0.7)} L${r1(bw / 2)},${r1(-h * 0.35)} L${r1(bw / 2)},${r1(h * 0.35)} L${r1(-bw / 2)},${r1(h * 0.7)} Z" fill="${degen ? "#5e5e5e" : "#9a9a9a"}" stroke="#141414" stroke-width="0.8"/>`;
      else g += `<rect ${tr(m)} x="${r1(-bw / 2 + 0.5)}" y="${r1(-h / 2)}" width="${bw - 1}" height="${r1(h)}" rx="${r1(h / 2)}" fill="${degen ? "#5e5e5e" : "#9a9a9a"}" stroke="#141414" stroke-width="0.8"/>`;
      g += `<ellipse ${tr(m)} cx="0" cy="0" rx="${r1(bw * 0.27)}" ry="${r1(h * 0.3)}" fill="${degen ? "#757575" : "#ececec"}"/>`;
    });
    // Médula (cervical) o cono medular y cola de caballo (lumbar).
    if (!lumbar) g += `<path d="${suave(canal)}" fill="none" stroke="#8f8f8f" stroke-width="${r1(cw * 0.5)}" stroke-linecap="butt" stroke-linejoin="round"/>`;
    else {
      const cono = canal.slice(0, 4), punta = glob(discos[1], cc + 1, 0);
      g += `<path d="${suave(cono)}" fill="none" stroke="#8f8f8f" stroke-width="${r1(cw * 0.5)}" stroke-linejoin="round"/>`;
      const c3 = cono[3], m1 = cuerpos[1], rad = m1.a * Math.PI / 180, ox = Math.cos(rad) * cw * 0.25, oy = Math.sin(rad) * cw * 0.25;
      g += `<path d="M${r1(c3[0] - ox)},${r1(c3[1] - oy)} L${r1(punta[0])},${r1(punta[1])} L${r1(c3[0] + ox)},${r1(c3[1] + oy)} Z" fill="#8f8f8f"/>`;
      [-0.3, -0.12, 0.06, 0.22, 0.34].forEach(o => {
        const pts = [punta];
        for (let i = 2; i < n; i++) { pts.push(glob(cuerpos[i], cc + o * cw, 0)); if (discos[i]) pts.push(glob(discos[i], cc + o * cw, 0)); }
        pts.push(glob(cuerpos[n - 1], cc + o * cw, hb * 1.6));
        g += `<path d="${suave(pts)}" fill="none" stroke="#a5a5a5" stroke-width="0.9"/>`;
      });
    }
    // Hallazgos.
    discos.forEach((m, i) => {
      const e = bw / 2 - 1;
      if (tiene(i, "mielopatia")) g += `<ellipse ${tr(m)} cx="${r1(cc)}" cy="0" rx="${r1(cw * 0.22)}" ry="${r1(hd / 2 + hb * 0.5)}" fill="#d9d9d9" opacity="0.6"/><ellipse ${tr(m)} cx="${r1(cc)}" cy="0" rx="${r1(cw * 0.13)}" ry="${r1(hd / 2 + hb * 0.32)}" fill="#ffffff"/>`;
      if (tiene(i, "estenosis")) {
        g += `<path ${tr(m)} d="M${r1(cpw + 1)},${r1(-hd * 1.7)} Q${r1(cpw - cw * 0.55)},0 ${r1(cpw + 1)},${r1(hd * 1.7)} Z" fill="#444444" stroke="#111111" stroke-width="0.8"/>`;
        if (!tiene(i, "hernia") && !tiene(i, "protrusion")) g += `<path ${tr(m)} d="M${r1(e)},${r1(-hd * 0.8)} Q${r1(e + cw * 0.55)},0 ${r1(e)},${r1(hd * 0.8)} Z" fill="#5a5a5a" stroke="#111111" stroke-width="0.8"/>`;
      }
      if (tiene(i, "hernia")) g += `<path ${tr(m)} d="M${r1(e)},${r1(-hd * 0.6)} C${r1(e + cw * 0.55)},${r1(-hd)} ${r1(e + cw * 0.8)},${r1(-hd * 0.3)} ${r1(e + cw * 0.76)},${r1(hd * 0.3)} C${r1(e + cw * 0.66)},${r1(hd * 1.15)} ${r1(e + cw * 0.25)},${r1(hd * 0.95)} ${r1(e)},${r1(hd * 0.6)} Z" fill="#555555" stroke="#111111" stroke-width="0.9"/>`;
      else if (tiene(i, "protrusion")) g += `<path ${tr(m)} d="M${r1(e)},${r1(-hd * 0.62)} Q${r1(e + cw * 0.85)},0 ${r1(e)},${r1(hd * 0.62)} Z" fill="#5c5c5c" stroke="#111111" stroke-width="0.9"/>`;
      if (tiene(i, "artrodesis")) {
        const yS = hd / 2 + hb * 0.4;
        if (!lumbar) {
          g += `<rect ${tr(m)} x="${r1(-bw / 2 - 6)}" y="${r1(-(hd / 2 + hb * 0.62))}" width="4.5" height="${r1(2 * (hd / 2 + hb * 0.62))}" rx="1.5" fill="#cfd6de" stroke="#111111" stroke-width="0.8"/>`;
          [-1, 1].forEach(s => { g += `<path ${tr(m)} d="M${r1(-bw / 2 - 2)},${r1(s * yS)} L${r1(-bw / 2 + bw * 0.62)},${r1(s * (yS - 3))}" stroke="#cfd6de" stroke-width="2.8" stroke-linecap="round"/>`; });
        } else {
          const xr = cpw + 16;
          g += `<path ${tr(m)} d="M${r1(xr)},${r1(-(yS + 3))} L${r1(xr)},${r1(yS + 3)}" stroke="#cfd6de" stroke-width="3.6" stroke-linecap="round"/>`;
          [-1, 1].forEach(s => { g += `<path ${tr(m)} d="M${r1(xr)},${r1(s * yS)} L${r1(-bw * 0.2)},${r1(s * yS)}" stroke="#cfd6de" stroke-width="2.6" stroke-linecap="round" opacity="0.75"/>`; });
        }
      }
    });
    // Rótulos: vértebras a la izquierda, hallazgos a la derecha con su línea guía.
    cuerpos.forEach((m, i) => { const p = glob(m, -bw / 2 - (i && NIV[i] !== "S1" ? 12 : 14), 4); g += tx(p[0], p[1], NIV[i], 'font-size="10" text-anchor="end" fill="#d6d6d6"'); });
    const LX = 230, rot = [];
    discos.forEach((m, i) => { if (porDisco[i].length) rot.push({ i, ancla:glob(m, porDisco[i].length === 1 && porDisco[i][0] === "mielopatia" ? cc : cpw, 0), lineas:porDisco[i].map(t => NOMBRE_HALLAZGO[t] || t) }); });
    let fondo = 16;
    rot.forEach(r => { const alto = 13 + r.lineas.length * 12; r.y = Math.max(r.ancla[1] - 4, fondo + 10); fondo = r.y + alto - 10; });
    if (fondo > H - 26) { const corr = fondo - (H - 26); rot.forEach(r => { r.y -= corr; }); }
    rot.forEach(r => {
      g += `<path d="M${r1(r.ancla[0])},${r1(r.ancla[1])} L${r1(LX - 22)},${r1(r.y - 4)} L${r1(LX - 4)},${r1(r.y - 4)}" fill="none" stroke="#ffd54a" stroke-width="1"/><circle cx="${r1(r.ancla[0])}" cy="${r1(r.ancla[1])}" r="1.8" fill="#ffd54a"/>`;
      g += tx(LX, r.y, NIV[r.i] + "–" + NIV[r.i + 1], 'font-size="10.5" font-weight="bold" fill="#ffd54a"');
      r.lineas.forEach((l, k) => { g += tx(LX, r.y + 13 + k * 12, l, 'font-size="10" fill="#f3e3a1"'); });
    });
    const sec = String(d.secuencia || "T2 sagital");
    g += tx(8, 15, "RM · " + sec, 'font-size="10" fill="#cfcfcf"') + tx(W - 8, 15, "Columna " + (lumbar ? "lumbar" : "cervical"), 'font-size="10" text-anchor="end" fill="#cfcfcf"');
    g += tx(8, H / 2, "A", 'font-size="11" font-weight="bold" fill="#9a9a9a"') + tx(W - 8, H - 10, "P", 'font-size="11" font-weight="bold" text-anchor="end" fill="#9a9a9a"');
    if (!rot.length) g += tx(LX, H / 2, "Sin hallazgos focales", 'font-size="10" fill="#f3e3a1"');
    const desc = rot.map(r => NIV[r.i] + "–" + NIV[r.i + 1] + ": " + r.lineas.join(", ").toLowerCase()).concat(fuera.map(h => normNivel(h.nivel) + ": " + String(NOMBRE_HALLAZGO[h.tipo] || h.tipo).toLowerCase()));
    const etiqueta = "Esquema sagital de resonancia magnética de columna " + (lumbar ? "lumbar" : "cervical") + ", secuencia " + sec + ". " + (desc.length ? "Hallazgos: " + desc.join("; ") + "." : "Sin hallazgos focales.");
    const nota = fuera.length ? `<p class="doc-fig-leyenda">Fuera del esquema: ${esc(desc.slice(rot.length).join("; "))}.</p>` : "";
    return { titulo:"Resonancia magnética de columna " + (lumbar ? "lumbar" : "cervical") + " · " + sec, html:svg(W, H, etiqueta, "doc-svg-imagen", g) + nota, imagen:true };
  }

  /* =====================================================================================================
     Radiografía de tórax posteroanterior: el lado derecho del paciente a la izquierda de quien mira.
     Opacidades pequeñas en las zonas OIT señaladas (altura s/m/i + lado d/i), con densidad según la
     profusión y tamaño según la forma (p, q, r redondeadas; s, t, u irregulares).
     ===================================================================================================== */
  const PULMON_D = [[118, 52], [100, 56], [84, 68], [72, 90], [64, 120], [60, 155], [58, 190], [58, 225], [60, 252], [64, 270], [80, 263], [100, 255], [120, 250], [138, 251], [150, 255], [151, 228], [149, 196], [146, 160], [145, 124], [141, 92], [135, 67], [127, 55]];
  const PULMON_I = [[222, 52], [240, 56], [256, 68], [268, 90], [276, 120], [280, 155], [282, 190], [282, 226], [280, 256], [276, 276], [262, 270], [246, 265], [232, 263], [222, 252], [214, 232], [206, 205], [199, 180], [195, 150], [195, 122], [199, 92], [205, 67], [213, 55]];
  const CORAZON = [[150, 140], [141, 165], [137, 200], [140, 232], [150, 258], [190, 266], [226, 264], [236, 246], [238, 214], [228, 186], [212, 164], [204, 146], [206, 128], [200, 106], [188, 98], [174, 96], [158, 100]];
  function dentro(p, poly) { let c = false; for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) { const a = poly[i], b = poly[j]; if ((a[1] > p[1]) !== (b[1] > p[1]) && p[0] < (b[0] - a[0]) * (p[1] - a[1]) / (b[1] - a[1]) + a[0]) c = !c; } return c; }
  const ZONA_ALT = { s:"superior", m:"media", i:"inferior" }, ZONA_LADO = { d:"derecha", i:"izquierda" };
  function zona(z) {
    const c = String(z || "").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z]/g, "");
    if (c.length === 2 && ZONA_ALT[c[0]] && ZONA_LADO[c[1]]) return { alt:c[0], lado:c[1] };
    const alt = /sup/.test(c) ? "s" : /med/.test(c) ? "m" : /inf/.test(c) ? "i" : null, lado = /der/.test(c) ? "d" : /izq/.test(c) ? "i" : null;
    return alt && lado ? { alt, lado } : null;
  }
  function profusion(p) {
    const m = /^\s*([0-3])\s*\/\s*([0-3+-])/.exec(String(p || "")), may = m ? Number(m[1]) : Number(String(p).charAt(0)) || 0;
    const men = !m ? may : m[2] === "+" ? Math.min(3, may + 1) : m[2] === "-" ? Math.max(0, may - 1) : Number(m[2]);
    const base = [0, 9, 20, 36];
    return Math.round(base[may] * 0.7 + base[men] * 0.3);
  }
  function rxTorax(d) {
    const W = 340, H = 330, rnd = azar(hash(JSON.stringify(d), 7));
    const zonas = (Array.isArray(d.zonas) ? d.zonas : []).map(zona).filter(Boolean).filter((z, i, a) => a.findIndex(y => y.alt === z.alt && y.lado === z.lado) === i);
    const formas = String(d.forma || "q").toLowerCase().split("/").map(s => s.trim()).filter(s => /^[pqrstu]$/.test(s));
    if (!formas.length) formas.push("q");
    const nZona = profusion(d.profusion);
    let g = `<rect x="0" y="0" width="${W}" height="${H}" fill="#070707"/>`;
    g += `<path d="M138,0 L202,0 L206,30 Q250,40 316,56 L326,330 L14,330 L24,56 Q90,40 134,30 Z" fill="#3c3c3c"/>`;
    g += `<rect x="24" y="238" width="292" height="92" fill="#a3a3a3"/>`;
    g += `<rect x="160" y="0" width="20" height="${H}" fill="#7d7d7d" opacity="0.55"/>`;
    g += `<path d="${suave(PULMON_D, true)}" fill="#151515"/><path d="${suave(PULMON_I, true)}" fill="#151515"/>`;
    // Tramas vasculares desde los hilios.
    [[146, 150, 96, 120], [146, 156, 88, 175], [146, 162, 100, 220], [146, 146, 110, 92], [196, 150, 246, 120], [196, 158, 254, 178], [198, 164, 240, 226], [196, 146, 232, 92]].forEach(v => { g += `<path d="M${v[0]},${v[1]} Q${(v[0] + v[2]) / 2},${v[1] + (v[3] - v[1]) * 0.3} ${v[2]},${v[3]}" fill="none" stroke="#4a4a4a" stroke-width="1.4" opacity="0.7"/>`; });
    // Costillas posteriores y clavículas.
    for (let k = 0; k < 9; k++) {
      const y = 66 + k * 21;
      g += `<path d="M162,${y} C118,${y - 16} 74,${y - 6} 50,${y + 26}" fill="none" stroke="#d2d2d2" stroke-width="4" opacity="0.32"/>`;
      g += `<path d="M178,${y} C222,${y - 16} 266,${y - 6} 290,${y + 26}" fill="none" stroke="#d2d2d2" stroke-width="4" opacity="0.32"/>`;
    }
    g += `<path d="M160,66 Q112,46 34,54" fill="none" stroke="#e3e3e3" stroke-width="6" stroke-linecap="round" opacity="0.85"/><path d="M180,66 Q228,46 306,54" fill="none" stroke="#e3e3e3" stroke-width="6" stroke-linecap="round" opacity="0.85"/>`;
    // Mediastino, tráquea y corazón.
    g += `<path d="M152,30 L150,140 L204,140 L190,30 Z" fill="#bdbdbd" opacity="0.9"/>`;
    g += `<path d="${suave(CORAZON, true)}" fill="#cbcbcb"/>`;
    g += `<rect x="165" y="0" width="10" height="118" fill="#262626"/><path d="M170,116 L150,142 M170,116 L192,142" stroke="#262626" stroke-width="7" stroke-linecap="round"/>`;
    g += `<ellipse cx="236" cy="290" rx="17" ry="9" fill="#1b1b1b"/>`;
    // Zonas OIT: tercios de cada campo pulmonar entre el vértice y la cúpula diafragmática.
    const campo = { d:{ poly:PULMON_D, x0:56, x1:152, ap:52, base:262, lx:44, anchor:"end" }, i:{ poly:PULMON_I, x0:192, x1:284, ap:52, base:270, lx:296, anchor:"start" } };
    ["d", "i"].forEach(l => {
      const c = campo[l], t = (c.base - c.ap) / 3;
      [1, 2].forEach(k => { g += ln(c.x0, c.ap + k * t, c.x1, c.ap + k * t, "#ffd54a", 0.8, 'stroke-dasharray="3 3" opacity="0.45"'); });
      ["s", "m", "i"].forEach((a, k) => { const on = zonas.some(z => z.alt === a && z.lado === l); g += tx(c.lx, c.ap + t * (k + 0.5) + 3, ZONA_ALT[a].slice(0, 3) + ".", `font-size="9" text-anchor="${c.anchor}" fill="${on ? "#ffd54a" : "#8c8c8c"}"${on ? ' font-weight="bold"' : ""}`); });
    });
    // Opacidades pequeñas.
    const tam = { p:1.1, q:1.8, r:3 }, irr = { s:3, t:5, u:8 };
    zonas.forEach(z => {
      const c = campo[z.lado], t = (c.base - c.ap) / 3, ya = c.ap + t * (z.alt === "s" ? 0 : z.alt === "m" ? 1 : 2);
      let puestas = 0;
      for (let k = 0; k < 600 && puestas < nZona; k++) {
        const p = [c.x0 + rnd() * (c.x1 - c.x0), ya + rnd() * t];
        if (!dentro(p, c.poly) || dentro(p, CORAZON) || !dentro([p[0] - 4, p[1]], c.poly) || !dentro([p[0] + 4, p[1]], c.poly) || !dentro([p[0], p[1] + 4], c.poly)) continue;
        const f = formas[puestas % 10 < 7 || formas.length === 1 ? 0 : 1];
        if (tam[f]) g += `<circle cx="${r1(p[0])}" cy="${r1(p[1])}" r="${tam[f]}" fill="#e8e8e8" opacity="0.88"/>`;
        else { const a = rnd() * Math.PI, l = irr[f] / 2; g += ln(p[0] - Math.cos(a) * l, p[1] - Math.sin(a) * l, p[0] + Math.cos(a) * l, p[1] + Math.sin(a) * l, "#e0e0e0", 1.3, 'opacity="0.85" stroke-linecap="round"'); }
        puestas++;
      }
    });
    // Opacidades grandes (A, B, C).
    const gr = String(d.grandes == null ? "0" : d.grandes).trim().toUpperCase();
    const masas = { A:[[100, 98, 6, 8]], B:[[100, 100, 12, 16], [240, 104, 10, 13]], C:[[100, 104, 20, 28], [240, 106, 18, 25]] }[gr];
    (masas || []).forEach(m => { g += `<ellipse cx="${m[0]}" cy="${m[1]}" rx="${m[2]}" ry="${m[3]}" fill="#d8d8d8" opacity="0.9"/>`; });
    g += `<rect x="10" y="10" width="20" height="20" rx="2" fill="#f2f2f2"/>` + tx(20, 25, "D", 'font-size="14" font-weight="bold" text-anchor="middle" fill="#111111"');
    g += tx(W - 10, 22, "PA", 'font-size="11" font-weight="bold" text-anchor="end" fill="#cfcfcf"');
    const nombres = zonas.map(z => ZONA_ALT[z.alt] + " " + ZONA_LADO[z.lado]);
    const leyenda = "Lectura según la clasificación de la OIT: profusión " + String(d.profusion || "—") + " · forma " + String(d.forma || "—") + " · zonas: " + (nombres.length ? nombres.join(", ") : "ninguna") + " · opacidades grandes: " + (gr || "0");
    const etiqueta = "Esquema de radiografía de tórax posteroanterior. " + leyenda.replace(/ · /g, "; ") + ".";
    return { titulo:"Radiografía de tórax posteroanterior · lectura OIT", html:svg(W, H, etiqueta, "doc-svg-imagen", g) + `<p class="doc-fig-leyenda">${esc(leyenda)}.</p>`, imagen:true };
  }

  /* =====================================================================================================
     Neuroconducción: una tarjeta por nervio con latencia, amplitud y velocidad frente a la referencia.
     La franja verde es el rango normal; la barra roja, el valor fuera de referencia.
     ===================================================================================================== */
  function neuroconduccion(d) {
    const filas = (Array.isArray(d.filas) ? d.filas : []).filter(f => f && typeof f === "object");
    const MET = [
      { k:"latencia", ref:"latRef", n:"Latencia", u:() => "ms", alto:true },
      { k:"amplitud", ref:"ampRef", n:"Amplitud", u:f => /motor/i.test(f.tipo || "") ? "mV" : "µV", alto:false },
      { k:"velocidad", ref:"velRef", n:"Velocidad", u:() => "m/s", alto:false }
    ];
    // Escala común a todos los nervios para cada medida (la amplitud, por tipo de fibra).
    const maxDe = (m, f) => filas.filter(x => m.k !== "amplitud" || /motor/i.test(x.tipo || "") === /motor/i.test(f.tipo || "")).reduce((a, x) => Math.max(a, esNum(x[m.k]) ? x[m.k] : 0, esNum(x[m.ref]) ? x[m.ref] : 0), 0) * 1.15 || 1;
    const fuera = (m, f) => esNum(f[m.k]) && esNum(f[m.ref]) && (m.alto ? f[m.k] > f[m.ref] : f[m.k] < f[m.ref]);
    const W = 340, X0 = 72, X1 = 236;
    const tarjetas = filas.map(f => {
      const tipo = /motor/i.test(f.tipo || "") ? "motor" : "sensitivo", alguna = MET.some(m => fuera(m, f));
      const finCab = 12 + ancho(f.nervio || "Nervio", 12.4) + 6 + ancho("· " + tipo, 11);
      let g = `<rect x="0.5" y="0.5" width="${W - 1}" height="101" rx="4" fill="#ffffff" stroke="#c9ced6"/><rect x="0.5" y="0.5" width="4" height="101" fill="${alguna ? "#c0392b" : "#3d6aa6"}"/>`;
      g += tx(12, 18, String(f.nervio || "Nervio"), 'font-size="12" font-weight="bold" fill="#1d2330"') + tx(12 + ancho(f.nervio || "Nervio", 12.4) + 6, 18, "· " + tipo, 'font-size="11" fill="#59616c"');
      if (alguna && finCab < W - 108) g += `<rect x="${W - 104}" y="7" width="94" height="15" rx="7.5" fill="#fbe4e2"/>` + tx(W - 57, 18, "Fuera de referencia", 'font-size="9" font-weight="bold" text-anchor="middle" fill="#a3221c"');
      const partes = [];
      MET.forEach((m, j) => {
        const y = 40 + j * 22, v = f[m.k], ref = f[m.ref], u = m.u(f), mx = maxDe(m, f), X = x => X0 + (X1 - X0) * Math.min(1, Math.max(0, x / mx));
        g += tx(12, y + 4, m.n, 'font-size="10.5" fill="#39404a"');
        g += `<rect x="${X0}" y="${y - 6}" width="${X1 - X0}" height="12" fill="#f1f3f6"/>`;
        if (esNum(ref)) g += m.alto ? `<rect x="${X0}" y="${y - 6}" width="${r1(X(ref) - X0)}" height="12" fill="#dcefe2"/>` : `<rect x="${r1(X(ref))}" y="${y - 6}" width="${r1(X1 - X(ref))}" height="12" fill="#dcefe2"/>`;
        if (esNum(v)) g += `<rect x="${X0}" y="${y - 3.5}" width="${r1(Math.max(1, X(v) - X0))}" height="7" fill="${fuera(m, f) ? "#c0392b" : "#3d6aa6"}"/>`;
        if (esNum(ref)) g += ln(X(ref), y - 8, X(ref), y + 8, "#1d2330", 1.3, 'stroke-dasharray="2 1.5"');
        const malo = fuera(m, f);
        g += tx(X1 + 6, y + 4, esNum(v) ? fmt(v) + " " + u : "—", `font-size="10.5" font-weight="bold" fill="${malo ? "#a3221c" : "#1d2330"}"`);
        if (esNum(ref)) g += tx(W - 8, y + 4, (m.alto ? "≤ " : "≥ ") + fmt(ref), 'font-size="9" text-anchor="end" fill="#6a717b"');
        partes.push(m.n.toLowerCase() + " " + (esNum(v) ? fmt(v) + " " + u : "sin dato") + (esNum(ref) ? " (referencia " + (m.alto ? "hasta " : "desde ") + fmt(ref) + ")" + (malo ? ", fuera de referencia" : "") : ""));
      });
      return svg(W, 102, String(f.nervio || "Nervio") + ", " + tipo + ": " + partes.join("; ") + ".", "doc-svg-tarjeta", g);
    });
    const ley = `<p class="doc-fig-leyenda"><span class="doc-sw doc-sw-ok"></span>Dentro de la referencia <span class="doc-sw doc-sw-mal"></span>Fuera de la referencia <span class="doc-sw doc-sw-rango"></span>Rango normal <span class="doc-sw doc-sw-linea"></span>Límite de referencia (latencia: máximo; amplitud y velocidad: mínimo)</p>`;
    const resumen = "Neuroconducción de " + filas.length + " nervio" + (filas.length === 1 ? "" : "s") + ": " + filas.map(f => f.nervio + " " + (/motor/i.test(f.tipo || "") ? "motor" : "sensitivo") + (MET.some(m => fuera(m, f)) ? ", con valores fuera de referencia" : ", dentro de referencia")).join("; ") + ".";
    return { titulo:"Estudio de neuroconducción · valores frente a la referencia", html:`<div class="doc-fig-tarjetas" role="group" aria-label="${esc(resumen)}">${tarjetas.join("")}</div>` + ley };
  }

  /* =====================================================================================================
     Serie: barras o línea con ejes rotulados, cifras en formato colombiano y línea de límite opcional.
     ===================================================================================================== */
  function partir(s, max) {
    const ps = String(s).split(/\s+/), out = []; let l = "";
    for (const p of ps) { if (p.length > max) return null; if (!l) l = p; else if ((l + " " + p).length <= max) l += " " + p; else { out.push(l); l = p; } }
    if (l) out.push(l);
    return out;
  }
  function serie(d) {
    const pts = (Array.isArray(d.puntos) ? d.puntos : []).filter(p => Array.isArray(p) && esNum(p[1]));
    const unidad = String(d.unidad || ""), dinero = /^(pesos|cop|\$)$/i.test(unidad.trim());
    const lim = d.limite && esNum(d.limite.valor) ? d.limite : null, linea = d.forma === "linea";
    const vs = pts.map(p => p[1]).concat(lim ? [lim.valor] : []), dec = decsDe(vs);
    const f = v => dinero ? pesos(v) : fmt(v, dec);
    let lo = Math.min(0, ...vs), hi = Math.max(0, ...vs);
    // En línea, si todos los valores están lejos de cero, el eje empieza cerca del mínimo.
    if (linea && vs.length) { const mn = Math.min(...vs), mx = Math.max(...vs); if (mn > 0 && mn > mx * 0.3) lo = mn - (mx - mn) * 0.25; }
    if (hi === lo) hi = lo + 1;
    const st = paso(hi - lo, 5); lo = Math.floor(lo / st + 1e-9) * st; hi = Math.ceil((hi + (hi - lo) * 0.04) / st - 1e-9) * st;
    const tf = v => Math.abs(v) < st * 1e-6 ? "0" : dinero ? pesos(v) : fmt(v, decs(st));
    const marcas = []; for (let v = lo; v <= hi + st * 1e-6; v += st) marcas.push(Math.round(v / st) * st);
    const W = 360, fx = 9.5, L = Math.max(...marcas.map(v => ancho(tf(v), 10))) + 12, R = W - 10, T = 24;
    const n = Math.max(1, pts.length), ranura = (R - L) / n;
    let lineas = pts.map(p => partir(p[0], Math.max(3, Math.floor(ranura / (fx * 0.56)))));
    const girar = lineas.some(l => !l || l.length > 3);
    const altoEt = girar ? Math.min(90, Math.max(...pts.map(p => ancho(p[0], fx))) * 0.62 + 14) : 8 + Math.max(1, ...lineas.map(l => l.length)) * 11;
    const PH = 150, B = T + PH, H = B + altoEt + 6;
    const Y = v => B - (v - lo) / (hi - lo) * PH, X = i => L + ranura * (i + 0.5);
    let g = `<rect x="0" y="0" width="${W}" height="${r1(H)}" fill="#ffffff"/>`;
    marcas.forEach(v => { g += ln(L, Y(v), R, Y(v), v === 0 ? "#59616c" : "#e1e5ea", v === 0 ? 1.1 : 0.8) + tx(L - 5, Y(v) + 3.5, tf(v), 'font-size="10" text-anchor="end" fill="#39404a"'); });
    g += ln(L, T, L, B, "#59616c", 1);
    g += tx(L - 5, 12, dinero ? "Pesos" : unidad, 'font-size="10" font-weight="bold" text-anchor="start" fill="#2a3039"');
    const valores = [];
    if (linea) {
      g += `<polyline points="${poli(pts.map((p, i) => [X(i), Y(p[1])]))}" fill="none" stroke="#2f5d8a" stroke-width="2"/>`;
      pts.forEach((p, i) => { g += `<circle cx="${r1(X(i))}" cy="${r1(Y(p[1]))}" r="3.4" fill="#ffffff" stroke="#2f5d8a" stroke-width="1.8"/>`; });
      pts.forEach((p, i) => { if (ancho(f(p[1]), 9.5) < ranura - 2) valores.push(tx(X(i), Y(p[1]) - 7, f(p[1]), 'font-size="9.5" text-anchor="middle" fill="#1d2330" stroke="#ffffff" stroke-width="3" paint-order="stroke"')); });
    } else {
      const bwid = Math.min(46, ranura * 0.68);
      pts.forEach((p, i) => {
        const y = Y(Math.max(p[1], lo)), y0 = Y(Math.max(0, lo)), top = Math.min(y, y0), alto = Math.abs(y0 - y);
        g += `<rect x="${r1(X(i) - bwid / 2)}" y="${r1(top)}" width="${r1(bwid)}" height="${r1(Math.max(0.5, alto))}" fill="#2f5d8a"/>`;
        const et = f(p[1]);
        if (ancho(et, 9.5) < ranura - 2) valores.push(tx(X(i), top - 4, et, 'font-size="9.5" text-anchor="middle" fill="#1d2330"'));
        else if (alto > ancho(et, 9) + 8 && bwid >= 11) valores.push(`<text transform="translate(${r1(X(i) + 3.2)} ${r1(top + 5)}) rotate(90)" font-size="9" fill="#ffffff">${esc(et)}</text>`);
      });
    }
    if (lim) {
      const yl = Y(lim.valor);
      g += ln(L, yl, R, yl, "#b3261e", 1.4, 'stroke-dasharray="6 4"');
      const et = String(lim.etiqueta || ("Límite " + f(lim.valor)));
      g += tx(R - 2, yl - 5, et, 'font-size="9.5" font-weight="bold" text-anchor="end" fill="#b3261e" stroke="#ffffff" stroke-width="3" paint-order="stroke"');
    }
    g += valores.join("");
    pts.forEach((p, i) => {
      if (girar) g += `<text transform="translate(${r1(X(i) + 3)} ${B + 10}) rotate(-38)" font-size="${fx}" text-anchor="end" fill="#39404a">${esc(p[0])}</text>`;
      else lineas[i].forEach((l, k) => { g += tx(X(i), B + 13 + k * 11, l, `font-size="${fx}" text-anchor="middle" fill="#39404a"`); });
    });
    const etiqueta = String(d.titulo || "Serie") + (unidad ? " (" + unidad + ")" : "") + ". " + pts.map(p => String(p[0]) + ": " + f(p[1]) + (dinero || !unidad ? "" : " " + unidad)).join("; ") + "." + (lim ? " " + String(lim.etiqueta || "Límite") + " (" + f(lim.valor) + ")." : "");
    return { titulo:String(d.titulo || ""), html:svg(W, r1(H), etiqueta, "doc-svg-serie", g) };
  }

  const FIGURAS = { audiograma, espirometria, rm_columna:rmColumna, rx_torax:rxTorax, neuroconduccion, serie };
  function figura(fig) {
    if (!fig || typeof fig !== "object") return "";
    let r = null;
    try { r = FIGURAS[fig.tipo] ? FIGURAS[fig.tipo](fig.datos || {}) : null; } catch (e) { r = null; }
    const cuerpo = r ? (r.titulo ? `<p class="doc-fig-t">${esc(r.titulo)}</p>` : "") + r.html + (r.imagen ? `<p class="doc-fig-rotulo">${esc(ROTULO_IMG)}</p>` : "") : `<p class="doc-fig-falta">La figura no se puede mostrar.</p>`;
    return `<figure class="doc-figura${r && r.imagen ? " doc-fig-imagen" : ""}">${cuerpo}${fig.pie ? `<figcaption>${esc(fig.pie)}</figcaption>` : ""}</figure>`;
  }

  /* =====================================================================================================
     Documento: una hoja por página, con encabezado de control, bloques, marca de agua y pie.
     ===================================================================================================== */
  function peso(b) {
    if (b.p) return 1 + String(b.p).length / 260;
    if (b.kv) return 0.3 + b.kv.length * 0.55;
    if (b.tabla) return 1 + ((b.tabla.filas || []).length) * 0.6;
    if (b.lista) return b.lista.reduce((a, x) => a + 0.6 + String(x).length / 300, 0);
    if (b.figura) return 8;
    if (b.firma) return 2;
    return 0.7;
  }
  function html(doc, opc) {
    if (!doc || typeof doc !== "object") return "";
    opc = opc || {};
    const motivo = String(opc.motivo || "No está a la vista");
    const visible = i => { if (typeof i !== "number" || typeof opc.visible !== "function") return true; try { return !!opc.visible(i); } catch (e) { return false; } };
    const tachado = `<span class="doc-tachado">${esc(motivo)}</span>`, tachadoB = `<div class="doc-b-tachado">${tachado}</div>`;
    let huella = ""; try { huella = String(hash(JSON.stringify(doc), 3)); } catch (e) { huella = String(hash(String(doc.numero) + doc.fecha, 3)); }
    const paginas = Array.isArray(doc.paginas) && doc.paginas.length ? doc.paginas : [{ bloques:[] }], n = paginas.length;
    const em = doc.emisor || {}, titulo = String(doc.titulo || "Documento");
    const bloque = b => {
      if ("h" in b) return `<h4 class="doc-h">${txt(b.h)}</h4>`;
      if ("p" in b) return `<p class="doc-p">${txt(b.p)}</p>`;
      if ("kv" in b) return `<dl class="doc-kv">${(Array.isArray(b.kv) ? b.kv : []).filter(Array.isArray).map(r => `<div class="doc-kv-f"><dt>${txt(r[0])}</dt><dd>${visible(r[2]) ? txt(r[1]) : tachado}</dd></div>`).join("")}</dl>`;
      if ("tabla" in b) {
        const t = b.tabla || {}, cols = Array.isArray(t.cols) ? t.cols : [], filas = Array.isArray(t.filas) ? t.filas : [];
        return `<div class="doc-tabla"><table><thead><tr>${cols.map(c => `<th scope="col">${txt(c)}</th>`).join("")}</tr></thead><tbody>${filas.map(f => `<tr>${(Array.isArray(f) ? f : [f]).map(c => `<td>${txt(c)}</td>`).join("")}</tr>`).join("")}</tbody></table></div>${t.nota ? `<p class="doc-tabla-nota">${txt(t.nota)}</p>` : ""}`;
      }
      if ("lista" in b) return `<ul class="doc-lista">${(Array.isArray(b.lista) ? b.lista : [b.lista]).map(x => `<li>${txt(x)}</li>`).join("")}</ul>`;
      if ("figura" in b) return figura(b.figura);
      if ("nota" in b) return `<p class="doc-nota">${txt(b.nota)}</p>`;
      if ("vacio" in b) return `<div class="doc-vacio" role="note">${txt(b.vacio)}</div>`;
      return "";
    };
    const firma = f => {
      f = f || {};
      const cod = codigo(huella, [f.nombre, f.cargo, f.registro, f.fecha].join("|"));
      return `<div class="doc-firma"><p class="doc-firma-sello">Firma electrónica sintética</p><p class="doc-firma-n">${txt(f.nombre)}</p>${f.cargo ? `<p>${txt(f.cargo)}</p>` : ""}${f.registro ? `<p>${txt(f.registro)}</p>` : ""}${f.fecha ? `<p>Firmado el ${txt(f.fecha)}</p>` : ""}<p class="doc-firma-cod">Código de verificación <span>${cod}</span></p></div>`;
    };
    const hoja = (pg, i) => {
      pg = pg || {};
      const bloques = (Array.isArray(pg.bloques) ? pg.bloques : []).filter(b => b && typeof b === "object");
      let cuerpo = "", firmas = [];
      const cerrar = () => { if (firmas.length) { cuerpo += `<div class="doc-firmas">${firmas.join("")}</div>`; firmas = []; } };
      bloques.forEach(b => {
        const oculto = typeof b.campo === "number" && !visible(b.campo);
        if ("firma" in b) { firmas.push(oculto ? tachadoB : firma(b.firma)); return; }
        cerrar();
        cuerpo += oculto ? tachadoB : bloque(b);
      });
      cerrar();
      const sub = pg.titulo && titulo.toLowerCase().indexOf(String(pg.titulo).toLowerCase()) < 0 ? `<p class="doc-subtitulo">${txt(pg.titulo)}</p>` : "";
      const meta = [doc.numero ? ["N.º", doc.numero] : null, doc.fecha ? ["Fecha", doc.fecha] : null, doc.version ? ["Versión", doc.version] : null, ["Hoja", (i + 1) + " de " + n]].filter(Boolean)
        .map(m => `<span class="doc-meta-i"><span class="doc-meta-k">${m[0]}</span> ${txt(m[1])}</span>`).join(`<span class="doc-meta-sep" aria-hidden="true"> · </span>`);
      const marcas = Math.max(1, Math.min(14, Math.round(bloques.reduce((a, b) => a + peso(b), 0) / 7)));
      return `<section class="doc-hoja"><div class="doc-marca" aria-hidden="true">${new Array(marcas).fill(`<span>${MARCA}</span>`).join("")}</div>
<header class="doc-cab"><div class="doc-emisor"><p class="doc-emisor-n">${txt(em.n || "Emisor sin nombre")}</p>${em.area ? `<p>${txt(em.area)}</p>` : ""}${em.id ? `<p>${txt(em.id)}</p>` : ""}${em.ciudad ? `<p>${txt(em.ciudad)}</p>` : ""}</div><div class="doc-cab-t"><h3 class="doc-titulo">${txt(titulo)}</h3>${sub}</div><p class="doc-meta">${meta}</p></header>
${i === 0 && doc.estadoNota ? `<p class="doc-estado"><b>Sobre este ejemplar:</b> ${txt(doc.estadoNota)}</p>` : ""}<div class="doc-cuerpo">${cuerpo}</div>
<footer class="doc-pie">${PIE} Hoja ${i + 1} de ${n}.</footer></section>`;
    };
    return `<div class="doc" data-tipo="${esc(doc.tipo || "")}">${paginas.map(hoja).join("")}</div>`;
  }

  return { html, figura };
})();
function docHtml(doc, opc) { return docR.html(doc, opc); }
function docFigura(fig) { return docR.figura(fig); }
