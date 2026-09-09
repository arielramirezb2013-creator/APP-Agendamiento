# Auditoría de los prototipos del mapa de actores (DGIT 6202 · caso SURA)

_Auditoría realizada con cuatro lentes (propósito y fidelidad al documento, sencillez y carga cognitiva, sesión de validación, calidad técnica) sobre los tres entregables construidos, seguida de un panel de diseño para el prototipo blueprint._

## Resumen ejecutivo

Los tres entregables comparten un mismo error de dirección, creciente de uno a otro: convirtieron en operación simulada (roles jugados, días inventados, turnos, contadores, wizards) lo que el documento fuente define como una representación validable de «actores, flujos, tensiones y reglas de interacción» que «no simula aún interfaces, integración técnica ni operación real». En los tres, más del 70 % del código es motor de simulación y menos del 15 % es el blueprint como objeto legible; en ninguno se ve el TO-BE completo en una sola pantalla, y ninguno recoge lo que la sesión de 60–75 min debe producir (actores o relaciones faltantes, conflictos de rol, justificación de permisos, riesgos éticos, desacuerdos). El low-fi (E1) es el más fiel y la mejor cantera: matriz literal de 12 actores, mapa AS-IS/TO-BE con los cuatro tipos de flujo, semáforo por contrato, cinco preguntas, ranking de rupturas, gate y export por actor; lo hunden el modal de rol, la máquina de fricción y un gate que exige 12 roles jugados. El MICL (E2) fue rechazado con razón: abandonó el mapa, el AS-IS y el instrumento, y rompió la identidad; solo vale su matriz campo × finalidad y su lista de etapas con responsable. El Mapa vivo (E3) tiene el contenido más completo de los tres (tarjeta de contrato finalidad · responsable · plazo · acuse, piezas de evidencia con vistas mínimas, contrato de suministro entrega/retiene, alcance literal, H3 en tres dimensiones) pero lo entierra en un juego de 2 actos × 6 turnos con 25 conceptos nuevos, presenta cifras de parámetros («día 308 vs 177») como si fueran evidencia de H3, guarda la validación de un solo actor y bloquea el gate hasta terminar el juego. Conclusión: no se itera ninguno; se reconstruye un prototipo blueprint sobre un único modelo de datos declarativo, reutilizando el mapa, la matriz, el instrumento y el export del low-fi, y la tarjeta de contrato, las piezas de evidencia y el sistema visual del Mapa vivo. Nada de lo que se conserva es mecánica; todo es contenido.

## E1 · Low-fi «Simulador del mapa de actores» (entregables/prototipo-lowfi-mapa-actores/index.html)

Sirvió y es la cantera principal (4/5 en fidelidad). Lo que gustó al cliente —el mapa de 12 actores con conmutador AS-IS/TO-BE y la identidad del deck— es exactamente lo que el documento pide y se conserva. Lo que sobró es todo el motor de simulación por documento (+12/+10/+8 días, pasos, cargas, bitácora), que introduce cifras inventadas y no responde a ninguna hipótesis. Lo que falló: el modal de rol convierte un tablero de grupo en un juego de un jugador; el gate exige valorar 12 roles en el mismo portátil (inalcanzable en 75 min); los contratos se validan como una frase, sin descomponer qué se consulta, qué se entrega, quién responde ni en qué plazo; no hay forma de anotar faltantes ni conflictos; desborda en 375 px.

**Se conserva**
- Datos ACTORES (función · tensión · precedentes · contrato) de los 12 actores y su agrupación focal / SURA ancla / directos / control
- Mapa SVG con POS.asis / POS.tobe, BASE_EDGES de cuatro tipos (información, dictamen, tensión con «¿origen?», «¿quién paga?», «apelación», control) y marco «SURA · organización ancla»
- Instrumento: semáforo Aceptar/Ajustar/Rechazar, preguntas cerradas (claridad 1–5, riesgo dominante, qué le genera la trazabilidad), ranking de 5 rupturas ↑↓, gate con los 4 criterios literales
- Estado de validación independiente por actor (valid[rol]), loadState con validación clave por clave y clave versionada, buildExport con Copiar/Descargar y fallback
- Accesibilidad de nodos SVG (role=button, aria-label, Enter/Espacio), aria-pressed en segmentos, focus-visible, prefers-reduced-motion
- Paleta y tipografía del deck

