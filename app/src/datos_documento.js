/* ============================================================
   DATOS DEL DOCUMENTO FUENTE
   Documento_Tecnico_App_Modulacion_Financiera_Rehavid_V1.docx
   Transcritos del documento. Nada añadido, nada alterado.
   ============================================================ */

const META = {
  titulo: 'Documento técnico maestro para una app de modulación financiera',
  proceso: 'Modelación financiera de deuda, liquidez, incertidumbre y aprendizaje certificado',
  organizacion: 'Rehavid S.A.S.',
  version: '1.0',
  fecha: '3 de agosto de 2026',
  estado: 'Base técnica para validación funcional y construcción del producto mínimo viable',
  fuentePrimaria: 'Transcripción suministrada por Rehavid, segmento 02:10:14–02:13:20',
  clasificacion: 'Documento interno de diseño; no constituye concepto contable, jurídico, tributario ni crediticio',
  palabras: 9891, parrafos: 324, tablas: 58, secciones: 13
};

/* --- §3.1 Principios rectores --- */
const PRINCIPIOS = [
  ['Trazabilidad antes que sofisticación','Un resultado sin fuente, versión, responsable o fórmula visible no es confiable.'],
  ['Liquidez además de solvencia','Pagar una obligación no basta si la caja remanente vulnera el mínimo definido.'],
  ['Restricciones parametrizables','El covenant proviene del contrato o política; la app no debe inventar el umbral.'],
  ['Incertidumbre explícita','La simulación complementa, no reemplaza, el escenario determinístico.'],
  ['Corrección que enseña','El error en la formación debe producir explicación inmediata y una nueva oportunidad equivalente.'],
  ['Revisión independiente','La auditoría y la discusión reducen la dependencia del modelador original.'],
  ['Juicio humano','La app apoya la decisión; no la presenta como verdad automática.'],
  ['Aprendizaje continuo','Las desviaciones entre proyección y realidad alimentan mejores supuestos futuros.']
];

/* --- §3.2 Arquitectura funcional --- */
const CAPAS = [
  ['Aprendizaje','Contenido básico; laboratorio de Risk Simulator; evaluación adaptativa; certificado.'],
  ['Modelación','Proyectos; supuestos; escenarios; flujo de caja; deuda; cobertura; liquidez.'],
  ['Riesgo','Preparación de simulación; importación; distribución de resultados; sensibilidad; probabilidad de ruptura.'],
  ['Calidad','Validaciones; auditoría de fórmulas; revisión; backtesting; bitácora de errores.'],
  ['Decisión','Tableros; comparación; comentarios; aprobaciones; reportes.'],
  ['Gobierno','Usuarios; permisos; versiones; fuentes; seguridad; trazabilidad; administración de contenido.']
];

/* --- §7.2 Componentes funcionales --- */
const COMPONENTES = [
  ['MF-01','Identidad y acceso','Perfil, cargo en Rehavid, roles, autenticación y permisos.','Gobierno'],
  ['MF-02','Formación','Unidades, recursos, progreso, laboratorio y versiones.','Aprendizaje'],
  ['MF-03','Evaluación','Banco, equivalencias, corrección inmediata, repregunta y puntuación.','Aprendizaje'],
  ['MF-04','Certificación','Emisión, verificación, revocación y expediente.','Aprendizaje'],
  ['MF-05','Proyectos y escenarios','Propósito, horizonte, periodicidad, moneda, fuentes y versiones.','Modelación'],
  ['MF-06','Deuda','Tramos, condiciones, saldos, pagos y calendario.','Modelación'],
  ['MF-07','Cobertura y covenants','CFADS, servicio de deuda, DSCR, restricciones y capacidad.','Modelación'],
  ['MF-08','Liquidez','Caja, mínimo, alertas y periodos críticos.','Modelación'],
  ['MF-09','Risk Simulator','Preparación, exportación, importación, estadísticas y sensibilidad.','Riesgo'],
  ['MF-10','Auditoría y backtesting','Validaciones, revisión, errores, comparación con observados y aprendizajes.','Calidad'],
  ['MF-11','Decisión y reportes','Tableros, comparaciones, comentarios, aprobación y exportación.','Decisión'],
  ['MF-12','Administración','Parámetros, plantillas, catálogos, integraciones y logs.','Gobierno']
];

/* --- §7.3 Flujo de estados --- */
const ESTADOS = [
  ['Borrador','Editable; información incompleta.'],
  ['Validación pendiente','Cálculos ejecutados; controles automáticos en revisión.'],
  ['En revisión','Asignado a un revisor; cambios controlados.'],
  ['Devuelto','Requiere correcciones documentadas.'],
  ['Aprobado','Versión congelada y utilizable para reporte.'],
  ['Reemplazado','Existe una versión posterior aprobada.'],
  ['Archivado','Conservado para trazabilidad; no operativo.']
];

