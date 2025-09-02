import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Expediente, ExpedienteCreate, ExpedienteFilter, ExpedienteResponse } from '../models/expediente.model';

@Injectable({
  providedIn: 'root'
})
export class ExpedienteService {
  private readonly baseUrl = 'http://localhost:9000/expedientes';

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
    
    let params = new HttpParams()
      .set('range', `[${start},${end}]`);

    // Aplicar filtros si existen
    if (filters) {
      Object.keys(filters).forEach(key => {
        const value = (filters as any)[key];
        if (value !== undefined && value !== null && value !== '') {
          params = params.set(key, value.toString());
        }
      });
    }

    return this.http.get<any[]>(this.baseUrl, { 
      params, 
      observe: 'response' 
    }).pipe(
      map((response: HttpResponse<any[]>) => {
        console.log('Respuesta del backend expedientes:', response); // Debug
        const contentRange = response.headers.get('Content-Range') || '';
        const total = this.extractTotalFromRange(contentRange);
        
        // Mapear datos del backend al modelo frontend
        const mappedData = (response.body || []).map((item: any) => ({
          ...item,
          PrimerDueno: item.PrimerDueño, // Mapear PrimerDueño -> PrimerDueno
          Ano: item.Año, // Mapear Año -> Ano
        }));
        
        return {
          data: mappedData,
          total: total,
          range: contentRange
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
      const mapped = {
        ...response,
        PrimerDueno: response.PrimerDueno ?? response.PrimerDueño,
        Ano: response.Ano ?? response.Año,
      };
      console.log('[ExpedienteService] Expediente mapeado:', mapped);
      return mapped;
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

  /**
   * Extrae el total de registros del header Content-Range
   */
  private extractTotalFromRange(contentRange: string): number {
    const match = contentRange.match(/\/(\d+)$/);
    return match ? parseInt(match[1], 10) : 0;
  }
}
