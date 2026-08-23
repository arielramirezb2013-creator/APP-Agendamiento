# AMANECER — Bitácora de cuidado para ELA
## Especificación de producto y desarrollo · para Claude Code y Lovable
**Versión 1.0 · 23 de agosto de 2026 · Documento fuente para generación de código**

---

## 0. Cómo usar este documento

- **En Lovable:** pega el "Prompt maestro" de la sección 15.1 como primer mensaje. Adjunta o pega este documento completo como contexto (Knowledge). Itera pantalla por pantalla siguiendo la sección 9.
- **En Claude Code:** guarda este archivo como `CLAUDE.md` (o referencia desde él) en la raíz del repositorio. Sigue el plan por fases de la sección 15.2. Cada módulo de la sección 6 tiene criterios de aceptación verificables.
- **Regla de oro para ambos:** ante cualquier duda de diseño, gana la sección 3 (Principios no negociables) sobre cualquier otra consideración estética o técnica.

---

## 1. Contexto y misión

**Usuaria principal (n=1):** una mujer adulta mayor con diagnóstico de esclerosis lateral amiotrófica (ELA), en Colombia, hispanohablante, con afinidad tecnológica baja. Usa la app en casa, probablemente en tableta o teléfono, a veces desde la cama. Su motricidad fina, su habla y su energía **van a cambiar con el tiempo**: la app debe seguir siéndole útil en cada etapa.

**Usuarios secundarios:** su hijo/a (cuidador principal y administrador), familiares autorizados por ella (observadores), y su equipo tratante (receptores de un reporte imprimible; no usan la app).

**Misión en una frase:** que cada mañana ella pueda contar cómo está en menos de 2 minutos, que la app sepa a quién llamar cuando algo no anda bien, y que su equipo médico reciba en cada control una foto fiel de sus últimas semanas.

**Lo que la app NO es:** no diagnostica, no dosifica, no reemplaza al equipo tratante, no es un comunicador CAA (para eso existen TD Talk, Háblalo, etc.), no es una red social. Ver sección 14.

**Nombre de trabajo:** *Amanecer* (por la pregunta central: "¿Cómo amaneciste hoy?"). Alternativas si la familia prefiere: *Contigo*, *Mi Bitácora*, o el nombre propio de la usuaria ("Con [Nombre]"). El nombre es configurable en un solo lugar del código (`APP_NAME`).

---

## 2. Base de evidencia: por qué cada módulo existe

Este producto no se diseñó por intuición. Cada módulo responde a evidencia publicada o a guía clínica formal. Los desarrolladores deben conservar esta trazabilidad en comentarios de código donde aplique.

### 2.1 Qué piden los pacientes y cuidadores (investigación de usuarios publicada)

| Hallazgo | Fuente | Implicación de diseño |
|---|---|---|
| App de autocuidado para ELA co-diseñada con grupos focales de pacientes, familias y profesionales; funciones validadas por usabilidad (SUS, n=18): **visualización de datos a la medida, registro de síntomas, texto-a-voz, información personalizada por etapa** | Amyotrophic Lateral Sclerosis & FTD, 2025 (doi 10.1080/21678421.2025.2507169) | Los 4 pilares del MVP replican exactamente estas funciones validadas |
| Encuesta ALS Focus 2020 (ALS Association): lo que más impacta la vida diaria es la **limitación de movilidad y las actividades cotidianas**; 72% requiere asistencia en AVD; 63% de cuidadores dedican >30 h/semana | ALS Association, ALS Focus | La app minimiza carga: 1 pregunta por pantalla, el cuidador puede completar por ella, nada es obligatorio |
| "My ALS Journey" (ALS Association): los pacientes quieren guía individualizada pero **"no todo el mundo quiere toda la información de una vez"** | ALS Association | Divulgación progresiva: la app nunca muestra información de etapas que la usuaria no ha alcanzado ni pronósticos |
| EverythingALS (2024): la comunidad valora registrar **dieta y actividad**, muestras de habla, y conexión con pares | ALS News Today, sep-2024 | Módulos de comida y notas de voz; enlaces a comunidad (ACELA) sin construir red social propia |
| Ensayo aleatorizado de consejería nutricional: el brazo con **app mHealth aumentó la ingesta** y su progresión ALSFRS-R fue aproximadamente la mitad de rápida vs. cuidado estándar a 6 meses | PMC6540456; revisión PMC8776511 | El módulo de comidas + peso no es accesorio: es de los de mayor valor clínico potencial |
| Adultos mayores con deterioro cognitivo y sus cuidadores: **baja afinidad tecnológica (79-83%)** e interés bajo aun tras demostración | JMIR pilot, PMC7428905 | Curva de aprendizaje cero: sin registro, sin configuración por parte de la paciente, el cuidador configura todo |
| El ALSFRS-R **autoadministrado es confiable y válido** (separación de personas: bulbar 0,81; motor 0,90; respiratorio 0,69); se recomienda **puntuar por subescalas** y tratar la medida como perfil | Mehdipour et al., Physical Therapy 103(11), 2023 | La escala mensual se reporta por subescalas (bulbar/motora/respiratoria), nunca solo total |
| Versión digital ALSFRS-RSE: adherencia 86,1%, ICC 0,925–0,961 vs. presencial, con **sesgo constante de +1,3 puntos** al alza; "los datos no son intercambiables" con los del clínico | ALS & FTD, 2024 (doi 10.1080/21678421.2024.2322549) | El reporte PDF marca los puntajes como "autorreporte" y advierte el sesgo +1,3; jamás se mezclan series |
| La MND Association mantiene un listado curado de apps de salud, citas, nutrición y comunicación — **no existe una herramienta integrada en español** | als-mnd.org / mndassociation.org | Brecha de mercado confirmada; TENOS (la app más parecida) sigue "Coming Soon" a ago-2026 |

### 2.2 Anclas clínicas (del informe de evidencia ELA-Colombia 2026, verificado)

Estas reglas provienen de guías formales (NICE NG42, EAN 2024, MND Association) y del estándar clínico colombiano del Hospital Universitario Nacional (ECBE ELA, IN-EC-21, 2024). La app las usa **solo para orientar a consultar**, nunca para diagnosticar:

1. **El dolor no siempre se menciona espontáneamente** → el check-in lo pregunta activamente (MND Association).
2. **Cefalea matutina, ortopnea, sueño no reparador, somnolencia diurna** son señales de compromiso respiratorio (Tabla 1, NICE NG42) → preguntas específicas del check-in y disparadores de bandera ámbar.
3. **~50% de personas con ELA son hipermetabólicas** (gasto ~10% mayor); evitar pérdida de peso es prioridad → peso semanal con tendencia visible.
4. **Saliva: volumen y viscosidad son cosas distintas** y el tratamiento difiere → el registro las separa (fina/abundante vs. espesa).
5. **Atragantamiento: la muerte por atragantamiento es "excepcional"** → microcopy tranquilizador tras registrar un episodio, con instrucción de consultar si se repite.
6. **Laringoespasmo "suele resolverse con el tiempo"** → microcopy que calma durante/después del episodio + bandera si recurre.
7. Cadencia de controles multidisciplinarios: **cada 2-3 meses (NICE) / 3-6 meses (EAN)** → el reporte PDF se diseña para ese ciclo.
8. Riluzol requiere **monitoreo hepático: mensual ×3 meses, luego trimestral el primer año, luego anual** → plantilla de recordatorio de laboratorios precargada (editable; el cuidador confirma con el médico).
9. Urgencia inmediata (informe §20): dificultad respiratoria intensa o súbita, coloración azulada, imposibilidad persistente para respirar o hablar, atragantamiento con obstrucción que no cede, somnolencia o confusión marcada → **pantalla roja: llamar 123 / contacto de emergencia**.
10. Colombia: línea de emergencias **123**; ACELA (asociación de pacientes) voluntariado **300 203 7108**; Clínica de Excelencia en ELA del HUN e Instituto Roosevelt como nodos de referencia en Bogotá → precargados como sugerencias editables en el directorio.

