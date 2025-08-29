from pydantic import BaseModel
from typing import Optional

class TipoExpedienteBase(BaseModel):
    Nombre: str
    Descripcion: Optional[str]
    Activo: Optional[bool]

class TipoExpedienteCreate(TipoExpedienteBase):
    IdTipoExpediente: int

class TipoExpedienteRead(TipoExpedienteBase):
    IdTipoExpediente: int

    class Config:
        orm_mode = True