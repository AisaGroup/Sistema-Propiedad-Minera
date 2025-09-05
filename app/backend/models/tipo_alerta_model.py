from sqlalchemy import Column, Integer, String, SmallInteger, DateTime
from backend.database.connection import Base

class TipoAlerta(Base):
    __tablename__ = "TipoAlerta"

    IdTipoAlerta = Column(Integer, primary_key=True, index=True, autoincrement=False)
    Descripcion = Column(String(45), nullable=False)
    IdArea = Column(SmallInteger, nullable=True)
    Asunto = Column(String(50), nullable=True)
    Mensaje = Column(String(5000), nullable=True)
    Obs = Column(String(5000), nullable=True)
    AudFecha = Column(DateTime, nullable=True)
    AudUsuario = Column(SmallInteger, nullable=True)