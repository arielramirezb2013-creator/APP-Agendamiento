/* ============ Documentos sintéticos · ruta de incapacidad · perfil «mp» ============
   M.P., 41 años, operaria de empaque de Alimentos Andinos S.A.S. Lumbago con ciática (M54.4), incapacidad
   continua, origen en controversia entre la EPS y la ARL. Las cuatro piezas que viajan por la ruta, al corte del
   día 150 (perfiles/perfil-ejemplo-mp.json). El dictamen no está aquí: lo produce el recorrido.

   Calendario del caso (día 1 = 19/11/2025):
     día 1 = 19/11/2025 · primera consulta y certificado inicial (19/11/2025 a 18/12/2025)
     prórrogas de 30 días: 19/12/2025–17/01/2026 · 18/01/2026–16/02/2026 · 17/02/2026–18/03/2026 ·
                           19/03/2026–17/04/2026 · 18/04/2026–17/05/2026 (expedidas los días 29, 57, 90, 120 y 150)
     día 95 = 21/02/2026 resonancia · día 104 = 02/03/2026 ortopedia · día 116 = 14/03/2026 matriz v.2 ·
     día 118 = 16/03/2026 prueba de trabajo y recaída · día 120 = 18/03/2026 · día 150 = 17/04/2026 corte ·
     día 165 = 02/05/2026 fisiatría · día 180 = 17/05/2026.

   Cada dato que corresponde a un campo de la pieza lleva `campo: i` (en la fila kv o en el bloque), y solo ese
   dato: el visor tacha lo que no llegó a la entidad del participante. Los bloques sin marca solo traen
   identificación, encabezados y notas que no revelan ningún campo.

   Aritmética:
   · NIOSH (ecuación revisada): LPR = LC × HM × VM × DM × AM × FM × CM. Camada 1: 23 × 0,56 × 0,93 × 0,95 × 0,90 ×
     0,77 × 0,95 = 7,5 kg; IL = 18 / 7,5 = 2,4. Frecuencia 400 / 480 min = 0,83 por minuto; MF interpolado 0,77.
     Cajas observadas en el turno: 134 de 12 kg + 154 de 15 kg + 96 de 18 kg = 384 levantamientos; 5.646 kg.
   · Incapacidad: IBC de octubre de 2025 = 2 × $1.423.500 = $2.847.000; 2/3 = $1.898.000 al mes ($63.266,67 al día).
     Días 1 y 2: $126.533 (empleador); días 3 a 30: $1.771.467.
   · Historia laboral (días acreditados): 919 + 1.020 + 990 + 1.355 = 4.284 días = 612,00 semanas.
     Últimos tres años (períodos 04/2023 a 03/2026): 6 + 330 = 336 días = 48,00 semanas.
     Últimos cinco años (04/2021 a 03/2026, 1.800 días): 630 acreditados + 540 en deuda presunta + 336 acreditados
     = 1.506 con vinculación vigente; 294 sin vinculación. Densidad = 1.506 / 1.800 = 0,84.
   Todo es sintético: ninguna persona, número, profesional ni documento es real. */
