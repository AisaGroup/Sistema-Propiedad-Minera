import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { PeriodicidadAlerta, PeriodicidadAlertaCreate, PeriodicidadAlertaUpdate } from '../models/periodicidad-alerta.model';

@Injectable({
  providedIn: 'root'
})
export class PeriodicidadAlertaService {
  private apiUrl = 'http://localhost:9000/periodicidad-alerta';

  constructor(private http: HttpClient) {}

  getPeriodicidades(): Observable<PeriodicidadAlerta[]> {
    return this.http.get<PeriodicidadAlerta[]>(this.apiUrl);
  }

  getPeriodicidad(id: number): Observable<PeriodicidadAlerta> {
    return this.http.get<PeriodicidadAlerta>(`${this.apiUrl}/${id}`);
  }

  createPeriodicidad(periodicidad: PeriodicidadAlertaCreate): Observable<PeriodicidadAlerta> {
    return this.http.post<PeriodicidadAlerta>(this.apiUrl, periodicidad);
  }

  updatePeriodicidad(id: number, periodicidad: PeriodicidadAlertaUpdate): Observable<PeriodicidadAlerta> {
    return this.http.put<PeriodicidadAlerta>(`${this.apiUrl}/${id}`, periodicidad);
  }

  deletePeriodicidad(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}
