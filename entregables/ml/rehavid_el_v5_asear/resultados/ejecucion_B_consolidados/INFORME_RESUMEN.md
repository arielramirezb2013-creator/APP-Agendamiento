# Rehavid V5 · ASEAR S.A.S. E.S.P. · resumen de la ejecución

Carpeta de ejecución: `/tmp/claude-0/-home-user-APP-Agendamiento/a0122bb2-9092-5cf7-890f-1196c801245f/scratchpad/rehavid/asear_trabajo/ejecucion_20260916T211951Z_consolidados`  
Fecha (UTC): 2026-09-16T21:21:06+00:00  
Diseño de vínculos: consolidados (A = contratos; B = consolidados)  
Sensibilidad: ninguna (análisis principal)  
Ratificación de declaraciones D1–D3: ejecucion autonoma de Claude por instruccion del operador Ariel Ramirez (Rehavid); ratificacion humana solicitada

## Estado del motor

```json
{
  "software": "5.0.0",
  "status": "TRAINING_SUPPORT_BLOCKED",
  "phase": "completed",
  "exit_code": 3,
  "training_completed": false,
  "selection_completed": false,
  "selected_model": null,
  "predicted_horizons_months": [],
  "cohorts": {
    "train": {
      "people": 260,
      "events": 5
    },
    "validation": {
      "people": 85,
      "events": 1
    },
    "test": {
      "people": 92,
      "events": 0
    },
    "score": {
      "people": 3539,
      "events": null
    }
  },
  "clinical_validation": "not_established"
}
```

### Hallazgos reportados por el motor

- Ningún horizonte tiene soporte en la validación reservada; no se elige el mejor por entrenamiento.
- Revise el motivo y el soporte de entrenamiento/validación por horizonte; no se concluye inviabilidad de toda la empresa.

## Verificaciones previas (agregados)

Cruces desenlaces ↔ nómina: `{"personas_con_el": 54, "personas_con_el_en_rotacion": 19, "personas_con_el_sin_vinculo_en_rotacion": 35}`

### Soporte por fecha índice candidata (antes de entrenar)

| t0 | activos | prevalentes_excluidos | elegibles | meses_seguimiento_hasta_cierre | activos_con_vinculo_desde_3m_antes | activos_con_vinculo_desde_6m_antes | activos_con_vinculo_desde_12m_antes | eventos_a_12m | horizonte_12m_dentro_de_cobertura | eventos_a_36m | horizonte_36m_dentro_de_cobertura | eventos_a_60m | horizonte_60m_dentro_de_cobertura | eventos_totales_posteriores |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| 2020-12-31 | 258 | 0 | 258 | 65.9 | 75 | 48 | 10 | 0 | True | 2 | True | 4 | True | 4 |
| 2021-03-31 | 437 | 0 | 437 | 63.0 | 258 | 75 | 11 | 0 | True | 2 | True | 6 | True | 6 |
| 2021-06-30 | 646 | 4 | 642 | 60.0 | 434 | 256 | 47 | 0 | True | 3 | True | 8 | False | 8 |
| 2021-09-30 | 678 | 4 | 674 | 57.0 | 576 | 369 | 24 | 2 | True | 3 | True | 8 | False | 8 |
| 2021-12-31 | 519 | 3 | 516 | 53.9 | 274 | 241 | 61 | 2 | True | 3 | True | 8 | False | 8 |
| 2022-03-31 | 748 | 4 | 744 | 51.0 | 320 | 132 | 58 | 2 | True | 3 | True | 10 | False | 10 |
| 2022-06-30 | 743 | 4 | 739 | 48.0 | 571 | 216 | 62 | 1 | True | 5 | True | 9 | False | 9 |
| 2022-09-30 | 810 | 7 | 803 | 45.0 | 684 | 526 | 65 | 0 | True | 6 | True | 8 | False | 8 |
| 2022-12-31 | 511 | 4 | 507 | 42.0 | 230 | 202 | 20 | 0 | True | 6 | True | 6 | False | 6 |
| 2023-03-31 | 877 | 8 | 869 | 39.0 | 335 | 77 | 42 | 0 | True | 7 | True | 8 | False | 8 |
| 2023-06-30 | 896 | 6 | 890 | 36.0 | 578 | 267 | 31 | 1 | True | 8 | False | 8 | False | 8 |
| 2023-09-30 | 964 | 6 | 958 | 33.0 | 855 | 560 | 31 | 1 | True | 8 | False | 8 | False | 8 |
| 2023-12-31 | 715 | 5 | 710 | 30.0 | 481 | 436 | 143 | 1 | True | 7 | False | 7 | False | 7 |

## Flujo de cohortes

| step | train | validation | test | score |
|---|---|---|---|---|
| employment_records | 5548.0 | 5548.0 | 5548.0 | 5548.0 |
| records_available_by_index | 437.0 | 437.0 | 437.0 | 5515.0 |
| records_effective_by_index | 437.0 | 437.0 | 437.0 | 5515.0 |
| records_available_and_effective_by_index | 437.0 | 437.0 | 437.0 | 5515.0 |
| known_spells | 437.0 | 437.0 | 437.0 | 5515.0 |
| active_people | 437.0 | 437.0 | 437.0 | 3558.0 |
| overlapping_spells | 0.0 | 0.0 | 0.0 | 0.0 |
| other_partition | 177.0 | 352.0 | 345.0 | 0.0 |
| prevalent_confirmed | 0.0 | 0.0 | 0.0 | 19.0 |
| baseline_uncertain | 0.0 | 0.0 | 0.0 | 0.0 |
| prevalent_confirmed_found_late | 0.0 | 0.0 | 0.0 | 0.0 |
| baseline_uncertain_found_late | 0.0 | 0.0 | 0.0 | 0.0 |
| no_observation | 0.0 | 0.0 | 0.0 | 0.0 |
| no_positive_followup | 0.0 | 0.0 | 0.0 | 0.0 |
| eligible | 260.0 | 85.0 | 92.0 | 3539.0 |
| events | 5.0 | 1.0 | 0.0 | nan |

