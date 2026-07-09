"""
Esquemas Pydantic · validación de entrada y salida de la API.
Estos modelos deben mantenerse en sincronía con la estructura
de los arrays del frontend (v11).
"""
from pydantic import BaseModel, Field, EmailStr
from typing import Literal


# ────────────────────────────────────────────────────────────
# USERS
# ────────────────────────────────────────────────────────────
class UserBase(BaseModel):
    email: EmailStr
    nombre: str
    empresa: str
    rol: str
    nivel: Literal[1, 2, 3, 4]
    modulos_permitidos: list[str] | None = None
    permisos_extra: list[str] = []
    activo: bool = True


class UserCreate(UserBase):
    pwd: str


class UserOut(UserBase):
    id: str
    ultimo: str | None = None
    logins30: int = 0
    creates: int = 0
    exports: int = 0
    actions: int = 0


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class LoginResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserOut


# ────────────────────────────────────────────────────────────
# EQUIPOS
# ────────────────────────────────────────────────────────────
class Accesorio(BaseModel):
    nombre: str
    cantidad: int
    completo: bool = True
    requiere_lavado: bool = False
    consumible: bool = False


EstadoEquipo = Literal[
    "disponible",
    "en_uso",
    "en_preparacion",
    "en_revision",       # O18 · post-uso, requiere revisión antes de disponibilizar
    "en_mantenimiento",
    "en_transito",
    "de_baja",           # O18 · retirado de operación definitivamente
]


class Equipo(BaseModel):
    id: str
    categoria: str
    modelo: str
    serial: str
    estado: EstadoEquipo = "disponible"
    responsable: str
    ciudad_base: str
    ultima_revision: str
    proxima_mantencion: str | None = None
    accesorios: list[Accesorio] = []
    notas: str = ""
    historial_uso: int = 0
    motivo_mantenimiento: str | None = None
    # O18 · campos de baja
    motivo_baja: str | None = None
    fecha_baja: str | None = None


# ────────────────────────────────────────────────────────────
# RESERVAS
# ────────────────────────────────────────────────────────────
class HistorialEntry(BaseModel):
    timestamp: str
    accion: str
    usuario: str
    detalle: str = ""


class ConfirmacionRetorno(BaseModel):
    fecha: str
    estado: Literal["OK", "INCOMPLETO", "DAÑADO"] = "OK"
    notas: str = ""
    operador: str = ""
    requiere_preparacion: bool = False
    preparacion_completa: bool = False
    preparacion_notas: str | None = None


class Reserva(BaseModel):
    id: str
    servicio: str
    cliente: str
    ciudad: str
    personas: int
    contactos_efectivos: int = 0
    fecha_salida: str
    fecha_retorno_esp: str
    estado: Literal["confirmada", "planeada"] = "confirmada"
    cancelada: bool = False
    motivo_cancelacion: str | None = None
    reprogramada_desde: str | None = None
    # O08 · soporta múltiples equipos por reserva (paquetes)
    equipos_ids: list[str] = []
    equipo_id: str | None = None  # legacy · espejo del primero de equipos_ids
    paquete_id: str | None = None
    confirmado_retorno: ConfirmacionRetorno | None = None
    riesgo: float = 0.0
    historial: list[HistorialEntry] = []


class ReservaCreate(BaseModel):
    servicio: str
    cliente: str
    ciudad: str
    personas: int = Field(ge=1, le=200)
    fecha_salida: str
    fecha_retorno_esp: str
    paquete_id: str | None = None


class ReservaReprogramar(BaseModel):
    nueva_fecha_salida: str
    nueva_fecha_retorno: str
    motivo: str


class ReservaCancelar(BaseModel):
    motivo: str


class RetornoConfirmar(BaseModel):
    estado_kit: Literal["OK", "INCOMPLETO", "DAÑADO"] = "OK"
    notas: str = ""
    requiere_preparacion: bool = False


# ────────────────────────────────────────────────────────────
# SOLICITUDES  (Portal Solicitante)
# O11 · O16 · O19
# ────────────────────────────────────────────────────────────
class ProfesionalRequerido(BaseModel):
    """O19 · información del profesional asignado/requerido."""
    cantidad: int = Field(ge=1, le=10, default=1)
    perfil: str
    nombre: str = ""
    especialidad: str = ""
    telefono: str = ""
    correo: str = ""


class AccesorioSolicitado(BaseModel):
    """O16 · accesorio descontable del kit al confirmar reserva."""
    nombre: str
    cantidad: int = Field(ge=0)


class ObservacionSolicitud(BaseModel):
    fecha: str
    autor: str
    texto: str


