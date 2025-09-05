from sqlalchemy import Column, Integer, String
from backend.database.connection import Base

class EstadoAlerta(Base):
    __tablename__ = 'EstadoAlerta'
    __table_args__ = {'implicit_returning': False}

    IdEstado = Column(Integer, primary_key=True, autoincrement=True)
    nombre = Column(String(20), nullable=True)
    Descripcion = Column(String(50), nullable=True)
