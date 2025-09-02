from pydantic import BaseModel
from typing import Optional
from datetime import date, datetime

class ActaBase(BaseModel):
    IdTransaccion: Optional[int] = None
    IdExpediente: int
    IdTipoActa: Optional[str] = None
    Fecha: Optional[date] = None
    Lugar: Optional[str] = None
    IdAutoridad: Optional[int] = None
    Descripcion: Optional[str] = None
    Obs: Optional[str] = None
    AudFecha: Optional[datetime] = None
    AudUsuario: Optional[int] = None

class ActaCreate(ActaBase):
    pass

class ActaRead(ActaBase):
    IdActa: int

    class Config:
        from_attributes = True