/* --- §7.4 Tableros mínimos --- */
const TABLEROS = [
  ['Resumen ejecutivo','Monto de deuda, servicio, caja mínima, DSCR mínimo, capacidad factible, escenarios y alertas.'],
  ['Perfil de deuda','Saldo, principal, interés y servicio por periodo.'],
  ['Cobertura','DSCR por periodo, covenant aplicable, holgura y ruptura.'],
  ['Liquidez','Caja inicial, flujos, servicio, caja final y brecha frente al mínimo.'],
  ['Simulación','Distribución de salidas, percentiles, probabilidad de ruptura y sensibilidad.'],
  ['Backtesting','Proyección, observado, desviación, sesgo y explicación.'],
  ['Formación','Avance, resultados, errores, repreguntas, dominio y certificados.'],
  ['Gobierno','Versiones, revisiones, cambios, usuarios y eventos.']
];

/* --- §6.1 Roles --- */
const ROLES = [
  ['Participante / modelador','Cursar formación, presentar evaluación, crear modelos, ejecutar escenarios, exportar/importar simulaciones y consultar sus resultados.'],
  ['Revisor','Consultar modelos asignados, revisar supuestos, fórmulas, evidencias y emitir observaciones o aprobación.'],
  ['Gestor de contenido','Crear unidades, preguntas, equivalencias, retroalimentaciones, versiones y reglas de publicación.'],
  ['Administrador','Gestionar usuarios, cargos, permisos, parámetros, plantillas, integraciones y certificados.'],
  ['Auditor','Consultar historial, cambios, aprobaciones, certificados, importaciones y eventos, sin modificar el cálculo.']
];

/* --- §6.2 a §6.4 Rutas operativas --- */
const RUTAS = [
  { rol:'Participante', pasos:[
    'Ingresar con una cuenta autorizada.',
    'Confirmar nombre completo y cargo en Rehavid; reportar cualquier inconsistencia antes del examen.',
    'Revisar la ruta y completar las unidades obligatorias.',
    'Responder actividades formativas; ante error, leer la explicación y resolver la repregunta diferente.',
    'Completar el laboratorio de Risk Simulator o la evidencia definida para esa unidad.',
    'Presentar la evaluación certificable.',
    'Consultar el resultado y el plan de refuerzo, si aplica.',
    'Descargar o verificar el certificado cuando el resultado sea igual o superior al 80 %.'
  ]},
  { rol:'Modelador', pasos:[
    'Crear un proyecto y declarar su propósito, responsable, horizonte, periodicidad, moneda y alcance.',
    'Registrar fuentes, supuestos y escenarios; separar histórico, presupuesto y proyección.',
    'Configurar una o varias obligaciones de deuda.',
    'Definir el mapeo del flujo disponible para servicio de deuda.',
    'Registrar covenants y condiciones de liquidez con su fuente contractual o política.',
    'Ejecutar validaciones de integridad y corregir inconsistencias.',
    'Calcular calendario, servicio de deuda, cobertura, caja y capacidad máxima factible.',
    'Comparar escenarios determinísticos.',
    'Preparar y exportar el modelo para Risk Simulator.',
    'Ejecutar la simulación en Excel, exportar los resultados e importarlos a la app.',
    'Interpretar dispersión, sensibilidad y probabilidad de ruptura.',
    'Solicitar revisión y cerrar la versión aprobada.',
    'Cuando existan datos reales posteriores, ejecutar backtesting y registrar aprendizaje.'
  ]},
  { rol:'Revisor', pasos:[
    'Verificar propósito, alcance, fuentes y versión.',
    'Comprobar consistencia de periodos, monedas y unidades.',
    'Revisar la conciliación de saldos de deuda.',
    'Validar el mapeo del CFADS y del servicio de deuda.',
    'Confirmar que el covenant corresponde a una fuente identificada.',
    'Revisar alertas de liquidez y supuestos críticos.',
    'Evaluar la configuración e interpretación de la simulación.',
    'Registrar hallazgos, severidad, responsable y acción.',
    'Aprobar, devolver o rechazar la versión sin sobrescribir el historial.'
  ]}
];

/* --- §6.5 Operaciones críticas y mensajes de error --- */
const MENSAJES = [
  ['Periodo inconsistente','La app bloquea el cálculo y señala las variables con periodicidad incompatible.'],
  ['Servicio de deuda igual a cero','El DSCR se muestra como “No calculable”; no como infinito.'],
  ['Covenant sin fuente','La app permite guardar borrador, pero no aprobar ni calcular capacidad máxima definitiva.'],
  ['Saldo de deuda no concilia','La app muestra apertura, movimientos y cierre que causan la diferencia.'],
  ['Caja por debajo del mínimo','La app identifica periodo, magnitud y principales impulsores.'],
  ['Archivo de simulación no corresponde','La importación se rechaza si no coincide modelo, versión o plantilla.'],
  ['Distribución sin justificación','La simulación puede quedar en borrador, pero no publicarse como análisis aprobado.'],
  ['Certificado con datos erróneos','Se revoca y reexpide; no se edita el documento emitido.']
];

