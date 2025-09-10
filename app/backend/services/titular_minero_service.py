from sqlalchemy.orm import Session
from backend.repositories.titular_minero_repositorie import TitularMineroRepository
from backend.repositories.transaccion_repositorie import TransaccionRepositorie
from backend.schemas.titular_minero_schema import TitularMineroCreate
from backend.schemas.transaccion_schema import TransaccionCreate
from datetime import datetime

class TitularMineroService:
    def __init__(self, db: Session):
        self.repository = TitularMineroRepository(db)
        self.transaccion_repository = TransaccionRepositorie(db)

    def get_all(self):
        return self.repository.get_all()

    def get_by_id(self, id_titular: int):
        return self.repository.get_by_id(id_titular)

    def create(self, titular_data: TitularMineroCreate):
        # Crear una nueva transacción si no se proporciona IdTransaccion
        if not titular_data.IdTransaccion:
            # Crear transacción básica
            nueva_transaccion = TransaccionCreate(
                IdTransaccionPadre=0,
                Descripcion=f"Creación de Titular Minero: {titular_data.Nombre}",
                IdRegistro=0,  # Se actualizará después con el ID del titular creado
                Tabla="TitularMinero",
                AudFecha=datetime.now(),
                AudUsuario="SYSTEM"
            )
            
            # Crear la transacción y obtener el ID generado
            transaccion_creada = self.transaccion_repository.create(nueva_transaccion)
            titular_data.IdTransaccion = transaccion_creada.IdTransaccion
        
        # Crear el titular minero
        titular_creado = self.repository.create(titular_data)
        
        # Actualizar el IdRegistro en la transacción con el ID del titular creado
        if titular_creado and titular_data.IdTransaccion:
            self.transaccion_repository.update(
                titular_data.IdTransaccion, 
                {"IdRegistro": titular_creado.IdTitularMinero}
            )
        
        return titular_creado

    def update(self, id_titular: int, titular_data: dict):
        return self.repository.update(id_titular, titular_data)

    def delete(self, id_titular: int):
        return self.repository.delete(id_titular)