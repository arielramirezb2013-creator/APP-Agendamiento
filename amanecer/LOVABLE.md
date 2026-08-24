# AMANECER — Documento de desarrollo para Lovable · v2

**Bitácora de cuidado para ELA · Español de Colombia · 24 de agosto de 2026**

Este documento reemplaza al prompt original (§15.1 de la especificación v1). Recoge todo lo ya construido y validado en el prototipo de referencia: los módulos nuevos (Comunidad, Red de apoyo, cuestionario mensual), el rediseño visual cálido y las reglas de implementación aprendidas.

**Cómo usarlo en Lovable:**
1. Pega la sección 1 (**Prompt maestro**) como primer mensaje.
2. Adjunta este documento completo como *Knowledge* del proyecto.
3. Itera por las fases de la sección 12, pantalla por pantalla. Ante cualquier duda de diseño, ganan las secciones 2 (Principios) y 3 (Sistema de diseño).

---

## 1. PROMPT MAESTRO (pegar tal cual como primer mensaje)

> Construye una PWA en React + TypeScript + Tailwind llamada **Amanecer**: bitácora diaria de cuidado para una señora adulta mayor con ELA (esclerosis lateral amiotrófica) en Colombia, para su hijo cuidador y para la comunidad que los acompaña. Español colombiano, tratamiento "usted" (conmutable a "tú"). Offline-first con IndexedDB (Dexie): nada se pierde sin red y los datos viven primero en el aparato.
>
> **Principios bloqueantes (rechaza cualquier solución que los viole):** una sola acción principal por pantalla; objetivos táctiles ≥64 px (botón primario 72 px, ancho completo, anclado abajo); prohibidos swipe, drag, long-press, doble toque y temporizadores que expiran; tipografía escalable en rem sobre `html{font-size:125%}` — cuerpo 1rem (20 px), preguntas 1.4rem (28 px); contraste alto (texto ≥7:1); estado siempre con ícono + palabra, nunca solo color; foco visible de 3 px; `prefers-reduced-motion` respetado; toda acción confirma en pasado ("Guardado ✓") con deshacer de 6 segundos; guardas anti doble toque en todo guardado; todo texto visible vive centralizado en `content/es-CO.ts` con variantes usted/tú.
>
> **Diseño "casa al amanecer" (cálido, humano, NO hospitalario):** fondo crema `#FAF1E4`; durazno del saludo `#FBE2C7` (degradado detrás del saludo del día); superficie `#FFFCF7`; texto marrón café `#43302B` (suave `#7A6357`); acciones en terracota `#B4532A` (hover `#C96A3F`, relleno de selección `#F6DFD0`); acento miel `#D98E2B`; aviso ámbar `#8A5A00` sobre `#FFF1D6`; urgencia roja `#B3261E` sobre `#FDECEA`; éxito `#3E6B3A`; foco `#1A73E8`. Radios de 26 px; nada de bordes grises duros: tarjetas y botones con sombra tibia `0 2px 10px rgba(140,90,50,.10)`. Tipografías Google Fonts: **Atkinson Hyperlegible** (interfaz, diseñada para baja visión) y **Bitter** 600 (saludos, preguntas y títulos de sección). Los íconos son emoji dentro de **insignias redondas** (círculo `#F6DFD0` de 44 px), nunca emoji "desnudo". Un solo componente `BigChoice` para todas las respuestas (chip ≥64 px, seleccionado = borde terracota + relleno durazno + ✓), `PrimaryButton` (72 px) y `CardQuestion` (‹ Volver 64 px arriba-izquierda, píldora de progreso, pregunta en Bitter, opciones, pie con "Pasar" siempre visible).
>
> **Pantallas de la paciente** (sin cuenta ni configuración; abre y está en su inicio): 1) **Inicio**: sol + "Buenos días, [Nombre]" sobre degradado durazno; tarjeta "¿Cómo amaneció hoy?" con botón "Contarle ›"; invitación mensual al cuestionario; seis fichas con insignia (Pasó algo 🩹, Mi comida 🍲, Mi peso ⚖️, Mi semana 🌤️, Comunidad 💬, Mi red de apoyo 🤝); "¿A quién llamo? 📞"; recordatorios del día con "Ya la tomé ✓"; abajo "Soy el cuidador". 2) **Check-in de 10 preguntas**, una por pantalla (ánimo con 5 caras, dolor + zonas, respiración con confirmación de urgencia, sueño + señales, tragar, saliva, habla, movilidad, energía, nota final por voz o texto). 3) **Pasó algo**: 8 tipos de episodio con mensajes de calma. 4) **Mi comida** (≤3 toques, "se atoró" crea episodio vinculado) y **Mi peso** (teclado gigante con coma decimal, gráfica con eje de kilos). 5) **Mi semana**: mapa de ánimo de 4 semanas con caritas, peso y comidas. 6) **Comunidad**: grupos por tema, experiencias con sello "experiencia personal — no es consejo médico", contar la propia por voz o texto, lugares y clínicas del país y del mundo con botón "Cómo llegar" al mapa. 7) **Mi red de apoyo**: entidades locales de su ciudad (o la red nacional ACELA si no hay), llamar o "Preguntar algo" por WhatsApp con registro de estado enviada/respondida. 8) **¿A quién llamo?** con EMERGENCIA roja primera (123) y botón SOS. 9) **Pantalla roja** de urgencia: "ESTO ES URGENTE. Vamos a pedir ayuda ya." con Llamar 123 y contacto de emergencia — nunca pide más datos. 10) **Cuestionario del mes** (ALSFRS-R): 12 preguntas en lenguaje de casa, pausable, resultados por subescalas con sello de autorreporte.
>
> **Modo cuidador** (botón visible + PIN de 4 dígitos): panel con mapa de ánimo, gráfica de peso con tooltip y perfil del cuestionario; llenar o corregir registros "en nombre de ella" (eliminar episodios/comidas con deshacer); contactos; red de apoyo e inquietudes (anotar la respuesta recibida); medicinas y recordatorios (plantilla de laboratorios de riluzol: mensual ×3 → trimestral el primer año → anual, con "confirme con su médico"); checklist de señales urgentes; ajustes (nombre, usted/tú, ciudad, umbral de aviso de peso editable, PIN, alto contraste, exportar respaldo cifrado, borrar todo con doble confirmación); "Preparar reporte para la cita" → PDF de 2 páginas marcado "autorreporte — no es documento clínico".
>
> **Motor de banderas** como funciones puras con tests: 5 reglas ROJAS (mucha falta de aire "ahora", disnea "ahora", atragantamiento que sigue, botón SOS, checklist del cuidador con labios morados / confusión marcada / no puede hablar ni respirar) y 14 ÁMBAR con ventanas (detalladas en la sección 8 del documento adjunto). Máximo UNA tarjeta ámbar por sesión, al cierre del flujo, jamás alarmista: "Esto vale la pena contárselo a [contacto]. ¿La llamamos?" con Llamar / Recordármelo mañana / Ya lo hablamos. La app **orienta, nunca diagnostica**: sin dosis, sin pronósticos, sin recomendar tratamientos.
>
> Empieza por el Inicio + Check-in completo con persistencia local y luego te pido el resto módulo a módulo siguiendo el documento adjunto.