**Se elimina**
- Motor de simulación asis/tobe: días, pasos, cargas, registros, bitácora, tabla «Resultados AS-IS vs TO-BE» y contador de denegados
- Modal de selección de rol y la lógica «un rol por navegador»
- Mini-juego de actores de control (requerir/reiterar informe) y dependencia entre roles (globalLogs)
- Condición del gate «12 contratos valorados y jugados»
- Grid sin min-width:0 y svg min-width:640 que desbordan en móvil; tokens oscuros duplicados sin verificación

## E2 · «MICL» app tipo SaaS (scratchpad/micl-rechazado.html) — rechazado por el cliente

Falló en propósito, forma y orden (1/5). Es la «operación real» que el slide 3 excluye: login por entidad, sidebar, bandeja, wizards modales con motivación obligatoria y «cambiar de entidad» para avanzar. Desaparecen el mapa, el AS-IS, la matriz de tensiones, el semáforo, las preguntas, el ranking y el gate: no informa la decisión que el documento plantea y H3 no es observable porque no hay nada que comparar. Reduce 12 actores a 7 entidades y rompe la identidad visual. Se rescatan solo dos ideas de contenido, no de pantalla.

**Se conserva**
- La matriz campo × finalidad (DOCDATA.fins / ACCESO): qué campo ve cada finalidad y cuáles quedan «retenidos en origen · regla 3», como formato estático de la celda «consulta» de cada contrato
- La lista de etapas de la ruta con responsable por etapa (ETAPAS/FASES) como eje de columnas del blueprint
- El esquema de registro de cinco columnas (quién · qué · para qué · resultado · acuse) como formato de «traza», sin REG-nnn ni días

**Se elimina**
- Todo el shell: login, sidebar, topbar, campana, bandeja, expediente, wizards, portal, panel de supervisión con SLA
- Los 11 modales y las motivaciones obligatorias en textarea
- Segundo caso J.R., stepper de fases como navegación, tablas de trazabilidad de 6 columnas
- Paleta propia tipo dashboard

## E3 · «Mapa vivo: la ruta de M.P. en dos actos» (entregables/prototipo-medio-modulo-interoperable/index.html) — vigente, sin opinión del cliente

Mejor contenido, peor forma (3/5): se desmonta y se reutiliza. Sirvió todo lo que representa el blueprint de forma estática: la tarjeta de contrato (finalidad · responsable · plazo · acuse), las piezas de evidencia PZ con custodio, versión, campos y vistas mínimas por finalidad, el contrato de suministro entrega/retiene, el alcance literal con Junta Nacional como validación experta, las tres dimensiones de H3, los sellos de custodia fijos en su nodo y el sistema visual con contraste corregido. Sobró el juego completo: 2 actos, 11 turnos, sub-turno, ramas, Reproducir, Saltar, marcador sticky, tira, mini-cotejos, mochila, supuestos editables, hoja inferior con FAB, siete tipos de panel y 18 acciones; ~25 conceptos nuevos y un glosario embebido en el contrato que delata que los términos no se explican solos. Falló en lo esencial: el participante recorre la ruta en vez de validar el blueprint; solo un actor validable por sesión (S.val único, regresión frente al low-fi); gate bloqueado hasta terminar el juego; cifras de parámetros («día 308 vs 177», 158 vs 27 días) presentadas como resultado de H3; Empleador e IPS custodios pasivos; contratos de MinSalud, SuperSalud y Jueces no representados; 1.417 líneas y una spec de 27 criterios para un artefacto de 60 minutos.

