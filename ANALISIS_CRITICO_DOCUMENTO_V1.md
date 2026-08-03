# Análisis crítico · Documento Técnico App Modulación Financiera Rehavid V1

**Documento analizado:** `Documento_Tecnico_App_Modulacion_Financiera_Rehavid_V1.docx`
**Extensión:** 9.891 palabras · 324 párrafos · 58 tablas · 13 secciones
**Versión declarada:** 1.0 · 3 de agosto de 2026
**Analizado el:** 3 de agosto de 2026

Todos los hallazgos de este informe son verificables contra el propio documento.
Se indica la sección o tabla donde comprobarlos.

---

## 1. Qué es el documento y qué tan bien está hecho

Es un documento técnico maestro que convierte una transcripción de curso en
especificación de producto: modelo conceptual, ruta formativa de 8 unidades,
manual de operación, 32 requisitos funcionales, 14 no funcionales, motor
financiero con fórmulas, modelo de datos de 16 entidades, marco jurídico
colombiano, 16 casos de prueba y matriz de trazabilidad.

**Está por encima del promedio de documentos de este tipo, y conviene decirlo
antes de señalar lo que falla.** Cinco decisiones concretas lo sostienen:

1. **Trazabilidad por origen.** Cada requisito se marca como transcripción
   `[T-xx]`, instrucción de Rehavid `[R-xx]` o validación externa. La sección 13
   cierra el círculo con una matriz tema → unidad → componente → requisito.
2. **Se niega a inventar referencias.** La Tabla 9 declara explícitamente que en
   el segmento no se identifican autores, libros ni universidades, y por eso no
   los atribuye. Es la decisión correcta y es rara.
3. **No fija el covenant.** §8.2 dice que el umbral se toma del contrato y que la
   app no debe asumir 1,0 ni ningún otro nivel. Evita el error más común en
   herramientas de este tipo.
4. **Separa cobertura de liquidez.** El principio "pagar una obligación no basta
   si la caja remanente vulnera el mínimo" (§3.1) está sostenido en toda la
   especificación, incluido el caso de prueba CP-010.
5. **Distingue resultado certificable de dominio posterior** (§5.4), y argumenta
   por qué no recalcular retroactivamente. Es una decisión de diseño pensada, no
   una omisión.

También resuelve, por su cuenta, la duda terminológica que quedó pendiente en el
pliego: **§1.1 establece que "modulación" puede conservarse como nombre comercial
y "modelación" es el término técnico que debe usar la documentación.** Queda
zanjado; la app seguirá ese criterio.

---

## 2. Vacíos con consecuencia

### 2.1 El denominador de la evaluación no está definido · **bloqueante**

§5.4 define:

> Resultado del intento = respuestas correctas en primera respuesta ÷ **preguntas
> válidas** × 100

"Preguntas válidas" nunca se define. Y §5.1 establece que dentro de la evaluación
certificable, ante un error, la app "presenta una pregunta equivalente distinta".

De ahí salen dos lecturas con resultados numéricos distintos:

| Lectura | Denominador | Efecto de fallar 3 de 20 |
|---|---|---|
| A · solo ítems base | 20 | 17/20 = 85 % → aprueba |
| B · base + repreguntas | 23 | 17/23 = 74 % → no aprueba |

En la lectura B cada error penaliza dos veces: resta del numerador y suma al
denominador. Con 4 errores sobre 20 el resultado cae a 66,7 % y **el 80 % se
vuelve inalcanzable mucho antes de lo que el documento parece suponer.**

No es una ambigüedad de redacción: cambia quién se certifica. Hay que decidirlo
antes de programar el motor de evaluación.

### 2.2 La evaluación no tiene tamaño · **bloqueante**

No se define en ninguna parte cuántas preguntas tiene la evaluación certificable,
ni el mínimo de ítems por unidad, ni el tamaño mínimo del banco.

Importa porque el umbral del 80 % es muy sensible al tamaño: con 10 preguntas
cada error vale 10 puntos y solo se admiten 2; con 40 preguntas cada error vale
2,5 puntos y se admiten 8. Es el mismo criterio nominal y una exigencia real
distinta.

