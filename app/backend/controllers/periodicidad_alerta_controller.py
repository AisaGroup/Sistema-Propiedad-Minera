from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from backend.services.periodicidad_alerta_service import PeriodicidadAlertaService
from backend.schemas.periodicidad_alerta_schema import PeriodicidadAlertaRead, PeriodicidadAlertaCreate, PeriodicidadAlertaUpdate
from backend.database.connection import get_db
from typing import List

router = APIRouter(prefix="/periodicidad-alerta", tags=["Periodicidad Alerta"])

@router.get("", response_model=List[PeriodicidadAlertaRead])
def listar_periodicidades(db: Session = Depends(get_db)):
    service = PeriodicidadAlertaService(db)
    return service.get_all()

@router.get("/{id_periodicidad}", response_model=PeriodicidadAlertaRead)
def obtener_periodicidad(id_periodicidad: int, db: Session = Depends(get_db)):
    service = PeriodicidadAlertaService(db)
    periodicidad = service.get_by_id(id_periodicidad)
    if not periodicidad:
        raise HTTPException(status_code=404, detail="Periodicidad no encontrada")
    return periodicidad

@router.post("", response_model=PeriodicidadAlertaRead)
def crear_periodicidad(periodicidad: PeriodicidadAlertaCreate, db: Session = Depends(get_db)):
    service = PeriodicidadAlertaService(db)
    return service.create(periodicidad)

@router.put("/{id_periodicidad}", response_model=PeriodicidadAlertaRead)
def actualizar_periodicidad(id_periodicidad: int, periodicidad: PeriodicidadAlertaUpdate, db: Session = Depends(get_db)):
    service = PeriodicidadAlertaService(db)
    updated_periodicidad = service.update(id_periodicidad, periodicidad)
    if not updated_periodicidad:
        raise HTTPException(status_code=404, detail="Periodicidad no encontrada")
    return updated_periodicidad

@router.delete("/{id_periodicidad}")
def eliminar_periodicidad(id_periodicidad: int, db: Session = Depends(get_db)):
    service = PeriodicidadAlertaService(db)
    if not service.delete(id_periodicidad):
        raise HTTPException(status_code=404, detail="Periodicidad no encontrada")
    return {"message": "Periodicidad eliminada exitosamente"}
