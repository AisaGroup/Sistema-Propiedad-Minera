from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Numeric
from sqlalchemy.orm import relationship
from backend.database.connection import Base

class ReqMineroMov(Base):
    __tablename__ = 'ReqMineroMov'

    IdReqMineroMov = Column(Integer, primary_key=True, autoincrement=True)
    IdPropiedadMinera = Column(Integer, ForeignKey('PropiedadMinera.IdPropiedadMinera'), nullable=True)
    IdReqMinero = Column(Integer, ForeignKey('ReqMinero.IdReqMinero'), nullable=True)
    IdTransaccion = Column(Integer, ForeignKey('Transaccion.IdTransaccion'), nullable=True)
    Descripcion = Column(String(500), nullable=True)
    Importe = Column(Numeric(19, 2), nullable=True)
    AudFecha = Column(DateTime, nullable=True)
    AudUsuario = Column(Integer, nullable=True)
    FechaInicio = Column(DateTime, nullable=True)
    FechaFin = Column(DateTime, nullable=True)

    # Relaciones (opcional - descomenta si necesitas las relaciones)
    # propiedad_minera = relationship("PropiedadMinera", back_populates="req_minero_movs")
    # transaccion = relationship("Transaccion", back_populates="req_minero_movs")
    req_minero = relationship("ReqMinero", back_populates="req_minero_movs")
    req_minero = relationship("ReqMinero", back_populates="req_minero_movs")
