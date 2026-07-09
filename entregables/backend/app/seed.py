"""
Seed inicial de Cosmos DB · carga los 10 equipos, 5 paquetes,
usuarios demo y datos base que el frontend espera.

Ejecutar con:
    python -m app.seed
"""
import os
from app.db.cosmos import get_repo
from app.config import get_settings
from app.services.auth import hash_password
from datetime import datetime, timezone


EQUIPOS_SEED = [
    {"id": "XS-01", "categoria": "Xsens", "modelo": "Xsens MVN Awinda",
     "serial": "AWNDA-2024-0117", "estado": "disponible",
     "responsable": "Equipo Rehavid Cali", "ciudad_base": "Cali",
     "ultima_revision": "2026-04-15", "proxima_mantencion": "2026-07-15",
     "historial_uso": 42, "notas": "Set completo 17 sensores",
     "accesorios": [
         {"nombre": "Sensores inerciales", "cantidad": 17, "completo": True},
         {"nombre": "Camisetas Xsens", "cantidad": 3, "completo": True, "requiere_lavado": True},
         {"nombre": "Estación base Awinda", "cantidad": 1, "completo": True},
         {"nombre": "Cables USB-C", "cantidad": 2, "completo": True},
         {"nombre": "Cargador múltiple", "cantidad": 1, "completo": True},
         {"nombre": "Maletín de transporte", "cantidad": 1, "completo": True},
     ]},
    {"id": "XS-02", "categoria": "Xsens", "modelo": "Xsens MVN Link",
     "serial": "LINK-2024-0204", "estado": "disponible",
     "responsable": "Equipo Rehavid Bogotá", "ciudad_base": "Bogotá",
     "ultima_revision": "2026-05-02", "proxima_mantencion": "2026-08-02",
     "historial_uso": 28, "notas": "Set completo cableado",
     "accesorios": [
         {"nombre": "Sensores cableados", "cantidad": 17, "completo": True},
         {"nombre": "Traje Lycra Link", "cantidad": 2, "completo": True, "requiere_lavado": True},
         {"nombre": "Unidad de proceso", "cantidad": 1, "completo": True},
         {"nombre": "Batería extendida", "cantidad": 2, "completo": True},
         {"nombre": "Maletín rígido", "cantidad": 1, "completo": True},
     ]},
    {"id": "EM-01", "categoria": "EMG", "modelo": "EMG Delsys Trigno 16ch",
     "serial": "TRIGNO-2023-0011", "estado": "disponible",
     "responsable": "Equipo Rehavid Cali", "ciudad_base": "Cali",
     "ultima_revision": "2026-04-28", "proxima_mantencion": "2026-06-28",
     "historial_uso": 67, "notas": "16 canales · alta gama",
     "accesorios": [
         {"nombre": "Sensores Trigno Avanti", "cantidad": 16, "completo": True},
         {"nombre": "Base inalámbrica", "cantidad": 1, "completo": True},
         {"nombre": "Electrodos adhesivos", "cantidad": 200, "completo": True, "consumible": True},
         {"nombre": "Cinta hipoalergénica", "cantidad": 5, "completo": True, "consumible": True},
         {"nombre": "Cargador 16 puertos", "cantidad": 1, "completo": True},
         {"nombre": "Software EMGworks license", "cantidad": 1, "completo": True},
     ]},
    {"id": "EM-02", "categoria": "EMG", "modelo": "EMG Delsys Trigno 8ch",
     "serial": "TRIGNO-2024-0028", "estado": "disponible",
     "responsable": "Equipo Rehavid Medellín", "ciudad_base": "Medellín",
     "ultima_revision": "2026-03-20", "proxima_mantencion": "2026-09-20",
     "historial_uso": 19, "notas": "8 canales · backup",
     "accesorios": [
         {"nombre": "Sensores Trigno Avanti", "cantidad": 8, "completo": True},
         {"nombre": "Base inalámbrica", "cantidad": 1, "completo": True},
         {"nombre": "Electrodos adhesivos", "cantidad": 100, "completo": True, "consumible": True},
         {"nombre": "Cargador 8 puertos", "cantidad": 1, "completo": True},
     ]},
    {"id": "TB-01", "categoria": "Tobii", "modelo": "Tobii Pro Glasses 3",
     "serial": "TBG3-2025-0007", "estado": "disponible",
     "responsable": "Equipo Rehavid Bogotá", "ciudad_base": "Bogotá",
     "ultima_revision": "2026-05-10", "proxima_mantencion": "2026-11-10",
     "historial_uso": 14, "notas": "Eye-tracking · única unidad",
     "accesorios": [
         {"nombre": "Gafas eye-tracking", "cantidad": 1, "completo": True},
         {"nombre": "Unidad de grabación", "cantidad": 1, "completo": True},
         {"nombre": "Batería de larga duración", "cantidad": 2, "completo": True},
         {"nombre": "Lentes correctoras intercambiables", "cantidad": 3, "completo": True},
         {"nombre": "Tarjeta SD 128GB", "cantidad": 2, "completo": True},
         {"nombre": "Maletín Pelican", "cantidad": 1, "completo": True},
     ]},
    {"id": "DM-01", "categoria": "Dinamómetro", "modelo": "Mark-10 M5-100",
     "serial": "M10-2024-0044", "estado": "disponible",
     "responsable": "Equipo Rehavid Cali", "ciudad_base": "Cali",
     "ultima_revision": "2026-04-02", "proxima_mantencion": "2026-10-02",
     "historial_uso": 23, "notas": "Capacidad 500N",
     "accesorios": [
         {"nombre": "Dinamómetro digital", "cantidad": 1, "completo": True},
         {"nombre": "Adaptadores de prensión", "cantidad": 6, "completo": True},
         {"nombre": "Cable USB de datos", "cantidad": 1, "completo": True},
         {"nombre": "Estuche con espuma", "cantidad": 1, "completo": True},
     ]},
    {"id": "LC-01", "categoria": "Lactómetro", "modelo": "Lactate Scout+",
     "serial": "SCT-2024-0083", "estado": "disponible",
     "responsable": "Equipo Rehavid Bogotá", "ciudad_base": "Bogotá",
     "ultima_revision": "2026-04-25", "proxima_mantencion": "2026-08-25",
     "historial_uso": 17, "notas": "Tiras y lancetas incluidas",
     "accesorios": [
         {"nombre": "Medidor portátil", "cantidad": 1, "completo": True},
         {"nombre": "Tiras reactivas", "cantidad": 50, "completo": True, "consumible": True},
         {"nombre": "Lancetas estériles", "cantidad": 100, "completo": True, "consumible": True},
         {"nombre": "Solución de control", "cantidad": 2, "completo": True, "consumible": True},
         {"nombre": "Estuche", "cantidad": 1, "completo": True},
     ]},
    {"id": "DR-01", "categoria": "Dron", "modelo": "DJI Mini 4 Pro",
     "serial": "DJI4P-2025-0019", "estado": "disponible",
     "responsable": "Equipo Rehavid Medellín", "ciudad_base": "Medellín",
     "ultima_revision": "2026-05-08", "proxima_mantencion": "2026-11-08",
     "historial_uso": 6, "notas": "Inspección aérea",
     "accesorios": [
         {"nombre": "Dron principal", "cantidad": 1, "completo": True},
         {"nombre": "Control remoto DJI RC 2", "cantidad": 1, "completo": True},
         {"nombre": "Baterías de vuelo", "cantidad": 3, "completo": True},
         {"nombre": "Hélices de repuesto", "cantidad": 8, "completo": True},
         {"nombre": "Tarjeta microSD 256GB", "cantidad": 2, "completo": True},
         {"nombre": "Cargador múltiple", "cantidad": 1, "completo": True},
         {"nombre": "Maletín DJI", "cantidad": 1, "completo": True},
     ]},
    {"id": "GP-01", "categoria": "GoPro", "modelo": "GoPro Hero 12 Black",
     "serial": "GP12-2024-0055", "estado": "disponible",
     "responsable": "Equipo Rehavid Cali", "ciudad_base": "Cali",
     "ultima_revision": "2026-05-12", "proxima_mantencion": "2026-11-12",
     "historial_uso": 31, "notas": "Registro de tareas",
     "accesorios": [
         {"nombre": "Cámara principal", "cantidad": 1, "completo": True},
         {"nombre": "Baterías Enduro", "cantidad": 3, "completo": True},
         {"nombre": "Soportes diversos", "cantidad": 5, "completo": True},
         {"nombre": "MicroSD 128GB", "cantidad": 2, "completo": True},
         {"nombre": "Cargador dual", "cantidad": 1, "completo": True},
     ]},
    {"id": "GP-02", "categoria": "GoPro", "modelo": "GoPro Hero 11 Black",
     "serial": "GP11-2023-0072", "estado": "disponible",
     "responsable": "Equipo Rehavid Medellín", "ciudad_base": "Medellín",
     "ultima_revision": "2026-05-12", "proxima_mantencion": "2026-08-12",
     "historial_uso": 22, "notas": "Backup",
     "accesorios": [
         {"nombre": "Cámara principal", "cantidad": 1, "completo": True},
         {"nombre": "Baterías", "cantidad": 2, "completo": True},
         {"nombre": "Soportes diversos", "cantidad": 4, "completo": True},
         {"nombre": "MicroSD 64GB", "cantidad": 2, "completo": True},
         {"nombre": "Cargador", "cantidad": 1, "completo": True},
     ]},
]