Además, §5.2 exige repreguntar con un ítem equivalente del mismo objetivo. Eso
obliga a tener **como mínimo dos o tres ítems por objetivo de aprendizaje**, y el
documento no fija ese mínimo. La Tabla 16 aporta 8 preguntas arquetipo para 8
unidades: una por unidad. Sin equivalencias, la repregunta no se puede construir.

### 2.3 "Ruptura" no está definida · **bloqueante para RF-020**

§8.5 define:

> Probabilidad de ruptura = corridas válidas con al menos una ruptura ÷ corridas
> válidas totales × 100

Pero no dice qué es una ruptura. Los candidatos son incompatibles entre sí:

- ¿DSCR por debajo del covenant?
- ¿Caja final por debajo del mínimo?
- ¿Cualquiera de las dos?
- ¿Ambas simultáneamente?

Y "al menos una" tampoco precisa la dimensión: ¿al menos un periodo del
horizonte? ¿Al menos una restricción? El número reportado cambia según la
elección, y es el número que va a mirar quien decide.

### 2.4 Falta la ruta del administrador

§6 abre diciendo:

> El manual define cómo debe operar la aplicación desde **cuatro perspectivas**:
> participante, modelador, revisor y administrador.

El documento entrega tres: §6.2 participante, §6.3 modelador, §6.4 revisor.
**La ruta del administrador se anuncia y no aparece.** §6.5 pasa a mensajes de
error.

Y hay un desajuste adicional: la Tabla 25 define **cinco** roles, no cuatro,
porque añade Gestor de contenido y Auditor, y fusiona participante con modelador.
Tres números distintos —cuatro perspectivas, cinco roles, tres rutas— para lo
mismo.

### 2.5 No hay dimensionamiento del proyecto

El documento va a MVP con cinco bloques (Tabla 53) y **no estima esfuerzo, costo,
duración, tamaño ni composición del equipo.** Tampoco aparece en §12.4 como
decisión pendiente, así que no está reconocido como faltante.

Es el vacío más grande en términos de decisión de negocio: no se puede aprobar un
MVP que no está dimensionado.

### 2.6 Faltan `[R-01]` y `[R-02]`

El registro de fuentes (Tabla 57) numera las instrucciones de Rehavid desde
`[R-03]`. No existe `[R-01]` ni `[R-02]` en ninguna parte del documento.

O se perdieron dos requisitos de Rehavid en alguna versión previa, o la
numeración es arbitraria. En un documento cuyo valor principal es la
trazabilidad, un hueco en la numeración de la fuente merece explicación.

---

## 3. Riesgos y supuestos no verificados

### 3.1 La base probatoria es de 2 minutos y 10 segundos

Es el hallazgo central y el documento merece crédito por declararlo (Tabla 4),
aunque no cuantifique la desproporción. Los tres segmentos citados son:

| Fuente | Rango | Duración |
|---|---|---|
| `[T-01]` | 02:10:14 – 02:10:48 | 34 s |
| `[T-02]` | 02:11:06 – 02:11:36 | 30 s |
| `[T-03]` | 02:12:14 – 02:13:20 | 66 s |
| | **Total citado** | **130 s** |

**Dos minutos y diez segundos de transcripción sostienen 32 requisitos
funcionales, 14 no funcionales, 8 unidades formativas y 16 casos de prueba.**

El encabezado declara el rango 02:10:14–02:13:20, que dura 186 segundos: hay
**56 segundos dentro del rango que no están citados** en ninguna de las tres
entradas.

Esto no invalida el documento. La mayor parte del contenido es buena ingeniería
de requisitos. Pero conviene nombrar lo que realmente ocurre: **el documento no
deriva de la transcripción, se apoya en ella.** El peso lo lleva el criterio
técnico de quien redactó, más las fuentes institucionales. Presentarlo como
"fiel a las ideas identificables en la transcripción" (§Cierre) es cierto y a la
vez insuficiente como descripción de su origen.

Consecuencia práctica: §12.4 pide "transcripciones adicionales del curso, en caso
de existir". Debería ser una prioridad alta, no un pendiente más de una lista de
trece.

### 3.2 `[F-01]` no sostiene lo que se le pide

