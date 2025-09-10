from sqlalchemy import Column, Integer, String
from sqlalchemy.orm import relationship
from backend.database.connection import Base

class ReqMinero(Base):
    __tablename__ = "ReqMinero"
    
    IdReqMinero = Column(Integer, primary_key=True, index=True, autoincrement=True)
    IdTransaccion = Column(Integer, nullable=True)
    Tipo = Column(String(20), nullable=True)
    Descripcion = Column(String(300), nullable=True)
    
    # Relación con ReqMineroMov
    req_minero_movs = relationship("ReqMineroMov", back_populates="req_minero")
