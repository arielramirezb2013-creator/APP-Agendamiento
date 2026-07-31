/* ============================================================================
   REHAVID · LEAN SIX SIGMA DMAIC
   SPECS EXTRA — FASES MEJORAR y CONTROLAR
   (herramientas del MANUAL que NO están en los cinco libros de Excel)
   ---------------------------------------------------------------------------
   Fuente: _dump/MANUAL_texto.txt · páginas 227 a 260
     p229-231  Poka Yoke — a prueba de errores (niveles I, II y III)
     p232-233  Mapa gráfico de modelos de mejora y validación de las mejoras
     p240-243  Control estadístico del proceso (SPC): conceptos y metodología
     p242      Límites de control (voz del proceso) vs límites de
               especificación (voz del cliente) y los 4 escenarios
     p244-260  Selección de la carta: I-MR · X̄-R · X̄-S · P · NP · C · U
     (el PLAN DE REACCIÓN complementa el Plan de control de la fase CONTROLAR:
      qué hacer cuando el indicador se sale de control)

   Estas herramientas NO existen como hoja en los libros originales: viven sólo
   en la app y en el libro consolidado, por eso van marcadas con `extra:true`
   y SIN mapeo `xl`.

   Todo el cálculo estadístico se delega en STATS (45_stats.js):
   cartas de control con las constantes AIAG y las 8 reglas de Nelson.
   JavaScript de navegador plano: sin módulos, sin librerías, sin red.
   ========================================================================== */
'use strict';

