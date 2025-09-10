from sqlalchemy import Column, Integer, String
from backend.database.connection import Base

class PeriodicidadAlerta(Base):
    __tablename__ = 'PeriodicidadAlerta'
    __table_args__ = {'implicit_returning': False}

    IdPeriodicidad = Column(Integer, primary_key=True, autoincrement=True)
    Nombre = Column(String(15), nullable=False)
    Descripcion = Column(String(5000), nullable=True)