---

## 2. Principios no negociables

1. **Curva de aprendizaje cero para ella**: nunca crea cuenta, nunca escribe contraseña, nunca configura nada. El cuidador configura todo en la primera apertura (nombre, usted/tú, PIN) y la app abre siempre en la pantalla de ella.
2. **Accesibilidad progresiva**: la ELA degrada motricidad, habla y energía. Todo funciona solo con toques sobre objetivos grandes (compatible por construcción con Eye Tracking de iPadOS y Switch Access de Android). Todo lo dictable es también tocable.
3. **La app orienta, nunca diagnostica**: sin diagnósticos, pronósticos ni porcentajes; sin sugerir medicamentos, dosis, oxígeno, dietas ni ejercicios no cargados por el equipo. Las banderas solo dicen "vale la pena contárselo a…" o "esto es urgente — llamar ya".
4. **Ella manda sobre sus datos**: primero en el dispositivo; exportar y borrar todo siempre disponibles; sin publicidad ni analítica de terceros.
5. **Lenguaje de casa**: "¿Le costó pasar la comida?" y no "disfagia". Los términos clínicos solo aparecen en el PDF para el médico. Nunca "síntoma", "paciente" ni "adherencia" en pantallas de ella.

**Checklist de aceptación de CADA pantalla:** objetivo táctil ≥64 px (primario 72 px, ancho completo, abajo) · sin swipe/drag/long-press/doble-toque/temporizadores · texto en rem, escalable a 200% sin romper el layout · ícono + palabra, nunca color solo · foco visible 3 px · `prefers-reduced-motion` · confirmación en pasado + deshacer 6 s · funciona sin conexión.

---

## 3. Sistema de diseño "Casa al amanecer"

### 3.1 Tokens (únicos permitidos)

