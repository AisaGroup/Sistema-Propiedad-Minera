from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from backend.database.connection import get_db
from backend.schemas.observaciones_schema import ObservacionesCreate, ObservacionesUpdate, ObservacionesOut
from backend.services.observaciones_service import ObservacionesService

router = APIRouter(prefix="/observaciones", tags=["Observaciones"])

@router.get("/{id_transaccion}", response_model=ObservacionesOut)
def get_observacion(id_transaccion: int, db: Session = Depends(get_db)):
    obs = ObservacionesService(db).get_observacion(id_transaccion)
    if not obs:
        raise HTTPException(status_code=404, detail="Observación no encontrada")
    return obs

@router.post("/", response_model=ObservacionesOut)
def create_observacion(observacion: ObservacionesCreate, db: Session = Depends(get_db)):
    return ObservacionesService(db).create_observacion(observacion)

@router.put("/{id_transaccion}", response_model=ObservacionesOut)
def update_observacion(id_transaccion: int, observacion: ObservacionesUpdate, db: Session = Depends(get_db)):
    obs = ObservacionesService(db).update_observacion(id_transaccion, observacion)
    if not obs:
        raise HTTPException(status_code=404, detail="Observación no encontrada")
    return obs

@router.delete("/{id_transaccion}", response_model=ObservacionesOut)
def delete_observacion(id_transaccion: int, db: Session = Depends(get_db)):
    obs = ObservacionesService(db).delete_observacion(id_transaccion)
    if not obs:
        raise HTTPException(status_code=404, detail="Observación no encontrada")
    return obs

@router.get("/", response_model=list[ObservacionesOut])
def get_all_observaciones(db: Session = Depends(get_db)):
    return ObservacionesService(db).get_all_observaciones()
