# Rehavid V5 · ASEAR S.A.S. E.S.P. · resumen de la ejecución

Carpeta de ejecución: `/tmp/claude-0/-home-user-APP-Agendamiento/a0122bb2-9092-5cf7-890f-1196c801245f/scratchpad/rehavid/asear_trabajo/ejecucion_20260916T215848Z_consolidados_no_covid`  
Fecha (UTC): 2026-09-16T22:02:29+00:00  
Diseño de vínculos: consolidados (consolidados = B principal; contratos = A sensibilidad)  
Disponibilidad de antecedentes: inicial  
Sensibilidad: no_covid  
Declaraciones D1–D3: **NO RATIFICADA · ejecución exploratoria de factibilidad; resultados no publicables**  
Desviaciones del protocolo predeclarado: {"valores": {}, "enmienda": ""}  
Huellas SHA-256 de los archivos versionados: `{"ejecutar_asear.py": "0a311391dcd0f0f4", "derivar_fuentes.py": "dcf34c9cb37fde38", "verificar_bases.py": "7465198b54f944a8", "utilidades.py": "591439a328dbabca", "decisiones_mapeo_asear.json": "8d0567f43b2ef7b4", "Rehavid_EL_V5_Codigo_Legible.py": "33db138c3f67a409"}`

Los conteos menores que 5 se publican como `<5` (regla min_cell_count del motor).

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
  "clinical_validation": "not_established",
  "report_failure": null
}
```

Cohortes:

| etapa | people | events |
|---|---|---|
| train | 260 | 5 |
| validation | 85 | <5 |
| test | 92 | 0 |
| score | 3538 |  |

### Hallazgos reportados por el motor

- Ningún horizonte tiene soporte en la validación reservada; no se elige el mejor por entrenamiento.
- Revise el motivo y el soporte de entrenamiento/validación por horizonte; no se concluye inviabilidad de toda la empresa.

## Verificaciones previas (agregados)

Cruces: `{"personas_con_el": 54, "personas_con_el_en_rotacion": 19, "personas_con_el_sin_vinculo_en_rotacion": 35, "de_las_sin_vinculo_en_personal": 0, "de_las_sin_vinculo_en_ausentismo": 19, "personas_con_el_en_rotacion_por_anio_de_calificacion": {"2017": {"con_vinculo": "<5", "sin_vinculo": "<5"}, "2018": {"con_vinculo": "<5", "sin_vinculo": "<5"}, "2019": {"con_vinculo": "<5", "sin_vinculo": "<5"}, "2020": {"con_vinculo": "<5", "sin_vinculo": 17}, "2021": {"con_vinculo": "<5", "sin_vinculo": 8}, "2022": {"con_vinculo": "<5", "sin_vinculo": "<5"}, "2024": {"con_vinculo": "<5", "sin_vinculo": "<5"}, "2025": {"con_vinculo": 6, "sin_vinculo": "<5"}, "2026": {"con_vinculo": "<5", "sin_vinculo": "<5"}}}`

### Soporte por fecha índice candidata (cribado previo)

Cribado con vínculos 'consolidados': personas con vínculo vigente en t0, no prevalentes; eventos = calificaciones posteriores a t0 y anteriores al fin del vínculo vigente (o al fin de cobertura). No aplica la partición 60/20/20 ni las exclusiones por estado pendiente del motor; es una cota superior aproximada del soporte que el motor encontrará.

| t0 | activos | prevalentes_excluidos | elegibles | meses_seguimiento_hasta_cierre | mediana_dias_seguimiento_elegibles | elegibles_con_vinculo_desde_3m_antes | elegibles_con_vinculo_desde_6m_antes | elegibles_con_vinculo_desde_12m_antes | eventos_a_12m | horizonte_12m_dentro_de_cobertura | eventos_a_36m | horizonte_36m_dentro_de_cobertura | eventos_a_60m | horizonte_60m_dentro_de_cobertura | eventos_totales_observables |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| 2020-12-31 | 258 | 0 | 258 | 65.9 | 2007 | 75 | 48 | 10 | 0 | True | <5 | True | <5 | True | <5 |
| 2021-03-31 | 437 | 0 | 437 | 63 | 1917 | 258 | 75 | 11 | 0 | True | <5 | True | 6 | True | 6 |
| 2021-06-30 | 649 | <5 | 645 | 60 | 1826 | 436 | 257 | 47 | 0 | True | <5 | True | 7 | False | 7 |
| 2021-09-30 | 679 | <5 | 675 | 57 | 1734 | 642 | 434 | 73 | <5 | True | <5 | True | 7 | False | 7 |
| 2021-12-31 | 561 | <5 | 557 | 53.9 | 1642 | 523 | 500 | 219 | <5 | True | <5 | True | 7 | False | 7 |
| 2022-03-31 | 757 | 5 | 752 | 51 | 1552 | 543 | 509 | 341 | <5 | True | <5 | True | 9 | False | 9 |
| 2022-06-30 | 761 | <5 | 757 | 48 | 1461 | 704 | 532 | 478 | <5 | True | 5 | True | 9 | False | 9 |
| 2022-09-30 | 831 | 7 | 824 | 45 | 1369 | 731 | 683 | 489 | 0 | True | 5 | True | 7 | False | 7 |
| 2022-12-31 | 662 | 7 | 655 | 42 | 1277 | 605 | 564 | 469 | 0 | True | 6 | True | 7 | False | 7 |
| 2023-03-31 | 883 | 8 | 875 | 39 | 1187 | 640 | 592 | 510 | 0 | True | 6 | True | 7 | False | 7 |
| 2023-06-30 | 901 | 6 | 895 | 36 | 1096 | 805 | 622 | 539 | <5 | True | 7 | False | 7 | False | 7 |
| 2023-09-30 | 981 | 6 | 975 | 33 | 1004 | 889 | 801 | 576 | <5 | True | 7 | False | 7 | False | 7 |
| 2023-12-31 | 893 | 7 | 886 | 30 | 912 | 810 | 755 | 591 | <5 | True | 8 | False | 8 | False | 8 |

## Flujo de cohortes

| step | train | validation | test | score |
|---|---|---|---|---|
| employment_records | 5549 | 5549 | 5549 | 5549 |
| records_available_by_index | 437 | 437 | 437 | 5516 |
| records_effective_by_index | 437 | 437 | 437 | 5516 |
| records_available_and_effective_by_index | 437 | 437 | 437 | 5516 |
| known_spells | 437 | 437 | 437 | 5516 |
| active_people | 437 | 437 | 437 | 3555 |
| overlapping_spells | 0 | 0 | 0 | 0 |
| other_partition | 177 | 352 | 345 | 0 |
| prevalent_confirmed | 0 | 0 | 0 | 17 |
| baseline_uncertain | 0 | 0 | 0 | 0 |
| prevalent_confirmed_found_late | 0 | 0 | 0 | 0 |
| baseline_uncertain_found_late | 0 | 0 | 0 | 0 |
| no_observation | 0 | 0 | 0 | 0 |
| no_positive_followup | 0 | 0 | 0 | 0 |
| eligible | 260 | 85 | 92 | 3538 |
| events | 5 | <5 | 0 |  |

## Factibilidad por horizonte

| stage | horizon_months | n_people | n_events_total | events_by_horizon | known_event_free | early_censored | max_followup_days | horizon_days | screen_status | reason |
|---|---|---|---|---|---|---|---|---|---|---|
| train | 12 | 260 | 5 | 0 | 200 | 60 | 1917 | 365 | insufficient_support | pocos eventos observados al horizonte |
| train | 36 | 260 | 5 | <5 | 158 | 100 | 1917 | 1096 | potentially_evaluable |  |
| train | 60 | 260 | 5 | 5 | 140 | 115 | 1917 | 1826 | potentially_evaluable |  |
| validation | 12 | 85 | <5 | 0 | 70 | 15 | 1917 | 365 | insufficient_support | pocos eventos observados al horizonte |
| validation | 36 | 85 | <5 | 0 | 51 | 34 | 1917 | 1096 | insufficient_support | pocos eventos observados al horizonte |
| validation | 60 | 85 | <5 | <5 | 48 | 36 | 1917 | 1826 | insufficient_support | pocos eventos observados al horizonte |
| test | 12 | 92 | 0 | 0 | 71 | 21 | 1917 | 365 | insufficient_support | pocos eventos observados al horizonte |
| test | 36 | 92 | 0 | 0 | 62 | 30 | 1917 | 1096 | insufficient_support | pocos eventos observados al horizonte |
| test | 60 | 92 | 0 | 0 | 54 | 38 | 1917 | 1826 | insufficient_support | pocos eventos observados al horizonte |

## Estado por horizonte (validación)

| stage | horizon_months | status | reason | horizon_days | n_people | events_by_horizon | at_risk_horizon | training_at_risk_horizon | training_events_by_horizon | censoring_survival_train |
|---|---|---|---|---|---|---|---|---|---|---|
| validation | 12 | not_estimable | pocos eventos observados al horizonte para evaluar discriminación; pocos eventos de entrenamiento al horizonte para estimar probabilidades | 365 | 85 | 0 | 70 | 200 | 0 | 0.7692307692307694 |
| validation | 36 | not_estimable | pocos eventos observados al horizonte para evaluar discriminación | 1096 | 85 | 0 | 51 | 158 | <5 | 0.6139253754775239 |
| validation | 60 | not_estimable | pocos eventos observados al horizonte para evaluar discriminación | 1826 | 85 | <5 | 48 | 140 | 5 | 0.5549972375822626 |

## Seguimiento observado

| stage | event | n | median_days | min_days | max_days |
|---|---|---|---|---|---|
| train | False | 255 | 1917 | 81 | 1917 |
| train | True | 5 | 1147 | 475 | 1555 |
| validation | False | 84 | 1917 | 248 | 1917 |
| validation | True | <5 | suprimido | suprimido | suprimido |
| test | False | 92 | 1917 | 200 | 1917 |

## Estados de desenlace al cierre

| state | events | people |
|---|---|---|
| confirmed | 32 | 31 |

## Faltantes por predictor

| stage | feature | n_people | n_missing | missing_pct |
|---|---|---|---|---|
| train | tenure_years | 260 | 0 | 0 |
| train | health_available_ausentismo_comun_3m | 260 | 0 | 0 |
| train | health_count_ausentismo_comun_3m | 260 | 105 | 40.38461538461539 |
| train | health_days_ausentismo_comun_3m | 260 | 105 | 40.38461538461539 |
| train | health_available_ausentismo_laboral_3m | 260 | 0 | 0 |
| train | health_count_ausentismo_laboral_3m | 260 | 105 | 40.38461538461539 |
| train | health_days_ausentismo_laboral_3m | 260 | 105 | 40.38461538461539 |
| train | health_available_at_3m | 260 | 0 | 0 |
| train | health_count_at_3m | 260 | 260 | 100 |
| train | health_days_at_3m | 260 | 260 | 100 |
| train | health_available_veo_3m | 260 | 0 | 0 |
| train | health_count_veo_3m | 260 | 260 | 100 |
| train | health_days_veo_3m | 260 | 260 | 100 |
| train | health_available_ausentismo_comun_6m | 260 | 0 | 0 |
| train | health_count_ausentismo_comun_6m | 260 | 218 | 83.84615384615385 |
| train | health_days_ausentismo_comun_6m | 260 | 218 | 83.84615384615385 |
| train | health_available_ausentismo_laboral_6m | 260 | 0 | 0 |
| train | health_count_ausentismo_laboral_6m | 260 | 218 | 83.84615384615385 |
| train | health_days_ausentismo_laboral_6m | 260 | 218 | 83.84615384615385 |
| train | health_available_at_6m | 260 | 0 | 0 |
| train | health_count_at_6m | 260 | 260 | 100 |
| train | health_days_at_6m | 260 | 260 | 100 |
| train | health_available_veo_6m | 260 | 0 | 0 |
| train | health_count_veo_6m | 260 | 260 | 100 |
| train | health_days_veo_6m | 260 | 260 | 100 |
| train | health_available_ausentismo_comun_12m | 260 | 0 | 0 |
| train | health_count_ausentismo_comun_12m | 260 | 253 | 97.3076923076923 |
| train | health_days_ausentismo_comun_12m | 260 | 253 | 97.3076923076923 |
| train | health_available_ausentismo_laboral_12m | 260 | 0 | 0 |
| train | health_count_ausentismo_laboral_12m | 260 | 253 | 97.3076923076923 |
| train | health_days_ausentismo_laboral_12m | 260 | 253 | 97.3076923076923 |
| train | health_available_at_12m | 260 | 0 | 0 |
| train | health_count_at_12m | 260 | 260 | 100 |
| train | health_days_at_12m | 260 | 260 | 100 |
| train | health_available_veo_12m | 260 | 0 | 0 |
| train | health_count_veo_12m | 260 | 260 | 100 |
| train | health_days_veo_12m | 260 | 260 | 100 |
| validation | tenure_years | 85 | 0 | 0 |
| validation | health_available_ausentismo_comun_3m | 85 | 0 | 0 |
| validation | health_count_ausentismo_comun_3m | 85 | 32 | 37.64705882352941 |
| validation | health_days_ausentismo_comun_3m | 85 | 32 | 37.64705882352941 |
| validation | health_available_ausentismo_laboral_3m | 85 | 0 | 0 |
| validation | health_count_ausentismo_laboral_3m | 85 | 32 | 37.64705882352941 |
| validation | health_days_ausentismo_laboral_3m | 85 | 32 | 37.64705882352941 |
| validation | health_available_at_3m | 85 | 0 | 0 |
| validation | health_count_at_3m | 85 | 85 | 100 |
| validation | health_days_at_3m | 85 | 85 | 100 |
| validation | health_available_veo_3m | 85 | 0 | 0 |
| validation | health_count_veo_3m | 85 | 85 | 100 |
| validation | health_days_veo_3m | 85 | 85 | 100 |
| validation | health_available_ausentismo_comun_6m | 85 | 0 | 0 |
| validation | health_count_ausentismo_comun_6m | 85 | 69 | 81.17647058823529 |
| validation | health_days_ausentismo_comun_6m | 85 | 69 | 81.17647058823529 |
| validation | health_available_ausentismo_laboral_6m | 85 | 0 | 0 |
| validation | health_count_ausentismo_laboral_6m | 85 | 69 | 81.17647058823529 |
| validation | health_days_ausentismo_laboral_6m | 85 | 69 | 81.17647058823529 |
| validation | health_available_at_6m | 85 | 0 | 0 |
| validation | health_count_at_6m | 85 | 85 | 100 |
| validation | health_days_at_6m | 85 | 85 | 100 |
| validation | health_available_veo_6m | 85 | 0 | 0 |
| validation | health_count_veo_6m | 85 | 85 | 100 |
| validation | health_days_veo_6m | 85 | 85 | 100 |
| validation | health_available_ausentismo_comun_12m | 85 | 0 | 0 |
| validation | health_count_ausentismo_comun_12m | 85 | 83 | 97.6470588235294 |
| validation | health_days_ausentismo_comun_12m | 85 | 83 | 97.6470588235294 |
| validation | health_available_ausentismo_laboral_12m | 85 | 0 | 0 |
| validation | health_count_ausentismo_laboral_12m | 85 | 83 | 97.6470588235294 |
| validation | health_days_ausentismo_laboral_12m | 85 | 83 | 97.6470588235294 |
| validation | health_available_at_12m | 85 | 0 | 0 |
| validation | health_count_at_12m | 85 | 85 | 100 |
| validation | health_days_at_12m | 85 | 85 | 100 |
| validation | health_available_veo_12m | 85 | 0 | 0 |
| validation | health_count_veo_12m | 85 | 85 | 100 |
| validation | health_days_veo_12m | 85 | 85 | 100 |
| test | tenure_years | 92 | 0 | 0 |
| test | health_available_ausentismo_comun_3m | 92 | 0 | 0 |
| test | health_count_ausentismo_comun_3m | 92 | 42 | 45.65217391304348 |
| test | health_days_ausentismo_comun_3m | 92 | 42 | 45.65217391304348 |
| test | health_available_ausentismo_laboral_3m | 92 | 0 | 0 |
| test | health_count_ausentismo_laboral_3m | 92 | 42 | 45.65217391304348 |
| test | health_days_ausentismo_laboral_3m | 92 | 42 | 45.65217391304348 |
| test | health_available_at_3m | 92 | 0 | 0 |
| test | health_count_at_3m | 92 | 92 | 100 |
| test | health_days_at_3m | 92 | 92 | 100 |
| test | health_available_veo_3m | 92 | 0 | 0 |
| test | health_count_veo_3m | 92 | 92 | 100 |
| test | health_days_veo_3m | 92 | 92 | 100 |
| test | health_available_ausentismo_comun_6m | 92 | 0 | 0 |
| test | health_count_ausentismo_comun_6m | 92 | 75 | 81.52173913043478 |
| test | health_days_ausentismo_comun_6m | 92 | 75 | 81.52173913043478 |
| test | health_available_ausentismo_laboral_6m | 92 | 0 | 0 |
| test | health_count_ausentismo_laboral_6m | 92 | 75 | 81.52173913043478 |
| test | health_days_ausentismo_laboral_6m | 92 | 75 | 81.52173913043478 |
| test | health_available_at_6m | 92 | 0 | 0 |
| test | health_count_at_6m | 92 | 92 | 100 |
| test | health_days_at_6m | 92 | 92 | 100 |
| test | health_available_veo_6m | 92 | 0 | 0 |
| test | health_count_veo_6m | 92 | 92 | 100 |
| test | health_days_veo_6m | 92 | 92 | 100 |
| test | health_available_ausentismo_comun_12m | 92 | 0 | 0 |
| test | health_count_ausentismo_comun_12m | 92 | 90 | 97.82608695652172 |
| test | health_days_ausentismo_comun_12m | 92 | 90 | 97.82608695652172 |
| test | health_available_ausentismo_laboral_12m | 92 | 0 | 0 |
| test | health_count_ausentismo_laboral_12m | 92 | 90 | 97.82608695652172 |
| test | health_days_ausentismo_laboral_12m | 92 | 90 | 97.82608695652172 |
| test | health_available_at_12m | 92 | 0 | 0 |
| test | health_count_at_12m | 92 | 92 | 100 |
| test | health_days_at_12m | 92 | 92 | 100 |
| test | health_available_veo_12m | 92 | 0 | 0 |
| test | health_count_veo_12m | 92 | 92 | 100 |
| test | health_days_veo_12m | 92 | 92 | 100 |
| score | tenure_years | 3538 | 0 | 0 |
| score | health_available_ausentismo_comun_3m | 3538 | 0 | 0 |
| score | health_count_ausentismo_comun_3m | 3538 | 257 | 7.263990955342001 |
| score | health_days_ausentismo_comun_3m | 3538 | 257 | 7.263990955342001 |
| score | health_available_ausentismo_laboral_3m | 3538 | 0 | 0 |
| score | health_count_ausentismo_laboral_3m | 3538 | 257 | 7.263990955342001 |
| score | health_days_ausentismo_laboral_3m | 3538 | 257 | 7.263990955342001 |
| score | health_available_at_3m | 3538 | 0 | 0 |
| score | health_count_at_3m | 3538 | 3538 | 100 |
| score | health_days_at_3m | 3538 | 3538 | 100 |
| score | health_available_veo_3m | 3538 | 0 | 0 |
| score | health_count_veo_3m | 3538 | 3538 | 100 |
| score | health_days_veo_3m | 3538 | 3538 | 100 |
| score | health_available_ausentismo_comun_6m | 3538 | 0 | 0 |
| score | health_count_ausentismo_comun_6m | 3538 | 1244 | 35.16110797060486 |
| score | health_days_ausentismo_comun_6m | 3538 | 1244 | 35.16110797060486 |
| score | health_available_ausentismo_laboral_6m | 3538 | 0 | 0 |
| score | health_count_ausentismo_laboral_6m | 3538 | 1244 | 35.16110797060486 |
| score | health_days_ausentismo_laboral_6m | 3538 | 1244 | 35.16110797060486 |
| score | health_available_at_6m | 3538 | 0 | 0 |
| score | health_count_at_6m | 3538 | 3538 | 100 |
| score | health_days_at_6m | 3538 | 3538 | 100 |
| score | health_available_veo_6m | 3538 | 0 | 0 |
| score | health_count_veo_6m | 3538 | 3538 | 100 |
| score | health_days_veo_6m | 3538 | 3538 | 100 |
| score | health_available_ausentismo_comun_12m | 3538 | 0 | 0 |
| score | health_count_ausentismo_comun_12m | 3538 | 1875 | 52.996042962125486 |
| score | health_days_ausentismo_comun_12m | 3538 | 1875 | 52.996042962125486 |
| score | health_available_ausentismo_laboral_12m | 3538 | 0 | 0 |
| score | health_count_ausentismo_laboral_12m | 3538 | 1875 | 52.996042962125486 |
| score | health_days_ausentismo_laboral_12m | 3538 | 1875 | 52.996042962125486 |
| score | health_available_at_12m | 3538 | 0 | 0 |
| score | health_count_at_12m | 3538 | 3538 | 100 |
| score | health_days_at_12m | 3538 | 3538 | 100 |
| score | health_available_veo_12m | 3538 | 0 | 0 |
| score | health_count_veo_12m | 3538 | 3538 | 100 |
| score | health_days_veo_12m | 3538 | 3538 | 100 |

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
    "candidate_validation": "/tmp/claude-0/-home-user-APP-Agendamiento/a0122bb2-9092-5cf7-890f-1196c801245f/scratchpad/rehavid/asear_trabajo/ejecucion_20260916T215848Z_consolidados_no_covid/resultado/analisis/tables/candidate_validation.csv",
    "candidate_status": "/tmp/claude-0/-home-user-APP-Agendamiento/a0122bb2-9092-5cf7-890f-1196c801245f/scratchpad/rehavid/asear_trabajo/ejecucion_20260916T215848Z_consolidados_no_covid/resultado/analisis/tables/candidate_status.csv",
    "test_metrics": "/tmp/claude-0/-home-user-APP-Agendamiento/a0122bb2-9092-5cf7-890f-1196c801245f/scratchpad/rehavid/asear_trabajo/ejecucion_20260916T215848Z_consolidados_no_covid/resultado/analisis/tables/test_metrics.csv",
    "calibration": "/tmp/claude-0/-home-user-APP-Agendamiento/a0122bb2-9092-5cf7-890f-1196c801245f/scratchpad/rehavid/asear_trabajo/ejecucion_20260916T215848Z_consolidados_no_covid/resultado/analisis/tables/calibration.csv",
    "decision_curve": "/tmp/claude-0/-home-user-APP-Agendamiento/a0122bb2-9092-5cf7-890f-1196c801245f/scratchpad/rehavid/asear_trabajo/ejecucion_20260916T215848Z_consolidados_no_covid/resultado/analisis/tables/decision_curve.csv",
    "horizon_status": "/tmp/claude-0/-home-user-APP-Agendamiento/a0122bb2-9092-5cf7-890f-1196c801245f/scratchpad/rehavid/asear_trabajo/ejecucion_20260916T215848Z_consolidados_no_covid/resultado/analisis/tables/horizon_status.csv",
    "predictions": "/tmp/claude-0/-home-user-APP-Agendamiento/a0122bb2-9092-5cf7-890f-1196c801245f/scratchpad/rehavid/asear_trabajo/ejecucion_20260916T215848Z_consolidados_no_covid/resultado/analisis/tables/predictions.csv",
    "group_predictions": "/tmp/claude-0/-home-user-APP-Agendamiento/a0122bb2-9092-5cf7-890f-1196c801245f/scratchpad/rehavid/asear_trabajo/ejecucion_20260916T215848Z_consolidados_no_covid/resultado/analisis/tables/group_predictions.csv",
    "metadata": "/tmp/claude-0/-home-user-APP-Agendamiento/a0122bb2-9092-5cf7-890f-1196c801245f/scratchpad/rehavid/asear_trabajo/ejecucion_20260916T215848Z_consolidados_no_covid/resultado/analisis/models/model_metadata.json"
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

Filas: 3538.

Distribución de `estado_12m`:

| estado_12m | n |
|---|---|
| not_estimable | 3538 |

Distribución de `motivo_12m`:

| motivo_12m | n |
|---|---|
| Ningún horizonte tiene soporte en la validación reservada; no se elige el mejor por entrenamiento. | 3538 |

Distribución de `estado_36m`:

| estado_36m | n |
|---|---|
| not_estimable | 3538 |

Distribución de `motivo_36m`:

| motivo_36m | n |
|---|---|
| Ningún horizonte tiene soporte en la validación reservada; no se elige el mejor por entrenamiento. | 3538 |

Distribución de `estado_60m`:

| estado_60m | n |
|---|---|
| not_estimable | 3538 |

Distribución de `motivo_60m`:

| motivo_60m | n |
|---|---|
| Ningún horizonte tiene soporte en la validación reservada; no se elige el mejor por entrenamiento. | 3538 |

Distribución de `validation_scope`:

| validation_scope | n |
|---|---|
| internal_independent_person_holdout | 3538 |

## Informe generado por el motor (`analisis/informe.md`)

# Rehavid — modelo predictivo de enfermedad laboral

**Uso de investigación. Este informe no acredita validez clínica ni autoriza decisiones individuales.**

Análisis de las fuentes configuradas; la validez clínica requiere revisión independiente.

Empresa configurada: **ASEAR S.A.S. E.S.P.**. Evento configurado: **Primer evento de enfermedad laboral calificada como tal por la ARL (Calificacion DESC = SI ATEP, Causa Siniestro DESC = ENFERMEDAD LABORAL, Origen Siniestro DESC = PROPIO DEL TRABAJO) en trabajadores con vinculo laboral vigente en ASEAR S.A.S. E.S.P. en la fecha indice. Fecha del evento y de disponibilidad = fecha de calificacion (final_decision); la apertura del siniestro se representa como estado pendiente. Incluye todos los diagnosticos calificados (osteomusculares y COVID-19 U071/U072); la sensibilidad no_covid restringe a NO_COVID. [Sensibilidad no_covid: Restringe el desenlace a EL no COVID (CIE-10 distinto de U07); los casos COVID no cuentan como evento ni como prevalentes.]**. Base temporal del evento: **final_decision**.

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
| employment | schema_read | — | 9 | 253ce0c316d86f29995da5fda8d6f86d60e02c6bf55506e18f6a607faa6ebf91 |
| outcomes | schema_read | — | 10 | 328a28558df8d98d684197b4f39825f590600a379d1545d62cf0c7c4ff50f2f0 |
| followup | schema_read | — | 11 | bcd5d7ef6467679fadfaa0744adb90ff90b5dbf54e4b13223565a7af75287cb8 |
| health_events | schema_read | — | 11 | b6fe7195424f0197ccdd029658771f89b66e0798a313a7419290947fd33fdc55 |

## Calidad de los datos

| Fuente | Control | Recuento |
| --- | --- | --- |
| employment | rows_read | 5549 |
| employment | exact_duplicates_removed | 0 |
| employment | missing_company | 0 |
| employment | missing_person_id | 0 |
| employment | missing_spell_id | 0 |
| employment | missing_start_date | 0 |
| employment | missing_end_date | 3336 |
| employment | missing_recorded_at | 0 |
| employment | missing_job | 5549 |
| employment | missing_area | 5549 |
| employment | missing_site | 5549 |
| employment | normalized_exact_duplicates_removed | 0 |
| outcomes | rows_read | 94 |
| outcomes | exact_duplicates_removed | 0 |
| outcomes | missing_company | 0 |
| outcomes | missing_person_id | 0 |
| outcomes | missing_event_id | 0 |
| outcomes | missing_status | 0 |
| outcomes | missing_event_date | 0 |
| outcomes | missing_available_at | 0 |
| outcomes | normalized_exact_duplicates_removed | 0 |
| followup | rows_read | 5516 |
| followup | exact_duplicates_removed | 0 |
| followup | missing_company | 0 |
| followup | missing_person_id | 0 |
| followup | missing_obs_start | 0 |
| followup | missing_obs_end | 0 |
| followup | missing_verified_at | 0 |
| followup | normalized_exact_duplicates_removed | 0 |
| health_events | rows_read | 30474 |
| health_events | exact_duplicates_removed | 0 |
| health_events | missing_company | 0 |
| health_events | missing_person_id | 0 |
| health_events | missing_event_id | 0 |
| health_events | missing_event_date | 0 |
| health_events | missing_available_at | 0 |
| health_events | missing_source_kind | 0 |
| health_events | missing_days | <5 |
| health_events | missing_severity | 30474 |
| health_events | normalized_exact_duplicates_removed | 0 |
| outcomes | unlinked_people_to_employment | 35 |
| followup | unlinked_people_to_employment | 0 |
| health_events | unlinked_people_to_employment | 6637 |

![Calidad de los datos](figures/quality.png)

## Estados del evento

| Estado | Eventos observados | Personas |
| --- | --- | --- |
| Confirmado | 32 | 31 |

![Estados del evento](figures/event_status.png)

## Construcción de las cohortes

| Etapa | Paso | Recuento | index_date | label_cutoff |
| --- | --- | --- | --- | --- |
| Entrenamiento | employment_records | 5549 | 2021-03-31 | 2026-06-30 |
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
| Validación | employment_records | 5549 | 2021-03-31 | 2026-06-30 |
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
| Prueba | employment_records | 5549 | 2021-03-31 | 2026-06-30 |
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
| Predicción actual | employment_records | 5549 | 2026-06-30 | 2026-06-30 |
| Predicción actual | records_available_by_index | 5516 | 2026-06-30 | 2026-06-30 |
| Predicción actual | records_effective_by_index | 5516 | 2026-06-30 | 2026-06-30 |
| Predicción actual | records_available_and_effective_by_index | 5516 | 2026-06-30 | 2026-06-30 |
| Predicción actual | known_spells | 5516 | 2026-06-30 | 2026-06-30 |
| Predicción actual | active_people | 3555 | 2026-06-30 | 2026-06-30 |
| Predicción actual | overlapping_spells | 0 | 2026-06-30 | 2026-06-30 |
| Predicción actual | other_partition | 0 | 2026-06-30 | 2026-06-30 |
| Predicción actual | prevalent_confirmed | 17 | 2026-06-30 | 2026-06-30 |
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
| Prueba | 60 | 92 | 0 | 0 | 54 | 38 | 1917 | 1826 | Soporte insuficiente | pocos eventos observados al horizonte |

Esta comprobación describe personas, eventos y seguimiento disponibles antes del entrenamiento. «Potencialmente evaluable» no significa modelo entrenado, calibrado ni validado; la evaluación posterior puede detectar limitaciones adicionales. Las personas censuradas antes del horizonte no se cuentan como negativos definitivos.

## Incidencias de ejecución

| severity | code | Recuento | explanation |
| --- | --- | --- | --- |
| warning | outcomes_unlinked_people | 35 | Hay personas sin enlace con el historial laboral. Verifique ex empleados y equivalencias de identificadores antes de interpretar ausencia de eventos. |
| warning | health_events_unlinked_people | 6637 | Hay personas sin enlace con el historial laboral. Verifique ex empleados y equivalencias de identificadores antes de interpretar ausencia de eventos. |
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


## Declaraciones del operador (D1–D3)

- D1. contract_availability.documented_contract_start: la fecha de inicio del vinculo (diseno B: inicio del primer contrato del tramo consecutivo) puede usarse como fecha de disponibilidad del vinculo; solo tenure_years como predictor laboral.
- D2. followup_derivation.employment_intersect_registry: el registro de siniestros de la ARL observa a toda la poblacion con contrato vigente en ASEAR durante 2020-01-01 a 2026-06-30, y la extraccion entregada refleja el estado del registro al 2026-06-30 (ajustar --cobertura-fin/--verificado-en/--as-of si la extraccion tiene otra fecha de corte).
- D3. Desenlace: primer evento EL calificado por la ARL (SI ATEP), fecha = fecha de calificacion, con la apertura del siniestro como estado pendiente; incluye COVID-19 calificado como EL. Sensibilidades: verified_diagnosis (fecha del siniestro con maduracion de 1.033 dias) y no_covid.

Estas salidas describen software y datos; no certifican validez clínica, utilidad ni revisión profesional independiente (ver docs/RESPONSABILIDADES.md del motor).
