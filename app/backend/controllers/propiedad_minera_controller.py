from fastapi import APIRouter, Depends, HTTPException, Response
from sqlalchemy.orm import Session
from backend.services.propiedad_minera_service import PropiedadMineraService
from backend.schemas.propiedad_minera_schema import PropiedadMineraRead, PropiedadMineraCreate
from backend.database.connection import get_db
from typing import List
from fastapi import Query, APIRouter, Request
import json

router = APIRouter(prefix="/propiedades-mineras", tags=["Propiedades Mineras"])

@router.get("", response_model=List[PropiedadMineraRead])
def listar_propiedades(
    db: Session = Depends(get_db),
    response: Response = None,
    range: str = Query(None, alias="range"),
    filter: str = Query(None)
):
    service = PropiedadMineraService(db)
    items = service.get_all()

    # Procesar filtro
    if filter:
        filters = json.loads(filter)
        nombre = filters.get("Nombre")
        provincia = filters.get("Provincia")
        
        if nombre:
            items = [item for item in items if nombre.lower() in (item.Nombre or "").lower()]
        
        if provincia:
            items = [item for item in items if item.Provincia == provincia]

    total = len(items)
    start, end = 0, total - 1
    if range:
        try:
            start, end = json.loads(range)
        except Exception:
            pass

    paginated_items = items[start:end+1]
    response.headers["Content-Range"] = f"propiedades-mineras {start}-{end}/{total}"
    return paginated_items

@router.get("/{id_propiedad}", response_model=PropiedadMineraRead)
def obtener_propiedad(id_propiedad: int, db: Session = Depends(get_db)):
    service = PropiedadMineraService(db)
    propiedad = service.get_by_id(id_propiedad)
    if not propiedad:
        raise HTTPException(status_code=404, detail="Propiedad no encontrada")
    return propiedad


@router.post("/", response_model=PropiedadMineraRead)
@router.post("", response_model=PropiedadMineraRead)
def crear_propiedad(propiedad_data: PropiedadMineraCreate, db: Session = Depends(get_db)):
    service = PropiedadMineraService(db)
    return service.create(propiedad_data)


@router.put("/{id_propiedad}", response_model=PropiedadMineraRead)
def actualizar_propiedad(id_propiedad: int, propiedad_data: dict, db: Session = Depends(get_db)):
    service = PropiedadMineraService(db)
    updated = service.update(id_propiedad, propiedad_data)
    if not updated:
        raise HTTPException(status_code=404, detail="Propiedad no encontrada")
    return updated


@router.delete("/{id_propiedad}")
def borrar_propiedad(id_propiedad: int, db: Session = Depends(get_db)):
    service = PropiedadMineraService(db)
    deleted = service.delete(id_propiedad)
    if not deleted:
        raise HTTPException(status_code=404, detail="Propiedad no encontrada")
    return {"ok": True}