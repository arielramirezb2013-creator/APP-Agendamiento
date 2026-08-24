# -*- coding: utf-8 -*-
"""
PIPELINE CONSOLIDADO V3.0 - PREDICCION PREVENTIVA DE ENFERMEDAD LABORAL
===============================================================================
 
Propósito
---------
Integrar, cuando existan, ausentismo común y laboral, accidentalidad, vigilancia
 epidemiológica ocupacional, enfermedad laboral, riesgo por cargo, estructura y
nómina; construir una base analítica trazable; entrenar y validar modelos de
priorización preventiva; y exportar resultados sin identificación directa.
 
Principios obligatorios
-----------------------
1. No inventa datos, columnas, eventos ni exposiciones.
2. Si una fuente falta, registra la ausencia, omite el módulo y continúa.
3. Distingue target histórico, score relativo, probabilidad calibrada y población
   priorizada. Nunca los presenta como equivalentes.
4. La salida no diagnostica enfermedad laboral, no califica origen, no determina
   pérdida de capacidad laboral y no debe usarse con fines disciplinarios.
5. Evita fuga de información, aplica corte temporal y, cuando es viable, agrupa
   por trabajador durante la validación.
6. Si no hay masa crítica para un horizonte, no fuerza un modelo independiente:
   utiliza un score base compartido o un fallback transparente y lo documenta.
 
Ejecución en Google Colab
-------------------------
# !pip -q install pandas numpy matplotlib scikit-learn openpyxl pyarrow joblib
# Opcionales:
# !pip -q install lightgbm shap imbalanced-learn
 
Luego:
    CONFIG.COMPANY_NAME = "NOMBRE_EMPRESA"
    CONFIG.PERIOD_LABEL = "YYYY-YYYY"
    CONFIG.DATA_ROOT = "/content/data"
    CONFIG.OUTPUT_ROOT = "/content/salida_prediccion_el"
    resultados = run_pipeline(CONFIG)
 
Versión: 3.0 consolidada
Fecha documental: 2026-07-26
"""
 
from __future__ import annotations
 
import hashlib
import json
import math
import re
import shutil
import unicodedata
import warnings
import zipfile
from dataclasses import asdict, dataclass, field
from datetime import datetime
from pathlib import Path
from typing import Any, Dict, Iterable, List, Mapping, Optional, Sequence, Tuple
 
import joblib
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
import numpy as np
import pandas as pd
 
from sklearn.base import BaseEstimator, clone
from sklearn.calibration import CalibratedClassifierCV, calibration_curve
from sklearn.compose import ColumnTransformer
from sklearn.ensemble import GradientBoostingClassifier, RandomForestClassifier
from sklearn.impute import SimpleImputer
from sklearn.inspection import permutation_importance
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import (
    average_precision_score,
    brier_score_loss,
    confusion_matrix,
    f1_score,
    precision_recall_curve,
    precision_score,
    recall_score,
    roc_auc_score,
    roc_curve,
)
from sklearn.model_selection import StratifiedKFold
try:
    from sklearn.model_selection import StratifiedGroupKFold
    HAS_STRATIFIED_GROUP_KFOLD = True
except ImportError:
    HAS_STRATIFIED_GROUP_KFOLD = False
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import OneHotEncoder, StandardScaler
 
warnings.filterwarnings("ignore")
 
try:
    import lightgbm as lgb
    HAS_LGBM = True
except ImportError:
    HAS_LGBM = False
 
try:
    import shap
    HAS_SHAP = True
except ImportError:
    HAS_SHAP = False
 
 
# %%
# =============================================================================
# 1. CONFIGURACION
# =============================================================================
 
@dataclass
class ProjectConfig:
    # Identidad y rutas
    COMPANY_NAME: str = "NOMBRE_EMPRESA"
    PERIOD_LABEL: str = "POR_DEFINIR"
    DATA_ROOT: str = "/content/data"
    OUTPUT_ROOT: str = "/content/salida_prediccion_el"
    ANALYTIC_UNIT: str = "auto"  # auto | persona_mes | cargo_mes | centro_mes
    RANDOM_STATE: int = 42
 
    # Horizontes y ventanas
    HORIZONS_MONTHS: Tuple[int, ...] = (12, 36, 60)
    ROLLING_WINDOWS_MONTHS: Tuple[int, ...] = (3, 6, 12, 24)
    TEST_MONTHS: int = 12
    N_CV_FOLDS: int = 4
    MAX_PANEL_MONTHS: int = 120
 
    # Fuentes activables
    USE_AUSENTISMO_COMUN: bool = True
    USE_AUSENTISMO_LAB: bool = True
    USE_AT: bool = True
    USE_VEO: bool = True
    USE_EL_CASES: bool = True
    USE_RIESGOS_CARGO: bool = True
    USE_ESTRUCTURA: bool = True
    USE_NOMINA: bool = True
 
    # Target y suficiencia estadística
    TARGET_MODE: str = "legal_estricto"  # legal_estricto | sensibilidad_ampliada
    MIN_POSITIVES_TO_TRAIN: int = 25
    MIN_TEST_POSITIVES: int = 5
    MIN_NEGATIVES_TO_TRAIN: int = 25
    EXCLUDE_AFTER_FIRST_CONFIRMED_EL: bool = True
    INCLUDE_EL_IN_STUDY_AS_TARGET: bool = False
    INCLUDE_VEO_SENTINEL_AS_TARGET: bool = False
 
    # Umbral operativo
    THRESHOLD_OBJECTIVE: str = "f2"  # f1 | f2
    DECISION_MIN_RECALL: float = 0.60
    DECISION_MAX_ALERT_RATE: float = 0.20
    DEFAULT_DECISION_THRESHOLD: float = 0.50

    # Validacion interna (separada del test final) para seleccion de modelo y umbral
    VALIDATION_MONTHS: int = 6
    MIN_VALIDATION_POSITIVES: int = 5

    # Reporte de scoring actual: colchon de meses para no asumir que el ultimo mes del
    # panel ya tiene la misma completitud de captura que los meses historicos cerrados
    SCORING_REPORT_LAG_MONTHS: int = 1

    # Piso de tamano muestral para intervalos de confianza e indicadores de estabilidad
    MIN_SAMPLE_FOR_CI: int = 30
    PSI_MIN_SAMPLES_PER_BIN: int = 20
 
    # Modelos
    USE_LIGHTGBM: bool = True
    USE_CALIBRATED_MODEL: bool = True
    CALIBRATION_METHOD: str = "sigmoid"  # sigmoid | isotonic
    PERSIST_MODELS: bool = True
    COMPUTE_SHAP: bool = False
    COMPUTE_PERMUTATION_IMPORTANCE: bool = True
 
    # Privacidad
    ENABLE_PRIVACY_GUARDS: bool = True
    EXPORT_IDENTIFIABLE_TABLES: bool = False
    HASH_PERSON_ID_ON_EXPORT: bool = True
    PERSON_ID_HASH_SALT: str = "CAMBIAR_SALT_ANTES_DE_PRODUCCION"
    HASH_ID_COLUMN_NAME: str = "person_key"
    EXPORT_EXACT_DATES: bool = False
    # ADVERTENCIA: person_key = SHA-256(salt + person_id) truncado NO es anonimizacion fuerte.
    # Con un salt fijo por ejecucion e identificadores de baja entropia (p. ej. cedula), basta con
    # re-identificar UNA fila (via cuasi-identificadores como cargo/centro/edad) para reconstruir
    # el salt por fuerza bruta y des-anonimizar TODA la exportacion. Trate person_key como
    # seudonimizacion (reversible por quien controle el salt), no como anonimizacion irreversible,
    # y restrinja el acceso a las tablas exportadas igual que restringiria el dato identificable.
 
    # Controles de fuga y estabilidad
    EXCLUDE_TARGET_SIGNAL_FEATURES: bool = True
    LEAKAGE_FEATURE_PREFIXES: Tuple[str, ...] = ("el_", "aus_lab_")
    MULTICOLLINEARITY_THRESHOLD: float = 0.92
    ENABLE_DRIFT_MONITORING: bool = True
    PSI_ALERT_THRESHOLD: float = 0.20
 
    # Auto-mapeo y exportación
    FILE_TYPES: Tuple[str, ...] = (".csv", ".xlsx", ".xls", ".parquet")
    AUTO_LOAD_UNAMBIGUOUS_MATCHES: bool = True
    MANUAL_SOURCE_MAP: Dict[str, List[Dict[str, Optional[str]]]] = field(default_factory=dict)
    EXPORT_EXCEL_SUMMARY: bool = True
    CREATE_ZIP: bool = True
 
    # Fallback cuando no es posible entrenar
    ENABLE_TRANSPARENT_FALLBACK: bool = True
    FALLBACK_TOP_HIGH: float = 0.10
    FALLBACK_TOP_MEDIUM: float = 0.30
    FALLBACK_FEATURE_HINTS: Tuple[str, ...] = (
        "aus_comun_events_roll12",
        "aus_comun_days_roll12",
        "at_events_roll24",
        "at_severity_roll24",
        "veo_events_roll12",
        "risk_exposure_mean",
        "risk_level_max",
        "tenure_months",
    )
 
 
CONFIG = ProjectConfig()

DEFAULT_PERSON_ID_HASH_SALT = "CAMBIAR_SALT_ANTES_DE_PRODUCCION"


def validate_privacy_config(cfg: ProjectConfig) -> None:
    """Falla de forma explicita si se dejo el salt de plantilla con seudonimizacion activa.

    El salt por defecto viaja con este mismo script (incluido en el ejemplo de la seccion 15),
    por lo que cualquiera con el codigo lo conoce. Ejecutar en ese estado no ofrece proteccion
    real al hashear person_id.
    """
    if (
        cfg.ENABLE_PRIVACY_GUARDS
        and cfg.HASH_PERSON_ID_ON_EXPORT
        and cfg.PERSON_ID_HASH_SALT == DEFAULT_PERSON_ID_HASH_SALT
    ):
        raise ValueError(
            "CONFIG.PERSON_ID_HASH_SALT sigue siendo el valor de plantilla "
            f"'{DEFAULT_PERSON_ID_HASH_SALT}', publico porque viaja con este script. "
            "Defina un salt secreto y propio de la empresa antes de ejecutar con datos reales."
        )
 
 
SOURCE_SPECS: Dict[str, Dict[str, Any]] = {
    "ausentismo_comun": {
        "enabled_flag": "USE_AUSENTISMO_COMUN",
        "prefix": "aus_comun",
        "keywords": ["ausent", "incap", "comun", "común", "eps", "enfermedad general"],
        "description": "Ausentismo de origen común",
    },
    "ausentismo_laboral": {
        "enabled_flag": "USE_AUSENTISMO_LAB",
        "prefix": "aus_lab",
        "keywords": ["ausent", "laboral", "arl", "incapacidad laboral", "origen laboral"],
        "description": "Ausentismo de origen laboral",
    },
    "accidentalidad": {
        "enabled_flag": "USE_AT",
        "prefix": "at",
        "keywords": ["accident", "incidente", "furat", "investigacion at", "investigación at"],
        "description": "Accidentes de trabajo e incidentes",
    },
    "veo": {
        "enabled_flag": "USE_VEO",
        "prefix": "veo",
        "keywords": ["veo", "vigilancia", "sve", "epidemiolog", "dme", "osteomuscular", "hipoacusia", "psicosocial"],
        "description": "Vigilancia epidemiológica ocupacional",
    },
    "casos_el": {
        "enabled_flag": "USE_EL_CASES",
        "prefix": "el",
        "keywords": ["enfermedad laboral", "calificacion el", "calificación el", "dictamen", "junta", "casos el"],
        "description": "Casos de enfermedad laboral",
    },
    "riesgos_cargo": {
        "enabled_flag": "USE_RIESGOS_CARGO",
        "prefix": "risk",
        "keywords": ["matriz", "riesgo", "ipvr", "peligro", "ergonom", "biomecan", "exposicion", "exposición", "carga fisica"],
        "description": "Riesgo o exposición por cargo",
    },
    "estructura": {
        "enabled_flag": "USE_ESTRUCTURA",
        "prefix": "estructura",
        "keywords": ["estructura", "organigrama", "cargos", "areas", "áreas", "centros", "sedes"],
        "description": "Estructura organizacional",
    },
    "nomina": {
        "enabled_flag": "USE_NOMINA",
        "prefix": "nomina",
        "keywords": ["nomina", "nómina", "activos", "empleados", "personal", "headcount", "maestra"],
        "description": "Nómina o maestra de personal",
    },
}
 
 
CANONICAL_SYNONYMS: Dict[str, Tuple[str, ...]] = {
    "person_id": (
        "person_id", "persona_id", "id_persona", "id_trabajador", "trabajador_id",
        "empleado_id", "codigo_empleado", "documento", "cedula", "cédula",
        "identificacion", "identificación", "nro_documento", "numero_documento",
    ),
    "event_date": (
        "event_date", "fecha_evento", "fecha", "fecha_reporte", "fecha_caso",
        "fecha_accidente", "fecha_accidente_trabajo", "fecha_incapacidad",
        "fecha_inicio", "fecha_diagnostico", "fecha_diagnóstico", "fecha_calificacion",
        "fecha_calificación", "fecha_dictamen",
    ),
    "start_date": (
        "start_date", "fecha_inicio", "inicio", "fec_inicio", "desde",
    ),
    "end_date": (
        "end_date", "fecha_fin", "fecha_final", "fin", "fec_fin", "hasta",
    ),
    "hire_date": (
        "hire_date", "fecha_ingreso", "fecha_vinculacion", "fecha_vinculación",
        "fecha_contratacion", "fecha_contratación", "ingreso",
    ),
    "termination_date": (
        "termination_date", "fecha_retiro", "fecha_egreso", "fecha_terminacion",
        "fecha_terminación", "retiro",
    ),
    "days": (
        "days", "dias", "días", "dias_incapacidad", "días_incapacidad",
        "dias_ausencia", "duracion_dias", "duración_días",
    ),
    "cie10": (
        "cie10", "cie_10", "codigo_cie10", "código_cie10", "diagnostico_cie10",
    ),
    "diagnosis": (
        "diagnosis", "diagnostico", "diagnóstico", "patologia", "patología",
        "descripcion_diagnostico", "descripción_diagnóstico",
    ),
    "status": (
        "status", "estado", "estado_caso", "estado_calificacion", "estado_calificación",
        "resultado_calificacion", "resultado_calificación", "origen", "tipo_origen",
    ),
    "event_type": (
        "event_type", "tipo_evento", "tipo", "clase_evento", "naturaleza_evento",
    ),
    "severity": (
        "severity", "severidad", "nivel_severidad", "dias_perdidos", "días_perdidos",
        "consecuencia", "grado_lesion", "grado_lesión",
    ),
    "body_part": (
        "body_part", "parte_cuerpo", "parte_del_cuerpo", "zona_corporal", "segmento_corporal",
    ),
    "mechanism": (
        "mechanism", "mecanismo", "agente", "forma_accidente", "forma_del_accidente",
    ),
    "cargo": (
        "cargo", "puesto", "ocupacion", "ocupación", "oficio", "job", "job_title",
    ),
    "area": (
        "area", "área", "proceso", "departamento", "unidad", "gerencia",
    ),
    "centro": (
        "centro", "centro_trabajo", "centro_de_trabajo", "sede", "ubicacion", "ubicación",
    ),
    "sex": (
        "sex", "sexo", "genero", "género",
    ),
    "age": (
        "age", "edad",
    ),
    "birth_date": (
        "birth_date", "fecha_nacimiento", "nacimiento",
    ),
    "risk_factor": (
        "risk_factor", "factor_riesgo", "factor_de_riesgo", "peligro", "riesgo",
    ),
    "risk_level": (
        "risk_level", "nivel_riesgo", "nivel_de_riesgo", "valoracion", "valoración",
        "nivel_actuacion", "nivel_actuación",
    ),
    "exposure_score": (
        "exposure_score", "puntaje_exposicion", "puntaje_exposición", "score_exposicion",
        "score_exposición", "valor_riesgo", "nivel_exposicion", "nivel_exposición",
    ),
    "recommendation": (
        "recommendation", "recomendacion", "recomendación", "restriccion", "restricción",
        "concepto_medico", "concepto_médico",
    ),
}
 
 
POSITIVE_EL_KEYWORDS: Tuple[str, ...] = (
    "calificada", "calificado", "confirmada", "confirmado", "reconocida", "reconocido",
    "origen laboral", "enfermedad laboral", "enfermedad profesional", "dictamen firme",
)
 
