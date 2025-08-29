from fastapi import APIRouter, Depends, HTTPException, Response
from sqlalchemy.orm import Session
from backend.services.tipo_expediente_service import TipoExpedienteService
from backend.schemas.tipo_expediente_schema import TipoExpedienteRead, TipoExpedienteCreate
from backend.database.connection import get_db
from typing import List
from fastapi import Query

router = APIRouter(prefix="/tipos-expediente", tags=["Tipos de Expediente"])

@router.get("", response_model=List[TipoExpedienteRead])
def listar_tipos_expediente(
    db: Session = Depends(get_db),
    response: Response = None,
    range: str = Query(None, alias="range")
):
    service = TipoExpedienteService(db)
    items = service.get_all()
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
    response.headers["Content-Range"] = f"tipos-expediente {start}-{end}/{total}"
    return paginated_items

@router.get("/{id_tipo}", response_model=TipoExpedienteRead)
def obtener_tipo(id_tipo: int, db: Session = Depends(get_db)):
    service = TipoExpedienteService(db)
    tipo = service.get_by_id(id_tipo)
    if not tipo:
        raise HTTPException(status_code=404, detail="Tipo de expediente no encontrado")
    return tipo

@router.post("/", response_model=TipoExpedienteRead)
def crear_tipo(tipo_data: TipoExpedienteCreate, db: Session = Depends(get_db)):
    service = TipoExpedienteService(db)
    return service.create(tipo_data)

@router.put("/{id_tipo}", response_model=TipoExpedienteRead)
def actualizar_tipo(id_tipo: int, tipo_data: dict, db: Session = Depends(get_db)):
    service = TipoExpedienteService(db)
    updated = service.update(id_tipo, tipo_data)
    if not updated:
        raise HTTPException(status_code=404, detail="Tipo de expediente no encontrado")
    return updated

@router.delete("/{id_tipo}")
def borrar_tipo(id_tipo: int, db: Session = Depends(get_db)):
    service = TipoExpedienteService(db)
    deleted = service.delete(id_tipo)
    if not deleted:
        raise HTTPException(status_code=404, detail="Tipo de expediente no encontrado")
    return {"ok": True}