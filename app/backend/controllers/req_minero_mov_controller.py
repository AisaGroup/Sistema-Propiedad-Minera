from fastapi import APIRouter, Depends, HTTPException, Query, Response
from sqlalchemy.orm import Session
from backend.database.connection import get_db
from backend.services.req_minero_mov_service import ReqMineroMovService
from backend.schemas.req_minero_mov_schema import (
    ReqMineroMovOut, 
    ReqMineroMovCreate, 
    ReqMineroMovUpdate,
    ReqMineroMovFilter
)
from typing import List, Optional
import json

router = APIRouter()

def get_req_minero_mov_service(db: Session = Depends(get_db)) -> ReqMineroMovService:
    return ReqMineroMovService(db)

@router.get("/req-minero-movs", response_model=List[ReqMineroMovOut])
def get_req_minero_movs(
    response: Response,
    filter: Optional[str] = Query(None, description="Filtros en formato JSON"),
    range: Optional[str] = Query(None, description="Rango de paginación [start, end]"),
    service: ReqMineroMovService = Depends(get_req_minero_mov_service)
):
    """
    Obtener lista de requerimientos mineros con filtros opcionales
    """
    try:
        # Procesar filtros
        filters = ReqMineroMovFilter()
        
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
        
        response.headers["Content-Range"] = f"req-minero-movs {start}-{end}/{total}"
        response.headers["Access-Control-Expose-Headers"] = "Content-Range"
        
        return result['data']
        
    except json.JSONDecodeError:
        raise HTTPException(status_code=400, detail="Formato de filtro o rango inválido")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/req-minero-movs/{id_req_minero_mov}", response_model=ReqMineroMovOut)
def get_req_minero_mov(
    id_req_minero_mov: int,
    service: ReqMineroMovService = Depends(get_req_minero_mov_service)
):
    """
    Obtener un requerimiento minero por ID
    """
    req_minero_mov = service.get_by_id(id_req_minero_mov)
    if not req_minero_mov:
        raise HTTPException(status_code=404, detail="Requerimiento minero no encontrado")
    return req_minero_mov

@router.get("/propiedades-mineras/{id_propiedad_minera}/req-minero-movs", response_model=List[ReqMineroMovOut])
def get_req_minero_movs_by_propiedad(
    id_propiedad_minera: int,
    response: Response,
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    service: ReqMineroMovService = Depends(get_req_minero_mov_service)
):
    """
    Obtener requerimientos mineros de una propiedad específica
    """
    req_minero_movs = service.get_by_propiedad(id_propiedad_minera, skip, limit)
    total = service.get_count_by_propiedad(id_propiedad_minera)
    
    # Configurar headers de respuesta
    end = skip + len(req_minero_movs) - 1 if req_minero_movs else skip
    response.headers["Content-Range"] = f"req-minero-movs {skip}-{end}/{total}"
    response.headers["Access-Control-Expose-Headers"] = "Content-Range"
    
    return req_minero_movs

@router.post("/req-minero-movs", response_model=ReqMineroMovOut)
def create_req_minero_mov(
    req_minero_mov_data: ReqMineroMovCreate,
    service: ReqMineroMovService = Depends(get_req_minero_mov_service)
):
    """
    Crear un nuevo requerimiento minero
    """
    try:
        return service.create(req_minero_mov_data)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/propiedades-mineras/{id_propiedad_minera}/req-minero-movs", response_model=ReqMineroMovOut)
def create_req_minero_mov_for_propiedad(
    id_propiedad_minera: int,
    req_minero_mov_data: ReqMineroMovCreate,
    service: ReqMineroMovService = Depends(get_req_minero_mov_service)
):
    """
    Crear un nuevo requerimiento minero para una propiedad específica
    Automáticamente asigna el IdPropiedadMinera y extrae el IdTransaccion
    """
    try:
        # Asignar automáticamente el IdPropiedadMinera
        req_minero_mov_data.IdPropiedadMinera = id_propiedad_minera
        print(f"[DEBUG] Creando requerimiento para propiedad: {id_propiedad_minera}")
        print(f"[DEBUG] Datos recibidos: {req_minero_mov_data.dict()}")
        
        return service.create(req_minero_mov_data)
    except Exception as e:
        print(f"[ERROR] Error al crear requerimiento: {str(e)}")
        print(f"[ERROR] Tipo de error: {type(e).__name__}")
        import traceback
        print(f"[ERROR] Traceback: {traceback.format_exc()}")
        raise HTTPException(status_code=400, detail=str(e))

@router.put("/req-minero-movs/{id_req_minero_mov}", response_model=ReqMineroMovOut)
def update_req_minero_mov(
    id_req_minero_mov: int,
    req_minero_mov_data: ReqMineroMovUpdate,
    service: ReqMineroMovService = Depends(get_req_minero_mov_service)
):
    """
    Actualizar un requerimiento minero existente
    """
    req_minero_mov = service.update(id_req_minero_mov, req_minero_mov_data)
    if not req_minero_mov:
        raise HTTPException(status_code=404, detail="Requerimiento minero no encontrado")
    return req_minero_mov

@router.delete("/req-minero-movs/{id_req_minero_mov}")
def delete_req_minero_mov(
    id_req_minero_mov: int,
    service: ReqMineroMovService = Depends(get_req_minero_mov_service)
):
    """
    Eliminar un requerimiento minero
    """
    success = service.delete(id_req_minero_mov)
    if not success:
        raise HTTPException(status_code=404, detail="Requerimiento minero no encontrado")
    return {"ok": True, "message": "Requerimiento minero eliminado correctamente"}
