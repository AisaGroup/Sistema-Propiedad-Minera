from sqlalchemy.orm import Session
from backend.repositories.expediente_respositorie import ExpedienteRepository
from backend.schemas.expediente_schema import ExpedienteCreate
from backend.models.tipo_expediente_model import TipoExpediente
from backend.repositories.propiedad_minera_repositorie import PropiedadMineraRepositorie
from backend.services.transaccion_service import TransaccionService
from backend.schemas.transaccion_schema import TransaccionCreate
from datetime import datetime
from fastapi import HTTPException

class ExpedienteService:
    def __init__(self, db: Session):
        self.repository = ExpedienteRepository(db)

    def get_all(self):
        return self.repository.get_all()

    def get_by_id(self, id_expediente: int):
        return self.repository.get_by_id(id_expediente)

    def create(self, expediente_data: ExpedienteCreate):
        # Si se envía IdTipoExpediente, validar que exista
        id_tipo = expediente_data.IdTipoExpediente
        if id_tipo is not None:
            tipo = self.repository.db.query(TipoExpediente).filter(TipoExpediente.IdTipoExpediente == id_tipo).first()
            if not tipo:
                raise HTTPException(status_code=400, detail="IdTipoExpediente no existe")

        # 1. Crear el expediente
        expediente = self.repository.create(expediente_data)

        # 2. Obtener el IdTransaccion del padre (Propiedad Minera)
        propiedad_repo = PropiedadMineraRepositorie(self.repository.db)
        propiedad = propiedad_repo.get_by_id(expediente.IdPropiedadMinera)
        id_transaccion_padre = propiedad.IdTransaccion if propiedad else None

        # 3. Crear la transacción del expediente
        transaccion_service = TransaccionService(self.repository.db)
        transaccion_data = TransaccionCreate(
            IdTransaccionPadre=id_transaccion_padre,
            Descripcion="Creación de expediente",
            IdRegistro=expediente.IdExpediente,
            Tabla="Expediente",
            AudFecha=datetime.utcnow()
        )
        transaccion = transaccion_service.create_transaccion(transaccion_data)

        # Actualizar expediente con el IdTransaccion generado
        self.repository.update(expediente.IdExpediente, {"IdTransaccion": transaccion.IdTransaccion})

        return expediente

    def update(self, id_expediente: int, expediente_data: dict):
        expediente = self.repository.update(id_expediente, expediente_data)
        return expediente

    def delete(self, id_expediente: int):
        return self.repository.delete(id_expediente)

    def get_by_propiedad_minera(self, id_propiedad: int):
        return self.repository.get_by_propiedad_minera(id_propiedad)