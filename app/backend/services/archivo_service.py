from sqlalchemy.orm import Session
from backend.repositories.archivo_repositorie import ArchivoRepositorie
from backend.schemas.archivo_schema import ArchivoCreate, ArchivoUpdate
from typing import List, Optional

class ArchivoService:
    def __init__(self, db: Session):
        self.repo = ArchivoRepositorie(db)

    def get_archivo(self, id_archivo: int):
        return self.repo.get(id_archivo)

    def get_archivos(self, skip: int = 0, limit: int = 100):
        return self.repo.get_all(skip, limit)

    def create_archivo(self, archivo: ArchivoCreate):
        return self.repo.create(archivo)

    def update_archivo(self, id_archivo: int, archivo: ArchivoUpdate):
        return self.repo.update(id_archivo, archivo)

    def delete_archivo(self, id_archivo: int):
        return self.repo.delete(id_archivo)
