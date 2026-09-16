# Rehavid V5 · Predicción de enfermedad laboral · ASEAR S.A.S. E.S.P.

Ejecución del motor **Rehavid V5** (`Rehavid_EL_V5_Codigo_Legible.py`, 25 archivos, integridad
verificada con `--verify-code`, `check-env` → `software 5.0.0`) sobre las **bases ajustadas
reales de ASEAR** (SharePoint `BASES/BASES PARA BI/ASEAR/Bases ajustadas`, entregadas como ZIP el
2026-09-16). Esta carpeta contiene el pipeline reproducible, las decisiones de mapeo con su
evidencia y los resultados agregados. **No contiene registros individuales**: la carpeta
`trabajo/` (originales, derivados, formularios con datos, resultados completos) está excluida del
repositorio por `.gitignore`.

## 1. Resultado en una línea

Con las bases entregadas **el motor no puede entrenar**: en la fecha índice predeclarada
(2021-03-31) sólo hay 437 personas con vínculo conocido y 1 evento observable (diseño A) o 6
eventos (diseño B, vínculos consolidados), frente a los mínimos del motor (5 eventos en
entrenamiento, 2 en validación, 2 en prueba y ≥2 por horizonte). No es un fallo de los
algoritmos: es insuficiencia demostrada de la historia laboral y de los eventos enlazables
(sección 6). El motor sí construyó la cohorte de predicción actual (3.539 personas activas al
2026-06-30), lista para puntuar cuando exista un modelo.

| Ejecución | Estado del motor | Entrenamiento | Validación | Prueba | Predicción | Mediana de seguimiento (sin evento) |
|---|---|---:|---:|---:|---:|---:|
| A · contratos (principal) | `INSUFFICIENT_TRAINING_EVENTS` (código 3) | 260 personas / 1 evento | 85 / 0 | 92 / 0 | 3.420 | 244 días |
| B · vínculos consolidados | `TRAINING_SUPPORT_BLOCKED` (código 3) | 260 / 5 | 85 / 1 | 92 / 0 | 3.539 | 1.917 días |

Diseño B: en entrenamiento los horizontes de 36 y 60 meses resultan `potentially_evaluable`
(2 y 5 eventos), pero la validación reservada no tiene soporte en ningún horizonte
(0, 0 y 1 evento), por lo que el motor no selecciona modelo, como exige su protocolo.
La sensibilidad D3 (`--sensibilidad verified_diagnosis`: fecha del evento = fecha del
siniestro/diagnóstico, disponibilidad = fecha de calificación) sobre el diseño B produce
exactamente las mismas cohortes (260/5, 85/1, 92/0) y el mismo estado.

## 2. Bases utilizadas

| Archivo (hoja) | Filas | Uso en el motor | Observaciones |
|---|---:|---|---|
| `Caracterizacion_ASEAR_LIMPIA.xlsx` (Datos) | 56 | **outcomes** (casos EL calificados por la ARL) | 54 personas; Calificación = SI ATEP y Causa = ENFERMEDAD LABORAL en 56/56; calificaciones 2017-04-17 a 2026-06-17; suma Días IT = 561 (coincide con la bitácora). Diagnósticos: G560 14, U072 14, M751 10, U071 10, M770 4, M654 2, M658 1, M771 1. |
| `Base_Rotacion_Historica_LIMPIA.xlsx` (Rotacion Limpia) | 11.293 | **employment** (vínculos) | 3.668 personas; contiene **todos** los vínculos de `Base_Datos_Personal_LIMPIA.xlsx` (3.590 personas activas) y sólo 78 personas más: es la historia contractual de la plantilla vigente en 2026, no un censo de retirados (bitácora: "Informe INACTIVOS", procesado 2026-07-31). Inicios 2019-01-01 a 2026-07-06; fines desde 2021-06-20; 3.389 vínculos abiertos. |
| `Ausentismo_Consolidado_2020-2026.xlsx` (Ausentismo) | 33.495 | **health_events** (antecedentes) | 8.267 personas; 15 variantes de `TIPO DE EVENTO`; 2.151 filas duplicadas exactas; 7 sin fecha inicial, 7 con fin anterior al inicio; 6.641 personas sin vínculo en rotación (80 %), tasa de cruce por año: 13 % (2020) → 79 % (2026). |
| `Base_Datos_Personal_LIMPIA.xlsx` (Personal Limpio) | 3.640 | Sólo cruce de verificación | Subconjunto de Rotación (0 personas y 0 vínculos ausentes). |
| `Accidentalidad_Consolidado_2020-2026.xlsx` (Accidentalidad) | 2.476 | No usada | Sin `N DOCUMENTO` en 2020 (173), 2022 (525), 2023 (515) y parte de 2024 (138): no enlazable; las incapacidades por AT entran por Ausentismo. |
| `Personal_Recomendaciones_Restricciones_LIMPIA.xlsx` | 152 | No usada | Sin origen (EL/AT/EG) ni fecha/estado de calificación. Contexto. |

