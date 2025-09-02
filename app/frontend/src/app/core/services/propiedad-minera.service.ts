import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpHeaders, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { PropiedadMinera, PropiedadMineraCreate, PropiedadMineraFilter } from '../../shared/models/propiedad-minera.model';

@Injectable({
  providedIn: 'root'
})
export class PropiedadMineraService {
  private apiUrl = 'http://localhost:9000';

  constructor(private http: HttpClient) { }

  getPropiedades(filters?: PropiedadMineraFilter): Observable<{data: PropiedadMinera[], total: number}> {
    let params = new HttpParams();
    
    if (filters) {
      // Manejar filtro de nombre
      if (filters.Nombre) {
        const filterObj = { Nombre: filters.Nombre };
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
    }    ).pipe(
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
    return ['Buenos Aires', 'Córdoba', 'Santa Fe', 'Mendoza', 'Tucumán', 'Entre Ríos', 'Salta', 'Misiones', 'Chaco', 'Corrientes', 'Santiago del Estero', 'San Juan', 'Jujuy', 'Río Negro', 'Formosa', 'Neuquén', 'Chubut', 'San Luis', 'Catamarca', 'La Rioja', 'La Pampa', 'Santa Cruz', 'Tierra del Fuego'];
  }

  getLaboresLegales(): string[] {
    return ['Exploración', 'Explotación', 'Cateo', 'Prospección', 'Desarrollo'];
  }
}
