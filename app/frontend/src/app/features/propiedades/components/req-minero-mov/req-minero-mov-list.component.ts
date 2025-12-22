import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { ReqMineroMovService, ReqMineroMov, ReqMinero } from '../../services/req-minero-mov.service';

@Component({
  selector: 'app-req-minero-mov-list',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatChipsModule,
    MatTooltipModule,
    MatProgressSpinnerModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    ReactiveFormsModule,
    MatSnackBarModule
  ],
  template: `
    <div class="req-minero-mov-container">
      <!-- Header -->
      <div class="header">
        <h1>Requerimientos Mineros</h1>
        <div class="header-actions">
          <button mat-raised-button color="accent" class="create-button" (click)="crearRequerimiento()">
            <mat-icon>add</mat-icon>
            Nuevo Requerimiento
          </button>
          <button mat-raised-button color="primary" class="add-button" (click)="volver()">
            <mat-icon>arrow_back</mat-icon>
            Volver a Propiedades
          </button>
        </div>
      </div>

      <!-- Filtros Card -->
      <mat-card class="filters-card">
        <mat-card-header>
          <mat-card-title>
            <mat-icon>filter_list</mat-icon>
            Filtros
          </mat-card-title>
        </mat-card-header>
        <mat-card-content>
          <form [formGroup]="filterForm" class="filters-form">
            <mat-form-field appearance="outline" class="filter-field">
              <mat-label>Tipo de Requerimiento</mat-label>
              <mat-select formControlName="IdReqMinero">
                <mat-option value="">Todos</mat-option>
                <mat-option *ngFor="let reqMinero of reqMineros" [value]="reqMinero.IdReqMinero">
                  {{ reqMinero.Tipo || 'Sin tipo' }}
                </mat-option>
              </mat-select>
            </mat-form-field>

            <mat-form-field appearance="outline" class="filter-field">
              <mat-label>Descripción</mat-label>
              <input matInput formControlName="Descripcion" placeholder="Buscar por descripción...">
            </mat-form-field>

            <div class="filter-actions">
              <button mat-raised-button color="primary" (click)="applyFilters()">
                <mat-icon>search</mat-icon>
                Buscar
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
            Resultados ({{ totalRequerimientos }})
          </mat-card-title>
        </mat-card-header>
        <mat-card-content>
          <!-- Loading spinner -->
          <div *ngIf="loading" class="loading-container">
            <mat-spinner diameter="50"></mat-spinner>
            <p>Cargando requerimientos mineros...</p>
          </div>

          <!-- No data message -->
          <div *ngIf="!loading && reqMineroMovs.length === 0" class="no-data">
            <mat-icon>info</mat-icon>
            <p>No se encontraron requerimientos mineros.</p>
          </div>

          <!-- Table -->
          <div class="table-container" *ngIf="!loading && reqMineroMovs.length > 0">
            <table mat-table [dataSource]="reqMineroMovs" class="full-width mat-elevation-z1">
              <!-- ID Column -->
              <ng-container matColumnDef="IdReqMineroMov">
                <th mat-header-cell *matHeaderCellDef>ID</th>
                <td mat-cell *matCellDef="let req">
                  <span class="id-pill">{{ req.IdReqMineroMov }}</span>
                </td>
              </ng-container>

              <!-- Propiedad Minera Column -->
              <ng-container matColumnDef="IdPropiedadMinera">
                <th mat-header-cell *matHeaderCellDef>Propiedad Minera</th>
                <td mat-cell *matCellDef="let req">
                  <span class="propiedad-link" (click)="verPropiedad(req.IdPropiedadMinera)">
                    <mat-icon>business</mat-icon>
                    ID: {{ req.IdPropiedadMinera }}
                  </span>
                </td>
              </ng-container>

              <!-- Tipo Requerimiento Column -->
              <ng-container matColumnDef="TipoRequerimiento">
                <th mat-header-cell *matHeaderCellDef>Tipo</th>
                <td mat-cell *matCellDef="let req">
                  <mat-chip [class]="getTipoChipClass(req.IdReqMinero)">
                    {{ getTipoRequerimiento(req.IdReqMinero) }}
                  </mat-chip>
                </td>
              </ng-container>

              <!-- Descripción Column -->
              <ng-container matColumnDef="Descripcion">
                <th mat-header-cell *matHeaderCellDef>Descripción</th>
                <td mat-cell *matCellDef="let req">
                  <div class="descripcion-cell">
                    {{ req.Descripcion || 'Sin descripción' }}
                  </div>
                </td>
              </ng-container>

              <!-- Fecha Inicio Column -->
              <ng-container matColumnDef="FechaInicio">
                <th mat-header-cell *matHeaderCellDef>Desde</th>
                <td mat-cell *matCellDef="let req">
                  {{ req.FechaInicio ? (req.FechaInicio | date: 'dd/MM/yyyy') : '-' }}
                </td>
              </ng-container>

              <!-- Fecha Fin Column -->
              <ng-container matColumnDef="FechaFin">
                <th mat-header-cell *matHeaderCellDef>Hasta</th>
                <td mat-cell *matCellDef="let req">
                  {{ req.FechaFin ? (req.FechaFin | date: 'dd/MM/yyyy') : '-' }}
                </td>
              </ng-container>

              <!-- Importe Column -->
              <ng-container matColumnDef="Importe">
                <th mat-header-cell *matHeaderCellDef>Importe</th>
                <td mat-cell *matCellDef="let req">
                  <span *ngIf="req.Importe" class="importe-cell">
                    $ {{ req.Importe | number: '1.2-2' }}
                  </span>
                  <span *ngIf="!req.Importe">-</span>
                </td>
              </ng-container>

              <!-- Actions Column -->
              <ng-container matColumnDef="actions">
                <th mat-header-cell *matHeaderCellDef class="actions-header">Acciones</th>
                <td mat-cell *matCellDef="let req" class="actions-cell">
                  <button mat-icon-button 
                          matTooltip="Ver propiedad"
                          (click)="verPropiedad(req.IdPropiedadMinera)">
                    <mat-icon>visibility</mat-icon>
                  </button>
                </td>
              </ng-container>

              <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
              <tr mat-row *matRowDef="let row; columns: displayedColumns" class="table-row"></tr>
            </table>

            <!-- Pagination -->
            <div class="pagination-container">
              <div class="page-size-selector">
                <span>Mostrar:</span>
                <button mat-button [class.active]="pageSize === 10" (click)="changePageSize(10)">10</button>
                <button mat-button [class.active]="pageSize === 25" (click)="changePageSize(25)">25</button>
                <button mat-button [class.active]="pageSize === 50" (click)="changePageSize(50)">50</button>
              </div>
              
              <div class="pagination-controls">
                <button mat-icon-button [disabled]="pageIndex === 0" (click)="firstPage()" matTooltip="Primera página">
                  <mat-icon>first_page</mat-icon>
                </button>
                <button mat-icon-button [disabled]="pageIndex === 0" (click)="previousPage()" matTooltip="Anterior">
                  <mat-icon>chevron_left</mat-icon>
                </button>
                <span class="page-info">Página {{ pageIndex + 1 }} de {{ totalPages }}</span>
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
  `,
  styles: [`
    .req-minero-mov-container {
      max-width: 1400px;
      margin: 0 auto;
      padding: 24px;
    }

    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 24px;
    }

    .header-actions {
      display: flex;
      gap: 12px;
    }

    .header h1 {
      margin: 0;
      color: #333;
      font-size: 28px;
      font-weight: 500;
    }

    .create-button {
      height: 48px;
      padding: 0 24px;
      background-color: #4caf50 !important;
      color: white !important;
    }

    .create-button:hover {
      background-color: #388e3c !important;
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
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 16px;
      align-items: center;
    }

    .filter-field {
      width: 100%;
    }

    .filter-actions {
      display: flex;
      gap: 12px;
      align-items: center;
    }

    .results-card {
      margin-top: 24px;
    }

    mat-card-title {
      display: flex;
      align-items: center;
      gap: 8px;
      color: #333 !important;
    }

    .loading-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 48px 0;
      color: #666;
    }

    .loading-container p {
      margin-top: 16px;
    }

    .no-data {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 48px 0;
      color: #999;
    }

    .no-data mat-icon {
      font-size: 48px;
      width: 48px;
      height: 48px;
      margin-bottom: 16px;
    }

    .table-container {
      overflow-x: auto;
      margin-top: 16px;
    }

    .full-width {
      width: 100%;
      background: white;
    }

    .table-row {
      cursor: pointer;
      transition: background-color 0.2s;
    }

    .table-row:hover {
      background-color: #f5f5f5;
    }

    .id-pill {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      min-width: 48px;
      padding: 4px 10px;
      border-radius: 999px;
      background-color: rgba(63, 104, 89, 0.1);
      color: #1f4136;
      font-weight: 600;
      font-size: 14px;
    }

    .propiedad-link {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      color: #416759;
      cursor: pointer;
      transition: color 0.2s;
    }

    .propiedad-link:hover {
      color: #2a4438;
      text-decoration: underline;
    }

    .propiedad-link mat-icon {
      font-size: 18px;
      width: 18px;
      height: 18px;
    }

    .descripcion-cell {
      max-width: 300px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .importe-cell {
      font-weight: 600;
      color: #2e7d32;
    }

    mat-chip {
      font-weight: 500;
    }

    .chip-canon {
      background-color: #e3f2fd !important;
      color: #1976d2 !important;
    }

    .chip-patente {
      background-color: #f3e5f5 !important;
      color: #7b1fa2 !important;
    }

    .chip-canon-superficiario {
      background-color: #fff3e0 !important;
      color: #e65100 !important;
    }

    .chip-otros {
      background-color: #e0e0e0 !important;
      color: #424242 !important;
    }

    .actions-header {
      text-align: center;
    }

    .actions-cell {
      text-align: center;
    }

    th, .mat-mdc-header-cell {
      background-color: #416759;
      color: #fff !important;
      font-weight: 600;
    }

    td, .mat-mdc-cell {
      color: #333 !important;
    }

    .pagination-container {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-top: 16px;
      padding: 16px;
      border-top: 1px solid #e0e0e0;
    }

    .page-size-selector {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .page-size-selector span {
      color: #666;
      font-size: 14px;
    }

    .page-size-selector button {
      min-width: 40px;
    }

    .page-size-selector button.active {
      background-color: #416759;
      color: white;
    }

    .pagination-controls {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .page-info {
      margin: 0 16px;
      color: #666;
      font-size: 14px;
    }

    @media (max-width: 768px) {
      .req-minero-mov-container {
        padding: 16px;
      }

      .header {
        flex-direction: column;
        align-items: stretch;
        gap: 16px;
      }

      .header-actions {
        flex-direction: column;
        width: 100%;
      }

      .header-actions button {
        width: 100%;
      }

      .filters-form {
        grid-template-columns: 1fr;
      }

      .pagination-container {
        flex-direction: column;
        gap: 16px;
      }
    }
  `]
})
export class ReqMineroMovListComponent implements OnInit {
  reqMineroMovs: ReqMineroMov[] = [];
  reqMineros: ReqMinero[] = [];
  displayedColumns: string[] = [
    'IdReqMineroMov',
    'IdPropiedadMinera',
    'TipoRequerimiento',
    'Descripcion',
    'FechaInicio',
    'FechaFin',
    'Importe',
    'actions'
  ];
  
