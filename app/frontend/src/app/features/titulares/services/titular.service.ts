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

export interface TitularMineroCreate {
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

  create(titular: TitularMineroCreate): Observable<TitularMinero> {
    return this.http.post<TitularMinero>(this.apiUrl, titular);
  }

  update(id: number, titular: Partial<TitularMineroCreate>): Observable<TitularMinero> {
    return this.http.put<TitularMinero>(`${this.apiUrl}/${id}`, titular);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  getById(id: number): Observable<TitularMinero> {
    return this.http.get<TitularMinero>(`${this.apiUrl}/${id}`);
  }
}
