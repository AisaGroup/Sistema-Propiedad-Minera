from sqlalchemy.orm import Session
from backend.models.titular_minero_model import TitularMinero
from backend.schemas.titular_minero_schema import TitularMineroCreate

class TitularMineroRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_all(self):
        return self.db.query(TitularMinero).all()

    def get_by_id(self, id_titular: int):
        return self.db.query(TitularMinero).filter(TitularMinero.IdTitular == id_titular).first()

    def create(self, titular_data: TitularMineroCreate):
        titular = TitularMinero(**titular_data.dict())
        self.db.add(titular)
        self.db.commit()
        self.db.refresh(titular)
        return titular

    def update(self, id_titular: int, titular_data: dict):
        titular = self.get_by_id(id_titular)
        if not titular:
            return None
        for key, value in titular_data.items():
            setattr(titular, key, value)
        self.db.commit()
        self.db.refresh(titular)
        return titular

    def delete(self, id_titular: int):
        titular = self.get_by_id(id_titular)
        if not titular:
            return None
        self.db.delete(titular)
        self.db.commit()
        return True