/* --- §8 Fórmulas del motor financiero --- */
const FORMULAS = [
  { id:'F1', seccion:'8.1', nombre:'Saldo final de deuda',
    expr:'saldo inicial + desembolsos + capitalizaciones − pago de principal ± ajustes autorizados',
    nota:'La naturaleza de cada ajuste debe estar configurada y documentada.' },
  { id:'F2', seccion:'8.1', nombre:'Servicio de deuda',
    expr:'principal pagadero + interés pagadero',
    nota:'Otros componentes se muestran por separado, salvo definición contractual expresa. [F-01]' },
  { id:'F3', seccion:'8.2', nombre:'CFADS',
    expr:'ingresos de caja elegibles − egresos operativos elegibles − inversión elegible ± ajustes definidos',
    nota:'El mapeo exacto debe aprobarse por organización y proyecto para evitar mezclar utilidad contable, EBITDA o caja libre sin definición.' },
  { id:'F4', seccion:'8.2', nombre:'DSCR por periodo',
    expr:'CFADS del periodo ÷ servicio de deuda del mismo periodo',
    nota:'El covenant operativo no debe asumir 1,0 ni ningún otro nivel: se toma del contrato o política configurada. [F-01]' },
  { id:'F5', seccion:'8.3', nombre:'Problema de capacidad',
    expr:'maximizar monto de deuda sujeto a: DSCRₜ ≥ covenantₜ, caja finalₜ ≥ caja mínimaₜ y demás restricciones activas',
    nota:'La salida debe indicar el monto factible, la restricción vinculante, la holgura y los periodos críticos.' },
  { id:'F6', seccion:'8.4', nombre:'Caja final',
    expr:'caja inicial + entradas de caja − salidas de caja − servicio de deuda ± financiación del periodo',
    nota:'' },
  { id:'F7', seccion:'8.4', nombre:'Brecha de liquidez',
    expr:'caja final − caja mínima configurada',
    nota:'Un escenario con brecha negativa se presenta como incumplimiento de liquidez aunque el DSCR cumpla.' },
  { id:'F8', seccion:'8.5', nombre:'Probabilidad de ruptura',
    expr:'corridas válidas con al menos una ruptura ÷ corridas válidas totales × 100',
    nota:'' },
  { id:'F9', seccion:'8.5', nombre:'Percentil',
    expr:'valor de la distribución de salida correspondiente a la probabilidad acumulada seleccionada',
    nota:'La app no debe convertir un percentil en “resultado esperado” sin explicar qué representa.' },
  { id:'F10', seccion:'8.5', nombre:'Sensibilidad',
    expr:'medida de asociación entre variaciones de entradas y variación de la salida, según el método exportado por la herramienta',
    nota:'' },
  { id:'F11', seccion:'8.6', nombre:'Desviación absoluta',
    expr:'valor observado − valor proyectado', nota:'' },
  { id:'F12', seccion:'8.6', nombre:'Desviación relativa',
    expr:'(valor observado − valor proyectado) ÷ base válida de comparación',
    nota:'Cuando la base sea cero, negativa o no comparable, la app debe mostrar “No aplicable”.' },
  { id:'F13', seccion:'5.4', nombre:'Resultado del intento',
    expr:'respuestas correctas en primera respuesta ÷ preguntas válidas × 100', nota:'' },
  { id:'F14', seccion:'5.4', nombre:'Criterio de aprobación',
    expr:'resultado del intento ≥ 80 %', nota:'' },
  { id:'F15', seccion:'5.4', nombre:'Dominio posterior',
    expr:'objetivos resueltos correctamente después del refuerzo ÷ objetivos evaluados × 100', nota:'' }
];

/* --- §8.7 Reglas de negocio financieras --- */
const REGLAS_FIN = [
  ['RN-FIN-01','No calcular con periodos o monedas incompatibles sin conversión y fuente.'],
  ['RN-FIN-02','No mostrar DSCR cuando el servicio de deuda sea cero; indicar “No calculable”.'],
  ['RN-FIN-03','El covenant debe tener tipo, umbral, periodo, fuente y vigencia.'],
  ['RN-FIN-04','El máximo de deuda debe cumplir simultáneamente todas las restricciones activas.'],
  ['RN-FIN-05','Toda variable de entrada debe identificar fuente, responsable, fecha y racional.'],
  ['RN-FIN-06','Históricos, presupuestos y proyecciones no pueden mezclarse sin etiqueta.'],
  ['RN-FIN-07','Una versión aprobada es inmutable; cualquier cambio genera una nueva versión.'],
  ['RN-FIN-08','La salida determinística y la probabilística deben visualizarse por separado.'],
  ['RN-FIN-09','Una importación de Risk Simulator debe coincidir con el modelo y la versión exportada.'],
  ['RN-FIN-10','La decisión final debe registrar responsable, fecha, comentario y riesgo residual.']
];

