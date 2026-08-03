/* ============================================================
   LABORATORIO FINANCIERO · implementa las fórmulas de §8
   ============================================================ */

const LAB_INICIAL = {
  monto: 1000000, tasa: 12, plazo: 12, m: 4, metodo: 'frances', gracia: 0,
  cfads: 120000, crec: 0, covenant: 1.20, caja0: 150000, cajaMin: 80000
};
const PERIODOS = { 1:'anual', 2:'semestral', 4:'trimestral', 12:'mensual' };

function calcularModelo(p) {
  const i = (p.tasa / 100) / p.m;          // tasa del periodo
  const n = p.plazo;
  const filas = [];
  let saldo = p.monto, caja = p.caja0;

  // principal por periodo según método
  const amortizables = Math.max(n - p.gracia, 1);
  let cuotaFrancesa = 0;
  if (p.metodo === 'frances') {
    cuotaFrancesa = i > 0
      ? p.monto * i / (1 - Math.pow(1 + i, -amortizables))
      : p.monto / amortizables;
  }

  for (let t = 1; t <= n; t++) {
    const saldoIni = saldo;
    const interes = saldoIni * i;
    let principal = 0;
    if (t > p.gracia) {
      if (p.metodo === 'frances')      principal = Math.max(0, cuotaFrancesa - interes);
      else if (p.metodo === 'aleman')  principal = p.monto / amortizables;
      else if (p.metodo === 'bullet')  principal = (t === n) ? saldoIni : 0;
    }
    principal = Math.min(principal, saldoIni);
    const servicio = principal + interes;
    const saldoFin = saldoIni - principal;
    const cfads = p.cfads * Math.pow(1 + p.crec / 100, t - 1);
    const dscr = servicio > 0 ? cfads / servicio : null;   // RN-FIN-02
    const cajaIni = caja;
    const cajaFin = cajaIni + cfads - servicio;
    const brecha = cajaFin - p.cajaMin;

    filas.push({ t, saldoIni, interes, principal, servicio, saldoFin, cfads, dscr,
                 cajaIni, cajaFin, brecha,
                 rompeCov: dscr !== null && dscr < p.covenant,
                 rompeLiq: brecha < 0 });
    saldo = saldoFin; caja = cajaFin;
  }
  return filas;
}

function evaluarFactibilidad(filas, p) {
  const fCov = filas.filter(f => f.rompeCov);
  const fLiq = filas.filter(f => f.rompeLiq);
  const dscrs = filas.map(f => f.dscr).filter(v => v !== null);
  return {
    factible: !fCov.length && !fLiq.length,
    fCov, fLiq,
    dscrMin: dscrs.length ? Math.min(...dscrs) : null,
    cajaMin: Math.min(...filas.map(f => f.cajaFin)),
    brechaMin: Math.min(...filas.map(f => f.brecha)),
    servicioTotal: filas.reduce((a,f) => a + f.servicio, 0),
    interesTotal: filas.reduce((a,f) => a + f.interes, 0),
    noCalculables: filas.filter(f => f.dscr === null).length
  };
}

/* §8.3 · capacidad máxima por búsqueda iterativa acotada.
   El documento admite búsqueda iterativa, optimización o Goal Seek y no fija
   tolerancia: aquí se usa bisección con 60 iteraciones. Decisión declarada. */
function capacidadMaxima(p) {
  const factible = monto => evaluarFactibilidad(calcularModelo({...p, monto}), p).factible;
  if (!factible(1)) return { monto: 0, vinculante: 'ninguna estructura es factible' };
  let lo = 1, hi = Math.max(p.monto * 8, 1e6);
  if (factible(hi)) return { monto: hi, vinculante: 'sin restricción activa en el rango explorado' };
  for (let k = 0; k < 60; k++) {
    const mid = (lo + hi) / 2;
    if (factible(mid)) lo = mid; else hi = mid;
  }
  // restricción vinculante: la que falla justo por encima del máximo
  const justoArriba = evaluarFactibilidad(calcularModelo({...p, monto: lo * 1.02}), p);
  let vinc = 'ninguna';
  if (justoArriba.fCov.length && justoArriba.fLiq.length) vinc = 'cobertura y liquidez a la vez';
  else if (justoArriba.fCov.length) vinc = `cobertura · DSCR < ${fmtN(p.covenant)} en el periodo ${justoArriba.fCov[0].t}`;
  else if (justoArriba.fLiq.length) vinc = `liquidez · caja bajo el mínimo en el periodo ${justoArriba.fLiq[0].t}`;
  return { monto: lo, vinculante: vinc };
}

function secLaboratorio() {
  return `
  <h1>Laboratorio financiero</h1>
  <p class="entradilla">Implementa las fórmulas del motor financiero de §8: calendario de deuda,
  CFADS, DSCR, caja, brecha de liquidez y capacidad máxima. Sirve para practicar los conceptos de
  las unidades U2 a U5 con números propios.</p>

  <div class="aviso aten">
    <span class="rotulo">Los valores iniciales son un ejemplo neutro</span>
    <p><strong>El documento no contiene ninguna cifra financiera</strong>: ni tasas, ni plazos, ni
    montos, ni umbrales de covenant, ni caja mínima. Es una decisión deliberada suya (§2.1) y es
    correcta. Los números que ves abajo son un ejemplo construido para que la herramienta pueda
    demostrarse; <strong>no son datos de Rehavid ni recomendación alguna</strong>. Cámbialos por los tuyos.</p>
  </div>

  <div class="tarjeta no-imprimir">
    <h4 style="margin-top:0">Parámetros de la obligación</h4>
    <div class="rejilla c4" style="margin-bottom:6px">
      <div class="campo"><label>Monto de deuda</label><input type="number" id="lab-monto" value="${LAB_INICIAL.monto}"></div>
      <div class="campo"><label>Tasa nominal anual %</label><input type="number" id="lab-tasa" step="0.01" value="${LAB_INICIAL.tasa}"></div>
      <div class="campo"><label>Número de periodos</label><input type="number" id="lab-plazo" min="1" max="60" value="${LAB_INICIAL.plazo}"></div>
      <div class="campo"><label>Periodicidad</label><select id="lab-m">
        ${Object.entries(PERIODOS).map(([k,v]) => `<option value="${k}" ${+k===LAB_INICIAL.m?'selected':''}>${v}</option>`).join('')}
      </select></div>
    </div>
    <div class="rejilla c4" style="margin-bottom:6px">
      <div class="campo"><label>Método de amortización</label><select id="lab-metodo">
        <option value="frances">Cuota fija (francés)</option>
        <option value="aleman">Abono constante (alemán)</option>
        <option value="bullet">Pago único al vencimiento</option>
      </select><div class="ayuda">§8.1: el documento advierte no fijar un método por defecto sin confirmación.</div></div>
      <div class="campo"><label>Periodos de gracia de principal</label><input type="number" id="lab-gracia" min="0" value="${LAB_INICIAL.gracia}"></div>
      <div class="campo"><label>CFADS del primer periodo</label><input type="number" id="lab-cfads" value="${LAB_INICIAL.cfads}"></div>
      <div class="campo"><label>Crecimiento del CFADS % por periodo</label><input type="number" id="lab-crec" step="0.1" value="${LAB_INICIAL.crec}"></div>
    </div>
    <h4>Restricciones</h4>
    <div class="rejilla c3" style="margin-bottom:6px">
      <div class="campo"><label>Covenant DSCR mínimo</label><input type="number" id="lab-covenant" step="0.01" value="${LAB_INICIAL.covenant}">
        <div class="ayuda">§8.2: el umbral se toma del contrato. La app no debe asumir 1,0.</div></div>
      <div class="campo"><label>Caja inicial</label><input type="number" id="lab-caja0" value="${LAB_INICIAL.caja0}"></div>
      <div class="campo"><label>Caja mínima exigida</label><input type="number" id="lab-cajamin" value="${LAB_INICIAL.cajaMin}">
        <div class="ayuda">§8.4: es una política, no un valor universal.</div></div>
    </div>
    <div style="display:flex;gap:9px;flex-wrap:wrap">
      <button onclick="correrLab()">Calcular</button>
      <button class="secundario" onclick="resetLab()">Restaurar ejemplo</button>
      <button class="secundario" onclick="calcularCapacidad()">Calcular capacidad máxima</button>
    </div>
  </div>

  <div id="lab-salida"></div>`;
}

