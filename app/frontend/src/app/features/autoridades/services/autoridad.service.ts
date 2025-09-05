import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Autoridad {
  IdAutoridad: string;
  Nombre: string;
}

@Injectable({ providedIn: 'root' })
export class AutoridadService {
  searchByNombre(nombre: string): Observable<Autoridad[]> {
    return this.http.get<Autoridad[]>(`${this.apiUrl}/search`, { params: { nombre } });
  }
  private apiUrl = 'http://localhost:9000/autoridades';

  constructor(private http: HttpClient) {}

  getAll(): Observable<Autoridad[]> {
    return this.http.get<Autoridad[]>(this.apiUrl);
  }
}