NEGATIVE_EL_KEYWORDS: Tuple[str, ...] = (
    "origen comun", "origen común", "no laboral", "descartada", "descartado",
    "rechazada", "rechazado", "sin origen laboral",
)
 
EL_STUDY_KEYWORDS: Tuple[str, ...] = (
    "en estudio", "estudio", "proceso", "pendiente", "investigacion", "investigación",
    "calificacion en curso", "calificación en curso", "junta", "por definir",
)
 
SENTINEL_KEYWORDS: Tuple[str, ...] = (
    "centinela", "sentinela", "alerta", "sospecha", "caso probable", "caso sospechoso",
)
 
MSK_KEYWORDS: Tuple[str, ...] = (
    "muscul", "osteo", "dme", "lumbar", "lumb", "dorsal", "cervical", "hombro",
    "manguito", "codo", "epicond", "muñeca", "muneca", "mano", "tend", "tunel",
    "túnel", "disco", "columna", "miembro superior", "miembro inferior",
)
 
RISK_LEVEL_PATTERNS: Tuple[Tuple[float, Tuple[str, ...]], ...] = (
    (5.0, ("muy alto", "critico", "crítico", "nivel 5", "v")),
    (4.0, ("alto", "nivel 4", "iv")),
    (3.0, ("medio", "moderado", "nivel 3", "iii")),
    (2.0, ("bajo", "nivel 2", "ii")),
    (1.0, ("muy bajo", "aceptable", "nivel 1", "i")),
)

AGE_BAND_BINS: Tuple[float, ...] = (0, 25, 35, 45, 55, 65, np.inf)
AGE_BAND_LABELS: Tuple[str, ...] = ("<25", "25-34", "35-44", "45-54", "55-64", "65+")
 
 
# %%
# =============================================================================
# 2. UTILIDADES GENERALES, LOGS Y PRIVACIDAD
# =============================================================================
 
class RunLog:
    def __init__(self) -> None:
        self.rows: List[Dict[str, Any]] = []
 
    def add(self, module: str, status: str, message: str, **details: Any) -> None:
        row = {
            "timestamp": datetime.now().isoformat(timespec="seconds"),
            "module": module,
            "status": status,
            "message": message,
        }
        row.update(details)
        self.rows.append(row)
        print(f"[{module}] {status}: {message}")
 
    def dataframe(self) -> pd.DataFrame:
        return pd.DataFrame(self.rows)
 
 
def strip_accents(value: Any) -> str:
    text = "" if value is None or (isinstance(value, float) and np.isnan(value)) else str(value)
    return "".join(
        ch for ch in unicodedata.normalize("NFKD", text)
        if not unicodedata.combining(ch)
    )
 
 
def normalize_text(value: Any) -> str:
    text = strip_accents(value).lower().strip()
    text = re.sub(r"[^a-z0-9]+", " ", text)
    return re.sub(r"\s+", " ", text).strip()
 
 
def sanitize_col(value: Any) -> str:
    text = normalize_text(value).replace(" ", "_")
    text = re.sub(r"_+", "_", text).strip("_")
    return text or "columna_sin_nombre"
 
 
def normalize_columns(df: pd.DataFrame) -> pd.DataFrame:
    out = df.copy()
    out.columns = [sanitize_col(c) for c in out.columns]
    return out
 
 
def parse_any_date(series: pd.Series) -> pd.Series:
    try:
        parsed = pd.to_datetime(series, format="mixed", dayfirst=True, errors="coerce")
    except (TypeError, ValueError):
        parsed = None

    had_input = bool(series.notna().any()) if hasattr(series, "notna") else False
    if parsed is None or (had_input and parsed.notna().sum() == 0):
        # En pandas < 2.0, format="mixed" no es un valor reconocido: no lanza excepcion, se
        # interpreta como patron literal que no matchea nada y deja la columna entera en NaT de
        # forma silenciosa (verificado empiricamente). Por eso no basta con capturar una
        # excepcion: se detecta tambien el resultado "todo NaT" pese a haber datos de entrada.
        parsed = pd.to_datetime(series, dayfirst=True, errors="coerce")
    return parsed


 
 
def month_floor(series: pd.Series) -> pd.Series:
    return parse_any_date(series).dt.to_period("M").dt.to_timestamp()
 
 
def month_int(series: pd.Series) -> pd.Series:
    dt = pd.to_datetime(series, errors="coerce")
    return dt.dt.year * 12 + dt.dt.month
 
 
def stable_hash(value: Any, salt: str) -> Optional[str]:
    if pd.isna(value):
        return None
    raw = f"{salt}::{str(value).strip()}".encode("utf-8")
    return hashlib.sha256(raw).hexdigest()[:20]
 
 
def safe_json_dump(data: Mapping[str, Any], path: Path) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    with path.open("w", encoding="utf-8") as handle:
        json.dump(data, handle, ensure_ascii=False, indent=2, default=str)
 
 
def save_df(df: pd.DataFrame, path: Path) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    if path.suffix.lower() == ".xlsx":
        df.to_excel(path, index=False)
    else:
        df.to_csv(path, index=False, encoding="utf-8-sig")
 
 
def apply_export_privacy(df: pd.DataFrame, cfg: ProjectConfig) -> pd.DataFrame:
    out = df.copy()
    if not cfg.ENABLE_PRIVACY_GUARDS:
        return out
 
    if "person_id" in out.columns and cfg.HASH_PERSON_ID_ON_EXPORT:
        out[cfg.HASH_ID_COLUMN_NAME] = out["person_id"].apply(
            lambda x: stable_hash(x, cfg.PERSON_ID_HASH_SALT)
        )
 
    if not cfg.EXPORT_IDENTIFIABLE_TABLES:
        out = out.drop(columns=["person_id"], errors="ignore")

    if "birth_date" in out.columns:
        # age_band (mas abajo) ya generaliza la edad de forma suficiente para el analisis;
        # conservar el mes exacto de nacimiento es un cuasi-identificador innecesario que no
        # aporta valor adicional y facilita la re-identificacion combinado con cargo/centro.
        out = out.drop(columns=["birth_date"])

    date_cols = [c for c in out.columns if c.endswith("_date") or c in {"event_date", "periodo"}]
    if not cfg.EXPORT_EXACT_DATES:
        for col in date_cols:
            if col in out.columns:
                out[f"{col}_month"] = month_floor(out[col])
                if col != "periodo":
                    out = out.drop(columns=[col])

    if "age" in out.columns:
        out["age_band"] = pd.cut(
            pd.to_numeric(out["age"], errors="coerce"), bins=AGE_BAND_BINS, labels=AGE_BAND_LABELS, right=False
        )
        out = out.drop(columns=["age"])
 
    if "cie10" in out.columns:
        out["cie10_group"] = out["cie10"].astype(str).str.upper().str.extract(r"([A-Z])", expand=False)
        out = out.drop(columns=["cie10"])
 
    return out
 
 
def ensure_dirs(cfg: ProjectConfig) -> Dict[str, Path]:
    root = Path(cfg.OUTPUT_ROOT)
    dirs = {
        "root": root,
        "tables": root / "tables",
        "figures": root / "figures",
        "models": root / "models",
        "logs": root / "logs",
        "templates": root / "templates",
    }
    for path in dirs.values():
        path.mkdir(parents=True, exist_ok=True)
    return dirs
 
 
def make_one_hot_encoder() -> OneHotEncoder:
    try:
        return OneHotEncoder(handle_unknown="ignore", sparse_output=False)
    except TypeError:
        return OneHotEncoder(handle_unknown="ignore", sparse=False)
 
 
def safe_metric(func, *args: Any) -> float:
    try:
        return float(func(*args))
    except Exception:
        return np.nan
 
 
def value_contains_any(series: pd.Series, keywords: Sequence[str]) -> pd.Series:
    normalized = series.fillna("").astype(str).map(normalize_text)
    pattern = "|".join(re.escape(normalize_text(k)) for k in keywords if normalize_text(k))
    if not pattern:
        return pd.Series(False, index=series.index)
    return normalized.str.contains(pattern, regex=True, na=False)
 
 
# %%
# =============================================================================
# 3. INVENTARIO, LECTURA Y MAPEADO DE FUENTES
# =============================================================================
 
def inspect_file(path: Path) -> List[Dict[str, Any]]:
    rows: List[Dict[str, Any]] = []
    suffix = path.suffix.lower()
    try:
        if suffix in {".xlsx", ".xls"}:
            xls = pd.ExcelFile(path)
            for sheet in xls.sheet_names:
                try:
                    sample = pd.read_excel(path, sheet_name=sheet, nrows=5)
                    rows.append({
                        "file": str(path),
                        "sheet": sheet,
                        "extension": suffix,
                        "size_kb": round(path.stat().st_size / 1024, 1),
                        "sample_columns": " | ".join(map(str, sample.columns[:20])),
                    })
                except Exception as exc:
                    rows.append({
                        "file": str(path), "sheet": sheet, "extension": suffix,
                        "size_kb": round(path.stat().st_size / 1024, 1),
                        "sample_columns": "", "inspection_error": str(exc),
                    })
        else:
            if suffix == ".csv":
                sample = pd.read_csv(path, nrows=5, sep=None, engine="python")
            elif suffix == ".parquet":
                sample = pd.read_parquet(path).head(5)
            else:
                sample = pd.DataFrame()
            rows.append({
                "file": str(path),
                "sheet": None,
                "extension": suffix,
                "size_kb": round(path.stat().st_size / 1024, 1),
                "sample_columns": " | ".join(map(str, sample.columns[:20])),
            })
    except Exception as exc:
        rows.append({
            "file": str(path), "sheet": None, "extension": suffix,
            "size_kb": round(path.stat().st_size / 1024, 1),
            "sample_columns": "", "inspection_error": str(exc),
        })
    return rows
 
 
def discover_files(cfg: ProjectConfig, log: RunLog) -> pd.DataFrame:
    root = Path(cfg.DATA_ROOT)
    if not root.exists():
        log.add("inventario", "WARN", f"No existe el directorio de datos: {root}")
        return pd.DataFrame()
 
    files = [p for p in root.rglob("*") if p.is_file() and p.suffix.lower() in cfg.FILE_TYPES]
    rows: List[Dict[str, Any]] = []
    for path in sorted(files):
        rows.extend(inspect_file(path))
 
    inventory = pd.DataFrame(rows)
    log.add("inventario", "OK", f"Archivos detectados: {len(files)}; unidades archivo/hoja: {len(inventory)}")
    return inventory
 
 
def read_file_frames(path: Path, selected_sheet: Optional[str] = None) -> List[Tuple[Optional[str], pd.DataFrame]]:
    suffix = path.suffix.lower()
    frames: List[Tuple[Optional[str], pd.DataFrame]] = []
 
    if suffix in {".xlsx", ".xls"}:
        if selected_sheet is not None:
            frames.append((selected_sheet, pd.read_excel(path, sheet_name=selected_sheet)))
        else:
            xls = pd.ExcelFile(path)
            for sheet in xls.sheet_names:
                frames.append((sheet, pd.read_excel(path, sheet_name=sheet)))
    elif suffix == ".csv":
        frames.append((None, pd.read_csv(path, sep=None, engine="python")))
    elif suffix == ".parquet":
        frames.append((None, pd.read_parquet(path)))
    else:
        raise ValueError(f"Formato no soportado: {suffix}")
    return frames
 
 
def source_enabled(source: str, cfg: ProjectConfig) -> bool:
    spec = SOURCE_SPECS[source]
    return bool(getattr(cfg, spec["enabled_flag"]))
 
 
def source_score(source: str, file_name: str, sheet_name: Optional[str], columns: Sequence[Any]) -> float:
    spec = SOURCE_SPECS[source]
    haystack = " ".join([
        normalize_text(file_name),
        normalize_text(sheet_name or ""),
        " ".join(normalize_text(c) for c in columns),
    ])
    score = 0.0
    for keyword in spec["keywords"]:
        key = normalize_text(keyword)
        if key and key in haystack:
            # Las frases especificas de varias palabras (p. ej. "enfermedad laboral") deben
            # pesar mas que una palabra generica corta que quede contenida dentro de ellas
            # (p. ej. "laboral"), para evitar empates de mapeo entre fuentes con vocabulario
            # solapado (ver ausentismo_laboral vs. casos_el).
            specificity = 1.0 + 0.5 * (len(key.split()) - 1)
            base = 2.0 if key in normalize_text(file_name) else 1.0
            score += base * specificity
    return score
 
 
def manual_assignments(cfg: ProjectConfig) -> Dict[Tuple[str, Optional[str]], str]:
    assignments: Dict[Tuple[str, Optional[str]], str] = {}
    for source, items in cfg.MANUAL_SOURCE_MAP.items():
        for item in items:
            file_value = str(item.get("file") or "")
            sheet_value = item.get("sheet")
            assignments[(Path(file_value).name, sheet_value)] = source
    return assignments
 
 
def load_and_map_sources(
    inventory: pd.DataFrame,
    cfg: ProjectConfig,
    log: RunLog,
) -> Tuple[Dict[str, List[pd.DataFrame]], pd.DataFrame]:
    mapped: Dict[str, List[pd.DataFrame]] = {source: [] for source in SOURCE_SPECS}
    trace_rows: List[Dict[str, Any]] = []
    manual = manual_assignments(cfg)
 
    if inventory.empty:
        return mapped, pd.DataFrame()
 
    unique_units = inventory[["file", "sheet"]].drop_duplicates().to_dict("records")
    for unit in unique_units:
        path = Path(unit["file"])
        sheet = unit.get("sheet")
        try:
            frames = read_file_frames(path, selected_sheet=sheet)
        except Exception as exc:
            log.add("carga", "ERROR", f"No se pudo leer {path.name} / {sheet}: {exc}")
            trace_rows.append({
                "file": str(path), "sheet": sheet, "status": "error", "error": str(exc),
            })
            continue
 
        for loaded_sheet, raw in frames:
            if raw is None or raw.empty:
                trace_rows.append({
                    "file": str(path), "sheet": loaded_sheet, "status": "empty",
                })
                continue
 
            manual_key = (path.name, loaded_sheet)
            assigned_source = manual.get(manual_key) or manual.get((path.name, None))
            scores: Dict[str, float] = {}
            if assigned_source is None:
                for source in SOURCE_SPECS:
                    if source_enabled(source, cfg):
                        scores[source] = source_score(source, path.name, loaded_sheet, raw.columns)
                if scores:
                    best_source = max(scores, key=scores.get)
                    best_score = scores[best_source]
                    ordered = sorted(scores.values(), reverse=True)
                    margin = best_score - (ordered[1] if len(ordered) > 1 else 0)
                    if cfg.AUTO_LOAD_UNAMBIGUOUS_MATCHES and best_score >= 2 and margin >= 1:
                        assigned_source = best_source
 
            if assigned_source is None or assigned_source not in SOURCE_SPECS:
                trace_rows.append({
                    "file": str(path), "sheet": loaded_sheet, "rows": len(raw),
                    "columns": raw.shape[1], "assigned_source": None,
                    "status": "unmapped", "scores": json.dumps(scores, ensure_ascii=False),
                })
                log.add("mapeo", "WARN", f"Sin asignación: {path.name} / {loaded_sheet}")
                continue
 
            if not source_enabled(assigned_source, cfg):
                trace_rows.append({
                    "file": str(path), "sheet": loaded_sheet, "rows": len(raw),
                    "columns": raw.shape[1], "assigned_source": assigned_source,
                    "status": "disabled",
                })
                continue
 
            work = normalize_columns(raw)
            work["_source_file"] = path.name
            work["_source_sheet"] = loaded_sheet
            mapped[assigned_source].append(work)
            trace_rows.append({
                "file": str(path), "sheet": loaded_sheet, "rows": len(work),
                "columns": work.shape[1], "assigned_source": assigned_source,
                "status": "loaded", "scores": json.dumps(scores, ensure_ascii=False),
            })
            log.add("mapeo", "OK", f"{path.name} / {loaded_sheet} -> {assigned_source}")
 
    return mapped, pd.DataFrame(trace_rows)
 
 
