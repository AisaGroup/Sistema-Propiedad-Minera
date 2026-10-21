import os
from typing import BinaryIO, Iterator, Optional

from dotenv import load_dotenv
from minio import Minio
from minio.error import S3Error

# Cargar variables de entorno desde app/.env (igual que database/connection.py)
load_dotenv(dotenv_path=os.path.join(os.path.dirname(os.path.dirname(__file__)), '..', '.env'))

MINIO_ENDPOINT = os.getenv('MINIO_ENDPOINT', 'localhost:9002')
MINIO_ACCESS_KEY = os.getenv('MINIO_ACCESS_KEY')
MINIO_SECRET_KEY = os.getenv('MINIO_SECRET_KEY')
MINIO_BUCKET = os.getenv('MINIO_BUCKET', 'propiedad-minera')
MINIO_SECURE = os.getenv('MINIO_SECURE', 'false').lower() == 'true'

# Prefijo histórico guardado en Archivo.Link (ej: "/uploads/actas/12_ACTA.pdf")
LINK_PREFIX = '/uploads/'


class StorageService:
    """Acceso al almacenamiento de objetos (MinIO, compatible con S3)."""

    _client: Optional[Minio] = None
    _bucket_verificado = False

    def __init__(self):
        if StorageService._client is None:
            StorageService._client = Minio(
                MINIO_ENDPOINT,
                access_key=MINIO_ACCESS_KEY,
                secret_key=MINIO_SECRET_KEY,
                secure=MINIO_SECURE,
            )
        self.client = StorageService._client
        self.bucket = MINIO_BUCKET
        self._asegurar_bucket()

    def _asegurar_bucket(self):
        if StorageService._bucket_verificado:
            return
        if not self.client.bucket_exists(self.bucket):
            self.client.make_bucket(self.bucket)
        StorageService._bucket_verificado = True

    @staticmethod
    def build_key(carpeta: str, nombre: str) -> str:
        return f"{carpeta.strip('/')}/{nombre}"

    @staticmethod
    def build_link(key: str) -> str:
        return f"{LINK_PREFIX}{key}"

    @staticmethod
    def key_desde_link(link: str, nombre: str) -> str:
        """
        Convierte el Link guardado en BD en la clave del objeto.
        El Link puede venir con o sin el nombre del archivo al final.
        """
        carpeta_o_archivo = link.replace(LINK_PREFIX, "", 1).replace("\\", "/").strip("/")
        partes = [p for p in carpeta_o_archivo.split("/") if p]
        if partes and partes[-1] == nombre:
            partes = partes[:-1]
        partes.append(nombre)
        # Seguridad: evitar path traversal
        if any(p in ("..", ".") for p in partes) or "/" in nombre or "\\" in nombre:
            raise ValueError("Ruta de archivo no permitida")
        return "/".join(partes)

    def subir(self, key: str, data: BinaryIO, content_type: str) -> None:
        data.seek(0, os.SEEK_END)
        size = data.tell()
        data.seek(0)
        self.client.put_object(self.bucket, key, data, length=size, content_type=content_type)

    def subir_desde_ruta(self, key: str, file_path: str, content_type: str) -> None:
        self.client.fput_object(self.bucket, key, file_path, content_type=content_type)

    def existe(self, key: str) -> bool:
        try:
            self.client.stat_object(self.bucket, key)
            return True
        except S3Error as e:
            if e.code in ("NoSuchKey", "NoSuchObject"):
                return False
            raise

    def tamanio(self, key: str) -> Optional[int]:
        """Devuelve el tamaño del objeto, o None si no existe."""
        try:
            return self.client.stat_object(self.bucket, key).size
        except S3Error as e:
            if e.code in ("NoSuchKey", "NoSuchObject"):
                return None
            raise

    def stream(self, key: str, chunk_size: int = 64 * 1024) -> Iterator[bytes]:
        response = self.client.get_object(self.bucket, key)
        try:
            yield from response.stream(chunk_size)
        finally:
            response.close()
            response.release_conn()

    def eliminar(self, key: str) -> None:
        self.client.remove_object(self.bucket, key)
