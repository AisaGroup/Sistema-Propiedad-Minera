from sqlalchemy.orm import Session
from backend.repositories.autoridad_repositorie import AutoridadRepositorie
from backend.schemas.autoridad_schema import AutoridadCreate, AutoridadUpdate

def get_autoridad(db: Session, id: int):
    repo = AutoridadRepositorie(db)
    return repo.get_by_id(id)

def get_autoridades(db: Session, skip: int = 0, limit: int = 100):
    repo = AutoridadRepositorie(db)
    return repo.get_all()

def create_autoridad(db: Session, autoridad: AutoridadCreate):
    repo = AutoridadRepositorie(db)
    return repo.create(autoridad)

def update_autoridad(db: Session, id: int, autoridad_update: AutoridadUpdate):
    repo = AutoridadRepositorie(db)
    return repo.update(id, autoridad_update.dict(exclude_unset=True))

def delete_autoridad(db: Session, id: int):
    repo = AutoridadRepositorie(db)
    return repo.delete(id)