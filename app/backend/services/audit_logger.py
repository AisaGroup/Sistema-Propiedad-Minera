from __future__ import annotations

import json
import logging
from datetime import datetime
from typing import Any, Dict, Optional

from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from backend.repositories.usuario_repositorie import UsuarioRepositorie
from backend.schemas.auditoria_schema import AuditoriaCreate
from backend.services.auditoria_service import AuditoriaService

logger = logging.getLogger(__name__)


class AuditLogger:
    """Utilidad responsable para persistir los logs de auditoría en la tabla AuditoriaTest."""

    def __init__(self, db: Session, current_user: Optional[Dict[str, Any]] = None):
        self.db = db
        self.current_user = current_user or {}
        self._auditoria_service = AuditoriaService(db)

    def log(
        self,
        *,
        accion: str,
        entidad: str,
        descripcion: Any,
        aud_usuario: Optional[int] = None,
        aud_fecha: Optional[datetime] = None,
    ) -> None:
        """
        Persiste un nuevo registro de auditoría.

        Parámetros
        ----------
        accion: Verbo corto que describe la acción (e.g. CREATE, UPDATE, DELETE).
        entidad: Entidad/tabla afectada.
        descripcion: Detalles sobre el cambio. Los diccionarios serán serializados a JSON.
        aud_usuario: Opcional override para el identificador de usuario. Si no se proporciona, intentamos inferirlo del payload JWT.
        aud_fecha: Opcional override para la marca de tiempo del evento. Por defecto es utcnow.
        IdAuditoria: Opcional override para el identificador de la auditoría. Si no se proporciona, se genera automáticamente.
        """

        descripcion_str = self._serialize_descripcion(descripcion)
        usuario_id = aud_usuario or self._resolve_user_id()

        auditoria = AuditoriaCreate(
            Accion=accion[:50],
            Entidad=entidad[:100],
            Descripcion=descripcion_str[:5000],
            AudFecha=aud_fecha or datetime.utcnow(),
            AudUsuario=usuario_id,
        )
        try:
            self._auditoria_service.create_auditoria(auditoria)
        except IntegrityError as e:
            # Rollback la transacción fallida para prevenir la corrupción de la sesión
            self.db.rollback()
            # Log el error pero no fallar la operación principal
            # Esto puede ocurrir si la tabla Auditoria tiene restricciones FK
            # que no están modeladas en SQLAlchemy
            logger.warning(
                f"Fallo al crear el registro de auditoría para {accion} en {entidad}: {str(e)}. "
                "La operación principal se completó, pero el registro de auditoría no se realizó."
            )
        except Exception as e:
            # Rollback la transacción fallida para prevenir la corrupción de la sesión
            self.db.rollback()
            # Capturar cualquier otro error inesperado en el registro de auditoría
            logger.error(
                f"Error inesperado al crear el registro de auditoría para {accion} en {entidad}: {str(e)}",
                exc_info=True
            )

    def log_creation(
        self,
        entidad: str,
        entity_id: Any,
        payload: Optional[Dict[str, Any]] = None,
    ) -> None:
        self.log(
            accion="CREATE",
            entidad=entidad,
            descripcion={
                "id": entity_id,
                "data": payload or {},
            },
        )

    def log_update(
        self,
        entidad: str,
        entity_id: Any,
        changes: Optional[Dict[str, Any]] = None,
    ) -> None:
        self.log(
            accion="UPDATE",
            entidad=entidad,
            descripcion={
                "id": entity_id,
                "changes": changes or {},
            },
        )

    def log_deletion(self, entidad: str, entity_id: Any) -> None:
        self.log(
            accion="DELETE",
            entidad=entidad,
            descripcion={"id": entity_id},
        )

    def _serialize_descripcion(self, descripcion: Any) -> str:
        if isinstance(descripcion, str):
            return descripcion
        try:
            return json.dumps(descripcion, default=str, ensure_ascii=False)
        except TypeError:
            return str(descripcion)

    def _resolve_user_id(self) -> int:
        """Intenta obtener el identificador de usuario desde el payload JWT."""
        if not self.current_user:
            return 0

        # Preferir la reclamación explícita `id` si está disponible.
        user_id = self.current_user.get("id")
        if isinstance(user_id, int):
            return user_id

        username = self.current_user.get("sub")
        if not username:
            return 0

        usuario_repo = UsuarioRepositorie(self.db)
        usuario = usuario_repo.get_by_username(username)
        return getattr(usuario, "IdUsuario", 0) if usuario else 0