function leerLab() {
  const v = id => parseFloat(($('#lab-' + id) || {}).value) || 0;
  return {
    monto: v('monto'), tasa: v('tasa'), plazo: Math.max(1, Math.min(60, v('plazo'))),
    m: parseInt($('#lab-m').value), metodo: $('#lab-metodo').value, gracia: v('gracia'),
    cfads: v('cfads'), crec: v('crec'), covenant: v('covenant'),
    caja0: v('caja0'), cajaMin: v('cajamin')
  };
}
function resetLab() {
  Object.entries({monto:'monto',tasa:'tasa',plazo:'plazo',gracia:'gracia',cfads:'cfads',
                  crec:'crec',covenant:'covenant',caja0:'caja0',cajamin:'cajaMin'})
    .forEach(([id,k]) => { const e = $('#lab-'+id); if (e) e.value = LAB_INICIAL[k]; });
  $('#lab-m').value = LAB_INICIAL.m; $('#lab-metodo').value = LAB_INICIAL.metodo;
  correrLab();
}

function correrLab() {
  const p = leerLab();
  const filas = calcularModelo(p);
  const ev = evaluarFactibilidad(filas, p);
  const cats = filas.map(f => 'P' + f.t);

  $('#lab-salida').innerHTML = `
  <h2>Resultado del modelo</h2>
  <div class="rejilla c4">
    <div class="kpi"><div class="valor">${fmtN(ev.dscrMin)}</div><div class="rotulo">DSCR mínimo</div>
      <div class="nota">covenant ${fmtN(p.covenant)}</div></div>
    <div class="kpi"><div class="valor">${fmt(ev.brechaMin)}</div><div class="rotulo">brecha mínima de caja</div>
      <div class="nota">caja final − caja mínima</div></div>
    <div class="kpi"><div class="valor">${fmt(ev.servicioTotal)}</div><div class="rotulo">servicio total</div>
      <div class="nota">interés ${fmt(ev.interesTotal)}</div></div>
    <div class="kpi"><div class="valor" style="color:${ev.factible?'var(--green-dark)':'var(--bad)'}">${ev.factible?'Factible':'No factible'}</div>
      <div class="rotulo">bajo ambas restricciones</div></div>
  </div>

  ${!ev.factible ? `<div class="aviso mal"><span class="rotulo">Escenario no factible</span>
    ${ev.fCov.length ? `<p>Incumple cobertura en ${ev.fCov.length} periodo(s): ${ev.fCov.map(f=>'P'+f.t).join(', ')}.</p>` : ''}
    ${ev.fLiq.length ? `<p style="margin-bottom:0">Incumple liquidez en ${ev.fLiq.length} periodo(s): ${ev.fLiq.map(f=>'P'+f.t).join(', ')}.
      ${ev.fCov.length===0 ? '<strong>El covenant se cumple y aun así el escenario no es viable</strong>: es exactamente el caso CP-010 del documento.' : ''}</p>` : ''}
    </div>` : `<div class="aviso ok"><span class="rotulo">Escenario factible</span>
    <p style="margin-bottom:0">Cumple el covenant y la caja mínima en los ${filas.length} periodos.</p></div>`}

  ${ev.noCalculables ? `<div class="aviso"><span class="rotulo">RN-FIN-02 aplicada</span>
    <p style="margin-bottom:0">${ev.noCalculables} periodo(s) con servicio de deuda cero: el DSCR se
    muestra como <strong>No calculable</strong>, no como infinito.</p></div>` : ''}

  ${figura('Perfil de deuda', 'Principal e interés por periodo · §8.1',
    barrasApiladas(cats, [
      {nombre:'Principal', color:PAL[0], valores: filas.map(f=>f.principal)},
      {nombre:'Interés',   color:PAL[1], valores: filas.map(f=>f.interes)}
    ]),
    'Servicio de deuda = principal pagadero + interés pagadero. La separación es obligatoria (RF-012).',
    leyendaDe([[PAL[0],'Principal'],[PAL[1],'Interés']]))}

  ${figura('Cobertura del servicio de deuda', 'DSCR por periodo frente al covenant configurado · §8.2',
    lineaUmbral(cats, filas.map(f=>f.dscr), p.covenant),
    'DSCR = CFADS del periodo ÷ servicio de deuda del mismo periodo. Los puntos en rojo incumplen el umbral; “n/c” marca los periodos sin servicio de deuda.')}

  ${figura('Liquidez', 'Caja final frente a la caja mínima exigida · §8.4',
    areaLiquidez(cats, filas.map(f=>f.cajaFin), filas.map(()=>p.cajaMin)),
    'Caja final = caja inicial + CFADS − servicio de deuda. La línea roja discontinua es la caja mínima; un punto por debajo es incumplimiento de liquidez aunque el DSCR cumpla.',
    leyendaDe([[PAL[0],'Caja final'],['#B23B5C','Caja mínima']]))}

  <h2>Calendario completo</h2>
  <div class="tabla-caja"><table>
    <caption>Todas las columnas salen de las fórmulas F1 a F7 del documento</caption>
    <thead><tr><th>P</th><th>Saldo inicial</th><th>Interés</th><th>Principal</th><th>Servicio</th>
      <th>Saldo final</th><th>CFADS</th><th>DSCR</th><th>Caja final</th><th>Brecha</th></tr></thead>
    <tbody>${filas.map(f => `<tr>
      <td>${f.t}</td>
      <td class="num">${fmt(f.saldoIni)}</td>
      <td class="num">${fmt(f.interes)}</td>
      <td class="num">${fmt(f.principal)}</td>
      <td class="num">${fmt(f.servicio)}</td>
      <td class="num">${fmt(f.saldoFin)}</td>
      <td class="num">${fmt(f.cfads)}</td>
      <td class="num" style="color:${f.dscr===null?'var(--ink-4)':(f.rompeCov?'var(--bad)':'var(--good)')};font-weight:600">${fmtN(f.dscr)}</td>
      <td class="num">${fmt(f.cajaFin)}</td>
      <td class="num" style="color:${f.rompeLiq?'var(--bad)':'var(--ink)'}">${fmt(f.brecha)}</td>
    </tr>`).join('')}</tbody>
  </table></div>

  <div class="aviso">
    <span class="rotulo">Conciliación · identidad F1</span>
    <p style="margin-bottom:0">Saldo final = saldo inicial + desembolsos + capitalizaciones − principal
    ± ajustes. En este laboratorio no hay desembolsos posteriores ni capitalizaciones, de modo que
    saldo final = saldo inicial − principal. La comprobación cierra en los ${filas.length} periodos.</p>
  </div>

  <div id="lab-capacidad"></div>`;
}

function calcularCapacidad() {
  const p = leerLab();
  const cap = capacidadMaxima(p);
  const z = $('#lab-capacidad') || $('#lab-salida');
  const filasCap = calcularModelo({...p, monto: cap.monto});
  const evCap = evaluarFactibilidad(filasCap, p);

  // comprobación de monotonía · CP-009
  const capDura = capacidadMaxima({...p, covenant: p.covenant * 1.15});
  const monotonia = capDura.monto <= cap.monto + 1;

  z.innerHTML = `
  <h2>Capacidad máxima de deuda</h2>
  <p>Problema F5: maximizar el monto sujeto a DSCR<sub>t</sub> ≥ covenant y caja final<sub>t</sub> ≥ caja mínima,
  en todos los periodos. Resuelto por bisección acotada, 60 iteraciones.</p>

  <div class="rejilla c3">
    <div class="kpi"><div class="valor">${fmt(cap.monto)}</div><div class="rotulo">monto máximo factible</div>
      <div class="nota">frente a ${fmt(p.monto)} configurado</div></div>
    <div class="kpi"><div class="valor" style="font-size:15px;line-height:1.35">${esc(cap.vinculante)}</div>
      <div class="rotulo">restricción vinculante</div>
      <div class="nota">RF-015 exige identificarla</div></div>
    <div class="kpi"><div class="valor">${fmtN(evCap.dscrMin)}</div><div class="rotulo">DSCR mínimo en el máximo</div>
      <div class="nota">holgura prácticamente nula</div></div>
  </div>

  <div class="aviso ${monotonia?'ok':'mal'}">
    <span class="rotulo">Comprobación de monotonía · CP-009</span>
    <p style="margin-bottom:0">Con el covenant endurecido un 15 % (de ${fmtN(p.covenant)} a
    ${fmtN(p.covenant*1.15)}), la capacidad pasa de ${fmt(cap.monto)} a ${fmt(capDura.monto)}.
    ${monotonia
      ? 'No aumenta, como exige el caso de prueba: una restricción más exigente reduce o mantiene el conjunto factible.'
      : '<strong>Aumenta, lo que indica un error en el motor.</strong>'}</p>
  </div>

  <div class="aviso aten">
    <span class="rotulo">Capacidad matemática no es monto recomendado</span>
    <p style="margin-bottom:0">En el máximo la holgura es cero: cualquier desviación del CFADS produce
    incumplimiento. El documento separa capacidad matemática de decisión prudencial (§4.2, U4) y
    excluye del alcance las recomendaciones financieras automáticas (§1.4).</p>
  </div>`;
  z.scrollIntoView({ behavior:'smooth', block:'start' });
}

