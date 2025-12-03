from pydantic import BaseModel
from datetime import datetime
from typing import Optional, List


class AuditoriaBase(BaseModel):
    Accion: str
    Entidad: str
    Descripcion: str
    AudFecha: datetime
    AudUsuario: int


class AuditoriaCreate(AuditoriaBase):
    pass


class AuditoriaUpdate(AuditoriaBase):
    pass


class AuditoriaOut(AuditoriaBase):
    IdAuditoria: int
    UsuarioNombre: Optional[str] = None  # nombre completo del usuario

    class Config:
        orm_mode = True


class AuditoriaExportFilters(BaseModel):
    usuario: Optional[str] = None
    entidad: List[str] = []
    accion: List[str] = []
    idTransaccion: Optional[str] = None
    fechaDesde: Optional[datetime] = None
    fechaHasta: Optional[datetime] = None
