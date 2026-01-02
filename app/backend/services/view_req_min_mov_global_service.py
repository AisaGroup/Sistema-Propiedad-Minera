from sqlalchemy.orm import Session
from backend.repositories.view_req_min_mov_global_repositorie import ViewReqMinMovGlobalRepository
from backend.schemas.view_req_min_mov_global_schema import ViewReqMinMovGlobalFilter
from typing import List, Optional
from backend.models.view_req_min_mov_global_model import ViewReqMinMovGlobal


class ViewReqMinMovGlobalService:
    def __init__(self, db: Session):
        self.repository = ViewReqMinMovGlobalRepository(db)

    def get_all(self, skip: int = 0, limit: int = 100) -> List[ViewReqMinMovGlobal]:
        return self.repository.get_all(skip, limit)

    def get_by_id(self, id_req_minero_mov: int) -> Optional[ViewReqMinMovGlobal]:
        return self.repository.get_by_id(id_req_minero_mov)

    def get_by_propiedad_minera(self, id_propiedad_minera: int, skip: int = 0, limit: int = 100) -> List[ViewReqMinMovGlobal]:
        return self.repository.get_by_propiedad_minera(id_propiedad_minera, skip, limit)

    def get_by_expediente(self, id_expediente: int, skip: int = 0, limit: int = 100) -> List[ViewReqMinMovGlobal]:
        return self.repository.get_by_expediente(id_expediente, skip, limit)

    def get_by_req_minero(self, id_req_minero: int, skip: int = 0, limit: int = 100) -> List[ViewReqMinMovGlobal]:
        return self.repository.get_by_req_minero(id_req_minero, skip, limit)

    def get_by_propiedad_completa(self, id_propiedad_minera: int, skip: int = 0, limit: int = 1000) -> List[ViewReqMinMovGlobal]:
        """
        Obtiene todos los registros donde IdPropiedadMinera O IdPropiedadMineraExp coincidan
        """
        return self.repository.get_by_propiedad_completa(id_propiedad_minera, skip, limit)

    def get_total_count(self) -> int:
        return self.repository.get_total_count()

    def search_with_filters(self, filters: ViewReqMinMovGlobalFilter) -> dict:
        # Convertir filtros a diccionario
        filter_dict = {}
        
        if filters.IdReqMineroMov is not None:
            filter_dict['IdReqMineroMov'] = filters.IdReqMineroMov
        
        if filters.IdPropiedadMinera is not None:
            filter_dict['IdPropiedadMinera'] = filters.IdPropiedadMinera
        
        if filters.IdReqMinero is not None:
            filter_dict['IdReqMinero'] = filters.IdReqMinero
        
        if filters.IdExpediente is not None:
            filter_dict['IdExpediente'] = filters.IdExpediente
        
        if filters.CodigoExpediente is not None:
            filter_dict['CodigoExpediente'] = filters.CodigoExpediente
        
        # Manejar paginación
        skip = 0
        limit = 100
        if filters.range:
            skip = filters.range[0]
            limit = filters.range[1] - filters.range[0] + 1
        
        # Obtener datos
        data = self.repository.search_with_filters(filter_dict, skip, limit)
        total = self.repository.count_with_filters(filter_dict)
        
        return {
            'data': data,
            'total': total,
            'skip': skip,
            'limit': limit
        }
