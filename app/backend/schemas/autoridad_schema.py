from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class AutoridadBase(BaseModel):
    Nombre: Optional[str] = None
    Abrev: Optional[str] = None
    Ministerio: Optional[str] = None
    Subsecrt: Optional[str] = None
    Provincia: Optional[str] = None
    Direccion: Optional[str] = None
    Contacto: Optional[str] = None
    Telefono: Optional[str] = None
    Web: Optional[str] = None
    AudFecha: Optional[datetime] = None
    AudUsuario: Optional[int] = None

class AutoridadCreate(AutoridadBase):
    IdAutoridad: int

class AutoridadUpdate(AutoridadBase):
    pass

class AutoridadInDBBase(AutoridadBase):
    IdAutoridad: int

    class Config:
        orm_mode = True

class Autoridad(AutoridadInDBBase):
    pass