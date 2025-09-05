from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class TipoAlertaBase(BaseModel):
    Descripcion: str
    IdArea: Optional[int] = None
    Asunto: Optional[str] = None
    Mensaje: Optional[str] = None
    Obs: Optional[str] = None
    AudFecha: Optional[datetime] = None
    AudUsuario: Optional[int] = None

class TipoAlertaCreate(TipoAlertaBase):
    pass

class TipoAlertaUpdate(TipoAlertaBase):
    pass

class TipoAlertaOut(TipoAlertaBase):
    IdTipoAlerta: int

    class Config:
        orm_mode = True