/* --- §11.1 Requisitos funcionales --- */
const RF = [
  ['RF-001','Alta','Perfil','Registrar nombre completo y cargo en Rehavid; validar antes de certificar.','[R-04]','Perfil visible; cambios auditados.'],
  ['RF-002','Alta','Formación','Publicar unidades que cubran todos los temas identificados y Risk Simulator.','[T-01][T-02][T-03][R-05]','No se puede publicar una ruta con unidades obligatorias faltantes.'],
  ['RF-003','Alta','Evaluación','Exigir resultado mínimo del 80 % para aprobar.','[R-03]','Un resultado inferior no emite certificado.'],
  ['RF-004','Alta','Evaluación','Corregir inmediatamente una respuesta incorrecta y explicar el concepto.','[R-03]','La explicación aparece antes de continuar.'],
  ['RF-005','Alta','Evaluación','Repreguntar con un ítem diferente del mismo objetivo.','[R-03]','No reutiliza el mismo enunciado ni opciones.'],
  ['RF-006','Alta','Evaluación','Separar resultado certificable y dominio posterior al refuerzo.','Diseño técnico','Ambos quedan trazables.'],
  ['RF-007','Alta','Certificado','Generar PDF con nombre, cargo, resultado, fecha, versión y código.','[R-04]','Solo después de aprobar.'],
  ['RF-008','Alta','Certificado','Permitir verificar, revocar y reexpedir certificados.','Diseño técnico','No edita el certificado original.'],
  ['RF-009','Alta','Modelo','Crear proyecto con propósito, horizonte, periodicidad, moneda, responsable y alcance.','[T-01][T-03]','No calcula sin parámetros mínimos.'],
  ['RF-010','Alta','Supuestos','Registrar fuente, racional, fecha, unidad y responsable de cada supuesto.','[T-03]','Supuesto sin fuente queda en borrador.'],
  ['RF-011','Alta','Deuda','Configurar obligaciones y generar calendario de saldos y pagos.','[T-01]','Saldos concilian por periodo.'],
  ['RF-012','Alta','Deuda','Separar principal, interés y componentes adicionales.','[F-01]','Reporte desagregado.'],
  ['RF-013','Alta','Cobertura','Configurar mapeo del CFADS y calcular DSCR por periodo.','[T-01][F-01]','Fórmula y componentes visibles.'],
  ['RF-014','Alta','Covenant','Registrar umbral, vigencia, fuente, frecuencia y consecuencia.','[T-01]','No existe umbral genérico oculto.'],
  ['RF-015','Alta','Capacidad','Calcular máximo monto factible bajo covenants y liquidez.','[T-01]','Identifica restricción vinculante.'],
  ['RF-016','Alta','Liquidez','Calcular caja final y brecha frente a mínimo por periodo.','[T-01]','Alerta y causa del déficit.'],
  ['RF-017','Alta','Escenarios','Duplicar, modificar y comparar escenarios sin alterar el original.','[T-01][T-03]','Comparación absoluta y relativa.'],
  ['RF-018','Alta','Risk Simulator','Exportar plantilla identificada para simulación en Excel.','[R-05]','Incluye modelo, versión, variables y salidas.'],
  ['RF-019','Alta','Risk Simulator','Importar resultados estructurados y validar correspondencia.','[R-05]','Rechaza versión o hash inconsistente.'],
  ['RF-020','Alta','Simulación','Mostrar percentiles, dispersión, probabilidad de ruptura y sensibilidad disponibles.','[R-05][MC-01]','Cada gráfico incluye explicación.'],
  ['RF-021','Media','Simulación','Registrar distribución, parámetros, correlación y justificación.','[R-05][MC-01]','No aprueba sin justificación.'],
  ['RF-022','Alta','Auditoría','Ejecutar validaciones de fórmula, periodo, saldo, unidad y fuente.','[T-02][MQ-01]','Hallazgos con severidad y responsable.'],
  ['RF-023','Alta','Revisión','Asignar revisor, registrar observaciones y aprobar o devolver.','[T-02][T-03]','Historial inmutable.'],
  ['RF-024','Media','Backtesting','Comparar proyección archivada con observado y registrar explicación.','[T-02]','Nunca sobrescribe la proyección.'],
  ['RF-025','Media','Aprendizaje','Construir bitácora de errores de modelación y acciones preventivas.','[T-02]','Error vinculado a modelo y regla.'],
  ['RF-026','Alta','Versiones','Congelar versiones aprobadas y crear nuevas versiones para cambios.','[T-02]','No hay edición silenciosa.'],
  ['RF-027','Alta','Reportes','Exportar informe de modelo, supuestos, deuda, cobertura, liquidez y simulación.','[T-01]','Reporte identifica versión y fuentes.'],
  ['RF-028','Alta','Decisión','Registrar decisión, responsable, comentario y riesgo residual.','[T-03]','No cerrar sin responsable.'],
  ['RF-029','Alta','Gobierno','Mantener log de accesos, cambios, cálculos, importaciones y certificados.','Diseño técnico','Consulta por auditor autorizado.'],
  ['RF-030','Media','Contenido','Versionar lecciones, preguntas, respuestas y retroalimentaciones.','[R-03]','Intento conserva versión cursada.'],
  ['RF-031','Media','Administración','Configurar cargos, roles, catálogos y parámetros sin modificar código.','[R-04]','Cambios auditados.'],
  ['RF-032','Media','Integración','Permitir fase SDK/OEM únicamente tras habilitación contractual.','[RS-02]','Bandera de integración desactivada por defecto.']
];

