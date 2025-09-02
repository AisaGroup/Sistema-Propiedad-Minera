import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Observacion } from '../models/observacion.model';

@Injectable({ providedIn: 'root' })
export class ObservacionesService {
  private apiUrl = '/api/observaciones';

  constructor(private http: HttpClient) {}

  getByTransaccion(idTransaccion: number): Observable<Observacion[]> {
    return this.http.get<Observacion[]>(`${this.apiUrl}?idTransaccion=${idTransaccion}`);
  }
}
