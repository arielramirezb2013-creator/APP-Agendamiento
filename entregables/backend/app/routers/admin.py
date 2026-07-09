"""Endpoints de administración · gestión de usuarios."""
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException

from ..db.cosmos import get_repo
from ..models.schemas import UserCreate, UserOut, UserBase
from ..services.auth import get_current_user, require_nivel, hash_password

router = APIRouter(prefix="/admin", tags=["admin"])


@router.get("/users", response_model=list[UserOut])
async def listar_usuarios(user: UserOut = Depends(require_nivel(1))):
    repo = get_repo()
    users = repo.list_all("users")
    return [{k: v for k, v in u.items() if k != "pwd_hash"} for u in users]


@router.post("/users", response_model=UserOut)
async def crear_usuario(data: UserCreate, user: UserOut = Depends(require_nivel(1))):
    repo = get_repo()
    email = data.email.lower()
    if repo.get("users", item_id=email, partition_key=email) is not None:
        raise HTTPException(status_code=409, detail="Email ya registrado")
    record = data.model_dump()
    record["email"] = email
    record["pwd_hash"] = hash_password(record.pop("pwd"))
    record["id"] = email  # Cosmos usa /email como partition · id sigue el patrón
    record["creates"] = 0
    record["exports"] = 0
    record["actions"] = 0
    record["logins30"] = 0
    record["ultimo"] = None
    repo.upsert("users", record)
    record.pop("pwd_hash", None)
    return UserOut(**record)


@router.put("/users/{email}", response_model=UserOut)
async def actualizar_usuario(
    email: str, data: UserBase, user: UserOut = Depends(require_nivel(1))
):
    repo = get_repo()
    email = email.lower()
    existing = repo.get("users", item_id=email, partition_key=email)
    if existing is None:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
    existing.update(data.model_dump())
    repo.upsert("users", existing)
    existing.pop("pwd_hash", None)
    return UserOut(**existing)


@router.post("/users/{email}/desactivar")
async def desactivar_usuario(email: str, user: UserOut = Depends(require_nivel(1))):
    repo = get_repo()
    email = email.lower()
    u = repo.get("users", item_id=email, partition_key=email)
    if u is None:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
    u["activo"] = False
    repo.upsert("users", u)
    return {"ok": True, "email": email, "activo": False}


@router.get("/auditoria")
async def auditoria(
    email: str | None = None,
    desde: str | None = None,
    hasta: str | None = None,
    user: UserOut = Depends(require_nivel(1)),
):
    """Lee eventos de auditoría desde Application Insights / Cosmos."""
    repo = get_repo()
    sql = "SELECT * FROM c WHERE 1=1"
    params: list[dict] = []
    if email:
        sql += " AND c.user_email = @e"
        params.append({"name": "@e", "value": email.lower()})
    if desde:
        sql += " AND c.timestamp >= @d"
        params.append({"name": "@d", "value": desde})
    if hasta:
        sql += " AND c.timestamp <= @h"
        params.append({"name": "@h", "value": hasta})
    return repo.query("auditoria", sql, params)
