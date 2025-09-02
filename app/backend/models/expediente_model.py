from sqlalchemy import Column, ForeignKey, Integer, String, DateTime, Date, Text
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship
from backend.models.tipo_expediente_model import TipoExpediente
from backend.database.connection import Base



class Expediente(Base):
    __tablename__ = "Expediente"

    IdExpediente = Column(Integer, primary_key=True, index=True, nullable=False)
    CodigoExpediente = Column(String(50), nullable=True)
    PrimerDueno = Column(String(50), nullable=True)
    Ano = Column(Integer, nullable=True)
    FechaInicio = Column(Date, nullable=True)
    FechaFin = Column(Date, nullable=True)
    Estado = Column(String(50), nullable=True)
    Dependencia = Column(String(100), nullable=True)
    Caratula = Column(String(200), nullable=True)
    Descripcion = Column(String(50), nullable=True)
    Observaciones = Column(Text, nullable=True)
    IdPropiedadMinera = Column(Integer, nullable=True)
    IdTipoExpediente = Column(Integer, ForeignKey("TipoExpediente.IdTipoExpediente"), nullable=False)
    IdTransaccion = Column(Integer, nullable=True)

    tipo_expediente = relationship("TipoExpediente", backref="expedientes")