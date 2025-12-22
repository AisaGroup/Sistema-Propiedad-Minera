from sqlalchemy import Column, Integer, ForeignKey
from sqlalchemy.orm import relationship
from backend.database.connection import Base


class ReqMinExp(Base):
    __tablename__ = 'ReqMinExp'

    IdReqMinExp = Column(Integer, primary_key=True, autoincrement=True)
    IdReqMineroMov = Column(Integer, ForeignKey('ReqMineroMov.IdReqMineroMov'), nullable=True)
    IdExpediente = Column(Integer, ForeignKey('Expediente.IdExpediente'), nullable=True)
    IdPropiedadMinera = Column(Integer, ForeignKey('PropiedadMinera.IdPropiedadMinera'), nullable=True)

    # Relaciones (opcional - descomenta si necesitas las relaciones)
    req_minero_mov = relationship("ReqMineroMov", back_populates="req_min_exp")
    expediente = relationship("Expediente", back_populates="req_min_exp")
    propiedad_minera = relationship("PropiedadMinera", back_populates="req_min_exp")