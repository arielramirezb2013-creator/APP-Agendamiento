"""
Rehavid Operaciones · Configuración centralizada
Lee variables de entorno · idealmente desde Azure Key Vault en producción.
"""
from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    # ─────────────────────────────────────────────
    # General
    # ─────────────────────────────────────────────
    app_name: str = "Rehavid Operaciones API"
    app_version: str = "1.0.0"
    environment: str = "development"  # development | staging | production
    debug: bool = False

    # ─────────────────────────────────────────────
    # Azure Cosmos DB (NoSQL)
    # ─────────────────────────────────────────────
    cosmos_endpoint: str = "https://localhost:8081"
    cosmos_key: str = "C2y6yDjf5/R+ob0N8A7Cgv30VRDJIWEHLM+4QDU5DE2nQ9nDuVTqobD4b8mGGyPMbIZnqyMsEcaGQy67XIw/Jw=="  # default emulador
    cosmos_database: str = "rehavid"

    # ─────────────────────────────────────────────
    # Azure Blob Storage (logos, archivos adjuntos)
    # ─────────────────────────────────────────────
    blob_connection_string: str = ""
    blob_container_logos: str = "logos"
    blob_container_attachments: str = "attachments"

    # ─────────────────────────────────────────────
    # Microsoft Entra ID (Azure AD)
    # ─────────────────────────────────────────────
    azure_tenant_id: str = ""
    azure_client_id: str = ""
    azure_client_secret: str = ""
    azure_authority: str = ""  # https://login.microsoftonline.com/{tenant_id}

    # ─────────────────────────────────────────────
    # Azure ML · endpoint del modelo predictivo
    # ─────────────────────────────────────────────
    azure_ml_endpoint: str = ""  # https://<workspace>.<region>.inference.ml.azure.com/score
    azure_ml_key: str = ""
    azure_ml_deployment: str = "rehavid-risk-v1"
    azure_ml_enabled: bool = False  # False = usa el mock; True = llama al endpoint real

    # ─────────────────────────────────────────────
    # JWT (sesiones internas)
    # ─────────────────────────────────────────────
    jwt_secret: str = "CHANGE-ME-IN-PRODUCTION-USE-KEY-VAULT"
    jwt_algorithm: str = "HS256"
    jwt_expire_minutes: int = 480  # 8 horas

    # ─────────────────────────────────────────────
    # CORS · dominios del frontend
    # ─────────────────────────────────────────────
    cors_origins: list[str] = [
        "http://localhost:3000",
        "http://localhost:5173",
        "https://operaciones.rehavid.com.co",
    ]

    # ─────────────────────────────────────────────
    # Application Insights · telemetría
    # ─────────────────────────────────────────────
    appinsights_connection_string: str = ""

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
        case_sensitive = False


@lru_cache()
def get_settings() -> Settings:
    """Singleton de settings · se cachea para no releer el .env en cada request."""
    return Settings()
