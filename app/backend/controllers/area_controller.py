from fastapi import APIRouter, Depends, HTTPException, Response, Query
from sqlalchemy.orm import Session
from backend.schemas.area_schema import Area, AreaCreate, AreaUpdate
from backend.services import area_service
from backend.database.connection import get_db
from typing import List

router = APIRouter(
    prefix="/areas",
    tags=["areas"]
)

@router.get("", response_model=List[Area])
def listar_areas(
    db: Session = Depends(get_db),
    response: Response = None,
    range: str = Query(None, alias="range")
):
    items = area_service.get_areas(db)
    total = len(items)
    # Parse range param (ejemplo: '[0,9]')
    start, end = 0, total - 1
    if range:
        import json
        try:
            start, end = json.loads(range)
        except Exception:
            pass
    paginated_items = items[start:end+1]
    if response is not None:
        response.headers["Content-Range"] = f"areas {start}-{end}/{total}"
    return paginated_items

@router.get("/{id}", response_model=Area)
def obtener_area(id: int, db: Session = Depends(get_db)):
    area = area_service.get_area(db, id)
    if not area:
        raise HTTPException(status_code=404, detail="Area no encontrada")
    return area

@router.post("/", response_model=Area)
def crear_area(area_data: AreaCreate, db: Session = Depends(get_db)):
    return area_service.create_area(db, area_data)

@router.put("/{id}", response_model=Area)
def actualizar_area(id: int, area_data: AreaUpdate, db: Session = Depends(get_db)):
    updated = area_service.update_area(db, id, area_data)
    if not updated:
        raise HTTPException(status_code=404, detail="Area no encontrada")
    return updated

@router.delete("/{id}")
def borrar_area(id: int, db: Session = Depends(get_db)):
    deleted = area_service.delete_area(db, id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Area no encontrada")
    return {"ok": True}