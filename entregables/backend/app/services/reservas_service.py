"""
Servicio de reservas · LÓGICA DE NEGOCIO CRÍTICA
Implementa las 8 observaciones del Excel (R002-R009).
Es el equivalente backend de las funciones JS del frontend v11.

Toda creación, reprogramación, cancelación y confirmación de retorno
PASA por este servicio. El frontend solo consume estos endpoints.
"""
from datetime import datetime, timedelta, timezone
from typing import Any

from ..db.cosmos import get_repo
from ..models.schemas import (
    Reserva,
    ReservaCreate,
    DisponibilidadResponse,
    ConfirmacionRetorno,
    HistorialEntry,
)


def _now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


# ────────────────────────────────────────────────────────────
# R003 + R008 · Verificar disponibilidad antes de reservar
# ────────────────────────────────────────────────────────────
def verificar_disponibilidad(
    servicio: str,
    fecha_salida: str,
    fecha_retorno: str,
    ids_excluir: list[str] | None = None,
) -> DisponibilidadResponse:
    """Verifica si hay equipos de `servicio` libres en el rango.

    Considera:
      - Equipos en mantenimiento/tránsito están bloqueados (R009)
      - Solapamiento de fechas con reservas activas (R003)
      - Si una reserva pasada tiene preparación pendiente, suma +1 día
    """
    repo = get_repo()
    ids_excluir = ids_excluir or []

    # Tumeke no tiene equipo físico
    if servicio == "Tumeke":
        return DisponibilidadResponse(
            disponible=True,
            motivo="Tumeke no requiere equipo físico",
            equipos_libres=[],
        )

    # 1) Equipos de esa categoría
    equipos_cat = repo.query(
        "equipos",
        "SELECT * FROM c WHERE c.categoria = @cat",
        [{"name": "@cat", "value": servicio}],
    )
    if not equipos_cat:
        return DisponibilidadResponse(
            disponible=False,
            motivo=f'No hay equipos del tipo "{servicio}" en el inventario',
            equipos_libres=[],
        )

    # 2) Filtrar equipos no operativos: mantenimiento, tránsito, de baja (O18) y
    #    los que aún están en preparación/revisión post-uso (no se pueden reservar
    #    hasta marcarse "listos"). Antes 'en_preparacion'/'en_revision' se colaban.
    _BLOQUEADOS = ("en_mantenimiento", "en_transito", "de_baja", "en_preparacion", "en_revision")
    equipos_op = [e for e in equipos_cat if e["estado"] not in _BLOQUEADOS]
    if not equipos_op:
        return DisponibilidadResponse(
            disponible=False,
            motivo=f'Todos los equipos "{servicio}" están en mantenimiento, tránsito o preparación',
            equipos_libres=[],
        )

    # 3) Para cada equipo operativo, verificar solapamiento
    # O08 · soporta tanto equipo_id legacy como equipos_ids[] nuevo
    inicio = datetime.fromisoformat(fecha_salida)
    fin = datetime.fromisoformat(fecha_retorno)

    equipos_libres = []
    for eq in equipos_op:
        reservas_eq = repo.query(
            "reservas",
            # Cosmos NoSQL no soporta `IN (subquery)`; se usa NOT ARRAY_CONTAINS
            # para excluir la propia reserva al reprogramar (@excl puede ir vacío).
            """SELECT * FROM c
               WHERE (c.equipo_id = @eid OR ARRAY_CONTAINS(c.equipos_ids, @eid))
                 AND c.cancelada = false
                 AND (NOT ARRAY_CONTAINS(@excl, c.id))""",
            [
                {"name": "@eid", "value": eq["id"]},
                {"name": "@excl", "value": ids_excluir},
            ],
        )
        conflicto = False
        for r in reservas_eq:
            r_ini = datetime.fromisoformat(r["fecha_salida"])
            r_fin = datetime.fromisoformat(r["fecha_retorno_esp"])
            # Si la reserva tiene preparación pendiente, el equipo sigue ocupado +1 día
            conf = r.get("confirmado_retorno") or {}
            if conf.get("requiere_preparacion") and not conf.get("preparacion_completa"):
                r_fin = r_fin + timedelta(days=1)
            if inicio <= r_fin and fin >= r_ini:
                conflicto = True
                break
        if not conflicto:
            equipos_libres.append(eq["id"])

    if not equipos_libres:
        return DisponibilidadResponse(
            disponible=False,
            motivo=(
                f'Stock agotado · todos los equipos "{servicio}" '
                f"({len(equipos_cat)} en total) están reservados o en preparación "
                f"en el rango {fecha_salida} → {fecha_retorno}"
            ),
            equipos_libres=[],
        )

    return DisponibilidadResponse(
        disponible=True,
        motivo=f"{len(equipos_libres)} de {len(equipos_cat)} equipos disponibles",
        equipos_libres=equipos_libres,
    )


