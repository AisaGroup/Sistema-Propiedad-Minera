import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpHeaders, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { PropiedadMinera, PropiedadMineraCreate, PropiedadMineraFilter } from '../models/propiedad-minera.model';
import { API_BASE_URL } from '../../../core/api.constants';

@Injectable({
  providedIn: 'root'
})
export class PropiedadMineraService {
  private apiUrl = API_BASE_URL;

  constructor(private http: HttpClient) { }

  getPropiedades(filters?: PropiedadMineraFilter): Observable<{data: PropiedadMinera[], total: number}> {
    let params = new HttpParams();
    
    if (filters) {
      // Crear objeto de filtros
      const filterObj: any = {};
      
      // Manejar filtro de nombre
      if (filters.Nombre && filters.Nombre.trim()) {
        filterObj.Nombre = filters.Nombre.trim();
      }
      
      // Manejar filtro de provincia
      if (filters.Provincia && filters.Provincia.trim()) {
        filterObj.Provincia = filters.Provincia.trim();
      }
      
      // Manejar filtro de titular
      const idTitular = filters.IdTitular;
      if (typeof idTitular === 'number' && idTitular > 0) {
        filterObj.IdTitular = idTitular;
      } else if (typeof idTitular === 'string' && idTitular !== '' && !isNaN(Number(idTitular))) {
        filterObj.IdTitular = Number(idTitular);
      }
      
      // Manejar filtro de expediente
      if (filters.Expediente && filters.Expediente.trim() !== '') {
        filterObj.Expediente = filters.Expediente.trim();
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

    return this.http.get<PropiedadMinera[]>(`${this.apiUrl}/propiedades-mineras`, { 
      params,
      observe: 'response'
    }).pipe(
      map((response: HttpResponse<PropiedadMinera[]>) => {
        const data = response.body || [];
        
        // Extraer total del header Content-Range
        const contentRange = response.headers.get('Content-Range');
        let total = data.length;
        
        if (contentRange) {
          // Content-Range: "propiedades-mineras 0-9/150"
          const match = contentRange.match(/\/(\d+)$/);
          if (match) {
            total = parseInt(match[1], 10);
          }
        }
        
        return { data, total };
      })
    );
  }

  getPropiedadById(id: number): Observable<PropiedadMinera> {
    return this.http.get<PropiedadMinera>(`${this.apiUrl}/propiedades-mineras/${id}`);
  }

  createPropiedad(propiedad: PropiedadMineraCreate): Observable<PropiedadMinera> {
    return this.http.post<PropiedadMinera>(`${this.apiUrl}/propiedades-mineras`, propiedad);
  }

  updatePropiedad(id: number, propiedad: Partial<PropiedadMineraCreate>): Observable<PropiedadMinera> {
    return this.http.put<PropiedadMinera>(`${this.apiUrl}/propiedades-mineras/${id}`, propiedad);
  }

  deletePropiedad(id: number): Observable<{ok: boolean}> {
    return this.http.delete<{ok: boolean}>(`${this.apiUrl}/propiedades-mineras/${id}`);
  }

  // Métodos auxiliares para las opciones de filtros
  getProvincias(): string[] {
    return ['San Juan', 'La Rioja', 'Mendoza','Buenos Aires', 'Córdoba', 'Santa Fe', 'Tucumán', 'Entre Ríos', 'Salta', 'Misiones', 'Chaco', 'Corrientes', 'Santiago del Estero', 'Jujuy', 'Río Negro', 'Formosa', 'Neuquén', 'Chubut', 'San Luis', 'Catamarca',  'La Pampa', 'Santa Cruz', 'Tierra del Fuego'];
  }

  exportPropiedadesPdf(filters: {
    nombre?: string | null;
    provincia?: string | null;
    idTitular?: number | null;
    expediente?: string | null;
  }) {
    return this.http.post(`${this.apiUrl}/propiedades-mineras/export/pdf`, filters, {
      responseType: 'blob'
    });
  }
}
