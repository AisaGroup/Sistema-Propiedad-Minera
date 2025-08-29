from backend.models.transaccion_model import Transaccion
from sqlalchemy.orm import Session
from backend.models.acta_model import Acta
from backend.schemas.acta_schema import ActaCreate

class ActaRepository:

    def get_by_transaccion_padre(self, id_transaccion_padre: int):
        from backend.models.transaccion_model import Transaccion
        return (
            self.db.query(Acta)
            .join(Transaccion, Acta.IdTransaccion == Transaccion.IdTransaccion)
            .filter(Transaccion.IdTransaccionPadre == id_transaccion_padre)
            .order_by(Acta.IdActa)
            .all()
        )

    
    def __init__(self, db: Session):
        self.db = db

    def get_all(self):
        return self.db.query(Acta).order_by(Acta.IdActa).all()

    def get_by_id(self, id_acta: int):
        return self.db.query(Acta).filter(Acta.IdActa == id_acta).first()

    def get_by_expediente(self, id_expediente: int):
        return self.db.query(Acta).filter(Acta.IdExpediente == id_expediente).order_by(Acta.IdActa).all()

    def create(self, acta_data: ActaCreate):
        acta = Acta(**acta_data.dict())
        self.db.add(acta)
        self.db.commit()
        self.db.refresh(acta)
        return acta

    def update(self, id_acta: int, acta_data: dict):
        acta = self.get_by_id(id_acta)
        if not acta:
            return None
        for key, value in acta_data.items():
            setattr(acta, key, value)
        self.db.commit()
        self.db.refresh(acta)
        return acta

    def delete(self, id_acta: int):
        acta = self.get_by_id(id_acta)
        if not acta:
            return None
        self.db.delete(acta)
        self.db.commit()
        return True