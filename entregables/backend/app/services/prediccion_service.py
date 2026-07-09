"""
Servicio de predicción de riesgo MSK.
Cuando AZURE_ML_ENABLED=true, llama al endpoint REST de Azure ML.
Cuando AZURE_ML_ENABLED=false (default), devuelve la simulación
con la misma estructura que el endpoint real, para que el frontend
funcione idéntico antes y después de la activación del modelo.
"""
import httpx
from ..config import get_settings
from ..models.schemas import PrediccionRequest, PrediccionResponse, FactorRiesgo

settings = get_settings()


# ────────────────────────────────────────────────────────────
# Mock · usado mientras el modelo real no está desplegado
# ────────────────────────────────────────────────────────────
def _mock_prediccion(req: PrediccionRequest) -> PrediccionResponse:
    """Simulación con score derivado de las variables de entrada.
    Es una heurística simple, NO un modelo entrenado."""
    base = 0.18 + req.personas * 0.04
    if req.servicio == "Xsens":
        base += 0.08
    if req.servicio == "EMG":
        base += 0.05
    sector = (req.sector or "").lower()
    if "manufactura" in sector or "agro" in sector:
        base += 0.10

    score = min(0.92, base)

    factores = [
        FactorRiesgo(name="N° personas en estudio", value=28, expl="A más personas, mayor riesgo"),
        FactorRiesgo(name="Sector industrial del cliente", value=21, expl="Manufactura > administrativo"),
        FactorRiesgo(name="Historial del cliente", value=19, expl="Quien ya tuvo hallazgos repite"),
        FactorRiesgo(name="Tipo de jornada (turnos)", value=16, expl="Rotativos elevan el riesgo"),
        FactorRiesgo(name="Antigüedad del cliente", value=13, expl="Nuevos = más expuestos"),
        FactorRiesgo(name="Servicio asignado", value=11, expl="Xsens detecta más"),
    ]

    return PrediccionResponse(
        es_simulacion=True,
        score=round(score, 3),
        modelo_version="mockup-v0",
        factores=factores,
    )


# ────────────────────────────────────────────────────────────
# Real · llama Azure ML endpoint
# ────────────────────────────────────────────────────────────
async def _real_prediccion(req: PrediccionRequest) -> PrediccionResponse:
    """Llama al endpoint de Azure ML desplegado.
    Espera un response del shape:
    {
      "score": 0.76,
      "modelo_version": "v1.0",
      "factores": [{"name": "...", "value": 28.0, "expl": "..."}]
    }
    """
    headers = {
        "Authorization": f"Bearer {settings.azure_ml_key}",
        "Content-Type": "application/json",
        "azureml-model-deployment": settings.azure_ml_deployment,
    }
    # Se envían exactamente las features que el modelo espera (score.py · FEATURES_ALL),
    # incluida antiguedad_cliente. 'cliente' no es feature del modelo, se omite.
    payload = {
        "input_data": {
            "columns": ["personas", "antiguedad_cliente", "servicio", "ciudad", "sector", "jornada"],
            "data": [[
                req.personas,
                req.antiguedad_cliente if req.antiguedad_cliente is not None else 0,
                req.servicio,
                req.ciudad,
                req.sector or "",
                req.jornada or "",
            ]],
        }
    }

    async with httpx.AsyncClient(timeout=10.0) as client:
        resp = await client.post(settings.azure_ml_endpoint, json=payload, headers=headers)
        resp.raise_for_status()
        data = resp.json()

    return PrediccionResponse(
        es_simulacion=False,
        score=float(data["score"]),
        modelo_version=data.get("modelo_version", settings.azure_ml_deployment),
        factores=[FactorRiesgo(**f) for f in data.get("factores", [])],
    )


# ────────────────────────────────────────────────────────────
# Punto de entrada · el router solo llama a esta función
# ────────────────────────────────────────────────────────────
async def obtener_prediccion(req: PrediccionRequest) -> PrediccionResponse:
    """Devuelve la predicción de Azure ML si está habilitado, o el mock.
    El frontend recibe la misma estructura en ambos casos · solo cambia
    el flag `es_simulacion`."""
    if not settings.azure_ml_enabled:
        return _mock_prediccion(req)

    try:
        return await _real_prediccion(req)
    except Exception as exc:
        # Si el endpoint real falla, caemos al mock para no romper la UX
        print(f"[predictivo] Azure ML falló, usando mock: {exc}")
        return _mock_prediccion(req)
