from fastapi import APIRouter, Depends, HTTPException, Response, Query
from sqlalchemy.orm import Session
from backend.services.auditoria_service import AuditoriaService
from backend.schemas.auditoria_schema import AuditoriaCreate, AuditoriaUpdate, AuditoriaOut
from backend.database.connection import get_db
from typing import List
from backend.services.auth_jwt import get_current_user

router = APIRouter(
    prefix="/auditorias",
    tags=["auditorias"]
)

@router.get("/", response_model=List[AuditoriaOut])
def list_auditorias(
    db: Session = Depends(get_db),
    response: Response = None,
    range: str = Query(None, alias="range"),
    current_user: int = Depends(get_current_user)
):
    service = AuditoriaService(db)
    items = service.get_auditorias()
    total = len(items)
    start, end = 0, total - 1
    if range:
        import json
        try:
            start, end = json.loads(range)
        except Exception:
            pass
    paginated_items = items[start:end+1]
    if response is not None:
        response.headers["Content-Range"] = f"auditorias {start}-{end}/{total}"
    # Convierte los diccionarios a modelos Pydantic para la serialización correcta
    return [AuditoriaOut(**item) for item in paginated_items]

@router.get("/{id}", response_model=AuditoriaOut)
def get_auditoria(id: int, db: Session = Depends(get_db), current_user: int = Depends(get_current_user)):
    service = AuditoriaService(db)
    obj = service.get_auditoria(id)
    if not obj:
        raise HTTPException(status_code=404, detail="Auditoria not found")
    return obj

@router.post("/", response_model=AuditoriaOut)
def create_auditoria(auditoria: AuditoriaCreate, db: Session = Depends(get_db), current_user: int = Depends(get_current_user)):
    service = AuditoriaService(db)
    return service.create_auditoria(auditoria)

@router.put("/{id}", response_model=AuditoriaOut)
def update_auditoria(id: int, auditoria: AuditoriaUpdate, db: Session = Depends(get_db), current_user: int = Depends(get_current_user)):
    service = AuditoriaService(db)
    obj = service.update_auditoria(id, auditoria)
    if not obj:
        raise HTTPException(status_code=404, detail="Auditoria not found")
    return obj

@router.delete("/{id}", response_model=AuditoriaOut)
def delete_auditoria(id: int, db: Session = Depends(get_db), current_user: int = Depends(get_current_user)):
    service = AuditoriaService(db)
    obj = service.delete_auditoria(id)
    if not obj:
        raise HTTPException(status_code=404, detail="Auditoria not found")
    return obj
