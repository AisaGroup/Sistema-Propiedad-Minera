from sqlalchemy.orm import Session
from backend.models.resolucion_model import Resolucion

class ResolucionRepository:
    def get_all(self, db: Session):
        return db.query(Resolucion).order_by(Resolucion.IdResolucion).all()

    def get_by_id(self, db: Session, id_resolucion: int):
        return db.query(Resolucion).filter(Resolucion.IdResolucion == id_resolucion).first()

    def get_by_expediente(self, db: Session, id_expediente: int):
        return db.query(Resolucion).filter(Resolucion.IdExpediente == id_expediente).order_by(Resolucion.IdResolucion).all()

    def create(self, db: Session, resolucion: Resolucion):
        db.add(resolucion)
        db.commit()
        db.refresh(resolucion)
        return resolucion

    def update(self, db: Session, id_resolucion: int, data: dict):
        resolucion = db.query(Resolucion).filter(Resolucion.IdResolucion == id_resolucion).first()
        if not resolucion:
            return None
        for key, value in data.items():
            setattr(resolucion, key, value)
        db.commit()
        db.refresh(resolucion)
        return resolucion

    def delete(self, db: Session, id_resolucion: int):
        resolucion = db.query(Resolucion).filter(Resolucion.IdResolucion == id_resolucion).first()
        if not resolucion:
            return None
        db.delete(resolucion)
        db.commit()
        return resolucion