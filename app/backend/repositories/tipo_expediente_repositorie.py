from sqlalchemy.orm import Session
from backend.models.tipo_expediente_model import TipoExpediente
from backend.schemas.tipo_expediente_schema import TipoExpedienteCreate

class TipoExpedienteRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_all(self):
        return self.db.query(TipoExpediente).all()

    def get_by_id(self, id_tipo: int):
        return self.db.query(TipoExpediente).filter(TipoExpediente.IdTipoExpediente == id_tipo).first()

    def create(self, tipo_data: TipoExpedienteCreate):
        tipo = TipoExpediente(**tipo_data.dict())
        self.db.add(tipo)
        self.db.commit()
        self.db.refresh(tipo)
        return tipo

    def update(self, id_tipo: int, tipo_data: dict):
        tipo = self.get_by_id(id_tipo)
        if not tipo:
            return None
        for key, value in tipo_data.items():
            setattr(tipo, key, value)
        self.db.commit()
        self.db.refresh(tipo)
        return tipo

    def delete(self, id_tipo: int):
        tipo = self.get_by_id(id_tipo)
        if not tipo:
            return None
        self.db.delete(tipo)
        self.db.commit()
        return True