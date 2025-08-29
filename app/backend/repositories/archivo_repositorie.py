from sqlalchemy.orm import Session
from backend.models.archivo_model import Archivo
from backend.schemas.archivo_schema import ArchivoCreate, ArchivoUpdate
from typing import List, Optional
from datetime import datetime

class ArchivoRepositorie:
    def __init__(self, db: Session):
        self.db = db

    def get(self, id_archivo: int) -> Optional[Archivo]:
        return self.db.query(Archivo).filter(Archivo.IdArchivo == id_archivo).first()

    def get_all(self, skip: int = 0, limit: int = 100) -> List[Archivo]:
        return self.db.query(Archivo).offset(skip).limit(limit).all()

    def create(self, archivo: ArchivoCreate) -> Archivo:
        db_archivo = Archivo(**archivo.model_dump())
        self.db.add(db_archivo)
        self.db.commit()
        self.db.refresh(db_archivo)
        return db_archivo

    def update(self, id_archivo: int, archivo: ArchivoUpdate) -> Optional[Archivo]:
        db_archivo = self.get(id_archivo)
        if not db_archivo:
            return None
        for field, value in archivo.model_dump(exclude_unset=True).items():
            setattr(db_archivo, field, value)
        self.db.commit()
        self.db.refresh(db_archivo)
        return db_archivo

    def delete(self, id_archivo: int) -> bool:
        db_archivo = self.get(id_archivo)
        if not db_archivo:
            return False
        self.db.delete(db_archivo)
        self.db.commit()
        return True
