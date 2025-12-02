import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { HttpClient } from '@angular/common/http';
import html2pdf from 'html2pdf.js';
import { API_BASE_URL } from '../../../core/api.constants';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule, MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { FormsModule } from '@angular/forms';

import { ExpedienteService } from '../services/expediente.service';
import { Expediente, ExpedienteFilter } from '../models/expediente.model';

@Component({
  selector: 'app-expedientes-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatTableModule,
    MatPaginatorModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatCardModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
    FormsModule
  ],
  template: `
    <div class="expedientes-container">
      <mat-card>
        <mat-card-header>
          <mat-card-title>
            <mat-icon>folder_open</mat-icon>
            Gestión de Expedientes
          </mat-card-title>
          <div class="header-actions">
            <button mat-raised-button color="primary" (click)="crearExpediente()">
              <mat-icon>add</mat-icon>
              Nuevo Expediente
            </button>
            <button mat-raised-button color="accent" (click)="descargarPDF()">
              <mat-icon>print</mat-icon>
              Imprimir
            </button>
          </div>
        </mat-card-header>

        <mat-card-content>
          <!-- Filtros -->
          <div class="filters-section">
            <mat-form-field appearance="outline">
              <mat-label>Código Expediente</mat-label>
              <input matInput [(ngModel)]="filters.CodigoExpediente" (input)="onFilterChange()" placeholder="Buscar por código">
            </mat-form-field>

            <button mat-button (click)="clearFilters()">
              <mat-icon>clear</mat-icon>
              Limpiar Filtros
            </button>
          </div>

          <!-- Tabla -->
          <div class="table-container">
            <mat-progress-spinner 
              *ngIf="loading" 
              mode="indeterminate" 
              diameter="40">
            </mat-progress-spinner>

            <table mat-table [dataSource]="expedientes" *ngIf="!loading" class="expedientes-table">
              
              <!-- Código Column -->
              <ng-container matColumnDef="CodigoExpediente">
                <th mat-header-cell *matHeaderCellDef>Código</th>
                <td mat-cell *matCellDef="let expediente">{{ mostrarDato(expediente.CodigoExpediente) }}</td>
              </ng-container>

              <!-- Primer Dueño Column -->
              <ng-container matColumnDef="PrimerDueno">
                <th mat-header-cell *matHeaderCellDef>Primer Dueño</th>
                <td mat-cell *matCellDef="let expediente">{{ mostrarDato(expediente.PrimerDueno) }}</td>
              </ng-container>

              <!-- Carátula Column -->
              <ng-container matColumnDef="Caratula">
                <th mat-header-cell *matHeaderCellDef>Carátula</th>
                <td mat-cell *matCellDef="let expediente">{{ mostrarDato(expediente.Caratula) }}</td>
              </ng-container>

              <!-- Estado Column -->
              <ng-container matColumnDef="Estado">
                <th mat-header-cell *matHeaderCellDef>Estado</th>
                <td mat-cell *matCellDef="let expediente">
                  <span class="estado-badge" [ngClass]="'estado-' + (expediente.Estado || 'sin-estado').toLowerCase()">
                    {{ mostrarDato(expediente.Estado) }}
                  </span>
                </td>
              </ng-container>

              <!-- Dependencia Column -->
              <ng-container matColumnDef="Dependencia">
                <th mat-header-cell *matHeaderCellDef>Dependencia</th>
                <td mat-cell *matCellDef="let expediente">{{ mostrarDato(expediente.Dependencia) }}</td>
              </ng-container>

              <!-- Fecha Inicio Column -->
              <ng-container matColumnDef="FechaInicio">
                <th mat-header-cell *matHeaderCellDef>Desde</th>
                <td mat-cell *matCellDef="let expediente">
                  {{ expediente.FechaInicio !== undefined && expediente.FechaInicio !== null && expediente.FechaInicio !== '' ? (expediente.FechaInicio | date:'dd/MM/yyyy') : 'Sin fecha' }}
                </td>
              </ng-container>

              <!-- Acciones Column -->
              <ng-container matColumnDef="acciones">
                <th mat-header-cell *matHeaderCellDef>Acciones</th>
                <td mat-cell *matCellDef="let expediente">
                  <button mat-icon-button (click)="verDetalle(expediente.IdExpediente)" matTooltip="Ver detalle">
                    <mat-icon>visibility</mat-icon>
                  </button>
                  <button mat-icon-button (click)="editarExpediente(expediente.IdExpediente)" matTooltip="Editar">
                    <mat-icon>edit</mat-icon>
                  </button>
                  <button mat-icon-button color="warn" (click)="eliminarExpediente(expediente.IdExpediente)" matTooltip="Eliminar">
                    <mat-icon>delete</mat-icon>
                  </button>
                </td>
              </ng-container>

              <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
              <tr mat-row *matRowDef="let row; columns: displayedColumns;" 
                  (click)="verDetalle(row.IdExpediente)" 
                  class="clickable-row"
                  matTooltip="">
              </tr>
            </table>
          </div>

          <!-- Paginación personalizada -->
          <div class="custom-pagination">
            <div class="page-size-selector">
              <span>Mostrar:</span>
              <button 
                mat-button 
                [class.active]="pageSize === 5"
                (click)="changePageSize(5)">
                5
              </button>
              <button 
                mat-button 
                [class.active]="pageSize === 10"
                (click)="changePageSize(10)">
                10
              </button>
              <button 
                mat-button 
                [class.active]="pageSize === 25"
                (click)="changePageSize(25)">
                25
              </button>
              <button 
                mat-button 
                [class.active]="pageSize === 50"
                (click)="changePageSize(50)">
                50
              </button>
            </div>

            <div class="pagination-info">
              {{ (currentPage * pageSize) + 1 }} - {{ Math.min((currentPage + 1) * pageSize, totalExpedientes) }} de {{ totalExpedientes }}
            </div>

            <div class="pagination-controls">
              <button mat-icon-button [disabled]="currentPage === 0" (click)="firstPage()" matTooltip="Primera página">
                <mat-icon>first_page</mat-icon>
              </button>
              <button mat-icon-button [disabled]="currentPage === 0" (click)="previousPage()" matTooltip="Anterior">
                <mat-icon>chevron_left</mat-icon>
              </button>
              <span class="page-number">Página {{ currentPage + 1 }} de {{ totalPages }}</span>
              <button mat-icon-button [disabled]="currentPage >= totalPages - 1" (click)="nextPage()" matTooltip="Siguiente">
                <mat-icon>chevron_right</mat-icon>
              </button>
              <button mat-icon-button [disabled]="currentPage >= totalPages - 1" (click)="lastPage()" matTooltip="Última página">
                <mat-icon>last_page</mat-icon>
              </button>
            </div>
          </div>
        </mat-card-content>
      </mat-card>
    </div>
  `, 
  styles: [`
    .expedientes-container {
      padding: 20px;
      max-width: 1200px;
      margin: 0 auto;
    }

    mat-card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;
    }

    mat-card-title {
      color: #333 !important;
      font-weight: 600;
    }

    .header-actions {
      display: flex;
      gap: 10px;
    }

    .header-actions button {
      background-color: #416759 !important;
      color: white !important;
    }

    .header-actions button:hover {
      background-color: #335248 !important;
    }

    .filters-section {
      display: flex;
      gap: 16px;
      margin-bottom: 24px;
      flex-wrap: wrap;
      align-items: center;
    }

    .filters-section mat-form-field {
      min-width: 200px;
    }

    .table-container {
      position: relative;
      min-height: 200px;
      margin-bottom: 20px;
    }

    .expedientes-table {
      width: 100%;
    }

    .clickable-row {
      cursor: pointer;
      transition: background-color 0.2s ease;
    }

    .clickable-row:hover {
      background-color: #e8f4f1;
    }

    .estado-badge {
      padding: 4px 8px;
      border-radius: 12px;
      font-size: 12px;
      font-weight: 500;
      text-transform: uppercase;
    }

    .estado-activo {
      background-color: #e8f4f1;
      color: #416759;
    }

    .estado-cerrado {
      background-color: #ffebee;
      color: #c62828;
    }

    .estado-suspendido {
      background-color: #fff3e0;
      color: #ef6c00;
    }

    .estado-sin-estado {
      background-color: #f5f5f5;
      color: #757575;
    }

    mat-progress-spinner {
      margin: 20px auto;
      display: block;
    }

    /* Personalización de spinner y iconos */
    mat-progress-spinner {
      --mdc-circular-progress-active-indicator-color: #416759;
    }

    mat-card-title mat-icon {
      color: #416759;
    }

    @media (max-width: 768px) {
      .filters-section {
        flex-direction: column;
        align-items: stretch;
      }
      
      .filters-section mat-form-field {
        min-width: unset;
        width: 100%;
      }
    }
  `]
})
export class ExpedientesListComponent implements OnInit {
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  expedientes: Expediente[] = [];
  displayedColumns: string[] = [
  'CodigoExpediente', 
  'PrimerDueno',
    'Caratula', 
    'Estado', 
    'Dependencia', 
    'FechaInicio', 
    'acciones'
  ];
  
