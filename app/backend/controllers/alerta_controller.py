from backend.models.expediente_model import Expediente
from backend.models.acta_model import Acta
from backend.models.resolucion_model import Resolucion
from backend.models.transaccion_model import Transaccion

from fastapi import APIRouter, Depends, HTTPException, Response, Query
from sqlalchemy.orm import Session, joinedload
from backend.services.alerta_service import AlertaService
from backend.schemas.alerta_schema import AlertaCreate, AlertaUpdate, AlertaOut
from backend.schemas.transaccion_schema import TransaccionOut
from backend.database.connection import get_db
from typing import List, Any, Optional
from backend.models.alerta_model import Alerta
from fastapi.responses import JSONResponse
from backend.services.auth_jwt import get_current_user
from backend.services.audit_logger import AuditLogger

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
    range: str = Query(None, alias="range"),
    current_user: dict = Depends(get_current_user)
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
    id_estado: Optional[int] = Query(None),
    db: Session = Depends(get_db),
    response: Response = None,
    range: str = Query(None, alias="range"),
    current_user: dict = Depends(get_current_user)
):
    service = AlertaService(db)
    if id_estado is not None:
        items = service.get_alertas_by_id_estado(id_estado)
    else:
        items = service.get_alertas()
    # Mapear para incluir el nombre del estado
    result = []
    for alerta in items:
        estado_nombre = alerta.estado.nombre if alerta.estado else None
        alerta_dict = alerta.__dict__.copy()
        alerta_dict['estado_nombre'] = estado_nombre
        result.append(alerta_dict)
    total = len(result)
    start, end = 0, total - 1
    if range:
        import json
        try:
            start, end = json.loads(range)
        except Exception:
            pass
    paginated_items = result[start:end+1]
    if response is not None:
        response.headers["Content-Range"] = f"alertas {start}-{end}/{total}"
    return paginated_items

@router.get("/{id}", response_model=AlertaOut)
def get_alerta(id: int, db: Session = Depends(get_db), current_user: dict = Depends(get_current_user)):
    service = AlertaService(db)
    obj = service.get_alerta(id)
    if not obj:
        raise HTTPException(status_code=404, detail="Alerta not found")
    return obj

@router.post("/", response_model=AlertaOut)
@router.post("", response_model=AlertaOut)
def create_alerta(
    alerta: AlertaCreate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    service = AlertaService(db)
    created_alerta = service.create_alerta(alerta)
    AuditLogger(db, current_user).log_creation(
        entidad="Alerta",
        entity_id=created_alerta.idAlerta,
        payload=alerta.model_dump(),
    )
    return created_alerta

@router.put("/{id}", response_model=AlertaOut)
def update_alerta(
    id: int,
    alerta: AlertaUpdate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    service = AlertaService(db)
    obj = service.update_alerta(id, alerta)
    if not obj:
        raise HTTPException(status_code=404, detail="Alerta not found")
    AuditLogger(db, current_user).log_update(
        entidad="Alerta",
        entity_id=id,
        changes=alerta.model_dump(exclude_unset=True),
    )
    return obj

@router.delete("/{id}")
def delete_alerta(
    id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    service = AlertaService(db)
    # Get de la alerta antes de eliminarla para loguearla
    alerta = service.get_alerta(id)
    if not alerta:
        raise HTTPException(status_code=404, detail="Alerta not found")
    deleted = service.delete_alerta(id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Alerta not found")
    AuditLogger(db, current_user).log_deletion(
        entidad="Alerta",
        entity_id=id,
    )
    return {"ok": True}

@router.get("/by-transaccion/{id_transaccion}", response_model=List[AlertaOut])
def get_alertas_by_transaccion(
    id_transaccion: int,
    db: Session = Depends(get_db),
    response: Response = None,
    range: str = Query(None, alias="range")
):
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
