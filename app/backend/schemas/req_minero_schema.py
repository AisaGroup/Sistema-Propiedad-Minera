from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class ReqMineroBase(BaseModel):
    IdTransaccion: Optional[int] = None
    Tipo: Optional[str] = None
    Descripcion: Optional[str] = None

class ReqMineroCreate(ReqMineroBase):
    pass

class ReqMineroUpdate(ReqMineroBase):
    pass

class ReqMinero(ReqMineroBase):
    IdReqMinero: int
    
    class Config:
        from_attributes = True