def verificar_disponibilidad_paquete(
    paquete_id: str, fecha_salida: str, fecha_retorno: str
) -> dict[str, Any]:
    """R006 · Verifica que TODOS los equipos del paquete estén disponibles."""
    repo = get_repo()
    pkg = repo.get("paquetes", item_id=paquete_id, partition_key=paquete_id)
    if pkg is None:
        return {"disponible": False, "motivo": "Paquete no encontrado", "detalle": []}

    detalle = []
    for cat in pkg["equipos_requeridos"]:
        v = verificar_disponibilidad(cat, fecha_salida, fecha_retorno)
        detalle.append({"categoria": cat, **v.model_dump()})

    todos = all(d["disponible"] for d in detalle)
    falta = [d["categoria"] for d in detalle if not d["disponible"]]

    return {
        "disponible": todos,
        "motivo": "Todos los equipos disponibles" if todos else f"Falta stock para: {', '.join(falta)}",
        "detalle": detalle,
    }


# ────────────────────────────────────────────────────────────
# R003 + R008 · Crear reserva con validación de stock
# ────────────────────────────────────────────────────────────
def crear_reserva(data: ReservaCreate, usuario_email: str) -> dict[str, Any]:
    """Valida disponibilidad y crea la reserva si hay stock.
    R008: bloquea si no hay disponibilidad.
    O08: paquetes asignan TODOS los equipos a equipos_ids[]."""
    repo = get_repo()

    # Validar disponibilidad y armar lista de equipos a asignar
    equipos_asignados: list[str] = []

    if data.paquete_id:
        v = verificar_disponibilidad_paquete(
            data.paquete_id, data.fecha_salida, data.fecha_retorno_esp
        )
        if not v["disponible"]:
            return {"ok": False, "error": v["motivo"], "verificacion": v}
        # O08 · tomar UN equipo libre por cada categoría del paquete
        equipos_asignados = [
            d["equipos_libres"][0] for d in v["detalle"]
            if d["disponible"] and d.get("equipos_libres")
        ]
    else:
        disp = verificar_disponibilidad(
            data.servicio, data.fecha_salida, data.fecha_retorno_esp
        )
        if not disp.disponible:
            return {"ok": False, "error": disp.motivo}
        if disp.equipos_libres:
            equipos_asignados = [disp.equipos_libres[0]]

    # Generar ID a partir del mayor R-### existente. COUNT(1) no sirve: cuenta
    # también las canceladas y no refleja huecos, lo que produce colisiones.
    ids = repo.query("reservas", "SELECT VALUE c.id FROM c")
    max_num = 0
    for rid in ids:
        try:
            max_num = max(max_num, int(str(rid).rsplit("-", 1)[-1]))
        except (ValueError, IndexError):
            continue
    next_num = max_num + 1

    detalle_hist = f"Reserva creada · {data.servicio} · {data.cliente}"
    if data.paquete_id:
        detalle_hist += f" · paquete {data.paquete_id} ({len(equipos_asignados)} equipos)"

    nueva: dict[str, Any] = {
        "id": f"R-{next_num:03d}",
        "servicio": data.servicio,
        "cliente": data.cliente,
        "ciudad": data.ciudad,
        "personas": data.personas,
        "contactos_efectivos": data.personas,
        "fecha_salida": data.fecha_salida,
        "fecha_retorno_esp": data.fecha_retorno_esp,
        "estado": "confirmada",
        "cancelada": False,
        "riesgo": min(0.85, 0.18 + data.personas * 0.04),
        "confirmado_retorno": None,
        "motivo_cancelacion": None,
        "reprogramada_desde": None,
        # O08 · soporta múltiples equipos. Mantenemos equipo_id como primero del array para compatibilidad
        "equipos_ids": equipos_asignados,
        "equipo_id": equipos_asignados[0] if equipos_asignados else None,
        "paquete_id": data.paquete_id,
        "historial": [
            {
                "timestamp": _now_iso(),
                "accion": "creada",
                "usuario": usuario_email,
                "detalle": detalle_hist,
            }
        ],
    }

    # create_item (no upsert) para no sobrescribir una reserva existente si dos
    # peticiones concurrentes generan el mismo número; ante colisión, reintenta.
    from azure.cosmos import exceptions as _cx
    for _ in range(25):
        try:
            repo.create("reservas", nueva)
            break
        except _cx.CosmosResourceExistsError:
            next_num += 1
            nueva["id"] = f"R-{next_num:03d}"
    else:
        return {"ok": False, "error": "No se pudo generar un id único para la reserva"}

    # O08 · marcar TODOS los equipos del paquete como en_uso
    for eid in equipos_asignados:
        eq = repo.get("equipos", item_id=eid, partition_key=eid)
        if eq:
            eq["estado"] = "en_uso"
            repo.upsert("equipos", eq)

    return {"ok": True, "reserva": nueva}