Los seis libros se inventariaron primero por el conector de Microsoft 365, que **trunca cada
libro a ~190 k caracteres** (3 % de Rotación, 2,6 % de Ausentismo) y no pagina Excel; por eso
la ejecución sólo fue posible con los archivos completos subidos a la sesión.

## 3. Mapeo al contrato de datos del motor (`decisiones_mapeo_asear.json`)

| Fuente | Entrada | Campos canónicos |
|---|---|---|
| outcomes | Caracterización, hoja Datos | `company` ← Nombre Empresa Nombre Comercial · `person_id` ← Empleado DNI (prefijo literal `C` retirado, 56/56 con patrón `C`+dígitos; control de colisiones del motor) · `event_id` ← Expediente ID · `status` ← Calificación DESC (`SI ATEP` → `confirmed`) · `event_date` = `available_at` ← Fecha Calificacion Siniestro Fecha (`final_decision`) |
| employment | `derivados/Base_Rotacion_Historica__vinculos.csv` (A) o `…__vinculos_consolidados.csv` (B) | `person_id` ← Identificacion · `start_date` ← Fecha Inicio Contrato · `end_date` ← Fecha Fin Contrato (vacío = abierto) · `company` constante · `spell_id` derivado de `person_id;start_date` · `recorded_at` por regla `documented_contract_start` (sólo `tenure_years`) |
| health_events | `derivados/Ausentismo_Consolidado__ausentismo_comun.csv` y `…__ausentismo_laboral.csv` | `person_id` ← CEDULA TRABAJADOR · `event_id` ← ID_EVENTO_DERIVADO (archivo:fila) · `event_date` ← FECHA INICIAL · `available_at` ← FECHA FINAL · `days` ← DIAS DE INCAPACIDAD · `source_kind` constante (`ausentismo_comun` / `ausentismo_laboral`) |
| followup | derivado `employment_intersect_registry` | cobertura declarada del registro ARL 2020-01-01 → 2026-06-30, `verified_at` 2026-06-30 |

Derivaciones documentadas (`derivar_fuentes.py`, manifest con SHA-256 y conteos; los originales
no se modifican): filtro de `TIPO DE EVENTO` (común: `A.C. - E.G.`, `A.C - E.G`, `A.C-E.G`,
`E.G`, `E.G.`, `EG`; laboral: `A.T.`, `A.T`, `AT`, `E.L.`, `E.L`; excluidos SOAT 7, A.TRANSITO
2, `A` 1, vacío 1), exclusión de filas con fecha vacía o fin anterior al inicio (5 + 6 + 1),
eliminación de duplicados exactos (1.720 + 431), resolución de 1 par (persona, inicio)
duplicado en rotación, y en el diseño B la consolidación de contratos consecutivos
(brecha ≤ 7 días) en 5.548 vínculos (3.339 abiertos).

Protocolo predeclarado (regla en `regla_predeclarada_fechas`): `as_of` = 2026-06-30,
`person_holdout` con fecha índice común 2021-03-31 (último cierre de trimestre con más de 60
meses de seguimiento hasta el cierre), horizontes 12/36/60 meses, ventanas retrospectivas
3/6/12 meses, `employment_features = ["tenure_years"]`, `covered_kinds` = ausentismo común y
laboral, mínimos de evaluación del motor sin modificar, semilla 2026.