class Solicitud(BaseModel):
    id: str
    solicitante_email: EmailStr
    empresa_cliente: str
    servicio: str
    ciudad: str
    personas: int = Field(ge=1, le=200)
    fecha_solicitud: str
    fecha_sugerida: str | None = None  # fecha de servicio deseada por el solicitante
    fecha_confirmada: str | None = None
    operador: str | None = None
    estado: Literal["pendiente", "confirmada", "finalizada", "cancelada"] = "pendiente"
    notas: str = ""
    dias_estimados: int = 1
    # O19
    profesional: ProfesionalRequerido | None = None
    # O16
    accesorios_solicitados: list[AccesorioSolicitado] = []
    # O11
    observaciones: list[ObservacionSolicitud] = []
    motivo_cancelacion: str | None = None
    cancelada_por: str | None = None
    fecha_cancelacion: str | None = None
    editada: bool = False
    editada_por: str | None = None
    # O17 · notificación a operadores
    notificada_a: list[str] = []
    notificada_en: str | None = None


class SolicitudCreate(BaseModel):
    empresa_cliente: str
    servicio: str
    ciudad: str
    personas: int = Field(ge=1, le=200)
    fecha_sugerida: str
    dias_estimados: int = Field(ge=1, le=30, default=1)
    notas: str = ""
    profesional: ProfesionalRequerido
    accesorios_solicitados: list[AccesorioSolicitado] = []


class SolicitudCancelar(BaseModel):
    motivo: str = ""


class SolicitudEditar(BaseModel):
    """Cambios permitidos al solicitante sobre su propia solicitud pendiente."""
    personas: int | None = Field(default=None, ge=1, le=200)
    notas: str | None = None


class SolicitudObservacion(BaseModel):
    texto: str


# ────────────────────────────────────────────────────────────
# CANALES DE ALERTAS LOGÍSTICAS (O21)
# ────────────────────────────────────────────────────────────
class CanalAlerta(BaseModel):
    activo: bool = False
    label: str = ""
    # destino: número de teléfono, correo o nombre del canal Teams
    destino: str = ""


class ConfiguracionCanales(BaseModel):
    whatsapp: CanalAlerta = CanalAlerta(activo=False, label="WhatsApp Business")
    email: CanalAlerta = CanalAlerta(activo=False, label="Correo logística")
    teams: CanalAlerta = CanalAlerta(activo=False, label="Microsoft Teams")


class AlertaLogisticaEnvio(BaseModel):
    """Payload para disparar una alerta por un canal."""
    tipo: str  # transito_salida, retorno_vencido, mantencion, preparacion
    canal: Literal["whatsapp", "email", "teams"]
    mensaje: str
    destino_override: str | None = None


# ────────────────────────────────────────────────────────────
# EQUIPOS · acciones administrativas (O18)
# ────────────────────────────────────────────────────────────
class EquipoDarDeBaja(BaseModel):
    motivo: str


# ────────────────────────────────────────────────────────────
# PAQUETES
# ────────────────────────────────────────────────────────────
class Paquete(BaseModel):
    id: str
    nombre: str
    desc: str
    equipos_requeridos: list[str]  # lista de categorías
    duracion_dias: int
    activo: bool = True
    uso_30d: int = 0


# ────────────────────────────────────────────────────────────
# PLANES DE ACCIÓN
# ────────────────────────────────────────────────────────────
class Plan(BaseModel):
    id: str
    app: str
    titulo: str
    desc: str
    responsable: str
    vence: str
    avance: int = 0
    esperado: int = 0
    estado: Literal["open", "risk", "done"] = "open"


# ────────────────────────────────────────────────────────────
# PREDICCIÓN
# ────────────────────────────────────────────────────────────
class FactorRiesgo(BaseModel):
    name: str
    value: float
    expl: str


class PrediccionRequest(BaseModel):
    servicio: str
    ciudad: str
    cliente: str
    personas: int
    sector: str | None = None
    jornada: str | None = None


class PrediccionResponse(BaseModel):
    es_simulacion: bool
    score: float = Field(ge=0.0, le=1.0)
    modelo_version: str
    factores: list[FactorRiesgo]


# ────────────────────────────────────────────────────────────
# DISPONIBILIDAD
# ────────────────────────────────────────────────────────────
class DisponibilidadResponse(BaseModel):
    disponible: bool
    motivo: str
    equipos_libres: list[str] = []  # lista de IDs


# ────────────────────────────────────────────────────────────
# AUDITORÍA
# ────────────────────────────────────────────────────────────
class EventoAuditoria(BaseModel):
    id: str
    user_email: EmailStr
    user_nombre: str
    accion: str
    modulo: str
    detalle: str = ""
    timestamp: str
    ip: str | None = None