def canonical_column_map(columns: Sequence[str]) -> Dict[str, str]:
    normalized_cols = {sanitize_col(c): c for c in columns}
    rename: Dict[str, str] = {}
    already_used: set[str] = set()
 
    for canonical, synonyms in CANONICAL_SYNONYMS.items():
        candidates = [sanitize_col(s) for s in synonyms]
        for candidate in candidates:
            if candidate in normalized_cols:
                original = normalized_cols[candidate]
                if original not in already_used:
                    rename[original] = canonical
                    already_used.add(original)
                    break
    return rename
 
 
def canonicalize_frame(df: pd.DataFrame, source: str) -> pd.DataFrame:
    out = normalize_columns(df)
    rename = canonical_column_map(out.columns)
    out = out.rename(columns=rename)
 
    for col in ["event_date", "start_date", "end_date", "hire_date", "termination_date", "birth_date"]:
        if col in out.columns:
            out[col] = parse_any_date(out[col])
 
    for col in ["days", "severity", "age", "exposure_score"]:
        if col in out.columns:
            out[col] = pd.to_numeric(out[col], errors="coerce")
 
    if "person_id" in out.columns:
        out["person_id"] = out["person_id"].astype(str).str.strip()
        out.loc[out["person_id"].isin(["", "nan", "None", "NaN"]), "person_id"] = np.nan
 
    for col in ["cargo", "area", "centro", "status", "diagnosis", "event_type", "risk_factor", "risk_level"]:
        if col in out.columns:
            out[col] = out[col].astype(str).str.strip().replace({"nan": np.nan, "None": np.nan})
 
    if "event_date" not in out.columns:
        for candidate in ["start_date", "end_date", "hire_date"]:
            if candidate in out.columns:
                out["event_date"] = out[candidate]
                break
 
    if "event_date" in out.columns:
        out["periodo"] = month_floor(out["event_date"])
 
    out["_canonical_source"] = source
    return out
 
 
def combine_mapped_frames(mapped: Dict[str, List[pd.DataFrame]], log: RunLog) -> Dict[str, pd.DataFrame]:
    combined: Dict[str, pd.DataFrame] = {}
    for source, frames in mapped.items():
        if not frames:
            combined[source] = pd.DataFrame()
            log.add("fuentes", "WARN", f"Fuente no disponible: {source}")
            continue
        canonical_frames = [canonicalize_frame(df, source) for df in frames]
        combined[source] = pd.concat(canonical_frames, ignore_index=True, sort=False)
        log.add("fuentes", "OK", f"{source}: {len(combined[source])} registros")
    return combined
 
 
# %%
# =============================================================================
# 4. CALIDAD DE DATOS Y PLANTILLAS
# =============================================================================
 
def build_quality_table(data: Dict[str, pd.DataFrame]) -> pd.DataFrame:
    rows: List[Dict[str, Any]] = []
    for source, df in data.items():
        if df.empty:
            rows.append({
                "source": source, "variable": None, "rows": 0, "dtype": None,
                "missing_n": None, "missing_pct": None, "unique_n": None,
                "duplicates_full_rows": None,
            })
            continue
        duplicates = int(df.duplicated().sum())
        for col in df.columns:
            rows.append({
                "source": source,
                "variable": col,
                "rows": len(df),
                "dtype": str(df[col].dtype),
                "missing_n": int(df[col].isna().sum()),
                "missing_pct": round(float(df[col].isna().mean()), 4),
                "unique_n": int(df[col].nunique(dropna=True)),
                "duplicates_full_rows": duplicates,
            })
    return pd.DataFrame(rows)
 
 
def create_expected_files_template(dirs: Dict[str, Path]) -> Path:
    table = pd.DataFrame([
        ["nomina", "Una fila por trabajador activo o histórico", "person_id, cargo, area, centro, hire_date, termination_date"],
        ["ausentismo_comun", "Una fila por incapacidad/ausencia", "person_id, event_date, days, cie10 o diagnosis"],
        ["ausentismo_laboral", "Una fila por incapacidad laboral", "person_id, event_date, days, status/origen"],
        ["accidentalidad", "Una fila por AT/incidente", "person_id, event_date, severity, body_part, mechanism"],
        ["veo", "Una fila por evaluación/señal VEO", "person_id, event_date, status, diagnosis o sistema"],
        ["casos_el", "Una fila por caso EL", "person_id, event_date, status, diagnosis, cie10"],
        ["riesgos_cargo", "Una fila por peligro/exposición/cargo", "cargo, risk_factor, risk_level o exposure_score"],
        ["estructura", "Maestra de cargos/áreas/centros", "cargo, area, centro"],
    ], columns=["source", "grain", "recommended_fields"])
    path = dirs["templates"] / "plantilla_fuentes_esperadas.xlsx"
    table.to_excel(path, index=False)
    return path
 
 
def plot_missingness(quality: pd.DataFrame, path: Path) -> None:
    usable = quality.dropna(subset=["variable", "missing_pct"]).copy()
    if usable.empty:
        return
    usable["label"] = usable["source"].astype(str) + ":" + usable["variable"].astype(str)
    top = usable.sort_values("missing_pct", ascending=False).head(25).sort_values("missing_pct")
    plt.figure(figsize=(10, 7))
    plt.barh(top["label"], top["missing_pct"] * 100)
    plt.xlabel("Porcentaje de valores faltantes")
    plt.ylabel("Fuente y variable")
    plt.title("Variables con mayor proporción de faltantes")
    plt.tight_layout()
    plt.savefig(path, dpi=170, bbox_inches="tight")
    plt.close()
 
 
def plot_inventory(inventory: pd.DataFrame, path: Path) -> None:
    if inventory.empty:
        return
    counts = inventory.groupby("extension").size().sort_values(ascending=False)
    plt.figure(figsize=(7, 4))
    plt.bar(counts.index.astype(str), counts.values)
    plt.xlabel("Tipo de archivo")
    plt.ylabel("Número de unidades archivo/hoja")
    plt.title("Inventario de fuentes detectadas")
    plt.tight_layout()
    plt.savefig(path, dpi=170, bbox_inches="tight")
    plt.close()
 
 
# %%
# =============================================================================
# 5. UNIDAD ANALITICA, ROSTER Y PANEL TEMPORAL
# =============================================================================
 
def first_non_null(series: pd.Series) -> Any:
    values = series.dropna()
    return values.iloc[0] if not values.empty else np.nan
 
 
def mode_or_first(series: pd.Series) -> Any:
    values = series.dropna().astype(str)
    if values.empty:
        return np.nan
    modes = values.mode()
    return modes.iloc[0] if not modes.empty else values.iloc[0]
 
 
def choose_analytic_unit(data: Dict[str, pd.DataFrame], cfg: ProjectConfig, log: RunLog) -> str:
    if cfg.ANALYTIC_UNIT != "auto":
        return cfg.ANALYTIC_UNIT
 
    has_person = any("person_id" in df.columns and df["person_id"].notna().any() for df in data.values() if not df.empty)
    has_cargo = any("cargo" in df.columns and df["cargo"].notna().any() for df in data.values() if not df.empty)
    has_centro = any("centro" in df.columns and df["centro"].notna().any() for df in data.values() if not df.empty)
 
    if has_person:
        unit = "persona_mes"
    elif has_cargo:
        unit = "cargo_mes"
    elif has_centro:
        unit = "centro_mes"
    else:
        raise ValueError("No se detectó person_id, cargo ni centro para construir la unidad analítica.")
 
    log.add("unidad", "OK", f"Unidad analítica seleccionada: {unit}")
    return unit
 
 
def collect_roster(data: Dict[str, pd.DataFrame], unit: str) -> pd.DataFrame:
    candidates: List[pd.DataFrame] = []
    preferred_sources = [
        "nomina", "estructura", "casos_el",
        "ausentismo_comun", "ausentismo_laboral", "accidentalidad", "veo",
    ]
    for source in preferred_sources:
        df = data.get(source, pd.DataFrame())
        if not df.empty:
            candidates.append(df.copy())
 
    if not candidates:
        return pd.DataFrame()
 
    roster_raw = pd.concat(candidates, ignore_index=True, sort=False)
 
    if unit == "persona_mes":
        key = "person_id"
    elif unit == "cargo_mes":
        key = "cargo"
    else:
        key = "centro"
 
    if key not in roster_raw.columns:
        return pd.DataFrame()
 
    roster_raw = roster_raw[roster_raw[key].notna()].copy()
    if roster_raw.empty:
        return pd.DataFrame()
 
    agg: Dict[str, Any] = {}
    for col in ["cargo", "area", "centro", "sex"]:
        if col in roster_raw.columns and col != key:
            agg[col] = mode_or_first
    for col in ["hire_date", "birth_date"]:
        if col in roster_raw.columns:
            agg[col] = "min"
    if "termination_date" in roster_raw.columns:
        agg["termination_date"] = "max"
    if "age" in roster_raw.columns:
        agg["age"] = "median"
 
    if not agg:
        return roster_raw[[key]].drop_duplicates().reset_index(drop=True)

    roster = roster_raw.groupby(key, dropna=False).agg(agg).reset_index()

    if "termination_date" in roster.columns and "hire_date" in roster_raw.columns:
        # La vinculacion vigente es la de fecha de ingreso mas reciente. Un max() ciego sobre
        # termination_date puede devolver el retiro de un ciclo de contratacion ANTERIOR y
        # truncar el panel de alguien que en realidad sigue activo (reingreso). Se corrige
        # tomando la fecha de retiro (o su ausencia, si sigue activa) del registro con la
        # hire_date mas reciente por entidad.
        # OJO: GroupBy.last() omite NaN por defecto y devolveria el ultimo retiro NO NULO, que
        # es exactamente el valor incorrecto que se quiere evitar cuando la vinculacion vigente
        # esta activa (termination_date NaT). Se usa tail(1), que es posicional y preserva NaT.
        latest_stint_termination = (
            roster_raw[roster_raw["hire_date"].notna()]
            .sort_values("hire_date")
            .groupby(key, dropna=False)
            .tail(1)
            .set_index(key)["termination_date"]
        )
        roster = roster.set_index(key)
        overlap = roster.index.intersection(latest_stint_termination.index)
        roster.loc[overlap, "termination_date"] = latest_stint_termination.loc[overlap].values
        roster = roster.reset_index()

    return roster
 
 
def data_period_bounds(data: Dict[str, pd.DataFrame]) -> Tuple[pd.Timestamp, pd.Timestamp]:
    periods: List[pd.Timestamp] = []
    for df in data.values():
        if df.empty:
            continue
        for col in ["periodo", "hire_date", "termination_date", "event_date"]:
            if col in df.columns:
                vals = month_floor(df[col]).dropna()
                if not vals.empty:
                    periods.extend([vals.min(), vals.max()])
    if not periods:
        current = pd.Timestamp.today().to_period("M").to_timestamp()
        return current, current
    return min(periods), max(periods)
 
 
def cap_period_range(start: pd.Timestamp, end: pd.Timestamp, max_months: int) -> Tuple[pd.Timestamp, pd.Timestamp]:
    n_months = (end.year - start.year) * 12 + end.month - start.month + 1
    if n_months <= max_months:
        return start, end
    capped_start = (end.to_period("M") - (max_months - 1)).to_timestamp()
    return capped_start, end
 
 
def build_panel(
    roster: pd.DataFrame,
    data: Dict[str, pd.DataFrame],
    unit: str,
    cfg: ProjectConfig,
    log: RunLog,
) -> Tuple[pd.DataFrame, str]:
    if unit == "persona_mes":
        key = "person_id"
    elif unit == "cargo_mes":
        key = "cargo"
    else:
        key = "centro"
 
    if roster.empty or key not in roster.columns:
        all_entities: List[pd.DataFrame] = []
        for df in data.values():
            if not df.empty and key in df.columns:
                cols = [c for c in [key, "cargo", "area", "centro", "sex", "age"] if c in df.columns]
                all_entities.append(df[cols])
        if not all_entities:
            raise ValueError(f"No hay entidades para la unidad {unit}.")
        raw_entities = pd.concat(all_entities, ignore_index=True, sort=False)
        agg = {c: mode_or_first for c in raw_entities.columns if c != key}
        roster = raw_entities.groupby(key, dropna=False).agg(agg).reset_index()
 
    global_start, global_end = data_period_bounds(data)
    global_start, global_end = cap_period_range(global_start, global_end, cfg.MAX_PANEL_MONTHS)
 
    rows: List[pd.DataFrame] = []
    for _, entity in roster.iterrows():
        start = global_start
        end = global_end
        if unit == "persona_mes":
            if "hire_date" in roster.columns and pd.notna(entity.get("hire_date")):
                start = max(start, pd.Timestamp(entity["hire_date"]).to_period("M").to_timestamp())
            if "termination_date" in roster.columns and pd.notna(entity.get("termination_date")):
                end = min(end, pd.Timestamp(entity["termination_date"]).to_period("M").to_timestamp())
        if start > end:
            continue
        months = pd.date_range(start=start, end=end, freq="MS")
        block = pd.DataFrame({"periodo": months})
        for col in roster.columns:
            block[col] = entity[col]
        rows.append(block)
 
    if not rows:
        raise ValueError("El panel quedó vacío después de aplicar las ventanas temporales.")
 
    panel = pd.concat(rows, ignore_index=True, sort=False)
    panel = panel.sort_values([key, "periodo"]).reset_index(drop=True)
    panel["period_int"] = month_int(panel["periodo"])
 
    if unit == "persona_mes" and "hire_date" in panel.columns:
        hire_int = month_int(panel["hire_date"])
        panel["tenure_months"] = (panel["period_int"] - hire_int).clip(lower=0)
 
    if "birth_date" in panel.columns:
        panel["age"] = ((panel["periodo"] - panel["birth_date"]).dt.days / 365.25).clip(lower=0)
 
    log.add("panel", "OK", f"Panel creado: {len(panel)} filas; {panel[key].nunique()} entidades")
    return panel, key
 
 
# %%
# =============================================================================
# 6. FEATURES DE EVENTOS, EXPOSICION Y VENTANAS HISTORICAS
# =============================================================================
 
