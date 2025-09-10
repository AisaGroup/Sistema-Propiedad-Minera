from sqlalchemy.orm import Session
from backend.repositories.periodicidad_alerta_repositorie import PeriodicidadAlertaRepositorie
from backend.schemas.periodicidad_alerta_schema import PeriodicidadAlertaCreate, PeriodicidadAlertaUpdate
from backend.models.periodicidad_alerta_model import PeriodicidadAlerta
from typing import List, Optional

class PeriodicidadAlertaService:
    def __init__(self, db: Session):
        self.repository = PeriodicidadAlertaRepositorie(db)

    def get_all(self) -> List[PeriodicidadAlerta]:
        return self.repository.get_all()

    def get_by_id(self, id_periodicidad: int) -> Optional[PeriodicidadAlerta]:
        return self.repository.get(id_periodicidad)

    def create(self, periodicidad_data: PeriodicidadAlertaCreate) -> PeriodicidadAlerta:
        return self.repository.create(periodicidad_data)

    def update(self, id_periodicidad: int, periodicidad_data: PeriodicidadAlertaUpdate) -> Optional[PeriodicidadAlerta]:
        return self.repository.update(id_periodicidad, periodicidad_data)

    def delete(self, id_periodicidad: int) -> bool:
        return self.repository.delete(id_periodicidad)
