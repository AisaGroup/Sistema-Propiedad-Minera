import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { FormsModule } from '@angular/forms';
import { TipoAlertaService } from '../services/tipo-alerta.service';
import { TipoAlerta } from '../models/tipo-alerta.model';

@Component({
  selector: 'app-tipos-alerta-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
    FormsModule
  ],
  template: `
    <div class="tipos-alerta-container">
      <mat-card>
        <mat-card-header>
          <mat-card-title>
            <mat-icon>warning</mat-icon>
            Gestión de Tipos de Alerta
          </mat-card-title>
          <div class="header-actions">
            <button mat-raised-button color="primary" (click)="crearTipoAlerta()">
              <mat-icon>add</mat-icon>
              Nuevo Tipo de Alerta
            </button>
          </div>
        </mat-card-header>

        <mat-card-content>
          <!-- Loading Spinner -->
          <div *ngIf="loading" class="loading-container">
            <mat-spinner diameter="50"></mat-spinner>
            <p>Cargando tipos de alerta...</p>
          </div>

          <!-- Tabla -->
          <div *ngIf="!loading" class="table-container">
            <table mat-table [dataSource]="dataSource" class="tipos-table">
              <!-- ID Column -->
              <ng-container matColumnDef="IdTipoAlerta">
                <th mat-header-cell *matHeaderCellDef class="id-column">ID</th>
                <td mat-cell *matCellDef="let tipo" class="id-column">{{ tipo.IdTipoAlerta }}</td>
              </ng-container>

              <!-- Descripción Column -->
              <ng-container matColumnDef="Descripcion">
                <th mat-header-cell *matHeaderCellDef>Descripción</th>
                <td mat-cell *matCellDef="let tipo">
                  <div class="descripcion-cell">
                    <strong>{{ tipo.Descripcion }}</strong>
                  </div>
                </td>
              </ng-container>

              <!-- Área Column -->
              <ng-container matColumnDef="IdArea">
                <th mat-header-cell *matHeaderCellDef>Área</th>
                <td mat-cell *matCellDef="let tipo">
                  <span class="area-info">{{ tipo.IdArea || '-' }}</span>
                </td>
              </ng-container>

              <!-- Asunto Column -->
              <ng-container matColumnDef="Asunto">
                <th mat-header-cell *matHeaderCellDef>Asunto</th>
                <td mat-cell *matCellDef="let tipo">
                  <span class="asunto-text">{{ tipo.Asunto || '-' }}</span>
                </td>
              </ng-container>

              <!-- Acciones Column -->
              <ng-container matColumnDef="acciones">
                <th mat-header-cell *matHeaderCellDef class="actions-column">Acciones</th>
                <td mat-cell *matCellDef="let tipo" class="actions-column">
                  <button mat-icon-button 
                          color="primary" 
                          (click)="editarTipoAlerta(tipo.IdTipoAlerta); $event.stopPropagation()"
                          matTooltip="Editar tipo de alerta">
                    <mat-icon>edit</mat-icon>
                  </button>
                  <button mat-icon-button 
                          color="warn" 
                          (click)="eliminarTipoAlerta(tipo.IdTipoAlerta); $event.stopPropagation()"
                          matTooltip="Eliminar tipo de alerta">
                    <mat-icon>delete</mat-icon>
                  </button>
                </td>
              </ng-container>

              <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
              <tr mat-row *matRowDef="let row; columns: displayedColumns;" 
                  class="table-row" 
                  (click)="verDetalleTipoAlerta(row.IdTipoAlerta)"></tr>
            </table>

            <!-- No data message -->
            <div *ngIf="dataSource.length === 0" class="no-data">
              <mat-icon>warning_amber</mat-icon>
              <p>No se encontraron tipos de alerta</p>
              <button mat-raised-button color="primary" (click)="crearTipoAlerta()">
                Crear primer tipo de alerta
              </button>
            </div>
          </div>

          <!-- Paginación personalizada -->
          <div *ngIf="!loading && dataSource.length > 0" class="custom-pagination">
            <div class="page-size-selector">
              <span>Mostrar:</span>
              <button mat-button [class.active]="pageSize === 5" (click)="changePageSize(5)">5</button>
              <button mat-button [class.active]="pageSize === 10" (click)="changePageSize(10)">10</button>
              <button mat-button [class.active]="pageSize === 25" (click)="changePageSize(25)">25</button>
              <button mat-button [class.active]="pageSize === 50" (click)="changePageSize(50)">50</button>
            </div>

            <div class="pagination-info">
              {{ (currentPage * pageSize) + 1 }} - {{ Math.min((currentPage + 1) * pageSize, totalItems) }} de {{ totalItems }}
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
  styleUrls: ['./tipos-alerta-list.component.scss']
})
export class TiposAlertaListComponent implements OnInit {
  dataSource: TipoAlerta[] = [];
  displayedColumns: string[] = ['IdTipoAlerta', 'Descripcion', 'IdArea', 'Asunto', 'acciones'];
  loading = false;
  error: string | null = null;
  
  // Paginación
  totalItems = 0;
  pageSize = 10;
  currentPage = 0;
  Math = Math;

  constructor(
    private tipoAlertaService: TipoAlertaService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.cargarTiposAlerta();
  }

  get totalPages(): number {
    return Math.ceil(this.totalItems / this.pageSize);
  }

  cargarTiposAlerta(): void {
    this.loading = true;
    this.error = null;
    
    this.tipoAlertaService.getAll(this.currentPage, this.pageSize).subscribe({
      next: (result) => {
        this.dataSource = result.data;
        this.totalItems = result.total;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error al cargar tipos de alerta:', err);
        this.error = 'Error al cargar los tipos de alerta';
        this.loading = false;
      }
    });
  }

  changePageSize(size: number): void {
    this.pageSize = size;
    this.currentPage = 0;
    this.cargarTiposAlerta();
  }

  firstPage(): void {
    this.currentPage = 0;
    this.cargarTiposAlerta();
  }

  previousPage(): void {
    if (this.currentPage > 0) {
      this.currentPage--;
      this.cargarTiposAlerta();
    }
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages - 1) {
      this.currentPage++;
      this.cargarTiposAlerta();
    }
  }

  lastPage(): void {
    this.currentPage = this.totalPages - 1;
    this.cargarTiposAlerta();
  }

  crearTipoAlerta(): void {
    this.router.navigate(['/tipos-alerta/nuevo']);
  }

  verDetalleTipoAlerta(id: number): void {
    this.router.navigate(['/tipos-alerta', id]);
  }

  editarTipoAlerta(id: number): void {
    this.router.navigate(['/tipos-alerta', id, 'editar']);
  }

  eliminarTipoAlerta(id: number): void {
    if (confirm('¿Está seguro de que desea eliminar este tipo de alerta?')) {
      this.tipoAlertaService.delete(id).subscribe({
        next: () => {
          this.cargarTiposAlerta();
        },
        error: (err) => {
          console.error('Error al eliminar tipo de alerta:', err);
          alert('Error al eliminar el tipo de alerta');
        }
      });
    }
  }
}