def diagnosis_is_msk(df: pd.DataFrame) -> pd.Series:
    mask = pd.Series(False, index=df.index)
    if "cie10" in df.columns:
        mask |= df["cie10"].fillna("").astype(str).str.upper().str.startswith("M")
    for col in ["diagnosis", "body_part", "risk_factor", "event_type"]:
        if col in df.columns:
            mask |= value_contains_any(df[col], MSK_KEYWORDS)
    return mask
 
 
def event_aggregate(df: pd.DataFrame, key: str, prefix: str) -> pd.DataFrame:
    if df.empty or key not in df.columns or "periodo" not in df.columns:
        return pd.DataFrame()
    work = df[df[key].notna() & df["periodo"].notna()].copy()
    if work.empty:
        return pd.DataFrame()
 
    work[f"{prefix}_event"] = 1
    days_series = work["days"] if "days" in work.columns else pd.Series(0, index=work.index)
    severity_series = work["severity"] if "severity" in work.columns else pd.Series(0, index=work.index)
    work[f"{prefix}_days"] = pd.to_numeric(days_series, errors="coerce").fillna(0)
    work[f"{prefix}_severity"] = pd.to_numeric(severity_series, errors="coerce").fillna(0)
    work[f"{prefix}_msk_event"] = diagnosis_is_msk(work).astype(int)
 
    agg = work.groupby([key, "periodo"], dropna=False).agg(
        **{
            f"{prefix}_events": (f"{prefix}_event", "sum"),
            f"{prefix}_days": (f"{prefix}_days", "sum"),
            f"{prefix}_severity": (f"{prefix}_severity", "sum"),
            f"{prefix}_msk_events": (f"{prefix}_msk_event", "sum"),
        }
    ).reset_index()
    return agg
 
 
def risk_level_to_numeric(series: pd.Series) -> pd.Series:
    def convert(value: Any) -> float:
        if pd.isna(value):
            return np.nan
        text = normalize_text(value)
        numeric_match = re.search(r"\b([1-5])\b", text)
        if numeric_match:
            return float(numeric_match.group(1))
        for level, patterns in RISK_LEVEL_PATTERNS:
            for pattern in patterns:
                normalized_pattern = normalize_text(pattern)
                # Coincidencia por palabra completa: un patron de una sola letra como "v"
                # (numeral romano de nivel 5) no debe activarse por estar contenido dentro
                # de otra palabra (p. ej. "v" dentro de "nivel"), lo que clasificaria como
                # "muy alto" casi cualquier texto que simplemente contenga la palabra "nivel".
                if normalized_pattern and re.search(rf"\b{re.escape(normalized_pattern)}\b", text):
                    return level
        return np.nan
    return series.apply(convert)
 
 
def aggregate_risk_by_cargo(df: pd.DataFrame) -> pd.DataFrame:
    if df.empty or "cargo" not in df.columns:
        return pd.DataFrame()
    work = df[df["cargo"].notna()].copy()
    if work.empty:
        return pd.DataFrame()
    if "exposure_score" in work.columns:
        work["exposure_score"] = pd.to_numeric(work["exposure_score"], errors="coerce")
    if "risk_level" in work.columns:
        work["risk_level_num"] = risk_level_to_numeric(work["risk_level"])
 
    rows: List[Dict[str, Any]] = []
    for cargo, grp in work.groupby("cargo", dropna=False):
        row: Dict[str, Any] = {"cargo": cargo, "risk_records": len(grp)}
        if "exposure_score" in grp.columns:
            row["risk_exposure_mean"] = grp["exposure_score"].mean()
            row["risk_exposure_max"] = grp["exposure_score"].max()
        if "risk_level_num" in grp.columns:
            row["risk_level_mean"] = grp["risk_level_num"].mean()
            row["risk_level_max"] = grp["risk_level_num"].max()
        if "risk_factor" in grp.columns:
            row["risk_factor_count"] = grp["risk_factor"].nunique(dropna=True)
        rows.append(row)
    return pd.DataFrame(rows)
 
 
def add_source_features(
    panel: pd.DataFrame,
    data: Dict[str, pd.DataFrame],
    key: str,
    unit: str,
    cfg: ProjectConfig,
    log: RunLog,
) -> Tuple[pd.DataFrame, pd.DataFrame]:
    out = panel.copy()
    trace: List[Dict[str, Any]] = []
 
    event_sources = ["ausentismo_comun", "ausentismo_laboral", "accidentalidad", "veo"]
    for source in event_sources:
        df = data.get(source, pd.DataFrame())
        prefix = SOURCE_SPECS[source]["prefix"]
        if df.empty:
            trace.append({"source": source, "status": "skipped_missing", "features": 0})
            continue
        if key not in df.columns:
            trace.append({"source": source, "status": f"skipped_missing_{key}", "features": 0})
            continue
        agg = event_aggregate(df, key=key, prefix=prefix)
        if agg.empty:
            trace.append({"source": source, "status": "skipped_no_usable_events", "features": 0})
            continue
        feature_count = len([c for c in agg.columns if c not in {key, "periodo"}])
        out = out.merge(agg, on=[key, "periodo"], how="left")
        trace.append({"source": source, "status": "merged", "features": feature_count})
 
    risk = data.get("riesgos_cargo", pd.DataFrame())
    if not risk.empty and "cargo" in out.columns:
        risk_agg = aggregate_risk_by_cargo(risk)
        if not risk_agg.empty:
            out = out.merge(risk_agg, on="cargo", how="left")
            trace.append({"source": "riesgos_cargo", "status": "merged", "features": risk_agg.shape[1] - 1})
        else:
            trace.append({"source": "riesgos_cargo", "status": "skipped_no_usable_risk", "features": 0})
    else:
        trace.append({"source": "riesgos_cargo", "status": "skipped_missing", "features": 0})
 
    numeric_event_cols = [
        c for c in out.columns
        if any(c.startswith(SOURCE_SPECS[s]["prefix"] + "_") for s in event_sources)
    ]
    for col in numeric_event_cols:
        out[col] = pd.to_numeric(out[col], errors="coerce").fillna(0)
 
    rolling_base_cols = [
        c for c in numeric_event_cols
        if c.endswith("_events") or c.endswith("_days") or c.endswith("_severity")
    ]
    out = out.sort_values([key, "periodo"]).reset_index(drop=True)
    for col in rolling_base_cols:
        # Se agrupa una sola vez por columna y se reutiliza para las 4 ventanas (evita volver
        # a agrupar la misma serie ya desplazada en cada iteracion de ventana).
        shifted_grouped = (
            out.groupby(key, dropna=False)[col].shift(1).fillna(0).groupby(out[key], dropna=False)
        )
        for window in cfg.ROLLING_WINDOWS_MONTHS:
            out[f"{col}_roll{window}"] = shifted_grouped.transform(
                lambda s: s.rolling(window=window, min_periods=1).sum()
            )
 
    # Tendencia simple: diferencia entre últimos 3 y 3 meses previos, cuando existe roll6.
    for col in rolling_base_cols:
        roll3 = f"{col}_roll3"
        roll6 = f"{col}_roll6"
        if roll3 in out.columns and roll6 in out.columns:
            out[f"{col}_trend_3vprev3"] = out[roll3] - (out[roll6] - out[roll3])
 
    log.add("features", "OK", f"Features integradas: {out.shape[1] - panel.shape[1]} nuevas columnas")
    return out, pd.DataFrame(trace)
 
 
# %%
# =============================================================================
# 7. TARGET DE ENFERMEDAD LABORAL Y CONTROL DE SESGOS
# =============================================================================
 
def classify_el_records(df: pd.DataFrame, cfg: ProjectConfig) -> pd.DataFrame:
    if df.empty:
        return df.copy()
    out = df.copy()
    status_text = pd.Series("", index=out.index, dtype="object")
    for col in ["status", "event_type", "diagnosis", "recommendation"]:
        if col in out.columns:
            status_text = status_text + " " + out[col].fillna("").astype(str)
    status_text = status_text.map(normalize_text)
 
    positive_mask = value_contains_any(status_text, POSITIVE_EL_KEYWORDS)
    negative_mask = value_contains_any(status_text, NEGATIVE_EL_KEYWORDS)
    out["el_confirmed"] = (positive_mask & ~negative_mask).astype(int)
    out["el_in_study"] = value_contains_any(status_text, EL_STUDY_KEYWORDS).astype(int)
    out["el_sentinel"] = value_contains_any(status_text, SENTINEL_KEYWORDS).astype(int)
 
    # Si la fuente EL no trae estado, no se asume confirmación. Queda trazada como sin estado.
    out["el_status_missing"] = (status_text.str.strip() == "").astype(int)
 
    out["target_event"] = out["el_confirmed"].astype(int)
    if cfg.TARGET_MODE == "sensibilidad_ampliada":
        if cfg.INCLUDE_EL_IN_STUDY_AS_TARGET:
            out["target_event"] = np.maximum(out["target_event"], out["el_in_study"])
        if cfg.INCLUDE_VEO_SENTINEL_AS_TARGET:
            out["target_event"] = np.maximum(out["target_event"], out["el_sentinel"])
    return out
 
 
def build_target_event_source(data: Dict[str, pd.DataFrame], cfg: ProjectConfig) -> pd.DataFrame:
    """Combina únicamente las fuentes autorizadas para construir el target."""
    frames: List[pd.DataFrame] = []
    el = data.get("casos_el", pd.DataFrame())
    if not el.empty:
        frames.append(el.copy())
 
    if (
        cfg.TARGET_MODE == "sensibilidad_ampliada"
        and cfg.INCLUDE_VEO_SENTINEL_AS_TARGET
    ):
        veo = data.get("veo", pd.DataFrame())
        if not veo.empty:
            frames.append(veo.copy())
 
    if not frames:
        return pd.DataFrame()
    return pd.concat(frames, ignore_index=True, sort=False)
 
 
def add_future_targets(
    panel: pd.DataFrame,
    el_df: pd.DataFrame,
    key: str,
    cfg: ProjectConfig,
    log: RunLog,
) -> Tuple[pd.DataFrame, pd.DataFrame]:
    out = panel.copy()
    rules: List[Dict[str, Any]] = []
 
    if el_df.empty or key not in el_df.columns or "periodo" not in el_df.columns:
        for horizon in cfg.HORIZONS_MONTHS:
            out[f"target_el_{horizon}m"] = 0
            out[f"target_eligible_{horizon}m"] = 0
        out["target_eligible"] = 0
        log.add("target", "WARN", "No hay eventos EL utilizables; los targets quedan sin elegibilidad y no se forzará entrenamiento.")
        return out, pd.DataFrame(rules)
 
    classified = classify_el_records(el_df, cfg)
    events = classified[
        classified[key].notna() & classified["periodo"].notna() & classified["target_event"].eq(1)
    ].copy()
    events["event_int"] = month_int(events["periodo"])
 
    if events.empty:
        for horizon in cfg.HORIZONS_MONTHS:
            out[f"target_el_{horizon}m"] = 0
            out[f"target_eligible_{horizon}m"] = 0
        out["target_eligible"] = 0
        log.add("target", "WARN", "No se identificaron eventos target bajo las reglas configuradas.")
        return out, pd.DataFrame(rules)
 
    first_event = events.groupby(key)["event_int"].min().to_dict()
    event_map = {
        entity: np.sort(group["event_int"].dropna().astype(int).unique())
        for entity, group in events.groupby(key)
    }
    # Fin de seguimiento REAL por entidad, no el fin global del panel: una entidad que se
    # retira (o cuyo panel termina) antes del cierre global del estudio deja de tener
    # seguimiento desde ese punto, y no puede tratarse como si el estudio siguiera
    # observandola hasta la fecha global de corte. Usar un limite global aqui etiquetaria
    # como "negativo con seguimiento completo" meses de personas retiradas para los cuales,
    # en realidad, no hay forma de saber si desarrollaron o no un evento despues de irse.
    last_observed_by_entity = out.groupby(key)["period_int"].max().to_dict()
 
    targets: Dict[int, np.ndarray] = {
        int(h): np.zeros(len(out), dtype=np.int8) for h in cfg.HORIZONS_MONTHS
    }
    eligibility: Dict[int, np.ndarray] = {
        int(h): np.zeros(len(out), dtype=np.int8) for h in cfg.HORIZONS_MONTHS
    }
 
    for idx, (entity, current_int) in enumerate(zip(out[key], out["period_int"])):
        if pd.isna(entity) or pd.isna(current_int):
            continue
        current_int = int(current_int)
        if cfg.EXCLUDE_AFTER_FIRST_CONFIRMED_EL and entity in first_event and current_int >= first_event[entity]:
            continue

        entity_last_int = int(last_observed_by_entity[entity])
        candidate_events = event_map.get(entity)
        next_event: Optional[int] = None
        if candidate_events is not None and len(candidate_events) > 0:
            pos = np.searchsorted(candidate_events, current_int, side="right")
            if pos < len(candidate_events):
                next_event = int(candidate_events[pos])

        for horizon in cfg.HORIZONS_MONTHS:
            horizon = int(horizon)
            # Evita etiquetar como negativo un mes sin seguimiento completo hasta el horizonte,
            # usando el fin de seguimiento propio de la entidad (retiro incluido), no el fin
            # global del panel.
            if current_int + horizon > entity_last_int:
                continue
            eligibility[horizon][idx] = 1
            if next_event is not None:
                lag = next_event - current_int
                if 1 <= lag <= horizon:
                    targets[horizon][idx] = 1
 
    out["target_eligible"] = 0
    for horizon in cfg.HORIZONS_MONTHS:
        horizon = int(horizon)
        out[f"target_el_{horizon}m"] = targets[horizon]
        out[f"target_eligible_{horizon}m"] = eligibility[horizon]
        out["target_eligible"] = np.maximum(out["target_eligible"], eligibility[horizon])
        rules.append({
            "horizon_months": horizon,
            "target_definition": "Primer evento target futuro dentro de la ventana, posterior al mes índice",
            "censoring_rule": "Solo filas con seguimiento completo hasta el horizonte (fin de seguimiento propio de cada entidad, no el fin global del panel)",
            "target_mode": cfg.TARGET_MODE,
            "positives": int(targets[horizon][eligibility[horizon] == 1].sum()),
            "eligible_rows": int(eligibility[horizon].sum()),
        })
 
    log.add(
        "target", "OK",
        "Targets creados: " + ", ".join(
            f"{int(h)}m={int(out.loc[out[f'target_eligible_{int(h)}m'].eq(1), f'target_el_{int(h)}m'].sum())} positivos/"
            f"{int(out[f'target_eligible_{int(h)}m'].sum())} elegibles"
            for h in cfg.HORIZONS_MONTHS
        ),
    )
    return out, pd.DataFrame(rules)
 
 
# %%
# =============================================================================
# 8. PREPARACION DEL MODELO, FUGA, MULTICOLINEALIDAD Y SPLIT TEMPORAL
# =============================================================================
 
