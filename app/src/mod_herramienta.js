/* ============================================================
   MÓDULO 3 · HERRAMIENTA FINANCIERA
   Componentes MF-05 a MF-11 del documento, operativos.
   ============================================================ */

/* --- utilidades de edición -------------------------------------------- */
function ed(col, i, campo, valor, num) {
  const c = estado.m[col];
  c[i][campo] = num ? (parseFloat(valor) || 0) : valor;
  guardar(); pintar();
}
function edObj(obj, campo, valor, num) {
  estado.m[obj][campo] = num ? (parseFloat(valor) || 0) : valor;
  guardar(); pintar();
}
function inp(col, i, campo, valor, tipo) {
  const num = tipo === 'number';
  return `<input type="${tipo || 'text'}" value="${esc(valor === null || valor === undefined ? '' : valor)}"
    onchange="ed('${col}',${i},'${campo}',this.value,${num})"
    ${num ? 'step="any"' : ''} style="min-width:80px">`;
}
function sel(col, i, campo, valor, opciones) {
  return `<select onchange="ed('${col}',${i},'${campo}',this.value,false)">${
    opciones.map(([v, t]) => `<option value="${esc(v)}" ${v === valor ? 'selected' : ''}>${esc(t)}</option>`).join('')
  }</select>`;
}
function huella(txt) {
  let a = 0x811c9dc5;
  for (let i = 0; i < txt.length; i++) { a ^= txt.charCodeAt(i); a = Math.imul(a, 0x01000193) >>> 0; }
  return a.toString(16).toUpperCase().padStart(8, '0');
}
function hashModelo(m) {
  return huella(JSON.stringify([m.proyecto.nombre, m.proyecto.version, m.tramos, m.covenants, m.flujo, m.liquidez]));
}
function descargarTexto(nombre, texto, mime) {
  const blob = new Blob([texto], { type: mime || 'text/csv;charset=utf-8' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob); a.download = nombre;
  document.body.appendChild(a); a.click();
  setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 1500);
}

const AVISO_EJEMPLO = () => avisoHTML('aten', 'Los valores de arranque son un ejemplo neutro',
  `<p style="margin:0">El documento <strong>no contiene ninguna cifra financiera</strong> —ni tasas, ni plazos,
   ni montos, ni umbrales, ni caja mínima— y es una decisión deliberada suya (§2.1). Lo que ves cargado es un
   ejemplo para que la herramienta pueda usarse desde el primer momento. <strong>No son datos de Rehavid.</strong></p>`);

/* ============================================================
   PANEL
   ============================================================ */
VISTAS['h-panel'] = () => {
  const m = estado.m;
  const r = calcular(m), s = resumen(r, m), v = validar(m);
  const criticos = v.filter(x => x.sev === 'critico');
  const cats = r.filas.map(f => 'P' + f.t);
  const cov = m.covenants[0] ? m.covenants[0].umbral : null;

  return cabecera('tableros', 'Panel del modelo',
    `${esc(m.proyecto.nombre || 'Proyecto sin nombre')} · versión ${m.proyecto.version} ·
     <span class="eti ${m.proyecto.estado === 'Aprobado' ? 'verde' : 'gris'}">${esc(m.proyecto.estado)}</span>`,
    `<button onclick="irSeccion('h-auditoria')">${ico('auditoria',15)} Auditar</button>
     <button class="sec" onclick="irSeccion('h-reportes')">${ico('reportes',15)} Reporte</button>
     <button class="sec" onclick="imprimir(false)">${ico('imprimir',15)} Imprimir</button>`) + `

  ${criticos.length
    ? avisoHTML('mal', `${criticos.length} bloqueo(s) impiden aprobar este modelo`,
        `<p style="margin:0">${criticos.slice(0,3).map(c => esc(c.titulo)).join(' · ')}${criticos.length>3?' · …':''}
         <button class="mini sec no-imprimir" style="margin-left:8px" onclick="irSeccion('h-auditoria')">Ver auditoría</button></p>`)
    : avisoHTML('ok', 'Sin bloqueos', '<p style="margin:0">El modelo cumple todas las validaciones críticas y puede pasar a revisión.</p>')}

  <div class="rejilla c5">
    ${tile('Deuda total', fmt(s.deudaTotal), `${m.tramos.length} tramo(s)`, '', 'deuda')}
    ${tile('DSCR mínimo', fmtN(s.dscrMin), cov !== null ? `covenant ${fmtN(cov)}` : 'sin covenant',
           s.dscrMin !== null && cov !== null && s.dscrMin < cov ? 'mal' : 'ok', 'covenant')}
    ${tile('Brecha mínima de caja', fmt(s.brechaMin), 'caja final − caja mínima',
           s.brechaMin < 0 ? 'mal' : 'ok', 'liquidez')}
    ${tile('Servicio total', fmt(s.servicioTotal), `interés ${fmt(s.interesTotal)}`, '', 'flujo')}
    ${tile('Factibilidad', s.factible ? 'Factible' : 'No factible',
           'cobertura y liquidez', s.factible ? 'ok' : 'mal', 'ok')}
  </div>

  ${figura('Perfil de deuda', 'Principal e interés por periodo · F1 y F2',
    barrasApiladas(cats, [
      { nombre:'Principal', color:PAL[0], valores: r.filas.map(f => f.principal) },
      { nombre:'Interés',   color:PAL[1], valores: r.filas.map(f => f.interes) }],
      { alto: 250 }),
    null, leyendaDe([[PAL[0],'Principal'],[PAL[1],'Interés']]))}

  <div class="rejilla c2">
    ${figura('Cobertura', 'DSCR por periodo frente al covenant · F4',
      lineaUmbral(cats, r.filas.map(f => f.dscr), cov, { alto: 240 }),
      'Los puntos rojos incumplen. «n/c» son periodos sin servicio de deuda (RN-FIN-02).')}
    ${figura('Liquidez', 'Caja final frente a la caja mínima · F6 y F7',
      areaLiquidez(cats, r.filas.map(f => f.cajaFin), r.filas.map(() => m.liquidez.cajaMin), { alto: 240 }),
      'Un punto bajo la línea roja es incumplimiento de liquidez aunque la cobertura cumpla.',
      leyendaDe([[PAL[0],'Caja final'],['#B23B5C','Caja mínima']]))}
  </div>

  <h2>Calendario</h2>
  ${tablaCalendario(r, m)}`;
};

function tablaCalendario(r, m) {
  return `<div class="tabla-caja"><table>
    <thead><tr><th>P</th><th class="num">Saldo inicial</th><th class="num">Interés</th><th class="num">Principal</th>
      <th class="num">Servicio</th><th class="num">Saldo final</th><th class="num">CFADS</th><th class="num">DSCR</th>
      <th class="num">Caja final</th><th class="num">Brecha</th></tr></thead>
    <tbody>${r.filas.map(f => `<tr class="${f.rompeCov || f.rompeLiq ? 'rompe' : ''}">
      <td>${f.t}</td>
      <td class="num">${fmt(f.saldoIni)}</td><td class="num">${fmt(f.interes)}</td>
      <td class="num">${fmt(f.principal)}</td><td class="num">${fmt(f.servicio)}</td>
      <td class="num">${fmt(f.saldoFin)}</td><td class="num">${fmt(f.cfads)}</td>
      <td class="num" style="font-weight:650;color:${f.dscr === null ? 'var(--ink-4)' : (f.rompeCov ? 'var(--bad)' : 'var(--good)')}">${fmtN(f.dscr)}</td>
      <td class="num">${fmt(f.cajaFin)}</td>
      <td class="num" style="color:${f.rompeLiq ? 'var(--bad)' : 'inherit'}">${fmt(f.brecha)}</td>
    </tr>`).join('')}</tbody>
  </table></div>`;
}

/* ============================================================
   PROYECTO · MF-05
   ============================================================ */
