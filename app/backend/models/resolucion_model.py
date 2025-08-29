from sqlalchemy import Column, Integer, SmallInteger, String, Date, Text, ForeignKey
from sqlalchemy.orm import relationship
from backend.database.connection import Base

class Resolucion(Base):
    __tablename__ = "Resolucion"

    IdResolucion = Column(SmallInteger, primary_key=True, index=True, nullable=False)
    IdExpediente = Column(Integer, ForeignKey("Expediente.IdExpediente"), nullable=True)
    Numero = Column(String(50), nullable=True)
    Titulo = Column(String(150), nullable=True)
    Fecha_emision = Column(Date, nullable=True)
    Fecha_publicacion = Column(Date, nullable=True)
    Estado = Column(String(50), nullable=True)
    Organismo_emisor = Column(String(100), nullable=True)
    Contenido = Column(String(5000), nullable=True)
    Descripcion = Column(String(500), nullable=True)
    Observaciones = Column(String(5000), nullable=True)
    IdTransaccion = Column(Integer, nullable=True)

    expediente = relationship("Expediente", backref="resoluciones")