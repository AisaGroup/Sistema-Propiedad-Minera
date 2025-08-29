from sqlalchemy.orm import Session
from backend.repositories.tipo_expediente_repositorie import TipoExpedienteRepository
from backend.schemas.tipo_expediente_schema import TipoExpedienteCreate

class TipoExpedienteService:
    def __init__(self, db: Session):
        self.repository = TipoExpedienteRepository(db)

    def get_all(self):
        return self.repository.get_all()

    def get_by_id(self, id_tipo: int):
        return self.repository.get_by_id(id_tipo)

    def create(self, tipo_data: TipoExpedienteCreate):
        return self.repository.create(tipo_data)

    def update(self, id_tipo: int, tipo_data: dict):
        return self.repository.update(id_tipo, tipo_data)

    def delete(self, id_tipo: int):
        return self.repository.delete(id_tipo)