from backend.models.expediente_model import Expediente
from backend.models.acta_model import Acta
from backend.models.resolucion_model import Resolucion

from fastapi import APIRouter, Depends, HTTPException, Response, Query
from sqlalchemy.orm import Session
from backend.services.alerta_service import AlertaService
from backend.schemas.alerta_schema import AlertaCreate, AlertaUpdate, AlertaOut
from backend.database.connection import get_db
from typing import List
from backend.models.alerta_model import Alerta
# Endpoint flexible para traer alertas por el IdTransaccion del padre
router = APIRouter(
    prefix="/alertas",
    tags=["alertas"]
)

@router.get("/by-parent", response_model=List[AlertaOut])
def get_alertas_by_parent(
    tipo_padre: str,
    id_padre: int,
    db: Session = Depends(get_db),
    response: Response = None,
    range: str = Query(None, alias="range")
):
    tipo_padre = tipo_padre.lower()
    if tipo_padre == "expediente":
        padre = db.query(Expediente).filter(Expediente.IdExpediente == id_padre).first()
    elif tipo_padre == "acta":
        padre = db.query(Acta).filter(Acta.IdActa == id_padre).first()
    elif tipo_padre == "resolucion":
        padre = db.query(Resolucion).filter(Resolucion.IdResolucion == id_padre).first()
    else:
        raise HTTPException(status_code=400, detail="Tipo de padre no válido")
    if not padre or not getattr(padre, "IdTransaccion", None):
        raise HTTPException(status_code=404, detail="Padre no encontrado o sin IdTransaccion")
    id_transaccion = padre.IdTransaccion
    query = db.query(Alerta).filter(Alerta.IdTransaccion == id_transaccion)
    items = query.order_by(Alerta.idAlerta).all()
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
        response.headers["Content-Range"] = f"alertas {start}-{end}/{total}"
    return paginated_items




@router.get("/", response_model=List[AlertaOut])
def list_alertas(
    db: Session = Depends(get_db),
    response: Response = None,
    range: str = Query(None, alias="range")
):
    service = AlertaService(db)
    items = service.get_alertas()
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
        response.headers["Content-Range"] = f"alertas {start}-{end}/{total}"
    return paginated_items

@router.get("/{id}", response_model=AlertaOut)
def get_alerta(id: int, db: Session = Depends(get_db)):
    service = AlertaService(db)
    obj = service.get_alerta(id)
    if not obj:
        raise HTTPException(status_code=404, detail="Alerta not found")
    return obj

@router.post("/", response_model=AlertaOut)
def create_alerta(alerta: AlertaCreate, db: Session = Depends(get_db)):
    service = AlertaService(db)
    return service.create_alerta(alerta)

@router.put("/{id}", response_model=AlertaOut)
def update_alerta(id: int, alerta: AlertaUpdate, db: Session = Depends(get_db)):
    service = AlertaService(db)
    obj = service.update_alerta(id, alerta)
    if not obj:
        raise HTTPException(status_code=404, detail="Alerta not found")
    return obj

@router.delete("/{id}", response_model=AlertaOut)
def delete_alerta(id: int, db: Session = Depends(get_db)):
    service = AlertaService(db)
    obj = service.delete_alerta(id)
    if not obj:
        raise HTTPException(status_code=404, detail="Alerta not found")
    return obj
