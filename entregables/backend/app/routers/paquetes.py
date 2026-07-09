"""Endpoints de paquetes · R006."""
from fastapi import APIRouter, Depends, HTTPException, Query

from ..db.cosmos import get_repo
from ..models.schemas import Paquete, UserOut
from ..services.auth import get_current_user
from ..services import reservas_service as svc

router = APIRouter(prefix="/paquetes", tags=["paquetes"])


@router.get("", response_model=list[Paquete])
async def listar(user: UserOut = Depends(get_current_user)):
    repo = get_repo()
    return repo.list_all("paquetes")


@router.get("/{paquete_id}", response_model=Paquete)
async def obtener(paquete_id: str, user: UserOut = Depends(get_current_user)):
    repo = get_repo()
    pkg = repo.get("paquetes", item_id=paquete_id, partition_key=paquete_id)
    if pkg is None:
        raise HTTPException(status_code=404, detail="Paquete no encontrado")
    return pkg


@router.get("/{paquete_id}/disponibilidad")
async def disponibilidad(
    paquete_id: str,
    fecha_salida: str = Query(...),
    fecha_retorno: str = Query(...),
    user: UserOut = Depends(get_current_user),
):
    """R006 · Verifica si todos los equipos del paquete están disponibles."""
    return svc.verificar_disponibilidad_paquete(paquete_id, fecha_salida, fecha_retorno)
