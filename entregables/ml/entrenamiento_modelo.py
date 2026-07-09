"""
================================================================
Rehavid · Entrenamiento del modelo predictivo de hallazgo MSK
================================================================

Script productivo · ejecutable cuando Rehavid tenga el histórico de evaluaciones.

ENTRADA esperada:  data/evaluaciones_historicas.csv
SALIDA:
  - modelo/modelo_riesgo_msk.pkl  · modelo entrenado serializado
  - modelo/preprocesador.pkl      · pipeline de preprocesamiento
  - modelo/shap_explainer.pkl     · explainer para producir factores
  - modelo/metricas.json          · AUC, accuracy, classification report
  - modelo/features_importance.png · gráfico de importancia
  - modelo/REPORTE_ENTRENAMIENTO.md · reporte humano

USO:
    python entrenamiento_modelo.py \\
        --data data/evaluaciones_historicas.csv \\
        --output modelo/ \\
        --modelo xgboost

FORMATO ESPERADO DEL CSV (mínimo 200 filas, ideal 500+):
    columnas:
        id_estudio         · str   · identificador único
        servicio           · str   · Xsens | EMG | Tumeke | Tobii | ...
        ciudad             · str   · Bogotá | Cali | Medellín | ...
        cliente            · str   · razón social
        sector             · str   · manufactura | agroindustria | salud | ...
        personas           · int   · n° personas evaluadas
        jornada            · str   · diurna | nocturna | rotativa
        antiguedad_cliente · int   · meses con Rehavid
        hallazgo_msk       · int   · 0 = sin hallazgo crítico, 1 = con hallazgo (TARGET)
"""
import argparse
import json
import sys
from pathlib import Path
from datetime import datetime, timezone

import numpy as np
import pandas as pd
import joblib
import shap
import matplotlib
matplotlib.use("Agg")  # backend sin display
import matplotlib.pyplot as plt

from sklearn.model_selection import train_test_split, StratifiedKFold, cross_val_score
from sklearn.preprocessing import OneHotEncoder, StandardScaler
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
from sklearn.ensemble import GradientBoostingClassifier
from sklearn.metrics import (
    roc_auc_score,
    classification_report,
    confusion_matrix,
    roc_curve,
    auc,
)


# ────────────────────────────────────────────────────────────
# Configuración
# ────────────────────────────────────────────────────────────
TARGET = "hallazgo_msk"
FEATURES_NUM = ["personas", "antiguedad_cliente"]
FEATURES_CAT = ["servicio", "ciudad", "sector", "jornada"]
FEATURES_ALL = FEATURES_NUM + FEATURES_CAT

MIN_FILAS = 100  # mínimo absoluto para entrenar
RECOMMENDED = 300  # recomendado para AUC >= 0.78


# ────────────────────────────────────────────────────────────
# Carga y validación de datos
# ────────────────────────────────────────────────────────────
def cargar_datos(path: str) -> pd.DataFrame:
    print(f"\n[1/7] Cargando {path}...")
    df = pd.read_csv(path)

    # Validaciones críticas
    cols_requeridas = FEATURES_ALL + [TARGET]
    faltantes = [c for c in cols_requeridas if c not in df.columns]
    if faltantes:
        print(f"  ✗ ERROR: faltan columnas en el CSV: {faltantes}")
        sys.exit(1)

    if len(df) < MIN_FILAS:
        print(f"  ✗ ERROR: solo {len(df)} filas · mínimo requerido: {MIN_FILAS}")
        print(f"     Recomendado: {RECOMMENDED}+ para AUC >= 0.78")
        sys.exit(1)

    if len(df) < RECOMMENDED:
        print(f"  ⚠ ADVERTENCIA: {len(df)} filas · recomendado {RECOMMENDED}+")

    # Limpieza
    df = df.dropna(subset=[TARGET])
    df[TARGET] = df[TARGET].astype(int)

    # Reportar distribución del target
    print(f"  ✓ {len(df)} filas válidas")
    pos = df[TARGET].sum()
    print(f"  ✓ Distribución target: {pos} positivos ({pos/len(df)*100:.1f}%) · {len(df)-pos} negativos")
    if pos / len(df) < 0.05 or pos / len(df) > 0.95:
        print(f"  ⚠ ADVERTENCIA: clases muy desbalanceadas · considere sobremuestreo (SMOTE)")

    return df


# ────────────────────────────────────────────────────────────
# Preprocesador
# ────────────────────────────────────────────────────────────
def construir_preprocesador() -> ColumnTransformer:
    return ColumnTransformer(
        transformers=[
            ("num", StandardScaler(), FEATURES_NUM),
            ("cat", OneHotEncoder(handle_unknown="ignore", sparse_output=False), FEATURES_CAT),
        ],
        remainder="drop",
    )


