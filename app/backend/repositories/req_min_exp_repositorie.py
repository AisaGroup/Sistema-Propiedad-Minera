from sqlalchemy.orm import Session, joinedload
from backend.models.req_min_exp import ReqMinExp
from backend.models.expediente_model import Expediente
from backend.schemas.req_min_exp_schema import ReqMinExpCreate, ReqMinExpUpdate
from typing import List, Optional

class ReqMinExpRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_all(self, skip: int = 0, limit: int = 100) -> List[ReqMinExp]:
        return self.db.query(ReqMinExp).order_by(ReqMinExp.IdReqMinExp.desc()).offset(skip).limit(limit).all()

    def get_by_id(self, id_req_min_exp: int) -> Optional[ReqMinExp]:
        return self.db.query(ReqMinExp).filter(ReqMinExp.IdReqMinExp == id_req_min_exp).first()

    def get_by_req_minero_mov(self, id_req_minero_mov: int, skip: int = 0, limit: int = 100) -> List[ReqMinExp]:
        return self.db.query(ReqMinExp).options(
            joinedload(ReqMinExp.expediente)
        ).filter(
            ReqMinExp.IdReqMineroMov == id_req_minero_mov
        ).order_by(ReqMinExp.IdReqMinExp.desc()).offset(skip).limit(limit).all()

    def get_by_expediente(self, id_expediente: int, skip: int = 0, limit: int = 100) -> List[ReqMinExp]:
        return self.db.query(ReqMinExp).filter(
            ReqMinExp.IdExpediente == id_expediente
        ).order_by(ReqMinExp.IdReqMinExp.desc()).offset(skip).limit(limit).all()

    def create(self, req_min_exp_data: ReqMinExpCreate) -> ReqMinExp:
        req_min_exp_dict = req_min_exp_data.dict()
        
        # Obtener IdPropiedadMinera del Expediente si no viene en los datos
        if req_min_exp_dict.get('IdExpediente') and not req_min_exp_dict.get('IdPropiedadMinera'):
            expediente = self.db.query(Expediente).filter(
                Expediente.IdExpediente == req_min_exp_dict['IdExpediente']
            ).first()
            
            if expediente and expediente.IdPropiedadMinera:
                req_min_exp_dict['IdPropiedadMinera'] = expediente.IdPropiedadMinera
        
        try:
            db_req_min_exp = ReqMinExp(**req_min_exp_dict)
            self.db.add(db_req_min_exp)
            self.db.commit()
            self.db.refresh(db_req_min_exp)
            return db_req_min_exp
        except Exception as e:
            self.db.rollback()
            print(f"[ERROR] Error en repositorio create: {str(e)}")
            raise e

    def update(self, id_req_min_exp: int, req_min_exp_data: ReqMinExpUpdate) -> Optional[ReqMinExp]:
        db_req_min_exp = self.get_by_id(id_req_min_exp)
        if not db_req_min_exp:
            return None
        
        update_data = req_min_exp_data.dict(exclude_unset=True)
        for key, value in update_data.items():
            setattr(db_req_min_exp, key, value)
        
        try:
            self.db.commit()
            self.db.refresh(db_req_min_exp)
            return db_req_min_exp
        except Exception as e:
            self.db.rollback()
            print(f"[ERROR] Error en repositorio update: {str(e)}")
            raise e

    def delete(self, id_req_min_exp: int) -> bool:
        db_req_min_exp = self.get_by_id(id_req_min_exp)
        if not db_req_min_exp:
            return False
        
        try:
            self.db.delete(db_req_min_exp)
            self.db.commit()
            return True
        except Exception as e:
            self.db.rollback()
            print(f"[ERROR] Error en repositorio delete: {str(e)}")
            raise e

    def get_total_count(self) -> int:
        return self.db.query(ReqMinExp).count()

    def get_count_by_req_minero_mov(self, id_req_minero_mov: int) -> int:
        return self.db.query(ReqMinExp).filter(ReqMinExp.IdReqMineroMov == id_req_minero_mov).count()

    def get_count_by_expediente(self, id_expediente: int) -> int:
        return self.db.query(ReqMinExp).filter(ReqMinExp.IdExpediente == id_expediente).count()

    def search_with_filters(self, filters: dict, skip: int = 0, limit: int = 100) -> List[ReqMinExp]:
        query = self.db.query(ReqMinExp)
        
        if filters.get('IdReqMineroMov'):
            query = query.filter(ReqMinExp.IdReqMineroMov == filters['IdReqMineroMov'])
        
        if filters.get('IdExpediente'):
            query = query.filter(ReqMinExp.IdExpediente == filters['IdExpediente'])
        
        return query.order_by(ReqMinExp.IdReqMinExp.desc()).offset(skip).limit(limit).all()

    def count_with_filters(self, filters: dict) -> int:
        query = self.db.query(ReqMinExp)
        
        if filters.get('IdReqMineroMov'):
            query = query.filter(ReqMinExp.IdReqMineroMov == filters['IdReqMineroMov'])
        
        if filters.get('IdExpediente'):
            query = query.filter(ReqMinExp.IdExpediente == filters['IdExpediente'])
        
        return query.count()
