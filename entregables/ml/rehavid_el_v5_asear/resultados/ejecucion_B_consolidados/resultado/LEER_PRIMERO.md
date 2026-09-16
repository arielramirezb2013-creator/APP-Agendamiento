# Resultado de esta ejecución

Estado: **TRAINING_SUPPORT_BLOCKED**.
Fase: completed. Código de salida: 3.
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

- Ningún horizonte tiene soporte en la validación reservada; no se elige el mejor por entrenamiento.
- Revise el motivo y el soporte de entrenamiento/validación por horizonte; no se concluye inviabilidad de toda la empresa.

Consulte `preparacion/` para incidencias de fuentes; `analisis/tables/cohort_flow.csv` para exclusiones; `analisis/tables/feasibility_by_horizon.csv` para seguimiento y eventos; `analisis/model_result.json` para ajustes y evaluación; y `analisis/tables/predicciones_por_persona_y_horizonte.csv` para predicciones o motivos de ausencia.

Una predicción individual de enfermedad futura expresa probabilidad a un horizonte; no asegura que la persona enfermará.
