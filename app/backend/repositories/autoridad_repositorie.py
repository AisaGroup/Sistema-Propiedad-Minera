
from sqlalchemy.orm import Session
from backend.models.autoridad_model import Autoridad
from backend.schemas.autoridad_schema import AutoridadCreate, AutoridadUpdate

class AutoridadRepositorie:
    def __init__(self, db: Session):
        self.db = db

    def get_all(self):
        return self.db.query(Autoridad).all()

    def get_by_id(self, id_autoridad: int):
        return self.db.query(Autoridad).filter(Autoridad.IdAutoridad == id_autoridad).first()

    def create(self, autoridad_data: AutoridadCreate):
        autoridad = Autoridad(**autoridad_data.dict())
        self.db.add(autoridad)
        self.db.commit()
        self.db.refresh(autoridad)
        return autoridad

    def update(self, id_autoridad: int, autoridad_data: dict):
        autoridad = self.get_by_id(id_autoridad)
        if not autoridad:
            return None
        for key, value in autoridad_data.items():
            setattr(autoridad, key, value)
        self.db.commit()
        self.db.refresh(autoridad)
        return autoridad

    def delete(self, id_autoridad: int):
        autoridad = self.get_by_id(id_autoridad)
        if not autoridad:
            return None
        self.db.delete(autoridad)
        self.db.commit()
        return True

def get_autoridad(db: Session, id: int):
    return db.query(Autoridad).filter(Autoridad.IdAutoridad == id).first()

def get_autoridades(db: Session, skip: int = 0, limit: int = 100):
    return db.query(Autoridad).offset(skip).limit(limit).all()

def create_autoridad(db: Session, autoridad: AutoridadCreate):
    db_obj = Autoridad(**autoridad.dict())
    db.add(db_obj)
    db.commit()
    db.refresh(db_obj)
    return db_obj

def update_autoridad(db: Session, db_obj: Autoridad, autoridad_update: AutoridadUpdate):
    for field, value in autoridad_update.dict(exclude_unset=True).items():
        setattr(db_obj, field, value)
    db.commit()
    db.refresh(db_obj)
    return db_obj

def delete_autoridad(db: Session, db_obj: Autoridad):
    db.delete(db_obj)
    db.commit()