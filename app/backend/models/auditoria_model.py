# backend/models/auditoria_model.py

from sqlalchemy import Column, Integer, String, DateTime, SmallInteger
from sqlalchemy.ext.declarative import declarative_base

Base = declarative_base()

class Auditoria(Base):
    __tablename__ = 'Auditoria'

    IdAuditoria = Column(Integer, primary_key=True, autoincrement=True)
    Accion = Column(String(50), nullable=False)
    Entidad = Column(String(100), nullable=False)
    Descripcion = Column(String(5000), nullable=False)
    AudFecha = Column(DateTime, nullable=False)
    AudUsuario = Column(SmallInteger, nullable=False)
