# Rehavid V5 · Predicción de enfermedad laboral · ASEAR S.A.S. E.S.P.

Ejecución del motor **Rehavid V5** (`Rehavid_EL_V5_Codigo_Legible.py`, 25 archivos, integridad
verificada con `--verify-code`; `check-env` → `software 5.0.0`) sobre las **bases ajustadas
reales de ASEAR** (SharePoint `BASES/BASES PARA BI/ASEAR/Bases ajustadas`, entregadas como ZIP el
2026-09-16). Esta carpeta contiene el pipeline reproducible, las decisiones de mapeo con su
evidencia y los resultados agregados. **No contiene registros individuales**: la carpeta
`trabajo/` (originales, derivados, formularios, resultados completos) está excluida por `.gitignore`,
y las tablas publicadas aplican la regla `min_cell_count` del motor (conteos entre 1 y 4 → `<5`).

## 1. Resultado en una línea

Con las bases entregadas **el motor no puede entrenar**: en la fecha índice predeclarada
(2021-03-31) sólo hay 437 personas con vínculo conocido y, en el diseño principal, 5 eventos en
entrenamiento, `<5` en validación y 0 en prueba, frente a los mínimos del motor (5 eventos en
entrenamiento, 2 en validación, 2 en prueba y ≥2 por horizonte). No es un fallo de los
algoritmos: es insuficiencia demostrada de la historia laboral y de los eventos enlazables
(sección 6). El motor sí construyó la cohorte de predicción actual (3.536 personas activas al
2026-06-30), lista para puntuar cuando exista un modelo.

Todas las ejecuciones de esta entrega son **exploratorias de factibilidad (no ratificadas)**:
las declaraciones D1–D3 (sección 3) las asumió el pipeline con `--exploratorio` para que el
motor evaluara el soporte; una persona debe ratificarlas para una ejecución publicable.

| Ejecución (`resultados/…`) | Diseño | Estado del motor | Entrenamiento | Validación | Prueba | Predicción | Mediana de seguimiento sin evento |
|---|---|---|---:|---:|---:|---:|---:|
| `B_consolidados_principal` | vínculos consolidados, antecedentes disponibles desde la fecha inicial | `TRAINING_SUPPORT_BLOCKED` (3) | 260 personas / 5 eventos | 85 / `<5` | 92 / 0 | 3.536 | 1.917 días |
| `A_contratos_sensibilidad` | cada fila-contrato es un vínculo | `INSUFFICIENT_TRAINING_EVENTS` (3) | 260 / `<5` | 85 / 0 | 92 / 0 | 3.420 | 244 días |
| `B_verified_diagnosis_sensibilidad` | fecha del evento = fecha del siniestro, maduración 1.033 días | `INSUFFICIENT_TRAINING_EVENTS` (3) | 260 / `<5` | 85 / 0 | 92 / 0 | 3.536 | 884 días |
| `B_no_covid_sensibilidad` | desenlace restringido a EL no COVID | `TRAINING_SUPPORT_BLOCKED` (3) | 260 / 5 | 85 / `<5` | 92 / 0 | 3.538 | 1.917 días |
| `B_disponibilidad_final_sensibilidad` | antecedentes disponibles al terminar la incapacidad | `TRAINING_SUPPORT_BLOCKED` (3) | 260 / 5 | 85 / `<5` | 92 / 0 | 3.536 | 1.917 días |

En el diseño principal los horizontes de 36 y 60 meses resultan `potentially_evaluable` en
entrenamiento, pero la validación reservada no tiene soporte en ningún horizonte, por lo que el
motor no selecciona modelo, como exige su protocolo. En el diseño A el seguimiento se corta al
fin del contrato vigente en la fecha índice (mediana 244 días) y se pierden casi todos los
eventos; por eso B es el diseño principal (predeclarado en `regla_predeclarada_fechas`).

## 2. Bases utilizadas

