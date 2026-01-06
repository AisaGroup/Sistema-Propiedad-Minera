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
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { ReqMineroMovService, ReqMineroMov, ReqMinero, ReqMinExp } from '../../services/req-minero-mov.service';
import { ExpedienteService } from '../../../expedientes/services/expediente.service';
import { Expediente } from '../../../expedientes/models/expediente.model';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

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
    MatAutocompleteModule,
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
              <mat-label>Expediente</mat-label>
              <input matInput 
                     formControlName="CodigoExpediente" 
                     placeholder="Buscar por código de expediente..."
                     [matAutocomplete]="autoExpediente">
              <mat-autocomplete #autoExpediente="matAutocomplete">
                <mat-option *ngFor="let expediente of filteredExpedientes" [value]="expediente.CodigoExpediente">
                  {{ expediente.CodigoExpediente }}
                </mat-option>
              </mat-autocomplete>
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

              <!-- Expedientes Column -->
              <ng-container matColumnDef="Expedientes">
                <th mat-header-cell *matHeaderCellDef>Expedientes</th>
                <td mat-cell *matCellDef="let req">
                  <div class="expedientes-container">
                    <button
                      mat-stroked-button
                      color="primary"
                      type="button"
                      class="expedientes-toggle"
                      (click)="toggleExpedientes(req, $event)"
                      *ngIf="expedientesMap.get(req.IdReqMineroMov) && expedientesMap.get(req.IdReqMineroMov)!.length > 0"
                    >
                      <mat-icon>
                        {{ isExpedientesVisible(req) ? 'expand_less' : 'expand_more' }}
                      </mat-icon>
                      {{ isExpedientesVisible(req) ? 'Ocultar' : 'Ver expedientes' }}
                      <span class="expedientes-count">({{ expedientesMap.get(req.IdReqMineroMov)!.length }})</span>
                    </button>
                    
                    <span *ngIf="!expedientesMap.get(req.IdReqMineroMov) || expedientesMap.get(req.IdReqMineroMov)!.length === 0" class="no-expedientes">
                      Sin expedientes
                    </span>

                    <div class="expedientes-detalle-contenedor" [class.is-visible]="isExpedientesVisible(req)">
                      <div class="expedientes-detalle-contenido">
                        <div class="expedientes-grid">
                          <mat-chip *ngFor="let codigo of expedientesMap.get(req.IdReqMineroMov)" class="expediente-chip">
                            <mat-icon>folder</mat-icon>
                            {{ codigo }}
                          </mat-chip>
                        </div>
                      </div>
                    </div>
                  </div>
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

    .mat-column-Expedientes {
      vertical-align: middle !important;
    }

    .expedientes-container {
      display: flex;
      flex-direction: column;
      gap: 12px;
      align-items: center;
      justify-content: center;
      height: 100%;
      padding: 8px 0;
    }

    .expedientes-toggle {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      font-weight: 600;
    }

    .expedientes-toggle mat-icon {
      font-size: 18px;
    }

    .expedientes-count {
      font-size: 12px;
      margin-left: 4px;
      color: #416759;
    }

    .expedientes-detalle-contenedor {
      max-height: 0;
      opacity: 0;
      transform: translateY(8px);
      overflow: hidden;
      transition: max-height 360ms cubic-bezier(0.22, 0.61, 0.36, 1),
        opacity 360ms cubic-bezier(0.22, 0.61, 0.36, 1),
        transform 360ms cubic-bezier(0.22, 0.61, 0.36, 1);
    }

    .expedientes-detalle-contenedor.is-visible {
      max-height: 500px;
      opacity: 1;
      transform: translateY(0);
    }

    .expedientes-detalle-contenido {
      padding: 14px 18px;
      border-radius: 12px;
      border: 1px solid #e0ece7;
      background: #f8fbfa;
      box-shadow: inset 0 1px 2px rgba(65, 103, 89, 0.05);
    }

    .expedientes-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
      gap: 8px;
    }

    .expediente-chip {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 6px;
      font-size: 12px;
      min-height: 32px;
      padding: 6px 12px;
      background-color: #e8f5e9 !important;
      color: #2e7d32 !important;
      font-weight: 500;
    }

    .expediente-chip mat-icon {
      font-size: 16px;
      width: 16px;
      height: 16px;
    }

    .no-expedientes {
      color: #999;
      font-style: italic;
      font-size: 13px;
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
      vertical-align: middle !important;
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
  expedientes: Expediente[] = [];
  filteredExpedientes: Expediente[] = [];
  expedientesMap: Map<number, string[]> = new Map(); // Mapa IdReqMineroMov -> array de códigos de expedientes
  expandedReqMineroMovId: number | null = null; // ID del requerimiento con expedientes expandidos
  displayedColumns: string[] = [
    'IdReqMineroMov',
    'TipoRequerimiento',
    'Descripcion',
    'FechaInicio',
    'FechaFin',
    'Importe',
    'Expedientes',
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
    private expedienteService: ExpedienteService,
    private router: Router,
    private fb: FormBuilder,
    private snackBar: MatSnackBar
  ) {
    this.filterForm = this.fb.group({
      IdReqMinero: [''],
      CodigoExpediente: [''],
      Descripcion: ['']
    });
  }

  ngOnInit() {
    this.loadReqMineros();
    this.loadExpedientes();
    this.loadReqMineroMovs();
    this.setupExpedienteFilter();
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

  loadExpedientes() {
    this.expedienteService.getExpedientes(0, 1000).subscribe({
      next: (response) => {
        this.expedientes = response.data;
        this.filteredExpedientes = response.data;
      },
      error: (error) => {
        console.error('Error loading expedientes:', error);
      }
    });
  }

  setupExpedienteFilter() {
    this.filterForm.get('CodigoExpediente')?.valueChanges.subscribe(value => {
      if (value && typeof value === 'string') {
        const filterValue = value.toLowerCase();
        this.filteredExpedientes = this.expedientes.filter(exp => 
          exp.CodigoExpediente?.toLowerCase().includes(filterValue)
        );
      } else {
        this.filteredExpedientes = this.expedientes;
      }
    });
  }

  loadReqMineroMovs() {
    this.loading = true;
    
    const filters: any = {
      range: [this.pageIndex * this.pageSize, (this.pageIndex + 1) * this.pageSize - 1]
    };

    // Solo agregar filtros si tienen valor
    if (this.filterForm.value.IdReqMinero) {
      filters.IdReqMinero = this.filterForm.value.IdReqMinero;
    }

    if (this.filterForm.value.CodigoExpediente?.trim()) {
      filters.CodigoExpediente = this.filterForm.value.CodigoExpediente.trim();
    }

    if (this.filterForm.value.Descripcion?.trim()) {
      filters.Descripcion = this.filterForm.value.Descripcion.trim();
    }

    this.reqMineroMovService.getReqMineroMovs(filters).subscribe({
      next: (response) => {
        this.reqMineroMovs = response.data;
        this.totalRequerimientos = response.total;
        this.totalPages = Math.ceil(this.totalRequerimientos / this.pageSize);
        
        // Cargar expedientes para cada requerimiento
        this.loadExpedientesForRequerimientos(this.reqMineroMovs);
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

  loadExpedientesForRequerimientos(requerimientos: ReqMineroMov[]) {
    // Limpiar el mapa anterior
    this.expedientesMap.clear();

    // Crear un array de observables para cargar expedientes
    const expedientesObservables = requerimientos.map(req =>
      this.reqMineroMovService.getExpedientesByReqMineroMov(req.IdReqMineroMov).pipe(
        catchError(error => {
          console.error(`Error loading expedientes for ${req.IdReqMineroMov}:`, error);
          return of([]); // Devolver array vacío en caso de error
        })
      )
    );

    // Ejecutar todas las peticiones en paralelo
    forkJoin(expedientesObservables).subscribe({
      next: (results) => {
        // Mapear cada resultado con su IdReqMineroMov correspondiente
        requerimientos.forEach((req, index) => {
          const expedientes = results[index] as ReqMinExp[];
          console.log(`Expedientes para ReqMineroMov ${req.IdReqMineroMov}:`, expedientes);
          const codigosExpedientes = expedientes
            .filter(exp => exp.CodigoExpediente) // Filtrar solo los que tienen código
            .map(exp => exp.CodigoExpediente!);
          
          // Eliminar duplicados usando Set
          const codigosUnicos = Array.from(new Set(codigosExpedientes));
          console.log(`Códigos únicos para ReqMineroMov ${req.IdReqMineroMov}:`, codigosUnicos);
          this.expedientesMap.set(req.IdReqMineroMov, codigosUnicos);
        });
        
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading expedientes:', error);
        this.loading = false;
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
    // Navegar al formulario de creación independiente
    this.router.navigate(['/req-minero-movs/nuevo']);
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

  isExpedientesVisible(req: ReqMineroMov): boolean {
    return this.expandedReqMineroMovId === req.IdReqMineroMov;
  }

  toggleExpedientes(req: ReqMineroMov, event: MouseEvent): void {
    event.stopPropagation();
    this.expandedReqMineroMovId =
      this.expandedReqMineroMovId === req.IdReqMineroMov ? null : req.IdReqMineroMov;
  }
}
