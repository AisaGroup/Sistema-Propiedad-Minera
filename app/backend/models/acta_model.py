from sqlalchemy import Column, Integer, String, Date, DateTime
from sqlalchemy.orm import relationship
from backend.database.connection import Base

class Acta(Base):
    __tablename__ = "Acta"

    IdActa = Column(Integer, primary_key=True, index=True, nullable=True)
    IdTransaccion = Column(Integer, nullable=True)
    IdExpediente = Column(Integer, nullable=False)  # único requerido
    IdTipoActa = Column(String(100), nullable=True)
    Fecha = Column(Date, nullable=True)
    Lugar = Column(String(150), nullable=True)
    IdAutoridad = Column(Integer, nullable=True)
    Descripcion = Column(String(2000), nullable=True)
    Obs = Column(String(5000), nullable=True)
    AudFecha = Column(DateTime, nullable=True)
    AudUsuario = Column(Integer, nullable=True)