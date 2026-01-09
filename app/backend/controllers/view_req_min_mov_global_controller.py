from fastapi import APIRouter, Depends, HTTPException, Query, Response
from sqlalchemy.orm import Session
from backend.database.connection import get_db
from backend.services.view_req_min_mov_global_service import ViewReqMinMovGlobalService
from backend.schemas.view_req_min_mov_global_schema import (
    ViewReqMinMovGlobalOut,
    ViewReqMinMovGlobalFilter
)
from typing import List, Optional
import json
from backend.services.auth_jwt import get_current_user

router = APIRouter()


def get_view_service(db: Session = Depends(get_db)) -> ViewReqMinMovGlobalService:
    return ViewReqMinMovGlobalService(db)


@router.get("/view-req-min-mov-global", response_model=List[ViewReqMinMovGlobalOut])
def get_view_req_min_mov_global(
    response: Response,
    filter: Optional[str] = Query(None, description="Filtros en formato JSON"),
    range: Optional[str] = Query(None, description="Rango de paginación [start, end]"),
    service: ViewReqMinMovGlobalService = Depends(get_view_service),
    current_user: dict = Depends(get_current_user)
):
    """
    Obtener lista de requerimientos mineros con información de expedientes
    """
    try:
        # Procesar filtros
        filters = ViewReqMinMovGlobalFilter()
        
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
        
        response.headers['Content-Range'] = f"view-req-min-mov-global {start}-{end}/{total}"
        response.headers['Access-Control-Expose-Headers'] = 'Content-Range'
        
        return result['data']
        
    except json.JSONDecodeError as e:
        raise HTTPException(status_code=400, detail=f"Error al parsear JSON: {str(e)}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error al obtener datos: {str(e)}")


@router.get("/view-req-min-mov-global/{id_req_minero_mov}", response_model=ViewReqMinMovGlobalOut)
def get_view_req_min_mov_global_by_id(
    id_req_minero_mov: int,
    service: ViewReqMinMovGlobalService = Depends(get_view_service),
    current_user: dict = Depends(get_current_user)
):
    """
    Obtener un registro de la vista por IdReqMineroMov
    """
    result = service.get_by_id(id_req_minero_mov)
    if not result:
        raise HTTPException(status_code=404, detail="Registro no encontrado")
    return result


@router.get("/view-req-min-mov-global/propiedad/{id_propiedad_minera}", response_model=List[ViewReqMinMovGlobalOut])
def get_view_by_propiedad(
    id_propiedad_minera: int,
    skip: int = 0,
    limit: int = 100,
    service: ViewReqMinMovGlobalService = Depends(get_view_service),
    current_user: dict = Depends(get_current_user)
):
    """
    Obtener registros por IdPropiedadMinera
    """
    return service.get_by_propiedad_minera(id_propiedad_minera, skip, limit)


@router.get("/view-req-min-mov-global/expediente/{id_expediente}", response_model=List[ViewReqMinMovGlobalOut])
def get_view_by_expediente(
    id_expediente: int,
    skip: int = 0,
    limit: int = 100,
    service: ViewReqMinMovGlobalService = Depends(get_view_service),
    current_user: dict = Depends(get_current_user)
):
    """
    Obtener registros por IdExpediente
    """
    return service.get_by_expediente(id_expediente, skip, limit)


@router.get("/view-req-min-mov-global/req-minero/{id_req_minero}", response_model=List[ViewReqMinMovGlobalOut])
def get_view_by_req_minero(
    id_req_minero: int,
    skip: int = 0,
    limit: int = 100,
    service: ViewReqMinMovGlobalService = Depends(get_view_service),
    current_user: dict = Depends(get_current_user)
):
    """
    Obtener registros por IdReqMinero
    """
    return service.get_by_req_minero(id_req_minero, skip, limit)


@router.get("/view-req-min-mov-global/propiedad-completa/{id_propiedad_minera}", response_model=List[ViewReqMinMovGlobalOut])
def get_view_by_propiedad_completa(
    id_propiedad_minera: int,
    skip: int = 0,
    limit: int = 1000,
    service: ViewReqMinMovGlobalService = Depends(get_view_service),
    current_user: dict = Depends(get_current_user)
):
    """
    Obtener registros por IdPropiedadMinera O IdPropiedadMineraExp
    (Busca en ambos campos para obtener todos los requerimientos relacionados a una propiedad)
    """
    return service.get_by_propiedad_completa(id_propiedad_minera, skip, limit)
