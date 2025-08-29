from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime

class NotificacionBase(BaseModel):
    IdTransaccion: int
    Organismo: Optional[str] = None
    Jurisdiccion: Optional[str] = None
    IdExpediente: Optional[int] = None
    IdTitular: Optional[int] = None
    IdTitMinDirLegal: Optional[int] = None
    TipoNotificacion: Optional[int] = None
    IdPropiedadMinera: Optional[int] = None
    Ubicacion: Optional[str] = None
    Latitud: Optional[float] = None
    Longitud: Optional[float] = None
    Resolucion: Optional[str] = None
    Fundamentos: Optional[str] = None
    IdAutoridad: Optional[int] = None
    Plazo: Optional[datetime] = None
    Emision: Optional[datetime] = None
    Funcionario: Optional[str] = None
    Observaciones: Optional[str] = None
    AudFecha: Optional[datetime] = None
    AudUsuario: Optional[int] = None

class NotificacionCreate(NotificacionBase):
    pass

class NotificacionUpdate(NotificacionBase):
    pass

class NotificacionOut(NotificacionBase):
    IdNotificacion: int

    class Config:
        orm_mode = True