/* --- §11.2 Requisitos no funcionales --- */
const RNF = [
  ['RNF-001','Seguridad','Definir y verificar controles con referencia a OWASP ASVS 5.0.0. [SEC-01]'],
  ['RNF-002','Privacidad','Minimizar datos personales y aplicar finalidad, acceso restringido y trazabilidad. [COL-02][COL-03]'],
  ['RNF-003','Integridad','Detectar alteración de archivos, resultados y certificados.'],
  ['RNF-004','Auditabilidad','Registrar quién, qué, cuándo, desde dónde y sobre qué versión.'],
  ['RNF-005','Usabilidad','Explicar fórmulas, alertas y resultados en lenguaje técnico comprensible.'],
  ['RNF-006','Accesibilidad','Diseñar navegación por teclado, contraste y alternativas textuales; nivel objetivo por definir.'],
  ['RNF-007','Rendimiento','Definir tiempos máximos de carga, cálculo e importación después de conocer volumen y arquitectura.'],
  ['RNF-008','Disponibilidad','Definir objetivo de disponibilidad, mantenimiento y recuperación antes de contratar infraestructura.'],
  ['RNF-009','Escalabilidad','Separar contenidos, cálculo, archivos y analítica para escalar por demanda.'],
  ['RNF-010','Interoperabilidad','Usar formatos estructurados, diccionario de datos, identificadores y versiones.'],
  ['RNF-011','Mantenibilidad','Pruebas automatizadas, documentación de fórmulas y control de dependencias.'],
  ['RNF-012','Observabilidad','Monitorear errores, importaciones fallidas, accesos, rendimiento y eventos de seguridad.'],
  ['RNF-013','Recuperación','Copias, restauración probada, retención y continuidad definidas por criticidad.'],
  ['RNF-014','Portabilidad','Canal web, móvil o escritorio queda por validar; la arquitectura funcional debe ser independiente.']
];

/* --- §11.3 Historias de usuario --- */
const HISTORIAS = [
  ['HU-01','Como participante, quiero que la app me explique de inmediato mi error y me haga una pregunta diferente, para comprobar que aprendí el concepto.'],
  ['HU-02','Como participante, quiero obtener un certificado con mi nombre, cargo y resultado cuando apruebe.'],
  ['HU-03','Como modelador, quiero registrar los supuestos y su fuente para que otro profesional pueda revisar el modelo.'],
  ['HU-04','Como modelador, quiero visualizar el servicio de deuda y el DSCR por periodo para detectar rupturas.'],
  ['HU-05','Como decisor, quiero conocer el máximo monto factible y la restricción vinculante para evaluar una alternativa.'],
  ['HU-06','Como modelador, quiero comprobar liquidez además de cobertura para no aceptar una estructura que genere crisis de caja.'],
  ['HU-07','Como analista, quiero exportar a Risk Simulator e importar resultados controlados para cuantificar incertidumbre.'],
  ['HU-08','Como revisor, quiero observar fórmulas, fuentes y versiones para auditar el modelo.'],
  ['HU-09','Como equipo, quiero comparar lo proyectado con lo observado para aprender de los errores.'],
  ['HU-10','Como auditor, quiero verificar certificados y cambios sin poder alterar los registros.']
];

/* --- §11.4 Casos de prueba --- */
const CASOS = [
  ['CP-001','Resultado inferior al 80 %','No genera certificado; muestra refuerzo y conserva intento.'],
  ['CP-002','Respuesta incorrecta','Muestra corrección y explicación antes de la siguiente pregunta.'],
  ['CP-003','Repregunta adaptativa','Presenta otro ítem del mismo objetivo con redacción y opciones diferentes.'],
  ['CP-004','Resultado igual o superior al 80 %','Genera certificado verificable con nombre, cargo y resultado.'],
  ['CP-005','Cambio de nombre después de certificar','Revoca y reexpide; no edita el certificado emitido.'],
  ['CP-006','Saldo de deuda no concilia','Bloquea aprobación y muestra el periodo de diferencia.'],
  ['CP-007','Servicio de deuda cero','DSCR se presenta como no calculable.'],
  ['CP-008','Covenant sin fuente','Permite borrador; impide aprobación definitiva.'],
  ['CP-009','Covenant más exigente','La capacidad factible no aumenta con las demás variables constantes.'],
  ['CP-010','Caja menor al mínimo con DSCR cumplido','Escenario queda no factible por liquidez.'],
  ['CP-011','Archivo Risk Simulator de otra versión','Importación rechazada y evento auditado.'],
  ['CP-012','Distribución sin justificación','Simulación queda en borrador y no se publica.'],
  ['CP-013','Versión aprobada editada','Sistema crea nueva versión o bloquea la edición.'],
  ['CP-014','Backtesting','Mantiene la proyección original y registra observado por separado.'],
  ['CP-015','Usuario sin permiso','Niega acceso y registra intento.'],
  ['CP-016','Exportación de reporte','Incluye modelo, versión, responsable, fuentes y advertencias.']
];