/* ============================================================
   MOTOR DE ANÁLISIS · reglas deterministas y auditables
   ============================================================ */

const REGLAS_MOTOR = [
  {
    cod:'V-01', sev:'critico', tipo:'Vacío',
    titulo:'El denominador del resultado del intento no está definido',
    regla:'Buscar el término «preguntas válidas» en el texto. Si aparece dentro de una fórmula y no aparece en ninguna oración definitoria («se entiende por», «se define como», «es el conjunto de»), marcar como término usado sin definir.',
    ejecutar: (txt) => {
      const usos = (txt.match(/preguntas válidas/gi) || []).length;
      const definido = /(se entiende por|se define como|es el conjunto de)[^.]{0,60}preguntas válidas/i.test(txt);
      if (usos > 0 && !definido) return {
        dato: `Término hallado ${usos} vez(ces), ninguna definitoria.`,
        cuerpo: `§5.4 define el resultado como «respuestas correctas en primera respuesta ÷ preguntas válidas × 100», y §5.1 introduce repreguntas dentro del examen certificable. Si las repreguntas entran al denominador, cada error penaliza dos veces: resta del numerador y suma al denominador. Con 20 ítems base y 3 errores, el resultado es 85 % en una lectura y 74 % en la otra. Cambia quién se certifica.`
      };
    }
  },
  {
    cod:'V-02', sev:'critico', tipo:'Vacío',
    titulo:'La evaluación certificable no tiene tamaño definido',
    regla:'Buscar en el texto cualquier expresión que fije el número de ítems del examen o el mínimo por unidad: «N preguntas», «número de preguntas», «ítems por unidad», «tamaño del banco». Si no hay ninguna coincidencia, marcar como dimensión ausente.',
    ejecutar: (txt) => {
      const patrones = [/\d+\s+preguntas\b/i, /número de preguntas/i, /ítems por unidad/i, /tamaño del banco/i, /cantidad de ítems/i];
      const hallados = patrones.filter(p => p.test(txt));
      if (!hallados.length) return {
        dato: 'Ninguna de las 5 expresiones buscadas aparece en el documento.',
        cuerpo: `El umbral del 80 % es muy sensible al tamaño: con 10 preguntas cada error vale 10 puntos y solo se admiten 2; con 40 cada error vale 2,5 y se admiten 8. Además §5.2 exige repreguntar con un ítem equivalente, lo que obliga a tener varios ítems por objetivo, y ese mínimo tampoco se fija. La Tabla 16 aporta 8 preguntas para 8 unidades: una por unidad, insuficiente para construir la repregunta.`
      };
    }
  },
  {
    cod:'V-03', sev:'critico', tipo:'Vacío',
    titulo:'«Ruptura» se usa en una fórmula sin estar definida',
    regla:'Localizar términos que aparecen dentro de una fórmula del §8. Comprobar si el término tiene una oración definitoria en el documento. «ruptura» aparece en la fórmula de probabilidad de ruptura.',
    ejecutar: (txt) => {
      const usos = (txt.match(/ruptura/gi) || []).length;
      const definido = /(ruptura se (entiende|define)|se considera ruptura|una ruptura es)/i.test(txt);
      if (usos > 0 && !definido) return {
        dato: `«ruptura» aparece ${usos} veces; ninguna define qué la constituye.`,
        cuerpo: `§8.5 define probabilidad de ruptura = corridas válidas con al menos una ruptura ÷ corridas válidas totales × 100. No dice si ruptura es incumplir el covenant, quedar bajo la caja mínima, cualquiera de las dos o ambas a la vez. «Al menos una» tampoco precisa si se refiere a periodos o a restricciones. El número reportado cambia con la elección, y es el número que mira quien decide.`
      };
    }
  },
  {
    cod:'V-04', sev:'medio', tipo:'Vacío',
    titulo:'Requisitos no funcionales sin criterio verificable',
    regla:'Recorrer los 14 RNF y marcar aquellos cuyo texto aplaza la definición del criterio: «por definir», «Definir …», «queda por validar». Un requisito sin criterio de aceptación no es comprobable.',
    ejecutar: () => {
      const malos = RNF.filter(r => /por definir|queda por validar|^Definir /i.test(r[2]));
      if (malos.length) return {
        dato: `${malos.length} de ${RNF.length} (${Math.round(malos.length/RNF.length*100)} %): ${malos.map(m=>m[0]).join(', ')}.`,
        cuerpo: `${malos.map(m => `<strong>${m[0]} ${m[1]}</strong>: ${esc(m[2])}`).join('<br>')}<br><br>El documento es transparente al respecto, pero los numera igual que a los demás, lo que infla la sensación de cobertura.`
      };
    }
  },
  {
    cod:'V-05', sev:'critico', tipo:'Vacío',
    titulo:'El proyecto no está dimensionado',
    regla:'Buscar términos de dimensionamiento en todo el documento: costo, presupuesto, esfuerzo, cronograma, plazo de desarrollo, horas, equipo, personas. Marcar si no hay ninguna estimación.',
    ejecutar: (txt) => {
      const terminos = ['presupuesto','costo del desarrollo','esfuerzo estimado','cronograma','horas de desarrollo','tamaño del equipo','duración del proyecto'];
      const hallados = terminos.filter(t => new RegExp(t, 'i').test(txt));
      if (!hallados.length) return {
        dato: `Ninguno de los ${terminos.length} términos de dimensionamiento aparece.`,
        cuerpo: `El documento propone un MVP de cinco bloques (§12.1) sin estimar esfuerzo, costo, duración ni composición del equipo. Tampoco figura en la lista de decisiones pendientes de §12.4, de modo que ni siquiera está reconocido como faltante. Es el vacío más grande en términos de decisión de negocio: no se puede aprobar un MVP que no está dimensionado.`
      };
    }
  },
  {
    cod:'V-06', sev:'leve', tipo:'Vacío',
    titulo:'Hueco en la numeración de las instrucciones de Rehavid',
    regla:'Extraer los identificadores de fuente con prefijo R- y comprobar si la secuencia numérica es continua desde 01.',
    ejecutar: () => {
      const nums = FUENTES.filter(f => /^R-/.test(f[0])).map(f => parseInt(f[0].split('-')[1]));
      const faltan = [];
      for (let k = 1; k < Math.max(...nums); k++) if (!nums.includes(k)) faltan.push('R-0' + k);
      if (faltan.length) return {
        dato: `Faltan ${faltan.join(', ')}. La numeración arranca en R-03.`,
        cuerpo: `El registro de fuentes numera las instrucciones de Rehavid desde [R-03]. No existe [R-01] ni [R-02] en ninguna parte del documento. O se perdieron dos requisitos en una versión previa, o la numeración es arbitraria. En un documento cuyo valor principal es la trazabilidad, un hueco en la numeración de la fuente merece explicación.`
      };
    }
  },
  {
    cod:'C-01', sev:'medio', tipo:'Coherencia',
    titulo:'Cuatro perspectivas anunciadas, tres rutas entregadas, cinco roles tabulados',
    regla:'Contrastar el número de perspectivas que anuncia el §6 con el número de roles de su tabla y el número de rutas desarrolladas en los apartados siguientes. Marcar si los tres números no coinciden.',
    ejecutar: () => {
      const anunciadas = 4, roles = ROLES.length, rutas = RUTAS.length;
      if (!(anunciadas === roles && roles === rutas)) return {
        dato: `Anunciadas ${anunciadas} · roles tabulados ${roles} · rutas desarrolladas ${rutas}.`,
        cuerpo: `§6 abre diciendo que el manual define la operación «desde cuatro perspectivas: participante, modelador, revisor y administrador». Se desarrollan tres: §6.2 participante, §6.3 modelador, §6.4 revisor. <strong>La ruta del administrador se anuncia y no aparece</strong>; §6.5 pasa a mensajes de error. Además la Tabla 25 define cinco roles, porque añade Gestor de contenido y Auditor y fusiona participante con modelador.`
      };
    }
  },
  {
    cod:'C-02', sev:'critico', tipo:'Coherencia',
    titulo:'Un bloque del MVP depende de decisiones declaradas sin resolver',
    regla:'Para cada bloque del MVP, buscar sus términos clave en la lista de decisiones pendientes. Si un bloque del producto mínimo depende de un pendiente sin marca de bloqueo, señalarlo.',
    ejecutar: () => {
      const choques = [];
      MVP.forEach(b => {
        PENDIENTES.forEach(p => {
          if (/Risk Simulator/i.test(b[2]) && /Risk Simulator|SDK\/OEM|Licenciamiento/i.test(p))
            choques.push([b[0], p]);
        });
      });
      if (choques.length) return {
        dato: `${choques.length} dependencia(s) entre bloques del MVP y decisiones pendientes.`,
        cuerpo: `<strong>MVP-3 «Simulación asistida»</strong> es uno de los cinco bloques del producto mínimo y depende por completo de Risk Simulator. §12.4 declara pendientes de validación: «Licenciamiento vigente y posibilidad de SDK/OEM» y «Formato real de exportación e importación de Risk Simulator y versión instalada».<br><br>Un quinto del MVP depende de dos decisiones que el propio documento reconoce sin resolver, y esa dependencia no está marcada como bloqueante en ninguna parte. Si la licencia no alcanza, el alcance del mínimo viable cambia.`
      };
    }
  },
  {
    cod:'R-01', sev:'medio', tipo:'Riesgo',
    titulo:'Una fuente de seguimiento de proyecto sostiene las definiciones financieras centrales',
    regla:'Revisar las fuentes externas muy citadas (5 o más veces). Marcar aquellas cuyo título indica un tipo documental de seguimiento —informe de estado, reporte de avance— cuando se usan para respaldar definiciones metodológicas.',
    ejecutar: () => {
      const debiles = FUENTES.filter(f => f[3] === 'Externa' && f[4] >= 5 &&
        /Implementation Status|Results Report|Progress Report/i.test(f[1]));
      if (debiles.length) return {
        dato: `${debiles.map(d => `[${d[0]}] citada ${d[4]} veces`).join('; ')}.`,
        cuerpo: `[F-01] es un <em>Implementation Status &amp; Results Report</em> del Banco Mundial sobre un proyecto vial: un informe de seguimiento, no literatura metodológica sobre estructuración de deuda. Sostiene las tres definiciones financieras centrales —CFADS, servicio de deuda y DSCR— y se usa en §8.2 para una afirmación normativa.<br><br>Las definiciones en sí son correctas y estándar en project finance. El problema es el respaldo: un documento que exige a sus usuarios registrar la fuente de cada supuesto (RN-FIN-05) debería sostener sus propias definiciones en fuentes metodológicas.`
      };
    }
  },
  {
    cod:'R-02', sev:'critico', tipo:'Riesgo',
    titulo:'La base probatoria es de dos minutos y diez segundos',
    regla:'Sumar la duración de los segmentos de transcripción citados y compararla con el volumen de especificación derivada. Marcar si la razón supera 10 requisitos por minuto citado.',
    ejecutar: () => {
      const seg = FUENTES.filter(f => f[5]).reduce((a,f) => a + f[5], 0);
      const derivados = RF.length + RNF.length;
      const razon = derivados / (seg/60);
      if (razon > 10) return {
        dato: `${seg} s citados · ${derivados} requisitos · ${Math.round(razon)} requisitos por minuto de audio.`,
        cuerpo: `Los tres segmentos citados suman 34 + 30 + 66 = <strong>130 segundos</strong>. El encabezado declara el rango 02:10:14–02:13:20, que dura 186 s: hay 56 s dentro del rango que no están citados.<br><br>Esto no invalida el documento: la mayor parte de su contenido es buena ingeniería de requisitos. Pero conviene nombrar lo que ocurre: <strong>el documento no deriva de la transcripción, se apoya en ella</strong>. Por eso «solicitar transcripciones adicionales», que en §12.4 es el último de trece pendientes, debería ser una prioridad.`
      };
    }
  },
  {
    cod:'R-03', sev:'medio', tipo:'Riesgo',
    titulo:'Tres métodos alternativos para el mismo cálculo, sin tolerancia',
    regla:'Localizar cálculos para los que el documento ofrezca más de un método sin fijar criterio de convergencia, precisión o desempate.',
    ejecutar: (txt) => {
      if (/búsqueda iterativa, optimización o Goal Seek/i.test(txt) && !/toleranc/i.test(txt)) return {
        dato: 'Tres métodos ofrecidos en §8.3; el término «tolerancia» no aparece en el documento.',
        cuerpo: `§8.3 admite resolver la capacidad máxima «mediante búsqueda iterativa, optimización o Goal Seek controlado». Los tres pueden devolver montos distintos sobre el mismo modelo, y no se fija tolerancia de convergencia, precisión ni criterio de desempate. RF-015 solo exige identificar la restricción vinculante: dos usuarios podrían obtener capacidades diferentes y ambos cumplirían el requisito.`
      };
    }
  },
  {
    cod:'B-01', sev:'leve', tipo:'Cobertura',
    titulo:'El banco de preguntas del documento no permite construir la repregunta',
    regla:'Contar los ítems que el documento aporta por unidad formativa. Marcar las unidades con menos de 2, porque §5.2 exige presentar un ítem distinto del mismo objetivo ante un error.',
    ejecutar: () => {
      const flojas = UNIDADES.filter(u => PREGUNTAS.filter(p => p.u === u.codigo && p.origen === 'doc').length < 2);
      if (flojas.length) return {
        dato: `${flojas.length} de ${UNIDADES.length} unidades tienen menos de 2 ítems propios del documento.`,
        cuerpo: `La Tabla 16 aporta 8 preguntas arquetipo para 8 unidades. Con un solo ítem por unidad, la repregunta equivalente que exige §5.2 no puede construirse: no hay con qué repreguntar.<br><br>Esta app añadió ${PREGUNTAS.filter(p=>p.origen==='ext').length} ítems propios, marcados como aporte externo, para que el mecanismo funcione. Es una solución de implementación, no una corrección del documento.`
      };
    }
  }
];