| Token | Valor | Uso |
|---|---|---|
| fondo | `#FAF1E4` | crema cálida de todas las pantallas |
| fondoHero | `#FBE2C7` | durazno: degradado detrás del saludo del día |
| superficie | `#FFFCF7` | tarjetas y botones claros |
| tinta | `#43302B` | texto (11:1 sobre fondo) |
| tintaSuave | `#7A6357` | texto secundario |
| primario | `#B4532A` | terracota: acciones (≥5:1 con blanco) |
| primarioHi | `#C96A3F` | hover/activo |
| primarioSuave | `#F6DFD0` | relleno de selección e insignias |
| miel | `#D98E2B` | acento decorativo (relleno de gráficas) |
| ámbar | `#8A5A00` sobre `#FFF1D6` | "consulta pronto" |
| rojo | `#B3261E` sobre `#FDECEA` | urgencia (inconfundible) |
| éxito | `#3E6B3A` | confirmaciones |
| foco | `#1A73E8` | solo anillo de foco 3 px |

Radio de esquinas: **26 px**. Sombra tibia en toda superficie clara: `0 2px 10px rgba(140,90,50,.10), 0 1px 3px rgba(140,90,50,.08)` (los bordes duros están prohibidos; el borde terracota solo aparece en el chip seleccionado). Sombra alta para botones primarios: `0 6px 22px rgba(140,90,50,.16)`.

### 3.2 Tipografía

- **Atkinson Hyperlegible** (Google Fonts, 400/700): toda la interfaz. Creada por el Braille Institute para baja visión — es función, no decoración.
- **Bitter** (Google Fonts, 600): saludo del día, preguntas de los flujos y títulos de sección.
- `html { font-size: 125% }` y TODA la escala en rem para respetar el tamaño de texto del sistema: mínimo 0.9rem (18 px), cuerpo 1rem (20 px), botón 1.1rem (22 px), pregunta 1.4rem (28 px), saludo 1.6rem (32 px). Números siempre con `font-variant-numeric: tabular-nums`.

### 3.3 Componentes únicos

- **BigChoice**: el único componente de respuesta. Chip ≥64 px, emoji opcional + palabra; seleccionado = borde terracota 2 px + relleno `#F6DFD0` + ✓; sin seleccionar = superficie con sombra, borde transparente.
- **PrimaryButton**: 72 px, ancho completo, terracota con sombra alta; variantes rojo (urgencia) y neutro (superficie).
- **CardQuestion**: layout de todo flujo — ‹ Volver (64 px) arriba-izquierda, píldora de progreso durazno ("Pregunta 3/10"), pregunta en Bitter 1.4rem, opciones en columna, pie con botón primario y "Pasar" siempre visible.
- **Insignia**: emoji dentro de círculo `#F6DFD0` de 44 px (56 px la grande). Los emoji nunca van sueltos como íconos.
- **Toast**: confirmación en pasado con botón "Deshacer" (64 px) visible 6 segundos.
- **Teclado numérico gigante**: botones de 72 px, coma decimal (se muestra coma, se guarda punto), usado para peso y PIN.
- Navegación = solo botones y una pila de pantallas. **No hay tab bar, ni hamburguesa, ni swipe.**

---

## 4. Check-in diario — "¿Cómo amaneció hoy?" (10 preguntas)

Una pregunta por pantalla, 1 toque por respuesta, "Pasar" siempre visible, objetivo ≤2 minutos. Un check-in por día, editable; el cuidador puede llenarlo "en nombre de ella" (el registro guarda quién lo llenó). Copy en "usted" (cada frase tiene variante "tú").

1. **Ánimo**: "¿Cómo se siente de ánimo hoy?" → 😞 Muy triste · 😕 Triste · 😐 Más o menos · 🙂 Bien · 😄 Muy bien.
2. **Dolor** (se pregunta SIEMPRE): "¿Tiene algún dolor hoy?" → No / Un poco / Bastante / Mucho. Si ≠ No → "¿Dónde le duele?" (Cabeza, Cuello, Hombros, Brazos, Espalda, Piernas, Otro — selección múltiple).
3. **Respiración**: "¿Cómo siente la respiración?" → Bien / Me falta un poco el aire / Me falta mucho el aire. Con la 3.ª → "¿Le está pasando en este momento?": **"Sí, ahora mismo" dispara la pantalla roja de inmediato** (se guarda lo que haya del check-in antes de interrumpir).
4. **Sueño**: "¿Cómo durmió anoche?" → Bien / Regular / Mal. Si Regular/Mal → "¿Qué pasó?" (múltiple): Me desperté con dolor de cabeza · Me faltaba el aire acostada · Pesadillas o sueño intranquilo · Otra cosa. **Elegir "Bien" limpia señales previas** (si corrige la respuesta no quedan señales huérfanas). **"Pasar" conserva lo ya marcado** (una señal respiratoria no se descarta por pasar).
5. **Tragar**: "¿Le costó pasar la comida o la bebida hoy?" → No / Un poco / Sí, bastante.
6. **Saliva**: "¿La saliva le molestó hoy?" → No / Mucha y líquida / Espesa y pegajosa (volumen y viscosidad son cosas clínicamente distintas: nunca fusionarlas).
7. **Habla**: "¿Cómo le fue hablando hoy?" → Bien, como siempre / Con esfuerzo / Casi no me entienden.
8. **Movilidad**: "¿Cómo se movió hoy por la casa?" → Bien, sola / Necesité ayuda / Casi no me pude mover.
9. **Energía**: "¿Cuánta energía tuvo hoy?" → ⚡ Buena / 🔅 Poca / 🪫 Casi nada.
10. **Nota final (opcional)**: "¿Quiere contar algo más?" → 🎙️ Grabar nota de voz (con transcripción es-CO editable) · ⌨️ Escribir · "No, gracias". La nota de voz se pasa directo al guardado (no depender del estado asíncrono de React).

