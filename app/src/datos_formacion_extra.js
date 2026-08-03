/* ============================================================
   FORMACIÓN · contenido complementario del documento
   §4.3 referentes · §4.4 actividades · §5.3 y §5.6 · §9.1 Risk Simulator
   Los «pasos» de cada actividad son elaboración propia: el documento define
   la actividad y su producto de aprendizaje, no su procedimiento.
   ============================================================ */

/* §4.4 · las ocho actividades formativas (columna 1 y 2 son del documento) */
const ACTIVIDADES = [
  { u:'U1', nombre:'Mapa del modelo',
    producto:'Clasificar entradas, supuestos, cálculos, restricciones y salidas.',
    pasos:['Toma un modelo existente, propio o didáctico.',
           'Marca cada celda o campo como dato histórico, supuesto, cálculo, restricción o salida.',
           'Señala los que no puedas clasificar: suelen ser constantes escondidas dentro de fórmulas.',
           'Anota, para cada supuesto, si tiene fuente identificable.'] },
  { u:'U2', nombre:'Construcción guiada',
    producto:'Completar una estructura neutra de deuda y flujo sin datos de los casos de la transcripción.',
    pasos:['Abre la herramienta financiera y crea un proyecto nuevo.',
           'Registra un tramo de deuda con condiciones que tú definas.',
           'Comprueba que el saldo concilia periodo a periodo.',
           'Cambia el método de amortización y observa cómo cambia el perfil de servicio.'] },
  { u:'U3', nombre:'Diagnóstico de error',
    producto:'Identificar una inconsistencia de periodo, saldo o fórmula y explicar su efecto.',
    pasos:['Introduce a propósito un CFADS mensual con un servicio de deuda trimestral.',
           'Observa qué hace la app y por qué bloquea el cálculo (RN-FIN-01).',
           'Escribe en una frase qué habría pasado si el sistema no lo hubiera detectado.'] },
  { u:'U4', nombre:'Discusión de covenant',
    producto:'Analizar por qué una alternativa puede pagar la cuota y aun así no ser aceptable.',
    pasos:['Configura un escenario que cumpla el covenant en todos los periodos.',
           'Sube la caja mínima exigida hasta que la brecha se vuelva negativa.',
           'Comprueba que el escenario queda no factible por liquidez (CP-010).',
           'Argumenta ante un compañero por qué el DSCR no bastaba.'] },
  { u:'U6', nombre:'Laboratorio Risk Simulator',
    producto:'Definir supuestos, salidas y una simulación sobre un modelo didáctico.',
    pasos:['Verifica primero que el modelo determinístico concilia.',
           'Selecciona las variables inciertas y justifica por qué lo son.',
           'Exporta la especificación de simulación desde la herramienta financiera.',
           'Ejecuta en Excel con Risk Simulator e importa los resultados de vuelta.'] },
  { u:'U6', nombre:'Lectura de sensibilidad',
    producto:'Explicar qué variables dominan la dispersión y qué decisión requiere revisión.',
    pasos:['Ordena las variables por magnitud de su efecto sobre la salida.',
           'Identifica la que más mueve el resultado.',
           'Pregunta: ¿esa variable tiene fuente sólida o es la más floja del modelo?',
           'Decide qué habría que confirmar antes de aprobar.'] },
  { u:'U7', nombre:'Backtesting',
    producto:'Comparar una proyección archivada con el resultado observado y ajustar el razonamiento.',
    pasos:['Recupera una proyección cerrada, sin modificarla.',
           'Registra el observado en la sección de backtesting.',
           'Lee la desviación absoluta y la relativa; comprueba cuándo sale «No aplicable».',
           'Escribe la causa: ¿supuesto equivocado, fórmula equivocada o entorno distinto?'] },
  { u:'U8', nombre:'Comité de decisión',
    producto:'Defender y cuestionar un escenario con evidencia, límites y riesgo residual.',
    pasos:['Presenta el escenario elegido con su restricción vinculante.',
           'Recibe al menos dos objeciones sobre supuestos, no sobre el resultado.',
           'Registra la decisión con responsable, comentario y riesgo residual (RN-FIN-10).',
           'Define el disparador que obligará a revisarla.'] }
];