## Factibilidad por horizonte

| stage | horizon_months | n_people | n_events_total | events_by_horizon | known_event_free | early_censored | max_followup_days | horizon_days | screen_status | reason |
|---|---|---|---|---|---|---|---|---|---|---|
| train | 12 | 260 | 5 | 0 | 200 | 60 | 1917.0 | 365.0 | insufficient_support | pocos eventos observados al horizonte |
| train | 36 | 260 | 5 | 2 | 158 | 100 | 1917.0 | 1096.0 | potentially_evaluable | nan |
| train | 60 | 260 | 5 | 5 | 140 | 115 | 1917.0 | 1826.0 | potentially_evaluable | nan |
| validation | 12 | 85 | 1 | 0 | 70 | 15 | 1917.0 | 365.0 | insufficient_support | pocos eventos observados al horizonte |
| validation | 36 | 85 | 1 | 0 | 51 | 34 | 1917.0 | 1096.0 | insufficient_support | pocos eventos observados al horizonte |
| validation | 60 | 85 | 1 | 1 | 48 | 36 | 1917.0 | 1826.0 | insufficient_support | pocos eventos observados al horizonte |
| test | 12 | 92 | 0 | 0 | 71 | 21 | 1917.0 | 365.0 | insufficient_support | pocos eventos observados al horizonte |
| test | 36 | 92 | 0 | 0 | 62 | 30 | 1917.0 | 1096.0 | insufficient_support | pocos eventos observados al horizonte |
| test | 60 | 92 | 0 | 0 | 55 | 37 | 1917.0 | 1826.0 | insufficient_support | pocos eventos observados al horizonte |

## Seguimiento observado

| stage | event | n | median_days | min_days | max_days |
|---|---|---|---|---|---|
| train | False | 255 | 1917.0 | 81.0 | 1917.0 |
| train | True | 5 | 1147.0 | 475.0 | 1555.0 |
| validation | False | 84 | 1917.0 | 248.0 | 1917.0 |
| validation | True | 1 | 1645.0 | 1645.0 | 1645.0 |
| test | False | 92 | 1917.0 | 200.0 | 1917.0 |

## Estados de desenlace al cierre

| state | events | people |
|---|---|---|
| confirmed | 56 | 54 |

## Resultado de modelos (`analisis/model_result.json`)

```json
{
  "status": "not_trained",
  "selected_model": null,
  "model_path": null,
  "metrics": [],
  "horizon_status": [
    {
      "stage": "validation",
      "horizon_months": 12,
      "status": "not_estimable",
      "reason": "pocos eventos observados al horizonte para evaluar discriminación; pocos eventos de entrenamiento al horizonte para estimar probabilidades",
      "horizon_days": 365.0,
      "n_people": 85,
      "events_by_horizon": 0,
      "at_risk_horizon": 70,
      "training_at_risk_horizon": 200,
      "training_events_by_horizon": 0,
      "censoring_survival_train": 0.7692307692307694
    },
    {
      "stage": "validation",
      "horizon_months": 36,
      "status": "not_estimable",
      "reason": "pocos eventos observados al horizonte para evaluar discriminación",
      "horizon_days": 1096.0,
      "n_people": 85,
      "events_by_horizon": 0,
      "at_risk_horizon": 51,
      "training_at_risk_horizon": 158,
      "training_events_by_horizon": 2,
      "censoring_survival_train": 0.6139253754775239
    },
    {
      "stage": "validation",
      "horizon_months": 60,
      "status": "not_estimable",
      "reason": "pocos eventos observados al horizonte para evaluar discriminación",
      "horizon_days": 1826.0,
      "n_people": 85,
      "events_by_horizon": 1,
      "at_risk_horizon": 48,
      "training_at_risk_horizon": 140,
      "training_events_by_horizon": 5,
      "censoring_survival_train": 0.5549972375822626
    }
  ],
  "validation_metrics": [],
  "paths": {
    "candidate_validation": "/tmp/claude-0/-home-user-APP-Agendamiento/a0122bb2-9092-5cf7-890f-1196c801245f/scratchpad/rehavid/asear_trabajo/ejecucion_20260916T211951Z_consolidados/resultado/analisis/tables/candidate_validation.csv",
    "candidate_status": "/tmp/claude-0/-home-user-APP-Agendamiento/a0122bb2-9092-5cf7-890f-1196c801245f/scratchpad/rehavid/asear_trabajo/ejecucion_20260916T211951Z_consolidados/resultado/analisis/tables/candidate_status.csv",
    "test_metrics": "/tmp/claude-0/-home-user-APP-Agendamiento/a0122bb2-9092-5cf7-890f-1196c801245f/scratchpad/rehavid/asear_trabajo/ejecucion_20260916T211951Z_consolidados/resultado/analisis/tables/test_metrics.csv",
    "calibration": "/tmp/claude-0/-home-user-APP-Agendamiento/a0122bb2-9092-5cf7-890f-1196c801245f/scratchpad/rehavid/asear_trabajo/ejecucion_20260916T211951Z_consolidados/resultado/analisis/tables/calibration.csv",
    "decision_curve": "/tmp/claude-0/-home-user-APP-Agendamiento/a0122bb2-9092-5cf7-890f-1196c801245f/scratchpad/rehavid/asear_trabajo/ejecucion_20260916T211951Z_consolidados/resultado/analisis/tables/decision_curve.csv",
    "horizon_status": "/tmp/claude-0/-home-user-APP-Agendamiento/a0122bb2-9092-5cf7-890f-1196c801245f/scratchpad/rehavid/asear_trabajo/ejecucion_20260916T211951Z_consolidados/resultado/analisis/tables/horizon_status.csv",
    "predictions": "/tmp/claude-0/-home-user-APP-Agendamiento/a0122bb2-9092-5cf7-890f-1196c801245f/scratchpad/rehavid/asear_trabajo/ejecucion_20260916T211951Z_consolidados/resultado/analisis/tables/predictions.csv",
    "group_predictions": "/tmp/claude-0/-home-user-APP-Agendamiento/a0122bb2-9092-5cf7-890f-1196c801245f/scratchpad/rehavid/asear_trabajo/ejecucion_20260916T211951Z_consolidados/resultado/analisis/tables/group_predictions.csv",
    "metadata": "/tmp/claude-0/-home-user-APP-Agendamiento/a0122bb2-9092-5cf7-890f-1196c801245f/scratchpad/rehavid/asear_trabajo/ejecucion_20260916T211951Z_consolidados/resultado/analisis/models/model_metadata.json"
  },
  "limitations": [
    "Probabilidades de investigación; no constituyen diagnóstico ni calificación de origen laboral.",
    "No hay certificación automática de utilidad clínica ni autorización automática para decisiones individuales.",
    "Los mínimos de personas/eventos son guardas de cálculo, no un cálculo de tamaño muestral.",
    "IPCW y Kaplan–Meier suponen censura no informativa; el método no corrige su incumplimiento.",
    "La distribución de censura del entrenamiento debe ser apropiada para evaluar periodos posteriores; revisar cambios de seguimiento.",
    "No se implementan riesgos competitivos: si muerte, retiro u otro evento impiden el desenlace, revisar el estimando antes de interpretar estas probabilidades como incidencia acumulada.",
    "La selección de Cox no verifica automáticamente su supuesto de riesgos proporcionales; no se incluyen diagnósticos de Schoenfeld.",
    "No se implementa recalibración posterior; los gráficos evalúan la calibración del modelo congelado.",
    "Los intervalos bootstrap del rendimiento son condicionales al modelo ajustado; no incluyen incertidumbre de entrenamiento.",
    "No se producen intervalos individuales ni intervalos para la suma de probabilidades.",
    "No se extrapola a horizontes sin seguimiento, soporte de entrenamiento y evaluación estimable en el diseño declarado.",
    "Una empresa se analiza por separado; este ajuste no demuestra transporte a otras empresas.",
    "No se estima el efecto causal de una intervención ni el riesgo biológico fuera de la vigilancia definida.",
    "Validación interna con personas independientes; no es validación temporal ni externa. No demuestra desempeño en fechas posteriores a la cohorte histórica."
  ],
  "warnings": [],
  "release_status": "research_only_requires_independent_review",
  "validation_design": "person_holdout",
  "validation_scope": "internal_independent_person_holdout",
  "reason": "Ningún horizonte tiene soporte en la validación reservada; no se elige el mejor por entrenamiento.",
  "candidate_status": [],
  "fit_completed": false,
  "selection_completed": false,
  "decision_analysis": {
    "configured_thresholds": [],
    "status": "not_evaluated"
  },
  "environment": {
    "python": "3.11.15",
    "numpy": "2.3.5",
    "pandas": "2.2.3",
    "scipy": "1.17.0",
    "scikit-learn": "1.8.0",
    "scikit-survival": "0.27.0",
    "joblib": "1.5.3"
  }
}

```

