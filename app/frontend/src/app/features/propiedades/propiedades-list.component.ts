import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule, MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatMenuModule } from '@angular/material/menu';
import { PropiedadMineraService } from './services/propiedad-minera.service';
import { TitularMineroService, TitularMinero } from '../titulares/services/titular.service';
import { PropiedadMinera, PropiedadMineraFilter } from './models/propiedad-minera.model';
import { API_BASE_URL } from '../../core/api.constants';
import html2pdf from 'html2pdf.js';

@Component({
  selector: 'app-propiedades-list',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatButtonModule,
    MatIconModule,
    MatInputModule,
    MatSelectModule,
    MatFormFieldModule,
    MatChipsModule,
    MatTooltipModule,
    MatMenuModule
  ],
  template: `
    <div class="propiedades-container">
      <!-- Header -->
      <div class="header">
        <h1>Propiedades Mineras</h1>
        <div style="display: flex; gap: 12px;">
          <button mat-raised-button color="primary" class="add-button" (click)="crearPropiedad()">
            <mat-icon>add</mat-icon>
            Nueva Propiedad
          </button>
          <button mat-raised-button color="accent" (click)="descargarPDF()">
            <mat-icon>print</mat-icon>
            Imprimir
          </button>
        </div>
      </div>

      <!-- Filters Card -->
      <mat-card class="filters-card">
        <mat-card-header>
          <mat-card-title>Filtros de Búsqueda</mat-card-title>
        </mat-card-header>
        <mat-card-content>
          <form [formGroup]="filterForm" class="filters-form">
            <div class="filter-row">
              <mat-form-field appearance="outline" class="filter-nombre input-height">
                <mat-label>Nombre</mat-label>
                <input matInput formControlName="Nombre" placeholder="Buscar propiedad...">
                <mat-icon matSuffix>search</mat-icon>
              </mat-form-field>

              <mat-form-field appearance="outline" class="input-height">
                <mat-label>Provincia</mat-label>
                <mat-select formControlName="Provincia">
                  <mat-option value="">Todas</mat-option>
                  <mat-option *ngFor="let provincia of provincias" [value]="provincia">
                    {{provincia}}
                  </mat-option>
                </mat-select>
              </mat-form-field>

              <mat-form-field appearance="outline" class="input-height">
                <mat-label>Titular</mat-label>
                <mat-select formControlName="IdTitular">
                  <mat-option value="">Todos</mat-option>
                  <mat-option *ngFor="let titular of titulares" [value]="titular.IdTitular">
                    {{titular.Nombre}} - {{titular.DniCuit}}
                  </mat-option>
                </mat-select>
              </mat-form-field>

              <mat-form-field appearance="outline" class="input-height" style="align-items: center;">
                <mat-label>Expediente</mat-label>
                <input matInput formControlName="Expediente" placeholder="Buscar por expediente...">
              </mat-form-field>
            </div>

            <div class="filter-actions">
              <button mat-raised-button color="primary" (click)="applyFilters()">
                <mat-icon>filter_list</mat-icon>
                Aplicar Filtros
              </button>
              <button mat-button (click)="clearFilters()">
                <mat-icon>clear</mat-icon>
                Limpiar
              </button>
            </div>
          </form>
        </mat-card-content>
      </mat-card>

      <!-- Results Card -->
      <mat-card class="results-card">
        <mat-card-header>
          <mat-card-title>
            Resultados ({{propiedades.length}})
          </mat-card-title>
        </mat-card-header>
        <mat-card-content>
          <div class="table-container">
            <table mat-table [dataSource]="propiedades" class="propiedades-table" matSort>
              <!-- Nombre Column -->
              <ng-container matColumnDef="Nombre">
                <th mat-header-cell *matHeaderCellDef mat-sort-header>Nombre</th>
                <td mat-cell *matCellDef="let propiedad">
                  <div class="cell-content">
                    <span class="primary-text">{{propiedad.Nombre || 'Sin nombre'}}</span>
                    <span class="secondary-text" *ngIf="propiedad.TitularNombre">Titular: {{propiedad.TitularNombre}}</span>
                    <span class="secondary-text" *ngIf="!propiedad.TitularNombre && propiedad.IdTitular">Titular ID: {{propiedad.IdTitular}}</span>
                  </div>
                </td>
              </ng-container>

              <!-- Provincia Column -->
              <ng-container matColumnDef="Provincia">
                <th mat-header-cell *matHeaderCellDef mat-sort-header>Provincia</th>
                <td mat-cell *matCellDef="let propiedad">
                  <mat-chip-set>
                    <mat-chip>{{propiedad.Provincia || 'No especificada'}}</mat-chip>
                  </mat-chip-set>
                </td>
              </ng-container>

              <!-- Area Column -->
              <ng-container matColumnDef="AreaHectareas">
                <th mat-header-cell *matHeaderCellDef mat-sort-header>Área (Ha)</th>
                <td mat-cell *matCellDef="let propiedad">
                  <div class="area-info">
                    <span>{{propiedad.AreaHectareas || 0}} ha</span>
                  </div>
                </td>
              </ng-container>

              <!-- Fecha Solicitud Column -->
              <ng-container matColumnDef="Solicitud">
                <th mat-header-cell *matHeaderCellDef mat-sort-header>Fecha Solicitud</th>
                <td mat-cell *matCellDef="let propiedad">
                  <span *ngIf="propiedad.Solicitud; else noFecha">
                    {{propiedad.Solicitud | date:'dd/MM/yyyy'}}
                  </span>
                  <ng-template #noFecha>
                    <span class="no-data">No registrada</span>
                  </ng-template>
                </td>
              </ng-container>

              <!-- Referente Column -->
              <ng-container matColumnDef="Referente">
                <th mat-header-cell *matHeaderCellDef>Referente</th>
                <td mat-cell *matCellDef="let propiedad">
                  <mat-icon
                    class="referente-star"
                    [ngClass]="{
                      'star-on': propiedad.Referente === true
                    }"
                    matTooltip="{{ propiedad.Referente === true ? 'Referente' : 'No referente' }}"
                  >
                    {{ propiedad.Referente === true ? 'star' : 'star_border' }}
                  </mat-icon>
                </td>
              </ng-container>

              <!-- Actions Column -->
              <ng-container matColumnDef="actions">
                <th mat-header-cell *matHeaderCellDef>Acciones</th>
                <td mat-cell *matCellDef="let propiedad">
                  <button mat-icon-button [matMenuTriggerFor]="actionMenu" 
                          [matMenuTriggerData]="{propiedad: propiedad}">
                    <mat-icon>more_vert</mat-icon>
                  </button>
                </td>
              </ng-container>

              <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
              <tr mat-row *matRowDef="let row; columns: displayedColumns;" 
                  class="table-row" (click)="viewPropiedad(row)"></tr>
            </table>

            <!-- Paginación personalizada -->
            <div class="custom-pagination">
              <div class="page-size-selector">
                <span>Mostrar:</span>
                <button mat-button [class.active]="pageSize === 5" (click)="changePageSize(5)">5</button>
                <button mat-button [class.active]="pageSize === 10" (click)="changePageSize(10)">10</button>
                <button mat-button [class.active]="pageSize === 25" (click)="changePageSize(25)">25</button>
                <button mat-button [class.active]="pageSize === 50" (click)="changePageSize(50)">50</button>
              </div>

              <div class="pagination-info">
                {{ (pageIndex * pageSize) + 1 }} - {{ Math.min((pageIndex + 1) * pageSize, totalRecords) }} de {{ totalRecords }}
              </div>

              <div class="pagination-controls">
                <button mat-icon-button [disabled]="pageIndex === 0" (click)="firstPage()" matTooltip="Primera página">
                  <mat-icon>first_page</mat-icon>
                </button>
                <button mat-icon-button [disabled]="pageIndex === 0" (click)="previousPage()" matTooltip="Anterior">
                  <mat-icon>chevron_left</mat-icon>
                </button>
                <span class="page-number">Página {{ pageIndex + 1 }} de {{ totalPages }}</span>
                <button mat-icon-button [disabled]="pageIndex >= totalPages - 1" (click)="nextPage()" matTooltip="Siguiente">
                  <mat-icon>chevron_right</mat-icon>
                </button>
                <button mat-icon-button [disabled]="pageIndex >= totalPages - 1" (click)="lastPage()" matTooltip="Última página">
                  <mat-icon>last_page</mat-icon>
                </button>
              </div>
            </div>
          </div>
        </mat-card-content>
      </mat-card>
    </div>

    <!-- Action Menu -->
    <mat-menu #actionMenu="matMenu">
      <ng-template matMenuContent let-propiedad="propiedad">
        <button mat-menu-item (click)="viewPropiedad(propiedad)">
          <mat-icon>visibility</mat-icon>
          <span>Ver Detalles</span>
        </button>
        <button mat-menu-item (click)="editPropiedad(propiedad)">
          <mat-icon>edit</mat-icon>
          <span>Editar</span>
        </button>
        <button mat-menu-item (click)="deletePropiedad(propiedad)">
          <mat-icon>delete</mat-icon>
          <span>Eliminar</span>
        </button>
      </ng-template>
    </mat-menu>
  `,
  styles: [`
    .propiedades-container {
      max-width: 1400px;
      margin: 0 auto;
    }

    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 24px;
    }

    .header h1,
    .mat-card-title,
    .primary-text,
    .secondary-text,
    label,
    td,
    .mat-mdc-cell {
      color: #333 !important;
    }
    th,
    .mat-mdc-header-cell {
      color: #fff !important;
    }

    .add-button {
      height: 48px;
      padding: 0 24px;
      background-color: #416759 !important;
      color: white !important;
    }

    .add-button:hover {
      background-color: #335248 !important;
    }

    .filters-card {
      margin-bottom: 24px;
    }

    .filters-form {
      margin-top: 16px;
    }

    .filter-row {
      display: grid;
      grid-template-columns: 1fr 1fr 1fr;
      gap: 16px;
      margin-bottom: 16px;
    }

    .filter-actions {
      display: flex;
      gap: 12px;
      padding-top: 8px;
    }

    .results-card {
      margin-bottom: 24px;
    }

    .table-container {
      overflow-x: auto;
      margin-top: 16px;
    }

    .propiedades-table {
      width: 100%;
      background: white;
    }

    .table-row {
      cursor: pointer;
      transition: background-color 0.2s;
    }

    .table-row:hover {
      background-color: #e8f4f1;
    }

    .id-number {
      font-weight: 500;
      color: #416759;
    }

    .cell-content {
      display: flex;
      flex-direction: column;
    }

    .primary-text {
      font-weight: 500;
      color: #416759;
    }

    .secondary-text {
      font-size: 0.85rem;
      color: #666;
      margin-top: 2px;
    }

    .area-info {
      display: flex;
      flex-direction: column;
    }

    .labor-chip {
      background-color: #416759 !important;
      color: white !important;
    }

    .no-data {
      color: #999;
      font-style: italic;
    }

    .paginator {
      margin-top: 16px;
      border-top: 1px solid #e8f0ec;
    }

    .mat-mdc-paginator {
      background: transparent;
    }

    .filter-nombre {
      min-width: 0;
      max-width: none;
      width: 100%;
    }

    .input-height {
      max-height: 50px;
    }

    .referente-star {
      font-size: 1.2rem;
      vertical-align: middle;
    }

    .star-on {
      color: gold;
    }

    @media (max-width: 768px) {
      .filter-row {
        grid-template-columns: 1fr;
      }
      
      .header {
        flex-direction: column;
        align-items: stretch;
        gap: 16px;
      }
    }
  `]
})
export class PropiedadesListComponent implements OnInit {
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  
  propiedades: PropiedadMinera[] = [];
  filterForm: FormGroup;
  displayedColumns: string[] = [
    'Nombre',
    'Referente',
    'Provincia',
    'AreaHectareas',
    'Solicitud',
    'actions'
  ];

