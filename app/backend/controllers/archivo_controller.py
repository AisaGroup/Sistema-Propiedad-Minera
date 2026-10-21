from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form
from sqlalchemy.orm import Session
from backend.services.archivo_service import ArchivoService
from backend.services.expediente_service import ExpedienteService
from backend.schemas.archivo_schema import (
    ArchivoCreate,
    ArchivoUpdate,
    ArchivoOut,
    ArchivosPaginatedResponse,
)
from backend.database.connection import get_db
from typing import List, Optional
import os
import mimetypes
from datetime import datetime
import pytz
from urllib.parse import quote
from fastapi.responses import StreamingResponse
import logging
from backend.services.auth_jwt import get_current_user
from backend.services.storage_service import StorageService

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/archivos", tags=["archivos"])


# Endpoint genérico para subir archivos por entidad
@router.post(
    "/upload/{entidad}/{id_entidad}",
    response_model=ArchivoOut,
    status_code=status.HTTP_201_CREATED,
)
def upload_archivo_entidad(
    entidad: str,
    id_entidad: int,  # SIEMPRE es IdTransaccion
    file: UploadFile = File(...),
    descripcion: Optional[str] = Form(None),
    aud_usuario: int = Form(1),
    db: Session = Depends(get_db),
):

    entidades_permitidas = ["expediente", "acta", "resolucion", "propiedad-minera", "notificacion", "requerimiento"]
  
    if entidad not in entidades_permitidas:
        raise HTTPException(
            status_code=400,
            detail=f"Entidad '{entidad}' no permitida. Entidades válidas: {entidades_permitidas}",
        )
    try:
        if entidad == "expediente":
            from backend.models.expediente_model import Expediente

            expediente = (
                db.query(Expediente).filter_by(IdTransaccion=id_entidad).first()
            )
            if not expediente:
                raise HTTPException(
                    status_code=404,
                    detail="Expediente no encontrado para ese IdTransaccion",
                )
            return _upload_archivo(
                expediente.IdTransaccion,
                file,
                descripcion,
                aud_usuario,
                db,
                tipo="expediente",
                carpeta="expedientes",
                prefijo=expediente.CodigoExpediente or f"EXP-{expediente.IdTransaccion}",
            )
        elif entidad == "acta":
            from backend.models.acta_model import Acta

            acta = db.query(Acta).filter_by(IdTransaccion=id_entidad).first()
            if not acta:
                raise HTTPException(
                    status_code=404, detail="Acta no encontrada para ese IdTransaccion"
                )
            return _upload_archivo(
                acta.IdTransaccion,
                file,
                descripcion,
                aud_usuario,
                db,
                tipo="acta",
                carpeta="actas",
                prefijo=(acta.Descripcion or "ACTA").replace(" ", "_"),
            )
        elif entidad == "resolucion":
            from backend.models.resolucion_model import Resolucion

            resolucion = (
                db.query(Resolucion).filter_by(IdTransaccion=id_entidad).first()
            )
            if not resolucion:
                raise HTTPException(
                    status_code=404,
                    detail="Resolución no encontrada para ese IdTransaccion",
                )
            return _upload_archivo(
                resolucion.IdTransaccion,
                file,
                descripcion,
                aud_usuario,
                db,
                tipo="resolucion",
                carpeta="resoluciones",
                prefijo=(resolucion.Titulo or "RESOLUCION").replace(" ", "_"),
            )
        elif entidad == "propiedad-minera":
            from backend.models.propiedad_minera_model import PropiedadMinera

            propiedad = (
                db.query(PropiedadMinera).filter_by(IdTransaccion=id_entidad).first()
            )
            if not propiedad:
                raise HTTPException(
                    status_code=404,
                    detail="Propiedad minera no encontrada para ese IdTransaccion",
                )
            return _upload_archivo(
                propiedad.IdTransaccion,
                file,
                descripcion,
                aud_usuario,
                db,
                tipo="propiedad-minera",
                carpeta="propiedad-minera",
                prefijo=(propiedad.Nombre or "PROPIEDAD_MINERA").replace(" ", "_"),
            )
        elif entidad == "notificacion":
            try:
                from backend.models.notificacion_model import Notificacion

                print(f"[DEBUG] Buscando notificación con IdTransaccion: {id_entidad}")
                notificacion = (
                    db.query(Notificacion).filter_by(IdTransaccion=id_entidad).first()
                )
                print(f"[DEBUG] Notificación encontrada: {notificacion}")
                if not notificacion:
                    print(
                        f"[DEBUG] No se encontró notificación con IdTransaccion: {id_entidad}"
                    )
                    raise HTTPException(
                        status_code=404,
                        detail="Notificación no encontrada para ese IdTransaccion",
                    )
                print(f"[DEBUG] CodExp de la notificación: {notificacion.CodExp}")
                return _upload_archivo(
                    notificacion.IdTransaccion,
                    file,
                    descripcion,
                    aud_usuario,
                    db,
                    tipo="notificacion",
                    carpeta="notificaciones",
                    prefijo=(notificacion.CodExp or "NOTIFICACION").replace(" ", "_"),
                )
            except Exception as e:
                print(f"[ERROR] Error en notificacion: {str(e)}")
                print(f"[ERROR] Tipo de error: {type(e)}")
                
                raise HTTPException(status_code=500, detail=f"Error al procesar notificación: {str(e)}")
        elif entidad == "requerimiento":
            try:
                from backend.models.req_minero_mov_model import ReqMineroMov
                print(f"[DEBUG] Buscando requerimiento con IdTransaccion: {id_entidad}")
                requerimiento = db.query(ReqMineroMov).filter_by(IdTransaccion=id_entidad).first()
                print(f"[DEBUG] Requerimiento encontrado: {requerimiento}")
                if not requerimiento:
                    print(f"[DEBUG] No se encontró requerimiento con IdTransaccion: {id_entidad}")
                    raise HTTPException(status_code=404, detail="Requerimiento no encontrado para ese IdTransaccion")
                print(f"[DEBUG] IdReqMineroMov del requerimiento: {requerimiento.IdReqMineroMov}")
                return _upload_archivo(
                    requerimiento.IdTransaccion,
                    file,
                    descripcion,
                    aud_usuario,
                    db,
                    tipo="requerimiento",
                    carpeta="requerimientos",
                    prefijo=f"REQ_{requerimiento.IdReqMineroMov}",
                )
            except Exception as e:
                print(f"[ERROR] Error en requerimiento: {str(e)}")
                print(f"[ERROR] Tipo de error: {type(e)}")
                raise HTTPException(status_code=500, detail=f"Error al procesar requerimiento: {str(e)}")

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error al subir archivo: {str(e)}")