# ────────────────────────────────────────────────────────────
# Entrenamiento
# ────────────────────────────────────────────────────────────
def entrenar(df: pd.DataFrame, modelo_tipo: str = "gradient_boosting"):
    print(f"\n[2/7] Construyendo pipeline ({modelo_tipo})...")
    preprocesador = construir_preprocesador()

    if modelo_tipo == "xgboost":
        try:
            from xgboost import XGBClassifier
            clf = XGBClassifier(
                n_estimators=200,
                max_depth=4,
                learning_rate=0.08,
                use_label_encoder=False,
                eval_metric="logloss",
                random_state=42,
            )
        except ImportError:
            print("  ⚠ xgboost no instalado · cayendo a GradientBoosting")
            clf = GradientBoostingClassifier(n_estimators=200, max_depth=4, learning_rate=0.08, random_state=42)
    else:
        clf = GradientBoostingClassifier(
            n_estimators=200,
            max_depth=4,
            learning_rate=0.08,
            random_state=42,
        )

    pipeline = Pipeline([("prep", preprocesador), ("clf", clf)])

    X = df[FEATURES_ALL]
    y = df[TARGET]

    # Train/test split
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, stratify=y, random_state=42
    )

    # Cross-validation
    print("\n[3/7] Cross-validation (5 folds)...")
    cv = StratifiedKFold(n_splits=5, shuffle=True, random_state=42)
    cv_scores = cross_val_score(pipeline, X_train, y_train, cv=cv, scoring="roc_auc", n_jobs=-1)
    print(f"  AUC en CV: {cv_scores.mean():.3f} ± {cv_scores.std():.3f}")
    print(f"  Detalle:   {[f'{s:.3f}' for s in cv_scores]}")

    # Fit final
    print("\n[4/7] Entrenando modelo final...")
    pipeline.fit(X_train, y_train)

    # Evaluar en test
    print("\n[5/7] Evaluando en test set...")
    y_pred = pipeline.predict(X_test)
    y_proba = pipeline.predict_proba(X_test)[:, 1]
    auc_test = roc_auc_score(y_test, y_proba)
    print(f"  AUC test:  {auc_test:.3f}")
    print(f"\n  Classification report:")
    print(classification_report(y_test, y_pred, target_names=["sin hallazgo", "con hallazgo"]))

    cm = confusion_matrix(y_test, y_pred)
    print(f"\n  Matriz de confusión:\n     pred 0 | pred 1\n  real 0:  {cm[0,0]:3d}   |   {cm[0,1]:3d}\n  real 1:  {cm[1,0]:3d}   |   {cm[1,1]:3d}")

    metricas = {
        "fecha_entrenamiento": datetime.now(timezone.utc).isoformat(),
        "modelo": modelo_tipo,
        "n_entrenamiento": len(X_train),
        "n_test": len(X_test),
        "auc_cv_mean": float(cv_scores.mean()),
        "auc_cv_std": float(cv_scores.std()),
        "auc_test": float(auc_test),
        "cv_scores": [float(s) for s in cv_scores],
        "classification_report": classification_report(
            y_test, y_pred, target_names=["sin hallazgo", "con hallazgo"], output_dict=True
        ),
        "matriz_confusion": cm.tolist(),
    }

    return pipeline, metricas, (X_train, X_test, y_train, y_test, y_proba)


# ────────────────────────────────────────────────────────────
# SHAP · explicabilidad
# ────────────────────────────────────────────────────────────
def calcular_shap(pipeline, X_train: pd.DataFrame, output_dir: Path):
    print("\n[6/7] Calculando SHAP values...")

    # Transformar el sample para que tenga el shape del modelo
    X_sample = X_train.sample(min(100, len(X_train)), random_state=42)
    X_transformed = pipeline.named_steps["prep"].transform(X_sample)
    feature_names = (
        FEATURES_NUM
        + list(pipeline.named_steps["prep"].named_transformers_["cat"].get_feature_names_out(FEATURES_CAT))
    )

    # Explainer
    explainer = shap.TreeExplainer(pipeline.named_steps["clf"])
    shap_values = explainer.shap_values(X_transformed)

    # Si shap_values es lista (modelos binarios algunos devuelven [neg, pos])
    if isinstance(shap_values, list):
        shap_values = shap_values[1]

    # Importancia global (mean(|shap|))
    importancia = np.abs(shap_values).mean(axis=0)
    importancia_pct = (importancia / importancia.sum() * 100).round(1)

    factores = sorted(
        zip(feature_names, importancia_pct),
        key=lambda x: -x[1],
    )[:8]

    print(f"  Top factores que explican el riesgo:")
    for nombre, pct in factores:
        print(f"    {pct:5.1f}%  {nombre}")

    # Gráfico
    fig, ax = plt.subplots(figsize=(9, 5))
    nombres = [f[0] for f in factores][::-1]
    valores = [f[1] for f in factores][::-1]
    ax.barh(nombres, valores, color="#4025CE")
    ax.set_xlabel("% peso en el modelo")
    ax.set_title("Rehavid · Factores que explican el riesgo MSK", fontweight="bold")
    plt.tight_layout()
    plt.savefig(output_dir / "features_importance.png", dpi=120)
    plt.close()

    return explainer, factores


