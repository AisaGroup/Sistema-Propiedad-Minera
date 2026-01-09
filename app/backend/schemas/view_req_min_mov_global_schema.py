from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from decimal import Decimal


class ViewReqMinMovGlobalBase(BaseModel):
    IdReqMineroMov: int
    IdPropiedadMinera: Optional[int] = None
    FechaInicio: Optional[datetime] = None
    FechaFin: Optional[datetime] = None
    IdReqMinero: Optional[int] = None
    Descripcion: Optional[str] = None
    Importe: Optional[Decimal] = None
    IdExpediente: Optional[int] = None
    IdPropiedadMineraExp: Optional[int] = None
    CodigoExpediente: Optional[str] = None

    class Config:
        from_attributes = True


class ViewReqMinMovGlobalOut(ViewReqMinMovGlobalBase):
    pass


class ViewReqMinMovGlobalFilter(BaseModel):
    IdReqMineroMov: Optional[int] = None
    IdPropiedadMinera: Optional[int] = None
    IdReqMinero: Optional[int] = None
    IdExpediente: Optional[int] = None
    CodigoExpediente: Optional[str] = None
    range: Optional[list] = None