def _upload_archivo(
    id_transaccion: int,
    file: UploadFile,
    descripcion: Optional[str],
    aud_usuario: int,
    db: Session,
    tipo: str,
    carpeta: str,
    prefijo: str,
):
    """
    Registra el archivo en BD y lo sube a MinIO bajo la clave "<carpeta>/<IdArchivo>_<prefijo>_<nombre>".
    El Link guardado en BD mantiene el formato histórico "/uploads/<carpeta>/<nombre>".
    """
    archivo_service = ArchivoService(db)
    storage = StorageService()
    file_extension = os.path.splitext(file.filename)[1] if file.filename else ""
    original_name_without_ext = (
        os.path.splitext(file.filename)[0] if file.filename else "archivo"
    )
    temp_nombre = f"{prefijo}_{original_name_without_ext}{file_extension}"

    try:
        argentina_tz = pytz.timezone("America/Argentina/San_Juan")
        fecha_local = datetime.now(argentina_tz)
        archivo_data = ArchivoCreate(
            IdTransaccion=id_transaccion,
            Nombre=temp_nombre,
            Descripcion=descripcion,
            Tipo=tipo,
            Link=f"/uploads/{carpeta}/",
            AudFecha=fecha_local,
            AudUsuario=aud_usuario,
        )
        archivo_creado = archivo_service.create_archivo(archivo_data)
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Error al crear registro en BD: {str(e)}"
        )

    nuevo_nombre = f"{archivo_creado.IdArchivo}_{prefijo}_{original_name_without_ext}{file_extension}"
    # Las barras romperían la clave del objeto en MinIO
    nuevo_nombre = nuevo_nombre.replace("/", "_").replace("\\", "_")
    if len(nuevo_nombre) > 255:
        max_name_length = 255 - len(file_extension)
        nuevo_nombre = nuevo_nombre[:max_name_length] + file_extension

    key = StorageService.build_key(carpeta, nuevo_nombre)
    content_type = (
        file.content_type
        or mimetypes.guess_type(nuevo_nombre)[0]
        or "application/octet-stream"
    )
    try:
        storage.subir(key, file.file, content_type)
    except Exception as e:
        # Sin archivo en MinIO el registro no sirve: se revierte
        archivo_service.delete_archivo(archivo_creado.IdArchivo)
        logger.error(f"Error al subir '{key}' a MinIO: {e}")
        raise HTTPException(
            status_code=500, detail=f"Error al guardar el archivo en el almacenamiento: {str(e)}"
        )

    archivo_creado.Nombre = nuevo_nombre
    archivo_creado.Link = StorageService.build_link(key)
    db.commit()
    db.refresh(archivo_creado)
    return archivo_creado


