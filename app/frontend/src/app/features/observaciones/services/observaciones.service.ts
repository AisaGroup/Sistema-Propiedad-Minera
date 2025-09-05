import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Observacion } from '../models/observacion.model';

@Injectable({ providedIn: 'root' })
export class ObservacionesService {
  private apiUrl = 'http://localhost:9000/observaciones';

  constructor(private http: HttpClient) {}

  getByTransaccion(idTransaccion: number, page: number = 0, size: number = 10): Observable<{ data: Observacion[], total: number }> {
    const start = page * size;
    const end = start + size - 1;
    let params = new HttpParams().set('range', `[${start},${end}]`);
    return this.http.get<Observacion[]>(`${this.apiUrl}/${idTransaccion}`, { params, observe: 'response' }).pipe(
      map((response: HttpResponse<Observacion[]>) => {
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

  createObservacion(observacion: Observacion) {
    return this.http.post<Observacion>(this.apiUrl, observacion);
  }

  updateObservacion(id: number, observacion: Observacion) {
    return this.http.put<Observacion>(`${this.apiUrl}/${id}`, observacion);
  }
}
