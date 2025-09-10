from sqlalchemy.orm import Session
from backend.models.periodicidad_alerta_model import PeriodicidadAlerta
from backend.schemas.periodicidad_alerta_schema import PeriodicidadAlertaCreate, PeriodicidadAlertaUpdate
from typing import List, Optional

class PeriodicidadAlertaRepositorie:
    def __init__(self, db: Session):
        self.db = db

    def get(self, id_periodicidad: int) -> Optional[PeriodicidadAlerta]:
        return self.db.query(PeriodicidadAlerta).filter(PeriodicidadAlerta.IdPeriodicidad == id_periodicidad).first()

    def get_all(self, skip: int = 0, limit: int = 100) -> List[PeriodicidadAlerta]:
        return self.db.query(PeriodicidadAlerta).order_by(PeriodicidadAlerta.IdPeriodicidad).offset(skip).limit(limit).all()

    def create(self, periodicidad: PeriodicidadAlertaCreate) -> PeriodicidadAlerta:
        db_periodicidad = PeriodicidadAlerta(**periodicidad.dict())
        self.db.add(db_periodicidad)
        self.db.commit()
        self.db.refresh(db_periodicidad)
        return db_periodicidad

    def update(self, id_periodicidad: int, periodicidad: PeriodicidadAlertaUpdate) -> Optional[PeriodicidadAlerta]:
        db_periodicidad = self.get(id_periodicidad)
        if db_periodicidad:
            update_data = periodicidad.dict(exclude_unset=True)
            for field, value in update_data.items():
                setattr(db_periodicidad, field, value)
            self.db.commit()
            self.db.refresh(db_periodicidad)
        return db_periodicidad

    def delete(self, id_periodicidad: int) -> bool:
        db_periodicidad = self.get(id_periodicidad)
        if db_periodicidad:
            self.db.delete(db_periodicidad)
            self.db.commit()
            return True
        return False
