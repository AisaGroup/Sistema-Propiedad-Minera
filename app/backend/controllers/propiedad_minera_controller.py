from fastapi import APIRouter, Depends, HTTPException, Response
from sqlalchemy.orm import Session
from backend.services.propiedad_minera_service import PropiedadMineraService
from backend.schemas.propiedad_minera_schema import PropiedadMineraRead, PropiedadMineraCreate
from backend.database.connection import get_db
from typing import List
from fastapi import Query, APIRouter, Request
import json
from sqlalchemy import or_, func
from sqlalchemy.dialects.postgresql import UUID
from backend.models.expediente_model import Expediente
from sqlalchemy import or_, func, String as SAString
from backend.models.expediente_model import Expediente
from backend.services.auth_jwt import get_current_user, require_role
from backend.services.audit_logger import AuditLogger

router = APIRouter(prefix="/propiedades-mineras", tags=["Propiedades Mineras"])

@router.get("", response_model=List[PropiedadMineraRead])
def listar_propiedades(
    db: Session = Depends(get_db),
    response: Response = None,
    range: str = Query(None, alias="range"),
    filter: str = Query(None)
):
    service = PropiedadMineraService(db)
    filters = {}
    if filter:
        filters_json = json.loads(filter)
        if "Nombre" in filters_json:
            filters["nombre"] = filters_json["Nombre"]
        if "Provincia" in filters_json:
            filters["provincia"] = filters_json["Provincia"]
        if "IdTitular" in filters_json:
            try:
                filters["id_titular"] = int(filters_json["IdTitular"])
            except Exception:
                pass
        if "Expediente" in filters_json:
            filters["expediente"] = filters_json["Expediente"]
    start, end = 0, 9
    if range:
        try:
            start, end = json.loads(range)
        except Exception:
            pass
    limit = end - start + 1
    items, total = service.get_filtered_paginated(filters, offset=start, limit=limit)
    response.headers["Content-Range"] = f"propiedades-mineras {start}-{start+len(items)-1}/{total}"
    return items

@router.get("/{id_propiedad}", response_model=PropiedadMineraRead)
def obtener_propiedad(id_propiedad: int, db: Session = Depends(get_db)):
    service = PropiedadMineraService(db)
    propiedad = service.get_by_id(id_propiedad)
    if not propiedad:
        raise HTTPException(status_code=404, detail="Propiedad no encontrada")
    return propiedad


@router.post("/", response_model=PropiedadMineraRead)
def crear_propiedad(
    propiedad_data: PropiedadMineraCreate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    service = PropiedadMineraService(db)
    try:
        propiedad = service.create(propiedad_data)
        AuditLogger(db, current_user).log_creation(
            entidad="PropiedadMinera",
            entity_id=propiedad.IdPropiedadMinera,
            payload=propiedad_data.model_dump(),
        )
        return propiedad
    except ValueError as e:
        from fastapi import HTTPException
        raise HTTPException(status_code=400, detail=str(e))


@router.put("/{id_propiedad}", response_model=PropiedadMineraRead)
def actualizar_propiedad(
    id_propiedad: int,
    propiedad_data: dict,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    service = PropiedadMineraService(db)
    try:
        updated = service.update(id_propiedad, propiedad_data)
        if not updated:
            raise HTTPException(status_code=404, detail="Propiedad no encontrada")
        AuditLogger(db, current_user).log_update(
            entidad="PropiedadMinera",
            entity_id=id_propiedad,
            changes=propiedad_data,
        )
        return updated
    except ValueError as e:
        from fastapi import HTTPException
        raise HTTPException(status_code=400, detail=str(e))


@router.delete("/{id_propiedad}")
def borrar_propiedad(
    id_propiedad: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    service = PropiedadMineraService(db)
    deleted = service.delete(id_propiedad)
    if not deleted:
        raise HTTPException(status_code=404, detail="Propiedad no encontrada")
    AuditLogger(db, current_user).log_deletion(
        entidad="PropiedadMinera",
        entity_id=id_propiedad,
    )
    return {"ok": True}