DOCS.ruta.mp = {
  identidad: {
    documento: "C.C. SIM-43.918.272",
    historia: "Historia clínica SIM-HC-2025-18842",
    afiliacionEps: "SIM-EPS-447190-2",
    afiliacionArl: "SIM-ARL-624177-0",
    afiliacionAfp: "SIM-AFP-305566-4",
    nitEmpleador: "NIT SIM-900.584.112-7",
    nitEps: "NIT SIM-811.402.773-4",
    nitIps: "NIT SIM-901.338.250-1",
    nitImagenes: "NIT SIM-901.472.086-5",
    nitAfp: "NIT SIM-830.517.904-6",
    resumenClinico: "SIM-IPS-RC-2025-2291",
    resonancia: "SIM-RM-2026-0388",
    matrizExposicion: "SIM-SST-MEP-L3-017",
    certificadoIncapacidades: "SIM-EPS-PE-2026-05518",
    certificadoInicial: "SIM-INC-2025-118702",
    historiaLaboral: "SIM-AFP-CERT-2026-11873"
  },

  piezas: {

    /* ---------------------------------------------------------------- Resumen clínico estructurado (IPS)
       Campos: 0 diagnóstico CIE-10 · 1 incapacidad continua · 2 restricciones funcionales ·
               3 concepto de rehabilitación · 4 evolución clínica completa · 5 antecedentes psicosociales */
    hc: {
      tipo: "historia",
      titulo: "Resumen clínico estructurado",
      emisor: { n: "IPS Salud Integral Los Cerezos", area: "Medicina general y oficina de historia clínica", ciudad: "Ciudad sintética", id: "NIT SIM-901.338.250-1" },
      numero: "SIM-IPS-RC-2025-2291",
      fecha: "17/04/2026",
      version: "v.3",
      estadoNota: "Tercera versión del resumen, actualizada en el control del 17/04/2026. Cada campo se suministra según la finalidad que declare quien consulta.",
      paginas: [
        { titulo: "Resumen clínico", bloques: [
          { kv: [
            ["Paciente", "M.P."],
            ["Documento", "C.C. SIM-43.918.272"],
            ["Historia clínica", "SIM-HC-2025-18842"],
            ["Fecha de nacimiento", "09/07/1984 · 41 años"],
            ["Sexo", "Femenino"],
            ["EPS", "EPS SURA · afiliación SIM-EPS-447190-2"],
            ["ARL", "ARL SURA · afiliación SIM-ARL-624177-0"],
            ["Ocupación", "Operaria de empaque, Alimentos Andinos S.A.S."],
            ["Médica tratante", "Paula Andrea Giraldo Cárdenas, medicina general"],
            ["Versión del resumen", "v.3 del 17/04/2026; reemplaza la versión 2"],
            ["Fecha de corte", "17/04/2026"]
          ] },

          { h: "Diagnóstico" },
          { tabla: {
            cols: ["CIE-10", "Diagnóstico", "Tipo", "Desde"],
            filas: [["M54.4", "Lumbago con ciática, ciática izquierda", "Principal", "19/11/2025"]],
            nota: ""
          }, campo: 0 },
          { p: "Primera consulta por esta causa el 19/11/2025 (día 1). Resonancia magnética de columna lumbosacra del 21/02/2026 (día 95): protrusión discal L5-S1 posterolateral izquierda con compromiso de la raíz S1 izquierda (anexo 1).", campo: 0 },

          { h: "Incapacidad" },
          { kv: [
            ["Estado", "Incapacidad continua desde el 19/11/2025, sin reintegro intermedio", 1],
            ["Días a la fecha de corte", "150 días continuos al 17/04/2026", 1],
            ["Última prórroga expedida", "Del 18/04/2026 al 17/05/2026", 1]
          ] },

          { h: "Restricciones funcionales" },
          { lista: [
            "No levantar ni transportar cargas de más de 5 kg.",
            "No permanecer de pie más de 30 minutos seguidos; alternar con la posición sentada.",
            "No flexionar el tronco de forma repetitiva."
          ], campo: 2 },
          { p: "Vigentes desde el 18/03/2026, para las actividades de la vida diaria y para cualquier reintegro laboral. Se revisan en cada control.", campo: 2 },

          { h: "Concepto de rehabilitación" },
          { kv: [
            ["Estado", "Pendiente", 3],
            ["Remisión", "A fisiatría, el 02/03/2026, para valoración y concepto de rehabilitación", 3],
            ["Valoración programada", "Fisiatría, el 02/05/2026 (día 165): primera fecha asignada", 3]
          ] },

          { h: "Evolución clínica" },
          { p: "Doce consultas entre el 19/11/2025 y el 17/04/2026, en medicina general y ortopedia; dos remisiones a fisioterapia, con 20 sesiones en total, y analgesia escalonada. Mejoría parcial con cada ciclo de fisioterapia. El 16/03/2026 (día 118), en el intento de reintegro, la prueba de trabajo en el puesto se suspendió a los 40 minutos por recaída del dolor irradiado y no se hizo el reintegro. En el último control persisten el dolor lumbar con irradiación a la pierna izquierda, el Lasègue izquierdo positivo, la disminución del reflejo aquiliano y la hipoestesia del borde lateral del pie izquierdo, sin déficit motor progresivo (anexos 2 y 3).", campo: 4 },
          { tabla: {
            cols: ["Escalón", "Medicamento", "Desde", "Hasta", "Motivo"],
            filas: [
              ["Primer escalón", "Acetaminofén 1 g cada 8 horas", "19/11/2025", "Continúa", "Dolor lumbar"],
              ["Primer escalón", "Naproxeno 250 mg cada 12 horas", "19/11/2025", "14/01/2026", "Se suspende por uso prolongado"],
              ["Coadyuvante", "Pregabalina 75 mg cada 12 horas; 150 mg cada 12 horas desde el 18/03/2026", "26/11/2025", "Continúa", "Dolor neuropático irradiado a la pierna"],
              ["Segundo escalón", "Tramadol 50 mg cada 8 horas", "29/01/2026", "Continúa", "Dolor persistente a pesar del primer escalón"]
            ],
            nota: "Analgesia escalonada según la escalera analgésica de la Organización Mundial de la Salud."
          }, campo: 4 },
          { kv: [
            ["Antecedentes patológicos", "Niega", 4],
            ["Antecedentes de columna", "Episodios de dolor lumbar desde 2024, manejados con analgésicos de venta libre, sin consulta ni incapacidad", 4],
            ["Tóxicos y alérgicos", "No fuma. Niega alergias", 4],
            ["Peso, talla e índice de masa corporal", "67,6 kg · 1,58 m · 27,1 kg/m²", 4],
            ["Examen en el último control (17/04/2026)", "Marcha antálgica leve. Lasègue izquierdo positivo a 50°. Reflejo aquiliano izquierdo disminuido. Hipoestesia en el borde lateral del pie izquierdo. Flexión plantar izquierda 4+/5; resto de la fuerza conservada. Dolor 5 de 10 en la escala visual análoga; índice de Oswestry 42 %", 4]
          ] },

          { h: "Antecedentes psicosociales" },
          { p: "Jefa de hogar, con dos hijos menores a cargo, de 13 y 9 años. Refiere ansiedad por la pérdida de ingreso. Su hermana la acompaña a las citas.", campo: 5 },

          { firma: { nombre: "Paula Andrea Giraldo Cárdenas", cargo: "Médica general tratante, IPS Salud Integral Los Cerezos", registro: "Registro médico SIM-05-311478", fecha: "17/04/2026" } },
          { nota: "Resumen estructurado de la historia clínica (Resolución 1995 de 1999), expedido con autorización de la paciente y tratado conforme a la Ley 1581 de 2012. La historia clínica completa permanece bajo custodia de la IPS; cada campo se entrega solo a quien declare una finalidad que lo requiera." }
        ] },

        { titulo: "Anexo 1 · Imagen diagnóstica", bloques: [
          { kv: [
            ["Estudio", "Resonancia magnética de columna lumbosacra simple", 0],
            ["Informe", "SIM-RM-2026-0388", 0],
            ["Fecha del estudio", "21/02/2026 (día 95)", 0],
            ["Centro", "Centro de Imágenes Diagnósticas Vertiente S.A.S. · NIT SIM-901.472.086-5", 0],
            ["Equipo", "Resonador de 1,5 teslas", 0],
            ["Técnica", "Secuencias sagitales T1, T2 y STIR; axiales T2 de L3 a S1. Sin medio de contraste.", 0],
            ["Indicación", "Lumbociática izquierda; descartar hernia discal", 0]
          ] },
          { h: "Hallazgos" },
          { lista: [
            "Lordosis lumbar conservada. Alineación normal, sin listesis.",
            "Cuerpos vertebrales de altura y señal normales, sin lesiones óseas focales.",
            "Cono medular de situación y señal normales, a la altura de L1.",
            "L1-L2 a L3-L4: discos de altura y señal conservadas, sin protrusiones.",
            "L4-L5: deshidratación discal leve, sin protrusión ni compromiso del canal o de los agujeros de conjunción.",
            "L5-S1: disco deshidratado, con disminución leve de su altura. Protrusión discal posterolateral izquierda de base ancha que reduce el receso lateral izquierdo, contacta la raíz S1 izquierda y la desplaza hacia atrás. Canal central de diámetro conservado. Estrechamiento leve del agujero de conjunción izquierdo.",
            "Articulaciones facetarias sin cambios significativos. Musculatura paravertebral de señal normal."
          ], campo: 0 },
          { figura: {
            tipo: "rm_columna",
            datos: {
              region: "lumbar",
              secuencia: "T2 sagital",
              hallazgos: [{ nivel: "L5-S1", tipo: "protrusion" }]
            },
            pie: "Esquema sintético dibujado a partir de los hallazgos del informe; no es la imagen del estudio."
          }, campo: 0 },
          { h: "Conclusión" },
          { p: "Protrusión discal L5-S1 posterolateral izquierda con compromiso de la raíz S1 izquierda en el receso lateral. Cambios degenerativos discales incipientes en L4-L5 y L5-S1.", campo: 0 },
          { firma: { nombre: "Claudia Inés Herrera Montoya", cargo: "Médica radióloga, Centro de Imágenes Diagnósticas Vertiente S.A.S.", registro: "Registro médico SIM-05-228190", fecha: "21/02/2026" }, campo: 0 }
        ] },

        { titulo: "Anexo 2 · Rehabilitación", bloques: [
          { kv: [
            ["Servicio", "Fisioterapia ambulatoria, IPS Salud Integral Los Cerezos", 4],
            ["Remisiones", "Dos: el 10/12/2025, por medicina general, y el 02/03/2026, por ortopedia", 4],
            ["Sesiones", "20, diez por cada remisión", 4]
          ] },
          { tabla: {
            cols: ["Ciclo", "Fechas", "Sesiones", "Intervención", "Al inicio", "Al final"],
            filas: [
              ["Primero", "22/12/2025 a 13/01/2026", "10", "Educación en higiene postural y protección lumbar; calor superficial; electroanalgesia; movilidad lumbopélvica; control motor del tronco", "Dolor 6/10 · Oswestry 52 % · Lasègue izquierdo a 45°", "Dolor 4/10 · Oswestry 40 % · Lasègue izquierdo a 60°"],
              ["Segundo", "03/03/2026 a 14/03/2026", "10", "Estabilización lumbopélvica; movilización neural del miembro inferior izquierdo; fortalecimiento de tronco y miembros inferiores; entrenamiento de tareas de empaque sin carga y con cajas livianas; tolerancia de pie", "Dolor 6/10 · Oswestry 46 % · de pie 20 minutos", "Dolor 3/10 · Oswestry 30 % · de pie 45 minutos"]
            ],
            nota: "Dolor medido con la escala visual análoga de 0 a 10. Índice de discapacidad de Oswestry: 0 a 20 % mínima, 21 a 40 % moderada, 41 a 60 % grave."
          }, campo: 4 },
          { figura: {
            tipo: "serie",
            datos: {
              titulo: "Índice de discapacidad de Oswestry",
              unidad: "%",
              forma: "linea",
              puntos: [["22/12/2025", 52], ["13/01/2026", 40], ["03/03/2026", 46], ["14/03/2026", 30], ["18/03/2026", 54], ["17/04/2026", 42]],
              limite: { valor: 40, etiqueta: "Por encima de 40 %: discapacidad grave" }
            },
            pie: "Inicio y final de cada ciclo de fisioterapia y controles médicos del 18/03/2026 y del 17/04/2026. El valor del 18/03/2026 corresponde a la recaída después de la prueba de trabajo."
          }, campo: 4 },
          { h: "Prueba de trabajo", campo: 4 },
          { kv: [
            ["Fecha", "16/03/2026 (día 118), como paso previo al reintegro previsto para el 19/03/2026", 4],
            ["Lugar", "Línea 3 de empaque de Alimentos Andinos S.A.S., con el área de seguridad y salud en el trabajo de la empresa", 4],
            ["Tareas probadas", "Empaque manual de bolsas en cajas y paso de las cajas por la encintadora, de pie y sin estibar", 4],
            ["Duración prevista", "2 horas", 4],
            ["Resultado", "A los 40 minutos, dolor lumbar con irradiación a la pierna izquierda (8 de 10) al repetir la flexión del tronco para alcanzar el fondo de la caja. Se suspende la prueba.", 4],
            ["Concepto", "No apta para el reintegro previsto. Se remite el mismo día a consulta prioritaria.", 4]
          ] },
          { firma: { nombre: "Juan Camilo Rendón Isaza", cargo: "Fisioterapeuta, IPS Salud Integral Los Cerezos", registro: "Registro profesional SIM-RFT-2014-0932", fecha: "14/03/2026" }, campo: 4 },
          { firma: { nombre: "Natalia Restrepo Gil", cargo: "Terapeuta ocupacional, IPS Salud Integral Los Cerezos", registro: "Registro profesional SIM-RTO-2016-0417", fecha: "16/03/2026" }, campo: 4 }
        ] },

        { titulo: "Anexo 3 · Cronología de atenciones", bloques: [
          { tabla: {
            cols: ["N.º", "Fecha", "Día", "Servicio", "Hallazgos y conducta"],
            filas: [
              ["1", "19/11/2025", "1", "Medicina general, consulta prioritaria", "Dolor lumbar de tres semanas que en los últimos cuatro días se irradia por la cara posterior de la pierna izquierda hasta el borde lateral del pie; empeora durante el turno y al sentarse. Dolor 8/10. Marcha antálgica. Lasègue izquierdo positivo a 40°. Reflejo aquiliano izquierdo disminuido. Fuerza conservada. Diagnóstico M54.4. Inicia acetaminofén y naproxeno. Expide la incapacidad inicial de 30 días."],
              ["2", "26/11/2025", "8", "Medicina general, control", "Dolor 7/10. Persisten el dolor irradiado y las parestesias en el borde lateral del pie izquierdo. Agrega pregabalina. Solicita radiografía de columna lumbosacra."],
              ["", "28/11/2025", "10", "Radiología", "Radiografía de columna lumbosacra: rectificación de la lordosis lumbar por contractura muscular; espacios discales conservados; sin listesis ni lesiones óseas."],
              ["3", "10/12/2025", "22", "Medicina general, control", "Dolor 6/10. Lasègue izquierdo a 45°. Primera remisión a fisioterapia, 10 sesiones."],
              ["4", "17/12/2025", "29", "Medicina general, control", "Dolor 6/10. Sin déficit motor. Expide la primera prórroga, del 19/12/2025 al 17/01/2026."],
              ["", "22/12/2025 a 13/01/2026", "34 a 56", "Fisioterapia", "Primer ciclo, 10 sesiones (anexo 2)."],
              ["5", "14/01/2026", "57", "Medicina general, control", "Mejoría parcial: dolor 4/10, Lasègue izquierdo a 60°. Persiste la hipoestesia en el borde lateral del pie izquierdo. Suspende el naproxeno. Expide la segunda prórroga, del 18/01/2026 al 16/02/2026. Remite a ortopedia."],
              ["6", "29/01/2026", "72", "Ortopedia", "Reaparece el dolor irradiado al aumentar la actividad en casa: dolor 6/10. Lasègue izquierdo a 45°, aquiliano izquierdo disminuido, flexión plantar izquierda 4+/5, hipoestesia en el dermatoma S1 izquierdo. Agrega tramadol. Solicita resonancia magnética de columna lumbosacra."],
              ["7", "16/02/2026", "90", "Medicina general, control", "Dolor 6/10. Resonancia autorizada y programada. Expide la tercera prórroga, del 17/02/2026 al 18/03/2026."],
              ["", "21/02/2026", "95", "Radiología", "Resonancia magnética de columna lumbosacra (anexo 1)."],
              ["8", "02/03/2026", "104", "Ortopedia", "Revisa la resonancia: los hallazgos en L5-S1 corresponden al cuadro clínico de la raíz S1 izquierda. Sin déficit motor progresivo ni signos de alarma: manejo conservador, sin indicación quirúrgica. Segunda remisión a fisioterapia, 10 sesiones. Plan: reintegro con restricciones al terminar la tercera prórroga, previa prueba de trabajo."],
              ["", "03/03/2026 a 14/03/2026", "105 a 116", "Fisioterapia", "Segundo ciclo, 10 sesiones (anexo 2). Al final, dolor 3/10."],
              ["", "16/03/2026", "118", "Terapia ocupacional", "Prueba de trabajo en el puesto (anexo 2): se suspende a los 40 minutos por dolor irradiado 8/10. No se hace el reintegro."],
              ["9", "16/03/2026", "118", "Medicina general, consulta prioritaria", "Recaída después de la prueba de trabajo: dolor 8/10, marcha antálgica, Lasègue izquierdo a 35°, sin déficit motor nuevo ni alteración de esfínteres. Analgesia en el servicio y reposo relativo."],
              ["10", "18/03/2026", "120", "Medicina general, control", "Dolor 7/10. Aumenta la dosis de pregabalina. Actualiza las restricciones funcionales. Expide la cuarta prórroga, del 19/03/2026 al 17/04/2026."],
              ["11", "01/04/2026", "134", "Ortopedia, control", "Dolor 6/10. Lasègue izquierdo a 45°. Sin signos de alarma. Mantiene el manejo conservador."],
              ["12", "17/04/2026", "150", "Medicina general, control", "Mejoría parcial: dolor 5/10, Oswestry 42 %, Lasègue izquierdo a 50°. Expide la quinta prórroga, del 18/04/2026 al 17/05/2026. Actualiza este resumen."]
            ],
            nota: "Doce consultas médicas, numeradas. Sin número: una radiografía, dos ciclos de fisioterapia con 20 sesiones, una resonancia magnética y una prueba de trabajo. El dolor se registra en la escala visual análoga de 0 a 10."
          }, campo: 4 }
        ] }
      ]
    },

    /* ---------------------------------------------------------------- Matriz de exposición / análisis de puesto (empleador)
       Campos: 0 cargo y tareas · 1 cargas manipuladas · 2 índice de levantamiento ·
               3 versión · fecha · responsable · 4 historial disciplinario
       La fecha y la versión de la matriz son el campo 3: el documento no las repite fuera de ese bloque; la fecha
       del encabezado es la de esta copia. */
    apt: {
      tipo: "analisis_puesto",
      titulo: "Matriz de exposición y análisis de puesto de trabajo",
      emisor: { n: "Alimentos Andinos S.A.S.", area: "Sistema de gestión de seguridad y salud en el trabajo", ciudad: "Ciudad sintética", id: "NIT SIM-900.584.112-7" },
      numero: "SIM-SST-MEP-L3-017",
      fecha: "17/04/2026",
      estadoNota: "Copia expedida por el sistema de gestión de seguridad y salud en el trabajo el 17/04/2026.",
      paginas: [
        { titulo: "Matriz de exposición y análisis de puesto", bloques: [
          { kv: [
            ["Empresa", "Alimentos Andinos S.A.S. · NIT SIM-900.584.112-7"],
            ["Centro de trabajo", "Planta de producción, Ciudad sintética · sector de alimentos"],
            ["Trabajadora", "M.P. · C.C. SIM-43.918.272"],
            ["Fecha de ingreso", "02/03/2020 · contrato a término indefinido"],
            ["Cargo evaluado", "Operaria de empaque, línea 3", 0],
            ["Jornada", "Turnos rotativos de 8 horas: 06:00 a 14:00, 14:00 a 22:00 y 22:00 a 06:00"],
            ["Solicitado por", "EPS SURA, para la calificación del origen"],
            ["Fuentes", "Observación directa del puesto durante un turno completo con la operaria que lo cubre; pesaje de las cajas con báscula; registro de producción de la línea; entrevista al jefe de línea"]
          ] },

          { h: "Cargo y tareas" },
          { p: "Operaria de empaque de la línea 3: empaque manual, sellado y estibado de cajas de producto terminado (granos y harinas en bolsa). Recibe las bolsas selladas en una banda a 85 cm de altura, arma la caja de cartón, acomoda las bolsas en ella, la pasa por la encintadora y, a la salida del transportador de rodillos, la levanta y la ubica en la estiba. Cuando la estiba se completa, la traslada con un gato hidráulico manual hasta la zona de despacho.", campo: 0 },
          { tabla: {
            cols: ["Tarea", "Tiempo por turno", "Postura y exigencia física"],
            filas: [
              ["Armado de cajas de cartón", "40 min", "De pie; movimientos repetidos de miembros superiores"],
              ["Empaque manual de bolsas en la caja", "2 h 50 min", "De pie; flexión del tronco de 30° a 45° para alcanzar el fondo de la caja"],
              ["Sellado de la caja en la encintadora", "50 min", "De pie; empuje de la caja sobre la mesa de la encintadora"],
              ["Estibado: levantamiento de la caja desde el transportador hasta la estiba", "2 h 10 min", "Levantamiento con giro del tronco de 30°; flexión del tronco en la primera camada"],
              ["Traslado de estibas con gato hidráulico manual", "30 min", "Empuje y arrastre"],
              ["Limpieza, registro de producción y cambio de referencia", "30 min", "De pie y caminando"],
              ["Pausas activas y alimentación", "30 min", ""]
            ],
            nota: "Total: 8 horas, de pie durante casi todo el turno."
          }, campo: 0 },

          { h: "Cargas manipuladas" },
          { tabla: {
            cols: ["Presentación", "Contenido de la caja", "Peso de la caja", "Participación en el turno", "Cajas por turno"],
            filas: [
              ["Bolsa de 500 g", "24 bolsas", "12 kg", "35 %", "112 a 140"],
              ["Bolsa de 1 kg", "15 bolsas", "15 kg", "40 %", "128 a 160"],
              ["Bolsa de 3 kg", "6 bolsas", "18 kg", "25 %", "80 a 100"]
            ],
            nota: "Cajas de 12 a 18 kg; entre 320 y 400 levantamientos por turno de 8 horas, uno por caja, según el registro de producción de la línea. Peso promedio ponderado: 14,7 kg; entre 4,7 y 5,9 toneladas levantadas por turno."
          }, campo: 1 },
          { p: "Las cajas de 15 y 18 kg superan la carga compacta máxima de 12,5 kg que la Resolución 2400 de 1979 (artículo 392) fija para las mujeres. Las cajas son de cartón corrugado, sin agarraderas, de 40 × 30 × 25 cm.", campo: 1 },

          { h: "Índice de levantamiento" },
          { p: "Ecuación revisada de NIOSH: límite de peso recomendado (LPR) = LC × HM × VM × DM × AM × FM × CM, con la constante de carga LC de 23 kg y los multiplicadores horizontal (HM), vertical (VM), de desplazamiento vertical (DM), de asimetría (AM), de frecuencia (FM) y de agarre (CM). La estiba está sobre una base fija de 30 cm y se arma en tres camadas. Como la ubicación en la estiba exige control, se calcula el índice en el origen y en cada destino.", campo: 2 },
          { tabla: {
            cols: ["Punto de la tarea", "H (cm)", "V (cm)", "D (cm)", "Asimetría", "Agarre"],
            filas: [
              ["Toma en el transportador de rodillos", "30", "85", "35", "0°", "Regular"],
              ["Ubicación en la camada 1", "45", "50", "35", "30°", "Regular"],
              ["Ubicación en la camada 2", "45", "80", "5", "30°", "Regular"],
              ["Ubicación en la camada 3", "45", "110", "25", "30°", "Regular"]
            ],
            nota: "Frecuencia: 400 levantamientos en 480 minutos, 0,83 por minuto (se toma el máximo del rango). Duración larga, más de 2 horas. Multiplicador de frecuencia interpolado entre 0,81 (0,5 por minuto) y 0,75 (1 por minuto): 0,77."
          }, campo: 2 },
          { tabla: {
            cols: ["Punto de la tarea", "HM · VM · DM · AM · FM · CM", "LPR (kg)", "Índice con caja de 12 kg", "Índice con caja de 15 kg", "Índice con caja de 18 kg"],
            filas: [
              ["Toma en el transportador de rodillos", "0,83 · 0,97 · 0,95 · 1,00 · 0,77 · 1,00", "13,5", "0,9", "1,1", "1,3"],
              ["Ubicación en la camada 1", "0,56 · 0,93 · 0,95 · 0,90 · 0,77 · 0,95", "7,5", "1,6", "2,0", "2,4"],
              ["Ubicación en la camada 2", "0,56 · 0,99 · 1,00 · 0,90 · 0,77 · 1,00", "8,8", "1,4", "1,7", "2,0"],
              ["Ubicación en la camada 3", "0,56 · 0,90 · 1,00 · 0,90 · 0,77 · 1,00", "8,0", "1,5", "1,9", "2,2"]
            ],
            nota: "Camada 1: LPR = 23 × 0,56 × 0,93 × 0,95 × 0,90 × 0,77 × 0,95 = 7,5 kg; índice = 18 kg / 7,5 kg = 2,4."
          }, campo: 2 },
          { kv: [
            ["Índice de levantamiento de la tarea", "2,4 (NIOSH), con la caja de 18 kg ubicada en la primera camada", 2],
            ["Límite recomendado", "1,0: la tarea lo supera", 2]
          ] },
          { figura: {
            tipo: "serie",
            datos: {
              titulo: "Índice de levantamiento con la caja de 18 kg, por punto de la tarea",
              forma: "barras",
              puntos: [["Transportador", 1.3], ["Camada 1", 2.4], ["Camada 2", 2.0], ["Camada 3", 2.2]],
              limite: { valor: 1, etiqueta: "Límite recomendado: 1,0" }
            },
            pie: "En todos los destinos de la estiba el índice supera 1,0; el mayor está en la primera camada."
          }, campo: 2 },
          { tabla: {
            cols: ["Peligro", "Controles existentes", "Deficiencia", "Exposición", "Probabilidad", "Consecuencia", "Riesgo", "Aceptabilidad"],
            filas: [
              ["Biomecánico: manipulación manual de cargas en el estibado", "Transportador de rodillos; base fija de 30 cm para la estiba; capacitación en manejo de cargas; pausas activas", "6 · alto", "4 · continua", "24 · muy alto", "25 · grave", "600 · nivel I", "No aceptable"],
              ["Biomecánico: postura de pie prolongada y flexión repetida del tronco en el empaque", "Pausas activas; tapete antifatiga", "2 · medio", "4 · continua", "8 · medio", "25 · grave", "200 · nivel II", "No aceptable o aceptable con control específico"]
            ],
            nota: "Valoración según la Guía Técnica Colombiana GTC 45: probabilidad = deficiencia × exposición; nivel de riesgo = probabilidad × consecuencia."
          }, campo: 2 },
          { lista: [
            "Instalar una mesa elevadora de altura regulable para la estiba, de modo que cada camada quede entre 75 y 100 cm.",
            "Reducir a 12 kg el peso de las cajas de las presentaciones de 1 kg y 3 kg o asignar el estibado de esas cajas a dos personas.",
            "Rotar a las operarias entre empaque, sellado y estibado cada 2 horas.",
            "Incluir el puesto en el programa de vigilancia epidemiológica de desórdenes musculoesqueléticos (GATISO para dolor lumbar inespecífico y enfermedad discal relacionados con la manipulación manual de cargas)."
          ], campo: 2 },

          { h: "Versión, fecha y responsable" },
          { kv: [
            ["Versión", "v.2", 3],
            ["Fecha", "14/03/2026", 3],
            ["Responsable", "Sandra Lucía Quintero Álzate, ingeniera de seguridad y salud en el trabajo", 3]
          ] },
          { tabla: {
            cols: ["Versión", "Fecha", "Alcance", "Responsable"],
            filas: [
              ["v.1", "22/07/2025", "Matriz de peligros de la línea 3 (GTC 45), sin análisis individual del puesto", "Coordinación del sistema de gestión de seguridad y salud en el trabajo"],
              ["v.2", "14/03/2026", "Análisis del puesto de la trabajadora con la ecuación de NIOSH, a solicitud de la EPS", "Ingeniera de seguridad y salud en el trabajo"]
            ],
            nota: "Matriz elaborada en el marco del sistema de gestión de seguridad y salud en el trabajo (Decreto 1072 de 2015)."
          }, campo: 3 },
          { firma: { nombre: "Sandra Lucía Quintero Álzate", cargo: "Ingeniera de seguridad y salud en el trabajo, Alimentos Andinos S.A.S.", registro: "Licencia en SST SIM-LSST-2017-3318", fecha: "14/03/2026" }, campo: 3 },

          { h: "Historial disciplinario" },
          { p: "Dos llamados de atención por llegadas tarde en 2024: el 12/02/2024 y el 23/08/2024, por escrito, sin suspensión ni otra sanción. Información aportada por gestión humana.", campo: 4 },

          { nota: "Copia del sistema de gestión de seguridad y salud en el trabajo de Alimentos Andinos S.A.S. La matriz original permanece en la empresa." }
        ] },

        { titulo: "Anexo · Registro del turno observado", bloques: [
          { p: "Conteo de cajas levantadas hasta la estiba durante un turno completo de la mañana (06:00 a 14:00), con la operaria que cubre el puesto, y pesaje de una muestra de diez cajas de cada presentación.", campo: 1 },
          { tabla: {
            cols: ["Hora", "Cajas de 12 kg", "Cajas de 15 kg", "Cajas de 18 kg", "Total", "Kilogramos"],
            filas: [
              ["06:00 a 07:00", "17", "19", "12", "48", "705"],
              ["07:00 a 08:00", "18", "21", "13", "52", "765"],
              ["08:00 a 09:00", "18", "20", "12", "50", "732"],
              ["09:00 a 10:00", "16", "18", "12", "46", "678"],
              ["10:00 a 11:00", "18", "21", "13", "52", "765"],
              ["11:00 a 12:00", "15", "18", "11", "44", "648"],
              ["12:00 a 13:00", "17", "20", "13", "50", "738"],
              ["13:00 a 14:00", "15", "17", "10", "42", "615"],
              ["Turno", "134", "154", "96", "384", "5.646"]
            ],
            nota: "Pesos medidos: cajas de 12 kg entre 11,8 y 12,3 kg; de 15 kg entre 14,7 y 15,2 kg; de 18 kg entre 17,6 y 18,4 kg. El registro de producción de la línea muestra entre 320 y 400 cajas por turno."
          }, campo: 1 },
          { figura: {
            tipo: "serie",
            datos: {
              titulo: "Cajas levantadas hasta la estiba, por hora del turno",
              unidad: "cajas",
              forma: "barras",
              puntos: [["06:00", 48], ["07:00", 52], ["08:00", 50], ["09:00", 46], ["10:00", 52], ["11:00", 44], ["12:00", 50], ["13:00", 42]]
            },
            pie: "384 levantamientos en el turno observado. Las horas de las 09:00 y de las 11:00 incluyen la pausa activa y la alimentación."
          }, campo: 1 }
        ] }
      ]
    },

    /* ---------------------------------------------------------------- Certificados de incapacidad (EPS)
       Campos: 0 días acumulados · 1 prórrogas · 2 fecha de inicio · 3 IBC */
    inc: {
      tipo: "incapacidad",
      titulo: "Certificado de incapacidades",
      emisor: { n: "EPS SURA", area: "Prestaciones económicas", ciudad: "Ciudad sintética", id: "NIT SIM-811.402.773-4" },
      numero: "SIM-EPS-PE-2026-05518",
      fecha: "17/04/2026",
      version: "corte día 150",
      estadoNota: "",
      paginas: [
        { titulo: "Certificado de incapacidades", bloques: [
          { kv: [
            ["Afiliada", "M.P."],
            ["Documento", "C.C. SIM-43.918.272"],
            ["Afiliación", "SIM-EPS-447190-2 · cotizante dependiente"],
            ["Empleador", "Alimentos Andinos S.A.S. · NIT SIM-900.584.112-7"],
            ["ARL del empleador", "ARL SURA"],
            ["Fecha de corte", "17/04/2026"]
          ] },

          { h: "Días acumulados" },
          { kv: [
            ["Días de incapacidad a la fecha de corte", "150 días continuos de incapacidad", 0],
            ["Continuidad", "Sin interrupciones entre un certificado y el siguiente", 0],
            ["Día 180 de incapacidad continua", "17/05/2026", 0]
          ] },

          { h: "Fecha de inicio" },
          { kv: [
            ["Inicio de la incapacidad", "19/11/2025 (día 1)", 2],
            ["Certificado inicial", "SIM-INC-2025-118702, expedido el 19/11/2025 por la IPS Salud Integral Los Cerezos, del 19/11/2025 al 18/12/2025, 30 días, diagnóstico M54.4 (anexo)", 2]
          ] },

          { h: "Prórrogas" },
          { tabla: {
            cols: ["Prórroga", "Certificado", "Expedido", "Desde", "Hasta", "Días", "CIE-10", "Expide"],
            filas: [
              ["Primera", "SIM-INC-2025-121355", "17/12/2025", "19/12/2025", "17/01/2026", "30", "M54.4", "Médica tratante"],
              ["Segunda", "SIM-INC-2026-003118", "14/01/2026", "18/01/2026", "16/02/2026", "30", "M54.4", "Médica tratante"],
              ["Tercera", "SIM-INC-2026-011920", "16/02/2026", "17/02/2026", "18/03/2026", "30", "M54.4", "Médica tratante"],
              ["Cuarta", "SIM-INC-2026-019447", "18/03/2026", "19/03/2026", "17/04/2026", "30", "M54.4", "Médica tratante"],
              ["Quinta", "SIM-INC-2026-026083", "17/04/2026", "18/04/2026", "17/05/2026", "30", "M54.4", "Médica tratante"]
            ],
            nota: "Cinco prórrogas de 30 días, expedidas por la médica tratante de la IPS Salud Integral Los Cerezos, Paula Andrea Giraldo Cárdenas (registro médico SIM-05-311478), con el mismo diagnóstico y sin interrupción respecto del certificado anterior. La quinta prórroga se expidió en la fecha de corte y cubre los días 151 a 180."
          }, campo: 1 },

          { h: "Origen" },
          { p: "Tipo de incapacidad registrado en los certificados: enfermedad general. Origen en controversia: la calificación del origen en primera oportunidad está en disputa entre la EPS y la ARL, y el caso cursa ante la Junta Regional de Calificación de Invalidez. Mientras no haya dictamen en firme, la EPS reconoce las incapacidades como de origen común. Si el origen se declara laboral, la incapacidad pasa a cargo de la ARL, con el subsidio de la Ley 776 de 2002, y la EPS solicita el reembolso de lo pagado." },

          { h: "Ingreso base de cotización y liquidación" },
          { kv: [
            ["Ingreso base de cotización", "$2.847.000 mensuales: 2 salarios mínimos de 2025", 3],
            ["Período de referencia", "Octubre de 2025, mes anterior al inicio de la incapacidad", 3],
            ["IBC diario", "$94.900", 3]
          ] },
          { tabla: {
            cols: ["Certificado", "Días", "A cargo de", "Porcentaje del IBC", "Valor", "Estado"],
            filas: [
              ["Inicial", "1 y 2", "Empleador", "66,67 %", "$126.533", "Pagado por el empleador"],
              ["Inicial", "3 a 30", "EPS", "66,67 %", "$1.771.467", "Reconocido y pagado"],
              ["Primera prórroga", "31 a 60", "EPS", "66,67 %", "$1.898.000", "Reconocido y pagado"],
              ["Segunda prórroga", "61 a 90", "EPS", "66,67 %", "$1.898.000", "Reconocido y pagado"],
              ["Tercera prórroga", "91 a 120", "EPS", "50 %, ajustado al salario mínimo de 2026", "Un salario mínimo mensual de 2026", "Reconocido y pagado"],
              ["Cuarta prórroga", "121 a 150", "EPS", "50 %, ajustado al salario mínimo de 2026", "Un salario mínimo mensual de 2026", "Reconocido; pago en trámite"],
              ["Quinta prórroga", "151 a 180", "EPS", "50 %, ajustado al salario mínimo de 2026", "Un salario mínimo mensual de 2026", "Radicado; se liquida al vencimiento"]
            ],
            nota: "Días 1 y 2 a cargo del empleador (Decreto 2943 de 2013). Desde el día 3, la EPS reconoce dos tercios del IBC hasta el día 90 y la mitad del día 91 al 180 (Código Sustantivo del Trabajo, artículo 227; Decreto 1427 de 2022), sin que el valor sea inferior al salario mínimo vigente: el 50 % del IBC ($1.423.500) es menor que el salario mínimo de 2026. La EPS paga al empleador, que paga a la trabajadora en la nómina."
          }, campo: 3 },

          { firma: { nombre: "Mauricio Esteban Lopera Vélez", cargo: "Analista de prestaciones económicas, EPS SURA", registro: "", fecha: "17/04/2026" } },
          { nota: "Certificado expedido con la información registrada en la EPS a la fecha de corte. Los certificados originales los expide la IPS y permanecen en el registro de incapacidades de la EPS." }
        ] },

        { titulo: "Anexo · Certificado inicial expedido por la IPS", bloques: [
          { kv: [
            ["Certificado de incapacidad", "SIM-INC-2025-118702", 2],
            ["Institución", "IPS Salud Integral Los Cerezos · NIT SIM-901.338.250-1", 2],
            ["Paciente", "M.P. · C.C. SIM-43.918.272", 2],
            ["Fecha y hora de expedición", "19/11/2025, 10:40", 2],
            ["Servicio", "Consulta prioritaria de medicina general", 2],
            ["Diagnóstico principal", "M54.4 · Lumbago con ciática", 2],
            ["Tipo", "Inicial", 2],
            ["Origen", "Enfermedad general", 2],
            ["Días", "30 (treinta)", 2],
            ["Desde", "19/11/2025", 2],
            ["Hasta", "18/12/2025", 2],
            ["Modalidad", "Ambulatoria", 2]
          ] },
          { firma: { nombre: "Paula Andrea Giraldo Cárdenas", cargo: "Médica general, IPS Salud Integral Los Cerezos", registro: "Registro médico SIM-05-311478", fecha: "19/11/2025" }, campo: 2 }
        ] }
      ]
    },

    /* ---------------------------------------------------------------- Historia laboral y semanas (administradora de pensiones)
       Campos: 0 semanas cotizadas · 1 densidad de cotización · 2 IBC histórico · 3 historial de empleadores */
    hl: {
      tipo: "historia_laboral",
      titulo: "Historia laboral y semanas cotizadas",
      emisor: { n: "Administradora de pensiones", area: "Historia laboral y certificaciones", ciudad: "Ciudad sintética", id: "NIT SIM-830.517.904-6" },
      numero: "SIM-AFP-CERT-2026-11873",
      fecha: "17/04/2026",
      version: "corte día 150",
      estadoNota: "",
      paginas: [
        { titulo: "Historia laboral", bloques: [
          { kv: [
            ["Afiliada", "M.P."],
            ["Documento", "C.C. SIM-43.918.272"],
            ["Fecha de nacimiento", "09/07/1984"],
            ["Afiliación", "SIM-AFP-305566-4 · activa · cotizante dependiente"],
            ["Fecha de corte", "17/04/2026"],
            ["Uso", "Suministro a las entidades del trámite según la finalidad que declaren"]
          ] },

          { h: "Semanas cotizadas" },
          { kv: [
            ["Total de semanas cotizadas", "612,00 semanas (4.284 días acreditados)", 0],
            ["Semanas en los últimos tres años", "48,00 semanas (336 días), períodos de abril de 2023 a marzo de 2026", 0],
            ["Último período acreditado", "Marzo de 2026", 0]
          ] },
          { nota: "Las semanas resultan de dividir entre 7 los días con aporte pagado y acreditado. Las semanas de los últimos tres años se cuentan hacia atrás desde la fecha de corte; para el estudio de una prestación se cuentan desde la fecha que esa prestación exija (artículo 39 de la Ley 100 de 1993, modificado por la Ley 860 de 2003). El detalle por año está en el anexo.", campo: 0 },

          { h: "Densidad de cotización" },
          { kv: [
            ["Densidad de cotización de los últimos cinco años", "0,84 (períodos de abril de 2021 a marzo de 2026)", 1]
          ] },
          { tabla: {
            cols: ["Períodos", "Días", "Situación en el registro", "Cuenta para la densidad"],
            filas: [
              ["Abril de 2021 a diciembre de 2022", "630", "Aportes pagados y acreditados", "Sí"],
              ["Enero de 2023 a junio de 2024", "540", "Vinculación vigente sin pago recibido: deuda presunta del empleador, en gestión de cobro", "Sí"],
              ["1 de julio de 2024 a 24 de abril de 2025", "294", "Sin vinculación vigente: novedad de retiro del subsistema de pensiones reportada por el empleador con fecha 30/06/2024", "No"],
              ["25 de abril de 2025 a marzo de 2026", "336", "Aportes pagados y acreditados; reingreso reportado por el empleador el 25/04/2025", "Sí"],
              ["Total", "1.800", "", "1.506"]
            ],
            nota: "Densidad = días con vinculación vigente y aporte acreditado o exigible al empleador / días del período = 1.506 / 1.800 = 0,84. Los días en deuda presunta se acreditan como semanas cuando el empleador los pague."
          }, campo: 1 },

          { h: "Ingreso base de cotización histórico" },
          { p: "Desde la primera cotización, en marzo de 2011, el ingreso base de cotización ha estado entre 1 y 2 salarios mínimos de forma continua: ningún período registrado tiene un IBC menor de 1 ni mayor de 2 salarios mínimos.", campo: 2 },
          { tabla: {
            cols: ["Períodos", "IBC mensual", "Salarios mínimos", "Fuente del dato"],
            filas: [
              ["03/2011 a 09/2013", "El salario mínimo de cada año ($535.600 a $589.500)", "1,0", "Planillas pagadas"],
              ["02/2014 a 11/2016", "$616.000 a $758.000", "1,0 a 1,1", "Planillas pagadas"],
              ["06/2017 a 02/2020", "$885.000 a $1.141.000", "1,2 a 1,3", "Planillas pagadas"],
              ["03/2020 a 12/2022", "$1.317.000 a $1.800.000", "1,5 a 1,8", "Planillas pagadas"],
              ["01/2023 a 06/2024", "$1.800.000, presunto", "1,6 en 2023 y 1,4 en 2024", "Deuda presunta: último IBC reportado"],
              ["07/2024 a 04/2025", "Sin registro hasta el reingreso del 25/04/2025", "", "Sin vinculación vigente"],
              ["04/2025 a 10/2025", "$2.847.000", "2,0", "Planillas pagadas"],
              ["11/2025 a 03/2026", "Valor de la incapacidad", "1,0 a 1,7", "Planillas pagadas durante la incapacidad"]
            ],
            nota: "Valores en pesos de cada año, redondeados a miles, y su equivalencia en salarios mínimos del mismo año. Durante la incapacidad el IBC es el valor del subsidio."
          }, campo: 2 },
          { figura: {
            tipo: "serie",
            datos: {
              titulo: "IBC promedio anual, en salarios mínimos de cada año",
              unidad: "salarios mínimos",
              forma: "linea",
              puntos: [["2011", 1.0], ["2012", 1.0], ["2013", 1.0], ["2014", 1.0], ["2015", 1.0], ["2016", 1.1], ["2017", 1.2], ["2018", 1.2], ["2019", 1.3], ["2020", 1.5], ["2021", 1.6], ["2022", 1.8], ["2023", 1.6], ["2024", 1.4], ["2025", 1.9], ["2026", 1.0]],
              limite: { valor: 2, etiqueta: "2 salarios mínimos" }
            },
            pie: "Promedio de los períodos con IBC registrado. 2023 y enero a junio de 2024: IBC presunto. 2025: abril a diciembre. 2026: enero a marzo, con el valor de la incapacidad."
          }, campo: 2 },

          { h: "Empleadores" },
          { tabla: {
            cols: ["Empleador", "NIT", "Ingreso", "Retiro", "Días acreditados", "Semanas"],
            filas: [
              ["Confecciones Hilo Sereno S.A.S.", "NIT SIM-900.214.567-3", "01/03/2011", "19/09/2013", "919", "131,29"],
              ["Autoservicios Granero Central S.A.S.", "NIT SIM-900.663.018-9", "01/02/2014", "30/11/2016", "1.020", "145,71"],
              ["Plegables y Cartones Altiplano S.A.S.", "NIT SIM-901.045.390-2", "01/06/2017", "29/02/2020", "990", "141,43"],
              ["Alimentos Andinos S.A.S.", "NIT SIM-900.584.112-7", "02/03/2020", "Vigente; novedad de retiro del 30/06/2024 y reingreso del 25/04/2025", "1.355", "193,57"]
            ],
            nota: "Cuatro empleadores. En Alimentos Andinos S.A.S., empleador actual, desde el 02/03/2020: seis años a la fecha de corte."
          }, campo: 3 },

          { firma: { nombre: "Gloria Inés Bermúdez Rojas", cargo: "Profesional de historia laboral, administradora de pensiones", registro: "", fecha: "17/04/2026" } },
          { nota: "Información tomada de las planillas de aportes y de las novedades reportadas por los empleadores hasta la fecha de corte. La historia laboral permanece en la administradora; la afiliada puede solicitar la corrección de cualquier período." }
        ] },

        { titulo: "Anexo · Semanas por año", bloques: [
          { tabla: {
            cols: ["Año", "Días acreditados", "Semanas", "Observación"],
            filas: [
              ["2011", "300", "42,86", "Desde marzo"],
              ["2012", "360", "51,43", ""],
              ["2013", "259", "37,00", "Hasta el 19 de septiembre"],
              ["2014", "330", "47,14", "Desde febrero"],
              ["2015", "360", "51,43", ""],
              ["2016", "330", "47,14", "Hasta noviembre"],
              ["2017", "210", "30,00", "Desde junio"],
              ["2018", "360", "51,43", ""],
              ["2019", "360", "51,43", ""],
              ["2020", "359", "51,29", "Cambio de empleador en marzo"],
              ["2021", "360", "51,43", ""],
              ["2022", "360", "51,43", ""],
              ["2023", "0", "0,00", "Deuda presunta todo el año"],
              ["2024", "0", "0,00", "Deuda presunta de enero a junio; sin vinculación de julio a diciembre"],
              ["2025", "246", "35,14", "Desde el 25 de abril"],
              ["2026", "90", "12,86", "Enero a marzo"],
              ["Total", "4.284", "612,00", ""]
            ],
            nota: "Semanas = días acreditados / 7, con dos decimales."
          }, campo: 0 }
        ] }
      ]
    }
  }
};
