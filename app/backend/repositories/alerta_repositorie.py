from sqlalchemy.orm import Session
from backend.models.alerta_model import Alerta
from backend.schemas.alerta_schema import AlertaCreate, AlertaUpdate
from typing import List, Optional

class AlertaRepositorie:
    def __init__(self, db: Session):
        self.db = db

    def get(self, id_alerta: int) -> Optional[Alerta]:
        return self.db.query(Alerta).filter(Alerta.idAlerta == id_alerta).first()

    def get_all(self, skip: int = 0, limit: int = 100) -> List[Alerta]:
        return self.db.query(Alerta).order_by(Alerta.idAlerta).offset(skip).limit(limit).all()

    def create(self, alerta: AlertaCreate) -> Alerta:
        db_obj = Alerta(**alerta.model_dump(exclude_unset=True))
        self.db.add(db_obj)
        self.db.commit()
        self.db.refresh(db_obj)
        return db_obj

    def update(self, id_alerta: int, alerta: AlertaUpdate) -> Optional[Alerta]:
        db_obj = self.get(id_alerta)
        if not db_obj:
            return None
        for field, value in alerta.model_dump(exclude_unset=True).items():
            setattr(db_obj, field, value)
        self.db.commit()
        self.db.refresh(db_obj)
        return db_obj

    def delete(self, id_alerta: int) -> bool:
        db_obj = self.get(id_alerta)
        if not db_obj:
            return False
        self.db.delete(db_obj)
        self.db.commit()
        return True