**Se conserva**
- Tarjeta de contrato de acceso (Finalidad · Responsable · Plazo · Acuse) y tarjeta de suministro (Entrega / Retiene / versión), generalizadas a IPS, Empleador y AFP
- PZ: cinco piezas de evidencia (HC, APT, INC, HL, DIC) con custodio, versión, campos y vistas por finalidad; visor con «retenido en origen · regla 3» y «vista mínima n de N»
- T2 como semilla de etapas: actor responsable, finalidad, plazo, piezas necesarias, fuera de finalidad, a quién notifica
- SVG por capas con nodos construidos una vez y movidos por transform; sellos de custodia fijos; «.main > * { min-width:0 }»; confirmaciones inline
- Las 5 reglas como lista, las rupturas con «abordada/parcial», las tres dimensiones de H3, el alcance literal y el pie ético
- Tokens claro/oscuro con --gold-ink / --on-gold y teal de contraste corregido
- Arnés Playwright de scratchpad/qa como prueba de humo

**Se elimina**
- Actos, turnos, sub-turno 3b, ramas A/B, Reproducir, Saltar, «Jugar la otra rama», halo «LE TOCA», aristas animadas, sesión recuperada
- Máquina de fricción por documento y toda aritmética de días: FIN_DIAS_DEF, supuestos editables, cronologías, bignums
- Marcador sticky, tira de indicadores, mini-cotejos, mochila, contadores REG, bitácoras, franja «M.P. ve» como feed
- Personas con nombre (Ana Torres, Camilo Rueda, Dra. Luisa Pardo, Diana Prieto) y detalle clínico-laboral (NIOSH, IBC en pesos, M54.4)
- Paneles bienvenida/clic/info/control/escritorio, hoja inferior móvil y FAB
- S.val único, gate en <details> condicionado a S.a2.done, MATRIZ/ACT como tablas paralelas, 45 tamaños ≤ 11 px, --ink-faint como color de texto
- Glosario embebido y micro-notas «Regla n ·» repetidas

## Decisiones de diseño para el prototipo blueprint