/* --- §10.1 Entidades del modelo de datos --- */
const ENTIDADES = [
  ['User','Identidad, cargo, estado, roles y autorizaciones.'],
  ['Course / Unit / ContentVersion','Ruta, unidad, contenido, vigencia y fuente.'],
  ['Question / EquivalentItem','Objetivo, variante, respuesta, explicación y fuente.'],
  ['AssessmentAttempt','Respuestas, resultado, errores, repreguntas, duración y estado.'],
  ['Certificate','Código, participante, cargo, resultado, fecha, versión y estado.'],
  ['FinancialModel','Propósito, responsable, periodo, moneda, versión y estado.'],
  ['Scenario','Nombre, tipo, supuestos y relación con modelo base.'],
  ['Assumption','Variable, valor, unidad, periodo, fuente, racional y responsable.'],
  ['DebtFacility / DebtSchedule','Condición contractual, saldos, pagos y servicio.'],
  ['CashFlowLine','Clasificación, periodo, escenario, origen y valor.'],
  ['Covenant','Indicador, umbral, periodicidad, fuente y consecuencia.'],
  ['LiquidityRule','Caja mínima, vigencia y fuente.'],
  ['SimulationRun','Archivo, versión, parámetros, entradas, salidas y evidencia.'],
  ['BacktestRun','Proyección original, observado, desviación y aprendizaje.'],
  ['Review / Finding','Revisor, hallazgo, severidad, acción y cierre.'],
  ['AuditEvent','Usuario, acción, fecha, entidad, valor previo y valor posterior.']
];

/* --- §12.3 Riesgos --- */
const RIESGOS = [
  ['Falsa precisión','Usuarios interpretan una proyección como certeza.','Advertencias, rangos, supuestos y revisión humana.','Modelo'],
  ['CFADS incorrecto','Mezcla de conceptos contables y de caja.','Mapeo aprobado, diccionario y prueba de conciliación.','Modelo'],
  ['Covenant no contractual','Se usa un umbral supuesto.','Fuente obligatoria y bloqueo de aprobación.','Modelo'],
  ['Error de hoja de cálculo','Fórmulas o vínculos defectuosos.','Validaciones, revisión por pares y control de versión.','Calidad'],
  ['Distribución arbitraria','Resultados probabilísticos sin evidencia.','Justificación, revisión y análisis de sensibilidad.','Riesgo'],
  ['Importación equivocada','Resultados de otro modelo o versión.','Identificador, hash y plantilla controlada.','Riesgo'],
  ['Sobreajuste retrospectivo','Se ajusta el modelo para explicar el pasado sin robustez futura.','Conservar versiones y separar aprendizaje de reescritura.','Calidad'],
  ['Uso no autorizado','Acceso a información financiera o resultados personales.','Roles, mínimo privilegio, logs y cifrado.','Seguridad'],
  ['Fraude de certificado','Alteración o reutilización indebida.','Código verificable, estado y revocación.','Seguridad'],
  ['Licencia insuficiente','Integración o uso no cubierto por el fabricante.','Validación contractual previa.','Legal'],
  ['Dependencia del experto','Solo una persona entiende el modelo.','Metodología común, documentación, formación y revisión.','Organización']
];

/* --- §12.1 MVP --- */
const MVP = [
  ['MVP-1','Formación','Ocho unidades; evaluación adaptativa; 80 %; certificado y administración básica.'],
  ['MVP-2','Modelación','Proyectos, escenarios, supuestos, deuda, CFADS, DSCR, covenants y liquidez.'],
  ['MVP-3','Simulación asistida','Exportación e importación estructurada con Risk Simulator.'],
  ['MVP-4','Calidad','Validaciones, revisión, versionado, auditoría y backtesting básico.'],
  ['MVP-5','Decisión','Tableros, comparación, reportes y registro de decisión.']
];

/* --- §12.4 Decisiones pendientes --- */
const PENDIENTES = [
  'Canal de despliegue: web, móvil, escritorio o combinación.',
  'Número, tipo y complejidad de los modelos que se administrarán.',
  'Métodos de amortización, tasas, calendarios y componentes contractuales requeridos.',
  'Definición corporativa exacta del CFADS y de la caja mínima.',
  'Tipos de covenants distintos al DSCR que deben incluirse.',
  'Formato real de exportación e importación de Risk Simulator y versión instalada.',
  'Licenciamiento vigente y posibilidad de SDK/OEM.',
  'Autoridad que firma o valida certificados internos.',
  'Política de retención, respaldo y eliminación de datos.',
  'Grupo contable y finalidad de los reportes para cada despliegue.',
  'Fuentes de datos y sistemas con los que se integrará la app.',
  'Métricas no funcionales: volumen, concurrencia, tiempos, disponibilidad y recuperación.',
  'Transcripciones adicionales del curso, en caso de existir, para ampliar conceptos, autores y métodos.'
];

