/* ============================================================
   MÓDULO 2 · MANUAL DE USO Y OPERACIÓN
   ============================================================ */

VISTAS['m-uso'] = () => cabecera('manual', 'Cómo usar esta app',
  'Guía rápida de la herramienta que tienes abierta.',
  `<button class="sec" onclick="imprimir(true)">${ico('imprimir',15)} Imprimir todo</button>`) + `

  ${avisoHTML('ok', 'Un solo archivo, sin internet',
    '<p style="margin:0">Esta app es <strong>un único archivo HTML</strong>. Se abre con doble clic, no necesita servidor, ni instalación, ni conexión. Puedes copiarla a un USB o enviarla por correo y seguirá funcionando. Nada de lo que escribas sale de tu equipo.</p>')}

  <h2>Los tres módulos</h2>
  <div class="rejilla c3">
    ${MODULOS.map(m => `<button class="uni-tarjeta" onclick="irModulo('${m.id}')">
      <span class="cod">${m.n}</span>
      <span style="flex:1;min-width:0"><span class="t">${esc(m.t)}</span>
        <span class="d">${esc(m.sub)}</span></span>
      ${ico('flecha', 15)}</button>`).join('')}
  </div>

  <h2>Qué hace cada uno</h2>
  <div class="tabla-caja"><table>
    <thead><tr><th style="width:60px">N.º</th><th style="width:190px">Módulo</th><th>Para qué sirve</th></tr></thead>
    <tbody>
      <tr><td>1</td><td><strong>Formación</strong></td><td>Ocho unidades con nivel básico e intermedio, ocho actividades, laboratorio de Risk Simulator, glosario, evaluación con umbral del 80 % y certificado.</td></tr>
      <tr><td>2</td><td><strong>Manual de operación</strong></td><td>Esta sección, más los perfiles, las rutas por rol, los estados del modelo, los mensajes de bloqueo y el documento fuente.</td></tr>
      <tr><td>3</td><td><strong>Herramienta financiera</strong></td><td>Donde se trabaja: proyecto, supuestos, deuda, CFADS, covenants, liquidez, capacidad, escenarios, simulación, auditoría, backtesting, decisión y reportes.</td></tr>
    </tbody></table></div>

  <h2>Cómo empezar</h2>
  <div class="pasos">
    <div class="paso activo"><span class="n">1</span>Identifícate</div>
    <div class="paso"><span class="n">2</span>Estudia las unidades</div>
    <div class="paso"><span class="n">3</span>Practica en la herramienta</div>
    <div class="paso"><span class="n">4</span>Presenta la evaluación</div>
    <div class="paso"><span class="n">5</span>Certifícate</div>
  </div>
  <ol>
    <li>Entra en <strong>Formación → Evaluación</strong> y escribe tu nombre y cargo. Aparecerán arriba a la derecha.</li>
    <li>Recorre las unidades U1 a U8. Cada una tiene nivel básico (lo que dice el documento) e intermedio (profundización).</li>
    <li>Abre la <strong>Herramienta financiera</strong> y practica con el ejemplo cargado: cambia el covenant, la caja mínima o el método de amortización y mira qué pasa.</li>
    <li>Cuando domines los conceptos, presenta la evaluación: 16 ítems, corrección inmediata y repregunta ante error.</li>
    <li>Con 80 % o más obtienes el certificado, imprimible desde su propia sección.</li>
  </ol>

  <h2>Distintivos de procedencia</h2>
  <p>Todo el contenido dice de dónde viene. Es la regla más importante de esta app.</p>
  <div class="rejilla c3">
    <div class="tarjeta"><div class="procedencia doc">Contenido del documento</div>
      <p style="font-size:12.3px;margin:8px 0 0">Está en el documento técnico maestro. Se cita la sección.</p></div>
    <div class="tarjeta"><div class="procedencia ext">Aporte externo</div>
      <p style="font-size:12.3px;margin:8px 0 0">Elaborado para esta app. No está en el documento y se dice.</p></div>
    <div class="tarjeta"><div class="procedencia falta">Dato faltante</div>
      <p style="font-size:12.3px;margin:8px 0 0">El documento no lo aporta. No se rellena: se señala.</p></div>
  </div>

  <h2>Imprimir</h2>
  <div class="tarjeta">
    <p>En la barra superior eliges tamaño de papel —<strong>Carta o A4</strong>— y si imprimes solo la pantalla actual o todo.</p>
    <ul>
      <li>El texto sale justificado y el contenido centrado.</li>
      <li><strong>Ningún gráfico, tarjeta ni certificado se parte</strong> entre páginas.</li>
      <li>Las tablas largas fluyen entre páginas, pero <strong>ninguna fila se corta</strong> y el encabezado se repite.</li>
      <li>Se ocultan la navegación y los botones.</li>
    </ul>
    <div class="barra-acc no-imprimir" style="margin-bottom:0">
      <button class="sec" onclick="imprimir(false)">${ico('imprimir',15)} Imprimir esta pantalla</button>
      <button class="sec" onclick="imprimir(true)">${ico('imprimir',15)} Imprimir todo</button>
      <span class="ayuda expandir">Activa «Gráficos de fondo» en el diálogo del navegador para conservar los colores.</span>
    </div>
  </div>

  <h2>Guardado</h2>
  <p>El avance de formación, tu perfil, el historial de intentos y el modelo financiero se guardan en el
  <strong>almacenamiento local de este navegador</strong>. Si abres el archivo en otro equipo, empiezas de cero.
  Si el navegador bloquea el almacenamiento local en archivos locales, la app funciona igual pero no recuerda entre sesiones.
  Para llevarte el modelo, usa <strong>Herramienta → Reportes → Exportar modelo</strong>.</p>

  <h2>Límites de esta app</h2>
  ${avisoHTML('aten', 'Lo que esta herramienta no hace',
    `<ul style="margin:0">
      <li>La auditoría <strong>no comprende</strong> el modelo: aplica reglas explícitas. No sustituye a un revisor humano.</li>
      <li><strong>No ejecuta Risk Simulator.</strong> Exporta la especificación, tú simulas en Excel y ella importa los resultados.</li>
      <li>No calcula la probabilidad de ruptura, porque el documento no define qué es una ruptura.</li>
      <li>El certificado es el mecanismo de §5.5 en funcionamiento, no un certificado oficial emitido por Rehavid.</li>
      <li>Los valores cargados en la herramienta son un ejemplo neutro, no datos de Rehavid.</li>
    </ul>`)}`;

