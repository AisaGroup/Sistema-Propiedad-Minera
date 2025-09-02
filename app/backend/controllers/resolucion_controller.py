from fastapi import APIRouter, Depends, HTTPException, Response, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from backend.schemas.resolucion_schema import ResolucionRead, ResolucionCreate, ResolucionUpdate
from backend.services.resolucion_service import ResolucionService
from backend.database.connection import get_db
from backend.models.alerta_model import Alerta
from backend.schemas.alerta_schema import AlertaOut

router = APIRouter(prefix="/resoluciones", tags=["Resoluciones"])


@router.get("", response_model=List[ResolucionRead])
def listar_resoluciones(
    db: Session = Depends(get_db),
    response: Response = None,
    range: str = Query(None, alias="range"),
    filter: str = Query(None)
):
    service = ResolucionService(db)
    items = service.get_all()
    print(f"[DEBUG] Param filter recibido: {filter}")
    if filter:
        import json
        try:
            filter_dict = json.loads(filter)
            print(f"[DEBUG] filter_dict: {filter_dict}")
            if 'IdExpediente' in filter_dict:
                id_expediente = int(filter_dict['IdExpediente'])
                print(f"[DEBUG] Buscando expediente con IdExpediente = {id_expediente}")
                # Buscar el expediente y su IdTransaccion
                from backend.repositories.expediente_respositorie import ExpedienteRepository
                expediente_repo = ExpedienteRepository(db)
                expediente = expediente_repo.get_by_id(id_expediente)
                if expediente and hasattr(expediente, 'IdTransaccion'):
                    id_transaccion = expediente.IdTransaccion
                    print(f"[DEBUG] IdTransaccion del expediente: {id_transaccion}")
                    # Buscar resoluciones por IdTransaccionPadre (join con Transaccion)
                    from sqlalchemy.orm import aliased
                    from backend.models.resolucion_model import Resolucion
                    from backend.models.transaccion_model import Transaccion
                    query = db.query(Resolucion).join(Transaccion, Resolucion.IdTransaccion == Transaccion.IdTransaccion).filter(Transaccion.IdTransaccionPadre == id_transaccion)
                    items = query.order_by(Resolucion.IdResolucion).all()
                else:
                    print(f"[DEBUG] Expediente no encontrado o sin IdTransaccion")
                    items = []
        except Exception as e:
            print(f"[DEBUG] Error al parsear filter o buscar resoluciones por transaccion: {e}")
    total = len(items)
    # Paginación
    start, end = 0, total - 1
    if range:
        import json
        try:
            start, end = json.loads(range)
        except Exception:
            pass
    paginated_items = items[start:end+1]
    response.headers["Content-Range"] = f"resoluciones {start}-{end}/{total}"
    return paginated_items

@router.get("/{id_resolucion}", response_model=dict)
def obtener_resolucion(id_resolucion: int, db: Session = Depends(get_db)):
    service = ResolucionService(db)
    resolucion = service.get_by_id(id_resolucion)
    if not resolucion:
        raise HTTPException(status_code=404, detail="Resolución no encontrada")
    # Buscar alertas relacionadas por IdTransaccion de la resolución
    id_transaccion = getattr(resolucion, "IdTransaccion", None)
    alertas = []
    if id_transaccion:
        try:
            alertas_db = db.query(Alerta).filter(Alerta.IdTransaccion == id_transaccion).order_by(Alerta.idAlerta).all()
            alertas = [AlertaOut.from_orm(a).dict() for a in alertas_db]
        except Exception as e:
            print(f"[ERROR] Al procesar alertas para resolucion {id_resolucion}: {e}")
            alertas = []
    # Serializar resolución usando Pydantic (from_orm para SQLAlchemy)
    from backend.schemas.resolucion_schema import ResolucionRead
    resolucion_data = ResolucionRead.from_orm(resolucion).dict()
    resolucion_data["alertas"] = alertas
    return resolucion_data

@router.post("", response_model=ResolucionRead)
def crear_resolucion(resolucion_data: ResolucionCreate, db: Session = Depends(get_db)):
    service = ResolucionService(db)
    return service.create(resolucion_data.dict())

@router.put("/{id_resolucion}", response_model=ResolucionRead)
def actualizar_resolucion(id_resolucion: int, resolucion_data: ResolucionUpdate, db: Session = Depends(get_db)):
    service = ResolucionService(db)
    updated = service.update(id_resolucion, resolucion_data.dict(exclude_unset=True))
    if not updated:
        raise HTTPException(status_code=404, detail="Resolución no encontrada")
    return updated

@router.delete("/{id_resolucion}")
def borrar_resolucion(id_resolucion: int, db: Session = Depends(get_db)):
    service = ResolucionService(db)
    deleted = service.delete(id_resolucion)
    if not deleted:
        raise HTTPException(status_code=404, detail="Resolución no encontrada")
    return {"ok": True}