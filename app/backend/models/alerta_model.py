from sqlalchemy import Column, Integer, String, DateTime, SmallInteger, ForeignKey
from sqlalchemy.orm import relationship
from backend.database.connection import Base
from backend.models.estado_alerta_model import EstadoAlerta

class Alerta(Base):
    __tablename__ = 'Alerta'
    __table_args__ = {'implicit_returning': False}

    idAlerta = Column(Integer, primary_key=True, autoincrement=True)
    IdTransaccion = Column(Integer, nullable=True)
    IdTipoAlerta = Column(Integer, nullable=True)
    IdEstado = Column(Integer, ForeignKey('EstadoAlerta.IdEstado'), nullable=True)
    Asunto = Column(String(50), nullable=True)
    Mensaje = Column(String(5000), nullable=True)
    Medio = Column(String(50), nullable=True)
    Periodicidad = Column(String(50), nullable=True)
    FechaInicio = Column(DateTime, nullable=True)
    FechaFin = Column(DateTime, nullable=True)
    Obs = Column(String(5000), nullable=True)
    AudFecha = Column(DateTime, nullable=True)
    AudUsuario = Column(SmallInteger, nullable=True)

    estado = relationship('EstadoAlerta', backref='alertas')
