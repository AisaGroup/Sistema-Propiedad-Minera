from sqlalchemy.orm import Session
from backend.repositories.req_min_exp_repositorie import ReqMinExpRepository
from backend.schemas.req_min_exp_schema import ReqMinExpCreate, ReqMinExpUpdate, ReqMinExpFilter
from typing import List, Optional
from backend.models.req_min_exp import ReqMinExp

class ReqMinExpService:
    def __init__(self, db: Session):
        self.repository = ReqMinExpRepository(db)

    def get_all(self, skip: int = 0, limit: int = 100) -> List[ReqMinExp]:
        return self.repository.get_all(skip, limit)

    def get_by_id(self, id_req_min_exp: int) -> Optional[ReqMinExp]:
        return self.repository.get_by_id(id_req_min_exp)

    def get_by_req_minero_mov(self, id_req_minero_mov: int, skip: int = 0, limit: int = 100) -> List[dict]:
        registros = self.repository.get_by_req_minero_mov(id_req_minero_mov, skip, limit)
        
        # Agregar CodigoExpediente a cada registro
        result = []
        for reg in registros:
            reg_dict = {
                "IdReqMinExp": reg.IdReqMinExp,
                "IdReqMineroMov": reg.IdReqMineroMov,
                "IdExpediente": reg.IdExpediente,
                "IdPropiedadMinera": reg.IdPropiedadMinera,
                "CodigoExpediente": reg.expediente.CodigoExpediente if reg.expediente else None
            }
            result.append(reg_dict)
        
        return result

    def get_by_expediente(self, id_expediente: int, skip: int = 0, limit: int = 100) -> List[ReqMinExp]:
        return self.repository.get_by_expediente(id_expediente, skip, limit)

    def create(self, req_min_exp_data: ReqMinExpCreate) -> ReqMinExp:
        return self.repository.create(req_min_exp_data)

    def update(self, id_req_min_exp: int, req_min_exp_data: ReqMinExpUpdate) -> Optional[ReqMinExp]:
        return self.repository.update(id_req_min_exp, req_min_exp_data)

    def delete(self, id_req_min_exp: int) -> bool:
        return self.repository.delete(id_req_min_exp)

    def get_total_count(self) -> int:
        return self.repository.get_total_count()

    def get_count_by_req_minero_mov(self, id_req_minero_mov: int) -> int:
        return self.repository.get_count_by_req_minero_mov(id_req_minero_mov)

    def get_count_by_expediente(self, id_expediente: int) -> int:
        return self.repository.get_count_by_expediente(id_expediente)

    def search_with_filters(self, filters: ReqMinExpFilter) -> dict:
        # Convertir filtros a diccionario
        filter_dict = {}
        
        if filters.IdReqMineroMov is not None:
            filter_dict['IdReqMineroMov'] = filters.IdReqMineroMov
        
        if filters.IdExpediente is not None:
            filter_dict['IdExpediente'] = filters.IdExpediente
        
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
