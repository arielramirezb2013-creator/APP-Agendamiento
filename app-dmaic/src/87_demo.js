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
      baseline:'32,4 % de citas reprogramadas · nivel sigma 2,0 σ · RTY 61,2 % · valor agregado 50,9 %.'
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
      // carta p: por semana se registran las citas programadas y cuántas se reprogramaron
      rows: [[72,6],[68,5],[74,6],[70,5],[76,5],[71,5],[69,5],[73,6],[75,6],[70,5],
             [72,5],[74,6],[68,5],[71,5],[73,5],[69,5],[72,5],[70,5],[74,6],[71,5]]
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
      medirAnalizar:'Nivel sigma 2,0 σ · RTY 61,2 %. Causa raíz: agendamiento sin sobrecupo, lista de ' +
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

    ST.save(true);
    return contarLlenas();
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
