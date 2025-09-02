from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class ObservacionesBase(BaseModel):
    IdTransaccion: int
    Descripcion: str
    Observaciones: Optional[str] = None
    AudFecha: Optional[datetime] = None
    AudUsuario: Optional[int] = None

class ObservacionesCreate(ObservacionesBase):
    pass

class ObservacionesUpdate(ObservacionesBase):
    pass

class ObservacionesOut(ObservacionesBase):
    IdObservacion: int

    class Config:
        from_attributes = True