const SPECS_EXTRA_MC = (function(){

  /* ======================================================================
     HELPERS PRIVADOS DEL MÓDULO (no contaminan el ámbito global)
     ==================================================================== */

  /** Valor numérico con valor por defecto cuando la celda está vacía */
  const gnum = (d, k, def) => {
    const v = (d || {})[k];
    return (v === null || v === undefined || v === '') ? def : num(v);
  };
  /** Texto limpio */
  const txt = v => String(v == null ? '' : v).trim();
  /** Filas con algún contenido en la columna `k` */
  const filled = (rows, k) => arr(rows).filter(r => txt(r && r[k]) !== '');
  /** ¿el resultado de STATS trae error? */
  const malo = r => !r || !!r.error;
  /** Número formateado o guion largo */
  const nf = (v, f) => (v !== null && v !== undefined && v !== '' && isFinite(num(v)))
    ? fmt(v, f || 'n2') : '—';
  /** Porcentaje calculado sobre un total, tolerante al total cero */
  const pctDe = (a, b) => (num(b) > 0 ? num(a) / num(b) : NaN);

  /* -------------------------------------------------------- tablas HTML */
  /** Construye una tabla `gt` escapando SIEMPRE el contenido.
   *  head: ['A','B'] · body: [[c1,c2], …] · cada celda puede ser
   *  string/number o { v:'texto', n:true (alinea a la derecha), tone:'ok|warn|bad', b:true } */
  function tabla(head, body, opts){
    const o = opts || {};
    let h = '<div class="twrap"><table class="gt"><thead><tr>';
    arr(head).forEach((c, i) => {
      const s = (c && typeof c === 'object') ? c : { v: c };
      h += '<th' + ((s.n || (o.numDesde !== undefined && i >= o.numDesde)) ? ' class="n"' : '') + '>' +
           esc(s.v) + '</th>';
    });
    h += '</tr></thead><tbody>';
    arr(body).forEach(fila => {
      h += '<tr>';
      arr(fila).forEach((c, i) => {
        const s = (c && typeof c === 'object') ? c : { v: c };
        const der = s.n || (o.numDesde !== undefined && i >= o.numDesde);
        h += '<td' + (s.tone ? ' class="cell-' + esc(s.tone) + '"' : '') +
             ' style="padding:6px 9px;font-size:12px;line-height:1.5' + (der ? ';text-align:right' : '') +
             (s.b ? ';font-weight:800' : '') + '">' + esc(s.v == null ? '' : s.v) + '</td>';
      });
      h += '</tr>';
    });
    h += '</tbody></table></div>';
    return h;
  }
  /** Aviso corto dentro de un bloque html */
  const aviso = (msg, tono) =>
    '<div class="note ' + esc(tono || 'info') + '">' + esc(msg) + '</div>';

  /* ======================================================================
     1 · POKA YOKE — A PRUEBA DE ERRORES
     Manual p229-231
     ==================================================================== */

  const PY_TIPOS = [
    'Físico (forma, color, tamaño, tope)',
    'Secuencial (obliga el orden de los pasos)',
    'Agrupamiento (kits o juegos completos)',
    'Informativo (aviso, luz, sonido, alerta)'
  ];
  const PY_NIVELES = [
    'I · EVITAR (previene el error)',
    'II · PREVENIR (detecta el error antes del defecto)',
    'III · DETECTAR (detecta el defecto ya ocurrido)'
  ];
  const PY_ESTADOS = ['Idea', 'En diseño', 'En implementación', 'Implementado', 'Validado', 'Descartado'];

  /** Nivel de un dispositivo: 'I', 'II', 'III' o '' */
  function nivelPY(r){
    const t = txt(r && r.nivel).toUpperCase();
    if (t.indexOf('III') === 0) return 'III';
    if (t.indexOf('II') === 0)  return 'II';
    if (t.indexOf('I') === 0)   return 'I';
    return '';
  }
  /** Robustez del dispositivo según su nivel (I es el más fuerte) */
  const PY_ROBUSTEZ = {
    I:   { t:'ALTA · el error no puede ocurrir', tone:'ok' },
    II:  { t:'MEDIA · el error se detiene antes del defecto', tone:'warn' },
    III: { t:'BAJA · sólo avisa cuando el defecto ya existe', tone:'bad' }
  };
  /** Conteo de dispositivos por nivel y por estado */
  function conteoPY(d){
    const rows = filled(arr(d.rows), 'error').concat(
      filled(arr(d.rows), 'dispositivo').filter(r => txt(r.error) === ''));
    const o = { total:0, I:0, II:0, III:0, sinNivel:0, implementados:0, validados:0, abiertos:0 };
    arr(d.rows).forEach(r => {
      if (txt(r.error) === '' && txt(r.dispositivo) === '' && txt(r.paso) === '') return;
      o.total++;
      const nv = nivelPY(r);
      if (nv) o[nv]++; else o.sinNivel++;
      const e = txt(r.estado);
      if (e === 'Implementado') o.implementados++;
      if (e === 'Validado'){ o.implementados++; o.validados++; }
      if (e === 'Idea' || e === 'En diseño' || e === 'En implementación') o.abiertos++;
    });
    o.registros = rows.length;
    return o;
  }

  const T_POKA_YOKE = {
    id: 'mejorar.poka_yoke',
    mod: 'MEJORAR',
    extra: true,
    sheet: 'Poka Yoke (manual)',
    title: 'POKA YOKE — A PRUEBA DE ERRORES',
    desc: 'Diseña dispositivos baratos, simples y prácticos que impidan que el error ocurra, o que lo detecten antes de que se convierta en un defecto que llegue al cliente.',
    guide: [
      'QUÉ ES (manual p229): el Poka Yoke es un método o técnica que se implementa para PREVENIR ERRORES en los procesos. En la práctica consiste en instalar dispositivos o programas que detecten el error o prevengan el riesgo de que ocurra.',
      'ERRORES QUE ATACA: falta de estándares, falta de experiencia, olvidos, prisas, falta de concentración, pereza. Son errores humanos: castigar a la persona no los elimina, cambiar el proceso sí.',
      'SE CARACTERIZA POR SER: barato · basado en la simplicidad · aplicación del ingenio · práctico · efectivo. Si tu solución es cara y complicada, probablemente no es un Poka Yoke.',
      'EJEMPLOS DEL MANUAL: alertas automáticas cuando el producto tiene dimensiones diferentes · detectores de partes faltantes · conexiones que sólo entran de una forma (diferentes por color, figura o tamaño).',
      'NIVEL I — EVITAR: previene que el error ocurra. Sensores que impiden que la operación se realice sin las entradas requeridas; sistemas donde no puedes avanzar sin completar la información. Es el nivel MÁS FUERTE: el error simplemente no puede suceder.',
      'NIVEL II — PREVENIR (parar): detecta el error y detiene el proceso ANTES de que se convierta en defecto. Ayudas visuales, sonidos o luces al hacer un mal ensamble; alerta de orden de producción retrasada; sensores de temperatura.',
      'NIVEL III — DETECTAR (avisar): detecta el defecto YA OCURRIDO antes de que pase al cliente. Es el nivel MÁS DÉBIL: el defecto se produjo, sólo se evitó que escapara, y eso cuesta reproceso, desperdicio e inspección.',
      'REGLA DE DISEÑO: siempre intenta subir de nivel. Si tu dispositivo es de nivel III, pregúntate «¿cómo hago para que el defecto no se produzca?» (nivel II) y luego «¿cómo hago para que el error no pueda cometerse?» (nivel I).',
      'TIPOS DE DISPOSITIVO: FÍSICO (forma, color, tamaño o tope que sólo permite una posición) · SECUENCIAL (obliga a seguir el orden de los pasos) · AGRUPAMIENTO (kits o juegos completos: si sobra una pieza, faltó un paso) · INFORMATIVO (aviso, luz, sonido o alerta).',
      'El Poka Yoke suele nacer como Quick Improvement (mejora de sentido común, bajo costo, bajo riesgo) y se documenta después en el Estándar de proceso y en el Plan de control.',
      'Toma foto del ANTES y del DESPUÉS: la evidencia visual es la mejor forma de comunicar el dispositivo y de entrenar a quien llegue nuevo.'
    ],
    blocks: [
      { type:'fields', title:'IDENTIFICACIÓN', cols:4, items:[
        { k:'proceso',   label:'PROCESO / ÁREA', input:'text', w:2,
          ph:'Ej.: línea de ensamble, admisión de pacientes' },
        { k:'producto',  label:'PRODUCTO O SERVICIO', input:'text', ph:'Ej.: tubo PVC 1/2"' },
        { k:'fecha',     label:'FECHA', input:'date' },
        { k:'causaRaiz', label:'CAUSA RAÍZ QUE SE ATACA', input:'text', w:2,
          ph:'Trae la causa raíz ya validada en la fase ANALIZAR' },
        { k:'lider',     label:'LÍDER DEL DISPOSITIVO', input:'text' },
        { k:'costoTotal', label:'COSTO ESTIMADO TOTAL', input:'number', step:'any', unit:'$' }
      ]},

      { type:'html', title:'LOS TRES NIVELES DE UN POKA YOKE (manual p230-231)',
        render: () => tabla(
          ['NIVEL', 'QUÉ HACE', 'EJEMPLOS DEL MANUAL', 'FUERZA'],
          [
            [{ v:'NIVEL I · EVITAR', b:true, tone:'ok' },
             'Previene que el error ocurra: el proceso no permite equivocarse.',
             'Sensores que impiden que la operación se realice sin las entradas requeridas · sistema computarizado que exige completar la información antes de continuar · conector que sólo entra de una forma.',
             { v:'MÁXIMA', tone:'ok' }],
            [{ v:'NIVEL II · PREVENIR', b:true, tone:'warn' },
             'Detecta el error y para el proceso ANTES de que se convierta en defecto.',
             'Sonido al realizar un mal ensamble · luz o ayuda visual · alerta si una orden de producción está retrasada · sensores de temperatura.',
             { v:'MEDIA', tone:'warn' }],
            [{ v:'NIVEL III · DETECTAR', b:true, tone:'bad' },
             'Detecta el DEFECTO ya ocurrido antes de que pase al cliente.',
             'Detector de partes faltantes al final de la línea · alerta automática si el producto tiene dimensiones diferentes · verificación final antes del despacho.',
             { v:'MÍNIMA', tone:'bad' }]
          ]) +
          aviso('Detectar es el nivel MÁS DÉBIL: el defecto ya se produjo y alguien lo va a pagar en reproceso o desperdicio. Cada dispositivo de nivel III es una invitación a rediseñarlo hasta llevarlo a nivel I.', 'warn')
      },

      { type:'grid', key:'rows', title:'DISPOSITIVOS POKA YOKE', min:6, max:120,
        addLabel:'Agregar dispositivo',
        cols:[
          { k:'paso',        label:'PROCESO / PASO', input:'text', w:160,
            help:'¿En qué punto exacto del proceso se comete el error?' },
          { k:'error',       label:'ERROR POTENCIAL', input:'text', w:190,
            help:'El error humano o de método, no el defecto resultante' },
          { k:'tipo',        label:'TIPO DE DISPOSITIVO', input:'select', opts:PY_TIPOS, w:180 },
          { k:'nivel',       label:'NIVEL', input:'select', opts:PY_NIVELES, w:190 },
          { k:'dispositivo', label:'DESCRIPCIÓN DEL DISPOSITIVO', input:'text', w:230 },
          { k:'robustez',    label:'ROBUSTEZ', ro:true, w:170,
            calc:(r) => { const nv = nivelPY(r); return nv ? PY_ROBUSTEZ[nv].t : ''; },
            tone:(v, r) => { const nv = nivelPY(r); return nv ? PY_ROBUSTEZ[nv].tone : ''; } },
          { k:'responsable', label:'RESPONSABLE', input:'text', w:130 },
          { k:'fecha',       label:'FECHA', input:'date', w:135 },
          { k:'estado',      label:'ESTADO', input:'select', opts:PY_ESTADOS, w:150,
            tone:(v) => (v === 'Validado' ? 'ok' : (v === 'Implementado' ? 'ok' :
                        (v === 'Descartado' ? 'bad' : (v ? 'warn' : '')))) },
          { k:'evidencia',   label:'EVIDENCIA (foto, plano, registro)', input:'text', w:180 }
        ],
        foot:[
          { k:'error', calc:(rows) => filled(rows, 'error').length, fmt:'n0' },
          { k:'__label', label:'DISPOSITIVOS' }
        ]
      },

      { type:'cards', title:'CONTEO POR NIVEL', items:(d) => {
        const c = conteoPY(d);
        if (!c.total) return [{ label:'DISPOSITIVOS', value:'0',
          hint:'Registra el paso, el error potencial y el dispositivo que lo evita' }];
        const p1 = pctDe(c.I, c.total), p3 = pctDe(c.III, c.total);
        return [
          { label:'DISPOSITIVOS REGISTRADOS', value: fmt(c.total, 'n0'),
            hint: c.sinNivel ? fmt(c.sinNivel, 'n0') + ' sin nivel asignado' : 'Todos con nivel asignado' },
          { label:'NIVEL I · EVITAR', value: fmt(c.I, 'n0'), tone: c.I ? 'ok' : '',
            hint:'Previene que el error ocurra' },
          { label:'NIVEL II · PREVENIR', value: fmt(c.II, 'n0'), tone: c.II ? 'warn' : '',
            hint:'Detecta el error antes del defecto' },
          { label:'NIVEL III · DETECTAR', value: fmt(c.III, 'n0'), tone: c.III ? 'bad' : '',
            hint:'Detecta el defecto ya ocurrido' },
          { label:'% A PRUEBA DE ERRORES (NIVEL I)', value: isFinite(p1) ? fmt(p1, 'p0') : '—',
            tone: p1 >= 0.5 ? 'ok' : (p1 >= 0.25 ? 'warn' : 'bad'),
            hint:'Meta: que la mayoría de los dispositivos eviten el error' },
          { label:'% SÓLO DETECCIÓN (NIVEL III)', value: isFinite(p3) ? fmt(p3, 'p0') : '—',
            tone: p3 > 0.5 ? 'bad' : (p3 > 0.25 ? 'warn' : 'ok'),
            hint:'Entre más alto, más frágil es la protección' },
          { label:'IMPLEMENTADOS', value: fmt(c.implementados, 'n0') + ' / ' + fmt(c.total, 'n0'),
            tone: c.implementados >= c.total && c.total ? 'ok' : 'warn',
            hint: fmt(c.validados, 'n0') + ' validado(s) · ' + fmt(c.abiertos, 'n0') + ' en curso' }
        ];
      }},

      { type:'chart', kind:'bar', title:'DISPOSITIVOS POR NIVEL', h:280, key:'niveles',
        data:(d) => { const c = conteoPY(d);
          return { labels:['NIVEL I · EVITAR', 'NIVEL II · PREVENIR', 'NIVEL III · DETECTAR'],
                   values:[c.I, c.II, c.III], tones:['ok', 'warn', 'bad'],
                   yLabel:'N.º de dispositivos', fmt:'n0' }; } },

      { type:'note', tone:'warn', text:(d) => {
        const c = conteoPY(d);
        if (!c.total) return '';
        if (c.sinNivel === c.total)
          return 'Asigna el NIVEL (I, II o III) a cada dispositivo: sin el nivel no se puede saber qué tan fuerte es la protección.';
        if (c.III > c.I + c.II)
          return 'ALERTA: predominan los dispositivos de NIVEL III (detectar). Detectar es el nivel más débil, porque el defecto ya se produjo y alguien paga el reproceso. Revisa cada dispositivo de nivel III con el equipo y busca subirlo: primero a NIVEL II (parar el proceso al detectar el error) y, si es posible, a NIVEL I (que el error no pueda cometerse). ' +
                 'Pregunta guía: «¿qué tendría que cambiar en el diseño, la herramienta o la secuencia para que sea imposible equivocarse?».';
        if (c.III > 0 && c.I === 0)
          return 'No hay ningún dispositivo de NIVEL I (evitar). Antes de cerrar la fase MEJORAR, intenta convertir al menos el error más crítico en un dispositivo que impida físicamente la equivocación.';
        return '';
      }},

      { type:'note', tone:'info', text:'Un buen Poka Yoke es barato, simple, práctico y efectivo. Si tu solución necesita presupuesto grande, capacitación extensa y un manual propio, revísala: probablemente estás resolviendo con complejidad algo que el ingenio puede resolver con un tope, un color o un orden obligatorio.' },

      { type:'upload', k:'fotoAntes',   label:'EVIDENCIA — ANTES (foto o bosquejo del error)', h:250 },
      { type:'upload', k:'fotoDespues', label:'EVIDENCIA — DESPUÉS (foto o bosquejo del dispositivo instalado)', h:250 },

      { type:'fields', title:'VALIDACIÓN DEL DISPOSITIVO', cols:3, items:[
        { k:'prueba',     label:'¿CÓMO SE PROBÓ QUE FUNCIONA?', input:'textarea', rows:3, w:2,
          ph:'Prueba piloto, corrida de verificación, intento deliberado de cometer el error…' },
        { k:'resultado',  label:'RESULTADO OBTENIDO', input:'textarea', rows:3,
          ph:'Ej.: 0 defectos en 300 unidades tras la instalación' },
        { k:'estandar',   label:'¿SE INCORPORÓ AL ESTÁNDAR DE TRABAJO?', input:'select',
          opts:['SÍ', 'NO', 'EN TRÁMITE'] },
        { k:'planControl', label:'¿QUEDÓ EN EL PLAN DE CONTROL?', input:'select',
          opts:['SÍ', 'NO', 'EN TRÁMITE'] },
        { k:'aprobado',   label:'APROBADO POR', input:'text' }
      ]},

      { type:'insight' }
    ],
    bi: (d) => {
      const c = conteoPY(d);
      return {
        pokaTotal: c.total,
        pokaNivel1: c.I, pokaNivel2: c.II, pokaNivel3: c.III,
        pokaSinNivel: c.sinNivel,
        pokaImplementados: c.implementados,
        pokaValidados: c.validados,
        pokaAbiertos: c.abiertos,
        pokaPctNivel1: pctDe(c.I, c.total),
        pokaPctNivel3: pctDe(c.III, c.total),
        pokaAlertaNivel3: c.total ? (c.III > c.I + c.II) : null,
        pokaEnEstandar: txt(d.estandar) === 'SÍ',
        pokaEnPlanControl: txt(d.planControl) === 'SÍ'
      };
    }
  };

  /* ======================================================================
     2 · MODELOS DE MEJORA
     Manual p232-233 (mapa gráfico de modelos de mejora)
     ==================================================================== */

  /** Catálogo del manual: técnica · cuándo usarla · desperdicio · resultado */
  const MODELOS = [
    { n:'5S',
      c:'El área está desordenada, se pierde tiempo buscando herramientas, materiales o información, y no se distingue lo normal de lo anormal.',
      w:'Movimientos innecesarios, búsquedas, transporte e inventario oculto.',
      r:'Puesto de trabajo ordenado y limpio, tiempos de búsqueda cerca de cero y base para cualquier otra mejora (sin 5S nada se sostiene).' },
    { n:'SMED',
      c:'El cambio de referencia, de molde o de configuración toma mucho tiempo y por eso se producen lotes grandes.',
      w:'Esperas y sobreproducción por lotes grandes; inventario en proceso.',
      r:'Tiempo de setup reducido (meta: de horas a minutos de un solo dígito), lotes más pequeños y mayor flexibilidad.' },
    { n:'TPM (mantenimiento productivo total)',
      c:'Paros no programados, averías repetidas, equipos que fallan justo cuando más se necesitan.',
      w:'Esperas por avería, defectos por equipo desajustado, reproceso.',
      r:'Mayor disponibilidad y OEE, fallas anticipadas por mantenimiento autónomo y preventivo.' },
    { n:'Kanban',
      c:'Se produce o se pide más de lo que el siguiente paso consume; hay inventario acumulado entre operaciones.',
      w:'Sobreproducción e inventario.',
      r:'Producción halada (pull) según el consumo real, inventario en proceso controlado y visible.' },
    { n:'Flujo continuo',
      c:'El producto o el trámite se detiene entre paso y paso, se acumula en colas y el tiempo de ciclo es mucho mayor que el tiempo de trabajo real.',
      w:'Esperas, transporte, inventario en proceso.',
      r:'Pieza a pieza o caso a caso sin acumulación; lead time mucho más corto y problemas visibles de inmediato.' },
    { n:'Balanceo de línea',
      c:'Una estación va mucho más lenta que las demás (cuello de botella) y el resto espera o se sobrecarga.',
      w:'Esperas y sobrecarga desigual del talento humano.',
      r:'Carga repartida contra el takt time, cuello de botella eliminado y capacidad real de la línea aumentada.' },
    { n:'Trabajo estandarizado',
      c:'Cada persona hace la misma actividad de forma distinta y los resultados cambian de turno en turno.',
      w:'Defectos, reprocesos y variación por método no definido.',
      r:'Un solo método documentado, simple, práctico y visual: resultados consistentes y entrenamiento más rápido.' },
    { n:'Gestión visual',
      c:'El estado del proceso no se ve: hay que preguntar para saber si vamos bien, mal, adelantados o atrasados.',
      w:'Esperas, decisiones tardías y errores por falta de información.',
      r:'Tableros, marcas, colores y andones que hacen visible lo anormal en segundos y disparan la reacción a tiempo.' },
    { n:'DOE (diseño de experimentos)',
      c:'Hay varias variables de entrada (X) que afectan la salida (Y) y no se sabe cuál combinación de parámetros da el mejor resultado.',
      w:'Defectos y variación por parámetros de proceso mal ajustados; ensayo y error costoso.',
      r:'Combinación óptima de factores demostrada con datos, con los efectos principales y las interacciones cuantificados.' },
    { n:'Kaizen',
      c:'Hay una oportunidad acotada que puede resolverse con el equipo del área en pocos días de trabajo enfocado.',
      w:'Todos los desperdicios, según el foco del evento.',
      r:'Mejora rápida implementada por quienes hacen el trabajo, con alto compromiso y resultados visibles en el corto plazo.' }
  ];
  const MODELO_NOMBRES = MODELOS.map(m => m.n).concat(['Otro (descríbelo)']);
  const MODELO_BY_N = {}; MODELOS.forEach(m => { MODELO_BY_N[m.n] = m; });

  const MM_APLICA = ['SÍ, se aplicará', 'POR EVALUAR', 'NO aplica'];
  const MM_ESTADOS = ['No iniciado', 'En curso', 'Implementado', 'Validado', 'Descartado'];

  function conteoMM(d){
    const o = { total:0, si:0, evaluar:0, no:0, enCurso:0, implementados:0, validados:0 };
    arr(d.rows).forEach(r => {
      if (txt(r.modelo) === '' && txt(r.problema) === '') return;
      o.total++;
      const a = txt(r.aplica);
      if (a === MM_APLICA[0]) o.si++;
      else if (a === MM_APLICA[1]) o.evaluar++;
      else if (a === MM_APLICA[2]) o.no++;
      const e = txt(r.estado);
      if (e === 'En curso') o.enCurso++;
      if (e === 'Implementado') o.implementados++;
      if (e === 'Validado'){ o.implementados++; o.validados++; }
    });
    return o;
  }

  const T_MODELOS = {
    id: 'mejorar.modelos_mejora',
    mod: 'MEJORAR',
    extra: true,
    sheet: 'Modelos de mejora (manual)',
    title: 'MODELOS DE MEJORA',
    desc: 'Catálogo de técnicas Lean y Six Sigma del manual con la recomendación de cuándo usar cada una, qué desperdicio ataca y qué resultado esperar; el equipo marca las que aplicará al problema.',
    guide: [
      'El manual (p232) presenta un mapa gráfico de modelos de mejora: son ejemplos de mejoras aplicadas a procesos. Aquí es donde tú y tu equipo deben aplicar el INGENIO: el problema ya está definido y medido y la causa raíz ya está validada; ahora la pregunta es qué hacer para mejorar.',
      'Elige la técnica por el TIPO DE PROBLEMA, no por la moda: si el problema es de orden y búsqueda, es 5S; si es tiempo de cambio, es SMED; si es avería, es TPM; si es exceso de inventario, es Kanban o flujo continuo; si es cuello de botella, es balanceo de línea; si es variación de método, es trabajo estandarizado; si es falta de visibilidad, es gestión visual; si es ajuste de parámetros, es DOE.',
      'Puedes combinar varias técnicas: casi siempre 5S y trabajo estandarizado son la base sobre la que se sostienen las demás.',
      'VALIDACIÓN DE LAS MEJORAS (manual p233): al implementar las mejoras, el equipo del proyecto y la gerencia deben validarlas, probarlas y confirmarlas antes de pasar a la siguiente fase. Para eso se hacen pruebas piloto y estudios de capacidad.',
      'El ejemplo del manual compara la capacidad antes (Ppk = 0,11) con dos pruebas piloto (Ppk = 0,25 y Ppk = 1,77): la mejora significativa es la que subió la capacidad real del proceso a 1,77, cerca de nivel 6 sigma.',
      'Para medir y validar tus pruebas de mejora puedes usar todas las herramientas de MEDIR y ANALIZAR: histogramas, resumen gráfico, series de tiempo, gráficos de caja, pruebas de normalidad, dispersión, análisis de capacidad y pruebas de hipótesis.',
      'Sólo UNA (o pocas) de las mejoras será la MEJORA SIGNIFICATIVA: esa es la que pasa a la fase CONTROLAR y la que se sostiene con el plan de control.',
      'Antes de implementar, recuerda que las acciones deben ser aprobadas por la gerencia (nota del Plan de acción, manual p226).'
    ],
    blocks: [
      { type:'fields', title:'ENCABEZADO', cols:4, items:[
        { k:'proceso',   label:'PROCESO', input:'text', w:2 },
        { k:'causaRaiz', label:'CAUSA RAÍZ VALIDADA', input:'text', w:2,
          ph:'La que se confirmó en la fase ANALIZAR' },
        { k:'lider',     label:'LÍDER DEL EQUIPO', input:'text' },
        { k:'fecha',     label:'FECHA DE LA SELECCIÓN', input:'date' },
        { k:'aprobacion', label:'¿APROBADO POR GERENCIA?', input:'select',
          opts:['SÍ', 'NO', 'PENDIENTE'] },
        { k:'presupuesto', label:'PRESUPUESTO ASIGNADO', input:'number', step:'any', unit:'$' }
      ]},

      { type:'html', title:'CATÁLOGO DE MODELOS DE MEJORA (manual p232)',
        render: () => tabla(
          ['TÉCNICA', 'CUÁNDO USARLA', 'QUÉ DESPERDICIO ATACA', 'RESULTADO ESPERADO'],
          MODELOS.map(m => [{ v:m.n, b:true }, m.c, m.w, m.r])) +
          aviso('Estos son ejemplos de mejoras aplicadas a procesos. El manual no las desarrolla una por una: aquí es donde el equipo debe aplicar el ingenio para mejorar y solucionar el problema.', 'info')
      },

      { type:'grid', key:'rows', title:'SELECCIÓN DEL EQUIPO — ¿CUÁLES APLICAREMOS?', min:6, max:60,
        addLabel:'Agregar modelo',
        cols:[
          { k:'modelo',   label:'TÉCNICA / MODELO', input:'select', opts:MODELO_NOMBRES, w:200 },
          { k:'problema', label:'PROBLEMA O CAUSA QUE ATACA', input:'text', w:220 },
          { k:'desperdicio', label:'DESPERDICIO (del catálogo)', ro:true, w:210,
            calc:(r) => { const m = MODELO_BY_N[txt(r.modelo)]; return m ? m.w : ''; } },
          { k:'aplica',   label:'¿SE APLICARÁ?', input:'select', opts:MM_APLICA, w:150,
            tone:(v) => (v === MM_APLICA[0] ? 'ok' : (v === MM_APLICA[1] ? 'warn' : (v ? '' : ''))) },
          { k:'alcance',  label:'ÁREA O ALCANCE', input:'text', w:150 },
          { k:'responsable', label:'RESPONSABLE', input:'text', w:130 },
          { k:'fechaObj', label:'FECHA OBJETIVO', input:'date', w:135 },
          { k:'estado',   label:'ESTADO', input:'select', opts:MM_ESTADOS, w:145,
            tone:(v) => (v === 'Validado' || v === 'Implementado' ? 'ok' :
                        (v === 'Descartado' ? 'bad' : (v === 'En curso' ? 'warn' : ''))) },
          { k:'resultado', label:'RESULTADO ESPERADO / MÉTRICO', input:'text', w:200 },
          { k:'validacion', label:'CÓMO SE VALIDARÁ', input:'text', w:180,
            help:'Prueba piloto, estudio de capacidad, prueba de hipótesis…' }
        ],
        foot:[
          { k:'modelo', calc:(rows) => filled(rows, 'modelo').length, fmt:'n0' },
          { k:'__label', label:'MODELOS' }
        ]
      },

      { type:'cards', title:'RESUMEN DE LA SELECCIÓN', items:(d) => {
        const c = conteoMM(d);
        if (!c.total) return [{ label:'MODELOS EVALUADOS', value:'0',
          hint:'Marca en la tabla las técnicas que el equipo aplicará' }];
        return [
          { label:'MODELOS EVALUADOS', value: fmt(c.total, 'n0') },
          { label:'SE APLICARÁN', value: fmt(c.si, 'n0'), tone: c.si ? 'ok' : 'warn',
            hint:'Técnicas seleccionadas por el equipo' },
          { label:'POR EVALUAR', value: fmt(c.evaluar, 'n0'), tone: c.evaluar ? 'warn' : '' },
          { label:'EN CURSO', value: fmt(c.enCurso, 'n0'), tone: c.enCurso ? 'warn' : '' },
          { label:'IMPLEMENTADOS', value: fmt(c.implementados, 'n0'),
            tone: (c.si && c.implementados >= c.si) ? 'ok' : 'warn',
            hint: fmt(c.validados, 'n0') + ' validado(s) con datos' },
          { label:'AVANCE DE LA IMPLEMENTACIÓN',
            value: isFinite(pctDe(c.implementados, c.si)) ? fmt(clamp(pctDe(c.implementados, c.si), 0, 1), 'p0') : '—',
            tone: pctDe(c.implementados, c.si) >= 1 ? 'ok' : 'warn',
            hint:'Implementados sobre los que se decidió aplicar' }
        ];
      }},

      { type:'chart', kind:'bar', title:'ESTADO DE LOS MODELOS SELECCIONADOS', h:280, key:'estados',
        data:(d) => {
          const c = {};
          MM_ESTADOS.forEach(e => c[e] = 0);
          arr(d.rows).forEach(r => { const e = txt(r.estado); if (c[e] !== undefined) c[e]++; });
          return { labels: MM_ESTADOS, values: MM_ESTADOS.map(e => c[e]),
                   tones:['', 'warn', 'ok', 'ok', 'bad'], yLabel:'N.º de modelos', fmt:'n0' };
        } },

      { type:'note', tone:'warn', text:(d) => {
        const c = conteoMM(d);
        if (!c.total) return '';
        if (!c.si) return 'Todavía no hay ninguna técnica marcada como «SÍ, se aplicará». Decide con el equipo, con la causa raíz en la mano, cuál o cuáles modelos atacan realmente el problema.';
        const sinVal = arr(d.rows).filter(r => txt(r.aplica) === MM_APLICA[0] && txt(r.validacion) === '').length;
        if (sinVal) return 'Hay ' + fmt(sinVal, 'n0') + ' modelo(s) seleccionados sin definir CÓMO SE VALIDARÁN. El manual exige probar y confirmar cada mejora (prueba piloto, estudio de capacidad, prueba de hipótesis) antes de pasar a CONTROLAR: sin validación no puedes saber cuál fue la mejora significativa.';
        if (txt(d.aprobacion) === 'PENDIENTE' || txt(d.aprobacion) === 'NO')
          return 'Las acciones de mejora deben ser aprobadas por la gerencia antes de implementarse (nota del manual en el Plan de acción).';
        return '';
      }},

      { type:'fields', title:'VALIDACIÓN Y MEJORA SIGNIFICATIVA', cols:3, items:[
        { k:'ppkAntes',   label:'Ppk ANTES', input:'number', step:'any',
          hint:'Capacidad real antes de la mejora' },
        { k:'ppkDespues', label:'Ppk DESPUÉS (prueba piloto)', input:'number', step:'any' },
        { k:'deltaPpk',   label:'MEJORA EN Ppk', ro:true, fmt:'n2',
          calc:(d) => (isNum(d.ppkAntes) && isNum(d.ppkDespues)) ? num(d.ppkDespues) - num(d.ppkAntes) : NaN },
        { k:'mejoraSignificativa', label:'MEJORA SIGNIFICATIVA (la que pasa a CONTROLAR)',
          input:'textarea', rows:3, w:2,
          ph:'Ej.: la prueba piloto 1 es la mejora significativa: la capacidad real subió de 0,11 a 1,77' },
        { k:'evidencia',  label:'EVIDENCIA DE LA VALIDACIÓN', input:'textarea', rows:3,
          ph:'Histograma, resumen gráfico, capacidad, prueba de hipótesis…' }
      ]},

      { type:'insight' }
    ],
    bi: (d) => {
      const c = conteoMM(d);
      const sel = arr(d.rows).filter(r => txt(r.aplica) === MM_APLICA[0]).map(r => txt(r.modelo)).filter(x => x);
      return {
        modelosEvaluados: c.total,
        modelosSeleccionados: c.si,
        modelosPorEvaluar: c.evaluar,
        modelosEnCurso: c.enCurso,
        modelosImplementados: c.implementados,
        modelosValidados: c.validados,
        modelosAvance: clamp(pctDe(c.implementados, c.si), 0, 1),
        modelosLista: sel.join(' · '),
        modelosPpkAntes: isNum(d.ppkAntes) ? num(d.ppkAntes) : NaN,
        modelosPpkDespues: isNum(d.ppkDespues) ? num(d.ppkDespues) : NaN,
        modelosDeltaPpk: (isNum(d.ppkAntes) && isNum(d.ppkDespues)) ? num(d.ppkDespues) - num(d.ppkAntes) : NaN
      };
    }
  };

  /* ======================================================================
     3 · CONTROL ESTADÍSTICO DEL PROCESO (SPC) · GRÁFICOS DE CONTROL
     Manual p240-260
     ==================================================================== */

  const SPC_TIPOS = [
    'Continuo (variable medida: peso, tiempo, longitud…)',
    'Atributo (unidades defectuosas: sí / no, pasa / no pasa)',
    'Conteo de defectos (defectos por unidad, área u hora)'
  ];
  const SPC_MUESTRA = ['Constante', 'Variable'];
  const SPC_CARTAS = ['(usar la recomendación automática)', 'I-MR', 'X̄-R', 'X̄-S', 'P', 'NP', 'C', 'U'];

  const SPC_INFO = {
    'I-MR': { n:'Carta I-MR (individuales y rango móvil)',
      d:'Datos continuos individuales, tamaño de muestra 1. Muestra la serie con sus límites y la línea central, más el rango móvil que mide la variación entre puntos consecutivos.' },
    'X̄-R': { n:'Carta X̄-R (medias y rangos)',
      d:'Datos continuos en subgrupos pequeños (n ≤ 8). La carta X̄ vigila el promedio de cada subgrupo y la carta R la variación DENTRO del subgrupo.' },
    'X̄-S': { n:'Carta X̄-S (medias y desviaciones)',
      d:'Datos continuos en subgrupos grandes (n > 8). Con subgrupos grandes la desviación estándar estima mejor la variación que el rango.' },
    'P':   { n:'Carta P (proporción de defectuosos)',
      d:'Atributos: proporción de unidades defectuosas cuando el tamaño de muestra CAMBIA entre periodos; los límites se ajustan (escalonan) en cada punto.' },
    'NP':  { n:'Carta NP (número de defectuosos)',
      d:'Atributos: número de unidades defectuosas cuando el tamaño de muestra es CONSTANTE (por ejemplo, muestras fijas de 100 unidades).' },
    'C':   { n:'Carta C (defectos por unidad de inspección)',
      d:'Conteos: número de defectos cuando el área o la oportunidad de inspección es CONSTANTE.' },
    'U':   { n:'Carta U (defectos por unidad)',
      d:'Conteos: defectos por unidad (DPU) cuando el área, el número de unidades o el tiempo inspeccionado VARÍA; los límites se ajustan en cada punto.' }
  };

  /** Recomendación automática de la carta según el manual (p243-260) */
  function recomienda(d){
    const tipo = txt(d.tipoDato);
    const n = gnum(d, 'n', 1);
    const cte = txt(d.muestra) !== SPC_MUESTRA[1];       // por defecto, constante
    if (tipo === SPC_TIPOS[1])
      return cte ? { c:'NP', r:'Datos por ATRIBUTOS (unidades defectuosas) con tamaño de muestra CONSTANTE → carta NP.' }
                 : { c:'P',  r:'Datos por ATRIBUTOS (unidades defectuosas) con tamaño de muestra VARIABLE → carta P; los límites se escalonan en cada punto.' };
    if (tipo === SPC_TIPOS[2])
      return cte ? { c:'C', r:'CONTEOS de defectos con área u oportunidad de inspección CONSTANTE → carta C.' }
                 : { c:'U', r:'CONTEOS de defectos con área, unidades o tiempo inspeccionado VARIABLE → carta U (defectos por unidad).' };
    if (tipo === SPC_TIPOS[0]){
      if (n <= 1) return { c:'I-MR', r:'Datos CONTINUOS individuales (n = 1) → carta I-MR (individuales y rango móvil).' };
      if (n <= 8) return { c:'X̄-R', r:'Datos CONTINUOS en subgrupos de n = ' + fmt(n, 'n0') + ' (n ≤ 8) → carta X̄-R (medias y rangos).' };
      return { c:'X̄-S', r:'Datos CONTINUOS en subgrupos de n = ' + fmt(n, 'n0') + ' (n > 8) → carta X̄-S (medias y desviaciones estándar): con subgrupos grandes la desviación estándar estima mejor la variación que el rango.' };
    }
    return { c:'', r:'Selecciona el TIPO DE DATO (continuo, atributo o conteo) y el tamaño del subgrupo para que la app recomiende la carta adecuada.' };
  }
  /** Carta que se está usando: la elegida a mano o la recomendada */
  function cartaActiva(d){
    const sel = txt(d.carta);
    if (sel && sel !== SPC_CARTAS[0]) return sel;
    return recomienda(d).c;
  }
  /** Número de columnas de medición que muestra la grilla de subgrupos */
  const colsSub = d => clamp(Math.round(gnum(d, 'n', 5)), 2, 12);
  /** Valores de un subgrupo (columnas v1 … vK) */
  function subValores(r, K){
    const v = [];
    for (let i = 1; i <= K; i++) if (isNum(r['v' + i])) v.push(num(r['v' + i]));
    return v;
  }
  /** Etiqueta visible de una fila */
  const etiqueta = (r, i) => txt(r && r.muestra) || String(i + 1);

  /* --- cálculo de la carta (memoizado: la grilla lo pide fila por fila) -- */
  let _spcSig = null, _spcRes = null;
  function cartaDe(d){
    const code = cartaActiva(d);
    const rows = arr(d.rows);
    const sig = code + '|' + gnum(d, 'n', 1) + '|' + rows.length + '|' + JSON.stringify(rows);
    if (sig === _spcSig) return _spcRes;
    _spcSig = sig;
    _spcRes = calculaCarta(d, code, rows);
    return _spcRes;
  }
  function calculaCarta(d, code, rows){
    const out = { code: code, nombre: (SPC_INFO[code] || {}).n || '', labels: [], usadas: [], res: null };
    if (!code){ out.error = 'Selecciona el tipo de dato para elegir la carta.'; return out; }
    const K = colsSub(d);
    const usadas = [], labels = [];
    let res = null;

    if (code === 'I-MR'){
      const V = [];
      rows.forEach((r, i) => { if (isNum(r.valor)){ V.push(num(r.valor)); labels.push(etiqueta(r, i)); usadas.push(i); } });
      res = V.length >= 2 ? STATS.cartaIMR(V)
        : { error:'Registra al menos 2 mediciones individuales.' };
    } else if (code === 'X̄-R' || code === 'X̄-S'){
      const G = [];
      rows.forEach((r, i) => { const v = subValores(r, K);
        if (v.length >= 2){ G.push(v); labels.push(etiqueta(r, i)); usadas.push(i); } });
      res = G.length >= 2
        ? (code === 'X̄-R' ? STATS.cartaXbarR(G) : STATS.cartaXbarS(G))
        : { error:'Registra al menos 2 subgrupos con 2 mediciones cada uno.' };
    } else if (code === 'P'){
      const D = [], N = [];
      rows.forEach((r, i) => { if (isNum(r.defectuosos) && num(r.tamano) > 0){
        D.push(num(r.defectuosos)); N.push(num(r.tamano)); labels.push(etiqueta(r, i)); usadas.push(i); } });
      res = D.length >= 2 ? STATS.cartaP(D, N)
        : { error:'Registra el número de defectuosos y el tamaño de muestra de al menos 2 periodos.' };
    } else if (code === 'NP'){
      const D = [], N = [];
      rows.forEach((r, i) => { if (isNum(r.defectuosos)){
        D.push(num(r.defectuosos)); if (num(r.tamano) > 0) N.push(num(r.tamano));
        labels.push(etiqueta(r, i)); usadas.push(i); } });
      const nCte = N.length ? (N.reduce((a, b) => a + b, 0) / N.length) : gnum(d, 'nMuestra', 0);
      res = (D.length >= 2 && nCte > 0) ? STATS.cartaNP(D, nCte)
        : { error:'Registra el número de defectuosos y un tamaño de muestra constante n > 0.' };
    } else if (code === 'C'){
      const C = [];
      rows.forEach((r, i) => { if (isNum(r.defectos)){
        C.push(num(r.defectos)); labels.push(etiqueta(r, i)); usadas.push(i); } });
      res = C.length >= 2 ? STATS.cartaC(C)
        : { error:'Registra el número de defectos de al menos 2 unidades de inspección.' };
    } else if (code === 'U'){
      const C = [], N = [];
      rows.forEach((r, i) => { if (isNum(r.defectos) && num(r.unidades) > 0){
        C.push(num(r.defectos)); N.push(num(r.unidades)); labels.push(etiqueta(r, i)); usadas.push(i); } });
      res = C.length >= 2 ? STATS.cartaU(C, N)
        : { error:'Registra los defectos y el tamaño inspeccionado (unidades, área u horas) de al menos 2 muestras.' };
    }
    out.res = res; out.labels = labels; out.usadas = usadas;
    if (malo(res)) out.error = res && res.error ? res.error : 'Sin datos suficientes.';
    return out;
  }
  /** Carta secundaria (MR, R o S) si la hay */
  function cartaSec(c){
    if (!c || malo(c.res)) return null;
    return c.res.mr || c.res.r || c.res.s || null;
  }
  /** Índice (en la serie usada) que corresponde a la fila i de la grilla */
  function idxDeFila(c, i){
    if (!c) return -1;
    return c.usadas.indexOf(i);
  }

  /* --------------------- límites de especificación --------------------- */
  /** ¿todos los puntos caen dentro de la especificación del cliente? */
  function dentroEspec(d, c){
    const lsl = isNum(d.lsl) ? num(d.lsl) : null, usl = isNum(d.usl) ? num(d.usl) : null;
    if (lsl === null && usl === null) return null;
    if (!c || malo(c.res) || !arr(c.res.puntos).length) return null;
    let ok = true;
    c.res.puntos.forEach(v => {
      if (lsl !== null && v < lsl) ok = false;
      if (usl !== null && v > usl) ok = false;
    });
    return ok;
  }
  const ESCENARIOS = [
    { k:'EN CONTROL Y EN ESPECIFICACIÓN',
      q:'El proceso es ESTABLE (sólo actúa causa común) y además su variación cabe dentro de lo que pide el cliente. Es el estado ideal.',
      a:'MANTENER: no ajustes nada. Estandariza el método (trabajo estándar), sostén el plan de control y sigue monitoreando con la misma frecuencia. Cualquier ajuste sin señal sólo agrega variación.' },
    { k:'EN CONTROL PERO FUERA DE ESPECIFICACIÓN',
      q:'El proceso es predecible, pero su variación NATURAL no cabe dentro de las especificaciones: el problema es de CAUSA COMÚN, es decir, del diseño del proceso.',
      a:'NO ajustes punto por punto (empeorarías la variación). Hay que MEJORAR el proceso: centrar la media o reducir la variación (regresa a MEJORAR con DOE, Poka Yoke, estandarización) o renegociar la especificación con el cliente si es técnicamente inalcanzable.' },
    { k:'FUERA DE CONTROL PERO EN ESPECIFICACIÓN',
      q:'Hoy el producto cumple, pero el proceso NO es predecible: hay CAUSAS ESPECIALES actuando y en cualquier momento producirá fuera de especificación.',
      a:'Identifica y elimina la causa especial de CADA punto señalado (usa el plan de reacción y registra qué pasó). No calcules capacidad ni prometas desempeño mientras el proceso no sea estable.' },
    { k:'FUERA DE CONTROL Y FUERA DE ESPECIFICACIÓN',
      q:'El peor escenario: el proceso es inestable y además incumple al cliente.',
      a:'CONTENCIÓN inmediata (inspección 100 %, segregar lo producido, avisar al cliente si aplica); elimina primero las causas especiales para estabilizar y sólo entonces trabaja la capacidad del proceso.' }
  ];
  /** Escenario 0-3 según estabilidad y especificación */
  function escenarioDe(estable, dentro){
    if (dentro === null || estable === null) return -1;
    if (estable && dentro) return 0;
    if (estable && !dentro) return 1;
    if (!estable && dentro) return 2;
    return 3;
  }

  const T_SPC = {
    id: 'controlar.graficos_control',
    mod: 'CONTROLAR',
    extra: true,
    sheet: 'Gráficos de control (manual)',
    title: 'CONTROL ESTADÍSTICO DEL PROCESO (SPC) — GRÁFICOS DE CONTROL',
    desc: 'Monitorea la característica ya mejorada con la carta de control adecuada: la app recomienda la carta según el tipo de dato, calcula LC, LSC y LIC con las constantes AIAG y evalúa las 8 reglas de Nelson.',
    guide: [
      'QUÉ ES (manual p241): el control estadístico del proceso es la herramienta para monitorear y mejorar el proceso con métodos estadísticos. Se compara el desempeño del proceso contra los límites de control para controlar la variación y tomar acciones cuando sea necesario.',
      'GRÁFICO DE CONTROL: herramienta estadística que muestra el comportamiento del proceso en una característica de calidad durante un periodo de tiempo. Sus parámetros son el LÍMITE SUPERIOR DE CONTROL (LSC), la LÍNEA CENTRAL (LC, el promedio) y el LÍMITE INFERIOR DE CONTROL (LIC).',
      'CAUSAS COMUNES: variabilidad aleatoria o natural del proceso → el proceso se toma como ESTABLE, en control. CAUSAS ESPECIALES: variabilidad no natural, que sí es posible identificar → el proceso se toma como NO ESTABLE, fuera de control.',
      'METODOLOGÍA (manual p243): selecciona la característica de calidad (normalmente la que mejoraste) · define el plan de muestreo y recolección · recolecta los datos · elige el gráfico de control adecuado según el tipo de dato · calcula los límites y grafica · analiza e interpreta el estado del proceso · realiza acciones y ajustes si es necesario y vuelve a analizar hasta tener control estadístico.',
      'TAMAÑO DE MUESTRA (manual p243): variables entre 5 y 10 (más datos si se puede) · atributos 30 o más datos. FRECUENCIA: muestrea 10 veces más seguido de lo que el proceso se sale de control. Guíate con el Plan de control de la fase MEDIR.',
      'SELECCIÓN DE LA CARTA: continuos individuales (n = 1) → I-MR · continuos con subgrupos n ≤ 8 → X̄-R · continuos con subgrupos n > 8 → X̄-S · atributos con proporción y n variable → P · atributos con n constante → NP · conteos con área constante → C · conteos con área variable → U.',
      'LÍMITES DE CONTROL = VOZ DEL PROCESO: los establece la empresa a partir de los propios datos (±3σ) para controlar y mantener estable el proceso. LÍMITES DE ESPECIFICACIÓN = VOZ DEL CLIENTE: los define el cliente (rendimiento deseado). NUNCA se dibujan las especificaciones sobre una carta de control ni se calculan los límites de control a partir de las especificaciones.',
      'Ejemplo del manual (p242): el cliente acepta que la pieza tenga una dimensión externa entre 10,5 cm y 11,5 cm (especificación), mientras que el proceso se encuentra en control entre 10,8 cm y 11,2 cm (control).',
      'PROPÓSITO DEL SPC (manual p242): monitorear y controlar el proceso · analizar los efectos en el tiempo de los cambios de materiales, mano de obra o ajustes · determinar si se cumple con las especificaciones del cliente · medir el proceso y tomar las acciones requeridas para mantener la calidad.',
      'Las 8 REGLAS DE NELSON detectan patrones que delatan causas especiales aunque ningún punto se salga de los límites: rachas, tendencias, ciclos, mezclas y variación sospechosamente baja.',
      'Primero se estabiliza (carta de control) y después se mide la capacidad (Cp, Cpk, Pp, Ppk): calcular capacidad sobre un proceso inestable da un número que no significa nada porque el proceso no es predecible.',
      'Cuando la carta señale, actúa con el PLAN DE REACCIÓN: quién hace qué, en cuánto tiempo, a quién escala y dónde queda el registro.'
    ],
    blocks: [
      { type:'fields', title:'CARACTERÍSTICA Y PLAN DE MUESTREO', cols:4, items:[
        { k:'proceso',   label:'PROCESO', input:'text', w:2,
          ph:'Ej.: envasado de producto A' },
        { k:'caracteristica', label:'CARACTERÍSTICA DE CALIDAD (la ya mejorada)', input:'text', w:2,
          ph:'Ej.: peso del producto A (kg), servicios no realizados a tiempo' },
        { k:'tipoDato',  label:'TIPO DE DATO', input:'select', opts:SPC_TIPOS, w:2 },
        { k:'n',         label:'TAMAÑO DEL SUBGRUPO (n)', input:'number', step:1, ph:'1',
          hint:'1 = dato individual · 2 a 8 = X̄-R · más de 8 = X̄-S' },
        { k:'muestra',   label:'TAMAÑO DE MUESTRA', input:'select', opts:SPC_MUESTRA,
          hint:'Sólo para atributos y conteos' },
        { k:'unidad',    label:'UNIDAD', input:'text', ph:'kg · min · %' },
        { k:'frecuencia', label:'FRECUENCIA DE MUESTREO', input:'text', w:2,
          ph:'10 veces más seguido de lo que el proceso se sale de control' },
        { k:'responsable', label:'RESPONSABLE DEL MONITOREO', input:'text' },
        { k:'carta',     label:'CARTA A UTILIZAR', input:'select', opts:SPC_CARTAS, w:2,
          hint:'Déjalo en automático para usar la recomendación del manual' },
        { k:'lsl',       label:'LSL (especificación inferior)', input:'number', step:'any',
          hint:'Voz del cliente · opcional' },
        { k:'usl',       label:'USL (especificación superior)', input:'number', step:'any',
          hint:'Voz del cliente · opcional' },
        { k:'fecha',     label:'FECHA DE INICIO DEL MONITOREO', input:'date' },
        { k:'nMuestra',  label:'n CONSTANTE (para la carta NP)', input:'number', step:1,
          hint:'Sólo si no llenas la columna de tamaño de muestra' }
      ]},

      { type:'cards', title:'CARTA RECOMENDADA', items:(d) => {
        const rec = recomienda(d), act = cartaActiva(d);
        const info = SPC_INFO[act] || {};
        const manual = txt(d.carta) && txt(d.carta) !== SPC_CARTAS[0];
        return [
          { label:'CARTA RECOMENDADA POR EL MANUAL', value: rec.c || '—',
            tone: rec.c ? 'ok' : 'warn', hint: rec.r },
          { label:'CARTA EN USO', value: act || '—',
            tone: (!act ? 'warn' : (manual && act !== rec.c ? 'warn' : 'ok')),
            hint: manual ? (act === rec.c ? 'Selección manual, coincide con la recomendación'
                                          : 'Selección MANUAL distinta de la recomendada: justifícala con el equipo')
                         : 'Selección automática' },
          { label:'QUÉ VIGILA', value: info.n || '—', hint: info.d || '' }
        ];
      }},

      { type:'html', title:'CÓMO SE ELIGE LA CARTA (manual p244-260)',
        render: () => tabla(
          ['TIPO DE DATO', 'CONDICIÓN', 'CARTA', 'QUÉ MUESTRA'],
          [
            ['Continuo (variable medida)', 'Datos individuales, n = 1', { v:'I-MR', b:true },
             'Serie de los valores individuales con LC y límites, más el rango móvil (variación entre puntos consecutivos).'],
            ['Continuo (variable medida)', 'Subgrupos con n ≤ 8', { v:'X̄-R', b:true },
             'Promedio de cada subgrupo (X̄) y rango del subgrupo (R): variación entre subgrupos y dentro del subgrupo.'],
            ['Continuo (variable medida)', 'Subgrupos con n > 8', { v:'X̄-S', b:true },
             'Promedio de cada subgrupo (X̄) y desviación estándar del subgrupo (S), más precisa que el rango con n grande.'],
            ['Atributo (defectuosos)', 'Proporción, tamaño de muestra VARIABLE', { v:'P', b:true },
             'Proporción de unidades defectuosas por periodo; los límites se escalonan porque n cambia.'],
            ['Atributo (defectuosos)', 'Tamaño de muestra CONSTANTE', { v:'NP', b:true },
             'Número de unidades defectuosas por muestra de tamaño fijo (por ejemplo, 100 unidades).'],
            ['Conteo de defectos', 'Área u oportunidad CONSTANTE', { v:'C', b:true },
             'Número de defectos por unidad de inspección.'],
            ['Conteo de defectos', 'Área u oportunidad VARIABLE', { v:'U', b:true },
             'Defectos por unidad (DPU); los límites se ajustan según el tamaño inspeccionado.']
          ]) +
          aviso('Tamaño de muestra sugerido por el manual: variables entre 5 y 10 datos (más si se puede) y atributos 30 o más datos. Frecuencia: muestrea 10 veces más seguido de lo que el proceso se sale de control.', 'info')
      },

      { type:'grid', key:'rows', title:'DATOS RECOLECTADOS', min:15, max:400,
        addLabel:'Agregar muestra',
        cols:(d) => {
          const code = cartaActiva(d);
          const base = [{ k:'muestra', label:'MUESTRA / FECHA', input:'text', w:140,
                          help:'Etiqueta del punto: número de muestra, día, turno…' }];
          if (code === 'I-MR' || !code)
            return base.concat([
              { k:'valor', label:'VALOR MEDIDO', input:'number', step:'any', w:150, align:'right' },
              { k:'mr', label:'RANGO MÓVIL', ro:true, fmt:'n3', w:130,
                calc:(r, i, rows) => (i > 0 && isNum(r.valor) && isNum(rows[i - 1].valor))
                  ? Math.abs(num(r.valor) - num(rows[i - 1].valor)) : NaN },
              { k:'estado', label:'ESTADO', ro:true, w:170,
                calc:(r, i, rows, dd) => estadoPunto(dd, i),
                tone:(v) => (v === 'EN CONTROL' ? 'ok' : (v ? 'bad' : '')) },
              { k:'nota', label:'OBSERVACIÓN / CAUSA ESPECIAL', input:'text', w:200 }
            ]);
          if (code === 'X̄-R' || code === 'X̄-S'){
            const K = colsSub(d), cs = base.slice();
            for (let i = 1; i <= K; i++)
              cs.push({ k:'v' + i, label:'X' + i, input:'number', step:'any', w:88, align:'right' });
            cs.push({ k:'media', label:'MEDIA X̄', ro:true, fmt:'n3', w:110,
              calc:(r, i, rows, dd) => { const v = subValores(r, colsSub(dd));
                return v.length ? v.reduce((a, b) => a + b, 0) / v.length : NaN; } });
            cs.push(code === 'X̄-R'
              ? { k:'rango', label:'RANGO R', ro:true, fmt:'n3', w:100,
                  calc:(r, i, rows, dd) => { const v = subValores(r, colsSub(dd));
                    return v.length >= 2 ? Math.max.apply(null, v) - Math.min.apply(null, v) : NaN; } }
              : { k:'desv', label:'DESV. S', ro:true, fmt:'n4', w:100,
                  calc:(r, i, rows, dd) => { const v = subValores(r, colsSub(dd));
                    return v.length >= 2 ? stdev(v) : NaN; } });
            cs.push({ k:'estado', label:'ESTADO', ro:true, w:170,
              calc:(r, i, rows, dd) => estadoPunto(dd, i),
              tone:(v) => (v === 'EN CONTROL' ? 'ok' : (v ? 'bad' : '')) });
            cs.push({ k:'nota', label:'OBSERVACIÓN / CAUSA ESPECIAL', input:'text', w:180 });
            return cs;
          }
          if (code === 'P' || code === 'NP')
            return base.concat([
              { k:'defectuosos', label:'UNIDADES DEFECTUOSAS', input:'number', step:1, w:150, align:'right' },
              { k:'tamano', label:'TAMAÑO DE MUESTRA (n)', input:'number', step:1, w:150, align:'right' },
              { k:'p', label:'PROPORCIÓN p', ro:true, fmt:'p2', w:120,
                calc:(r) => (num(r.tamano) > 0 ? num(r.defectuosos) / num(r.tamano) : NaN) },
              { k:'estado', label:'ESTADO', ro:true, w:170,
                calc:(r, i, rows, dd) => estadoPunto(dd, i),
                tone:(v) => (v === 'EN CONTROL' ? 'ok' : (v ? 'bad' : '')) },
              { k:'nota', label:'OBSERVACIÓN / CAUSA ESPECIAL', input:'text', w:200 }
            ]);
          return base.concat([
            { k:'defectos', label:'N.º DE DEFECTOS', input:'number', step:1, w:140, align:'right' },
            { k:'unidades', label:'UNIDADES / ÁREA INSPECCIONADA', input:'number', step:'any', w:170, align:'right',
              help:'Sólo para la carta U; en la carta C el área es constante' },
            { k:'u', label:'DPU (defectos por unidad)', ro:true, fmt:'n3', w:150,
              calc:(r) => (num(r.unidades) > 0 ? num(r.defectos) / num(r.unidades) : NaN) },
            { k:'estado', label:'ESTADO', ro:true, w:170,
              calc:(r, i, rows, dd) => estadoPunto(dd, i),
              tone:(v) => (v === 'EN CONTROL' ? 'ok' : (v ? 'bad' : '')) },
            { k:'nota', label:'OBSERVACIÓN / CAUSA ESPECIAL', input:'text', w:200 }
          ]);
        }
      },

      { type:'note', tone:'warn', text:(d) => {
        const c = cartaDe(d);
        if (c.error) return c.error;
        const n = c.res.n || 0;
        if (n < 15) return 'Sólo hay ' + fmt(n, 'n0') + ' punto(s). Con tan pocos datos los límites de control son inestables: el manual pide entre 5 y 10 datos por subgrupo para variables y 30 o más datos para atributos. Recolecta más antes de concluir.';
        return '';
      }},

      { type:'cards', title:'LÍMITES Y VEREDICTO', items:(d) => {
        const c = cartaDe(d);
        if (c.error) return [{ label:'CARTA DE CONTROL', value:'—', hint:c.error }];
        const r = c.res, u = txt(d.unidad);
        const est = r.estable;
        return [
          { label:'CARTA', value: c.code, hint: c.nombre },
          { label:'PUNTOS ANALIZADOS', value: fmt(r.n, 'n0'),
            hint: r.subgrupo ? 'Subgrupos de n = ' + fmt(r.subgrupo, 'n0') : 'Puntos de la serie' },
          { label:'LC (línea central)', value: nf(r.cl, 'n3') + (u ? ' ' + u : ''),
            hint:'Promedio del proceso' },
          { label:'LSC (límite superior)', value: nf(r.ucl, 'n3'),
            hint: r.limitesVariables ? 'Promedio: los límites se escalonan porque n cambia' : 'LC + 3σ' },
          { label:'LIC (límite inferior)', value: nf(r.lcl, 'n3'),
            hint: r.limitesVariables ? 'Promedio: los límites se escalonan porque n cambia' : 'LC − 3σ' },
          { label:'σ DEL PROCESO (estimada)', value: nf(r.sigma, 'n4'),
            hint:'Calculada con las constantes AIAG (d₂, c₄, A₂, A₃)' },
          { label:'PUNTOS FUERA DE CONTROL', value: fmt(arr(r.fueraDeControl).length, 'n0'),
            tone: arr(r.fueraDeControl).length ? 'bad' : 'ok',
            hint: arr(r.reglasActivas).length ? 'Reglas de Nelson activas: ' + r.reglasActivas.join(', ') : 'Ninguna regla de Nelson activa' },
          { label:'VEREDICTO', value: est ? 'PROCESO ESTABLE' : 'PROCESO INESTABLE',
            tone: est ? 'ok' : 'bad',
            hint: est ? 'Sólo actúa causa común: el proceso es predecible'
                      : 'Hay causas especiales: identifícalas y elimínalas' }
        ];
      }},

      { type:'chart', kind:'control', key:'carta', title:'CARTA DE CONTROL', h:360,
        data:(d) => {
          const c = cartaDe(d);
          if (c.error) return {};
          const r = c.res;
          return { labels: c.labels, values: r.puntos, cl: r.cl, ucl: r.ucl, lcl: r.lcl,
                   kind: c.code.indexOf('X̄') === 0 ? 'X' : c.code,
                   yLabel: txt(d.caracteristica) || 'Valor', unit: txt(d.unidad),
                   title: c.nombre };
        } },

      { type:'chart', kind:'control', key:'carta2', title:'CARTA DE VARIACIÓN (MR, R o S)', h:300,
        data:(d) => {
          const c = cartaDe(d), s = cartaSec(c);
          if (!s) return {};
          return { labels: c.labels.slice(c.labels.length - s.puntos.length),
                   values: s.puntos, cl: s.cl, ucl: s.ucl, lcl: s.lcl, kind:'R',
                   yLabel: s.tipo === 'MR' ? 'Rango móvil' : (s.tipo === 'S' ? 'Desviación estándar' : 'Rango'),
                   title: s.carta };
        } },

      { type:'note', tone:'info', text:(d) => {
        const c = cartaDe(d), s = cartaSec(c);
        if (!s) return '';
        return s.estable
          ? 'La carta de variación (' + s.carta + ') está ESTABLE: la variación dentro de los subgrupos (o entre puntos consecutivos) es consistente. Recuerda que primero se estabiliza la variación y después el promedio.'
          : 'ATENCIÓN: la carta de variación (' + s.carta + ') muestra señales. La variación del proceso NO es estable, así que los límites de la carta de promedios no son confiables todavía: estabiliza primero la variación.';
      }},

      { type:'html', title:'LAS 8 REGLAS DE NELSON', render:(d) => {
        const c = cartaDe(d);
        const reglas = (!c.error && c.res.reglas) ? c.res.reglas : {};
        const cuerpo = [];
        for (let r = 1; r <= 8; r++){
          const n = num(reglas['n' + r]);
          cuerpo.push([
            { v:'REGLA ' + r, b:true, tone: n ? 'bad' : '' },
            STATS.NELSON[r],
            EXPLICA_NELSON[r],
            { v: n ? fmt(n, 'n0') + ' punto(s)' : '—', n:true, tone: n ? 'bad' : 'ok' }
          ]);
        }
        return tabla(['REGLA', 'QUÉ DETECTA', 'QUÉ SIGNIFICA EN EL PROCESO', 'PUNTOS SEÑALADOS'], cuerpo) +
          (c.error ? aviso(c.error, 'warn')
                   : (arr(c.res.reglasActivas).length
                      ? aviso('Reglas activas: ' + c.res.reglasActivas.join(', ') + '. ' + c.res.interpretacion, 'bad')
                      : aviso(c.res.interpretacion, 'ok')));
      }},

      { type:'html', title:'PUNTOS SEÑALADOS', render:(d) => {
        const c = cartaDe(d);
        if (c.error) return aviso(c.error, 'warn');
        const fc = arr(c.res.fueraDeControl);
        if (!fc.length) return aviso('Ningún punto está fuera de control: los ' + fmt(c.res.n, 'n0') +
          ' puntos caen dentro de los límites y no se detecta ningún patrón de las 8 reglas de Nelson.', 'ok');
        const rows = arr(d.rows);
        const cuerpo = fc.map(j => {
          const fila = rows[c.usadas[j]] || {};
          const rr = arr(c.res.violaciones[j]);
          return [
            { v: c.labels[j] || (j + 1), b:true },
            { v: nf(c.res.puntos[j], 'n3'), n:true },
            { v: rr.join(', '), tone:'bad' },
            rr.map(x => STATS.NELSON[x]).join(' · '),
            txt(fila.nota) || '— registra aquí la causa especial encontrada —'
          ];
        });
        return tabla(['MUESTRA', 'VALOR', 'REGLA(S)', 'PATRÓN DETECTADO', 'CAUSA ESPECIAL / ACCIÓN'], cuerpo) +
          aviso('Cada punto señalado exige investigar QUÉ CAMBIÓ (material, mano de obra, método, máquina, medición, medio ambiente), eliminar la causa, registrar la acción y volver a analizar hasta tener control estadístico.', 'warn');
      }},

      { type:'html', title:'LÍMITES DE CONTROL (VOZ DEL PROCESO) vs LÍMITES DE ESPECIFICACIÓN (VOZ DEL CLIENTE)',
        render:(d) => {
          const c = cartaDe(d);
          const estable = c.error ? null : c.res.estable;
          const dentro = dentroEspec(d, c);
          const esc = escenarioDe(estable, dentro);
          let h = tabla(
            ['', 'LÍMITES DE CONTROL', 'LÍMITES DE ESPECIFICACIÓN'],
            [
              [{ v:'¿QUIÉN LOS DEFINE?', b:true }, 'La empresa, a partir del propio proceso (±3σ de los datos).',
               'El cliente: es el rendimiento deseado, lo que acepta recibir.'],
              [{ v:'¿QUÉ RESPONDEN?', b:true }, '¿El proceso es ESTABLE y predecible? (voz del proceso)',
               '¿El producto CUMPLE lo pactado? (voz del cliente)'],
              [{ v:'EJEMPLO DEL MANUAL', b:true }, 'La dimensión externa de la pieza se encuentra en control entre 10,8 cm y 11,2 cm.',
               'El cliente acepta que la pieza tenga una dimensión externa entre 10,5 cm y 11,5 cm.'],
              [{ v:'DÓNDE SE USAN', b:true }, 'En la carta de control, para decidir si se actúa o no sobre el proceso.',
               'En el análisis de capacidad (Cp, Cpk, Pp, Ppk) y en la liberación del producto.'],
              [{ v:'ERROR FRECUENTE', b:true }, 'Dibujar la especificación sobre la carta o calcular los límites de control a partir de la especificación: son cosas distintas y hacerlo oculta las señales del proceso.',
               'Creer que si el producto cumple la especificación el proceso está bajo control: puede cumplir hoy y ser completamente impredecible.']
            ]);
          h += tabla(
            ['ESCENARIO', 'QUÉ SIGNIFICA', 'QUÉ HACER'],
            ESCENARIOS.map((e, i) => [
              { v:(i + 1) + ' · ' + e.k, b:true, tone: (esc === i ? (i === 0 ? 'ok' : 'bad') : '') },
              e.q, e.a
            ]));
          if (esc >= 0)
            h += aviso('ESCENARIO ACTUAL DE ESTE PROCESO: ' + (esc + 1) + ' · ' + ESCENARIOS[esc].k + '. ' +
                       ESCENARIOS[esc].a, esc === 0 ? 'ok' : 'bad');
          else if (!c.error && estable !== null)
            h += aviso('Escribe el LSL y el USL (límites de especificación del cliente) para saber en cuál de los cuatro escenarios está el proceso. Por ahora sólo se puede decir que el proceso está ' +
                       (estable ? 'EN CONTROL (estable).' : 'FUERA DE CONTROL (inestable).'), estable ? 'ok' : 'warn');
          return h;
        }
      },

      { type:'cards', title:'VEREDICTO Y DECISIÓN', items:(d) => {
        const c = cartaDe(d);
        if (c.error) return [{ label:'VEREDICTO', value:'—', hint:c.error }];
        const r = c.res, dentro = dentroEspec(d, c);
        const esc = escenarioDe(r.estable, dentro);
        return [
          { label:'ESTADO DEL PROCESO', value: r.estable ? 'ESTABLE (en control)' : 'INESTABLE (fuera de control)',
            tone: r.estable ? 'ok' : 'bad',
            hint: r.estable ? 'Sólo actúa causa común: ya puedes medir capacidad'
                            : 'Actúan causas especiales: elimínalas antes de medir capacidad' },
          { label:'¿CUMPLE LA ESPECIFICACIÓN?',
            value: dentro === null ? '—' : (dentro ? 'SÍ, todos los puntos dentro' : 'NO, hay puntos fuera'),
            tone: dentro === null ? '' : (dentro ? 'ok' : 'bad'),
            hint: dentro === null ? 'Escribe LSL y/o USL para evaluarlo' : 'Comparación contra la voz del cliente' },
          { label:'ESCENARIO', value: esc >= 0 ? (esc + 1) + ' · ' + ESCENARIOS[esc].k : '—',
            tone: esc === 0 ? 'ok' : (esc > 0 ? 'bad' : ''),
            hint: esc >= 0 ? ESCENARIOS[esc].q : '' },
          { label:'QUÉ HACER AHORA', value: r.estable ? 'MANTENER Y MONITOREAR' : 'INVESTIGAR CAUSAS ESPECIALES',
            tone: r.estable ? 'ok' : 'bad',
            hint: esc >= 0 ? ESCENARIOS[esc].a
                           : (r.estable ? 'Estandariza el método y sostén el plan de control.'
                                        : 'Aplica el plan de reacción en cada punto señalado y vuelve a analizar.') }
        ];
      }},

      { type:'fields', title:'CONCLUSIÓN DEL MONITOREO', cols:3, items:[
        { k:'conclusion', label:'INTERPRETACIÓN DEL EQUIPO', input:'textarea', rows:4, w:2,
          ph:'Ej.: el proceso está estable entre la media de 30,98 kg y dentro de los límites; ningún punto por fuera' },
        { k:'acciones',   label:'ACCIONES Y AJUSTES REALIZADOS', input:'textarea', rows:4,
          ph:'Qué se investigó, qué se ajustó y con qué resultado' },
        { k:'frecuenciaRev', label:'FRECUENCIA DE REVISIÓN DE LA CARTA', input:'text',
          ph:'Diaria, por turno, semanal…' },
        { k:'recalculo',  label:'¿CUÁNDO SE RECALCULAN LOS LÍMITES?', input:'text', w:2,
          ph:'Sólo tras un cambio comprobado del proceso, nunca para «acomodar» los puntos' }
      ]},

      { type:'insight' }
    ],
    bi: (d) => {
      const c = cartaDe(d);
      if (c.error) return { spcCarta: c.code || '', spcEstable: null, spcError: c.error };
      const r = c.res, dentro = dentroEspec(d, c), esc = escenarioDe(r.estable, dentro);
      return {
        spcCarta: c.code,
        spcCartaNombre: c.nombre,
        spcPuntos: r.n,
        spcLC: r.cl, spcLSC: r.ucl, spcLIC: r.lcl, spcSigma: r.sigma,
        spcFueraControl: arr(r.fueraDeControl).length,
        spcReglasActivas: arr(r.reglasActivas).join(', '),
        spcEstable: !!r.estable,
        spcDentroEspec: dentro,
        spcEscenario: esc >= 0 ? (esc + 1) : NaN,
        spcEscenarioTexto: esc >= 0 ? ESCENARIOS[esc].k : '',
        spcSubgrupo: r.subgrupo || gnum(d, 'n', 1)
      };
    }
  };

  /** Explicación práctica de cada regla de Nelson (qué significa en el proceso) */
  const EXPLICA_NELSON = {
    1: 'Algo ocurrió justo en ese momento: cambio de material, de operario, de ajuste o error de medición. Es la señal más evidente de causa especial.',
    2: 'El proceso se corrió: la media ya no es la de la línea central. Suele venir de un cambio de lote, de herramienta, de método o de turno.',
    3: 'Hay una TENDENCIA: desgaste de herramienta, saturación, fatiga, calentamiento o deriva del instrumento. Va a salirse de los límites si no se actúa.',
    4: 'Comportamiento serrucho: normalmente son dos fuentes que se alternan (dos máquinas, dos operarios, dos proveedores) o un sobreajuste del operador.',
    5: 'Corrimiento moderado de la media. Es una alerta temprana: el proceso ya se desplazó aunque todavía no salga de los límites.',
    6: 'Corrimiento pequeño pero sostenido de la media. Confirma que el centro del proceso cambió.',
    7: 'Variación demasiado baja para ser real: límites mal calculados, datos redondeados o «maquillados», o subgrupos mal formados (estratificación).',
    8: 'Mezcla de poblaciones: los datos vienen de dos fuentes distintas (dos líneas, dos turnos, dos proveedores) que no debieron combinarse en la misma carta.'
  };

  /** Estado del punto de la fila `i` de la grilla (columna calculada) */
  function estadoPunto(d, i){
    const c = cartaDe(d);
    if (c.error) return '';
    const j = idxDeFila(c, i);
    if (j < 0) return '';
    const v = arr(c.res.violaciones[j]);
    return v.length ? ('FUERA · regla ' + v.join(', ')) : 'EN CONTROL';
  }

  /* ======================================================================
     4 · PLAN DE REACCIÓN
     Complementa el Plan de control (manual, fase CONTROLAR)
     ==================================================================== */

  const PR_FUENTES = ['Carta de control', 'Indicador / KPI', 'Inspección o verificación',
                      'Alarma del equipo', 'Queja del cliente', 'Auditoría'];
  const PR_UNIDADES = ['minutos', 'horas', 'días'];
  const PR_ESTADOS = ['Vigente', 'Por validar', 'En revisión', 'Obsoleto'];
  const PR_HORAS = { minutos: 1 / 60, horas: 1, 'días': 24 };

  /** Tiempo de respuesta convertido a horas */
  function horasDe(r){
    if (!isNum(r && r.tiempo)) return NaN;
    const u = txt(r.unidadT) || 'horas';
    const f = PR_HORAS[u];
    return isFinite(f) ? num(r.tiempo) * f : num(r.tiempo);
  }
  /** ¿la regla de reacción está completa? */
  const CAMPOS_PR = ['indicador', 'condicion', 'accion', 'responsable', 'escalamiento', 'registro'];
  function completaPR(r){
    if (!r) return false;
    if (!CAMPOS_PR.every(k => txt(r[k]) !== '')) return false;
    return isNum(r.tiempo) && num(r.tiempo) > 0;
  }
  function conteoPR(d){
    const rows = arr(d.rows).filter(r => txt(r.indicador) !== '' || txt(r.condicion) !== '');
    const o = { total: rows.length, completas:0, sinResponsable:0, sinTiempo:0,
                sinEscalamiento:0, sinRegistro:0, vigentes:0, horas:[] };
    rows.forEach(r => {
      if (completaPR(r)) o.completas++;
      if (txt(r.responsable) === '') o.sinResponsable++;
      if (!isNum(r.tiempo) || num(r.tiempo) <= 0) o.sinTiempo++;
      if (txt(r.escalamiento) === '') o.sinEscalamiento++;
      if (txt(r.registro) === '') o.sinRegistro++;
      if (txt(r.estado) === 'Vigente') o.vigentes++;
      const h = horasDe(r); if (isFinite(h)) o.horas.push(h);
    });
    o.horaMedia = o.horas.length ? o.horas.reduce((a, b) => a + b, 0) / o.horas.length : NaN;
    o.horaMax = o.horas.length ? Math.max.apply(null, o.horas) : NaN;
    o.completitud = pctDe(o.completas, o.total);
    return o;
  }

  const T_PLAN_REACCION = {
    id: 'controlar.plan_reaccion',
    mod: 'CONTROLAR',
    extra: true,
    sheet: 'Plan de reacción (manual)',
    title: 'PLAN DE REACCIÓN',
    desc: 'Define por anticipado qué hacer cuando el indicador o la carta de control se salen de control: condición de disparo, acción inmediata, responsable, tiempo de respuesta, escalamiento y registro.',
    guide: [
      'El plan de reacción es el complemento del PLAN DE CONTROL: el plan de control dice QUÉ se mide, cada cuánto y con qué criterio; el plan de reacción dice QUÉ SE HACE cuando el criterio se incumple.',
      'Sin plan de reacción, la carta de control se convierte en un adorno: alguien ve el punto rojo, no sabe qué hacer y el proceso sigue produciendo fuera de control.',
      'Se escribe ANTES de que ocurra el problema y en el lenguaje del operador: si pasa esto, haz esto, en este tiempo, y avisa a esta persona.',
      'CONDICIÓN DE DISPARO: debe ser objetiva y verificable. Ejemplos: «un punto fuera de los límites de control», «9 puntos seguidos del mismo lado de la línea central», «temperatura > 80 °C», «tiempo de espera > 30 min», «dos quejas del mismo tipo en la semana».',
      'ACCIÓN INMEDIATA: primero CONTENER (parar, segregar, marcar, inspeccionar el material sospechoso) y después CORREGIR (ajustar, cambiar, reponer). Contener protege al cliente mientras se investiga.',
      'TIEMPO DE RESPUESTA: cuánto puede pasar entre la señal y la acción. Si el tiempo de respuesta es mayor que el tiempo en que el proceso produce un lote, el daño ya está hecho: acorta el tiempo o aumenta la frecuencia de muestreo.',
      'ESCALAMIENTO: a quién se avisa si la acción inmediata no resuelve o si la condición se repite. Debe tener nombre y cargo, no un área genérica.',
      'REGISTRO: dónde queda la evidencia (bitácora, formato, sistema). Sin registro no hay aprendizaje: los registros de reacción alimentan el Pareto de causas especiales de la siguiente revisión.',
      'REGLA DE ORO DEL SPC: no ajustes el proceso sin señal. Ajustar cuando no hay causa especial (sobreajuste) aumenta la variación en lugar de reducirla.',
      'Revisa el plan de reacción cada vez que aparezca una causa especial nueva: si un evento no estaba previsto, agrégalo como una fila más.'
    ],
    blocks: [
      { type:'fields', title:'ENCABEZADO DEL PLAN', cols:4, items:[
        { k:'proceso',   label:'PROCESO', input:'text', w:2 },
        { k:'dueno',     label:'DUEÑO DEL PROCESO', input:'text' },
        { k:'version',   label:'VERSIÓN', input:'text', ph:'01' },
        { k:'fecha',     label:'FECHA DE EMISIÓN', input:'date' },
        { k:'vigencia',  label:'PRÓXIMA REVISIÓN', input:'date' },
        { k:'difusion',  label:'¿CÓMO SE DIFUNDE AL PERSONAL?', input:'text', w:2,
          ph:'Charla de inicio de turno, cartelera, tablero de gestión visual…' },
        { k:'ubicacion', label:'¿DÓNDE ESTÁ DISPONIBLE EN EL PUESTO?', input:'text', w:2,
          ph:'Plastificado en la máquina, carpeta del turno, intranet…' }
      ]},

      { type:'note', tone:'info', text:'Escribe cada regla en el lenguaje de quien opera: SI ocurre esta condición → HAZ esta acción → EN este tiempo → AVISA a esta persona → REGISTRA aquí.' },

      { type:'grid', key:'rows', title:'REGLAS DE REACCIÓN', min:8, max:120,
        addLabel:'Agregar regla de reacción',
        cols:[
          { k:'indicador',   label:'INDICADOR / CARACTERÍSTICA', input:'text', w:170,
            help:'Lo que se está vigilando' },
          { k:'fuente',      label:'FUENTE DE LA SEÑAL', input:'select', opts:PR_FUENTES, w:160 },
          { k:'condicion',   label:'CONDICIÓN DE DISPARO', input:'text', w:220,
            help:'Objetiva y verificable: punto fuera de límites, 9 puntos del mismo lado, valor > X…' },
          { k:'accion',      label:'ACCIÓN INMEDIATA', input:'text', w:240,
            help:'Primero contener (parar, segregar, marcar) y después corregir' },
          { k:'responsable', label:'RESPONSABLE', input:'text', w:140,
            help:'Nombre y cargo de quien ejecuta la acción' },
          { k:'tiempo',      label:'TIEMPO DE RESPUESTA', input:'number', step:'any', w:120, align:'right' },
          { k:'unidadT',     label:'UNIDAD', input:'select', opts:PR_UNIDADES, w:110 },
          { k:'horas',       label:'EQUIVALE A (h)', ro:true, fmt:'n2', w:110,
            calc:(r) => horasDe(r) },
          { k:'escalamiento', label:'SE ESCALA A', input:'text', w:160,
            help:'A quién se avisa si la acción inmediata no resuelve' },
          { k:'registro',    label:'REGISTRO / EVIDENCIA', input:'text', w:170,
            help:'Bitácora, formato, sistema donde queda la evidencia' },
          { k:'estado',      label:'ESTADO', input:'select', opts:PR_ESTADOS, w:130,
            tone:(v) => (v === 'Vigente' ? 'ok' : (v === 'Obsoleto' ? 'bad' : (v ? 'warn' : ''))) },
          { k:'completa',    label:'¿REGLA COMPLETA?', ro:true, w:150,
            calc:(r) => { const alguno = CAMPOS_PR.some(k => txt(r[k]) !== '') || isNum(r.tiempo);
              return alguno ? (completaPR(r) ? 'COMPLETA' : 'INCOMPLETA') : ''; },
            tone:(v) => (v === 'COMPLETA' ? 'ok' : (v === 'INCOMPLETA' ? 'bad' : '')) }
        ],
        foot:[
          { k:'indicador', calc:(rows) => filled(rows, 'indicador').length, fmt:'n0' },
          { k:'horas', calc:(rows) => { const h = arr(rows).map(horasDe).filter(isFinite);
              return h.length ? h.reduce((a, b) => a + b, 0) / h.length : NaN; }, fmt:'n2' },
          { k:'__label', label:'REGLAS' }
        ]
      },

      { type:'cards', title:'ESTADO DEL PLAN DE REACCIÓN', items:(d) => {
        const c = conteoPR(d);
        if (!c.total) return [{ label:'REGLAS DE REACCIÓN', value:'0',
          hint:'Define al menos una regla por cada característica del plan de control' }];
        return [
          { label:'REGLAS DEFINIDAS', value: fmt(c.total, 'n0'),
            hint: fmt(c.vigentes, 'n0') + ' vigente(s)' },
          { label:'REGLAS COMPLETAS', value: fmt(c.completas, 'n0') + ' / ' + fmt(c.total, 'n0'),
            tone: c.completas >= c.total ? 'ok' : 'warn',
            hint:'Con condición, acción, responsable, tiempo, escalamiento y registro' },
          { label:'COMPLETITUD DEL PLAN',
            value: isFinite(c.completitud) ? fmt(c.completitud, 'p0') : '—',
            tone: c.completitud >= 1 ? 'ok' : (c.completitud >= 0.7 ? 'warn' : 'bad') },
          { label:'TIEMPO MEDIO DE RESPUESTA', value: isFinite(c.horaMedia) ? nf(c.horaMedia, 'n2') + ' h' : '—',
            tone: c.horaMedia <= 4 ? 'ok' : (c.horaMedia <= 24 ? 'warn' : 'bad'),
            hint: isFinite(c.horaMax) ? 'El más lento: ' + nf(c.horaMax, 'n2') + ' h' : '' },
          { label:'SIN RESPONSABLE', value: fmt(c.sinResponsable, 'n0'),
            tone: c.sinResponsable ? 'bad' : 'ok' },
          { label:'SIN ESCALAMIENTO', value: fmt(c.sinEscalamiento, 'n0'),
            tone: c.sinEscalamiento ? 'bad' : 'ok' },
          { label:'SIN REGISTRO', value: fmt(c.sinRegistro, 'n0'),
            tone: c.sinRegistro ? 'bad' : 'ok' }
        ];
      }},

      { type:'chart', kind:'hbar', title:'TIEMPO DE RESPUESTA POR INDICADOR (horas)', h:320, key:'tiempos',
        data:(d) => {
          const rows = arr(d.rows).filter(r => txt(r.indicador) !== '' && isFinite(horasDe(r)));
          return { labels: rows.map(r => txt(r.indicador)),
                   values: rows.map(horasDe),
                   tones: rows.map(r => { const h = horasDe(r);
                     return h <= 4 ? 'ok' : (h <= 24 ? 'warn' : 'bad'); }),
                   fmt:'n2', unit:'h' };
        } },

      { type:'note', tone:'warn', text:(d) => {
        const c = conteoPR(d);
        if (!c.total) return '';
        const faltan = [];
        if (c.sinResponsable) faltan.push(fmt(c.sinResponsable, 'n0') + ' sin responsable');
        if (c.sinTiempo) faltan.push(fmt(c.sinTiempo, 'n0') + ' sin tiempo de respuesta');
        if (c.sinEscalamiento) faltan.push(fmt(c.sinEscalamiento, 'n0') + ' sin escalamiento');
        if (c.sinRegistro) faltan.push(fmt(c.sinRegistro, 'n0') + ' sin registro');
        if (faltan.length)
          return 'El plan todavía tiene vacíos: ' + faltan.join(' · ') + '. Una regla sin responsable, sin tiempo o sin registro no se ejecuta el día que suena la alarma.';
        if (isFinite(c.horaMax) && c.horaMax > 24)
          return 'Hay reglas con un tiempo de respuesta mayor a 24 horas. Verifica que el proceso no alcance a producir un lote completo fuera de control en ese lapso: si lo alcanza, acorta el tiempo o aumenta la frecuencia de muestreo.';
        return '';
      }},

      { type:'note', tone:'info', text:(d, ctx) => {
        const pc = (ctx && ctx.all && ctx.all['controlar.plan_de_control']) || null;
        if (!pc || !hasContent(pc))
          return 'Este plan complementa el PLAN DE CONTROL: primero define allí qué se mide, con qué método y cada cuánto; aquí define qué se hace cuando ese control señala un problema. Idealmente cada característica del plan de control tiene al menos una regla de reacción.';
        return 'Verifica que cada característica del PLAN DE CONTROL de este proyecto tenga su regla correspondiente en esta tabla: control sin reacción es sólo observación.';
      }},

      { type:'fields', title:'GOBIERNO DEL PLAN', cols:3, items:[
        { k:'entrenamiento', label:'¿QUIÉN FUE ENTRENADO EN ESTE PLAN?', input:'textarea', rows:3, w:2,
          ph:'Personas, turnos y fecha del entrenamiento' },
        { k:'auditoria', label:'¿CÓMO SE AUDITA SU CUMPLIMIENTO?', input:'textarea', rows:3,
          ph:'Revisión de bitácoras, auditoría de proceso por capas, recorrido diario…' },
        { k:'leccion',   label:'LECCIONES APRENDIDAS DE LAS REACCIONES', input:'textarea', rows:3, w:3,
          ph:'Causas especiales que se repitieron y qué se cambió en el proceso para eliminarlas' }
      ]},

      { type:'insight' }
    ],
    bi: (d) => {
      const c = conteoPR(d);
      return {
        reaccionReglas: c.total,
        reaccionCompletas: c.completas,
        reaccionCompletitud: c.completitud,
        reaccionVigentes: c.vigentes,
        reaccionSinResponsable: c.sinResponsable,
        reaccionSinEscalamiento: c.sinEscalamiento,
        reaccionSinRegistro: c.sinRegistro,
        reaccionHorasMedia: c.horaMedia,
        reaccionHorasMax: c.horaMax
      };
    }
  };

  /* ====================================================================== */
  return [ T_POKA_YOKE, T_MODELOS, T_SPC, T_PLAN_REACCION ];

})();

registerTools(SPECS_EXTRA_MC);