---

## 3. Principios de diseño NO negociables

Estos principios prevalecen sobre cualquier decisión estética, técnica o de alcance. Si un cambio los viola, el cambio se rechaza.

### 3.1 Accesibilidad progresiva: la app acompaña la enfermedad

La ELA degrada progresivamente motricidad fina, habla y energía. La app se diseña desde el día 1 para las 5 etapas de acceso, sin rediseño posterior:

| Etapa | Capacidad de la usuaria | Qué garantiza la app |
|---|---|---|
| E1 | Toque preciso, habla clara | Todo funciona con toques simples; dictado por voz disponible |
| E2 | Destreza reducida, fatiga | Objetivos táctiles ≥64 px (primarios 72 px), cero precisión requerida, sesiones <2 min |
| E3 | Habla en deterioro | Todo lo dictable también es tocable; texto-a-voz lee las pantallas si se activa |
| E4 | Manos poco funcionales | Modo cuidador completa el registro "en nombre de"; navegación por pulsador (switch access del SO) funciona porque solo hay botones grandes y foco visible |
| E5 | Solo mirada | **Compatible con Eye Tracking de iPadOS por construcción**: el rastreo ocular del sistema convierte permanencia en toque; como la app solo usa toques sobre objetivos grandes, sigue siendo 100% operable |

**Reglas duras derivadas (checklist de aceptación de CADA pantalla):**
- ✅ Un objetivo primario por pantalla; máximo 4 opciones visibles simultáneas.
- ✅ Objetivo táctil mínimo 64×64 px; botón primario 72 px de alto, ancho completo, anclado abajo.
- ✅ **Prohibido:** deslizar (swipe) como único camino, arrastrar, mantener presionado, doble toque, pellizcar, temporizadores que expiran, carruseles automáticos.
- ✅ Tipografía base ≥20 px (cuerpo), ≥28 px (preguntas), escalable a 200% sin romper el layout.
- ✅ Contraste AAA (≥7:1) en texto normal; nunca comunicar estado solo con color (siempre ícono + palabra).
- ✅ Foco de teclado/pulsador visible (anillo de 3 px) en todo elemento interactivo.
- ✅ `prefers-reduced-motion` respetado; animaciones solo funcionales (<200 ms).
- ✅ Toda acción confirma con texto en pasado ("Guardado ✓") y ofrece deshacer durante 6 s.
- ✅ Funciona sin conexión; nada se pierde jamás por falta de red.

### 3.2 Curva de aprendizaje cero para la paciente

- La paciente **nunca** crea cuenta, nunca escribe contraseña, nunca configura nada. Abre la app y está en "¿Cómo amaneciste?".
- Toda la configuración (contactos, medicinas, familiares, recordatorios) vive en **Modo Cuidador**, protegido por PIN de 4 dígitos (botón visible "Soy el cuidador", jamás un gesto oculto).
- El lenguaje es de casa, no de hospital: "¿Te costó pasar la comida?" y no "disfagia". El término clínico aparece solo en el reporte PDF para el médico.
- Tratamiento configurable: "usted" (predeterminado) o "tú", y siempre por su nombre: "Buenos días, [Nombre]".

### 3.3 La app orienta, nunca diagnostica

- Ninguna pantalla emite diagnósticos, pronósticos ni porcentajes de supervivencia. Jamás.
- Las banderas (sección 7) tienen exactamente tres salidas: **verde** (registrado, seguir el día), **ámbar** ("vale la pena contárselo a [especialista mapeado] — ¿la llamamos?"), **roja** ("esto es urgente — llamar ya"), siempre con el botón de llamada a un toque.
- Ningún consejo de iniciar, cambiar o suspender medicamentos, oxígeno, ejercicio o dietas. Los textos informativos solo reproducen medidas de bajo riesgo ya avaladas por guías (hidratación, postura, higiene oral) y siempre cierran con "confírmelo con su equipo".

### 3.4 Ella manda sobre sus datos

- Los datos viven primero en el dispositivo. Compartir con cada familiar es una decisión explícita, granular y revocable, tomada con ella (sección 12).
- Sin publicidad, sin analítica de terceros, sin venta de datos. Punto.

---

## 4. Usuarios y modos

| Modo | Quién | Acceso | Puede |
|---|---|---|---|
| **Paciente** (predeterminado) | La mamá | Abrir la app, sin autenticación local | Check-in, registrar episodios y comidas, ver "¿A quién llamo?", oír recordatorios, grabar notas de voz |
| **Cuidador** | Hijo/a administrador | Botón "Soy el cuidador" + PIN 4 dígitos | Todo lo anterior "en nombre de" + configurar contactos, medicinas, recordatorios, familiares, exportar reportes, editar/corregir registros |
| **Familiar observador** | Autorizados por ella | Enlace mágico por WhatsApp/correo (solo lectura, revocable) | Ver el tablero resumido según el alcance concedido (p. ej. solo ánimo y banderas, sin detalle médico) |
| **Clínico** | Equipo tratante | No usa la app | Recibe el **Reporte de Control** en PDF impreso o compartido |

---

## 5. Mapa funcional por versiones

**MVP (construir primero, 100% offline, sin backend):**
1. Check-in diario conversacional
2. Registro de episodios
3. Comidas + peso semanal
4. Directorio "¿A quién llamo?" con semáforo
5. Motor de banderas (reglas locales)
6. Recordatorios locales (medicinas, laboratorios, citas)
7. Modo cuidador con PIN
8. Reporte de Control en PDF
9. Notas de voz y dictado

**V1.1 (requiere backend Supabase):**
10. Escala ALSFRS-R mensual autoadministrada (subescalas)
11. Gráficas de tendencia (peso, ánimo, subescalas)
12. Compartir con familiares (enlaces de solo lectura) + aviso a familiares en bandera roja/ámbar
13. Respaldo cifrado en la nube

**V2 (después de validar uso real):**
14. Texto-a-voz integral de pantallas (Web Speech synthesis es-CO)
15. Exportación estructurada (CSV/FHIR-like JSON) para el equipo del HUN
16. Sección "Mi plan" ampliada (kit por si acaso, voluntad anticipada, hospital preferido)
17. Modo pulsador refinado (orden de foco optimizado para barrido)

---

## 6. Módulos en detalle

> Formato: historia de usuario → comportamiento → criterios de aceptación (CA). Los textos entre comillas son **copy literal** en es-CO (sección 13 amplía el tono).

### 6.1 Check-in diario — "¿Cómo amaneciste?"

**Historia:** Como paciente, quiero contar cómo estoy hoy respondiendo preguntas de una en una, con botones grandes, para que quede guardado sin esfuerzo.