## Predicciones (agregado; el archivo individual queda en la carpeta de resultados)

Filas: 3539. Columnas: person_key, index_date, probabilidad_EL_12m, estado_12m, motivo_12m, probabilidad_EL_36m, estado_36m, motivo_36m, probabilidad_EL_60m, estado_60m, motivo_60m, validation_scope

Distribución de `motivo_12m`:

| motivo_12m | n |
|---|---|
| Ningún horizonte tiene soporte en la validación reservada; no se elige el mejor por entrenamiento. | 3539 |

Distribución de `motivo_36m`:

| motivo_36m | n |
|---|---|
| Ningún horizonte tiene soporte en la validación reservada; no se elige el mejor por entrenamiento. | 3539 |

Distribución de `motivo_60m`:

| motivo_60m | n |
|---|---|
| Ningún horizonte tiene soporte en la validación reservada; no se elige el mejor por entrenamiento. | 3539 |

`probabilidad_EL_12m`: n=0, media=nan, mediana=nan, p90=nan

`probabilidad_EL_36m`: n=0, media=nan, mediana=nan, p90=nan

`probabilidad_EL_60m`: n=0, media=nan, mediana=nan, p90=nan

## Informe generado por el motor (`analisis/informe.md`)

# Rehavid — modelo predictivo de enfermedad laboral

**Uso de investigación. Este informe no acredita validez clínica ni autoriza decisiones individuales.**

Análisis de las fuentes configuradas; la validez clínica requiere revisión independiente.

Empresa configurada: **ASEAR S.A.S. E.S.P.**. Evento configurado: **Primer evento de enfermedad laboral calificada como tal por la ARL (Calificacion DESC = SI ATEP, Causa Siniestro DESC = ENFERMEDAD LABORAL, Origen Siniestro DESC = PROPIO DEL TRABAJO) en trabajadores con vinculo laboral vigente en ASEAR S.A.S. E.S.P. en la fecha indice. Fecha del evento y de disponibilidad = fecha de calificacion (final_decision). Incluye todos los diagnosticos calificados (osteomusculares y COVID-19 U071/U072).**. Base temporal del evento: **final_decision**.

Cierre de datos: 2026-06-30. Estado de ejecución: **not_trained**. Modelo seleccionado: **No seleccionado**.

La salida, cuando es estimable, es la probabilidad del primer evento confirmado definido en la configuración, desde una fecha de predicción explícita y bajo los supuestos de seguimiento y censura del modelo. Una calificación registrada no equivale a la fecha biológica de inicio de la enfermedad. La sospecha, el reporte y la confirmación requieren estados distintos.

La predicción de un evento futuro en salud se denomina también pronóstico. La probabilidad estimada es la salida del modelo predictivo para cada horizonte: estos términos no representan algoritmos ni objetivos diferentes. Una predicción individual no permite afirmar con certeza quién enfermará.

## Diseño de validación y alcance

| Cohorte | fecha |
| --- | --- |
| Entrenamiento | 2021-03-31 |
| Validación | 2021-03-31 |
| Prueba | 2021-03-31 |
| Predicción actual | 2026-06-30 |

