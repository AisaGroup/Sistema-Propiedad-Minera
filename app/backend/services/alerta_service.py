from sqlalchemy.orm import Session
from backend.repositories.alerta_repositorie import AlertaRepositorie
from backend.schemas.alerta_schema import AlertaCreate, AlertaUpdate

class AlertaService:
    def __init__(self, db: Session):
        self.repo = AlertaRepositorie(db)

    def get_alerta(self, id_alerta: int):
        return self.repo.get(id_alerta)

    def get_alertas(self, skip: int = 0, limit: int = 100):
        return self.repo.get_all(skip, limit)

    def create_alerta(self, alerta: AlertaCreate):
        return self.repo.create(alerta)

    def update_alerta(self, id_alerta: int, alerta: AlertaUpdate):
        return self.repo.update(id_alerta, alerta)

    def delete_alerta(self, id_alerta: int):
        return self.repo.delete(id_alerta)
