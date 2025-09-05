from sqlalchemy.orm import Session
from backend.models.estado_alerta_model import EstadoAlerta
from backend.schemas.estado_alerta_schema import EstadoAlertaCreate, EstadoAlertaUpdate
from typing import List, Optional

class EstadoAlertaRepositorie:
    def __init__(self, db: Session):
        self.db = db

    def get(self, id_estado: int) -> Optional[EstadoAlerta]:
        return self.db.query(EstadoAlerta).filter(EstadoAlerta.IdEstado == id_estado).first()

    def get_all(self) -> List[EstadoAlerta]:
        return self.db.query(EstadoAlerta).order_by(EstadoAlerta.IdEstado).all()

    def create(self, estado_alerta: EstadoAlertaCreate) -> EstadoAlerta:
        db_obj = EstadoAlerta(**estado_alerta.model_dump(exclude_unset=True))
        self.db.add(db_obj)
        self.db.commit()
        self.db.refresh(db_obj)
        return db_obj

    def update(self, id_estado: int, estado_alerta: EstadoAlertaUpdate) -> Optional[EstadoAlerta]:
        db_obj = self.get(id_estado)
        if not db_obj:
            return None
        for field, value in estado_alerta.model_dump(exclude_unset=True).items():
            setattr(db_obj, field, value)
        self.db.commit()
        self.db.refresh(db_obj)
        return db_obj

    def delete(self, id_estado: int) -> bool:
        db_obj = self.get(id_estado)
        if not db_obj:
            return False
        self.db.delete(db_obj)
        self.db.commit()
        return True