Se utiliza una fecha índice común y se reservan personas diferentes para entrenamiento, validación y prueba. Los predictores se limitan a la información disponible en esa fecha; el seguimiento posterior identifica eventos y censura. Los candidatos se ajustan con entrenamiento y se seleccionan con validación; el modelo permanece congelado en la prueba. Este diseño es una validación interna con reserva de personas independientes (`internal_independent_person_holdout`). No demuestra desempeño en un período posterior ni en otra empresa.

La separación por personas evita que un trabajador esté en más de un grupo de desarrollo/evaluación. Usar el mismo período de seguimiento puede aprovechar mejor la historia disponible, pero limita la evidencia de transporte a períodos futuros.

Diseño configurado: `person_holdout`. Horizontes solicitados (meses): [12, 36, 60].

Solicitar un horizonte no garantiza que pueda estimarse: se exige soporte en entrenamiento, validación y prueba. Los horizontes sin soporte deben tener probabilidad ausente y una razón explícita; nunca se completan mediante percentiles o copiando una probabilidad de otro horizonte.

## Pasos ejecutados y responsabilidades profesionales

| N.º | Paso | Responsables | Ejecución | Revisión profesional | Evidencia requerida |
| --- | --- | --- | --- | --- | --- |
| 1 | Preparar Python, instalar e importar bibliotecas | Científico de datos; MLOps | Ejecutado | Pendiente | Manifiesto con versiones instaladas y código identificado. |
| 2 | Definir enfermedad, primer evento, población y horizontes | Bioestadístico/epidemiólogo; médico laboral; producto y gobernanza | Pendiente de revisión profesional | Pendiente | Protocolo firmado: diagnóstico o calificación, fecha índice, desenlace y decisión de uso. |
| 3 | Inventariar archivos, hojas, esquemas y cobertura documentada | Ingeniero de datos | Ejecutado | Pendiente | Inventario por archivo/hoja y relación de fuentes faltantes. |
| 4 | Mapear columnas, estados clínicos, fechas y unidades | Ingeniero de datos; médico laboral; experto en exposición | Pendiente de revisión profesional | Pendiente | Diccionario y mapeos revisados con propietario de datos y especialistas. |
| 5 | Normalizar tipos y fechas; tratar duplicados y faltantes | Ingeniero de datos; científico de datos | Ejecutado | Pendiente | Informe de calidad con conteos antes/después y errores identificados. |
| 6 | Integrar identificadores, vínculos, reingresos y fuentes | Ingeniero de datos; producto y gobernanza | Ejecutado | Pendiente | Controles de enlace, empresa, claves y registros sin correspondencia. |
| 7 | Construir población en riesgo y seguimiento hasta evento o censura | Bioestadístico/epidemiólogo; médico laboral; científico de datos | Ejecutado | Pendiente | Flujo de inclusiones/exclusiones, eventos únicos y duración de seguimiento. |
| 8 | Crear predictores disponibles antes de la fecha índice | Científico de datos; experto en exposición; médico laboral | Ejecutado | Pendiente | Diccionario de variables, ventanas retrospectivas y disponibilidad/faltantes. |
| 9 | Separar entrenamiento, validación y prueba interna entre personas independientes | Bioestadístico/epidemiólogo; científico de datos | Ejecutado | Pendiente | Fecha índice común, partición reproducible por hash y ausencia de personas compartidas entre los tres grupos. |
| 10 | Ajustar preprocesamiento y modelos sólo en entrenamiento | Científico de datos; bioestadístico/epidemiólogo | Sin ejecutar | Pendiente | Modelos entrenados, parámetros y fallas de ajuste registradas. |
| 11 | Comparar modelos y seleccionar usando validación | Científico de datos; bioestadístico/epidemiólogo | Sin ejecutar | Pendiente | Comparación en horizontes comunes evaluables y regla de selección. |
| 12 | Evaluar discriminación, calibración e incertidumbre en prueba | Bioestadístico/epidemiólogo; revisor independiente; médico laboral | Sin ejecutar | Pendiente | Métricas, curvas y límites por horizonte; comparación con referencia. |
| 13 | Emitir predicciones por horizonte con soporte y trazabilidad | Científico de datos; médico laboral; producto y gobernanza | Sin ejecutar | Pendiente | Probabilidades y estados por horizonte; fecha índice, modelo y alcance. |
| 14 | Auditar de forma independiente el modelo y su aplicabilidad | Revisor independiente; bioestadístico/epidemiólogo; médico laboral | Pendiente de revisión profesional | Pendiente | Concepto independiente firmado sobre datos, código, sesgo y criterios de aceptación. |
| 15 | Definir despliegue, accesos, seguimiento y actualización | MLOps; producto y gobernanza; médico laboral | Pendiente de revisión profesional | Pendiente | Plan aprobado de uso, monitoreo, responsabilidades, seguridad y actualización. |

La ejecución automática y la revisión profesional se registran por separado. Que una etapa se haya ejecutado no significa que medicina laboral, epidemiología o el revisor independiente hayan firmado su revisión. La IA no acredita esas revisiones por completar una configuración.

## Inventario de fuentes

| Fuente | status | Filas | columns | sha256 |
| --- | --- | --- | --- | --- |
| employment | schema_read | — | 9 | d266bb24565f98e3684685bf2957a550f64e69268778f7b665069ce774a4d664 |
| outcomes | schema_read | — | 9 | 51e0f616411dc73dfbde7aa125a51ba085dc50d602a8135f32d52d3fe3ce098e |
| followup | schema_read | — | 11 | ee9d10f58f6fa50e28c628c6eea913fa85f9ae5e06644c3b57f942daf4dc2899 |
| health_events | schema_read | — | 11 | 6ae1d5537e9d78a5e42b6218b9d014d7237f018eb17db6ed704a1acb38bd94a3 |

## Calidad de los datos

