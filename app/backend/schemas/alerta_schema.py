from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class AlertaBase(BaseModel):
    IdTransaccion: Optional[int] = None
    IdTipoAlerta: Optional[int] = None
    Estado: Optional[str] = None
    Asunto: Optional[str] = None
    Mensaje: Optional[str] = None
    Medio: Optional[str] = None
    Periodicidad: Optional[str] = None
    FechaInicio: Optional[datetime] = None
    FechaFin: Optional[datetime] = None
    Obs: Optional[str] = None
    AudFecha: Optional[datetime] = None
    AudUsuario: Optional[int] = None

class AlertaCreate(AlertaBase):
    pass

class AlertaUpdate(AlertaBase):
    pass

class AlertaOut(AlertaBase):
    idAlerta: int

    class Config:
        from_attributes = True
