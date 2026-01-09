from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from decimal import Decimal

class ReqMineroMovBase(BaseModel):
    IdPropiedadMinera: Optional[int] = None
    IdReqMinero: Optional[int] = None
    IdTransaccion: Optional[int] = None
    Descripcion: Optional[str] = None
    Importe: Optional[Decimal] = None
    AudFecha: Optional[datetime] = None
    AudUsuario: Optional[int] = None
    FechaInicio: Optional[datetime] = None
    FechaFin: Optional[datetime] = None

class ReqMineroMovCreate(ReqMineroMovBase):
    pass

class ReqMineroMovUpdate(ReqMineroMovBase):
    pass

class ReqMineroMovOut(ReqMineroMovBase):
    IdReqMineroMov: int

    class Config:
        from_attributes = True

class ReqMineroMovFilter(BaseModel):
    IdPropiedadMinera: Optional[int] = None
    IdReqMinero: Optional[int] = None
    Descripcion: Optional[str] = None
    FechaDesde: Optional[datetime] = None
    FechaHasta: Optional[datetime] = None
    range: Optional[list] = None
