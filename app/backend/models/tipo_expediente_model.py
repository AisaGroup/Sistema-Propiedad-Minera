from sqlalchemy import Column, Integer, String, Text, Boolean
from backend.database.connection import Base




class TipoExpediente(Base):
    __tablename__ = "TipoExpediente"

    IdTipoExpediente = Column(Integer, primary_key=True, index=True, nullable=False)
    Nombre = Column(String(100), nullable=False)
    Descripcion = Column(Text, nullable=True)
    Activo = Column(Boolean, nullable=True)