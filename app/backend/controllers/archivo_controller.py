from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form
from sqlalchemy.orm import Session
from backend.services.archivo_service import ArchivoService
from backend.services.expediente_service import ExpedienteService
from backend.schemas.archivo_schema import ArchivoCreate, ArchivoUpdate, ArchivoOut, ArchivosPaginatedResponse
from backend.database.connection import get_db
from typing import List, Optional
import os
from datetime import datetime
import pytz
from fastapi.responses import FileResponse
import logging
from backend.services.auth_jwt import get_current_user
from  dotenv import load_dotenv
load_dotenv()

router = APIRouter(prefix="/archivos", tags=["archivos"])
BASE_UPLOAD_DIR = os.getenv("FILEROUTE")
os.makedirs(BASE_UPLOAD_DIR, exist_ok=True)

# Endpoint genérico para subir archivos por entidad
@router.post("/upload/{entidad}/{id_entidad}", response_model=ArchivoOut, status_code=status.HTTP_201_CREATED)
def upload_archivo_entidad(
    entidad: str,
    id_entidad: int,  # SIEMPRE es IdTransaccion
    file: UploadFile = File(...),
    descripcion: Optional[str] = Form(None),
    aud_usuario: int = Form(1),
    db: Session = Depends(get_db)
):
    entidades_permitidas = ["expediente", "acta", "resolucion", "propiedad-minera", "notificacion"]
    if entidad not in entidades_permitidas:
        raise HTTPException(status_code=400, detail=f"Entidad '{entidad}' no permitida. Entidades válidas: {entidades_permitidas}")
    try:
        if entidad == "expediente":
            from backend.models.expediente_model import Expediente
            expediente = db.query(Expediente).filter_by(IdTransaccion=id_entidad).first()
            if not expediente:
                raise HTTPException(status_code=404, detail="Expediente no encontrado para ese IdTransaccion")
            return _upload_archivo_expediente(expediente.IdTransaccion, file, descripcion, aud_usuario, db, expediente.CodigoExpediente)
        elif entidad == "acta":
            from backend.models.acta_model import Acta
            acta = db.query(Acta).filter_by(IdTransaccion=id_entidad).first()
            if not acta:
                raise HTTPException(status_code=404, detail="Acta no encontrada para ese IdTransaccion")
            return _upload_archivo_acta(acta.IdTransaccion, file, descripcion, aud_usuario, db, acta.Descripcion)
        elif entidad == "resolucion":
            from backend.models.resolucion_model import Resolucion
            resolucion = db.query(Resolucion).filter_by(IdTransaccion=id_entidad).first()
            if not resolucion:
                raise HTTPException(status_code=404, detail="Resolución no encontrada para ese IdTransaccion")
            return _upload_archivo_resolucion(resolucion.IdTransaccion, file, descripcion, aud_usuario, db, resolucion.Titulo)
        elif entidad == "propiedad-minera":
            from backend.models.propiedad_minera_model import PropiedadMinera
            propiedad = db.query(PropiedadMinera).filter_by(IdTransaccion=id_entidad).first()
            if not propiedad:
                raise HTTPException(status_code=404, detail="Propiedad minera no encontrada para ese IdTransaccion")
            return _upload_archivo_propiedad_minera(propiedad.IdTransaccion, file, descripcion, aud_usuario, db, propiedad.Nombre)
        elif entidad == "notificacion":
            try:
                from backend.models.notificacion_model import Notificacion
                print(f"[DEBUG] Buscando notificación con IdTransaccion: {id_entidad}")
                notificacion = db.query(Notificacion).filter_by(IdTransaccion=id_entidad).first()
                print(f"[DEBUG] Notificación encontrada: {notificacion}")
                if not notificacion:
                    print(f"[DEBUG] No se encontró notificación con IdTransaccion: {id_entidad}")
                    raise HTTPException(status_code=404, detail="Notificación no encontrada para ese IdTransaccion")
                print(f"[DEBUG] CodExp de la notificación: {notificacion.CodExp}")
                return _upload_archivo_notificacion(notificacion.IdTransaccion, file, descripcion, aud_usuario, db, notificacion.CodExp)
            except Exception as e:
                print(f"[ERROR] Error en notificacion: {str(e)}")
                print(f"[ERROR] Tipo de error: {type(e)}")
                raise HTTPException(status_code=500, detail=f"Error al procesar notificación: {str(e)}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error al subir archivo: {str(e)}")