La fuente que respalda las tres definiciones financieras centrales —CFADS,
servicio de deuda y DSCR— es:

> `[F-01]` World Bank. *Modernization and restructuring of the road sector —
> Implementation Status & Results Report*. Banco Mundial, 2019.

Un *Implementation Status & Results Report* es un informe de seguimiento de un
proyecto vial concreto. No es literatura metodológica sobre estructuración de
deuda. Se cita 8 veces, y en §8.2 se usa para una afirmación normativa fuerte:

> El Banco Mundial define el indicador como CFADS sobre servicio de deuda…

Las definiciones en sí **son correctas y estándar en project finance**. El
problema no es el contenido, es el respaldo: un documento que exige a sus
usuarios registrar la fuente de cada supuesto (RN-FIN-05) debería sostener sus
propias definiciones en fuentes metodológicas, no en el informe de avance de un
proyecto de carreteras.

### 3.3 MVP-3 depende de una decisión pendiente

MVP-3 "Simulación asistida" (Tabla 53) es uno de los cinco bloques del producto
mínimo. Depende por completo de que el usuario tenga Risk Simulator instalado y
licenciado.

Pero §12.4 lista como pendiente de validación:

> Licenciamiento vigente y posibilidad de SDK/OEM.
> Formato real de exportación e importación de Risk Simulator y versión instalada.

**Un quinto del MVP depende de dos decisiones que el propio documento declara sin
resolver**, y esa dependencia no está marcada como bloqueante en ninguna parte.
Si la licencia no alcanza, MVP-3 no se puede construir y el alcance del mínimo
viable cambia.

### 3.4 Cuatro requisitos no funcionales no son verificables

De los 14 RNF, cuatro no tienen criterio comprobable:

| ID | Texto | Problema |
|---|---|---|
| RNF-006 | Accesibilidad · "nivel objetivo por definir" | Sin nivel, no hay prueba |
| RNF-007 | Rendimiento · "definir tiempos máximos… después de conocer volumen" | Sin cifra, no hay prueba |
| RNF-008 | Disponibilidad · "definir objetivo… antes de contratar infraestructura" | Sin objetivo, no hay prueba |
| RNF-014 | Portabilidad · "canal web, móvil o escritorio queda por validar" | Sin canal, no hay prueba |

Son el 29 % de los no funcionales. Un requisito sin criterio de aceptación no es
un requisito: es una nota. El documento es transparente al respecto, pero los
numera igual que a los demás, lo que infla la sensación de cobertura.

### 3.5 Tres métodos alternativos para el mismo cálculo

§8.3 dice que la capacidad máxima "puede resolverse mediante búsqueda iterativa,
optimización o Goal Seek controlado". Los tres pueden devolver montos distintos
sobre el mismo modelo, y no se fija tolerancia de convergencia, precisión ni
criterio de desempate.

RF-015 solo exige "identifica restricción vinculante". Dos usuarios podrían
obtener capacidades diferentes y ambos cumplirían el requisito.

---

## 4. Coherencia interna

Se contrastaron objetivos contra alcance, restricciones y evidencia. El documento
es internamente consistente en lo esencial: las exclusiones de la Tabla 7 se
respetan a lo largo del texto, las reglas RN-FIN no se contradicen entre sí, y
los casos de prueba CP-006 a CP-014 corresponden a reglas realmente enunciadas.

Las incoherencias detectadas son las ya descritas y se resumen aquí:

| # | Incoherencia | Dónde |
|---|---|---|
| 1 | Cuatro perspectivas anunciadas, tres rutas entregadas, cinco roles tabulados | §6 vs §6.2–6.4 vs Tabla 25 |
| 2 | Numeración de fuentes de Rehavid arranca en `[R-03]` | Tabla 8, Tabla 57 |
| 3 | MVP-3 depende de pendientes de §12.4 sin marca de bloqueo | Tabla 53 vs §12.4 |
| 4 | Umbral del 80 % sin tamaño de examen ni denominador definido | §5.1 vs §5.4 |
| 5 | Repregunta obligatoria con una sola pregunta arquetipo por unidad | §5.2 vs Tabla 16 |

---

## 5. Ruta priorizada

