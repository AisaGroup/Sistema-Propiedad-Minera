from sqlalchemy.orm import Session
from backend.repositories.area_repositorie import AreaRepositorie
from backend.schemas.area_schema import AreaCreate, AreaUpdate

def get_area(db: Session, id: int):
    repo = AreaRepositorie(db)
    return repo.get_by_id(id)

def get_areas(db: Session, skip: int = 0, limit: int = 100):
    repo = AreaRepositorie(db)
    return repo.get_all()

def create_area(db: Session, area: AreaCreate):
    repo = AreaRepositorie(db)
    return repo.create(area)

def update_area(db: Session, id: int, area_update: AreaUpdate):
    repo = AreaRepositorie(db)
    return repo.update(id, area_update.dict(exclude_unset=True))

def delete_area(db: Session, id: int):
    repo = AreaRepositorie(db)
    return repo.delete(id)