def _upload_archivo_resolucion(id_transaccion: int, file: UploadFile, descripcion: Optional[str], aud_usuario: int, db: Session, titulo_resolucion: Optional[str]):
    archivo_service = ArchivoService(db)
    resolucion_folder = os.path.join(BASE_UPLOAD_DIR, "resoluciones")
    os.makedirs(resolucion_folder, exist_ok=True)
    descripcion_r = (titulo_resolucion or "RESOLUCION").replace(" ", "_")
    file_extension = os.path.splitext(file.filename)[1] if file.filename else ""
    original_name_without_ext = os.path.splitext(file.filename)[0] if file.filename else "archivo"
    temp_nombre = f"{descripcion_r}_{original_name_without_ext}{file_extension}"

    temp_file_path = os.path.join(resolucion_folder, temp_nombre)
    with open(temp_file_path, "wb") as buffer:
        buffer.write(file.file.read())

    try:
        argentina_tz = pytz.timezone('America/Argentina/San_Juan')
        fecha_local = datetime.now(argentina_tz)
        archivo_data = ArchivoCreate(
            IdTransaccion=id_transaccion,
            Nombre=temp_nombre,
            Descripcion=descripcion,
            Tipo="resolucion",
            Link="/uploads/resoluciones/",
            AudFecha=fecha_local,
            AudUsuario=aud_usuario
        )
        archivo_creado = archivo_service.create_archivo(archivo_data)

        nuevo_nombre = f"{archivo_creado.IdArchivo}_{descripcion_r}_{original_name_without_ext}{file_extension}"
        if len(nuevo_nombre) > 255:
            max_name_length = 255 - len(file_extension)
            nuevo_nombre = nuevo_nombre[:max_name_length] + file_extension

        nuevo_file_path = os.path.join(resolucion_folder, nuevo_nombre)
        os.rename(temp_file_path, nuevo_file_path)

        archivo_creado.Nombre = nuevo_nombre
        archivo_creado.Link = f"/uploads/resoluciones/{nuevo_nombre}"
        db.commit()
        db.refresh(archivo_creado)

        return archivo_creado
    except Exception as e:
        if os.path.exists(temp_file_path):
            os.remove(temp_file_path)
        raise HTTPException(status_code=500, detail=f"Error al crear registro en BD: {str(e)}")

def _upload_archivo_expediente(id_transaccion: int, file: UploadFile, descripcion: Optional[str], aud_usuario: int, db: Session, codigo_expediente: Optional[str]):
    archivo_service = ArchivoService(db)
    expediente_folder = os.path.join(BASE_UPLOAD_DIR, "expedientes")
    os.makedirs(expediente_folder, exist_ok=True)
    codigo = codigo_expediente or f"EXP-{id_transaccion}"
    file_extension = os.path.splitext(file.filename)[1] if file.filename else ""
    original_name_without_ext = os.path.splitext(file.filename)[0] if file.filename else "archivo"
    temp_nombre = f"{codigo}_{original_name_without_ext}{file_extension}"
    temp_file_path = os.path.join(expediente_folder, temp_nombre)
    with open(temp_file_path, "wb") as buffer:
        buffer.write(file.file.read())
    try:
        argentina_tz = pytz.timezone('America/Argentina/San_Juan')
        fecha_local = datetime.now(argentina_tz)
        archivo_data = ArchivoCreate(
            IdTransaccion=id_transaccion,
            Nombre=temp_nombre,
            Descripcion=descripcion,
            Tipo="expediente",
            Link="/uploads/expedientes/",
            AudFecha=fecha_local,
            AudUsuario=aud_usuario
        )
        archivo_creado = archivo_service.create_archivo(archivo_data)
        nuevo_nombre = f"{archivo_creado.IdArchivo}_{codigo}_{original_name_without_ext}{file_extension}"
        if len(nuevo_nombre) > 255:
            max_name_length = 255 - len(file_extension)
            nuevo_nombre = nuevo_nombre[:max_name_length] + file_extension
        nuevo_file_path = os.path.join(expediente_folder, nuevo_nombre)
        os.rename(temp_file_path, nuevo_file_path)
        archivo_creado.Nombre = nuevo_nombre
        archivo_creado.Link = f"/uploads/expedientes/{nuevo_nombre}"
        db.commit()
        db.refresh(archivo_creado)
        return archivo_creado
    except Exception as e:
        if os.path.exists(temp_file_path):
            os.remove(temp_file_path)
        raise HTTPException(status_code=500, detail=f"Error al crear registro en BD: {str(e)}")

