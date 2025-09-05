from sqlalchemy.orm import Session
from backend.models.tipo_alerta_model import TipoAlerta
from backend.schemas.tipo_alerta_schema import TipoAlertaCreate, TipoAlertaUpdate

class TipoAlertaRepository:
    @staticmethod
    def get_all(db: Session):
        return db.query(TipoAlerta).all()

    @staticmethod
    def get_by_id(db: Session, id_tipo_alerta: int):
        return db.query(TipoAlerta).filter(TipoAlerta.IdTipoAlerta == id_tipo_alerta).first()

    @staticmethod
    def create(db: Session, tipo_alerta: TipoAlertaCreate):
        db_tipo_alerta = TipoAlerta(**tipo_alerta.dict())
        db.add(db_tipo_alerta)
        db.commit()
        db.refresh(db_tipo_alerta)
        return db_tipo_alerta

    @staticmethod
    def update(db: Session, id_tipo_alerta: int, tipo_alerta: TipoAlertaUpdate):
        db_tipo_alerta = db.query(TipoAlerta).filter(TipoAlerta.IdTipoAlerta == id_tipo_alerta).first()
        if db_tipo_alerta:
            for key, value in tipo_alerta.dict(exclude_unset=True).items():
                setattr(db_tipo_alerta, key, value)
            db.commit()
            db.refresh(db_tipo_alerta)
        return db_tipo_alerta

    @staticmethod
    def delete(db: Session, id_tipo_alerta: int):
        db_tipo_alerta = db.query(TipoAlerta).filter(TipoAlerta.IdTipoAlerta == id_tipo_alerta).first()
        if db_tipo_alerta:
            db.delete(db_tipo_alerta)
            db.commit()
        return db_tipo_alerta
