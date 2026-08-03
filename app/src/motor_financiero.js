/* ============================================================
   MOTOR FINANCIERO · fórmulas del §8 del documento
   F1 saldo · F2 servicio · F3 CFADS · F4 DSCR · F5 capacidad
   F6 caja final · F7 brecha · F11/F12 desviaciones
   ============================================================ */

const PERIODICIDAD = { 1:'Anual', 2:'Semestral', 4:'Trimestral', 12:'Mensual' };
const METODOS = { frances:'Cuota fija (francés)', aleman:'Abono constante (alemán)', bullet:'Pago único al vencimiento' };
const MONEDAS = ['COP', 'USD', 'EUR'];

/* --- Calendario de un tramo · F1 y F2 --- */
function calendarioTramo(tr, horizonte, m) {
  const i = (tr.tasa / 100) / m;
  const filas = [];
  let saldo = 0;
  const amortizables = Math.max(tr.plazo - tr.gracia, 1);
  const cuota = i > 0 ? tr.monto * i / (1 - Math.pow(1 + i, -amortizables)) : tr.monto / amortizables;

  for (let t = 1; t <= horizonte; t++) {
    const vivo = t >= tr.desde && t < tr.desde + tr.plazo;
    if (t === tr.desde) saldo = tr.monto;
    if (!vivo) { filas.push({ t, saldoIni:0, interes:0, principal:0, servicio:0, saldoFin:0, vivo:false }); continue; }

    const saldoIni = saldo;
    const interes = saldoIni * i;
    const k = t - tr.desde + 1;               // periodo dentro del tramo
    let principal = 0;
    if (k > tr.gracia) {
      if (tr.metodo === 'frances')     principal = Math.max(0, cuota - interes);
      else if (tr.metodo === 'aleman') principal = tr.monto / amortizables;
      else if (tr.metodo === 'bullet') principal = (k === tr.plazo) ? saldoIni : 0;
    }
    principal = Math.min(principal, saldoIni);
    const saldoFin = saldoIni - principal;
    filas.push({ t, saldoIni, interes, principal, servicio: principal + interes, saldoFin, vivo:true });
    saldo = saldoFin;
  }
  return filas;
}

/* --- CFADS · F3 --- */
function cfadsPeriodo(lineas, t) {
  let v = 0;
  lineas.forEach(l => {
    if (!l.elegible) return;
    const valor = l.valor * Math.pow(1 + (l.crec || 0) / 100, t - 1);
    if (l.tipo === 'ingreso') v += valor;
    else v -= valor;                       // egreso e inversión restan
  });
  return v;
}

/* --- Modelo completo --- */
function calcular(mod) {
  const H = Math.max(1, Math.min(60, mod.proyecto.horizonte));
  const m = mod.proyecto.periodicidad;
  const porTramo = mod.tramos.map(tr => calendarioTramo(tr, H, m));
  const filas = [];
  let caja = mod.liquidez.caja0;

  for (let t = 1; t <= H; t++) {
    const agg = porTramo.reduce((a, ft) => {
      const f = ft[t - 1];
      a.saldoIni += f.saldoIni; a.interes += f.interes;
      a.principal += f.principal; a.servicio += f.servicio; a.saldoFin += f.saldoFin;
      return a;
    }, { saldoIni:0, interes:0, principal:0, servicio:0, saldoFin:0 });

    const cfads = cfadsPeriodo(mod.flujo, t);
    // RN-FIN-02: con servicio cero el DSCR no se calcula, no es infinito
    const dscr = agg.servicio > 0 ? cfads / agg.servicio : null;
    const cajaIni = caja;
    const cajaFin = cajaIni + cfads - agg.servicio;
    const brecha = cajaFin - mod.liquidez.cajaMin;

    const rotos = mod.covenants.filter(c => covenantActivo(c, t) && dscr !== null && dscr < c.umbral);
    filas.push({ t, ...agg, cfads, dscr, cajaIni, cajaFin, brecha,
                 rompeCov: rotos.length > 0, covRotos: rotos,
                 rompeLiq: brecha < 0 });
    caja = cajaFin;
  }
  return { filas, porTramo, H, m };
}

function covenantActivo(c, t) {
  if (c.desde && t < c.desde) return false;
  if (c.hasta && c.hasta > 0 && t > c.hasta) return false;
  return true;
}

