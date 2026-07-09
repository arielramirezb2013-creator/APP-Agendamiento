"""
Rehavid Operaciones · API principal
Arranca con: uvicorn app.main:app --reload
Documentación interactiva: http://localhost:8000/docs
"""
from contextlib import asynccontextmanager
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from .config import get_settings
from .routers import auth, reservas, equipos, paquetes, predictivo, planes, admin, solicitudes, alertas
from .db.cosmos import get_repo

settings = get_settings()


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Inicializa Cosmos al arrancar. Carga seed data si la DB está vacía."""
    settings.validar_para_arranque()  # aborta en producción si hay secretos por defecto
    repo = get_repo()
    print(f"[startup] {settings.app_name} v{settings.app_version}")
    print(f"[startup] Cosmos DB: {settings.cosmos_database}")
    print(f"[startup] Azure ML: {'habilitado' if settings.azure_ml_enabled else 'deshabilitado (usando mock)'}")
    yield
    print("[shutdown] Cerrando conexiones...")


app = FastAPI(
    title=settings.app_name,
    version=settings.app_version,
    description="API de operaciones de Rehavid · gestión de reservas, equipos y predicción de riesgo MSK",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routers
app.include_router(auth.router)
app.include_router(reservas.router)
app.include_router(equipos.router)
app.include_router(paquetes.router)
app.include_router(predictivo.router)
app.include_router(planes.router)
app.include_router(admin.router)
app.include_router(solicitudes.router)  # O11, O17, O19
app.include_router(alertas.router)      # O21


@app.get("/")
async def root():
    return {
        "app": settings.app_name,
        "version": settings.app_version,
        "docs": "/docs",
        "azure_ml_enabled": settings.azure_ml_enabled,
    }


@app.get("/health")
async def health():
    """Health check para Azure App Service · debe responder en < 1s."""
    try:
        repo = get_repo()
        repo.query("users", "SELECT VALUE COUNT(1) FROM c")
        return {"status": "ok", "cosmos": "ok"}
    except Exception as exc:
        # No exponer str(exc) al público; se loguea para App Insights y se
        # devuelve un mensaje genérico.
        print(f"[health] cosmos degradado: {exc}")
        return JSONResponse(status_code=503, content={"status": "degraded", "cosmos": "error"})


@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    """Captura excepciones no manejadas y las loguea para App Insights."""
    print(f"[error] {request.method} {request.url.path}: {exc}")
    return JSONResponse(
        status_code=500,
        content={"detail": "Error interno · el equipo ha sido notificado"},
    )