def select_feature_columns(df: pd.DataFrame, target_col: str, cfg: ProjectConfig) -> Tuple[List[str], List[str], List[str], pd.DataFrame]:
    excluded_exact = {
        "person_id", "periodo", "period_int", "target_eligible", target_col,
        "event_date", "start_date", "end_date", "hire_date", "termination_date",
        "birth_date", "_source_file", "_source_sheet", "_canonical_source",
    }
    excluded_prefixes = ("target_el_", "target_eligible_")
    leakage_prefixes = list(cfg.LEAKAGE_FEATURE_PREFIXES)
    if cfg.TARGET_MODE == "sensibilidad_ampliada" and cfg.INCLUDE_VEO_SENTINEL_AS_TARGET:
        leakage_prefixes.append("veo_")
    rows: List[Dict[str, Any]] = []
    features: List[str] = []
 
    for col in df.columns:
        reason = None
        if col in excluded_exact or any(col.startswith(p) for p in excluded_prefixes):
            reason = "identificador_fecha_o_target"
        elif cfg.EXCLUDE_TARGET_SIGNAL_FEATURES and any(col.startswith(p) for p in leakage_prefixes):
            reason = "proteccion_fuga_target"
        elif df[col].isna().all():
            reason = "todo_nulo"
        elif df[col].nunique(dropna=True) <= 1:
            reason = "sin_variacion"
        elif df[col].dtype == "object" and df[col].nunique(dropna=True) > max(200, int(len(df) * 0.30)):
            reason = "categorica_alta_cardinalidad"
 
        if reason is None:
            features.append(col)
            status = "incluida"
        else:
            status = "excluida"
        rows.append({"feature": col, "status": status, "reason": reason})
 
    numeric = [c for c in features if pd.api.types.is_numeric_dtype(df[c])]
    categorical = [c for c in features if c not in numeric]
    return features, numeric, categorical, pd.DataFrame(rows)
 
 
def filter_multicollinear(
    train_df: pd.DataFrame,
    numeric_cols: List[str],
    threshold: float,
) -> Tuple[List[str], pd.DataFrame]:
    if len(numeric_cols) < 2:
        return numeric_cols, pd.DataFrame()
    corr = train_df[numeric_cols].corr().abs()
    upper = corr.where(np.triu(np.ones(corr.shape), k=1).astype(bool))
    dropped: List[Dict[str, Any]] = []
    to_drop: set[str] = set()
    for col in upper.columns:
        high = upper.index[upper[col] > threshold].tolist()
        if high:
            to_drop.add(col)
            dropped.append({
                "feature_eliminada": col,
                "correlacion_max": float(upper[col].max()),
                "relacionada_con": ", ".join(high[:5]),
            })
    kept = [c for c in numeric_cols if c not in to_drop]
    return kept, pd.DataFrame(dropped)
 
 