| Fuente | Control | Recuento |
| --- | --- | --- |
| employment | rows_read | 5548 |
| employment | exact_duplicates_removed | 0 |
| employment | missing_company | 0 |
| employment | missing_person_id | 0 |
| employment | missing_spell_id | 0 |
| employment | missing_start_date | 0 |
| employment | missing_end_date | 3339 |
| employment | missing_recorded_at | 0 |
| employment | missing_job | 5548 |
| employment | missing_area | 5548 |
| employment | missing_site | 5548 |
| employment | normalized_exact_duplicates_removed | 0 |
| outcomes | rows_read | 56 |
| outcomes | exact_duplicates_removed | 0 |
| outcomes | missing_company | 0 |
| outcomes | missing_person_id | 0 |
| outcomes | missing_event_id | 0 |
| outcomes | missing_status | 0 |
| outcomes | missing_event_date | 0 |
| outcomes | missing_available_at | 0 |
| outcomes | normalized_exact_duplicates_removed | 0 |
| followup | rows_read | 5515 |
| followup | exact_duplicates_removed | 0 |
| followup | missing_company | 0 |
| followup | missing_person_id | 0 |
| followup | missing_obs_start | 0 |
| followup | missing_obs_end | 0 |
| followup | missing_verified_at | 0 |
| followup | normalized_exact_duplicates_removed | 0 |
| health_events | rows_read | 31321 |
| health_events | exact_duplicates_removed | 0 |
| health_events | missing_company | 0 |
| health_events | missing_person_id | 0 |
| health_events | missing_event_id | 0 |
| health_events | missing_event_date | 0 |
| health_events | missing_available_at | 0 |
| health_events | missing_source_kind | 0 |
| health_events | missing_days | <5 |
| health_events | missing_severity | 31321 |
| health_events | normalized_exact_duplicates_removed | 0 |
| outcomes | unlinked_people_to_employment | 35 |
| followup | unlinked_people_to_employment | 0 |
| health_events | unlinked_people_to_employment | 6639 |

![Calidad de los datos](figures/quality.png)

## Estados del evento

| Estado | Eventos observados | Personas |
| --- | --- | --- |
| Confirmado | 56 | 54 |

![Estados del evento](figures/event_status.png)

## Construcción de las cohortes

| Etapa | Paso | Recuento | index_date | label_cutoff |
| --- | --- | --- | --- | --- |
| Entrenamiento | employment_records | 5548 | 2021-03-31 | 2026-06-30 |
| Entrenamiento | records_available_by_index | 437 | 2021-03-31 | 2026-06-30 |
| Entrenamiento | records_effective_by_index | 437 | 2021-03-31 | 2026-06-30 |
| Entrenamiento | records_available_and_effective_by_index | 437 | 2021-03-31 | 2026-06-30 |
| Entrenamiento | known_spells | 437 | 2021-03-31 | 2026-06-30 |
| Entrenamiento | active_people | 437 | 2021-03-31 | 2026-06-30 |
| Entrenamiento | overlapping_spells | 0 | 2021-03-31 | 2026-06-30 |
| Entrenamiento | other_partition | 177 | 2021-03-31 | 2026-06-30 |
| Entrenamiento | prevalent_confirmed | 0 | 2021-03-31 | 2026-06-30 |
| Entrenamiento | baseline_uncertain | 0 | 2021-03-31 | 2026-06-30 |
| Entrenamiento | prevalent_confirmed_found_late | 0 | 2021-03-31 | 2026-06-30 |
| Entrenamiento | baseline_uncertain_found_late | 0 | 2021-03-31 | 2026-06-30 |
| Entrenamiento | no_observation | 0 | 2021-03-31 | 2026-06-30 |
| Entrenamiento | no_positive_followup | 0 | 2021-03-31 | 2026-06-30 |
| Entrenamiento | eligible | 260 | 2021-03-31 | 2026-06-30 |
| Entrenamiento | events | 5 | 2021-03-31 | 2026-06-30 |
| Validación | employment_records | 5548 | 2021-03-31 | 2026-06-30 |
| Validación | records_available_by_index | 437 | 2021-03-31 | 2026-06-30 |
| Validación | records_effective_by_index | 437 | 2021-03-31 | 2026-06-30 |
| Validación | records_available_and_effective_by_index | 437 | 2021-03-31 | 2026-06-30 |
| Validación | known_spells | 437 | 2021-03-31 | 2026-06-30 |
| Validación | active_people | 437 | 2021-03-31 | 2026-06-30 |
| Validación | overlapping_spells | 0 | 2021-03-31 | 2026-06-30 |
| Validación | other_partition | 352 | 2021-03-31 | 2026-06-30 |
| Validación | prevalent_confirmed | 0 | 2021-03-31 | 2026-06-30 |
| Validación | baseline_uncertain | 0 | 2021-03-31 | 2026-06-30 |
| Validación | prevalent_confirmed_found_late | 0 | 2021-03-31 | 2026-06-30 |
| Validación | baseline_uncertain_found_late | 0 | 2021-03-31 | 2026-06-30 |
| Validación | no_observation | 0 | 2021-03-31 | 2026-06-30 |
| Validación | no_positive_followup | 0 | 2021-03-31 | 2026-06-30 |
| Validación | eligible | 85 | 2021-03-31 | 2026-06-30 |
| Validación | events | <5 | 2021-03-31 | 2026-06-30 |
| Prueba | employment_records | 5548 | 2021-03-31 | 2026-06-30 |
| Prueba | records_available_by_index | 437 | 2021-03-31 | 2026-06-30 |
| Prueba | records_effective_by_index | 437 | 2021-03-31 | 2026-06-30 |
| Prueba | records_available_and_effective_by_index | 437 | 2021-03-31 | 2026-06-30 |
| Prueba | known_spells | 437 | 2021-03-31 | 2026-06-30 |
| Prueba | active_people | 437 | 2021-03-31 | 2026-06-30 |
| Prueba | overlapping_spells | 0 | 2021-03-31 | 2026-06-30 |
| Prueba | other_partition | 345 | 2021-03-31 | 2026-06-30 |
| Prueba | prevalent_confirmed | 0 | 2021-03-31 | 2026-06-30 |
| Prueba | baseline_uncertain | 0 | 2021-03-31 | 2026-06-30 |
| Prueba | prevalent_confirmed_found_late | 0 | 2021-03-31 | 2026-06-30 |
| Prueba | baseline_uncertain_found_late | 0 | 2021-03-31 | 2026-06-30 |
| Prueba | no_observation | 0 | 2021-03-31 | 2026-06-30 |
| Prueba | no_positive_followup | 0 | 2021-03-31 | 2026-06-30 |
| Prueba | eligible | 92 | 2021-03-31 | 2026-06-30 |
| Prueba | events | 0 | 2021-03-31 | 2026-06-30 |
| Predicción actual | employment_records | 5548 | 2026-06-30 | 2026-06-30 |
| Predicción actual | records_available_by_index | 5515 | 2026-06-30 | 2026-06-30 |
| Predicción actual | records_effective_by_index | 5515 | 2026-06-30 | 2026-06-30 |
| Predicción actual | records_available_and_effective_by_index | 5515 | 2026-06-30 | 2026-06-30 |
| Predicción actual | known_spells | 5515 | 2026-06-30 | 2026-06-30 |
| Predicción actual | active_people | 3558 | 2026-06-30 | 2026-06-30 |
| Predicción actual | overlapping_spells | 0 | 2026-06-30 | 2026-06-30 |
| Predicción actual | other_partition | 0 | 2026-06-30 | 2026-06-30 |
| Predicción actual | prevalent_confirmed | 19 | 2026-06-30 | 2026-06-30 |
| Predicción actual | baseline_uncertain | 0 | 2026-06-30 | 2026-06-30 |
| Predicción actual | prevalent_confirmed_found_late | 0 | 2026-06-30 | 2026-06-30 |
| Predicción actual | baseline_uncertain_found_late | 0 | 2026-06-30 | 2026-06-30 |