/* §9.1 · contenido formativo obligatorio de Risk Simulator */
const RS_FORMATIVO = [
  'Verificar el modelo determinístico antes de simular.',
  'Seleccionar variables inciertas y justificar por qué son inciertas.',
  'Elegir distribuciones y parámetros a partir de evidencia, no por conveniencia.',
  'Definir correlaciones cuando las variables no sean independientes.',
  'Identificar celdas de pronóstico y métricas de decisión.',
  'Configurar número de iteraciones y criterios de estabilidad.',
  'Ejecutar y revisar errores de cálculo.',
  'Interpretar distribución, percentiles, probabilidad de ruptura y sensibilidad.',
  'Documentar versión, archivo, usuario, fecha, supuestos y limitaciones.',
  'Diferenciar resultado importado de Risk Simulator y cálculo nativo de la app.'
];

/* §4.3 · referentes institucionales de validación */
const REFERENTES = [
  ['Banco Mundial', 'Cobertura de deuda: CFADS, servicio de deuda y DSCR.', 'F-01'],
  ['NIST', 'Simulación Monte Carlo: variables, distribuciones, iteraciones y muestreo.', 'MC-01'],
  ['Real Options Valuation', 'Documentación oficial de Risk Simulator.', 'RS-01'],
  ['ICAEW', 'Control de hojas de cálculo: metodología, pruebas y revisión por pares.', 'MQ-01'],
  ['OWASP', 'Seguridad de la aplicación: ASVS 5.0.0 como línea base verificable.', 'SEC-01'],
  ['Fuentes oficiales colombianas', 'Datos, contabilidad y mensajes electrónicos.', 'COL-01']
];

/* §5.3 · modelo de datos de la pregunta */
const PREGUNTA_CAMPOS = [
  ['question_id / version', 'Identificación y control de cambios.'],
  ['learning_objective_id', 'Concepto que se evalúa.'],
  ['equivalence_group', 'Conjunto de preguntas que prueban el mismo objetivo de manera diferente.'],
  ['difficulty / format', 'Balance del examen y selección adaptativa.'],
  ['stem / options / answer', 'Enunciado, opciones y clave.'],
  ['feedback_correct / feedback_incorrect', 'Retroalimentación específica.'],
  ['risk_of_error', 'Consecuencia de interpretar o aplicar mal el concepto.'],
  ['source_reference', 'Origen en transcripción, requisito o fuente validada.'],
  ['status / valid_from', 'Vigencia y publicación.']
];

/* §5.6 · control de expedición del certificado */
const CERT_CONTROL = [
  'No generar certificado cuando el resultado sea inferior al 80 %.',
  'No permitir edición manual del resultado o de la fecha después de emitido.',
  'Corregir datos de identidad mediante revocación y reexpedición, conservando trazabilidad.',
  'No usar una imagen de firma como equivalente automático de firma electrónica.',
  'Aplicar el régimen de protección de datos al nombre, cargo, resultados e historial.',
  'Cuando se requiera autenticidad jurídica reforzada, evaluar firma electrónica confiable conforme a la Ley 527 de 1999.'
];

/* §10.2 · controles de calidad del dato */
const CONTROLES_DATO = [
  'Catálogos controlados para moneda, periodicidad, distribución, estado y tipo de flujo.',
  'Reglas de rango y tipo de dato; valores negativos solo donde tengan sentido financiero.',
  'Conciliación automática de saldos y totales.',
  'Identificador de origen y evidencia adjunta.',
  'Separación entre dato ingresado, dato importado y dato calculado.',
  'Hash o huella de los archivos intercambiados con Excel.',
  'Registro de cambios y aprobación antes de publicar resultados.',
  'Detección de fórmulas faltantes, referencias rotas y divisiones inválidas.'
];

