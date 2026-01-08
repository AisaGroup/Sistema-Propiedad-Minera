from sqlalchemy.orm import Session
from sqlalchemy import text
from datetime import datetime
from backend.repositories.req_minero_mov_repositorie import ReqMineroMovRepository
from backend.repositories.propiedad_minera_repositorie import PropiedadMineraRepositorie
from backend.schemas.req_minero_mov_schema import ReqMineroMovCreate, ReqMineroMovUpdate, ReqMineroMovFilter
from typing import List, Optional
from backend.models.req_minero_mov_model import ReqMineroMov
from backend.models.transaccion_model import Transaccion

class ReqMineroMovService:
    def __init__(self, db: Session):
        self.repository = ReqMineroMovRepository(db)
        self.propiedad_repository = PropiedadMineraRepositorie(db)
        self.db = db

    def get_all(self, skip: int = 0, limit: int = 100) -> List[ReqMineroMov]:
        return self.repository.get_all(skip, limit)

    def get_by_id(self, id_req_minero_mov: int) -> Optional[ReqMineroMov]:
        return self.repository.get_by_id(id_req_minero_mov)

    def get_by_propiedad(self, id_propiedad_minera: int, skip: int = 0, limit: int = 100) -> List[ReqMineroMov]:
        return self.repository.get_by_propiedad(id_propiedad_minera, skip, limit)

    def create(self, req_minero_mov_data: ReqMineroMovCreate) -> ReqMineroMov:
        """
        Crear un nuevo requerimiento minero y su transacción asociada.
        A diferencia de notificaciones, los requerimientos pueden tener múltiples expedientes,
        por lo que su transacción NO tiene padre (IdTransaccionPadre = 0).
        """
        print(f"[DEBUG] Creando requerimiento con datos: {req_minero_mov_data.dict()}")
        
        try:
            # PASO 1: Crear el requerimiento PRIMERO (sin IdTransaccion todavía)
            nuevo_requerimiento = self.repository.create(req_minero_mov_data)
            print(f"[DEBUG] Requerimiento creado con ID: {nuevo_requerimiento.IdReqMineroMov}")
            
            # PASO 2: Crear la transacción INDEPENDIENTE para este requerimiento (sin padre)
            id_transaccion_creada = self._crear_transaccion_para_requerimiento(
                nuevo_requerimiento.IdReqMineroMov
            )
            print(f"[DEBUG] Transacción creada con ID: {id_transaccion_creada}")
            
            # PASO 3: Actualizar el requerimiento con el IdTransaccion
            if id_transaccion_creada:
                print(f"[DEBUG] Actualizando requerimiento {nuevo_requerimiento.IdReqMineroMov} con IdTransaccion: {id_transaccion_creada}")
                
                query = text("UPDATE ReqMineroMov SET IdTransaccion = :id_transaccion WHERE IdReqMineroMov = :id_req_minero_mov")
                result = self.db.execute(query, {
                    "id_transaccion": id_transaccion_creada, 
                    "id_req_minero_mov": nuevo_requerimiento.IdReqMineroMov
                })
                self.db.commit()
                print(f"[DEBUG] Filas afectadas: {result.rowcount}")
                
                # Obtener los datos actualizados
                nuevo_requerimiento = self.repository.get_by_id(nuevo_requerimiento.IdReqMineroMov)
                print(f"[DEBUG] Requerimiento actualizado - IdTransaccion: {nuevo_requerimiento.IdTransaccion}")
            else:
                print(f"[WARNING] No se pudo crear la transacción para el requerimiento")
            
            print(f"[SUCCESS] Requerimiento completado - ID: {nuevo_requerimiento.IdReqMineroMov}, IdTransaccion: {nuevo_requerimiento.IdTransaccion}")
            return nuevo_requerimiento
            
        except Exception as e:
            print(f"[ERROR] Error general en create: {e}")
            import traceback
            print(f"[ERROR] Traceback: {traceback.format_exc()}")
            raise
    
    def _crear_transaccion_para_requerimiento(self, id_req_minero_mov: int) -> Optional[int]:
        """
        Crea un registro en Transaccion para un requerimiento minero.
        Los requerimientos tienen transacciones independientes (IdTransaccionPadre = 0)
        porque pueden relacionarse con múltiples expedientes.
        Retorna el ID de la transacción creada o None si no se pudo crear.
        """
        print(f"[DEBUG] Iniciando creación de transacción independiente para requerimiento: {id_req_minero_mov}")
        try:
            # Crear nueva transacción SIN PADRE (IdTransaccionPadre = 0)
            # Esto permite que el requerimiento tenga múltiples expedientes asociados
            nueva_transaccion = Transaccion(
                IdTransaccionPadre=0,  # Sin padre porque puede tener múltiples expedientes
                Descripcion=f"Requerimiento Minero #{id_req_minero_mov}",
                IdRegistro=id_req_minero_mov,
                Tabla="ReqMineroMov",
                AudFecha=datetime.now(),
                AudUsuario="SYSTEM"
            )
            
            print(f"[DEBUG] Objeto transacción creado: IdTransaccionPadre=0 (independiente), IdRegistro={id_req_minero_mov}")
            self.db.add(nueva_transaccion)
            self.db.commit()
            self.db.refresh(nueva_transaccion)
            
            print(f"[DEBUG] Transacción guardada exitosamente: ID={nueva_transaccion.IdTransaccion}")
            return nueva_transaccion.IdTransaccion
            
        except Exception as e:
            print(f"[ERROR] Error al crear transacción: {e}")
            import traceback
            print(f"[ERROR] Traceback: {traceback.format_exc()}")
            self.db.rollback()
            return None

    def update(self, id_req_minero_mov: int, req_minero_mov_data: ReqMineroMovUpdate) -> Optional[ReqMineroMov]:
        return self.repository.update(id_req_minero_mov, req_minero_mov_data)

    def delete(self, id_req_minero_mov: int) -> bool:
        return self.repository.delete(id_req_minero_mov)

    def get_total_count(self) -> int:
        return self.repository.get_total_count()

    def get_count_by_propiedad(self, id_propiedad_minera: int) -> int:
        return self.repository.get_count_by_propiedad(id_propiedad_minera)

    def search_with_filters(self, filters: ReqMineroMovFilter) -> dict:
        # Convertir filtros a diccionario
        filter_dict = {}
        
        if filters.IdPropiedadMinera:
            filter_dict['IdPropiedadMinera'] = filters.IdPropiedadMinera
        
        if filters.IdReqMinero:
            filter_dict['IdReqMinero'] = filters.IdReqMinero
        
        if filters.CodigoExpediente:
            filter_dict['CodigoExpediente'] = filters.CodigoExpediente
        
        if filters.Descripcion:
            filter_dict['Descripcion'] = filters.Descripcion
        
        if filters.FechaDesde:
            filter_dict['FechaDesde'] = filters.FechaDesde
        
        if filters.FechaHasta:
            filter_dict['FechaHasta'] = filters.FechaHasta
        
        print(f"[DEBUG SERVICE] Filtros procesados: {filter_dict}")
        
        # Manejar paginación
        skip = 0
        limit = 100
        
        if filters.range and len(filters.range) == 2:
            skip = filters.range[0]
            limit = filters.range[1] - filters.range[0] + 1
        
        # Buscar datos
        data = self.repository.search(filter_dict, skip, limit)
        total = self.repository.search_count(filter_dict)
        
        return {
            'data': data,
            'total': total,
            'skip': skip,
            'limit': limit
        }