VISTAS['h-proyecto'] = () => {
  const p = estado.m.proyecto;
  return cabecera('proyecto', 'Proyecto', 'Propósito, alcance y parámetros. Sin esto el modelo no se aprueba (RF-009).',
    `<button class="sec" onclick="nuevoProyecto()">${ico('mas',15)} Nuevo</button>
     <button class="sec" onclick="cargarEjemplo()">${ico('refrescar',15)} Restaurar ejemplo</button>`) +
  AVISO_EJEMPLO() + `
  <div class="tarjeta">
    <div class="rejilla c2" style="margin:0">
      <div class="campo"><label class="requerido">Nombre del proyecto</label>
        <input type="text" value="${esc(p.nombre)}" onchange="edObj('proyecto','nombre',this.value)"></div>
      <div class="campo"><label class="requerido">Responsable</label>
        <input type="text" value="${esc(p.responsable)}" onchange="edObj('proyecto','responsable',this.value)"></div>
    </div>
    <div class="campo"><label class="requerido">Propósito · qué decisión debe apoyar</label>
      <textarea onchange="edObj('proyecto','proposito',this.value)">${esc(p.proposito)}</textarea></div>
    <div class="campo"><label class="requerido">Alcance y límites</label>
      <textarea onchange="edObj('proyecto','alcance',this.value)">${esc(p.alcance)}</textarea></div>
    <div class="rejilla c4" style="margin:0">
      <div class="campo"><label>Horizonte (periodos)</label>
        <input type="number" min="1" max="60" value="${p.horizonte}" onchange="edObj('proyecto','horizonte',this.value,true)"></div>
      <div class="campo"><label>Periodicidad</label>
        <select onchange="edObj('proyecto','periodicidad',this.value,true)">
          ${Object.entries(PERIODICIDAD).map(([k, t]) => `<option value="${k}" ${+k === p.periodicidad ? 'selected' : ''}>${t}</option>`).join('')}
        </select><div class="ayuda">RN-FIN-01: no se mezclan periodicidades sin conversión.</div></div>
      <div class="campo"><label>Moneda</label>
        <select onchange="edObj('proyecto','moneda',this.value)">
          ${MONEDAS.map(x => `<option ${x === p.moneda ? 'selected' : ''}>${x}</option>`).join('')}</select></div>
      <div class="campo"><label>Versión</label>
        <input type="number" min="1" value="${p.version}" disabled>
        <div class="ayuda">RN-FIN-07: una versión aprobada es inmutable.</div></div>
    </div>
    <div class="campo" style="margin-bottom:0"><label>Advertencia de uso</label>
      <textarea onchange="edObj('proyecto','advertencia',this.value)">${esc(p.advertencia)}</textarea>
      <div class="ayuda">§4.2 U1: la app exige declarar la advertencia antes de calcular.</div></div>
  </div>

  <h2>Estado del modelo</h2>
  <div class="pasos">${ESTADOS.map(([e]) => `<div class="paso ${e === estado.m.proyecto.estado ? 'activo' : ''}">
    <span class="n">${ESTADOS.findIndex(x => x[0] === e) + 1}</span>${esc(e)}</div>`).join('')}</div>
  <div class="barra-acc no-imprimir">
    <button onclick="cambiarEstado('Validación pendiente')">Enviar a validación</button>
    <button class="sec" onclick="cambiarEstado('En revisión')">Enviar a revisión</button>
    <button class="verde" onclick="aprobarModelo()">${ico('ok',15)} Aprobar versión</button>
    <span class="ayuda expandir">Aprobar exige que no queden hallazgos críticos en la auditoría.</span>
  </div>`;
};

function nuevoProyecto() {
  if (!confirm('Se creará un proyecto vacío y se perderá el modelo actual. ¿Continuar?')) return;
  estado.m = { proyecto: proyectoNuevo(), supuestos: [], tramos: [], flujo: [], covenants: [],
               liquidez: { caja0:0, cajaMin:0 }, escenarios: [], simulacion: null, backtest: [],
               decision: { responsable:'', fecha:'', comentario:'', residual:'', escenario:'' },
               revision: { revisor:'', hallazgos:[] } };
  guardar(); pintar(); toast('Proyecto nuevo creado', 'ok');
}
function cargarEjemplo() {
  estado.m = JSON.parse(JSON.stringify(EJEMPLO));
  guardar(); pintar(); toast('Ejemplo neutro restaurado', 'ok');
}
function cambiarEstado(e) {
  estado.m.proyecto.estado = e; guardar(); pintar();
  toast('Estado: ' + e);
}
function aprobarModelo() {
  if (!puedeAprobar(estado.m)) {
    toast('No se puede aprobar: hay hallazgos críticos sin resolver', 'mal');
    irSeccion('h-auditoria'); return;
  }
  estado.m.proyecto.estado = 'Aprobado';
  guardar(); pintar();
  toast('Versión aprobada y congelada (RN-FIN-07)', 'ok');
}

/* ============================================================
   SUPUESTOS · RF-010
   ============================================================ */
VISTAS['h-supuestos'] = () => {
  const S = estado.m.supuestos;
  return cabecera('supuestos', 'Supuestos', 'Cada supuesto debe identificar fuente, racional, responsable y tipo (RN-FIN-05 y RN-FIN-06).',
    `<button onclick="addSupuesto()">${ico('mas',15)} Añadir supuesto</button>`) + `
  ${avisoHTML('', 'Por qué se exige la fuente',
    '<p style="margin:0">Un supuesto sin fuente deja el modelo en borrador. No es burocracia: sin fuente nadie puede revisar de dónde salió el número ni decidir si sigue siendo válido.</p>')}
  ${S.length ? `<div class="tabla-caja"><table>
    <thead><tr><th style="width:180px">Variable</th><th class="num" style="width:90px">Valor</th>
      <th style="width:110px">Unidad</th><th style="width:110px">Tipo</th><th style="width:150px">Periodo</th>
      <th>Fuente</th><th>Racional</th><th style="width:130px">Responsable</th><th style="width:44px"></th></tr></thead>
    <tbody>${S.map((s, i) => `<tr>
      <td>${inp('supuestos', i, 'variable', s.variable)}</td>
      <td>${inp('supuestos', i, 'valor', s.valor, 'number')}</td>
      <td>${inp('supuestos', i, 'unidad', s.unidad)}</td>
      <td>${sel('supuestos', i, 'tipo', s.tipo, [['dato','Dato histórico'],['presupuesto','Presupuesto'],['proyeccion','Proyección']])}</td>
      <td>${inp('supuestos', i, 'periodo', s.periodo)}</td>
      <td>${inp('supuestos', i, 'fuente', s.fuente)}${!String(s.fuente||'').trim() ? '<div class="ayuda" style="color:var(--bad)">obligatoria</div>' : ''}</td>
      <td>${inp('supuestos', i, 'racional', s.racional)}</td>
      <td>${inp('supuestos', i, 'responsable', s.responsable)}</td>
      <td class="acc"><button class="mini peligro icono" onclick="borrar('supuestos',${i})">${ico('basura',14)}</button></td>
    </tr>`).join('')}</tbody></table></div>`
   : vacio('supuestos', 'No hay supuestos registrados. Todo valor que no sea un hecho verificable debería estar aquí, con su fuente.',
           '<button onclick="addSupuesto()">Añadir el primero</button>')}
  <p class="ayuda">${S.filter(s => String(s.fuente||'').trim()).length} de ${S.length} tienen fuente identificada.</p>`;
};
function addSupuesto() {
  estado.m.supuestos.push({ variable:'Nuevo supuesto', valor:0, unidad:'', periodo:'', fuente:'', racional:'', responsable:'', tipo:'proyeccion' });
  guardar(); pintar();
}
function borrar(col, i) { estado.m[col].splice(i, 1); guardar(); pintar(); }

