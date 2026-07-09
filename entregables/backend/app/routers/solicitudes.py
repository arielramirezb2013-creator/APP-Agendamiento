"""
Endpoints del Portal Solicitante.
O11 · solicitante puede editar/cancelar/observar sus solicitudes.
O17 · notificación al operador al recibir una solicitud nueva.
O19 · datos del profesional requerido.
"""
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException

from ..db.cosmos import get_repo
from ..models.schemas import (
    Solicitud,
    SolicitudCreate,
    SolicitudCancelar,
    SolicitudEditar,
    SolicitudObservacion,
    UserOut,
)
from ..services.auth import get_current_user, require_nivel

router = APIRouter(prefix="/solicitudes", tags=["solicitudes"])


def _now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


def _hoy() -> str:
    return datetime.now(timezone.utc).date().isoformat()


@router.get("", response_model=list[Solicitud])
async def listar(
    mias: bool = False,
    estado: str | None = None,
    user: UserOut = Depends(get_current_user),
):
    """Lista solicitudes. Si `mias=true` devuelve solo las del usuario.
    Los niveles 1-3 pueden ver todas; nivel 4 solo las propias."""
    repo = get_repo()
    # IS_DEFINED(solicitante_email) excluye cualquier documento que no sea una
    # solicitud real (defensa ante docs de config que rompen el response_model).
    sql = "SELECT * FROM c WHERE IS_DEFINED(c.solicitante_email)"
    params: list[dict] = []
    if mias or user.nivel == 4:
        sql += " AND c.solicitante_email = @e"
        params.append({"name": "@e", "value": user.email.lower()})
    if estado:
        sql += " AND c.estado = @s"
        params.append({"name": "@s", "value": estado})
    return repo.query("solicitudes", sql, params)


@router.post("", response_model=Solicitud)
async def crear(data: SolicitudCreate, user: UserOut = Depends(get_current_user)):
    """Crea una solicitud nueva desde el portal solicitante.
    O17 · marca destinatarios de notificación a operaciones."""
    repo = get_repo()
    existing = repo.query("solicitudes", "SELECT VALUE COUNT(1) FROM c")
    next_num = (existing[0] if existing else 0) + 1
    nuevo_id = f"SOL-{next_num:03d}"

    record = {
        "id": nuevo_id,
        "solicitante_email": user.email.lower(),
        "empresa_cliente": data.empresa_cliente,
        "servicio": data.servicio,
        "ciudad": data.ciudad,
        "personas": data.personas,
        "fecha_solicitud": _hoy(),
        "fecha_sugerida": data.fecha_sugerida,  # fecha de servicio deseada (antes se descartaba)
        "fecha_confirmada": None,
        "operador": None,
        "estado": "pendiente",
        "notas": data.notas,
        "dias_estimados": data.dias_estimados,
        "profesional": data.profesional.model_dump(),
        "accesorios_solicitados": [a.model_dump() for a in data.accesorios_solicitados],
        "observaciones": [],
        # O17 · destinatarios de notificación
        "notificada_a": ["operaciones@rehavid.com.co", "liliana.hernandez@rehavid.com.co"],
        "notificada_en": _now_iso(),
        "editada": False,
    }
    repo.upsert("solicitudes", record)
    return record


