from backend.models.observaciones_model import Observaciones
from backend.schemas.observaciones_schema import ObservacionesCreate, ObservacionesUpdate
from sqlalchemy.orm import Session

class ObservacionesRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_by_id(self, id_transaccion: int):
        return self.db.query(Observaciones).filter(Observaciones.IdTransaccion == id_transaccion).first()

    def create(self, observacion: ObservacionesCreate):
        db_obs = Observaciones(**observacion.dict())
        self.db.add(db_obs)
        self.db.commit()
        self.db.refresh(db_obs)
        return db_obs

    def update(self, id_transaccion: int, observacion: ObservacionesUpdate):
        db_obs = self.get_by_id(id_transaccion)
        if db_obs:
            for key, value in observacion.dict(exclude_unset=True).items():
                setattr(db_obs, key, value)
            self.db.commit()
            self.db.refresh(db_obs)
        return db_obs

    def delete(self, id_transaccion: int):
        db_obs = self.get_by_id(id_transaccion)
        if db_obs:
            self.db.delete(db_obs)
            self.db.commit()
        return db_obs

    def get_all(self):
        return self.db.query(Observaciones).all()