**Comportamiento:**
- Al abrir la app entre 5:00 y 14:00 sin check-in del día: tarjeta grande "Buenos días, [Nombre] 🌤️ ¿Cómo amaneció hoy?" con botón único "Empezar".
- Flujo de tarjetas, **una pregunta por pantalla**, respuesta con fichas grandes (chips de 64 px). Orden y contenido:
  1. **Ánimo:** 5 caras grandes (😞 😕 😐 🙂 😄) con etiqueta de palabra debajo de cada una ("Muy triste… Muy bien").
  2. **Dolor** (siempre se pregunta, ver §2.2-1): "¿Tiene algún dolor hoy?" → No / Un poco / Bastante / Mucho. Si ≠No → "¿Dónde?" (fichas: cabeza, cuello, hombros, brazos, espalda, piernas, otro).
  3. **Respiración:** "¿Cómo siente la respiración?" → Bien / Me falta un poco el aire / Me falta mucho el aire. Si es la 3.ª → salta a evaluación de bandera (sección 7) antes de continuar.
  4. **Sueño:** "¿Cómo durmió anoche?" → Bien / Regular / Mal. Si Regular/Mal → subpregunta múltiple: "¿Qué pasó?" (Me desperté con dolor de cabeza · Me faltaba el aire acostada · Pesadillas o sueño intranquilo · Otra cosa). *[Cefalea matutina y ortopnea = señales NICE → alimentan bandera ámbar]*
  5. **Tragar:** "¿Le costó pasar la comida o la bebida hoy?" → No / Un poco / Sí, bastante.
  6. **Saliva:** "¿La saliva le molestó hoy?" → No / Mucha y líquida / Espesa y pegajosa. *[distinción clínica clave §2.2-4]*
  7. **Fatiga:** "¿Cuánta energía tuvo hoy?" → Buena / Poca / Casi nada.
  8. **Ánimo abierto (opcional):** "¿Quiere contar algo más?" → botones: 🎙️ Grabar nota de voz · ⌨️ Escribir · "No, gracias".
- Cierre: "Listo, [Nombre] ✓ Gracias por contarme. Que tenga un lindo día." + si alguna respuesta disparó ámbar, la tarjeta de bandera aparece aquí (sección 7), nunca interrumpiendo a mitad de flujo salvo bandera roja.
- Duración objetivo: **≤90 segundos**. Todas las preguntas son omitibles con "Pasar".
- Un check-in por día editable; el cuidador puede completarlo o corregirlo "en nombre de".

**CA:**
- [ ] 8 preguntas máximo; cada una responde con 1 toque; "Pasar" siempre visible.
- [ ] Sin check-in del día, la app SIEMPRE abre en esta tarjeta (paciente) — nunca en un menú.
- [ ] Bandera roja interrumpe de inmediato; ámbar espera al cierre.
- [ ] Registro persistido offline con fecha/hora e indicador de quién lo llenó (paciente/cuidador).

### 6.2 Episodios — "Pasó algo"

**Historia:** Como paciente o cuidador, quiero registrar en el momento (o después) un evento fuera de lo normal, para que el equipo médico lo vea con fecha, hora y qué se hizo.

**Tipos precargados (fichas con ícono + palabra):** Caída · Atragantamiento · Falta de aire fuerte · Espasmo en la garganta (laringoespasmo) · Mucho llanto o risa sin control · Crisis de tristeza o angustia · Fiebre o gripa · Otro.

**Flujo (máx. 4 pantallas):** ¿Qué pasó? → ¿Cuándo? (Ahora / Hoy más temprano / Otro día + selector simple) → ¿Qué tan fuerte fue? (Leve / Moderado / Fuerte) → ¿Qué hicieron? (texto/voz opcional) → Guardar.

**Microcopy de contención (aparece tras guardar, según tipo):**
- Atragantamiento: "Qué susto. Respire tranquila: estos episodios casi nunca son peligrosos, pero si se repiten vale la pena contárselo a [fonoaudióloga]. ¿La llamamos?" *(base: MND Association, §2.2-5)*
- Laringoespasmo: "Estos espasmos asustan mucho pero suelen pasar solos en poco tiempo. Si no cede o no puede respirar, es una urgencia." + botón rojo visible.
- Falta de aire fuerte "Ahora" → **salta directo a bandera roja** (sección 7).

**Reglas de recurrencia (motor local):** 2.º atragantamiento en 7 días → ámbar hacia fonoaudiología. 2.ª caída en 30 días → ámbar hacia fisioterapia. 3 días seguidos de ánimo en las 2 caras más bajas → ámbar suave hacia psicología: "La he notado triste estos días. ¿Quiere que llamemos a [contacto de apoyo]? También puede contárselo a su familia." *(nunca etiqueta clínica, nunca 'depresión')*.

**CA:**
- [ ] Registrar un episodio toma ≤4 toques + opcional voz.
- [ ] Cada tipo tiene su microcopy definido en un diccionario editable (`copy/episodes.ts`).
- [ ] Reglas de recurrencia implementadas como funciones puras testeables (`rules/recurrence.ts`).

### 6.3 Comidas y peso — "¿Qué comió hoy?"

**Historia:** Como paciente, quiero anotar fácil qué comí y cómo me fue tragando, y pesarme una vez por semana, porque mantener el peso es de lo más importante en mi enfermedad. *(justificación: hipermetabolismo ~50% + ensayo mHealth nutricional, §2.1/§2.2-3)*

**Comportamiento:**
- Registro por momento del día (Desayuno · Almuerzo · Comida · Entre comidas), cada uno en ≤3 toques:
  1. "¿Qué comió?" → voz/foto/texto corto (la foto es opcional y local).
  2. "¿Cuánto se comió?" → Todo / La mitad / Poquito.
  3. "¿Cómo le fue tragando?" → Bien / Con esfuerzo / Se atoró (esto último crea automáticamente un episodio de atragantamiento leve, sin repetir preguntas).
- Textura del día (config. del cuidador según indicación de fonoaudiología): Normal / Blanda / Molida / Líquidos espesados — solo etiqueta el registro; **la app jamás recomienda texturas**.
- **Peso:** recordatorio semanal (día/hora que elija el cuidador). Entrada numérica GIGANTE con teclado propio de botones de 72 px. Tendencia 8 semanas como línea simple con solo dos anotaciones posibles: estable ✓ / "ha bajado — vale la pena comentárselo a [nutricionista]" (ámbar si baja ≥5% en 8 semanas o ≥2 kg en 4; umbral editable por el cuidador con su equipo).

**CA:**
- [ ] Comida completa registrable en ≤3 toques (+voz opcional).
- [ ] "Se atoró" crea episodio vinculado sin duplicar captura.
- [ ] Regla de peso implementada en `rules/weight.ts` con umbrales en config.

### 6.4 Escala mensual ALSFRS-R autoadministrada *(V1.1)*

**Historia:** Como paciente, quiero responder una vez al mes el cuestionario que usan mis médicos, en lenguaje sencillo, para que en la consulta vean mi evolución real.

**Comportamiento:**
- 12 preguntas oficiales del ALSFRS-R traducidas a lenguaje cotidiano (mapa 1:1 documentado en `content/alsfrs.ts` con el texto clínico en comentario), una por pantalla, 5 opciones grandes (4→0).
- Se puede pausar y retomar; recordatorio mensual suave ("¿Hacemos el cuestionario del mes? Son 12 preguntas cortas").
- **Resultados SIEMPRE por subescalas** — Bulbar (/12), Motora fina+gruesa (/24), Respiratoria (/12) — presentadas como perfil, no como un único número protagonista *(Mehdipour 2023)*.
- Sello permanente en pantalla y PDF: "Autorreporte. Los estudios muestran que el autorreporte tiende a puntuar ~1,3 puntos por encima de la evaluación del profesional; no compare estas cifras con las de la consulta, compare la tendencia de esta misma serie." *(ALS&FTD 2024)*
- La app **no** interpreta caídas de puntaje con mensajes alarmantes; solo las incluye en el Reporte de Control.

