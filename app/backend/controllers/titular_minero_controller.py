from fastapi import APIRouter, Depends, HTTPException, Response, Query
from sqlalchemy.orm import Session
from backend.services.titular_minero_service import TitularMineroService
from backend.schemas.titular_minero_schema import TitularMineroRead, TitularMineroCreate
from backend.database.connection import get_db
from typing import List


router = APIRouter(prefix="/titulares-mineros", tags=["Titulares Mineros"])

@router.get("", response_model=List[TitularMineroRead])
def listar_titulares(
    db: Session = Depends(get_db),
    response: Response = None,
    range: str = Query(None, alias="range")
):
    service = TitularMineroService(db)
    items = service.get_all()
    total = len(items)

    # Paginación tipo React Admin
    start, end = 0, total - 1
    if range:
        import json
        try:
            start, end = json.loads(range)
        except Exception:
            pass

    paginated_items = items[start:end+1]
    response.headers["Content-Range"] = f"titulares-mineros {start}-{end}/{total}"
    return paginated_items

@router.get("/{id_titular}", response_model=TitularMineroRead)
def obtener_titular(id_titular: int, db: Session = Depends(get_db)):
    service = TitularMineroService(db)
    titular = service.get_by_id(id_titular)
    if not titular:
        raise HTTPException(status_code=404, detail="Titular minero no encontrado")
    return titular

@router.post("/", response_model=TitularMineroRead)
def crear_titular(titular_data: TitularMineroCreate, db: Session = Depends(get_db)):
    service = TitularMineroService(db)
    return service.create(titular_data)

@router.put("/{id_titular}", response_model=TitularMineroRead)
def actualizar_titular(id_titular: int, titular_data: dict, db: Session = Depends(get_db)):
    service = TitularMineroService(db)
    updated = service.update(id_titular, titular_data)
    if not updated:
        raise HTTPException(status_code=404, detail="Titular minero no encontrado")
    return updated

@router.delete("/{id_titular}")
def borrar_titular(id_titular: int, db: Session = Depends(get_db)):
    service = TitularMineroService(db)
    deleted = service.delete(id_titular)
    if not deleted:
        raise HTTPException(status_code=404, detail="Titular minero no encontrado")
    return {"ok": True}