/* ============================================================
   DEUDA · MF-06
   ============================================================ */
VISTAS['h-deuda'] = () => {
  const T = estado.m.tramos;
  const r = calcular(estado.m);
  return cabecera('deuda', 'Obligaciones de deuda', 'Un tramo por obligación. El calendario concilia periodo a periodo (F1) y separa principal de interés (RF-012).',
    `<button onclick="addTramo()">${ico('mas',15)} Añadir tramo</button>`) + `
  ${T.length ? `<div class="tabla-caja"><table>
    <thead><tr><th>Tramo</th><th class="num">Monto</th><th class="num">Tasa % anual</th>
      <th>Método</th><th class="num">Plazo</th><th class="num">Gracia</th><th class="num">Desde P</th>
      <th>Base de días</th><th style="width:44px"></th></tr></thead>
    <tbody>${T.map((t, i) => `<tr>
      <td>${inp('tramos', i, 'nombre', t.nombre)}</td>
      <td>${inp('tramos', i, 'monto', t.monto, 'number')}</td>
      <td>${inp('tramos', i, 'tasa', t.tasa, 'number')}</td>
      <td>${sel('tramos', i, 'metodo', t.metodo, Object.entries(METODOS))}</td>
      <td>${inp('tramos', i, 'plazo', t.plazo, 'number')}</td>
      <td>${inp('tramos', i, 'gracia', t.gracia, 'number')}</td>
      <td>${inp('tramos', i, 'desde', t.desde, 'number')}</td>
      <td>${sel('tramos', i, 'baseDias', t.baseDias, [['30/360','30/360'],['actual/360','actual/360'],['actual/365','actual/365']])}</td>
      <td class="acc"><button class="mini peligro icono" onclick="borrar('tramos',${i})">${ico('basura',14)}</button></td>
    </tr>`).join('')}</tbody></table></div>

  ${avisoHTML('', 'El método de amortización no se fija por defecto',
    '<p style="margin:0">§8.1 advierte expresamente que la app no debe fijar un método sin confirmación. Cuota fija, abono constante y pago al vencimiento producen perfiles de servicio muy distintos con el mismo monto y la misma tasa.</p>')}

  ${figura('Servicio agregado de todos los tramos', 'Principal e interés por periodo',
    barrasApiladas(r.filas.map(f => 'P' + f.t), [
      { nombre:'Principal', color:PAL[0], valores: r.filas.map(f => f.principal) },
      { nombre:'Interés',   color:PAL[1], valores: r.filas.map(f => f.interes) }], { alto: 240 }),
    null, leyendaDe([[PAL[0],'Principal'],[PAL[1],'Interés']]))}

  <h2>Calendario por tramo</h2>
  ${T.map((t, i) => `<h3>${esc(t.nombre)}</h3>
    <div class="tabla-caja"><table>
      <thead><tr><th>P</th><th class="num">Saldo inicial</th><th class="num">Interés</th>
        <th class="num">Principal</th><th class="num">Servicio</th><th class="num">Saldo final</th>
        <th class="num">Concilia</th></tr></thead>
      <tbody>${r.porTramo[i].filter(f => f.vivo).map(f => `<tr>
        <td>${f.t}</td><td class="num">${fmt(f.saldoIni)}</td><td class="num">${fmt(f.interes)}</td>
        <td class="num">${fmt(f.principal)}</td><td class="num">${fmt(f.servicio)}</td>
        <td class="num">${fmt(f.saldoFin)}</td>
        <td class="num">${Math.abs(f.saldoFin - (f.saldoIni - f.principal)) < 0.01
          ? '<span class="eti verde">sí</span>' : '<span class="eti roja">no</span>'}</td>
      </tr>`).join('')}</tbody></table></div>`).join('')}`
   : vacio('deuda', 'No hay obligaciones configuradas. Sin tramos no hay servicio de deuda, ni cobertura, ni capacidad.',
           '<button onclick="addTramo()">Añadir el primer tramo</button>')}`;
};
function addTramo() {
  estado.m.tramos.push({ nombre:'Tramo ' + String.fromCharCode(65 + estado.m.tramos.length),
    monto:0, tasa:0, metodo:'frances', gracia:0, plazo:estado.m.proyecto.horizonte, desde:1, baseDias:'30/360' });
  guardar(); pintar();
}

/* ============================================================
   FLUJO Y CFADS · MF-07
   ============================================================ */
VISTAS['h-flujo'] = () => {
  const F = estado.m.flujo;
  const r = calcular(estado.m);
  const elegibles = F.filter(l => l.elegible);
  return cabecera('flujo', 'Flujo de caja y mapeo del CFADS',
    'Marca qué partidas entran al flujo disponible para el servicio de deuda (F3). El mapeo debe aprobarse por proyecto.',
    `<button onclick="addLinea()">${ico('mas',15)} Añadir línea</button>`) + `

  ${avisoHTML('aten', 'CFADS no es utilidad ni EBITDA',
    '<p style="margin:0">La utilidad contiene partidas que no mueven caja; el EBITDA ignora capital de trabajo, impuestos e inversión. Poner cualquiera de los dos en el numerador del DSCR <strong>sobreestima la capacidad de pago</strong>. Marca como no elegible lo que no sea caja disponible de verdad.</p>')}

  ${F.length ? `<div class="tabla-caja"><table>
    <thead><tr><th>Concepto</th><th style="width:130px">Tipo</th><th class="num" style="width:120px">Valor P1</th>
      <th class="num" style="width:110px">Crecim. %</th><th style="width:110px">Elegible CFADS</th><th style="width:44px"></th></tr></thead>
    <tbody>${F.map((l, i) => `<tr style="${l.elegible ? '' : 'opacity:.62'}">
      <td>${inp('flujo', i, 'concepto', l.concepto)}</td>
      <td>${sel('flujo', i, 'tipo', l.tipo, [['ingreso','Ingreso'],['egreso','Egreso operativo'],['inversion','Inversión']])}</td>
      <td>${inp('flujo', i, 'valor', l.valor, 'number')}</td>
      <td>${inp('flujo', i, 'crec', l.crec, 'number')}</td>
      <td><button class="mini ${l.elegible ? 'verde' : 'sec'}" onclick="alternarElegible(${i})">
        ${ico(l.elegible ? 'ok' : 'cerrar', 13)} ${l.elegible ? 'Elegible' : 'Excluida'}</button></td>
      <td class="acc"><button class="mini peligro icono" onclick="borrar('flujo',${i})">${ico('basura',14)}</button></td>
    </tr>`).join('')}</tbody></table></div>

  <div class="rejilla c3">
    ${tile('Líneas elegibles', elegibles.length + ' de ' + F.length, 'entran al CFADS', '', 'ok')}
    ${tile('CFADS del periodo 1', fmt(r.filas[0] ? r.filas[0].cfads : 0), 'F3 aplicada', '', 'flujo')}
    ${tile('CFADS total del horizonte', fmt(r.filas.reduce((a, f) => a + f.cfads, 0)), '', '', 'tableros')}
  </div>

  ${figura('CFADS frente al servicio de deuda', 'La distancia entre las dos series es la holgura de cobertura',
    barrasApiladas(r.filas.map(f => 'P' + f.t), [
      { nombre:'CFADS',   color:PAL[1], valores: r.filas.map(f => Math.max(0, f.cfads)) }], { alto: 210 }),
    'Compara con el perfil de servicio del panel: donde el servicio se acerca al CFADS, el DSCR cae.')}`
   : vacio('flujo', 'No hay líneas de flujo. Sin ellas el CFADS es cero y el DSCR carece de sentido.',
           '<button onclick="addLinea()">Añadir la primera línea</button>')}`;
};
function addLinea() {
  estado.m.flujo.push({ concepto:'Nueva línea', tipo:'ingreso', valor:0, crec:0, elegible:true });
  guardar(); pintar();
}
function alternarElegible(i) { estado.m.flujo[i].elegible = !estado.m.flujo[i].elegible; guardar(); pintar(); }