**CA:**
- [ ] 12 ítems, texto validado contra la versión oficial en español (el cuidador puede pedir a su neurólogo la verificación final del wording).
- [ ] Persistencia por subescala + total; gráfico de perfil de 3 líneas.
- [ ] Sello de autorreporte presente en toda visualización y exportación.

### 6.5 Directorio — "¿A quién llamo?"

**Historia:** Como paciente, cuando algo me preocupa quiero ver de inmediato a quién llamar según el tema, con la cara/nombre grande y un solo botón de llamada.

**Comportamiento:**
- Cuadrícula de máximo 8 tarjetas grandes por **tema**, no por cargo: Respiración → [Neumólogo/a X] · Tragar y comer → [Fonoaudióloga Y] / [Nutricionista Z] · Moverme → [Fisioterapeuta] · Ánimo → [Psicóloga] / [persona de confianza] · Mis medicinas → [Neuróloga tratante] · Trámites de la EPS → [gestor/familiar] · **EMERGENCIA → 123 + [contacto de emergencia]** (tarjeta roja, siempre primera).
- Cada tarjeta: foto opcional, nombre, "¿Para qué la llamo?" en una línea, botón **Llamar** (tel:) y botón WhatsApp si tiene.
- Precargas sugeridas editables (Colombia): 123 Emergencias · ACELA voluntariado 300 203 7108 · espacio para Clínica de ELA HUN / Instituto Roosevelt.
- El motor de banderas (sección 7) enlaza directo a la tarjeta correcta: la sugerencia "¿La llamamos?" abre esta tarjeta, no un menú.

**CA:**
- [ ] Llamar a cualquier contacto: ≤2 toques desde el inicio.
- [ ] La tarjeta de emergencia es visualmente inconfundible (roja, primera, ícono + palabra).
- [ ] Directorio 100% editable solo en Modo Cuidador.

### 6.6 Recordatorios

- **Medicinas:** nombre, foto opcional del empaque, horarios; notificación local con la voz configurada ("[Nombre], es hora de su pastilla de las 8"). Confirmación de 1 toque "Ya la tomé ✓" / "Más tarde". La app **nunca** muestra ni sugiere dosis distintas a las escritas por el cuidador.
- **Laboratorios de riluzol:** plantilla precargada (mensual ×3 → trimestral ×1 año → anual) que el cuidador activa y ajusta con el médico *(MND Association, §2.2-8)*. La plantilla incluye el disclaimer "esquema orientativo de guía; confirme fechas con su médico tratante".
- **Citas:** fecha, lugar, con quién, "qué llevar" (autocompleta: "el Reporte de Control impreso").
- **Ejercicios/estiramientos prescritos:** solo si el cuidador los carga tal como los indicó fisioterapia; la app no propone ejercicios propios.

**CA:** notificaciones locales funcionan sin conexión; snooze simple; historial de tomas visible en Modo Cuidador y en el PDF.

### 6.7 Compartir con la familia *(V1.1)*

- Ella decide, con el cuidador, **quién ve qué**: por familiar se marca alcance (Ánimo y mensajes · + Comidas y peso · + Todo el registro clínico) y si recibe **avisos** (solo bandera roja · roja+ámbar · ninguno).
- El familiar accede por enlace mágico de solo lectura (sin app que instalar); revocable con un toque.
- Tablero del familiar: última semana en 4 mosaicos (ánimo, comió bien, peso, banderas) + botón "Mandarle un mensajito" (texto/audio que a ella le aparece como tarjeta cariñosa al abrir la app).
- Aviso de bandera roja a familiares: "Se registró una alerta urgente para [Nombre] a las HH:MM. [Cuidador] está informado." — sin detalle clínico en la notificación.

### 6.8 Reporte de Control (PDF)

**Historia:** Como cuidador, antes de cada cita quiero imprimir/compartir un resumen de 2 páginas que el equipo del hospital pueda leer en 90 segundos.

**Contenido (2 páginas máximo, diseño sobrio, español, términos clínicos aquí sí):**
- Encabezado: nombre, fecha del periodo, "Registro de autorreporte generado por la app Amanecer — no es un documento clínico".
- Página 1: tendencia de peso (8-12 sem) · perfil ALSFRS-R por subescalas con sello de autorreporte · resumen de ánimo (mini-mapa de calor) · adherencia a medicación (%).
- Página 2: tabla de episodios (fecha, tipo, severidad, acción) · señales respiratorias reportadas (n.º de días con ortopnea/cefalea matutina/sueño no reparador) · dificultades de deglución (n.º de comidas "con esfuerzo"/"se atoró") · saliva (días fina vs. espesa) · notas destacadas.
- Pie: "Elaborado para el control multidisciplinario. Frecuencia sugerida por guías: cada 2-3 meses (NICE NG42)."

**CA:** genera offline (jsPDF/react-pdf); botón único en Modo Cuidador "Preparar reporte para la cita"; vista previa antes de compartir.

### 6.9 Notas de voz y dictado

- Botón 🎙️ presente en check-in, episodios y comidas. Graba audio local (WebM/AAC) + transcripción con Web Speech API es-CO cuando haya conexión (editable).
- Valor doble y delicado: mientras el habla se conserva, estas notas son también **recuerdos con su voz**. La app no lo verbaliza clínicamente; simplemente todas las notas de voz se guardan íntegras y el cuidador puede exportarlas. (Si la familia desea banco de voz formal, la app enlaza en "Mi plan" a la orientación de fonoaudiología — no lo implementa.)

### 6.10 "Mi plan" *(V2, esqueleto en MVP)*

Tarjetas informativas configuradas por el cuidador con su equipo: dónde está el "kit por si acaso" y qué contiene · estado y ubicación del Documento de Voluntad Anticipada (en Colombia puede firmarse ante el médico tratante, Res. 2665/2018) · hospital preferido · instrucciones de la familia. Solo lectura para visitantes/cuidadores suplentes; la paciente lo ve si ella quiere (config.).

---

## 7. Motor de seguridad clínica (banderas)

Implementar como **funciones puras** en `rules/flags.ts`, con pruebas unitarias por regla. Toda regla tiene: `id`, `fuente` (guía de origen), `condición`, `nivel`, `contactoTema`, `copy`.

### 7.1 Niveles y comportamiento

| Nivel | UI | Comportamiento |
|---|---|---|
| 🟢 Verde | Ninguna interrupción | Registro normal |
| 🟡 Ámbar | Tarjeta al cierre del flujo: "Esto vale la pena contárselo a [contacto del tema]. ¿La llamamos?" [Llamar] [Recordármelo mañana] [Ya lo hablamos] | Nunca alarmista; registra la decisión; recuerda máx. 1 vez |
| 🔴 Roja | Pantalla completa inmediata, fondo rojo, texto ≥32 px: "Esto es una URGENCIA. Vamos a pedir ayuda ya." [📞 Llamar 123] [📞 Llamar a (contacto emergencia)] | Interrumpe todo; llamada a 1 toque; notifica a familiares con alcance de alertas (V1.1); queda registrada |

### 7.2 Reglas ROJAS (informe §20 / NICE NG42 / MND Assoc.)

