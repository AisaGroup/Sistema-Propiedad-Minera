# backend/models/auditoria_model.py

from sqlalchemy import Column, Integer, String, DateTime, SmallInteger, ForeignKey
from backend.database.connection import Base

class Auditoria(Base):
    __tablename__ = 'AuditoriaTest'

    IdAuditoria = Column(Integer, primary_key=True, autoincrement=True)
    Accion = Column(String(50), nullable=False)
    Entidad = Column(String(100), nullable=False)
    Descripcion = Column(String(5000), nullable=False)  # use 500 if you keep the table at 500
    AudFecha = Column(DateTime, nullable=False)
    AudUsuario = Column(Integer, nullable=False)