/* ============================================================
   COVENANTS · MF-07
   ============================================================ */
VISTAS['h-covenants'] = () => {
  const C = estado.m.covenants;
  return cabecera('covenant', 'Covenants', 'Condición contractual verificable. La app no inventa el umbral: sale del contrato o de una política identificada.',
    `<button onclick="addCovenant()">${ico('mas',15)} Añadir covenant</button>`) + `

  ${avisoHTML('', 'Cinco campos, no uno',
    '<p style="margin:0">Registrar solo el umbral deja fuera lo que determina el efecto real del incumplimiento. RN-FIN-03 exige tipo, umbral, periodo, fuente y vigencia; el periodo de cura y la consecuencia distinguen un incumplimiento subsanable de una aceleración inmediata.</p>')}

  ${C.length ? `<div class="tabla-caja"><table>
    <thead><tr><th>Indicador</th><th class="num" style="width:90px">Umbral</th><th style="width:120px">Frecuencia</th>
      <th style="width:110px">Periodo de cura</th><th>Consecuencia</th><th>Fuente</th>
      <th class="num" style="width:70px">Desde P</th><th class="num" style="width:70px">Hasta P</th><th style="width:44px"></th></tr></thead>
    <tbody>${C.map((c, i) => `<tr>
      <td>${inp('covenants', i, 'indicador', c.indicador)}</td>
      <td>${inp('covenants', i, 'umbral', c.umbral, 'number')}</td>
      <td>${sel('covenants', i, 'frecuencia', c.frecuencia, [['Cada periodo','Cada periodo'],['Anual','Anual'],['Semestral','Semestral']])}</td>
      <td>${inp('covenants', i, 'cura', c.cura)}</td>
      <td>${inp('covenants', i, 'consecuencia', c.consecuencia)}</td>
      <td>${inp('covenants', i, 'fuente', c.fuente)}${!String(c.fuente||'').trim() ? '<div class="ayuda" style="color:var(--bad)">sin fuente no se aprueba</div>' : ''}</td>
      <td>${inp('covenants', i, 'desde', c.desde, 'number')}</td>
      <td>${inp('covenants', i, 'hasta', c.hasta, 'number')}</td>
      <td class="acc"><button class="mini peligro icono" onclick="borrar('covenants',${i})">${ico('basura',14)}</button></td>
    </tr>`).join('')}</tbody></table></div>
  <p class="ayuda">«Hasta P» en 0 significa vigente hasta el final del horizonte.</p>`
   : vacio('covenant', 'No hay covenants registrados. Sin restricciones el modelo no mide nada: cualquier monto parecería viable.',
           '<button onclick="addCovenant()">Añadir el primero</button>')}`;
};
function addCovenant() {
  estado.m.covenants.push({ indicador:'DSCR mínimo', umbral:1.0, frecuencia:'Cada periodo',
    cura:'', consecuencia:'', fuente:'', desde:1, hasta:0 });
  guardar(); pintar();
}

/* ============================================================
   LIQUIDEZ · MF-08
   ============================================================ */
VISTAS['h-liquidez'] = () => {
  const m = estado.m;
  const r = calcular(m), s = resumen(r, m);
  const cats = r.filas.map(f => 'P' + f.t);
  return cabecera('liquidez', 'Liquidez', 'Caja mínima como política del caso, no como valor universal (§8.4). Cobertura y liquidez son restricciones distintas.') + `

  <div class="tarjeta">
    <div class="rejilla c2" style="margin:0">
      <div class="campo"><label>Caja inicial</label>
        <input type="number" value="${m.liquidez.caja0}" onchange="edObj('liquidez','caja0',this.value,true)"></div>
      <div class="campo"><label>Caja mínima exigida</label>
        <input type="number" value="${m.liquidez.cajaMin}" onchange="edObj('liquidez','cajaMin',this.value,true)">
        <div class="ayuda">Puede venir de un contrato (caja de reserva) o de una política interna. Debe tener fuente.</div></div>
    </div>
  </div>

  <div class="rejilla c3">
    ${tile('Caja mínima alcanzada', fmt(s.cajaMinAlcanzada), 'en todo el horizonte',
           s.cajaMinAlcanzada < m.liquidez.cajaMin ? 'mal' : 'ok', 'liquidez')}
    ${tile('Brecha mínima', fmt(s.brechaMin), 'caja final − mínimo', s.brechaMin < 0 ? 'mal' : 'ok', 'flujo')}
    ${tile('Periodos en déficit', String(s.fLiq.length), s.fLiq.length ? 'P' + s.fLiq.map(f => f.t).join(', P') : 'ninguno',
           s.fLiq.length ? 'mal' : 'ok', 'alerta')}
  </div>

  ${s.fLiq.length && !s.fCov.length
    ? avisoHTML('mal', 'Caso CP-010 en curso',
        '<p style="margin:0">La cobertura se cumple en todos los periodos y aun así la caja cae por debajo del mínimo. El escenario queda <strong>no factible por liquidez</strong>. Es exactamente el caso que el documento convierte en prueba de aceptación: pagar la cuota no basta.</p>')
    : ''}

  ${figura('Evolución de la caja', 'Caja final frente a la caja mínima · F6 y F7',
    areaLiquidez(cats, r.filas.map(f => f.cajaFin), r.filas.map(() => m.liquidez.cajaMin)),
    null, leyendaDe([[PAL[0],'Caja final'],['#B23B5C','Caja mínima']]))}

  <h2>Detalle por periodo</h2>
  <div class="tabla-caja"><table>
    <thead><tr><th>P</th><th class="num">Caja inicial</th><th class="num">CFADS</th><th class="num">Servicio</th>
      <th class="num">Caja final</th><th class="num">Brecha</th><th>Causa principal</th></tr></thead>
    <tbody>${r.filas.map(f => `<tr class="${f.rompeLiq ? 'rompe' : ''}">
      <td>${f.t}</td><td class="num">${fmt(f.cajaIni)}</td><td class="num">${fmt(f.cfads)}</td>
      <td class="num">${fmt(f.servicio)}</td><td class="num">${fmt(f.cajaFin)}</td>
      <td class="num">${fmt(f.brecha)}</td>
      <td>${f.rompeLiq
        ? (f.servicio > f.cfads ? 'El servicio de deuda supera el CFADS del periodo' : 'Caja de arrastre insuficiente')
        : '<span style="color:var(--ink-5)">—</span>'}</td>
    </tr>`).join('')}</tbody></table></div>`;
};

/* ============================================================
   CAPACIDAD · RF-015
   ============================================================ */
VISTAS['h-capacidad'] = () => cabecera('capacidad', 'Capacidad máxima de deuda',
  'F5 · maximizar el monto sujeto a que todas las restricciones se cumplan en todos los periodos.',
  `<button onclick="correrCapacidad()">${ico('calcular',15)} Calcular capacidad</button>`) + `
  ${avisoHTML('', 'Cómo se resuelve',
    '<p style="margin:0">§8.3 admite búsqueda iterativa, optimización o Goal Seek, y no fija tolerancia de convergencia. Esta app escala proporcionalmente los tramos y busca el factor máximo por <strong>bisección con 60 iteraciones</strong>. Es una decisión de implementación, no algo que el documento imponga.</p>')}
  <div id="cap-salida">${vacio('capacidad', 'Pulsa «Calcular capacidad» para resolver el problema con la configuración actual de deuda, covenants y liquidez.')}</div>`;

