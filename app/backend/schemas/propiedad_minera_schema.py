from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class PropiedadMineraBase(BaseModel):
    IdTransaccion: Optional[int] = None
    IdTitular: Optional[int] = None
    Nombre: Optional[str]
    Solicitud: Optional[datetime]
    Registro: Optional[datetime]
    Notificacion: Optional[datetime]
    Provincia: Optional[str]
    Mensura: Optional[datetime]
    AreaHectareas: Optional[float]
    DescubrimientoDirecto: Optional[str] = None
    Referente: Optional[bool] = None

class PropiedadMineraCreate(PropiedadMineraBase):
    pass

class PropiedadMineraRead(PropiedadMineraBase):
    IdPropiedadMinera: int
    TitularNombre: Optional[str] = None  # Nombre del titular

    class Config:
        from_attributes = True


class PropiedadMineraExportFilters(BaseModel):
    nombre: Optional[str] = None
    provincia: Optional[str] = None
    idTitular: Optional[int] = None
    expediente: Optional[str] = None