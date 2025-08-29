from sqlalchemy.orm import Session
from backend.repositories.acta_repositorie import ActaRepository
from backend.schemas.acta_schema import ActaCreate
from backend.repositories.expediente_respositorie import ExpedienteRepository
from backend.services.transaccion_service import TransaccionService
from backend.schemas.transaccion_schema import TransaccionCreate
from datetime import datetime

class ActaService:

    def get_by_transaccion_padre(self, id_transaccion_padre: int):
        return self.repository.get_by_transaccion_padre(id_transaccion_padre)

    
    
    def __init__(self, db: Session):
        self.db = db
        self.repository = ActaRepository(db)

    def get_all(self):
        return self.repository.get_all()

    def get_by_id(self, id_acta: int):
        return self.repository.get_by_id(id_acta)

    def get_by_expediente(self, id_expediente: int):
        return self.repository.get_by_expediente(id_expediente)

    def create(self, acta_data):
        # 1. Crear el acta
        acta = self.repository.create(acta_data)

        # 2. Obtener el IdTransaccion del expediente padre
        expediente_repo = ExpedienteRepository(self.db)
        expediente = expediente_repo.get_by_id(acta.IdExpediente)
        id_transaccion_padre = expediente.IdTransaccion if expediente else None

        # 3. Crear la transacción del acta
        transaccion_service = TransaccionService(self.db)
        transaccion_data = TransaccionCreate(
            IdTransaccionPadre=id_transaccion_padre,
            Descripcion="Creación de acta",
            IdRegistro=acta.IdActa,
            Tabla="Acta",
            AudFecha=datetime.utcnow()
        )
        transaccion = transaccion_service.create_transaccion(transaccion_data)

        # 4. Actualizar el acta con el IdTransaccion generado
        self.repository.update(acta.IdActa, {"IdTransaccion": transaccion.IdTransaccion})

        return acta

    def update(self, id_acta: int, acta_data: dict):
        return self.repository.update(id_acta, acta_data)

    def delete(self, id_acta: int):
        return self.repository.delete(id_acta)