  loading = false;
  filterForm: FormGroup;
  
  // Paginación
  pageIndex = 0;
  pageSize = 25;
  totalRequerimientos = 0;
  totalPages = 0;

  constructor(
    private reqMineroMovService: ReqMineroMovService,
    private router: Router,
    private fb: FormBuilder,
    private snackBar: MatSnackBar
  ) {
    this.filterForm = this.fb.group({
      IdReqMinero: [''],
      Descripcion: ['']
    });
  }

  ngOnInit() {
    this.loadReqMineros();
    this.loadReqMineroMovs();
  }

  loadReqMineros() {
    this.reqMineroMovService.getReqMineros().subscribe({
      next: (reqMineros) => {
        this.reqMineros = reqMineros;
      },
      error: (error) => {
        console.error('Error loading req mineros:', error);
      }
    });
  }

  loadReqMineroMovs() {
    this.loading = true;
    
    const filters = {
      IdReqMinero: this.filterForm.value.IdReqMinero || undefined,
      Descripcion: this.filterForm.value.Descripcion || undefined,
      range: [this.pageIndex * this.pageSize, (this.pageIndex + 1) * this.pageSize - 1]
    };

    this.reqMineroMovService.getReqMineroMovs(filters).subscribe({
      next: (response) => {
        this.reqMineroMovs = response.data;
        this.totalRequerimientos = response.total;
        this.totalPages = Math.ceil(this.totalRequerimientos / this.pageSize);
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading req minero movs:', error);
        this.loading = false;
        this.snackBar.open('Error al cargar los requerimientos mineros', 'Cerrar', {
          duration: 3000
        });
      }
    });
  }