Cierre: "Listo, [Nombre] ✓ Gracias por contarme. Que tenga un lindo día." Si alguna respuesta disparó ámbar, la tarjeta aparece AQUÍ (nunca a mitad de flujo; solo la roja interrumpe).

---

## 5. Episodios — "Pasó algo"

Flujo: ¿Qué pasó? → ¿Cuándo? (Ahora / Hoy más temprano / Otro día → Ayer / Anteayer / Hace unos días) → ¿Qué tan fuerte? (Leve / Moderado / Fuerte) → ¿Qué hicieron? (voz/texto, opcional) → Guardar (≤4 toques). Tras guardar: mensaje de calma según tipo + deshacer 6 s.

Tipos y su microcopy de contención (diccionario editable):

- **🤕 Caída** → "Lo importante es que ya está registrado. Si hay dolor fuerte o golpe en la cabeza, mejor consultar hoy mismo." (ofrece llamar a fisioterapia)
- **😵 Atragantamiento** → pregunta primero "¿Ya pasó o sigue atorada?": **"Sigue" dispara la roja** de inmediato. Si ya pasó: "Qué susto. Respire tranquila: estos episodios casi nunca son peligrosos, pero si se repiten vale la pena contárselo a [fonoaudióloga]. ¿La llamamos?"
- **😰 Falta de aire fuerte** → si cuándo = "Ahora", **roja directa** sin pedir más datos. Después: "Quedó anotado. Si vuelve a sentir mucha falta de aire, avíseme de una vez: ese botón siempre está aquí." (+ botón rojo visible)
- **😖 Espasmo en la garganta** → "Estos espasmos asustan mucho pero suelen pasar solos en poco tiempo. Si no cede o no puede respirar, es una urgencia." (+ botón rojo visible)
- **🥲 Llanto o risa sin control** → "Ese llanto o risa que llega sin avisar es más común de lo que parece y tiene manejo. Su médico sabe de esto." (nunca la etiqueta clínica "pseudobulbar" en pantalla)
- **💔 Crisis de tristeza o angustia** → "Gracias por contarlo; eso también cuenta y mucho. Si quiere hablar con alguien, aquí está su gente."
- **🤒 Fiebre o gripa** → "Quedó anotado. En gripas y fiebres conviene avisarle temprano a su equipo, sobre todo si nota cambios al respirar."
- **📝 Otra cosa** → "Listo ✓ Quedó guardado para contárselo al equipo en el control."

---

## 6. Comidas, peso y "Mi semana"

**Comida (≤3 toques):** momento (Desayuno 🍳 / Almuerzo 🍲 / Comida 🥣 / Entre comidas 🍌) → ¿Qué comió? (voz/foto/texto, opcional) → ¿Cuánto? (Todo / La mitad / Poquito) → ¿Cómo le fue tragando? (Bien / Con esfuerzo / **Se atoró**). "Se atoró" crea automáticamente un episodio de atragantamiento leve vinculado, sin repetir preguntas, y lo dice con calma: "Qué susto. Lo anoté también como episodio, para que el equipo lo vea." La textura del día (Normal/Blanda/Molida/Líquidos espesados) solo la configura el cuidador según fonoaudiología y solo etiqueta el registro — **la app jamás recomienda texturas**.

**Peso semanal:** teclado numérico gigante (botones 72 px, coma decimal visible), validación amable si el número no parece un peso ("Ese número no parece un peso. Revíselo y vuelva a intentar."). Tras guardar: gráfica de 8 semanas y solo dos anotaciones posibles: "Estable ✓" o "⚠️ Ha bajado — vale la pena comentárselo a [nutricionista]". El umbral (por defecto −2 kg en 4 semanas o −5% en 8) es **editable por el cuidador** en Ajustes, y la misma configuración rige la regla, la pantalla y el PDF (una sola fuente de verdad).

**Gráfica de peso (especificación):** línea única marrón café `#43302B` de 2.5 px con relleno miel al 12%, eje de kilos con 3 líneas de rejilla recesivas `#EADFCE`, fechas en los extremos, punto final enfatizado con anillo blanco y valor en negrita ("61,2 kg"), primera cifra como etiqueta directa. En el panel del cuidador añade tooltip al tocar (línea punteada + "12 ago: 61,4 kg"). Nunca dos ejes; nunca paletas arcoíris.

