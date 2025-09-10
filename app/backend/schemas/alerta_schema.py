from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class AlertaBase(BaseModel):
    IdTransaccion: Optional[int] = None
    IdTipoAlerta: Optional[int] = None
    IdEstado: Optional[int] = None
    Asunto: Optional[str] = None
    Mensaje: Optional[str] = None
    Medio: Optional[str] = None
    IdPeriodicidad: int
    FechaInicio: Optional[datetime] = None
    FechaFin: Optional[datetime] = None
    Destinatarios: Optional[str] = None
    AudFecha: Optional[datetime] = None
    AudUsuario: Optional[int] = None
    Obs: Optional[str] = None

class AlertaCreate(AlertaBase):
    IdPeriodicidad: int  # Campo obligatorio

class AlertaUpdate(AlertaBase):
    pass

from backend.schemas.estado_alerta_schema import EstadoAlertaOut

class AlertaOut(AlertaBase):
    idAlerta: int
    estado_nombre: str | None = None

    class Config:
        from_attributes = True

# Alias para compatibilidad
AlertaRead = AlertaOut