  applyFilters() {
    this.pageIndex = 0;
    this.loadReqMineroMovs();
  }

  clearFilters() {
    this.filterForm.reset();
    this.pageIndex = 0;
    this.loadReqMineroMovs();
  }

  getTipoRequerimiento(idReqMinero?: number): string {
    if (!idReqMinero) return 'N/A';
    const reqMinero = this.reqMineros.find(r => r.IdReqMinero === idReqMinero);
    return reqMinero?.Tipo || 'N/A';
  }

  getTipoChipClass(idReqMinero?: number): string {
    if (!idReqMinero) return 'chip-otros';
    
    const tipo = this.getTipoRequerimiento(idReqMinero).toLowerCase();
    
    if (tipo.includes('canon')) {
      if (tipo.includes('superficiario')) {
        return 'chip-canon-superficiario';
      }
      return 'chip-canon';
    }
    if (tipo.includes('patente')) return 'chip-patente';
    
    return 'chip-otros';
  }

  verPropiedad(idPropiedadMinera?: number) {
    if (idPropiedadMinera) {
      this.router.navigate(['/propiedades', idPropiedadMinera, 'detalle']);
    }
  }

  volver() {
    this.router.navigate(['/propiedades']);
  }

  crearRequerimiento() {
    // Mostrar mensaje informando que debe crear el requerimiento desde una propiedad específica
    this.snackBar.open(
      'Para crear un requerimiento minero, debe hacerlo desde el detalle de una Propiedad Minera',
      'Ir a Propiedades',
      {
        duration: 5000
      }
    ).onAction().subscribe(() => {
      this.router.navigate(['/propiedades']);
    });
  }

  // Paginación
  changePageSize(size: number) {
    this.pageSize = size;
    this.pageIndex = 0;
    this.loadReqMineroMovs();
  }

  firstPage() {
    this.pageIndex = 0;
    this.loadReqMineroMovs();
  }

  previousPage() {
    if (this.pageIndex > 0) {
      this.pageIndex--;
      this.loadReqMineroMovs();
    }
  }

  nextPage() {
    if (this.pageIndex < this.totalPages - 1) {
      this.pageIndex++;
      this.loadReqMineroMovs();
    }
  }

  lastPage() {
    this.pageIndex = this.totalPages - 1;
    this.loadReqMineroMovs();
  }
}