# ────────────────────────────────────────────────────────────
# R002 · Cancelar reserva
# ────────────────────────────────────────────────────────────
def cancelar_reserva(reserva_id: str, motivo: str, usuario_email: str) -> dict[str, Any]:
    repo = get_repo()
    r = repo.get("reservas", item_id=reserva_id, partition_key=reserva_id)
    if r is None:
        return {"ok": False, "error": "Reserva no encontrada"}
    if r["cancelada"]:
        return {"ok": False, "error": "La reserva ya estaba cancelada"}

    r["cancelada"] = True
    r["motivo_cancelacion"] = motivo or "Cancelada por el operador"
    r["historial"] = r.get("historial", [])
    r["historial"].append(
        {
            "timestamp": _now_iso(),
            "accion": "cancelada",
            "usuario": usuario_email,
            "detalle": motivo,
        }
    )
    repo.upsert("reservas", r)

    # O08 · liberar TODOS los equipos del paquete (no solo el principal)
    ids_a_liberar: list[str] = r.get("equipos_ids") or ([r["equipo_id"]] if r.get("equipo_id") else [])

    for eid in ids_a_liberar:
        # ¿Alguna otra reserva activa sigue usando este equipo?
        otras = repo.query(
            "reservas",
            """SELECT * FROM c
               WHERE (c.equipo_id = @eid OR ARRAY_CONTAINS(c.equipos_ids, @eid))
                 AND c.cancelada = false AND c.id != @rid""",
            [{"name": "@eid", "value": eid}, {"name": "@rid", "value": reserva_id}],
        )
        if not otras:
            eq = repo.get("equipos", item_id=eid, partition_key=eid)
            if eq and eq["estado"] == "en_uso":
                eq["estado"] = "disponible"
                repo.upsert("equipos", eq)

    return {"ok": True, "reserva": r}


# ────────────────────────────────────────────────────────────
# R002 · Reprogramar (cambio de fechas con validación)
# ────────────────────────────────────────────────────────────
def reprogramar_reserva(
    reserva_id: str,
    nueva_fecha_salida: str,
    nueva_fecha_retorno: str,
    motivo: str,
    usuario_email: str,
) -> dict[str, Any]:
    repo = get_repo()
    r = repo.get("reservas", item_id=reserva_id, partition_key=reserva_id)
    if r is None:
        return {"ok": False, "error": "Reserva no encontrada"}
    if r["cancelada"]:
        return {"ok": False, "error": "No se puede reprogramar una reserva cancelada"}

    # Verificar disponibilidad en las nuevas fechas, excluyendo esta misma reserva.
    if r.get("paquete_id"):
        # Reserva de paquete (O08): validar TODAS las categorías requeridas, no solo una.
        pkg = repo.get("paquetes", item_id=r["paquete_id"], partition_key=r["paquete_id"])
        categorias = pkg["equipos_requeridos"] if pkg else [r["servicio"]]
        faltan = [
            cat for cat in categorias
            if not verificar_disponibilidad(
                cat, nueva_fecha_salida, nueva_fecha_retorno, ids_excluir=[reserva_id]
            ).disponible
        ]
        if faltan:
            return {"ok": False, "error": f"No se puede reprogramar · sin stock para: {', '.join(faltan)}"}
    else:
        v = verificar_disponibilidad(
            r["servicio"], nueva_fecha_salida, nueva_fecha_retorno, ids_excluir=[reserva_id]
        )
        if not v.disponible:
            return {"ok": False, "error": f"No se puede reprogramar: {v.motivo}"}

    fecha_original = r["fecha_salida"]
    r["reprogramada_desde"] = fecha_original
    r["fecha_salida"] = nueva_fecha_salida
    r["fecha_retorno_esp"] = nueva_fecha_retorno
    r["historial"] = r.get("historial", [])
    r["historial"].append(
        {
            "timestamp": _now_iso(),
            "accion": "reprogramada",
            "usuario": usuario_email,
            "detalle": f"De {fecha_original} a {nueva_fecha_salida} · {motivo}",
        }
    )
    repo.upsert("reservas", r)
    return {"ok": True, "reserva": r}


