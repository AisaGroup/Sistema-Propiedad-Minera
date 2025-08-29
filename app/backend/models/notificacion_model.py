# backend/models/notificacion_model.py

from sqlalchemy import Column, Integer, String, DateTime, DECIMAL, SmallInteger
from sqlalchemy.ext.declarative import declarative_base

Base = declarative_base()

class Notificacion(Base):
    __tablename__ = 'Notificacion'

    IdNotificacion = Column(Integer, primary_key=True, autoincrement=True)
    IdTransaccion = Column(Integer, nullable=False)
    Organismo = Column(String(250), nullable=True)
    Jurisdiccion = Column(String(50), nullable=True)
    IdExpediente = Column(Integer, nullable=True)
    IdTitular = Column(Integer, nullable=True)
    IdTitMinDirLegal = Column(Integer, nullable=True)
    TipoNotificacion = Column(Integer, nullable=True)
    IdPropiedadMinera = Column(Integer, nullable=True)
    Ubicacion = Column(String(50), nullable=True)
    Latitud = Column(DECIMAL(9, 6), nullable=True)
    Longitud = Column(DECIMAL(9, 6), nullable=True)
    Resolucion = Column(String(100), nullable=True)
    Fundamentos = Column(String(5000), nullable=True)
    IdAutoridad = Column(Integer, nullable=True)
    Plazo = Column(DateTime, nullable=True)
    Emision = Column(DateTime, nullable=True)
    Funcionario = Column(String(100), nullable=True)
    Observaciones = Column(String(2500), nullable=True)
    AudFecha = Column(DateTime, nullable=True)
    AudUsuario = Column(SmallInteger, nullable=True)