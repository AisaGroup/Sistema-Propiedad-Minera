import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface TipoExpediente {
  IdTipoExpediente: number;
  Nombre: string;
  Descripcion?: string;
  Activo?: boolean;
}

@Injectable({ providedIn: 'root' })
export class TipoExpedienteService {
  private readonly baseUrl = 'http://localhost:9000/tipos-expediente';

  constructor(private http: HttpClient) {}

  getTipos(): Observable<TipoExpediente[]> {
    return this.http.get<TipoExpediente[]>(this.baseUrl);
  }
}