function correrCapacidad() {
  const m = estado.m;
  const cap = capacidad(m);
  const base = m.tramos.reduce((a, t) => a + t.monto, 0);
  const dura = JSON.parse(JSON.stringify(m));
  dura.covenants.forEach(c => c.umbral *= 1.15);
  const capDura = capacidad(dura);
  const monotonia = capDura.monto <= cap.monto + 1;

  $('#cap-salida').innerHTML = `
    <div class="rejilla c3">
      ${tile('Monto máximo factible', fmt(cap.monto), `configurado ahora: ${fmt(base)}`, '', 'capacidad')}
      ${tile('Restricción vinculante', `<span style="font-size:14px;line-height:1.35">${esc(cap.vinculante)}</span>`,
             'RF-015 exige identificarla', '', 'covenant')}
      ${tile('Factor sobre lo configurado', fmtN(cap.factor) + '×',
             cap.factor >= 1 ? 'hay margen' : 'la estructura actual excede el máximo',
             cap.factor >= 1 ? 'ok' : 'mal', 'flujo')}
    </div>
    ${avisoHTML(monotonia ? 'ok' : 'mal', 'Comprobación de monotonía · CP-009',
      `<p style="margin:0">Con los covenants endurecidos un 15 %, la capacidad pasa de ${fmt(cap.monto)} a ${fmt(capDura.monto)}.
       ${monotonia ? 'No aumenta, como exige el caso de prueba: una restricción más exigente reduce o mantiene el conjunto factible.'
                   : '<strong>Aumenta, lo que indica un error en el motor.</strong>'}</p>`)}
    ${cap.periodosCriticos && cap.periodosCriticos.length
      ? `<p class="ayuda">Periodos críticos justo por encima del máximo: ${cap.periodosCriticos.map(t => 'P' + t).join(', ')}.</p>` : ''}
    ${avisoHTML('aten', 'Capacidad matemática no es monto recomendado',
      '<p style="margin:0">En el máximo la holgura es cero: cualquier desviación del CFADS produce incumplimiento. El documento separa capacidad matemática de decisión prudencial (§4.2 U4) y excluye de su alcance las recomendaciones financieras automáticas (§1.4).</p>')}`;
}

/* ============================================================
   ESCENARIOS · RF-017
   ============================================================ */
VISTAS['h-escenarios'] = () => {
  const E = estado.m.escenarios;
  return cabecera('escenarios', 'Escenarios', 'Duplicar, modificar y comparar sin alterar el original (RF-017).',
    `<button onclick="guardarEscenario()">${ico('guardar',15)} Guardar el modelo actual</button>`) + `
  ${avisoHTML('', 'Cómo se usan',
    `<p>Configura el modelo, guárdalo como escenario y luego cambia lo que quieras comparar: el covenant, la caja
     mínima, el método de amortización, el CFADS o el monto. Cada escenario conserva su propia copia de tramos,
     flujo, covenants y liquidez, de modo que <strong>modificar el modelo no altera los escenarios guardados</strong> (RF-017).</p>
     <p style="margin:0">La tabla compara en valor absoluto; el gráfico ordena por DSCR mínimo alcanzado. Un escenario
     no factible incumple cobertura, liquidez o ambas.</p>`)}
  ${E.length ? `<div class="tabla-caja"><table>
    <thead><tr><th>Escenario</th><th class="num">Deuda</th><th class="num">DSCR mín.</th><th class="num">Brecha mín.</th>
      <th class="num">Servicio total</th><th>Factible</th><th style="width:150px"></th></tr></thead>
    <tbody>${E.map((e, i) => `<tr>
      <td><strong>${esc(e.nombre)}</strong><div class="ayuda">${esc(e.fecha)}</div></td>
      <td class="num">${fmt(e.r.deudaTotal)}</td>
      <td class="num" style="color:${e.r.factible ? 'var(--good)' : 'var(--bad)'}">${fmtN(e.r.dscrMin)}</td>
      <td class="num">${fmt(e.r.brechaMin)}</td>
      <td class="num">${fmt(e.r.servicioTotal)}</td>
      <td><span class="eti ${e.r.factible ? 'verde' : 'roja'}">${e.r.factible ? 'Factible' : 'No factible'}</span></td>
      <td class="acc">
        <button class="mini sec" onclick="cargarEscenario(${i})">${ico('subir',13)} Cargar</button>
        <button class="mini peligro icono" onclick="borrar('escenarios',${i})">${ico('basura',13)}</button></td>
    </tr>`).join('')}</tbody></table></div>

  ${E.length > 1 ? figura('Comparación de escenarios', 'DSCR mínimo alcanzado en cada uno',
      barrasH(E.map(e => [e.nombre.slice(0, 30), Math.round((e.r.dscrMin || 0) * 100) / 100]),
              { anchoEtq: 200, color: (d, i) => E[i].r.factible ? PAL[1] : PAL[6] }),
      'Verde: escenario factible. Rojo: incumple alguna restricción.') : ''}`
   : vacio('escenarios', 'No hay escenarios guardados. Configura el modelo, guárdalo como escenario y modifica los parámetros para comparar.',
           '<button onclick="guardarEscenario()">Guardar el actual</button>')}`;
};
function guardarEscenario() {
  const nombre = prompt('Nombre del escenario:', 'Escenario ' + (estado.m.escenarios.length + 1));
  if (!nombre) return;
  const r = resumen(calcular(estado.m), estado.m);
  estado.m.escenarios.push({
    nombre, fecha: new Date().toLocaleString('es-CO'),
    copia: JSON.parse(JSON.stringify({ tramos: estado.m.tramos, flujo: estado.m.flujo,
      covenants: estado.m.covenants, liquidez: estado.m.liquidez, proyecto: estado.m.proyecto })),
    r: { deudaTotal:r.deudaTotal, dscrMin:r.dscrMin, brechaMin:r.brechaMin,
         servicioTotal:r.servicioTotal, factible:r.factible }
  });
  guardar(); pintar(); toast('Escenario guardado', 'ok');
}
function cargarEscenario(i) {
  const e = estado.m.escenarios[i];
  Object.assign(estado.m, JSON.parse(JSON.stringify(e.copia)));
  guardar(); pintar(); toast('Escenario «' + e.nombre + '» cargado');
}

/* ============================================================
   SIMULACIÓN · MF-09
   ============================================================ */
