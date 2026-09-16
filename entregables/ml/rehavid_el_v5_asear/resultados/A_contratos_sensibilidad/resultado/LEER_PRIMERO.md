# Resultado de esta ejecución

Estado: **INSUFFICIENT_TRAINING_EVENTS**.
Fase: completed. Código de salida: 3.
Algún ajuste terminó: False. Selección terminada: False.
Modelo seleccionado: ninguno.
Horizontes con predicciones: [] meses.

Estos estados describen el software y los datos utilizados. No certifican validez clínica ni utilidad del modelo.

| Etapa | Personas | Eventos observados |
|---|---:|---:|
| train | 260 | 1 |
| validation | 85 | 0 |
| test | 92 | 0 |
| score | 3420 | no corresponde |

- Cohorte de entrenamiento inferior al mínimo informático de eventos.
- Verifique desenlace, enlaces y fechas. Si el recuento es correcto, hace falta una muestra con más eventos; la guarda informática no es un cálculo de tamaño muestral.

Consulte `preparacion/` para incidencias de fuentes; `analisis/tables/cohort_flow.csv` para exclusiones; `analisis/tables/feasibility_by_horizon.csv` para seguimiento y eventos; `analisis/model_result.json` para ajustes y evaluación; y `analisis/tables/predicciones_por_persona_y_horizonte.csv` para predicciones o motivos de ausencia.

Una predicción individual de enfermedad futura expresa probabilidad a un horizonte; no asegura que la persona enfermará.