/* --- §13.1 Trazabilidad --- */
const TRAZABILIDAD = [
  ['Comportamiento y repago de la deuda','T-01','U2; MF-06; RF-011/RF-012','Calendario, saldo y servicio.'],
  ['Flujo disponible dividido por cuota','T-01','U3; MF-07; RF-013','CFADS/DSCR.'],
  ['Restricción del banco','T-01','U4; MF-07; RF-014/RF-015','Covenant parametrizable.'],
  ['Capacidad de endeudamiento','T-01','U4; motor de capacidad','Máximo factible.'],
  ['Conservar liquidez y evitar crisis','T-01','U5; MF-08; RF-016','Caja mínima y alerta.'],
  ['Practicar muchos modelos','T-02','U7; laboratorio','Práctica deliberada.'],
  ['Máquina del tiempo','T-02','U7; MF-10; RF-024','Backtesting.'],
  ['Auditar errores','T-02','U7; RF-022/RF-025','Revisión y bitácora.'],
  ['Curiosidad y visión global','T-02','U1/U8','Fuentes y discusión.'],
  ['Finanzas y estrategia como tema social','T-03','U8; MF-11; RF-028','Comentarios y decisión.'],
  ['Lectura y pensamiento crítico','T-03','U8','Materiales y reflexión.'],
  ['Riesgo calculado y entorno externo','T-03','U6/U8; MF-09','Simulación y riesgo residual.'],
  ['Aprobación 80 %','R-03','MF-03; RF-003','Examen certificable.'],
  ['Corrección y repregunta diferente','R-03','MF-03; RF-004/RF-005','Motor adaptativo.'],
  ['Certificado con nombre, cargo y resultado','R-04','MF-04; RF-007/RF-008','PDF verificable.'],
  ['Risk Simulator','R-05','U6; MF-09; RF-018–RF-021','Interoperabilidad.']
];

/* --- §13.2 Registro de fuentes. 'citas' contadas sobre el texto del documento --- */
const FUENTES = [
  ['T-01','Transcripción Rehavid, 02:10:14–02:10:48','Deuda, DSCR, restricción, capacidad y liquidez.','Transcripción',17,34],
  ['T-02','Transcripción Rehavid, 02:11:06–02:11:36','Práctica, backtesting, auditoría y curiosidad.','Transcripción',13,30],
  ['T-03','Transcripción Rehavid, 02:12:14–02:13:20','Estrategia, lectura, riesgo calculado y entorno.','Transcripción',13,66],
  ['R-03','Requisito Rehavid: evaluación adaptativa y aprobación','Umbral del 80 %, corrección y repregunta.','Instrucción',8,null],
  ['R-04','Requisito Rehavid: certificado','Nombre, cargo y resultados.','Instrucción',6,null],
  ['R-05','Requisito Rehavid: Risk Simulator','Uso del complemento de Excel.','Instrucción',10,null],
  ['F-01','World Bank. Modernization and restructuring of the road sector — Implementation Status & Results Report, 2019','CFADS, servicio de deuda y DSCR.','Externa',8,null],
  ['RS-01','Risk Simulator — official product page. Real Options Valuation','Simulación, pronóstico, análisis estadístico y optimización en Excel.','Externa',5,null],
  ['RS-02','ROV Software Development Kit (SDK-OEM). Real Options Valuation','Opciones de integración en software propietario.','Externa',5,null],
  ['MC-01','Monte Carlo Tool, version 1.2. NIST, 11 de junio de 2025','Variables, distribuciones, iteraciones y muestreo.','Externa',6,null],
  ['MQ-01','Twenty principles for good spreadsheet practice — 2024 edition. ICAEW','Metodología, competencia, pruebas, monitoreo y revisión por pares.','Externa',5,null],
  ['SEC-01','Application Security Verification Standard 5.0.0. OWASP','Base verificable para seguridad de la aplicación.','Externa',4,null],
  ['COL-01','Ley 1314 y DUR 2420. Ministerio de Comercio, Industria y Turismo','Marco colombiano de información financiera.','Externa',3,null],
  ['COL-02','Ley 1581 de 2012. Función Pública / SUIN','Régimen general de protección de datos personales.','Externa',6,null],
  ['COL-03','Decreto 1074 de 2015','Obligaciones reglamentarias y responsabilidad del tratamiento.','Externa',5,null],
  ['COL-04','Ley 1266 de 2008 y modificaciones. SUIN-Juriscol','Hábeas data financiero, crediticio, comercial y de servicios.','Externa',2,null],
  ['COL-05','Ley 527 de 1999 y Decreto 2364 de 2012. SUIN-Juriscol','Mensajes de datos y firma electrónica.','Externa',3,null]
];

