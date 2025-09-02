from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class TransaccionBase(BaseModel):
    IdTransaccionPadre: Optional[int] = None
    Descripcion: Optional[str] = None
    IdRegistro: int
    Tabla: str
    AudFecha: Optional[datetime] = None
    AudUsuario: Optional[str] = None

class TransaccionCreate(TransaccionBase):
    pass

class TransaccionUpdate(TransaccionBase):
    pass

class TransaccionOut(TransaccionBase):
    IdTransaccion: int

    class Config:
        orm_mode = True
