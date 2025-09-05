import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Alerta {
  idAlerta: number;
  IdTransaccion: number;
  Estado: string;
  Mensaje?: string;
  Asunto?: string;
}

export interface Resolucion {
  IdResolucion: number;
  IdExpediente?: number;
  Numero?: string;
  Titulo?: string;
  Fecha_emision?: string; // ISO date string
  Fecha_publicacion?: string; // ISO date string
  Estado?: string;
  Organismo_emisor?: string;
  Contenido?: string;
  Descripcion?: string;
  Observaciones?: string;
  IdTransaccion?: number;
}

export interface ResolucionDetalleResponse extends Resolucion {
  alertas?: Alerta[];
}

@Injectable({
  providedIn: 'root'
})
export class ResolucionService {
  private readonly baseUrl = 'http://localhost:9000/resoluciones';

  constructor(private http: HttpClient) {}

  /**
   * Obtiene resoluciones por ID de expediente
   */
  getResolucionesByExpediente(expedienteId: number): Observable<Resolucion[]> {
    // El backend espera un parámetro "filter" con JSON
    const filterJson = JSON.stringify({ IdExpediente: expedienteId });
    const url = `${this.baseUrl}?filter=${encodeURIComponent(filterJson)}`;
    console.log(`[DEBUG] Buscando resoluciones para expediente ${expedienteId}, URL: ${url}`);
    return this.http.get<Resolucion[]>(url);
  }

  /**
   * Obtiene una resolución por ID
   */
  getResolucionById(id: number): Observable<ResolucionDetalleResponse> {
    return this.http.get<ResolucionDetalleResponse>(`${this.baseUrl}/${id}`);
  }

  /**
   * Obtiene resoluciones por ID de expediente con paginación
   */
  getResolucionesByExpedientePaged(expedienteId: number, pageIndex: number, pageSize: number) {
    const filterJson = JSON.stringify({ IdExpediente: expedienteId });
    const range = JSON.stringify([pageIndex * pageSize, (pageIndex + 1) * pageSize - 1]);
    const url = `${this.baseUrl}?filter=${encodeURIComponent(filterJson)}&range=${encodeURIComponent(range)}`;
    return this.http.get<Resolucion[]>(url, { observe: 'response' });
  }

  /**
   * Crea una nueva resolución
   */
  createResolucion(resolucion: Partial<Resolucion>) {
    return this.http.post<Resolucion>(this.baseUrl, resolucion);
  }

  /**
   * Actualiza una resolución existente
   */
  updateResolucion(id: number, resolucion: Partial<Resolucion>) {
    return this.http.put<Resolucion>(`${this.baseUrl}/${id}`, resolucion);
  }
}
