from sqlalchemy.orm import Session
from backend.repositories.auditoria_repositorie import AuditoriaRepositorie
from backend.schemas.auditoria_schema import AuditoriaCreate, AuditoriaUpdate

class AuditoriaService:
    def __init__(self, db: Session):
        self.repo = AuditoriaRepositorie(db)

    def get_auditoria(self, id_auditoria: int):
        return self.repo.get(id_auditoria)

    def get_auditorias(self, skip: int = 0, limit: int = 100):
        return self.repo.get_all(skip, limit)

    def create_auditoria(self, auditoria: AuditoriaCreate):
        return self.repo.create(auditoria)

    def update_auditoria(self, id_auditoria: int, auditoria: AuditoriaUpdate):
        return self.repo.update(id_auditoria, auditoria)

    def delete_auditoria(self, id_auditoria: int):
        return self.repo.delete(id_auditoria)
