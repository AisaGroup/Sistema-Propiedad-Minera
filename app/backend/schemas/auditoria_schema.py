from pydantic import BaseModel
from datetime import datetime

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

    class Config:
        orm_mode = True
