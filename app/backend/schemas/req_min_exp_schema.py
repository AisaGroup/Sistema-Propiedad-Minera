from pydantic import BaseModel
from typing import Optional

class ReqMinExpBase(BaseModel):
    IdReqMineroMov: Optional[int] = None
    IdExpediente: Optional[int] = None
    IdPropiedadMinera: Optional[int] = None

class ReqMinExpCreate(ReqMinExpBase):
    pass

class ReqMinExpUpdate(ReqMinExpBase):
    pass

class ReqMinExpOut(ReqMinExpBase):
    IdReqMinExp: int

    class Config:
        from_attributes = True

class ReqMinExpFilter(BaseModel):
    IdReqMineroMov: Optional[int] = None
    IdExpediente: Optional[int] = None
    IdPropiedadMinera: Optional[int] = None
    range: Optional[list] = None