| id | Disparador |
|---|---|
| R1 | Check-in respiración = "Me falta mucho el aire" + confirmación "¿Le está pasando en este momento?" = Sí |
| R2 | Episodio "Falta de aire fuerte" con cuándo = Ahora |
| R3 | Episodio "Atragantamiento" + "¿Ya pasó o sigue atorada?" = Sigue |
| R4 | Botón SOS del directorio (siempre disponible) |
| R5 | Cuidador reporta: labios/cara morados · confusión o somnolencia marcada · no puede hablar ni respirar (checklist del modo cuidador) |

> La pantalla roja NUNCA pide más datos: primero la llamada, el registro se completa después.

### 7.3 Reglas ÁMBAR principales (informe §17.2 / NICE Tabla 1 / EAN 2024)

| id | Disparador (ventana) | Tema/contacto | Fuente |
|---|---|---|---|
| A1 | Cefalea matutina ≥2 días en 7 | Respiración | NICE Tabla 1 |
| A2 | Ortopnea ("me faltaba el aire acostada") ≥1 vez | Respiración | NICE |
| A3 | Sueño "Mal" ≥3 días en 7, o somnolencia diurna reportada | Respiración | NICE |
| A4 | Tos que no saca la flema / "tos débil" reportada en nota u opción | Respiración (fisioterapia respiratoria) | MND Assoc. (PCF) |
| A5 | 2.º atragantamiento en 7 días, o "con esfuerzo" en ≥50% de comidas de 3 días | Tragar y comer | EAN |
| A6 | Peso: −5% en 8 semanas o −2 kg en 4 (editable) | Nutrición | EAN/MND |
| A7 | Saliva espesa ≥3 días en 7 (ruta distinta a saliva fina) | Tragar y comer | MND Assoc. |
| A8 | Dolor "Bastante/Mucho" ≥3 días en 7, o dolor nuevo de aparición | Según localización → Fisioterapia/Médico | EAN ("evaluar activamente el dolor") |
| A9 | 2.ª caída en 30 días, o tropiezos reportados | Moverme | NICE |
| A10 | Ánimo en las 2 caras más bajas ≥3 días seguidos, o episodio "Crisis de tristeza" | Ánimo (psicología/confianza) | EAN |
| A11 | Risa/llanto sin control recurrente (≥2 episodios/14 días) | Médico tratante | MND Assoc. (afecto pseudobulbar) |
| A12 | Fiebre/gripa + cualquier señal respiratoria | Respiración — "en infecciones conviene consultar temprano" | MND Assoc. (antibióticos precoces) |

**Copy patrón ámbar:** cercano, sin tecnicismos, sin miedo. Ej. A1: "Ha amanecido con dolor de cabeza varios días. A veces eso tiene que ver con cómo se respira de noche, y su neumólogo/a sabe qué revisar. ¿Le avisamos a [Nombre del contacto]?"

### 7.4 Lo que el motor JAMÁS hace
Diagnosticar · mostrar probabilidades o pronósticos · sugerir medicamentos/dosis/oxígeno · recomendar ejercicios o dietas no cargadas por el equipo · generar más de 1 tarjeta ámbar por sesión (prioriza la de mayor peso; el resto va silenciosa al reporte).

---

## 8. Modelo de datos

TypeScript primero (fuente de verdad en `types/models.ts`); Supabase replica en V1.1.

```ts
type Rol = 'paciente' | 'cuidador';
type Llenado = { por: Rol; fecha: string /* ISO */ };

interface Perfil {
  id: string; nombre: string; tratamiento: 'usted' | 'tu';
  fechaNacimiento?: string; notasEtapa?: string; // libre, escrita por cuidador
  appName: string; // "Amanecer" por defecto
}

interface Contacto {
  id: string; nombre: string; foto?: string; telefono: string; whatsapp?: string;
  temas: Array< 'emergencia'|'respiracion'|'tragar'|'nutricion'|'moverme'|'animo'|'medicinas'|'tramites'|'otro' >;
  paraQue: string; esEmergencia: boolean; orden: number;
}

interface CheckinDiario {
  id: string; fecha: string; // yyyy-mm-dd único
  animo?: 1|2|3|4|5;
  dolor?: { nivel: 0|1|2|3; zonas?: string[] };
  respiracion?: 'bien'|'algo'|'mucho';
  sueno?: { calidad: 'bien'|'regular'|'mal';
            senales?: Array<'cefalea_matutina'|'ortopnea'|'pesadillas'|'otra'> };
  tragar?: 'no'|'algo'|'bastante';
  saliva?: 'no'|'fina_abundante'|'espesa';
  fatiga?: 'buena'|'poca'|'casi_nada';
  nota?: { texto?: string; audioRef?: string };
  llenado: Llenado; banderas: string[]; // ids de reglas disparadas
}

interface Episodio {
  id: string; tipo: 'caida'|'atragantamiento'|'disnea'|'laringoespasmo'
       |'pseudobulbar'|'crisis_emocional'|'infeccion'|'otro';
  cuando: string; severidad: 'leve'|'moderado'|'fuerte';
  queHicieron?: string; audioRef?: string; resueltoEnElMomento: boolean;
  llenado: Llenado; banderas: string[];
}

interface Comida {
  id: string; fecha: string; momento: 'desayuno'|'almuerzo'|'comida'|'entre';
  descripcion?: string; fotoRef?: string; audioRef?: string;
  cantidad: 'todo'|'mitad'|'poquito';
  tragando: 'bien'|'esfuerzo'|'atoro'; // 'atoro' => crea Episodio vinculado
  texturaDia?: 'normal'|'blanda'|'molida'|'liquidos_espesados';
  episodioVinculadoId?: string; llenado: Llenado;
}

interface Peso { id: string; fecha: string; kg: number; llenado: Llenado; }

interface AlsfrsR {                 // V1.1
  id: string; fecha: string; items: number[]; // 12 ítems, 4..0
  sub: { bulbar: number; motora: number; respiratoria: number }; total: number;
  autorreporte: true; llenado: Llenado;
}

interface Medicina {
  id: string; nombre: string; fotoRef?: string;
  horarios: string[]; instruccionesDelMedico: string; // texto literal del cuidador
  tomas: Array<{ fechaHora: string; estado: 'tomada'|'pospuesta'|'omitida' }>;
}

interface Recordatorio {
  id: string; tipo: 'medicina'|'laboratorio'|'cita'|'ejercicio'|'peso'|'alsfrs';
  titulo: string; detalle?: string; cron: string; activo: boolean;
  plantilla?: 'labs_riluzol'; // precarga editable
}

interface Familiar {               // V1.1
  id: string; nombre: string; canal: 'whatsapp'|'email'; destino: string;
  alcance: 'animo'|'animo_comidas_peso'|'todo';
  alertas: 'ninguna'|'roja'|'roja_ambar'; enlaceToken: string; revocado: boolean;
}

interface EventoBandera {
  id: string; reglaId: string; nivel: 'ambar'|'roja'; fechaHora: string;
  decision?: 'llamo'|'recordar'|'ya_hablado'|'descartada_por_cuidador';
}
```

**Supabase (V1.1):** tablas espejo `profiles, contacts, daily_checkins, episodes, meals, weights, alsfrs, medications, reminders, family_links, flag_events` con RLS: solo el `household_id` del cuidador accede; enlaces familiares vía tokens firmados de solo lectura con vista filtrada por `alcance`.

**Almacenamiento local (MVP):** IndexedDB vía **Dexie**; blobs de audio/foto en IndexedDB; export/backup manual a archivo `.json` cifrado (contraseña del cuidador) desde Modo Cuidador.

