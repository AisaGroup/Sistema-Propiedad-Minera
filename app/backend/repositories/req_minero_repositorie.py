from sqlalchemy.orm import Session
from backend.models.req_minero_model import ReqMinero
from backend.schemas.req_minero_schema import ReqMineroCreate, ReqMineroUpdate
from typing import List, Optional

class ReqMineroRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_all(self, skip: int = 0, limit: int = 100) -> List[ReqMinero]:
        return self.db.query(ReqMinero).order_by(ReqMinero.IdReqMinero.desc()).offset(skip).limit(limit).all()

    def get_by_id(self, id_req_minero: int) -> Optional[ReqMinero]:
        return self.db.query(ReqMinero).filter(ReqMinero.IdReqMinero == id_req_minero).first()

    def get_by_transaccion(self, id_transaccion: int, skip: int = 0, limit: int = 100) -> List[ReqMinero]:
        return self.db.query(ReqMinero).filter(
            ReqMinero.IdTransaccion == id_transaccion
        ).order_by(ReqMinero.IdReqMinero.desc()).offset(skip).limit(limit).all()

    def create(self, req_minero_data: ReqMineroCreate) -> ReqMinero:
        # Convertir a diccionario y crear instancia
        req_minero_dict = req_minero_data.dict()
        
        req_minero = ReqMinero(**req_minero_dict)
        
        self.db.add(req_minero)
        self.db.commit()
        self.db.refresh(req_minero)
        return req_minero

    def update(self, id_req_minero: int, req_minero_data: ReqMineroUpdate) -> Optional[ReqMinero]:
        req_minero = self.get_by_id(id_req_minero)
        if req_minero:
            update_data = req_minero_data.dict(exclude_unset=True)
            for field, value in update_data.items():
                setattr(req_minero, field, value)
            
            self.db.commit()
            self.db.refresh(req_minero)
        return req_minero

    def delete(self, id_req_minero: int) -> bool:
        req_minero = self.get_by_id(id_req_minero)
        if req_minero:
            self.db.delete(req_minero)
            self.db.commit()
            return True
        return False

    def search(self, filters: dict, skip: int = 0, limit: int = 100) -> List[ReqMinero]:
        query = self.db.query(ReqMinero)
        
        if filters.get('IdTransaccion'):
            query = query.filter(ReqMinero.IdTransaccion == filters['IdTransaccion'])
        
        if filters.get('Tipo'):
            query = query.filter(ReqMinero.Tipo.ilike(f"%{filters['Tipo']}%"))
        
        if filters.get('Descripcion'):
            query = query.filter(ReqMinero.Descripcion.ilike(f"%{filters['Descripcion']}%"))
        
        return query.order_by(ReqMinero.IdReqMinero.desc()).offset(skip).limit(limit).all()

    def search_count(self, filters: dict) -> int:
        query = self.db.query(ReqMinero)
        
        if filters.get('IdTransaccion'):
            query = query.filter(ReqMinero.IdTransaccion == filters['IdTransaccion'])
        
        if filters.get('Tipo'):
            query = query.filter(ReqMinero.Tipo.ilike(f"%{filters['Tipo']}%"))
        
        if filters.get('Descripcion'):
            query = query.filter(ReqMinero.Descripcion.ilike(f"%{filters['Descripcion']}%"))
        
        return query.count()

    def get_count(self) -> int:
        return self.db.query(ReqMinero).count()
