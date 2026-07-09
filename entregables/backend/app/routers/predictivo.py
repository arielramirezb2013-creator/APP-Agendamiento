"""Endpoint del módulo predictivo · bridge a Azure ML."""
from fastapi import APIRouter, Depends

from ..models.schemas import PrediccionRequest, PrediccionResponse, UserOut
from ..services.auth import get_current_user
from ..services.prediccion_service import obtener_prediccion

router = APIRouter(prefix="/predictivo", tags=["predictivo"])


@router.post("/score", response_model=PrediccionResponse)
async def calcular_riesgo(
    req: PrediccionRequest,
    user: UserOut = Depends(get_current_user),
):
    """Calcula probabilidad de hallazgo MSK para una reserva propuesta.

    Si AZURE_ML_ENABLED=false, devuelve simulación con `es_simulacion: true`.
    Cuando el modelo real esté desplegado en Azure ML Workspace, basta
    cambiar la variable de entorno a true y el frontend recibe la
    predicción real sin ningún cambio de código.
    """
    return await obtener_prediccion(req)