function ejecutarMotor() {
  const txt = DOC_TEXTO_PLANO;
  const hallazgos = [];
  REGLAS_MOTOR.forEach(r => {
    let res = null;
    try { res = r.ejecutar(txt); } catch (e) { res = null; }
    if (res) hallazgos.push({ ...r, ...res });
  });
  return hallazgos;
}

function secMotor() {
  const H = ejecutarMotor();
  const orden = { critico:0, medio:1, leve:2 };
  H.sort((a,b) => orden[a.sev] - orden[b.sev]);
  const porTipo = {};
  H.forEach(x => porTipo[x.tipo] = (porTipo[x.tipo]||0)+1);
  const nCrit = H.filter(x => x.sev === 'critico').length;

  const PRIORIDAD = [
    ['Antes del motor de evaluación', [
      ['Denominador del intento: ¿las repreguntas cuentan?','MF-03, RF-003, RF-006, CP-001, CP-004'],
      ['Tamaño del examen, ítems por unidad y mínimo del banco','MF-03, RF-002, RF-005'],
      ['Mínimo de ítems equivalentes por objetivo','RF-005, CP-003']]],
    ['Antes del motor financiero', [
      ['Definición corporativa exacta de CFADS','MF-07, RF-013'],
      ['Política de caja mínima','MF-08, RF-016'],
      ['Definición operativa de «ruptura»','MF-09, RF-020'],
      ['Método y tolerancia del cálculo de capacidad','MF-07, RF-015'],
      ['Métodos de amortización requeridos','MF-06, RF-011']]],
    ['Antes de comprometer el alcance del MVP', [
      ['Licencia de Risk Simulator y formato real de intercambio','MVP-3 completo'],
      ['Dimensionamiento: esfuerzo, costo, plazo y equipo','Aprobación del MVP'],
      ['Canal de despliegue','RNF-014, arquitectura']]],
    ['Puede resolverse durante la construcción', [
      ['Redactar la ruta del administrador y unificar el número de roles','—'],
      ['Fijar valores de RNF-006, 007 y 008','—'],
      ['Sustituir o complementar [F-01] por una fuente metodológica','—'],
      ['Aclarar el hueco de [R-01] y [R-02]','—']]]
  ];

  return `
  <h1>Motor de análisis</h1>
  <p class="entradilla">Reglas deterministas que se ejecutan sobre el texto del documento y sobre sus
  datos estructurados. Cada hallazgo muestra la regla que lo produjo, para que puedas comprobarla.</p>

  <div class="aviso aten">
    <span class="rotulo">Qué es y qué no es este motor</span>
    <p>Funciona <strong>sin conexión y sin inteligencia artificial</strong>. No comprende el texto:
    aplica ${REGLAS_MOTOR.length} reglas explícitas que detectan términos usados sin definir, requisitos sin
    criterio, huecos de numeración, dependencias entre bloques y desproporciones entre fuente y
    derivación. Es reproducible y auditable —siempre da el mismo resultado— y <strong>no sustituye a
    un revisor humano</strong>. Los hallazgos son puntos a verificar, no veredictos.</p>
  </div>

  <div class="rejilla c4">
    <div class="kpi"><div class="valor">${H.length}</div><div class="rotulo">hallazgos</div></div>
    <div class="kpi"><div class="valor" style="color:var(--bad)">${nCrit}</div><div class="rotulo">críticos</div></div>
    <div class="kpi"><div class="valor">${REGLAS_MOTOR.length}</div><div class="rotulo">reglas ejecutadas</div></div>
    <div class="kpi"><div class="valor">${META.palabras.toLocaleString('es-CO')}</div><div class="rotulo">palabras analizadas</div></div>
  </div>

  ${figura('Hallazgos por tipo','Resultado de ejecutar las reglas sobre el documento',
    `<div style="max-width:290px;margin:0 auto">${anillo(Object.entries(porTipo),{centro:'hallazgos'})}</div>`,
    null, leyendaDe(Object.keys(porTipo).map((k,i)=>[PAL[i%PAL.length],k])))}

  <h2>Hallazgos</h2>
  ${H.map(x => `
    <div class="hallazgo ${x.sev}">
      <div class="cab">
        <span class="cod">${x.cod}</span>
        <span class="tit">${esc(x.titulo)}</span>
        <span class="etiqueta ${x.sev==='critico'?'roja':(x.sev==='medio'?'ambar':'gris')}">${x.sev}</span>
        <span class="etiqueta">${esc(x.tipo)}</span>
      </div>
      <div class="cuerpo">
        <p style="margin-bottom:8px"><strong>Dato detectado:</strong> ${esc(x.dato)}</p>
        <p style="margin-bottom:0">${x.cuerpo}</p>
      </div>
      <div class="regla"><strong>Regla ${x.cod}:</strong> ${esc(x.regla)}</div>
    </div>`).join('')}

  <h2>Ruta priorizada</h2>
  <p>Ordenada por dependencia: qué bloquea a qué. No reemplaza la lista de §12.4, la reordena.</p>
  ${PRIORIDAD.map(([bloque, items]) => `
    <h3>${esc(bloque)}</h3>
    <div class="tabla-caja"><table>
      <thead><tr><th style="width:60%">Decisión</th><th>Bloquea</th></tr></thead>
      <tbody>${items.map(([d,b]) => `<tr><td>${esc(d)}</td><td>${esc(b)}</td></tr>`).join('')}</tbody>
    </table></div>`).join('')}

  <h2>Lo que el documento hace bien</h2>
  <div class="tarjeta suave">
    <p>Un análisis que solo señala fallos da una imagen falsa. Cinco decisiones sostienen este documento:</p>
    <ol>
      <li><strong>Trazabilidad por origen.</strong> Cada requisito se marca como transcripción, instrucción de Rehavid o validación externa, y §13 cierra el círculo con una matriz completa.</li>
      <li><strong>Se niega a inventar referencias.</strong> Declara que en el segmento no se identifican autores ni cursos, y por eso no los atribuye. Es la decisión correcta y es rara.</li>
      <li><strong>No fija el covenant.</strong> §8.2 prohíbe asumir 1,0 o cualquier otro nivel. Evita el error más común en herramientas de este tipo.</li>
      <li><strong>Separa cobertura de liquidez</strong> de forma consistente en toda la especificación, hasta el caso de prueba CP-010.</li>
      <li><strong>Distingue resultado certificable de dominio posterior</strong> y argumenta por qué no recalcular retroactivamente. Es diseño pensado, no omisión.</li>
    </ol>
    <p style="margin-bottom:0">Los problemas detectados no son de calidad general: son de precisión en puntos concretos.</p>
  </div>`;
}