- Base estructural = Propuesta 1 (matriz etapas × actores con conmutador HOY / CON EL MÓDULO). Por qué: el addendum define «prototipo blueprint» como «flujos por etapa, responsabilidades, contratos, reglas, evidencia que circula y trazas, al estilo de un service blueprint (etapas × carriles)»; es la única propuesta que lo materializa; el juez de comité la eligió; y la suma real de puntajes (P1 = 73, P2 = 73, P3 = 68) no da ventaja a P3: el «68» del ranking recibido es un artefacto de agregación por nombre, no un veredicto.
- Modelo de operación = Propuesta 2. Por qué: es la única que un participante entiende en dos minutos (una instrucción, clic en su actor, una ficha, ahí mismo vota). Se adopta íntegro: el mapa del deck como índice, una ficha por actor con la fila literal del slide 4 (función · tensión + precedentes · contrato) más el contrato estructurado, y el voto POR ACTOR (12 contratos), no por celda. Esto resuelve las dos advertencias más fuertes de los jueces («no sé cuántas celdas debo votar» y «no votar las 25 celdas»): la matriz se lee y se compara; la ficha se valida.
- Sin jerga de service blueprint. Por qué: ambos jueces penalizaron «carril», «línea de interacción», «línea de visibilidad». Las filas se llaman en español llano: «M.P. y su familia», «Quien decide», «Quien custodia la evidencia», «Módulo · índice + reglas + logs», «Quien vigila». Los únicos seis términos técnicos (custodio, finalidad, vista mínima, responsable y plazo, acuse, traza) se definen una sola vez en la Leyenda y no aparece ninguno más (no REG, no constancia, no cotejo, no turno).
- Densidad controlada. Por qué: la matriz de 25 celdas a 1024×768 es el riesgo número uno. Cada celda muestra una frase (≤ 16 palabras) y una línea de códigos (siglas de evidencia con «n de N», cargo · plazo) más chips; la versión completa (campos retenidos, traza, notifica a) vive solo en la ficha. La fila «Quien vigila» va plegada por defecto. Texto ≥ 13 px en todo el documento.
- Cero cifras derivadas. Por qué: los tres entregables presentaron parámetros como resultados y el cliente pidió quitarlos; H3 es «mejora observable en SURA», no simulable. La única cifra fija es «documentos que hoy lleva M.P.: 6 → 0», rotulada «ejemplo del escenario»; todos los plazos llevan el rótulo «plazo ilustrativo; no es un término legal» (injerto de P3); la tabla H3 de conjunto es cualitativa y se deriva solo de las respuestas de las fichas (n mejora / parcial / no).
- Preguntas que convierten la objeción en dato (injerto de P3 y P2). Por qué: el referente jurídico y la Junta objetarán campos y plazos; el texto libre no es evidencia. Por contrato: semáforo + «Lo que ve y entrega, ¿es lo necesario y nada de más?» (Sí / Le falta un campo: ¿cuál? / Le sobra un campo: ¿cuál?) + «¿Responsable y plazo son asumibles?» (Sí / Con otro plazo: ¿cuál? / No) + «Frente a hoy, ¿mejora?» completitud · trazabilidad · claridad (Sí / Parcial / No). Por participante, una sola vez: claridad de mi responsabilidad 1–5, riesgo dominante, qué me genera la trazabilidad. Validar el propio contrato cabe en ≤ 8 clics.
- Varios validadores en un solo portátil, desacuerdo visible. Por qué: la sesión es un grupo frente a un proyector y el Mapa vivo solo guardaba una validación. Tira «Valido como» con chips; cada voto se guarda bajo el validador activo sin borrar los anteriores; el nombre del validador aparece en cada botón de semáforo y en cada anotación (advertencia de ambos jueces); una fila de chips muestra los votos registrados y el rótulo «Desacuerdo» cuando difieren.
- Anotaciones sobre el mapa reducidas a tres tipos (falta un actor, falta una relación, conflicto de rol), dibujadas provisionalmente sobre el SVG, y riesgos éticos como lista fija de cinco con «mitigación definida sí/no» (injerto de P3). Por qué: son las evidencias del documento que ningún entregable recogía y alimentan de forma contable los criterios 1 y 3 del gate; una lista fija se llena en segundos y no exige redactar.
- Gate siempre visible, con evidencia derivada por criterio y veredicto en tres niveles con regla explícita (injerto de P2): «No avanza» si hay un Rechazar sin ajuste o un riesgo marcado sin mitigación; «Avanza con ajustes» si hay Ajustar, desacuerdos o faltantes no resueltos; «Avanza» en otro caso. Nunca depende de haber recorrido nada ni de 12 votos. Los contratos de MinTrabajo, MinSalud, SuperSalud y Jueces llevan chip «propuesta a validar» y no cuentan en el criterio 2 «flujos esenciales» (advertencia de ambos jueces).
- Junta Nacional como validación experta explícita. Por qué: el experto de JN en la sala debe saber que no se le pide resolver una segunda instancia. La etapa 4 se rotula «Apelación · validación experta (no resuelve)» en la cabecera de la matriz y en su ficha.
- Un solo objeto BLUEPRINT declarativo y renderizadores puros. Por qué: 50 textos de celda y 12 fichas escritos dentro de funciones serían imposibles de cotejar contra el deck; con el objeto único, un revisor puede leer el contenido antes de la sesión sin abrir el JS. Presupuesto 700–850 líneas, ≤ 85 KB, sin scripts externos; estimación realista 2,5–3 días (los jueces señalaron que 2 días era optimista).
- Se conserva el mapa que el cliente calificó de excelente, pero como índice y no como tablero de juego: cambia de layout con el conmutador, se ilumina al seleccionar, recibe rótulos de contrato en TO-BE y las anotaciones del grupo; sin halo, sin animación, sin contadores.