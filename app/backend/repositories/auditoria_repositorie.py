from sqlalchemy.orm import Session
from backend.models.auditoria_model import Auditoria
from backend.models.usuario_model import Usuario
from backend.schemas.auditoria_schema import AuditoriaCreate, AuditoriaUpdate
from typing import List, Optional, Dict, Any

class AuditoriaRepositorie:
    def __init__(self, db: Session):
        self.db = db

    def get(self, id_auditoria: int) -> Optional[Dict[str, Any]]:
        query = (
            self.db.query(
                Auditoria,
                Usuario.NombreCompleto.label("UsuarioNombre")
            )
            .outerjoin(Usuario, Auditoria.AudUsuario == Usuario.IdUsuario)
            .filter(Auditoria.IdAuditoria == id_auditoria)
        )
        result = query.first()
        if not result:
            return None
        aud, nombre = result
        return {
            "IdAuditoria": aud.IdAuditoria,
            "Accion": aud.Accion,
            "Entidad": aud.Entidad,
            "Descripcion": aud.Descripcion,
            "AudFecha": aud.AudFecha,
            "AudUsuario": aud.AudUsuario,
            "UsuarioNombre": nombre if nombre else None
        }

    def get_all(self, skip: int = 0, limit: int = 100) -> List[Dict[str, Any]]:
        """
        Retorna las auditorias con los nombres joined desde la tabla Usuario.
        Retorna los resultados en formato dict.
        """
        query = (
            self.db.query(
                Auditoria,
                Usuario.NombreCompleto.label('UsuarioNombre')
            )
            .outerjoin(Usuario, Auditoria.AudUsuario == Usuario.IdUsuario)
            .order_by(Auditoria.AudFecha.desc())
        )
        if skip:
            query = query.offset(skip)
        if limit:
            query = query.limit(limit)
        
        results = query.all()
        # Convierte a formato dict con UsuarioNombre incluido y devuelve una lista de diccionarios
        return [
            {
                'IdAuditoria': aud.IdAuditoria,
                'Accion': aud.Accion,
                'Entidad': aud.Entidad,
                'Descripcion': aud.Descripcion,
                'AudFecha': aud.AudFecha,
                'AudUsuario': aud.AudUsuario,
                'UsuarioNombre': nombre if nombre else None
            }
            for aud, nombre in results
        ]

    def create(self, auditoria: AuditoriaCreate) -> Auditoria:
        db_obj = Auditoria(**auditoria.model_dump())
        self.db.add(db_obj)
        self.db.commit()
        self.db.refresh(db_obj)
        return db_obj

    def update(self, id_auditoria: int, auditoria: AuditoriaUpdate) -> Optional[Auditoria]:
        db_obj = self.get(id_auditoria)
        if not db_obj:
            return None
        for field, value in auditoria.model_dump(exclude_unset=True).items():
            setattr(db_obj, field, value)
        self.db.commit()
        self.db.refresh(db_obj)
        return db_obj

    def delete(self, id_auditoria: int) -> bool:
        db_obj = self.get(id_auditoria)
        if not db_obj:
            return False
        self.db.delete(db_obj)
        self.db.commit()
        return True