VISTAS['h-simulacion'] = () => {
  const m = estado.m, sim = m.simulacion;
  const h = hashModelo(m);
  return cabecera('simulacion', 'Simulación con Risk Simulator',
    'Interoperabilidad asistida por archivos (§9.2). La app no ejecuta el motor: exporta, tú simulas en Excel, la app importa.',
    `<button onclick="exportarEspec()">${ico('descarga',15)} Exportar especificación</button>
     <button class="sec" onclick="$('#imp-sim').click()">${ico('subir',15)} Importar resultados</button>
     <input type="file" id="imp-sim" accept=".csv,text/csv" style="display:none" onchange="importarResultados(this)">`) + `

  ${avisoHTML('', 'Lo que hace y lo que no hace esta pantalla',
    `<p>El producto mínimo del documento <strong>no ejecuta Risk Simulator</strong>: exporta una especificación
     identificada, tú la corres en Excel con el complemento, y la app importa los resultados validando que
     correspondan al mismo modelo y versión (RF-019, CP-011). Los resultados importados se marcan como
     <em>externa importada</em> y nunca se presentan como cálculo nativo (§9.2, paso 7).</p>
     <p style="margin:0">Huella de este modelo: <code>${h}</code></p>`)}

  <div class="pasos">
    ${['Validar determinístico','Exportar especificación','Simular en Excel','Importar resultados','Interpretar']
      .map((p, i) => `<div class="paso ${sim && i < 4 ? 'hecho' : (i === 0 ? 'activo' : '')}">
        <span class="n">${i + 1}</span>${p}</div>`).join('')}
  </div>

  <h2>Variables inciertas declaradas</h2>
  <div class="tabla-caja"><table>
    <thead><tr><th>Variable</th><th>Distribución</th><th class="num">Parámetro 1</th><th class="num">Parámetro 2</th>
      <th>Justificación</th><th style="width:44px"></th></tr></thead>
    <tbody>${(m.simEntradas || []).map((e, i) => `<tr>
      <td>${inp('simEntradas', i, 'variable', e.variable)}</td>
      <td>${sel('simEntradas', i, 'distribucion', e.distribucion,
          [['Normal','Normal'],['Triangular','Triangular'],['Uniforme','Uniforme'],['PERT','PERT'],['Lognormal','Lognormal']])}</td>
      <td>${inp('simEntradas', i, 'p1', e.p1, 'number')}</td>
      <td>${inp('simEntradas', i, 'p2', e.p2, 'number')}</td>
      <td>${inp('simEntradas', i, 'justificacion', e.justificacion)}${!String(e.justificacion||'').trim()
          ? '<div class="ayuda" style="color:var(--warn)">sin justificación no se publica (CP-012)</div>' : ''}</td>
      <td class="acc"><button class="mini peligro icono" onclick="borrar('simEntradas',${i})">${ico('basura',14)}</button></td>
    </tr>`).join('') || `<tr><td colspan="6" style="text-align:center;color:var(--ink-4);padding:18px">
      Ninguna variable declarada todavía.</td></tr>`}</tbody></table></div>
  <button class="sec no-imprimir" onclick="addVarSim()">${ico('mas',15)} Añadir variable incierta</button>

  <h2>Resultados importados</h2>
  ${sim ? `
    ${avisoHTML('ok', 'Ejecución externa importada',
      `<p style="margin:0">Archivo: <code>${esc(sim.archivo)}</code> · modelo <code>${esc(sim.modelo)}</code>
       versión ${sim.version} · huella <code>${esc(sim.hash)}</code> · importado el ${esc(sim.fecha)}.
       <strong>Calculado por Risk Simulator</strong>, no por esta app.</p>`)}
    <div class="tabla-caja"><table>
      <thead><tr><th>Variable de salida</th><th class="num">Media</th><th class="num">Mediana</th>
        <th class="num">Desv.</th><th class="num">P5</th><th class="num">P50</th><th class="num">P95</th></tr></thead>
      <tbody>${sim.salidas.map(s => `<tr><td>${esc(s.variable)}</td>
        <td class="num">${esc(s.media)}</td><td class="num">${esc(s.mediana)}</td><td class="num">${esc(s.desv)}</td>
        <td class="num">${esc(s.p5)}</td><td class="num">${esc(s.p50)}</td><td class="num">${esc(s.p95)}</td></tr>`).join('')}
      </tbody></table></div>
    ${avisoHTML('aten', 'Un percentil no es un pronóstico',
      '<p style="margin:0">§8.5 prohíbe convertir un percentil en «resultado esperado» sin explicar qué representa. El P50 es la mediana de un conjunto de escenarios condicionados a los supuestos declarados, no una previsión.</p>')}
    <button class="peligro no-imprimir" onclick="estado.m.simulacion=null;guardar();pintar()">Descartar la importación</button>`
   : vacio('simulacion', 'No hay resultados importados. Exporta la especificación, ejecútala en Excel con Risk Simulator y trae de vuelta el archivo de resultados.')}

  <h2>Probabilidad de ruptura</h2>
  ${avisoHTML('mal', 'El documento no define qué es una «ruptura»',
    `<p style="margin:0">§8.5 define la probabilidad de ruptura como «corridas válidas con al menos una ruptura ÷ corridas válidas
     totales × 100», pero no dice si ruptura es incumplir el covenant, quedar bajo la caja mínima, cualquiera de las dos o
     ambas a la vez, ni si «al menos una» se refiere a periodos o a restricciones. <strong>Esta app no calcula el indicador
     hasta que Rehavid fije la definición</strong>, porque el número cambia según la elección.</p>`)}`;
};

function addVarSim() {
  if (!estado.m.simEntradas) estado.m.simEntradas = [];
  estado.m.simEntradas.push({ variable:'', distribucion:'Triangular', p1:0, p2:0, justificacion:'' });
  guardar(); pintar();
}

function exportarEspec() {
  const m = estado.m, h = hashModelo(m);
  const l = [];
  l.push('REHAVID_SIMULACION_SPEC');
  l.push('modelo,' + (m.proyecto.nombre || 'sin nombre'));
  l.push('version,' + m.proyecto.version);
  l.push('huella,' + h);
  l.push('generado,' + new Date().toISOString());
  l.push('');
  l.push('---ENTRADAS---');
  l.push('variable,distribucion,parametro1,parametro2,justificacion');
  (m.simEntradas || []).forEach(e =>
    l.push([e.variable, e.distribucion, e.p1, e.p2, String(e.justificacion || '').replace(/,/g, ';')].join(',')));
  l.push('');
  l.push('---SALIDAS_SOLICITADAS---');
  l.push('variable');
  ['DSCR minimo', 'Brecha minima de caja', 'Servicio total'].forEach(s => l.push(s));
  l.push('');
  l.push('---RESULTADOS--- (rellenar en Excel tras ejecutar Risk Simulator)');
  l.push('variable,media,mediana,desviacion,p5,p50,p95');
  ['DSCR minimo', 'Brecha minima de caja', 'Servicio total'].forEach(s => l.push(s + ',,,,,,'));
  descargarTexto('Rehavid_simulacion_spec_' + h + '.csv', l.join('\n'));
  toast('Especificación exportada. Ábrela en Excel y ejecuta Risk Simulator.', 'ok');
}

function importarResultados(inputEl) {
  const f = inputEl.files[0];
  if (!f) return;
  const lector = new FileReader();
  lector.onload = () => {
    try {
      const lineas = String(lector.result).split(/\r?\n/).map(x => x.trim());
      const valor = k => { const l = lineas.find(x => x.toLowerCase().startsWith(k + ',')); return l ? l.slice(k.length + 1) : ''; };
      const hArchivo = valor('huella');
      const hActual = hashModelo(estado.m);
      // RF-019 y CP-011: se rechaza si no corresponde al modelo y versión exportados
      if (!lineas[0] || !/REHAVID_SIMULACION/.test(lineas[0])) {
        toast('El archivo no tiene el formato de plantilla de Rehavid', 'mal'); return;
      }
      if (hArchivo !== hActual) {
        toast('Importación rechazada: la huella no corresponde a este modelo (CP-011)', 'mal');
        estado.m.revision.hallazgos.push({ fecha: new Date().toLocaleString('es-CO'),
          texto: `Importación rechazada. Huella del archivo ${hArchivo}, huella del modelo ${hActual}.` });
        guardar(); return;
      }
      const i0 = lineas.findIndex(x => x.startsWith('---RESULTADOS---'));
      if (i0 < 0) { toast('El archivo no trae bloque de resultados', 'mal'); return; }
      const salidas = [];
      for (let i = i0 + 2; i < lineas.length; i++) {
        if (!lineas[i] || lineas[i].startsWith('---')) break;
        const c = lineas[i].split(',');
        if (c.length < 7 || c.slice(1).every(x => !x)) continue;
        salidas.push({ variable:c[0], media:c[1], mediana:c[2], desv:c[3], p5:c[4], p50:c[5], p95:c[6] });
      }
      if (!salidas.length) { toast('El bloque de resultados está vacío: rellénalo en Excel', 'mal'); return; }
      estado.m.simulacion = {
        archivo: f.name, modelo: valor('modelo'), version: valor('version') || estado.m.proyecto.version,
        hash: hArchivo, fecha: new Date().toLocaleString('es-CO'), salidas,
        entradas: (estado.m.simEntradas || [])
      };
      guardar(); pintar();
      toast('Resultados importados y marcados como ejecución externa', 'ok');
    } catch (e) {
      toast('No se pudo leer el archivo: ' + e.message, 'mal');
    }
  };
  lector.readAsText(f);
  inputEl.value = '';
}

