from sqlalchemy.orm import Session
from backend.models.view_req_min_mov_global_model import ViewReqMinMovGlobal
from typing import List, Optional


class ViewReqMinMovGlobalRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_all(self, skip: int = 0, limit: int = 100) -> List[ViewReqMinMovGlobal]:
        return self.db.query(ViewReqMinMovGlobal).order_by(
            ViewReqMinMovGlobal.IdReqMineroMov.desc()
        ).offset(skip).limit(limit).all()

    def get_by_id(self, id_req_minero_mov: int) -> Optional[ViewReqMinMovGlobal]:
        return self.db.query(ViewReqMinMovGlobal).filter(
            ViewReqMinMovGlobal.IdReqMineroMov == id_req_minero_mov
        ).first()

    def get_by_propiedad_minera(self, id_propiedad_minera: int, skip: int = 0, limit: int = 100) -> List[ViewReqMinMovGlobal]:
        return self.db.query(ViewReqMinMovGlobal).filter(
            ViewReqMinMovGlobal.IdPropiedadMinera == id_propiedad_minera
        ).order_by(ViewReqMinMovGlobal.IdReqMineroMov.desc()).offset(skip).limit(limit).all()

    def get_by_expediente(self, id_expediente: int, skip: int = 0, limit: int = 100) -> List[ViewReqMinMovGlobal]:
        return self.db.query(ViewReqMinMovGlobal).filter(
            ViewReqMinMovGlobal.IdExpediente == id_expediente
        ).order_by(ViewReqMinMovGlobal.IdReqMineroMov.desc()).offset(skip).limit(limit).all()

    def get_by_req_minero(self, id_req_minero: int, skip: int = 0, limit: int = 100) -> List[ViewReqMinMovGlobal]:
        return self.db.query(ViewReqMinMovGlobal).filter(
            ViewReqMinMovGlobal.IdReqMinero == id_req_minero
        ).order_by(ViewReqMinMovGlobal.IdReqMineroMov.desc()).offset(skip).limit(limit).all()

    def get_by_propiedad_completa(self, id_propiedad_minera: int, skip: int = 0, limit: int = 1000) -> List[ViewReqMinMovGlobal]:
        """
        Obtiene todos los registros donde IdPropiedadMinera O IdPropiedadMineraExp coincidan
        """
        from sqlalchemy import or_
        
        return self.db.query(ViewReqMinMovGlobal).filter(
            or_(
                ViewReqMinMovGlobal.IdPropiedadMinera == id_propiedad_minera,
                ViewReqMinMovGlobal.IdPropiedadMineraExp == id_propiedad_minera
            )
        ).order_by(ViewReqMinMovGlobal.IdReqMineroMov.desc()).offset(skip).limit(limit).all()

    def get_total_count(self) -> int:
        return self.db.query(ViewReqMinMovGlobal).count()

    def search_with_filters(self, filters: dict, skip: int = 0, limit: int = 100) -> List[ViewReqMinMovGlobal]:
        query = self.db.query(ViewReqMinMovGlobal)
        
        if filters.get('IdReqMineroMov'):
            query = query.filter(ViewReqMinMovGlobal.IdReqMineroMov == filters['IdReqMineroMov'])
        
        if filters.get('IdPropiedadMinera'):
            query = query.filter(ViewReqMinMovGlobal.IdPropiedadMinera == filters['IdPropiedadMinera'])
        
        if filters.get('IdReqMinero'):
            query = query.filter(ViewReqMinMovGlobal.IdReqMinero == filters['IdReqMinero'])
        
        if filters.get('IdExpediente'):
            query = query.filter(ViewReqMinMovGlobal.IdExpediente == filters['IdExpediente'])
        
        if filters.get('CodigoExpediente'):
            query = query.filter(ViewReqMinMovGlobal.CodigoExpediente.like(f"%{filters['CodigoExpediente']}%"))
        
        return query.order_by(ViewReqMinMovGlobal.IdReqMineroMov.desc()).offset(skip).limit(limit).all()

    def count_with_filters(self, filters: dict) -> int:
        query = self.db.query(ViewReqMinMovGlobal)
        
        if filters.get('IdReqMineroMov'):
            query = query.filter(ViewReqMinMovGlobal.IdReqMineroMov == filters['IdReqMineroMov'])
        
        if filters.get('IdPropiedadMinera'):
            query = query.filter(ViewReqMinMovGlobal.IdPropiedadMinera == filters['IdPropiedadMinera'])
        
        if filters.get('IdReqMinero'):
            query = query.filter(ViewReqMinMovGlobal.IdReqMinero == filters['IdReqMinero'])
        
        if filters.get('IdExpediente'):
            query = query.filter(ViewReqMinMovGlobal.IdExpediente == filters['IdExpediente'])
        
        if filters.get('CodigoExpediente'):
            query = query.filter(ViewReqMinMovGlobal.CodigoExpediente.like(f"%{filters['CodigoExpediente']}%"))
        
        return query.count()