| Archivo (hoja) | Filas | Uso en el motor | Observaciones |
|---|---:|---|---|
| `Caracterizacion_ASEAR_LIMPIA.xlsx` (Datos) | 56 | **outcomes** (casos EL calificados por la ARL), versionados apertura → calificación | 54 personas; Calificación = SI ATEP, Causa = ENFERMEDAD LABORAL y Origen = PROPIO DEL TRABAJO en 56/56; calificaciones 2017-04-17 a 2026-06-17; suma Días IT = 561 (coincide con la bitácora). Diagnósticos: G560 14, U072 14, M751 10, U071 10, otros `<5`. Rezago siniestro→calificación: mediana 137 días, p90 1.033; apertura→calificación: mediana 6,5 días. |
| `Base_Rotacion_Historica_LIMPIA.xlsx` (Rotacion Limpia) | 11.293 | **employment** (vínculos) | 3.668 personas; contiene **todos** los vínculos de `Base_Datos_Personal_LIMPIA.xlsx` (3.590 personas activas) y sólo 78 personas más: es la historia contractual de la plantilla vigente en 2026, no un censo de retirados (bitácora: "Informe INACTIVOS", 2026-07-31). Inicios 2019-01-01 a 2026-07-06; fines desde 2021-06-20; 3.389 contratos abiertos; 4.842 renovaciones con brecha ≤1 día; 53 contratos sin fin seguidos de otro contrato. |
| `Ausentismo_Consolidado_2020-2026.xlsx` (Ausentismo) | 33.495 | **health_events** (antecedentes) | 8.267 personas; 15 variantes de `TIPO DE EVENTO`; 2.151 filas duplicadas exactas y 813 duplicados semánticos entre libros anuales; 5 sin fecha inicial, 7 con fin anterior al inicio; 6.641 personas sin vínculo en rotación (cruce de filas por año: 13 % en 2020 → 79 % en 2026). |
| `Base_Datos_Personal_LIMPIA.xlsx` (Personal Limpio) | 3.640 | Sólo cruce de verificación | Subconjunto de Rotación (0 personas y 0 vínculos ausentes). |
| `Accidentalidad_Consolidado_2020-2026.xlsx` (Accidentalidad) | 2.476 | No usada | Sin `N DOCUMENTO` en 2020 (173), 2022 (525), 2023 (515) y parte de 2024 (138): no enlazable; las incapacidades por AT entran por Ausentismo. |
| `Personal_Recomendaciones_Restricciones_LIMPIA.xlsx` | 152 | No usada | Sin origen (EL/AT/EG) ni fecha/estado de calificación. Contexto. |

Los seis libros se inventariaron primero por el conector de Microsoft 365, que **trunca cada
libro a ~190 k caracteres** (3 % de Rotación, 2,6 % de Ausentismo) y no pagina Excel; la
ejecución sólo fue posible con los archivos completos subidos a la sesión.

## 3. Mapeo al contrato de datos del motor (`decisiones_mapeo_asear.json`)

| Fuente | Entrada | Campos canónicos |
|---|---|---|
| outcomes | `derivados/Caracterizacion__desenlaces_versionados.csv` (94 versiones de 56 expedientes) | `company` ← Nombre Empresa Nombre Comercial · `person_id` ← Empleado DNI (prefijo literal `C` retirado, 56/56 con patrón `C`+dígitos; control de colisiones del motor) · `event_id` ← Expediente ID · `status` ← ESTADO_VERSION (`SI ATEP` → `confirmed`; `EN ESTUDIO ARL (apertura del siniestro)` → `pending`) · `event_date` = `available_at` ← FECHA_VERSION (`final_decision`) · `outcome_group` ← GRUPO_DESENLACE (COVID / NO_COVID, sólo se filtra en la sensibilidad `no_covid`) |
| employment | `derivados/Base_Rotacion_Historica__vinculos_consolidados.csv` (B, 5.549 vínculos) o `…__vinculos.csv` (A) | `person_id` ← Identificacion · `start_date` ← Fecha Inicio Contrato · `end_date` ← Fecha Fin Contrato (vacío = abierto) · `company` constante · `spell_id` derivado de `person_id;start_date` · `recorded_at` por regla `documented_contract_start` (sólo `tenure_years`) |
| health_events | `derivados/Ausentismo_Consolidado__ausentismo_comun.csv` (28.438) y `…__ausentismo_laboral.csv` (2.036) | `person_id` ← CEDULA TRABAJADOR · `event_id` ← ID_EVENTO_DERIVADO · `event_date` ← FECHA INICIAL · `available_at` ← FECHA INICIAL (variante `final`: FECHA FINAL) · `days` ← DIAS DE INCAPACIDAD · `source_kind` constante |
| followup | derivado `employment_intersect_registry` | cobertura declarada del registro ARL 2020-01-01 → 2026-06-30, `verified_at` 2026-06-30 |