  provincias: string[] = [];
  titulares: TitularMinero[] = [];

  // Propiedades de paginación
  totalRecords = 0;
  pageSize = 10;
  pageIndex = 0;
  pageSizeOptions = [5, 10, 25, 50];

  // Para usar Math en el template
  Math = Math;

  // Getter para calcular total de páginas
  get totalPages(): number {
    return Math.ceil(this.totalRecords / this.pageSize);
  }

  constructor(
    private propiedadService: PropiedadMineraService,
    private fb: FormBuilder,
    private router: Router,
    private titularService: TitularMineroService,
    private http: HttpClient
  ) {
    this.filterForm = this.fb.group({
      Nombre: [''],
      Provincia: [''],
      IdTitular: [''],
      Expediente: ['']
    });
  }

  ngOnInit() {
    this.loadDropdownData();
    this.loadTitulares();
    this.loadPropiedades();
  }

  loadDropdownData() {
    this.provincias = this.propiedadService.getProvincias();
  }

  loadTitulares() {
    this.titularService.getAll().subscribe({
      next: (titulares) => {
        this.titulares = titulares;
      },
      error: (error) => {
        console.error('Error cargando titulares:', error);
      }
    });
  }

  loadPropiedades(filters?: PropiedadMineraFilter) {
    // Calcular el rango para la paginación
    const start = this.pageIndex * this.pageSize;
    const end = start + this.pageSize - 1;
    
    const paginatedFilters: PropiedadMineraFilter = {
      ...filters,
      range: [start, end]
    };

    this.propiedadService.getPropiedades(paginatedFilters).subscribe({
      next: (response) => {
        // Ordenar: primero los que tienen Referente true (removido, ahora lo hace el backend)
        this.propiedades = response.data;
        this.totalRecords = response.total;
      },
      error: (error) => {
        console.error('Error loading propiedades:', error);
        this.propiedades = [];
        this.totalRecords = 0;
        // Aquí podrías mostrar un mensaje de error al usuario
      }
    });
  }

