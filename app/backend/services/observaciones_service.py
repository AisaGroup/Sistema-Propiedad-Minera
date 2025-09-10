from backend.repositories.observaciones_repositorie import ObservacionesRepository
from backend.schemas.observaciones_schema import ObservacionesCreate, ObservacionesUpdate
from sqlalchemy.orm import Session
from datetime import datetime

class ObservacionesService:
    def __init__(self, db: Session):
        self.repo = ObservacionesRepository(db)

    def get_observacion(self, id_transaccion: int):
        return self.repo.get_by_id(id_transaccion)

    def create_observacion(self, observacion: ObservacionesCreate):
        # Validar y limpiar datos antes de crear
        if not observacion.Descripcion or len(observacion.Descripcion.strip()) == 0:
            raise ValueError("La descripción es requerida")
        
        # Verificar que no se estén enviando datos de error
        if any(keyword in observacion.Descripcion for keyword in ["ERROR", "XMLHttpRequest", "CORS", "TypeError"]):
            raise ValueError("Datos inválidos detectados")
        
        # Limitar longitud de descripción (el modelo permite 200 caracteres)
        if len(observacion.Descripcion) > 200:
            observacion.Descripcion = observacion.Descripcion[:197] + "..."
        
        # Establecer valores por defecto para auditoría
        if not observacion.AudFecha:
            observacion.AudFecha = datetime.now()
        
        return self.repo.create(observacion)

    def update_observacion(self, id_transaccion: int, observacion: ObservacionesUpdate):
        return self.repo.update(id_transaccion, observacion)

    def delete_observacion(self, id_transaccion: int):
        return self.repo.delete(id_transaccion)

    def get_all_observaciones(self):
        return self.repo.get_all()

    def get_observaciones_by_transaccion(self, id_transaccion: int):
        return self.repo.get_all_by_transaccion(id_transaccion)
