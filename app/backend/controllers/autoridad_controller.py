from fastapi import APIRouter, Depends, HTTPException, Response, Query
from sqlalchemy.orm import Session
from backend.schemas.autoridad_schema import Autoridad, AutoridadCreate, AutoridadUpdate
from backend.services import autoridad_service
from backend.database.connection import get_db
from typing import List

router = APIRouter(
    prefix="/autoridades",
    tags=["autoridades"]
)

@router.get("", response_model=List[Autoridad])
def read_autoridades(
    db: Session = Depends(get_db),
    response: Response = None,
    range: str = Query(None, alias="range")
):
    items = autoridad_service.get_autoridades(db)
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
        response.headers["Content-Range"] = f"autoridades {start}-{end}/{total}"
    return paginated_items

@router.get("/{id}", response_model=Autoridad)
def read_autoridad(id: int, db: Session = Depends(get_db)):
    db_obj = autoridad_service.get_autoridad(db, id)
    if db_obj is None:
        raise HTTPException(status_code=404, detail="Autoridad not found")
    return db_obj

@router.post("/", response_model=Autoridad)
def create_autoridad(autoridad: AutoridadCreate, db: Session = Depends(get_db)):
    return autoridad_service.create_autoridad(db, autoridad)

@router.put("/{id}", response_model=Autoridad)
def update_autoridad(id: int, autoridad_update: AutoridadUpdate, db: Session = Depends(get_db)):
    db_obj = autoridad_service.update_autoridad(db, id, autoridad_update)
    if db_obj is None:
        raise HTTPException(status_code=404, detail="Autoridad not found")
    return db_obj

@router.delete("/{id}", response_model=Autoridad)
def delete_autoridad(id: int, db: Session = Depends(get_db)):
    db_obj = autoridad_service.delete_autoridad(db, id)
    if db_obj is None:
        raise HTTPException(status_code=404, detail="Autoridad not found")
    return db_obj