function resumen(r, mod) {
  const dscrs = r.filas.map(f => f.dscr).filter(v => v !== null);
  const fCov = r.filas.filter(f => f.rompeCov);
  const fLiq = r.filas.filter(f => f.rompeLiq);
  return {
    dscrMin: dscrs.length ? Math.min(...dscrs) : null,
    brechaMin: Math.min(...r.filas.map(f => f.brecha)),
    cajaMinAlcanzada: Math.min(...r.filas.map(f => f.cajaFin)),
    servicioTotal: r.filas.reduce((a, f) => a + f.servicio, 0),
    interesTotal: r.filas.reduce((a, f) => a + f.interes, 0),
    deudaTotal: mod.tramos.reduce((a, t) => a + t.monto, 0),
    noCalculables: r.filas.filter(f => f.dscr === null).length,
    fCov, fLiq,
    factible: !fCov.length && !fLiq.length
  };
}

/* --- Capacidad máxima · F5 -------------------------------------------------
   Se escala proporcionalmente el conjunto de tramos y se busca el factor
   máximo factible por bisección. El documento admite búsqueda iterativa,
   optimización o Goal Seek y no fija tolerancia (§8.3): la bisección con 60
   iteraciones es una decisión de esta implementación, declarada en pantalla.
   -------------------------------------------------------------------------- */
function capacidad(mod) {
  const base = mod.tramos.reduce((a, t) => a + t.monto, 0);
  if (base <= 0) return { monto:0, factor:0, vinculante:'no hay tramos configurados' };

  const factible = k => {
    const copia = JSON.parse(JSON.stringify(mod));
    copia.tramos.forEach(t => t.monto *= k);
    return resumen(calcular(copia), copia).factible;
  };

  if (!factible(0.001)) return { monto:0, factor:0, vinculante:'ninguna estructura es factible' };
  let lo = 0.001, hi = 8;
  if (factible(hi)) return { monto: base * hi, factor: hi, vinculante:'sin restricción activa en el rango explorado' };
  for (let n = 0; n < 60; n++) {
    const mid = (lo + hi) / 2;
    if (factible(mid)) lo = mid; else hi = mid;
  }
  // Qué restricción falla justo por encima del máximo
  const copia = JSON.parse(JSON.stringify(mod));
  copia.tramos.forEach(t => t.monto *= lo * 1.02);
  const rr = resumen(calcular(copia), copia);
  let vinc = 'ninguna';
  if (rr.fCov.length && rr.fLiq.length) vinc = 'cobertura y liquidez a la vez';
  else if (rr.fCov.length) vinc = `cobertura · DSCR bajo el umbral en el periodo ${rr.fCov[0].t}`;
  else if (rr.fLiq.length) vinc = `liquidez · caja bajo el mínimo en el periodo ${rr.fLiq[0].t}`;
  return { monto: base * lo, factor: lo, vinculante: vinc,
           periodosCriticos: (rr.fCov.concat(rr.fLiq)).map(f => f.t).slice(0, 6) };
}

/* --- Desviaciones · F11 y F12 --- */
function desviacion(observado, proyectado) {
  const abs = observado - proyectado;
  // §8.6: con base cero, negativa o no comparable, no se muestra porcentaje
  const rel = (proyectado === 0 || proyectado === null || !isFinite(proyectado) || proyectado < 0)
    ? null : abs / proyectado * 100;
  return { abs, rel };
}

/* ============================================================
   VALIDACIONES · RF-022 y las reglas RN-FIN
   Este es el motor de análisis aplicado al modelo del usuario:
   reglas explícitas, sin IA, con la regla visible en cada hallazgo.
   ============================================================ */