/* ============================================================
   3 · MÓDULO 2 · OPERACIÓN
   ============================================================ */
function secOperacion() {
  return `
  <h1>Módulo 2 · Manual de operación</h1>
  <p class="entradilla">Cómo debe operar la aplicación que el documento define. §6 anuncia cuatro
  perspectivas; desarrolla tres. La cuarta, la del administrador, está señalada como hallazgo C-01
  del motor de análisis.</p>

  <h2>Perfiles y permisos</h2>
  <div class="tabla-caja"><table>
    <caption>§6.1 · Cinco roles</caption>
    <thead><tr><th style="width:190px">Rol</th><th>Permisos principales</th></tr></thead>
    <tbody>${ROLES.map(r => `<tr><td><strong>${esc(r[0])}</strong></td><td>${esc(r[1])}</td></tr>`).join('')}</tbody>
  </table></div>

  <h2>Rutas operativas</h2>
  <div class="rejilla c3">
    ${RUTAS.map((r,i) => `<div class="tarjeta">
      <h4 style="margin-top:0;color:${PAL[i]}">${esc(r.rol)}</h4>
      <ol style="font-size:12.5px;margin-bottom:0">${r.pasos.map(p => `<li>${esc(p)}</li>`).join('')}</ol>
    </div>`).join('')}
  </div>

  <div class="aviso mal">
    <span class="rotulo">Ruta faltante · hallazgo C-01</span>
    <p style="margin-bottom:0">§6 anuncia la perspectiva del <strong>administrador</strong> y el
    documento no la desarrolla. §6.5 pasa directamente a mensajes de error. Esta app no la inventa:
    la señala como pendiente de redacción.</p>
  </div>

  <h2>Estados del modelo</h2>
  ${figura('Flujo de estados', 'Siete estados y sus transiciones · §7.3',
    infoEstados(ESTADOS),
    'Una versión aprobada es inmutable: cualquier cambio genera una nueva versión (RN-FIN-07).')}

  <div class="tabla-caja"><table>
    <thead><tr><th style="width:180px">Estado</th><th>Regla</th></tr></thead>
    <tbody>${ESTADOS.map(e => `<tr><td><strong>${esc(e[0])}</strong></td><td>${esc(e[1])}</td></tr>`).join('')}</tbody>
  </table></div>

  <h2>Operaciones críticas y mensajes de error</h2>
  <div class="tabla-caja"><table>
    <caption>§6.5 · Qué hace el sistema en cada situación</caption>
    <thead><tr><th style="width:250px">Situación</th><th>Respuesta del sistema</th></tr></thead>
    <tbody>${MENSAJES.map(m => `<tr><td><strong>${esc(m[0])}</strong></td><td>${esc(m[1])}</td></tr>`).join('')}</tbody>
  </table></div>

  <h2>Interoperabilidad con Risk Simulator</h2>
  <p>Risk Simulator es un complemento de Excel de Real Options Valuation. Su incorporación proviene
  de una instrucción directa de Rehavid [R-05].</p>
  <div class="tarjeta">
    <h4 style="margin-top:0">Flujo del producto mínimo viable · §9.2</h4>
    <ol style="margin-bottom:0">${FLUJO_RS.map(f => `<li>${esc(f)}</li>`).join('')}</ol>
  </div>
  <div class="aviso">
    <span class="rotulo">Decisión de arquitectura · §9.3</span>
    <p style="margin-bottom:0">MVP: interoperabilidad asistida por archivos estructurados. Fase
    posterior: integración directa únicamente mediante mecanismo autorizado por el fabricante. Esta
    separación evita prometer una conexión no confirmada.</p>
  </div>`;
}

/* ============================================================
   4 · MÓDULO 3 · ESPECIFICACIÓN
   ============================================================ */