  onPageChange(event: PageEvent) {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    this.applyFilters();
  }

  applyFilters() {
    const filters = this.filterForm.value;
    this.loadPropiedades(filters);
  }

  clearFilters() {
    this.filterForm.reset();
    this.pageIndex = 0; // Resetear a la primera página
    this.loadPropiedades();
  }

  crearPropiedad() {
    this.router.navigate(['/propiedades/nueva']);
  }

  viewPropiedad(propiedad: PropiedadMinera) {
    console.log('Ver propiedad:', propiedad);
    this.router.navigate(['/propiedades', propiedad.IdPropiedadMinera, 'detalle']);
  }

  editPropiedad(propiedad: PropiedadMinera) {
    this.router.navigate(['/propiedades', propiedad.IdPropiedadMinera, 'editar']);
  }

  deletePropiedad(propiedad: PropiedadMinera) {
    if (confirm(`¿Está seguro de que desea eliminar la propiedad "${propiedad.Nombre}"?`)) {
      this.propiedadService.deletePropiedad(propiedad.IdPropiedadMinera).subscribe({
        next: () => {
          console.log('Propiedad eliminada correctamente');
          // Recargar la lista
          this.loadPropiedades();
        },
        error: (error) => {
          console.error('Error eliminando propiedad:', error);
          alert('Error al eliminar la propiedad');
        }
      });
    }
  }

  descargarPDF() {
    this.http.get(`${API_BASE_URL}/propiedades-mineras/reporte/html`, { responseType: 'text' }).subscribe({
      next: (html) => {
        const ventana = window.open('', '_blank');
        if (ventana) {
          ventana.document.write(html);
          ventana.document.close();
          ventana.onload = () => {
            html2pdf().from(ventana.document.body).set({ filename: 'propiedades-mineras.pdf' }).save().then(() => {
              ventana.close();
            });
          };
        }
      },
      error: (err) => {
        console.error('Error al obtener el reporte HTML:', err);
      }
    });
  }

  // Métodos de paginación personalizada
  changePageSize(size: number): void {
    this.pageSize = size;
    this.pageIndex = 0;
    this.loadPropiedades();
  }

  firstPage(): void {
    this.pageIndex = 0;
    this.loadPropiedades();
  }

  previousPage(): void {
    if (this.pageIndex > 0) {
      this.pageIndex--;
      this.loadPropiedades();
    }
  }

  nextPage(): void {
    if (this.pageIndex < this.totalPages - 1) {
      this.pageIndex++;
      this.loadPropiedades();
    }
  }

  lastPage(): void {
    this.pageIndex = this.totalPages - 1;
    this.loadPropiedades();
  }
}
