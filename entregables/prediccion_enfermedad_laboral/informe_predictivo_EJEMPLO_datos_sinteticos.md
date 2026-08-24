# Informe predictivo de enfermedad laboral — Empresa Sintetica V4

Generado: 2026-08-14 01:18. Periodo de referencia del scoring: 2025-11. Población activa puntuada: 276.

## Cómo leer este informe

- **Casos esperados** = suma de probabilidades individuales de la población activa; es un valor esperado condicional que asume que los patrones históricos se mantienen. El intervalo (IC 95%) refleja solo la incertidumbre estadística del conteo, no la del modelo.
- **Confiabilidad**: `alta_probabilidad_calibrada` permite leer los números como conteos esperados; `media_*` como magnitudes aproximadas; `baja_solo_ranking_sin_conteo` significa que ese horizonte solo ordena el riesgo (no se proyectan conteos).
- Las patologías sin modelo propio usan la descomposición *score global × mezcla histórica de patologías* (suavizada por cargo): asumen que la mezcla de patologías del pasado se mantiene.
- Todas las probabilidades por patología se **reconcilian proporcionalmente** con el modelo global (mejor validado): los modelos por patología aportan la mezcla relativa y el global el nivel, de modo que la suma por patología siempre iguala el total esperado.
- Este informe NO diagnostica, no califica origen, no determina PCL y no debe usarse para decisiones disciplinarias. Es un instrumento de priorización preventiva del SG-SST.

## Calidad de los modelos por horizonte

| Horizonte | Estado | Modelo | PR-AUC | AUC | Calibración | Selección | Split |
|---|---|---|---|---|---|---|---|
| 12 m | trained | gradient_boosting | 0.061 | 0.629 | score_relativo_no_interpretar_como_probabilidad_absoluta | validacion_cruzada_agrupada | criterio_completo |
| 24 m | trained | gradient_boosting | 0.175 | 0.559 | score_relativo_no_interpretar_como_probabilidad_absoluta | validacion_cruzada_agrupada | criterio_completo |
| 60 m | not_trained | - | n/d | n/d | - | - | - |

## Horizonte 12 meses

- **Casos esperados**: 15.5 (IC 95%: 9.6–21.4) sobre 276 trabajadores activos. Confiabilidad: `media_score_no_calibrado_conteo_aproximado`.

**Patologías más probables:**

| Patología | Casos esperados | IC 95% | % del total | Método |
|---|---|---|---|---|
| Trastornos musculoesqueleticos (DME) | 7.3 | 2.6–12.0 | 47.2% | modelo_especifico_por_patologia+reconciliado_con_total_global |
| Hipoacusia y trastornos auditivos | 4.8 | 1.1–8.6 | 31.3% | descomposicion_score_global_x_mezcla_historica+reconciliado_con_total_global |
| Enfermedades de la piel | 1.7 | 0.0–4.0 | 10.8% | descomposicion_score_global_x_mezcla_historica+reconciliado_con_total_global |
| Enfermedades respiratorias ocupacionales | 1.6 | 0.0–4.0 | 10.6% | modelo_especifico_por_patologia+reconciliado_con_total_global |
| Trastornos mentales y del comportamiento | 0.0 | 0.0–0.3 | 0.1% | modelo_especifico_por_patologia+reconciliado_con_total_global |
| Otras patologias | 0.0 | 0.0–0.0 | 0.0% | descomposicion_score_global_x_mezcla_historica+reconciliado_con_total_global |

**Cargos con mayor carga esperada:**

