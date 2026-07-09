# Directorio de artefactos del modelo

Este directorio se llena automáticamente cuando ejecutas:

```bash
python entrenamiento_modelo.py --data data/evaluaciones_historicas.csv --output modelo/
```

Después del entrenamiento contendrá:

- `modelo_riesgo_msk.pkl` — modelo entrenado serializado con joblib
- `shap_explainer.pkl` — explainer SHAP para factores
- `metricas.json` — AUC, classification report, matriz de confusión
- `features_importance.png` — gráfico de importancia de variables
- `REPORTE_ENTRENAMIENTO.md` — reporte humano del entrenamiento

Estos son los archivos que se suben a Azure ML Workspace como modelo registrado.
