from sqlalchemy.orm import Session
from backend.models.expediente_model import Expediente
from backend.schemas.expediente_schema import ExpedienteCreate

class ExpedienteRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_all(self):
        return self.db.query(Expediente).all()

    def get_by_id(self, id_expediente: int):
        return self.db.query(Expediente).filter(Expediente.IdExpediente == id_expediente).first()

    def create(self, expediente_data: ExpedienteCreate):
        expediente = Expediente(**expediente_data.dict())
        self.db.add(expediente)
        self.db.commit()
        self.db.refresh(expediente)
        return expediente

    def update(self, id_expediente: int, expediente_data: dict):
        expediente = self.get_by_id(id_expediente)
        if not expediente:
            return None
        for key, value in expediente_data.items():
            setattr(expediente, key, value)
        self.db.commit()
        self.db.refresh(expediente)
        return expediente

    def delete(self, id_expediente: int):
        expediente = self.get_by_id(id_expediente)
        if not expediente:
            return None
        self.db.delete(expediente)
        self.db.commit()
        return True