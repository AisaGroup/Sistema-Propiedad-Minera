from sqlalchemy.orm import Session

from backend.repositories.resolucion_repositorie import ResolucionRepository
from backend.repositories.expediente_respositorie import ExpedienteRepository
from backend.services.transaccion_service import TransaccionService
from backend.schemas.transaccion_schema import TransaccionCreate
from datetime import datetime

class ResolucionService:
    def __init__(self, db: Session):
        self.db = db
        self.repository = ResolucionRepository()

    def get_all(self):
        return self.repository.get_all(self.db)

    def get_by_id(self, id_resolucion: int):
        return self.repository.get_by_id(self.db, id_resolucion)

    def get_by_expediente(self, id_expediente: int):
        return self.repository.get_by_expediente(self.db, id_expediente)


    def create(self, resolucion_data):
        from backend.models.resolucion_model import Resolucion
        # 1. Crear la resolución
        resolucion = self.repository.create(self.db, Resolucion(**resolucion_data))

        # 2. Obtener el IdTransaccion del expediente padre
        expediente_repo = ExpedienteRepository(self.db)
        expediente = expediente_repo.get_by_id(resolucion.IdExpediente)
        id_transaccion_padre = expediente.IdTransaccion if expediente else None

        # 3. Crear la transacción de la resolución
        transaccion_service = TransaccionService(self.db)
        transaccion_data = TransaccionCreate(
            IdTransaccionPadre=id_transaccion_padre,
            Descripcion="Creación de resolución",
            IdRegistro=resolucion.IdResolucion,
            Tabla="Resolucion",
            AudFecha=datetime.utcnow()
        )
        transaccion = transaccion_service.create_transaccion(transaccion_data)

        # 4. Actualizar la resolución con el IdTransaccion generado
        self.repository.update(self.db, resolucion.IdResolucion, {"IdTransaccion": transaccion.IdTransaccion})

        return resolucion

    def update(self, id_resolucion: int, data: dict):
        return self.repository.update(self.db, id_resolucion, data)

    def delete(self, id_resolucion: int):
        return self.repository.delete(self.db, id_resolucion)