/* ============================================================ */
VISTAS['m-roles'] = () => cabecera('usuario', 'Perfiles y permisos',
  'Cinco roles definidos en §6.1. Son una necesidad técnica de operación; no se atribuyen al segmento transcrito.') + `
  <div class="rejilla c2">
    ${ROLES.map((r, i) => `<div class="tarjeta">
      <div class="tarjeta-cab">${ico('usuario',16)}<h3>${esc(r[0])}</h3></div>
      <p style="margin:0">${esc(r[1])}</p></div>`).join('')}
  </div>
  ${avisoHTML('mal', 'Incoherencia detectada en el documento',
    '<p style="margin:0">§6 anuncia que el manual define la operación «desde <strong>cuatro</strong> perspectivas: participante, modelador, revisor y administrador». La tabla define <strong>cinco</strong> roles y el documento desarrolla <strong>tres</strong> rutas: la del administrador se anuncia y no aparece. Esta app no la inventa: la señala.</p>')}`;

/* ============================================================ */
VISTAS['m-rutas'] = () => cabecera('flecha', 'Rutas por rol',
  'Los pasos que sigue cada perfil, según §6.2 a §6.4.') + `
  ${RUTAS.map((r, i) => `<div class="tarjeta">
    <div class="tarjeta-cab">${ico(['usuario','herramienta','auditoria'][i], 16)}<h3>Ruta del ${esc(r.rol.toLowerCase())}</h3>
      <span class="eti gris acc">${r.pasos.length} pasos</span></div>
    <ol style="margin:0">${r.pasos.map(p => `<li>${esc(p)}</li>`).join('')}</ol>
  </div>`).join('')}
  ${avisoHTML('aten', 'Falta la ruta del administrador',
    '<p style="margin:0">§6 la anuncia y el documento no la desarrolla. Es una de las cosas que hay que redactar antes de construir el producto completo.</p>')}`;

