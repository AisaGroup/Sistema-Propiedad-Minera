from sqlalchemy import Column, Integer, String, DateTime, SmallInteger
from backend.database.connection import Base

class Observaciones(Base):
    __tablename__ = "Observaciones"

    IdObservacion = Column(Integer, primary_key=True, autoincrement=True, index=True, nullable=False)
    IdTransaccion = Column(Integer, index=True, nullable=False)
    Descripcion = Column(String(200), nullable=False)
    Observaciones = Column(String(5000), nullable=True)
    AudFecha = Column(DateTime, nullable=True)
    AudUsuario = Column(SmallInteger, nullable=True)