### Declaraciones que asume el operador (D1–D3)

El motor exige `reviewed=true` humano para dos reglas de derivación. La ejecución se hizo con el
sello «ejecución autónoma de Claude por instrucción del operador Ariel Ramírez (Rehavid);
ratificación humana solicitada». Ratifíquelas o corríjalas (`--cobertura-fin`,
`--verificado-en`, `--as-of`) y vuelva a ejecutar:

- **D1** `documented_contract_start`: la fecha de inicio de contrato de la base de rotación es la
  fecha de disponibilidad del vínculo (sólo `tenure_years`; no se retrofecha cargo/área/sede).
- **D2** `employment_intersect_registry`: el registro de siniestros de la ARL (contrato 094103330,
  afiliación obligatoria — Ley 1562/2012 art. 2, Decreto 1295/1994; calificación en primera
  oportunidad — Ley 1562/2012 art. 4, Decreto 1477/2014) observa a toda la población con contrato
  vigente durante 2020-01-01 → 2026-06-30, y la extracción refleja el estado al 2026-06-30
  (bitácora de limpieza: 2026-08-11). **Este es el supuesto metodológico principal.**
- **D3** Desenlace: primer evento EL calificado por la ARL, fecha = fecha de calificación,
  incluyendo COVID-19 calificado como EL (24 de 56 casos).

## 4. Cómo ejecutar

```bash
python3 -m venv venv && ./venv/bin/python Rehavid_EL_V5_Codigo_Legible.py install   # instala requirements.txt del motor
./venv/bin/python Rehavid_EL_V5_Codigo_Legible.py check-env      # debe informar software 5.0.0
mkdir -p trabajo/originales && cp /ruta/a/los/seis/*.xlsx trabajo/originales/
./venv/bin/python ejecutar_asear.py --hasta formularios          # verificar + derivar + formularios
./venv/bin/python ejecutar_asear.py --ratificado-por "Nombre Apellido"                    # diseño A completo
./venv/bin/python ejecutar_asear.py --ratificado-por "Nombre Apellido" --vinculos consolidados   # diseño B
./venv/bin/python ejecutar_asear.py --ratificado-por "Nombre Apellido" --sensibilidad verified_diagnosis
```

Cada ejecución crea `trabajo/ejecucion_<fecha>/` con `verificaciones/`, `fuentes_motor/`
(copias + derivados + manifest), `formularios/`, `config_asear.json`, `preparacion/`,
`resultado/` (salida íntegra del motor: `LEER_PRIMERO.md`, `estado_ejecucion.json`,
`analisis/…`) y `INFORME_RESUMEN.md`. Requiere Python 3.11–3.14 y las versiones fijadas del
motor (scikit-survival 0.27, scikit-learn 1.8, pandas 2.2.3, openpyxl 3.1.5).

## 5. Resultados agregados versionados

`resultados/ejecucion_A_contratos/` y `resultados/ejecucion_B_consolidados/` contienen, sin
registros individuales: `INFORME_RESUMEN.md`, `LEER_PRIMERO.md`, `estado_ejecucion.json`,
`analisis/informe.md`, tablas (`cohort_flow`, `feasibility_by_horizon`, `horizon_status`,
`followup`, `event_status`, `quality`, `feature_missingness`, `etapas_y_responsabilidades`),
figuras, `audit/`, `preparacion/*.json|csv` (sin datos canónicos), `verificaciones/`,
`manifest_derivacion.json`, formularios diligenciados, `config_asear.json` y `logs/`.

Soporte por fecha índice candidata (verificación previa, diseño con vínculos vigentes al
cierre; eventos = personas con EL calificada después de t0 entre las activas y no prevalentes):

