from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class AreaBase(BaseModel):
    Descripcion: str
    AudFecha: Optional[datetime] = None
    AudUsuario: Optional[int] = None

class AreaCreate(AreaBase):
    IdArea: int

class AreaUpdate(AreaBase):
    pass

class AreaInDBBase(AreaBase):
    IdArea: int

    class Config:
        from_attributes = True  # Para Pydantic v2

class Area(AreaInDBBase):
    pass