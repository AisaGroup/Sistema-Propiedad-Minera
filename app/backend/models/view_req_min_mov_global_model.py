from sqlalchemy import Column, Integer, String, DateTime, Numeric
from backend.database.connection import Base


class ViewReqMinMovGlobal(Base):
    __tablename__ = 'ViewReqMinMovGlobal'

    IdReqMineroMov = Column(Integer, primary_key=True)
    IdPropiedadMinera = Column(Integer, nullable=True)
    FechaInicio = Column(DateTime, nullable=True)
    FechaFin = Column(DateTime, nullable=True)
    IdReqMinero = Column(Integer, nullable=True)
    Descripcion = Column(String(500), nullable=True)
    Importe = Column(Numeric(19, 2), nullable=True)
    IdExpediente = Column(Integer, nullable=True)
    IdPropiedadMineraExp = Column(Integer, nullable=True)
    CodigoExpediente = Column(String(50), nullable=True)
