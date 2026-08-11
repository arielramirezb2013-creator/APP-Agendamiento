"""Endpoints de autenticación."""
import time
from collections import defaultdict

from fastapi import APIRouter, HTTPException, status, Depends, Request

from ..db.cosmos import get_repo
from ..models.schemas import LoginRequest, LoginResponse, UserOut
from ..services.auth import (
    verify_password,
    create_access_token,
    get_current_user,
    get_entra_auth_url,
    exchange_entra_code,
    create_sso_state,
    verify_sso_state,
)

router = APIRouter(prefix="/auth", tags=["auth"])


# ────────────────────────────────────────────────────────────
# Rate limiting simple en memoria para /login (anti-fuerza bruta).
# NOTA: es por-proceso; con varias instancias/replicas conviene un store
# compartido (Redis) o el rate limiting de Azure API Management / App Gateway.
# ────────────────────────────────────────────────────────────
_LOGIN_MAX_INTENTOS = 5           # intentos fallidos permitidos
_LOGIN_VENTANA_SEG = 15 * 60      # ventana deslizante (15 min)
_login_fails: dict[str, list[float]] = defaultdict(list)


def _rate_limit_key(request: Request, email: str) -> str:
    ip = request.client.host if request.client else "?"
    return f"{ip}|{email.lower()}"


def _chequear_rate_limit(key: str) -> None:
    ahora = time.time()
    # Cota de memoria: si el mapa crece demasiado (muchas IP+correo distintos),
    # purgar todas las entradas cuya ventana ya expiró.
    if len(_login_fails) > 10_000:
        for k in [k for k, ts in _login_fails.items() if not ts or ahora - ts[-1] >= _LOGIN_VENTANA_SEG]:
            _login_fails.pop(k, None)
    intentos = [t for t in _login_fails[key] if ahora - t < _LOGIN_VENTANA_SEG]
    _login_fails[key] = intentos
    if len(intentos) >= _LOGIN_MAX_INTENTOS:
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail="Demasiados intentos fallidos · espere unos minutos e intente de nuevo.",
        )


def _registrar_fallo(key: str) -> None:
    _login_fails[key].append(time.time())


@router.post("/login", response_model=LoginResponse)
async def login(data: LoginRequest, request: Request):
    """Login por email + password.
    Para usuarios internos de Rehavid, preferir /auth/sso (Entra ID)."""
    key = _rate_limit_key(request, data.email)
    _chequear_rate_limit(key)

    repo = get_repo()
    user = repo.get("users", item_id=data.email.lower(), partition_key=data.email.lower())
    if user is None:
        _registrar_fallo(key)
        raise HTTPException(status_code=401, detail="Usuario o contraseña inválidos")
    if not user.get("activo", True):
        raise HTTPException(status_code=403, detail="Usuario desactivado · contacte al administrador")
    if not verify_password(data.password, user.get("pwd_hash", "")):
        _registrar_fallo(key)
        raise HTTPException(status_code=401, detail="Usuario o contraseña inválidos")

    _login_fails.pop(key, None)  # login exitoso · limpiar contador
    token = create_access_token({"sub": user["email"], "nivel": user["nivel"]})
    user.pop("pwd_hash", None)
    return LoginResponse(access_token=token, user=UserOut(**user))


@router.get("/sso/url")
async def sso_url(redirect_uri: str, state: str = "default"):
    """Inicia flujo de SSO con Microsoft Entra ID.
    Devuelve la URL a la que redirigir al navegador. El `state` se firma en el
    servidor (CSRF): el cliente no puede fabricar uno válido."""
    signed_state = create_sso_state(state)
    url = get_entra_auth_url(redirect_uri, signed_state)
    if url is None:
        raise HTTPException(
            status_code=503,
            detail="SSO no configurado · verificar AZURE_TENANT_ID, AZURE_CLIENT_ID en config",
        )
    return {"auth_url": url}


@router.get("/sso/callback")
async def sso_callback(code: str, state: str, redirect_uri: str):
    """Callback de Entra ID. Intercambia código por token y emite JWT propio."""
    if not verify_sso_state(state):
        raise HTTPException(status_code=401, detail="State de SSO inválido o expirado (posible CSRF)")

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
