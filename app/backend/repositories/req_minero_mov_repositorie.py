from sqlalchemy.orm import Session
from backend.models.req_minero_mov_model import ReqMineroMov
from backend.schemas.req_minero_mov_schema import ReqMineroMovCreate, ReqMineroMovUpdate
from typing import List, Optional
from datetime import datetime

class ReqMineroMovRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_all(self, skip: int = 0, limit: int = 100) -> List[ReqMineroMov]:
        return self.db.query(ReqMineroMov).order_by(ReqMineroMov.IdReqMineroMov.desc()).offset(skip).limit(limit).all()

    def get_by_id(self, id_req_minero_mov: int) -> Optional[ReqMineroMov]:
        return self.db.query(ReqMineroMov).filter(ReqMineroMov.IdReqMineroMov == id_req_minero_mov).first()

    def get_by_propiedad(self, id_propiedad_minera: int, skip: int = 0, limit: int = 100) -> List[ReqMineroMov]:
        return self.db.query(ReqMineroMov).filter(
            ReqMineroMov.IdPropiedadMinera == id_propiedad_minera
        ).order_by(ReqMineroMov.IdReqMineroMov.desc()).offset(skip).limit(limit).all()

    def create(self, req_minero_mov_data: ReqMineroMovCreate) -> ReqMineroMov:
        # Convertir a diccionario y crear instancia
        req_minero_mov_dict = req_minero_mov_data.dict()
        print(f"[DEBUG] Diccionario para crear: {req_minero_mov_dict}")
        
        # Agregar campos de auditoría
        req_minero_mov_dict['AudFecha'] = datetime.now()
        if not req_minero_mov_dict.get('AudUsuario'):
            req_minero_mov_dict['AudUsuario'] = 1  # Usuario por defecto
        
        print(f"[DEBUG] Diccionario final con auditoría: {req_minero_mov_dict}")
        
        try:
            db_req_minero_mov = ReqMineroMov(**req_minero_mov_dict)
            print(f"[DEBUG] Objeto ReqMineroMov creado: {db_req_minero_mov}")
            
            self.db.add(db_req_minero_mov)
            print(f"[DEBUG] Objeto añadido a la sesión")
            
            self.db.commit()
            print(f"[DEBUG] Commit realizado")
            
            self.db.refresh(db_req_minero_mov)
            print(f"[DEBUG] Objeto refrescado, ID: {db_req_minero_mov.IdReqMineroMov}")
            
            return db_req_minero_mov
        except Exception as e:
            print(f"[ERROR] Error en repositorio create: {str(e)}")
            print(f"[ERROR] Tipo de error: {type(e).__name__}")
            self.db.rollback()
            raise

    def update(self, id_req_minero_mov: int, req_minero_mov_data: ReqMineroMovUpdate) -> Optional[ReqMineroMov]:
        db_req_minero_mov = self.get_by_id(id_req_minero_mov)
        if not db_req_minero_mov:
            return None
        
        # Actualizar campos
        update_data = req_minero_mov_data.dict(exclude_unset=True)
        
        # Actualizar campos de auditoría
        update_data['AudFecha'] = datetime.now()
        if not update_data.get('AudUsuario'):
            update_data['AudUsuario'] = 1  # Usuario por defecto
        
        for field, value in update_data.items():
            setattr(db_req_minero_mov, field, value)
        
        self.db.commit()
        self.db.refresh(db_req_minero_mov)
        return db_req_minero_mov

    def delete(self, id_req_minero_mov: int) -> bool:
        db_req_minero_mov = self.get_by_id(id_req_minero_mov)
        if not db_req_minero_mov:
            return False
        
        self.db.delete(db_req_minero_mov)
        self.db.commit()
        return True

    def get_total_count(self) -> int:
        return self.db.query(ReqMineroMov).count()

    def get_count_by_propiedad(self, id_propiedad_minera: int) -> int:
        return self.db.query(ReqMineroMov).filter(
            ReqMineroMov.IdPropiedadMinera == id_propiedad_minera
        ).count()

    def search(self, filters: dict, skip: int = 0, limit: int = 100) -> List[ReqMineroMov]:
        query = self.db.query(ReqMineroMov)
        
        if filters.get('IdPropiedadMinera'):
            query = query.filter(ReqMineroMov.IdPropiedadMinera == filters['IdPropiedadMinera'])
        
        if filters.get('IdReqMinero'):
            query = query.filter(ReqMineroMov.IdReqMinero == filters['IdReqMinero'])
        
        if filters.get('Descripcion'):
            query = query.filter(ReqMineroMov.Descripcion.contains(filters['Descripcion']))
        
        if filters.get('FechaDesde'):
            query = query.filter(ReqMineroMov.Fecha >= filters['FechaDesde'])
        
        if filters.get('FechaHasta'):
            query = query.filter(ReqMineroMov.Fecha <= filters['FechaHasta'])
        
        return query.order_by(ReqMineroMov.IdReqMineroMov.desc()).offset(skip).limit(limit).all()

    def search_count(self, filters: dict) -> int:
        query = self.db.query(ReqMineroMov)
        
        if filters.get('IdPropiedadMinera'):
            query = query.filter(ReqMineroMov.IdPropiedadMinera == filters['IdPropiedadMinera'])
        
        if filters.get('IdReqMinero'):
            query = query.filter(ReqMineroMov.IdReqMinero == filters['IdReqMinero'])
        
        if filters.get('Descripcion'):
            query = query.filter(ReqMineroMov.Descripcion.contains(filters['Descripcion']))
        
        if filters.get('FechaDesde'):
            query = query.filter(ReqMineroMov.Fecha >= filters['FechaDesde'])
        
        if filters.get('FechaHasta'):
            query = query.filter(ReqMineroMov.Fecha <= filters['FechaHasta'])
        
        return query.count()
