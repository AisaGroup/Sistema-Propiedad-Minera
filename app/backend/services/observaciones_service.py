from backend.repositories.observaciones_repositorie import ObservacionesRepository
from backend.schemas.observaciones_schema import ObservacionesCreate, ObservacionesUpdate
from sqlalchemy.orm import Session

class ObservacionesService:
    def __init__(self, db: Session):
        self.repo = ObservacionesRepository(db)

    def get_observacion(self, id_transaccion: int):
        return self.repo.get_by_id(id_transaccion)

    def create_observacion(self, observacion: ObservacionesCreate):
        return self.repo.create(observacion)

    def update_observacion(self, id_transaccion: int, observacion: ObservacionesUpdate):
        return self.repo.update(id_transaccion, observacion)

    def delete_observacion(self, id_transaccion: int):
        return self.repo.delete(id_transaccion)

    def get_all_observaciones(self):
        return self.repo.get_all()