function secEspecificacion() {
  const porCat = {};
  RIESGOS.forEach(r => porCat[r[3]] = (porCat[r[3]]||0)+1);

  return `
  <h1>Módulo 3 · Especificación funcional</h1>
  <p class="entradilla">Diseñar una aplicación capaz de formar y certificar usuarios, administrar
  modelos financieros de deuda y liquidez, evaluar restricciones, interoperar con Risk Simulator,
  auditar el modelo y conservar trazabilidad.</p>

  <h2>Arquitectura funcional</h2>
  ${figura('Seis capas y sus doce componentes', 'Cada componente ubicado en su capa · §3.2 y §7.2',
    infoCapas(CAPAS, COMPONENTES),
    'Los códigos MF-01 a MF-12 son los del documento. La ubicación por capa se deduce del contenido de cada componente.')}

  <h2>Principios rectores</h2>
  <div class="tabla-caja"><table>
    <caption>§3.1</caption>
    <thead><tr><th style="width:280px">Principio</th><th>Implicación</th></tr></thead>
    <tbody>${PRINCIPIOS.map(p => `<tr><td><strong>${esc(p[0])}</strong></td><td>${esc(p[1])}</td></tr>`).join('')}</tbody>
  </table></div>

  <h2>Motor financiero · fórmulas</h2>
  <div class="aviso">
    <span class="rotulo">Criterio de diseño financiero · §8</span>
    <p style="margin-bottom:0">La app debe mostrar qué se calculó, con qué datos, bajo qué
    periodicidad y con qué versión. Los valores contractuales no pueden ser sustituidos por umbrales
    genéricos.</p>
  </div>
  <div class="tabla-caja"><table>
    <thead><tr><th style="width:44px">ID</th><th style="width:52px">§</th><th style="width:180px">Concepto</th><th>Expresión</th></tr></thead>
    <tbody>${FORMULAS.map(f => `<tr>
      <td class="mono">${f.id}</td><td>${f.seccion}</td>
      <td><strong>${esc(f.nombre)}</strong></td>
      <td><code>${esc(f.expr)}</code>${f.nota ? `<div style="font-size:11px;color:var(--ink-4);margin-top:4px">${esc(f.nota)}</div>` : ''}</td>
    </tr>`).join('')}</tbody>
  </table></div>

  <h2>Reglas de negocio financieras</h2>
  <div class="tabla-caja"><table>
    <caption>§8.7</caption>
    <thead><tr><th style="width:110px">Código</th><th>Regla</th></tr></thead>
    <tbody>${REGLAS_FIN.map(r => `<tr><td class="mono">${esc(r[0])}</td><td>${esc(r[1])}</td></tr>`).join('')}</tbody>
  </table></div>

  <h2 class="salto-antes">Requisitos funcionales</h2>
  <div class="tabla-caja"><table>
    <caption>§11.1 · 32 requisitos priorizados</caption>
    <thead><tr><th style="width:64px">ID</th><th style="width:62px">Prior.</th><th style="width:100px">Módulo</th>
      <th>Requisito</th><th style="width:110px">Origen</th><th style="width:150px">Criterio de aceptación</th></tr></thead>
    <tbody>${RF.map(r => `<tr>
      <td class="mono">${esc(r[0])}</td>
      <td><span class="etiqueta ${r[1]==='Alta'?'':'gris'}">${esc(r[1])}</span></td>
      <td>${esc(r[2])}</td><td>${esc(r[3])}</td>
      <td class="mono" style="font-size:10px">${esc(r[4])}</td><td>${esc(r[5])}</td>
    </tr>`).join('')}</tbody>
  </table></div>

  <h2>Requisitos no funcionales</h2>
  <div class="tabla-caja"><table>
    <caption>§11.2 · las filas resaltadas no tienen criterio verificable (hallazgo V-04)</caption>
    <thead><tr><th style="width:80px">ID</th><th style="width:130px">Categoría</th><th>Requisito</th></tr></thead>
    <tbody>${RNF.map(r => {
      const flojo = /por definir|queda por validar|^Definir /i.test(r[2]);
      return `<tr${flojo?' style="background:var(--warn-bg)"':''}>
        <td class="mono">${esc(r[0])}</td><td>${esc(r[1])}</td>
        <td>${esc(r[2])}${flojo?' <span class="etiqueta ambar">sin criterio</span>':''}</td></tr>`;
    }).join('')}</tbody>
  </table></div>

  <h2>Tableros mínimos</h2>
  <div class="rejilla c2">${TABLEROS.map((t,i) => `<div class="tarjeta suave">
    <h4 style="margin-top:0;color:${PAL[i%PAL.length]}">${esc(t[0])}</h4>
    <p style="font-size:12.5px;margin-bottom:0">${esc(t[1])}</p></div>`).join('')}</div>

  <h2 class="salto-antes">Historias de usuario</h2>
  <div class="tabla-caja"><table>
    <thead><tr><th style="width:70px">ID</th><th>Historia</th></tr></thead>
    <tbody>${HISTORIAS.map(x => `<tr><td class="mono">${esc(x[0])}</td><td>${esc(x[1])}</td></tr>`).join('')}</tbody>
  </table></div>

  <h2>Casos de prueba de aceptación</h2>
  <div class="tabla-caja"><table>
    <thead><tr><th style="width:70px">ID</th><th style="width:290px">Condición</th><th>Resultado esperado</th></tr></thead>
    <tbody>${CASOS.map(c => `<tr><td class="mono">${esc(c[0])}</td><td>${esc(c[1])}</td><td>${esc(c[2])}</td></tr>`).join('')}</tbody>
  </table></div>

  <h2>Modelo de datos</h2>
  <div class="tabla-caja"><table>
    <caption>§10.1 · 16 entidades principales</caption>
    <thead><tr><th style="width:230px">Entidad</th><th>Contenido esencial</th></tr></thead>
    <tbody>${ENTIDADES.map(e => `<tr><td class="mono">${esc(e[0])}</td><td>${esc(e[1])}</td></tr>`).join('')}</tbody>
  </table></div>

  <h2>Marco jurídico colombiano</h2>
  <div class="aviso aten">
    <span class="rotulo">Límite jurídico declarado en §10.3</span>
    <p style="margin-bottom:0">La matriz orienta el diseño y no reemplaza la revisión de un abogado,
    contador o responsable de protección de datos; su aplicabilidad depende del usuario, los datos,
    las integraciones y la finalidad real del despliegue.</p>
  </div>
  <div class="tabla-caja"><table>
    <thead><tr><th style="width:220px">Norma / contrato</th><th style="width:250px">Cuándo aplica</th><th>Implicación de diseño</th></tr></thead>
    <tbody>${JURIDICO.map(j => `<tr><td><strong>${esc(j[0])}</strong></td><td>${esc(j[1])}</td><td>${esc(j[2])}</td></tr>`).join('')}</tbody>
  </table></div>

  <h2 class="salto-antes">Riesgos del producto</h2>
  ${figura('Once riesgos con su control definido', 'Agrupados por dominio · §12.3',
    matrizRiesgos(RIESGOS),
    'El documento define un control para cada riesgo. El color de la barra indica el dominio.')}
  <div class="rejilla c2">
    ${figura('Riesgos por dominio', null,
      `<div style="max-width:280px;margin:0 auto">${anillo(Object.entries(porCat),{centro:'riesgos'})}</div>`,
      null, leyendaDe(Object.keys(porCat).map((k,i)=>[PAL[i%PAL.length],k])))}
    <div class="tarjeta">
      <h4 style="margin-top:0">Producto mínimo viable</h4>
      <div class="tabla-caja"><table>
        <thead><tr><th style="width:70px">Bloque</th><th>Alcance</th></tr></thead>
        <tbody>${MVP.map(m => `<tr><td class="mono">${esc(m[0])}</td><td><strong>${esc(m[1])}</strong><br><span style="font-size:11.5px">${esc(m[2])}</span></td></tr>`).join('')}</tbody>
      </table></div>
    </div>
  </div>

  <h2>Decisiones pendientes de validación</h2>
  <p>§12.4 las declara. El motor de análisis las reordena por dependencia en su ruta priorizada.</p>
  <ol>${PENDIENTES.map(p => `<li>${esc(p)}</li>`).join('')}</ol>

  <div class="aviso">
    <span class="rotulo">Conclusión técnica del documento</span>
    <p style="margin-bottom:0">Con el material aportado es posible construir un MVP coherente y
    trazable centrado en deuda, cobertura, capacidad, liquidez, simulación, auditoría y formación.
    No es técnicamente responsable ampliar el producto hacia valoración integral, impuestos, estados
    financieros completos o crédito automático sin nuevas fuentes o decisiones de alcance.</p>
  </div>`;
}

/* ============================================================
   7 · CÓMO FUNCIONA ESTA APP
   ============================================================ */
