from pydantic import BaseModel
from typing import Optional
from datetime import datetime, date

class ExpedienteBase(BaseModel):
    CodigoExpediente: Optional[str]
    PrimerDueño: Optional[str] = None
    Año: Optional[datetime] = None
    FechaInicio: Optional[date] = None
    FechaFin: Optional[date] = None
    Estado: Optional[str] = None
    Dependencia: Optional[str] = None
    Caratula: Optional[str] = None
    Descripcion: Optional[str] = None
    Observaciones: Optional[str] = None
    IdPropiedadMinera: Optional[int]
    IdTipoExpediente: Optional[int] = None
    IdTransaccion: Optional[int] = None

class ExpedienteCreate(ExpedienteBase):
    pass

class ExpedienteRead(ExpedienteBase):
    IdExpediente: int

    class Config:
        from_attributes = True