**Mi semana (pantalla de ella, tono cálido, sin alarmas):** mapa de ánimo de 4 semanas — cuadrícula 7×4 donde cada día es su **carita emoji** sobre un tinte suave (ámbar claro para días tristes `#F3CDA6→#F8E0C2`, neutro `#F1EADC`, salvia claro para días buenos `#E3E8D3→#CFE3C6`), con leyenda de las 5 caras + palabra; la gráfica de peso; y "🍲 12 comidas registradas · 9 pasaron bien". Si no hay datos: "Cuando registre sus días, aquí se verá su semana."

---

## 7. Cuestionario del mes (ALSFRS-R autoadministrada)

Invitación suave en el inicio cuando no hay uno completado en 28 días: "¿Hacemos el cuestionario del mes? Son 12 preguntas cortas." [Empezar] [Luego]. Pausable ("Guardar y seguir después" conserva un borrador que se retoma donde iba). 12 preguntas, una por pantalla, 5 opciones grandes (puntúan 4→0, de mejor a peor). Wording de casa (el cuidador puede pedir a su neurólogo la verificación final):

1. **¿Cómo está su forma de hablar?** Hablo normal / Se me nota algún cambio al hablar / Me entienden si repito las cosas / Combino la voz con señas o escritura / Ya no puedo comunicarme con la voz.
2. **¿Cómo está la saliva?** Normal / Un poco más de saliva, sin que se salga / A veces se me sale un poquito / Bastante saliva y algo de babeo / Se me sale constantemente.
3. **¿Cómo le va tragando la comida?** Como de todo, normal / A veces me atoro un poquito / Me cambiaron la consistencia de la comida / Necesito complemento por sonda / Ya no como por la boca.
4. **¿Cómo le va escribiendo a mano?** Escribo normal / Escribo más despacio o con letra distinta / No toda mi letra se entiende / Puedo agarrar el lapicero pero no escribir / No puedo agarrar el lapicero.
5. **¿Cómo le va con los cubiertos y partiendo la comida?** Normal / Más despacio y con torpeza, pero sola / Puedo cortar casi todo, con algo de ayuda / Me cortan la comida, yo como despacio / Me tienen que dar la comida.
6. **¿Cómo le va vistiéndose y arreglándose?** Me arreglo sola, normal / Me arreglo sola pero con esfuerzo / Necesito ayuda en algunas cosas / Necesito ayuda para casi todo / Dependo totalmente de otra persona.
7. **¿Cómo le va volteándose en la cama y acomodando las cobijas?** Normal / Más despacio y con torpeza, pero sola / Puedo voltearme sola con mucha dificultad / Empiezo a voltearme pero no termino sola / No puedo voltearme sin ayuda.
8. **¿Cómo le va caminando?** Camino normal / Camino, pero me cuesta un poco más / Camino con ayuda o con apoyo / Me muevo, pero ya no logro caminar / No puedo mover las piernas a propósito.
9. **¿Cómo le va subiendo escaleras?** Normal / Más despacio / Con cansancio o inestabilidad, a veces me apoyo / Solo con ayuda / No puedo subirlas.
10. **¿Cuándo le falta el aire?** No me falta el aire / Al caminar / Al comer, bañarme o vestirme / Incluso quieta, sentada o acostada / Me falta tanto que se piensa en apoyo de máquina.
11. **¿Puede dormir acostada sin que le falte el aire?** Duermo normal / A veces me cuesta respirar acostada, sin necesitar más almohadas / Necesito más de dos almohadas para dormir / Solo puedo dormir sentada / No logro dormir por la falta de aire.
12. **¿Usa algún aparato para ayudarse a respirar?** No uso ningún aparato / Uso el aparato (BiPAP) a ratos / Uso el aparato todas las noches / Uso el aparato de día y de noche / Respiro con ventilación por traqueostomía.

**Resultados SIEMPRE por subescalas, nunca un número protagonista:** "Habla, saliva y tragar" (ítems 1–3, /12), "Manos y movimiento" (4–9, /24), "Respiración" (10–12, /12). Se muestran como **pequeños múltiplos**: tres filas, cada una con su nombre, una minigráfica de la serie (línea única marrón, punto final) y "10/12" en tabular. Sello permanente en pantalla y PDF: *"Autorreporte. Los estudios muestran que el autorreporte tiende a puntuar ~1,3 puntos por encima de la evaluación del profesional; no compare estas cifras con las de la consulta, compare la tendencia de esta misma serie."* La app NUNCA interpreta caídas de puntaje con mensajes alarmantes.

---

