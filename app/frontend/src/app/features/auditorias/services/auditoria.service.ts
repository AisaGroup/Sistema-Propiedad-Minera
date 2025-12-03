import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_BASE_URL } from '../../../core/api.constants';
import { AuditoriaRaw } from '../models/auditoria.model';

@Injectable({ providedIn: 'root' })
export class AuditoriaService {
  private readonly apiUrl = `${API_BASE_URL}/auditorias`;

  constructor(private http: HttpClient) {}

  getAuditorias(): Observable<AuditoriaRaw[]> {
    return this.http.get<AuditoriaRaw[]>(this.apiUrl);
  }
}