  totalExpedientes = 0;
  pageSize = 10;
  currentPage = 0;
  loading = false;

  filters: ExpedienteFilter = {};

  // Para usar Math en el template
  Math = Math;

  constructor(
    private expedienteService: ExpedienteService,
    private router: Router,
    private http: HttpClient,
    private sanitizer: DomSanitizer
  ) {}

  // Getter para calcular total de páginas
  get totalPages(): number {
    return Math.ceil(this.totalExpedientes / this.pageSize);
  }
  descargarPDF() {
    // Llama al endpoint del backend que devuelve el HTML del reporte
    this.http.get(`${API_BASE_URL}/expedientes/reporte/html`, { responseType: 'text' }).subscribe({
      next: (html) => {
        const ventana = window.open('', '_blank');
        if (ventana) {
          ventana.document.write(html);
          ventana.document.close();
          // Espera a que cargue y convierte a PDF
          ventana.onload = () => {
            html2pdf().from(ventana.document.body).set({ filename: 'expedientes.pdf' }).save().then(() => {
              ventana.close(); // Cierra la ventana después de descargar
            });
          };
        }
      },
      error: (err) => {
        console.error('Error al obtener el reporte HTML:', err);
      }
    });
  }

  ngOnInit(): void {
    this.loadExpedientes();
  }

