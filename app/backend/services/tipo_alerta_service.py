from sqlalchemy.orm import Session
from backend.repositories.tipo_alerta_repositorie import TipoAlertaRepository
from backend.schemas.tipo_alerta_schema import TipoAlertaCreate, TipoAlertaUpdate

class TipoAlertaService:
    @staticmethod
    def get_all(db: Session):
        return TipoAlertaRepository.get_all(db)

    @staticmethod
    def get_by_id(db: Session, id_tipo_alerta: int):
        return TipoAlertaRepository.get_by_id(db, id_tipo_alerta)

    @staticmethod
    def create(db: Session, tipo_alerta: TipoAlertaCreate):
        return TipoAlertaRepository.create(db, tipo_alerta)

    @staticmethod
    def update(db: Session, id_tipo_alerta: int, tipo_alerta: TipoAlertaUpdate):
        return TipoAlertaRepository.update(db, id_tipo_alerta, tipo_alerta)

    @staticmethod
    def delete(db: Session, id_tipo_alerta: int):
        return TipoAlertaRepository.delete(db, id_tipo_alerta)
