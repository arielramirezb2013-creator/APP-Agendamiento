"""Endpoints de equipos · implementan R004, R005, R009."""
from fastapi import APIRouter, Depends, HTTPException, Body

from ..db.cosmos import get_repo
from ..models.schemas import Equipo, UserOut
from ..services.auth import get_current_user, require_nivel
from ..services import reservas_service as svc

router = APIRouter(prefix="/equipos", tags=["equipos"])


@router.get("", response_model=list[Equipo])
async def listar(
    categoria: str | None = None,
    estado: str | None = None,
    user: UserOut = Depends(get_current_user),
):
    """R005 · Lista equipos con tracking por serial."""
    repo = get_repo()
    sql = "SELECT * FROM c WHERE 1=1"
    params: list[dict] = []
    if categoria:
        sql += " AND c.categoria = @cat"
        params.append({"name": "@cat", "value": categoria})
    if estado:
        sql += " AND c.estado = @est"
        params.append({"name": "@est", "value": estado})
    return repo.query("equipos", sql, params)


@router.get("/{equipo_id}", response_model=Equipo)
async def obtener(equipo_id: str, user: UserOut = Depends(get_current_user)):
    """R005 · Detalle completo de un equipo (con accesorios)."""
    repo = get_repo()
    eq = repo.get("equipos", item_id=equipo_id, partition_key=equipo_id)
    if eq is None:
        raise HTTPException(status_code=404, detail="Equipo no encontrado")
    return eq


@router.post("", response_model=Equipo)
async def crear(equipo: Equipo, user: UserOut = Depends(require_nivel(2))):
    """Crea un equipo nuevo · R004."""
    repo = get_repo()
    if repo.get("equipos", item_id=equipo.id, partition_key=equipo.id) is not None:
        raise HTTPException(status_code=409, detail=f"Ya existe un equipo con id {equipo.id}")
    repo.upsert("equipos", equipo.model_dump())
    return equipo


@router.put("/{equipo_id}", response_model=Equipo)
async def actualizar(
    equipo_id: str, equipo: Equipo, user: UserOut = Depends(require_nivel(2))
):
    """Actualiza un equipo (estado, accesorios, etc.)."""
    if equipo_id != equipo.id:
        raise HTTPException(status_code=400, detail="ID del path no coincide con el body")
    repo = get_repo()
    repo.upsert("equipos", equipo.model_dump())
    return equipo


@router.post("/{equipo_id}/listo", response_model=dict)
async def marcar_listo(
    equipo_id: str,
    notas: str = Body(..., embed=True),
    user: UserOut = Depends(require_nivel(3)),
):
    """R009 · Marca el equipo como listo tras preparación."""
    resultado = svc.marcar_equipo_listo(equipo_id, notas)
    if not resultado["ok"]:
        raise HTTPException(status_code=409, detail=resultado["error"])
    return resultado


@router.post("/{equipo_id}/mantenimiento", response_model=dict)
async def mantenimiento(
    equipo_id: str,
    motivo: str = Body(..., embed=True),
    user: UserOut = Depends(require_nivel(2)),
):
    """R009 · Envía equipo a mantenimiento (bloquea reservas futuras)."""
    resultado = svc.enviar_a_mantenimiento(equipo_id, motivo)
    if not resultado["ok"]:
        raise HTTPException(status_code=409, detail=resultado["error"])
    return resultado


# ────────────────────────────────────────────────────────────
# O04 · Ficha individual del equipo
# ────────────────────────────────────────────────────────────
@router.get("/{equipo_id}/ficha")
async def ficha_individual(equipo_id: str, user: UserOut = Depends(get_current_user)):
    """O04 · devuelve la ficha completa del equipo: detalle + métricas + historial.

    Útil para el modal del frontend al hacer clic en el serial.
    """
    repo = get_repo()
    eq = repo.get("equipos", item_id=equipo_id, partition_key=equipo_id)
    if eq is None:
        raise HTTPException(status_code=404, detail="Equipo no encontrado")

    # Historial de reservas que usaron este equipo (equipo_id legacy o equipos_ids[] nuevo)
    reservas_eq = repo.query(
        "reservas",
        """SELECT * FROM c
           WHERE c.equipo_id = @eid OR ARRAY_CONTAINS(c.equipos_ids, @eid)
           ORDER BY c.fecha_salida DESC""",
        [{"name": "@eid", "value": equipo_id}],
    )

    from datetime import datetime, timezone
    hoy_str = datetime.now(timezone.utc).date().isoformat()

    reservas_pasadas = [r for r in reservas_eq if r["fecha_retorno_esp"] < hoy_str]
    reservas_activas = [r for r in reservas_eq if r["fecha_salida"] <= hoy_str <= r["fecha_retorno_esp"] and not r.get("cancelada")]
    reservas_futuras = [r for r in reservas_eq if r["fecha_salida"] > hoy_str and not r.get("cancelada")]

    proxima = reservas_futuras[-1] if reservas_futuras else None  # ordenadas DESC, la última es la próxima

    return {
        "equipo": eq,
        "metricas": {
            "usos_totales": eq.get("historial_uso", 0),
            "reservas_asignadas": len(reservas_eq),
            "reservas_futuras": len(reservas_futuras),
            "reservas_activas_hoy": len(reservas_activas),
        },
        "proxima_reserva": proxima,
        "historial_reservas": reservas_pasadas[:12],
        "accesorios": eq.get("accesorios", []),
    }


# ────────────────────────────────────────────────────────────
# O18 · Dar de baja un equipo (irreversible)
# ────────────────────────────────────────────────────────────
@router.post("/{equipo_id}/baja", response_model=dict)
async def dar_de_baja(
    equipo_id: str,
    motivo: str = Body(..., embed=True),
    user: UserOut = Depends(require_nivel(1)),
):
    """O18 · solo Admin Global (nivel 1) puede retirar un equipo definitivamente."""
    resultado = svc.dar_de_baja_equipo(equipo_id, motivo)
    if not resultado["ok"]:
        raise HTTPException(status_code=409, detail=resultado["error"])
    return resultado
