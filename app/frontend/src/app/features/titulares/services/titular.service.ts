import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface TitularMinero {
  IdTitular: number;
  IdTransaccion: number;
  TipoPersona: string;
  Nombre: string;
  DniCuit: string;
  Domicilio: string;
  Telefono: string;
  Email: string;
  FechaAsignacion: string;
  Estado: string;
  RepresentanteLegal: string;
  Observaciones?: string;
  Descripcion?: string;
}

@Injectable({ providedIn: 'root' })
export class TitularMineroService {
  private apiUrl = 'http://localhost:9000/titulares-mineros';

  constructor(private http: HttpClient) {}

  getAll(): Observable<TitularMinero[]> {
    return this.http.get<TitularMinero[]>(this.apiUrl);
  }
}
