import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpHeaders, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface ReqMinero {
  IdReqMinero: number;
  IdTransaccion?: number;
  Tipo?: string;
  Descripcion?: string;
}

export interface ReqMineroMov {
  IdReqMineroMov: number;
  IdPropiedadMinera?: number;
  IdReqMinero?: number;
  IdTransaccion?: number;
  Fecha?: Date;
  Descripcion?: string;
  Importe?: number;
  AudFecha?: Date;
  AudUsuario?: number;
}

export interface ReqMineroMovCreate {
  IdPropiedadMinera?: number;
  IdReqMinero?: number;
  IdTransaccion?: number;
  Fecha?: Date;
  Descripcion?: string;
  Importe?: number;
  AudFecha?: Date;
  AudUsuario?: number;
}

export interface ReqMineroMovFilter {
  IdPropiedadMinera?: number;
  IdReqMinero?: number;
  Descripcion?: string;
  FechaDesde?: Date;
  FechaHasta?: Date;
  range?: number[];
}

@Injectable({
  providedIn: 'root'
})
export class ReqMineroMovService {
  private apiUrl = 'http://localhost:9000';

  constructor(private http: HttpClient) { }

  getReqMineroMovs(filters?: ReqMineroMovFilter): Observable<{data: ReqMineroMov[], total: number}> {
    let params = new HttpParams();
    
    if (filters) {
      // Crear objeto de filtros
      const filterObj: any = {};
      
      if (filters.IdPropiedadMinera) {
        filterObj.IdPropiedadMinera = filters.IdPropiedadMinera;
      }
      
      if (filters.IdReqMinero) {
        filterObj.IdReqMinero = filters.IdReqMinero;
      }
      
      if (filters.Descripcion && filters.Descripcion.trim()) {
        filterObj.Descripcion = filters.Descripcion.trim();
      }

      if (filters.FechaDesde) {
        filterObj.FechaDesde = filters.FechaDesde.toISOString();
      }

      if (filters.FechaHasta) {
        filterObj.FechaHasta = filters.FechaHasta.toISOString();
      }
      
      // Solo agregar el parámetro filter si hay algún filtro activo
      if (Object.keys(filterObj).length > 0) {
        params = params.append('filter', JSON.stringify(filterObj));
      }
      
      // Manejar rango de paginación
      if (filters.range) {
        params = params.append('range', JSON.stringify(filters.range));
      }
    }

    return this.http.get<ReqMineroMov[]>(`${this.apiUrl}/req-minero-movs`, { 
      params,
      observe: 'response'
    }).pipe(
      map((response: HttpResponse<ReqMineroMov[]>) => {
        const data = response.body || [];
        
        // Extraer total del header Content-Range
        const contentRange = response.headers.get('Content-Range');
        let total = data.length;
        
        if (contentRange) {
          // Content-Range: "req-minero-movs 0-9/150"
          const match = contentRange.match(/\/(\d+)$/);
          if (match) {
            total = parseInt(match[1], 10);
          }
        }
        
        return { data, total };
      })
    );
  }

  getReqMineroMovById(id: number): Observable<ReqMineroMov> {
    return this.http.get<ReqMineroMov>(`${this.apiUrl}/req-minero-movs/${id}`);
  }

  getReqMineroMovsByPropiedad(idPropiedadMinera: number, skip: number = 0, limit: number = 100): Observable<{data: ReqMineroMov[], total: number}> {
    let params = new HttpParams()
      .set('skip', skip.toString())
      .set('limit', limit.toString());

    return this.http.get<ReqMineroMov[]>(`${this.apiUrl}/propiedades-mineras/${idPropiedadMinera}/req-minero-movs`, { 
      params,
      observe: 'response'
    }).pipe(
      map((response: HttpResponse<ReqMineroMov[]>) => {
        const data = response.body || [];
        
        // Extraer total del header Content-Range
        const contentRange = response.headers.get('Content-Range');
        let total = data.length;
        
        if (contentRange) {
          const match = contentRange.match(/\/(\d+)$/);
          if (match) {
            total = parseInt(match[1], 10);
          }
        }
        
        return { data, total };
      })
    );
  }

  createReqMineroMov(reqMineroMov: ReqMineroMovCreate): Observable<ReqMineroMov> {
    return this.http.post<ReqMineroMov>(`${this.apiUrl}/req-minero-movs`, reqMineroMov);
  }

  createReqMineroMovForPropiedad(idPropiedadMinera: number, reqMineroMov: ReqMineroMovCreate): Observable<ReqMineroMov> {
    return this.http.post<ReqMineroMov>(`${this.apiUrl}/propiedades-mineras/${idPropiedadMinera}/req-minero-movs`, reqMineroMov);
  }

  updateReqMineroMov(id: number, reqMineroMov: Partial<ReqMineroMovCreate>): Observable<ReqMineroMov> {
    return this.http.put<ReqMineroMov>(`${this.apiUrl}/req-minero-movs/${id}`, reqMineroMov);
  }

  deleteReqMineroMov(id: number): Observable<{ok: boolean, message: string}> {
    return this.http.delete<{ok: boolean, message: string}>(`${this.apiUrl}/req-minero-movs/${id}`);
  }

  // Métodos para ReqMinero
  getReqMineros(): Observable<ReqMinero[]> {
    return this.http.get<{data: ReqMinero[], total: number}>(`${this.apiUrl}/req-mineros`)
      .pipe(map(response => response.data || []));
  }

  // Método para obtener una propiedad minera por ID
  getPropiedadMinera(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/propiedades-mineras/${id}`);
  }
}
