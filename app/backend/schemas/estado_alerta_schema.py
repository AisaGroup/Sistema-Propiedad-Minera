from pydantic import BaseModel
from typing import Optional

class EstadoAlertaBase(BaseModel):
    nombre: Optional[str] = None
    Descripcion: Optional[str] = None

class EstadoAlertaCreate(EstadoAlertaBase):
    pass

class EstadoAlertaUpdate(EstadoAlertaBase):
    pass

class EstadoAlertaOut(EstadoAlertaBase):
    IdEstado: int

    class Config:
        from_attributes = True