Se muestran 60 de 64 filas agregadas.

![Construcción de las cohortes](figures/cohort_flow.png)

## Seguimiento observable

| Etapa | event | Personas | Mediana de seguimiento (días) | min_days | max_days |
| --- | --- | --- | --- | --- | --- |
| Entrenamiento | False | 255 | 1917 | 81 | 1917 |
| Entrenamiento | True | 5 | 1147 | 475 | 1555 |
| Validación | False | 84 | 1917 | 248 | 1917 |
| Validación | True | <5 | Suprimido | Suprimido | Suprimido |
| Prueba | False | 92 | 1917 | 200 | 1917 |

![Seguimiento observable](figures/followup.png)

## Variables utilizadas

| feature | Fuente | definition |
| --- | --- | --- |
| tenure_years | employment | Antigüedad del vínculo vigente, sin sumar lagunas ni reingresos. |
| health_available_ausentismo_comun_3m | health_events | Cobertura de registros documentada en configuración: 1 completa / 0 no completa. |
| health_count_ausentismo_comun_3m | health_events | Número de registros de ausentismo_comun, ventana retrospectiva 3 meses, disponibles en t0; NaN si cobertura incompleta. |
| health_days_ausentismo_comun_3m | health_events | Días documentados de ausentismo_comun, ventana retrospectiva 3 meses, disponibles en t0; NaN si cobertura incompleta. |
| health_available_ausentismo_laboral_3m | health_events | Cobertura de registros documentada en configuración: 1 completa / 0 no completa. |
| health_count_ausentismo_laboral_3m | health_events | Número de registros de ausentismo_laboral, ventana retrospectiva 3 meses, disponibles en t0; NaN si cobertura incompleta. |
| health_days_ausentismo_laboral_3m | health_events | Días documentados de ausentismo_laboral, ventana retrospectiva 3 meses, disponibles en t0; NaN si cobertura incompleta. |
| health_available_at_3m | health_events | Cobertura de registros documentada en configuración: 1 completa / 0 no completa. |
| health_count_at_3m | health_events | Número de registros de at, ventana retrospectiva 3 meses, disponibles en t0; NaN si cobertura incompleta. |
| health_days_at_3m | health_events | Días documentados de at, ventana retrospectiva 3 meses, disponibles en t0; NaN si cobertura incompleta. |
| health_available_veo_3m | health_events | Cobertura de registros documentada en configuración: 1 completa / 0 no completa. |
| health_count_veo_3m | health_events | Número de registros de veo, ventana retrospectiva 3 meses, disponibles en t0; NaN si cobertura incompleta. |
| health_days_veo_3m | health_events | Días documentados de veo, ventana retrospectiva 3 meses, disponibles en t0; NaN si cobertura incompleta. |
| health_available_ausentismo_comun_6m | health_events | Cobertura de registros documentada en configuración: 1 completa / 0 no completa. |
| health_count_ausentismo_comun_6m | health_events | Número de registros de ausentismo_comun, ventana retrospectiva 6 meses, disponibles en t0; NaN si cobertura incompleta. |
| health_days_ausentismo_comun_6m | health_events | Días documentados de ausentismo_comun, ventana retrospectiva 6 meses, disponibles en t0; NaN si cobertura incompleta. |
| health_available_ausentismo_laboral_6m | health_events | Cobertura de registros documentada en configuración: 1 completa / 0 no completa. |
| health_count_ausentismo_laboral_6m | health_events | Número de registros de ausentismo_laboral, ventana retrospectiva 6 meses, disponibles en t0; NaN si cobertura incompleta. |
| health_days_ausentismo_laboral_6m | health_events | Días documentados de ausentismo_laboral, ventana retrospectiva 6 meses, disponibles en t0; NaN si cobertura incompleta. |
| health_available_at_6m | health_events | Cobertura de registros documentada en configuración: 1 completa / 0 no completa. |
| health_count_at_6m | health_events | Número de registros de at, ventana retrospectiva 6 meses, disponibles en t0; NaN si cobertura incompleta. |
| health_days_at_6m | health_events | Días documentados de at, ventana retrospectiva 6 meses, disponibles en t0; NaN si cobertura incompleta. |
| health_available_veo_6m | health_events | Cobertura de registros documentada en configuración: 1 completa / 0 no completa. |
| health_count_veo_6m | health_events | Número de registros de veo, ventana retrospectiva 6 meses, disponibles en t0; NaN si cobertura incompleta. |
| health_days_veo_6m | health_events | Días documentados de veo, ventana retrospectiva 6 meses, disponibles en t0; NaN si cobertura incompleta. |
| health_available_ausentismo_comun_12m | health_events | Cobertura de registros documentada en configuración: 1 completa / 0 no completa. |
| health_count_ausentismo_comun_12m | health_events | Número de registros de ausentismo_comun, ventana retrospectiva 12 meses, disponibles en t0; NaN si cobertura incompleta. |
| health_days_ausentismo_comun_12m | health_events | Días documentados de ausentismo_comun, ventana retrospectiva 12 meses, disponibles en t0; NaN si cobertura incompleta. |
| health_available_ausentismo_laboral_12m | health_events | Cobertura de registros documentada en configuración: 1 completa / 0 no completa. |
| health_count_ausentismo_laboral_12m | health_events | Número de registros de ausentismo_laboral, ventana retrospectiva 12 meses, disponibles en t0; NaN si cobertura incompleta. |
| health_days_ausentismo_laboral_12m | health_events | Días documentados de ausentismo_laboral, ventana retrospectiva 12 meses, disponibles en t0; NaN si cobertura incompleta. |
| health_available_at_12m | health_events | Cobertura de registros documentada en configuración: 1 completa / 0 no completa. |
| health_count_at_12m | health_events | Número de registros de at, ventana retrospectiva 12 meses, disponibles en t0; NaN si cobertura incompleta. |
| health_days_at_12m | health_events | Días documentados de at, ventana retrospectiva 12 meses, disponibles en t0; NaN si cobertura incompleta. |
| health_available_veo_12m | health_events | Cobertura de registros documentada en configuración: 1 completa / 0 no completa. |
| health_count_veo_12m | health_events | Número de registros de veo, ventana retrospectiva 12 meses, disponibles en t0; NaN si cobertura incompleta. |
| health_days_veo_12m | health_events | Días documentados de veo, ventana retrospectiva 12 meses, disponibles en t0; NaN si cobertura incompleta. |

