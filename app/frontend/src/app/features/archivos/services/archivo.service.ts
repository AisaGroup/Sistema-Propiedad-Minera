import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpEvent, HttpEventType } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { API_BASE_URL } from '../../../core/api.constants';

export interface Archivo {
  IdArchivo: number;
  IdTransaccion?: number;
  Nombre?: string;
  Descripcion?: string;
  Tipo?: string;
  Link: string;
  AudFecha?: Date;
  AudUsuario?: number;
}

export interface ArchivoCreate {
  IdTransaccion?: number;
  Nombre?: string;
  Descripcion?: string;
  Tipo?: string;
  Link: string;
  AudUsuario?: number;
}

export interface FileUploadProgress {
  progress: number;
  file?: File;
  response?: Archivo;
}

@Injectable({
  providedIn: 'root',
})
export class ArchivoService {
  private apiUrl = `${API_BASE_URL}/archivos`;

  constructor(private http: HttpClient) {}

  // Obtener todos los archivos
  getArchivos(skip: number = 0, limit: number = 100): Observable<Archivo[]> {
    const params = new HttpParams().set('skip', skip.toString()).set('limit', limit.toString());

    return this.http.get<Archivo[]>(`${this.apiUrl}/`, { params });
  }

  // Obtener archivos por transacción
  getArchivosByTransaccion(idTransaccion: number): Observable<Archivo[]> {
    return this.http.get<Archivo[]>(`${this.apiUrl}/transaccion/${idTransaccion}`);
  }

  // Obtener archivos por expediente
  getArchivosByExpediente(idExpediente: number): Observable<Archivo[]> {
    return this.http.get<Archivo[]>(`${this.apiUrl}/expediente/${idExpediente}`);
  }

  // Obtener un archivo por ID
  getArchivo(idArchivo: number): Observable<Archivo> {
    return this.http.get<Archivo>(`${this.apiUrl}/${idArchivo}`);
  }

  // Crear archivo (sin subir archivo físico)
  createArchivo(archivo: ArchivoCreate): Observable<Archivo> {
    return this.http.post<Archivo>(`${this.apiUrl}/`, archivo);
  }

  // Subir archivo físico
  uploadArchivo(
    file: File,
    tipo: string,
    idTransaccion?: number,
    nombre?: string,
    descripcion?: string,
    audUsuario: number = 1
  ): Observable<FileUploadProgress> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('tipo', tipo);
    formData.append('AudUsuario', audUsuario.toString());

    if (idTransaccion) {
      formData.append('IdTransaccion', idTransaccion.toString());
    }
    if (nombre) {
      formData.append('Nombre', nombre);
    }
    formData.append('descripcion', descripcion ?? '');

    // tipo: 'acta' o 'expediente', idTransaccion: id de la entidad
    return this.http
      .post<Archivo>(`${this.apiUrl}/upload/${tipo}/${idTransaccion}`, formData, {
        reportProgress: true,
        observe: 'events',
      })
      .pipe(
        map((event) => {
          if (event.type === HttpEventType.UploadProgress && event.total) {
            const progress = Math.round((100 * event.loaded) / event.total);
            return { progress, file };
          } else if (event.type === HttpEventType.Response) {
            return { progress: 100, file, response: event.body! };
          }
          return { progress: 0, file };
        })
      );
  }

  // Actualizar archivo
  updateArchivo(idArchivo: number, archivo: Partial<ArchivoCreate>): Observable<Archivo> {
    return this.http.put<Archivo>(`${this.apiUrl}/${idArchivo}`, archivo);
  }

  // Eliminar archivo
  deleteArchivo(idArchivo: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${idArchivo}`);
  }

  // Obtener URL de descarga
  getDownloadUrl(tipo: string, filename: string): string {
    return `${this.apiUrl}/download/${tipo}/${filename}`;
  }

  // Obtener URL de preview
  getPreviewUrl(link: string, nombre: string): string {
    const params = new HttpParams().set('link', link).set('nombre', nombre);
    return `${this.apiUrl}/preview?${params.toString()}`;
  }

  // Obtener archivos por entidad (genérico)
  getArchivosByEntidad(
    entidad: string,
    idEntidad: number,
    page: number = 1,
    pageSize: number = 10
  ): Observable<any> {
    // El backend debe aceptar parámetros ?page=1&limit=10
    return this.http.get<any>(
      `${this.apiUrl}/${entidad}/${idEntidad}?page=${page}&limit=${pageSize}`
    );
  }

  // Subir archivo por entidad (genérico)
  uploadArchivoEntidad(
    file: File,
    entidad: string,
    idEntidad: number,
    descripcion?: string,
    audUsuario: number = 1
  ): Observable<FileUploadProgress> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('aud_usuario', audUsuario.toString());

    if (descripcion) {
      formData.append('descripcion', descripcion);
    }

    return this.http
      .post<Archivo>(`${this.apiUrl}/upload/${entidad}/${idEntidad}`, formData, {
        reportProgress: true,
        observe: 'events',
      })
      .pipe(
        map((event) => {
          if (event.type === HttpEventType.UploadProgress && event.total) {
            const progress = Math.round((100 * event.loaded) / event.total);
            return { progress, file };
          } else if (event.type === HttpEventType.Response) {
            return { progress: 100, file, response: event.body! };
          }
          return { progress: 0, file };
        })
      );
  }

  // Descargar archivo usando link y nombre
  downloadArchivo(link: string, nombre: string): Observable<Blob> {
    const params = new HttpParams().set('link', link).set('nombre', nombre);

    return this.http.get(`${this.apiUrl}/download`, {
      params,
      responseType: 'blob',
    });
  }
}