## 8. Motor de banderas (funciones puras, con tests por regla)

Tres salidas exactas: 🟢 nada · 🟡 tarjeta amable AL CIERRE del flujo · 🔴 pantalla completa INMEDIATA.

**Rojas (la pantalla roja nunca pide más datos: primero la llamada):**

| id | Disparador |
|---|---|
| R1 | Check-in respiración = "Me falta mucho el aire" + "¿Le está pasando en este momento?" = Sí |
| R2 | Episodio "Falta de aire fuerte" con cuándo = Ahora |
| R3 | Episodio "Atragantamiento" + "¿Ya pasó o sigue atorada?" = Sigue |
| R4 | Botón SOS del directorio (siempre disponible) |
| R5 | Checklist del cuidador: labios/cara morados · confusión o somnolencia marcada · no puede hablar ni respirar |

Pantalla roja: fondo `#B3261E`, "🚨 ESTO ES URGENTE / Vamos a pedir ayuda ya." (≥32 px), [📞 LLAMAR 123] blanco gigante, [📞 Llamar a (contacto de emergencia)], y abajo "Ya estoy bien".

**Ámbar (ventanas sobre el historial; prioridad decide cuál se muestra):**

| id | Disparador (ventana) | Contacto | Prioridad |
|---|---|---|---|
| A2 | Falta de aire acostada (ortopnea) reportada hoy | Respiración | 100 |
| A1 | Dolor de cabeza al despertar ≥2 días en 7 | Respiración | 95 |
| A12 | Fiebre/gripa + cualquier señal respiratoria en 7 días | Respiración | 90 |
| A3 | Sueño "Mal" ≥3 días en 7, o somnolencia diurna (checklist) | Respiración | 85 |
| A4 | Tos débil que no saca la flema (checklist o episodio) | Respiración | 80 |
| A5 | 2.º atragantamiento en 7 días, o "con esfuerzo/atoro" en ≥50% de las comidas de 3 días (mínimo 2 registradas) | Tragar y comer | 75 |
| A13 | Habla "casi no me entienden" hoy, o "con esfuerzo" ≥3 días en 7 | Fonoaudiología | 72 |
| A7 | Saliva espesa ≥3 días en 7 (ruta distinta a la fina) | Tragar y comer | 70 |
| A6 | Peso: −2 kg en 4 semanas o −5% en 8 (umbral editable) | Nutrición | 65 |
| A8 | Dolor Bastante/Mucho ≥3 días en 7, o dolor nuevo tras ≥3 registros sin dolor; el contacto depende de la zona (cuerpo → fisioterapia; cabeza/otro → médico), recordando las zonas de la semana | Fisioterapia/Médico | 60 |
| A9 | 2.ª caída en 30 días, o tropiezos (checklist) | Moverme | 55 |
| A14 | Movilidad "casi no me pude mover" hoy, o "necesité ayuda" ≥3 días en 7 | Fisioterapia | 53 |
| A11 | Llanto/risa sin control ≥2 episodios en 14 días | Médico tratante | 50 |
| A10 | Ánimo en las 2 caras más bajas ≥3 días SEGUIDOS, o crisis de tristeza | Ánimo/psicología | 45 |

**Comportamiento del motor (importantísimo):** máximo UNA tarjeta ámbar por sesión (la de mayor prioridad; las demás quedan silenciosas para el reporte) · la tarjeta ofrece [📞 Llamar a {contacto}] [Recordármelo mañana] [Ya lo hablamos] y registra la decisión · **"Llamar" y "Ya lo hablamos" silencian esa regla 7 días** · "Recordármelo mañana" re-ofrece la tarjeta al día siguiente UNA sola vez — también para reglas puntuales como la ortopnea, cuya condición ya no sería cierta mañana · la misma regla nunca se repite el mismo día · una roja JAMÁS se silencia. Copy patrón, cercano y sin miedo: "Ha amanecido con dolor de cabeza varios días. A veces eso tiene que ver con cómo se respira de noche, y su especialista sabe qué revisar. ¿Le avisamos a {contacto}?"

---

## 9. Red de apoyo y Comunidad

### 9.1 Mi red de apoyo (con inquietudes)

- Entidades **locales de la ciudad configurada** (el cuidador pone la ciudad en Ajustes) y red **nacional** siempre visible. Si no hay locales: "En {ciudad} aún no hay grupo local registrado. La red nacional la acompaña igual."
- Precargas verificadas y editables (Colombia): **ACELA** nacional (tel. 300 203 7108, WhatsApp) · Clínica de Excelencia en ELA del Hospital Universitario Nacional (Bogotá) e Instituto Roosevelt (Bogotá) **sin teléfono** — "pida la ruta por su EPS" (no inventar datos de contacto jamás).
- **"Preguntar algo"**: escribe o dicta la inquietud → elige la entidad → se abre WhatsApp (`wa.me`) con el mensaje ya redactado ("Hola, escribo desde la app {app} por {nombre}. Nuestra pregunta: {texto}") → queda registrada como "📨 Enviada — esperando respuesta". El cuidador anota la respuesta recibida y a ella le aparece "✅ Respondida" con el texto.

