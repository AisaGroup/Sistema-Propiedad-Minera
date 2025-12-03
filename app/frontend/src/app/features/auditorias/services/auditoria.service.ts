import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_BASE_URL } from '../../../core/api.constants';
import { AuditoriaRaw, AuditoriaExportFilters } from '../models/auditoria.model';

@Injectable({ providedIn: 'root' })
export class AuditoriaService {
  private readonly apiUrl = `${API_BASE_URL}/auditorias`;

  constructor(private http: HttpClient) {}

  getAuditorias(): Observable<AuditoriaRaw[]> {
    return this.http.get<AuditoriaRaw[]>(this.apiUrl);
  }

  exportAuditoriasPdf(filters: AuditoriaExportFilters): Observable<Blob> {
    const url = `${this.apiUrl}/export/pdf`;
    return this.http.post(url, filters, { responseType: 'blob' });
  }
}

