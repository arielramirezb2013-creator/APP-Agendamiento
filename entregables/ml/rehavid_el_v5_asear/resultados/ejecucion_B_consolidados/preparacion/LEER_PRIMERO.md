# Resultado de esta ejecución

Estado: **PREPARED_NOT_TRAINED**.
Fase: feasibility. Código de salida: 0.
Algún ajuste terminó: False. Selección terminada: False.
Modelo seleccionado: ninguno.
Horizontes con predicciones: [] meses.

Estos estados describen el software y los datos utilizados. No certifican validez clínica ni utilidad del modelo.

| Etapa | Personas | Eventos observados |
|---|---:|---:|
| train | 260 | 5 |
| validation | 85 | 1 |
| test | 92 | 0 |
| score | 3539 | no corresponde |

- Preparación terminada; todavía no se ha entrenado. Consulte feasibility_by_horizon.csv: potencialmente evaluable no equivale a suficiencia estadística ni buen desempeño.

Consulte `preparacion/` para incidencias de fuentes; `analisis/tables/cohort_flow.csv` para exclusiones; `analisis/tables/feasibility_by_horizon.csv` para seguimiento y eventos; `analisis/model_result.json` para ajustes y evaluación; y `analisis/tables/predicciones_por_persona_y_horizonte.csv` para predicciones o motivos de ausencia.

Una predicción individual de enfermedad futura expresa probabilidad a un horizonte; no asegura que la persona enfermará.
