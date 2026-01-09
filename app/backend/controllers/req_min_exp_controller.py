from fastapi import APIRouter, Depends, HTTPException, Query, Response
from sqlalchemy.orm import Session
from backend.database.connection import get_db
from backend.services.req_min_exp_service import ReqMinExpService
from backend.schemas.req_min_exp_schema import (
    ReqMinExpOut, 
    ReqMinExpCreate, 
    ReqMinExpUpdate,
    ReqMinExpFilter
)
from typing import List, Optional
import json
from backend.services.auth_jwt import get_current_user

router = APIRouter()

def get_req_min_exp_service(db: Session = Depends(get_db)) -> ReqMinExpService:
    return ReqMinExpService(db)

@router.get("/req-min-exps", response_model=List[ReqMinExpOut])
def get_req_min_exps(
    response: Response,
    filter: Optional[str] = Query(None, description="Filtros en formato JSON"),
    range: Optional[str] = Query(None, description="Rango de paginación [start, end]"),
    service: ReqMinExpService = Depends(get_req_min_exp_service),
    current_user: dict = Depends(get_current_user)
):
    """
    Obtener lista de relaciones Requerimiento-Expediente con filtros opcionales
    """
    try:
        # Procesar filtros
        filters = ReqMinExpFilter()
        
        if filter:
            filter_data = json.loads(filter)
            for key, value in filter_data.items():
                if hasattr(filters, key):
                    setattr(filters, key, value)
        
        if range:
            range_data = json.loads(range)
            filters.range = range_data
        
        # Obtener datos
        result = service.search_with_filters(filters)
        
        # Configurar headers de respuesta
        start = result['skip']
        end = start + len(result['data']) - 1
        total = result['total']
        
        response.headers['Content-Range'] = f"req-min-exps {start}-{end}/{total}"
        response.headers['Access-Control-Expose-Headers'] = 'Content-Range'
        
        return result['data']
        
    except json.JSONDecodeError as e:
        raise HTTPException(status_code=400, detail=f"Error al parsear JSON: {str(e)}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error al obtener relaciones: {str(e)}")

@router.get("/req-min-exps/{id_req_min_exp}", response_model=ReqMinExpOut)
def get_req_min_exp(
    id_req_min_exp: int,
    service: ReqMinExpService = Depends(get_req_min_exp_service),
    current_user: dict = Depends(get_current_user)
):
    """
    Obtener una relación Requerimiento-Expediente por ID
    """
    req_min_exp = service.get_by_id(id_req_min_exp)
    if not req_min_exp:
        raise HTTPException(status_code=404, detail="Relación no encontrada")
    return req_min_exp

@router.get("/req-min-exps/req-minero-mov/{id_req_minero_mov}", response_model=List[ReqMinExpOut])
def get_req_min_exps_by_req_minero_mov(
    id_req_minero_mov: int,
    skip: int = 0,
    limit: int = 100,
    service: ReqMinExpService = Depends(get_req_min_exp_service),
    current_user: dict = Depends(get_current_user)
):
    """
    Obtener relaciones por IdReqMineroMov
    """
    return service.get_by_req_minero_mov(id_req_minero_mov, skip, limit)

@router.get("/req-min-exps/expediente/{id_expediente}", response_model=List[ReqMinExpOut])
def get_req_min_exps_by_expediente(
    id_expediente: int,
    skip: int = 0,
    limit: int = 100,
    service: ReqMinExpService = Depends(get_req_min_exp_service),
    current_user: dict = Depends(get_current_user)
):
    """
    Obtener relaciones por IdExpediente
    """
    return service.get_by_expediente(id_expediente, skip, limit)

@router.post("/req-min-exps", response_model=ReqMinExpOut, status_code=201)
def create_req_min_exp(
    req_min_exp_data: ReqMinExpCreate,
    service: ReqMinExpService = Depends(get_req_min_exp_service),
    current_user: dict = Depends(get_current_user)
):
    """
    Crear una nueva relación Requerimiento-Expediente
    """
    try:
        return service.create(req_min_exp_data)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error al crear relación: {str(e)}")

@router.post("/req-min-exp/bulk", response_model=List[ReqMinExpOut], status_code=201)
def create_req_min_exp_bulk(
    req_min_exp_list: List[ReqMinExpCreate],
    service: ReqMinExpService = Depends(get_req_min_exp_service),
    current_user: dict = Depends(get_current_user)
):
    """
    Crear múltiples relaciones Requerimiento-Expediente en una sola operación
    """
    try:
        created_relations = []
        for req_min_exp_data in req_min_exp_list:
            created = service.create(req_min_exp_data)
            created_relations.append(created)
        return created_relations
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error al crear relaciones: {str(e)}")

@router.put("/req-min-exps/{id_req_min_exp}", response_model=ReqMinExpOut)
def update_req_min_exp(
    id_req_min_exp: int,
    req_min_exp_data: ReqMinExpUpdate,
    service: ReqMinExpService = Depends(get_req_min_exp_service),
    current_user: dict = Depends(get_current_user)
):
    """
    Actualizar una relación Requerimiento-Expediente existente
    """
    req_min_exp = service.update(id_req_min_exp, req_min_exp_data)
    if not req_min_exp:
        raise HTTPException(status_code=404, detail="Relación no encontrada")
    return req_min_exp

@router.delete("/req-min-exps/{id_req_min_exp}", status_code=204)
def delete_req_min_exp(
    id_req_min_exp: int,
    service: ReqMinExpService = Depends(get_req_min_exp_service),
    current_user: dict = Depends(get_current_user)
):
    """
    Eliminar una relación Requerimiento-Expediente
    """
    success = service.delete(id_req_min_exp)
    if not success:
        raise HTTPException(status_code=404, detail="Relación no encontrada")
    return None
