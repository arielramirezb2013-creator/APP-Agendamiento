"""Endpoints de autenticación."""
from fastapi import APIRouter, HTTPException, status, Depends
from fastapi.security import OAuth2PasswordRequestForm

from ..db.cosmos import get_repo
from ..models.schemas import LoginRequest, LoginResponse, UserOut
from ..services.auth import (
    verify_password,
    create_access_token,
    get_current_user,
    get_entra_auth_url,
    exchange_entra_code,
)

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/login", response_model=LoginResponse)
async def login(data: LoginRequest):
    """Login por email + password.
    Para usuarios internos de Rehavid, preferir /auth/sso (Entra ID)."""
    repo = get_repo()
    user = repo.get("users", item_id=data.email.lower(), partition_key=data.email.lower())
    if user is None:
        raise HTTPException(status_code=401, detail="Usuario o contraseña inválidos")
    if not user.get("activo", True):
        raise HTTPException(status_code=403, detail="Usuario desactivado · contacte al administrador")
    if not verify_password(data.password, user.get("pwd_hash", "")):
        raise HTTPException(status_code=401, detail="Usuario o contraseña inválidos")

    token = create_access_token({"sub": user["email"], "nivel": user["nivel"]})
    user.pop("pwd_hash", None)
    return LoginResponse(access_token=token, user=UserOut(**user))


@router.get("/sso/url")
async def sso_url(redirect_uri: str, state: str = "default"):
    """Inicia flujo de SSO con Microsoft Entra ID.
    Devuelve la URL a la que redirigir al navegador."""
    url = get_entra_auth_url(redirect_uri, state)
    if url is None:
        raise HTTPException(
            status_code=503,
            detail="SSO no configurado · verificar AZURE_TENANT_ID, AZURE_CLIENT_ID en config",
        )
    return {"auth_url": url}


@router.get("/sso/callback")
async def sso_callback(code: str, state: str, redirect_uri: str):
    """Callback de Entra ID. Intercambia código por token y emite JWT propio."""
    claims = exchange_entra_code(code, redirect_uri)
    if claims is None:
        raise HTTPException(status_code=401, detail="No se pudo validar el token de Entra ID")

    email = claims.get("preferred_username") or claims.get("email")
    if not email:
        raise HTTPException(status_code=401, detail="Token de Entra ID sin email")

    repo = get_repo()
    user = repo.get("users", item_id=email.lower(), partition_key=email.lower())
    if user is None:
        raise HTTPException(
            status_code=403,
            detail=f"Usuario {email} no autorizado en Rehavid Operaciones · contacte al admin",
        )

    token = create_access_token({"sub": user["email"], "nivel": user["nivel"]})
    user.pop("pwd_hash", None)
    return LoginResponse(access_token=token, user=UserOut(**user))


@router.get("/me", response_model=UserOut)
async def me(user: UserOut = Depends(get_current_user)):
    """Devuelve los datos del usuario autenticado."""
    return user
