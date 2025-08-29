from pydantic import BaseModel
from typing import Optional
from datetime import date

class ResolucionBase(BaseModel):
    IdExpediente: Optional[int]
    Numero: Optional[str] = None
    Titulo: Optional[str] = None
    Fecha_emision: Optional[date] = None
    Fecha_publicacion: Optional[date] = None
    Estado: Optional[str] = None
    Organismo_emisor: Optional[str] = None
    Contenido: Optional[str] = None
    Descripcion: Optional[str] = None
    Observaciones: Optional[str] = None
    IdTransaccion: Optional[int] = None

class ResolucionCreate(ResolucionBase):
    pass

class ResolucionUpdate(ResolucionBase):
    pass

class ResolucionRead(ResolucionBase):
    IdResolucion: int

    class Config:
        orm_mode = True