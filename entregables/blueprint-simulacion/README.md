# Service Blueprint con Simulación Guiada

Herramienta de un solo archivo HTML para recorrer el service blueprint multiactor de la ruta de incapacidad (caso sintético M.P., organización ancla SURA) con actores reales, en sesiones de simulación conducidas por un facilitador. Pertenece al proyecto doctoral de interoperabilidad clínico-laboral (Proyecto 2).

## Archivos

| Archivo | Uso |
|---|---|
| `service-blueprint-simulacion.html` | Versión descargable. Se abre con doble clic en cualquier navegador moderno; no requiere instalación ni conexión a internet (salvo la tipografía, que tiene alternativa local). |
| `index.html` | Misma herramienta preparada para publicarse como artefacto con conexión compartida. |
| `README.md` | Esta guía, dirigida al facilitador. |

El kit de iconos original (SVG, PNG, catálogo y mapeo) se conserva aparte; la herramienta ya lleva incrustado lo que necesita.

Ningún archivo contiene datos de personas reales. El escenario es sintético.

## Modalidades

La herramienta detecta sola en qué modalidad trabaja y lo indica en la barra superior.

- **Presencial (un computador).** Es la modalidad del archivo descargable. La sesión vive en el navegador del facilitador. Los participantes se turnan en ese computador o abren pestañas del mismo navegador con el código de la sesión. No hay sincronización entre computadores distintos.
- **Compartida (conexión verificada).** Solo cuando la herramienta se publica en un entorno con almacenamiento compartido. Cada participante entra desde su propio navegador con el código de la sesión y los cambios se ven en tiempo real. Esta modalidad no pudo probarse entre navegadores independientes en el entorno de desarrollo; verifíquela con dos computadores antes de una sesión real.

## Tres vistas sobre la misma sesión

1. **Participante.** Entra con el código, su nombre y el actor que representa. Ve su rol, el escenario, el paso actual y la acción esperada. Resuelve una actividad a la vez, con instrucciones y un ejemplo breve. Cada guardado se confirma y, si falta algo, la herramienta dice qué corregir.
2. **Facilitador.** Crea la sesión con un PIN y la conduce en cuatro momentos: Preparar, Ejecutar, Revisar, Cerrar. El escenario viene listo; la configuración avanzada es opcional.
3. **Consulta de resultados.** Con el código de una sesión cerrada se consulta el informe sin PIN.

Varias personas pueden representar la misma entidad (por ejemplo, dos representantes de la EPS). Sus respuestas se guardan por separado y los desacuerdos se muestran en el informe.

## Recorrido del facilitador

1. **Preparar.** Cree la sesión (nombre y PIN). Comparta el código. Confirme la lista de participantes; puede reasignar actores antes de iniciar.
2. **Ejecutar.** Inicie la ronda 1 (funcionamiento actual). Para cada paso vea qué actor tiene la actividad pendiente, en curso, bloqueada o completada. Avance cuando se cumplan las condiciones; si debe avanzar sin cumplirlas, justifique la excepción y quedará registrada. Al terminar los pasos, los participantes valoran la ronda. Luego inicie la ronda 2 (funcionamiento propuesto con el módulo).
3. **Revisar.** Clasifique observaciones, registre riesgos con su mitigación, y para cada conflicto distinga entre proponer una solución y comprobar que quedó resuelta.
4. **Cerrar.** El estado de cierre se calcula con condiciones verificables: Pendiente de evidencia, Requiere ajustes, Listo para revisión del facilitador, Cerrado con decisión documentada. No se puede cerrar con valoraciones obligatorias faltantes, conflictos críticos abiertos o riesgos sin mitigación descrita. La decisión final registra quién decidió, con qué evidencia y qué condiciones se exigen al siguiente prototipo. Desde aquí se descargan el informe (HTML), las tablas (CSV) y, en opciones avanzadas, el JSON completo. Archivar conserva toda la evidencia.