/* ============================================================ */
VISTAS['m-estados'] = () => cabecera('refrescar', 'Estados del modelo',
  'Siete estados y sus transiciones (§7.3). Una versión aprobada es inmutable (RN-FIN-07).') + `
  ${figura('Flujo de estados', 'Del borrador al archivo', infoEstados(ESTADOS),
    'Cualquier cambio sobre una versión aprobada genera una versión nueva; no hay edición silenciosa (RF-026).')}
  <div class="tabla-caja"><table>
    <thead><tr><th style="width:190px">Estado</th><th>Regla</th><th style="width:120px">Modelo actual</th></tr></thead>
    <tbody>${ESTADOS.map(e => `<tr><td><strong>${esc(e[0])}</strong></td><td>${esc(e[1])}</td>
      <td>${e[0] === estado.m.proyecto.estado ? '<span class="eti verde">aquí</span>' : ''}</td></tr>`).join('')}
    </tbody></table></div>
  <button class="sec no-imprimir" onclick="irSeccion('h-proyecto')">${ico('proyecto',15)} Cambiar el estado del modelo</button>`;

/* ============================================================ */
VISTAS['m-errores'] = () => cabecera('alerta', 'Mensajes y bloqueos',
  'Qué hace el sistema en cada situación crítica (§6.5), y dónde lo implementa esta app.') + `
  <div class="tabla-caja"><table>
    <thead><tr><th style="width:230px">Situación</th><th>Respuesta del sistema</th><th style="width:130px">En esta app</th></tr></thead>
    <tbody>
      ${MENSAJES.map((m, i) => {
        const impl = ['VAL-08 (periodicidad única por proyecto)','VAL-08','VAL-04','VAL-06','VAL-09',
                      'CP-011 al importar','VAL-12','§5.6, no implementado'][i];
        const hecho = i !== 7;
        return `<tr><td><strong>${esc(m[0])}</strong></td><td>${esc(m[1])}</td>
          <td><span class="eti ${hecho ? 'verde' : 'gris'}">${esc(impl)}</span></td></tr>`;
      }).join('')}
    </tbody></table></div>
  <button class="sec no-imprimir" onclick="irSeccion('h-auditoria')">${ico('auditoria',15)} Ver la auditoría del modelo</button>`;