| Cargo | Trabajadores | Casos esperados | Riesgo medio | Patologías principales |
|---|---|---|---|---|
| Soldador | 26 | 3.6 | 13.8% | Hipoacusia y trastornos auditivos (2.15); Enfermedades respiratorias ocupacionales (0.89); Trastornos musculoesqueleticos (DME) (0.44) |
| Operario Empaque | 28 | 2.4 | 8.4% | Trastornos musculoesqueleticos (DME) (1.82); Enfermedades de la piel (0.32); Hipoacusia y trastornos auditivos (0.16) |
| Conductor | 25 | 2.1 | 8.3% | Trastornos musculoesqueleticos (DME) (1.05); Hipoacusia y trastornos auditivos (0.65); Enfermedades de la piel (0.22) |
| Auxiliar Bodega | 23 | 2.1 | 8.9% | Trastornos musculoesqueleticos (DME) (1.55); Hipoacusia y trastornos auditivos (0.25); Enfermedades respiratorias ocupacionales (0.16) |
| Operario Ensamble | 41 | 2.0 | 4.8% | Trastornos musculoesqueleticos (DME) (1.03); Hipoacusia y trastornos auditivos (0.76); Enfermedades respiratorias ocupacionales (0.13) |
| Aseador | 22 | 1.6 | 7.1% | Enfermedades de la piel (0.72); Trastornos musculoesqueleticos (DME) (0.42); Hipoacusia y trastornos auditivos (0.35) |
| Ingeniero de Procesos | 33 | 0.9 | 2.7% | Hipoacusia y trastornos auditivos (0.38); Trastornos musculoesqueleticos (DME) (0.35); Enfermedades de la piel (0.13) |
| Supervisor Produccion | 29 | 0.5 | 1.8% | Trastornos musculoesqueleticos (DME) (0.32); Hipoacusia y trastornos auditivos (0.11); Enfermedades respiratorias ocupacionales (0.08) |
| Analista Calidad | 22 | 0.2 | 1.0% | Trastornos musculoesqueleticos (DME) (0.16); Enfermedades respiratorias ocupacionales (0.04); Hipoacusia y trastornos auditivos (0.01) |
| Auxiliar Administrativo | 27 | 0.2 | 0.7% | Trastornos musculoesqueleticos (DME) (0.14); Enfermedades respiratorias ocupacionales (0.04); Hipoacusia y trastornos auditivos (0.01) |

**Centros de trabajo con mayor carga esperada:**

| Centro / sede / ciudad | Trabajadores | Casos esperados | Riesgo medio | Patologías principales |
|---|---|---|---|---|
| Barranquilla | 78 | 6.2 | 7.9% | Hipoacusia y trastornos auditivos (2.51); Trastornos musculoesqueleticos (DME) (2.32); Enfermedades respiratorias ocupacionales (1.13) |
| Medellin | 91 | 5.9 | 6.5% | Trastornos musculoesqueleticos (DME) (3.28); Hipoacusia y trastornos auditivos (1.28); Enfermedades de la piel (1.10) |
| Bogota | 107 | 3.4 | 3.2% | Trastornos musculoesqueleticos (DME) (1.70); Hipoacusia y trastornos auditivos (1.06); Enfermedades de la piel (0.35) |

## Horizonte 24 meses

- **Casos esperados**: 13.4 (IC 95%: 7.4–19.4) sobre 276 trabajadores activos. Confiabilidad: `media_score_no_calibrado_conteo_aproximado`.

**Patologías más probables:**

| Patología | Casos esperados | IC 95% | % del total | Método |
|---|---|---|---|---|
| Trastornos musculoesqueleticos (DME) | 4.2 | 0.5–7.8 | 31.2% | modelo_especifico_por_patologia+reconciliado_con_total_global |
| Hipoacusia y trastornos auditivos | 3.6 | 0.5–6.7 | 26.7% | modelo_especifico_por_patologia+reconciliado_con_total_global |
| Trastornos mentales y del comportamiento | 2.9 | 0.0–6.0 | 21.9% | descomposicion_score_global_x_mezcla_historica+reconciliado_con_total_global |
| Enfermedades respiratorias ocupacionales | 1.4 | 0.0–3.4 | 10.4% | modelo_especifico_por_patologia+reconciliado_con_total_global |
| Enfermedades de la piel | 1.3 | 0.0–3.5 | 9.8% | descomposicion_score_global_x_mezcla_historica+reconciliado_con_total_global |
| Otras patologias | 0.0 | 0.0–0.0 | 0.0% | descomposicion_score_global_x_mezcla_historica+reconciliado_con_total_global |

**Cargos con mayor carga esperada:**

