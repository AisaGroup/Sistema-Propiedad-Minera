from fastapi import APIRouter, Depends, HTTPException, Response
from sqlalchemy.orm import Session
from backend.services.acta_service import ActaService
from backend.schemas.acta_schema import ActaRead, ActaCreate
from backend.database.connection import get_db
from typing import List
from fastapi import Query
from backend.models.alerta_model import Alerta
from backend.schemas.alerta_schema import AlertaOut
from backend.services.auth_jwt import get_current_user
from backend.services.audit_logger import AuditLogger

router = APIRouter(prefix="/actas", tags=["Actas"])


@router.get("", response_model=List[ActaRead])
def listar_actas(
    db: Session = Depends(get_db),
    response: Response = None,
    range: str = Query(None, alias="range"),
    filter: str = Query(None),
    current_user=Depends(get_current_user)
):
    service = ActaService(db)
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
                    # Buscar actas por IdTransaccionPadre (join con Transaccion)
                    items = service.get_by_transaccion_padre(id_transaccion)
                else:
                    print(f"[DEBUG] Expediente no encontrado o sin IdTransaccion")
                    items = []
        except Exception as e:
            print(f"[DEBUG] Error al parsear filter o buscar actas por transaccion: {e}")
    total = len(items)

    # Parse range param (ejemplo: '[0,9]')
    start, end = 0, total - 1
    if range:
        import json
        try:
            start, end = json.loads(range)
        except Exception:
            pass

    paginated_items = items[start:end+1]
    response.headers["Content-Range"] = f"actas {start}-{end}/{total}"
    return paginated_items

@router.get("/{id_acta}", response_model=dict)
def obtener_acta(id_acta: int, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    service = ActaService(db)
    acta = service.get_by_id(id_acta)
    if not acta:
        raise HTTPException(status_code=404, detail="Acta no encontrada")
    # Buscar alertas relacionadas por IdTransaccion del acta
    id_transaccion = getattr(acta, "IdTransaccion", None)
    alertas = []
    if id_transaccion:
        try:
            alertas_db = db.query(Alerta).filter(Alerta.IdTransaccion == id_transaccion).order_by(Alerta.idAlerta).all()
            alertas = [AlertaOut.from_orm(a).dict() for a in alertas_db]
        except Exception as e:
            print(f"[ERROR] Al procesar alertas para acta {id_acta}: {e}")
            alertas = []
    # Serializar acta usando Pydantic (from_orm para SQLAlchemy)
    from backend.schemas.acta_schema import ActaRead
    acta_data = ActaRead.from_orm(acta).dict()
    acta_data["alertas"] = alertas
    return acta_data

@router.post("", response_model=ActaRead)
def crear_acta(acta_data: ActaCreate, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    service = ActaService(db)
    acta = service.create(acta_data)
    AuditLogger(db, current_user).log_creation(
        entidad="Acta",
        entity_id=acta.IdActa,
        payload=getattr(acta_data, "model_dump", lambda: acta_data.dict())(),
    )
    return acta

@router.put("/{id_acta}", response_model=ActaRead)
def actualizar_acta(id_acta: int, acta_data: dict, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    service = ActaService(db)
    updated = service.update(id_acta, acta_data)
    if not updated:
        raise HTTPException(status_code=404, detail="Acta no encontrada")
    AuditLogger(db, current_user).log_update(
        entidad="Acta",
        entity_id=id_acta,
        changes=acta_data,
    )
    return updated

@router.delete("/{id_acta}")
def borrar_acta(id_acta: int, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    service = ActaService(db)
    deleted = service.delete(id_acta)
    if not deleted:
        raise HTTPException(status_code=404, detail="Acta no encontrada")
    AuditLogger(db, current_user).log_deletion(
        entidad="Acta",
        entity_id=id_acta,
    )
    return {"ok": True}