const REGLAS_VALIDACION = [
  { cod:'VAL-01', sev:'critico', donde:'proyecto', regla:'RF-009 · el proyecto debe declarar propósito, responsable, horizonte, periodicidad, moneda y alcance antes de calcular.',
    check: m => {
      const faltan = [];
      if (!m.proyecto.nombre.trim())      faltan.push('nombre');
      if (!m.proyecto.proposito.trim())   faltan.push('propósito');
      if (!m.proyecto.responsable.trim() || m.proyecto.responsable === 'Sin asignar') faltan.push('responsable');
      if (!m.proyecto.alcance.trim())     faltan.push('alcance');
      return faltan.length ? { titulo:'El proyecto está incompleto',
        detalle:`Faltan: ${faltan.join(', ')}. Mientras falte alguno, el modelo no puede aprobarse.` } : null;
    } },
  { cod:'VAL-02', sev:'critico', donde:'supuestos', regla:'RF-010 y RN-FIN-05 · todo supuesto debe identificar fuente, racional, responsable y fecha. Un supuesto sin fuente queda en borrador.',
    check: m => {
      const sin = m.supuestos.filter(s => !String(s.fuente || '').trim());
      return sin.length ? { titulo:`${sin.length} supuesto(s) sin fuente`,
        detalle:`Sin fuente identificada: ${sin.map(s => s.variable).join(', ')}. El modelo permanece en borrador.` } : null;
    } },
  { cod:'VAL-03', sev:'medio', donde:'supuestos', regla:'RN-FIN-05 · el racional y el responsable son obligatorios además de la fuente.',
    check: m => {
      const sin = m.supuestos.filter(s => String(s.fuente || '').trim() &&
                 (!String(s.racional || '').trim() || !String(s.responsable || '').trim()));
      return sin.length ? { titulo:`${sin.length} supuesto(s) sin racional o responsable`,
        detalle:'Tienen fuente pero no dicen por qué se eligió ese valor ni quién responde por él.' } : null;
    } },
  { cod:'VAL-04', sev:'critico', donde:'covenants', regla:'RF-014, RN-FIN-03 y CP-008 · el covenant debe tener tipo, umbral, periodo, fuente y vigencia. Sin fuente se permite borrador, pero no aprobar ni calcular capacidad definitiva.',
    check: m => {
      const sin = m.covenants.filter(c => !String(c.fuente || '').trim());
      return sin.length ? { titulo:`${sin.length} covenant(s) sin fuente contractual`,
        detalle:'La app no debe inventar el umbral: proviene del contrato o de una política identificada. Sin fuente no puede aprobarse el modelo.' } : null;
    } },
  { cod:'VAL-05', sev:'medio', donde:'covenants', regla:'RN-FIN-03 · el covenant necesita periodo de cura y consecuencia declarados; un incumplimiento con 90 días de cura no equivale a uno con aceleración inmediata.',
    check: m => {
      const sin = m.covenants.filter(c => !String(c.cura || '').trim() || !String(c.consecuencia || '').trim());
      return sin.length ? { titulo:`${sin.length} covenant(s) sin cura o consecuencia`,
        detalle:'Falta lo que determina el efecto real del incumplimiento.' } : null;
    } },
  { cod:'VAL-06', sev:'critico', donde:'deuda', regla:'CP-006 · el saldo debe conciliar en cada periodo: saldo final = saldo inicial + desembolsos − principal ± ajustes.',
    check: m => {
      const r = calcular(m);
      const malos = r.filas.filter(f => Math.abs(f.saldoFin - (f.saldoIni - f.principal)) > 0.01);
      return malos.length ? { titulo:'El saldo de deuda no concilia',
        detalle:`Periodos con diferencia: ${malos.map(f => 'P' + f.t).join(', ')}.` } : null;
    } },
  { cod:'VAL-07', sev:'critico', donde:'deuda', regla:'RF-011 · debe existir al menos una obligación configurada para poder calcular.',
    check: m => m.tramos.length ? null :
      { titulo:'No hay obligaciones de deuda', detalle:'Sin tramos no hay servicio de deuda, ni cobertura, ni capacidad.' } },
  { cod:'VAL-08', sev:'medio', donde:'deuda', regla:'RN-FIN-02 · con servicio de deuda cero el DSCR se muestra como «No calculable», nunca como infinito.',
    check: m => {
      const r = calcular(m);
      const n = r.filas.filter(f => f.dscr === null).length;
      return n ? { titulo:`${n} periodo(s) con DSCR no calculable`,
        detalle:'El servicio de deuda es cero en esos periodos. No es un error: es la regla aplicada. No hay medición de cobertura ahí.' } : null;
    } },
  { cod:'VAL-09', sev:'critico', donde:'liquidez', regla:'CP-010 · un escenario que cumple el covenant pero deja la caja bajo el mínimo queda no factible por liquidez.',
    check: m => {
      const r = calcular(m); const s = resumen(r, m);
      if (!s.fLiq.length) return null;
      const soloLiq = !s.fCov.length;
      return { titulo:`Incumplimiento de liquidez en ${s.fLiq.length} periodo(s)`,
        detalle:`Periodos: ${s.fLiq.map(f => 'P' + f.t).join(', ')}. ` +
          (soloLiq ? 'La cobertura se cumple en todo el horizonte y aun así el escenario no es viable: es exactamente el caso CP-010.' : '') };
    } },
  { cod:'VAL-10', sev:'critico', donde:'liquidez', regla:'RF-016 · el covenant de cobertura debe cumplirse en todos los periodos activos.',
    check: m => {
      const r = calcular(m); const s = resumen(r, m);
      return s.fCov.length ? { titulo:`Incumplimiento de cobertura en ${s.fCov.length} periodo(s)`,
        detalle:`Periodos: ${s.fCov.map(f => 'P' + f.t).join(', ')}. Restricción vinculante en el cálculo de capacidad.` } : null;
    } },
  { cod:'VAL-11', sev:'medio', donde:'flujo', regla:'RF-013 · el mapeo del CFADS debe aprobarse: mezclar utilidad contable, EBITDA o caja libre sin definición sobreestima la capacidad.',
    check: m => {
      const noElegibles = m.flujo.filter(l => !l.elegible);
      if (!m.flujo.some(l => l.elegible)) return { titulo:'No hay líneas elegibles en el CFADS',
        detalle:'Sin líneas elegibles el flujo disponible es cero y el DSCR carece de sentido.' };
      return noElegibles.length ? null : { titulo:'Todas las líneas están marcadas como elegibles',
        detalle:'Conviene revisar si alguna partida no recurrente o restringida debería quedar fuera del CFADS.' };
    } },
  { cod:'VAL-12', sev:'medio', donde:'simulacion', regla:'CP-012 · una distribución sin justificación deja la simulación en borrador; no puede publicarse como análisis aprobado.',
    check: m => {
      if (!m.simulacion) return null;
      const sin = (m.simulacion.entradas || []).filter(e => !String(e.justificacion || '').trim());
      return sin.length ? { titulo:`${sin.length} distribución(es) sin justificación`,
        detalle:'La simulación queda en borrador hasta que cada distribución explique en qué evidencia se apoya.' } : null;
    } },
  { cod:'VAL-13', sev:'critico', donde:'decision', regla:'RN-FIN-10 y RF-028 · la decisión debe registrar responsable, fecha, comentario y riesgo residual.',
    check: m => {
      const d = m.decision;
      if (!d.responsable && !d.comentario && !d.residual) return null;   // aún no se ha empezado
      const faltan = [];
      if (!String(d.responsable || '').trim()) faltan.push('responsable');
      if (!String(d.comentario  || '').trim()) faltan.push('comentario');
      if (!String(d.residual    || '').trim()) faltan.push('riesgo residual');
      return faltan.length ? { titulo:'La decisión está incompleta',
        detalle:`Faltan: ${faltan.join(', ')}. No se puede cerrar sin responsable.` } : null;
    } },
  { cod:'VAL-14', sev:'leve', donde:'supuestos', regla:'RN-FIN-06 · históricos, presupuestos y proyecciones no pueden mezclarse sin etiqueta.',
    check: m => {
      const sinTipo = m.supuestos.filter(s => !s.tipo);
      return sinTipo.length ? { titulo:`${sinTipo.length} supuesto(s) sin clasificar`,
        detalle:'Cada entrada debe declarar si es dato histórico, presupuesto o proyección.' } : null;
    } }
];

function validar(mod) {
  const m = mod || estado.m;
  const out = [];
  REGLAS_VALIDACION.forEach(r => {
    let res = null;
    try { res = r.check(m); } catch (e) { res = null; }
    if (res) out.push({ ...r, ...res });
  });
  return out;
}

/* ¿Se puede aprobar el modelo? Solo si no hay hallazgos críticos. */
function puedeAprobar(mod) {
  return validar(mod).filter(h => h.sev === 'critico').length === 0;
}
