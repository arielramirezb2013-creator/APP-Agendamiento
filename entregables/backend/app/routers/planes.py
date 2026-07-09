"""Endpoints de planes de acción."""
from fastapi import APIRouter, Depends, HTTPException

from ..db.cosmos import get_repo
from ..models.schemas import Plan, UserOut
from ..services.auth import get_current_user, require_nivel

router = APIRouter(prefix="/planes", tags=["planes"])


@router.get("", response_model=list[Plan])
async def listar(user: UserOut = Depends(get_current_user)):
    repo = get_repo()
    return repo.list_all("planes")


@router.post("", response_model=Plan)
async def crear(plan: Plan, user: UserOut = Depends(require_nivel(2))):
    repo = get_repo()
    if repo.get("planes", item_id=plan.id, partition_key=plan.id) is not None:
        raise HTTPException(status_code=409, detail=f"Plan {plan.id} ya existe")
    repo.upsert("planes", plan.model_dump())
    return plan


@router.put("/{plan_id}", response_model=Plan)
async def actualizar(plan_id: str, plan: Plan, user: UserOut = Depends(require_nivel(2))):
    repo = get_repo()
    repo.upsert("planes", plan.model_dump())
    return plan


@router.delete("/{plan_id}")
async def eliminar(plan_id: str, user: UserOut = Depends(require_nivel(1))):
    repo = get_repo()
    ok = repo.delete("planes", item_id=plan_id, partition_key=plan_id)
    return {"ok": ok}
