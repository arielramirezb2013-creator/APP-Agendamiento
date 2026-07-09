"""Endpoints de reservas · implementan R002, R003, R006, R007, R008."""
from fastapi import APIRouter, Depends, HTTPException, Query

from ..db.cosmos import get_repo
from ..models.schemas import (
    Reserva,
    ReservaCreate,
    ReservaReprogramar,
    ReservaCancelar,
    RetornoConfirmar,
    DisponibilidadResponse,
    UserOut,
)
from ..services.auth import get_current_user, require_nivel
from ..services import reservas_service as svc

router = APIRouter(prefix="/reservas", tags=["reservas"])


@router.get("", response_model=list[Reserva])
async def listar(
    servicio: str | None = None,
    ciudad: str | None = None,
    cliente: str | None = None,
    user: UserOut = Depends(get_current_user),
):
    """Lista reservas con filtros opcionales."""
    repo = get_repo()
    sql = "SELECT * FROM c WHERE 1=1"
    params: list[dict] = []
    if servicio:
        sql += " AND c.servicio = @s"
        params.append({"name": "@s", "value": servicio})
    if ciudad:
        sql += " AND c.ciudad = @ci"
        params.append({"name": "@ci", "value": ciudad})
    if cliente:
        sql += " AND CONTAINS(c.cliente, @cl)"
        params.append({"name": "@cl", "value": cliente})
    return repo.query("reservas", sql, params)


@router.get("/disponibilidad", response_model=DisponibilidadResponse)
async def disponibilidad(
    servicio: str = Query(...),
    fecha_salida: str = Query(...),
    fecha_retorno: str = Query(...),
    user: UserOut = Depends(get_current_user),
):
    """R003 · Verifica si hay equipos disponibles en el rango."""
    return svc.verificar_disponibilidad(servicio, fecha_salida, fecha_retorno)


@router.post("", response_model=dict)
async def crear(data: ReservaCreate, user: UserOut = Depends(require_nivel(3))):
    """R003 + R008 · Crea una reserva validando disponibilidad."""
    resultado = svc.crear_reserva(data, usuario_email=user.email)
    if not resultado["ok"]:
        raise HTTPException(status_code=409, detail=resultado["error"])
    return resultado


@router.post("/{reserva_id}/reprogramar", response_model=dict)
async def reprogramar(
    reserva_id: str,
    data: ReservaReprogramar,
    user: UserOut = Depends(require_nivel(2)),
):
    """R002 · Reprograma una reserva si hay stock en la nueva fecha."""
    resultado = svc.reprogramar_reserva(
        reserva_id,
        data.nueva_fecha_salida,
        data.nueva_fecha_retorno,
        data.motivo,
        usuario_email=user.email,
    )
    if not resultado["ok"]:
        raise HTTPException(status_code=409, detail=resultado["error"])
    return resultado


@router.post("/{reserva_id}/cancelar", response_model=dict)
async def cancelar(
    reserva_id: str,
    data: ReservaCancelar,
    user: UserOut = Depends(require_nivel(2)),
):
    """R002 · Cancela una reserva y libera el equipo."""
    resultado = svc.cancelar_reserva(reserva_id, data.motivo, usuario_email=user.email)
    if not resultado["ok"]:
        raise HTTPException(status_code=409, detail=resultado["error"])
    return resultado


@router.post("/{reserva_id}/retorno", response_model=dict)
async def confirmar_retorno(
    reserva_id: str,
    data: RetornoConfirmar,
    user: UserOut = Depends(require_nivel(3)),
):
    """R007 + R009 · Confirma retorno y dispara preparación si aplica."""
    resultado = svc.confirmar_retorno(
        reserva_id,
        data.estado_kit,
        data.notas,
        data.requiere_preparacion,
        usuario_email=user.email,
        usuario_nombre=user.nombre,
    )
    if not resultado["ok"]:
        raise HTTPException(status_code=409, detail=resultado["error"])
    return resultado