Si el navegador se recarga, la sesión se recupera. El facilitador conserva su acceso durante la pestaña; el participante recupera su identidad en su propia pestaña.

## Reglas del escenario

- Once pasos en tres fases: antes (A1 a A3), durante (E1 a E5) y después (D1 a D3). El trabajador M.P. es el carril de referencia; las intervenciones de cada entidad se resaltan sin reemplazarlo. EPS y ARL se diferencian en todo el recorrido.
- Cada paso declara entradas, actores, acciones permitidas, salidas, condiciones de avance y excepciones. Varios actores pueden tener actividad en el mismo paso.
- Las decisiones estudiadas siguen siendo manuales: suficiencia de la información, finalidad declarada, quién responde y qué se hace ante un faltante. Sesión, participante, actor, paso y fecha se completan solos.
- La finalidad escrita no equivale a finalidad autorizada: la herramienta comprueba las combinaciones permitidas de actor, información, acción y finalidad y marca las que no lo están.
- En la ronda propuesta, los acuses y consultas generados por el sistema quedan etiquetados como simulados.
- Los plazos en días son supuestos de simulación tomados de la matriz de contratos del documento del proyecto, no términos legales. Así se indica en la herramienta.
- El tiempo real de la sesión y el día virtual del caso se registran por separado.

## Evidencia

Cada registro identifica sesión, escenario, ronda, modo, participante, actor, paso y momento, y su origen (participante, facilitador o sistema). Una rectificación crea una versión nueva y conserva la anterior. Nada sobrescribe lo que otro participante registró.

El informe presenta qué se examinó y con quiénes, qué ocurrió por ronda, información faltante y reprocesos, responsabilidades con desacuerdo, barreras con sustento, cambios acordados y el requisito para el siguiente prototipo con su forma de comprobación. Las rondas se comparan solo si corresponden al mismo escenario. Los indicadores subjetivos (percepción) se separan de los observados (comportamiento y resultado técnico) y cada uno muestra su fórmula. Las exportaciones nunca incluyen el PIN.

## Iconografía

La herramienta incorpora el kit de iconos del proyecto (154 pictogramas SVG de una misma familia: trazo 1.65, terminales redondeados, sin rellenos, color heredado del texto). Los iconos acompañan a las etiquetas y nunca las sustituyen: la pantalla se entiende sin interpretar los dibujos. Van incrustados en el propio archivo HTML (hoja de estilo y ayudante `BPIcons` del kit), sin rutas locales ni conexión.

Dónde aparecen:

- Navegación del facilitador: un icono antes de cada momento (Preparar, Ejecutar, Revisar, Cerrar) y de Resultados.
- Títulos de tarjetas y capítulos del informe: un icono junto al encabezado, sin repetirlo en el cuerpo ni en los títulos que quedan justo debajo de su pestaña (Preparar, Ejecutar, Cerrar, Informe).
- Actores: junto al nombre en la cabecera del participante, en las tablas de participantes, actividades y desacuerdos, y en las casillas del recorrido. EPS y ARL tienen pictogramas distintos y conservan su sigla.
- Fases y pasos: icono de fase en la cabecera del recorrido y de paso en cada columna, en la tarjeta del paso y en el título de Ejecutar; los códigos A1 a D3 se conservan.
- Carriles y líneas del blueprint: icono en la cabecera de cada carril y junto a la etiqueta de cada línea (interacción, visibilidad, interacción interna), que sigue dibujada.
- Acciones: icono antes del verbo en Guardar, Rectificar, Avanzar, Pausar, Reanudar, Iniciar, Cerrar la ronda, Cerrar la sesión, Añadir, Quitar, Registrar, Exportar y Archivar. El texto se mantiene.
- Estados: siempre icono más texto (pendiente, en curso, bloqueada, completada, omitida, pausada, en valoración, en revisión, cerrada, archivada, «bloquea el avance», «sin respuesta», «no autorizada», los mensajes de error y los cuatro estados de cierre). El color nunca es la única señal.
- Formularios: icono en el título de cada grupo de preguntas, no en cada casilla. Los `select` nativos no llevan icono.
- Informe exportado en HTML: conserva los iconos en los encabezados; las tablas CSV y el JSON no contienen marcado.