/* Glosario. Aporte externo: el documento usa estos términos, no los define uno a uno. */
const GLOSARIO = [
  ['CFADS', 'Flujo de caja disponible para el servicio de deuda. Caja realmente disponible tras cubrir operación e inversión elegibles. No es utilidad ni EBITDA.', 'U3'],
  ['Servicio de deuda', 'Principal pagadero más interés pagadero en el periodo. Otros componentes contractuales se muestran por separado.', 'U2'],
  ['DSCR', 'Razón de cobertura del servicio de deuda: CFADS del periodo dividido entre el servicio del mismo periodo.', 'U3'],
  ['Covenant', 'Condición contractual o interna verificable. Tiene indicador, umbral, frecuencia, periodo de cura y consecuencia.', 'U4'],
  ['Periodo de cura', 'Plazo que concede el contrato para corregir un incumplimiento antes de que se active la consecuencia.', 'U4'],
  ['Capacidad de deuda', 'Máximo monto factible bajo todas las restricciones activas, en todos los periodos.', 'U4'],
  ['Restricción vinculante', 'La condición que impide aumentar el monto. Señala qué hay que negociar.', 'U4'],
  ['Holgura', 'Margen entre el valor alcanzado y el umbral exigido. En el máximo factible es cero.', 'U4'],
  ['Caja mínima', 'Política o condición del caso que fija el saldo por debajo del cual no debe caer la caja. No es un valor universal.', 'U5'],
  ['Brecha de liquidez', 'Caja final menos caja mínima configurada. Negativa es incumplimiento de liquidez.', 'U5'],
  ['Amortización francesa', 'Cuota constante: el interés decrece y el principal crece a lo largo del plazo.', 'U2'],
  ['Amortización alemana', 'Abono constante a capital: la cuota decrece porque el interés cae con el saldo.', 'U2'],
  ['Bullet', 'Todo el principal se paga al vencimiento; durante el plazo solo se paga interés.', 'U2'],
  ['Periodo de gracia', 'Tramo inicial sin pago de principal. Puede ser parcial (se paga interés) o total (el interés se capitaliza).', 'U2'],
  ['Capitalización de intereses', 'Interés no pagado que se suma al saldo, aumentando la deuda viva.', 'U2'],
  ['Base de días', 'Convención de conteo del interés (30/360, actual/360, actual/365). Cambia el interés calculado.', 'U2'],
  ['Monte Carlo', 'Muestreo repetido del modelo a partir de distribuciones de entrada para propagar incertidumbre a las salidas.', 'U6'],
  ['Distribución', 'Descripción de los valores posibles de una variable incierta y su probabilidad. Debe justificarse con evidencia.', 'U6'],
  ['Correlación', 'Grado en que dos variables se mueven juntas. Omitirla subestima los escenarios donde ambas empeoran a la vez.', 'U6'],
  ['Percentil', 'Valor de la distribución de salida correspondiente a una probabilidad acumulada. No es un pronóstico.', 'U6'],
  ['Probabilidad de ruptura', 'Proporción de corridas válidas con al menos una ruptura. El documento no define qué constituye una ruptura.', 'U6'],
  ['Convergencia', 'Estabilidad de los resultados al aumentar las iteraciones. Reduce el ruido de muestreo, no la incertidumbre del modelo.', 'U6'],
  ['Backtesting', 'Comparación entre una proyección archivada y el resultado observado. La proyección original nunca se reescribe.', 'U7'],
  ['Desviación relativa', 'Diferencia entre observado y proyectado sobre una base válida. Con base cero o negativa se muestra «No aplicable».', 'U7'],
  ['Sobreajuste retrospectivo', 'Ajustar el modelo hasta explicar bien el pasado, sin ganar robustez para el futuro.', 'U7'],
  ['Revisión por pares', 'Verificación por una persona distinta del modelador. Reduce la dependencia del experto.', 'U7'],
  ['Riesgo residual', 'Lo que sigue sin saberse después de decidir. Define qué vigilar y cuándo revisar.', 'U8'],
  ['Riesgo calculado', 'Experimento con objetivo, límite previo, evidencia, monitoreo y aprendizaje esperado.', 'U8'],
  ['Falsa precisión', 'Presentar un resultado con más exactitud aparente de la que sus supuestos respaldan.', 'U1'],
  ['Trazabilidad', 'Capacidad de saber de dónde salió cada dato, quién lo puso, cuándo y con qué racional.', 'U1']
];

/* Fórmulas que corresponden a cada unidad, para mostrarlas dentro de la lección */
const FORMULAS_UNIDAD = {
  U2: ['F1', 'F2'],
  U3: ['F3', 'F4'],
  U4: ['F5'],
  U5: ['F6', 'F7'],
  U6: ['F8', 'F9', 'F10'],
  U7: ['F11', 'F12']
};

/* Reglas de negocio que cada unidad explica */
const REGLAS_UNIDAD = {
  U1: ['RN-FIN-05', 'RN-FIN-06'],
  U2: ['RN-FIN-01'],
  U3: ['RN-FIN-01', 'RN-FIN-02'],
  U4: ['RN-FIN-03', 'RN-FIN-04'],
  U5: ['RN-FIN-04'],
  U6: ['RN-FIN-08', 'RN-FIN-09'],
  U7: ['RN-FIN-07'],
  U8: ['RN-FIN-10']
};

/* Casos de prueba que comprueban lo aprendido en cada unidad */
const CASOS_UNIDAD = {
  U2: ['CP-006'], U3: ['CP-007'], U4: ['CP-009'], U5: ['CP-010'],
  U6: ['CP-011', 'CP-012'], U7: ['CP-014'], U8: ['CP-016']
};