/* ============================================================
   AUDITORÍA · MF-10 · RF-022
   ============================================================ */
VISTAS['h-auditoria'] = () => {
  const v = validar(estado.m);
  const nc = v.filter(x => x.sev === 'critico').length;
  const nm = v.filter(x => x.sev === 'medio').length;
  return cabecera('auditoria', 'Auditoría del modelo',
    'Validaciones de fórmula, periodo, saldo, unidad y fuente (RF-022). Cada hallazgo muestra la regla que lo produjo.',
    `<button class="sec" onclick="pintar()">${ico('refrescar',15)} Volver a auditar</button>`) + `

  ${avisoHTML('', 'Motor de análisis, sin conexión y sin IA',
    `<p style="margin:0">Aplica <strong>${REGLAS_VALIDACION.length} reglas explícitas</strong> derivadas de los requisitos y las reglas
     RN-FIN del documento. Es reproducible —siempre da el mismo resultado— y auditable, porque la regla va escrita
     bajo cada hallazgo. <strong>No sustituye la revisión de un profesional</strong>: señala puntos a verificar.</p>`)}

  <div class="rejilla c4">
    ${tile('Hallazgos', String(v.length), '', v.length ? '' : 'ok', 'auditoria')}
    ${tile('Críticos', String(nc), 'bloquean la aprobación', nc ? 'mal' : 'ok', 'error')}
    ${tile('Medios', String(nm), 'conviene resolverlos', nm ? 'aten' : 'ok', 'alerta')}
    ${tile('Reglas ejecutadas', String(REGLAS_VALIDACION.length), 'sobre el modelo actual', '', 'ok')}
  </div>

  ${v.length ? v.sort((a, b) => ({critico:0,medio:1,leve:2}[a.sev] - {critico:0,medio:1,leve:2}[b.sev])).map(x => `
    <div class="hallazgo ${x.sev}">
      <div class="cab"><span class="cod">${x.cod}</span>
        <span class="tit">${esc(x.titulo)}</span>
        <span class="eti ${x.sev === 'critico' ? 'roja' : (x.sev === 'medio' ? 'ambar' : 'gris')}">${x.sev}</span>
        <button class="mini sec no-imprimir" onclick="irSeccion('h-${x.donde === 'flujo' ? 'flujo' : x.donde}')">Ir a ${esc(x.donde)}</button>
      </div>
      <div class="cuerpo">${esc(x.detalle)}</div>
      <div class="regla"><strong>Regla ${x.cod}:</strong> ${esc(x.regla)}</div>
    </div>`).join('')
   : avisoHTML('ok', 'Sin hallazgos', '<p style="margin:0">El modelo pasa las validaciones. Esto no garantiza que sea correcto: garantiza que cumple las reglas comprobables. La revisión por pares sigue siendo necesaria (§4.2 U7).</p>')}

  <h2>Controles de calidad del dato</h2>
  <p>El documento define ocho controles en §10.2. Los que esta app aplica van marcados.</p>
  <div class="tabla-caja"><table>
    <thead><tr><th>Control</th><th style="width:110px">En esta app</th></tr></thead>
    <tbody>${CONTROLES_DATO.map((c, i) => `<tr><td>${esc(c)}</td>
      <td>${[0,1,2,4,5,7].includes(i) ? '<span class="eti verde">aplicado</span>' : '<span class="eti gris">del producto</span>'}</td>
    </tr>`).join('')}</tbody></table></div>`;
};

/* ============================================================
   BACKTESTING · RF-024
   ============================================================ */
VISTAS['h-backtest'] = () => {
  const B = estado.m.backtest;
  const r = calcular(estado.m);
  return cabecera('backtesting', 'Backtesting',
    'Comparar la proyección archivada con lo observado. La proyección original nunca se reescribe (CP-014).',
    `<button onclick="addBacktest()">${ico('mas',15)} Añadir observación</button>`) + `

  ${avisoHTML('', 'La proyección no se toca',
    '<p style="margin:0">El valor proyectado se toma del modelo y queda fijado al registrar la observación. Reescribir la proyección con información posterior destruye la única evidencia de qué se creía en su momento.</p>')}

  ${B.length ? `<div class="tabla-caja"><table>
    <thead><tr><th style="width:90px">Periodo</th><th style="width:170px">Variable</th>
      <th class="num">Proyectado</th><th class="num">Observado</th><th class="num">Desv. absoluta</th>
      <th class="num">Desv. relativa</th><th>Causa</th><th style="width:44px"></th></tr></thead>
    <tbody>${B.map((b, i) => {
      const d = desviacion(b.observado, b.proyectado);
      return `<tr>
        <td>P${b.periodo}</td><td>${esc(b.variable)}</td>
        <td class="num">${fmt(b.proyectado)}<div class="ayuda">fijado</div></td>
        <td>${inp('backtest', i, 'observado', b.observado, 'number')}</td>
        <td class="num">${fmt(d.abs)}</td>
        <td class="num">${d.rel === null
          ? '<span class="eti gris">No aplicable</span>'
          : fmtN(d.rel, 1) + ' %'}</td>
        <td>${inp('backtest', i, 'causa', b.causa)}</td>
        <td class="acc"><button class="mini peligro icono" onclick="borrar('backtest',${i})">${ico('basura',14)}</button></td>
      </tr>`; }).join('')}</tbody></table></div>

  ${avisoHTML('aten', 'Cuándo la desviación relativa no informa',
    '<p style="margin:0">§8.6 exige mostrar «No aplicable» cuando la base de comparación es cero, negativa o no comparable. Una desviación de tres cifras sobre una base cercana a cero distorsiona todo el tablero de error.</p>')}`
   : vacio('backtesting', 'No hay observaciones registradas. Cuando existan datos reales posteriores, regístralos aquí para comparar con lo proyectado.',
           '<button onclick="addBacktest()">Registrar la primera</button>')}`;
};
function addBacktest() {
  const r = calcular(estado.m);
  const t = parseInt(prompt('¿Periodo observado? (1 a ' + r.H + ')', '1'), 10);
  if (!t || t < 1 || t > r.H) return;
  const f = r.filas[t - 1];
  estado.m.backtest.push({ periodo:t, variable:'CFADS', proyectado: Math.round(f.cfads),
    observado: Math.round(f.cfads), causa:'', fecha: new Date().toISOString().slice(0, 10) });
  guardar(); pintar();
}

/* ============================================================
   DECISIÓN · RF-028
   ============================================================ */
VISTAS['h-decision'] = () => {
  const d = estado.m.decision;
  return cabecera('decision', 'Registro de la decisión',
    'RN-FIN-10 · responsable, fecha, comentario y riesgo residual. No se cierra sin responsable.') + `
  <div class="tarjeta">
    <div class="rejilla c3" style="margin:0">
      <div class="campo"><label class="requerido">Responsable</label>
        <input type="text" value="${esc(d.responsable)}" onchange="edObj('decision','responsable',this.value)"></div>
      <div class="campo"><label>Fecha</label>
        <input type="date" value="${esc(d.fecha)}" onchange="edObj('decision','fecha',this.value)"></div>
      <div class="campo"><label>Escenario elegido</label>
        <select onchange="edObj('decision','escenario',this.value)">
          <option value="">— sin escenario —</option>
          ${estado.m.escenarios.map(e => `<option ${e.nombre === d.escenario ? 'selected' : ''}>${esc(e.nombre)}</option>`).join('')}
        </select></div>
    </div>
    <div class="campo"><label class="requerido">Comentario · qué se decide y por qué</label>
      <textarea onchange="edObj('decision','comentario',this.value)">${esc(d.comentario)}</textarea></div>
    <div class="campo" style="margin-bottom:0"><label class="requerido">Riesgo residual · qué sigue sin saberse</label>
      <textarea onchange="edObj('decision','residual',this.value)">${esc(d.residual)}</textarea>
      <div class="ayuda">Define qué hay que vigilar y bajo qué condición se revisa la decisión. Sin esto, una decisión tomada bajo supuestos que dejaron de ser ciertos sigue vigente por inercia.</div></div>
  </div>
  ${avisoHTML('', 'La app apoya la decisión, no la toma',
    '<p style="margin:0">§3.1 · «La app apoya la decisión; no la presenta como verdad automática». El alcance del documento excluye expresamente las recomendaciones financieras automáticas sin revisión humana (§1.4).</p>')}`;
};

