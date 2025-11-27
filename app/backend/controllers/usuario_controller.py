from fastapi import APIRouter, Depends, HTTPException, Response, Query
from sqlalchemy.orm import Session
from backend.schemas.usuario_schema import (
    UsuarioOut,
    UsuarioCreate,
    UsuarioUpdate,
    UsuarioLogin,
)
from backend.services import usuario_service
from backend.database.connection import get_db
from typing import List
from pydantic import BaseModel
from jose import jwt
from datetime import datetime, timedelta
from fastapi import status
from backend.services.auth_jwt import get_current_user
from backend.services.auth_jwt import require_role
from backend.services.audit_logger import AuditLogger
from backend.config_jwt import SECRET_KEY, ALGORITHM, ACCESS_TOKEN_EXPIRE_MINUTES

router = APIRouter(prefix="/usuarios", tags=["Usuarios"])


def _pydantic_to_dict(model, *, exclude_none: bool = False):
    if model is None:
        return {}
    if hasattr(model, "model_dump"):
        return model.model_dump(exclude_none=exclude_none)
    if hasattr(model, "dict"):
        return model.dict(exclude_none=exclude_none)
    try:
        return dict(model)
    except TypeError:
        return {"value": model}


class CambiarPasswordRequest(BaseModel):
    password_actual: str
    password_nueva: str


class ActivarUsuarioRequest(BaseModel):
    activo: bool


@router.get("", response_model=List[UsuarioOut])
def listar_usuarios(
    db: Session = Depends(get_db),
    response: Response = None,
    range: str = Query(None, alias="range"),
    current_user=Depends(require_role("Administrador")),
):
    try:
        items = usuario_service.get_usuarios(db)
        total = len(items)
        # Parse range param (ejemplo: '[0,9]')
        start, end = 0, total - 1
        if range:
            import json

            try:
                start, end = json.loads(range)
            except Exception:
                pass
        paginated_items = items[start : end + 1]
        if response is not None:
            response.headers["Content-Range"] = f"usuarios {start}-{end}/{total}"
        return paginated_items
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/{id_usuario}", response_model=UsuarioOut)
def obtener_usuario(
    id_usuario: int,
    db: Session = Depends(get_db),
    current_user=Depends(require_role("Administrador")),
):
    try:
        usuario = usuario_service.get_usuario(db, id_usuario)
        if usuario is None:
            raise HTTPException(status_code=404, detail="Usuario no encontrado")
        return usuario
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/username/{nombre_usuario}", response_model=UsuarioOut)
def obtener_usuario_por_username(
    nombre_usuario: str,
    db: Session = Depends(get_db),
    current_user=Depends(require_role("Administrador")),
):
    try:
        usuario = usuario_service.get_usuario_by_username(db, nombre_usuario)
        if usuario is None:
            raise HTTPException(status_code=404, detail="Usuario no encontrado")
        return usuario
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("", response_model=UsuarioOut)
def crear_usuario(
    usuario: UsuarioCreate,
    db: Session = Depends(get_db),
    current_user=Depends(require_role("Administrador")),
):
    try:
        nuevo_usuario = usuario_service.create_usuario(db, usuario)
        AuditLogger(db, current_user).log_creation(
            entidad="Usuario",
            entity_id=nuevo_usuario.IdUsuario,
            payload=_pydantic_to_dict(usuario),
        )
        return nuevo_usuario
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.put("/{id_usuario}", response_model=UsuarioOut)
def actualizar_usuario(
    id_usuario: int,
    usuario: UsuarioUpdate,
    db: Session = Depends(get_db),
    current_user=Depends(require_role("Administrador")),
):
    try:
        usuario_actualizado = usuario_service.update_usuario(db, id_usuario, usuario)
        if usuario_actualizado is None:
            raise HTTPException(status_code=404, detail="Usuario no encontrado")
        AuditLogger(db, current_user).log_update(
            entidad="Usuario",
            entity_id=id_usuario,
            changes=_pydantic_to_dict(usuario, exclude_none=True),
        )
        return usuario_actualizado
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.delete("/{id_usuario}")
def eliminar_usuario(
    id_usuario: int,
    db: Session = Depends(get_db),
    current_user=Depends(require_role("Administrador")),
):
    try:
        resultado = usuario_service.delete_usuario(db, id_usuario)
        if not resultado:
            raise HTTPException(status_code=404, detail="Usuario no encontrado")
        AuditLogger(db, current_user).log_deletion(
            entidad="Usuario",
            entity_id=id_usuario,
        )
        return {"message": "Usuario eliminado correctamente"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/login")
def login_usuario(usuario_login: UsuarioLogin, db: Session = Depends(get_db)):
    try:
        usuario = usuario_service.authenticate_usuario(db, usuario_login)
        if usuario is None:
            raise HTTPException(
                status_code=401, detail="Usuario, email o contraseña incorrectos"
            )
        # Generar JWT solo con sub, rol, nombre y exp
        data = {
            "sub": usuario.NombreUsuario,
            "rol": usuario.Rol,
            "nombre": usuario.NombreCompleto,
            "id": usuario.IdUsuario,
            "exp": datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES),
        }
        access_token = jwt.encode(data, SECRET_KEY, algorithm=ALGORITHM)

        # Registrar login en el sistema de auditoría
        AuditLogger(db).log(
            accion="LOGIN",
            entidad="Usuario",
            descripcion={
                "IdUsuario": usuario.IdUsuario,
                "NombreUsuario": usuario.NombreUsuario,
                "NombreCompleto": usuario.NombreCompleto,
            },
            aud_usuario=usuario.IdUsuario,
        )

        return {
            "access_token": access_token,
            "token_type": "bearer",
            "user": {
                "nombre": usuario.NombreCompleto,
                "rol": usuario.Rol,
                "id": usuario.IdUsuario,
            },
        }
    except ValueError as e:
        raise HTTPException(status_code=400, detail=f"Error de validación: {str(e)}")
    except Exception as e:
        import traceback

        print("Error en login_usuario:", traceback.format_exc())
        # Si el error es 401, mostrar solo el mensaje simple
        if isinstance(e, HTTPException) and e.status_code == 401:
            raise HTTPException(
                status_code=401, detail="Usuario, email o contraseña incorrectos"
            )
        raise HTTPException(
            status_code=500, detail="Error interno del servidor: {str(e)}"
        )


@router.put("/{id_usuario}/cambiar-password", response_model=UsuarioOut)
def cambiar_password(
    id_usuario: int,
    request: CambiarPasswordRequest,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    try:
        usuario_actualizado = usuario_service.cambiar_password(
            db, id_usuario, request.password_actual, request.password_nueva
        )
        if usuario_actualizado is None:
            raise HTTPException(status_code=404, detail="Usuario no encontrado")
        AuditLogger(db, current_user).log_update(
            entidad="Usuario",
            entity_id=id_usuario,
            changes={"password_cambiada": True},
        )
        return usuario_actualizado
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.put("/{id_usuario}/activar", response_model=UsuarioOut)
def activar_desactivar_usuario(
    id_usuario: int,
    request: ActivarUsuarioRequest,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    try:
        usuario_actualizado = usuario_service.activar_desactivar_usuario(
            db, id_usuario, request.activo
        )
        if usuario_actualizado is None:
            raise HTTPException(status_code=404, detail="Usuario no encontrado")
        AuditLogger(db, current_user).log_update(
            entidad="Usuario",
            entity_id=id_usuario,
            changes={"Activo": request.activo},
        )
        return usuario_actualizado
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