Derivaciones documentadas (`derivar_fuentes.py`; manifest con SHA-256, reglas y conteos; los
originales no se modifican):

- **Desenlace versionado**: por expediente, una versión `pending` con fecha de apertura del
  siniestro y una `confirmed` con fecha de calificación (38 versiones pendientes; 18 expedientes
  con apertura no anterior a la calificación sólo tienen la versión final). Así el motor excluye
  a quien tenía un siniestro en estudio en la fecha índice y censura ante aperturas no
  calificadas al cierre.
- **Vínculos consolidados (B)**: contratos consecutivos de la misma persona (brecha ≤ 7 días o
  solapados) se unen en un vínculo; un contrato sin fin seguido de otro se cierra el día anterior
  al siguiente inicio (53 casos, contados). Diseño A: cada fila-contrato es un vínculo, con
  resolución de 1 duplicado de (persona, inicio).
- **Ausentismo**: común = `A.C. - E.G.` y variantes `E.G` (28.438 filas); laboral = `A.T.` y
  variantes (2.036). Excluidos y contados: 34 filas `E.L` (incapacidad por EL: fuga de etiqueta),
  SOAT 7, A.TRANSITO 2, otros 2; 5 + 1 filas sin fecha o con fin anterior al inicio; 2.151
  duplicados exactos y 813 semánticos (misma cédula, inicio, fin y días entre libros anuales).

Protocolo predeclarado (`regla_predeclarada_fechas`): `as_of` = 2026-06-30, `person_holdout`
con fecha índice común 2021-03-31 (último cierre de trimestre con más de 60 meses de seguimiento
hasta el cierre), horizontes 12/36/60 meses, ventanas retrospectivas 3/6/12 meses,
`employment_features = ["tenure_years"]`, `covered_kinds` = ausentismo común y laboral,
mínimos de evaluación del motor sin modificar, semilla 2026, diseño principal B. Cualquier
sobrescritura de fechas por línea de comandos exige `--enmienda "motivo"` y queda registrada.

### Declaraciones que debe ratificar una persona (D1–D3)

El motor exige `reviewed=true` humano para dos reglas de derivación. En esta entrega **no hay
ratificación**: las ejecuciones se hicieron con `--exploratorio`, que lo deja registrado en
`parametros_ejecucion.json`, en la justificación del protocolo y en cada informe.

- **D1** `documented_contract_start`: la fecha de inicio del vínculo (B: inicio del primer contrato
  del tramo) es la fecha de disponibilidad del vínculo; sólo `tenure_years` como predictor laboral.
- **D2** `employment_intersect_registry`: el registro de siniestros de la ARL (contrato 094103330;
  afiliación obligatoria — Ley 1562/2012 art. 2, Decreto 1295/1994; calificación en primera
  oportunidad — Ley 1562/2012 art. 4, Decreto 1477/2014) observa a toda la población con
  contrato vigente durante 2020-01-01 → 2026-06-30, y la extracción refleja el estado al
  2026-06-30. La fecha de corte real de la extracción (entre 2026-06-17 y el procesamiento del
  2026-08-11) debe confirmarse (`--cobertura-fin`, `--verificado-en`, `--as-of`).
  **Es el supuesto metodológico principal.**
- **D3** Desenlace: primer evento EL calificado por la ARL (SI ATEP), fecha = calificación, con la
  apertura del siniestro como estado pendiente; incluye COVID-19 (24 de 56 casos). Sensibilidades
  `verified_diagnosis` y `no_covid`.

