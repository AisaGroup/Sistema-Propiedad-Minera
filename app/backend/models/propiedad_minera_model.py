from sqlalchemy import Column, Integer, String, DateTime, Float
from sqlalchemy.ext.declarative import declarative_base
from backend.database.connection import Base

class PropiedadMinera(Base):
    __tablename__ = "PropiedadMinera"

    IdPropiedadMinera = Column(Integer, primary_key=True, index=True, nullable=False)
    IdTransaccion = Column(Integer, nullable=True)
    IdTitular = Column(Integer, nullable=True)
    Nombre = Column(String(100), nullable=True)
    Solicitud = Column(DateTime, nullable=True)
    Registro = Column(DateTime, nullable=True)
    Notificacion = Column(DateTime, nullable=True)
    Provincia = Column(String(100), nullable=True)
    Mensura = Column(DateTime, nullable=True)
    AreaHectareas = Column(Float, nullable=True)
    LaborLegal = Column(String(50), nullable=True)
    DescubrimientoDirecto = Column(String(50), nullable=True)