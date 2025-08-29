from sqlalchemy import Column, Integer, String, DateTime, SmallInteger
from backend.database.connection import Base

class Autoridad(Base):
    __tablename__ = "Autoridad"

    IdAutoridad = Column(Integer, primary_key=True, index=True, autoincrement=False)
    Nombre = Column(String(150), nullable=True)
    Abrev = Column(String(20), nullable=True)
    Ministerio = Column(String(150), nullable=True)
    Subsecrt = Column(String(150), nullable=True)
    Provincia = Column(String(50), nullable=True)
    Direccion = Column(String(150), nullable=True)
    Contacto = Column(String(150), nullable=True)
    Telefono = Column(String(50), nullable=True)
    Web = Column(String(100), nullable=True)
    AudFecha = Column(DateTime, nullable=True)
    AudUsuario = Column(SmallInteger, nullable=True)