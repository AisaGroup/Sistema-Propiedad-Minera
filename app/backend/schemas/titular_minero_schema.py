from pydantic import BaseModel
from typing import Optional
from datetime import date

class TitularMineroBase(BaseModel):
    TipoPersona: str
    Nombre: str
    DniCuit: str
    Domicilio: str
    Telefono: str
    Email: str
    FechaAsignacion: date
    Estado: str
    RepresentanteLegal: str
    Observaciones: Optional[str] = None
    Descripcion: Optional[str] = None

class TitularMineroCreate(TitularMineroBase):
    IdTransaccion: Optional[int] = None

class TitularMineroUpdate(TitularMineroBase):
    IdTransaccion: Optional[int] = None


class TitularMineroRead(TitularMineroBase):
    IdTitular: int
    IdTransaccion: int

    class Config:
        from_attributes = True