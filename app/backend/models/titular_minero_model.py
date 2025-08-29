from sqlalchemy import Column, Integer, String, Text, Date
from backend.database.connection import Base


class TitularMinero(Base):
    __tablename__ = "TitularMinero"

    IdTitular = Column(Integer, primary_key=True, index=True)
    IdTransaccion = Column(Integer, nullable=False)
    TipoPersona = Column(String(20), nullable=False)
    Nombre = Column(String(100), nullable=False)
    DniCuit = Column(String(20), nullable=False)
    Domicilio = Column(String(150), nullable=False)
    Telefono = Column(String(20), nullable=False)
    Email = Column(String(100), nullable=False)
    FechaAsignacion = Column(Date, nullable=False)
    Estado = Column(String(50), nullable=False)
    RepresentanteLegal = Column(String(100), nullable=False)
    Observaciones = Column(String(200), nullable=True)
    Descripcion = Column(String(50), nullable=True)
