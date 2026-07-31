/* ============================================================================
   SIMULACIÓN · caso de demostración completo y su borrado
   Carga un proyecto real de principio a fin para ver la herramienta funcionando
   (todas las fases, indicadores, gráficos e interpretaciones) y permite dejarla
   limpia con un clic para empezar a usarla de verdad.
   ========================================================================== */
'use strict';

const DEMO = (function(){

  /* ---- generador determinístico: la simulación es siempre la misma ---- */
  let _s = 20260731;
  const rnd = () => { _s = (_s * 1103515245 + 12345) % 2147483648; return _s / 2147483648; };
  const ent = (a, b) => a + Math.floor(rnd() * (b - a + 1));
  const dec = (a, b, n) => round(a + rnd() * (b - a), n === undefined ? 2 : n);
  const reset = () => { _s = 20260731; };

  const R = (o) => Object.assign({ _id: uid() }, o);
  const set = (id, o) => { const d = ST.d(id); Object.assign(d, o); return d; };

  const MESES = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];
  // etiquetas del semestre de la línea base (ago-2025 a ene-2026) y del semestre de la mejora
  const BASE_LBL  = ['Ago 25','Sep 25','Oct 25','Nov 25','Dic 25','Ene 26'];
  const MEJORA_LBL = ['Feb 26','Mar 26','Abr 26','May 26','Jun 26','Jul 26'];

  /* ====================================================================
     EL CASO: Rehavid, contratado por una ARL, interviene el proceso de
     terapia física de una empresa afiliada donde se reprograman demasiadas
     citas. Es un caso realista del negocio de Rehavid, no un ejemplo de
     fábrica genérico.
     ================================================================== */
  function cargar(){
    reset();
    const p = ST.proj();
    p.nombre  = 'Reducción de citas de terapia reprogramadas';
    p.empresa = 'Alimentos del Norte S.A.S.';
    p.arl     = 'ARL Positiva';
    p.area    = 'Servicio de terapia física · sede norte';
    p.lider   = 'Ing. Ariel Ramírez — Rehavid';
    p.creado  = '2026-02-02';
    p.demo    = true;

    const PROBLEMA = 'Entre agosto de 2025 y enero de 2026 el 32,4 % de las citas de terapia física ' +
      'programadas para trabajadores en rehabilitación fueron reprogramadas, frente a una meta ' +
      'institucional del 8 %. Esto alarga el tiempo de recuperación, retrasa el reintegro laboral ' +
      'y le cuesta a la ARL $ 62.400.000 al año en sesiones perdidas e incapacidades prolongadas.';
    const CAUSA = 'La agenda del software no permite sobrecupo ni lista de espera, de modo que ' +
      'cualquier ausencia deja el cupo vacío y empuja al paciente al final de la fila.';
    const OBJETIVO = 'Reducir el porcentaje de citas de terapia reprogramadas del 32,4 % al 8 % ' +
      'en la sede norte, antes del 30 de junio de 2026.';

    /* ---------------------------------------------------- DEFINIR ---- */
    set('definir.matriz_priorizacion', {
      rows: [
        R({ proyecto:'Reducir citas de terapia reprogramadas',      cliente:'5', costos:'4', exito:'5', empresa:'5', beneficio:'5' }),
        R({ proyecto:'Disminuir el tiempo de espera en admisión',   cliente:'4', costos:'3', exito:'4', empresa:'3', beneficio:'3' }),
        R({ proyecto:'Digitalizar la historia clínica ocupacional', cliente:'3', costos:'1', exito:'2', empresa:'4', beneficio:'4' }),
        R({ proyecto:'Estandarizar el informe de reintegro laboral',cliente:'3', costos:'4', exito:'4', empresa:'3', beneficio:'2' }),
        R({ proyecto:'Reducir reprocesos en facturación a la ARL',  cliente:'2', costos:'3', exito:'3', empresa:'4', beneficio:'3' })
      ],
      eleccion:'Reducir citas de terapia reprogramadas: obtiene la mayor prioridad, ataca ' +
               'directamente el tiempo de recuperación del trabajador y es la prioridad de la ARL.'
    });

    set('definir.clarificacion_problema', {
      reporte:'La coordinadora de la sede norte reportó que la agenda de terapia se ve llena pero ' +
              'las salas están a media ocupación, y que los pacientes se quejan de que los citan ' +
              'con tres semanas de diferencia entre sesiones.',
      producto:'Sesión de terapia física ocupacional', cliente:'ARL Positiva y trabajador en rehabilitación',
      r_what:'Las citas de terapia se reprograman: 32,4 % del total. Un defecto es toda cita ' +
             'programada que no se ejecuta en la fecha pactada, sin importar quién la cancele.',
      r_why:'Alarga la recuperación del trabajador, retrasa el reintegro laboral, aumenta el costo ' +
            'de la incapacidad para la ARL y deja capacidad instalada ociosa en la sede.',
      r_who:'Afecta al trabajador en rehabilitación y a la ARL que paga. Lo detectó la coordinadora ' +
            'de la sede y lo confirmó el informe mensual de adherencia.',
      r_where:'Sede norte, servicio de terapia física. Concentrado en las jornadas de la tarde.',
      r_when:'Detectado en enero de 2026; la serie muestra el deterioro desde agosto de 2025.',
      r_howmuch:'1.847 citas programadas en el semestre, 598 reprogramadas. Situación ideal 0 %, ' +
                'meta 8 %, actual 32,4 %: la brecha es de 24,4 puntos y $ 62.400.000 al año.',
      r_how:'Ocurre al no existir sobrecupo ni lista de espera: la ausencia de un paciente deja ' +
            'el cupo perdido y desplaza al siguiente. Hay evidencia en el log del software.',
      definicion: PROBLEMA
    });

    set('definir.arbol_ctq', {
      fecha:'2026-02-06',
      rows: [
        R({ necesidad:'Recuperarme pronto y volver a trabajar', conductor:'Continuidad del tratamiento',  ctq:'% de citas cumplidas en la fecha pactada' }),
        R({ necesidad:'Recuperarme pronto y volver a trabajar', conductor:'Oportunidad de la atención',   ctq:'Días entre sesiones consecutivas' }),
        R({ necesidad:'Que la ARL controle el costo',           conductor:'Uso de la capacidad instalada',ctq:'% de ocupación de las salas' }),
        R({ necesidad:'Que la ARL controle el costo',           conductor:'Duración de la incapacidad',   ctq:'Días de incapacidad por caso' })
      ],
      metricos: [ R({ metrico:'% de citas reprogramadas' }), R({ metrico:'Días entre sesiones' }),
                  R({ metrico:'% de ocupación de salas' }) ]
    });

    const serie = [21.5, 23.8, 26.1, 28.4, 30.2, 32.4, 31.8, 27.5, 19.2, 12.6, 9.1, 7.4];
    set('definir.series_tiempo', {
      objetivo:8, proceso:'Terapia física · sede norte',
      rows: serie.slice(0, 6).map((v, i) => R({ tiempo: BASE_LBL[i], metrico:v }))
    });

    set('definir.pareto', { rows: [
      R({ cat:'Agenda sin sobrecupo',         fre:212 }), R({ cat:'Paciente no confirmado',   fre:146 }),
      R({ cat:'Terapeuta no disponible',      fre:97  }), R({ cat:'Falla del software',       fre:71  }),
      R({ cat:'Sala ocupada por otra área',   fre:43  }), R({ cat:'Otros',                    fre:29  })
    ] });

    set('definir.objetivo_smart', {
      s:'Reducir el porcentaje de citas de terapia física reprogramadas en la sede norte.',
      m:'Del 32,4 % actual al 8 %, medido sobre el total de citas programadas en el mes.',
      a:'Sí: el 63 % de las reprogramaciones se concentra en dos causas atacables sin obra civil.',
      r:'Acorta el tiempo de reintegro laboral, principal indicador del contrato con la ARL.',
      t:'Del 2 de marzo al 30 de junio de 2026 (17 semanas).',
      smart: OBJETIVO
    });

    set('definir.sipoc', {
      proceso:'Atención de terapia física ocupacional', owner:'Coordinadora de la sede norte',
      fecha:'2026-02-09', empresa:'Alimentos del Norte S.A.S.',
      kmInputs:'% de autorizaciones completas · Días de la ARL para autorizar',
      kmProcess:'% de citas reprogramadas · % de ocupación de salas',
      kmOutputs:'Días entre sesiones · Días de incapacidad por caso',
      rows: [
        R({ sup:'ARL Positiva',        inp:'Orden de servicio y autorización', pro:'1. Recibir la autorización de la ARL',    out:'Cita programada',       cus:'Trabajador en rehabilitación' }),
        R({ sup:'Médico laboral',      inp:'Prescripción de terapia',          pro:'2. Agendar el ciclo de sesiones',         out:'Plan de tratamiento',   cus:'Terapeuta tratante' }),
        R({ sup:'Empresa afiliada',    inp:'Disponibilidad del trabajador',    pro:'3. Confirmar la asistencia',              out:'Sesión ejecutada',      cus:'ARL Positiva' }),
        R({ sup:'Área administrativa', inp:'Agenda y salas',                   pro:'4. Ejecutar la sesión de terapia',        out:'Registro de evolución', cus:'Médico laboral' }),
        R({ sup:'Terapeutas',          inp:'Equipos de terapia',               pro:'5. Registrar la evolución y dar de alta', out:'Informe de reintegro',  cus:'Empresa afiliada' })
      ]
    });

    set('definir.beneficios', {
      ben:{ 'des1.metrico':'% de citas reprogramadas', 'des1.base':32.4, 'des1.ahorro':24.4,
            'des2.metrico':2600, 'des2.base':62400000,
            'goal1.metrico':'% de citas reprogramadas', 'goal1.ahorro':20.4,
            'ret1.metrico':'% de citas reprogramadas', 'ret1.ahorro':27.4 },
      notaDeseado:'Meta comprometida con la ARL: bajar del 32,4 % al 8 %.',
      notaGoal:'Escenario conservador: llegar al 12 % sostenido.',
      notaRetadora:'Escenario retador: 5 %, el nivel de la sede sur.',
      entregables: [
        R({ hard:'Sesiones no ejecutadas que sí se facturan', soft:'Mejor experiencia del trabajador' }),
        R({ hard:'Menor costo de incapacidad prolongada',     soft:'Mejor calificación de la sede ante la ARL' }),
        R({ hard:'Mayor uso de la capacidad instalada',       soft:'Menos reprocesos administrativos' })
      ]
    });

    set('definir.tabla_identificacion', {
      caso: PROBLEMA,
      rows: [
        R({ ctq:'% de citas cumplidas en la fecha pactada', base:67.6, obj:92, ideal:100, ahorro:46800000 }),
        R({ ctq:'Días entre sesiones consecutivas',         base:6.8,  obj:3,  ideal:2,   ahorro:0 }),
        R({ ctq:'% de ocupación de salas',                  base:58,   obj:85, ideal:95,  ahorro:0 })
      ]
    });

    set('definir.project_members', { rows: [
      R({ nombre:'Dra. Claudia Restrepo', job:'Gerente de Riesgos · ARL Positiva' }),
      R({ nombre:'Marcela Ospina',        job:'Coordinadora sede norte' }),
      R({ nombre:'Jorge Delgado',         job:'Analista de costos · Rehavid' }),
      R({ nombre:'Ing. Laura Peña',       job:'Black Belt · Rehavid' }),
      R({ nombre:'Ing. Ariel Ramírez',    job:'Green Belt · Rehavid' }),
      R({ nombre:'Andrés Correa',         job:'Fisioterapeuta líder' }),
      R({ nombre:'Diana Rojas',           job:'Auxiliar de agendamiento' })
    ] });

    set('definir.gantt', {
      proyecto:'Reducción de citas de terapia reprogramadas',
      empresa:'Alimentos del Norte S.A.S.', responsable:'Ing. Ariel Ramírez',
      inicio:'2026-03-02', semana:1,
      rows: [
        R({ fase:true, tarea:'DEFINIR',   asignado:'Ariel Ramírez',    progreso:1,    inicio:'2026-03-02', fin:'2026-03-20' }),
        R({ tarea:'Clarificar el problema y el alcance', asignado:'Ariel Ramírez',    progreso:1,    inicio:'2026-03-02', fin:'2026-03-09' }),
        R({ tarea:'Levantar la línea base',              asignado:'Diana Rojas',      progreso:1,    inicio:'2026-03-09', fin:'2026-03-16' }),
        R({ tarea:'Aprobar el Project Charter',          asignado:'Claudia Restrepo', progreso:1,    inicio:'2026-03-16', fin:'2026-03-20' }),
        R({ fase:true, tarea:'MEDIR',     asignado:'Laura Peña',       progreso:1,    inicio:'2026-03-23', fin:'2026-04-17' }),
        R({ tarea:'Mapear el proceso de agendamiento',   asignado:'Marcela Ospina',   progreso:1,    inicio:'2026-03-23', fin:'2026-03-31' }),
        R({ tarea:'Plan y recolección de datos',         asignado:'Diana Rojas',      progreso:1,    inicio:'2026-03-31', fin:'2026-04-10' }),
        R({ tarea:'Validar el sistema de medición',      asignado:'Laura Peña',       progreso:1,    inicio:'2026-04-10', fin:'2026-04-17' }),
        R({ fase:true, tarea:'ANALIZAR',  asignado:'Laura Peña',       progreso:1,    inicio:'2026-04-20', fin:'2026-05-12' }),
        R({ tarea:'Ishikawa y 5 por qué con el equipo',  asignado:'Ariel Ramírez',    progreso:1,    inicio:'2026-04-20', fin:'2026-04-27' }),
        R({ tarea:'Validar las causas con datos',        asignado:'Laura Peña',       progreso:1,    inicio:'2026-04-27', fin:'2026-05-08' }),
        R({ tarea:'Confirmar la causa raíz',             asignado:'Ariel Ramírez',    progreso:1,    inicio:'2026-05-08', fin:'2026-05-12' }),
        R({ fase:true, tarea:'MEJORAR',   asignado:'Ariel Ramírez',    progreso:0.75, inicio:'2026-05-13', fin:'2026-06-12' }),
        R({ tarea:'Diseñar sobrecupo y lista de espera', asignado:'Marcela Ospina',   progreso:1,    inicio:'2026-05-13', fin:'2026-05-22' }),
        R({ tarea:'Piloto en jornada de la tarde',       asignado:'Andrés Correa',    progreso:1,    inicio:'2026-05-25', fin:'2026-06-05' }),
        R({ tarea:'Despliegue a toda la sede',           asignado:'Marcela Ospina',   progreso:0.25, inicio:'2026-06-08', fin:'2026-06-12' }),
        R({ fase:true, tarea:'CONTROLAR', asignado:'Marcela Ospina',   progreso:0.3,  inicio:'2026-06-15', fin:'2026-06-30' }),
        R({ tarea:'Estandarizar el nuevo procedimiento', asignado:'Marcela Ospina',   progreso:0.6,  inicio:'2026-06-15', fin:'2026-06-22' }),
        R({ tarea:'Plan de control y carta de control',  asignado:'Laura Peña',       progreso:0.3,  inicio:'2026-06-22', fin:'2026-06-26' }),
        R({ tarea:'Cierre y entrega a la ARL',           asignado:'Ariel Ramírez',    progreso:0,    inicio:'2026-06-26', fin:'2026-06-30' })
      ]
    });

    set('definir.plan_comunicacion', { proyecto:'Reducción de citas de terapia reprogramadas', rows: [
      R({ tema:'Avance del proyecto',     proposito:'Informar y desbloquear', responsable:'Ariel Ramírez',  audiencia:'Comité ARL–Rehavid', medio:'Videollamada', lugar:'Teams',           frecuencia:'Quincenal' }),
      R({ tema:'Resultados del piloto',   proposito:'Decidir el despliegue',  responsable:'Marcela Ospina', audiencia:'Equipo de la sede',  medio:'Reunión',      lugar:'Sede norte',      frecuencia:'Al cierre del piloto' }),
      R({ tema:'Indicador de adherencia', proposito:'Sostener la mejora',     responsable:'Diana Rojas',    audiencia:'Terapeutas',         medio:'Cartelera',    lugar:'Sala de terapia', frecuencia:'Semanal' }),
      R({ tema:'Informe de cierre',       proposito:'Entregar resultados',    responsable:'Ariel Ramírez',  audiencia:'ARL y empresa',      medio:'Informe PDF',  lugar:'Correo',          frecuencia:'Al cierre' })
    ] });

    set('definir.recursos', { rows: [
      R({ recurso:'Parametrización del software', descripcion:'Habilitar sobrecupo y lista de espera', obtencion:'Proveedor del software · 16 h' }),
      R({ recurso:'Tiempo del equipo de la sede', descripcion:'8 sesiones de trabajo de 2 h',          obtencion:'Autorizado por la coordinación' }),
      R({ recurso:'Mensajería de confirmación',   descripcion:'Recordatorio automático 48 h antes',    obtencion:'Servicio ya contratado' }),
      R({ recurso:'Acompañamiento Green Belt',    descripcion:'17 semanas de facilitación',            obtencion:'Contrato Rehavid–ARL' })
    ] });

    set('definir.project_charter', {
      nombre:'Reducción de citas de terapia reprogramadas',
      problema: PROBLEMA, objetivo: OBJETIVO,
      businessCase:'Cada punto porcentual de reprogramación cuesta $ 1.925.000 al año en sesiones ' +
        'perdidas e incapacidad prolongada. Cerrar la brecha de 24,4 puntos libera $ 46,8 millones ' +
        'anuales y acorta en 11 días el reintegro laboral promedio.',
      beneficios:'Menor tiempo de reintegro, mayor uso de la capacidad instalada y mejor experiencia ' +
        'del trabajador en rehabilitación.',
      scopeIn:'Servicio de terapia física de la sede norte: agendamiento, confirmación y ejecución.',
      scopeOut:'Autorización clínica de la ARL, transporte del paciente y sedes distintas a la norte.',
      duracion:17,
      ahorros: [ R({ hard:18200000, soft:4100000 }), R({ hard:12600000, soft:2400000 }),
                 R({ hard:9800000,  soft:1900000 }), R({ hard:6200000,  soft:1600000 }) ],
      plan: [ R({ inicio:'2026-03-02', fin:'2026-03-20' }), R({ inicio:'2026-03-23', fin:'2026-04-17' }),
              R({ inicio:'2026-04-20', fin:'2026-05-12' }), R({ inicio:'2026-05-13', fin:'2026-06-12' }),
              R({ inicio:'2026-06-15', fin:'2026-06-30' }) ],
      metDef: [ R({ nombre:'% de citas reprogramadas', existe:'Yes', base:32.4, obj:8,  ideal:0 }),
                R({ nombre:'Días entre sesiones',      existe:'Yes', base:6.8,  obj:3,  ideal:2 }),
                R({ nombre:'% de ocupación de salas',  existe:'No',  base:58,   obj:85, ideal:95 }) ],
      metCie: [ R({ mejoro:'Yes', base:32.4, logrado:7.4, ideal:0 }),
                R({ mejoro:'Yes', base:6.8,  logrado:3.1, ideal:2 }),
                R({ mejoro:'Yes', base:58,   logrado:81,  ideal:95 }) ],
      firmasDef: [ R({ firma:'Aprobado', fecha:'2026-03-20' }), R({ firma:'Aprobado', fecha:'2026-03-20' }),
                   R({ firma:'Aprobado', fecha:'2026-03-20' }), R({ firma:'Aprobado', fecha:'2026-03-20' }),
                   R({ firma:'Aprobado', fecha:'2026-03-20' }) ]
    });

    set('definir.a3_definir', {
      nombre:'Reducción de citas de terapia reprogramadas',
      problema: PROBLEMA, objetivo: OBJETIVO,
      metricKey:'% de citas de terapia reprogramadas',
      baseline:'32,4 %', ideal:'0 %', gap:'24,4 puntos frente a la meta del 8 %',
      tm1:'Dra. Claudia Restrepo — Champion', tm2:'Marcela Ospina — Dueña del proceso',
      tm3:'Jorge Delgado — Finanzas', tm4:'Ing. Laura Peña — Mentor',
      tm5:'Ing. Ariel Ramírez — Facilitador', tm6:'Andrés Correa y Diana Rojas — Equipo',
      savings:'$ 46.800.000 al año en sesiones perdidas e incapacidad prolongada',
      dateStart:'2026-03-02', dateFinish:'2026-06-30',
      empresa:'Alimentos del Norte S.A.S. · ARL Positiva'
    });

    /* ------------------------------------------------------ MEDIR ---- */
    set('medir.metricos_desempeno', {
      proceso:'Agendamiento y ejecución de la sesión de terapia física en la sede norte.',
      metricos:'Primario: % de citas reprogramadas.\nSecundarios: días entre sesiones, % de ocupación ' +
               'de salas, % de confirmaciones logradas.\nContrario: satisfacción del trabajador (no debe caer).'
    });

    set('medir.plan_muestreo_cualitativo', {
      cuenta:'Citas programadas que no se ejecutan en la fecha pactada',
      pobN:1847, caracteristica:'Cita reprogramada (sí / no)', p:0.324, err:0.05, conf:0.95,
      estrategia:'Muestreo aleatorio estratificado por jornada (mañana / tarde)',
      frecuencia:'Diaria durante 4 semanas'
    });
    set('medir.tamano_muestra_cualitativos', { pobN:1847, p:0.324, conf:0.95, err:0.05 });
    set('medir.plan_muestreo_cuantitativo', {
      cuenta:'Días transcurridos entre dos sesiones consecutivas',
      pobN:1847, caracteristica:'Días entre sesiones', sigma:2.4, err:0.4, conf:0.95,
      estrategia:'Muestreo sistemático: 1 de cada 5 historias',
      frecuencia:'Semanal durante 4 semanas'
    });
    set('medir.tamano_muestra_cuantitativo', { pobN:1847, sigma:2.4, conf:0.95, err:0.4 });

    set('medir.plan_recoleccion', { rows: [
      R({ medicion:'Citas reprogramadas', factores:'Jornada y motivo', definicion:'Cita no ejecutada en la fecha pactada', tamano:'323 citas', fuente:'Log del software', metodo:'Descarga automática',  quien:'Diana Rojas' }),
      R({ medicion:'Días entre sesiones', factores:'Terapeuta',        definicion:'Días entre sesión n y n+1',              tamano:'139 casos', fuente:'Historia clínica', metodo:'Extracción manual',   quien:'Andrés Correa' }),
      R({ medicion:'Ocupación de salas',  factores:'Franja horaria',   definicion:'Horas usadas / horas disponibles',       tamano:'20 días',   fuente:'Planilla de sala', metodo:'Observación directa', quien:'Marcela Ospina' })
    ], utilizacion:'Construir la línea base, el Pareto de motivos y la carta de control.',
       presentacion:'Serie de tiempo mensual, Pareto de motivos y tablero para el comité con la ARL.' });

    set('medir.yield', { totales:1847, malas:598 });

    set('medir.rty_fpy', { inicio:1847, proceso:'Ciclo de atención de terapia', rows: [
      R({ name:'Autorización de la ARL',   defects:38,  rework:52 }),
      R({ name:'Agendamiento de la cita',  defects:212, rework:96 }),
      R({ name:'Confirmación al paciente', defects:146, rework:74 }),
      R({ name:'Preparación de la sala',   defects:43,  rework:21 }),
      R({ name:'Ejecución de la sesión',   defects:97,  rework:33 }),
      R({ name:'Registro de la evolución', defects:62,  rework:48 })
    ] });

    set('medir.grafico_serie_tiempo', { criterio:'% de citas reprogramadas',
      serie: serie.reduce((o, v, i) => { o['m' + (i + 1) + '.valor'] = v; return o; }, {}) });

    set('medir.valor_add', { proceso:'Ciclo completo de una sesión de terapia', rows: [
      R({ actividad:'Recibir y validar la autorización', categoria:'NVAR', tiempo:14 }),
      R({ actividad:'Buscar cupo en la agenda',          categoria:'NVA',  tiempo:11 }),
      R({ actividad:'Llamar para confirmar',             categoria:'NVAR', tiempo:8  }),
      R({ actividad:'Registrar al paciente en recepción',categoria:'NVAR', tiempo:6  }),
      R({ actividad:'Esperar al terapeuta',              categoria:'NVA',  tiempo:12 }),
      R({ actividad:'Evaluación inicial del terapeuta',  categoria:'VA',   tiempo:9  }),
      R({ actividad:'Ejecutar la terapia',               categoria:'VA',   tiempo:45 }),
      R({ actividad:'Registrar la evolución',            categoria:'VA',   tiempo:7  }),
      R({ actividad:'Reagendar la siguiente sesión',     categoria:'NVA',  tiempo:9  })
    ] });

    set('medir.ppm', { rows: [
      R({ proceso:'Agendamiento de citas',  units:1847, defects:598 }),
      R({ proceso:'Confirmación al paciente',units:1847, defects:146 })
    ] });

    set('medir.dpmo', {
      cat1:'Agenda sin sobrecupo', cat2:'Paciente no confirmado',
      cat3:'Terapeuta no disponible', cat4:'Falla del software',
      rows: [
        R({ proceso:'Agosto',     units:305, c1:34, c2:24, c3:16, c4:12 }),
        R({ proceso:'Septiembre', units:298, c1:37, c2:26, c3:17, c4:12 }),
        R({ proceso:'Octubre',    units:312, c1:39, c2:27, c3:18, c4:13 }),
        R({ proceso:'Noviembre',  units:308, c1:36, c2:25, c3:17, c4:12 }),
        R({ proceso:'Diciembre',  units:302, c1:33, c2:22, c3:15, c4:11 }),
        R({ proceso:'Enero',      units:322, c1:33, c2:22, c3:14, c4:11 })
      ]
    });

    set('medir.dpu', { proceso:'Sesión de terapia física', inspeccionadas:1847, rows: [
      R({ noconf:'Cita reprogramada',     cant:598 }),
      R({ noconf:'Registro incompleto',   cant:124 }),
      R({ noconf:'Sesión iniciada tarde', cant:211 })
    ] });

    set('medir.capacidad_proceso', {
      caracteristica:'Días entre sesiones consecutivas', unidad:'días', plazo:'Largo plazo',
      lsl:1, target:2.5, usl:4, subgrupo:1, fuenteEsp:'Guía clínica de rehabilitación',
      responsable:'Ing. Laura Peña', fecha:'2026-04-14', msaOk:'SÍ, GR&R aceptable',
      baseline:'El proceso opera muy por encima del límite superior: 6,8 días promedio contra un ' +
               'máximo aceptable de 4.',
      rows: muestraNormal(6.8, 2.1, 40).map(v => R({ valor: round(v, 2) }))
    });

    set('medir.msa_grr', {
      caracteristica:'Días entre sesiones', gage:'Reporte del software de agenda', unidad:'días',
      lsl:1, target:2.5, usl:4, nPartes:10, nOperadores:3, nReplicas:2, resolucion:0.1,
      calibrado:'SÍ', responsable:'Ing. Laura Peña', fecha:'2026-04-14',
      conclusion:'%Estudio 18,6 % y ndc = 7: el sistema de medición es aceptable para decidir.',
      acciones:'Documentar la definición operacional de «días entre sesiones» en el estándar.',
      rows: grrDatos(10, 3, 2, 6.8, 1.9, 0.32)
    });

    set('medir.histograma', { variable:'Días entre sesiones', unidad:'días', bins:8,
      lsl:1, target:2.5, usl:4, fuente:'Historia clínica · 40 casos',
      rows: muestraNormal(6.8, 2.1, 40).map(v => R({ valor: round(v, 2) })) });

    set('medir.dispersion', {
      nombreX:'Días entre sesiones', unidadX:'días', nombreY:'Días de incapacidad', unidadY:'días',
      fuente:'Historia clínica ocupacional', hipotesis:'A mayor separación entre sesiones, más días de incapacidad.',
      conclusion:'La nube muestra una relación directa clara: cada día adicional entre sesiones suma ' +
                 'cerca de 2,6 días de incapacidad.',
      rows: (function(){ const o = []; for (let i = 0; i < 24; i++){
        const x = dec(2, 12, 1); o.push(R({ x, y: round(18 + 2.6 * x + dec(-4, 4, 1), 1) })); } return o; })()
    });

    set('medir.a3_medir', {
      doc:'Mapa detallado del agendamiento (14 pasos, 5 sin valor agregado) y diagrama de carriles ' +
          'entre ARL, sede y trabajador.',
      grr:'GR&R por variables sobre «días entre sesiones»: %Estudio 18,6 % y ndc = 7. Aceptable.',
      baseline:'32,4 % de citas reprogramadas · nivel sigma 1,96 σ · RTY 67,6 % · valor agregado 50,4 %.'
    });

    /* --------------------------------------------------- ANALIZAR ---- */
    set('analizar.brainstorming', {
      team:'Ariel Ramírez, Marcela Ospina, Andrés Correa, Diana Rojas, Laura Peña',
      date:'2026-04-20', proyecto:'Reducción de citas de terapia reprogramadas',
      comentarios:'Sesión de 90 minutos. Se acordó no descartar ninguna idea antes de validarla con datos.',
      cats: [ R({ cat:'Métodos', desc:'Cómo se agenda y se confirma' }),
              R({ cat:'Mano de Obra', desc:'Disponibilidad del equipo' }),
              R({ cat:'Maquinaria', desc:'Software y equipos' }),
              R({ cat:'Medio Ambiente', desc:'Espacios y salas' }),
              R({ cat:'Mediciones', desc:'Qué se registra y cómo' }) ],
      ideas: [
        R({ idea:'La agenda no permite sobrecupo',         cat:'Métodos',        quien:'Marcela Ospina', votos:9 }),
        R({ idea:'No existe lista de espera',              cat:'Métodos',        quien:'Diana Rojas',    votos:8 }),
        R({ idea:'La confirmación se hace el mismo día',   cat:'Métodos',        quien:'Diana Rojas',    votos:7 }),
        R({ idea:'Alta rotación de fisioterapeutas',       cat:'Mano de Obra',   quien:'Andrés Correa',  votos:5 }),
        R({ idea:'Ausentismo del terapeuta sin reemplazo', cat:'Mano de Obra',   quien:'Andrés Correa',  votos:6 }),
        R({ idea:'El software se cae en horas pico',       cat:'Maquinaria',     quien:'Laura Peña',     votos:3 }),
        R({ idea:'Salas compartidas con salud ocupacional',cat:'Medio Ambiente', quien:'Marcela Ospina', votos:4 }),
        R({ idea:'No se registra el motivo de cancelación',cat:'Mediciones',     quien:'Ariel Ramírez',  votos:6 })
      ]
    });

    set('analizar.diagramas_ishikawa', {
      problema1:'32,4 % de citas de terapia reprogramadas (ago-25 a ene-26)',
      m1:'Mediciones', m2:'Materiales', m3:'Mano de Obra', m4:'Medio Ambiente', m5:'Métodos', m6:'Maquinaria',
      problema2:'32,4 % de citas de terapia reprogramadas',
      p1:'Politicas', p2:'Personal', p3:'Procedimientos', p4:'Instalaciones',
      causas: [
        R({ diag:'6M', espina:'Métodos',        causa:'La agenda no permite sobrecupo',      subcausa:'Parametrización por defecto del proveedor', obs:'Confirmada con datos' }),
        R({ diag:'6M', espina:'Métodos',        causa:'No existe lista de espera',           subcausa:'Nunca se definió el procedimiento' }),
        R({ diag:'6M', espina:'Métodos',        causa:'Confirmación tardía al paciente',     subcausa:'Se llama el mismo día de la cita', obs:'Confirmada con prueba de hipótesis' }),
        R({ diag:'6M', espina:'Mano de Obra',   causa:'Ausentismo del terapeuta sin cubrir', subcausa:'No hay terapeuta de respaldo' }),
        R({ diag:'6M', espina:'Mano de Obra',   causa:'Rotación de fisioterapeutas',         subcausa:'Contratos por prestación de servicios' }),
        R({ diag:'6M', espina:'Maquinaria',     causa:'El software de agenda se cae',        subcausa:'Servidor sin plan de contingencia', obs:'Descartada: 3 caídas en 6 meses' }),
        R({ diag:'6M', espina:'Mediciones',     causa:'No se registra el motivo real',       subcausa:'El formulario no tiene ese campo' }),
        R({ diag:'6M', espina:'Medio Ambiente', causa:'Salas compartidas con otra área',     subcausa:'Sin reserva formal de espacios', obs:'Descartada: ocupación del 58 %' }),
        R({ diag:'6M', espina:'Materiales',     causa:'Equipos en mantenimiento correctivo', subcausa:'Sin plan preventivo' }),
        R({ diag:'4P', espina:'Procedimientos', causa:'El procedimiento de agendamiento no está documentado', subcausa:'No existe en el sistema de gestión' }),
        R({ diag:'4P', espina:'Politicas',      causa:'No hay política de sobrecupo',        subcausa:'Nunca se definió al implantar el sistema' })
      ]
    });

    set('analizar.5_whys', {
      w1_problema:'32,4 % de las citas de terapia se reprograman',
      w1_why1:'Cuando un paciente falta, el cupo se pierde y el siguiente se corre de fecha',
      w1_nec1:'SI', w1_how1:'Revisión de 120 agendas: 78 % de los cupos liberados quedaron vacíos',
      w1_why2:'La agenda no permite sobrecupo ni lista de espera',
      w1_nec2:'SI', w1_how2:'Prueba directa en el software con el proveedor',
      w1_why3:'El módulo de agenda se dejó con la parametrización por defecto',
      w1_nec3:'SI', w1_how3:'Acta de implementación de 2023: ese módulo no se configuró',
      w1_why4:'Nadie definió la regla de sobrecupo cuando se implantó el sistema',
      w1_nec4:'NO', w1_how4:'',
      w1_why5:'El procedimiento de agendamiento nunca se documentó con criterio clínico',
      w1_nec5:'SI', w1_how5:'No existe el documento en el sistema de gestión',
      w1_raiz:'El procedimiento de agendamiento se implantó sin regla de sobrecupo ni lista de espera, ' +
              'de modo que toda ausencia se convierte en capacidad perdida.',
      w2_problema:'Sólo el 54 % de los pacientes confirma su asistencia',
      w2_why1:'La confirmación se solicita el mismo día de la cita',
      w2_nec1:'SI', w2_how1:'Log de mensajería: 91 % de los envíos salen el mismo día',
      w2_why2:'El recordatorio se dispara con la agenda del día, no con anticipación',
      w2_nec2:'SI', w2_how2:'Revisión de la configuración de la mensajería',
      w2_why3:'La automatización se configuró para reducir el costo de los mensajes',
      w2_nec3:'NO', w2_how3:'',
      w2_raiz:'La confirmación se diseñó como aviso, no como mecanismo para liberar el cupo a tiempo.'
    });

    set('analizar.tree_diagram', { problema:'32,4 % de citas de terapia reprogramadas' });

    set('analizar.validacion_de_causas', { rows: [
      R({ causa:'La agenda no permite sobrecupo',      accion:'Prueba en el software y conteo de cupos liberados',  responsable:'Laura Peña',     fecha:'2026-04-27', check:1, comentarios:'Confirmada: 78 % de cupos liberados quedan vacíos' }),
      R({ causa:'Confirmación tardía al paciente',     accion:'Comparar asistencia con y sin recordatorio de 48 h', responsable:'Diana Rojas',    fecha:'2026-04-29', check:1, comentarios:'Confirmada: p = 0,003 a favor del recordatorio' }),
      R({ causa:'Ausentismo del terapeuta sin cubrir', accion:'Cruce de novedades de personal con reprogramaciones',responsable:'Andrés Correa',  fecha:'2026-05-04', check:1, comentarios:'Confirmada, pero explica sólo el 16 %' }),
      R({ causa:'El software de agenda se cae',        accion:'Revisar el log de caídas del servidor',              responsable:'Laura Peña',     fecha:'2026-05-05', check:0, comentarios:'Descartada: 3 caídas en 6 meses' }),
      R({ causa:'Salas compartidas con otra área',     accion:'Medir la ocupación real por franja',                 responsable:'Marcela Ospina', fecha:'2026-05-06', check:0, comentarios:'Descartada: la ocupación es del 58 %' }),
      R({ causa:'Equipos en mantenimiento',            accion:'Revisar las órdenes del semestre',                   responsable:'Andrés Correa',  fecha:'2026-05-07', check:0, comentarios:'Descartada: 2 eventos en el semestre' })
    ] });

    set('analizar.descripcion_causa_raiz', {
      problema: PROBLEMA, causa1: CAUSA,
      desc1:'Al no existir sobrecupo ni lista de espera, el 78 % de los cupos que se liberan quedan ' +
            'vacíos. Esa capacidad perdida obliga a correr la siguiente sesión, lo que alarga el ' +
            'intervalo y aumenta la probabilidad de una nueva falta.',
      causa2:'La confirmación al paciente se hace el mismo día de la cita.',
      desc2:'Sin recordatorio anticipado no hay margen para reasignar el cupo. La prueba sobre ' +
            '2 proporciones dio p = 0,003 a favor del recordatorio de 48 horas.',
      conclusion:'Causa raíz: el procedimiento de agendamiento se implantó sin regla de sobrecupo, ' +
            'lista de espera ni confirmación anticipada. Explica el 63 % de las reprogramaciones.'
    });

    set('analizar.correlacion_regresion', {
      causa:'Días entre sesiones', fecha:'2026-05-06', alfa:'0,05',
      nombreX:'Días entre sesiones', unidadX:'días', nombreY:'Días de incapacidad', unidadY:'días',
      fuente:'Historia clínica ocupacional',
      hipotesis:'A mayor separación entre sesiones, mayor duración de la incapacidad.',
      predX:3, veredicto:'SÍ — X explica el comportamiento de Y y pasa a MEJORAR',
      uso:'Justifica atacar el intervalo entre sesiones como palanca del reintegro laboral.',
      conclusion:'Relación directa fuerte. Bajar el intervalo de 6,8 a 3 días proyecta una reducción ' +
                 'cercana a 10 días de incapacidad por caso.',
      rows: (function(){ const o = []; for (let i = 0; i < 20; i++){
        const x = dec(2, 12, 1); o.push(R({ x, y: round(18 + 2.6 * x + dec(-3, 3, 1), 1) })); } return o; })()
    });

    set('analizar.a3_analizar', {
      analisis:'Ishikawa 6M y 4P con 11 causas, y 5 por qué hasta la causa raíz. Todas las causas se ' +
               'validaron con datos, no con opinión.',
      causas:'Agenda sin sobrecupo · Confirmación tardía · Ausentismo sin cubrir · Caídas del software ' +
             '· Salas compartidas · Equipos en mantenimiento',
      raiz: CAUSA
    });

    /* ---------------------------------------------------- MEJORAR ---- */
    set('mejorar.brainstorming', {
      proyecto:'Reducción de citas de terapia reprogramadas', fecha:'2026-05-11',
      facilitad:'Ing. Ariel Ramírez',
      categorias:'Agendamiento · Confirmación · Capacidad · Registro',
      notas:'Se partió de las 3 causas validadas en ANALIZAR. No se descartó ninguna idea antes de puntuarla.',
      equipo: [ R({ nombre:'Ing. Ariel Ramírez' }), R({ nombre:'Marcela Ospina' }),
                R({ nombre:'Andrés Correa' }),      R({ nombre:'Diana Rojas' }) ],
      rows: [
        R({ causa:CAUSA,                        idea:'Habilitar sobrecupo del 15 %',       categoria:'Agendamiento', autor:'Marcela Ospina', votos:9, nota:'Requiere al proveedor' }),
        R({ causa:CAUSA,                        idea:'Crear lista de espera activa',       categoria:'Agendamiento', autor:'Diana Rojas',    votos:9, nota:'Va junto con el sobrecupo' }),
        R({ causa:'Confirmación el mismo día',  idea:'Recordatorio automático 48 h antes', categoria:'Confirmación', autor:'Diana Rojas',    votos:8, nota:'La mensajería ya está contratada' }),
        R({ causa:'No se registra el motivo',   idea:'Motivo obligatorio al cancelar',     categoria:'Registro',     autor:'Ariel Ramírez',  votos:7 }),
        R({ causa:'Capacidad ociosa en la tarde',idea:'Franja abierta 4:00–6:00 p. m.',    categoria:'Capacidad',    autor:'Andrés Correa',  votos:6 }),
        R({ causa:'Ausentismo del terapeuta',   idea:'Terapeuta de respaldo por jornada',  categoria:'Capacidad',    autor:'Andrés Correa',  votos:4, nota:'Tiene costo de nómina' })
      ]
    });

    set('mejorar.seleccion_soluciones', {
      problema: PROBLEMA, causaRaiz: CAUSA,
      rows: [
        R({ sol:'Habilitar sobrecupo del 15 % y lista de espera activa', metodo:'Parametrizar el software y documentar la regla', effort:'4', benefit:'5', feas:'5', cb:'5', solucion:'Sí' }),
        R({ sol:'Recordatorio automático 48 h antes con confirmación',   metodo:'Usar la mensajería ya contratada',              effort:'5', benefit:'4', feas:'5', cb:'5', solucion:'Sí' }),
        R({ sol:'Campo obligatorio de motivo al cancelar',               metodo:'Ajuste en el formulario del software',          effort:'5', benefit:'3', feas:'5', cb:'4', solucion:'Sí' }),
        R({ sol:'Franja de atención abierta 4:00–6:00 p. m.',            metodo:'Piloto en la sede norte',                       effort:'3', benefit:'4', feas:'4', cb:'3', solucion:'No' }),
        R({ sol:'Terapeuta de respaldo por jornada',                     metodo:'Rotación programada del personal',              effort:'2', benefit:'3', feas:'3', cb:'2', solucion:'No' })
      ]
    });

    set('mejorar.plan_accion', {
      proyecto:'Reducción de citas de terapia reprogramadas', lider:'Ing. Ariel Ramírez',
      reunionAvances:'Comité quincenal ARL–Rehavid: se revisa el indicador y el estado de cada acción.',
      reunionResultados:'El comité del 5 de junio aprobó desplegar el sobrecupo a toda la sede tras el piloto.',
      rows: [
        R({ problema:'Agenda sin sobrecupo',         accion:'Parametrizar sobrecupo del 15 % y lista de espera', responsable:'Marcela Ospina', inicio:'2026-05-13', limite:'2026-05-22', estatus:'REALIZADA', reunion:'Revisado el 22/05', descripcion:'Configurado con el proveedor',      resultados:'Cupos vacíos del 78 % al 21 %',        mejora:'% de cupos reasignados' }),
        R({ problema:'Confirmación tardía',          accion:'Recordatorio automático 48 h antes',                responsable:'Diana Rojas',    inicio:'2026-05-15', limite:'2026-05-25', estatus:'REALIZADA', reunion:'Revisado el 25/05', descripcion:'Mensaje de texto y llamada de respaldo',resultados:'Confirmación del 54 % al 89 %',      mejora:'% de citas confirmadas' }),
        R({ problema:'Motivo real desconocido',      accion:'Campo obligatorio de motivo al cancelar',           responsable:'Marcela Ospina', inicio:'2026-05-20', limite:'2026-05-29', estatus:'REALIZADA', reunion:'Revisado el 29/05', descripcion:'Lista desplegable de 6 motivos',    resultados:'100 % de cancelaciones con motivo',    mejora:'% de registros completos' }),
        R({ problema:'Capacidad perdida en la tarde',accion:'Piloto de franja abierta 4:00–6:00 p. m.',          responsable:'Andrés Correa',  inicio:'2026-05-25', limite:'2026-06-05', estatus:'REALIZADA', reunion:'Cierre del piloto', descripcion:'Dos semanas de piloto',             resultados:'Ocupación de la tarde del 58 % al 81 %',mejora:'% de ocupación por franja' }),
        R({ problema:'Sostenimiento',                accion:'Capacitar al equipo en el nuevo estándar',          responsable:'Ariel Ramírez',  inicio:'2026-06-08', limite:'2026-06-12', estatus:'EN CURSO',  reunion:'2 de 3 sesiones dictadas', descripcion:'Taller de 2 horas por grupo', resultados:'',                                mejora:'% de personal capacitado' }),
        R({ problema:'Sostenimiento',                accion:'Publicar el tablero de adherencia en la sede',      responsable:'Diana Rojas',    inicio:'2026-06-10', limite:'2026-06-18', estatus:'RETRASADA', reunion:'Pendiente la pantalla', descripcion:'Depende de compras',           resultados:'',                                mejora:'Tablero actualizado' })
      ]
    });

    set('mejorar.quick_improvement', {
      departamento:'Terapia física · sede norte', proceso:'Agendamiento de sesiones', fecha:'2026-06-05',
      antes:'La agenda mostraba cupos bloqueados y sin lista de espera: al cancelar un paciente el ' +
            'espacio quedaba perdido y el siguiente se corría hasta tres semanas.',
      accion:'Se habilitó sobrecupo del 15 %, se creó la lista de espera activa y se movió la ' +
             'confirmación a 48 horas antes con mensaje de texto.',
      despues:'Los cupos liberados se reasignan el mismo día desde la lista de espera y el intervalo ' +
              'entre sesiones bajó de 6,8 a 3,1 días.'
    });

    set('mejorar.descripcion_solucion', {
      problema: PROBLEMA,
      rows: [
        R({ causa: CAUSA, mejora:'Sobrecupo del 15 % y lista de espera activa', acciones:'Parametrización del software, regla documentada y capacitación', resultados:'Reprogramación del 32,4 % al 7,4 %' }),
        R({ causa:'Confirmación el mismo día', mejora:'Recordatorio automático 48 h antes', acciones:'Mensajería automática con confirmación y llamada de respaldo', resultados:'Confirmación del 54 % al 89 %' })
      ],
      acciones2:'Se documentó el estándar ET-TER-001 con las seis reglas del nuevo agendamiento.',
      acciones3:'Se capacitó al 100 % del personal de agendamiento de la sede.',
      acciones5:'Se dejó el indicador publicado en cartelera con actualización semanal.',
      conclusion:'Las dos soluciones cerraron el 63 % de las reprogramaciones del Pareto.'
    });

    set('mejorar.poka_yoke', {
      proceso:'Agendamiento de terapia física', producto:'Cita de terapia', fecha:'2026-05-29',
      causaRaiz: CAUSA, lider:'Ing. Ariel Ramírez', costoTotal:1850000,
      prueba:'Se simularon 40 cancelaciones en ambiente de pruebas.',
      resultado:'Ninguna cancelación pudo guardarse sin motivo y todos los cupos liberados se ofrecieron ' +
                'automáticamente al primero de la lista de espera.',
      estandar:'SÍ', planControl:'SÍ', aprobado:'Marcela Ospina',
      rows: [
        R({ paso:'Cancelación de una cita',  error:'Cancelar sin registrar el motivo', tipo:'Informativo (aviso, alarma, señal)',     nivel:'I · EVITAR (previene el error)',                       dispositivo:'El sistema no deja guardar sin elegir el motivo de una lista', responsable:'Marcela Ospina', fecha:'2026-05-29', estado:'Implementado', evidencia:'Captura del formulario' }),
        R({ paso:'Liberación de un cupo',    error:'Dejar el cupo vacío',              tipo:'Secuencial (obliga el orden de los pasos)',nivel:'I · EVITAR (previene el error)',                     dispositivo:'Al liberar un cupo el sistema ofrece el primero de la lista de espera', responsable:'Marcela Ospina', fecha:'2026-05-22', estado:'Validado', evidencia:'Log del software' }),
        R({ paso:'Confirmación del paciente',error:'No confirmar la asistencia',       tipo:'Informativo (aviso, alarma, señal)',      nivel:'II · PREVENIR (detecta el error antes del defecto)', dispositivo:'Alerta al coordinador si a 24 h no hay confirmación',           responsable:'Diana Rojas',    fecha:'2026-05-25', estado:'Implementado', evidencia:'Reporte de alertas' })
      ]
    });

    set('mejorar.a3_mejorar', {
      mejoras:'1. Sobrecupo del 15 % y lista de espera\n2. Recordatorio automático 48 h antes\n' +
              '3. Motivo obligatorio al cancelar\n4. Franja abierta en la tarde',
      tabla:'Antes: 32,4 % reprogramadas · 6,8 días entre sesiones · 58 % de ocupación.\n' +
            'Después: 7,4 % reprogramadas · 3,1 días entre sesiones · 81 % de ocupación.',
      controlar:'Sostener el sobrecupo y la confirmación anticipada con carta p semanal y plan de reacción.'
    });

    /* -------------------------------------------------- CONTROLAR ---- */
    set('controlar.estandar_1', {
      proceso:'Agendamiento de terapia física', documento:'ET-TER-001', pag:'1 de 1',
      realizo:'Ing. Ariel Ramírez', revisada:'Marcela Ospina', liberada:'Dra. Claudia Restrepo',
      seguridad:'Verificar la identidad del paciente antes de confirmar la cita.',
      otros:'Todo cambio de agenda queda registrado con usuario y motivo.',
      nota1:'Este estándar reemplaza la práctica informal de agendamiento vigente hasta mayo de 2026.',
      pasos: [
        R({ paso:'Recibir la autorización de la ARL', instruccion:'Validar vigencia y número de sesiones aprobadas.' }),
        R({ paso:'Agendar el ciclo completo',         instruccion:'Programar todas las sesiones con máximo 3 días de separación.' }),
        R({ paso:'Aplicar el sobrecupo del 15 %',     instruccion:'Habilitar el sobrecupo por franja según PC-TER-001.' })
      ],
      pasosDer: [
        R({ paso:'Registrar en la lista de espera',   instruccion:'Todo paciente sin cupo inmediato entra a la lista activa.' }),
        R({ paso:'Confirmar 48 horas antes',          instruccion:'Enviar el recordatorio automático y registrar la respuesta.' }),
        R({ paso:'Reasignar el cupo liberado',        instruccion:'Ofrecer el cupo al primero de la lista el mismo día.' })
      ]
    });

    set('controlar.plan_de_control', {
      proceso:'Agendamiento y ejecución de terapia física', producto:'Sesión de terapia',
      documento:'PC-TER-001', fecha:'2026-06-22', elaboro:'Ing. Ariel Ramírez',
      autorizacion:'Marcela Ospina', pag:'1 de 1',
      aprobado:'Dra. Claudia Restrepo · 22/06/2026', realizado:'Ing. Ariel Ramírez · 22/06/2026',
      actualizacion:'Revisión a los 3 meses de la entrega.',
      comentarios:'El plan se activa junto con el estándar ET-TER-001.',
      rows: [
        R({ paso:'Agendamiento', caracteristica:'Cupo con sobrecupo habilitado', variable:'Atributo (se cuenta)', especificaciones:'15 % ± 3 %', tecnica:'Reporte del software',  metodo:'Carta p semanal',  tamano:'Todas las citas', frecuencia:'Semanal', documento:'PC-TER-001', acciones:'Reparametrizar y avisar al proveedor',        responsable:'Marcela Ospina' }),
        R({ paso:'Confirmación', caracteristica:'Confirmación 48 h antes',       variable:'Atributo (se cuenta)', especificaciones:'≥ 85 %',     tecnica:'Log de mensajería',    metodo:'Carta p semanal',  tamano:'Todas las citas', frecuencia:'Semanal', documento:'PC-TER-001', acciones:'Refuerzo telefónico el mismo día',           responsable:'Diana Rojas' }),
        R({ paso:'Ejecución',    caracteristica:'Cita cumplida en la fecha',     variable:'Atributo (se cuenta)', especificaciones:'≤ 8 %',      tecnica:'Reporte del software',  metodo:'Carta p semanal',  tamano:'Todas las citas', frecuencia:'Semanal', documento:'PC-TER-001', acciones:'Analizar el motivo y activar el plan de reacción', responsable:'Marcela Ospina' }),
        R({ paso:'Registro',     caracteristica:'Motivo de cancelación',         variable:'Atributo (se cuenta)', especificaciones:'100 %',      tecnica:'Auditoría de registros',metodo:'Muestreo mensual', tamano:'30 registros',    frecuencia:'Mensual', documento:'PC-TER-001', acciones:'Retroalimentar al responsable',              responsable:'Andrés Correa' })
      ]
    });

    set('controlar.grafico_antes_despues', {
      criterio:'% de citas reprogramadas', direccion:'Menor es mejor',
      rows: BASE_LBL.map((lb, i) => R({ periodo: lb, antes: serie[i] }))
        .concat(MEJORA_LBL.map((lb, i) => R({ periodo: lb, despues: serie[i + 6] }))),
      comentarios:'La intervención arranca en marzo. El indicador se estabiliza por debajo de la meta ' +
                  'del 8 % a partir de julio.'
    });

    set('controlar.graficos_control', {
      proceso:'Agendamiento de terapia', caracteristica:'% de citas reprogramadas',
      tipoDato:'Atributo (unidades defectuosas: sí / no, pasa / no pasa)',
      muestra:'Variable', unidad:'%', frecuencia:'Semanal', responsable:'Marcela Ospina',
      carta:'(usar la recomendación automática)', usl:8, fecha:'2026-06-01', nMuestra:72,
      conclusion:'El proceso quedó estable alrededor del 7,4 %, por debajo de la meta del 8 %.',
      acciones:'Revisar semanalmente y activar el plan de reacción ante cualquier regla de Nelson.',
      frecuenciaRev:'Semanal', recalculo:'Recalcular los límites a los 3 meses o tras un cambio del proceso.',
      // carta p: por semana se registran las citas programadas y cuántas se reprogramaron.
      // La dispersión es la que corresponde a un proceso binomial con p ≈ 7,4 % y n ≈ 72
      // (σ ≈ 2,2 citas): una serie más plana que ésta dispararía la regla 7 de Nelson
      // —variabilidad sospechosamente baja— y el proceso saldría marcado como inestable.
      rows: [[72,8],[68,4],[74,7],[70,3],[76,6],[71,9],[69,5],[73,4],[75,7],[70,2],
             [72,6],[74,5],[68,8],[71,4],[73,3],[69,7],[72,5],[70,6],[74,4],[71,3]]
        .map((x, i) => R({ muestra:'Sem ' + (i + 1), tamano:x[0], defectuosos:x[1] }))
    });

    set('controlar.plan_reaccion', {
      proceso:'Agendamiento de terapia física', dueno:'Marcela Ospina', version:'1.0',
      fecha:'2026-06-22', vigencia:'2027-06-22', difusion:'Cartelera de la sede y correo al equipo',
      ubicacion:'Sistema de gestión · carpeta Terapia',
      entrenamiento:'Taller de 2 horas para el equipo de agendamiento, con evaluación.',
      auditoria:'Auditoría interna trimestral sobre 30 registros.',
      leccion:'El plan de reacción debe existir antes de cerrar el proyecto, no después.',
      rows: [
        R({ indicador:'% de citas reprogramadas', fuente:'Carta de control',       condicion:'> 8 % en una semana',        accion:'Revisar los motivos de la semana y reforzar la confirmación', responsable:'Marcela Ospina', tiempo:24, unidadT:'horas',    escalamiento:'Coordinación de la sede', registro:'Acta semanal',          estado:'Vigente' }),
        R({ indicador:'% de citas reprogramadas', fuente:'Carta de control',       condicion:'> 8 % dos semanas seguidas', accion:'Convocar al equipo y revisar la parametrización del sobrecupo',responsable:'Ariel Ramírez',  tiempo:48, unidadT:'horas',    escalamiento:'Comité ARL–Rehavid',      registro:'Informe de desviación', estado:'Vigente' }),
        R({ indicador:'% de confirmaciones',      fuente:'Indicador / KPI',        condicion:'< 85 % en una semana',       accion:'Activar el refuerzo telefónico y verificar la mensajería',      responsable:'Diana Rojas',    tiempo:24, unidadT:'horas',    escalamiento:'Coordinación de la sede', registro:'Log de mensajería',     estado:'Vigente' }),
        R({ indicador:'Punto fuera de control',   fuente:'Carta de control',       condicion:'Cualquier regla de Nelson',  accion:'Detener, analizar la causa especial y documentar',              responsable:'Laura Peña',     tiempo:30, unidadT:'minutos',  escalamiento:'Comité ARL–Rehavid',      registro:'Carta de control',      estado:'Vigente' })
      ]
    });

    set('controlar.a3_controlar', {
      control:'Carta p semanal del % de citas reprogramadas, con plan de reacción documentado.',
      estandarizacion:'Estándar de trabajo ET-TER-001 con las 6 reglas del nuevo agendamiento, ' +
                      'firmado y publicado en la sede.',
      beneficios:'Reprogramación del 32,4 % al 7,4 %. Intervalo entre sesiones de 6,8 a 3,1 días. ' +
                 'Ocupación de salas del 58 % al 81 %. Ahorro anualizado $ 46.800.000.'
    });

    set('controlar.a3_final', {
      proyecto:'Reducción de citas de terapia reprogramadas', area:'Terapia física · sede norte',
      periodo:'Marzo a junio de 2026', empresa:'Alimentos del Norte S.A.S. · ARL Positiva',
      fecha:'2026-06-30',
      definir:'32,4 % de citas reprogramadas contra una meta del 8 %. Costo anual $ 62.400.000.',
      medirAnalizar:'Nivel sigma 1,96 σ · RTY 67,6 %. Causa raíz: agendamiento sin sobrecupo, lista de ' +
                    'espera ni confirmación anticipada. 3 de 6 causas confirmadas con datos.',
      mejorar:'Sobrecupo del 15 %, lista de espera activa, recordatorio de 48 h y motivo obligatorio ' +
              'al cancelar. Piloto validado y desplegado.',
      controlar:'Estándar ET-TER-001, plan de control PC-TER-001 y carta p semanal con plan de reacción.',
      lecciones:'1. Validar las causas con datos evitó invertir en una sala adicional que no hacía falta.\n' +
                '2. El sobrecupo funcionó porque venía con lista de espera; por separado no habría servido.\n' +
                '3. Medir el motivo de la cancelación desde el primer día habría acortado el análisis.',
      reconocimiento:'Marcela Ospina y Diana Rojas sostuvieron el piloto en plena temporada alta. ' +
                     'Andrés Correa aportó la idea de la franja abierta de la tarde.'
    });

    completar();
    ST.save(true);
    return contarLlenas();
  }

  /* ====================================================================
     ILUSTRACIONES DE LA SIMULACIÓN
     Las casillas de imagen también son parte de la herramienta, así que la
     simulación las llena con figuras dibujadas aquí mismo en SVG: nada se
     descarga de fuera y se ve de inmediato qué va en cada recuadro.
     ================================================================== */
  const _e = (s) => String(s == null ? '' : s)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

  const svgURI = (w, h, cuerpo) => 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" width="' + w + '" height="' + h + '" viewBox="0 0 ' +
    w + ' ' + h + '" font-family="Segoe UI,Roboto,Helvetica,Arial,sans-serif">' + cuerpo + '</svg>');

  /** marco común: barra de título, cuerpo y pie. 380 × 250, cuerpo de 184 px */
  function marco(titulo, pie, cuerpo, tono){
    const c = tono === 'bad' ? '#C63A31' : tono === 'ok' ? '#0A9E5C' : '#2A1AA6';
    const W = 380, H = 250;
    return svgURI(W, H,
      '<rect width="' + W + '" height="' + H + '" rx="10" fill="#FFFFFF" stroke="#DDD9F5"/>' +
      '<path d="M1 11a10 10 0 0 1 10-10h358a10 10 0 0 1 10 10v21H1z" fill="' + c + '"/>' +
      '<text x="14" y="21" fill="#FFFFFF" font-size="12.5" font-weight="700">' + _e(titulo) + '</text>' +
      '<g transform="translate(0,38)">' + cuerpo + '</g>' +
      '<text x="14" y="' + (H - 10) + '" fill="#544D80" font-size="10.5">' + _e(pie) + '</text>');
  }

  /** rejilla de agenda semanal: cupos ocupados (verde) frente a cupos perdidos (rojo) */
  function escAgenda(conHuecos){
    const x0 = 16, y0 = 12, w = 66, h = 30, gx = 4, gy = 6;
    let g = '';
    ['Lun', 'Mar', 'Mié', 'Jue', 'Vie'].forEach((d, i) =>
      g += '<text x="' + (x0 + i * (w + gx) + w / 2) + '" y="' + y0 + '" text-anchor="middle" ' +
           'font-size="10.5" font-weight="700" fill="#544D80">' + d + '</text>');
    const huecos = conHuecos ? [1, 3, 6, 7, 9, 12, 13, 16, 18] : [14];
    for (let r = 0; r < 4; r++) for (let c = 0; c < 5; c++){
      const i = r * 5 + c, libre = huecos.indexOf(i) >= 0;
      const x = x0 + c * (w + gx), y = y0 + 8 + r * (h + gy);
      g += '<rect x="' + x + '" y="' + y + '" width="' + w + '" height="' + h + '" rx="5" fill="' +
           (libre ? '#FDECEA' : '#E8F7EF') + '" stroke="' + (libre ? '#C63A31' : '#0A9E5C') + '" stroke-width="1.2"/>' +
           '<text x="' + (x + w / 2) + '" y="' + (y + 19) + '" text-anchor="middle" font-size="9.5" ' +
           'font-weight="700" fill="' + (libre ? '#C63A31' : '#0A9E5C') + '">' +
           (libre ? 'cupo perdido' : 'atendida') + '</text>';
    }
    return g;
  }

  /** pantalla de software con una lista de renglones [texto, color] */
  function escPantalla(marca, lineas){
    let g = '<rect x="16" y="4" width="348" height="152" rx="8" fill="#F6F5FE" stroke="#DDD9F5"/>' +
            '<path d="M16 12a8 8 0 0 1 8-8h332a8 8 0 0 1 8 8v16H16z" fill="#2A1AA6"/>' +
            '<text x="28" y="21" fill="#FFFFFF" font-size="10.5" font-weight="700">' + _e(marca) + '</text>';
    lineas.slice(0, 5).forEach((l, i) => {
      const y = 46 + i * 22;
      g += '<rect x="26" y="' + (y - 13) + '" width="328" height="19" rx="4" fill="#FFFFFF" stroke="#E6E3F8"/>' +
           '<circle cx="39" cy="' + (y - 3) + '" r="4" fill="' + (l[1] || '#0A9E5C') + '"/>' +
           '<text x="52" y="' + (y + 1) + '" font-size="10" fill="#171043">' + _e(l[0]) + '</text>';
    });
    return g;
  }

  /** cartel o instructivo pegado en el puesto de trabajo */
  function escCartel(titulo, lineas, tono){
    const c = tono === 'ok' ? '#0A9E5C' : '#2A1AA6';
    let g = '<rect x="52" y="4" width="276" height="154" rx="6" fill="#FFFFFF" stroke="#C9C3EE" stroke-width="1.5"/>' +
            '<rect x="52" y="4" width="276" height="26" rx="6" fill="' + c + '"/>' +
            '<rect x="52" y="20" width="276" height="10" fill="' + c + '"/>' +
            '<text x="190" y="22" text-anchor="middle" fill="#FFFFFF" font-size="11" font-weight="700">' +
            _e(titulo) + '</text>';
    lineas.slice(0, 5).forEach((l, i) => {
      const y = 50 + i * 21;
      g += '<circle cx="70" cy="' + (y - 4) + '" r="7.5" fill="' + c + '" opacity=".12"/>' +
           '<text x="70" y="' + (y - 1) + '" text-anchor="middle" font-size="9" font-weight="700" fill="' + c + '">' +
           (i + 1) + '</text>' +
           '<text x="86" y="' + y + '" font-size="10" fill="#171043">' + _e(l) + '</text>';
    });
    return g;
  }

  /** barras verticales con etiqueta y valor */
  function escBarras(datos, tono){
    const c = tono === 'ok' ? '#0A9E5C' : tono === 'bad' ? '#C63A31' : '#3B26D3';
    const x0 = 30, base = 132, maxH = 104;
    const mx = Math.max.apply(null, datos.map(d => d[1])) || 1;
    const w = Math.min(46, (330 - x0) / datos.length - 8);
    let g = '<line x1="' + (x0 - 8) + '" y1="' + base + '" x2="352" y2="' + base + '" stroke="#DDD9F5" stroke-width="1.5"/>';
    datos.forEach((d, i) => {
      const h = Math.max(4, d[1] / mx * maxH), x = x0 + i * (w + 12), y = base - h;
      g += '<rect x="' + x + '" y="' + y + '" width="' + w + '" height="' + h + '" rx="3" fill="' + c + '" opacity="' +
           (0.45 + 0.55 * (d[1] / mx)) + '"/>' +
           '<text x="' + (x + w / 2) + '" y="' + (y - 5) + '" text-anchor="middle" font-size="9.5" ' +
           'font-weight="700" fill="' + c + '">' + _e(d[2] !== undefined ? d[2] : d[1]) + '</text>' +
           '<text x="' + (x + w / 2) + '" y="' + (base + 13) + '" text-anchor="middle" font-size="9" ' +
           'fill="#544D80">' + _e(d[0]) + '</text>';
    });
    return g;
  }

  /** esquema de causa-efecto para el recuadro del A3 */
  function escIshikawa(){
    const yc = 78;
    let g = '<line x1="24" y1="' + yc + '" x2="286" y2="' + yc + '" stroke="#2A1AA6" stroke-width="2.5"/>' +
            '<path d="M286 ' + (yc - 7) + ' L302 ' + yc + ' L286 ' + (yc + 7) + ' Z" fill="#2A1AA6"/>' +
            '<rect x="304" y="' + (yc - 26) + '" width="66" height="52" rx="6" fill="#FDECEA" stroke="#C63A31"/>' +
            '<text x="337" y="' + (yc - 8) + '" text-anchor="middle" font-size="10.5" font-weight="700" fill="#C63A31">32,4 %</text>' +
            '<text x="337" y="' + (yc + 5) + '" text-anchor="middle" font-size="8.5" fill="#C63A31">de citas</text>' +
            '<text x="337" y="' + (yc + 16) + '" text-anchor="middle" font-size="8.5" fill="#C63A31">reprogramadas</text>';
    const arriba = ['Método', 'Máquina', 'Medición'], abajo = ['Mano de obra', 'Material', 'Medio'];
    arriba.forEach((m, i) => {
      const xb = 70 + i * 74;
      g += '<line x1="' + xb + '" y1="' + yc + '" x2="' + (xb - 26) + '" y2="' + (yc - 46) + '" stroke="#5B49E8" stroke-width="1.8"/>' +
           '<text x="' + (xb - 26) + '" y="' + (yc - 52) + '" text-anchor="middle" font-size="9.5" font-weight="700" fill="#3B26D3">' + m + '</text>';
    });
    abajo.forEach((m, i) => {
      const xb = 70 + i * 74;
      g += '<line x1="' + xb + '" y1="' + yc + '" x2="' + (xb - 26) + '" y2="' + (yc + 46) + '" stroke="#5B49E8" stroke-width="1.8"/>' +
           '<text x="' + (xb - 26) + '" y="' + (yc + 58) + '" text-anchor="middle" font-size="9.5" font-weight="700" fill="#3B26D3">' + m + '</text>';
    });
    return g;
  }

  /** sala de espera: sillas ocupadas / vacías */
  function escSala(llena){
    let g = '<rect x="16" y="6" width="348" height="150" rx="8" fill="#F6F5FE" stroke="#DDD9F5"/>';
    for (let r = 0; r < 2; r++) for (let c = 0; c < 6; c++){
      const x = 40 + c * 52, y = 40 + r * 62;
      const ocupada = llena ? (r * 6 + c) !== 9 : (r * 6 + c) % 3 === 0;
      g += '<rect x="' + (x - 15) + '" y="' + (y + 8) + '" width="30" height="20" rx="4" fill="#C9C3EE"/>';
      if (ocupada)
        g += '<circle cx="' + x + '" cy="' + (y - 6) + '" r="9" fill="#3B26D3"/>' +
             '<path d="M' + (x - 13) + ' ' + (y + 10) + 'q13 -16 26 0z" fill="#3B26D3"/>';
    }
    g += '<text x="190" y="' + 146 + '" text-anchor="middle" font-size="10.5" font-weight="700" fill="' +
         (llena ? '#0A9E5C' : '#C63A31') + '">' +
         (llena ? '11 de 12 sillas ocupadas · sala al 92 %' : '4 de 12 sillas ocupadas · sala al 33 %') + '</text>';
    return g;
  }

  /* ====================================================================
     COMPLEMENTO DE LA SIMULACIÓN
     Cierra los formatos que el primer bloque dejaba en blanco, para que la
     herramienta se pueda recorrer completa sin encontrar una hoja vacía.
     Usa su propia semilla, así los datos ya generados no se mueven.
     ================================================================== */
  function completar(){
    let _t = 761203;
    const rr  = () => { _t = (_t * 1103515245 + 12345) % 2147483648; return _t / 2147483648; };
    const rint = (a, b) => a + Math.floor(rr() * (b - a + 1));

    /* ------------------------------------------------------ DEFINIR -- */
    set('definir.clarificacion_problema', {
      foto: marco('Agenda de terapia · sede norte',
                  'Franja de la tarde: 9 de 20 cupos se perdieron por cancelación', escAgenda(true), 'bad')
    });

    set('definir.project_charter', {
      firmasCie: [ R({ firma:'Aceptado — Champion',        fecha:'2026-06-30' }),
                   R({ firma:'Aceptado — Dueña del proceso', fecha:'2026-06-30' }),
                   R({ firma:'Aceptado — Finanzas',        fecha:'2026-06-30' }),
                   R({ firma:'Aceptado — Mentor',          fecha:'2026-06-30' }),
                   R({ firma:'Aceptado — Facilitador',     fecha:'2026-06-30' }) ]
    });

    set('definir.a3_definir', {
      grafSec2: marco('Motivo de la cita reprogramada',
                      'Los dos primeros motivos explican el 65 % de los 598 casos',
                      escBarras([['Sin aviso', 214], ['Choque\nhorario', 176], ['Transporte', 92],
                                 ['Clínico', 71], ['Otro', 45]]), 'bad')
    });

    /* -------------------------------------------------------- MEDIR -- */
    set('medir.swin_line', {
      proceso:'Programación y ejecución de una sesión de terapia física',
      customer:'Trabajador en rehabilitación',
      dep1:'Call center de agendamiento',
      dep2:'Autorizaciones ARL',
      dep3:'Recepción de la sede',
      dep4:'Terapia física',
      dep5:'Coordinación del servicio',
      dep6:'Facturación',
      dep7:'Sistemas / software de agenda',
      dep8:'Salud ocupacional de la empresa',
      timeline:'11,4 días desde la solicitud hasta la sesión ejecutada',
      distance:'Sin desplazamiento interno relevante: el flujo es de información, no de material',
      metrics:'% de citas reprogramadas · días entre sesiones · % de ocupación de salas',
      coments:'El flujo cruza siete áreas y ninguna es dueña del cupo liberado. Cuando el paciente ' +
              'cancela, el aviso llega a recepción pero no vuelve al call center, de modo que nadie ' +
              'reasigna el espacio. Los dos puntos de espera más largos están entre Autorizaciones ' +
              'y Call center (4,2 días) y entre la cancelación y la nueva cita (6,8 días).'
    });

    set('medir.process_mapping_detailed', {
      proceso:'Programación y ejecución de una sesión de terapia física',
      indicador:'% de citas reprogramadas · días entre sesiones',
      rows:[
        R({ steps:'Recibir la orden médica', kpiv:'Legibilidad y datos de contacto', specsIn:'100 % con teléfono verificado',
            gagesIn:'Lista de verificación de admisión', tipo:'Controlable', procesoTxt:'Radicación',
            kpov:'Orden radicada sin devolución', specsOut:'≤ 1 día hábil', gagesOut:'Reporte del sistema',
            calidad:'DPU 0,08', ciclo:420, distancia:0, costo:3200, obs:'8 % vuelve por teléfono errado' }),
        R({ steps:'Solicitar autorización a la ARL', kpiv:'Completitud del soporte clínico', specsIn:'Soporte completo',
            gagesIn:'Checklist de autorización', tipo:'Ruido', procesoTxt:'Autorización',
            kpov:'Autorización emitida', specsOut:'≤ 3 días hábiles', gagesOut:'Fecha de respuesta ARL',
            calidad:'RTY 88 %', ciclo:3600, distancia:0, costo:0, obs:'Fuera del control de la sede' }),
        R({ steps:'Asignar cupo en la agenda', kpiv:'Disponibilidad y franja ofrecida', specsIn:'Cupo dentro de 48 h',
            gagesIn:'Software de agenda', tipo:'Crítico', procesoTxt:'Agendamiento',
            kpov:'Cita programada', specsOut:'≤ 2 días desde la autorización', gagesOut:'Registro de agenda',
            calidad:'DPU 0,32', ciclo:300, distancia:0, costo:8900, obs:'Sin sobrecupo ni lista de espera' }),
        R({ steps:'Confirmar la cita con el paciente', kpiv:'Anticipación del contacto', specsIn:'48 h antes',
            gagesIn:'Bitácora de llamadas', tipo:'Crítico', procesoTxt:'Confirmación',
            kpov:'Cita confirmada', specsOut:'≥ 90 % confirmadas', gagesOut:'Reporte de confirmación',
            calidad:'FTY 54 %', ciclo:180, distancia:0, costo:12400, obs:'Paso ausente antes de la mejora' }),
        R({ steps:'Recibir al paciente en recepción', kpiv:'Puntualidad y documentos', specsIn:'Llegada 10 min antes',
            gagesIn:'Registro de ingreso', tipo:'Estándar (SOP)', procesoTxt:'Admisión',
            kpov:'Paciente admitido', specsOut:'≤ 5 min', gagesOut:'Marca de hora del sistema',
            calidad:'DPU 0,04', ciclo:300, distancia:12, costo:1800, obs:'' }),
        R({ steps:'Ejecutar la sesión de terapia', kpiv:'Disponibilidad del terapeuta y de la sala', specsIn:'Sala y terapeuta asignados',
            gagesIn:'Programación de recursos', tipo:'Controlable', procesoTxt:'Terapia',
            kpov:'Sesión ejecutada', specsOut:'45 min', gagesOut:'Historia clínica',
            calidad:'RTY 96 %', ciclo:2700, distancia:25, costo:0, obs:'' }),
        R({ steps:'Registrar la evolución', kpiv:'Oportunidad del registro', specsIn:'Mismo día',
            gagesIn:'Historia clínica electrónica', tipo:'Estándar (SOP)', procesoTxt:'Registro',
            kpov:'Evolución registrada', specsOut:'100 % el mismo día', gagesOut:'Auditoría de historias',
            calidad:'DPU 0,06', ciclo:420, distancia:0, costo:2100, obs:'' }),
        R({ steps:'Programar la sesión siguiente', kpiv:'Cupo disponible en la semana', specsIn:'≤ 3 días',
            gagesIn:'Software de agenda', tipo:'Crítico', procesoTxt:'Agendamiento',
            kpov:'Siguiente cita en firme', specsOut:'≤ 3 días', gagesOut:'Registro de agenda',
            calidad:'DPU 0,29', ciclo:240, distancia:0, costo:7600, obs:'Aquí nace el intervalo de 6,8 días' }),
        R({ steps:'Gestionar la cancelación', kpiv:'Aviso oportuno y motivo registrado', specsIn:'Aviso ≥ 24 h',
            gagesIn:'Bitácora de cancelaciones', tipo:'Ruido', procesoTxt:'Reprogramación',
            kpov:'Cupo reasignado', specsOut:'≥ 70 % reasignados', gagesOut:'Reporte de ocupación',
            calidad:'FTY 12 %', ciclo:600, distancia:0, costo:18700, obs:'El cupo se pierde: nadie lo reasigna' }),
        R({ steps:'Facturar el servicio a la ARL', kpiv:'Soporte completo de la sesión', specsIn:'Historia y firma',
            gagesIn:'Revisión de facturación', tipo:'Estándar (SOP)', procesoTxt:'Facturación',
            kpov:'Factura radicada', specsOut:'≤ 5 días', gagesOut:'Radicado ARL',
            calidad:'DPU 0,11', ciclo:900, distancia:0, costo:4300, obs:'' })
      ],
      flujo: marco('Flujo real observado en la sede',
                   'La cancelación no regresa al agendamiento: ahí se pierde el cupo',
                   escPantalla('Ruta de una sesión de terapia', [
                     ['1 · Orden médica radicada', '#0A9E5C'],
                     ['2 · Autorización ARL — 4,2 días de espera', '#E8A020'],
                     ['3 · Cupo asignado sin confirmar', '#E8A020'],
                     ['4 · Cancelación registrada en recepción', '#C63A31'],
                     ['5 · Cupo liberado — nadie lo reasigna', '#C63A31']]), 'bad')
    });

    set('medir.hojas_verificacion', {
      proceso:'Terapia física · sede norte', fecha:'2026-03-24', turno:'TARDE',
      responsable:'Diana Rojas — auxiliar de recepción',
      metrico:'Citas reprogramadas por motivo',
      equipo:'Bitácora de recepción y reporte del software de agenda',
      instrucciones:'Marque una cuenta por cada cita que no se ejecutó en la fecha pactada. ' +
        'Registre el motivo tal como lo declaró quien canceló, sin interpretarlo. Si no hubo motivo ' +
        'declarado, use «Sin aviso». Cierre la hoja al final de cada jornada y entréguela a coordinación.',
      rows:[
        R({ criterio:'No asistió y no avisó',                 conteo:214, obs:'Se detecta al pasar lista' }),
        R({ criterio:'Choque con el horario laboral',          conteo:176, obs:'Concentrado en la franja de la tarde' }),
        R({ criterio:'Problema de transporte',                 conteo:92,  obs:'Días de lluvia y paro de transporte' }),
        R({ criterio:'Motivo clínico del paciente',            conteo:71,  obs:'Justificado con soporte médico' }),
        R({ criterio:'Terapeuta no disponible',                conteo:18,  obs:'Incapacidad y vacaciones' }),
        R({ criterio:'Sala ocupada por otro servicio',         conteo:11,  obs:'Cruce con valoración ocupacional' }),
        R({ criterio:'Autorización de la ARL vencida',         conteo:9,   obs:'Vence a los 30 días' }),
        R({ criterio:'Error de agenda (doble cita)',           conteo:5,   obs:'Fallo de digitación' }),
        R({ criterio:'Paciente ya de alta',                    conteo:2,   obs:'No se depuró la agenda' }),
        R({ criterio:'Otro',                                   conteo:0,   obs:'' })
      ],
      proceso2:'Terapia física · sede norte', fecha2:'2026-03-25', turno2:'TARDE',
      responsable2:'Marcela Ospina — coordinadora',
      metrico2:'Cupos de la tarde por estado',
      equipo2:'Tablero de sala y planilla de ocupación',
      producto2:'Sesión de terapia física ocupacional',
      instrucciones2:'Al cierre de la jornada dibuje una marca por cada cupo según su estado. ' +
        'Un cupo perdido es el que quedó sin paciente y sin reasignar.',
      registro2:'Tarde del 25/03 · 20 cupos programados\n' +
                'Atendidos      ▌▌▌▌▌ ▌▌▌▌▌ ▌\n' +
                'Reasignados    ▌▌\n' +
                'Perdidos       ▌▌▌▌▌ ▌▌\n' +
                'Los 7 cupos perdidos son 3,5 horas de sala ociosa en una sola jornada.',
      simbolos:[ R({ simbolo:'▌ Cupo atendido',              total:11 }),
                 R({ simbolo:'▌ Cupo reasignado a otro',     total:2  }),
                 R({ simbolo:'▌ Cupo perdido',               total:7  }),
                 R({ simbolo:'▌ Cupo bloqueado por la sede', total:0  }) ]
    });

    set('medir.msa_plan', {
      proceso:'Medición del cumplimiento de la agenda de terapia',
      area:'Sede norte · terapia física', fecha:'2026-03-23',
      lider:'Ing. Ariel Ramírez — Rehavid', analista:'Andrés Correa',
      periodicidad:'Al inicio del proyecto',
      caracteristica:'Días transcurridos entre dos sesiones consecutivas',
      lsl:0, usl:3, resGage:0.5,
      rows:[
        R({ variable:'Días entre sesiones (Y)', gage:'Reporte de fechas del software de agenda', resolucion:'0,5 día',
            tolerancia:3, tipo:'GR&R por variables', quien:'Andrés Correa', cuando:'2026-03-25',
            criterio:'%GRR ≤ 30 % y ndc ≥ 5', estado:'Aceptado' }),
        R({ variable:'Clasificación del motivo de cancelación (X)', gage:'Criterio del auxiliar sobre la bitácora',
            resolucion:'Categoría', tolerancia:0, tipo:'GR&R por atributos', quien:'Marcela Ospina', cuando:'2026-03-26',
            criterio:'Concordancia ≥ 90 % con el experto', estado:'Marginal' }),
        R({ variable:'¿La cita se ejecutó? (Y binaria)', gage:'Marca de asistencia del sistema', resolucion:'Sí / No',
            tolerancia:0, tipo:'GR&R por atributos', quien:'Diana Rojas', cuando:'2026-03-26',
            criterio:'Concordancia 100 %', estado:'Aceptado' }),
        R({ variable:'Duración real de la sesión (X)', gage:'Marca de hora de inicio y cierre', resolucion:'1 min',
            tolerancia:10, tipo:'Linealidad y sesgo', quien:'Andrés Correa', cuando:'2026-03-27',
            criterio:'Sesgo ≤ 2 min en todo el rango', estado:'Aceptado' }),
        R({ variable:'% de ocupación de salas (Y)', gage:'Planilla de ocupación', resolucion:'1 cupo',
            tolerancia:20, tipo:'Estabilidad', quien:'Marcela Ospina', cuando:'2026-04-02',
            criterio:'Sin corrimiento entre semanas', estado:'En ejecución' }),
        R({ variable:'Anticipación del aviso de cancelación (X)', gage:'Hora registrada en la bitácora',
            resolucion:'1 hora', tolerancia:24, tipo:'GR&R por variables', quien:'Diana Rojas', cuando:'2026-03-30',
            criterio:'%GRR ≤ 30 %', estado:'Programado' }),
        R({ variable:'Franja horaria de la cita (X)', gage:'Campo del software', resolucion:'Franja',
            tolerancia:0, tipo:'GR&R por atributos', quien:'Andrés Correa', cuando:'2026-03-30',
            criterio:'Concordancia 100 %', estado:'Aceptado' }),
        R({ variable:'Costo de la sesión perdida', gage:'Tarifa contractual con la ARL', resolucion:'$ 1',
            tolerancia:0, tipo:'Estabilidad', quien:'Jorge Delgado', cuando:'2026-04-06',
            criterio:'Tarifa vigente confirmada', estado:'Aceptado' })
      ],
      acciones:[
        R({ hallazgo:'Dos auxiliares clasifican distinto el mismo motivo de cancelación',
            causa:'Método / criterio', accion:'Definir por escrito los 10 motivos con un ejemplo cada uno',
            responsable:'Marcela Ospina', fecha:'2026-03-27',
            verificacion:'Repetir el GR&R por atributos y superar 90 % de concordancia', estado:'Cerrada' }),
        R({ hallazgo:'«Sin aviso» y «no asistió» se usaban como sinónimos',
            causa:'Método / criterio', accion:'Fundir ambas en una sola categoría en el instructivo',
            responsable:'Diana Rojas', fecha:'2026-03-27',
            verificacion:'Revisión de 30 registros posteriores', estado:'Cerrada' }),
        R({ hallazgo:'La hora de cancelación se digitaba a mano y quedaba en blanco',
            causa:'Repetibilidad (equipo)', accion:'Volver obligatorio el campo en el formulario del sistema',
            responsable:'Sistemas', fecha:'2026-04-01',
            verificacion:'0 registros en blanco durante una semana', estado:'Cerrada' }),
        R({ hallazgo:'El reporte de días entre sesiones redondeaba a días completos',
            causa:'Resolución', accion:'Exportar la fecha con hora para conservar el medio día',
            responsable:'Sistemas', fecha:'2026-04-01',
            verificacion:'Resolución de 0,5 día en el archivo exportado', estado:'Cerrada' }),
        R({ hallazgo:'La planilla de ocupación se llenaba al final de la semana, de memoria',
            causa:'Estabilidad', accion:'Registrar el cierre de cada jornada antes de salir',
            responsable:'Marcela Ospina', fecha:'2026-04-03',
            verificacion:'Auditoría sorpresa de dos jornadas', estado:'En curso' }),
        R({ hallazgo:'No hay patrón de referencia para el juicio del motivo',
            causa:'Exactitud (sesgo)', accion:'La coordinadora fija el estándar sobre 30 casos históricos',
            responsable:'Marcela Ospina', fecha:'2026-03-26',
            verificacion:'Panel de 30 casos firmado', estado:'Cerrada' })
      ],
      decision:'SÍ, el sistema de medición es válido',
      observaciones:'La medición de la Y principal (días entre sesiones) quedó válida: %GR&R del ' +
        '17,06 % sobre la variación del estudio, 97,09 % de contribución parte a parte y 8 categorías ' +
        'distinguibles, muy por encima del mínimo de 5. Ojo con el %Tolerancia: 62,62 % frente a una ' +
        'ventana de apenas 3 días, lo que significa que el instrumento sirve para comparar pacientes ' +
        'pero no para decidir sobre un caso individual al filo de la especificación; se acepta porque ' +
        'el proyecto trabaja sobre el promedio del proceso, no sobre la sesión suelta. La clasificación ' +
        'del motivo sigue MARGINAL: 80 % de concordancia por caso (8 de 10 casos con acuerdo total) y ' +
        'kappa de Fleiss de 0,722; las dos discrepancias son del mismo evaluador y ya tiene ' +
        'reentrenamiento asignado. No bloquea la línea base, porque la Y se toma de las fechas del ' +
        'sistema y no del juicio del auxiliar. Se autoriza recolectar a partir del 30 de marzo.'
    });

    set('medir.resumen_grafico', {
      variable:'Días entre dos sesiones consecutivas de terapia', unidad:'días',
      conf:'95 %', periodo:'Línea base · agosto 2025 a enero 2026 (180 citas)',
      responsable:'Andrés Correa', fecha:'2026-03-30',
      rows:(function(){
        const o = [];
        for (let i = 0; i < 40; i++){
          const u1 = Math.max(1e-9, rr()), u2 = rr();
          const v = 6.8 + 2.1 * Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
          o.push(R({ valor: round(Math.max(1, v), 1),
                     nota: v > 11 ? 'Cita reprogramada dos veces' : '' }));
        }
        return o;
      })(),
      lectura:'La media es de 7,01 días contra una ventana clínica de 1 a 4. Los datos pasan la ' +
        'prueba de normalidad (Anderson-Darling p = 0,8881) y la asimetría es de apenas 0,2, así que ' +
        'no hay un grupo aparte de pacientes «difíciles»: todo el proceso está corrido, no unos pocos ' +
        'casos extremos. El intervalo de confianza del 95 % para la media va de 6,28 a 7,74 días y no ' +
        'toca el límite de 4, de modo que la brecha no es azar del muestreo. La dispersión también ' +
        'estorba: con una desviación de 2,27 días los valores van de 2,2 a 13,4, y el caso de 13,4 ' +
        'corresponde a un paciente reprogramado dos veces. Hay que mover la media y estrechar la ' +
        'variación; con una sola de las dos no se alcanza la ventana.'
    });

    set('medir.capacidad_proceso', {
      conclusion:'El proceso no es capaz y el problema no es la dispersión sino la ubicación: con ' +
        'Cp 0,28 la variación ya es demasiado ancha para una ventana de 1 a 4 días, pero el Cpk de ' +
        '−0,45 dice algo más grave: la media (6,8 días) está por encima del límite superior, así que ' +
        'la mayoría de las sesiones se separa más de lo aceptable. Eso lo confirman las 875.000 PPM ' +
        'observadas y el rendimiento esperado del 7,99 %: hoy menos de una de cada diez sesiones cae ' +
        'dentro de la ventana clínica. Un nivel sigma de 0,09 σ deja claro que no hay nada que ajustar ' +
        'con controles: centrar el proceso exige quitar la causa. El paso siguiente es ANALIZAR y ' +
        'confirmar con datos por qué se pierde el cupo, no apretar la vigilancia sobre un proceso que ' +
        'aún no sabe dar la fecha correcta.'
    });

    set('medir.msa_grr', {
      atributo:'Clasificación del motivo por el cual la cita no se ejecutó',
      experto:'Marcela Ospina — coordinadora del servicio', fechaAtr:'2026-03-26',
      nMuestras:10, nEvaluadores:3, nEnsayos:1,
      attr:(function(){
        const est = ['Aceptar', 'Rechazar', 'Aceptar', 'Aceptar', 'Rechazar',
                     'Aceptar', 'Rechazar', 'Aceptar', 'Aceptar', 'Rechazar'];
        const ev = ['Diana Rojas', 'Andrés Correa', 'Luis Cardona'];
        const o = [];
        for (let p = 0; p < 10; p++) for (let e = 0; e < 3; e++){
          // discrepancia deliberada en los casos 5 y 9 del tercer evaluador
          const falla = (e === 2 && (p === 4 || p === 8));
          o.push(R({ parte:'Caso ' + (p + 1), evaluador:ev[e], ensayo:1,
                     resultado: falla ? (est[p] === 'Aceptar' ? 'Rechazar' : 'Aceptar') : est[p],
                     estandar: est[p] }));
        }
        return o;
      })()
    });

    set('medir.a3_medir', {
      evidencia: marco('Motivos de reprogramación · semestre base',
                       '598 citas reprogramadas de 1.847 programadas (32,4 %)',
                       escBarras([['Sin aviso', 214], ['Horario', 176], ['Transporte', 92],
                                  ['Clínico', 71], ['Otros', 45]]), 'bad')
    });

    /* ----------------------------------------------------- ANALIZAR -- */
    set('analizar.prueba_hipotesis', {
      causa:'La franja de la tarde concentra las citas que no se ejecutan',
      fecha:'2026-04-24',
      variable:'Citas reprogramadas sobre las programadas en la semana', unidad:'%',
      factor:'Franja horaria de la cita (mañana / tarde)',
      alfa:'0,05',
      fuente:'Reporte semanal del software de agenda · ago-2025 a ene-2026 (24 semanas)',
      objetivo:'MEDIAS', pruebaMedias:'T2', varIguales:'WELCH',
      mu0:8, pruebaMedianas:'KW', pruebaVar:'LEVENE', pruebaProp:'P2', p0:8,
      rows:(function(){
        const o = [];
        const gen = (mu, sd, n, g) => {
          for (let i = 0; i < n; i++){
            const u1 = Math.max(1e-9, rr()), u2 = rr();
            o.push(R({ valor: round(Math.max(0, mu + sd * Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2)), 1),
                       grupo: g, obs:'' }));
          }
        };
        gen(23.6, 4.2, 12, 'Mañana');
        gen(41.2, 5.8, 12, 'Tarde');
        return o;
      })(),
      props:[ R({ grupo:'Mañana', x:218, n:924 }),
              R({ grupo:'Tarde',  x:380, n:923 }),
              R({ grupo:'Meta institucional', x:148, n:1847 }) ],
      veredicto:'SÍ — la causa afecta el resultado y pasa a MEJORAR',
      accion:'Intervenir primero la franja de la tarde: sobrecupo, lista de espera y confirmación a 48 h',
      conclusion:'La tarde reprograma casi el doble que la mañana (42,0 % frente a 23,8 % en las 24 ' +
        'semanas medidas). La diferencia es de 18,2 puntos y la prueba la respalda: la probabilidad de ' +
        'que una brecha así sea casualidad del muestreo es menor a 1 en 10.000. En lenguaje llano: ' +
        'el horario de la tarde no es ' +
        'una coincidencia, es parte del problema, porque choca con la jornada laboral del trabajador. ' +
        'Cualquier solución que no toque la tarde deja fuera dos tercios del defecto.'
    });

    set('analizar.niveles_causa', {
      problema:'El 32,4 % de las citas de terapia programadas entre agosto de 2025 y enero de 2026 ' +
        'no se ejecutaron en la fecha pactada, frente a una meta del 8 %.',
      fecha:'2026-04-28', equipo:'Marcela Ospina, Diana Rojas, Andrés Correa e Ing. Ariel Ramírez',
      metodo:'Ishikawa + 5 Why´s',
      rows:[
        R({ causa:'32,4 % de citas reprogramadas', origen:'Indicador del proyecto', nivel:'SÍNTOMA',
            porque:'Porque los cupos se liberan y no se vuelven a usar', evidencia:'1.847 programadas / 598 reprogramadas',
            accionable:'NO', raiz:'NO' }),
        R({ causa:'Salas a media ocupación con la agenda llena', origen:'Observación en sede', nivel:'SÍNTOMA',
            porque:'Porque el cupo sigue reservado a un paciente que ya canceló', evidencia:'Ocupación 58 % con agenda al 100 %',
            accionable:'NO', raiz:'NO' }),
        R({ causa:'El paciente no avisa que no viene', origen:'Hoja de verificación', nivel:'CAUSA APARENTE',
            porque:'Porque nadie lo contacta antes de la cita', evidencia:'214 de 598 casos (35,8 %)',
            accionable:'SI', raiz:'NO' }),
        R({ causa:'La cita choca con la jornada laboral', origen:'Prueba de hipótesis', nivel:'CAUSA APARENTE',
            porque:'Porque se asigna la franja disponible, no la que le sirve al trabajador', evidencia:'Tarde 41,2 % vs mañana 23,6 %',
            accionable:'SI', raiz:'NO' }),
        R({ causa:'El cupo liberado no se reasigna', origen:'Mapa detallado del proceso', nivel:'CAUSA RAÍZ',
            porque:'Porque el software no admite sobrecupo ni lista de espera', evidencia:'12 % de reasignación efectiva',
            accionable:'SI', raiz:'SI' }),
        R({ causa:'No existe lista de espera', origen:'5 Why´s', nivel:'CAUSA RAÍZ',
            porque:'Porque nunca se configuró el módulo y nadie es dueño del cupo liberado', evidencia:'Parametrización del software',
            accionable:'SI', raiz:'SI' }),
        R({ causa:'No hay confirmación previa a la cita', origen:'5 Why´s', nivel:'CAUSA RAÍZ',
            porque:'Porque el proceso no tiene ese paso definido', evidencia:'Paso ausente en el mapa del proceso',
            accionable:'SI', raiz:'SI' }),
        R({ causa:'La cancelación no regresa al agendamiento', origen:'SWIM LINE', nivel:'CAUSA APARENTE',
            porque:'Porque recepción y call center no comparten el aviso', evidencia:'Corte de información entre dos carriles',
            accionable:'SI', raiz:'NO' }),
        R({ causa:'Transporte del paciente', origen:'Hoja de verificación', nivel:'CAUSA APARENTE',
            porque:'Porque depende de terceros y del clima', evidencia:'92 de 598 casos (15,4 %)',
            accionable:'NO', raiz:'NO' }),
        R({ causa:'Motivo clínico del paciente', origen:'Hoja de verificación', nivel:'CAUSA APARENTE',
            porque:'Porque es propio de la rehabilitación', evidencia:'71 de 598 casos (11,9 %)',
            accionable:'NO', raiz:'NO' }),
        R({ causa:'Autorización de la ARL vencida', origen:'Mapa detallado del proceso', nivel:'CAUSA APARENTE',
            porque:'Porque vence a los 30 días y nadie la vigila', evidencia:'9 casos',
            accionable:'SI', raiz:'NO' }),
        R({ causa:'Terapeuta o sala no disponibles', origen:'Hoja de verificación', nivel:'CAUSA APARENTE',
            porque:'Porque la programación de recursos se hace semanal', evidencia:'29 casos entre ambos',
            accionable:'SI', raiz:'NO' })
      ],
      causaRaiz:'El cupo que se libera no se reasigna, porque el agendamiento no tiene sobrecupo, ' +
        'ni lista de espera, ni confirmación anticipada: la ausencia de un paciente se convierte ' +
        'automáticamente en una hora de sala perdida.',
      descripcion:'Es la causa raíz porque explica los tres síntomas a la vez: la agenda llena con ' +
        'salas vacías, el intervalo de 7,0 días entre sesiones y la concentración en la tarde. Las dos ' +
        'primeras categorías de la hoja de verificación —no asistió y no avisó (214) y choque con el ' +
        'horario laboral (176)— suman 390 de los 598 casos, el 65,2 %, y ambas desembocan aquí: si el ' +
        'cupo liberado se reasignara, ninguna de las dos terminaría en una hora de sala perdida. Es ' +
        'además accionable, porque depende de la parametrización del software y del proceso, no de ' +
        'terceros. Transporte (92) y motivo clínico (71) suman el 27,3 % restante, dependen de ' +
        'terceros y no se intervienen en este proyecto.',
      siguiente:'En MEJORAR se diseñan tres soluciones ligadas a esta raíz: sobrecupo del 15 % en la ' +
        'franja de la tarde, lista de espera activa que reasigne el cupo liberado el mismo día, y ' +
        'recordatorio con confirmación a 48 horas con motivo obligatorio al cancelar. Se prueban en ' +
        'piloto de cuatro semanas antes de desplegarlas.'
    });

    set('analizar.5_whys', {
      w1_how4:'Revisión de la parametrización del software con el proveedor: el módulo existe pero nunca se activó',
      w2_how3:'Comparación de las 24 semanas por franja: la tarde reprograma 17,6 puntos más que la mañana',
      w2_why4:'Porque la franja se asigna según el cupo libre, no según la jornada del trabajador',
      w2_nec4:'SI',
      w2_how4:'Auditoría de 60 asignaciones: en 52 no se preguntó la disponibilidad del paciente',
      w2_why5:'Porque el guion de agendamiento no incluye esa pregunta',
      w2_nec5:'SI',
      w2_how5:'Lectura del guion vigente del call center: no aparece la pregunta por la jornada'
    });

    set('analizar.tree_diagram', {
      nodos:[
        R({ nivel:'1', tipo:'WHY', texto:'¿Por qué se reprograma el 32,4 % de las citas?',
            evid:'598 de 1.847 citas del semestre base' }),
        R({ nivel:'2', tipo:'WHY', texto:'Porque el paciente no llega y el cupo queda vacío',
            evid:'214 casos sin aviso · 176 por choque de horario' }),
        R({ nivel:'2', tipo:'WHY', texto:'Porque la cita choca con la jornada laboral',
            evid:'Tarde 41,2 % frente a mañana 23,6 %' }),
        R({ nivel:'3', tipo:'WHY', texto:'Porque nadie confirma la cita con anticipación',
            evid:'El paso no existe en el mapa del proceso' }),
        R({ nivel:'3', tipo:'WHY', texto:'Porque el cupo liberado no se ofrece a otro paciente',
            evid:'Sólo el 12 % de los cupos se reasigna' }),
        R({ nivel:'3', tipo:'WHY', texto:'Porque la franja se asigna por disponibilidad de la sede',
            evid:'52 de 60 asignaciones sin preguntar al paciente' }),
        R({ nivel:'4', tipo:'ROOT CAUSE', texto:'El software de agenda no admite sobrecupo ni lista de espera',
            evid:'Módulo nunca parametrizado · confirmado con el proveedor' }),
        R({ nivel:'4', tipo:'ROOT CAUSE', texto:'No hay un responsable del cupo que se libera',
            evid:'La cancelación queda en recepción y no vuelve al call center' }),
        R({ nivel:'4', tipo:'ROOT CAUSE', texto:'El guion de agendamiento no pregunta por la jornada del trabajador',
            evid:'Guion vigente del call center' })
      ]
    });

    set('analizar.a3_analizar', {
      ishikawa_img: marco('Causa y efecto · 6M',
                          'Método, medición y mano de obra concentran las causas confirmadas',
                          escIshikawa())
    });

    /* ------------------------------------------------------ MEJORAR -- */
    set('mejorar.modelos_mejora', {
      proceso:'Programación y ejecución de una sesión de terapia física',
      causaRaiz:'El cupo liberado no se reasigna: no hay sobrecupo, lista de espera ni confirmación previa',
      lider:'Ing. Ariel Ramírez — Rehavid', fecha:'2026-05-14',
      aprobacion:'SÍ', presupuesto:9800000,
      rows:[
        R({ modelo:'Trabajo estandarizado', problema:'Cada auxiliar agenda con un criterio distinto',
            aplica:'SÍ, se aplicará', alcance:'Call center y recepción de la sede norte',
            responsable:'Marcela Ospina', fechaObj:'2026-05-22', estado:'Implementado',
            resultado:'Guion único de agendamiento y confirmación', validacion:'Auditoría de 30 llamadas' }),
        R({ modelo:'Gestión visual', problema:'Nadie ve el cupo que se acaba de liberar',
            aplica:'SÍ, se aplicará', alcance:'Tablero de la sala de terapia',
            responsable:'Diana Rojas', fechaObj:'2026-05-25', estado:'Implementado',
            resultado:'Cupo libre visible en menos de 10 minutos', validacion:'Observación en dos jornadas' }),
        R({ modelo:'Kanban', problema:'La lista de espera no existía',
            aplica:'SÍ, se aplicará', alcance:'Pacientes con autorización vigente',
            responsable:'Andrés Correa', fechaObj:'2026-05-29', estado:'Validado',
            resultado:'Reasignación del cupo el mismo día', validacion:'% de cupos reasignados ≥ 70 %' }),
        R({ modelo:'Flujo continuo', problema:'6,8 días entre una sesión y la siguiente',
            aplica:'SÍ, se aplicará', alcance:'Programación de la serie completa de terapia',
            responsable:'Marcela Ospina', fechaObj:'2026-06-05', estado:'En curso',
            resultado:'Serie agendada de una vez al iniciar el tratamiento', validacion:'Días entre sesiones ≤ 3' }),
        R({ modelo:'5S', problema:'La bitácora de cancelaciones se llevaba en hojas sueltas',
            aplica:'POR EVALUAR', alcance:'Puesto de recepción',
            responsable:'Diana Rojas', fechaObj:'2026-06-12', estado:'No iniciado',
            resultado:'Registro único en el sistema', validacion:'0 registros en papel' }),
        R({ modelo:'SMED', problema:'Tiempo de alistamiento entre pacientes',
            aplica:'NO aplica', alcance:'—', responsable:'—', fechaObj:'',
            estado:'Descartado', resultado:'El alistamiento no es la restricción', validacion:'—' })
      ],
      // el «antes» es el Ppk que calcula MEDIR › Capacidad del proceso con la línea base
      ppkAntes:-0.47, ppkDespues:1.11,
      mejoraSignificativa:'La combinación de lista de espera activa (Kanban) con el recordatorio de ' +
        '48 horas y el sobrecupo del 15 % en la tarde. Por separado ninguna alcanzó la meta en el ' +
        'piloto: el sobrecupo sin lista de espera sólo movió el indicador del 32,4 % al 26 %. Juntas ' +
        'lo llevaron al 7,4 %. Esas tres son las que pasan a CONTROLAR.',
      evidencia:'Piloto de cuatro semanas (4 al 29 de mayo) sobre la franja de la tarde: 312 citas ' +
        'programadas, 23 reprogramadas (7,4 %). El Ppk del intervalo entre sesiones pasó de −0,47 ' +
        '—la media estaba por fuera del límite superior— a 1,11, es decir de un proceso que no daba ' +
        'la fecha correcta a uno que la cumple con margen. La prueba de dos proporciones confirma que ' +
        'la diferencia no es del azar. La ocupación de salas subió del 58 % al 81 % sin contratar ' +
        'personal ni habilitar una sala nueva.'
    });

    set('mejorar.quick_improvement', {
      imgAntes:   marco('Antes · agenda de la tarde', 'Nueve cupos perdidos en una semana', escAgenda(true), 'bad'),
      imgAccion:  marco('Acción · lista de espera', 'El cupo liberado se ofrece el mismo día',
                        escPantalla('Agenda — cupo liberado', [
                          ['Cupo libre: martes 3:00 p. m.', '#E8A020'],
                          ['Siguiente en lista: J. Herrera', '#0A9E5C'],
                          ['Aviso enviado — 2 min', '#0A9E5C'],
                          ['Confirmado por el paciente', '#0A9E5C'],
                          ['Cupo reasignado el mismo día', '#0A9E5C']]), 'ok'),
      imgDespues: marco('Después · agenda de la tarde', 'Un solo cupo perdido en la misma semana', escAgenda(false), 'ok'),
      bigAntes:   marco('Sala de terapia · antes', 'Agenda llena en el sistema, sala a un tercio', escSala(false), 'bad'),
      bigDespues: marco('Sala de terapia · después', 'Misma capacidad instalada, 92 % de uso', escSala(true), 'ok'),

      f2_antes:'El paciente se enteraba de su cita sólo cuando se la asignaban, semanas antes, ' +
               'y nadie volvía a contactarlo. Si algo cambiaba en su jornada, simplemente no llegaba.',
      f2_accion:'Recordatorio automático 48 horas antes por mensaje de texto, con dos opciones: ' +
                'confirmar o reprogramar en el momento. Si reprograma, debe elegir el motivo de una lista.',
      f2_despues:'El 91 % de las citas se confirma antes de la jornada y la reprogramación ocurre ' +
                 'con 48 horas de anticipación, a tiempo para ofrecerle el cupo a otro paciente.',
      f2_imgAntes:   marco('Antes · sin confirmación', 'El paciente no recibía ningún contacto previo',
                           escPantalla('Agenda — cita asignada', [
                             ['Cita asignada el 12/03', '#544D80'],
                             ['Sin recordatorio programado', '#C63A31'],
                             ['Sin confirmación del paciente', '#C63A31'],
                             ['Estado: pendiente', '#E8A020'],
                             ['Resultado: no asistió', '#C63A31']]), 'bad'),
      f2_imgAccion:  marco('Acción · recordatorio a 48 h', 'Confirmar o reprogramar desde el mensaje',
                           escCartel('MENSAJE A 48 HORAS', [
                             'Su terapia es el jueves 3:00 p. m.',
                             'Responda 1 para confirmar',
                             'Responda 2 para reprogramar',
                             'Si reprograma, indique el motivo',
                             'El cupo se ofrece a otro paciente'], 'ok'), 'ok'),
      f2_imgDespues: marco('Después · con confirmación', '91 % confirma antes de la jornada',
                           escBarras([['Confirma', 91, '91 %'], ['Reprograma\ncon aviso', 6, '6 %'],
                                      ['No\nresponde', 3, '3 %']], 'ok'), 'ok'),
      f2_bigAntes:   marco('Tablero de recepción · antes', 'La cancelación quedaba en una hoja suelta',
                           escCartel('BITÁCORA EN PAPEL', [
                             'Anotaciones sueltas por jornada',
                             'Sin hora de la cancelación',
                             'Motivo escrito con palabras libres',
                             'No llega al call center',
                             'El cupo se pierde'], 'bad'), 'bad'),
      f2_bigDespues: marco('Tablero de recepción · después', 'Motivo obligatorio y aviso automático',
                           escPantalla('Cancelación registrada', [
                             ['Hora de la cancelación: 10:42', '#0A9E5C'],
                             ['Motivo: choque de horario', '#0A9E5C'],
                             ['Aviso al call center: enviado', '#0A9E5C'],
                             ['Lista de espera: 4 candidatos', '#0A9E5C'],
                             ['Cupo reasignado a las 11:05', '#0A9E5C']]), 'ok'),

      f3_antes:'La franja de la tarde tenía la misma cantidad de cupos que la mañana, aunque ' +
               'reprogramaba casi el doble. Cada ausencia dejaba la hora entera vacía.',
      f3_accion:'Sobrecupo del 15 % sólo en la franja de la tarde, sostenido por la lista de espera ' +
                'y limitado por una regla: si la ocupación real supera el 95 %, el sobrecupo se suspende.',
      f3_despues:'La ocupación de la tarde pasó del 52 % al 84 % sin tiempos de espera adicionales ' +
                 'para el paciente y sin habilitar una sala nueva.',
      f3_imgAntes:   marco('Antes · ocupación por franja', 'La tarde desperdiciaba la mitad de su capacidad',
                           escBarras([['Mañana', 64, '64 %'], ['Tarde', 52, '52 %'], ['Meta', 85, '85 %']], 'bad'), 'bad'),
      f3_imgAccion:  marco('Acción · regla de sobrecupo', 'Regla escrita y visible en el puesto',
                           escCartel('SOBRECUPO DE LA TARDE', [
                             'Programar 15 % por encima del cupo',
                             'Sólo en la franja de 2 a 6 p. m.',
                             'Siempre con lista de espera activa',
                             'Si la ocupación real supera 95 %: suspender',
                             'Revisar la regla cada lunes'], 'ok'), 'ok'),
      f3_imgDespues: marco('Después · ocupación por franja', 'La tarde alcanza la meta institucional',
                           escBarras([['Mañana', 79, '79 %'], ['Tarde', 84, '84 %'], ['Meta', 85, '85 %']], 'ok'), 'ok'),
      f3_bigAntes:   marco('Franja de la tarde · antes', '52 % de uso con la agenda cerrada', escAgenda(true), 'bad'),
      f3_bigDespues: marco('Franja de la tarde · después', '84 % de uso con el mismo personal', escAgenda(false), 'ok')
    });

    set('mejorar.poka_yoke', {
      fotoAntes:  marco('Antes · cancelar sin motivo', 'El sistema permitía cerrar la cita en blanco',
                        escPantalla('Cancelar cita', [
                          ['Paciente: J. Herrera', '#544D80'],
                          ['Motivo: (vacío — opcional)', '#C63A31'],
                          ['Hora del aviso: (sin registrar)', '#C63A31'],
                          ['Botón GUARDAR habilitado', '#C63A31'],
                          ['Cupo liberado sin trazabilidad', '#C63A31']]), 'bad'),
      fotoDespues: marco('Después · el error ya no cabe', 'Sin motivo el sistema no deja guardar',
                        escPantalla('Cancelar cita', [
                          ['Paciente: J. Herrera', '#0A9E5C'],
                          ['Motivo: obligatorio — lista de 10', '#0A9E5C'],
                          ['Hora del aviso: automática', '#0A9E5C'],
                          ['GUARDAR bloqueado sin motivo', '#0A9E5C'],
                          ['Cupo pasa a lista de espera', '#0A9E5C']]), 'ok')
    });

    set('mejorar.a3_mejorar', {
      imgAntes: marco('Antes · agenda de la tarde',
                      '32,4 % de citas reprogramadas · salas al 58 %', escAgenda(true), 'bad'),
      imgDespues: marco('Después · agenda de la tarde',
                        '7,4 % de citas reprogramadas · salas al 81 %', escAgenda(false), 'ok'),
      imgResultados: marco('Resultado del piloto · cuatro semanas',
                           'La meta del 8 % se alcanza desde la tercera semana',
                           escBarras([['Base', 32.4, '32,4 %'], ['Sem 1', 21.8, '21,8 %'],
                                      ['Sem 2', 13.5, '13,5 %'], ['Sem 3', 8.7, '8,7 %'],
                                      ['Sem 4', 7.4, '7,4 %']], 'ok'), 'ok')
    });

    /* ---------------------------------------------------- CONTROLAR -- */
    const ENC_1 = { proceso:'Agendamiento y confirmación de terapia física',
                    documento:'ET-TER-001', realizo:'Marcela Ospina',
                    revisada:'Ing. Ariel Ramírez', liberada:'Dra. Claudia Restrepo' };

    set('controlar.estandar_1', {
      imgIzq1: marco('Paso 3 · confirmar a 48 horas', 'Pantalla de confirmación del call center',
                     escPantalla('Confirmación de cita', [
                       ['Citas de pasado mañana: 24', '#2A1AA6'],
                       ['Confirmadas: 21', '#0A9E5C'],
                       ['Reprogramadas con aviso: 2', '#E8A020'],
                       ['Sin respuesta: 1 — reintentar', '#C63A31'],
                       ['Cerrar la jornada antes de las 5 p. m.', '#2A1AA6']]), 'ok'),
      imgDer1: marco('Paso 6 · reasignar el cupo', 'Lista de espera ordenada por antigüedad',
                     escCartel('CUPO LIBERADO', [
                       'Verificar autorización vigente',
                       'Llamar al primero de la lista',
                       'Esperar respuesta máximo 30 minutos',
                       'Si no contesta, pasar al siguiente',
                       'Registrar quién tomó el cupo'], 'ok'), 'ok'),
      proceso2:ENC_1.proceso + ' — página 2', liberada2:ENC_1.liberada,
      documento2:'ET-TER-001', realizo2:ENC_1.realizo, revisada2:ENC_1.revisada, pag2:'2 de 2',
      seguridad2:'Tratar los datos del trabajador conforme a la Ley 1581 de 2012: no divulgar el ' +
        'diagnóstico al ofrecer el cupo, sólo la hora disponible. La llamada se hace desde la línea ' +
        'institucional, nunca desde el celular personal del auxiliar.',
      otros2:'El sobrecupo del 15 % aplica únicamente a la franja de 2 a 6 p. m. y siempre con lista ' +
        'de espera activa. Si la ocupación real de la sala supera el 95 % dos días seguidos, se ' +
        'suspende el sobrecupo y se informa a coordinación el mismo día.',
      imgIzq2: marco('Paso 9 · registrar el motivo', 'El motivo es obligatorio para poder guardar',
                     escPantalla('Cancelar cita', [
                       ['Motivo: obligatorio', '#0A9E5C'],
                       ['Hora del aviso: automática', '#0A9E5C'],
                       ['Aviso al call center: automático', '#0A9E5C'],
                       ['Cupo a lista de espera', '#0A9E5C'],
                       ['GUARDAR bloqueado sin motivo', '#2A1AA6']]), 'ok'),
      imgDer2: marco('Paso 12 · cierre de la jornada', 'Tablero visible en la sala de terapia',
                     escBarras([['Atendidas', 18, '18'], ['Reasignadas', 3, '3'], ['Perdidas', 1, '1']], 'ok'), 'ok'),
      nota2:'Este estándar reemplaza cualquier instrucción verbal previa sobre el manejo de la agenda ' +
        'de terapia. Toda modificación se tramita ante coordinación del servicio y queda registrada en ' +
        'el control de cambios del formato 3. Vigente desde el 15 de junio de 2026.'
    });

    set('controlar.estandar_2', {
      proceso:'Agendamiento y confirmación de terapia física', realizo:'Marcela Ospina',
      fecha:'2026-06-15', codigo:'ET-TER-002', pag:'1 de 2',
      rows:[
        R({ ayuda:'Fig. 1', actividad:'Recibir la orden médica y verificar el teléfono del trabajador',
            estandar:'El teléfono se lee en voz alta al paciente y se confirma antes de cerrar el registro',
            herramientas:'Software de agenda', responsable:'Auxiliar de admisión', tiempo:'3 min',
            seguridad:'No divulgar el diagnóstico en voz alta en la sala de espera' }),
        R({ ayuda:'Fig. 2', actividad:'Preguntar la jornada laboral del trabajador antes de ofrecer la franja',
            estandar:'La pregunta es obligatoria y está en el guion: nunca se asigna franja sin preguntarla',
            herramientas:'Guion de agendamiento', responsable:'Auxiliar de call center', tiempo:'1 min',
            seguridad:'—' }),
        R({ ayuda:'Fig. 3', actividad:'Asignar el cupo dentro de las 48 horas siguientes a la autorización',
            estandar:'Si no hay cupo en 48 h, se registra en lista de espera; no se asigna una fecha lejana',
            herramientas:'Software de agenda', responsable:'Auxiliar de call center', tiempo:'4 min',
            seguridad:'—' }),
        R({ ayuda:'Fig. 4', actividad:'Programar la serie completa de sesiones en un solo acto',
            estandar:'Las sesiones quedan separadas por 3 días o menos, según la prescripción',
            herramientas:'Software de agenda', responsable:'Auxiliar de call center', tiempo:'5 min',
            seguridad:'—' }),
        R({ ayuda:'Fig. 5', actividad:'Enviar el recordatorio automático 48 horas antes',
            estandar:'Sale automático a las 8:00 a. m.; si falla el envío, se llama antes de las 10:00 a. m.',
            herramientas:'Módulo de mensajería', responsable:'Sistemas', tiempo:'Automático',
            seguridad:'El mensaje no incluye diagnóstico ni datos clínicos' }),
        R({ ayuda:'Fig. 6', actividad:'Registrar la confirmación o la reprogramación del paciente',
            estandar:'Toda respuesta se registra el mismo día; sin respuesta se reintenta una vez',
            herramientas:'Software de agenda', responsable:'Auxiliar de call center', tiempo:'2 min',
            seguridad:'—' }),
        R({ ayuda:'Fig. 7', actividad:'Registrar la cancelación con motivo obligatorio',
            estandar:'El motivo se elige de la lista de 10; el sistema no permite guardar sin él',
            herramientas:'Software de agenda', responsable:'Recepción', tiempo:'2 min',
            seguridad:'—' }),
        R({ ayuda:'Fig. 8', actividad:'Publicar el cupo liberado en la lista de espera',
            estandar:'El cupo se publica dentro de los 10 minutos siguientes a la cancelación',
            herramientas:'Módulo de lista de espera', responsable:'Recepción', tiempo:'1 min',
            seguridad:'—' }),
        R({ ayuda:'Fig. 9', actividad:'Ofrecer el cupo al primero de la lista con autorización vigente',
            estandar:'Se espera respuesta máximo 30 minutos y luego se pasa al siguiente',
            herramientas:'Línea institucional', responsable:'Auxiliar de call center', tiempo:'5 min',
            seguridad:'La llamada se hace desde la línea institucional, no desde el celular personal' }),
        R({ ayuda:'Fig. 10', actividad:'Aplicar el sobrecupo del 15 % en la franja de la tarde',
            estandar:'Sólo de 2 a 6 p. m. y sólo con lista de espera activa',
            herramientas:'Parametrización de la agenda', responsable:'Coordinación', tiempo:'Semanal',
            seguridad:'Suspender si la ocupación real supera el 95 % dos días seguidos' }),
        R({ ayuda:'Fig. 11', actividad:'Cerrar la jornada con el conteo de cupos por estado',
            estandar:'Atendidos, reasignados y perdidos se registran antes de salir; nunca de memoria',
            herramientas:'Planilla de ocupación', responsable:'Recepción', tiempo:'5 min',
            seguridad:'—' }),
        R({ ayuda:'Fig. 12', actividad:'Revisar la carta de control p cada lunes',
            estandar:'Si hay señal fuera de control, se aplica el plan de reacción el mismo día',
            herramientas:'Carta p semanal', responsable:'Coordinación', tiempo:'20 min',
            seguridad:'—' })
      ],
      img1: marco('Fig. 1 · verificar el teléfono', 'Se lee en voz alta y se confirma con el paciente',
                  escPantalla('Admisión', [['Nombre: J. Herrera', '#0A9E5C'],
                    ['Teléfono: 300 000 0000', '#0A9E5C'], ['Confirmado en voz alta', '#0A9E5C'],
                    ['Autorización: vigente', '#0A9E5C'], ['Guardar', '#2A1AA6']])),
      img2: marco('Fig. 2 · preguntar la jornada', 'La pregunta está en el guion y es obligatoria',
                  escCartel('GUION DE AGENDAMIENTO', ['¿En qué jornada trabaja usted?',
                    '¿Qué franja le sirve mejor?', 'Ofrecer primero esa franja',
                    'Si no hay cupo, lista de espera', 'Nunca asignar sin preguntar'], 'ok'), 'ok'),
      img3: marco('Fig. 3 · cupo dentro de 48 h', 'Sin cupo cercano, va a lista de espera', escAgenda(false), 'ok'),
      img4: marco('Fig. 4 · serie completa', 'Sesiones separadas por 3 días o menos',
                  escBarras([['Ses. 1', 0, 'día 0'], ['Ses. 2', 3, 'día 3'], ['Ses. 3', 6, 'día 6'],
                             ['Ses. 4', 9, 'día 9']], 'ok'), 'ok'),
      img5: marco('Fig. 5 · recordatorio a 48 h', 'Envío automático a las 8:00 a. m.',
                  escCartel('MENSAJE AUTOMÁTICO', ['Su terapia es el jueves 3:00 p. m.',
                    'Responda 1 para confirmar', 'Responda 2 para reprogramar',
                    'Sin datos clínicos en el mensaje', 'Si falla el envío: llamar antes de 10 a. m.'], 'ok'), 'ok'),
      img6: marco('Fig. 6 · registrar la respuesta', 'Toda respuesta queda el mismo día',
                  escPantalla('Confirmación', [['Confirmadas: 21', '#0A9E5C'],
                    ['Reprogramadas con aviso: 2', '#E8A020'], ['Sin respuesta: 1', '#C63A31'],
                    ['Reintento pendiente', '#E8A020'], ['Cierre a las 5:00 p. m.', '#2A1AA6']])),
      proceso2:'Agendamiento y confirmación de terapia física', realizo2:'Marcela Ospina',
      fecha2:'2026-06-15', codigo2:'ET-TER-002', pag2:'2 de 2',
      img7: marco('Fig. 7 · motivo obligatorio', 'El sistema no guarda sin motivo',
                  escPantalla('Cancelar cita', [['Motivo: obligatorio', '#0A9E5C'],
                    ['Lista de 10 motivos', '#0A9E5C'], ['Hora automática', '#0A9E5C'],
                    ['GUARDAR bloqueado sin motivo', '#2A1AA6'], ['Cupo a lista de espera', '#0A9E5C']]), 'ok'),
      img8: marco('Fig. 8 · publicar el cupo', 'Dentro de los 10 minutos siguientes',
                  escBarras([['0-10 min', 82, '82 %'], ['10-30 min', 14, '14 %'], ['> 30 min', 4, '4 %']], 'ok'), 'ok'),
      img9: marco('Fig. 9 · ofrecer el cupo', 'Orden por antigüedad en la lista',
                  escCartel('LISTA DE ESPERA', ['1. Verificar autorización vigente',
                    '2. Llamar al primero de la lista', '3. Esperar máximo 30 minutos',
                    '4. Si no contesta, pasar al siguiente', '5. Registrar quién tomó el cupo'], 'ok'), 'ok'),
      img10: marco('Fig. 10 · sobrecupo de la tarde', 'Sólo de 2 a 6 p. m. y con lista activa',
                   escCartel('REGLA DE SOBRECUPO', ['15 % por encima del cupo',
                     'Sólo franja de 2 a 6 p. m.', 'Siempre con lista de espera',
                     'Suspender si la ocupación supera 95 %', 'Revisar cada lunes'], 'ok'), 'ok'),
      img11: marco('Fig. 11 · cierre de jornada', 'Conteo por estado antes de salir',
                   escBarras([['Atendidas', 18, '18'], ['Reasignadas', 3, '3'], ['Perdidas', 1, '1']], 'ok'), 'ok'),
      img12: marco('Fig. 12 · revisión del lunes', 'Carta p semanal y plan de reacción',
                   escPantalla('Carta p — semana 12', [['p = 6,8 %', '#0A9E5C'],
                     ['LCS = 12,4 %', '#544D80'], ['Sin puntos fuera de control', '#0A9E5C'],
                     ['Sin rachas de 7 puntos', '#0A9E5C'], ['Acción: ninguna', '#0A9E5C']]), 'ok')
    });

    set('controlar.estandar_3', {
      proceso:'Reasignación del cupo liberado', maquina:'Software de agenda · módulo lista de espera',
      realizo:'Marcela Ospina', area:'Terapia física · sede norte', clase:'Estándar de operación',
      aprobado:'Dra. Claudia Restrepo', frecuencia:'Cada vez que se registra una cancelación',
      responsable:'Auxiliar de recepción', documento:'ET-TER-003',
      imagen: marco('Ayuda visual · lista de espera', 'Pantalla que ve el auxiliar al liberarse un cupo',
                    escPantalla('Cupo liberado — 3:00 p. m.', [
                      ['1. J. Herrera — autorización vigente', '#0A9E5C'],
                      ['2. M. Salazar — autorización vigente', '#0A9E5C'],
                      ['3. R. Peña — autorización vencida', '#C63A31'],
                      ['4. C. Duarte — autorización vigente', '#0A9E5C'],
                      ['Ofrecer al primero con autorización', '#2A1AA6']]), 'ok'),
      herramientas:[ R({ herramienta:'Software de agenda' }), R({ herramienta:'Módulo de lista de espera' }),
                     R({ herramienta:'Línea telefónica institucional' }), R({ herramienta:'Guion de reasignación' }),
                     R({ herramienta:'Planilla de ocupación de salas' }), R({ herramienta:'Tablero visual de la sala' }),
                     R({ herramienta:'Reporte de autorizaciones vigentes' }), R({ herramienta:'Carta de control p semanal' }) ],
      seguridad:'Al ofrecer el cupo no se menciona el diagnóstico ni el motivo de la terapia: sólo la ' +
        'fecha y la hora disponibles. La llamada se hace desde la línea institucional. Los datos del ' +
        'trabajador se tratan conforme a la Ley 1581 de 2012 y no se comparten con la empresa afiliada.',
      procedimiento:[
        R({ paso:'1. Registrar la cancelación con el motivo obligatorio de la lista de 10.' }),
        R({ paso:'2. Verificar que el cupo quede marcado como LIBERADO en la agenda.' }),
        R({ paso:'3. Publicar el cupo en la lista de espera dentro de los 10 minutos siguientes.' }),
        R({ paso:'4. Filtrar la lista por autorización vigente: sin autorización no se ofrece.' }),
        R({ paso:'5. Llamar al primero de la lista desde la línea institucional.' }),
        R({ paso:'6. Esperar respuesta un máximo de 30 minutos; luego pasar al siguiente.' }),
        R({ paso:'7. Confirmar con el paciente la hora y dejar registro de quién tomó el cupo.' }),
        R({ paso:'8. Actualizar el tablero visual de la sala con el nuevo estado del cupo.' }),
        R({ paso:'9. Si nadie toma el cupo, registrarlo como PERDIDO con la causa, para la carta p.' })
      ],
      cambios:[
        R({ revision:'00', fecha:'2026-06-15', cambio:'Emisión inicial del estándar tras el cierre del piloto.' }),
        R({ revision:'01', fecha:'2026-06-22', cambio:'Se fija en 30 minutos el tiempo de espera de respuesta; antes quedaba a criterio del auxiliar.' }),
        R({ revision:'02', fecha:'2026-06-29', cambio:'Se agrega el filtro por autorización vigente antes de ofrecer el cupo.' }),
        R({ revision:'03', fecha:'2026-07-13', cambio:'Se incorpora el registro del cupo perdido con causa, para alimentar la carta p.' })
      ],
      proceso2:'Aplicación del sobrecupo en la franja de la tarde',
      maquina2:'Software de agenda · parametrización de cupos',
      realizo2:'Marcela Ospina', area2:'Terapia física · sede norte', clase2:'Estándar de operación',
      aprobado2:'Dra. Claudia Restrepo', frecuencia2:'Revisión semanal, cada lunes',
      responsable2:'Coordinación del servicio', documento2:'ET-TER-003',
      imagen2: marco('Ayuda visual · regla de sobrecupo', 'Cartel visible en el puesto de coordinación',
                     escCartel('SOBRECUPO DE LA TARDE', [
                       'Programar 15 % por encima del cupo',
                       'Sólo en la franja de 2 a 6 p. m.',
                       'Siempre con lista de espera activa',
                       'Suspender si la ocupación supera 95 %',
                       'Revisar la regla cada lunes'], 'ok'), 'ok'),
      seguridad2:'El sobrecupo no puede generar esperas mayores a 15 minutos para el paciente ya citado. ' +
        'Si dos lunes seguidos la espera promedio supera ese límite, se suspende el sobrecupo y se ' +
        'escala a la dirección del servicio antes de reactivarlo.'
    });

    // n es el tamaño típico del subgrupo semanal; los límites reales se escalonan
    // con el «tamaño de muestra» de cada fila, porque la muestra es variable
    set('controlar.graficos_control', { n: 72, lsl: 0 });

    set('controlar.charter_cierre', {
      metCie:[ R({ mejoro:'Yes', logrado:7.4 }),
               R({ mejoro:'Yes', logrado:3.1 }),
               R({ mejoro:'Yes', logrado:81  }) ],
      firmasCie:[ R({ firma:'Aceptado — Dra. Claudia Restrepo (Champion)',   fecha:'2026-06-30' }),
                  R({ firma:'Aceptado — Marcela Ospina (Dueña del proceso)', fecha:'2026-06-30' }),
                  R({ firma:'Aceptado — Jorge Delgado (Finanzas)',           fecha:'2026-06-30' }),
                  R({ firma:'Aceptado — Ing. Laura Peña (Mentor)',           fecha:'2026-06-30' }),
                  R({ firma:'Aceptado — Ing. Ariel Ramírez (Facilitador)',   fecha:'2026-06-30' }) ]
    });

    set('controlar.a3_final', {
      t1:'DEFINIR — el problema y su costo',
      t2:'MEDIR y ANALIZAR — línea base y causa raíz',
      t3:'MEJORAR — soluciones implantadas',
      t4:'CONTROLAR — cómo se sostiene',
      t5:'LECCIONES APRENDIDAS Y RECONOCIMIENTO'
    });

    /* deja el rastro de aleatoriedad usada, para que el conteo sea estable */
    return rint(1, 1);
  }

  /* ------------------------------------------------------- auxiliares */
  /** muestra normal reproducible (Box-Muller con la semilla del módulo) */
  function muestraNormal(mu, sd, n){
    const o = [];
    for (let i = 0; i < n; i++){
      const u1 = Math.max(1e-9, rnd()), u2 = rnd();
      o.push(mu + sd * Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2));
    }
    return o;
  }
  /** datos de un estudio GR&R con sesgo por operador y error de repetibilidad */
  function grrDatos(nP, nO, nR, mu, sdParte, sdEV){
    const filas = [], sesgo = [0, 0.18, -0.12];
    for (let p = 1; p <= nP; p++){
      const vp = mu + sdParte * (p - (nP + 1) / 2) / ((nP - 1) / 2) * 1.4;
      for (let o = 1; o <= nO; o++)
        for (let r = 1; r <= nR; r++)
          filas.push(R({ parte:p, operador:'Op ' + o, replica:r,
            valor: round(vp + sesgo[(o - 1) % 3] + sdEV * (rnd() * 2 - 1) * 1.7, 2) }));
    }
    return filas;
  }

  const contarLlenas = () => TOOLS.filter(t => toolFilled(t)).length;

  /* --------------------------------------------------------- limpiar */
  function limpiar(){
    const p = ST.proj();
    p.data = {};
    p.nombre = 'Proyecto de mejora 1';
    p.empresa = ''; p.arl = ''; p.area = ''; p.lider = '';
    p.creado = hoy(); p.actualizado = hoy();
    delete p.demo;
    ST.save(true);
  }

  const esDemo = () => { const p = ST.proj(); return !!(p && p.demo); };

  return { cargar, limpiar, esDemo };
})();
