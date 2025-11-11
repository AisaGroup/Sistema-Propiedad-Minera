from sqlalchemy.orm import Session
from backend.models.auditoria_model import Auditoria
from backend.schemas.auditoria_schema import AuditoriaCreate, AuditoriaUpdate
from typing import List, Optional

class AuditoriaRepositorie:
    def __init__(self, db: Session):
        self.db = db

    def get(self, id_auditoria: int) -> Optional[Auditoria]:
        return self.db.query(Auditoria).filter(Auditoria.IdAuditoria == id_auditoria).first()

    def get_all(self, skip: int = 0, limit: int = 100) -> List[Auditoria]:
        query = self.db.query(Auditoria).order_by(Auditoria.AudFecha.desc())
        if skip:
            query = query.offset(skip)
        if limit:
            query = query.limit(limit)
        return query.all()

    def create(self, auditoria: AuditoriaCreate) -> Auditoria:
        db_obj = Auditoria(**auditoria.model_dump())
        self.db.add(db_obj)
        self.db.commit()
        self.db.refresh(db_obj)
        return db_obj

    def update(self, id_auditoria: int, auditoria: AuditoriaUpdate) -> Optional[Auditoria]:
        db_obj = self.get(id_auditoria)
        if not db_obj:
            return None
        for field, value in auditoria.model_dump(exclude_unset=True).items():
            setattr(db_obj, field, value)
        self.db.commit()
        self.db.refresh(db_obj)
        return db_obj

    def delete(self, id_auditoria: int) -> bool:
        db_obj = self.get(id_auditoria)
        if not db_obj:
            return False
        self.db.delete(db_obj)
        self.db.commit()
        return True