## Factibilidad de evaluación por horizonte

| Etapa | Horizonte (meses) | Personas | Eventos en todo el seguimiento | Eventos hasta el horizonte | Sin evento y con seguimiento hasta el horizonte | Censura antes del horizonte | Seguimiento máximo (días) | Horizonte (días) | Estado del soporte | Razón |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Entrenamiento | 12 | 260 | 5 | 0 | 200 | 60 | 1917 | 365 | Soporte insuficiente | pocos eventos observados al horizonte |
| Entrenamiento | 36 | 260 | 5 | <5 | 158 | 100 | 1917 | 1096 | Potencialmente evaluable |  |
| Entrenamiento | 60 | 260 | 5 | 5 | 140 | 115 | 1917 | 1826 | Potencialmente evaluable |  |
| Validación | 12 | 85 | <5 | 0 | 70 | 15 | 1917 | 365 | Soporte insuficiente | pocos eventos observados al horizonte |
| Validación | 36 | 85 | <5 | 0 | 51 | 34 | 1917 | 1096 | Soporte insuficiente | pocos eventos observados al horizonte |
| Validación | 60 | 85 | <5 | <5 | 48 | 36 | 1917 | 1826 | Soporte insuficiente | pocos eventos observados al horizonte |
| Prueba | 12 | 92 | 0 | 0 | 71 | 21 | 1917 | 365 | Soporte insuficiente | pocos eventos observados al horizonte |
| Prueba | 36 | 92 | 0 | 0 | 62 | 30 | 1917 | 1096 | Soporte insuficiente | pocos eventos observados al horizonte |
| Prueba | 60 | 92 | 0 | 0 | 55 | 37 | 1917 | 1826 | Soporte insuficiente | pocos eventos observados al horizonte |

Esta comprobación describe personas, eventos y seguimiento disponibles antes del entrenamiento. «Potencialmente evaluable» no significa modelo entrenado, calibrado ni validado; la evaluación posterior puede detectar limitaciones adicionales. Las personas censuradas antes del horizonte no se cuentan como negativos definitivos.

## Incidencias de ejecución

| severity | code | Recuento | explanation |
| --- | --- | --- | --- |
| warning | outcomes_unlinked_people | 35 | Hay personas sin enlace con el historial laboral. Verifique ex empleados y equivalencias de identificadores antes de interpretar ausencia de eventos. |
| warning | health_events_unlinked_people | 6639 | Hay personas sin enlace con el historial laboral. Verifique ex empleados y equivalencias de identificadores antes de interpretar ausencia de eventos. |
| limitation | observed_endpoint_and_censoring | <5 | Riesgo de evento registrado bajo vigilancia. La censura por salida o sospecha puede ser informativa: requiere revisión y análisis de sensibilidad. |
| limitation | historical_negative_status | <5 | La ausencia de EL previa sólo es defendible dentro de la historia verificada disponible; documente el período retrospectivo y la posible enfermedad no registrada. |
| limitation | late_baseline_adjudication | <5 |  |
| limitation | internal_person_holdout_not_temporal | <5 |  |

Los detalles técnicos se consultan localmente. Sólo se incluyen explicaciones declaradas seguras; no se publican excepciones libres ni identificadores personales.

## Soporte por horizonte

| Etapa | Horizonte (meses) | status | Razón | Horizonte (días) | Personas | Eventos hasta el horizonte | at_risk_horizon | training_at_risk_horizon | training_events_by_horizon | censoring_survival_train |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Validación | 12 | not_estimable | pocos eventos observados al horizonte para evaluar discriminación; pocos eventos de entrenamiento al horizonte para estimar probabilidades | 365 | 85 | 0 | 70 | 200 | 0 | 0.7692 |
| Validación | 36 | not_estimable | pocos eventos observados al horizonte para evaluar discriminación | 1096 | 85 | 0 | 51 | 158 | 2 | 0.6139 |
| Validación | 60 | not_estimable | pocos eventos observados al horizonte para evaluar discriminación | 1826 | 85 | <5 | 48 | 140 | 5 | 0.555 |

