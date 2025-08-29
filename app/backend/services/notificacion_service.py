from sqlalchemy.orm import Session
from backend.repositories.notificacion_repositorie import NotificacionRepositorie
from backend.schemas.notificacion_schema import NotificacionCreate, NotificacionUpdate

class NotificacionService:
    def __init__(self, db: Session):
        self.repo = NotificacionRepositorie(db)

    def get_notificacion(self, id_notificacion: int):
        return self.repo.get(id_notificacion)

    def get_notificaciones(self, skip: int = 0, limit: int = 100):
        return self.repo.get_all(skip, limit)

    def create_notificacion(self, notificacion: NotificacionCreate):
        return self.repo.create(notificacion)

    def update_notificacion(self, id_notificacion: int, notificacion: NotificacionUpdate):
        return self.repo.update(id_notificacion, notificacion)

    def delete_notificacion(self, id_notificacion: int):
        return self.repo.delete(id_notificacion)