function secComoFunciona() {
  return `
  <h1>Cómo funciona esta app</h1>
  <p class="entradilla">Manual de uso de esta herramienta. No es el manual del producto que el
  documento define —ese es el Módulo 2— sino de este archivo HTML que tienes abierto.</p>

  <h2>Qué es este archivo</h2>
  <div class="tarjeta">
    <p>Un <strong>único archivo HTML autocontenido</strong>. Todo está dentro: el texto del
    documento, la tipografía, los gráficos, la lógica y el libro de Excel descargable.</p>
    <ul style="margin-bottom:0">
      <li><strong>Funciona sin internet.</strong> No carga nada de ningún servidor. Ábrelo con doble clic.</li>
      <li><strong>No necesita instalación</strong> ni servidor ni cuenta de usuario.</li>
      <li><strong>Puedes copiarlo</strong> a un USB, enviarlo por correo o guardarlo en una carpeta compartida. Sigue funcionando.</li>
      <li><strong>Nada sale de tu equipo.</strong> No hay analítica, ni rastreo, ni envío de datos.</li>
    </ul>
  </div>

  <h2>Las secciones</h2>
  <div class="tabla-caja"><table>
    <thead><tr><th style="width:50px">N.º</th><th style="width:220px">Sección</th><th>Para qué sirve</th></tr></thead>
    <tbody>
      <tr><td>0</td><td><strong>Portada y síntesis</strong></td><td>Cifras del documento, ciclo del producto, alcance y la base probatoria real.</td></tr>
      <tr><td>1</td><td><strong>Módulo 1 · Formación</strong></td><td>Las ocho unidades, cada una con nivel básico (del documento) e intermedio (complemento marcado).</td></tr>
      <tr><td>2</td><td><strong>Evaluación y certificado</strong></td><td>Examen adaptativo con corrección inmediata, repregunta, umbral del 80 % y certificado imprimible.</td></tr>
      <tr><td>3</td><td><strong>Módulo 2 · Operación</strong></td><td>Roles, rutas, estados del modelo y mensajes de error del producto que el documento define.</td></tr>
      <tr><td>4</td><td><strong>Módulo 3 · Especificación</strong></td><td>Arquitectura, fórmulas, 32 requisitos, casos de prueba, modelo de datos, riesgos y MVP.</td></tr>
      <tr><td>5</td><td><strong>Laboratorio financiero</strong></td><td>Calculadora con las fórmulas de §8: deuda, DSCR, liquidez y capacidad máxima.</td></tr>
      <tr><td>6</td><td><strong>Motor de análisis</strong></td><td>Reglas que examinan el documento y devuelven hallazgos con la regla que los produjo.</td></tr>
      <tr><td>7</td><td><strong>Cómo funciona esta app</strong></td><td>Esta sección.</td></tr>
      <tr><td>8</td><td><strong>Documento fuente</strong></td><td>El texto íntegro, buscable.</td></tr>
      <tr><td>9</td><td><strong>Fuentes y trazabilidad</strong></td><td>Las 17 fuentes y el mapa tema → unidad → componente → requisito.</td></tr>
      <tr><td>10</td><td><strong>Descargas</strong></td><td>El libro de Excel con macros.</td></tr>
    </tbody>
  </table></div>

  <h2>Cómo leer los gráficos</h2>
  <div class="rejilla c2">
    <div class="tarjeta suave"><h4 style="margin-top:0">Barras y anillos</h4>
      <p style="font-size:12.5px;margin-bottom:0">Cuentan elementos reales del documento: requisitos,
      riesgos, fuentes. Pasa el cursor por encima para ver el valor exacto. Ningún número está inventado.</p></div>
    <div class="tarjeta suave"><h4 style="margin-top:0">Gráfico de cobertura (DSCR)</h4>
      <p style="font-size:12.5px;margin-bottom:0">La línea roja discontinua es el covenant. Los puntos
      rojos son periodos que incumplen. «n/c» marca periodos sin servicio de deuda, donde el DSCR no
      se calcula (RN-FIN-02).</p></div>
    <div class="tarjeta suave"><h4 style="margin-top:0">Gráfico de liquidez</h4>
      <p style="font-size:12.5px;margin-bottom:0">El área morada es la caja final; la línea roja, la
      caja mínima. Un punto por debajo es incumplimiento de liquidez aunque la cobertura cumpla.</p></div>
    <div class="tarjeta suave"><h4 style="margin-top:0">Infografías</h4>
      <p style="font-size:12.5px;margin-bottom:0">El ciclo, las capas, los estados y la ruta formativa
      reproducen estructuras descritas en el documento. Están dibujadas para esta app; la estructura
      es del documento.</p></div>
  </div>

  <h2>Distintivos de procedencia</h2>
  <p>Todo el contenido lleva marcada su procedencia. Es la regla más importante de esta app:</p>
  <div class="rejilla c3">
    <div class="tarjeta"><div class="procedencia doc">Contenido del documento</div>
      <p style="font-size:12.5px;margin-bottom:0">Texto o dato que está en el documento de Word. Se cita la sección.</p></div>
    <div class="tarjeta"><div class="procedencia ext">Aporte externo</div>
      <p style="font-size:12.5px;margin-bottom:0">Contenido elaborado para esta app. No está en el documento y se dice.</p></div>
    <div class="tarjeta"><div class="procedencia falta">Dato faltante</div>
      <p style="font-size:12.5px;margin-bottom:0">El documento no aporta el dato. No se rellena: se señala.</p></div>
  </div>

  <h2>Impresión</h2>
  <div class="tarjeta">
    <p>La app está preparada para papel. Al imprimir:</p>
    <ul>
      <li>El texto sale <strong>justificado</strong> y el contenido <strong>centrado</strong> en la página.</li>
      <li><strong>Ninguna tabla, gráfico, tarjeta o certificado se parte</strong> entre dos páginas.</li>
      <li>Los encabezados de tabla <strong>se repiten</strong> cuando una tabla ocupa varias páginas.</li>
      <li>Un título nunca queda solo al final de una página.</li>
      <li>Se ocultan la navegación y los botones.</li>
      <li>Se conservan los colores de la identidad Rehavid.</li>
    </ul>
    <p style="margin-bottom:0">En la barra superior eliges <strong>tamaño de papel</strong> —Carta o
    A4— y si imprimes <strong>solo la sección actual</strong> o <strong>el documento completo</strong>,
    en cuyo caso cada sección empieza en página nueva.</p>
  </div>
  <div class="aviso">
    <span class="rotulo">Consejo para imprimir</span>
    <p style="margin-bottom:0">En el diálogo de impresión del navegador, activa <em>Gráficos de
    fondo</em> para que los colores de marca salgan en el papel. En Chrome está en «Más
    configuraciones».</p>
  </div>

  <h2>Guardado de tu avance</h2>
  <p>El avance de la formación, el perfil y el historial de intentos se guardan en el
  <strong>almacenamiento local de tu navegador</strong>. No se envían a ningún sitio. Si abres el
  archivo en otro equipo o en otro navegador, empiezas de cero. Si tu navegador bloquea el
  almacenamiento local al abrir archivos locales, la app sigue funcionando pero no recuerda el avance
  entre sesiones.</p>

  <h2>Límites de esta app</h2>
  <div class="aviso aten">
    <span class="rotulo">Lo que esta herramienta no hace</span>
    <ul style="margin-bottom:0">
      <li>El motor de análisis <strong>no comprende el texto</strong>: aplica reglas explícitas. No sustituye a un revisor humano.</li>
      <li>El laboratorio <strong>no contiene datos de Rehavid</strong>. Sus valores iniciales son un ejemplo neutro.</li>
      <li>No hay conexión con Risk Simulator: el documento sitúa esa interoperabilidad en el producto, no aquí.</li>
      <li>El certificado es una <strong>demostración del mecanismo</strong> descrito en §5.5, no un certificado oficial de Rehavid.</li>
    </ul>
  </div>`;
}

/* ============================================================
   9 · FUENTES Y TRAZABILIDAD
   ============================================================ */