/* ============================================================
   REPORTES · RF-027
   ============================================================ */
VISTAS['h-reportes'] = () => {
  const m = estado.m;
  const r = calcular(m), s = resumen(r, m), v = validar(m);
  return cabecera('reportes', 'Reporte del modelo',
    'Incluye modelo, versión, responsable, fuentes y advertencias (RF-027, CP-016).',
    `<button onclick="imprimir(false)">${ico('imprimir',15)} Imprimir reporte</button>
     <button class="sec" onclick="exportarModelo()">${ico('descarga',15)} Modelo (JSON)</button>
     <button class="verde" onclick="descargarExcel()">${ico('calcular',15)} Libro Excel</button>`) + `

  ${avisoHTML('', 'Libro Excel de la herramienta financiera',
    `<p>Descarga el modelo como libro de Excel con macros: parámetros, calendario con fórmulas vivas,
     tramos, supuestos, covenants, escenarios y el diagrama de flujo editable.
     <strong>Contiene solo la herramienta financiera</strong>, ningún material de formación.</p>
     <p style="margin:0"><strong>Las macros llegan bloqueadas.</strong> Excel bloquea las macros de los archivos
     descargados: clic derecho sobre el archivo → Propiedades → Desbloquear. Si no lo haces, el libro sigue siendo
     plenamente utilizable, porque las fórmulas, los gráficos y el formato condicional son nativos; las macros solo
     añaden el redibujado del flujo, la iteración de escenarios y el cálculo de capacidad.</p>`)}

  <div class="tarjeta">
    <div class="tarjeta-cab"><h3>${esc(m.proyecto.nombre || 'Proyecto sin nombre')}</h3>
      <span class="eti ${m.proyecto.estado === 'Aprobado' ? 'verde' : 'gris'}">${esc(m.proyecto.estado)}</span></div>
    <div class="tabla-caja" style="border:none;margin:0"><table>
      <tbody>
        <tr><td style="width:190px"><strong>Propósito</strong></td><td>${esc(m.proyecto.proposito) || '<span style="color:var(--bad)">sin declarar</span>'}</td></tr>
        <tr><td><strong>Responsable</strong></td><td>${esc(m.proyecto.responsable) || '<span style="color:var(--bad)">sin asignar</span>'}</td></tr>
        <tr><td><strong>Alcance</strong></td><td>${esc(m.proyecto.alcance) || '<span style="color:var(--bad)">sin declarar</span>'}</td></tr>
        <tr><td><strong>Horizonte</strong></td><td>${m.proyecto.horizonte} periodos · ${PERIODICIDAD[m.proyecto.periodicidad]} · ${esc(m.proyecto.moneda)}</td></tr>
        <tr><td><strong>Versión</strong></td><td>${m.proyecto.version} · huella <code>${hashModelo(m)}</code></td></tr>
        <tr><td><strong>Advertencia de uso</strong></td><td>${esc(m.proyecto.advertencia)}</td></tr>
      </tbody></table></div>
  </div>

  <div class="rejilla c4">
    ${tile('Deuda total', fmt(s.deudaTotal), m.tramos.length + ' tramo(s)')}
    ${tile('DSCR mínimo', fmtN(s.dscrMin), '', s.factible ? 'ok' : 'mal')}
    ${tile('Brecha mínima', fmt(s.brechaMin), '', s.brechaMin < 0 ? 'mal' : 'ok')}
    ${tile('Servicio total', fmt(s.servicioTotal), 'interés ' + fmt(s.interesTotal))}
  </div>

  <h2>Supuestos y sus fuentes</h2>
  ${m.supuestos.length ? `<div class="tabla-caja"><table>
    <thead><tr><th>Variable</th><th class="num">Valor</th><th>Tipo</th><th>Fuente</th><th>Responsable</th></tr></thead>
    <tbody>${m.supuestos.map(x => `<tr><td>${esc(x.variable)}</td><td class="num">${esc(x.valor)} ${esc(x.unidad)}</td>
      <td>${esc(x.tipo)}</td><td>${esc(x.fuente) || '<span style="color:var(--bad)">sin fuente</span>'}</td>
      <td>${esc(x.responsable) || '—'}</td></tr>`).join('')}</tbody></table></div>`
   : '<p class="ayuda">Sin supuestos registrados.</p>'}

  <h2>Covenants aplicados</h2>
  ${m.covenants.length ? `<div class="tabla-caja"><table>
    <thead><tr><th>Indicador</th><th class="num">Umbral</th><th>Frecuencia</th><th>Fuente</th><th>Consecuencia</th></tr></thead>
    <tbody>${m.covenants.map(c => `<tr><td>${esc(c.indicador)}</td><td class="num">${fmtN(c.umbral)}</td>
      <td>${esc(c.frecuencia)}</td><td>${esc(c.fuente) || '<span style="color:var(--bad)">sin fuente</span>'}</td>
      <td>${esc(c.consecuencia) || '—'}</td></tr>`).join('')}</tbody></table></div>` : '<p class="ayuda">Sin covenants.</p>'}

  <h2>Calendario</h2>
  ${tablaCalendario(r, m)}

  <h2>Advertencias del reporte</h2>
  ${v.length ? `<ul>${v.map(x => `<li><strong>${x.cod}</strong> · ${esc(x.titulo)}</li>`).join('')}</ul>`
   : '<p>Sin hallazgos pendientes.</p>'}

  ${m.simulacion ? `<h2>Simulación</h2>
    <p>Resultados <strong>importados de Risk Simulator</strong>, archivo <code>${esc(m.simulacion.archivo)}</code>,
    huella <code>${esc(m.simulacion.hash)}</code>. No fueron calculados por esta app.</p>` : ''}

  ${m.decision.responsable ? `<h2>Decisión registrada</h2>
    <div class="tarjeta plana">
      <p><strong>Responsable:</strong> ${esc(m.decision.responsable)} · <strong>Fecha:</strong> ${esc(m.decision.fecha) || '—'}</p>
      <p><strong>Comentario:</strong> ${esc(m.decision.comentario)}</p>
      <p style="margin:0"><strong>Riesgo residual:</strong> ${esc(m.decision.residual)}</p>
    </div>` : ''}

  ${avisoHTML('aten', 'Alcance del reporte',
    '<p style="margin:0">Documento interno de apoyo a la decisión. No constituye concepto contable, jurídico, tributario ni crediticio, y no certifica estados financieros (§10.4).</p>')}`;
};

function exportarModelo() {
  descargarTexto('Rehavid_modelo_' + hashModelo(estado.m) + '.json',
    JSON.stringify(estado.m, null, 2), 'application/json');
  toast('Modelo exportado', 'ok');
}

function descargarExcel() {
  try {
    const bin = atob(XLSM_B64);
    const buf = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) buf[i] = bin.charCodeAt(i);
    const blob = new Blob([buf], { type: 'application/vnd.ms-excel.sheet.macroEnabled.12' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'Rehavid_Herramienta_Financiera.xlsm';
    document.body.appendChild(a); a.click();
    setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 1500);
    toast('Libro Excel descargado. Recuerda desbloquearlo para las macros.', 'ok');
  } catch (e) {
    toast('No se pudo generar la descarga: ' + e.message, 'mal');
  }
}