/* ============================================================ */
VISTAS['m-rs'] = () => cabecera('simulacion', 'Interoperabilidad con Risk Simulator',
  'Complemento de Excel de Real Options Valuation. Su incorporación proviene de una instrucción directa de Rehavid [R-05].') + `
  <h2>Flujo del producto mínimo · §9.2</h2>
  <ol>${FLUJO_RS.map(p => `<li>${esc(p)}</li>`).join('')}</ol>
  ${avisoHTML('', 'Decisión de arquitectura · §9.3',
    '<p style="margin:0">MVP: interoperabilidad asistida por archivos estructurados. Fase posterior: integración directa <strong>únicamente</strong> mediante mecanismo autorizado por el fabricante. Esta separación evita prometer una conexión no confirmada.</p>')}
  ${avisoHTML('aten', 'Riesgo que conviene mirar de frente',
    '<p style="margin:0">MVP-3 «Simulación asistida» es uno de los cinco bloques del producto mínimo y depende por completo de Risk Simulator. §12.4 declara pendientes de validación el licenciamiento vigente, la posibilidad de SDK/OEM y el formato real de intercambio. <strong>Un quinto del MVP depende de decisiones sin resolver.</strong></p>')}
  <h2>Datos mínimos de una ejecución importada · §9.4</h2>
  <div class="tabla-caja"><table>
    <thead><tr><th style="width:150px">Grupo</th><th>Campos</th></tr></thead>
    <tbody>
      <tr><td><strong>Identidad</strong></td><td>Modelo, versión, escenario, archivo y hash.</td></tr>
      <tr><td><strong>Ejecución</strong></td><td>Fecha, usuario, herramienta, versión, iteraciones y método disponible.</td></tr>
      <tr><td><strong>Entradas</strong></td><td>Variable, distribución, parámetros, unidad, fuente y correlaciones.</td></tr>
      <tr><td><strong>Salidas</strong></td><td>Variable, media, mediana, desviación, percentiles y probabilidad de umbral.</td></tr>
      <tr><td><strong>Sensibilidad</strong></td><td>Variable explicativa, signo, magnitud y método.</td></tr>
      <tr><td><strong>Gobierno</strong></td><td>Comentarios, limitaciones, revisión y estado.</td></tr>
    </tbody></table></div>
  <button class="sec no-imprimir" onclick="irSeccion('h-simulacion')">${ico('herramienta',15)} Abrir la simulación en la herramienta</button>`;

/* ============================================================ */
VISTAS['m-calidad'] = () => cabecera('candado', 'Calidad del dato, seguridad y marco jurídico',
  'Controles de §10.2, seguridad de §10.3 y aplicabilidad jurídica de §10.4.') + `
  <h2>Controles de calidad del dato</h2>
  <ul>${CONTROLES_DATO.map(c => `<li>${esc(c)}</li>`).join('')}</ul>
  <h2>Marco jurídico colombiano</h2>
  ${avisoHTML('aten', 'Límite declarado por el propio documento',
    '<p style="margin:0">La matriz orienta el diseño y <strong>no reemplaza</strong> la revisión de un abogado, contador o responsable de protección de datos; su aplicabilidad depende del usuario, los datos, las integraciones y la finalidad real del despliegue.</p>')}
  <div class="tabla-caja"><table>
    <thead><tr><th style="width:210px">Norma o contrato</th><th style="width:250px">Cuándo aplica</th><th>Implicación de diseño</th></tr></thead>
    <tbody>${JURIDICO.map(j => `<tr><td><strong>${esc(j[0])}</strong></td><td>${esc(j[1])}</td><td>${esc(j[2])}</td></tr>`).join('')}</tbody>
  </table></div>
  <h2>Datos personales en esta app</h2>
  <p>Esta app trata únicamente <strong>nombre, cargo y resultados de formación</strong>, y los guarda solo en el
  almacenamiento local de tu navegador. No los transmite. Aun así, son datos personales sujetos al régimen colombiano
  [COL-02][COL-03] cuando se usen en un despliegue real.</p>`;

/* ============================================================
   DOCUMENTO FUENTE Y SU REVISIÓN
   ============================================================ */
