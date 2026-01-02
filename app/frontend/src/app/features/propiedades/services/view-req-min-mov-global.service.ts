import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { API_BASE_URL } from '../../../core/api.constants';

export interface ViewReqMinMovGlobal {
  IdReqMineroMov: number;
  IdPropiedadMinera?: number;
  FechaInicio?: Date;
  FechaFin?: Date;
  IdReqMinero?: number;
  Descripcion?: string;
  Importe?: number;
  IdExpediente?: number;
  IdPropiedadMineraExp?: number;
  CodigoExpediente?: string;
}

export interface ViewReqMinMovGlobalFilter {
  IdReqMineroMov?: number;
  IdPropiedadMinera?: number;
  IdReqMinero?: number;
  IdExpediente?: number;
  CodigoExpediente?: string;
  range?: number[];
}

@Injectable({
  providedIn: 'root'
})
export class ViewReqMinMovGlobalService {
  private apiUrl = API_BASE_URL;

  constructor(private http: HttpClient) { }

  getViewReqMinMovGlobal(filters?: ViewReqMinMovGlobalFilter): Observable<{data: ViewReqMinMovGlobal[], total: number}> {
    let params = new HttpParams();
    
    if (filters) {
      // Crear objeto de filtros
      const filterObj: any = {};
      
      if (filters.IdReqMineroMov) {
        filterObj.IdReqMineroMov = filters.IdReqMineroMov;
      }
      
      if (filters.IdPropiedadMinera) {
        filterObj.IdPropiedadMinera = filters.IdPropiedadMinera;
      }
      
      if (filters.IdReqMinero) {
        filterObj.IdReqMinero = filters.IdReqMinero;
      }
      
      if (filters.IdExpediente) {
        filterObj.IdExpediente = filters.IdExpediente;
      }
      
      if (filters.CodigoExpediente && filters.CodigoExpediente.trim()) {
        filterObj.CodigoExpediente = filters.CodigoExpediente.trim();
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

    return this.http.get<ViewReqMinMovGlobal[]>(`${this.apiUrl}/view-req-min-mov-global`, { 
      params,
      observe: 'response'
    }).pipe(
      map((response: HttpResponse<ViewReqMinMovGlobal[]>) => {
        const data = response.body || [];
        
        // Extraer total del header Content-Range
        const contentRange = response.headers.get('Content-Range');
        let total = data.length;
        
        if (contentRange) {
          // Content-Range: "view-req-min-mov-global 0-9/150"
          const match = contentRange.match(/\/(\d+)$/);
          if (match) {
            total = parseInt(match[1], 10);
          }
        }
        
        return { data, total };
      })
    );
  }

  getViewByPropiedadMinera(idPropiedadMinera: number, skip: number = 0, limit: number = 100): Observable<ViewReqMinMovGlobal[]> {
    let params = new HttpParams()
      .set('skip', skip.toString())
      .set('limit', limit.toString());

    return this.http.get<ViewReqMinMovGlobal[]>(
      `${this.apiUrl}/view-req-min-mov-global/propiedad/${idPropiedadMinera}`, 
      { params }
    );
  }

  getViewByExpediente(idExpediente: number, skip: number = 0, limit: number = 100): Observable<ViewReqMinMovGlobal[]> {
    let params = new HttpParams()
      .set('skip', skip.toString())
      .set('limit', limit.toString());

    return this.http.get<ViewReqMinMovGlobal[]>(
      `${this.apiUrl}/view-req-min-mov-global/expediente/${idExpediente}`, 
      { params }
    );
  }

  getViewByReqMinero(idReqMinero: number, skip: number = 0, limit: number = 100): Observable<ViewReqMinMovGlobal[]> {
    let params = new HttpParams()
      .set('skip', skip.toString())
      .set('limit', limit.toString());

    return this.http.get<ViewReqMinMovGlobal[]>(
      `${this.apiUrl}/view-req-min-mov-global/req-minero/${idReqMinero}`, 
      { params }
    );
  }

  getViewByPropiedadCompleta(idPropiedadMinera: number, skip: number = 0, limit: number = 1000): Observable<ViewReqMinMovGlobal[]> {
    let params = new HttpParams()
      .set('skip', skip.toString())
      .set('limit', limit.toString());

    return this.http.get<ViewReqMinMovGlobal[]>(
      `${this.apiUrl}/view-req-min-mov-global/propiedad-completa/${idPropiedadMinera}`, 
      { params }
    );
  }

  getViewById(idReqMineroMov: number): Observable<ViewReqMinMovGlobal> {
    return this.http.get<ViewReqMinMovGlobal>(
      `${this.apiUrl}/view-req-min-mov-global/${idReqMineroMov}`
    );
  }
}