---

## 9. Pantallas

### 9.1 Mapa de navegación (paciente)
```
[Inicio]
 ├─ (auto) Check-in del día  → tarjetas 1..8 → cierre
 ├─ ▣ Pasó algo (Episodios)
 ├─ ▣ Mi comida
 ├─ ▣ ¿A quién llamo?   (incluye SOS)
 ├─ ▣ Mis recuerdos de hoy (recordatorios del día, solo lectura)
 └─ pie: "Soy el cuidador" (texto pequeño pero táctil 64px)
```
Navegación = botones. **No hay tab bar, no hay hamburguesa, no hay swipe.** Volver = botón "‹ Volver" arriba-izquierda de 64 px.

### 9.2 Wireframes clave (ASCII)

**Inicio (sin check-in hecho):**
```
┌──────────────────────────────────┐
│  ☀️  Buenos días, Rosa            │  ← Bitter 32px
│                                  │
│   ¿Cómo amaneció hoy?            │  ← 28px
│                                  │
│  ┌────────────────────────────┐  │
│  │       Contarle  ›          │  │  ← 72px, verde
│  └────────────────────────────┘  │
│                                  │
│  [ Pasó algo ] [ Mi comida ]     │  ← 64px c/u
│  [    ¿A quién llamo?  📞   ]    │
│                                  │
│  Hoy: 💊 8:00 pastilla ✓         │
│         Soy el cuidador          │
└──────────────────────────────────┘
```

**Tarjeta de pregunta (patrón único del check-in):**
```
┌──────────────────────────────────┐
│ ‹ Volver              Pregunta 2/8│
│                                  │
│   ¿Tiene algún dolor hoy?        │
│                                  │
│  ┌──────────┐  ┌──────────┐      │
│  │   No     │  │ Un poco  │      │   ← chips 64px
│  └──────────┘  └──────────┘      │
│  ┌──────────┐  ┌──────────┐      │
│  │ Bastante │  │  Mucho   │      │
│  └──────────┘  └──────────┘      │
│                                  │
│              Pasar               │
└──────────────────────────────────┘
```

**¿A quién llamo?:**
```
┌──────────────────────────────────┐
│ ‹ Volver   ¿A quién llamo?       │
│ ┌──────────────────────────────┐ │
│ │ 🚨 EMERGENCIA   Llamar 123 ▶ │ │  ← roja, primera
│ └──────────────────────────────┘ │
│ ┌─────────────┐ ┌─────────────┐  │
│ │😮‍💨 Respirar │ │🍲 Comer     │  │
│ │ Dr. Gómez   │ │ Fga. Ruiz   │  │
│ │ [Llamar]    │ │ [Llamar]    │  │
│ └─────────────┘ └─────────────┘  │
│ ┌─────────────┐ ┌─────────────┐  │
│ │💙 Ánimo     │ │💊 Medicinas │  │
│ └─────────────┘ └─────────────┘  │
└──────────────────────────────────┘
```

**Bandera roja:**
```
┌──────────────────────────────────┐
│██████████████████████████████████│
│                                  │
│   🚨  ESTO ES URGENTE            │
│   Vamos a pedir ayuda ya.        │
│                                  │
│  ┌────────────────────────────┐  │
│  │     📞  LLAMAR 123         │  │
│  └────────────────────────────┘  │
│  ┌────────────────────────────┐  │
│  │  📞  Llamar a Andrés (hijo)│  │
│  └────────────────────────────┘  │
│                                  │
│        Ya estoy bien             │
└──────────────────────────────────┘
```

### 9.3 Modo Cuidador (lista de pantallas)
Panel (resumen semana + banderas pendientes) · Registros (ver/editar/llenar en nombre de) · Contactos · Medicinas y recordatorios · Familiares y permisos (V1.1) · Reporte de Control (vista previa → PDF) · Ajustes (nombre, usted/tú, voz TTS, PIN, respaldo) · Mi plan.

---

## 10. Sistema de diseño

**Dirección:** calidez de casa colombiana + legibilidad clínica extrema. Nada de estética hospitalaria fría ni de plantilla genérica de dashboard.

### 10.1 Tokens (`design/tokens.ts` — únicos permitidos)
```ts
export const color = {
  fondo:      '#FAF7F2', // "Lino" — cálido, sin deslumbrar
  superficie: '#FFFFFF',
  tinta:      '#292019', // "Café tostado" — contraste 13.9:1 sobre Lino
  tintaSuave: '#5C5248',
  primario:   '#0B6B5D', // "Esmeralda profundo" — acciones (AAA sobre blanco)
  primarioHi: '#0E8271',
  ambar:      '#8A5A00', // texto/íconos de "consulta pronto" (AAA)
  ambarFondo: '#FFF3DC',
  rojo:       '#B3261E', // urgencia (con fondo #FDECEA o inverso pleno)
  exito:      '#1E6B3A',
  foco:       '#1A73E8', // anillo de foco 3px, solo foco
};
export const fuente = {
  ui:      '"Atkinson Hyperlegible", system-ui, sans-serif', // diseñada para baja visión
  titular: '"Bitter", Georgia, serif',                        // solo saludos/titulares
};
export const tam = { base:20, pregunta:28, saludo:32, boton:22, min:18 };
export const target = { chip:64, primario:72, radio:20 };
```
**Justificación de la elección tipográfica (mantener en el código):** Atkinson Hyperlegible fue creada por el Braille Institute para maximizar distinción de caracteres en baja visión — es la elección correcta para una adulta mayor, no una decoración.

### 10.2 Reglas de componentes
- Un solo componente `BigChoice` para TODAS las respuestas (chips 64 px, ícono opcional + palabra, estado seleccionado con ✓ y relleno primario claro).
- `PrimaryButton` (72 px, ancho completo, anclado abajo con safe-area).
- `CardQuestion` (patrón 9.2) es el layout de todo flujo.
- Semáforo SIEMPRE = ícono + palabra + color (nunca color solo).
- Modo daltónico ya cubierto por lo anterior; modo alto contraste extra: `tinta:#000`, `fondo:#FFF` con un toggle en Ajustes.
- Copy: sentence case, verbos activos, cero jerga, cero signos de exclamación múltiples; errores dicen qué pasó y qué hacer ("No se pudo guardar el audio. Vuelva a intentar o escriba la nota.").
- Motion: transición de tarjetas 160 ms fade/slide; `prefers-reduced-motion` ⇒ 0 ms.

### 10.3 Firma visual
La **tarjeta de saludo del día** (sol/luna dibujados en trazo simple + "Buenos días, [Nombre]" en Bitter) es el único elemento expresivo. Todo lo demás, sobrio y silencioso. Los "mensajitos" de familiares (V1.1) aparecen aquí como sobres que se abren con un toque.

---

## 11. Arquitectura técnica

