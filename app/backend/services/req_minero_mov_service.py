from sqlalchemy.orm import Session
from backend.repositories.req_minero_mov_repositorie import ReqMineroMovRepository
from backend.repositories.propiedad_minera_repositorie import PropiedadMineraRepositorie
from backend.schemas.req_minero_mov_schema import ReqMineroMovCreate, ReqMineroMovUpdate, ReqMineroMovFilter
from typing import List, Optional
from backend.models.req_minero_mov_model import ReqMineroMov

class ReqMineroMovService:
    def __init__(self, db: Session):
        self.repository = ReqMineroMovRepository(db)
        self.propiedad_repository = PropiedadMineraRepositorie(db)

    def get_all(self, skip: int = 0, limit: int = 100) -> List[ReqMineroMov]:
        return self.repository.get_all(skip, limit)

    def get_by_id(self, id_req_minero_mov: int) -> Optional[ReqMineroMov]:
        return self.repository.get_by_id(id_req_minero_mov)

    def get_by_propiedad(self, id_propiedad_minera: int, skip: int = 0, limit: int = 100) -> List[ReqMineroMov]:
        return self.repository.get_by_propiedad(id_propiedad_minera, skip, limit)

    def create(self, req_minero_mov_data: ReqMineroMovCreate) -> ReqMineroMov:
        # Si se proporciona IdPropiedadMinera, extraer automáticamente el IdTransaccion
        if req_minero_mov_data.IdPropiedadMinera and not req_minero_mov_data.IdTransaccion:
            propiedad = self.propiedad_repository.get_by_id(req_minero_mov_data.IdPropiedadMinera)
            if propiedad and propiedad.IdTransaccion:
                req_minero_mov_data.IdTransaccion = propiedad.IdTransaccion
                print(f"[DEBUG] IdTransaccion extraído de propiedad {req_minero_mov_data.IdPropiedadMinera}: {propiedad.IdTransaccion}")
            else:
                print(f"[WARNING] No se encontró IdTransaccion para la propiedad {req_minero_mov_data.IdPropiedadMinera}")
        
        print(f"[DEBUG] Datos antes de crear en repositorio: {req_minero_mov_data.dict()}")
        return self.repository.create(req_minero_mov_data)

    def update(self, id_req_minero_mov: int, req_minero_mov_data: ReqMineroMovUpdate) -> Optional[ReqMineroMov]:
        return self.repository.update(id_req_minero_mov, req_minero_mov_data)

    def delete(self, id_req_minero_mov: int) -> bool:
        return self.repository.delete(id_req_minero_mov)

    def get_total_count(self) -> int:
        return self.repository.get_total_count()

    def get_count_by_propiedad(self, id_propiedad_minera: int) -> int:
        return self.repository.get_count_by_propiedad(id_propiedad_minera)

    def search_with_filters(self, filters: ReqMineroMovFilter) -> dict:
        # Convertir filtros a diccionario
        filter_dict = {}
        
        if filters.IdPropiedadMinera:
            filter_dict['IdPropiedadMinera'] = filters.IdPropiedadMinera
        
        if filters.IdReqMinero:
            filter_dict['IdReqMinero'] = filters.IdReqMinero
        
        if filters.Descripcion:
            filter_dict['Descripcion'] = filters.Descripcion
        
        if filters.FechaDesde:
            filter_dict['FechaDesde'] = filters.FechaDesde
        
        if filters.FechaHasta:
            filter_dict['FechaHasta'] = filters.FechaHasta
        
        # Manejar paginación
        skip = 0
        limit = 100
        
        if filters.range and len(filters.range) == 2:
            skip = filters.range[0]
            limit = filters.range[1] - filters.range[0] + 1
        
        # Buscar datos
        data = self.repository.search(filter_dict, skip, limit)
        total = self.repository.search_count(filter_dict)
        
        return {
            'data': data,
            'total': total,
            'skip': skip,
            'limit': limit
        }