def _upload_archivo_acta(id_transaccion: int, file: UploadFile, descripcion: Optional[str], aud_usuario: int, db: Session, descripcion_acta: Optional[str]):
    archivo_service = ArchivoService(db)
    acta_folder = os.path.join(BASE_UPLOAD_DIR, "actas")
    os.makedirs(acta_folder, exist_ok=True)
    descripcion_a = (descripcion_acta or "ACTA").replace(" ", "_")
    file_extension = os.path.splitext(file.filename)[1] if file.filename else ""
    original_name_without_ext = os.path.splitext(file.filename)[0] if file.filename else "archivo"
    temp_nombre = f"{descripcion_a}_{original_name_without_ext}{file_extension}"
    temp_file_path = os.path.join(acta_folder, temp_nombre)
    with open(temp_file_path, "wb") as buffer:
        buffer.write(file.file.read())
    try:
        argentina_tz = pytz.timezone('America/Argentina/San_Juan')
        fecha_local = datetime.now(argentina_tz)
        archivo_data = ArchivoCreate(
            IdTransaccion=id_transaccion,
            Nombre=temp_nombre,
            Descripcion=descripcion,
            Tipo="acta",
            Link="/uploads/actas/",
            AudFecha=fecha_local,
            AudUsuario=aud_usuario
        )
        archivo_creado = archivo_service.create_archivo(archivo_data)
        nuevo_nombre = f"{archivo_creado.IdArchivo}_{descripcion_a}_{original_name_without_ext}{file_extension}"
        if len(nuevo_nombre) > 255:
            max_name_length = 255 - len(file_extension)
            nuevo_nombre = nuevo_nombre[:max_name_length] + file_extension
        nuevo_file_path = os.path.join(acta_folder, nuevo_nombre)
        os.rename(temp_file_path, nuevo_file_path)
        archivo_creado.Nombre = nuevo_nombre
        archivo_creado.Link = f"/uploads/actas/{nuevo_nombre}"
        db.commit()
        db.refresh(archivo_creado)
        return archivo_creado
    except Exception as e:
        if os.path.exists(temp_file_path):
            os.remove(temp_file_path)
        raise HTTPException(status_code=500, detail=f"Error al crear registro en BD: {str(e)}")

def _upload_archivo_propiedad_minera(id_transaccion: int, file: UploadFile, descripcion: Optional[str], aud_usuario: int, db: Session, nombre_propiedad: Optional[str]):
    archivo_service = ArchivoService(db)
    propiedad_folder = os.path.join(BASE_UPLOAD_DIR, "propiedad-minera")
    os.makedirs(propiedad_folder, exist_ok=True)
    nombre_p = (nombre_propiedad or "PROPIEDAD_MINERA").replace(" ", "_")
    file_extension = os.path.splitext(file.filename)[1] if file.filename else ""
    original_name_without_ext = os.path.splitext(file.filename)[0] if file.filename else "archivo"
    temp_nombre = f"{nombre_p}_{original_name_without_ext}{file_extension}"
    temp_file_path = os.path.join(propiedad_folder, temp_nombre)
    with open(temp_file_path, "wb") as buffer:
        buffer.write(file.file.read())
    try:
        argentina_tz = pytz.timezone('America/Argentina/San_Juan')
        fecha_local = datetime.now(argentina_tz)
        archivo_data = ArchivoCreate(
            IdTransaccion=id_transaccion,
            Nombre=temp_nombre,
            Descripcion=descripcion,
            Tipo="propiedad-minera",
            Link="/uploads/propiedad-minera/",
            AudFecha=fecha_local,
            AudUsuario=aud_usuario
        )
        archivo_creado = archivo_service.create_archivo(archivo_data)
        nuevo_nombre = f"{archivo_creado.IdArchivo}_{nombre_p}_{original_name_without_ext}{file_extension}"
        if len(nuevo_nombre) > 255:
            max_name_length = 255 - len(file_extension)
            nuevo_nombre = nuevo_nombre[:max_name_length] + file_extension
        nuevo_file_path = os.path.join(propiedad_folder, nuevo_nombre)
        os.rename(temp_file_path, nuevo_file_path)
        archivo_creado.Nombre = nuevo_nombre
        archivo_creado.Link = f"/uploads/propiedad-minera/{nuevo_nombre}"
        db.commit()
        db.refresh(archivo_creado)
        return archivo_creado
    except Exception as e:
        if os.path.exists(temp_file_path):
            os.remove(temp_file_path)
        raise HTTPException(status_code=500, detail=f"Error al crear registro en BD: {str(e)}")

