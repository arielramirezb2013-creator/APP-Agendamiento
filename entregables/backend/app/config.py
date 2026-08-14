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
    # SOLO para el emulador local (certificado self-signed). En Azure real debe
    # quedar en true; validar_para_arranque() lo exige en producción.
    cosmos_connection_verify: bool = True

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

    # Valores por defecto inseguros que NUNCA deben usarse en producción.
    _DEFAULT_JWT_SECRET = "CHANGE-ME-IN-PRODUCTION-USE-KEY-VAULT"
    _EMULATOR_COSMOS_KEY = (
        "C2y6yDjf5/R+ob0N8A7Cgv30VRDJIWEHLM+4QDU5DE2nQ9nDuVTqobD4b8mGGyPMbIZnqyMsEcaGQy67XIw/Jw=="
    )

    def problemas_seguridad(self) -> list[str]:
        """Lista de configuraciones inseguras detectadas (vacía = OK)."""
        problemas: list[str] = []
        if self.jwt_secret == self._DEFAULT_JWT_SECRET or len(self.jwt_secret) < 32:
            problemas.append("JWT_SECRET usa el valor por defecto o es demasiado corto (<32).")
        if self.cosmos_key == self._EMULATOR_COSMOS_KEY:
            problemas.append("COSMOS_KEY es la clave pública del emulador, no la de producción.")
        if not self.cosmos_connection_verify:
            problemas.append("COSMOS_CONNECTION_VERIFY=false (TLS sin verificar) solo es válido con el emulador local.")
        return problemas

    def validar_para_arranque(self) -> None:
        """En producción aborta el arranque si hay secretos inseguros (fail-fast);
        en otros entornos solo advierte por consola."""
        problemas = self.problemas_seguridad()
        if not problemas:
            return
        if self.environment.lower() == "production":
            raise RuntimeError("Configuración insegura en producción · " + " ".join(problemas))
        for p in problemas:
            print(f"[config][ADVERTENCIA] {p}")


@lru_cache()
def get_settings() -> Settings:
    """Singleton de settings · se cachea para no releer el .env en cada request."""
    return Settings()
