/* ============================================================================
   REHAVID · LEAN SIX SIGMA DMAIC
   SPECS MÓDULO 0 — GUÍA DE APLICACIÓN   (el manual, recreado dentro de la app)
   ---------------------------------------------------------------------------
   12 capítulos de SÓLO LECTURA (`extra:true`, sin mapeo a Excel). El contenido
   NO es una copia del manual original: está reescrito con redacción propia, en
   español de Colombia, y conectado con las herramientas reales de esta app
   (cada explicación trae un botón `data-goto` que abre el formato).
   JavaScript de navegador plano: sin módulos, sin librerías, sin red.
   ========================================================================== */
'use strict';

const SPECS_GUIA = (function(){

  /* ======================================================================
     1 · MAQUETACIÓN — pequeños constructores de HTML (todo pasa por esc())
     ==================================================================== */
  const J    = a => (a || []).join('');
  const S_P  = 'margin:0 0 10px;font-size:13.2px;line-height:1.68;color:var(--tx2)';
  const S_LI = 'margin:0 0 7px;font-size:12.9px;line-height:1.62;color:var(--tx2)';
  const S_H  = 'margin:16px 0 8px;font-size:12px;letter-spacing:.09em;text-transform:uppercase;' +
               'font-weight:800;color:var(--br-2)';
  const S_Q  = 'margin:0;padding:12px 16px;border-left:3px solid var(--br-2);font-size:14px;' +
               'line-height:1.6;font-style:italic;color:var(--tx)';

  /** Párrafo con texto plano (escapado) */
  const P    = t => '<p style="' + S_P + '">' + esc(t) + '</p>';
  /** Párrafo que admite marcado ya construido por estos mismos helpers */
  const PR   = h => '<p style="' + S_P + '">' + h + '</p>';
  /** Negrilla segura */
  const B    = t => '<b style="color:var(--tx)">' + esc(t) + '</b>';
  /** Subtítulo interno */
  const H    = t => '<div style="' + S_H + '">' + esc(t) + '</div>';
  /** Cita destacada */
  const Q    = t => '<blockquote style="' + S_Q + '">' + esc(t) + '</blockquote>';
  /** Lista con viñetas. Acepta strings o {h:'<html ya seguro>'} */
  const cell = v => (v && typeof v === 'object' && v.h !== undefined) ? v.h : esc(v);
  const UL   = items => '<ul style="margin:0 0 10px;padding-left:18px">' +
    J((items || []).map(i => '<li style="' + S_LI + '">' + cell(i) + '</li>')) + '</ul>';
  const OL   = items => '<ol style="margin:0 0 10px;padding-left:20px">' +
    J((items || []).map(i => '<li style="' + S_LI + '">' + cell(i) + '</li>')) + '</ol>';

  const CARD = (title, body) => '<div class="card">' +
    (title ? '<div class="card-h"><h3>' + esc(title) + '</h3></div>' : '') +
    '<div class="card-b">' + body + '</div></div>';
  /** Tarjeta compacta para rejillas (sin margen inferior) */
  const MINI = (title, body, tone) => '<div class="card" style="margin:0' +
    (tone ? ';border-left:3px solid var(--' + tone + ')' : '') + '">' +
    (title ? '<div class="card-h"><h3>' + esc(title) + '</h3></div>' : '') +
    '<div class="card-b">' + body + '</div></div>';
  const G2   = inner => '<div class="grid2">' + inner + '</div>';
  const G3   = inner => '<div class="grid3">' + inner + '</div>';
  const NOTE = (tone, html) => '<div class="note ' + esc(tone || '') + '" style="margin-bottom:14px">' + html + '</div>';
  const PILL = (txt, tone) => '<span class="pill' + (tone ? ' ' + esc(tone) : '') + '">' + esc(txt) + '</span>';

  const KPIS = items => '<div class="kpis">' + J(items.map(k =>
    '<div class="kpi ' + esc(k.tone || '') + '"><div class="k-l">' + esc(k.label) + '</div>' +
    '<div class="k-v">' + esc(k.value) + '</div>' +
    (k.hint ? '<div class="k-h">' + esc(k.hint) + '</div>' : '') + '</div>')) + '</div>';

  /** Tabla de consulta. `heads` = [string]; `rows` = [[celda,...]] */
  function TBL(heads, rows, alignRight){
    const ar = alignRight || [];
    return '<div class="twrap"><table class="gt"><thead><tr>' +
      J(heads.map((h, i) => '<th' + (ar.indexOf(i) >= 0 ? ' class="n"' : '') + '>' + esc(h) + '</th>')) +
      '</tr></thead><tbody>' +
      J(rows.map(r => '<tr>' + J(r.map((c, i) =>
        '<td' + (ar.indexOf(i) >= 0 ? ' class="n"' : '') +
        ' style="padding:7px 9px;font-size:12.5px;line-height:1.5;vertical-align:top">' +
        cell(c) + '</td>')) + '</tr>')) +
      '</tbody></table></div>';
  }

  /** Botón que navega a una herramienta */
  const BTN  = (id, label) => '<button class="btn sm p" data-goto="' + esc(id) + '">' +
    esc(label || 'Abrir') + ' →</button>';
  /** Botón que navega a una fase completa */
  const BMOD = (mod, label) => '<button class="btn sm g" data-mod="' + esc(mod) + '">' +
    esc(label) + ' →</button>';
  /** Botón que navega a una vista general de la app */
  const BVIEW = (view, label) => '<button class="btn sm g" data-view="' + esc(view) + '">' +
    esc(label) + '</button>';
  /** Enlace en línea a una herramienta (dentro de un párrafo) */
  const LNK  = (id, label) => '<a href="javascript:void(0)" data-goto="' + esc(id) + '" ' +
    'style="color:var(--br-2);font-weight:700;text-decoration:none;border-bottom:1px dotted var(--br-2)">' +
    esc(label) + '</a>';

  /* ======================================================================
     2 · ÍNDICE DE CAPÍTULOS (para la barra ◀ anterior / siguiente ▶)
     ==================================================================== */
  const CAPS = [
    { id:'guia.inicio',              t:'Cómo usar esta aplicación' },
    { id:'guia.que_es_lean',         t:'¿Qué es Lean?' },
    { id:'guia.que_es_six_sigma',    t:'¿Qué es Six Sigma?' },
    { id:'guia.lean_six_sigma',      t:'¿Qué es Lean Six Sigma?' },
    { id:'guia.que_es_dmaic',        t:'¿Qué es DMAIC?' },
    { id:'guia.seleccion_proyectos', t:'Selección de proyectos' },
    { id:'guia.fase_definir',        t:'Fase DEFINIR' },
    { id:'guia.fase_medir',          t:'Fase MEDIR' },
    { id:'guia.fase_analizar',       t:'Fase ANALIZAR' },
    { id:'guia.fase_mejorar',        t:'Fase MEJORAR' },
    { id:'guia.fase_controlar',      t:'Fase CONTROLAR' },
    { id:'guia.cierre',              t:'Cierre y presentación final' }
  ];
  const capIdx = id => { for (let i = 0; i < CAPS.length; i++) if (CAPS[i].id === id) return i; return -1; };

  /** Barra "◀ anterior / siguiente ▶" que cierra cada capítulo */
  function navCap(id){
    const i = capIdx(id), a = CAPS[i - 1], b = CAPS[i + 1];
    return '<div style="display:flex;gap:10px;align-items:center;margin-top:4px;flex-wrap:wrap">' +
      (a ? '<button class="btn g" data-goto="' + esc(a.id) + '">◀ ' + esc(a.t) + '</button>' : '') +
      '<div class="spacer"></div>' +
      '<span class="pill">Capítulo ' + esc(String(i + 1)) + ' de ' + esc(String(CAPS.length)) + '</span>' +
      '<div class="spacer"></div>' +
      (b ? '<button class="btn p" data-goto="' + esc(b.id) + '">' + esc(b.t) + ' ▶</button>' : '') +
      '</div>';
  }
  /** Bloque final estándar de cada capítulo */
  const BLOQUE_NAV = id => ({ type:'html', render: () => navCap(id) });

  /* ======================================================================
     3 · DATOS DE APOYO PARA LOS GRÁFICOS ILUSTRATIVOS
     ==================================================================== */
  /** Muestra normal reproducible (Park–Miller + Box–Muller). Sin aleatoriedad
   *  real: el mismo `seed` dibuja siempre exactamente la misma campana. */
  function muestraNormal(mu, sd, n, seed){
    let s = (seed || 7) % 2147483647; if (s <= 0) s += 2147483646;
    const rnd = () => { s = (s * 16807) % 2147483647; return s / 2147483647; };
    const out = [];
    for (let i = 0; i < n; i++){
      const u1 = Math.max(1e-12, rnd()), u2 = rnd();
      out.push(round(mu + sd * Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2), 2));
    }
    return out;
  }

  /** Tabla de nivel sigma del manual (corto y largo plazo, corrimiento 1,5σ) */
  const TABLA_SIGMA = [
    { z:1, cpDpmo:317300, cpErr:'31,73 %',      cpRto:'68,27 %',       lpDpmo:691500, lpErr:'69,15 %',    lpRto:'30,85 %' },
    { z:2, cpDpmo:45500,  cpErr:'4,55 %',       cpRto:'95,45 %',       lpDpmo:308500, lpErr:'30,85 %',    lpRto:'69,15 %' },
    { z:3, cpDpmo:2700,   cpErr:'0,27 %',       cpRto:'99,73 %',       lpDpmo:66800,  lpErr:'6,68 %',     lpRto:'93,32 %' },
    { z:4, cpDpmo:63.4,   cpErr:'0,0063 %',     cpRto:'99,9937 %',     lpDpmo:6200,   lpErr:'0,62 %',     lpRto:'99,38 %' },
    { z:5, cpDpmo:0.574,  cpErr:'0,00006 %',    cpRto:'99,99994 %',    lpDpmo:230,    lpErr:'0,023 %',    lpRto:'99,977 %' },
    { z:6, cpDpmo:0.002,  cpErr:'0,0000002 %',  cpRto:'99,9999998 %',  lpDpmo:3.4,    lpErr:'0,00034 %',  lpRto:'99,99966 %' }
  ];

  /** Los 7 desperdicios (TIMWOOD, en el orden del manual) */
  const DESPERDICIOS = [
    { n:1, k:'Transporte', peso:13,
      es:'Mover material, producto o información de un lado a otro sin que ese movimiento transforme nada ni le sume valor al cliente.',
      ej:['Llevar producto dentro y fuera del almacén varias veces.',
          'Trasladar materiales entre estaciones distantes.',
          'Pasar la misma información de un área a otra para que la vuelvan a digitar.'],
      el:['Acercar las estaciones y reducir distancias recorridas.',
          'Combinar operaciones para que el material se mueva una sola vez.',
          'Aplicar 5S y ubicar los puntos de uso donde se necesitan.'] },
    { n:2, k:'Exceso de inventario', peso:12,
      es:'Materiales, productos o información acumulados a lo largo del proceso que el cliente no necesita en ese momento.',
      ej:['Materia prima almacenada sin orden de venta que la respalde.',
          'Varias tareas abiertas y ninguna terminada.',
          'Producto terminado que se guarda esperando quién lo pida.'],
      el:['Reducir el tiempo de alistamiento (set up) para producir lotes pequeños.',
          'Implementar flujo continuo de una pieza.',
          'Halar con Kanban en lugar de empujar producción.'] },
    { n:3, k:'Movimientos innecesarios', peso:15,
      es:'Movimientos de las personas que no transforman el producto ni el servicio: buscar, agacharse, caminar de más.',
      ej:['Buscar herramientas y materiales que no están en su sitio.',
          'Caminar largos tramos dentro o fuera de la línea.',
          'Buscar la misma información en tres sistemas distintos.'],
      el:['Herramientas y materiales en un lugar fijo y señalizado.',
          'Sostener las 5S como rutina, no como jornada.',
          'Rediseñar el puesto de trabajo con el operario que lo usa.'] },
    { n:4, k:'Esperas', peso:22,
      es:'Tiempo en que el material, la información, la persona o la máquina están listos pero no pueden avanzar.',
      ej:['Esperar partes, piezas o datos del área anterior.',
          'Esperar la liberación de calidad o una firma.',
          'Esperar mantenimiento o la respuesta de alguien.'],
      el:['Flujo continuo y balanceo de línea.',
          'Reducir tiempos de alistamiento y de respuesta.',
          'Definir tiempos de respuesta y quién los responde.'] },
    { n:5, k:'Procesos innecesarios', peso:12,
      es:'Esfuerzo adicional que se hace y que el cliente no pide ni percibe: sobreprocesar, revisar dos veces, reportar de más.',
      ej:['Limpieza o pulido excesivo de piezas.',
          'Doble inspección de partes o materiales.',
          'Formatos que se llenan porque "siempre se han llenado".'],
      el:['Trabajo estándar: una sola forma correcta de hacerlo.',
          'Entrenamiento e instrucciones claras en el puesto.',
          'Eliminar controles que nadie lee ni usa.'] },
    { n:6, k:'Sobreproducción', peso:8,
      es:'Producir más, antes o más rápido de lo que el cliente necesita. Es el desperdicio que genera a los demás.',
      ej:['Producir para almacenar y no para despachar.',
          'Comprar de más "por si el cliente pide".',
          'Elaborar informes que nadie usa.'],
      el:['Producir contra demanda real (sistema pull).',
          'Reducir tiempos de alistamiento para producir lotes pequeños.',
          'Revisar la programación con la demanda, no con la capacidad ociosa.'] },
    { n:7, k:'Defectos', peso:18,
      es:'Trabajo, información, material, producto o servicio con errores que no cumplen lo que el cliente espera.',
      ej:['Retrabajo y reprocesos.',
          'Documentos con información incorrecta.',
          'Quejas, garantías y devoluciones del cliente.'],
      el:['Prevenir el error en la fuente (Poka Yoke) en vez de inspeccionar.',
          'Ajustar y mantener máquinas y dispositivos de medición.',
          'Entrenar al personal y construir calidad en el proceso.'] }
  ];

  /* ======================================================================
     4 · DICCIONARIO DE HERRAMIENTAS
     Para cada formato de la app: qué entrega (2-4 frases) y el paso a paso
     del manual. Si mañana se agregan herramientas nuevas, el capítulo de la
     fase las lista igual usando su propia `desc`.
     ==================================================================== */
  const DOC = {
    /* ---------------------------------------------------------- DEFINIR */
    'definir.matriz_priorizacion': {
      q:'Es el filtro previo al proyecto: compara los problemas candidatos y deja uno solo sobre la mesa. Se califica cada proyecto contra criterios de la empresa y el mayor puntaje es el que se ejecuta. Evita el error más caro de todos: trabajar seis meses en el problema equivocado.',
      p:['Liste los proyectos candidatos, uno por fila.',
         'Califique de 1 a 5 cada criterio (importancia para el negocio, importancia para el cliente, costo de implementación, probabilidad de éxito, beneficio esperado).',
         'Ojo con el criterio de costo: allí 5 significa costo bajo y 1 costo alto, porque un proyecto barato prioriza mejor.',
         'El resultado multiplica las calificaciones; elija el proyecto de mayor puntaje y anótelo como proyecto del acta.'] },
    'definir.clarificacion_problema': {
      q:'Aquí se convierte una queja en un problema enunciado. Con la técnica 5W 2H se describe qué pasa, por qué es un problema, a quién afecta, dónde y cuándo ocurre, cuánto cuesta y cómo se detectó. El resultado es el Problem Statement (el dolor) y el Business Case (la justificación en plata).',
      p:['Escriba el problema tal como lo reportaron, sin interpretarlo, y suba la foto o el bosquejo.',
         'Registre producto o número de parte y el cliente afectado.',
         'Responda una por una las preguntas: What, Why, Who, Where, When, How much/many, How.',
         'Redacte al final el enunciado en una sola frase con cifra y periodo; eso es lo que se copia al Charter y al A3.'] },
    'definir.arbol_ctq': {
      q:'Traduce la necesidad del cliente a algo medible. De la necesidad se derivan los conductores de calidad y de estos los requisitos críticos (CTQ) con su meta numérica. Es el puente entre "el cliente se queja" y "vamos a medir esto".',
      p:['Escriba la necesidad crítica del cliente, sintetizando el problema del proyecto.',
         'Liste los conductores de calidad que satisfacen esa necesidad (entrega, dimensión, oportunidad, frescura…).',
         'Convierta cada conductor en un requisito medible con número: "menos del 1 % en costos de garantía", "10,4 cm de altura".',
         'Defina la unidad del métrico (%, $, piezas, minutos): esa unidad es la que usará toda la fase MEDIR.'] },
    'definir.series_tiempo': {
      q:'Muestra cómo se ha comportado el métrico del problema periodo a periodo, contra el objetivo y contra el promedio. Es la forma más honesta de establecer la línea base: no un dato suelto, sino una tendencia.',
      p:['Escriba el proceso o producto y el objetivo (target) requerido.',
         'Cargue el periodo (día, mes) y el valor del métrico en cada fila.',
         'La app dibuja la serie con la línea de objetivo y la línea de promedio.',
         'El promedio del periodo estable es su base line: llévelo a la tabla de identificación y al Charter.'] },
    'definir.pareto': {
      q:'Estratifica el problema y separa las pocas categorías vitales de las muchas triviales. Ordena de mayor a menor, calcula el porcentaje y el acumulado, y muestra dónde está el 80 % del problema. Ese Pareto es el que después alimenta el Ishikawa.',
      p:['Registre las categorías o causas y su frecuencia (defectos, eventos, costos).',
         'La app ordena de mayor a menor y calcula porcentaje y porcentaje acumulado.',
         'Lea la curva: las categorías que llegan al 80 % acumulado son las vitales.',
         'Enfoque el alcance del proyecto en esas pocas categorías, no en todo el proceso.'] },
    'definir.objetivo_smart': {
      q:'Convierte la intención en un compromiso verificable. Se declara qué se va a lograr, cuánto, cómo, para qué y para cuándo. Sin fecha y sin cifra no es objetivo, es un deseo.',
      p:['Específico: qué se quiere conseguir exactamente.',
         'Medible: de cuánto a cuánto (del base line a la meta).',
         'Alcanzable: con qué recursos o palanca se logra.',
         'Relevante y Temporal: por qué le importa a la empresa y en cuántos meses; luego redacte el enunciado final en una frase.'] },
    'definir.sipoc': {
      q:'Define las fronteras del proceso donde vive el problema: proveedores, entradas, pasos, salidas y clientes. Fija dónde empieza y dónde termina el proyecto y de paso identifica a las partes interesadas.',
      p:['Escriba nombre del proceso, dueño del proceso, empresa y fecha.',
         'Liste de 4 a 7 pasos macro del proceso; si necesita más detalle, eso va en el mapa detallado de MEDIR.',
         'Complete proveedores y entradas a la izquierda; salidas y clientes a la derecha.',
         'Cierre con los métricos clave de entrada, de proceso y de salida: son los candidatos a medir.'] },
    'definir.beneficios': {
      q:'Estima cuánto vale resolver el problema, en tres escenarios: deseado, goal y retadora. Compara la línea base contra cada meta sobre las ventas del periodo y calcula el ahorro. Es lo que hace que el champion firme.',
      p:['Cargue las ventas del periodo y el costo actual del problema (base line).',
         'Fije el porcentaje meta de cada escenario.',
         'La app calcula el ahorro y el costo resultante en cada escenario.',
         'Valide siempre las cifras con el área financiera antes de llevarlas al Charter.'] },
    'definir.tabla_identificacion': {
      q:'Resume el proyecto en una sola fila: caso del negocio, CTQ, línea base, objetivo, ideal y ahorro. Es el preámbulo del Project Charter y la tabla que se replica en los métricos clave del acta.',
      p:['Traiga el caso del negocio ya redactado en la clarificación.',
         'Traiga el CTQ del árbol y la línea base de la serie de tiempo o del Pareto.',
         'Escriba el objetivo del proyecto y el valor ideal para la empresa.',
         'Cierre con el ahorro estimado de la hoja de beneficios.'] },
    'definir.project_members': {
      q:'Define quién hace qué en el proyecto. Cada rol tiene una responsabilidad distinta y el proyecto se cae cuando falta alguno, sobre todo el dueño del proceso, que es quien sostiene la mejora cuando el Green Belt se va.',
      p:['Champion o sponsor: consigue recursos y desbloquea.',
         'Dueño del proceso: responsable del área intervenida, sostiene las mejoras.',
         'Finanzas: valida ahorros. Mentor (BB/MBB): guía metodológica.',
         'Facilitador (Green Belt): lidera. Team members: el equipo operativo. Registre nombre y cargo de cada uno.'] },
    'definir.gantt': {
      q:'Es el cronograma del proyecto por fase y por tarea, con responsable, fechas y avance. Sirve para comprometer fechas con el champion y para detectar a tiempo que el proyecto se está estirando.',
      p:['Cargue la fecha de inicio del proyecto y el responsable general.',
         'Registre las cinco fases DMAIC y bajo cada una sus tareas.',
         'Asigne responsable, fecha de inicio y fecha de fin a cada tarea.',
         'Actualice el porcentaje de avance en cada reunión de seguimiento: de ahí sale el avance del proyecto.'] },
    'definir.plan_comunicacion': {
      q:'Como el equipo es de varias áreas, define cómo y cuándo se comunican avances, logros y bloqueos. Evita el proyecto que "iba bien" hasta que nadie supo nada por dos meses.',
      p:['Registre el tema o etapa a comunicar y su propósito.',
         'Asigne responsable y audiencia (quién debe asistir).',
         'Defina el medio (acta, presentación, tablero) y el lugar.',
         'Fije la frecuencia: semanal, quincenal, por hito.'] },
    'definir.recursos': {
      q:'Lista lo que se necesita para ejecutar el proyecto: equipos, bases de datos, mano de obra, instrumentos, manuales, registros. Pedirlos al inicio es negociación; pedirlos a mitad de camino es retraso.',
      p:['Liste cada recurso necesario.',
         'Describa para qué se va a usar.',
         'Indique de dónde y cómo se va a obtener.',
         'Lleve los recursos críticos a la reunión de aprobación del Charter.'] },
    'definir.project_charter': {
      q:'Es el acta de constitución: consolida problema, caso del negocio, objetivo, alcance, equipo, beneficios, ahorros, métricos clave y cronograma. Se firma por el champion y el dueño del proceso, y esa firma es el permiso formal para dedicarle tiempo al proyecto.',
      p:['Traiga lo ya redactado: enunciado del problema, business case, objetivo SMART y beneficios.',
         'Declare el alcance: qué entra (scope in) y qué no entra (scope out).',
         'Registre los métricos clave de la fase DEFINIR: existe, base line, objetivo, ideal.',
         'Consiga firma y fecha de champion, dueño del proceso, finanzas, mentor y facilitador.'] },
    'definir.a3_definir': {
      q:'Cuenta la fase DEFINIR en una sola hoja: problema, métrico, base line, ideal, brecha, objetivo, equipo, gráficos y ahorros. Es el formato para presentar y comunicar, no para archivar.',
      p:['Escriba nombre del proyecto, empresa y fechas de inicio y fin.',
         'Copie el problem statement, el business case y el métrico clave.',
         'Registre base line e ideal; la brecha es la resta de los dos.',
         'Incruste el gráfico del problema (serie de tiempo o Pareto) y los ahorros potenciales.'] },

    /* ------------------------------------------------------------ MEDIR */
    'medir.swin_line': {
      q:'Mapa del proceso por carriles: muestra qué hace cada área y cómo se pasan el trabajo entre ellas. Con el tiempo y la distancia de cada paso quedan a la vista las esperas, los reprocesos y los cuellos de botella.',
      p:['Escriba el nombre del proceso y liste las áreas o funciones que participan (un carril por área).',
         'Mapee los pasos con los símbolos: inicio/fin, proceso, formato, decisión y flechas de conexión.',
         'Registre el tiempo y la distancia de cada paso.',
         'Anote demoras y observaciones entre áreas: ahí suele estar el desperdicio.'] },
    'medir.process_mapping_detailed': {
      q:'La versión detallada del mapa: por cada paso registra las variables de entrada (X) y salida (Y), sus especificaciones, los instrumentos de medición, si la variable es controlable o no, el nivel de calidad, el tiempo de ciclo, la distancia y el costo de la no conformidad.',
      p:['Liste los pasos del proceso en orden y clasifique cada uno como valor agregado o no agregado.',
         'Por paso, registre las X (entradas) con su especificación y su gage; luego las Y (salidas) igual.',
         'Marque cada X como C (controlable) o NC (no controlable).',
         'Complete los métricos del paso: DPU/PPM/DPMO/RTY, tiempo de ciclo, distancia y costos; el total es su radiografía del proceso.'] },
    'medir.metricos_desempeno': {
      q:'Declara con qué se va a medir el desempeño del proceso: DPMO, nivel sigma, tiempo de ciclo, lead time, yield, OEE, costos. Fija el lenguaje numérico del proyecto para que el antes y el después se comparen con la misma vara.',
      p:['Escriba el proceso donde se centra el problema.',
         'Seleccione los métricos de desempeño que va a levantar.',
         'Asegure que el métrico del problema (el del CTQ) esté entre ellos.',
         'Ese mismo métrico es el que se vuelve a medir en MEJORAR y se controla en CONTROLAR.'] },
    'medir.plan_muestreo_cualitativo': {
      q:'Plan de muestreo para datos de atributo (pasa/no pasa, con defecto/sin defecto). Define qué se cuenta, sobre qué población, con qué proporción estimada, qué margen de error y qué nivel de confianza.',
      p:['Escriba qué se va a contar y la característica a medir.',
         'Registre el tamaño de la población (N) si lo conoce.',
         'Estime la proporción p con un piloto o con datos históricos.',
         'Fije margen de error y nivel de confianza (usualmente 5 % y 95 %) y defina estrategia y frecuencia de muestreo.'] },
    'medir.tamano_muestra_cualitativos': {
      q:'Calcula cuántos datos de atributo hay que tomar. Devuelve dos números: el tamaño para población desconocida y el ajustado a población finita conocida. Con menos datos que ese número, las conclusiones no se sostienen.',
      p:['Cargue N, p, margen de error y nivel de confianza.',
         'La app calcula Z a partir de la confianza y aplica la fórmula de proporciones.',
         'Use el valor de población conocida cuando tenga N; si no, el de población desconocida.',
         'Redondee siempre hacia arriba y lleve ese número al plan de recolección.'] },
    'medir.plan_muestreo_cuantitativo': {
      q:'El mismo plan, pero para datos continuos (peso, tiempo, dimensión, temperatura). En vez de una proporción se estima la desviación estándar del proceso.',
      p:['Escriba qué se va a medir y la característica (dimensión, peso, tiempo).',
         'Registre N si lo conoce y la desviación estándar estimada, de un piloto o de históricos.',
         'Fije el margen de error en unidades reales (1 mm, 2 segundos) y el nivel de confianza.',
         'Defina estrategia de muestreo (aleatorio, sistemático, estratificado, por conglomerados) y frecuencia.'] },
    'medir.tamano_muestra_cuantitativo': {
      q:'Calcula el número de mediciones continuas necesarias, con y sin población conocida. Es el que evita el clásico "tomamos 12 datos y con eso concluimos".',
      p:['Cargue N, la desviación estándar estimada, el error permitido y la confianza.',
         'Revise el resultado para población desconocida y para población conocida.',
         'Tome el mayor si tiene dudas sobre la variabilidad real.',
         'Si al recolectar la desviación resulta mayor que la estimada, recalcule el tamaño.'] },
    'medir.hojas_verificacion': {
      q:'El formato con el que la gente registra en campo. Puede ser de conteo por criterio con frecuencia acumulada, o de ubicación de defectos sobre un dibujo del producto. Si la hoja es confusa, los datos llegan sucios y todo lo demás falla.',
      p:['Encabece con proceso, fecha, turno, responsable, métrico y equipo de medición.',
         'Escriba instrucciones cortas y sin ambigüedad para quien registra.',
         'Defina los criterios o categorías con las que se va a clasificar.',
         'Deje el conteo, la frecuencia, el acumulado y una columna de observaciones.'] },
    'medir.plan_recoleccion': {
      q:'Es el contrato de los datos: qué se mide, con qué definición operacional, cuántos datos, de dónde salen, con qué método, quién los recoge y cómo se estratifican. Además declara para qué se van a usar y cómo se van a presentar.',
      p:['Defina la medición y su definición operacional (el criterio exacto que hace que algo cuente como defecto).',
         'Traiga el tamaño de muestra ya calculado y registre fuente de información y método de recopilación.',
         'Nombre a quién recolecta y en qué turno o frecuencia.',
         'Declare los factores de estratificación (máquina, operario, turno, lote) y la presentación esperada: histograma, Pareto, dispersión.'] },
    'medir.yield': {
      q:'Rendimiento simple del proceso: qué porcentaje de lo producido salió bueno. Es el indicador más rápido de calidad y el primer número de la línea base.',
      p:['Registre las piezas totales inspeccionadas.',
         'Registre las piezas buenas y las malas.',
         'La app calcula el yield (% de calidad) y el porcentaje de defectos.',
         'Un yield alto por unidad puede esconder un RTY bajo: continúe con RTY/FPY.'] },
    'medir.rty_fpy': {
      q:'Mide el rendimiento de la cadena completa, estación por estación. El RTY multiplica el yield de cada paso contando retrabajos; el FPY sólo cuenta lo que salió bien a la primera. La diferencia entre los dos es la fábrica oculta: el trabajo que se hace dos veces y nadie factura.',
      p:['Cargue la entrada al proceso y el nombre de cada estación.',
         'Registre por estación los defectos y los retrabajos.',
         'La app calcula la salida, el %Yield de cada paso, el RTY y el FPY.',
         'Compare RTY contra FPY: si la brecha es grande, el problema es retrabajo, no scrap.'] },
    'medir.grafico_serie_tiempo': {
      q:'Grafica el criterio medido periodo a periodo durante la fase MEDIR. Sirve para ver estacionalidad, saltos y tendencias antes de calcular capacidad o nivel sigma.',
      p:['Escriba el criterio que está midiendo (costos, defectos, tiempo).',
         'Cargue periodo y valor.',
         'Observe el patrón: tendencia, ciclos, puntos raros.',
         'Investigue los puntos atípicos antes de promediarlos: casi siempre tienen una historia.'] },
    'medir.valor_add': {
      q:'Clasifica cada actividad del proceso como valor agregado o no agregado y suma su tiempo. El porcentaje resultante suele ser una sorpresa incómoda y es el mejor argumento para atacar desperdicios.',
      p:['Escriba el nombre del proceso.',
         'Liste las actividades en el orden en que ocurren.',
         'Clasifique cada una: VA si transforma el producto o servicio que el cliente quiere; NVA si no.',
         'Registre el tiempo de cada actividad y lea el porcentaje de valor agregado sobre el total.'] },
    'medir.ppm': {
      q:'Partes por millón defectuosas: cuántas unidades malas habría por cada millón producidas. Es el lenguaje con el que hablan los clientes industriales.',
      p:['Escriba el proceso medido.',
         'Registre unidades inspeccionadas y unidades defectuosas.',
         'La app calcula % de defectos, % de yield, PPM defectuosos y PPM buenos.',
         'Con el PPM ya puede leer el nivel sigma equivalente del proceso.'] },
    'medir.dpmo': {
      q:'Defectos por millón de oportunidades. A diferencia del PPM, tiene en cuenta cuántas formas distintas hay de que una unidad salga mala. Es la base del nivel sigma que usa toda la app.',
      p:['Defina las categorías de defecto posibles: esas son las oportunidades por unidad.',
         'Registre las unidades inspeccionadas y el conteo de defectos por categoría.',
         'La app calcula oportunidades totales (unidades × categorías), defectos totales y DPMO.',
         'Del DPMO sale el nivel sigma: úselo como línea base del desempeño.'] },
    'medir.dpu': {
      q:'Defectos por unidad: en promedio, cuántos defectos tiene cada unidad producida. Es el indicador natural cuando una misma pieza puede traer varios defectos a la vez.',
      p:['Escriba el proceso y las categorías de no conformidad.',
         'Registre el número de defectos encontrados por categoría.',
         'Registre el total de unidades inspeccionadas.',
         'DPU = defectos totales ÷ unidades inspeccionadas; combínelo con RTY para leer la cadena completa.'] },
    'medir.a3_medir': {
      q:'Resume la fase MEDIR en una hoja: estado actual del proceso, resultado del sistema de medición, gráficos de la medición, base line y objetivo SMART. Es lo que se presenta en el cierre de fase.',
      p:['Incruste el mapa del proceso (swim line o mapa detallado).',
         'Incruste el resultado del estudio GR&R del sistema de medición.',
         'Agregue los gráficos de la medición: histograma, Pareto, capacidad.',
         'Cierre con el base line del métrico y el objetivo del proyecto.'] },

    /* --------------------------------------------------------- ANALIZAR */
    'analizar.brainstorming': {
      q:'Lluvia de ideas del equipo sobre qué puede estar causando el problema, y su agrupación por afinidad. No es opinar por opinar: se abre con los datos del problema a la vista y se cierra con categorías ordenadas que alimentan el Ishikawa.',
      p:['Reúna al equipo y presente el problema con indicadores, datos y gráficos.',
         'Pregunte qué podría estar causándolo y anote todas las ideas sin juzgarlas.',
         'Elimine duplicados y agrupe las ideas por afinidad en categorías.',
         'Marque con el equipo las causas más probables: esas pasan al diagrama de causa y efecto.'] },
    'analizar.diagramas_ishikawa': {
      q:'Diagrama de causa y efecto (espina de pescado). Organiza las causas posibles en categorías: 6M para manufactura (materiales, método, mano de obra, maquinaria, medición, medio ambiente) o 4P para procesos transaccionales (políticas, personal, procedimientos, instalaciones).',
      p:['Escriba el problema en la cabeza del pescado, tal como quedó en DEFINIR.',
         'Ubique cada idea del brainstorming en la categoría que le corresponde.',
         'Ramifique cada causa preguntando por qué ocurre esa causa.',
         'Encierre con el equipo las causas potenciales que vale la pena ir a validar en campo.'] },
    'analizar.5_whys': {
      q:'Cadena de porqués para bajar del síntoma a la causa sistémica. Se pregunta por qué unas cinco veces y, en cada nivel, se registra cómo se confirmó la respuesta. Sin esa columna de confirmación, los 5 por qué se vuelven cinco suposiciones.',
      p:['Escriba el problema o la causa potencial que viene del Ishikawa.',
         'Pregunte por qué ocurre y escriba la respuesta.',
         'En cada nivel registre cómo se confirmó: dato, evidencia física, observación en campo.',
         'Cuando la respuesta ya sea puntual y accionable, márquela como causa raíz.'] },
    'analizar.tree_diagram': {
      q:'Árbol de porqués para cuando una pregunta tiene varias respuestas válidas. Permite ver todas las formas en que el proceso puede fallar y llegar a más de una causa raíz.',
      p:['Escriba el problema o la causa potencial en la raíz.',
         'Abra una rama por cada respuesta posible al por qué.',
         'Siga preguntando en cada rama hasta que la respuesta sea concreta.',
         'Marque como causa raíz las respuestas finales de cada rama y llévelas al plan de verificación.'] },
    'analizar.validacion_de_causas': {
      q:'Es la hoja que separa el análisis serio de la corazonada. Cada causa potencial recibe una acción de verificación, un responsable y una fecha; y al volver de campo se marca si la causa realmente afecta o no.',
      p:['Liste las causas potenciales seleccionadas por el equipo.',
         'Escriba para cada una la acción con la que la va a verificar (medición, observación, prueba, análisis de datos).',
         'Asigne responsable y fecha de validación.',
         'Al volver de campo marque el check y escriba en comentarios la evidencia: dato, foto, nuevo hallazgo.'] },
    'analizar.descripcion_causa_raiz': {
      q:'Cierra la fase declarando cuál es la causa raíz del problema y por qué se afirma. Debe decir cuánto del problema explica esa causa, con datos. Es la puerta de entrada a MEJORAR.',
      p:['Traiga el problema tal como quedó en DEFINIR.',
         'Escriba la causa o causas raíz validadas.',
         'Describa por qué es la causa y qué tanto afecta, con información, datos y gráficos.',
         'Si no puede cuantificar el efecto, la causa todavía no está validada: vuelva al plan de verificación.'] },
    'analizar.a3_analizar': {
      q:'Resume la fase ANALIZAR en una hoja: herramientas de análisis usadas, causas potenciales, cómo se validaron y cuál quedó como causa raíz.',
      p:['Incruste el Ishikawa, los 5 por qué o el árbol.',
         'Liste las causas potenciales evaluadas.',
         'Describa el método de validación: gemba, medición, prueba de hipótesis, correlación.',
         'Cierre con la identificación de la causa raíz que se va a atacar.'] },

    /* ---------------------------------------------------------- MEJORAR */
    'mejorar.brainstorming': {
      q:'Lluvia de ideas, ahora de soluciones. Se abre presentando la causa raíz validada, no el problema: las soluciones que no atacan la causa raíz son gasto, no mejora.',
      p:['Presente al equipo la causa raíz con sus datos.',
         'Pregunte cuáles podrían ser las soluciones y anote todo.',
         'Elimine duplicados y agrupe por afinidad.',
         'Deje una lista corta de soluciones candidatas para evaluar.'] },
    'mejorar.seleccion_soluciones': {
      q:'Evalúa cada solución candidata contra esfuerzo, beneficio, factibilidad y relación costo-beneficio, y entrega un puntaje comparable. La mejor calificada es la candidata, pero la decisión final la toma el equipo mirando también el criterio práctico.',
      p:['Traiga el problem statement y la causa raíz validada.',
         'Liste las soluciones potenciales y, para cada una, el método práctico con el que se implementaría.',
         'Califique de 1 a 5 esfuerzo (5 = menor esfuerzo), beneficio, factibilidad y costo-beneficio.',
         'Revise el puntaje total y marque con SÍ la solución seleccionada.'] },
    'mejorar.plan_accion': {
      q:'Convierte la solución elegida en acciones con responsable, fechas y estado. Es la herramienta de seguimiento de la fase y la que después define qué mejora pasa a control.',
      p:['Registre la causa raíz y las acciones de mejora que la atacan.',
         'Asigne responsable, fecha de inicio, fecha de revisión de avances y fecha límite.',
         'Actualice el estatus (no realizada, retrasada, en curso, realizada) y describa la situación.',
         'Escriba los resultados obtenidos y marque con SÍ la mejora significativa que se controlará en la siguiente fase.'] },
    'mejorar.quick_improvement': {
      q:'Reporte de mejoras rápidas, de sentido común y bajo riesgo, que no necesitan análisis estadístico. Documenta el antes, la acción y el después, con foto o bosquejo. Sirve para mostrar resultados temprano y ganar credibilidad.',
      p:['Escriba departamento, proceso y fecha.',
         'Describa cómo estaba antes y suba la foto del antes.',
         'Describa las acciones implementadas.',
         'Describa el resultado y suba la foto del después.'] },
    'mejorar.descripcion_solucion': {
      q:'Cierra la fase declarando la mejora implementada: qué problema, qué causa raíz, qué se hizo y qué resultó. Es el resumen que permite pasar a CONTROLAR.',
      p:['Traiga problema y causa raíz.',
         'Escriba la mejora implementada, seleccionada como solución.',
         'Liste las acciones realizadas para implementarla.',
         'Registre los resultados medidos con el mismo métrico de la línea base.'] },
    'mejorar.a3_mejorar': {
      q:'Resume la fase MEJORAR en una hoja: lista de mejoras, plan de acción, tabla de antes y después y la mejora que pasa a control.',
      p:['Incruste la lista de mejoras y la afinidad de soluciones.',
         'Incruste el plan de acción con su estado.',
         'Agregue la comparación antes/después con datos o gráficos.',
         'Señale la mejora significativa que se va a controlar.'] },

    /* -------------------------------------------------------- CONTROLAR */
    'controlar.estandar_1': {
      q:'Estándar de trabajo por pasos e instrucciones. Documenta la forma nueva y única de hacer la actividad, para que cualquier persona obtenga el mismo resultado. Sin estándar, la mejora dura lo que dure el interés.',
      p:['Escriba proceso, número de documento, quién elaboró, quién revisó y quién liberó.',
         'Registre los requerimientos de seguridad y los demás requerimientos.',
         'Liste los pasos del proceso en orden.',
         'Escriba la instrucción concreta de cada paso, en lenguaje del puesto de trabajo.'] },
    'controlar.estandar_2': {
      q:'Estándar de trabajo en tabla con ayuda visual: actividad, estándar, herramientas, responsable, tiempo y requerimientos de seguridad, acompañados de foto o esquema. Es el formato más fácil de usar para entrenar.',
      p:['Escriba proceso, código, quién lo realizó y fecha.',
         'Registre cada actividad en orden y su estándar con valores concretos (25 PSI, 200-210 °C).',
         'Indique herramientas, responsable, tiempo y requerimientos de seguridad.',
         'Suba la ayuda visual: foto, diagrama o bosquejo de cómo se ve bien hecho.'] },
    'controlar.estandar_3': {
      q:'Estándar de operación con ayuda visual, procedimiento y control de cambios. Se usa cuando la operación depende de una máquina o equipo específico y requiere trazabilidad de versiones.',
      p:['Registre proceso, área, máquina o equipo, clase, frecuencia y responsable.',
         'Complete ayuda visual, herramientas y requerimientos de seguridad.',
         'Describa el procedimiento paso a paso.',
         'Use el control de cambios para registrar cada revisión con su fecha.'] },
    'controlar.plan_de_control': {
      q:'Es el documento que sostiene la mejora en el tiempo: por cada paso crítico define la característica, su especificación, cómo se mide, cómo se controla, con qué tamaño y frecuencia de muestreo, en qué registro queda y qué hacer cuando se sale de control.',
      p:['Encabece con proceso, producto, número de documento, fecha, quién elaboró y quién autorizó.',
         'Liste los pasos y la característica a controlar, indicando si es variable de entrada o de salida, con sus especificaciones.',
         'Defina técnica de medición, método de control, tamaño y frecuencia de muestreo y el documento donde se registra.',
         'Escriba las acciones correctivas (plan de reacción) y el responsable; sin esta columna el plan no sirve.'] },
    'controlar.grafico_antes_despues': {
      q:'Compara el métrico del problema antes y después del proyecto, en el mismo gráfico y con la misma unidad. Es la evidencia que entiende cualquier persona, del operario a la gerencia.',
      p:['Escriba el criterio representado (% de costos por defectos, minutos, casos).',
         'Cargue el periodo y el valor del antes.',
         'Cargue el valor del después para los mismos periodos.',
         'Verifique que la mejora se sostiene en varios periodos, no en uno solo.'] },
    'controlar.a3_controlar': {
      q:'Resume la fase CONTROLAR en una hoja: gráfico de control del proceso, estandarización del nuevo método, plan de control y beneficios obtenidos.',
      p:['Incruste el gráfico de control y describa cómo quedó el proceso.',
         'Incruste el estándar nuevo implementado.',
         'Incruste el plan de control con el que se sostiene.',
         'Cierre con los beneficios: ahorros calculados y gráfico de antes y después.'] },
    'controlar.charter_cierre': {
      q:'El Project Charter de cierre: el mismo acta, ahora con los resultados reales. Registra beneficios obtenidos, ahorros logrados y los métricos clave alcanzados frente a la línea base, con firmas de cierre.',
      p:['Traiga el acta inicial y actualice beneficios y ahorros con las cifras reales.',
         'Desglose los beneficios por categoría en hard y soft benefit.',
         'Complete los métricos clave de cierre: si mejoró, base line, logrado e ideal.',
         'Consiga firma y fecha de champion, dueño del proceso, finanzas, mentor y facilitador.'] },
    'controlar.a3_final': {
      q:'El A3 del proyecto completo: las cinco fases en una sola hoja. Es el entregable de presentación final, el que se lleva a la gerencia, a la ARL y a la empresa atendida.',
      p:['Verifique que los A3 de cada fase estén completos.',
         'Revise que el métrico clave sea el mismo desde DEFINIR hasta CONTROLAR.',
         'Agregue lecciones aprendidas y reconocimiento del equipo.',
         'Exporte a Excel o PDF para la presentación de cierre.'] }
  };

  /** Respaldo por palabras clave: cubre las herramientas del manual que se
   *  agregan como `extra` (MSA, capacidad, hipótesis, gráficos de control…). */
  const DOC_CLAVE = [
    { re:/GR ?& ?R|MSA|SISTEMA DE MEDICI/i, q:'Evalúa si el sistema de medición es confiable antes de creerle a los datos. Separa la variación del instrumento (repetibilidad) de la variación entre operarios (reproducibilidad) y las compara con la variación entre partes y con la tolerancia.',
      p:['Seleccione la característica a medir y verifique la calibración del instrumento.',
         'Tome de 10 partes (variables) o 30 unidades (atributos) que cubran el rango real de variación.',
         'Haga que 3 operarios midan todas las partes en orden aleatorio, y repita 3 veces.',
         'Lea el %Contribución, el %Tolerancia y el número de categorías distintivas (ndc ≥ 5) o el valor kappa (≥ 0,7) para aceptar el sistema.'] },
    { re:/CAPACIDAD|CP\b|CPK|PPK|NORMALIDAD/i, q:'Mide qué tan capaz es el proceso de cumplir las especificaciones. Cp y Pp dicen lo que el proceso podría dar si estuviera centrado; Cpk y Ppk dicen lo que está dando de verdad. Es el cálculo con el que se fija y se verifica la línea base.',
      p:['Verifique primero que el sistema de medición sea aceptable.',
         'Revise la normalidad de los datos (valor p ≥ 0,05 para asumir distribución normal).',
         'Cargue los límites de especificación y el objetivo del cliente.',
         'Lea Cp/Cpk (corto plazo) y Pp/Ppk (largo plazo), el PPM esperado y el nivel Z equivalente.'] },
    { re:/HIPOTESIS|HIPÓTESIS|ANOVA|T-TEST|KRUSKAL|MOOD|LEVENE|CHI|PROPORCION/i,
      q:'Prueba estadística para saber si una diferencia observada es real o es ruido. Se plantea la hipótesis nula (son iguales) contra la alternativa (son diferentes) y se decide con el valor p.',
      p:['Defina qué compara: promedios, medianas, desviaciones o proporciones.',
         'Verifique si los datos son normales; si no lo son, use las pruebas no paramétricas.',
         'Cargue las muestras y fije el nivel de confianza (95 % por defecto).',
         'Decida: si el valor p es menor que 0,05 hay diferencia significativa; si es mayor o igual, no hay evidencia para afirmarla.'] },
    { re:/CORRELACI|REGRESI|DISPERSI/i, q:'Analiza si dos variables se mueven juntas y en qué medida. La correlación de Pearson (r) mide la fuerza de la relación lineal; la regresión entrega la ecuación para predecir la salida al cambiar la entrada.',
      p:['Cargue las parejas de datos: variable X (la que usted puede cambiar) y variable Y (la que responde).',
         'Revise el diagrama de dispersión: la nube dice más que el coeficiente.',
         'Lea r y el valor p: correlación fuerte pero con p alto no es concluyente.',
         'Use R² y la ecuación para estimar cuánto se mueve Y cuando cambia X; correlación no es causalidad.'] },
    { re:/CONTROL|I-MR|XBAR|X̄|P CHART|NP|U CHART|C CHART/i,
      q:'Gráfico de control: vigila el proceso en el tiempo contra sus propios límites de control, calculados con los datos. Distingue la variación natural (causas comunes) de la anormal (causas especiales) y avisa cuándo intervenir.',
      p:['Escoja el gráfico según el dato: I-MR para datos individuales, X̄-R para subgrupos de 2 a 9, X̄-S para subgrupos grandes, P/NP para proporciones y C/U para conteos.',
         'Recolecte los datos con la frecuencia definida en el plan de control.',
         'Deje que la app calcule la línea central y los límites de control (no los ponga a mano).',
         'Investigue todo punto fuera de límites o patrón anormal y registre la acción en el plan de reacción.'] },
    { re:/POKA|ERROR PROOF|A PRUEBA DE ERROR/i, q:'Dispositivos a prueba de errores. Nivel I: evita que el error ocurra. Nivel II: detiene el proceso cuando ocurre. Nivel III: avisa. Se caracterizan por ser baratos, simples, prácticos y efectivos.',
      p:['Identifique el error humano concreto que quiere impedir.',
         'Busque primero el nivel I (que el error sea imposible), no la advertencia.',
         'Diseñe con quien hace la operación; si estorba, se desactiva y no sirve.',
         'Verifique con una prueba piloto y déjelo escrito en el estándar y en el plan de control.'] },
    { re:/HISTOGRAMA|CAJA|BOXPLOT|RESUMEN GR/i, q:'Herramienta gráfica para ver la distribución de los datos: dónde se concentran, cuánto se dispersan y si hay valores extremos. Es el paso previo obligado antes de calcular capacidad o aplicar pruebas.',
      p:['Cargue la serie de datos medidos.',
         'Observe forma, centro y dispersión; compare contra los límites de especificación.',
         'Identifique valores atípicos e investíguelos antes de eliminarlos.',
         'Use el resumen gráfico para leer media, mediana, desviación, cuartiles y prueba de normalidad de una sola vez.'] }
  ];

  /** Documentación de una herramienta: por id, por palabra clave o su `desc` */
  function docDe(t){
    if (DOC[t.id]) return DOC[t.id];
    const tit = String(t.title || '') + ' ' + String(t.desc || '');
    for (let i = 0; i < DOC_CLAVE.length; i++)
      if (DOC_CLAVE[i].re.test(tit)) return { q: DOC_CLAVE[i].q, p: DOC_CLAVE[i].p };
    return { q: t.desc || 'Formato del manual disponible en esta fase.', p: [] };
  }

  /* ======================================================================
     5 · CONFIGURACIÓN DE LOS CAPÍTULOS DE FASE
     ==================================================================== */
  const FASE_CFG = {
    DEFINIR: {
      cap:'guia.fase_definir',
      lema:'Entender el problema y justificar su solución.',
      busca:'DEFINIR es la fase donde se convierte una molestia en un proyecto. Se delimita el problema con datos, ' +
            'se traduce a un métrico, se fija la línea base, se calcula cuánto vale resolverlo y se consigue la firma ' +
            'que autoriza el trabajo. Un problema bien definido es cerca de la mitad de la solución; uno mal definido ' +
            'garantiza cinco meses perdidos.',
      orden:['definir.matriz_priorizacion','definir.clarificacion_problema','definir.arbol_ctq','definir.series_tiempo',
             'definir.pareto','definir.objetivo_smart','definir.sipoc','definir.beneficios','definir.tabla_identificacion',
             'definir.project_members','definir.recursos','definir.gantt','definir.plan_comunicacion',
             'definir.project_charter','definir.a3_definir'],
      cadena:[
        ['Proyecto seleccionado','Matriz de priorización','Clarificación del problema y Project Charter'],
        ['Enunciado del problema (5W 2H)','Clarificación del problema','Objetivo SMART, Charter, A3 y selección de soluciones (MEJORAR)'],
        ['CTQ y métrico del problema','Árbol CTQ','Serie de tiempo, tabla de identificación y métricos de desempeño (MEDIR)'],
        ['Línea base del métrico','Serie de tiempo y Pareto','Objetivo SMART, beneficios, A3 y gráfico antes/después (CONTROLAR)'],
        ['Pocas vitales (80 %)','Pareto','Brainstorming e Ishikawa (ANALIZAR)'],
        ['Fronteras del proceso','SIPOC','Swim line y mapa detallado (MEDIR)'],
        ['Ahorro estimado','Beneficios','Project Charter y Charter de cierre (CONTROLAR)'],
        ['Equipo y roles','Project Members','Charter, plan de comunicación y A3'],
        ['Fechas por fase','Gantt','Cronograma general del Charter y seguimiento del proyecto']
      ],
      errores:[
        'Redactar el problema como si fuera la solución: "falta personal" no es un problema, es una hipótesis de causa.',
        'Un problema sin métrico ni unidad: si no se puede contar, no se puede mejorar ni demostrar.',
        'Alcance de toda la planta o de toda la empresa. Un proyecto DMAIC se hace en una línea, un producto, un turno o un servicio.',
        'Fijar la línea base con un solo mes de datos o con el mes más malo del año.',
        'Objetivo sin cifra y sin fecha, del estilo "mejorar la calidad".',
        'Equipo sin dueño del proceso: nadie sostiene la mejora cuando termina el proyecto.',
        'Charter sin firma del champion: sin firma no hay recursos ni tiempo autorizado.'
      ],
      salida:[
        'El problema está en una sola frase, con cifra, periodo y consecuencia.',
        'Hay un métrico y un CTQ definidos, con unidad de medida.',
        'La línea base está calculada con datos reales y suficientes periodos.',
        'El objetivo es SMART: de cuánto a cuánto y para cuándo.',
        'El alcance declara qué entra y qué no entra.',
        'El equipo está nombrado, con champion y dueño del proceso.',
        'El Project Charter está firmado.'
      ]
    },

    MEDIR: {
      cap:'guia.fase_medir',
      lema:'Entender el estado actual del proceso con métricos.',
      busca:'MEDIR describe el proceso como es de verdad (no como dice el procedimiento), asegura que los datos sean ' +
            'confiables y fija con números el desempeño actual. Aquí se responde: ¿de qué tamaño es realmente el ' +
            'problema y qué tan capaz es el proceso? Si no puedes medir algo, no lo puedes entender; si no lo entiendes, ' +
            'no lo puedes controlar ni mejorar.',
      orden:['medir.swin_line','medir.process_mapping_detailed','medir.metricos_desempeno',
             'medir.plan_muestreo_cualitativo','medir.tamano_muestra_cualitativos',
             'medir.plan_muestreo_cuantitativo','medir.tamano_muestra_cuantitativo',
             'medir.hojas_verificacion','medir.plan_recoleccion','medir.yield','medir.rty_fpy',
             'medir.grafico_serie_tiempo','medir.valor_add','medir.ppm','medir.dpmo','medir.dpu','medir.a3_medir'],
      cadena:[
        ['Proceso mapeado con X y Y','Swim line y mapa detallado','Ishikawa y plan de verificación (ANALIZAR)'],
        ['Métricos de desempeño','Métricos de desempeño','Todas las hojas de medición y el A3 Medir'],
        ['Tamaño de muestra','Plan y tamaño de muestra','Plan de recolección y hojas de verificación'],
        ['Sistema de medición aceptado','Estudio GR&R','Autoriza usar los datos para la línea base'],
        ['Datos de campo','Hojas de verificación','YIELD, PPM, DPMO, DPU, capacidad y gráficos'],
        ['DPMO y nivel sigma','DPMO / PPM / DPU','Línea base del proyecto y tablero BI'],
        ['Brecha RTY vs FPY','RTY-FPY','Identificación de retrabajo (fábrica oculta) para MEJORAR'],
        ['% de valor agregado','% Value Add Time','Ideas de eliminación de desperdicios en MEJORAR'],
        ['Capacidad y línea base','Capacidad del proceso','Gráfico antes/después y Charter de cierre (CONTROLAR)']
      ],
      errores:[
        'Medir antes de validar el sistema de medición: si el instrumento o el criterio varían, los datos mienten.',
        'Muestrear por conveniencia (lo que estaba a la mano) en vez de seguir el plan de muestreo.',
        'Mezclar datos de corto y largo plazo en el mismo análisis y comparar peras con manzanas.',
        'Cambiar la definición operacional a mitad de la recolección: lo que ayer era defecto hoy no lo es.',
        'Dejar la hoja de verificación en manos de quien no fue entrenado para llenarla.',
        'Eliminar los datos atípicos porque "dañan la gráfica" en vez de investigarlos.',
        'Declarar la línea base con menos datos de los que exigió el cálculo de tamaño de muestra.'
      ],
      salida:[
        'El proceso está mapeado con sus entradas, salidas, tiempos y demoras.',
        'El sistema de medición fue evaluado y es aceptable.',
        'Los datos se recolectaron con el plan y el tamaño de muestra calculado.',
        'El desempeño actual está cuantificado: yield, DPMO o PPM, nivel sigma y capacidad.',
        'La línea base del métrico del problema quedó establecida y documentada.',
        'El A3 Medir está diligenciado y presentado al champion.'
      ]
    },

    ANALIZAR: {
      cap:'guia.fase_analizar',
      lema:'Encontrar la causa raíz y cuantificar su efecto.',
      busca:'ANALIZAR busca la causa raíz: no el síntoma ni la causa física inmediata, sino la causa sistémica que ' +
            'permite que el problema vuelva a aparecer. Se generan causas posibles, se organizan, se priorizan y ' +
            'se validan con evidencia o con estadística. La fase termina cuando se puede decir, con datos, qué origina ' +
            'el problema y cuánto de él explica.',
      orden:['analizar.brainstorming','analizar.diagramas_ishikawa','analizar.5_whys','analizar.tree_diagram',
             'analizar.validacion_de_causas','analizar.descripcion_causa_raiz','analizar.a3_analizar'],
      cadena:[
        ['Ideas del equipo','Brainstorming / afinidad','Diagrama Ishikawa'],
        ['Causas potenciales por categoría','Ishikawa (6M / 4P)','5 por qué y árbol de porqués'],
        ['Causas raíz candidatas','5 por qué / árbol','Plan de verificación de causas'],
        ['Evidencia de campo y pruebas','Plan de verificación, hipótesis, correlación','Descripción de la causa raíz'],
        ['Causa raíz validada','Descripción de la causa raíz','Brainstorming y selección de soluciones (MEJORAR)'],
        ['Relación X → Y cuantificada','Correlación y regresión','Diseño de la solución y del plan de control']
      ],
      errores:[
        'Saltar a la solución antes de validar la causa. Es el error más común y el más caro.',
        'Confundir síntoma con causa: "hay defectos" es el síntoma; "no existe plan de mantenimiento" es la causa sistémica.',
        'Validar por votación o por antigüedad del que opina, en vez de por evidencia.',
        'No ir al sitio (gemba): la causa raíz rara vez se encuentra desde el escritorio.',
        'Leer mal el valor p: p ≥ 0,05 no prueba que sean iguales, sólo que no hay evidencia suficiente para afirmar que son diferentes.',
        'Quedarse con una causa raíz que el equipo no puede intervenir; si no es accionable, siga preguntando por qué.'
      ],
      salida:[
        'Las causas potenciales fueron levantadas en equipo y organizadas.',
        'Cada causa potencial tiene una acción de verificación con responsable y fecha.',
        'La causa raíz está validada con evidencia de campo, datos o prueba estadística.',
        'Se puede cuantificar cuánto del problema explica esa causa.',
        'La causa raíz es accionable por el equipo y quedó escrita en la descripción de causa raíz y en el A3.'
      ]
    },

    MEJORAR: {
      cap:'guia.fase_mejorar',
      lema:'Desarrollar, probar e implementar la solución.',
      busca:'MEJORAR genera soluciones para la causa raíz, las evalúa con criterios comparables, las prueba en piloto ' +
            'y las implementa con responsables y fechas. Termina midiendo de nuevo, con el mismo métrico de la línea ' +
            'base, para demostrar que la mejora fue real y no una impresión.',
      orden:['mejorar.brainstorming','mejorar.seleccion_soluciones','mejorar.plan_accion','mejorar.quick_improvement',
             'mejorar.descripcion_solucion','mejorar.a3_mejorar'],
      cadena:[
        ['Causa raíz validada','ANALIZAR','Brainstorming de soluciones'],
        ['Soluciones candidatas','Brainstorming de soluciones','Tabla de selección de soluciones'],
        ['Solución seleccionada','Selección de soluciones','Plan de acción de mejora'],
        ['Acciones con responsable y fecha','Plan de acción','Ejecución, piloto y seguimiento'],
        ['Resultado medido del piloto','Capacidad, gráficos y pruebas de MEDIR','Descripción de la solución'],
        ['Mejora significativa marcada','Plan de acción / descripción de la solución','Gráficos de control, estándar y plan de control (CONTROLAR)']
      ],
      errores:[
        'Implementar soluciones que no atacan la causa raíz validada: gasto disfrazado de mejora.',
        'Saltarse la prueba piloto y desplegar a toda la operación de una vez.',
        'Acciones sin responsable ni fecha límite: quedan en el acta y nunca ocurren.',
        'Medir el "después" con otro métrico o en otra unidad, con lo que la comparación no prueba nada.',
        'Elegir la solución más vistosa en lugar de la mejor calificada en esfuerzo, beneficio y factibilidad.',
        'Implementar sin avisar ni entrenar a quien opera: la mejora se revierte sola en dos semanas.',
        'No dejar registro del antes: sin antes no hay después que mostrar.'
      ],
      salida:[
        'La solución seleccionada ataca la causa raíz y quedó justificada con la tabla de selección.',
        'El plan de acción está ejecutado, con estatus real y resultados escritos.',
        'La mejora fue medida con el mismo métrico y muestra un cambio demostrable.',
        'La mejora significativa a controlar está marcada.',
        'El personal que opera fue informado y entrenado en el cambio.',
        'El A3 Mejorar está diligenciado con el antes y el después.'
      ]
    },

    CONTROLAR: {
      cap:'guia.fase_controlar',
      lema:'Sostener la solución y cerrar formalmente el proyecto.',
      busca:'CONTROLAR asegura que la mejora no se devuelva. Se vigila el proceso con gráficos de control, se ' +
            'estandariza el nuevo método, se documenta el plan de control con su plan de reacción, se validan los ' +
            'beneficios con finanzas y se entrega el proceso a su dueño. Un proyecto no termina cuando mejora: ' +
            'termina cuando la mejora se sostiene sin el Green Belt.',
      orden:['controlar.estandar_1','controlar.estandar_2','controlar.estandar_3','controlar.plan_de_control',
             'controlar.grafico_antes_despues','controlar.a3_controlar','controlar.charter_cierre','controlar.a3_final'],
      cadena:[
        ['Mejora significativa','MEJORAR','Gráfico de control y plan de control'],
        ['Comportamiento del proceso en el tiempo','Gráficos de control','Ajustes y plan de reacción'],
        ['Método nuevo documentado','Estándares de trabajo','Entrenamiento y plan de control'],
        ['Características a controlar','Plan de control','Rutinas del dueño del proceso'],
        ['Línea base vs resultado','Gráfico antes y después','A3 Controlar y Charter de cierre'],
        ['Beneficios validados','Charter de cierre','Presentación final a la ARL y a la empresa']
      ],
      errores:[
        'Controlar sin estandarizar: se vigila un método que cada quien ejecuta distinto.',
        'Plan de control sin plan de reacción: se detecta la anomalía y nadie sabe qué hacer.',
        'Poner los límites de control a mano o confundirlos con los límites de especificación: el control lo define el proceso, la especificación la define el cliente.',
        'Ajustar el proceso ante variación natural (causa común). Ese sobreajuste aumenta la variación.',
        'No entregar formalmente el proceso al dueño del proceso.',
        'Cerrar el proyecto sin validar los ahorros con el área financiera.',
        'No dejar quién y con qué frecuencia revisa el gráfico de control después del cierre.'
      ],
      salida:[
        'El proceso está estable y en control estadístico, verificado con datos posteriores a la mejora.',
        'El estándar de trabajo está publicado y el personal fue entrenado en él.',
        'El plan de control está aprobado, con responsable, frecuencia y acciones correctivas.',
        'El gráfico de antes y después muestra la mejora sostenida en varios periodos.',
        'Los beneficios y ahorros fueron validados con finanzas.',
        'El Project Charter de cierre está firmado y el A3 final está listo para la presentación.'
      ]
    }
  };

  /* ======================================================================
     6 · CONSTRUCTOR GENÉRICO DE UN CAPÍTULO DE FASE
     ==================================================================== */
  /** Herramientas de la fase, en el orden pedagógico; las que se agreguen
   *  después (herramientas `extra` del manual) se anexan al final. */
  function toolsFase(mod){
    const todas = (typeof toolsOf === 'function' ? toolsOf(mod) : []) || [];
    const cfg = FASE_CFG[mod], ord = (cfg && cfg.orden) || [];
    const porId = {}; todas.forEach(t => { porId[t.id] = t; });
    const base = [], usados = {};
    ord.forEach(id => { if (porId[id]){ base.push(porId[id]); usados[id] = 1; } });
    const extras = todas.filter(t => !usados[t.id]);
    return { base: base, extras: extras, todas: base.concat(extras) };
  }

  /** Ficha de una herramienta dentro del capítulo de fase */
  function ficha(t, n){
    const doc = docDe(t);
    return '<div class="card" style="margin:0">' +
      '<div class="card-h"><span class="pill">' + esc(String(n)) + '</span>' +
      '<h3 style="flex:1;min-width:0">' + esc(t.title) + '</h3>' +
      (t.extra ? PILL('del manual', 'warn') : '') + '</div>' +
      '<div class="card-b">' +
        P(doc.q) +
        (doc.p && doc.p.length ? '<div style="' + S_H + '">Paso a paso</div>' + OL(doc.p) : '') +
        BTN(t.id, 'Abrir el formato') +
      '</div></div>';
  }

  /** Todos los bloques de un capítulo de fase */
  function bloquesFase(mod){
    const cfg = FASE_CFG[mod];
    const m = MOD_BY_ID[mod];
    return [
      /* ---- portada de la fase ---- */
      { type:'html', render: () => {
        const T = toolsFase(mod);
        return '<div class="card" style="border-left:4px solid ' + esc(m.color) + '">' +
          '<div class="card-b">' +
            '<div style="display:flex;gap:14px;align-items:center;flex-wrap:wrap;margin-bottom:12px">' +
              '<div style="width:46px;height:46px;border-radius:12px;display:flex;align-items:center;' +
                'justify-content:center;font-weight:800;font-size:22px;color:#fff;background:' + esc(m.color) + '">' +
                esc(m.letter) + '</div>' +
              '<div style="flex:1;min-width:200px">' +
                '<div style="font-size:19px;font-weight:800;color:var(--tx)">' + esc(m.name) + ' · ' + esc(m.en) + '</div>' +
                '<div style="font-size:12.5px;color:var(--tx3)">Fase ' + esc(String(m.n)) + ' de 5 · ' +
                  esc(String(T.todas.length)) + ' herramientas en la app</div>' +
              '</div>' +
              BMOD(mod, 'Ir a la fase ' + m.name) +
            '</div>' +
            Q(cfg.lema) + P(cfg.busca) +
          '</div></div>';
      } },

      /* ---- orden de llenado ---- */
      { type:'html', title:'En qué orden se llenan las herramientas', render: () => {
        const T = toolsFase(mod);
        const pasos = T.todas.map(t =>
          '<div style="display:flex;gap:10px;align-items:center;padding:7px 0;border-bottom:1px solid var(--bd)">' +
          '<span class="pill">' + esc(String(T.todas.indexOf(t) + 1)) + '</span>' +
          '<span style="flex:1;min-width:0;font-size:13px;color:var(--tx)">' + esc(t.title) + '</span>' +
          BTN(t.id, 'Abrir') + '</div>');
        return PR('El orden no es un capricho: cada formato usa lo que produjo el anterior. ' +
                  'Puede saltarse alguno si su proyecto no lo requiere, pero ' + B('no invierta el orden') +
                  ' de los primeros: el resto se queda sin insumo.') +
               J(pasos);
      } },

      /* ---- qué entrega cada herramienta ---- */
      { type:'html', title:'Qué entrega cada herramienta y cómo se diligencia', render: () => {
        const T = toolsFase(mod);
        return G2(J(T.base.map((t, i) => ficha(t, i + 1))));
      } },

      /* ---- herramientas de apoyo (extras del manual) ---- */
      { type:'html', render: () => {
        const T = toolsFase(mod);
        if (!T.extras.length) return '';
        return CARD('Herramientas del manual disponibles en esta fase',
          P('Estas herramientas están explicadas en el manual pero no tenían formato en los libros de Excel. ' +
            'Viven dentro de la app y alimentan el tablero y el libro consolidado.') +
          G2(J(T.extras.map((t, i) => ficha(t, T.base.length + i + 1)))));
      } },

      /* ---- encadenamiento ---- */
      { type:'html', title:'Cómo se encadena esta fase con las demás', render: () =>
        PR('Cada dato tiene un origen y un destino. Si un renglón de esta tabla queda vacío, la fase siguiente ' +
           'se queda sin insumo y toca devolverse.') +
        TBL(['Dato o entregable', 'Sale de', 'Alimenta a'], cfg.cadena)
      },

      /* ---- errores típicos ---- */
      { type:'html', title:'Errores típicos en esta fase', render: () => UL(cfg.errores) },

      /* ---- criterio de salida ---- */
      { type:'html', render: () => {
        const sig = { DEFINIR:'MEDIR', MEDIR:'ANALIZAR', ANALIZAR:'MEJORAR', MEJORAR:'CONTROLAR', CONTROLAR:'el cierre del proyecto' }[mod];
        return NOTE('warn',
          '<b>Criterio de salida — no pase a ' + esc(sig) + ' hasta que:</b>' + UL(cfg.salida));
      } },

      BLOQUE_NAV(cfg.cap)
    ];
  }

  /* ======================================================================
     CAPÍTULO 1 · CÓMO USAR ESTA APLICACIÓN
     ==================================================================== */
  const C_INICIO = {
    id:'guia.inicio', mod:'GUIA', sheet:'MANUAL · 1/12', extra:true,
    title:'Cómo usar esta aplicación',
    desc:'Qué es, qué entrega, cómo se navega, cómo se guarda y cómo se exporta a Excel.',
    guide:['Los capítulos de la guía son de sólo lectura: no piden datos.',
           'Los botones azules de cada capítulo abren directamente el formato correspondiente.',
           'La app guarda sola en este equipo: exporte el .json periódicamente como respaldo.'],
    blocks:[
      { type:'html', render: () =>
        CARD('Qué es esta aplicación',
          P('Esta es la herramienta Lean Six Sigma de REHAVID para desarrollar proyectos de mejora con la metodología ' +
            'DMAIC. Reúne en un solo archivo los 53 formatos de los cinco libros de Excel de la metodología, el manual ' +
            'completo recreado como esta guía, las herramientas estadísticas que el manual explica pero que no tenían ' +
            'formato, un tablero de indicadores y la exportación a Excel.') +
          PR('Funciona ' + B('sin internet, sin servidor y sin instalación') + '. Se abre con doble clic. ' +
             'Todo lo que usted escriba queda en este computador: no viaja a ningún lado.') +
          KPIS([
            { label:'Formatos del Excel', value:'53', hint:'Los 5 libros originales, celda por celda' },
            { label:'Fases DMAIC', value:'5', hint:'Definir · Medir · Analizar · Mejorar · Controlar' },
            { label:'Capítulos de guía', value:String(CAPS.length), hint:'El manual, recreado y enlazado' },
            { label:'Conexión requerida', value:'Ninguna', hint:'100 % local y offline', tone:'ok' }
          ]))
      },

      { type:'html', title:'Qué entrega al final', render: () =>
        G2(
          MINI('Durante el proyecto',
            UL(['Los 53 formatos diligenciados, con cálculos automáticos y gráficos.',
                'Interpretación automática en cada formato: la app calcula y sugiere la decisión.',
                'Tablero BI con el avance y los indicadores del proyecto.',
                'Diagramas interactivos: SIPOC, Ishikawa, 5 por qué, árbol, afinidad, flujo, swim lane.'])) +
          MINI('Al cerrar el proyecto',
            UL(['Los cinco libros de Excel originales diligenciados, idénticos a la plantilla.',
                'Un libro consolidado .xlsm con portada, índice, tablero y macros.',
                'Los A3 de cada fase y el A3 final para la presentación.',
                'Respaldo .json del proyecto completo y exportación .csv para análisis externo.']))
        )
      },

      { type:'html', title:'Cómo se navega', render: () =>
        P('La barra de la izquierda tiene todo. Arriba el avance del proyecto; abajo, la guía y las cinco fases. ' +
          'Al abrir una fase se despliegan sus herramientas en el orden en que se diligencian.') +
        TBL(['Elemento','Para qué sirve'], [
          [{ h: B('📖 Cómo se usa') }, 'Este manual. Doce capítulos de sólo lectura con enlaces a cada formato.'],
          [{ h: B('D · M · A · I · C') }, 'Las cinco fases. El interruptor de cada fase la activa o la apaga para el proyecto actual.'],
          [{ h: B('Círculo al lado de cada herramienta') }, 'Indica si ese formato ya tiene información diligenciada.'],
          [{ h: B('📊 Tablero BI') }, 'Indicadores del proyecto: avance por fase, nivel sigma, brechas y alertas.'],
          [{ h: B('⤓ Exportar') }, 'Genera los Excel, el libro consolidado con macros, el .json y el .csv.'],
          [{ h: B('🗂️ Proyectos') }, 'Cambiar de empresa o de proyecto, duplicar uno existente o crear uno nuevo.'],
          [{ h: B('⚙ Ajustes') }, 'Logos, colores, nombre de la ARL y de la empresa, módulos activos, tema claro u oscuro.'],
          [{ h: B('◐') }, 'Alterna entre tema oscuro y tema claro.']
        ]) +
        '<div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:6px">' +
          BVIEW('bi', '📊 Abrir el tablero BI') + BVIEW('exportar', '⤓ Abrir exportación') +
          BVIEW('proyectos', '🗂️ Abrir proyectos') + BVIEW('ajustes', '⚙ Abrir ajustes') +
        '</div>'
      },

      { type:'html', title:'Las cinco fases del proyecto', render: () => {
        const filas = FASES.map(m => {
          const ts = (typeof toolsOf === 'function' ? toolsOf(m.id) : []) || [];
          const cfg = FASE_CFG[m.id] || {};
          return [
            { h:'<span style="display:inline-block;width:24px;height:24px;border-radius:7px;color:#fff;' +
                 'text-align:center;line-height:24px;font-weight:800;background:' + esc(m.color) + '">' +
                 esc(m.letter) + '</span>' },
            { h: B(m.name) + '<div style="font-size:11px;color:var(--tx3)">' + esc(m.en) + '</div>' },
            { h: esc(String(ts.length)) },
            esc(cfg.lema || m.desc),
            { h: BMOD(m.id, 'Ir a ' + m.name) + ' ' +
                 (cfg.cap ? '<button class="btn sm g" data-goto="' + esc(cfg.cap) + '">Guía de la fase</button>' : '') }
          ];
        });
        return P('Cada fase responde una pregunta distinta. Este es el recorrido completo y el enlace a la guía de cada una.') +
          TBL(['', 'Fase', 'Herramientas', 'Qué se busca', 'Ir'], filas, [2]);
      } },

      { type:'html', title:'Proyecto completo o sólo algunas fases', render: () =>
        P('No toda intervención necesita las cinco fases. En Ajustes puede apagar las que no aplican para el ' +
          'proyecto actual: desaparecen del menú, del tablero, del avance y de la exportación.') +
        G3(
          MINI('Diagnóstico rápido', P('DEFINIR + MEDIR. Cuando la empresa necesita saber de qué tamaño es el problema antes de decidir.')) +
          MINI('Investigación de un evento', P('DEFINIR + ANALIZAR. Cuando lo que se busca es la causa raíz de un hecho puntual.')) +
          MINI('Intervención completa', P('Las cinco fases. Es el proyecto Lean Six Sigma completo, hasta el cierre firmado.'))
        )
      },

      { type:'html', title:'Proyectos por empresa y autoguardado', render: () =>
        G2(
          MINI('Un proyecto por empresa atendida',
            P('Cada empresa se maneja como un proyecto independiente, con sus propios datos, su logo y su avance. ' +
              'Puede crear proyectos nuevos, duplicar uno anterior para reutilizar la estructura y cambiar entre ellos ' +
              'sin perder nada.') +
            BVIEW('proyectos', '🗂️ Abrir proyectos')) +
          MINI('Se guarda solo',
            P('Cada cambio se guarda automáticamente en este computador. La etiqueta "guardado" de la barra superior ' +
              'confirma la escritura. Si aparece "error al guardar" significa que el almacenamiento del navegador ' +
              'está lleno: exporte el .json de inmediato.') +
            NOTE('warn', esc('Como los datos viven en este navegador, borrar los datos de navegación los elimina. ' +
                             'Exporte el respaldo .json al terminar cada jornada.')))
        )
      },

      { type:'html', title:'Logos: Rehavid, ARL y empresa', render: () =>
        P('La app maneja tres logotipos: el de Rehavid, el de la ARL contratante y el de la empresa atendida. ' +
          'Se cargan una sola vez en Ajustes y aparecen en la barra superior, en la portada del libro consolidado ' +
          'y estampados en los Excel exportados, donde reemplazan el logotipo original de la herramienta.') +
        UL(['Use imágenes PNG con fondo transparente para mejor resultado.',
            'La app reduce el tamaño de la imagen automáticamente para no llenar el almacenamiento.',
            'Escriba también el nombre de la ARL y de la empresa: se imprimen en los encabezados.']) +
        BVIEW('ajustes', '⚙ Cargar logos en Ajustes')
      },

      { type:'html', title:'Exportación a Excel, macros y respaldo', render: () =>
        TBL(['Salida','Qué contiene','Cuándo usarla'], [
          ['Libros originales (.xlsx)',
           'Un archivo por fase, con sus datos escritos en las celdas exactas de la plantilla original: mismo formato, mismos gráficos, mismas fórmulas.',
           'Cuando la ARL o la empresa exige el formato oficial de la metodología.'],
          ['Los 5 libros (.zip)',
           'Las cinco fases comprimidas en un solo archivo.',
           'Para entregar el paquete completo por correo.'],
          ['Libro consolidado (.xlsm)',
           'Un solo archivo con portada, índice con hipervínculos, tablero BI con fórmulas vivas, las 53 hojas y el módulo de macros RehavidDMAIC.',
           'Para la presentación final y para que la empresa siga trabajando en Excel.'],
          ['Respaldo (.json)',
           'Copia completa del proyecto: datos, imágenes, diagramas y configuración.',
           'Respaldo diario y para mover el proyecto a otro computador.'],
          ['Datos (.csv)',
           'Todas las tablas del proyecto en texto plano.',
           'Para analizar en otra herramienta estadística.'],
          ['Impresión / PDF',
           'La vista actual impresa desde el navegador.',
           'Para actas y evidencias rápidas.']
        ]) +
        NOTE('info', esc('El libro consolidado trae macros. Al abrirlo, Excel pedirá «Habilitar contenido»: sin eso, ' +
                         'el panel de control y el recálculo del tablero no funcionan.')) +
        BVIEW('exportar', '⤓ Ir a exportación')
      },

      { type:'html', title:'Recomendación de uso', render: () =>
        OL(['Lea los capítulos 2 a 6 de esta guía antes de arrancar: son la base conceptual.',
            'Cree el proyecto de la empresa y cargue los logos.',
            'Trabaje fase por fase, en el orden de la guía de cada fase, y no adelante formatos sin insumo.',
            'Revise el tablero BI al cerrar cada fase: allí aparecen las alertas de coherencia entre fases.',
            'Exporte el respaldo .json al terminar cada jornada.',
            'Al cerrar, genere el libro consolidado y el A3 final para la presentación.'])
      },

      BLOQUE_NAV('guia.inicio')
    ]
  };

  /* ======================================================================
     CAPÍTULO 2 · ¿QUÉ ES LEAN?
     ==================================================================== */
  const C_LEAN = {
    id:'guia.que_es_lean', mod:'GUIA', sheet:'MANUAL · 2/12', extra:true,
    title:'¿Qué es Lean?',
    desc:'Filosofía, objetivo, flujo continuo, los 7 desperdicios y el valor agregado.',
    blocks:[
      { type:'html', render: () =>
        CARD('Lean en tres frases',
          G3(
            MINI('Es una filosofía', P('Y un conjunto de herramientas de mejora para identificar y eliminar los desperdicios en todos los pasos del proceso.')) +
            MINI('Es crear valor', P('Valor para el cliente, usando la menor cantidad posible de recursos, tiempo, energía y esfuerzo.')) +
            MINI('Es satisfacer al cliente', P('Entregando productos y servicios de calidad, cuando el cliente los necesita, en la cantidad que necesita y al precio correcto.'))
          ) +
          Q('El objetivo de Lean es identificar y eliminar los desperdicios de un proceso, para hacerlo más rápido y más simple.'))
      },

      { type:'html', title:'Qué reduce y qué aumenta Lean', render: () =>
        G2(
          MINI('Reduce',
            UL(['Costos y desperdicios','Lead time y tiempos de ciclo','Inventario y retrabajos','Scrap y fallas',
                'Complejidad y burocracia','Distancias recorridas','Número de proveedores innecesarios']), 'bad') +
          MINI('Aumenta',
            UL(['Productividad','Disponibilidad de equipos','Velocidad de respuesta','Calidad',
                'Flexibilidad','Mejoras del proceso','Satisfacción y valor para el cliente']), 'ok')
        ) +
        P('Dicho en una línea: menos desperdicio, ciclos más cortos, menos trámite. El mismo pedido que hoy atraviesa ' +
          'siete escritorios, mañana atraviesa tres, y el cliente lo recibe antes.')
      },

      { type:'html', title:'Flujo continuo y sistema pull', render: () =>
        P('El flujo continuo es el método que permite que las unidades (materiales, productos, piezas, personas, ' +
          'documentos, pacientes, solicitudes) se desplacen por el proceso sin interrupciones.') +
        G2(
          MINI('Flujo con interrupciones',
            P('El trabajo se detiene en retrasos y esperas, obstáculos e imprevistos, errores y defectos. ' +
              'Entre una entrada y una salida hay más tiempo de espera que de trabajo real.'), 'bad') +
          MINI('Flujo continuo (sistema pull)',
            P('Sólo se empieza a producir cuando existe una demanda real del cliente. El trabajo avanza sin ' +
              'acumularse y cada paso entrega justo lo que el siguiente puede procesar.'), 'ok')
        ) +
        NOTE('info', 'En esta app el flujo se hace visible en ' + LNK('medir.swin_line', 'Swim line') + ' y en ' +
                     LNK('medir.process_mapping_detailed', 'el mapa detallado del proceso') +
                     ': ahí aparecen las esperas, las distancias y los pasos que no transforman nada.')
      },

      { type:'html', render: () =>
        CARD('Los 7 desperdicios',
          P('Desperdicio es todo lo que consume recursos —tiempo, dinero, esfuerzo— y no le aporta valor al producto ' +
            'o al servicio desde el punto de vista del cliente. Son siete y conviene aprendérselos: en la fase ' +
            'ANALIZAR van a aparecer una y otra vez.') +
          G2(J(DESPERDICIOS.map(w =>
            '<div class="card" style="margin:0">' +
              '<div class="card-h"><span class="pill">' + esc(String(w.n)) + '</span>' +
              '<h3 style="flex:1;min-width:0">' + esc(w.k) + '</h3></div>' +
              '<div class="card-b">' + P(w.es) +
                '<div style="' + S_H + '">Ejemplos</div>' + UL(w.ej) +
                '<div style="' + S_H + '">Cómo eliminarlo</div>' + UL(w.el) +
              '</div></div>'))))
      },

      { type:'chart', kind:'pie', title:'Reparto típico del desperdicio en un proceso', h:320,
        chartTitle:'Peso relativo de cada desperdicio (referencia ilustrativa)',
        data: () => ({
          labels: DESPERDICIOS.map(w => w.k),
          values: DESPERDICIOS.map(w => w.peso),
          fmt:'n0'
        }) },
      { type:'note', tone:'warn',
        text:'Esta torta es ilustrativa: muestra el orden en que suelen aparecer los desperdicios, con las esperas y ' +
             'los defectos a la cabeza. El reparto real de su proceso sale de medirlo en % Value Add Time y en el ' +
             'mapa detallado, no de esta figura.' },

      { type:'html', title:'Valor agregado y valor no agregado', render: () =>
        P('Valor son las actividades necesarias para construir el producto o prestar el servicio conforme a lo que ' +
          'el cliente necesita, y por las cuales está dispuesto a pagar. Todo lo demás es soporte, y hay que reducirlo ' +
          'al mínimo indispensable.') +
        G2(
          MINI('Valor agregado',
            P('Transforman materiales e información en el producto o servicio que el cliente desea.') +
            P('Ejemplo del celular: atornillar la pantalla, instalar la cámara, ensamblar las piezas, pintar la carcasa.'), 'ok') +
          MINI('Valor no agregado',
            P('No contribuyen directamente a la transformación. Algunas son necesarias (una inspección exigida por ley), ' +
              'pero ninguna la paga el cliente con gusto.') +
            P('Ejemplo del celular: transportar tornillos a la línea, llevar el producto terminado a la bodega, ' +
              'inspeccionar los equipos.'), 'warn')
        ) +
        NOTE('info', 'Mida el suyo en ' + LNK('medir.valor_add', '% Value Add Time') +
                     ': clasifique cada actividad y su tiempo. El porcentaje que resulta suele ser el mejor argumento ' +
                     'para justificar el proyecto.')
      },

      BLOQUE_NAV('guia.que_es_lean')
    ]
  };

  /* ======================================================================
     CAPÍTULO 3 · ¿QUÉ ES SIX SIGMA?
     ==================================================================== */
  const DONAS_3S = () => muestraNormal(100, 10, 900, 20250730);
  const DONAS_6S = () => muestraNormal(100, 5, 900, 424242);

  const C_SIX = {
    id:'guia.que_es_six_sigma', mod:'GUIA', sheet:'MANUAL · 3/12', extra:true,
    title:'¿Qué es Six Sigma?',
    desc:'La variación, el ejemplo de las donas y la tabla de nivel sigma con el corrimiento de 1,5σ.',
    blocks:[
      { type:'html', render: () =>
        CARD('Six Sigma en una idea',
          P('Six Sigma es una metodología de solución de problemas cuyo objetivo es identificar y reducir la variación ' +
            'y los defectos de un proceso. No se trata de trabajar más rápido, sino de que el resultado sea ' +
            'predecible: que la pieza de hoy se parezca a la de mañana y las dos cumplan lo que el cliente pidió.') +
          PR('Un proceso en Six Sigma tiene sólo ' + B('3,4 defectos por millón de oportunidades') +
             ', es decir que el 99,99966 % de sus salidas están libres de defectos.') +
          KPIS([
            { label:'Defectos por millón', value:'3,4', hint:'A largo plazo, con corrimiento de 1,5σ', tone:'ok' },
            { label:'Rendimiento', value:'99,99966 %', hint:'Salidas libres de defecto', tone:'ok' },
            { label:'Un proceso 3σ', value:'66.800 DPMO', hint:'Lo que muchas operaciones consideran "normal"', tone:'bad' }
          ]))
      },

      { type:'html', title:'A qué se refiere sigma', render: () =>
        P('Sigma (σ) es la desviación estándar: el valor con el que se mide qué tanto se dispersan los datos ' +
          'alrededor del promedio de una característica. Mientras más pequeña sea σ, más parecidas son las unidades ' +
          'entre sí y más predecible es el proceso.') +
        G2(
          MINI('Desviación estándar de la población', P('Cuando se miden todos los elementos de lo que se quiere estudiar. Se anota σ.')) +
          MINI('Desviación estándar de la muestra', P('Cuando se mide una parte representativa de la población. Se anota s, y es lo que se usa casi siempre en un proyecto.'))
        ) +
        NOTE('info', 'El nivel sigma que la app calcula en ' + LNK('medir.dpmo', 'DPMO') + ', ' +
                     LNK('medir.ppm', 'PPM') + ' y ' + LNK('medir.dpu', 'DPU') +
                     ' sale de esta misma idea: cuántas desviaciones estándar caben entre el promedio y el límite ' +
                     'de especificación.')
      },

      { type:'html', render: () =>
        CARD('El ejemplo de las donas',
          P('Una panificadora fabrica donas y toma una muestra de 1.000 unidades para verificar su proceso. ' +
            'El peso promedio es de 100 g. La empresa quiere donas de 100 g con una tolerancia de ±30 g: ' +
            'entre 70 g y 130 g la dona se acepta.') +
          UL(['Si la dona pesa menos de 70 g, multan a la empresa por vender de menos.',
              'Si la dona pesa más de 130 g, la empresa regala producto y pierde plata.',
              'El peso ideal (objetivo) es 100 g; 70 g es el límite inferior y 130 g el superior.']) +
          P('La pregunta de Six Sigma no es cuánto pesa la dona promedio, sino cuánta variación tiene el proceso ' +
            'alrededor de ese promedio.'))
      },

      { type:'chart', kind:'histogram', title:'Proceso actual en 3 sigma (σ = 10 g)', h:300,
        chartTitle:'Caben ±3 desviaciones estándar entre los límites: parte de la producción se sale',
        data: () => ({ values: DONAS_3S(), lsl:70, usl:130, target:100, bins:16 }) },
      { type:'chart', kind:'histogram', title:'Proceso mejorado en 6 sigma (σ = 5 g)', h:300,
        chartTitle:'Caben ±6 desviaciones estándar entre los mismos límites: prácticamente nada se sale',
        data: () => ({ values: DONAS_6S(), lsl:70, usl:130, target:100, bins:16 }) },

      { type:'html', render: () =>
        NOTE('info',
          '<b>Lo que cambió no fueron los límites, fue la variación.</b>' +
          UL(['Con σ = 10 g caben 3 desviaciones a cada lado del promedio: el proceso está en 3σ y se sale por ambos extremos.',
              'Con σ = 5 g caben 6 desviaciones a cada lado: el proceso está en 6σ y las colas ya no alcanzan la especificación.',
              'La tolerancia del cliente es la misma en ambos casos: 70 g a 130 g.',
              'Reducir la variación es más rentable que ampliar la tolerancia, porque la tolerancia no la pone la empresa.']))
      },

      { type:'html', title:'Tabla de nivel sigma', render: () =>
        P('El nivel sigma se lee de dos maneras. A corto plazo las fuentes de variación permanecen controladas ' +
          '(una máquina, un lote, un turno, un periodo corto). A largo plazo entran cambios de material, ambiente, ' +
          'operarios y turnos, y el desempeño se degrada. Por convención, la diferencia entre ambos se representa ' +
          'con un corrimiento de 1,5σ, y por eso un proceso 6σ a largo plazo entrega 3,4 defectos por millón.') +
        TBL(['Nivel σ','DPMO corto plazo','Error corto','Rendimiento corto','DPMO largo plazo','Error largo','Rendimiento largo'],
          TABLA_SIGMA.map(r => [
            { h: B(r.z + ' σ') },
            fmt(r.cpDpmo, r.cpDpmo < 100 ? 'n3' : 'n0'), r.cpErr, r.cpRto,
            fmt(r.lpDpmo, r.lpDpmo < 100 ? 'n1' : 'n0'), r.lpErr, r.lpRto
          ]), [1,2,3,4,5,6]) +
        UL([{ h: B('DPMO') + ': defectos por millón de oportunidades, es decir cuántos defectos habría si se produjera un millón de veces.' },
            { h: B('Error') + ': porcentaje de salidas defectuosas.' },
            { h: B('Rendimiento') + ': porcentaje de salidas conformes.' }])
      },

      { type:'chart', kind:'bar', title:'DPMO a largo plazo por nivel sigma', h:300,
        chartTitle:'Cada nivel sigma reduce los defectos en un orden de magnitud',
        data: () => ({
          labels: TABLA_SIGMA.map(r => r.z + ' σ'),
          values: TABLA_SIGMA.map(r => r.lpDpmo),
          tones:  ['bad','bad','warn','warn','ok','ok'],
          fmt:'n0', yLabel:'DPMO'
        }) },

      { type:'html', render: () =>
        NOTE('warn',
          '<b>Cómo se usa esto en el proyecto.</b>' +
          UL(['Levante el DPMO real en ' + LNK('medir.dpmo', 'DPMO') + ' o el PPM en ' + LNK('medir.ppm', 'PPM') + '.',
              'La app convierte ese número a nivel sigma con el corrimiento de 1,5σ, igual que la tabla de largo plazo.',
              'Ese nivel sigma es su línea base. Al final del proyecto se vuelve a calcular con los mismos criterios.',
              'Compare siempre corto contra corto y largo contra largo: mezclarlos infla o desinfla el resultado.']))
      },

      BLOQUE_NAV('guia.que_es_six_sigma')
    ]
  };

  /* ======================================================================
     CAPÍTULO 4 · ¿QUÉ ES LEAN SIX SIGMA?
     ==================================================================== */
  const C_LSS = {
    id:'guia.lean_six_sigma', mod:'GUIA', sheet:'MANUAL · 4/12', extra:true,
    title:'¿Qué es Lean Six Sigma?',
    desc:'La combinación de las dos metodologías, la estrategia, los niveles de certificación y la estructura de roles.',
    blocks:[
      { type:'html', render: () =>
        CARD('Dos metodologías, un solo propósito',
          G2(
            MINI('Lean', P('Eficiencia a través de la eliminación de los desperdicios. Ataca el tiempo, el movimiento y todo lo que no agrega valor.'), 'ok') +
            MINI('Six Sigma', P('Reducción de la variación, enfocándose en la calidad del proceso. Ataca el defecto y lo impredecible.'), 'ok')
          ) +
          Q('Entregar valor al cliente mediante la eficiencia y la calidad de los procesos.') +
          P('Lean Six Sigma es una metodología integral que mejora el desempeño de cualquier proceso eliminando ' +
            'desperdicios y reduciendo la variación. Reúne herramientas y técnicas que soportan las necesidades del ' +
            'cliente, reducen costos y construyen equipos sólidos, en manufactura, en servicios, en salud y en ' +
            'seguridad y salud en el trabajo.'))
      },

      { type:'html', title:'La estrategia', render: () =>
        TBL(['Frente','En qué consiste'], [
          [{ h: B('Qué se busca') }, 'Crear valor, eliminar variación, resolver problemas con impacto e innovar reduciendo la complejidad.'],
          [{ h: B('Cómo se logra') }, 'Con proyectos (definirlos, hacerles seguimiento y evaluarlos), con herramientas Lean y Six Sigma, y con capacitación: formar Belts en la organización.'],
          [{ h: B('Por qué se hace') }, 'Por la voz del cliente y la voz del negocio: los objetivos y metas de la empresa.'],
          [{ h: B('Con qué se mide') }, 'Productividad, costo, calidad y tiempo.']
        ]) +
        P('Un programa Lean Six Sigma sin proyectos es un curso; con proyectos y sin seguimiento, es un desperdicio ' +
          'más. La disciplina de este método está en cerrar cada proyecto con datos.')
      },

      { type:'html', title:'Niveles en Lean Six Sigma', render: () =>
        P('El rol de un Belt es liderar proyectos de mejora continua, cambiar la manera tradicional de pensar ' +
          'demostrando la aplicación exitosa de la metodología, llevar registro de las mejoras y apoyar para que ' +
          'el proceso mejorado se mantenga bajo control.') +
        TBL(['Nivel','Qué domina','Papel típico en el proyecto'], [
          [{ h: B('White Belt') }, 'Conceptos básicos: qué es desperdicio, qué es variación, para qué sirve DMAIC.', 'Participa como miembro del equipo y aporta el conocimiento del puesto de trabajo.'],
          [{ h: B('Yellow Belt') }, 'Herramientas básicas de recolección de datos y de análisis simple.', 'Recolecta datos, apoya el mapeo y ejecuta acciones de mejora.'],
          [{ h: B('Green Belt') }, 'El ciclo DMAIC completo y la estadística aplicada del proyecto.', 'Lidera el proyecto: planifica, coordina y responde por el resultado.'],
          [{ h: B('Black Belt') }, 'Estadística avanzada, diseño de experimentos y gestión de varios proyectos.', 'Lidera proyectos complejos y actúa como mentor de los Green Belts.'],
          [{ h: B('Master Black Belt') }, 'Despliegue de la metodología, formación y estrategia.', 'Forma Belts, selecciona el portafolio de proyectos y asesora a la dirección.']
        ])
      },

      { type:'html', title:'Estructura de un proyecto', render: () =>
        TBL(['Rol','Responsabilidad'], [
          [{ h: B('Champion / Sponsor') }, 'Ejecutivo que facilita los recursos para ejecutar y completar el proyecto, y que remueve los obstáculos que el equipo no puede mover.'],
          [{ h: B('Mentor (Black o Master Black Belt)') }, 'Guía con experiencia en proyectos de mejora; orienta metodológicamente al líder del proyecto.'],
          [{ h: B('Dueño del proceso (Process Owner)') }, 'Responsable inmediato del área intervenida. Es quien mantiene las mejoras cuando el proyecto cierra.'],
          [{ h: B('Finanzas') }, 'Aprueba los recursos financieros y valida los ahorros declarados. Sin su firma, el ahorro es una estimación.'],
          [{ h: B('Facilitador (Green Belt)') }, 'Líder del proyecto: planea, coordina y gestiona todas las actividades para desarrollarlo y completarlo.'],
          [{ h: B('Team member') }, 'Personas del equipo operativo que ejecutan el proyecto y conocen el proceso por dentro.']
        ]) +
        NOTE('info', 'Registre estos roles con nombre y cargo en ' + LNK('definir.project_members', 'Project Members') +
                     '; de ahí se copian al ' + LNK('definir.project_charter', 'Project Charter') + ' y al A3.')
      },

      BLOQUE_NAV('guia.lean_six_sigma')
    ]
  };

  /* ======================================================================
     CAPÍTULO 5 · ¿QUÉ ES DMAIC?
     ==================================================================== */
  const C_DMAIC = {
    id:'guia.que_es_dmaic', mod:'GUIA', sheet:'MANUAL · 5/12', extra:true,
    title:'¿Qué es DMAIC?',
    desc:'Los cinco pasos y el ciclo problema real → problema estadístico → solución estadística → solución real.',
    blocks:[
      { type:'html', render: () =>
        CARD('Una secuencia de cinco pasos',
          P('DMAIC es el proceso ordenado para resolver problemas: Definir, Medir, Analizar, Mejorar y Controlar. ' +
            'Su fuerza no está en las herramientas sino en el orden: cada paso produce lo que el siguiente necesita, ' +
            'y saltarse uno obliga a devolverse.') +
          Q('Si no puedes medir algo, no lo puedes entender; si no lo puedes entender, no lo puedes controlar; ' +
            'si no lo puedes controlar, no lo puedes mejorar.'))
      },

      { type:'html', title:'Los cinco pasos', render: () => {
        const paso = (m, txt) =>
          '<div class="card" style="margin:0;border-left:4px solid ' + esc(m.color) + '">' +
            '<div class="card-h">' +
              '<div style="width:28px;height:28px;border-radius:8px;color:#fff;display:flex;align-items:center;' +
                'justify-content:center;font-weight:800;background:' + esc(m.color) + '">' + esc(m.letter) + '</div>' +
              '<h3 style="flex:1;min-width:0">' + esc(m.name) + ' · ' + esc(m.en) + '</h3></div>' +
            '<div class="card-b">' + P(txt) +
              '<div style="display:flex;gap:6px;flex-wrap:wrap">' + BMOD(m.id, 'Ir a la fase') +
              (FASE_CFG[m.id] ? '<button class="btn sm p" data-goto="' + esc(FASE_CFG[m.id].cap) + '">Guía de la fase →</button>' : '') +
              '</div></div></div>';
        const T = {
          DEFINIR:'Entender el problema y justificar su solución. Se formula el problema y se declara el aporte que su solución le hace a la empresa.',
          MEDIR:'Entender el estado actual o línea base del desempeño del proceso mediante el uso de métricos confiables.',
          ANALIZAR:'Encontrar la causa raíz del problema, comprendiendo y cuantificando su efecto sobre el desempeño del proceso.',
          MEJORAR:'Desarrollar e implementar las mejores soluciones para resolver el problema, probándolas antes de desplegarlas.',
          CONTROLAR:'Sostener las soluciones implementadas y hacer el cierre formal del proyecto.'
        };
        return G2(J(FASES.map(m => paso(m, T[m.id]))));
      } },

      { type:'html', title:'El ciclo del pensamiento estadístico', render: () =>
        P('DMAIC obliga a un rodeo que parece innecesario y que es justamente lo que hace funcionar el método: ' +
          'el problema del mundo real se traduce a un problema estadístico, se resuelve como problema estadístico ' +
          'y sólo entonces se devuelve al mundo real convertido en una solución concreta.') +
        G2(
          MINI('1 · Problema del mundo real',
            P('"Los clientes se están quejando por entregas tarde." Es lo que le cuentan al Green Belt el primer día. ' +
              'Se formula en la fase DEFINIR.')) +
          MINI('2 · Problema estadístico',
            P('"El 14 % de las órdenes llega en promedio 8 días tarde, con una desviación de 3 días." ' +
              'Se construye en MEDIR y se investiga en ANALIZAR.'))
        ) +
        G2(
          MINI('3 · Solución estadística',
            P('"El tiempo de alistamiento explica el 62 % de la variación del tiempo de entrega (p = 0,003)." ' +
              'Sale de las pruebas de hipótesis, la correlación y la regresión.')) +
          MINI('4 · Solución del mundo real',
            P('"Se estandarizó el alistamiento y se instaló un dispositivo a prueba de errores; las entregas tarde ' +
              'bajaron de 14 % a 3 %." Es lo que se implementa en MEJORAR y se sostiene en CONTROLAR.'))
        ) +
        NOTE('warn', esc('El error clásico es saltar del paso 1 al paso 4 sin pasar por el 2 y el 3. Eso no es un ' +
                         'proyecto Lean Six Sigma: es una corazonada con presupuesto.'))
      },

      { type:'html', title:'Qué pregunta responde cada fase', render: () =>
        TBL(['Fase','La pregunta','El entregable que la cierra'], [
          ['DEFINIR','¿Cuál es el problema, de qué tamaño es y cuánto vale resolverlo?','Project Charter firmado'],
          ['MEDIR','¿Cómo es el proceso realmente y cuál es su desempeño actual?','Línea base con datos confiables'],
          ['ANALIZAR','¿Por qué ocurre? ¿Cuál es la causa raíz y cuánto explica?','Causa raíz validada'],
          ['MEJORAR','¿Qué solución la ataca y funciona en la práctica?','Mejora implementada y medida'],
          ['CONTROLAR','¿Cómo evitamos que el problema regrese?','Plan de control y Charter de cierre']
        ])
      },

      BLOQUE_NAV('guia.que_es_dmaic')
    ]
  };

  /* ======================================================================
     CAPÍTULO 6 · SELECCIÓN DE PROYECTOS
     ==================================================================== */
  const C_SEL = {
    id:'guia.seleccion_proyectos', mod:'GUIA', sheet:'MANUAL · 6/12', extra:true,
    title:'Selección de proyectos',
    desc:'Cómo identificar, evaluar y seleccionar el proyecto correcto antes de arrancar el DMAIC.',
    blocks:[
      { type:'html', render: () =>
        CARD('Antes de DMAIC hay una decisión',
          P('El proyecto correcto no aparece solo: se busca. Elegir mal cuesta meses de trabajo del equipo y ' +
            'credibilidad ante la gerencia. Por eso la selección tiene tres momentos: identificar candidatos, ' +
            'obtener datos que den claridad, y evaluar y seleccionar con criterios explícitos.'))
      },

      { type:'html', title:'1 · Identificar proyectos potenciales', render: () =>
        G2(
          MINI('Dónde buscar',
            UL(['La planeación estratégica y los objetivos del año.',
                'Los costos de la mala calidad.',
                'Auditorías, hallazgos e inspecciones.',
                'Evaluaciones de oportunidades y planes de la organización.',
                'Necesidades y quejas del cliente.'])) +
          MINI('Qué señales delatan un proyecto',
            UL(['Insatisfacción o reclamos recurrentes del cliente.',
                'Exceso de inventario o de trámite.',
                'Alto contenido de actividades que no agregan valor.',
                'Reprocesos y devoluciones que ya se volvieron rutina.',
                'Indicadores que llevan meses por fuera de meta.']))
        ) +
        P('En el mundo de la seguridad y salud en el trabajo, las fuentes equivalentes son la accidentalidad por ' +
          'centro de trabajo, el ausentismo, los tiempos de atención, la cobertura de exámenes, los hallazgos de ' +
          'inspección y los reprocesos administrativos entre la ARL y la empresa.')
      },

      { type:'html', title:'2 · Obtener datos para dar claridad', render: () =>
        P('Antes de comparar candidatos hay que recopilar datos por cada problema identificado y estimar su impacto. ' +
          'Sin ese paso, la priorización se convierte en una discusión de opiniones.') +
        UL(['Cantidad y frecuencia del problema (cuántas veces, cada cuánto).',
            'Costo asociado o pérdida estimada.',
            'Clientes actuales afectados.',
            'Reducción posible de costos o de tiempos de proceso.',
            'Efecto sobre la satisfacción del cliente y sobre el rendimiento.'])
      },

      { type:'html', title:'3 · Evaluar y seleccionar', render: () =>
        G2(
          MINI('Criterios de verificación (¿es viable?)',
            UL([{ h: B('Medible') + ': existe o se puede levantar el dato.' },
                { h: B('Impacto notable') + ': mover ese indicador se nota en el negocio.' },
                { h: B('Crónico') + ': el problema es continuo, no un evento aislado.' },
                { h: B('Tamaño administrable') + ': el alcance cabe en 4 a 6 meses.' },
                { h: B('Sin solución conocida') + ': si ya se sabe qué hacer, ejecútelo, no lo vuelva proyecto.' }])) +
          MINI('Criterios de la organización (¿conviene?)',
            UL([{ h: B('Impacto sobre KPI estratégicos') },
                { h: B('Impacto en el cliente') },
                { h: B('Riesgos') + ' de ejecución y de operación.' },
                { h: B('Costo de implementación') + ' y disponibilidad de recursos.' },
                { h: B('Probabilidad de éxito') + ' con el equipo disponible.' }]))
        ) +
        P('Con esos criterios se califica cada candidato en la matriz de priorización. El resultado multiplica las ' +
          'calificaciones para castigar a los proyectos con alguna dimensión muy débil: un proyecto de gran ' +
          'beneficio pero de probabilidad mínima cae al fondo, que es exactamente lo que debe pasar.') +
        BTN('definir.matriz_priorizacion', 'Abrir la Matriz de Priorización de Proyectos')
      },

      { type:'html', title:'Ejemplo de priorización', render: () =>
        TBL(['Proyecto','Importancia negocio','Importancia cliente','Costo de implementación','Probabilidad de éxito','Beneficio esperado','Resultado'],
          [
            [{ h: B('Reducción de costos en botellas') }, '1','3','4','5','5', { h: PILL('300 · elegido', 'ok') }],
            ['Optimizar tiempo de entrega','4','2','3','3','3','216'],
            ['Reducción de scrap','1','3','4','4','4','192'],
            ['Mejorar calidad en producto A','5','1','4','3','3','180']
          ], [1,2,3,4,5,6]) +
        NOTE('warn', esc('Ojo con la escala del costo: allí 5 = costo bajo y 1 = costo alto. Es el único criterio ' +
                         'invertido, y equivocarse en él cambia el ganador.'))
      },

      { type:'html', title:'Ejemplos de proyectos donde aplica Lean Six Sigma', render: () =>
        G3(
          MINI('Calidad', UL(['Reducción de defectos en producto','Minimizar variabilidad del proceso','Reducción de scrap mensual','Eliminar errores en documentos'])) +
          MINI('Tiempo', UL(['Optimizar el tiempo de entrega','Minimizar el tiempo de ciclo','Reducir tiempos de alistamiento','Reducir tiempos de atención'])) +
          MINI('Costo y productividad', UL(['Reducción de costos por reprocesos','Aumento de la productividad','Incrementar el rendimiento del proceso','Reducir desperdicios'])) +
          MINI('Cliente', UL(['Incremento en la satisfacción del cliente','Reducción de quejas y garantías','Mejorar la oportunidad del servicio'])) +
          MINI('SST y ARL', UL(['Reducción de la accidentalidad en un centro de trabajo','Reducción del ausentismo por causa médica','Cobertura de exámenes ocupacionales','Oportunidad en la investigación de incidentes'])) +
          MINI('Administrativo', UL(['Reducción de reprocesos en facturación','Tiempo de respuesta a solicitudes','Reducción de inventario de insumos']))
        )
      },

      { type:'html', render: () =>
        NOTE('info',
          '<b>Ya elegido el proyecto:</b>' +
          UL(['Asigne un Green Belt responsable.',
              'Conforme el equipo de trabajo con el dueño del proceso y el champion.',
              'Empiece el ' + LNK('definir.clarificacion_problema', 'DEFINIR') + ' y elabore el Project Charter.']))
      },

      BLOQUE_NAV('guia.seleccion_proyectos')
    ]
  };

  /* ======================================================================
     CAPÍTULOS 7 a 11 · UNA GUÍA POR FASE
     ==================================================================== */
  const C_DEF = {
    id:'guia.fase_definir', mod:'GUIA', sheet:'MANUAL · 7/12', extra:true,
    title:'Fase DEFINIR — paso a paso',
    desc:'Qué se busca, en qué orden se llenan las herramientas, cómo se encadenan y cuándo se puede pasar a MEDIR.',
    blocks: bloquesFase('DEFINIR')
  };
  const C_MED = {
    id:'guia.fase_medir', mod:'GUIA', sheet:'MANUAL · 8/12', extra:true,
    title:'Fase MEDIR — paso a paso',
    desc:'Mapear el proceso, validar el sistema de medición, recolectar datos y fijar la línea base.',
    blocks: bloquesFase('MEDIR')
  };
  const C_ANA = {
    id:'guia.fase_analizar', mod:'GUIA', sheet:'MANUAL · 9/12', extra:true,
    title:'Fase ANALIZAR — paso a paso',
    desc:'De las causas posibles a la causa raíz validada, con evidencia y con estadística.',
    blocks: bloquesFase('ANALIZAR')
  };
  const C_MEJ = {
    id:'guia.fase_mejorar', mod:'GUIA', sheet:'MANUAL · 10/12', extra:true,
    title:'Fase MEJORAR — paso a paso',
    desc:'Generar, evaluar, pilotear e implementar la solución, y medir el resultado.',
    blocks: bloquesFase('MEJORAR')
  };
  const C_CON = {
    id:'guia.fase_controlar', mod:'GUIA', sheet:'MANUAL · 11/12', extra:true,
    title:'Fase CONTROLAR — paso a paso',
    desc:'Controlar el proceso, estandarizar, sostener la mejora y preparar el cierre.',
    blocks: bloquesFase('CONTROLAR')
  };

  /* ======================================================================
     CAPÍTULO 12 · CIERRE Y PRESENTACIÓN FINAL
     ==================================================================== */
  const C_CIERRE = {
    id:'guia.cierre', mod:'GUIA', sheet:'MANUAL · 12/12', extra:true,
    title:'Cierre del proyecto y presentación final',
    desc:'Charter de cierre, A3 final, lecciones aprendidas, reconocimiento del equipo y entrega a la ARL y a la empresa.',
    blocks:[
      { type:'html', render: () =>
        CARD('Cerrar es un acto formal, no un correo',
          P('El proyecto no termina cuando el indicador mejora: termina cuando alguien firma que mejoró, cuando el ' +
            'dueño del proceso recibe el proceso con su plan de control, y cuando la empresa y la ARL tienen en la ' +
            'mano el paquete completo del trabajo realizado.') +
          Q('Si la mejora no está estandarizada, controlada y entregada, en tres meses el proceso vuelve a como estaba.'))
      },

      { type:'html', title:'1 · Project Charter de cierre', render: () =>
        P('Es el acta de constitución actualizada con la realidad. Se abre el mismo documento y se completan las ' +
          'columnas de cierre: beneficios obtenidos, ahorros logrados y métricos clave alcanzados frente a la línea ' +
          'base, con las firmas finales.') +
        UL(['Beneficios reales, no los esperados del inicio.',
            'Desglose por categoría en hard benefit (impacto financiero directo) y soft benefit (impacto positivo sin efecto financiero directo).',
            'Métricos clave de cierre: si mejoró, base line, logrado e ideal.',
            'Firma y fecha del champion, dueño del proceso, finanzas, mentor y facilitador.']) +
        BTN('controlar.charter_cierre', 'Abrir el Project Charter de cierre')
      },

      { type:'html', title:'2 · A3 final del proyecto', render: () =>
        P('El A3 final cuenta las cinco fases en una sola hoja: el problema y su base line, la medición, la causa ' +
          'raíz, las mejoras implementadas y el control. Es el documento de la presentación, no el archivo del ' +
          'proyecto: debe entenderse en cinco minutos.') +
        UL(['Verifique que el métrico sea el mismo desde DEFINIR hasta CONTROLAR.',
            'Incruste los gráficos que ya existen en la app; no los vuelva a dibujar.',
            'Evite el texto largo: en un A3 mandan las cifras y las imágenes.']) +
        '<div style="display:flex;gap:8px;flex-wrap:wrap">' +
          BTN('controlar.a3_final', 'Abrir el A3 final') +
          BTN('controlar.a3_controlar', 'Abrir el A3 Controlar') +
        '</div>'
      },

      { type:'html', title:'3 · Lecciones aprendidas', render: () =>
        P('Media hora con el equipo, con preguntas concretas, vale más que un informe de veinte páginas. Se documenta ' +
          'para que el siguiente proyecto no repita los mismos tropiezos.') +
        TBL(['Pregunta','Qué se busca'], [
          ['¿Qué funcionó y hay que repetir?','Prácticas que aceleraron el proyecto: reuniones cortas, datos disponibles, apoyo del champion.'],
          ['¿Qué nos costó más de lo previsto?','Recolección de datos, validación del sistema de medición, disponibilidad del equipo.'],
          ['¿Qué haríamos distinto?','Alcance, tamaño de muestra, momento del piloto, comunicación.'],
          ['¿Qué se puede replicar en otra área?','La solución, el estándar o el dispositivo que sirve tal cual en otro proceso.'],
          ['¿Qué quedó pendiente?','Acciones fuera del alcance, con responsable y fecha, para que no se pierdan.']
        ])
      },

      { type:'html', title:'4 · Reconocimiento del equipo', render: () =>
        P('El reconocimiento no es un adorno: es lo que hace que la gente quiera participar en el siguiente proyecto. ' +
          'Se hace en público, con nombres propios y con el resultado a la vista.') +
        UL(['Nombre y aporte concreto de cada integrante, incluido el personal operativo.',
            'Certificado o constancia de participación firmada por la gerencia.',
            'Mención del resultado logrado en números, no en adjetivos.',
            'Cierre visible: publicar el A3 final en la cartelera del área intervenida.'])
      },

      { type:'html', title:'5 · Entrega a la ARL y a la empresa', render: () =>
        P('Rehavid entrega dos paquetes con el mismo contenido y distinto énfasis: la ARL necesita evidencia ' +
          'metodológica y resultado; la empresa necesita además poder sostener la mejora sin acompañamiento.') +
        G2(
          MINI('Paquete para la ARL contratante',
            UL(['Project Charter inicial y de cierre, firmados.',
                'A3 de las cinco fases y A3 final.',
                'Los cinco libros de Excel diligenciados (o el .zip con todos).',
                'Indicadores de la línea base y del resultado, con el mismo métrico.',
                'Lecciones aprendidas y acta de cierre con firmas.'])) +
          MINI('Paquete para la empresa atendida',
            UL(['Todo lo anterior, más:',
                'Libro consolidado .xlsm con macros, para que sigan trabajando en Excel.',
                'Estándares de trabajo publicados y personal entrenado.',
                'Plan de control con responsable, frecuencia y plan de reacción.',
                'Respaldo .json del proyecto por si necesitan reabrirlo en la app.']))
        ) +
        '<div style="display:flex;gap:8px;flex-wrap:wrap">' + BVIEW('exportar', '⤓ Generar los entregables') +
          BVIEW('bi', '📊 Revisar el tablero antes de entregar') + '</div>'
      },

      { type:'html', render: () =>
        NOTE('warn',
          '<b>Lista de verificación del cierre.</b> No entregue hasta que todo esto esté en verde:' +
          UL(['El proceso está en control estadístico con datos posteriores a la mejora.',
              'El estándar de trabajo está publicado y el personal fue entrenado.',
              'El plan de control tiene responsable, frecuencia y acciones correctivas.',
              'Los ahorros fueron validados por finanzas.',
              'El dueño del proceso recibió formalmente el proceso.',
              'El Charter de cierre y el acta están firmados.',
              'Los entregables fueron exportados y respaldados.']))
      },

      { type:'html', render: () =>
        CARD('Y después del cierre',
          P('Un proyecto bien cerrado deja tres cosas: un proceso mejor, un equipo que aprendió a resolver problemas ' +
            'con datos y una lista de candidatos para el siguiente proyecto. Vuelva a la matriz de priorización y ' +
            'empiece de nuevo: eso es mejora continua.') +
          '<div style="display:flex;gap:8px;flex-wrap:wrap">' +
            BTN('definir.matriz_priorizacion', 'Priorizar el siguiente proyecto') +
            '<button class="btn sm g" data-goto="guia.inicio">Volver al inicio de la guía →</button>' +
          '</div>')
      },

      BLOQUE_NAV('guia.cierre')
    ]
  };

  /* ==================================================================== */
  return [C_INICIO, C_LEAN, C_SIX, C_LSS, C_DMAIC, C_SEL,
          C_DEF, C_MED, C_ANA, C_MEJ, C_CON, C_CIERRE];
})();

registerTools(SPECS_GUIA);