@router.post("/{solicitud_id}/cancelar", response_model=Solicitud)
async def cancelar(
    solicitud_id: str,
    data: SolicitudCancelar,
    user: UserOut = Depends(get_current_user),
):
    """O11 · el solicitante puede cancelar su propia solicitud.
    Regla 48h aplica a estado 'confirmada'."""
    repo = get_repo()
    s = repo.get("solicitudes", item_id=solicitud_id, partition_key=solicitud_id)
    if s is None:
        raise HTTPException(status_code=404, detail="Solicitud no encontrada")
    # Solo el dueño o niveles 1-3
    if s["solicitante_email"] != user.email.lower() and user.nivel > 3:
        raise HTTPException(status_code=403, detail="No puede cancelar solicitudes de otros")
    if s["estado"] == "cancelada":
        raise HTTPException(status_code=409, detail="Ya estaba cancelada")
    if s["estado"] == "finalizada":
        raise HTTPException(status_code=409, detail="Solicitudes finalizadas no se pueden cancelar")

    # Regla 48h para confirmadas · se mide contra la fecha del servicio (fecha_sugerida).
    if s["estado"] == "confirmada":
        fecha_ref = s.get("fecha_sugerida") or s.get("fecha_confirmada") or s.get("fecha_solicitud")
        if fecha_ref:
            dt_ref = datetime.fromisoformat(fecha_ref)
            if dt_ref.tzinfo is None:  # las fechas se guardan sin tz; asumir UTC para no romper la resta
                dt_ref = dt_ref.replace(tzinfo=timezone.utc)
            horas_falt = (dt_ref - datetime.now(timezone.utc)).total_seconds() / 3600
            if horas_falt < 48 and user.nivel == 4:
                raise HTTPException(
                    status_code=409,
                    detail="No se puede cancelar · faltan menos de 48 horas. Contacte al coordinador.",
                )

    s["estado"] = "cancelada"
    s["motivo_cancelacion"] = data.motivo
    s["cancelada_por"] = user.email
    s["fecha_cancelacion"] = _hoy()
    repo.upsert("solicitudes", s)
    return s


@router.put("/{solicitud_id}", response_model=Solicitud)
async def editar(
    solicitud_id: str,
    data: SolicitudEditar,
    user: UserOut = Depends(get_current_user),
):
    """O11 · edita campos permitidos. Solo en estado pendiente."""
    repo = get_repo()
    s = repo.get("solicitudes", item_id=solicitud_id, partition_key=solicitud_id)
    if s is None:
        raise HTTPException(status_code=404, detail="Solicitud no encontrada")
    if s["solicitante_email"] != user.email.lower() and user.nivel > 3:
        raise HTTPException(status_code=403, detail="No puede editar solicitudes de otros")
    if s["estado"] != "pendiente":
        raise HTTPException(status_code=409, detail="Solo se pueden editar solicitudes pendientes")

    if data.personas is not None:
        s["personas"] = data.personas
    if data.notas is not None:
        s["notas"] = data.notas
    s["editada"] = True
    s["editada_por"] = user.email
    repo.upsert("solicitudes", s)
    return s


@router.post("/{solicitud_id}/observacion", response_model=Solicitud)
async def agregar_observacion(
    solicitud_id: str,
    data: SolicitudObservacion,
    user: UserOut = Depends(get_current_user),
):
    """O11 · agrega una observación a una solicitud confirmada."""
    repo = get_repo()
    s = repo.get("solicitudes", item_id=solicitud_id, partition_key=solicitud_id)
    if s is None:
        raise HTTPException(status_code=404, detail="Solicitud no encontrada")
    if s["solicitante_email"] != user.email.lower() and user.nivel > 3:
        raise HTTPException(status_code=403, detail="No puede observar solicitudes de otros")

    s["observaciones"] = s.get("observaciones") or []
    s["observaciones"].append({
        "fecha": _hoy(),
        "autor": user.email,
        "texto": data.texto,
    })
    repo.upsert("solicitudes", s)
    return s


@router.post("/{solicitud_id}/atender", response_model=Solicitud)
async def atender(
    solicitud_id: str,
    user: UserOut = Depends(require_nivel(3)),
):
    """O17 · operador marca una solicitud como atendida (estado confirmada)."""
    repo = get_repo()
    s = repo.get("solicitudes", item_id=solicitud_id, partition_key=solicitud_id)
    if s is None:
        raise HTTPException(status_code=404, detail="Solicitud no encontrada")
    if s["estado"] != "pendiente":
        raise HTTPException(status_code=409, detail=f"Estado actual: {s['estado']}. Solo pendientes son atendibles.")

    s["estado"] = "confirmada"
    s["operador"] = user.nombre
    s["fecha_confirmada"] = _hoy()
    repo.upsert("solicitudes", s)
    return s


@router.get("/badge/pendientes")
async def contar_pendientes(user: UserOut = Depends(get_current_user)):
    """O17 · cuenta de solicitudes pendientes para el badge del menú."""
    if user.nivel > 3:
        return {"pendientes": 0}
    repo = get_repo()
    res = repo.query("solicitudes", "SELECT VALUE COUNT(1) FROM c WHERE c.estado = 'pendiente'")
    return {"pendientes": res[0] if res else 0}