VISTAS['m-doc'] = () => {
  const H = ejecutarMotorDocumento();
  const nc = H.filter(x => x.sev === 'critico').length;
  return cabecera('reportes', 'Documento fuente',
    `${META.titulo} · v${META.version} · ${META.fecha} · ${META.palabras.toLocaleString('es-CO')} palabras y ${META.tablas} tablas.`) + `

  <h2>Revisión del documento</h2>
  ${avisoHTML('', 'Reglas deterministas sobre el texto',
    `<p style="margin:0">${REGLAS_DOC.length} reglas explícitas revisan el documento incrustado y devuelven ${H.length} hallazgos
     (${nc} críticos). Cada uno muestra la regla que lo produjo. Sin conexión y sin IA: es reproducible y auditable, y
     <strong>no sustituye a un revisor humano</strong>.</p>`)}
  ${H.map(x => `<div class="hallazgo ${x.sev}">
    <div class="cab"><span class="cod">${x.cod}</span><span class="tit">${esc(x.titulo)}</span>
      <span class="eti ${x.sev === 'critico' ? 'roja' : (x.sev === 'medio' ? 'ambar' : 'gris')}">${x.sev}</span></div>
    <div class="cuerpo"><p style="margin-bottom:6px"><strong>Dato detectado:</strong> ${esc(x.dato)}</p>
      <p style="margin:0">${x.cuerpo}</p></div>
    <div class="regla"><strong>Regla ${x.cod}:</strong> ${esc(x.regla)}</div>
  </div>`).join('')}

  <h2>Texto íntegro</h2>
  <div class="tarjeta no-imprimir" style="padding:12px">
    <input type="text" id="doc-buscar" placeholder="Buscar en el documento…" oninput="buscarDoc(this.value)">
    <div class="ayuda" id="doc-resultado"></div>
  </div>
  <div id="doc-cuerpo" style="font-size:12.6px">${DOC_HTML}</div>`;
};

