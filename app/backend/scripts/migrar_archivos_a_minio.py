"""
Script para migrar los archivos del disco local (FILEROUTE o backend/uploads) a MinIO.
Mantiene la misma estructura de carpetas, por lo que los Link existentes en la tabla
Archivo ("/uploads/<carpeta>/<nombre>") siguen siendo válidos sin tocar la BD.

Uso (desde app/):
    python backend/scripts/migrar_archivos_a_minio.py              # migra
    python backend/scripts/migrar_archivos_a_minio.py --dry-run    # solo muestra qué haría
    python backend/scripts/migrar_archivos_a_minio.py --verificar  # revisa que cada Archivo de la BD exista en MinIO
"""

import argparse
import mimetypes
import os
import sys
from pathlib import Path

# Agregar el directorio raíz al path
root_path = Path(__file__).parent.parent.parent
sys.path.insert(0, str(root_path))

from backend.services.storage_service import StorageService, MINIO_BUCKET


def obtener_directorio_origen() -> Path:
    fileroute = os.getenv("FILEROUTE")
    if fileroute:
        return Path(os.path.normpath(fileroute))
    return root_path / "backend" / "uploads"


def migrar_archivos(dry_run: bool):
    origen = obtener_directorio_origen()
    print("=" * 80)
    print("SCRIPT: Migrar archivos locales a MinIO")
    print(f"Origen: {origen}")
    print(f"Bucket: {MINIO_BUCKET}" + ("  (DRY RUN)" if dry_run else ""))
    print("=" * 80)

    if not origen.is_dir():
        print(f"[ERROR] El directorio de origen no existe: {origen}")
        return

    storage = StorageService()
    subidos, omitidos, errores = 0, 0, 0

    for file_path in sorted(p for p in origen.rglob("*") if p.is_file()):
        key = file_path.relative_to(origen).as_posix()
        size_local = file_path.stat().st_size

        if storage.tamanio(key) == size_local:
            omitidos += 1
            continue

        if dry_run:
            print(f"[DRY RUN] Subiría: {key} ({size_local} bytes)")
            subidos += 1
            continue

        try:
            content_type = mimetypes.guess_type(file_path.name)[0] or "application/octet-stream"
            storage.subir_desde_ruta(key, str(file_path), content_type)
            print(f"✓ {key}")
            subidos += 1
        except Exception as e:
            print(f"✗ {key}: {e}")
            errores += 1

    print("=" * 80)
    print(f"{'A subir' if dry_run else 'Subidos'}: {subidos} | Ya existentes: {omitidos} | Errores: {errores}")
    print("=" * 80)


def verificar_archivos_bd():
    from backend.database.connection import SessionLocal
    from backend.models.archivo_model import Archivo

    print("=" * 80)
    print("SCRIPT: Verificar que los archivos de la BD existan en MinIO")
    print("=" * 80)

    db = SessionLocal()
    storage = StorageService()
    faltantes = 0
    try:
        archivos = db.query(Archivo).order_by(Archivo.IdArchivo).all()
        for archivo in archivos:
            nombre = (archivo.Nombre or "").strip()
            try:
                key = StorageService.key_desde_link(archivo.Link or "", nombre)
            except ValueError:
                print(f"✗ IdArchivo {archivo.IdArchivo}: Link inválido '{archivo.Link}'")
                faltantes += 1
                continue
            if not storage.existe(key):
                print(f"✗ IdArchivo {archivo.IdArchivo}: falta '{key}'")
                faltantes += 1
        print("=" * 80)
        print(f"Archivos en BD: {len(archivos)} | Faltantes en MinIO: {faltantes}")
        print("=" * 80)
    finally:
        db.close()


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Migrar archivos locales a MinIO")
    parser.add_argument("--dry-run", action="store_true", help="No sube nada, solo lista")
    parser.add_argument("--verificar", action="store_true", help="Verifica la tabla Archivo contra MinIO")
    args = parser.parse_args()

    if args.verificar:
        verificar_archivos_bd()
    else:
        migrar_archivos(args.dry_run)