PAQUETES_SEED = [
    {"id": "PKG-01", "nombre": "Pack Ergonomía Avanzada",
     "desc": "Evaluación ergonómica completa con cinemática 3D + activación muscular",
     "equipos_requeridos": ["Xsens", "EMG"], "duracion_dias": 3, "activo": True, "uso_30d": 4},
    {"id": "PKG-02", "nombre": "Pack Ojo + Cuerpo",
     "desc": "Evaluación postural con seguimiento ocular",
     "equipos_requeridos": ["Xsens", "Tobii"], "duracion_dias": 2, "activo": True, "uso_30d": 1},
    {"id": "PKG-03", "nombre": "Pack Fuerza Manual",
     "desc": "Medición de fuerza prensil y lactato",
     "equipos_requeridos": ["Dinamómetro", "Lactómetro"], "duracion_dias": 1, "activo": True, "uso_30d": 2},
    {"id": "PKG-04", "nombre": "Pack Inspección Aérea",
     "desc": "Dron + Tobii para análisis posterior",
     "equipos_requeridos": ["Dron", "Tobii"], "duracion_dias": 1, "activo": True, "uso_30d": 0},
    {"id": "PKG-05", "nombre": "Pack Registro Visual",
     "desc": "Registro de tareas con GoPro",
     "equipos_requeridos": ["GoPro"], "duracion_dias": 2, "activo": True, "uso_30d": 3},
]