# ────────────────────────────────────────────────────────────
# Persistencia
# ────────────────────────────────────────────────────────────
def guardar(pipeline, explainer, metricas, factores, output_dir: Path):
    print(f"\n[7/7] Guardando artefactos en {output_dir}...")
    output_dir.mkdir(parents=True, exist_ok=True)

    joblib.dump(pipeline, output_dir / "modelo_riesgo_msk.pkl")
    joblib.dump(explainer, output_dir / "shap_explainer.pkl")

    metricas["factores_top"] = [{"name": n, "pct": float(p)} for n, p in factores]
    with open(output_dir / "metricas.json", "w", encoding="utf-8") as f:
        json.dump(metricas, f, indent=2, ensure_ascii=False)

    # Reporte humano
    auc_test = metricas["auc_test"]
    estado = "✓ APROBADO" if auc_test >= 0.78 else ("⚠ MARGINAL" if auc_test >= 0.70 else "✗ INSUFICIENTE")
    reporte = f"""# Rehavid · Reporte de entrenamiento del modelo predictivo MSK

**Fecha:** {metricas['fecha_entrenamiento']}
**Modelo:** {metricas['modelo']}
**Veredicto:** {estado}

## Métricas

| Métrica | Valor |
|---|---|
| AUC en test | **{metricas['auc_test']:.3f}** |
| AUC en CV (mean) | {metricas['auc_cv_mean']:.3f} ± {metricas['auc_cv_std']:.3f} |
| N entrenamiento | {metricas['n_entrenamiento']} |
| N test | {metricas['n_test']} |

## Interpretación del AUC

- AUC ≥ 0.78 → modelo apto para producción
- 0.70 ≤ AUC < 0.78 → marginal · útil para pre-tamizaje pero con vigilancia
- AUC < 0.70 → no apto · conseguir más datos o más features

## Factores que más explican el riesgo (SHAP top 8)

{chr(10).join(f"- **{f['name']}**: {f['pct']:.1f}%" for f in metricas['factores_top'])}

## Próximos pasos

1. Subir `modelo_riesgo_msk.pkl` a Azure ML Workspace
2. Desplegar como Managed Online Endpoint
3. Cambiar `AZURE_ML_ENABLED=true` en el backend
4. Monitorear drift mensualmente (Application Insights)
5. Reentrenar trimestralmente con nuevos datos
"""
    with open(output_dir / "REPORTE_ENTRENAMIENTO.md", "w", encoding="utf-8") as f:
        f.write(reporte)

    print(f"  ✓ modelo_riesgo_msk.pkl ({(output_dir / 'modelo_riesgo_msk.pkl').stat().st_size // 1024} KB)")
    print(f"  ✓ shap_explainer.pkl")
    print(f"  ✓ metricas.json")
    print(f"  ✓ features_importance.png")
    print(f"  ✓ REPORTE_ENTRENAMIENTO.md")


# ────────────────────────────────────────────────────────────
# Main
# ────────────────────────────────────────────────────────────
def main():
    parser = argparse.ArgumentParser(description="Entrenamiento del modelo predictivo Rehavid")
    parser.add_argument("--data", required=True, help="Ruta al CSV de evaluaciones históricas")
    parser.add_argument("--output", default="modelo/", help="Directorio de salida")
    parser.add_argument("--modelo", default="gradient_boosting",
                        choices=["gradient_boosting", "xgboost"], help="Algoritmo a usar")
    args = parser.parse_args()

    print("=" * 60)
    print(" REHAVID · ENTRENAMIENTO MODELO PREDICTIVO MSK")
    print("=" * 60)

    df = cargar_datos(args.data)
    pipeline, metricas, splits = entrenar(df, args.modelo)
    X_train = splits[0]
    explainer, factores = calcular_shap(pipeline, X_train, Path(args.output))
    guardar(pipeline, explainer, metricas, factores, Path(args.output))

    print("\n" + "=" * 60)
    print(" ✓ ENTRENAMIENTO COMPLETADO")
    print(f"   AUC test: {metricas['auc_test']:.3f}")
    print(f"   Artefactos en: {args.output}")
    print("=" * 60)


if __name__ == "__main__":
    main()