### 9.2 Comunidad

- Aviso honesto arriba: en el prototipo local el contenido ajeno es de ejemplo; la conversación real entre miembros llega con la fase en línea.
- **Grupos** que filtran el muro: 🌻 La ELA en el día a día · 🥣 Alimentación y deglución · 🗣️ Comunicación y voz · 🦽 Movilidad y ayudas · 💞 Quienes cuidamos · 📋 Trámites y EPS.
- **Experiencias**: tarjeta con insignia del rol (🌼 Vive con ELA / 💞 Cuida a alguien / 🏥 Institución), autor, grupo, fecha, texto, botón "🤍 Me sirvió (n)" y "💬 Conversar" (muestra la nota de fase en línea). **Cada tarjeta lleva el sello fijo: "Experiencia personal — no es consejo médico. Confírmelo con su equipo."** Las experiencias de ejemplo hablan de lo vivido (espesar líquidos que enseñó la fono, banco de voz a tiempo, la ruta del HUN, la tutela de la silla con ACELA, rampa casera, descanso del cuidador) y NUNCA nombran medicamentos ni dosis.
- **Contar mi experiencia**: voz o texto → elegir grupo → se guarda marcada "Tuya" ("Guardada ✓ Vive en este aparato y se compartirá cuando la comunidad esté en línea"). Instrucción visible al escribir: "Sin nombres de medicamentos ni dosis: eso es del médico."
- **Lugares y clínicas** (nacional e internacional): HUN y Roosevelt (Bogotá, con botón **"🗺️ Cómo llegar"** que abre `google.com/maps/search/?api=1&query=…`), ACELA (Colombia), ALS Association (EE. UU., als.org), Alianza Internacional de Asociaciones de ELA/EMN (mundial, als-mnd.org), TRICALS (Europa, tricals.org). Nota: "Los teléfonos se piden por su EPS o por ACELA."

---

## 10. Directorio, recordatorios, modo cuidador y PDF

**¿A quién llamo?**: tarjeta EMERGENCIA roja SIEMPRE primera (Llamar 123 gigante + contacto de emergencia + botón 🆘 SOS que dispara la roja); luego tarjetas por tema (Respirar, Comer y tragar, Alimentación, Moverme, Ánimo, Mis medicinas, Trámites de la EPS) con nombre, "¿para qué la llamo?", Llamar (`tel:`) y WhatsApp. Llamar a cualquiera: ≤2 toques desde el inicio. Editable solo en modo cuidador; precargas 123 y ACELA.

**Recordatorios** (locales, funcionan sin conexión; siempre visibles al abrir como respaldo de la notificación): medicinas con horarios y confirmación de 1 toque "Ya la tomé ✓" (con deshacer) — la app NUNCA muestra dosis distintas a las escritas por el cuidador; **plantilla de laboratorios de riluzol** (mensual ×3 → trimestral el primer año → anual) editable, con "Esquema orientativo de guía; confirme fechas con su médico tratante"; citas con "qué llevar" (autocompleta "el Reporte de Control impreso"); peso semanal el día elegido.

**Modo cuidador** (botón visible "Soy el cuidador" + PIN 4 dígitos; jamás un gesto oculto): panel con mapa de ánimo de 4 semanas, gráfica de peso con tooltip, perfil del cuestionario y alertas pendientes de revisar · "Llenar el registro de hoy por ella" · Registros de 14 días con quién los llenó, corregir el de hoy y **eliminar episodios/comidas con deshacer** · Contactos · Red de apoyo e inquietudes · Medicinas y recordatorios · Cuestionario del mes · Checklist de señales urgentes (3 rojas + tos débil, somnolencia de día y tropiezos que van a ámbar) · Reporte · Mi plan (tarjetas informativas: kit por si acaso, voluntad anticipada, hospital preferido) · Ajustes: nombre de ella, nombre de la app, usted/tú, **ciudad**, alto contraste, día del peso, **umbral de aviso de peso** (kg/4 sem y %/8 sem), cambiar PIN, exportar respaldo **cifrado con contraseña** (AES-GCM), restaurar, y "Borrar todo" con doble confirmación + PIN.

