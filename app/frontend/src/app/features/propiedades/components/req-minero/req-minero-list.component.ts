import { Component, Input, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ReqMineroService, ReqMinero } from '../../services/req-minero.service';

@Component({
  selector: 'app-req-minero-list',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatChipsModule,
    MatTooltipModule,
    MatProgressSpinnerModule
  ],
  template: `
    <mat-card>
      <mat-card-header>
        <mat-card-title>Requerimientos Mineros</mat-card-title>
        <div class="header-actions">
          <button mat-raised-button color="primary" (click)="onCreateReqMinero()">
            <mat-icon>add</mat-icon>
            Crear Requerimiento Minero
          </button>
        </div>
      </mat-card-header>
      
      <mat-card-content>
        <div *ngIf="loading" class="loading-container">
          <mat-spinner diameter="32"></mat-spinner>
          <p>Cargando requerimientos...</p>
        </div>
        
        <div *ngIf="!loading && reqMineros.length === 0" class="no-data">
          No hay requerimientos mineros registrados.
        </div>
        
        <div class="table-container" *ngIf="!loading && reqMineros.length > 0">
          <table mat-table [dataSource]="reqMineros" class="full-width mat-elevation-2">
            <ng-container matColumnDef="IdReqMinero">
              <th mat-header-cell *matHeaderCellDef>ID</th>
              <td mat-cell *matCellDef="let req">{{ req.IdReqMinero }}</td>
            </ng-container>

            <ng-container matColumnDef="Tipo">
              <th mat-header-cell *matHeaderCellDef>Tipo</th>
              <td mat-cell *matCellDef="let req">
                <mat-chip *ngIf="req.Tipo" [color]="getTipoColor(req.Tipo)">
                  {{ req.Tipo }}
                </mat-chip>
                <span *ngIf="!req.Tipo">-</span>
              </td>
            </ng-container>

            <ng-container matColumnDef="Descripcion">
              <th mat-header-cell *matHeaderCellDef>Descripción</th>
              <td mat-cell *matCellDef="let req" class="description-cell">
                {{ req.Descripcion || '-' }}
              </td>
            </ng-container>

            <ng-container matColumnDef="IdTransaccion">
              <th mat-header-cell *matHeaderCellDef>ID Transacción</th>
              <td mat-cell *matCellDef="let req">{{ req.IdTransaccion || '-' }}</td>
            </ng-container>

            <ng-container matColumnDef="acciones">
              <th mat-header-cell *matHeaderCellDef>Acciones</th>
              <td mat-cell *matCellDef="let req">
                <button mat-icon-button color="primary" (click)="onEditReqMinero(req)" matTooltip="Editar">
                  <mat-icon>edit</mat-icon>
                </button>
                <button mat-icon-button color="warn" (click)="onDeleteReqMinero(req)" matTooltip="Eliminar">
                  <mat-icon>delete</mat-icon>
                </button>
              </td>
            </ng-container>

            <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
            <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
          </table>
        </div>

        <div class="custom-pagination" *ngIf="totalReqMineros > 0">
          <div class="page-size-selector">
            <span>Mostrar:</span>
            <button mat-button [class.active]="pageSize === 5" (click)="changePageSize(5)">5</button>
            <button mat-button [class.active]="pageSize === 10" (click)="changePageSize(10)">10</button>
            <button mat-button [class.active]="pageSize === 25" (click)="changePageSize(25)">25</button>
          </div>

          <div class="pagination-info">
            {{ (currentPage * pageSize) + 1 }} - {{ Math.min((currentPage + 1) * pageSize, totalReqMineros) }} de {{ totalReqMineros }}
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
  `,
  styles: [`
    .header-actions {
      margin-left: auto;
    }
    
    .loading, .no-data {
      text-align: center;
      padding: 2rem;
      color: #666;
    }
    
    .full-width {
      width: 100%;
    }
    
    .description-cell {
      max-width: 300px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    
    mat-card-header {
      display: flex;
      align-items: center;
      padding-bottom: 1rem;
    }

    .loading-container {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 12px;
      margin: 16px 0;
    }

    .table-container {
      overflow-x: auto;
      margin-top: 1rem;
    }

    /* Estilos de paginación personalizada */
    .custom-pagination {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 16px;
      background: #fafafa;
      border-top: 1px solid #e0e0e0;
      margin-top: 8px;
    }
    .page-size-selector {
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .page-size-selector span {
      font-size: 14px;
      color: #666;
    }
    .page-size-selector button {
      min-width: 40px;
      height: 32px;
      line-height: 32px;
      padding: 0 8px;
      font-size: 13px;
      color: #666;
    }
    .page-size-selector button.active {
      background-color: #416759;
      color: white;
    }
    .pagination-info {
      font-size: 14px;
      color: #666;
    }
    .pagination-controls {
      display: flex;
      align-items: center;
      gap: 4px;
    }
    .page-number {
      margin: 0 8px;
      font-size: 14px;
      color: #333;
    }
  `]
})
export class ReqMineroListComponent implements OnInit, OnChanges {
  @Input() idTransaccion?: number;