/* --- §10.4 Marco jurídico colombiano --- */
const JURIDICO = [
  ['Ley 1581 de 2012 y reglamentación','Nombre, cargo, resultados, actividad y demás datos personales.','Política, aviso, finalidad, derechos del titular, seguridad, acceso restringido y gestión de incidentes.'],
  ['Ley 1266 de 2008, modificada','Solo si la app trata datos personales financieros, crediticios, comerciales o de servicios en el ámbito regulado.','No asumir aplicabilidad general; realizar análisis específico antes de incorporar datos de personas naturales.'],
  ['Ley 1314 de 2009 y DUR 2420 de 2015','Cuando las salidas se utilicen como información financiera o se conecten con reportes contables.','Mapear cuentas y políticas al grupo aplicable; la app no certifica estados financieros.'],
  ['Ley 527 de 1999 y firma electrónica','Certificados, aprobaciones o evidencias emitidas como mensajes de datos.','Conservar integridad, disponibilidad y trazabilidad; evaluar firma electrónica confiable si se exige autenticidad reforzada.'],
  ['Licencia de Risk Simulator','Uso del complemento, plantillas y eventual SDK/OEM.','Validar derechos por usuario y derechos de integración antes del desarrollo.']
];

/* --- §1.4 Alcance --- */
const ALCANCE = {
  incluido: [
    'Formación, evaluación adaptativa y certificación interna.',
    'Modelos de deuda, cobertura, capacidad y liquidez.',
    'Escenarios determinísticos y resultados probabilísticos importados.',
    'Auditoría, backtesting y aprendizaje con modelos.',
    'Interoperabilidad asistida con Excel y Risk Simulator.',
    'Reportes y trazabilidad.'
  ],
  excluido: [
    'Contabilidad transaccional, libro mayor o sustitución del software contable.',
    'Aprobación automática de crédito o decisión vinculante frente a terceros.',
    'Recomendaciones financieras automáticas sin revisión humana.',
    'Cálculos tributarios específicos o declaraciones fiscales.',
    'Integración directa con bancos, bolsas o fuentes de mercado en el MVP.',
    'Certificación oficial emitida por el fabricante de Risk Simulator.'
  ]
};

/* --- §1.2 Problema que resuelve --- */
const PROBLEMAS = [
  'La construcción de modelos de deuda puede quedar dispersa en hojas de cálculo, con supuestos poco trazables y sin control explícito de restricciones.',
  'El cumplimiento de una cuota no garantiza por sí solo una posición de liquidez sostenible.',
  'Las decisiones pueden basarse en un único escenario determinístico, ignorando incertidumbre y exposición a variables externas.',
  'La práctica y la auditoría de errores no suelen quedar integradas al proceso de aprendizaje.',
  'El conocimiento del modelo y su operación pueden depender excesivamente de una sola persona.'
];

/* --- §3 Ciclo del producto --- */
const CICLO = ['Aprender','Modelar','Validar','Simular','Interpretar','Revisar','Decidir','Comparar','Mejorar'];

/* --- §9.2 Flujo Risk Simulator en el MVP --- */
const FLUJO_RS = [
  'La app valida el modelo determinístico y genera una especificación de simulación.',
  'La app exporta una plantilla de Excel con identificadores del modelo, versión, variables y salidas.',
  'El usuario abre el archivo en Excel y configura o confirma la simulación en Risk Simulator.',
  'Risk Simulator ejecuta la simulación.',
  'El usuario exporta resultados mediante una plantilla estructurada controlada por Rehavid.',
  'La app valida la identidad del modelo, importa resultados y registra la ejecución como “externa importada”.',
  'La app muestra resultados, advertencias y trazabilidad sin afirmar que ejecutó internamente el motor de Risk Simulator.'
];

/* --- §5.1 Diseño de la evaluación --- */
const EVAL_ETAPAS = [
  ['Práctica formativa','Pregunta; respuesta; corrección inmediata; explicación; repregunta diferente sobre el mismo objetivo.','No certifica. Registra dominio y errores.'],
  ['Evaluación certificable','Banco nuevo, selección aleatoria y balanceada por unidades. Cada primera respuesta cuenta para el resultado del intento.','Genera el porcentaje del intento.'],
  ['Error en evaluación','La app corrige de inmediato, explica y presenta una pregunta equivalente distinta. La respuesta original permanece incorrecta para ese intento.','Preserva la validez del 80 % y garantiza aprendizaje.'],
  ['Cierre del intento','La app muestra resultado, unidades dominadas y temas por reforzar.','Aprueba si el resultado es ≥ 80 %.'],
  ['Reintento','Se habilita después de la ruta de refuerzo; usa ítems nuevos o variantes equivalentes.','Genera un nuevo resultado y conserva los anteriores.']
];

/* --- §5.2 Lógica de corrección --- */
const EVAL_LOGICA = [
  'Registrar la respuesta, el tiempo, la versión de la pregunta y el objetivo de aprendizaje.',
  'Indicar inmediatamente que la respuesta es incorrecta, sin mensajes ambiguos.',
  'Mostrar la respuesta correcta y explicar el fundamento técnico, la causa del error y el riesgo de aplicar el criterio equivocado.',
  'Vincular el fragmento formativo pertinente.',
  'Seleccionar otra pregunta del mismo objetivo, con redacción, contexto, orden y distractores diferentes.',
  'Evitar que la repregunta dependa de memorizar la opción mostrada.',
  'Cerrar el objetivo como dominado cuando el participante responda correctamente una variante equivalente.',
  'Conservar por separado el resultado del intento certificable y el dominio alcanzado después del refuerzo.'
];
