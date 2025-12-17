import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import {
  Expediente,
  ExpedienteCreate,
  ExpedienteFilter,
  ExpedienteResponse,
} from '../models/expediente.model';
import { API_BASE_URL } from '../../../core/api.constants';

@Injectable({
  providedIn: 'root',
})
export class ExpedienteService {
  private readonly baseUrl = `${API_BASE_URL}/expedientes`;

  constructor(private http: HttpClient) {}

  /**
   * Obtiene expedientes con paginación
   */
  getExpedientes(
    page: number = 0,
    size: number = 10,
    filters?: ExpedienteFilter
  ): Observable<ExpedienteResponse> {
    const start = page * size;
    const end = start + size - 1;

    let params = new HttpParams().set('range', `[${start},${end}]`);

    // Aplicar filtros si existen
    if (filters) {
      Object.keys(filters).forEach((key) => {
        const value = (filters as any)[key];
        if (value !== undefined && value !== null && value !== '') {
          params = params.set(key, value.toString());
        }
      });
    }

    return this.http
      .get<any[]>(this.baseUrl, {
        params,
        observe: 'response',
      })
      .pipe(
        map((response: HttpResponse<any[]>) => {
          console.log('Respuesta del backend expedientes:', response); // Debug
          const contentRange = response.headers.get('Content-Range') || '';
          const total = this.extractTotalFromRange(contentRange);

          // Mapear datos del backend al modelo frontend
          const mappedData = (response.body || []).map((item: any) => ({
            ...item,
            // Ya no es necesario mapear PrimerDueño ni Año, el backend envía PrimerDueno y Ano
          }));

          return {
            data: mappedData,
            total: total,
            range: contentRange,
          };
        })
      );
  }

  /**
   * Obtiene un expediente por ID
   */
  getExpedienteById(id: number): Observable<Expediente> {
    return this.http.get<any>(`${this.baseUrl}/${id}`).pipe(
      map((response: any) => {
        console.log('[ExpedienteService] Respuesta cruda del backend:', response);
        // Ya no es necesario mapear PrimerDueño ni Año
        return response;
      })
    );
  }

  /**
   * Crea un nuevo expediente
   */
  createExpediente(expediente: ExpedienteCreate): Observable<Expediente> {
    return this.http.post<Expediente>(this.baseUrl, expediente);
  }

  /**
   * Actualiza un expediente existente
   */
  updateExpediente(id: number, expediente: Partial<ExpedienteCreate>): Observable<Expediente> {
    return this.http.put<Expediente>(`${this.baseUrl}/${id}`, expediente);
  }

  /**
   * Elimina un expediente
   */
  deleteExpediente(id: number): Observable<{ ok: boolean }> {
    return this.http.delete<{ ok: boolean }>(`${this.baseUrl}/${id}`);
  }

  exportExpedientesPdf(filters: { codigoExpediente?: string | null }) {
    const payload = {
      codigoExpediente:
        filters.codigoExpediente && filters.codigoExpediente.trim()
          ? filters.codigoExpediente.trim()
          : null,
    };
    return this.http.post(`${this.baseUrl}/export/pdf`, payload, {
      responseType: 'blob',
    });
  }

  /**
   * Extrae el total de registros del header Content-Range
   */
  private extractTotalFromRange(contentRange: string): number {
    const match = contentRange.match(/\/(\d+)$/);
    return match ? parseInt(match[1], 10) : 0;
  }

  /**
   * Obtiene expedientes filtrados por propiedad minera (IdPropiedadMinera)
   */
  getExpedientesByPropiedadMinera(
    idPropiedadMinera: number,
    page: number = 0,
    size: number = 10
  ): Observable<ExpedienteResponse> {
    const start = page * size;
    const end = start + size - 1;
    let params = new HttpParams()
      .set('range', `[${start},${end}]`)
      .set('filter', JSON.stringify({ IdPropiedadMinera: idPropiedadMinera }));
    return this.http
      .get<any[]>(this.baseUrl, {
        params,
        observe: 'response',
      })
      .pipe(
        map((response: HttpResponse<any[]>) => {
          const contentRange = response.headers.get('Content-Range') || '';
          const total = this.extractTotalFromRange(contentRange);
          const mappedData = (response.body || []).map((item: any) => ({ ...item }));
          return {
            data: mappedData,
            total: total,
            range: contentRange,
          };
        })
      );
  }

  /**
   * Obtiene expedientes por propiedad minera usando el endpoint exclusivo
   */
  getExpedientesPorPropiedadMinera(idPropiedadMinera: number): Observable<Expediente[]> {
    return this.http.get<Expediente[]>(`${this.baseUrl}/propiedad-minera/${idPropiedadMinera}`);
  }

  /**
   * Obtiene los tipos de expediente desde la base de datos
   */
  getTiposExpediente(range: string = '[0,9]'): Observable<{ id: number; nombre: string }[]> {
    const headers = { Authorization: `Bearer ${localStorage.getItem('token')}` };
    const params = new HttpParams().set('range', range);

    return this.http.get<{ id: number; nombre: string }[]>(`${this.baseUrl}/tipos`, {
      headers,
      params,
    });
  }
}