## 4. Cómo ejecutar

```bash
python3 -m venv venv && ./venv/bin/python Rehavid_EL_V5_Codigo_Legible.py install   # requirements.txt del motor
./venv/bin/python Rehavid_EL_V5_Codigo_Legible.py check-env                          # debe informar software 5.0.0
mkdir -p trabajo/originales && cp /ruta/a/los/seis/*.xlsx trabajo/originales/
./venv/bin/python ejecutar_asear.py --hasta formularios        # verificar + derivar + formularios (código 0)
./venv/bin/python ejecutar_asear.py --exploratorio             # factibilidad sin ratificación (rotulada)
./venv/bin/python ejecutar_asear.py --ratificado-por "Nombre Apellido, medicina laboral" \
    --fecha-ratificacion 2026-09-20 --declaraciones-aceptadas D1,D2,D3          # ejecución ratificada
./venv/bin/python ejecutar_asear.py ... --vinculos contratos                    # sensibilidad A
./venv/bin/python ejecutar_asear.py ... --sensibilidad verified_diagnosis       # o no_covid
./venv/bin/python ejecutar_asear.py ... --disponibilidad-antecedentes final
./venv/bin/python exportar_agregados.py --run trabajo/ejecucion_<fecha> --destino resultados/<nombre>
```

Cada ejecución crea `trabajo/ejecucion_<fecha>_<diseño>/` con `decisiones_aplicadas.json`,
`parametros_ejecucion.json` (huellas SHA-256 de los archivos versionados, ratificación,
desviaciones), `verificaciones/`, `fuentes_motor/` (copias + derivados + manifest),
`formularios/`, `config_asear.json`, `preparacion/`, `resultado/` (salida íntegra del motor) e
`INFORME_RESUMEN.md`. Códigos de salida del pipeline: 0 correcto; 10 argumentos o fechas
incoherentes; 11 motor no verificado; 12 verificaciones bloqueantes; 13 derivación/forms; 14 sin
ratificación; 15 configuración bloqueada; 2/3/4 son los del motor. Requiere Python 3.11–3.14.

## 5. Resultados agregados versionados

`resultados/<ejecución>/` contiene, sin registros individuales: `INFORME_RESUMEN.md`,
`decisiones_aplicadas.json`, `parametros_ejecucion.json`, `config_asear.json`, `LEER_PRIMERO.md`,
`estado_ejecucion.json`, `analisis/informe.md`, tablas con supresión (`*_suprimido.csv`),
figuras, `audit/`, `preparacion/*.json|csv` (sin datos canónicos), `verificaciones/`,
`manifest_derivacion.json`, formularios diligenciados y `logs/`.

Cribado de soporte por fecha índice (vínculos consolidados; personas con vínculo vigente en t0
y no prevalentes; eventos = calificaciones posteriores a t0 y anteriores al fin del vínculo
vigente o de la cobertura; sin partición 60/20/20):

| t0 | activas | con vínculo ≥12 m antes | eventos ≤12 m | ≤36 m | ≤60 m | 60 m dentro de cobertura |
|---|---:|---:|---:|---:|---:|---|
| 2020-12-31 | 258 | 10 | 0 | `<5` | `<5` | sí |
| 2021-03-31 | 437 | 11 | 0 | `<5` | 6 | sí |
| 2021-06-30 | 649 | 47 | 0 | `<5` | 7 | no |
| 2022-06-30 | 761 | 478 | `<5` | 5 | 9 | no |
| 2023-06-30 | 901 | 539 | `<5` | 7 | 7 | no |
| 2023-12-31 | 893 | 591 | `<5` | 8 | 8 | no |

Ninguna fecha índice alcanza los mínimos del motor (≥5/2/2 eventos por etapa y ≥2 por
horizonte en validación) con esta historia laboral; las fechas no se eligieron por resultado.

## 6. Diagnóstico: por qué no se puede entrenar todavía