  reqMineros: ReqMinero[] = [];
  loading = false;
  displayedColumns: string[] = ['IdReqMinero', 'Tipo', 'Descripcion', 'IdTransaccion', 'acciones'];
  
  // Paginación
  currentPage = 0;
  pageSize = 10;
  totalReqMineros = 0;

  // Para usar Math en el template
  Math = Math;

  // Getter para calcular total de páginas
  get totalPages(): number {
    return Math.ceil(this.totalReqMineros / this.pageSize);
  }

  constructor(private reqMineroService: ReqMineroService) {}

  ngOnInit() {
    this.loadReqMineros();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['idTransaccion'] && this.idTransaccion) {
      this.loadReqMinerosByTransaccion();
    }
  }

  loadReqMineros(page: number = 0, size: number = this.pageSize) {
    this.loading = true;
    const start = page * size;
    const end = start + size - 1;
    
    this.reqMineroService.getReqMineros({ range: [start, end] }).subscribe({
      next: (response) => {
        this.reqMineros = Array.isArray(response) ? response : response.data || [];
        this.totalReqMineros = response.total || this.reqMineros.length;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading req mineros:', error);
        this.reqMineros = [];
        this.totalReqMineros = 0;
        this.loading = false;
      }
    });
  }

  loadReqMinerosByTransaccion() {
    if (!this.idTransaccion) return;
    
    this.loading = true;
    this.reqMineroService.getReqMinerosByTransaccion(this.idTransaccion).subscribe({
      next: (reqMineros) => {
        this.reqMineros = reqMineros;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading req mineros by transaccion:', error);
        this.loading = false;
      }
    });
  }

  getTipoColor(tipo: string): string {
    // Colores según el tipo de requerimiento
    switch (tipo?.toLowerCase()) {
      case 'obligatorio': return 'warn';
      case 'opcional': return 'primary';
      case 'urgente': return 'accent';
      default: return 'primary';
    }
  }

  onCreateReqMinero() {
    // TODO: Implementar navegación o modal para crear
    console.log('Crear nuevo requerimiento minero');
  }

  onEditReqMinero(reqMinero: ReqMinero) {
    // TODO: Implementar navegación o modal para editar
    console.log('Editar requerimiento minero:', reqMinero);
  }

  onDeleteReqMinero(reqMinero: ReqMinero) {
    if (confirm(`¿Está seguro de que desea eliminar el requerimiento minero ${reqMinero.IdReqMinero}?`)) {
      this.reqMineroService.deleteReqMinero(reqMinero.IdReqMinero).subscribe({
        next: () => {
          this.loadReqMineros(this.currentPage, this.pageSize);
        },
        error: (error) => {
          console.error('Error deleting req minero:', error);
          alert('Error al eliminar el requerimiento minero');
        }
      });
    }
  }

  // Métodos de paginación personalizada
  changePageSize(size: number): void {
    this.pageSize = size;
    this.currentPage = 0;
    this.loadReqMineros(this.currentPage, this.pageSize);
  }

  firstPage(): void {
    this.currentPage = 0;
    this.loadReqMineros(this.currentPage, this.pageSize);
  }

  previousPage(): void {
    if (this.currentPage > 0) {
      this.currentPage--;
      this.loadReqMineros(this.currentPage, this.pageSize);
    }
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages - 1) {
      this.currentPage++;
      this.loadReqMineros(this.currentPage, this.pageSize);
    }
  }

  lastPage(): void {
    this.currentPage = this.totalPages - 1;
    this.loadReqMineros(this.currentPage, this.pageSize);
  }
}