def _upload_archivo_notificacion(id_transaccion: int, file: UploadFile, descripcion: Optional[str], aud_usuario: int, db: Session, cod_exp_notificacion: Optional[str]):
    print(f"[DEBUG] Iniciando upload para notificación - IdTransaccion: {id_transaccion}, CodExp: {cod_exp_notificacion}")
    archivo_service = ArchivoService(db)
    notificacion_folder = os.path.join(BASE_UPLOAD_DIR, "notificaciones")
    print(f"[DEBUG] Carpeta de notificaciones: {notificacion_folder}")
    os.makedirs(notificacion_folder, exist_ok=True)
    descripcion_n = (cod_exp_notificacion or "NOTIFICACION").replace(" ", "_")
    print(f"[DEBUG] Descripción procesada: {descripcion_n}")
    file_extension = os.path.splitext(file.filename)[1] if file.filename else ""
    original_name_without_ext = os.path.splitext(file.filename)[0] if file.filename else "archivo"
    temp_nombre = f"{descripcion_n}_{original_name_without_ext}{file_extension}"
    print(f"[DEBUG] Nombre temporal: {temp_nombre}")
    temp_file_path = os.path.join(notificacion_folder, temp_nombre)
    print(f"[DEBUG] Ruta temporal del archivo: {temp_file_path}")
    
    with open(temp_file_path, "wb") as buffer:
        buffer.write(file.file.read())
    print(f"[DEBUG] Archivo escrito temporalmente en: {temp_file_path}")
    
    try:
        argentina_tz = pytz.timezone('America/Argentina/San_Juan')
        fecha_local = datetime.now(argentina_tz)
        archivo_data = ArchivoCreate(
            IdTransaccion=id_transaccion,
            Nombre=temp_nombre,
            Descripcion=descripcion,
            Tipo="notificacion",
            Link="/uploads/notificaciones/",
            AudFecha=fecha_local,
            AudUsuario=aud_usuario
        )
        print(f"[DEBUG] Datos del archivo a crear en BD: {archivo_data}")
        archivo_creado = archivo_service.create_archivo(archivo_data)
        print(f"[DEBUG] Archivo creado en BD con ID: {archivo_creado.IdArchivo}")
        
        nuevo_nombre = f"{archivo_creado.IdArchivo}_{descripcion_n}_{original_name_without_ext}{file_extension}"
        if len(nuevo_nombre) > 255:
            max_name_length = 255 - len(file_extension)
            nuevo_nombre = nuevo_nombre[:max_name_length] + file_extension
        
        nuevo_file_path = os.path.join(notificacion_folder, nuevo_nombre)
        print(f"[DEBUG] Renombrando archivo de {temp_file_path} a {nuevo_file_path}")
        os.rename(temp_file_path, nuevo_file_path)
        print(f"[DEBUG] Archivo renombrado exitosamente")
        
        archivo_creado.Nombre = nuevo_nombre
        archivo_creado.Link = f"/uploads/notificaciones/{nuevo_nombre}"
        db.commit()
        db.refresh(archivo_creado)
        print(f"[DEBUG] Archivo guardado exitosamente: {nuevo_file_path}")
        return archivo_creado
    except Exception as e:
        if os.path.exists(temp_file_path):
            os.remove(temp_file_path)
        raise HTTPException(status_code=500, detail=f"Error al crear registro en BD: {str(e)}")

# Endpoint genérico para obtener archivos por entidad con paginación
@router.get("/{entidad}/{id_entidad}", response_model=ArchivosPaginatedResponse)
def get_archivos_entidad(
    entidad: str, 
    id_entidad: int,  # SIEMPRE es IdTransaccion
    page: int = 1, 
    limit: int = 10, 
    db: Session = Depends(get_db)
):
    entidades_permitidas = ["expediente", "acta", "resolucion", "propiedad-minera", "notificacion"]
    if entidad not in entidades_permitidas:
        raise HTTPException(status_code=400, detail=f"Entidad '{entidad}' no permitida")
    if page < 1:
        raise HTTPException(status_code=400, detail="La página debe ser mayor a 0")
    if limit < 1 or limit > 100:
        raise HTTPException(status_code=400, detail="El límite debe estar entre 1 y 100")
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
            "has_previous": page > 1
        }
    )

# Endpoint para descargar archivos
@router.get("/download")
def download_archivo(link: str, nombre: str):
    # Quitar el prefijo y barras iniciales/finales del link
    carpeta_o_archivo = link.replace("/uploads/", "").strip("/\\")
    partes = carpeta_o_archivo.split("/")
    # Si el link incluye el nombre del archivo, lo separamos
    if partes and partes[-1] == nombre:
        carpeta = "/".join(partes[:-1])
    else:
        carpeta = carpeta_o_archivo
    # Construir la ruta completa al archivo
    file_path = os.path.join(BASE_UPLOAD_DIR, carpeta, nombre)
    file_path = os.path.normpath(file_path)
    # Seguridad: evitar path traversal
    if not file_path.startswith(os.path.abspath(BASE_UPLOAD_DIR)):
        raise HTTPException(status_code=400, detail="Ruta de archivo no permitida")
    if not os.path.isfile(file_path):
        raise HTTPException(status_code=404, detail="Archivo no encontrado")
    return FileResponse(file_path, media_type='application/octet-stream', filename=nombre)

# Endpoint para actualizar archivo (por ejemplo, descripción)
from backend.schemas.archivo_schema import ArchivoUpdate

@router.put("/{id_archivo}", response_model=ArchivoOut)
def update_archivo(
    id_archivo: int,
    archivo_update: ArchivoUpdate,
    db: Session = Depends(get_db)
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