/* Reglas sobre el documento (versión compacta del motor documental) */
const REGLAS_DOC = [
  { cod:'D-01', sev:'critico', titulo:'El denominador del resultado del intento no está definido',
    regla:'Buscar «preguntas válidas» en el texto y comprobar si existe una oración definitoria.',
    ej: t => {
      const usos = (t.match(/preguntas válidas/gi) || []).length;
      const def = /(se entiende por|se define como|es el conjunto de)[^.]{0,60}preguntas válidas/i.test(t);
      return usos && !def ? { dato:`Término hallado ${usos} vez(ces), ninguna definitoria.`,
        cuerpo:'§5.4 lo usa en la fórmula del resultado y §5.1 introduce repreguntas dentro del examen. Si contaran en el denominador, cada error penalizaría dos veces. Con 20 ítems y 3 errores el resultado es 85 % o 74 % según la lectura: cambia quién se certifica.' } : null; } },
  { cod:'D-02', sev:'critico', titulo:'La evaluación certificable no tiene tamaño definido',
    regla:'Buscar expresiones que fijen el número de ítems del examen o el mínimo por unidad.',
    ej: t => {
      const p = [/\d+\s+preguntas\b/i, /número de preguntas/i, /ítems por unidad/i, /tamaño del banco/i];
      return !p.some(x => x.test(t)) ? { dato:'Ninguna de las 4 expresiones buscadas aparece.',
        cuerpo:'Con 10 preguntas el 80 % admite 2 errores; con 40 admite 8. Es el mismo criterio nominal y una exigencia real distinta. Además la Tabla 16 aporta una sola pregunta por unidad, insuficiente para construir la repregunta que exige §5.2.' } : null; } },
  { cod:'D-03', sev:'critico', titulo:'«Ruptura» se usa en una fórmula sin estar definida',
    regla:'Comprobar si el término «ruptura», presente en la fórmula de §8.5, tiene definición en el texto.',
    ej: t => {
      const usos = (t.match(/ruptura/gi) || []).length;
      const def = /(ruptura se (entiende|define)|se considera ruptura|una ruptura es)/i.test(t);
      return usos && !def ? { dato:`Aparece ${usos} veces; ninguna define qué la constituye.`,
        cuerpo:'¿Incumplir el covenant, quedar bajo la caja mínima, cualquiera de las dos o ambas? ¿«Al menos una» se refiere a periodos o a restricciones? El número reportado cambia con la elección, y es el que mira quien decide. Esta app no calcula el indicador hasta que Rehavid lo defina.' } : null; } },
  { cod:'D-04', sev:'medio', titulo:'Cuatro requisitos no funcionales sin criterio verificable',
    regla:'Marcar los RNF cuyo texto aplaza la definición del criterio.',
    ej: () => {
      const malos = RNF.filter(r => /por definir|queda por validar|^Definir /i.test(r[2]));
      return malos.length ? { dato:`${malos.length} de ${RNF.length}: ${malos.map(m => m[0]).join(', ')}.`,
        cuerpo:'Un requisito sin criterio de aceptación no es un requisito: es una nota. El documento es transparente al respecto, pero los numera igual que a los demás, lo que infla la sensación de cobertura.' } : null; } },
  { cod:'D-05', sev:'critico', titulo:'El proyecto no está dimensionado',
    regla:'Buscar términos de dimensionamiento: presupuesto, costo, esfuerzo, cronograma, equipo.',
    ej: t => {
      const term = ['presupuesto','costo del desarrollo','esfuerzo estimado','cronograma','horas de desarrollo','tamaño del equipo'];
      return !term.some(x => new RegExp(x, 'i').test(t)) ? { dato:`Ninguno de los ${term.length} términos aparece.`,
        cuerpo:'Se propone un MVP de cinco bloques sin estimar esfuerzo, costo, duración ni equipo, y tampoco figura en §12.4 como pendiente, así que ni siquiera está reconocido como faltante. No se puede aprobar un MVP que no está dimensionado.' } : null; } },
  { cod:'D-06', sev:'critico', titulo:'La base probatoria son dos minutos y diez segundos',
    regla:'Sumar la duración de los segmentos citados y compararla con el volumen de especificación derivada.',
    ej: () => {
      const seg = FUENTES.filter(f => f[5]).reduce((a, f) => a + f[5], 0);
      const der = RF.length + RNF.length;
      return (der / (seg / 60)) > 10 ? { dato:`${seg} s citados · ${der} requisitos · ${Math.round(der / (seg / 60))} requisitos por minuto de audio.`,
        cuerpo:'Los tres segmentos suman 34 + 30 + 66 = <strong>130 segundos</strong>. El rango declarado dura 186 s: hay 56 s sin citar. Esto no invalida el documento —su contenido es buena ingeniería de requisitos— pero conviene nombrarlo: <strong>no deriva de la transcripción, se apoya en ella</strong>. Por eso pedir transcripciones adicionales debería ser prioridad, no el último de trece pendientes.' } : null; } },
  { cod:'D-07', sev:'medio', titulo:'Un informe de seguimiento sostiene las definiciones financieras centrales',
    regla:'Revisar las fuentes externas muy citadas cuyo tipo documental sea de seguimiento de proyecto.',
    ej: () => {
      const d = FUENTES.filter(f => f[3] === 'Externa' && f[4] >= 5 && /Implementation Status|Results Report/i.test(f[1]));
      return d.length ? { dato:`${d.map(x => `[${x[0]}] citada ${x[4]} veces`).join('; ')}.`,
        cuerpo:'[F-01] es un <em>Implementation Status &amp; Results Report</em> de un proyecto vial: un informe de avance, no literatura metodológica. Sostiene CFADS, servicio de deuda y DSCR. Las definiciones son correctas y estándar; el respaldo es débil para lo que se le pide, en un documento que exige a sus usuarios registrar la fuente de cada supuesto (RN-FIN-05).' } : null; } },
  { cod:'D-08', sev:'medio', titulo:'Cuatro perspectivas anunciadas, tres rutas entregadas, cinco roles tabulados',
    regla:'Contrastar las perspectivas que anuncia §6 con los roles de su tabla y las rutas desarrolladas.',
    ej: () => (4 === ROLES.length && ROLES.length === RUTAS.length) ? null :
      { dato:`Anunciadas 4 · roles tabulados ${ROLES.length} · rutas desarrolladas ${RUTAS.length}.`,
        cuerpo:'La ruta del administrador se anuncia en §6 y no aparece; §6.5 pasa a mensajes de error. La Tabla 25 añade además Gestor de contenido y Auditor, y fusiona participante con modelador.' } },
  { cod:'D-09', sev:'critico', titulo:'Un bloque del MVP depende de decisiones sin resolver',
    regla:'Cruzar los bloques del MVP con la lista de decisiones pendientes de §12.4.',
    ej: () => {
      const ch = [];
      MVP.forEach(b => PENDIENTES.forEach(p => {
        if (/Risk Simulator/i.test(b[2]) && /Risk Simulator|SDK\/OEM|Licenciamiento/i.test(p)) ch.push(p);
      }));
      return ch.length ? { dato:`${ch.length} dependencia(s) entre el MVP y decisiones pendientes.`,
        cuerpo:'<strong>MVP-3 «Simulación asistida»</strong> depende por completo de Risk Simulator, y §12.4 declara pendientes el licenciamiento, la posibilidad de SDK/OEM y el formato real de intercambio. Un quinto del MVP depende de decisiones que el documento reconoce sin resolver, y la dependencia no está marcada como bloqueante.' } : null; } },
  { cod:'D-10', sev:'leve', titulo:'Hueco en la numeración de las instrucciones de Rehavid',
    regla:'Comprobar si la secuencia de identificadores R- es continua desde 01.',
    ej: () => {
      const n = FUENTES.filter(f => /^R-/.test(f[0])).map(f => parseInt(f[0].split('-')[1]));
      const faltan = [];
      for (let k = 1; k < Math.max(...n); k++) if (!n.includes(k)) faltan.push('R-0' + k);
      return faltan.length ? { dato:`Faltan ${faltan.join(', ')}; la numeración arranca en R-03.`,
        cuerpo:'O se perdieron dos requisitos de Rehavid en una versión previa, o la numeración es arbitraria. En un documento cuyo valor principal es la trazabilidad, el hueco merece explicación.' } : null; } }
];