| Cargo | Trabajadores | Casos esperados | Riesgo medio | Patologías principales |
|---|---|---|---|---|
| Soldador | 26 | 3.9 | 14.9% | Hipoacusia y trastornos auditivos (2.16); Enfermedades respiratorias ocupacionales (1.32); Trastornos musculoesqueleticos (DME) (0.20) |
| Operario Empaque | 28 | 2.2 | 7.7% | Trastornos musculoesqueleticos (DME) (0.92); Enfermedades de la piel (0.60); Hipoacusia y trastornos auditivos (0.38) |
| Supervisor Produccion | 29 | 1.6 | 5.6% | Trastornos musculoesqueleticos (DME) (0.75); Hipoacusia y trastornos auditivos (0.42); Trastornos mentales y del comportamiento (0.40) |
| Analista Calidad | 22 | 1.4 | 6.4% | Trastornos musculoesqueleticos (DME) (0.76); Trastornos mentales y del comportamiento (0.57); Enfermedades de la piel (0.08) |
| Auxiliar Bodega | 23 | 1.3 | 5.8% | Trastornos musculoesqueleticos (DME) (0.85); Hipoacusia y trastornos auditivos (0.25); Trastornos mentales y del comportamiento (0.16) |
| Conductor | 25 | 0.8 | 3.0% | Trastornos mentales y del comportamiento (0.58); Trastornos musculoesqueleticos (DME) (0.09); Enfermedades de la piel (0.05) |
| Auxiliar Administrativo | 27 | 0.7 | 2.7% | Trastornos mentales y del comportamiento (0.35); Trastornos musculoesqueleticos (DME) (0.30); Enfermedades de la piel (0.05) |
| Ingeniero de Procesos | 33 | 0.6 | 1.9% | Trastornos mentales y del comportamiento (0.27); Trastornos musculoesqueleticos (DME) (0.14); Enfermedades de la piel (0.11) |
| Operario Ensamble | 41 | 0.5 | 1.2% | Hipoacusia y trastornos auditivos (0.17); Trastornos musculoesqueleticos (DME) (0.15); Trastornos mentales y del comportamiento (0.11) |
| Aseador | 22 | 0.4 | 1.8% | Enfermedades de la piel (0.22); Trastornos mentales y del comportamiento (0.09); Hipoacusia y trastornos auditivos (0.04) |

**Centros de trabajo con mayor carga esperada:**

| Centro / sede / ciudad | Trabajadores | Casos esperados | Riesgo medio | Patologías principales |
|---|---|---|---|---|
| Barranquilla | 78 | 6.8 | 8.8% | Hipoacusia y trastornos auditivos (2.83); Trastornos musculoesqueleticos (DME) (1.80); Enfermedades respiratorias ocupacionales (1.33) |
| Bogota | 107 | 3.5 | 3.3% | Trastornos mentales y del comportamiento (1.77); Trastornos musculoesqueleticos (DME) (1.29); Enfermedades de la piel (0.28) |
| Medellin | 91 | 3.0 | 3.3% | Trastornos musculoesqueleticos (DME) (1.10); Enfermedades de la piel (0.87); Hipoacusia y trastornos auditivos (0.59) |

## Horizonte 60 meses

- **Casos esperados**: 21.7 (IC 95%: 14.9–28.4) sobre 276 trabajadores activos. Confiabilidad: `media_baja_extrapolado_de_otro_horizonte`.

**Patologías más probables:**

| Patología | Casos esperados | IC 95% | % del total | Método |
|---|---|---|---|---|
| Trastornos musculoesqueleticos (DME) | 13.3 | 7.2–19.4 | 61.4% | descomposicion_score_global_x_mezcla_historica+reconciliado_con_total_global |
| Enfermedades respiratorias ocupacionales | 2.8 | 0.0–5.8 | 12.8% | descomposicion_score_global_x_mezcla_historica+reconciliado_con_total_global |
| Hipoacusia y trastornos auditivos | 2.7 | 0.0–5.8 | 12.6% | descomposicion_score_global_x_mezcla_historica+reconciliado_con_total_global |
| Trastornos mentales y del comportamiento | 2.1 | 0.0–4.8 | 9.6% | descomposicion_score_global_x_mezcla_historica+reconciliado_con_total_global |
| Enfermedades de la piel | 0.8 | 0.0–2.5 | 3.6% | descomposicion_score_global_x_mezcla_historica+reconciliado_con_total_global |
| Otras patologias | 0.0 | 0.0–0.0 | 0.0% | descomposicion_score_global_x_mezcla_historica+reconciliado_con_total_global |

