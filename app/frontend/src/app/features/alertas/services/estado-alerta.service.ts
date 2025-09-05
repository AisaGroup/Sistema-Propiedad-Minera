import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { EstadoAlerta } from '../models/estado-alerta.model';

@Injectable({ providedIn: 'root' })
export class EstadoAlertaService {
  private readonly baseUrl = 'http://localhost:9000/estado-alerta';

  constructor(private http: HttpClient) {}

  getEstadosAlerta(): Observable<EstadoAlerta[]> {
    return this.http.get<EstadoAlerta[]>(this.baseUrl);
  }
}
