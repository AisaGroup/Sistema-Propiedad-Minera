from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from backend.database.connection import get_db
from backend.schemas.tipo_alerta_schema import TipoAlertaOut, TipoAlertaCreate, TipoAlertaUpdate
from backend.services.tipo_alerta_service import TipoAlertaService
from typing import List

router = APIRouter(prefix="/tipo-alerta", tags=["TipoAlerta"])

@router.get("/", response_model=List[TipoAlertaOut])
def get_all_tipo_alerta(db: Session = Depends(get_db)):
    return TipoAlertaService.get_all(db)

@router.get("/{id_tipo_alerta}", response_model=TipoAlertaOut)
def get_tipo_alerta(id_tipo_alerta: int, db: Session = Depends(get_db)):
    tipo_alerta = TipoAlertaService.get_by_id(db, id_tipo_alerta)
    if not tipo_alerta:
        raise HTTPException(status_code=404, detail="TipoAlerta no encontrado")
    return tipo_alerta

@router.post("/", response_model=TipoAlertaOut)
def create_tipo_alerta(tipo_alerta: TipoAlertaCreate, db: Session = Depends(get_db)):
    return TipoAlertaService.create(db, tipo_alerta)

@router.put("/{id_tipo_alerta}", response_model=TipoAlertaOut)
def update_tipo_alerta(id_tipo_alerta: int, tipo_alerta: TipoAlertaUpdate, db: Session = Depends(get_db)):
    updated = TipoAlertaService.update(db, id_tipo_alerta, tipo_alerta)
    if not updated:
        raise HTTPException(status_code=404, detail="TipoAlerta no encontrado")
    return updated

@router.delete("/{id_tipo_alerta}", response_model=TipoAlertaOut)
def delete_tipo_alerta(id_tipo_alerta: int, db: Session = Depends(get_db)):
    deleted = TipoAlertaService.delete(db, id_tipo_alerta)
    if not deleted:
        raise HTTPException(status_code=404, detail="TipoAlerta no encontrado")
    return deleted