**Reporte de Control (PDF, 2 páginas, genera offline):** encabezado con "Registro de autorreporte generado por la app {nombre} — no es un documento clínico" · página 1: tendencia de peso con umbral configurado, perfil ALSFRS-R por subescalas con su sello, resumen de ánimo, adherencia a medicación con **denominador honesto** (desde la primera toma registrada, no desde el inicio del periodo) · página 2: tabla de episodios, señales respiratorias (días con ortopnea/cefalea/sueño malo), deglución, saliva fina vs. espesa, dolor, habla y movilidad, inquietudes enviadas/respondidas, alertas del periodo y notas destacadas · pie: "Elaborado para el control multidisciplinario. Frecuencia sugerida por guías: cada 2-3 meses (NICE NG42)." Términos clínicos permitidos SOLO aquí.

---

## 11. Reglas de implementación (lecciones ya aprendidas — no repetir errores)

1. **Offline-first real**: IndexedDB (Dexie). Tablas: perfiles, contactos, checkins (fecha única), episodios, comidas, pesos, medicinas, recordatorios, eventosBandera, notasVoz, tarjetasPlan, config (umbrales), redApoyo, inquietudes, alsfrs, publicaciones.
2. **Fechas SIEMPRE en hora local** ("yyyy-mm-ddTHH:mm:ss" sin zona). Con UTC, un registro nocturno en Colombia (UTC−5) cae en el día siguiente y rompe las ventanas de las reglas.
3. **Guarda anti doble toque** en todo guardado asíncrono: la usuaria tiene motricidad reducida; un doble toque no puede crear dos registros (dos "atoros" falsos dispararían A5).
4. **Deshacer 6 s** tras cada guardado (toast), incluida la toma de medicina, la comida (borra también su episodio vinculado) y el episodio.
5. **Los datos recién producidos se pasan por parámetro al guardado**, nunca leídos del estado de React inmediatamente después de un `set` (así se perdía la nota de voz).
6. **Siembra de precargas atómica** (transacción con conteo+inserción): puede invocarse dos veces al arrancar y no debe duplicar ACELA.
7. **Una sola fuente de verdad para los umbrales de peso**: la config del cuidador rige regla, pantalla de tendencia y PDF.
8. Todo texto visible en `content/es-CO.ts` con tipo `Frase = string | {usted, tu}` y helper `t(frase, tratamiento)`; el microcopy de episodios en su propio diccionario; los ítems ALSFRS con el texto clínico en comentario.
9. PWA instalable con service worker; notificaciones locales con permiso, y la lista del día visible al abrir como respaldo.
10. Sin analítica de terceros, sin SDKs publicitarios, sin IA generativa de cara a la paciente.

---

## 12. Plan de construcción en Lovable (iterar en este orden)

1. **Fase 1**: Sistema de diseño (tokens, BigChoice, PrimaryButton, CardQuestion, Insignia, Toast) + Configuración inicial del cuidador + Inicio + Check-in de 10 preguntas con persistencia y edición.
2. **Fase 2**: Episodios (con microcopy y saltos a roja) + Comidas + Peso con su gráfica.
3. **Fase 3**: Motor de banderas completo (R1–R5, A1–A14, prioridades y silenciamientos) + Directorio con SOS + pantalla roja.
4. **Fase 4**: Modo cuidador (PIN, panel con visualizaciones, registros, contactos, medicinas, checklist, ajustes) + recordatorios + Reporte PDF.
5. **Fase 5**: Mi semana + Cuestionario del mes + Red de apoyo con inquietudes + Comunidad.
6. **Fase 6**: Pulido de acceso (foco/teclado, reduced motion, alto contraste, revisión de todos los objetivos ≥64 px) y respaldo cifrado.

**Definición de hecho por fase**: checklist de la sección 2 en verde · las reglas clínicas con casos de prueba · revisión del copy contra la sección de tono · prueba en un teléfono real.

**Fase en línea (después, con Supabase)**: cuentas solo del cuidador, sincronización, enlaces familiares de solo lectura, y la Comunidad real (publicar, responder, "me sirvió" persistente, mensajes) — que exigirá **moderación de contenidos** y reglas de publicación (sin consejos de medicación) antes de abrirla.

---

## 13. Tono de voz (el de una nieta atenta)

Colombiano neutro, cálido, breve. "Usted" por defecto, conmutable a "tú", y siempre por su nombre. Máx. ~12 palabras por pregunta. Nunca "síntoma", "paciente", "adherencia" ni etiquetas clínicas en pantallas de ella ("La he notado triste estos días", jamás "depresión"). Nunca culpabilizar por días sin registrar. Los errores dicen qué pasó y qué hacer: "No se pudo guardar. Ya lo intento de nuevo; no se perdió nada." Guardados en pasado: "Listo ✓ Quedó guardado."

**Aviso permanente en Acerca de:** "Amanecer es una bitácora personal de apoyo. No es un dispositivo médico ni reemplaza la valoración de su equipo de salud." Cada regla clínica de este documento es orientativa y debe validarse con el equipo tratante antes del uso real.
