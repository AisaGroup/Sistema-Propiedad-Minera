from sqlalchemy import Column, Integer, String, DateTime
from backend.database.connection import Base

class Transaccion(Base):
    __tablename__ = 'Transaccion'

    IdTransaccion = Column(Integer, primary_key=True, autoincrement=True)
    IdTransaccionPadre = Column(Integer, nullable=False)
    Descripcion = Column(String(2000), nullable=True)
    IdRegistro = Column(Integer, nullable=False)
    Tabla = Column(String(50), nullable=False)
    AudFecha = Column(DateTime, nullable=True)
    AudUsuario = Column(String(10), nullable=True)
