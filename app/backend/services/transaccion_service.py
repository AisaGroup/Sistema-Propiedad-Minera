from sqlalchemy.orm import Session
from backend.repositories.transaccion_repositorie import TransaccionRepositorie
from backend.schemas.transaccion_schema import TransaccionCreate, TransaccionUpdate

class TransaccionService:
    def __init__(self, db: Session):
        self.repo = TransaccionRepositorie(db)

    def get_transaccion(self, id_transaccion: int):
        return self.repo.get(id_transaccion)

    def get_transacciones(self, skip: int = 0, limit: int = 100):
        return self.repo.get_all(skip, limit)

    def create_transaccion(self, transaccion: TransaccionCreate):
        return self.repo.create(transaccion)

    def update_transaccion(self, id_transaccion: int, transaccion: TransaccionUpdate):
        return self.repo.update(id_transaccion, transaccion)

    def delete_transaccion(self, id_transaccion: int):
        return self.repo.delete(id_transaccion)