Orden propuesto según qué bloquea a qué. No reemplaza la lista de §12.4: la
reordena por dependencia.

### Antes de escribir código del motor de evaluación

| # | Decisión | Bloquea |
|---|---|---|
| 1 | Denominador del intento: ¿las repreguntas cuentan? | MF-03, RF-003, RF-006, CP-001, CP-004 |
| 2 | Tamaño del examen, ítems por unidad y mínimo del banco | MF-03, RF-002, RF-005 |
| 3 | Mínimo de ítems equivalentes por objetivo | RF-005, CP-003 |

### Antes de escribir código del motor financiero

| # | Decisión | Bloquea |
|---|---|---|
| 4 | Definición corporativa exacta de CFADS | MF-07, RF-013 |
| 5 | Política de caja mínima | MF-08, RF-016 |
| 6 | Definición operativa de "ruptura" | MF-09, RF-020 |
| 7 | Método y tolerancia del cálculo de capacidad | MF-07, RF-015 |
| 8 | Métodos de amortización requeridos | MF-06, RF-011 |

### Antes de comprometer el alcance del MVP

| # | Decisión | Bloquea |
|---|---|---|
| 9 | Licencia de Risk Simulator y formato real de intercambio | MVP-3 completo |
| 10 | Dimensionamiento: esfuerzo, costo, plazo y equipo | Aprobación del MVP |
| 11 | Canal de despliegue | RNF-014, arquitectura |

### Puede resolverse durante la construcción

| # | Decisión |
|---|---|
| 12 | Redactar la ruta del administrador y unificar el número de roles |
| 13 | Fijar valores de RNF-006, 007 y 008 |
| 14 | Sustituir o complementar `[F-01]` por una fuente metodológica |
| 15 | Aclarar el hueco de `[R-01]` y `[R-02]` |
| 16 | Solicitar transcripciones adicionales del curso |

---

## 6. Qué significa esto para la app que se construye

Cuatro consecuencias directas sobre el desarrollo:

1. **No hay una sola cifra financiera en el documento.** Ni tasas, ni plazos, ni
   montos, ni umbrales de covenant, ni caja mínima. Es deliberado y correcto
   —§2.1 lo establece como criterio—, pero significa que **ningún gráfico
   financiero puede alimentarse del documento.** El laboratorio de la app
   funcionará con valores que ingrese el usuario, y los valores iniciales irán
   marcados como ejemplo neutro, nunca como dato de Rehavid.

2. **Sí hay abundante dato estructural graficable**, y ese es real: 32 requisitos
   por prioridad y módulo, 14 categorías de RNF, 12 riesgos con control, 8
   unidades, 12 componentes, 7 estados, 16 casos de prueba, 17 fuentes con su
   frecuencia de cita, 16 relaciones de trazabilidad. Todos los gráficos de la
   app saldrán de ahí.

3. **La evaluación adaptativa se puede implementar tal como está especificada**,
   salvo por los dos vacíos bloqueantes. La app adoptará la lectura A del
   denominador —solo ítems base— por ser la que preserva el significado del 80 %,
   y lo declarará visiblemente como decisión tomada ante un vacío del documento,
   no como algo que el documento diga.

4. **El banco de preguntas hay que ampliarlo.** Con una pregunta por unidad no se
   puede cumplir la repregunta equivalente. La app incorporará ítems adicionales
   por objetivo, marcados como aporte externo y separados de los ocho arquetipos
   que sí vienen del documento.

---

## 7. Conclusión

El documento es una base sólida para construir. Sus problemas no son de calidad
general sino de precisión en cinco puntos concretos, y tres de ellos —denominador
del intento, tamaño del examen y definición de ruptura— hay que resolverlos con
una decisión de Rehavid antes de que el código correspondiente sea definitivo.

Lo que sí conviene mirar de frente es el punto 3.1: dos minutos y diez segundos
de audio no son la base de este documento, aunque el documento se presente como
derivado de ellos. El valor está en el trabajo de ingeniería de requisitos que se
hizo encima. Nombrarlo así no le resta mérito; evita que alguien crea que existe
un respaldo documental que no existe, y convierte "pedir más transcripciones" en
lo que debe ser: una prioridad, no un pendiente.