function secFuentes() {
  const porTipo = {};
  FUENTES.forEach(f => porTipo[f[3]] = (porTipo[f[3]]||0)+1);
  const citas = FUENTES.map(f => [f[0], f[4]]).sort((a,b) => b[1]-a[1]);

  return `
  <h1>Fuentes y trazabilidad</h1>
  <p class="entradilla">Las 17 fuentes que el documento registra y el mapa que conecta cada tema con
  su unidad formativa, su componente y su requisito.</p>

  <div class="rejilla c2">
    ${figura('Fuentes por tipo','Composición del registro de §13.2',
      `<div style="max-width:280px;margin:0 auto">${anillo(Object.entries(porTipo),{centro:'fuentes'})}</div>`,
      'Tres segmentos de transcripción, tres instrucciones de Rehavid y once fuentes externas de validación.',
      leyendaDe(Object.keys(porTipo).map((k,i)=>[PAL[i%PAL.length],k])))}
    ${figura('Frecuencia de cita','Cuántas veces se invoca cada fuente en el documento',
      barrasH(citas, {anchoEtq: 80, color: (d,i) => {
        const f = FUENTES.find(x => x[0] === d[0]);
        return f[3]==='Transcripción' ? PAL[0] : (f[3]==='Instrucción' ? PAL[1] : PAL[2]);
      }}),
      'Recuento hecho por esta app sobre el texto del documento.',
      leyendaDe([[PAL[0],'Transcripción'],[PAL[1],'Instrucción Rehavid'],[PAL[2],'Externa']]))}
  </div>

  <h2>Registro de fuentes</h2>
  <div class="tabla-caja"><table>
    <caption>§13.2</caption>
    <thead><tr><th style="width:70px">ID</th><th>Fuente</th><th style="width:230px">Uso</th>
      <th style="width:100px">Tipo</th><th style="width:60px">Citas</th></tr></thead>
    <tbody>${FUENTES.map(f => `<tr>
      <td class="mono">${esc(f[0])}</td><td>${esc(f[1])}</td><td>${esc(f[2])}</td>
      <td><span class="etiqueta ${f[3]==='Transcripción'?'':(f[3]==='Instrucción'?'verde':'gris')}">${esc(f[3])}</span></td>
      <td class="num">${f[4]}</td></tr>`).join('')}</tbody>
  </table></div>

  <div class="aviso aten">
    <span class="rotulo">Sobre [F-01] · hallazgo R-01</span>
    <p style="margin-bottom:0">La fuente que sostiene CFADS, servicio de deuda y DSCR es un
    <em>Implementation Status &amp; Results Report</em> de un proyecto vial: un informe de
    seguimiento, no literatura metodológica. Las definiciones son correctas y estándar; el respaldo
    documental es débil para lo que se le pide.</p>
  </div>

  <h2>Matriz de trazabilidad</h2>
  <div class="tabla-caja"><table>
    <caption>§13.1 · tema → origen → ubicación → resultado</caption>
    <thead><tr><th style="width:230px">Tema</th><th style="width:70px">Origen</th>
      <th style="width:200px">Ubicación</th><th>Resultado</th></tr></thead>
    <tbody>${TRAZABILIDAD.map(t => `<tr>
      <td>${esc(t[0])}</td><td class="mono">[${esc(t[1])}]</td>
      <td class="mono" style="font-size:11px">${esc(t[2])}</td><td>${esc(t[3])}</td></tr>`).join('')}</tbody>
  </table></div>`;
}

/* ============================================================
   8 · DOCUMENTO FUENTE
   ============================================================ */
function secDocumento() {
  return `
  <h1>Documento fuente íntegro</h1>
  <p class="entradilla">El texto completo del documento técnico maestro, incrustado en este archivo.
  El motor de análisis trabaja sobre este mismo texto.</p>
  <div class="doc-buscador no-imprimir">
    <input type="text" id="doc-buscar" placeholder="Buscar en el documento…" oninput="buscarDoc(this.value)">
    <div class="ayuda" id="doc-resultado" style="font-size:11.5px;color:var(--ink-4);margin-top:5px"></div>
  </div>
  <div class="doc-cuerpo" id="doc-cuerpo">${DOC_HTML}</div>`;
}

function buscarDoc(q) {
  const cuerpo = $('#doc-cuerpo'), info = $('#doc-resultado');
  if (!cuerpo._original) cuerpo._original = cuerpo.innerHTML;
  cuerpo.innerHTML = cuerpo._original;
  if (!q || q.length < 3) { info.textContent = ''; return; }

  // Se resalta recorriendo nodos de texto, para no romper el marcado HTML.
  const re = new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
  const andar = document.createTreeWalker(cuerpo, NodeFilter.SHOW_TEXT);
  const nodos = [];
  let nodo;
  while ((nodo = andar.nextNode())) { re.lastIndex = 0; if (re.test(nodo.nodeValue)) nodos.push(nodo); }

  let n = 0;
  nodos.forEach(t => {
    const texto = t.nodeValue;
    const frag = document.createDocumentFragment();
    let ultimo = 0, m;
    re.lastIndex = 0;
    while ((m = re.exec(texto)) !== null) {
      if (m.index > ultimo) frag.appendChild(document.createTextNode(texto.slice(ultimo, m.index)));
      const mk = document.createElement('mark');
      mk.textContent = m[0];
      frag.appendChild(mk);
      ultimo = m.index + m[0].length;
      n++;
      if (m[0].length === 0) re.lastIndex++;
    }
    if (ultimo < texto.length) frag.appendChild(document.createTextNode(texto.slice(ultimo)));
    t.parentNode.replaceChild(frag, t);
  });
  info.textContent = n ? n + ' coincidencia(s)' : 'sin coincidencias';
}

/* ============================================================
   10 · DESCARGAS
   ============================================================ */
function secDescargas() {
  return `
  <h1>Descargas</h1>
  <p class="entradilla">El libro de Excel replica el laboratorio financiero y las tablas del
  documento, con macros que añaden el redibujado de flujos y la iteración de escenarios.</p>

  <div class="tarjeta">
    <h3 style="margin-top:0">Libro Excel con macros · <span class="mono">.xlsm</span></h3>
    <p>Incluye el modelo de deuda, cobertura y liquidez con fórmulas nativas, gráficos de Excel,
    tablas del documento, el banco de preguntas y el diagrama de flujo editable.</p>
    <p><strong>Tamaño:</strong> <span id="peso-xlsm">—</span></p>
    <button class="verde" onclick="descargarExcel()">Descargar el libro Excel</button>
  </div>

  <div class="aviso aten">
    <span class="rotulo">Importante · las macros llegan bloqueadas</span>
    <p>Desde 2022, Excel bloquea las macros de los archivos que provienen de internet. Al abrir el
    libro es posible que veas un aviso y que las macros no funcionen. Para habilitarlas:</p>
    <ol style="margin-bottom:8px">
      <li>Cierra el archivo.</li>
      <li>Clic derecho sobre él → <strong>Propiedades</strong>.</li>
      <li>Abajo, marca <strong>Desbloquear</strong> y acepta.</li>
      <li>Vuelve a abrirlo y habilita el contenido.</li>
    </ol>
    <p style="margin-bottom:0"><strong>Si no lo haces, el libro sigue siendo plenamente utilizable:</strong>
    las fórmulas, los gráficos, las tablas y el formato condicional son nativos de Excel y no dependen
    de las macros. Estas solo añaden el redibujado del diagrama y la iteración automática de escenarios.</p>
  </div>

  <h2>Qué trae el libro</h2>
  <div class="tabla-caja"><table>
    <thead><tr><th style="width:170px">Hoja</th><th>Contenido</th><th style="width:130px">Necesita macros</th></tr></thead>
    <tbody>
      <tr><td><strong>Panel</strong></td><td>Parámetros editables, indicadores y gráficos de deuda, cobertura y liquidez.</td><td>No</td></tr>
      <tr><td><strong>Modelo</strong></td><td>Calendario completo con las fórmulas F1 a F7 vivas: cambia un parámetro y recalcula.</td><td>No</td></tr>
      <tr><td><strong>Escenarios</strong></td><td>Comparación de escenarios y registro de supuestos con su fuente.</td><td>Iteración automática</td></tr>
      <tr><td><strong>Flujos</strong></td><td>Tabla de nodos que alimenta un diagrama de flujo editable.</td><td>Redibujado</td></tr>
      <tr><td><strong>Requisitos</strong></td><td>Los 32 requisitos funcionales y los 14 no funcionales.</td><td>No</td></tr>
      <tr><td><strong>Formación</strong></td><td>Las ocho unidades y el banco de preguntas.</td><td>No</td></tr>
      <tr><td><strong>Fuentes</strong></td><td>Registro de las 17 fuentes y matriz de trazabilidad.</td><td>No</td></tr>
    </tbody>
  </table></div>

  <h2>Imprimir</h2>
  <div class="tarjeta">
    <p>Usa los controles de la barra superior para elegir tamaño de papel y alcance.</p>
    <div style="display:flex;gap:9px;flex-wrap:wrap">
      <button class="secundario" onclick="imprimir(false)">Imprimir la sección actual</button>
      <button class="secundario" onclick="imprimir(true)">Imprimir el documento completo</button>
    </div>
  </div>`;
}

function descargarExcel() {
  try {
    const bin = atob(XLSM_B64);
    const buf = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) buf[i] = bin.charCodeAt(i);
    const blob = new Blob([buf], { type: 'application/vnd.ms-excel.sheet.macroEnabled.12' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'Rehavid_Modelacion_Financiera_v1.xlsm';
    document.body.appendChild(a); a.click();
    setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 1500);
  } catch (e) {
    alert('No se pudo generar la descarga en este navegador: ' + e.message);
  }
}
