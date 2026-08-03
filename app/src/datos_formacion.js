/* ============================================================
   MÓDULO 1 · FORMACIÓN
   Nivel BÁSICO  = contenido del documento (§4.2). Procedencia: documento.
   Nivel INTERMEDIO = complemento externo. Procedencia: aporte externo.
   Ninguna cifra de Rehavid: el documento no contiene ninguna.
   ============================================================ */

const UNIDADES = [
{
  codigo: 'U1', titulo: 'Modelo financiero y decisión',
  competencia: 'Comprender el modelo como representación de una empresa o proyecto; distinguir dato, supuesto, variable, regla, fórmula y salida; reconocer límites y entorno externo.',
  aplicacion: 'La app exige propósito, alcance, supuestos, responsable y advertencia de uso antes de calcular.',
  basico: [
    'Propósito, alcance y usuario de la decisión.',
    'Diferencia entre hechos históricos, supuestos prospectivos y resultados calculados.',
    'Dependencia entre variables y necesidad de coherencia de unidades y periodos.',
    'Modelo como apoyo a una conversación estratégica, no como sustituto del contexto.',
    'Riesgo de falsa precisión y obligación de revelar límites.'
  ],
  intermedio: {
    intro: 'Un modelo se sostiene sobre una cadena: dato → supuesto → regla → cálculo → salida. Si cualquier eslabón no tiene dueño ni fuente, la salida hereda esa debilidad sin avisar.',
    puntos: [
      ['Las tres capas de un modelo', 'Entradas (lo que se recibe), motor (lo que se calcula) y salidas (lo que se reporta). Mezclar capas —escribir un número a mano dentro de una fórmula— es el origen más frecuente de errores irrastreables. La regla operativa: una celda contiene un dato o una fórmula, nunca ambos.'],
      ['Dato, supuesto y proyección no son lo mismo', 'El dato ocurrió y es verificable contra un registro. El supuesto es una decisión sobre el futuro y necesita racional. La proyección es consecuencia de los dos anteriores. RN-FIN-06 del documento prohíbe mezclarlos sin etiqueta, y esa prohibición existe porque, mezclados, nadie puede saber después qué se sabía y qué se decidió.'],
      ['Coherencia de periodo y unidad', 'Un flujo mensual dividido entre un servicio de deuda anual da un indicador doce veces mayor que el real. La app bloquea el cálculo ante periodicidades incompatibles (RN-FIN-01), pero el modelador debe entender por qué: el indicador no es "aproximado", es falso.'],
      ['Falsa precisión', 'Reportar un resultado con dos decimales sugiere una exactitud que los supuestos no respaldan. El nivel de precisión de la salida no puede superar el de la entrada más débil. De ahí que el documento exija revelar límites como parte del entregable, no como nota al pie.'],
      ['El entorno externo no está en el modelo', 'Tasa de cambio, tasa de interés, demanda y regulación se comportan con independencia del modelo. Reconocerlo cambia la pregunta: no "cuánto dará", sino "bajo qué condiciones deja de funcionar".']
    ],
    errores: [
      'Cambiar un supuesto sin registrar quién lo cambió, cuándo y por qué.',
      'Presentar un único escenario como si fuera la previsión.',
      'Construir el modelo antes de definir qué decisión debe apoyar.'
    ]
  }
},
{
  codigo: 'U2', titulo: 'Modelación de deuda',
  competencia: 'Construir el comportamiento de la deuda por periodos: saldo, desembolso, interés, principal, servicio y cierre.',
  aplicacion: 'Calendario de deuda trazable y parametrizable.',
  basico: [
    'Identificación de cada obligación o tramo de financiación.',
    'Fecha de desembolso, tasa, periodicidad, plazo contractual y método de amortización como parámetros.',
    'Separación de principal, interés y otros componentes contractuales.',
    'Conciliación del saldo inicial, movimientos y saldo final.',
    'Lectura del perfil de pagos y de la evolución de la exposición.'
  ],
  intermedio: {
    intro: 'El calendario de deuda es una tabla de conciliación, no una fórmula. Cada periodo debe cerrar por sí solo, y el cierre de un periodo es la apertura del siguiente.',
    puntos: [
      ['La identidad que debe cumplirse siempre', 'Saldo final = saldo inicial + desembolsos + capitalizaciones − principal pagado ± ajustes autorizados (§8.1). Si esta igualdad no se cumple en algún periodo, el modelo tiene un error, no una diferencia de redondeo. La app bloquea la aprobación en ese caso (CP-006).'],
      ['Principal e interés se separan siempre', 'El interés es costo del periodo; el principal reduce la exposición. Aunque el contrato cobre una cuota única, el modelo debe descomponerla: sin esa separación no se puede calcular cobertura ni leer el perfil de riesgo.'],
      ['Métodos de amortización', 'Cuota fija (francés), abono constante a capital (alemán), pago único al vencimiento (bullet) y esquemas a medida producen perfiles de servicio muy distintos con el mismo monto y la misma tasa. El documento advierte expresamente que no debe fijarse un método por defecto sin confirmación (§8.1).'],
      ['Base de días y periodo de gracia', 'La convención de conteo (30/360, actual/360, actual/365) cambia el interés calculado. Un periodo de gracia puede ser solo de principal —se sigue pagando interés— o total, y en este último caso el interés no pagado suele capitalizarse, aumentando el saldo. Son parámetros del contrato, no decisiones del modelador.'],
      ['Leer el perfil, no solo el total', 'Dos estructuras con la misma deuda total pueden concentrar el servicio en momentos opuestos. El riesgo no está en cuánto se debe, sino en cuándo hay que pagarlo frente a cuándo entra la caja.']
    ],
    errores: [
      'Calcular interés sobre el saldo final en lugar del saldo inicial del periodo.',
      'Olvidar capitalizar el interés durante la gracia total.',
      'Modelar varios tramos como si fueran uno solo y perder la trazabilidad contractual.'
    ]
  }
},
{
  codigo: 'U3', titulo: 'Flujo disponible y cobertura',
  competencia: 'Definir el flujo disponible para servicio de deuda y calcular el DSCR con consistencia temporal.',
  aplicacion: 'Indicador, semáforo y explicación por periodo.',
  basico: [
    'Definición corporativa de flujo de caja disponible para servicio de deuda (CFADS).',
    'Servicio de deuda como principal más interés pagadero en el periodo.',
    'DSCR como relación entre flujo disponible y servicio de deuda.',
    'Consistencia de periodicidad y prevención de doble conteo.',
    'Interpretación de cumplimiento, holgura, vulnerabilidad y ruptura.'
  ],
  intermedio: {
    intro: 'El DSCR es una división simple. Toda su dificultad está en el numerador: qué se considera flujo disponible. Por eso el documento exige que el mapeo del CFADS se apruebe por organización y proyecto (§8.2).',
    puntos: [
      ['CFADS no es utilidad ni EBITDA', 'La utilidad es contable y contiene partidas que no mueven caja. El EBITDA ignora capital de trabajo, impuestos e inversión. El CFADS es caja realmente disponible tras cubrir la operación y las inversiones comprometidas. Usar EBITDA como numerador sobreestima la capacidad de pago, y es el error que la Tabla 16 del documento señala primero.'],
      ['El doble conteo', 'Si un ingreso ya se restó como menor egreso, o una inversión se registra dos veces en clasificaciones distintas, el CFADS queda inflado o deprimido sin que el total del flujo lo revele. La conciliación por clasificación es la única defensa.'],
      ['Consistencia temporal', 'El numerador y el denominador deben corresponder al mismo periodo. Un DSCR anual construido con CFADS anual y servicio del último trimestre no mide nada. La app impide combinar periodicidades sin conversión y fuente (RN-FIN-01).'],
      ['Servicio de deuda igual a cero', 'En un periodo de gracia total el denominador es cero y el cociente no existe. El documento es explícito: se muestra "No calculable", nunca infinito ni un guion (RN-FIN-02, CP-007). Presentarlo como infinito sugiere cobertura perfecta cuando en realidad no hay medición.'],
      ['Las cuatro lecturas', 'Cumplimiento: el indicador supera el umbral contractual. Holgura: cuánto margen queda antes de incumplir. Vulnerabilidad: qué variación de una entrada agota esa holgura. Ruptura: el periodo donde el umbral se incumple. Solo la primera es un dato; las otras tres son el análisis.']
    ],
    errores: [
      'Promediar el DSCR del horizonte y ocultar el periodo que rompe.',
      'Tomar 1,0 como umbral porque "es el estándar": el umbral sale del contrato (§8.2).',
      'Incluir en el CFADS caja que está restringida o comprometida.'
    ]
  }
},
{
  codigo: 'U4', titulo: 'Restricciones y capacidad',
  competencia: 'Interpretar covenants y determinar el máximo nivel de deuda compatible con las restricciones activas.',
  aplicacion: 'Motor de factibilidad y búsqueda de capacidad.',
  basico: [
    'Covenant financiero como condición contractual o interna verificable.',
    'Umbral, frecuencia, periodo de cura y consecuencia como campos configurables.',
    'Capacidad de deuda como máximo monto factible bajo todas las restricciones activas.',
    'Pruebas de estrés ante condiciones más exigentes.',
    'Separación entre capacidad matemática y decisión prudencial.'
  ],
  intermedio: {
    intro: 'La capacidad de deuda no es una fórmula cerrada: es el resultado de un problema con restricciones. Se maximiza el monto sujeto a que todas las condiciones se cumplan en todos los periodos.',
    puntos: [
      ['El covenant tiene cinco campos, no uno', 'Indicador, umbral, frecuencia de medición, periodo de cura y consecuencia del incumplimiento. Registrar solo el umbral deja fuera lo que determina el efecto real: un incumplimiento con 90 días de cura no equivale a uno con aceleración inmediata. RN-FIN-03 exige tipo, umbral, periodo, fuente y vigencia.'],
      ['Todas las restricciones, todos los periodos', 'RN-FIN-04: el máximo debe cumplir simultáneamente todas las restricciones activas. Basta que un periodo incumpla para que el monto no sea factible. La capacidad la fija el periodo más exigente, no el promedio.'],
      ['La restricción vinculante', 'Es la que impide subir el monto. Identificarla cambia la conversación: si vincula la cobertura, se negocia el umbral o el perfil de amortización; si vincula la liquidez, se negocia el calendario o se busca capital de trabajo. RF-015 exige que la app la señale, y esa es su utilidad real.'],
      ['Monotonía: una comprobación que siempre debe cumplirse', 'Endurecer una restricción no puede aumentar la capacidad. Si el modelo devuelve más capacidad con un covenant más exigente, hay un error. El documento lo convierte en caso de prueba (CP-009) y es la mejor verificación automática del motor.'],
      ['Capacidad matemática no es monto recomendado', 'El máximo factible deja holgura cero: cualquier desviación rompe. La decisión prudencial toma una fracción de esa capacidad. Confundir ambas convierte un cálculo en una recomendación que el documento excluye expresamente (Tabla 7).']
    ],
    errores: [
      'Calcular la capacidad contra el covenant y olvidar la caja mínima.',
      'Buscar el máximo sobre el periodo promedio en lugar de sobre todos los periodos.',
      'Presentar el máximo factible como el monto a solicitar.'
    ]
  }
},
{
  codigo: 'U5', titulo: 'Liquidez y alerta temprana',
  competencia: 'Evaluar caja inicial, entradas, salidas, servicio de deuda, caja final y mínimo de liquidez.',
  aplicacion: 'Alertas por periodos críticos y causas de la brecha.',
  basico: [
    'Caja inicial, flujos de operación, inversión, financiación y caja final.',
    'Política de caja mínima definida por Rehavid o por el usuario autorizado.',
    'Periodos de déficit, necesidades de fondeo y alertas antes de la crisis.',
    'Diferencia entre indicador de cobertura y disponibilidad real de caja.',
    'Trazabilidad de la causa principal de cada brecha.'
  ],
  intermedio: {
    intro: 'Es el principio que más veces repite el documento: cumplir la cuota no basta. Un escenario puede cumplir el covenant en todos los periodos y aun así dejar la caja por debajo del mínimo. Cobertura y liquidez son restricciones distintas y ambas deben cumplirse.',
    puntos: [
      ['Por qué cobertura y liquidez no coinciden', 'El DSCR mide un cociente del periodo; la caja mide un saldo acumulado. Un periodo con CFADS suficiente puede dejar caja insuficiente si la caja inicial venía baja. El caso CP-010 del documento fija la consecuencia: con DSCR cumplido y caja bajo el mínimo, el escenario queda no factible por liquidez.'],
      ['La caja mínima es una política, no una constante', 'Puede variar por periodo, moneda y escenario. Puede venir de un contrato —caja de reserva del servicio de deuda— o de una decisión interna. El documento exige que sea configurable con fuente, y prohíbe un valor universal (§8.4).'],
      ['La brecha y su causa', 'Brecha = caja final − caja mínima. El número señala el problema; la causa lo explica. Descomponer la variación entre operación, inversión, financiación y servicio de deuda convierte una alerta en una acción: no es lo mismo un déficit por caída de cobro que por concentración de amortizaciones.'],
      ['Alerta temprana', 'El valor de proyectar la caja está en ver el déficit con periodos de anticipación, cuando todavía caben respuestas baratas: renegociar plazo, escalonar inversión, ajustar cobro. Detectado en el mismo periodo, solo quedan respuestas caras.'],
      ['Fondeo endógeno', 'Si el modelo cubre automáticamente los déficits con nueva deuda, la caja nunca aparece negativa y la alerta desaparece. Ese fondeo debe modelarse de forma explícita y visible, con su propio costo, no como un ajuste silencioso.']
    ],
    errores: [
      'Mirar solo el saldo de fin de año y perder el déficit de un mes intermedio.',
      'Tratar toda la caja como disponible cuando parte está restringida.',
      'Tapar el déficit con financiación automática sin registrar su costo.'
    ]
  }
},
{
  codigo: 'U6', titulo: 'Incertidumbre y Risk Simulator',
  competencia: 'Distinguir modelo determinístico y probabilístico; configurar supuestos, distribuciones, correlaciones, pronósticos e iteraciones.',
  aplicacion: 'Asistente de preparación, exportación e importación de simulación.',
  basico: [
    'Variable incierta, distribución, parámetros, correlación y variable de salida.',
    'Monte Carlo como muestreo repetido del modelo a partir de distribuciones de entrada.',
    'Definición de pronósticos, iteraciones, semilla cuando esté disponible y control de convergencia.',
    'Percentiles, probabilidad de ruptura, dispersión y sensibilidad.',
    'Limitaciones por calidad del dato, selección de distribución y correlaciones.'
  ],
  intermedio: {
    intro: 'La simulación no mejora un modelo malo: propaga su incertidumbre. Por eso el documento exige verificar el modelo determinístico antes de simular (§9.1). Un error de fórmula simulado diez mil veces sigue siendo un error, ahora con apariencia estadística.',
    puntos: [
      ['Qué hace realmente Monte Carlo', 'Toma una muestra de cada distribución de entrada, recalcula el modelo, guarda la salida, y repite. El resultado no es un número mejor: es una distribución de resultados posibles bajo los supuestos declarados.'],
      ['Elegir la distribución es una decisión técnica', 'Debe justificarse con evidencia, no con conveniencia. El documento lo vuelve regla operativa: una distribución sin justificación deja la simulación en borrador y no puede publicarse como análisis aprobado (CP-012).'],
      ['La correlación cambia el resultado más que la distribución', 'Si dos variables se mueven juntas y se simulan como independientes, los escenarios extremos —donde ambas empeoran a la vez— quedan subrepresentados y la probabilidad de ruptura sale artificialmente baja. Es el error con mayor impacto y el menos visible.'],
      ['Iteraciones y convergencia', 'Más iteraciones reducen el ruido de muestreo, no la incertidumbre del modelo. El criterio es la estabilidad: si al repetir la corrida los percentiles de interés se mueven de forma apreciable, faltan iteraciones. Fijar la semilla permite reproducir una corrida, requisito de auditoría.'],
      ['Un percentil no es un pronóstico', 'El P50 no es "lo que va a pasar" y el P90 no es "el peor caso". Son puntos de una distribución condicionada a los supuestos. El documento prohíbe explícitamente convertir un percentil en "resultado esperado" sin explicar qué representa (§8.5).'],
      ['Qué ejecuta cada herramienta', 'En el producto mínimo la simulación corre en Excel con Risk Simulator y la app importa los resultados. La app debe mostrarlos como "externa importada" y no afirmar que ejecutó el motor (§9.2, paso 7).']
    ],
    errores: [
      'Simular sobre un modelo determinístico que aún no concilia.',
      'Asumir independencia entre variables que comparten un mismo factor.',
      'Reportar el P50 como si fuera la proyección aprobada.'
    ]
  }
},
{
  codigo: 'U7', titulo: 'Auditoría, backtesting y práctica',
  competencia: 'Revisar errores, comparar proyección con realidad, documentar desviaciones y practicar con información pública autorizada.',
  aplicacion: 'Bitácora, revisión por pares y tablero de error.',
  basico: [
    'Revisión estructural y lógica del modelo.',
    'Inventario de errores, causa, impacto y acción correctiva.',
    'Comparación retrospectiva entre supuestos, proyección y resultados observados.',
    'Revisión por pares en modelos críticos.',
    'Práctica deliberada y repetición con modelos de empresas o proyectos cuya información sea lícita y verificable.'
  ],
  intermedio: {
    intro: 'Un resultado plausible puede venir de una fórmula equivocada. Revisar solo la salida no detecta nada: hay que revisar estructura, lógica, datos y salidas, en ese orden.',
    puntos: [
      ['Las cuatro capas de revisión', 'Estructura: ¿las hojas, bloques y flujos están donde deben? Lógica: ¿la fórmula expresa lo que se quería expresar? Datos: ¿las entradas tienen fuente y son las vigentes? Salidas: ¿el resultado es coherente con órdenes de magnitud conocidos? Saltarse las tres primeras y confiar en la cuarta es lo que el documento llama insuficiente (Tabla 16, fila Auditoría).'],
      ['Errores que no producen error visible', 'Un rango que no incluye la última fila, una referencia que quedó apuntando al periodo anterior, una constante escrita dentro de una fórmula. Ninguno rompe el archivo; todos alteran el resultado en silencio. Por eso el control es sistemático y no por inspección.'],
      ['Backtesting: la proyección no se toca', 'La regla operativa del documento es tajante: conservar la proyección original y registrar el observado por separado (CP-014). Reescribir la proyección con información posterior destruye la única evidencia de qué se creía en su momento.'],
      ['Desviación relativa y su trampa', 'Cuando la base de comparación es cero, negativa o no comparable, el porcentaje es engañoso. El documento exige mostrar "No aplicable" en lugar de un número (§8.6). Una desviación de 300 % sobre una base cercana a cero no informa nada.'],
      ['Sobreajuste retrospectivo', 'Ajustar el modelo hasta que explique bien el pasado no lo hace mejor para el futuro. El documento lo registra como riesgo con control: conservar versiones y separar aprendizaje de reescritura (Tabla 54).'],
      ['La revisión por pares reduce dependencia', 'El riesgo "dependencia del experto" —una sola persona entiende el modelo— se controla con metodología común, documentación, formación y revisión. Es riesgo organizacional, no técnico.']
    ],
    errores: [
      'Revisar el modelo propio sin un segundo par de ojos.',
      'Corregir un error sin registrar su causa, y repetirlo tres meses después.',
      'Comparar contra una proyección ya modificada.'
    ]
  }
},
{
  codigo: 'U8', titulo: 'Estrategia, criterio y riesgo calculado',
  competencia: 'Discutir resultados, contrastar disciplinas, leer críticamente y experimentar con límites definidos.',
  aplicacion: 'Comentarios, justificación, decisión, responsable y aprendizaje registrado.',
  basico: [
    'Discusión de supuestos, contraargumentos y alternativas.',
    'Lectura interdisciplinaria para ampliar la capacidad crítica.',
    'Riesgo calculado como experimento con propósito, límite y aprendizaje esperado.',
    'Reconocimiento de variables externas no controlables.',
    'Registro de la decisión, responsable, incertidumbre residual y condición de revisión.'
  ],
  intermedio: {
    intro: 'El modelo no decide. Ordena la conversación y deja constancia de con qué información se decidió. Esta unidad es la que convierte un cálculo en una decisión que puede revisarse después.',
    puntos: [
      ['Qué distingue un riesgo calculado de una apuesta', 'Objetivo explícito, límite de pérdida definido de antemano, evidencia que respalda la hipótesis, monitoreo durante la ejecución y aprendizaje esperado. Sin el límite previo no hay riesgo calculado: hay exposición.'],
      ['Discutir supuestos, no resultados', 'Discutir el número final rara vez avanza. Discutir el supuesto que más lo mueve —identificado por el análisis de sensibilidad— convierte una diferencia de opinión en una pregunta contestable.'],
      ['Incertidumbre residual', 'Es lo que sigue sin saberse después de decidir. Registrarla no es un formalismo: define qué hay que vigilar y bajo qué condición se revisa la decisión. RN-FIN-10 exige responsable, fecha, comentario y riesgo residual.'],
      ['La condición de revisión', 'Una decisión bien registrada incluye el disparador que obliga a revisarla: un umbral, una fecha, un evento. Sin él, una decisión tomada bajo supuestos que dejaron de ser ciertos sigue vigente por inercia.'],
      ['Variables externas', 'Tasa, tipo de cambio, demanda y regulación no se controlan. La respuesta no es predecirlas mejor, es diseñar una estructura que resista un rango de valores y saber a partir de cuál deja de resistir.']
    ],
    errores: [
      'Cerrar una decisión sin responsable identificado.',
      'Registrar la decisión y omitir qué quedaba sin saberse.',
      'Tratar el modelo como argumento de autoridad en lugar de como insumo.'
    ]
  }
}
];

