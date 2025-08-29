from sqlalchemy.orm import Session
from backend.models.area_model import Area
from backend.schemas.area_schema import AreaCreate, AreaUpdate

class AreaRepositorie:
    def __init__(self, db: Session):
        self.db = db

    def get_all(self):
        return self.db.query(Area).all()

    def get_by_id(self, id_area: int):
        return self.db.query(Area).filter(Area.IdArea == id_area).first()

    def create(self, area_data: AreaCreate):
        area = Area(**area_data.dict())
        self.db.add(area)
        self.db.commit()
        self.db.refresh(area)
        return area

    def update(self, id_area: int, area_data: dict):
        area = self.get_by_id(id_area)
        if not area:
            return None
        for key, value in area_data.items():
            setattr(area, key, value)
        self.db.commit()
        self.db.refresh(area)
        return area

    def delete(self, id_area: int):
        area = self.get_by_id(id_area)
        if not area:
            return None
        self.db.delete(area)
        self.db.commit()
        return True