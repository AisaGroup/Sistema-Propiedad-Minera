from sqlalchemy.orm import Session
from backend.repositories.req_minero_repositorie import ReqMineroRepository
from backend.schemas.req_minero_schema import ReqMineroCreate, ReqMineroUpdate
from backend.models.req_minero_model import ReqMinero
from typing import List, Optional

class ReqMineroService:
    def __init__(self, db: Session):
        self.repository = ReqMineroRepository(db)
        self.db = db

    def get_all(self, skip: int = 0, limit: int = 100) -> List[ReqMinero]:
        return self.repository.get_all(skip, limit)

    def get_by_id(self, id_req_minero: int) -> Optional[ReqMinero]:
        return self.repository.get_by_id(id_req_minero)

    def get_by_transaccion(self, id_transaccion: int, skip: int = 0, limit: int = 100) -> List[ReqMinero]:
        return self.repository.get_by_transaccion(id_transaccion, skip, limit)

    def create(self, req_minero_data: ReqMineroCreate) -> ReqMinero:
        return self.repository.create(req_minero_data)

    def update(self, id_req_minero: int, req_minero_data: ReqMineroUpdate) -> Optional[ReqMinero]:
        return self.repository.update(id_req_minero, req_minero_data)

    def delete(self, id_req_minero: int) -> bool:
        return self.repository.delete(id_req_minero)

    def search(self, filters: dict, skip: int = 0, limit: int = 100) -> List[ReqMinero]:
        return self.repository.search(filters, skip, limit)

    def search_count(self, filters: dict) -> int:
        return self.repository.search_count(filters)

    def get_count(self) -> int:
        return self.repository.get_count()