# ⚠ SEGURIDAD: estas contraseñas son SOLO para el entorno local/demo.
# No se deben committear contraseñas reales. En producción, sembrar usuarios
# con SEED_PASSWORD (variable de entorno) y forzar cambio en el primer login,
# o usar exclusivamente SSO (Entra ID) para los empleados internos.
_DEMO_PWD = "rehavid-demo-2026"

USERS_SEED = [
    {"email": "ariel.ramirez@rehavid.com.co", "nombre": "Ariel Ramírez",
     "empresa": "Rehavid S.A.S.", "rol": "Director Calidad e Innovación",
     "nivel": 1, "modulos_permitidos": None, "permisos_extra": [], "activo": True,
     "pwd_plain": _DEMO_PWD},
    {"email": "danna.villarraga@rehavid.com.co", "nombre": "Danna Villarraga",
     "empresa": "Rehavid S.A.S.", "rol": "Coordinadora General",
     "nivel": 1, "modulos_permitidos": None, "permisos_extra": [], "activo": True,
     "pwd_plain": _DEMO_PWD},
    {"email": "jhon.orrego@rehavid.com.co", "nombre": "Jhon Orrego",
     "empresa": "Rehavid S.A.S.", "rol": "Operador Senior",
     "nivel": 2, "modulos_permitidos": None, "permisos_extra": [], "activo": True,
     "pwd_plain": _DEMO_PWD},
    {"email": "liliana.hernandez@rehavid.com.co", "nombre": "Liliana Hernández",
     "empresa": "Rehavid S.A.S.", "rol": "Coordinadora Programación",
     "nivel": 3, "modulos_permitidos": ["calendario", "equipos", "paquetes"],
     "permisos_extra": ["agregar_equipos", "editar_inventario"], "activo": True,
     "pwd_plain": _DEMO_PWD},
    {"email": "monica.vargas@arlsura.com", "nombre": "Mónica Vargas",
     "empresa": "ARL SURA", "rol": "Solicitante",
     "nivel": 4, "modulos_permitidos": None, "permisos_extra": [], "activo": True,
     "pwd_plain": _DEMO_PWD},
]


def seed():
    settings = get_settings()
    # Guarda: no sembrar usuarios demo en producción salvo override explícito.
    if settings.environment.lower() == "production" and os.getenv("SEED_FORCE") != "1":
        raise SystemExit(
            "Seed abortado · ENVIRONMENT=production. Los usuarios demo NO deben "
            "cargarse en producción. Use SSO/Entra ID o exporte SEED_FORCE=1 y "
            "SEED_PASSWORD=<clave-fuerte> si realmente lo necesita."
        )
    # En producción con override, la contraseña sale de SEED_PASSWORD (nunca el demo).
    pwd_override = os.getenv("SEED_PASSWORD")

    repo = get_repo()
    now = datetime.now(timezone.utc).isoformat()

    print("Sembrando equipos...")
    for eq in EQUIPOS_SEED:
        repo.upsert("equipos", eq)

    print("Sembrando paquetes...")
    for pkg in PAQUETES_SEED:
        repo.upsert("paquetes", pkg)

    print("Sembrando usuarios...")
    for u in USERS_SEED:
        plain = pwd_override or u.get("pwd_plain", _DEMO_PWD)
        u.pop("pwd_plain", None)
        u["id"] = u["email"]
        u["pwd_hash"] = hash_password(plain)
        u["creates"] = 0
        u["exports"] = 0
        u["actions"] = 0
        u["logins30"] = 0
        u["ultimo"] = now
        repo.upsert("users", u)

    print(f"\n✓ Seed completo · {len(EQUIPOS_SEED)} equipos · {len(PAQUETES_SEED)} paquetes · {len(USERS_SEED)} usuarios")


if __name__ == "__main__":
    seed()
