"""
Servicio de autenticación.
Soporta dos modos:
  1) Login por email/password contra Cosmos (para usuarios externos)
  2) SSO con Microsoft Entra ID (para usuarios internos @rehavid.com.co)

En producción, los empleados de Rehavid deben usar SSO. Los usuarios
externos (clientes, ARL SURA, JD TASS, etc.) usan email/password.
"""
import hashlib
import secrets
from datetime import datetime, timedelta, timezone
from typing import Annotated

from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from msal import ConfidentialClientApplication

from ..config import get_settings
from ..db.cosmos import get_repo
from ..models.schemas import UserOut

settings = get_settings()
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/login")


def hash_password(plain: str) -> str:
    """Hash con salt random · pbkdf2_hmac es estándar."""
    salt = secrets.token_hex(16)
    h = hashlib.pbkdf2_hmac("sha256", plain.encode(), salt.encode(), 100_000)
    return f"{salt}${h.hex()}"


def verify_password(plain: str, hashed: str) -> bool:
    try:
        salt, h = hashed.split("$", 1)
        check = hashlib.pbkdf2_hmac("sha256", plain.encode(), salt.encode(), 100_000)
        return secrets.compare_digest(check.hex(), h)
    except (ValueError, AttributeError):
        return False


def create_access_token(data: dict) -> str:
    """Genera JWT firmado con HS256."""
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + timedelta(minutes=settings.jwt_expire_minutes)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, settings.jwt_secret, algorithm=settings.jwt_algorithm)


async def get_current_user(token: Annotated[str, Depends(oauth2_scheme)]) -> UserOut:
    """Dependency que extrae el usuario del JWT en cada request protegido."""
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Credenciales inválidas o expiradas",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, settings.jwt_secret, algorithms=[settings.jwt_algorithm])
        email: str = payload.get("sub")
        if email is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception

    repo = get_repo()
    user = repo.get("users", item_id=email, partition_key=email)
    if user is None:
        raise credentials_exception
    user.pop("pwd_hash", None)  # no devolver el hash
    return UserOut(**user)


def require_nivel(max_nivel: int):
    """Factory de dependency que valida que el usuario tenga nivel <= max_nivel.
    Nivel 1 = más permisos, Nivel 4 = menos."""
    async def _check(user: UserOut = Depends(get_current_user)) -> UserOut:
        if user.nivel > max_nivel:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Se requiere nivel {max_nivel} o superior · usted es nivel {user.nivel}",
            )
        return user
    return _check


# ────────────────────────────────────────────────────────────
# Microsoft Entra ID (Azure AD) · SSO
# ────────────────────────────────────────────────────────────
def get_entra_app() -> ConfidentialClientApplication | None:
    """Construye el cliente MSAL si las credenciales están configuradas."""
    if not (settings.azure_tenant_id and settings.azure_client_id and settings.azure_client_secret):
        return None
    return ConfidentialClientApplication(
        client_id=settings.azure_client_id,
        client_credential=settings.azure_client_secret,
        authority=settings.azure_authority or f"https://login.microsoftonline.com/{settings.azure_tenant_id}",
    )


def get_entra_auth_url(redirect_uri: str, state: str) -> str | None:
    """URL para que el usuario haga login con su cuenta @rehavid.com.co."""
    app = get_entra_app()
    if app is None:
        return None
    return app.get_authorization_request_url(
        scopes=["User.Read"],
        redirect_uri=redirect_uri,
        state=state,
    )


def exchange_entra_code(code: str, redirect_uri: str) -> dict | None:
    """Intercambia el código OAuth por un token y devuelve los claims del usuario."""
    app = get_entra_app()
    if app is None:
        return None
    result = app.acquire_token_by_authorization_code(
        code=code,
        scopes=["User.Read"],
        redirect_uri=redirect_uri,
    )
    if "id_token_claims" in result:
        return result["id_token_claims"]
    return None
