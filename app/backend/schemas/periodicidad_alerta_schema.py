from pydantic import BaseModel
from typing import Optional

class PeriodicidadAlertaBase(BaseModel):
    Nombre: str
    Descripcion: Optional[str] = None

class PeriodicidadAlertaCreate(PeriodicidadAlertaBase):
    pass

class PeriodicidadAlertaUpdate(PeriodicidadAlertaBase):
    Nombre: Optional[str] = None

class PeriodicidadAlertaRead(PeriodicidadAlertaBase):
    IdPeriodicidad: int

    class Config:
        from_attributes = True

# Alias para compatibilidad
PeriodicidadAlertaOut = PeriodicidadAlertaRead
