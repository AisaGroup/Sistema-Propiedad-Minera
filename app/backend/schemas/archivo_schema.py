from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime

class ArchivoBase(BaseModel):
    IdTransaccion: Optional[int] = None
    Descripcion: Optional[str] = None
    Archivo: Optional[str] = None
    Link: str
    AudFecha: datetime
    AudUsuario: int

class ArchivoCreate(ArchivoBase):
    pass

class ArchivoUpdate(ArchivoBase):
    pass

class ArchivoOut(ArchivoBase):
    IdArchivo: int

    class Config:
        from_attributes = True
