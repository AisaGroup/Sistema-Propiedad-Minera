from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from backend.database.connection import get_db
from backend.schemas.estado_alerta_schema import EstadoAlertaOut, EstadoAlertaCreate, EstadoAlertaUpdate
from backend.services.estado_alerta_service import EstadoAlertaService
from typing import List

router = APIRouter(prefix="/estado-alerta", tags=["EstadoAlerta"])

@router.get("/", response_model=List[EstadoAlertaOut])
def get_all_estados_alerta(db: Session = Depends(get_db)):
    return EstadoAlertaService(db).get_estados_alerta()

@router.get("/{id_estado}", response_model=EstadoAlertaOut)
def get_estado_alerta(id_estado: int, db: Session = Depends(get_db)):
    estado = EstadoAlertaService(db).get_estado_alerta(id_estado)
    if not estado:
        raise HTTPException(status_code=404, detail="EstadoAlerta no encontrado")
    return estado

@router.post("/", response_model=EstadoAlertaOut)
def create_estado_alerta(estado_alerta: EstadoAlertaCreate, db: Session = Depends(get_db)):
    return EstadoAlertaService(db).create_estado_alerta(estado_alerta)

@router.put("/{id_estado}", response_model=EstadoAlertaOut)
def update_estado_alerta(id_estado: int, estado_alerta: EstadoAlertaUpdate, db: Session = Depends(get_db)):
    updated = EstadoAlertaService(db).update_estado_alerta(id_estado, estado_alerta)
    if not updated:
        raise HTTPException(status_code=404, detail="EstadoAlerta no encontrado")
    return updated

@router.delete("/{id_estado}", response_model=EstadoAlertaOut)
def delete_estado_alerta(id_estado: int, db: Session = Depends(get_db)):
    deleted = EstadoAlertaService(db).delete_estado_alerta(id_estado)
    if not deleted:
        raise HTTPException(status_code=404, detail="EstadoAlerta no encontrado")
    return deleted
