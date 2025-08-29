from sqlalchemy import Column, Integer, String, DateTime, SmallInteger
from backend.database.connection import Base

class Area(Base):
    __tablename__ = "Area"

    IdArea = Column(Integer, primary_key=True, index=True, autoincrement=False)
    Descripcion = Column(String(100), nullable=False)
    AudFecha = Column(DateTime, nullable=True)
    AudUsuario = Column(SmallInteger, nullable=True)