"""
Score script para Azure ML Managed Online Endpoint.

Este archivo se sube al workspace junto con modelo_riesgo_msk.pkl
y shap_explainer.pkl. Azure ML lo ejecuta automáticamente cuando
llega un request POST al endpoint.

Estructura de request esperada:
    {
      "input_data": {
        "columns": ["servicio","ciudad","cliente","personas","sector","jornada"],
        "data": [["Xsens","Bogotá","Alpina",10,"agroindustria","diurna"]]
      }
    }

Estructura de response:
    {
      "score": 0.76,
      "modelo_version": "v1.0",
      "factores": [{"name": "...", "value": 28.0, "expl": "..."}]
    }
"""
import json
import os
from pathlib import Path

import joblib
import numpy as np
import pandas as pd


MODEL = None
EXPLAINER = None
FEATURES_NUM = ["personas", "antiguedad_cliente"]
FEATURES_CAT = ["servicio", "ciudad", "sector", "jornada"]
FEATURES_ALL = FEATURES_NUM + FEATURES_CAT

EXPLICACIONES = {
    "personas": "A más personas, mayor riesgo",
    "antiguedad_cliente": "Clientes nuevos = más expuestos",
    "sector": "Manufactura y agroindustria elevan el riesgo",
    "jornada": "Rotativas y nocturnas elevan el riesgo",
    "servicio": "El servicio determina la sensibilidad de detección",
    "ciudad": "Patrón geográfico observado",
}


def init():
    """Azure ML llama init() una sola vez al cargar el contenedor."""
    global MODEL, EXPLAINER
    model_dir = Path(os.getenv("AZUREML_MODEL_DIR", "."))
    MODEL = joblib.load(model_dir / "modelo_riesgo_msk.pkl")
    try:
        EXPLAINER = joblib.load(model_dir / "shap_explainer.pkl")
    except FileNotFoundError:
        EXPLAINER = None
    print("✓ Modelo cargado")


def _base_feature(fname: str) -> str:
    """Mapea el nombre de una columna transformada a su feature de origen.
    'personas' -> 'personas'; 'antiguedad_cliente' -> 'antiguedad_cliente';
    'servicio_Xsens' -> 'servicio'."""
    if fname in FEATURES_ALL:
        return fname
    for cat in FEATURES_CAT:
        if fname.startswith(cat + "_"):
            return cat
    return fname


def _factores_desde_shap(X_transformed, feature_names) -> list[dict]:
    """Calcula los factores top usando el explainer SHAP."""
    if EXPLAINER is None:
        return []
    shap_values = EXPLAINER.shap_values(X_transformed)
    if isinstance(shap_values, list):
        shap_values = shap_values[1]
    importancia = np.abs(shap_values[0])
    total = importancia.sum() or 1
    pcts = (importancia / total * 100).round(1)

    # Agrupar por feature base (colapsar one-hot). Split simple por "_" rompe
    # features numéricas con underscore (p.ej. 'antiguedad_cliente' -> 'antiguedad'),
    # así que primero se intenta un match exacto y luego prefijo de categoría.
    agrupado: dict[str, float] = {}
    for fname, pct in zip(feature_names, pcts):
        base = _base_feature(fname)
        agrupado[base] = agrupado.get(base, 0) + float(pct)

    top = sorted(agrupado.items(), key=lambda x: -x[1])[:6]
    return [
        {
            "name": _nombre_legible(k),
            "value": round(v, 1),
            "expl": EXPLICACIONES.get(k, ""),
        }
        for k, v in top
    ]


def _nombre_legible(key: str) -> str:
    nombres = {
        "personas": "N° personas en estudio",
        "antiguedad_cliente": "Antigüedad del cliente",
        "sector": "Sector industrial del cliente",
        "jornada": "Tipo de jornada (turnos)",
        "servicio": "Servicio asignado",
        "ciudad": "Ubicación geográfica",
    }
    return nombres.get(key, key)


def run(raw_data):
    """Azure ML llama run() en cada request."""
    try:
        data = json.loads(raw_data) if isinstance(raw_data, str) else raw_data
        cols = data["input_data"]["columns"]
        rows = data["input_data"]["data"]
        df = pd.DataFrame(rows, columns=cols)

        # Si faltan columnas, completar con defaults
        for c in FEATURES_ALL:
            if c not in df.columns:
                df[c] = 0 if c in FEATURES_NUM else "desconocido"
        df = df[FEATURES_ALL]

        # Predicción
        proba = MODEL.predict_proba(df)[:, 1]
        score = float(proba[0])

        # Factores SHAP
        prep = MODEL.named_steps["prep"]
        X_t = prep.transform(df)
        feature_names = (
            FEATURES_NUM
            + list(prep.named_transformers_["cat"].get_feature_names_out(FEATURES_CAT))
        )
        factores = _factores_desde_shap(X_t, feature_names)

        return {
            "score": round(score, 3),
            "modelo_version": os.getenv("MODEL_VERSION", "v1.0"),
            "factores": factores,
        }
    except Exception as exc:
        return {"error": str(exc)}