1. **La historia laboral es la de la plantilla vigente.** `Base_Rotacion_Historica_LIMPIA.xlsx`
   contiene los contratos de 3.668 personas, de las cuales 3.590 están activas en 2026. Quien se
   retiró antes casi no aparece: 35 de las 54 personas con EL calificada no cruzan con la nómina
   (19 de ellas sí aparecen en el ausentismo, es decir, fueron trabajadores de ASEAR: no es un
   problema de identificadores), y sólo el 13 % de las incapacidades de 2020 y el 29 % de 2023
   pertenecen a personas con vínculo conocido. Una cohorte histórica construida así está
   condicionada a seguir empleado en 2026 (sesgo de supervivencia) y pierde la mayoría de los
   eventos.
2. **El contrato no equivale al vínculo.** ASEAR renueva por obra o labor (mediana 211 días;
   4.842 renovaciones con brecha ≤1 día). El motor cierra el seguimiento al fin del vínculo
   vigente en la fecha índice; con contratos como vínculos (A) la mediana de seguimiento es 244
   días. El diseño B corrige el seguimiento, no el punto 1.
3. **Pocos eventos enlazables.** 19 personas con EL calificada tienen vínculo conocido; después de
   cualquier fecha índice quedan 6–9 eventos observables, frente a 15–20 necesarios para superar
   los mínimos con partición 60/20/20 y soporte por horizonte en validación.
4. **Antecedentes con cobertura individual corta.** Como el vínculo conocido suele empezar en
   2020 o después, las ventanas de 6 y 12 meses no están cubiertas para el 84 % y 97 % de las
   personas de entrenamiento (`feature_missingness_suprimido.csv`); sólo la ventana de 3 meses
   es utilizable. `tenure_years` mide antigüedad desde el primer contrato registrado, no la real.
5. **El registro ARL sólo trae calificaciones SI ATEP**: no hay casos NO ATEP ni siniestros en
   estudio sin calificar, por lo que los estados rechazados no se pueden representar.

### Qué datos harían viable el modelo

- Histórico **completo** de vínculos 2018–2026 de **todos** los trabajadores, incluidos los
  retirados: documento, fecha de ingreso, fecha de retiro real y motivo (nómina/PILA/novedades),
  idealmente con cargo y centro por vigencia y la fecha de implantación del sistema de nómina.
- Extracto de siniestros de la ARL con fecha de corte, todas las calificaciones (SI ATEP, NO ATEP,
  en estudio) y confirmación de alcance (contrato 094103330, todos los centros, todo el período).
- Ausentismo con documento válido en todas las filas (43 cédulas de 15 dígitos y otras anomalías)
  y accidentalidad con `N DOCUMENTO` en 2020 y 2022–2024.
- Con ~3.600 trabajadores y 5–8 EL calificadas por año, alcanzar ≥15–20 eventos exige la
  población histórica completa (varios años de cohorte) o un diseño temporal con varias fechas
  índice; el motor no implementa remuestreo y sus mínimos no deben relajarse.

## 7. Archivos de esta carpeta

| Archivo | Contenido |
|---|---|
| `Rehavid_EL_V5_Codigo_Legible.py` | Motor V5 autónomo (copia íntegra del entregado). |
| `decisiones_mapeo_asear.json` | Inventario esperado, mapeo, derivaciones, protocolo, declaraciones D1–D3, variantes y sensibilidades. |
| `verificar_bases.py` | Verificaciones previas agregadas (encabezados, estados, fechas, cruces, cribado por t0 con la censura del motor). |
| `derivar_fuentes.py` | Copias intactas + CSV derivados por reglas documentadas + manifest. |
| `ejecutar_asear.py` | Orquestador: verify-code, check-env, verificar, derivar, forms, configure, prepare, run, informe; ratificación humana o modo exploratorio. |
| `exportar_agregados.py` | Exporta de una ejecución sólo archivos agregados, con supresión de celdas pequeñas. |
| `utilidades.py` | Hashes, supresión `min_cell_count`, tablas Markdown. |
| `resultados/` | Salidas agregadas de las cinco ejecuciones exploratorias. |
