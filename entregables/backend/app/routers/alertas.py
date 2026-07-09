"""
O21 · Endpoints de alertas logísticas.
Detecta y envía alertas a WhatsApp / correo / Teams sobre movimientos
de equipos (tránsito, retornos vencidos, mantenciones próximas).

En producción, los envíos reales pasan por:
- WhatsApp Business API (Meta) o un proveedor como Twilio.
- Microsoft Graph API para Teams (canal Operaciones).
- SMTP corporativo o SendGrid para correo.

Este router expone los webhooks; la integración real con cada proveedor
queda en placeholders documentados.
"""
from datetime import datetime, timedelta, timezone
from fastapi import APIRouter, Depends, HTTPException

from ..db.cosmos import get_repo
from ..models.schemas import (
    ConfiguracionCanales,
    AlertaLogisticaEnvio,
    UserOut,
)
from ..services.auth import get_current_user, require_nivel

router = APIRouter(prefix="/alertas", tags=["alertas"])


# Configuración por defecto · en producción se persiste en Cosmos
_CONFIG_CANALES_DEFAULT = {
    "whatsapp": {"activo": True, "label": "WhatsApp Business", "destino": "+57 320 555 1234"},
    "email":    {"activo": True, "label": "Correo logística",   "destino": "logistica@rehavid.com.co"},
    "teams":    {"activo": False, "label": "Microsoft Teams",   "destino": "Rehavid · Operaciones"},
}


def _today():
    return datetime.now(timezone.utc).date()


@router.get("/canales", response_model=ConfiguracionCanales)
async def obtener_canales(user: UserOut = Depends(get_current_user)):
    """Devuelve la configuración actual de canales de notificación."""
    repo = get_repo()
    cfg = repo.get("config", item_id="__canales_alertas__", partition_key="__canales_alertas__")
    if cfg is None:
        return _CONFIG_CANALES_DEFAULT
    cfg.pop("id", None)
    return cfg


@router.put("/canales", response_model=ConfiguracionCanales)
async def actualizar_canales(
    cfg: ConfiguracionCanales,
    user: UserOut = Depends(require_nivel(1)),
):
    """Solo admin global puede modificar canales."""
    repo = get_repo()
    record = cfg.model_dump()
    record["id"] = "__canales_alertas__"
    repo.upsert("config", record)
    return cfg


@router.get("/detectadas")
async def detectar_alertas(user: UserOut = Depends(require_nivel(3))):
    """Devuelve la lista de alertas logísticas activas en este momento.
    Versión backend de la función JS detectarAlertasLogisticas()."""
    repo = get_repo()
    hoy = _today()
    alertas = []

    # 1. Equipos por despachar en 48h
    reservas = repo.list_all("reservas")
    proximas = [r for r in reservas if not r.get("cancelada") and 0 <= (datetime.fromisoformat(r["fecha_salida"]).date() - hoy).days <= 2]
    if proximas:
        alertas.append({
            "tipo": "transito_salida",
            "titulo": "Equipos por despachar",
            "cantidad": len(proximas),
            "icono": "🚚",
            "canal_sugerido": "whatsapp",
            "detalle": f"{len(proximas)} reservas inician en las próximas 48h",
        })

    # 2. Retornos vencidos
    vencidos = [r for r in reservas if not r.get("cancelada") and not r.get("confirmado_retorno") and datetime.fromisoformat(r["fecha_retorno_esp"]).date() < hoy]
    if vencidos:
        alertas.append({
            "tipo": "retorno_vencido",
            "titulo": "Retornos vencidos",
            "cantidad": len(vencidos),
            "icono": "⚠",
            "canal_sugerido": "whatsapp",
            "detalle": f"{len(vencidos)} equipos no han confirmado retorno",
        })

    # 3. Mantenciones próximas
    equipos = repo.list_all("equipos")
    mant = [e for e in equipos if e.get("proxima_mantencion") and 0 <= (datetime.fromisoformat(e["proxima_mantencion"]).date() - hoy).days <= 14]
    if mant:
        alertas.append({
            "tipo": "mantencion",
            "titulo": "Mantenciones próximas",
            "cantidad": len(mant),
            "icono": "🔧",
            "canal_sugerido": "email",
            "detalle": f"{len(mant)} equipos requieren mantención en 14 días",
        })

    # 4. Equipos en preparación
    en_prep = [e for e in equipos if e.get("estado") == "en_preparacion"]
    if en_prep:
        alertas.append({
            "tipo": "preparacion",
            "titulo": "Equipos en preparación",
            "cantidad": len(en_prep),
            "icono": "🧺",
            "canal_sugerido": "teams",
            "detalle": f"{len(en_prep)} equipos esperan revisión/lavado",
        })

    return {"alertas": alertas, "total": len(alertas)}


@router.post("/enviar")
async def enviar_alerta(
    envio: AlertaLogisticaEnvio,
    user: UserOut = Depends(require_nivel(3)),
):
    """Dispara una alerta por el canal indicado.

    En producción esta función debe integrarse con:
    - WhatsApp Business API (POST https://graph.facebook.com/v18.0/{phone-id}/messages)
    - SMTP corporativo (smtplib o servicio como SendGrid)
    - Microsoft Graph API (POST /teams/{team-id}/channels/{channel-id}/messages)

    Por ahora registra el envío en auditoría y devuelve un acuse.
    """
    repo = get_repo()
    cfg_raw = repo.get("config", item_id="__canales_alertas__", partition_key="__canales_alertas__")
    cfg = cfg_raw if cfg_raw else _CONFIG_CANALES_DEFAULT
    canal_info = cfg.get(envio.canal, {})
    if not canal_info.get("activo"):
        raise HTTPException(
            status_code=409,
            detail=f"Canal {envio.canal} no está activo · configurar primero en PUT /alertas/canales",
        )

    destino = envio.destino_override or canal_info.get("destino", "")
    # Registrar en auditoría
    auditoria = {
        "id": f"alerta-{datetime.now(timezone.utc).timestamp()}",
        "user_email": user.email,
        "user_nombre": user.nombre,
        "accion": f"alerta_{envio.tipo}",
        "modulo": "alertas",
        "detalle": f"Canal={envio.canal} destino={destino} msg='{envio.mensaje[:80]}'",
        "timestamp": datetime.now(timezone.utc).isoformat(),
    }
    repo.upsert("auditoria", auditoria)

    # TODO PRODUCCIÓN · llamar al proveedor según canal
    # if envio.canal == "whatsapp":
    #     await whatsapp_client.send_text(destino, envio.mensaje)
    # elif envio.canal == "email":
    #     await email_client.send(destino, "Alerta Rehavid", envio.mensaje)
    # elif envio.canal == "teams":
    #     await graph_client.post_message(destino, envio.mensaje)

    return {
        "ok": True,
        "canal": envio.canal,
        "destino": destino,
        "tipo": envio.tipo,
        "timestamp": auditoria["timestamp"],
    }
