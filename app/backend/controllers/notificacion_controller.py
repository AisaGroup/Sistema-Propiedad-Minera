from fastapi import APIRouter, Depends, HTTPException, Response, Query
from sqlalchemy.orm import Session
from backend.services.notificacion_service import NotificacionService
from backend.schemas.notificacion_schema import NotificacionCreate, NotificacionUpdate, NotificacionOut
from backend.database.connection import get_db
from typing import List


router = APIRouter(
    prefix="/notificaciones",
    tags=["notificaciones"]
)






@router.get("/", response_model=List[NotificacionOut])
def list_notificaciones(
    db: Session = Depends(get_db),
    response: Response = None,
    range: str = Query(None, alias="range")
):
    service = NotificacionService(db)
    items = service.get_notificaciones()
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
        response.headers["Content-Range"] = f"notificaciones {start}-{end}/{total}"
    return paginated_items

@router.get("/{id}", response_model=NotificacionOut)
def get_notificacion(id: int, db: Session = Depends(get_db)):
    service = NotificacionService(db)
    obj = service.get_notificacion(id)
    if not obj:
        raise HTTPException(status_code=404, detail="Notificacion not found")
    return obj

@router.post("/", response_model=NotificacionOut)
def create_notificacion(notificacion: NotificacionCreate, db: Session = Depends(get_db)):
    service = NotificacionService(db)
    return service.create_notificacion(notificacion)

@router.put("/{id}", response_model=NotificacionOut)
def update_notificacion(id: int, notificacion: NotificacionUpdate, db: Session = Depends(get_db)):
    service = NotificacionService(db)
    obj = service.update_notificacion(id, notificacion)
    if not obj:
        raise HTTPException(status_code=404, detail="Notificacion not found")
    return obj

@router.delete("/{id}", response_model=NotificacionOut)
def delete_notificacion(id: int, db: Session = Depends(get_db)):
    service = NotificacionService(db)
    obj = service.delete_notificacion(id)
    if not obj:
        raise HTTPException(status_code=404, detail="Notificacion not found")
    return obj