![Comparación de candidatos](figures/model_comparison.png)

![Calibración](figures/calibration.png)

![Rendimiento por horizonte](figures/performance_by_horizon.png)

![Curvas de riesgo](figures/risk_curves.png)

## Limitaciones registradas

- Probabilidades de investigación; no constituyen diagnóstico ni calificación de origen laboral.
- No hay certificación automática de utilidad clínica ni autorización automática para decisiones individuales.
- Los mínimos de personas/eventos son guardas de cálculo, no un cálculo de tamaño muestral.
- IPCW y Kaplan–Meier suponen censura no informativa; el método no corrige su incumplimiento.
- La distribución de censura del entrenamiento debe ser apropiada para evaluar periodos posteriores; revisar cambios de seguimiento.
- No se implementan riesgos competitivos: si muerte, retiro u otro evento impiden el desenlace, revisar el estimando antes de interpretar estas probabilidades como incidencia acumulada.
- La selección de Cox no verifica automáticamente su supuesto de riesgos proporcionales; no se incluyen diagnósticos de Schoenfeld.
- No se implementa recalibración posterior; los gráficos evalúan la calibración del modelo congelado.
- Los intervalos bootstrap del rendimiento son condicionales al modelo ajustado; no incluyen incertidumbre de entrenamiento.
- No se producen intervalos individuales ni intervalos para la suma de probabilidades.
- No se extrapola a horizontes sin seguimiento, soporte de entrenamiento y evaluación estimable en el diseño declarado.
- Una empresa se analiza por separado; este ajuste no demuestra transporte a otras empresas.
- No se estima el efecto causal de una intervención ni el riesgo biológico fuera de la vigilancia definida.
- Validación interna con personas independientes; no es validación temporal ni externa. No demuestra desempeño en fechas posteriores a la cohorte histórica.

## Interpretación y condiciones de uso

- AUC temporal evalúa discriminación. Brier evalúa error de probabilidades y se compara con una referencia Kaplan–Meier ajustada en entrenamiento. La curva de calibración compara riesgo predicho y observado teniendo en cuenta censura cuando el seguimiento lo permite.
- Evaluar calibración no significa haber aplicado recalibración posterior. Esta versión no implementa un ajuste de calibración posterior al entrenamiento. El intercepto y la pendiente, cuando se estiman conjuntamente, son diagnósticos y no corrigen las probabilidades exportadas.
- Los intervalos de rendimiento obtenidos por bootstrap, cuando existen, son condicionales al modelo ya ajustado. No son intervalos individuales de riesgo ni incorporan toda la incertidumbre del desarrollo.
- Las estimaciones con censura dependen de supuestos sobre seguimiento y registro. La pérdida de seguimiento relacionada con enfermedad puede producir sesgo; la salida no corrige automáticamente ese problema. IPCW requiere que la distribución de censura del entrenamiento sea apropiada para evaluar la cohorte reservada.
- Se implementa supervivencia con censura a la derecha, no incidencia acumulada con riesgos competitivos. Si muerte, retiro u otro suceso impiden el desenlace, se requiere revisar el objetivo y ampliar el método. La suma de probabilidades no es automáticamente un presupuesto de casos en una empresa con rotación.
- Los candidatos usan parámetros declarados; no se realiza búsqueda anidada de hiperparámetros. El supuesto de riesgos proporcionales de Cox no se diagnostica automáticamente.
- Las filas de predicción con claves seudónimas siguen siendo datos sensibles. Las tablas agregadas y la supresión simple de celdas pequeñas tampoco acreditan anonimización formal.
- Este informe suprime recuentos positivos menores de 5. Un dato ausente o una celda suprimida no representa ausencia de enfermedad.
- No se estima automáticamente el efecto de una intervención ni la causa laboral de una enfermedad. No hay umbral universal de riesgo alto. Los criterios de aceptación y las acciones se definen antes de revisar resultados de prueba y requieren responsables clínicos y metodológicos.

## Referencias metodológicas

- [TRIPOD+AI: lista de verificación](https://www.tripod-statement.org/wp-content/uploads/2019/12/TRIPODAI_checklist.pdf).
- [PROBAST+AI: calidad, sesgo y aplicabilidad](https://www.probast.org/).
- [scikit-learn: evitar fuga de información](https://scikit-learn.org/stable/common_pitfalls.html#data-leakage).
- [scikit-survival: Brier con censura](https://scikit-survival.readthedocs.io/en/stable/api/generated/sksurv.metrics.brier_score.html).
- [scikit-survival: AUC temporal](https://scikit-survival.readthedocs.io/en/stable/api/generated/sksurv.metrics.cumulative_dynamic_auc.html).


## Declaraciones del operador incorporadas

- D1. contract_availability.documented_contract_start: la fecha de inicio de contrato de la base de rotacion puede usarse como fecha de disponibilidad del vinculo (solo tenure_years).
- D2. followup_derivation.employment_intersect_registry: el registro de siniestros de la ARL observa a toda la poblacion con contrato vigente en ASEAR durante 2020-01-01 a 2026-06-30, y la extraccion entregada refleja el estado del registro al 2026-06-30 (ajustar coverage.end/verified_at/as_of si la extraccion tiene otra fecha de corte).
- D3. Definicion del desenlace: primer evento EL calificado por la ARL, fecha = fecha de calificacion, incluyendo COVID-19 calificado como EL. La alternativa (fecha de diagnostico, verified_diagnosis) se corre como sensibilidad.

Estas salidas describen software y datos; no certifican validez clínica, utilidad ni revisión profesional independiente (ver docs/RESPONSABILIDADES.md del motor).