**Cargos con mayor carga esperada:**

| Cargo | Trabajadores | Casos esperados | Riesgo medio | Patologías principales |
|---|---|---|---|---|
| Soldador | 26 | 6.0 | 22.9% | Trastornos musculoesqueleticos (DME) (2.53); Enfermedades respiratorias ocupacionales (1.92); Hipoacusia y trastornos auditivos (1.26) |
| Operario Empaque | 28 | 3.5 | 12.7% | Trastornos musculoesqueleticos (DME) (2.80); Enfermedades de la piel (0.33); Hipoacusia y trastornos auditivos (0.16) |
| Supervisor Produccion | 29 | 2.7 | 9.2% | Trastornos musculoesqueleticos (DME) (1.41); Hipoacusia y trastornos auditivos (0.53); Trastornos mentales y del comportamiento (0.49) |
| Analista Calidad | 22 | 2.3 | 10.7% | Trastornos musculoesqueleticos (DME) (1.53); Trastornos mentales y del comportamiento (0.44); Hipoacusia y trastornos auditivos (0.17) |
| Auxiliar Bodega | 23 | 2.2 | 9.6% | Trastornos musculoesqueleticos (DME) (1.86); Hipoacusia y trastornos auditivos (0.12); Enfermedades respiratorias ocupacionales (0.10) |
| Conductor | 25 | 1.3 | 5.0% | Trastornos musculoesqueleticos (DME) (0.78); Trastornos mentales y del comportamiento (0.31); Hipoacusia y trastornos auditivos (0.07) |
| Auxiliar Administrativo | 27 | 1.2 | 4.5% | Trastornos musculoesqueleticos (DME) (0.74); Trastornos mentales y del comportamiento (0.26); Hipoacusia y trastornos auditivos (0.10) |
| Ingeniero de Procesos | 33 | 1.0 | 3.1% | Trastornos musculoesqueleticos (DME) (0.65); Hipoacusia y trastornos auditivos (0.12); Enfermedades respiratorias ocupacionales (0.10) |
| Operario Ensamble | 41 | 0.8 | 2.0% | Trastornos musculoesqueleticos (DME) (0.61); Hipoacusia y trastornos auditivos (0.14); Enfermedades respiratorias ocupacionales (0.03) |
| Aseador | 22 | 0.6 | 2.9% | Trastornos musculoesqueleticos (DME) (0.39); Enfermedades de la piel (0.11); Hipoacusia y trastornos auditivos (0.05) |

**Centros de trabajo con mayor carga esperada:**

| Centro / sede / ciudad | Trabajadores | Casos esperados | Riesgo medio | Patologías principales |
|---|---|---|---|---|
| Barranquilla | 78 | 10.8 | 13.9% | Trastornos musculoesqueleticos (DME) (5.80); Enfermedades respiratorias ocupacionales (2.18); Hipoacusia y trastornos auditivos (1.90) |
| Bogota | 107 | 5.8 | 5.4% | Trastornos musculoesqueleticos (DME) (3.70); Trastornos mentales y del comportamiento (1.11); Hipoacusia y trastornos auditivos (0.47) |
| Medellin | 91 | 5.0 | 5.5% | Trastornos musculoesqueleticos (DME) (3.79); Enfermedades de la piel (0.45); Hipoacusia y trastornos auditivos (0.35) |

## Uso previsto y prohibiciones

- Uso: prevención, vigilancia epidemiológica, priorización de validaciones e inversión en controles del SG-SST.
- Prohibido: diagnóstico individual, calificación de origen, determinación de PCL, decisiones de contratación, sanción, traslado o retiro.

## Nota para análisis con IA

Este informe es autocontenido: puede pegarse en un asistente de IA junto con la pregunta que se quiera responder (p. ej., "¿en qué cargos y centros debo priorizar controles ergonómicos el próximo año?"). Pida siempre que la respuesta respete las banderas de confiabilidad y las prohibiciones de uso indicadas arriba.