  loadExpedientes(): void {
    this.loading = true;
    this.expedienteService.getExpedientes(this.currentPage, this.pageSize, this.filters)
      .subscribe({
        next: (response) => {
          console.log('Expedientes recibidos:', response); // Debug
          if (response && response.data && response.data.length > 0) {
            response.data.forEach((exp, idx) => {
              console.log(`Expediente[${idx}]:`, exp);
            });
          }
          this.expedientes = response.data;
          this.totalExpedientes = response.total;
          this.loading = false;
        },
        error: (error) => {
          console.error('Error al cargar expedientes:', error);
          this.loading = false;
        }
      });
  }

  onPageChange(event: PageEvent): void {
    this.currentPage = event.pageIndex;
    this.pageSize = event.pageSize;
    this.loadExpedientes();
  }

  onFilterChange(): void {
    this.currentPage = 0;
    if (this.paginator) {
      this.paginator.firstPage();
    }
    this.loadExpedientes();
  }

  clearFilters(): void {
    this.filters = {};
    this.onFilterChange();
  }

  crearExpediente() {
    this.router.navigate(['/expedientes/nuevo']);
  }

  verDetalle(id: number): void {
    this.router.navigate(['/expedientes', id]);
  }

  editarExpediente(id: number): void {
    this.router.navigate(['/expedientes', id, 'editar']);
  }

  eliminarExpediente(id: number): void {
    // TODO: Mostrar confirmación y eliminar
    console.log('Eliminar expediente:', id);
  }

  // Utilidad para mostrar valores en tabla
  mostrarDato(valor: any): string {
    return valor !== undefined && valor !== null && valor !== '' ? valor : 'Sin dato';
  }

  // Métodos de paginación personalizada
  changePageSize(size: number): void {
    this.pageSize = size;
    this.currentPage = 0;
    this.loadExpedientes();
  }

  firstPage(): void {
    this.currentPage = 0;
    this.loadExpedientes();
  }

  previousPage(): void {
    if (this.currentPage > 0) {
      this.currentPage--;
      this.loadExpedientes();
    }
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages - 1) {
      this.currentPage++;
      this.loadExpedientes();
    }
  }

  lastPage(): void {
    this.currentPage = this.totalPages - 1;
    this.loadExpedientes();
  }
}