function ejecutarMotorDocumento() {
  const t = DOC_TEXTO_PLANO;
  const out = [];
  REGLAS_DOC.forEach(r => {
    let res = null;
    try { res = r.ej(t); } catch (e) { res = null; }
    if (res) out.push({ ...r, ...res });
  });
  return out.sort((a, b) => ({critico:0,medio:1,leve:2}[a.sev] - {critico:0,medio:1,leve:2}[b.sev]));
}

function buscarDoc(q) {
  const cuerpo = $('#doc-cuerpo'), info = $('#doc-resultado');
  if (!cuerpo) return;
  if (!cuerpo._original) cuerpo._original = cuerpo.innerHTML;
  cuerpo.innerHTML = cuerpo._original;
  if (!q || q.length < 3) { info.textContent = ''; return; }

  const re = new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
  const andar = document.createTreeWalker(cuerpo, NodeFilter.SHOW_TEXT);
  const nodos = [];
  let nodo;
  while ((nodo = andar.nextNode())) { re.lastIndex = 0; if (re.test(nodo.nodeValue)) nodos.push(nodo); }

  let n = 0;
  nodos.forEach(t => {
    const texto = t.nodeValue, frag = document.createDocumentFragment();
    let ultimo = 0, m;
    re.lastIndex = 0;
    while ((m = re.exec(texto)) !== null) {
      if (m.index > ultimo) frag.appendChild(document.createTextNode(texto.slice(ultimo, m.index)));
      const mk = document.createElement('mark'); mk.textContent = m[0];
      frag.appendChild(mk);
      ultimo = m.index + m[0].length; n++;
      if (m[0].length === 0) re.lastIndex++;
    }
    if (ultimo < texto.length) frag.appendChild(document.createTextNode(texto.slice(ultimo)));
    t.parentNode.replaceChild(frag, t);
  });
  info.textContent = n ? n + ' coincidencia(s)' : 'sin coincidencias';
}
