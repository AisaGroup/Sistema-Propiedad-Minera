from pydantic import BaseModel
from typing import Optional
from datetime import date

class TitularMineroBase(BaseModel):
    IdTransaccion: int
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
    IdTitular: int

class TitularMineroUpdate(TitularMineroBase):
    pass


class TitularMineroRead(TitularMineroBase):
    IdTitular: int

    class Config:
        orm_mode = True