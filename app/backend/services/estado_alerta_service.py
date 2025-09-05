from sqlalchemy.orm import Session
from backend.repositories.estado_alerta_repositorie import EstadoAlertaRepositorie
from backend.schemas.estado_alerta_schema import EstadoAlertaCreate, EstadoAlertaUpdate

class EstadoAlertaService:
    def __init__(self, db: Session):
        self.repo = EstadoAlertaRepositorie(db)

    def get_estado_alerta(self, id_estado: int):
        return self.repo.get(id_estado)

    def get_estados_alerta(self):
        return self.repo.get_all()

    def create_estado_alerta(self, estado_alerta: EstadoAlertaCreate):
        return self.repo.create(estado_alerta)

    def update_estado_alerta(self, id_estado: int, estado_alerta: EstadoAlertaUpdate):
        return self.repo.update(id_estado, estado_alerta)

    def delete_estado_alerta(self, id_estado: int):
        return self.repo.delete(id_estado)