/* ============================================================
   BANCO DE PREGUNTAS
   origen 'doc'  : las 8 preguntas arquetipo de la Tabla 16.
   origen 'ext'  : ítems equivalentes añadidos. El documento aporta una
                   sola pregunta por unidad y §5.2 exige repreguntar con un
                   ítem distinto del mismo objetivo: sin equivalencias la
                   repregunta no se puede construir. Ver análisis crítico §2.2.
   ============================================================ */

const PREGUNTAS = [
// ---------- U1 ----------
{ id:'P-U1-1', u:'U1', origen:'ext', objetivo:'Distinguir dato, supuesto y resultado',
  enunciado:'En un modelo, la tasa de interés pactada en el contrato de crédito y la tasa de crecimiento de ingresos proyectada para el próximo año son, respectivamente:',
  opciones:['Un dato y un supuesto','Dos supuestos','Dos datos','Un supuesto y un dato'],
  correcta:0,
  bien:'La tasa contractual es verificable contra un documento; la de crecimiento es una decisión sobre el futuro.',
  mal:'La diferencia no es de importancia sino de verificabilidad: el dato ocurrió y se comprueba, el supuesto se decide y necesita racional.',
  riesgo:'Tratar un supuesto como dato elimina la obligación de justificarlo y de revisarlo.' },
{ id:'P-U1-2', u:'U1', origen:'ext', objetivo:'Distinguir dato, supuesto y resultado',
  enunciado:'¿Cuál es la consecuencia de escribir un valor numérico directamente dentro de una fórmula?',
  opciones:['Deja de ser rastreable como entrada y nadie puede auditar su origen','Reduce el tamaño del archivo','Mejora la velocidad de cálculo','Ninguna, si el valor es correcto'],
  correcta:0,
  bien:'Una constante escondida en una fórmula no aparece como entrada y por tanto no tiene fuente, responsable ni fecha.',
  mal:'El problema no es el valor sino su invisibilidad: no puede revisarse lo que no se ve como entrada.',
  riesgo:'Un cambio de condiciones no se refleja porque nadie sabe que ese número está ahí.' },
{ id:'P-U1-3', u:'U1', origen:'ext', objetivo:'Reconocer límites del modelo',
  enunciado:'Un modelo entrega un resultado con dos decimales a partir de supuestos estimados con amplia incertidumbre. ¿Qué problema plantea?',
  opciones:['Falsa precisión: la salida sugiere una exactitud que las entradas no respaldan','Ninguno, más decimales siempre es mejor','Un error de redondeo','Un problema de formato sin efecto'],
  correcta:0,
  bien:'La precisión de la salida no puede superar la de la entrada más débil.',
  mal:'No es un asunto estético: la presentación comunica una confianza que el modelo no tiene.',
  riesgo:'Quien decide interpreta la cifra como certeza y omite pedir el rango.' },

// ---------- U2 ----------
{ id:'P-U2-1', u:'U2', origen:'ext', objetivo:'Conciliar el saldo de deuda',
  enunciado:'Según la identidad de conciliación, el saldo final de una obligación se obtiene como:',
  opciones:['Saldo inicial + desembolsos + capitalizaciones − principal pagado ± ajustes autorizados','Saldo inicial − servicio de deuda del periodo','Saldo inicial × (1 + tasa) − cuota','Saldo inicial + interés devengado − cuota'],
  correcta:0,
  bien:'Corresponde a la fórmula del §8.1 del documento.',
  mal:'Restar el servicio completo mezcla interés con principal: solo el principal reduce el saldo.',
  riesgo:'Restar la cuota entera subestima la deuda viva y sobreestima la capacidad disponible.' },
{ id:'P-U2-2', u:'U2', origen:'ext', objetivo:'Separar principal e interés',
  enunciado:'El contrato establece una cuota única mensual que no discrimina componentes. ¿Cómo debe registrarla el modelo?',
  opciones:['Descompuesta en principal e interés, aunque el contrato no lo haga','Como un único egreso, igual que el contrato','Como principal en su totalidad','Como interés hasta amortizar los intereses y luego como principal'],
  correcta:0,
  bien:'Sin la separación no puede calcularse cobertura ni leerse la evolución de la exposición.',
  mal:'El formato del contrato no determina la estructura del modelo: son propósitos distintos.',
  riesgo:'Sin descomposición, el servicio de deuda y el saldo quedan mal medidos a la vez.' },
{ id:'P-U2-3', u:'U2', origen:'ext', objetivo:'Parámetros contractuales',
  enunciado:'¿Por qué el documento advierte que la app no debe fijar un método de amortización por defecto?',
  opciones:['Porque el método es una condición contractual y cambia por completo el perfil de servicio','Porque todos los métodos dan el mismo resultado','Porque el método solo afecta al interés total','Porque es una preferencia visual del usuario'],
  correcta:0,
  bien:'Cuota fija, abono constante y pago al vencimiento generan perfiles de servicio muy distintos con el mismo monto y tasa.',
  mal:'La diferencia no es menor: determina cuándo hay que pagar, que es donde está el riesgo de liquidez.',
  riesgo:'Un método asumido por defecto produce un calendario que no corresponde al contrato real.' },

// ---------- U3 ----------
{ id:'P-U3-1', u:'U3', origen:'doc', objetivo:'Comprender el numerador del DSCR',
  enunciado:'¿Qué representa el numerador del indicador de cobertura del servicio de deuda?',
  opciones:['El flujo de caja disponible para atender el servicio de deuda','La utilidad neta del periodo','El EBITDA del periodo','El saldo de caja al cierre'],
  correcta:0,
  bien:'El numerador es el CFADS: caja realmente disponible tras operación e inversión elegible.',
  mal:'Confundir utilidad con caja puede sobreestimar la capacidad real.',
  riesgo:'Con utilidad o EBITDA en el numerador, la cobertura aparenta ser mayor de lo que es.' },
{ id:'P-U3-2', u:'U3', origen:'ext', objetivo:'Servicio de deuda cero',
  enunciado:'En un periodo de gracia total el servicio de deuda es cero. ¿Qué debe mostrar la app como DSCR?',
  opciones:['No calculable','Infinito','Cero','El DSCR del periodo anterior'],
  correcta:0,
  bien:'Regla RN-FIN-02 y caso de prueba CP-007: no calculable, nunca infinito.',
  mal:'Mostrar infinito sugiere cobertura perfecta cuando en realidad no existe medición.',
  riesgo:'Un semáforo en verde por división entre cero oculta que no hay información.' },
{ id:'P-U3-3', u:'U3', origen:'ext', objetivo:'Consistencia temporal',
  enunciado:'Un analista divide el CFADS mensual entre el servicio de deuda anual. El indicador resultante:',
  opciones:['No es válido: numerador y denominador deben corresponder al mismo periodo','Es válido si se anualiza después','Es conservador y por tanto aceptable','Es válido solo si el covenant es anual'],
  correcta:0,
  bien:'La app impide combinar periodicidades sin conversión y fuente (RN-FIN-01).',
  mal:'No es una aproximación: el cociente resultante no mide cobertura.',
  riesgo:'Un indicador con periodos cruzados puede errar por un factor de doce.' },

// ---------- U4 ----------
{ id:'P-U4-1', u:'U4', origen:'doc', objetivo:'Efecto de endurecer una restricción',
  enunciado:'¿Qué efecto esperado tiene endurecer una restricción de cobertura?',
  opciones:['Reduce o mantiene, pero no aumenta, el conjunto de montos factibles','Aumenta la capacidad de deuda','No tiene efecto sobre la capacidad','Aumenta la capacidad si mejora la liquidez'],
  correcta:0,
  bien:'La restricción más exigente reduce el espacio de solución. Es la comprobación de monotonía del caso CP-009.',
  mal:'Si el modelo devuelve más capacidad con un covenant más exigente, hay un error en el motor.',
  riesgo:'Un motor que viola la monotonía puede autorizar montos inviables.' },
{ id:'P-U4-2', u:'U4', origen:'ext', objetivo:'Restricción vinculante',
  enunciado:'El motor devuelve un monto máximo factible. ¿Por qué el documento exige identificar además la restricción vinculante?',
  opciones:['Porque señala qué condición hay que negociar o modificar para poder subir el monto','Porque lo exige la norma contable','Porque permite calcular el interés','Porque determina la moneda del contrato'],
  correcta:0,
  bien:'Si vincula la cobertura se negocia umbral o perfil; si vincula la liquidez, calendario o capital de trabajo.',
  mal:'El monto solo dice cuánto; la restricción vinculante dice por qué no más, que es lo accionable.',
  riesgo:'Sin ella, la negociación con el financiador se hace a ciegas.' },
{ id:'P-U4-3', u:'U4', origen:'ext', objetivo:'Capacidad matemática y decisión',
  enunciado:'¿Por qué el máximo monto factible no equivale al monto que conviene solicitar?',
  opciones:['Porque en el máximo la holgura es cero y cualquier desviación produce incumplimiento','Porque el banco nunca aprueba el máximo','Porque el cálculo tiene error de redondeo','Porque el máximo ignora la tasa de interés'],
  correcta:0,
  bien:'El documento separa capacidad matemática de decisión prudencial (§4.2, U4).',
  mal:'El cálculo es correcto; lo que no incorpora es margen ante desviaciones.',
  riesgo:'Solicitar el máximo deja la estructura sin tolerancia ante cualquier variación.' },

// ---------- U5 ----------
{ id:'P-U5-1', u:'U5', origen:'doc', objetivo:'Cobertura frente a liquidez',
  enunciado:'Un escenario cumple el covenant, pero vulnera la caja mínima. ¿Debe quedar como factible?',
  opciones:['No. Debe marcarse como no factible o condicionado según la política configurada','Sí, porque el covenant es la restricción contractual','Sí, si la brecha es menor al 10 %','Depende del criterio del modelador'],
  correcta:0,
  bien:'Cobertura y liquidez son restricciones distintas y ambas deben cumplirse (CP-010).',
  mal:'Cumplir el covenant no dice nada sobre el saldo de caja remanente.',
  riesgo:'Aprobar una estructura que cumple el indicador y aun así deja a la empresa sin caja.' },
{ id:'P-U5-2', u:'U5', origen:'ext', objetivo:'Naturaleza de la caja mínima',
  enunciado:'Respecto de la caja mínima, el documento establece que:',
  opciones:['Es una política o condición del caso, configurable por periodo, moneda y escenario','Es un valor universal del sector','La define automáticamente el modelo','Equivale siempre a un mes de gastos operativos'],
  correcta:0,
  bien:'§8.4: la caja mínima no es un valor universal y debe permitir reglas por periodo, moneda y escenario.',
  mal:'Adoptar una convención de mercado como si fuera política de la organización es precisamente lo que el documento prohíbe.',
  riesgo:'Un umbral inventado convierte la alerta de liquidez en ruido.' },
{ id:'P-U5-3', u:'U5', origen:'ext', objetivo:'Causa de la brecha',
  enunciado:'La app detecta caja por debajo del mínimo en un periodo. Además del monto, ¿qué debe informar?',
  opciones:['El periodo y los principales impulsores de la brecha','Solo la magnitud de la brecha','La recomendación de financiación','El covenant aplicable'],
  correcta:0,
  bien:'§6.5: la app identifica periodo, magnitud y principales impulsores.',
  mal:'El monto señala el problema; la causa es lo que permite actuar.',
  riesgo:'Una alerta sin causa obliga a rehacer el análisis a mano y retrasa la respuesta.' },

// ---------- U6 ----------
{ id:'P-U6-1', u:'U6', origen:'doc', objetivo:'Propósito de las distribuciones',
  enunciado:'¿Cuál es el propósito central de definir distribuciones en una simulación?',
  opciones:['Representar la incertidumbre de las entradas y propagarla a las salidas','Reemplazar los datos faltantes por valores aleatorios','Aumentar la precisión del resultado','Cumplir un requisito de la herramienta'],
  correcta:0,
  bien:'No se trata de reemplazar datos por azar, sino de modelar incertidumbre justificable.',
  mal:'La simulación no crea información: propaga la que ya está declarada en los supuestos.',
  riesgo:'Usar distribuciones para tapar datos ausentes produce resultados sin fundamento.' },
{ id:'P-U6-2', u:'U6', origen:'ext', objetivo:'Efecto de la correlación',
  enunciado:'Dos variables que en la práctica se mueven juntas se simulan como independientes. ¿Qué ocurre con la probabilidad de ruptura?',
  opciones:['Tiende a subestimarse, porque los escenarios donde ambas empeoran a la vez quedan subrepresentados','Tiende a sobreestimarse','No se altera','Solo cambia si las distribuciones son normales'],
  correcta:0,
  bien:'La correlación omitida es el error de mayor impacto y el menos visible en el resultado.',
  mal:'La independencia asumida reparte los malos valores entre corridas distintas en lugar de concentrarlos.',
  riesgo:'La estructura parece más segura de lo que es justo en los escenarios que importan.' },
{ id:'P-U6-3', u:'U6', origen:'ext', objetivo:'Interpretación de percentiles',
  enunciado:'¿Puede presentarse el percentil 50 de la distribución de salida como "resultado esperado"?',
  opciones:['No sin explicar qué representa; el documento lo prohíbe expresamente','Sí, es la definición de valor esperado','Sí, si se ejecutaron más de 10.000 iteraciones','Sí, cuando la distribución es simétrica'],
  correcta:0,
  bien:'§8.5: la app no debe convertir un percentil en resultado esperado sin explicar qué representa.',
  mal:'El P50 es la mediana de un conjunto de escenarios condicionados a los supuestos, no una previsión.',
  riesgo:'Presentar un percentil como pronóstico traslada a la decisión una certeza inexistente.' },
{ id:'P-U6-4', u:'U6', origen:'ext', objetivo:'Orden de la simulación',
  enunciado:'¿Qué debe verificarse antes de ejecutar una simulación?',
  opciones:['Que el modelo determinístico esté verificado y concilie','Que haya al menos 10.000 iteraciones','Que todas las variables tengan distribución normal','Que el archivo esté firmado electrónicamente'],
  correcta:0,
  bien:'§9.1 abre el contenido formativo obligatorio con exactamente esa verificación.',
  mal:'La simulación propaga el modelo tal como está: un error se repite en cada iteración.',
  riesgo:'Miles de corridas sobre un modelo con error producen una distribución de resultados equivocados.' },

// ---------- U7 ----------
{ id:'P-U7-1', u:'U7', origen:'doc', objetivo:'Alcance de la auditoría',
  enunciado:'¿Por qué es insuficiente revisar únicamente el resultado final?',
  opciones:['Porque un resultado plausible puede provenir de una fórmula, vínculo o supuesto incorrecto','Porque el resultado final siempre está mal','Porque la norma exige revisar todo','Porque el resultado final no se puede verificar'],
  correcta:0,
  bien:'La revisión debe cubrir estructura, lógica, datos y salidas.',
  mal:'La plausibilidad del resultado no garantiza la corrección del camino que lo produjo.',
  riesgo:'Un error compensado por otro pasa desapercibido y reaparece al cambiar un supuesto.' },
{ id:'P-U7-2', u:'U7', origen:'doc', objetivo:'Utilidad del backtesting',
  enunciado:'¿Qué permite la comparación entre proyección y resultado observado?',
  opciones:['Identificar desviaciones, sesgos y oportunidades de mejora en supuestos y fórmulas','Corregir la proyección original para que coincida','Calcular el DSCR real','Validar el covenant contractual'],
  correcta:0,
  bien:'El modelo aprende cuando el error se registra y analiza.',
  mal:'Corregir la proyección destruye la evidencia de qué se creía en su momento.',
  riesgo:'Sin proyección original conservada, no hay forma de medir el sesgo.' },
{ id:'P-U7-3', u:'U7', origen:'ext', objetivo:'Desviación relativa no aplicable',
  enunciado:'La base de comparación de una desviación relativa es cero. ¿Qué debe mostrar la app?',
  opciones:['No aplicable','Un 100 % de desviación','Cero por ciento','El valor absoluto de la desviación como porcentaje'],
  correcta:0,
  bien:'§8.6: cuando la base sea cero, negativa o no comparable, la app debe evitar porcentajes engañosos.',
  mal:'Cualquier porcentaje calculado sobre base cero es aritméticamente indefinido o carente de sentido.',
  riesgo:'Una desviación de tres cifras sobre base casi nula distorsiona todo el tablero de error.' },

// ---------- U8 ----------
{ id:'P-U8-1', u:'U8', origen:'doc', objetivo:'Riesgo calculado',
  enunciado:'¿Qué distingue una prueba responsable de una apuesta sin criterio?',
  opciones:['Un objetivo, límites, evidencia, monitoreo y aprendizaje esperado','El tamaño de la inversión comprometida','La aprobación de un superior','El uso de simulación Monte Carlo'],
  correcta:0,
  bien:'El riesgo debe estar diseñado para aprender y proteger la decisión.',
  mal:'Sin límite definido de antemano no hay riesgo calculado: hay exposición.',
  riesgo:'Una prueba sin límite previo puede consumir recursos muy por encima de lo previsto.' },
{ id:'P-U8-2', u:'U8', origen:'doc', objetivo:'Dimensión social de la modelación',
  enunciado:'¿Por qué debe discutirse un modelo con otras personas?',
  opciones:['Porque los supuestos incorporan juicio y el entorno puede requerir perspectivas distintas','Porque lo exige el procedimiento interno','Porque acelera el cálculo','Porque distribuye la responsabilidad legal'],
  correcta:0,
  bien:'La modelación es técnica y también social.',
  mal:'La discusión no reparte responsabilidad: mejora la calidad de los supuestos.',
  riesgo:'Un modelo no discutido concentra el criterio de una sola persona.' },
{ id:'P-U8-3', u:'U8', origen:'ext', objetivo:'Registro de la decisión',
  enunciado:'Además de responsable, fecha y comentario, ¿qué exige registrar la regla RN-FIN-10 al cerrar una decisión?',
  opciones:['El riesgo residual','El monto aprobado','La versión de Excel utilizada','El nombre del financiador'],
  correcta:0,
  bien:'El riesgo residual define qué vigilar y bajo qué condición se revisa la decisión.',
  mal:'Sin incertidumbre residual registrada, la decisión sigue vigente por inercia aunque cambien los supuestos.',
  riesgo:'Nadie sabe qué debía vigilarse y la revisión nunca se dispara.' }
];