| Decisión | Elección | Por qué |
|---|---|---|
| Plataforma | **PWA (React + Vite + TypeScript + Tailwind)** instalable | Un solo código; corre en la tableta/celular que ya tenga; compatible con Eye Tracking de iPadOS y Switch Access de Android por ser web estándar; Lovable y Claude Code la generan nativamente |
| Estado/BD local | Dexie (IndexedDB) + Zustand | Offline-first real; blobs de audio/foto locales |
| Backend (V1.1) | Supabase (Auth solo cuidador, Postgres+RLS, Storage) | Sincronización, enlaces familiares, respaldo |
| Notificaciones | Local Notifications API / service worker; fallback: recordatorios visibles al abrir | Sin depender de push de terceros en MVP |
| Voz | MediaRecorder (audio) + Web Speech API `es-CO` (dictado y TTS) | Nativo, sin costos |
| PDF | `@react-pdf/renderer` o jsPDF | Reporte offline |
| Llamadas | `tel:` / `https://wa.me/` | Un toque |
| Pruebas | Vitest para `rules/*` (100% de reglas cubiertas) + Playwright de flujos críticos (check-in, SOS) | Las reglas clínicas no se despliegan sin test |
| i18n | Textos centralizados en `content/es-CO.ts` (aunque solo haya un idioma: facilita revisión familiar del copy) | El cuidador puede leer y ajustar cada frase |
| Calidad accesible | eslint-plugin-jsx-a11y + axe en CI; presupuesto: 0 violaciones serias | Principios §3 son bloqueantes |

**Estructura sugerida:**
```
src/
  content/es-CO.ts  copy/episodes.ts  content/alsfrs.ts
  design/tokens.ts  components/{BigChoice,PrimaryButton,CardQuestion,...}
  rules/{flags.ts,recurrence.ts,weight.ts}  rules/__tests__/
  db/{dexie.ts,models.ts}  features/{checkin,episodios,comidas,contactos,recordatorios,cuidador,reporte}
  pwa/{sw.ts,notifications.ts}
```

---

## 12. Privacidad y consentimiento

1. Datos de salud sensibles: tratamiento conforme a Ley 1581/2012 (habeas data, Colombia). El consentimiento lo gestiona la familia; la app incluye una pantalla en Modo Cuidador "Quién puede ver qué" que documenta cada autorización con fecha.
2. MVP: **cero datos salen del dispositivo**. V1.1: cifrado en tránsito (TLS) y at-rest (Supabase); tokens familiares revocables; sin analítica de terceros, sin SDKs publicitarios.
3. Las notas de voz son especialmente íntimas: nunca se suben sin activar respaldo explícitamente; el reporte PDF no las incluye (solo transcripciones que el cuidador elija).
4. Botón "Exportar todo" y "Borrar todo" (doble confirmación con PIN) en Ajustes: los datos son de ella y de su familia, siempre.
5. Aviso permanente en Acerca de: "Amanecer es una bitácora personal de apoyo. No es un dispositivo médico ni reemplaza la valoración de su equipo de salud."

---

## 13. Copy y tono de voz

**Registro:** el de una nieta atenta, no el de una enfermera ni el de un banco. Colombiano neutro, cálido, breve. Predeterminado "usted"; conmutable a "tú".

| Situación | ❌ No | ✅ Sí |
|---|---|---|
| Saludo | "Bienvenida al panel de registro de síntomas" | "Buenos días, Rosa ☀️ ¿Cómo amaneció hoy?" |
| Disfagia | "Indique nivel de disfagia" | "¿Le costó pasar la comida o la bebida hoy?" |
| Guardado | "Datos enviados exitosamente" | "Listo ✓ Quedó guardado." |
| Ámbar respiratorio | "Alerta: posible hipoventilación nocturna" | "Ha amanecido con dolor de cabeza varios días. Su neumólogo sabe qué revisar. ¿Le avisamos al Dr. Gómez?" |
| Ánimo bajo sostenido | "Se detectaron síntomas depresivos" | "La he notado triste estos días. ¿Quiere que llamemos a Marcela, o le contamos a su familia?" |
| Error | "Error 500" | "No se pudo guardar. Ya lo intento de nuevo; no se perdió nada." |
| Vacío | "No hay registros" | "Todavía no hay comidas hoy. Cuando quiera, me cuenta." |

Reglas: máx. 12 palabras por pregunta · nunca "síntoma", "paciente", "adherencia" en pantallas de paciente · nunca culpabilizar por días sin registrar ("¡Qué bueno verla de nuevo!" y ya) · humor suave permitido, lástima prohibida.

---

## 14. Qué NO es esta app (guardas de alcance)

1. **No es CAA/comunicador.** Para hablar existen TD Talk, Háblalo, Proloquo4Text; la app puede enlazarlas en "Mi plan", no reimplementarlas.
2. **No es telemedicina** ni mensajería con médicos. El puente clínico es el Reporte de Control.
3. **No calcula dosis, no sugiere fármacos, dietas, oxígeno ni ejercicios** no cargados literalmente por el cuidador desde la indicación del equipo.
4. **No muestra pronósticos, supervivencias ni comparaciones con otros pacientes.**
5. **No es red social** ni foro. Comunidad = enlace a ACELA.
6. **No usa IA generativa en producción del MVP** (respuestas no deterministas no pasan las guardas de §3.3). Si en V2 se evalúa un asistente, será solo para redactar notas del cuidador, nunca de cara a la paciente ni para interpretar síntomas.

---

## 15. Instrucciones de construcción

### 15.1 PROMPT MAESTRO PARA LOVABLE (pegar tal cual como primer mensaje)

> Construye una PWA en React + TypeScript + Tailwind llamada **Amanecer**: bitácora diaria para una señora adulta mayor con ELA (esclerosis lateral amiotrófica) en Colombia, y para su hijo cuidador. Español colombiano, tratamiento "usted".
>
> **Principios bloqueantes (rechaza cualquier solución que los viole):** una sola acción principal por pantalla; máximo 4 opciones visibles; botones mínimo 64 px (primario 72 px, ancho completo, abajo); tipografía Atkinson Hyperlegible ≥20 px (preguntas 28 px); contraste AAA; prohibidos swipe, drag, long-press, doble toque y temporizadores; estado siempre con ícono + palabra, nunca solo color; offline-first con IndexedDB (Dexie); todo texto en un archivo `content/es-CO.ts`.
>
> **Paleta:** fondo #FAF7F2, tinta #292019, primario #0B6B5D, ámbar #8A5A00 sobre #FFF3DC, rojo urgencia #B3261E. Titulares de saludo en Bitter; todo lo demás Atkinson Hyperlegible. Estética cálida de hogar, no de hospital ni de dashboard.
>
> **Pantallas del MVP:**
> 1) **Inicio (paciente):** "Buenos días, [Nombre] ☀️ ¿Cómo amaneció hoy?" con botón "Contarle ›"; debajo: "Pasó algo", "Mi comida", "¿A quién llamo? 📞"; recordatorios del día en solo lectura; enlace inferior "Soy el cuidador".
> 2) **Check-in:** 8 tarjetas, una pregunta por pantalla con chips grandes: ánimo (5 caras con palabra), dolor (No/Un poco/Bastante/Mucho + zonas), respiración (Bien/Algo/Mucha falta de aire), sueño (Bien/Regular/Mal + subopciones: dolor de cabeza al despertar, falta de aire acostada, pesadillas), tragar, saliva (No/Mucha y líquida/Espesa), energía, nota final por voz o texto opcional. Todas con "Pasar". Cierre: "Listo, [Nombre] ✓".
> 3) **Episodios:** fichas Caída / Atragantamiento / Falta de aire fuerte / Espasmo en la garganta / Llanto o risa sin control / Crisis de tristeza / Fiebre o gripa / Otro → cuándo → qué tan fuerte → qué hicieron (voz/texto) → guardar, con mensajes de calma definidos por tipo.
> 4) **Mi comida:** por momento del día: qué comió (voz/foto/texto) → cuánto (Todo/Mitad/Poquito) → cómo le fue tragando (Bien/Con esfuerzo/Se atoró); peso semanal con teclado numérico gigante y tendencia simple.
> 5) **¿A quién llamo?:** tarjetas por tema (EMERGENCIA roja primera con 123, Respirar, Comer, Moverme, Ánimo, Medicinas, Trámites) con foto, nombre, "para qué", botón Llamar (tel:) y WhatsApp.
> 6) **Bandera roja:** pantalla completa roja "ESTO ES URGENTE. Vamos a pedir ayuda ya." con Llamar 123 y Llamar contacto de emergencia; se dispara si reporta mucha falta de aire "en este momento", atragantamiento que no cede, o botón SOS.
> 7) **Modo Cuidador (PIN 4 dígitos):** panel semanal, editar/llenar registros en nombre de ella, contactos, medicinas y recordatorios (incluye plantilla editable de laboratorios de riluzol: mensual ×3, luego trimestral, luego anual, con nota "confirme con su médico"), ajustes (nombre, usted/tú, PIN, exportar/borrar datos) y botón "Preparar reporte para la cita" que genera un PDF de 2 páginas (tendencia de peso, resumen de ánimo, episodios, señales respiratorias, comidas con dificultad, adherencia a medicinas) marcado como "autorreporte, no es documento clínico".
>
> **Motor de banderas** como funciones puras: ámbar (tarjeta amable al cierre: "Esto vale la pena contárselo a [contacto]. ¿La llamamos?") para: dolor de cabeza al despertar ≥2 días/7, falta de aire acostada, sueño malo ≥3/7, 2.º atragantamiento en 7 días, pérdida de peso ≥2 kg en 4 semanas, saliva espesa ≥3 días/7, dolor fuerte ≥3 días/7, 2.ª caída en 30 días, ánimo muy bajo ≥3 días seguidos. Nunca diagnostica, nunca alarma, máximo una tarjeta ámbar por sesión.
>
> Empieza por Inicio + Check-in completo con persistencia local y luego te pido el resto módulo a módulo.