# ────────────────────────────────────────────────────────────
# R007 · Confirmar retorno del equipo
# ────────────────────────────────────────────────────────────
def confirmar_retorno(
    reserva_id: str,
    estado_kit: str,
    notas: str,
    requiere_preparacion: bool,
    usuario_email: str,
    usuario_nombre: str,
) -> dict[str, Any]:
    repo = get_repo()
    r = repo.get("reservas", item_id=reserva_id, partition_key=reserva_id)
    if r is None:
        return {"ok": False, "error": "Reserva no encontrada"}
    if r["cancelada"]:
        return {"ok": False, "error": "Reserva cancelada"}
    if r.get("confirmado_retorno"):
        return {"ok": False, "error": "Esta reserva ya tiene retorno confirmado"}

    r["confirmado_retorno"] = {
        "fecha": datetime.now(timezone.utc).date().isoformat(),
        "estado": estado_kit,
        "notas": notas,
        "operador": usuario_nombre,
        "requiere_preparacion": requiere_preparacion,
        "preparacion_completa": not requiere_preparacion,
    }
    r["historial"] = r.get("historial", [])
    r["historial"].append(
        {
            "timestamp": _now_iso(),
            "accion": "retorno_confirmado",
            "usuario": usuario_email,
            "detalle": f"Retorno · {estado_kit} · {'Pasa a preparación' if requiere_preparacion else 'Listo'}",
        }
    )
    repo.upsert("reservas", r)

    # O08 · R009 · Actualizar TODOS los equipos del paquete
    ids_actualizar: list[str] = r.get("equipos_ids") or ([r["equipo_id"]] if r.get("equipo_id") else [])
    nuevo_estado = "en_preparacion" if requiere_preparacion else "disponible"
    for eid in ids_actualizar:
        eq = repo.get("equipos", item_id=eid, partition_key=eid)
        if eq:
            eq["estado"] = nuevo_estado
            eq["historial_uso"] = (eq.get("historial_uso") or 0) + 1
            repo.upsert("equipos", eq)

    return {"ok": True, "reserva": r}


# ────────────────────────────────────────────────────────────
# R009 · Marcar equipo "listo tras preparación"
# ────────────────────────────────────────────────────────────
def marcar_equipo_listo(equipo_id: str, notas: str) -> dict[str, Any]:
    repo = get_repo()
    eq = repo.get("equipos", item_id=equipo_id, partition_key=equipo_id)
    if eq is None:
        return {"ok": False, "error": "Equipo no encontrado"}
    if eq["estado"] != "en_preparacion":
        return {
            "ok": False,
            "error": f"Equipo no está en preparación (estado actual: {eq['estado']})",
        }
    eq["estado"] = "disponible"
    eq["ultima_revision"] = datetime.now(timezone.utc).date().isoformat()
    repo.upsert("equipos", eq)
    return {"ok": True, "equipo": eq}


def enviar_a_mantenimiento(equipo_id: str, motivo: str) -> dict[str, Any]:
    repo = get_repo()
    eq = repo.get("equipos", item_id=equipo_id, partition_key=equipo_id)
    if eq is None:
        return {"ok": False, "error": "Equipo no encontrado"}
    eq["estado"] = "en_mantenimiento"
    eq["motivo_mantenimiento"] = motivo
    repo.upsert("equipos", eq)
    return {"ok": True, "equipo": eq}


# ────────────────────────────────────────────────────────────
# O18 · Dar de baja un equipo (retiro definitivo)
# ────────────────────────────────────────────────────────────
def dar_de_baja_equipo(equipo_id: str, motivo: str) -> dict[str, Any]:
    """Retira un equipo definitivamente. No puede tener reservas activas."""
    repo = get_repo()
    eq = repo.get("equipos", item_id=equipo_id, partition_key=equipo_id)
    if eq is None:
        return {"ok": False, "error": "Equipo no encontrado"}

    # Verificar que no tenga reservas activas
    reservas_activas = repo.query(
        "reservas",
        """SELECT * FROM c
           WHERE (c.equipo_id = @eid OR ARRAY_CONTAINS(c.equipos_ids, @eid))
             AND c.cancelada = false
             AND NOT IS_DEFINED(c.confirmado_retorno)""",
        [{"name": "@eid", "value": equipo_id}],
    )
    if reservas_activas:
        return {
            "ok": False,
            "error": f"No se puede dar de baja · tiene {len(reservas_activas)} reserva(s) activa(s)",
        }

    eq["estado"] = "de_baja"
    eq["motivo_baja"] = motivo
    eq["fecha_baja"] = datetime.now(timezone.utc).date().isoformat()
    repo.upsert("equipos", eq)
    return {"ok": True, "equipo": eq}
