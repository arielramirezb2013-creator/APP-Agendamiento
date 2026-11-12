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

1. **Preparar.** Cree la sesión (nombre y PIN). Comparta el código. Confirme la lista de participantes. Un participante sin registros se puede quitar y volver a añadir con otro actor.
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

## Sistema visual

La presentación sigue el diseño del video de referencia elaborado con Gemini a partir del guion y de la herramienta. Se analizó fotograma a fotograma y se aplicó en todos los niveles:

- Paleta: azul marino profundo (#142543 en páginas y #162546 en botones, bandas y carriles), blanco y grises fríos (#FDFDFD, #EAECF0, #F0F1F2), gris pizarra (#5A5F66) para las llamadas de atención, azul claro (#E1EAF3 con borde #4B82B8) para instrucciones y verde (#3E9167) solo para las acciones de avance. Tipografía Roboto con respaldo del sistema; respuestas largas en Roboto Mono.
- Entrada: cabecera blanca con marca y título completo; tarjetas estrechas centradas para participante (avatar y actor) y facilitador (crear sesión o entrar con código y PIN); pie con separadores.
- Facilitador: lienzo blanco; el código de la sesión se muestra en grande en una caja gris azulada; los cuatro momentos y Resultados forman un stepper en flecha; las acciones de avance van en píldora verde y el cierre se presenta como un panel tipo diálogo con título, descripción y tabla Estado/Registros.
- Participante: página azul marino con título «Participante»; una tarjeta blanca grande de dos columnas: barra lateral con avatar del actor, nombre y llamadas gris pizarra con punta (escenario, ronda y paso, acción esperada, tiempo); contenido con cejilla «Participante de…», título de la actividad, píldora verde para ver el recorrido completo, banda del paso con etiqueta en flecha (A1…D3), panel azul claro con la instrucción y el ejemplo, grupos de preguntas y botón grande «Guardar mi respuesta».
- Blueprint: banda de fases en flecha azul marino, carriles como pestañas verticales con texto rotado e icono, pasos con etiqueta en flecha, celdas como tarjetas de nodo, franja sombreada en el carril de custodia (back), flechas de flujo en el carril del trabajador, líneas de interacción, visibilidad e interacción interna conservadas, leyenda de carriles y control de zoom (ampliar, reducir y ajustar al ancho), disponible para participantes y para el facilitador en Ejecutar.
- Informe y consulta de resultados: mismos títulos, tablas y botones; el HTML exportado lleva la hoja de estilo completa.

El tema es exclusivamente claro, como el video; la página declara `color-scheme: light` y pinta todos los fondos, así que no cambia con el modo oscuro del sistema. Tras una revisión con cuatro lentes (fidelidad, funcionalidad, accesibilidad y consistencia) se ajustaron contrastes a AA (gris de apoyo #5F6470, verde de avance #2E7A52), los anchos en teléfonos (botones que envuelven, tablas con desplazamiento, avisos flotantes al pie), el orden en pantallas estrechas (primero la tarea, luego el contexto) y la restauración del foco de teclado tras cada actualización.

Orientación y movimiento: cada pantalla del facilitador abre con una guía «Qué hacer ahora» que cambia con el estado de la sesión; el participante y el facilitador ven una tira de progreso con los once pasos (completado, con excepción, actual, pendiente); durante la valoración el facilitador ve un medidor de valoraciones recibidas en lugar de la tabla de actividades. Las vistas entran con un desvanecimiento breve, los botones responden al pasar el cursor y muestran un indicador mientras guardan, el estado «en curso» late suavemente, el código de sesión aparece con un pequeño realce y los avisos se deslizan. Todo el movimiento se desactiva cuando el sistema pide reducir animaciones.

Seguimiento y vista previa del facilitador: en Ejecutar, la tarjeta «Seguimiento por participante» muestra, para cada persona, conexión, pasos con registro (mini tira A1 a D3), actividad actual y su estado, qué colocó por última vez y los problemas detectados (información parcial o insuficiente, finalidad no autorizada, piezas fuera de contrato, sin responsable claro, M.P. no sabe qué pasa, evidencia denegada, solicitud sin responder, rectificaciones). El botón «Ver su pantalla» abre el momento «Vista del participante», que reproduce en solo lectura exactamente lo que ve esa persona en ese instante; el modo «Su pantalla y mi seguimiento» la pone al lado de la ficha del facilitador con el detalle de lo que colocó en cada paso.

Informe imprimible: «Imprimir o guardar como PDF» abre el cuadro de impresión del navegador con el informe maquetado para A4 (portada con datos de la sesión, índice de capítulos, títulos numerados, tablas con cabecera repetida y filas sin cortar). El mismo HTML exportable lleva esa maquetación.

Estabilidad de pantalla: la interfaz solo se repinta cuando cambia el contenido y conserva el desplazamiento del recorrido, los desplegables abiertos y el foco; la animación de entrada ocurre únicamente al cambiar de vista o de paso.

Elementos del video que no se trasladaron por no corresponder a funciones de la herramienta: campana de notificaciones, botón flotante de chat, menú de usuario y logos de marcas reales (se usa un bloque de marca neutro «Service Blueprint · Con simulación guiada» y el texto «Proyecto 2 · caso de estudio SURA»).

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
- El acceso de facilitador exige PIN; el PIN no aparece en JSON, CSV ni informe HTML. «Salir» revoca el acceso en ese navegador. Es una barrera de uso, no un mecanismo de seguridad: la comprobación ocurre en el navegador.
- Una persona puede completar una actividad solo con las instrucciones en pantalla.
- Sin desbordamiento horizontal a 1024 px y a 390 px de ancho.

Pendiente: prueba de la modalidad compartida entre navegadores independientes y prueba breve con usuarios representativos (registrar dónde necesitaron ayuda y ajustar).

## Auditoría de código y correcciones

Una auditoría de código con pruebas reproducibles encontró 30 hallazgos. Las correcciones se aplicaron sobre las fuentes de `src/` y quedan cubiertas por `tests/auditoria.js` (11 comprobaciones) y por la regresión completa `tests/e2e.js` (43).

Corregido:

- **Almacén local.** Cada documento se guarda en su propia clave (`sbsim_doc_v2:<ruta>`): dos pestañas que escriben a la vez ya no se pisan. Los datos del formato anterior se migran al abrir. Si el almacenamiento está lleno, la herramienta lo dice en lugar de confirmar un guardado que no ocurrió.
- **Cierre.** Un conflicto de rol clasificado por el facilitador y sin comprobar mantiene el estado «Requiere ajustes». Una sesión archivada después de cerrarse conserva «Cerrado con decisión documentada».
- **Acceso.** Los resultados ya no se abren por enlace mientras la sesión no esté cerrada. El PIN no queda escrito en el formulario. El código de sesión se valida.
- **Estados.** Una sesión cerrada o archivada no admite acciones de conducción ni respuestas nuevas. Archivar pide un segundo clic. Avanzar solo actúa desde el paso que muestra el botón y cada acción se ejecuta una sola vez.
- **Formulario del participante.** Si el facilitador cambia de paso mientras alguien escribe, la pantalla se actualiza y lo avisa; ya no se guarda una respuesta en el paso equivocado. La barra de avisos se actualiza siempre.
- **Correcciones de respuestas.** Al corregir, las solicitudes, consultas, notificaciones y acuses de la versión anterior dejan de contar en indicadores y tablas.
- **Contrato y evidencia propia.** La evidencia que un actor custodia no aparece como «fuera de su contrato» ni genera solicitudes a sí mismo.
- **Recorrido completo.** Un participante ve solo sus propias respuestas, no las de otros representantes.
- **Exportaciones.** El CSV neutraliza las celdas que una hoja de cálculo leería como fórmula. El informe toma toda la hoja de estilos. Las descargas rechazadas por el visor se informan bien.
- **Repintado.** El foco vuelve a la opción elegida y el cursor conserva su posición. La tipografía externa ya no bloquea el arranque.
- **Campos ocultos.** No se guardan textos de campos que dejaron de verse (piezas faltantes con información suficiente, ajuste con contrato aceptado).

Pendiente, documentado y sin corregir:

- **Límite de la modalidad compartida.** Cada registro es un documento y el almacén compartido admite 5000: caben unas ocho sesiones completas de doce actores. Antes de un uso intensivo conviene exportar y limpiar.
- **Cierre de ronda sin valoraciones.** El facilitador puede cerrar una ronda aunque falten valoraciones; después no hay forma de recogerlas para esa ronda.
- **Reingreso de un participante.** Salir y volver a entrar con el mismo nombre y actor crea un participante nuevo.
- **Custodia a mitad de paso.** Si a un actor le llega una solicitud después de responder su actividad del paso, la respuesta a la solicitud reemplaza la anterior.
- **Día virtual.** Suma los días que declaran todas las personas que responden en la ronda; crece con el número de participantes. Léalo como total declarado, no como duración de la ruta.
- **Cierre con una sola ronda.** Se conserva: la sesión se puede cerrar con una ronda. El informe no compara rondas en ese caso.
- Las revisiones de interfaz, accesibilidad y documentación de esta herramienta quedaron sin ejecutar.

## Versión asíncrona

Cuando no es posible reunir a los participantes, use la versión individual de `../simulador-offline`: cada persona entra con el usuario y la contraseña de su rol y recorre la simulación por su cuenta. Comparte con esta herramienta el contenido doctoral (`datos-blueprint.js`, `datos-escenario.js`), el sistema visual y el kit de iconos.