# Endpoint genérico para obtener archivos por entidad con paginación
@router.get("/{entidad}/{id_entidad}", response_model=ArchivosPaginatedResponse)
def get_archivos_entidad(
    entidad: str,
    id_entidad: int,  # SIEMPRE es IdTransaccion
    page: int = 1,
    limit: int = 10,
    db: Session = Depends(get_db),
):

    entidades_permitidas = ["expediente", "acta", "resolucion", "propiedad-minera", "notificacion", "requerimiento"]

    if entidad not in entidades_permitidas:
        raise HTTPException(status_code=400, detail=f"Entidad '{entidad}' no permitida")
    if page < 1:
        raise HTTPException(status_code=400, detail="La página debe ser mayor a 0")
    if limit < 1 or limit > 100:
        raise HTTPException(
            status_code=400, detail="El límite debe estar entre 1 y 100"
        )
    archivo_service = ArchivoService(db)
    skip = (page - 1) * limit
    # Buscar archivos por IdTransaccion y tipo
    archivos = archivo_service.get_archivos_by_transaccion_and_tipo_paginated(
        id_entidad, entidad, skip, limit
    )
    total_archivos = archivo_service.count_archivos_by_transaccion_and_tipo(
        id_entidad, entidad
    )
    total_pages = (total_archivos + limit - 1) // limit
    return ArchivosPaginatedResponse(
        archivos=[ArchivoOut.model_validate(archivo) for archivo in archivos],
        pagination={
            "current_page": page,
            "total_pages": total_pages,
            "total_items": total_archivos,
            "items_per_page": limit,
            "has_next": page < total_pages,
            "has_previous": page > 1,
        },
    )


def _content_disposition(disposition: str, nombre: str) -> str:
    # Igual que FileResponse: nombres no ASCII van codificados según RFC 5987
    nombre_quoted = quote(nombre)
    if nombre_quoted != nombre:
        return f"{disposition}; filename*=utf-8''{nombre_quoted}"
    return f'{disposition}; filename="{nombre}"'


def _stream_archivo(link: str, nombre: str, media_type: str, disposition: str):
    try:
        key = StorageService.key_desde_link(link, nombre)
    except ValueError:
        raise HTTPException(status_code=400, detail="Ruta de archivo no permitida")
    storage = StorageService()
    size = storage.tamanio(key)
    if size is None:
        raise HTTPException(status_code=404, detail="Archivo no encontrado")
    return StreamingResponse(
        storage.stream(key),
        media_type=media_type,
        headers={
            "Content-Disposition": _content_disposition(disposition, nombre),
            "Content-Length": str(size),
        },
    )


# Endpoint para descargar archivos
@router.get("/download")
def download_archivo(link: str, nombre: str):
    return _stream_archivo(link, nombre, "application/octet-stream", "attachment")


# Endpoint para previsualizar archivos
@router.get("/preview")
def preview_archivo(link: str, nombre: str):
    # Determinar el Content-Type basado en la extensión del archivo
    content_type, _ = mimetypes.guess_type(nombre)
    if content_type is None:
        content_type = "application/octet-stream"
    # Content-Disposition: inline para que se muestre en el navegador
    return _stream_archivo(link, nombre, content_type, "inline")


# Endpoint para actualizar archivo (por ejemplo, descripción)
from backend.schemas.archivo_schema import ArchivoUpdate


@router.put("/{id_archivo}", response_model=ArchivoOut)
def update_archivo(
    id_archivo: int, archivo_update: ArchivoUpdate, db: Session = Depends(get_db)
):
    archivo_service = ArchivoService(db)
    archivo_actualizado = archivo_service.update_archivo(id_archivo, archivo_update)
    if not archivo_actualizado:
        raise HTTPException(status_code=404, detail="Archivo no encontrado")
    return archivo_actualizado


# Endpoints básicos de CRUD
@router.get("/", response_model=List[ArchivoOut])
def list_archivos(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    service = ArchivoService(db)
    return service.get_archivos(skip, limit)


@router.get("/by-id/{id_archivo}", response_model=ArchivoOut)
def get_archivo(id_archivo: int, db: Session = Depends(get_db)):
    service = ArchivoService(db)
    archivo = service.get_archivo(id_archivo)
    if not archivo:
        raise HTTPException(status_code=404, detail="Archivo no encontrado")
    return archivo


@router.delete("/{id_archivo}", status_code=status.HTTP_204_NO_CONTENT)
def delete_archivo(id_archivo: int, db: Session = Depends(get_db)):
    service = ArchivoService(db)
    deleted = service.delete_archivo(id_archivo)
    if not deleted:
        raise HTTPException(status_code=404, detail="Archivo no encontrado")
    return None