| t0 | activas | eventos ≤12 m | ≤36 m | ≤60 m | 60 m dentro de cobertura |
|---|---:|---:|---:|---:|---|
| 2020-12-31 | 258 | 0 | 2 | 4 | sí |
| 2021-03-31 | 437 | 0 | 2 | 6 | sí |
| 2021-06-30 | 646 | 0 | 3 | 8 | no |
| 2022-03-31 | 748 | 2 | 3 | 10 | no |
| 2023-03-31 | 877 | 0 | 7 | 8 | no |
| 2023-12-31 | 715 | 1 | 7 | 7 | no |

Ninguna fecha índice alcanza los mínimos del motor (≥5/2/2 eventos por etapa y ≥2 por
horizonte) con esta historia laboral; las fechas no se eligieron por resultado.

## 6. Diagnóstico: por qué no se puede entrenar todavía

1. **La historia laboral es la de la plantilla vigente.** `Base_Rotacion_Historica_LIMPIA.xlsx`
   contiene los contratos de 3.668 personas, de las cuales 3.590 están activas en 2026. Quien se
   retiró antes de 2026 (con o sin EL) casi no aparece: 35 de las 54 personas con EL calificada
   no cruzan con la nómina, y sólo el 13 % de las incapacidades de 2020 y el 29 % de 2023 pertenecen
   a personas con vínculo conocido. Una cohorte histórica construida así está condicionada a
   seguir empleado en 2026 (sesgo de supervivencia) y pierde la mayoría de los eventos.
2. **El contrato no equivale al vínculo.** ASEAR renueva por obra o labor (mediana 211 días;
   4.842 renovaciones con brecha ≤1 día). El motor cierra el seguimiento al fin del contrato
   vigente en la fecha índice y mide `tenure_years` desde su inicio, por lo que en el diseño A
   la mediana de seguimiento es 244 días y 5 de los 6 eventos quedan censurados. El diseño B
   (contratos consecutivos unidos) corrige el seguimiento, pero no el punto 1.
3. **Pocos eventos enlazables.** 19 personas con EL calificada tienen vínculo conocido; después
   de cualquier fecha índice quedan 6–10 eventos, frente a 15–20 necesarios para superar los
   mínimos con partición 60/20/20 y soporte por horizonte.
4. **Antecedentes con cobertura individual corta.** Como el vínculo conocido suele empezar
   después de 2020, las ventanas de 6 y 12 meses no están cubiertas para el 84 % y 97 % de las
   personas de entrenamiento (`feature_missingness.csv`); sólo la ventana de 3 meses es utilizable.

### Qué datos harían viable el modelo

- Histórico **completo** de vínculos 2014–2026 (o al menos 2018–2026) de **todos** los
  trabajadores, incluidos los retirados: documento, fecha de ingreso, fecha de retiro real y
  motivo (nómina/PILA/novedades), idealmente con cargo y centro por vigencia.
- Fecha de corte de la extracción de la ARL y confirmación de que cubre todos los centros de
  trabajo y todo el período (D2); si hubo cambio de ARL, las extracciones anteriores.
- Ausentismo con documento válido en todas las filas (43 cédulas de 15 dígitos y otras
  anomalías) y accidentalidad con `N DOCUMENTO` en 2020, 2022–2024.
- Con ~3.600 trabajadores y 5–8 EL calificadas por año, alcanzar ≥15–20 eventos exige la
  población histórica completa (varios años de cohorte) o un diseño temporal con varias fechas
  índice; el motor no implementa remuestreo, y sus mínimos no deben relajarse.

## 7. Archivos de esta carpeta

| Archivo | Contenido |
|---|---|
| `Rehavid_EL_V5_Codigo_Legible.py` | Motor V5 autónomo (copia íntegra del entregado). |
| `decisiones_mapeo_asear.json` | Inventario esperado, mapeo, derivaciones, protocolo, declaraciones D1–D3, variantes. |
| `verificar_bases.py` | Verificaciones previas agregadas (encabezados, estados, fechas, cruces, soporte por t0). |
| `derivar_fuentes.py` | Copias intactas + CSV derivados por reglas documentadas + manifest. |
| `ejecutar_asear.py` | Orquestador: verify-code, check-env, verificar, derivar, forms, configure, prepare, run, informe. |
| `resultados/` | Salidas agregadas de las ejecuciones A y B. |
