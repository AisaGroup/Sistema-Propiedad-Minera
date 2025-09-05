import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { AlertaCreate } from '../models/alerta.model';

@Injectable({ providedIn: 'root' })
export class AlertaService {
  private readonly baseUrl = 'http://localhost:9000/alertas';

  constructor(private http: HttpClient) {}

  createAlerta(alerta: AlertaCreate): Observable<any> {
    return this.http.post<any>(this.baseUrl, alerta);
  }

  updateAlerta(id: number, alerta: Partial<AlertaCreate>): Observable<any> {
    return this.http.put<any>(`${this.baseUrl}/${id}`, alerta);
  }

  getByActaId(idActa: number, page: number = 0, size: number = 10, idEstado?: number): Observable<{ data: any[]; total: number }> {
    const start = page * size;
    const end = start + size - 1;
    let params = new HttpParams().set('range', `[${start},${end}]`);
    if (idEstado !== undefined) {
      params = params.set('id_estado', idEstado.toString());
    }
    return this.http
      .get<any[]>(`${this.baseUrl}/by-parent?tipo_padre=acta&id_padre=${idActa}`, { params, observe: 'response' })
      .pipe(
        map((response: HttpResponse<any[]>) => {
          const contentRange = response.headers.get('Content-Range') || '';
          const total = this.extractTotalFromRange(contentRange);
          return { data: response.body || [], total };
        })
      );
  }

  getByResolucionId(idResolucion: number, page: number = 0, size: number = 10): Observable<{ data: any[]; total: number }> {
    const start = page * size;
    const end = start + size - 1;
    let params = new HttpParams().set('range', `[${start},${end}]`);
    return this.http
      .get<any[]>(`${this.baseUrl}/by-parent?tipo_padre=resolucion&id_padre=${idResolucion}`, { params, observe: 'response' })
      .pipe(
        map((response: HttpResponse<any[]>) => {
          const contentRange = response.headers.get('Content-Range') || '';
          const total = this.extractTotalFromRange(contentRange);
          return { data: response.body || [], total };
        })
      );
  }

  getByParent(tipoPadre: string, idPadre: number, page: number = 0, size: number = 10): Observable<{ data: any[]; total: number }> {
    const start = page * size;
    const end = start + size - 1;
    let params = new HttpParams().set('range', `[${start},${end}]`);
    return this.http
      .get<any[]>(`${this.baseUrl}/by-parent?tipo_padre=${tipoPadre}&id_padre=${idPadre}`, { params, observe: 'response' })
      .pipe(
        map((response: HttpResponse<any[]>) => {
          const contentRange = response.headers.get('Content-Range') || '';
          const total = this.extractTotalFromRange(contentRange);
          return { data: response.body || [], total };
        })
      );
  }

  getByTransaccion(idTransaccion: number, page: number = 0, size: number = 10): Observable<{ data: any[]; total: number }> {
    const start = page * size;
    const end = start + size - 1;
    let params = new HttpParams().set('range', `[${start},${end}]`);
    return this.http
      .get<any[]>(`${this.baseUrl}/by-transaccion/${idTransaccion}`, { params, observe: 'response' })
      .pipe(
        map((response: HttpResponse<any[]>) => {
          const contentRange = response.headers.get('Content-Range') || '';
          const total = this.extractTotalFromRange(contentRange);
          return { data: response.body || [], total };
        })
      );
  }

  private extractTotalFromRange(contentRange: string): number {
    const match = contentRange.match(/\/(\d+)$/);
    return match ? parseInt(match[1], 10) : 0;
  }
}
