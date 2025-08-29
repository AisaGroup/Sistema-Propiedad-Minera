from sqlalchemy.orm import Session
from backend.models.transaccion_model import Transaccion
from backend.schemas.transaccion_schema import TransaccionCreate, TransaccionUpdate
from typing import List, Optional

class TransaccionRepositorie:
    def __init__(self, db: Session):
        self.db = db

    def get(self, id_transaccion: int) -> Optional[Transaccion]:
        return self.db.query(Transaccion).filter(Transaccion.IdTransaccion == id_transaccion).first()

    def get_all(self, skip: int = 0, limit: int = 100) -> List[Transaccion]:
        return self.db.query(Transaccion).offset(skip).limit(limit).all()

    def create(self, transaccion: TransaccionCreate) -> Transaccion:
        db_obj = Transaccion(**transaccion.model_dump())
        self.db.add(db_obj)
        self.db.commit()
        self.db.refresh(db_obj)
        return db_obj

    def update(self, id_transaccion: int, transaccion: TransaccionUpdate) -> Optional[Transaccion]:
        db_obj = self.get(id_transaccion)
        if not db_obj:
            return None
        for field, value in transaccion.model_dump(exclude_unset=True).items():
            setattr(db_obj, field, value)
        self.db.commit()
        self.db.refresh(db_obj)
        return db_obj

    def delete(self, id_transaccion: int) -> bool:
        db_obj = self.get(id_transaccion)
        if not db_obj:
            return False
        self.db.delete(db_obj)
        self.db.commit()
        return True