def temporal_train_test_split(
    df: pd.DataFrame,
    target_col: str,
    eligibility_col: str,
    cfg: ProjectConfig,
) -> Tuple[pd.DataFrame, pd.DataFrame, pd.Timestamp, str]:
    work = df[df[eligibility_col].eq(1)].copy()
    work = work[work[target_col].notna() & work["periodo"].notna()].copy()
    periods = sorted(work["periodo"].dropna().unique())
    if len(periods) < 2:
        raise ValueError("No hay al menos dos periodos para separar entrenamiento y prueba.")

    desired_test = min(cfg.TEST_MONTHS, max(1, len(periods) // 3))
    candidate_sizes = list(range(desired_test, 0, -1)) + list(range(desired_test + 1, min(len(periods), desired_test + 12)))
    for size in candidate_sizes:
        if size >= len(periods):
            continue
        cutoff = pd.Timestamp(periods[-size])
        train = work[work["periodo"] < cutoff].copy()
        test = work[work["periodo"] >= cutoff].copy()
        if train[target_col].nunique() < 2 or test[target_col].nunique() < 2:
            continue
        if int(test[target_col].sum()) < cfg.MIN_TEST_POSITIVES:
            continue
        return train, test, cutoff, "criterio_completo"

    # Fallback: ultimo tercio. A diferencia del criterio normal, aqui NO se garantiza el minimo
    # de positivos de prueba (MIN_TEST_POSITIVES). El llamador debe tratar el resultado como de
    # confiabilidad reducida y dejarlo trazado (split_method), no reportarlo igual que un
    # horizonte validado con el criterio completo.
    size = max(1, len(periods) // 3)
    cutoff = pd.Timestamp(periods[-size])
    train = work[work["periodo"] < cutoff].copy()
    test = work[work["periodo"] >= cutoff].copy()
    return train, test, cutoff, "fallback_ultimo_tercio_baja_confianza"


def carve_validation_slice(
    train_df: pd.DataFrame,
    target_col: str,
    cfg: ProjectConfig,
) -> Tuple[pd.DataFrame, Optional[pd.DataFrame]]:
    """Separa, DENTRO del propio periodo de entrenamiento (antes del test final), una porcion
    de validacion temporal interna para elegir modelo y umbral operativo sin tocar el test.

    Devuelve (train_sin_validacion, validacion). Si no hay suficiente historia o positivos
    para una validacion confiable, devuelve (train_df, None): en ese caso el llamador debe
    depender solo de la validacion cruzada agrupada para elegir modelo, y usar el umbral por
    defecto de configuracion en vez de buscarlo sobre el test.
    """
    periods = sorted(train_df["periodo"].dropna().unique())
    if len(periods) < 4:
        return train_df, None

    max_val_periods = max(1, len(periods) // 4)
    for val_size in range(min(cfg.VALIDATION_MONTHS, max_val_periods), 0, -1):
        cutoff = pd.Timestamp(periods[-val_size])
        actual_train = train_df[train_df["periodo"] < cutoff].copy()
        validation = train_df[train_df["periodo"] >= cutoff].copy()
        if actual_train[target_col].nunique() < 2 or validation[target_col].nunique() < 2:
            continue
        if int(validation[target_col].sum()) < cfg.MIN_VALIDATION_POSITIVES:
            continue
        return actual_train, validation

    return train_df, None


def build_preprocessor(numeric_cols: List[str], categorical_cols: List[str]) -> ColumnTransformer:
    num_pipe = Pipeline([
        ("imputer", SimpleImputer(strategy="median")),
        ("scaler", StandardScaler()),
    ])
    cat_pipe = Pipeline([
        ("imputer", SimpleImputer(strategy="most_frequent")),
        ("onehot", make_one_hot_encoder()),
    ])
    return ColumnTransformer(
        transformers=[
            ("numeric", num_pipe, numeric_cols),
            ("categorical", cat_pipe, categorical_cols),
        ],
        remainder="drop",
        sparse_threshold=0.0,
    )
 
 
def make_calibrated_estimator(base: BaseEstimator, method: str, cv: int) -> BaseEstimator:
    try:
        return CalibratedClassifierCV(estimator=base, method=method, cv=cv)
    except TypeError:
        return CalibratedClassifierCV(base_estimator=base, method=method, cv=cv)
 
 
def build_candidate_models(cfg: ProjectConfig, calibration_cv: int) -> Dict[str, BaseEstimator]:
    models: Dict[str, BaseEstimator] = {
        "logistica_balanceada": LogisticRegression(
            max_iter=2000,
            class_weight="balanced",
            solver="liblinear",
            random_state=cfg.RANDOM_STATE,
        ),
        "random_forest_balanceado": RandomForestClassifier(
            n_estimators=450,
            min_samples_leaf=5,
            class_weight="balanced_subsample",
            n_jobs=-1,
            random_state=cfg.RANDOM_STATE,
        ),
        "gradient_boosting": GradientBoostingClassifier(
            n_estimators=180,
            learning_rate=0.04,
            max_depth=2,
            random_state=cfg.RANDOM_STATE,
        ),
    }
 
    if cfg.USE_CALIBRATED_MODEL:
        base = LogisticRegression(
            max_iter=2000,
            class_weight="balanced",
            solver="liblinear",
            random_state=cfg.RANDOM_STATE,
        )
        models["logistica_calibrada"] = make_calibrated_estimator(
            base, method=cfg.CALIBRATION_METHOD, cv=calibration_cv
        )
 
    if cfg.USE_LIGHTGBM and HAS_LGBM:
        models["lightgbm"] = lgb.LGBMClassifier(
            n_estimators=350,
            learning_rate=0.03,
            num_leaves=24,
            subsample=0.85,
            colsample_bytree=0.85,
            class_weight="balanced",
            random_state=cfg.RANDOM_STATE,
            verbosity=-1,
        )
    return models
 
 
# %%
# =============================================================================
# 9. VALIDACION, UMBRAL Y METRICAS
# =============================================================================
 
def capture_top_fraction(y_true: np.ndarray, scores: np.ndarray, fraction: float) -> float:
    if len(y_true) == 0 or y_true.sum() == 0:
        return np.nan
    n = max(1, int(math.ceil(len(y_true) * fraction)))
    indices = np.argsort(-scores)[:n]
    return float(y_true[indices].sum() / y_true.sum())
 
 
def choose_operational_threshold(y_true: np.ndarray, scores: np.ndarray, cfg: ProjectConfig) -> Tuple[float, pd.DataFrame]:
    y_true = np.asarray(y_true).astype(int)
    scores = np.asarray(scores).astype(float)
    if len(np.unique(y_true)) < 2:
        threshold = float(np.nanquantile(scores, 0.90)) if len(scores) else cfg.DEFAULT_DECISION_THRESHOLD
        return threshold, pd.DataFrame()
 
    precision, recall, thresholds = precision_recall_curve(y_true, scores)
    rows: List[Dict[str, Any]] = []
    beta = 2.0 if cfg.THRESHOLD_OBJECTIVE == "f2" else 1.0
 
    for idx, threshold in enumerate(thresholds):
        pred = (scores >= threshold).astype(int)
        alert_rate = float(pred.mean())
        p = float(precision[idx])
        r = float(recall[idx])
        f_beta = (1 + beta ** 2) * p * r / max(beta ** 2 * p + r, 1e-12)
        rows.append({
            "threshold": float(threshold),
            "precision": p,
            "recall": r,
            "alert_rate": alert_rate,
            "f_beta": f_beta,
            "eligible": int(r >= cfg.DECISION_MIN_RECALL and alert_rate <= cfg.DECISION_MAX_ALERT_RATE),
        })
 
    table = pd.DataFrame(rows)
    eligible = table[table["eligible"].eq(1)]
    if not eligible.empty:
        best = eligible.sort_values(["f_beta", "recall", "precision"], ascending=False).iloc[0]
    else:
        best = table.sort_values(["f_beta", "recall"], ascending=False).iloc[0]
    return float(best["threshold"]), table
 
 
def evaluate_scores(y_true: np.ndarray, scores: np.ndarray, threshold: float) -> Dict[str, Any]:
    y_true = np.asarray(y_true).astype(int)
    scores = np.asarray(scores).astype(float)
    pred = (scores >= threshold).astype(int)
    tn, fp, fn, tp = confusion_matrix(y_true, pred, labels=[0, 1]).ravel()
    prevalence = float(y_true.mean()) if len(y_true) else np.nan
    capture_10 = capture_top_fraction(y_true, scores, 0.10)
    # capture_top_fraction redondea hacia arriba (ceil) el numero de filas del "top 10%", por lo
    # que en muestras pequenas la fraccion REALMENTE seleccionada puede ser bastante mayor al
    # 10% nominal. Usar 0.10 fijo como denominador del lift sobreestima sistematicamente la
    # capacidad discriminativa en los conjuntos de prueba pequenos con los que este pipeline
    # suele operar; se usa la fraccion real como denominador.
    actual_top_fraction = (
        max(1, int(math.ceil(len(y_true) * 0.10))) / len(y_true) if len(y_true) else np.nan
    )
    return {
        "auc_roc": safe_metric(roc_auc_score, y_true, scores),
        "pr_auc": safe_metric(average_precision_score, y_true, scores),
        "brier": safe_metric(brier_score_loss, y_true, scores),
        "sensitivity": recall_score(y_true, pred, zero_division=0),
        "specificity": tn / (tn + fp) if (tn + fp) else np.nan,
        "precision": precision_score(y_true, pred, zero_division=0),
        "f1": f1_score(y_true, pred, zero_division=0),
        "alert_rate": float(pred.mean()),
        "prevalence": prevalence,
        "lift_top_10pct": (
            capture_10 / actual_top_fraction
            if prevalence and prevalence > 0 and actual_top_fraction
            else np.nan
        ),
        "capture_top_10pct": capture_10,
        "top_fraction_real_usada": actual_top_fraction,
        "tn": int(tn), "fp": int(fp), "fn": int(fn), "tp": int(tp),
    }
 
 
def build_cv_splits(train_df: pd.DataFrame, target_col: str, key: str, cfg: ProjectConfig) -> List[Tuple[np.ndarray, np.ndarray]]:
    y = train_df[target_col].astype(int).values
    positives = int(y.sum())
    negatives = int((1 - y).sum())
    n_splits = min(cfg.N_CV_FOLDS, positives, negatives)
    if n_splits < 2:
        return []
 
    if HAS_STRATIFIED_GROUP_KFOLD and key in train_df.columns:
        # Agrupar por la llave de la unidad analitica (persona, cargo o centro) sin importar
        # cual sea: una misma entidad se repite en varios meses del panel, y dejarla sin
        # agrupar (como ocurria antes solo para cargo_mes/centro_mes) permite que meses de la
        # misma entidad queden repartidos entre entrenamiento y validacion dentro del CV.
        groups = train_df[key].astype(str).values
        splitter = StratifiedGroupKFold(n_splits=n_splits, shuffle=True, random_state=cfg.RANDOM_STATE)
        return list(splitter.split(train_df, y, groups))
 
    splitter = StratifiedKFold(n_splits=n_splits, shuffle=True, random_state=cfg.RANDOM_STATE)
    return list(splitter.split(train_df, y))
 
 
def cross_validate_pipeline(
    pipeline: Pipeline,
    train_df: pd.DataFrame,
    feature_cols: List[str],
    target_col: str,
    splits: List[Tuple[np.ndarray, np.ndarray]],
    log: Optional["RunLog"] = None,
    context: str = "",
) -> Dict[str, float]:
    if not splits:
        return {"cv_pr_auc": np.nan, "cv_auc_roc": np.nan, "cv_brier": np.nan}
    metrics: List[Dict[str, float]] = []
    for fold_idx, (train_idx, valid_idx) in enumerate(splits):
        fold_model = clone(pipeline)
        X_train = train_df.iloc[train_idx][feature_cols]
        y_train = train_df.iloc[train_idx][target_col].astype(int).values
        X_valid = train_df.iloc[valid_idx][feature_cols]
        y_valid = train_df.iloc[valid_idx][target_col].astype(int).values
        try:
            fold_model.fit(X_train, y_train)
            scores = fold_model.predict_proba(X_valid)[:, 1]
            metrics.append({
                "pr_auc": safe_metric(average_precision_score, y_valid, scores),
                "auc_roc": safe_metric(roc_auc_score, y_valid, scores),
                "brier": safe_metric(brier_score_loss, y_valid, scores),
            })
        except Exception as exc:
            if log is not None:
                log.add("cv", "WARN", f"{context}: fold {fold_idx} de validacion cruzada fallo: {exc}")
            continue
    if not metrics:
        return {"cv_pr_auc": np.nan, "cv_auc_roc": np.nan, "cv_brier": np.nan}
    frame = pd.DataFrame(metrics)
    return {
        "cv_pr_auc": float(frame["pr_auc"].mean()),
        "cv_auc_roc": float(frame["auc_roc"].mean()),
        "cv_brier": float(frame["brier"].mean()),
    }


# %%
# =============================================================================
# 10. ENTRENAMIENTO POR HORIZONTE Y FALLBACK TRANSPARENTE
# =============================================================================
 
def compute_calibration_error(y_true: np.ndarray, scores: np.ndarray, n_bins: int = 8) -> float:
    """Error de calibracion real (maxima brecha absoluta entre frecuencia observada y score
    medio predicho por bin de cuantiles), en vez de compararlo indirectamente contra el Brier
    de un predictor trivial (que puede confundir buena discriminacion con buena calibracion)."""
    y_true = np.asarray(y_true).astype(int)
    scores = np.asarray(scores).astype(float)
    if len(np.unique(y_true)) < 2 or len(y_true) < 20:
        return np.nan
    try:
        frac_pos, mean_pred = calibration_curve(y_true, scores, n_bins=n_bins, strategy="quantile")
        return float(np.max(np.abs(frac_pos - mean_pred)))
    except Exception:
        return np.nan


def train_one_horizon(
    analytic_df: pd.DataFrame,
    horizon: int,
    key: str,
    cfg: ProjectConfig,
    dirs: Dict[str, Path],
    log: RunLog,
) -> Dict[str, Any]:
    target_col = f"target_el_{horizon}m"
    eligibility_col = f"target_eligible_{horizon}m"
    eligible = analytic_df[analytic_df[eligibility_col].eq(1)].copy()
    positives = int(eligible[target_col].sum())
    negatives = int((eligible[target_col] == 0).sum())

    result: Dict[str, Any] = {
        "horizon": horizon,
        "target_col": target_col,
        "status": "not_trained",
        "positives": positives,
        "negatives": negatives,
    }

    if positives < cfg.MIN_POSITIVES_TO_TRAIN or negatives < cfg.MIN_NEGATIVES_TO_TRAIN:
        result["reason"] = (
            f"Masa critica insuficiente: positivos={positives}, negativos={negatives}; "
            f"minimos={cfg.MIN_POSITIVES_TO_TRAIN}/{cfg.MIN_NEGATIVES_TO_TRAIN}."
        )
        log.add("modelo", "WARN", f"Horizonte {horizon}m no entrenado: {result['reason']}")
        return result

    try:
        train_df, test_df, cutoff, split_method = temporal_train_test_split(eligible, target_col, eligibility_col, cfg)
    except Exception as exc:
        result["reason"] = f"No fue posible crear split temporal: {exc}"
        log.add("modelo", "WARN", f"Horizonte {horizon}m no entrenado: {result['reason']}")
        return result

    if train_df[target_col].nunique() < 2 or test_df[target_col].nunique() < 2:
        result["reason"] = "El split temporal no contiene ambas clases en entrenamiento y prueba."
        log.add("modelo", "WARN", f"Horizonte {horizon}m no entrenado: {result['reason']}")
        return result

    if split_method != "criterio_completo":
        log.add(
            "modelo", "WARN",
            f"Horizonte {horizon}m: el split temporal uso el respaldo de ultimo tercio (test con "
            f"{int(test_df[target_col].sum())} positivos, por debajo del minimo configurado de "
            f"{cfg.MIN_TEST_POSITIVES}). Las metricas de prueba de este horizonte son de "
            "confiabilidad reducida (ver columna split_method).",
        )

    feature_cols, numeric_cols, categorical_cols, feature_trace = select_feature_columns(train_df, target_col, cfg)
    numeric_cols, multicol = filter_multicollinear(train_df, numeric_cols, cfg.MULTICOLLINEARITY_THRESHOLD)
    dropped = set(multicol.get("feature_eliminada", pd.Series(dtype=str)).tolist()) if not multicol.empty else set()
    feature_cols = [c for c in feature_cols if c not in dropped]
    categorical_cols = [c for c in categorical_cols if c in feature_cols]

    if not feature_cols:
        result["reason"] = "No quedaron variables elegibles despues de los controles de calidad y fuga."
        log.add("modelo", "WARN", f"Horizonte {horizon}m no entrenado: {result['reason']}")
        return result

    preprocessor = build_preprocessor(numeric_cols, categorical_cols)
    calibration_cv = max(2, min(3, int(train_df[target_col].sum())))
    candidates = build_candidate_models(cfg, calibration_cv)
    cv_splits = build_cv_splits(train_df, target_col, key, cfg)

    # Validacion temporal interna: separada DENTRO del propio periodo de entrenamiento, previa y
    # distinta del test final. Se usa para elegir modelo (cuando la CV agrupada no es viable) y
    # para elegir el umbral operativo, de forma que el test quede reservado exclusivamente para
    # reportar el desempeno final sin haber influido en ninguna decision previa.
    actual_train_df, validation_df = carve_validation_slice(train_df, target_col, cfg)
    has_validation = validation_df is not None
    if not has_validation:
        log.add(
            "modelo", "WARN",
            f"Horizonte {horizon}m: no fue posible separar una validacion temporal interna "
            "(historia o positivos insuficientes). La seleccion de modelo dependera solo de la "
            "validacion cruzada agrupada, y el umbral operativo usara el valor por defecto de "
            "configuracion en vez de una busqueda validada.",
        )

    rows: List[Dict[str, Any]] = []
    fitted: Dict[str, Pipeline] = {}
    thresholds: Dict[str, float] = {}
    threshold_tables: Dict[str, pd.DataFrame] = {}
    predictions: Dict[str, np.ndarray] = {}
    selection_source: Dict[str, str] = {}

    X_train_full = train_df[feature_cols]
    y_train_full = train_df[target_col].astype(int).values
    X_test = test_df[feature_cols]
    y_test = test_df[target_col].astype(int).values

    if has_validation:
        X_actual_train = actual_train_df[feature_cols]
        y_actual_train = actual_train_df[target_col].astype(int).values
        X_validation = validation_df[feature_cols]
        y_validation = validation_df[target_col].astype(int).values

    for name, estimator in candidates.items():
        try:
            cv_metrics = cross_validate_pipeline(
                Pipeline([("preprocessor", clone(preprocessor)), ("model", clone(estimator))]),
                train_df, feature_cols, target_col, cv_splits,
                log=log, context=f"{horizon}m/{name}",
            )
            cv_reliable = any(pd.notna(v) for v in cv_metrics.values())

            validation_metrics = {"cv_pr_auc": np.nan, "cv_auc_roc": np.nan, "cv_brier": np.nan}
            if has_validation:
                validation_pipeline = Pipeline([
                    ("preprocessor", clone(preprocessor)),
                    ("model", clone(estimator)),
                ])
                validation_pipeline.fit(X_actual_train, y_actual_train)
                validation_scores = validation_pipeline.predict_proba(X_validation)[:, 1]
                threshold, threshold_table = choose_operational_threshold(y_validation, validation_scores, cfg)
                validation_metrics = {
                    "cv_pr_auc": safe_metric(average_precision_score, y_validation, validation_scores),
                    "cv_auc_roc": safe_metric(roc_auc_score, y_validation, validation_scores),
                    "cv_brier": safe_metric(brier_score_loss, y_validation, validation_scores),
                }
            else:
                threshold, threshold_table = cfg.DEFAULT_DECISION_THRESHOLD, pd.DataFrame()

            # Modelo final: reentrenado con TODO el periodo de entrenamiento (incluida la
            # validacion interna). El test se toca una unica vez, con el umbral ya fijado antes
            # de mirarlo, exclusivamente para reportar desempeno.
            final_pipeline = Pipeline([
                ("preprocessor", clone(preprocessor)),
                ("model", clone(estimator)),
            ])
            final_pipeline.fit(X_train_full, y_train_full)
            test_scores = final_pipeline.predict_proba(X_test)[:, 1]
            metrics = evaluate_scores(y_test, test_scores, threshold)

            row = {
                "horizon_months": horizon,
                "model": name,
                "threshold": threshold,
                "train_rows": len(train_df),
                "test_rows": len(test_df),
                "train_positives": int(y_train_full.sum()),
                "test_positives": int(y_test.sum()),
                "temporal_cutoff": cutoff,
                "split_method": split_method,
            }
            row.update(cv_metrics if cv_reliable else validation_metrics)
            row.update(metrics)
            rows.append(row)
            fitted[name] = final_pipeline
            thresholds[name] = threshold
            threshold_tables[name] = threshold_table
            predictions[name] = test_scores
            selection_source[name] = (
                "validacion_cruzada_agrupada" if cv_reliable
                else ("validacion_temporal_interna" if has_validation else "sin_validacion_confiable")
            )
        except Exception as exc:
            rows.append({
                "horizon_months": horizon,
                "model": name,
                "error": str(exc),
                "train_rows": len(train_df),
                "test_rows": len(test_df),
            })
            log.add("modelo", "ERROR", f"{horizon}m / {name}: {exc}")

    metrics_df = pd.DataFrame(rows)
    usable = metrics_df[metrics_df.get("pr_auc", pd.Series(index=metrics_df.index, dtype=float)).notna()].copy()
    if usable.empty:
        result["reason"] = "Todos los modelos candidatos fallaron o no produjeron metricas validas."
        result["metrics"] = metrics_df
        return result

    # IMPORTANTE: a diferencia de la version anterior, aqui NUNCA se usan las metricas de test
    # (pr_auc/auc_roc/brier) como respaldo de seleccion. cv_pr_auc/cv_auc_roc/cv_brier ya
    # contienen, segun el caso, la metrica de CV agrupada o la de la validacion temporal interna
    # (nunca la de test); si ninguna de las dos estuvo disponible, quedan en NaN a proposito.
    usable["selection_pr"] = usable["cv_pr_auc"]
    usable["selection_auc"] = usable["cv_auc_roc"]
    usable["selection_brier"] = usable["cv_brier"]
    reliable = usable[usable["selection_pr"].notna()]
    if reliable.empty:
        # Ningun candidato tuvo CV agrupada ni validacion interna disponibles: no hay senal
        # honesta para elegir modelo. Se usa un candidato fijo y predecible en vez de recurrir a
        # las metricas de test, y se marca explicitamente la confianza reducida de la seleccion.
        preferred_order = [
            "logistica_calibrada", "logistica_balanceada",
            "random_forest_balanceado", "gradient_boosting", "lightgbm",
        ]
        available_names = usable["model"].tolist()
        chosen_name = next((n for n in preferred_order if n in available_names), available_names[0])
        best_row = usable[usable["model"] == chosen_name].iloc[0]
        selection_confidence = "no_confiable_seleccion_por_defecto"
    else:
        best_row = reliable.sort_values(
            ["selection_pr", "selection_auc", "selection_brier"],
            ascending=[False, False, True],
        ).iloc[0]
        selection_confidence = selection_source.get(str(best_row["model"]), "desconocida")

    best_name = str(best_row["model"])
    best_model = fitted[best_name]
    best_threshold = thresholds[best_name]
    best_scores = predictions[best_name]

    calibration_error = compute_calibration_error(y_test, best_scores)
    calibration_status = (
        "probabilidad_bien_calibrada_candidata"
        if pd.notna(calibration_error) and calibration_error <= 0.05
        else "score_relativo_no_interpretar_como_probabilidad_absoluta"
    )

    if cfg.PERSIST_MODELS:
        joblib.dump(best_model, dirs["models"] / f"modelo_{horizon}m_{best_name}.joblib")

    save_df(metrics_df, dirs["tables"] / f"metricas_modelos_{horizon}m.csv")
    save_df(feature_trace, dirs["tables"] / f"trazabilidad_features_{horizon}m.csv")
    if not multicol.empty:
        save_df(multicol, dirs["tables"] / f"multicolinealidad_{horizon}m.csv")
    if not threshold_tables[best_name].empty:
        save_df(threshold_tables[best_name], dirs["tables"] / f"umbrales_{horizon}m_{best_name}.csv")

    result.update({
        "status": "trained",
        "model_name": best_name,
        "model": best_model,
        "threshold": best_threshold,
        "feature_cols": feature_cols,
        "numeric_cols": numeric_cols,
        "categorical_cols": categorical_cols,
        "train_df": train_df,
        "test_df": test_df,
        "test_scores": best_scores,
        "metrics": metrics_df,
        "best_metrics": best_row.to_dict(),
        "calibration_status": calibration_status,
        "calibration_error": calibration_error,
        "selection_confidence": selection_confidence,
        "split_method": split_method,
        "cutoff": cutoff,
    })
    log.add(
        "modelo", "OK",
        f"Horizonte {horizon}m: {best_name}; PR-AUC={best_row['pr_auc']:.3f}; "
        f"AUC={best_row['auc_roc']:.3f}; Brier={best_row['brier']:.3f}; "
        f"seleccion={selection_confidence}; split={split_method}",
    )
    return result


def empirical_horizon_factors(
    data: Dict[str, pd.DataFrame],
    key: str,
    horizons: Sequence[int],
    cfg: ProjectConfig,
) -> Tuple[Dict[int, float], pd.DataFrame]:
    el = data.get("casos_el", pd.DataFrame())
    if el.empty or key not in el.columns or "periodo" not in el.columns:
        return {int(h): 1.0 for h in horizons}, pd.DataFrame()
 
    signals: List[pd.DataFrame] = []
    for source in ["ausentismo_comun", "accidentalidad", "veo"]:
        df = data.get(source, pd.DataFrame())
        if not df.empty and key in df.columns and "periodo" in df.columns:
            signals.append(df[[key, "periodo"]].dropna())
    if not signals:
        return {int(h): 1.0 for h in horizons}, pd.DataFrame()
 
    signal_df = pd.concat(signals, ignore_index=True)
    first_signal = signal_df.groupby(key)["periodo"].min()
    classified = classify_el_records(el, cfg)
    confirmed = classified[classified["el_confirmed"].eq(1)].groupby(key)["periodo"].min()
    matched = pd.concat([first_signal.rename("first_signal"), confirmed.rename("first_el")], axis=1).dropna()
    matched["lag_months"] = month_int(matched["first_el"]) - month_int(matched["first_signal"])
    matched = matched[matched["lag_months"] >= 0]
 
    if len(matched) < 5:
        return {int(h): 1.0 for h in horizons}, matched.reset_index()
 
    factors = {int(h): float((matched["lag_months"] <= h).mean()) for h in horizons}
    max_factor = max(factors.values()) if factors else 1.0
    if max_factor <= 0:
        factors = {int(h): 1.0 for h in horizons}
    return factors, matched.reset_index()
 
 
def transparent_fallback_score(current: pd.DataFrame, cfg: ProjectConfig) -> Tuple[pd.Series, List[str]]:
    available: List[str] = []
    for hint in cfg.FALLBACK_FEATURE_HINTS:
        if hint in current.columns and pd.to_numeric(current[hint], errors="coerce").notna().any():
            available.append(hint)
 
    if not available:
        numeric = [
            c for c in current.columns
            if pd.api.types.is_numeric_dtype(current[c])
            and c not in {"period_int", "target_eligible"}
            and not c.startswith("target_el_")
        ]
        available = numeric[:8]
 
    if not available:
        return pd.Series(0.0, index=current.index), []
 
    ranks = []
    for col in available:
        values = pd.to_numeric(current[col], errors="coerce").fillna(0)
        ranks.append(values.rank(pct=True, method="average"))
    score = pd.concat(ranks, axis=1).mean(axis=1).clip(0, 1)
    return score, available
 
 
# %%
# =============================================================================
# 11. SCORING ACTUAL, PRIORIZACION Y AGREGACIONES
# =============================================================================
 
def score_current_population(
    analytic_df: pd.DataFrame,
    horizon_models: Dict[int, Dict[str, Any]],
    data: Dict[str, pd.DataFrame],
    key: str,
    cfg: ProjectConfig,
    log: RunLog,
) -> Tuple[pd.DataFrame, pd.DataFrame]:
    all_periods = sorted(analytic_df["periodo"].dropna().unique())
    # Colchon de rezago de reporte: las fuentes de eventos (ausentismo, AT, VEO) suelen tener
    # una demora de captura de varias semanas respecto a nomina/estructura. Puntuar literalmente
    # el ultimo mes del panel puede subestimar el score de la poblacion actual porque sus
    # conteos de eventos "del propio mes" (sin rezago, a diferencia de las versiones _rollN) aun
    # no estan completos. Por defecto se puntua el penultimo mes cerrado (configurable).
    lag = max(0, int(cfg.SCORING_REPORT_LAG_MONTHS))
    if lag and len(all_periods) > lag:
        latest_period = all_periods[-(lag + 1)]
    else:
        latest_period = all_periods[-1] if all_periods else analytic_df["periodo"].max()
    current = analytic_df[analytic_df["periodo"].eq(latest_period)].copy()
    factors, lag_table = empirical_horizon_factors(data, key, cfg.HORIZONS_MONTHS, cfg)
 
    trained_horizons = [h for h, meta in horizon_models.items() if meta.get("status") == "trained"]
    fallback_score: Optional[pd.Series] = None
    fallback_features: List[str] = []
 
    for horizon in cfg.HORIZONS_MONTHS:
        meta = horizon_models[horizon]
        score_col = f"score_el_{horizon}m"
        alert_col = f"alerta_el_{horizon}m"
        method_col = f"metodo_{horizon}m"
 
        if meta.get("status") == "trained":
            features = meta["feature_cols"]
            current[score_col] = meta["model"].predict_proba(current[features])[:, 1]
            current[alert_col] = (current[score_col] >= float(meta["threshold"])).astype(int)
            current[method_col] = meta["calibration_status"]
        elif trained_horizons:
            nearest = min(trained_horizons, key=lambda h: abs(h - horizon))
            nearest_meta = horizon_models[nearest]
            base = nearest_meta["model"].predict_proba(current[nearest_meta["feature_cols"]])[:, 1]
            factor = factors.get(int(horizon), 1.0)
            current[score_col] = np.clip(base * factor, 0, 1)
            # Conserva el umbral relativo del modelo base. No interpreta el resultado como probabilidad.
            current[alert_col] = (base >= float(nearest_meta["threshold"])).astype(int)
            current[method_col] = f"score_base_{nearest}m_x_factor_lag_{factor:.3f}; no_probabilidad_absoluta"
        elif cfg.ENABLE_TRANSPARENT_FALLBACK:
            if fallback_score is None:
                fallback_score, fallback_features = transparent_fallback_score(current, cfg)
            current[score_col] = fallback_score
            high_cut = current[score_col].quantile(1 - cfg.FALLBACK_TOP_HIGH)
            current[alert_col] = (current[score_col] >= high_cut).astype(int)
            current[method_col] = "fallback_percentil_transparente_no_modelo"
        else:
            current[score_col] = np.nan
            current[alert_col] = 0
            current[method_col] = "sin_modelo_sin_fallback"
 
    score_cols = [f"score_el_{h}m" for h in cfg.HORIZONS_MONTHS]
    alert_cols = [f"alerta_el_{h}m" for h in cfg.HORIZONS_MONTHS]
    current["score_max"] = current[score_cols].max(axis=1, skipna=True)
    current["alerta_any"] = current[alert_cols].max(axis=1)
    current["score_percentile"] = current["score_max"].rank(pct=True, method="average")
 
    high = current["score_percentile"] >= 1 - cfg.FALLBACK_TOP_HIGH
    medium = current["score_percentile"] >= 1 - cfg.FALLBACK_TOP_MEDIUM
    current["prioridad_integrada"] = np.select(
        [current["alerta_any"].eq(1) | high, medium],
        ["Alta", "Media"],
        default="Baja",
    )
 
    driver_candidates = [
        c for c in current.columns
        if any(token in c for token in ["roll12", "roll24", "risk_exposure", "risk_level", "tenure"])
        and pd.api.types.is_numeric_dtype(current[c])
    ]
    percentiles = {c: pd.to_numeric(current[c], errors="coerce").rank(pct=True) for c in driver_candidates}
 
    def drivers(row_index: Any) -> str:
        values = []
        for col in driver_candidates:
            pct = percentiles[col].loc[row_index]
            if pd.notna(pct) and pct >= 0.75:
                values.append(col)
        return "; ".join(values[:6]) if values else "sin_señales_altas_disponibles"
 
    current["drivers_disponibles"] = [drivers(idx) for idx in current.index]
 
    fallback_meta = pd.DataFrame([{
        "latest_period": latest_period,
        "trained_horizons": ",".join(map(str, trained_horizons)),
        "empirical_lag_cases": len(lag_table),
        "fallback_features": ", ".join(fallback_features),
    }])
    log.add("scoring", "OK", f"Población puntuada en {latest_period:%Y-%m}: {len(current)} entidades")
    return current, fallback_meta
 
 
def aggregate_priority(scored: pd.DataFrame, dimension: str, min_n: int = 30) -> pd.DataFrame:
    if dimension not in scored.columns:
        return pd.DataFrame()
    work = scored[scored[dimension].notna()].copy()
    if work.empty:
        return pd.DataFrame()

    rows: List[Dict[str, Any]] = []
    for value, grp in work.groupby(dimension, dropna=False):
        n = len(grp)
        mean_score = float(grp["score_max"].mean())
        se = float(grp["score_max"].std(ddof=1) / math.sqrt(n)) if n > 1 else np.nan
        # Igual que fairness_diagnostics, se exige un tamano muestral minimo antes de mostrar
        # un intervalo de confianza: con n pequeno (comun en cargos de nicho) la aproximacion
        # normal de Wald sobre un score acotado en [0,1] no es confiable.
        small_sample = n < min_n
        rows.append({
            dimension: value,
            "n_entities": n,
            "score_mean": mean_score,
            "score_median": float(grp["score_max"].median()),
            "score_ci95_low": max(0.0, mean_score - 1.96 * se) if pd.notna(se) and not small_sample else np.nan,
            "score_ci95_high": min(1.0, mean_score + 1.96 * se) if pd.notna(se) and not small_sample else np.nan,
            "small_sample_warning": int(small_sample),
            "alerts": int(grp["alerta_any"].sum()),
            "alert_rate": float(grp["alerta_any"].mean()),
            "high_priority": int(grp["prioridad_integrada"].eq("Alta").sum()),
        })
    return pd.DataFrame(rows).sort_values(["score_mean", "n_entities"], ascending=[False, False])


def plot_priority(table: pd.DataFrame, dimension: str, path: Path, top_n: int = 15) -> None:
    if table.empty:
        return
    top = table.head(top_n).sort_values("score_mean")
    plt.figure(figsize=(10, 6))
    plt.barh(top[dimension].astype(str), top["score_mean"])
    plt.xlabel("Score medio de riesgo")
    plt.ylabel(dimension)
    plt.title(f"Priorización preventiva por {dimension}")
    plt.tight_layout()
    plt.savefig(path, dpi=170, bbox_inches="tight")
    plt.close()
 
 
# %%
# =============================================================================
# 12. EXPLICABILIDAD, EQUIDAD Y DRIFT
# =============================================================================
 
def compute_permutation_importance_table(
    meta: Dict[str, Any], dirs: Dict[str, Path], log: Optional["RunLog"] = None
) -> pd.DataFrame:
    if meta.get("status") != "trained":
        return pd.DataFrame()
    test_df = meta["test_df"]
    feature_cols = meta["feature_cols"]
    target_col = meta["target_col"]
    try:
        result = permutation_importance(
            meta["model"],
            test_df[feature_cols],
            test_df[target_col].astype(int).values,
            n_repeats=8,
            scoring="average_precision",
            random_state=42,
            n_jobs=-1,
        )
        table = pd.DataFrame({
            "feature": feature_cols,
            "importance_mean": result.importances_mean,
            "importance_std": result.importances_std,
        }).sort_values("importance_mean", ascending=False)

        top = table.head(15).sort_values("importance_mean")
        plt.figure(figsize=(9, 6))
        plt.barh(top["feature"], top["importance_mean"])
        plt.xlabel("Disminucion media de PR-AUC al permutar")
        plt.ylabel("Variable")
        plt.title(f"Importancia por permutacion - {meta['horizon']} meses")
        plt.tight_layout()
        plt.savefig(dirs["figures"] / f"importancia_permutacion_{meta['horizon']}m.png", dpi=170, bbox_inches="tight")
        plt.close()
        return table
    except Exception as exc:
        if log is not None:
            log.add("importancia", "WARN", f"Horizonte {meta.get('horizon')}: importancia por permutacion fallo: {exc}")
        return pd.DataFrame()


def fairness_diagnostics(scored: pd.DataFrame, dimension: str, min_n: int = 30) -> pd.DataFrame:
    if dimension not in scored.columns:
        return pd.DataFrame()
    rows: List[Dict[str, Any]] = []
    for value, grp in scored.groupby(dimension, dropna=False):
        rows.append({
            "dimension": dimension,
            "group": value,
            "n": len(grp),
            "score_mean": float(grp["score_max"].mean()),
            "alert_rate": float(grp["alerta_any"].mean()),
            "high_priority_rate": float(grp["prioridad_integrada"].eq("Alta").mean()),
            "small_group_warning": int(len(grp) < min_n),
        })
    return pd.DataFrame(rows)
 
 
def psi(expected: pd.Series, actual: pd.Series, bins: int = 10, min_samples_per_bin: int = 20) -> float:
    exp = pd.to_numeric(expected, errors="coerce").dropna()
    act = pd.to_numeric(actual, errors="coerce").dropna()
    # El piso minimo escala con la cantidad de bins: con pocos registros por bin, el PSI queda
    # dominado por ruido de muestreo (el logaritmo de la formula amplifica esas diferencias)
    # en vez de reflejar un desplazamiento real de la distribucion.
    min_n = max(bins * min_samples_per_bin, 50)
    if len(exp) < min_n or len(act) < min_n:
        return np.nan
    quantiles = np.unique(np.nanquantile(exp, np.linspace(0, 1, bins + 1)))
    if len(quantiles) < 3:
        return np.nan
    quantiles[0] = -np.inf
    quantiles[-1] = np.inf
    exp_counts = pd.cut(exp, bins=quantiles, include_lowest=True).value_counts(sort=False, normalize=True)
    act_counts = pd.cut(act, bins=quantiles, include_lowest=True).value_counts(sort=False, normalize=True)
    exp_pct = np.clip(exp_counts.values, 1e-6, None)
    act_pct = np.clip(act_counts.values, 1e-6, None)
    return float(np.sum((act_pct - exp_pct) * np.log(act_pct / exp_pct)))


def drift_report(meta: Dict[str, Any], current: pd.DataFrame, cfg: ProjectConfig) -> pd.DataFrame:
    if meta.get("status") != "trained" or not cfg.ENABLE_DRIFT_MONITORING:
        return pd.DataFrame()
    train = meta["train_df"]
    rows: List[Dict[str, Any]] = []
    for col in meta["numeric_cols"]:
        if col in current.columns:
            value = psi(train[col], current[col], min_samples_per_bin=cfg.PSI_MIN_SAMPLES_PER_BIN)
            rows.append({
                "feature": col,
                "psi": value,
                "alert": int(pd.notna(value) and value >= cfg.PSI_ALERT_THRESHOLD),
                "threshold": cfg.PSI_ALERT_THRESHOLD,
            })
    return pd.DataFrame(rows).sort_values("psi", ascending=False, na_position="last")


def plot_model_comparison(metrics: pd.DataFrame, horizon: int, path: Path) -> None:
    usable = metrics.dropna(subset=["pr_auc"]).copy() if "pr_auc" in metrics.columns else pd.DataFrame()
    if usable.empty:
        return
    usable = usable.sort_values("pr_auc")
    plt.figure(figsize=(9, 5))
    plt.barh(usable["model"], usable["pr_auc"])
    plt.xlabel("PR-AUC en prueba temporal")
    plt.ylabel("Modelo")
    plt.title(f"Comparación de modelos - horizonte {horizon} meses")
    plt.tight_layout()
    plt.savefig(path, dpi=170, bbox_inches="tight")
    plt.close()
 
 
def plot_roc(meta: Dict[str, Any], path: Path) -> None:
    if meta.get("status") != "trained":
        return
    y = meta["test_df"][meta["target_col"]].astype(int).values
    scores = meta["test_scores"]
    if len(np.unique(y)) < 2:
        return
    fpr, tpr, _ = roc_curve(y, scores)
    plt.figure(figsize=(6, 6))
    plt.plot(fpr, tpr, label=f"AUC={roc_auc_score(y, scores):.3f}")
    plt.plot([0, 1], [0, 1], linestyle="--")
    plt.xlabel("1 - Especificidad")
    plt.ylabel("Sensibilidad")
    plt.title(f"ROC - {meta['horizon']} meses")
    plt.legend()
    plt.tight_layout()
    plt.savefig(path, dpi=170, bbox_inches="tight")
    plt.close()
 
 
def plot_pr(meta: Dict[str, Any], path: Path) -> None:
    if meta.get("status") != "trained":
        return
    y = meta["test_df"][meta["target_col"]].astype(int).values
    scores = meta["test_scores"]
    if len(np.unique(y)) < 2:
        return
    precision, recall, _ = precision_recall_curve(y, scores)
    plt.figure(figsize=(6, 6))
    plt.plot(recall, precision, label=f"PR-AUC={average_precision_score(y, scores):.3f}")
    plt.axhline(y.mean(), linestyle="--", label=f"Prevalencia={y.mean():.3f}")
    plt.xlabel("Sensibilidad")
    plt.ylabel("Precisión")
    plt.title(f"Precision-Recall - {meta['horizon']} meses")
    plt.legend()
    plt.tight_layout()
    plt.savefig(path, dpi=170, bbox_inches="tight")
    plt.close()
 
 
def plot_calibration_curve(meta: Dict[str, Any], path: Path) -> None:
    if meta.get("status") != "trained":
        return
    y = meta["test_df"][meta["target_col"]].astype(int).values
    scores = meta["test_scores"]
    if len(np.unique(y)) < 2:
        return
    frac_pos, mean_pred = calibration_curve(y, scores, n_bins=8, strategy="quantile")
    plt.figure(figsize=(6, 6))
    plt.plot(mean_pred, frac_pos, marker="o")
    plt.plot([0, 1], [0, 1], linestyle="--")
    plt.xlabel("Score medio predicho")
    plt.ylabel("Frecuencia observada")
    plt.title(f"Calibración - {meta['horizon']} meses")
    plt.tight_layout()
    plt.savefig(path, dpi=170, bbox_inches="tight")
    plt.close()
 
 
# %%
# =============================================================================
# 13. PLAN DE ACCION, MODEL CARD Y EXPORTACION
# =============================================================================
 
def build_action_plan(priority_tables: Dict[str, pd.DataFrame]) -> pd.DataFrame:
    rows: List[Dict[str, Any]] = []
    for dimension, table in priority_tables.items():
        if table.empty:
            continue
        for _, row in table.head(10).iterrows():
            unit_value = row.get(dimension)
            rows.append({
                "level": dimension,
                "unit": unit_value,
                "finding": (
                    f"Priorización preventiva elevada: score medio={row.get('score_mean', np.nan):.3f}; "
                    f"alertas={int(row.get('alerts', 0))}; n={int(row.get('n_entities', 0))}."
                ),
                "required_validation": (
                    "Verificar calidad del enlace de datos, exposición real del cargo, tendencia de ausentismo, "
                    "AT, señales VEO, controles existentes y pertinencia clínica-ergonómica."
                ),
                "recommended_action": (
                    "Realizar revisión multidisciplinaria; priorizar controles de ingeniería y organización del trabajo; "
                    "definir seguimiento VEO; documentar responsable, fecha e indicador."
                ),
                "responsible": "SG-SST / Medicina laboral / Ergonomía / Operación / Talento humano",
                "indicator": "Cierre de validaciones, avance del plan, exposición residual e incidencia observada",
                "frequency": "Mensual o según criticidad",
                "prohibited_use": "No usar para sanciones, desvinculación, diagnóstico u origen individual.",
            })
    return pd.DataFrame(rows)
 
 
def export_excel_summary(tables: Dict[str, pd.DataFrame], path: Path) -> None:
    with pd.ExcelWriter(path, engine="openpyxl") as writer:
        for name, df in tables.items():
            if df is None or not isinstance(df, pd.DataFrame):
                continue
            safe_name = sanitize_col(name)[:31] or "hoja"
            df.to_excel(writer, sheet_name=safe_name, index=False)
 
 
def create_zip(root: Path, zip_path: Path) -> None:
    with zipfile.ZipFile(zip_path, "w", compression=zipfile.ZIP_DEFLATED) as archive:
        for file in root.rglob("*"):
            if file.is_file() and file != zip_path:
                archive.write(file, arcname=file.relative_to(root))
 
 
def config_hash(cfg: ProjectConfig) -> str:
    relevant = {
        "company": cfg.COMPANY_NAME,
        "unit": cfg.ANALYTIC_UNIT,
        "horizons": cfg.HORIZONS_MONTHS,
        "target_mode": cfg.TARGET_MODE,
        "min_positives": cfg.MIN_POSITIVES_TO_TRAIN,
        "threshold_objective": cfg.THRESHOLD_OBJECTIVE,
        "leakage_prefixes": cfg.LEAKAGE_FEATURE_PREFIXES,
    }
    raw = json.dumps(relevant, sort_keys=True, default=str).encode("utf-8")
    return hashlib.sha256(raw).hexdigest()[:12]
 
 
# %%
# =============================================================================
# 14. ORQUESTACION PRINCIPAL
# =============================================================================
 
def run_pipeline(cfg: ProjectConfig = CONFIG) -> Dict[str, Any]:
    np.random.seed(cfg.RANDOM_STATE)
    dirs = ensure_dirs(cfg)
    log = RunLog()

    validate_privacy_config(cfg)
 
    print("=" * 90)
    print(f"Empresa: {cfg.COMPANY_NAME} | Fecha: {pd.Timestamp.today():%Y-%m-%d}")
    print(f"Periodo: {cfg.PERIOD_LABEL} | Horizontes: {cfg.HORIZONS_MONTHS}")
    print("Finalidad: priorización preventiva; no diagnóstico, no calificación de origen, no uso disciplinario.")
    print("=" * 90)
 
    template_path = create_expected_files_template(dirs)
    inventory = discover_files(cfg, log)
    save_df(inventory, dirs["tables"] / "00_inventario_archivos.csv")
    plot_inventory(inventory, dirs["figures"] / "00_inventario.png")
 
    if inventory.empty:
        log.add(
            "pipeline", "STOP",
            "No se detectaron datos. Se generó la plantilla de fuentes esperadas; no se inventaron resultados.",
            template=str(template_path),
        )
        log_df = log.dataframe()
        save_df(log_df, dirs["logs"] / "log_ejecucion.csv")
        summary = {
            "company": cfg.COMPANY_NAME,
            "status": "sin_datos",
            "template": str(template_path),
            "output_root": str(dirs["root"]),
        }
        safe_json_dump(summary, dirs["root"] / "resumen_pipeline.json")
        return {"inventory": inventory, "log": log_df, "summary": summary}
 
    mapped_raw, mapping_trace = load_and_map_sources(inventory, cfg, log)
    save_df(mapping_trace, dirs["logs"] / "01_trazabilidad_mapeo.csv")
    data = combine_mapped_frames(mapped_raw, log)
 
    quality = build_quality_table(data)
    save_df(quality, dirs["tables"] / "02_calidad_variables.csv")
    plot_missingness(quality, dirs["figures"] / "02_missingness.png")
 
    unit = choose_analytic_unit(data, cfg, log)
    roster = collect_roster(data, unit)
    save_df(apply_export_privacy(roster, cfg), dirs["tables"] / "03_roster_depurado.csv")
 
    panel, key = build_panel(roster, data, unit, cfg, log)
    panel_features, feature_source_trace = add_source_features(panel, data, key, unit, cfg, log)
    save_df(feature_source_trace, dirs["tables"] / "04_trazabilidad_fuentes_features.csv")
 
    target_event_source = build_target_event_source(data, cfg)
    panel_target, target_rules = add_future_targets(
        panel_features,
        target_event_source,
        key,
        cfg,
        log,
    )
    save_df(target_rules, dirs["tables"] / "05_reglas_target.csv")
 
    horizon_models: Dict[int, Dict[str, Any]] = {}
    all_metrics: List[pd.DataFrame] = []
    for horizon in cfg.HORIZONS_MONTHS:
        meta = train_one_horizon(panel_target, horizon, key, cfg, dirs, log)
        horizon_models[horizon] = meta
        if isinstance(meta.get("metrics"), pd.DataFrame):
            all_metrics.append(meta["metrics"])
            plot_model_comparison(
                meta["metrics"], horizon,
                dirs["figures"] / f"06_comparacion_modelos_{horizon}m.png",
            )
        plot_roc(meta, dirs["figures"] / f"06_roc_{horizon}m.png")
        plot_pr(meta, dirs["figures"] / f"06_pr_{horizon}m.png")
        plot_calibration_curve(meta, dirs["figures"] / f"06_calibracion_{horizon}m.png")
 
    metrics_all = pd.concat(all_metrics, ignore_index=True, sort=False) if all_metrics else pd.DataFrame()
    save_df(metrics_all, dirs["tables"] / "06_comparativo_modelos_todos_horizontes.csv")
 
    scored, fallback_meta = score_current_population(panel_target, horizon_models, data, key, cfg, log)
    scored_export = apply_export_privacy(scored, cfg)
    save_df(scored_export, dirs["tables"] / "07_scoring_poblacion_actual.csv")
    save_df(fallback_meta, dirs["tables"] / "07_metodo_scoring_y_fallback.csv")
 
    priority_tables: Dict[str, pd.DataFrame] = {}
    for dimension in ["cargo", "area", "centro"]:
        table = aggregate_priority(scored, dimension)
        priority_tables[dimension] = table
        save_df(table, dirs["tables"] / f"08_priorizacion_{dimension}.csv")
        plot_priority(table, dimension, dirs["figures"] / f"08_priorizacion_{dimension}.png")
 
    importance_tables: List[pd.DataFrame] = []
    drift_tables: List[pd.DataFrame] = []
    for horizon, meta in horizon_models.items():
        if cfg.COMPUTE_PERMUTATION_IMPORTANCE:
            imp = compute_permutation_importance_table(meta, dirs, log=log)
            if not imp.empty:
                imp.insert(0, "horizon_months", horizon)
                importance_tables.append(imp)
        drift = drift_report(meta, scored, cfg)
        if not drift.empty:
            drift.insert(0, "horizon_months", horizon)
            drift_tables.append(drift)
 
    importance_all = pd.concat(importance_tables, ignore_index=True) if importance_tables else pd.DataFrame()
    drift_all = pd.concat(drift_tables, ignore_index=True) if drift_tables else pd.DataFrame()
    save_df(importance_all, dirs["tables"] / "09_importancia_variables.csv")
    save_df(drift_all, dirs["tables"] / "09_drift_psi.csv")
 
    fairness_frames: List[pd.DataFrame] = []
    for dimension in ["sex", "age_band", "centro", "area"]:
        if dimension == "age_band" and "age" in scored.columns:
            scored["age_band"] = pd.cut(
                pd.to_numeric(scored["age"], errors="coerce"),
                bins=[0, 25, 35, 45, 55, 65, np.inf],
                labels=["<25", "25-34", "35-44", "45-54", "55-64", "65+"],
                right=False,
            )
        fairness = fairness_diagnostics(scored, dimension)
        if not fairness.empty:
            fairness_frames.append(fairness)
    fairness_all = pd.concat(fairness_frames, ignore_index=True) if fairness_frames else pd.DataFrame()
    save_df(fairness_all, dirs["tables"] / "10_diagnostico_equidad.csv")
 
    action_plan = build_action_plan(priority_tables)
    save_df(action_plan, dirs["tables"] / "11_plan_accion.csv")
 
    model_status_rows: List[Dict[str, Any]] = []
    for horizon, meta in horizon_models.items():
        model_status_rows.append({
            "horizon_months": horizon,
            "status": meta.get("status"),
            "reason": meta.get("reason"),
            "positives": meta.get("positives"),
            "negatives": meta.get("negatives"),
            "model_name": meta.get("model_name"),
            "threshold": meta.get("threshold"),
            "calibration_status": meta.get("calibration_status"),
            "calibration_error": meta.get("calibration_error"),
            "selection_confidence": meta.get("selection_confidence"),
            "split_method": meta.get("split_method"),
            "temporal_cutoff": meta.get("cutoff"),
        })
    model_status = pd.DataFrame(model_status_rows)
    save_df(model_status, dirs["tables"] / "06_estado_modelos_horizonte.csv")
 
    model_card = {
        "company": cfg.COMPANY_NAME,
        "period_label": cfg.PERIOD_LABEL,
        "analytic_unit": unit,
        "entity_key": key,
        "horizons_months": cfg.HORIZONS_MONTHS,
        "target_mode": cfg.TARGET_MODE,
        "version": config_hash(cfg),
        "generated_at": datetime.now().isoformat(timespec="seconds"),
        "latest_scored_period": str(scored["periodo"].max()) if not scored.empty else None,
        "rows_analytic_panel": len(panel_target),
        "current_entities_scored": len(scored),
        "privacy": {
            "enabled": cfg.ENABLE_PRIVACY_GUARDS,
            "export_identifiable_tables": cfg.EXPORT_IDENTIFIABLE_TABLES,
            "hash_person_id_on_export": cfg.HASH_PERSON_ID_ON_EXPORT,
        },
        "interpretation_rules": [
            "Target histórico no equivale a población priorizada actual.",
            "Score relativo no equivale a probabilidad absoluta calibrada.",
            "Personas sobre umbral no equivalen a casos esperados ni diagnósticos.",
            "La salida se usa para prevención, vigilancia y priorización, no para decisiones disciplinarias.",
        ],
        "known_limitations": [
            "Los atributos de cargo/area/centro (roster) y el riesgo por cargo se toman del "
            "estado mas reciente conocido y se aplican por igual a todo el historial del panel; "
            "si la matriz de riesgos o la estructura organizacional cambiaron materialmente en "
            "el periodo, esto puede introducir una forma leve de informacion futura filtrada "
            "hacia meses pasados (look-ahead) en esas variables especificas.",
            "El panel no modela mas de un ciclo de contratacion por persona: ante un reingreso, "
            "se usa la vinculacion vigente (mayor fecha de ingreso), sin reconstruir el ciclo "
            "anterior por separado.",
            "Revisar selection_confidence y split_method en 06_estado_modelos_horizonte.csv "
            "antes de comunicar metricas: un horizonte con seleccion 'no_confiable_seleccion_"
            "por_defecto' o split 'fallback_ultimo_tercio_baja_confianza' fue validado sobre "
            "una muestra insuficiente y debe interpretarse con cautela adicional.",
            "El submodelo 'logistica_calibrada' usa internamente folds de "
            "CalibratedClassifierCV que NO estan agrupados por persona (a diferencia de la "
            "validacion cruzada agrupada usada para seleccionar modelo y umbral); esto puede "
            "introducir un optimismo leve en su curva de calibracion interna si el mismo "
            "trabajador queda repartido entre esos folds.",
        ],
        "horizon_models": model_status_rows,
    }
    safe_json_dump(model_card, dirs["root"] / "model_card.json")
 
    log_df = log.dataframe()
    save_df(log_df, dirs["logs"] / "log_ejecucion.csv")
 
    summary_tables = {
        "inventario": inventory,
        "mapeo": mapping_trace,
        "calidad": quality,
        "reglas_target": target_rules,
        "estado_modelos": model_status,
        "metricas": metrics_all,
        "scoring_actual": scored_export,
        "prioridad_cargo": priority_tables.get("cargo", pd.DataFrame()),
        "prioridad_area": priority_tables.get("area", pd.DataFrame()),
        "prioridad_centro": priority_tables.get("centro", pd.DataFrame()),
        "importancia": importance_all,
        "equidad": fairness_all,
        "drift": drift_all,
        "plan_accion": action_plan,
        "log": log_df,
    }
    if cfg.EXPORT_EXCEL_SUMMARY:
        export_excel_summary(summary_tables, dirs["root"] / "resumen_prediccion_el.xlsx")
 
    if cfg.CREATE_ZIP:
        create_zip(dirs["root"], dirs["root"].parent / f"{dirs['root'].name}.zip")
 
    summary = {
        "company": cfg.COMPANY_NAME,
        "status": "completed",
        "analytic_unit": unit,
        "entity_key": key,
        "files_detected": int(inventory["file"].nunique()),
        "panel_rows": len(panel_target),
        "current_entities_scored": len(scored),
        "trained_horizons": [h for h, m in horizon_models.items() if m.get("status") == "trained"],
        "output_root": str(dirs["root"]),
        "version": config_hash(cfg),
    }
    safe_json_dump(summary, dirs["root"] / "resumen_pipeline.json")
 
    print("\nResumen final")
    print(json.dumps(summary, ensure_ascii=False, indent=2, default=str))
 
    return {
        "inventory": inventory,
        "mapping_trace": mapping_trace,
        "quality": quality,
        "analytic_unit": unit,
        "entity_key": key,
        "panel": panel_target,
        "horizon_models": horizon_models,
        "scored_current": scored,
        "priority_tables": priority_tables,
        "importance": importance_all,
        "fairness": fairness_all,
        "drift": drift_all,
        "action_plan": action_plan,
        "log": log_df,
        "summary": summary,
    }
 
 
# %%
# =============================================================================
# 15. EJEMPLO DE CONFIGURACION EN COLAB
# =============================================================================
 
if __name__ == "__main__":
    # Ajustar antes de producción.
    CONFIG.COMPANY_NAME = "NOMBRE_EMPRESA"
    CONFIG.PERIOD_LABEL = "YYYY-YYYY"
    CONFIG.ANALYTIC_UNIT = "auto"
    CONFIG.HORIZONS_MONTHS = (12, 36, 60)
    CONFIG.TARGET_MODE = "legal_estricto"
    CONFIG.DATA_ROOT = "/content/data"
    CONFIG.OUTPUT_ROOT = "/content/salida_prediccion_el"
    # OBLIGATORIO: reemplazar por un salt secreto y propio de la empresa antes de ejecutar con
    # datos reales. Si se deja este valor de plantilla, run_pipeline() lo rechaza con un error
    # (validate_privacy_config) en vez de seudonimizar person_id con un salt publico conocido.
    CONFIG.PERSON_ID_HASH_SALT = "CAMBIAR_SALT_ANTES_DE_PRODUCCION"
 
    # Activar o desactivar según disponibilidad real.
    CONFIG.USE_AUSENTISMO_COMUN = True
    CONFIG.USE_AUSENTISMO_LAB = True
    CONFIG.USE_AT = True
    CONFIG.USE_VEO = True
    CONFIG.USE_EL_CASES = True
    CONFIG.USE_RIESGOS_CARGO = True
    CONFIG.USE_ESTRUCTURA = True
    CONFIG.USE_NOMINA = True
 
    # Si el auto-mapeo no es suficiente, declarar de forma explícita:
    # CONFIG.MANUAL_SOURCE_MAP = {
    #     "nomina": [{"file": "/content/data/Activos.xlsx", "sheet": "Base"}],
    #     "casos_el": [{"file": "/content/data/Enfermedad_laboral.xlsx", "sheet": None}],
    #     "ausentismo_comun": [{"file": "/content/data/Ausentismo.xlsx", "sheet": "General"}],
    # }
 
    resultados = run_pipeline(CONFIG)
