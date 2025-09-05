import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class TipoAlertaService {
  private readonly baseUrl = 'http://localhost:9000/tipo-alerta';

  constructor(private http: HttpClient) {}

  getTiposAlerta(): Observable<any[]> {
    return this.http.get<any[]>(this.baseUrl);
  }
}
