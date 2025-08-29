from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form
from sqlalchemy.orm import Session
from backend.services.archivo_service import ArchivoService
from backend.schemas.archivo_schema import ArchivoCreate, ArchivoUpdate, ArchivoOut
from backend.database.connection import get_db
from typing import List, Optional
import os
from datetime import datetime
from fastapi.responses import FileResponse

router = APIRouter(prefix="/archivos", tags=["archivos"])
BASE_UPLOAD_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'uploads')
os.makedirs(BASE_UPLOAD_DIR, exist_ok=True)
# Endpoint para subir archivos físicos a subcarpetas por tipo
@router.post("/upload", response_model=ArchivoOut, status_code=status.HTTP_201_CREATED)
def upload_archivo(
    file: UploadFile = File(...),
    tipo: str = Form(...),
    IdTransaccion: Optional[int] = Form(None),
    Descripcion: Optional[str] = Form(None),
    AudUsuario: int = Form(...),
    db: Session = Depends(get_db)
):
    # Crear subcarpeta si no existe
    tipo_folder = os.path.join(BASE_UPLOAD_DIR, tipo)
    os.makedirs(tipo_folder, exist_ok=True)
    # Guardar archivo físico
    filename = f"{datetime.utcnow().strftime('%Y%m%d%H%M%S')}_{file.filename}"
    file_path = os.path.join(tipo_folder, filename)
    with open(file_path, "wb") as buffer:
        buffer.write(file.file.read())
    # Ruta relativa para la base de datos
    link = f"/uploads/{tipo}/{filename}"
    # Crear registro en la base
    archivo_data = ArchivoCreate(
        IdTransaccion=IdTransaccion,
        Descripcion=Descripcion,
        Archivo=filename,
        Link=link,
        AudFecha=datetime.utcnow(),
        AudUsuario=AudUsuario
    )
    service = ArchivoService(db)
    return service.create_archivo(archivo_data)

# Endpoint para descargar archivos físicos
@router.get("/download/{tipo}/{filename}")
def download_archivo(tipo: str, filename: str):
    file_path = os.path.join(BASE_UPLOAD_DIR, tipo, filename)
    if not os.path.isfile(file_path):
        raise HTTPException(status_code=404, detail="Archivo no encontrado")
    return FileResponse(file_path, media_type='application/octet-stream', filename=filename)



@router.get("/", response_model=List[ArchivoOut])
def list_archivos(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    service = ArchivoService(db)
    return service.get_archivos(skip, limit)

@router.get("/{id_archivo}", response_model=ArchivoOut)
def get_archivo(id_archivo: int, db: Session = Depends(get_db)):
    service = ArchivoService(db)
    archivo = service.get_archivo(id_archivo)
    if not archivo:
        raise HTTPException(status_code=404, detail="Archivo no encontrado")
    return archivo

@router.post("/", response_model=ArchivoOut, status_code=status.HTTP_201_CREATED)
def create_archivo(archivo: ArchivoCreate, db: Session = Depends(get_db)):
    service = ArchivoService(db)
    return service.create_archivo(archivo)

@router.put("/{id_archivo}", response_model=ArchivoOut)
def update_archivo(id_archivo: int, archivo: ArchivoUpdate, db: Session = Depends(get_db)):
    service = ArchivoService(db)
    updated = service.update_archivo(id_archivo, archivo)
    if not updated:
        raise HTTPException(status_code=404, detail="Archivo no encontrado")
    return updated

@router.delete("/{id_archivo}", status_code=status.HTTP_204_NO_CONTENT)
def delete_archivo(id_archivo: int, db: Session = Depends(get_db)):
    service = ArchivoService(db)
    deleted = service.delete_archivo(id_archivo)
    if not deleted:
        raise HTTPException(status_code=404, detail="Archivo no encontrado")
    return None
