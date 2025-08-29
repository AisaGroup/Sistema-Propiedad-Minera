from sqlalchemy.orm import Session
from backend.models.notificacion_model import Notificacion
from backend.schemas.notificacion_schema import NotificacionCreate, NotificacionUpdate
from typing import List, Optional

class NotificacionRepositorie:
    def __init__(self, db: Session):
        self.db = db

    def get(self, id_notificacion: int) -> Optional[Notificacion]:
        return self.db.query(Notificacion).filter(Notificacion.IdNotificacion == id_notificacion).first()

    def get_all(self, skip: int = 0, limit: int = 100) -> List[Notificacion]:
        return self.db.query(Notificacion).order_by(Notificacion.IdNotificacion).offset(skip).limit(limit).all()

    def create(self, notificacion: NotificacionCreate) -> Notificacion:
        data = notificacion.model_dump()
        # Eliminar campos que no existen en el modelo SQLAlchemy
        for extra_field in ['Funcionario', 'Observaciones', 'AudFecha', 'AudUsuario']:
            data.pop(extra_field, None)
        db_obj = Notificacion(**data)
        self.db.add(db_obj)
        self.db.commit()
        self.db.refresh(db_obj)
        return db_obj

    def update(self, id_notificacion: int, notificacion: NotificacionUpdate) -> Optional[Notificacion]:
        db_obj = self.get(id_notificacion)
        if not db_obj:
            return None
        for field, value in notificacion.model_dump(exclude_unset=True).items():
            setattr(db_obj, field, value)
        self.db.commit()
        self.db.refresh(db_obj)
        return db_obj

    def delete(self, id_notificacion: int) -> bool:
        db_obj = self.get(id_notificacion)
        if not db_obj:
            return False
        self.db.delete(db_obj)
        self.db.commit()
        return True