### 15.2 PLAN PARA CLAUDE CODE

**Preparación:** crear repo `amanecer/`; copiar este documento como `CLAUDE.md`; añadir al final del CLAUDE.md: "Toda decisión de UI debe pasar la checklist §3.1. Toda regla clínica vive en rules/ con test. Todo texto visible vive en content/es-CO.ts."

**Fase 0 — Esqueleto (1 sesión):** Vite + React + TS + Tailwind + PWA plugin; tokens §10.1; componentes `BigChoice`, `PrimaryButton`, `CardQuestion`; Dexie con modelos §8; CI con vitest + axe.
**Fase 1 — Check-in (1-2 sesiones):** flujo 8 tarjetas + persistencia + edición cuidador + tests de flujo Playwright.
**Fase 2 — Episodios y comidas:** incluye vínculo atoro→episodio y microcopy por tipo.
**Fase 3 — Directorio + SOS + motor de banderas:** `rules/flags.ts` con las tablas §7.2/§7.3, 100% cubiertas por tests unitarios (fixture de escenarios).
**Fase 4 — Recordatorios + Modo Cuidador + PDF.**
**Fase 5 — Pulido de acceso:** auditoría axe 0 serias; prueba con teclado/pulsador (tab order); prueba real en iPad con Eye Tracking activado; `prefers-reduced-motion`.
**Fase 6 (V1.1) — Supabase:** auth cuidador, sync, ALSFRS-R (contenido `content/alsfrs.ts` con sello de autorreporte y sesgo +1,3), enlaces familiares con RLS.

**Definición de Hecho por fase:** checklist §3.1 en verde · tests de reglas en verde · revisión de copy contra §13 · demo grabada de 60 s.

---

## 16. Protocolo de prueba con la usuaria real (30 minutos, en casa)

Antes de agregar nada más, validar el MVP con ella. Guion:
1. **(0-2 min)** Entregarle la tableta con la app abierta. No explicar nada. Observar si entiende "Contarle ›".
2. **(2-8 min)** Que complete el check-in sola. Medir: tiempo total, preguntas donde duda, si usa "Pasar", si el tamaño de chips le acomoda (observar precisión del dedo).
3. **(8-12 min)** Tarea: "Imagínese que se atoró con la sopa al almuerzo. Regístrelo." (mide hallazgo del módulo Episodios y claridad del flujo).
4. **(12-15 min)** Tarea: "Quiere llamar a su fonoaudióloga." (mide directorio: ≤2 toques).
5. **(15-20 min)** Preguntarle con calma: ¿qué le gustó?, ¿qué le dio pereza?, ¿qué palabra no entendió?, ¿la letra está cómoda?, ¿le gustaría que le hablara en voz alta?
6. **(20-30 min)** Con el cuidador: cargar 3 contactos reales y 1 medicina; generar un PDF de prueba.
**Criterios de éxito:** check-in ≤2 min sin ayuda · 0 términos no entendidos · llamada en ≤2 toques · ella dice que lo usaría mañana. Cada fallo se convierte en issue antes de la fase siguiente.
Repetir una versión corta de esta prueba cada 2-3 meses: **la app debe re-validarse a medida que sus capacidades cambian** (¿necesita ya chips más grandes? ¿dictado? ¿modo cuidador más protagonista?).

---

## 17. Fuentes de esta especificación

**Investigación de usuarios y evidencia de apps:** app de autocuidado ELA co-diseñada y probada con pacientes (ALS&FTD 2025, doi 10.1080/21678421.2025.2507169) · encuesta ALS Focus / ALS Association (impacto en AVD; 72% requiere asistencia) · My ALS Journey, ALS Association (divulgación progresiva) · EverythingALS app (2024) · ensayo de consejería nutricional con mHealth (PMC6540456) y revisión de tecnologías emergentes en ELA (PMC8776511) · piloto de aceptabilidad de apps en adultos mayores con deterioro cognitivo (PMC7428905) · validación del ALSFRS-R autoadministrado (Mehdipour et al., Physical Therapy 2023; ALSFRS-RSE digital, ALS&FTD 2024) · listado de apps de la MND Association (als-mnd.org).

**Anclas clínicas:** NICE NG42 (Tabla 1 de señales respiratorias; cadencia de controles) · Guía EAN 2024 (evaluación activa de dolor, nutrición, planificación) · MND Association, guía para atención primaria (saliva volumen/viscosidad; atragantamiento "excepcional" como causa de muerte; laringoespasmo; monitoreo de riluzol; antibióticos precoces) · ECBE ELA del Hospital Universitario Nacional de Colombia (IN-EC-21, 2024) · Informe integral de evidencia ELA-Colombia 2026 (documento familiar, secciones 17 y 20: semáforo y urgencias) · verificaciones Colombia ago-2026: línea 123, ACELA 300 203 7108, Clínica de Excelencia en ELA (HUN), Instituto Roosevelt.

**Accesibilidad:** WCAG 2.2 AA/AAA · Atkinson Hyperlegible (Braille Institute) · compatibilidad con Eye Tracking de iPadOS y Switch Access de Android por construcción (solo toques sobre objetivos grandes).

---
*Documento preparado el 23 de agosto de 2026 para el desarrollo de una herramienta personal de cuidado. Cada regla clínica citada es orientativa y debe validarse con el equipo tratante de la usuaria antes del uso real.*

---

## Regla final para desarrollo

Toda decisión de UI debe pasar la checklist §3.1. Toda regla clínica vive en rules/ con test. Todo texto visible vive en content/es-CO.ts.
