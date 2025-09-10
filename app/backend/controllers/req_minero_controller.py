from fastapi import APIRouter, Depends, HTTPException, Query, Path
from sqlalchemy.orm import Session
from backend.database.connection import get_db
from backend.services.req_minero_service import ReqMineroService
from backend.schemas.req_minero_schema import ReqMinero, ReqMineroCreate, ReqMineroUpdate
from typing import List, Optional
import json

router = APIRouter()

@router.get("/req-mineros")
def get_req_mineros(
    skip: int = Query(0, ge=0, description="Número de registros a omitir"),
    limit: int = Query(100, ge=1, le=1000, description="Número máximo de registros a retornar"),
    filter: Optional[str] = Query(None, description="Filtros en formato JSON"),
    range: Optional[List[int]] = Query(None, description="Rango de registros en formato [inicio, fin]"),
    db: Session = Depends(get_db)
):
    service = ReqMineroService(db)
    
    # Si se proporciona range, usarlo para skip y limit
    if range:
        skip = range[0]
        limit = range[1] - range[0] + 1
    
    # Si se proporciona filter, buscar con filtros
    if filter:
        try:
            filter_dict = json.loads(filter)
            req_mineros = service.search(filter_dict, skip, limit)
            total = service.search_count(filter_dict)
        except json.JSONDecodeError:
            raise HTTPException(status_code=400, detail="Formato de filtro inválido")
    else:
        req_mineros = service.get_all(skip, limit)
        total = service.get_count()
    
    return {"data": req_mineros, "total": total}

@router.get("/req-mineros/{id_req_minero}", response_model=ReqMinero)
def get_req_minero(
    id_req_minero: int = Path(..., description="ID del requerimiento minero"),
    db: Session = Depends(get_db)
):
    service = ReqMineroService(db)
    req_minero = service.get_by_id(id_req_minero)
    if not req_minero:
        raise HTTPException(status_code=404, detail="Requerimiento minero no encontrado")
    return req_minero

@router.get("/transacciones/{id_transaccion}/req-mineros", response_model=List[ReqMinero])
def get_req_mineros_by_transaccion(
    id_transaccion: int = Path(..., description="ID de la transacción"),
    skip: int = Query(0, ge=0, description="Número de registros a omitir"),
    limit: int = Query(100, ge=1, le=1000, description="Número máximo de registros a retornar"),
    db: Session = Depends(get_db)
):
    service = ReqMineroService(db)
    req_mineros = service.get_by_transaccion(id_transaccion, skip, limit)
    return req_mineros

@router.post("/req-mineros", response_model=ReqMinero)
def create_req_minero(
    req_minero: ReqMineroCreate,
    db: Session = Depends(get_db)
):
    service = ReqMineroService(db)
    try:
        return service.create(req_minero)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error al crear el requerimiento minero: {str(e)}")

@router.put("/req-mineros/{id_req_minero}", response_model=ReqMinero)
def update_req_minero(
    id_req_minero: int = Path(..., description="ID del requerimiento minero"),
    req_minero: ReqMineroUpdate = ...,
    db: Session = Depends(get_db)
):
    service = ReqMineroService(db)
    updated_req_minero = service.update(id_req_minero, req_minero)
    if not updated_req_minero:
        raise HTTPException(status_code=404, detail="Requerimiento minero no encontrado")
    return updated_req_minero

@router.delete("/req-mineros/{id_req_minero}")
def delete_req_minero(
    id_req_minero: int = Path(..., description="ID del requerimiento minero"),
    db: Session = Depends(get_db)
):
    service = ReqMineroService(db)
    success = service.delete(id_req_minero)
    if not success:
        raise HTTPException(status_code=404, detail="Requerimiento minero no encontrado")
    return {"ok": True, "message": "Requerimiento minero eliminado exitosamente"}
