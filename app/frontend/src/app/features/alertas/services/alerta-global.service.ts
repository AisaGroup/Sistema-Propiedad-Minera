import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class AlertaGlobalService {
  private readonly baseUrl = 'http://localhost:9000/alertas/';

  constructor(private http: HttpClient) {}

  getAllPaginated(page: number = 0, size: number = 10): Observable<{ data: any[]; total: number }> {
    const start = page * size;
    const end = start + size - 1;
    let params = new HttpParams().set('range', `[${start},${end}]`);
    return this.http
      .get<any[]>(this.baseUrl, { params, observe: 'response' })
      .pipe(
        map((response: HttpResponse<any[]>) => {
          const contentRange = response.headers.get('Content-Range') || '';
          const total = this.extractTotalFromRange(contentRange);
          return { data: response.body || [], total };
        })
      );
  }

  private extractTotalFromRange(contentRange: string): number {
    const match = contentRange.match(/\/(\d+)$/);
    return match ? parseInt(match[1], 10) : 0;
  }
}