Tamaños: 16 px en chips, leyendas de grupo y apoyos de tabla; 20 px en botones, pestañas y títulos de tarjeta; 24 px en la cabecera del participante y en el estado de cierre. La separación icono-etiqueta es de 8 px (6 px en leyendas y celdas). El único acento de color es el icono del nombre de la aplicación en la barra superior; los demás heredan el color del texto, también en modo oscuro. La tipografía se pide a Google Fonts cuando hay conexión y usa la pila de respaldo del sistema cuando no la hay; los iconos no dependen de ello.

Conceptos del mapeo del kit que no se aplicaron, porque no existen en esta herramienta o porque el encargo pide no iconizarlos:

- Pantallas del archivo de referencia que esta versión no tiene: pestañas Mesa y Guía, tablero e inicio, mapa de actores y mapa vivo, observaciones del blueprint con borrado, retos y sus preguntas, paso de turno, comparación entre mesas, enlaces de acceso y copia de enlaces, reinicio y borrado de sesión, selector de modo y descarga del blueprint como archivo propio.
- Conceptos que aquí son texto y no elemento propio: glosario de términos (custodio, vista mínima, acuse, traza), tensiones del caso, rol de referente jurídico, capítulos «Gestión por actor» e «Hipótesis» del informe anterior (las hipótesis se listan en el capítulo 10 sin icono por párrafo).
- Opciones y casillas de formulario, que por indicación del encargo no llevan dibujo: opciones del semáforo (Aceptar, Aceptar con ajustes, Rechazar), opciones de decisión (incluida controvertir o apelar), barreras de P3, casillas de faltantes, de riesgos y de «Notifica a», campos de texto de ajuste y mitigación. El título del grupo es el que lleva el icono.
- Chips de reglas y rupturas del recorrido: conservan el número y el nombre (las rupturas muestran el nombre al pasar el cursor) sin icono, para no cargar las celdas.
- Estados que aparecen como texto en tablas (entregada, parcial, denegada) y el tipo de observación en un selector nativo.

Los PNG y el sprite del kit no se usan: todos los iconos van como SVG en línea para heredar el color y viajar con el informe exportado.

Los pictogramas son apoyos de orientación. No representan logos institucionales ni acreditan cumplimiento normativo, validez clínica ni validación doctoral.

## Correspondencia doctoral

- Las hipótesis H1 a H4 no se renombran. El texto que muestra la herramienta es un marcador «pendiente de confirmar con el investigador»; debe reemplazarse por las formulaciones aprobadas antes de una sesión con actores.
- Las preguntas propias del prototipo son P1 (representación), P2 (comprensión), P3 (dificultades) y P4 (requisitos), cada una vinculada a una subpregunta de caracterización, diseño o evaluación.

## Verificación realizada antes de la entrega

Recorrido automatizado en modalidad presencial con un facilitador y siete participantes, incluidas dos representantes de la EPS. Resultado: 27 comprobaciones superadas, sin errores de consola.

- Dos participantes del mismo actor conservan respuestas independientes.
- Cambiar de ronda no mezcla valoraciones.
- Recargar la página recupera la sesión y la identidad del participante.
- No hay cierre favorable sin evidencia obligatoria ni sin decisión documentada.
- Las pantallas y el informe muestran los mismos registros (tabla de valoraciones igual al número de registros).
- El acceso de facilitador exige PIN; el PIN no aparece en JSON, CSV ni informe HTML.
- Una persona puede completar una actividad solo con las instrucciones en pantalla.
- Sin desbordamiento horizontal a 1024 px y a 390 px de ancho.

Pendiente: prueba de la modalidad compartida entre navegadores independientes y prueba breve con usuarios representativos (registrar dónde necesitaron ayuda y ajustar).
