from sqlalchemy.orm import Session
from backend.repositories.titular_minero_repositorie import TitularMineroRepository
from backend.schemas.titular_minero_schema import TitularMineroCreate

class TitularMineroService:
    def __init__(self, db: Session):
        self.repository = TitularMineroRepository(db)

    def get_all(self):
        return self.repository.get_all()

    def get_by_id(self, id_titular: int):
        return self.repository.get_by_id(id_titular)

    def create(self, titular_data: TitularMineroCreate):
        return self.repository.create(titular_data)

    def update(self, id_titular: int, titular_data: dict):
        return self.repository.update(id_titular, titular_data)

    def delete(self, id_titular: int):
        return self.repository.delete(id_titular)