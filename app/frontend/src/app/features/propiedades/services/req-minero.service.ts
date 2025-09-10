import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface ReqMinero {
  IdReqMinero: number;
  IdTransaccion?: number;
  Tipo?: string;
  Descripcion?: string;
}

export interface ReqMineroCreate {
  IdTransaccion?: number;
  Tipo?: string;
  Descripcion?: string;
}

export interface ReqMineroFilter {
  IdTransaccion?: number;
  Tipo?: string;
  Descripcion?: string;
  range?: number[];
}

@Injectable({
  providedIn: 'root'
})
export class ReqMineroService {
  private apiUrl = 'http://localhost:9000';

  constructor(private http: HttpClient) { }

  getReqMineros(filters?: ReqMineroFilter): Observable<{data: ReqMinero[], total: number}> {
    let params = new HttpParams();
    
    if (filters) {
      // Crear objeto de filtros
      const filterObj: any = {};
      
      if (filters.IdTransaccion !== undefined) {
        filterObj.IdTransaccion = filters.IdTransaccion;
      }
      
      if (filters.Tipo) {
        filterObj.Tipo = filters.Tipo;
      }
      
      if (filters.Descripcion) {
        filterObj.Descripcion = filters.Descripcion;
      }
      
      // Solo agregar filtro si hay campos
      if (Object.keys(filterObj).length > 0) {
        params = params.set('filter', JSON.stringify(filterObj));
      }
      
      // Agregar range si existe
      if (filters.range && filters.range.length === 2) {
        params = params.set('range', JSON.stringify(filters.range));
      }
    }
    
    return this.http.get<{data: ReqMinero[], total: number}>(`${this.apiUrl}/req-mineros`, { params });
  }

  getReqMinero(id: number): Observable<ReqMinero> {
    return this.http.get<ReqMinero>(`${this.apiUrl}/req-mineros/${id}`);
  }

  getReqMinerosByTransaccion(idTransaccion: number, skip: number = 0, limit: number = 100): Observable<ReqMinero[]> {
    let params = new HttpParams()
      .set('skip', skip.toString())
      .set('limit', limit.toString());
    
    return this.http.get<ReqMinero[]>(`${this.apiUrl}/transacciones/${idTransaccion}/req-mineros`, { params });
  }

  createReqMinero(reqMinero: ReqMineroCreate): Observable<ReqMinero> {
    return this.http.post<ReqMinero>(`${this.apiUrl}/req-mineros`, reqMinero);
  }

  updateReqMinero(id: number, reqMinero: Partial<ReqMineroCreate>): Observable<ReqMinero> {
    return this.http.put<ReqMinero>(`${this.apiUrl}/req-mineros/${id}`, reqMinero);
  }

  deleteReqMinero(id: number): Observable<{ok: boolean, message: string}> {
    return this.http.delete<{ok: boolean, message: string}>(`${this.apiUrl}/req-mineros/${id}`);
  }
}
