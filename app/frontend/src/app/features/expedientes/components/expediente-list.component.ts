import { Component, OnInit, ViewChild } from '@angular/core';
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
          </div>
        </mat-card-header>

        <mat-card-content>
          <!-- Filtros -->
          <div class="filters-section">
            <mat-form-field appearance="outline">
              <mat-label>Código Expediente</mat-label>
              <input matInput [(ngModel)]="filters.CodigoExpediente" (input)="onFilterChange()" placeholder="Buscar por código">
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Estado</mat-label>
              <mat-select [(ngModel)]="filters.Estado" (selectionChange)="onFilterChange()">
                <mat-option value="">Todos</mat-option>
                <mat-option value="ACTIVO">Activo</mat-option>
                <mat-option value="CERRADO">Cerrado</mat-option>
                <mat-option value="SUSPENDIDO">Suspendido</mat-option>
              </mat-select>
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Dependencia</mat-label>
              <input matInput [(ngModel)]="filters.Dependencia" (input)="onFilterChange()" placeholder="Filtrar por dependencia">
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
              
              <!-- ID Column -->
              <ng-container matColumnDef="IdExpediente">
                <th mat-header-cell *matHeaderCellDef>ID</th>
                <td mat-cell *matCellDef="let expediente">{{ expediente.IdExpediente }}</td>
              </ng-container>

              <!-- Código Column -->
              <ng-container matColumnDef="CodigoExpediente">
                <th mat-header-cell *matHeaderCellDef>Código</th>
                <td mat-cell *matCellDef="let expediente">{{ expediente.CodigoExpediente || 'Sin código' }}</td>
              </ng-container>

              <!-- Primer Dueño Column -->
              <ng-container matColumnDef="PrimerDueno">
                <th mat-header-cell *matHeaderCellDef>Primer Dueño</th>
                <td mat-cell *matCellDef="let expediente">{{ expediente.PrimerDueno || 'Sin dato' }}</td>
              </ng-container>

              <!-- Carátula Column -->
              <ng-container matColumnDef="Caratula">
                <th mat-header-cell *matHeaderCellDef>Carátula</th>
                <td mat-cell *matCellDef="let expediente">{{ expediente.Caratula || 'Sin caratula' }}</td>
              </ng-container>

              <!-- Estado Column -->
              <ng-container matColumnDef="Estado">
                <th mat-header-cell *matHeaderCellDef>Estado</th>
                <td mat-cell *matCellDef="let expediente">
                  <span class="estado-badge" [ngClass]="'estado-' + (expediente.Estado || 'sin-estado').toLowerCase()">
                    {{ expediente.Estado || 'Sin estado' }}
                  </span>
                </td>
              </ng-container>

              <!-- Dependencia Column -->
              <ng-container matColumnDef="Dependencia">
                <th mat-header-cell *matHeaderCellDef>Dependencia</th>
                <td mat-cell *matCellDef="let expediente">{{ expediente.Dependencia || 'Sin dependencia' }}</td>
              </ng-container>

              <!-- Fecha Inicio Column -->
              <ng-container matColumnDef="FechaInicio">
                <th mat-header-cell *matHeaderCellDef>Fecha Inicio</th>
                <td mat-cell *matCellDef="let expediente">
                  {{ expediente.FechaInicio ? (expediente.FechaInicio | date:'dd/MM/yyyy') : 'Sin fecha' }}
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
                  matTooltip="Haga clic para ver el detalle">
              </tr>
            </table>
          </div>

          <!-- Paginación -->
          <mat-paginator 
            #paginator
            [length]="totalExpedientes"
            [pageSize]="pageSize"
            [pageSizeOptions]="[5, 10, 25, 50]"
            (page)="onPageChange($event)"
            showFirstLastButtons>
          </mat-paginator>
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
  'IdExpediente', 
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

  constructor(
    private expedienteService: ExpedienteService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadExpedientes();
  }

  loadExpedientes(): void {
    this.loading = true;
    
    this.expedienteService.getExpedientes(this.currentPage, this.pageSize, this.filters)
      .subscribe({
        next: (response) => {
          console.log('Expedientes recibidos:', response); // Debug
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
}
