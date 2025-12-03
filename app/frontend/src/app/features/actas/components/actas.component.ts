import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ActaService, Acta } from '../services/acta.service';
import { ActaCreateComponent } from './acta-create.component';
import { ActaEditComponent } from './acta-edit.component';
import { Router } from '@angular/router';

@Component({
  selector: 'app-actas',
  standalone: true,
  imports: [CommonModule, MatTableModule, MatButtonModule, MatIconModule, MatChipsModule, MatTooltipModule, MatProgressSpinnerModule, ActaCreateComponent, ActaEditComponent],
  template: `
    <div>
      <div class="header-row">
        <span class="section-title">Actas Asociadas</span>
        <mat-chip *ngIf="totalActas > 0" class="count-chip">{{ totalActas }}</mat-chip>
        <span class="spacer"></span>
        <button *ngIf="!mostrarFormulario" mat-raised-button color="primary" (click)="mostrarFormulario = true; editando = false; actaEdit = null;">
          <mat-icon>add</mat-icon> Nueva Acta
        </button>
      </div>
      <button *ngIf="mostrarFormulario" mat-stroked-button class="close-btn" (click)="onCancelarActa()" aria-label="Cerrar">
        Cerrar
      </button>
      <div *ngIf="loadingActas" class="loading-container">
        <mat-spinner diameter="32"></mat-spinner>
        <p>Cargando actas...</p>
      </div>
      <div *ngIf="mostrarFormulario && !editando">
        <app-acta-create [idExpediente]="idExpediente" (create)="onCrearActa($event)" (cancelar)="onCancelarActa()"></app-acta-create>
      </div>
      <div *ngIf="mostrarFormulario && editando">
        <app-acta-edit [acta]="actaEdit" (update)="onActualizarActa($event)" (cancelar)="onCancelarActa()"></app-acta-edit>
      </div>
      <div class="table-container" *ngIf="actas && actas.length > 0 && !loadingActas && !mostrarFormulario">
        <table mat-table [dataSource]="actas" class="actas-table mat-elevation-4">
          <!-- Columnas -->
          <ng-container matColumnDef="Fecha">
            <th mat-header-cell *matHeaderCellDef>Fecha</th>
            <td mat-cell *matCellDef="let acta">{{ acta.Fecha | date:'dd/MM/yyyy' }}</td>
          </ng-container>
          <ng-container matColumnDef="Descripcion">
            <th mat-header-cell *matHeaderCellDef>Descripción</th>
            <td mat-cell *matCellDef="let acta">{{ acta.Descripcion }}</td>
          </ng-container>
          <ng-container matColumnDef="actions">
            <th mat-header-cell *matHeaderCellDef>Acciones</th>
            <td mat-cell *matCellDef="let acta">
              <button mat-icon-button color="primary" matTooltip="Ver" (click)="verActa(acta)">
                <mat-icon>visibility</mat-icon>
              </button>
              <button mat-icon-button color="primary" matTooltip="Editar" (click)="$event.stopPropagation(); onEditarActa(acta)">
                <mat-icon>edit</mat-icon>
              </button>
            </td>
          </ng-container>
          <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
          <tr mat-row *matRowDef="let row; columns: displayedColumns;" (click)="verActa(row)" class="clickable-row"></tr>
        </table>
      </div>
      <div class="custom-pagination" *ngIf="totalActas > 0 && !mostrarFormulario">
        <div class="page-size-selector">
          <span>Mostrar:</span>
          <button mat-button [class.active]="pageSize === 5" (click)="changePageSize(5)">5</button>
          <button mat-button [class.active]="pageSize === 10" (click)="changePageSize(10)">10</button>
          <button mat-button [class.active]="pageSize === 25" (click)="changePageSize(25)">25</button>
        </div>

        <div class="pagination-info">
          {{ (currentPage * pageSize) + 1 }} - {{ Math.min((currentPage + 1) * pageSize, totalActas) }} de {{ totalActas }}
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
      <div *ngIf="actas && actas.length === 0 && !loadingActas" class="no-data">
        No hay actas asociadas.
      </div>
    </div>
  `,
  styles: [`
    .header-row { display: flex; align-items: center; margin-bottom: 12px; }
    .section-title { font-size: 1.1rem; font-weight: 600; color: #333; }
    .spacer { flex: 1 1 auto; }
    .count-chip { background: #416759; color: #fff; margin-left: 8px; }
    .table-container { overflow-x: auto; }
    .actas-table th, .actas-table td { color: #333; }
    .no-data { color: #888; font-style: italic; margin-top: 16px; }
    .loading-container { display: flex; align-items: center; gap: 12px; margin: 16px 0; }
    .clickable-row { cursor: pointer; transition: background 0.2s; }
    .clickable-row:hover { background: #e6f2ed; }
    .close-btn { display: block; margin: 0 0 1.5rem 0; position: relative; left: 0; top: 0; background: #fff; border-radius: 6px; z-index: 2; }
    
    /* Estilos de paginación personalizada (igual que alertas) */
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
export class ActasComponent implements OnInit {
  @Input() idExpediente!: number;
  actas: Acta[] = [];
  loadingActas = false;
  displayedColumns = ['Fecha', 'Descripcion', 'actions'];
  totalActas = 0;
  pageSize = 10;
  currentPage = 0;
  mostrarFormulario = false;
  editando = false;
  actaEdit: Acta | null = null;

  // Para usar Math en el template
  Math = Math;

  // Getter para calcular total de páginas
  get totalPages(): number {
    return Math.ceil(this.totalActas / this.pageSize);
  }

  constructor(private actaService: ActaService, private router: Router) {}

  ngOnInit() {
    if (this.idExpediente) {
      this.cargarActas();
    }
  }

  cargarActas(page: number = 0, size: number = this.pageSize) {
    this.loadingActas = true;
    this.actaService.getActasByExpedientePaged(this.idExpediente, page, size)
      .subscribe({
        next: (resp: any) => {
          this.actas = resp.body || [];
          const contentRange = resp.headers.get('Content-Range');
          if (contentRange) {
            const match = contentRange.match(/\d+-\d+\/(\d+)/);
            this.totalActas = match ? +match[1] : this.actas.length;
          } else {
            this.totalActas = this.actas.length;
          }
          this.loadingActas = false;
        },
        error: () => {
          this.actas = [];
          this.totalActas = 0;
          this.loadingActas = false;
        }
      });
  }

  // Métodos de paginación personalizada
  changePageSize(size: number): void {
    this.pageSize = size;
    this.currentPage = 0;
    this.cargarActas(this.currentPage, this.pageSize);
  }

  firstPage(): void {
    this.currentPage = 0;
    this.cargarActas(this.currentPage, this.pageSize);
  }

  previousPage(): void {
    if (this.currentPage > 0) {
      this.currentPage--;
      this.cargarActas(this.currentPage, this.pageSize);
    }
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages - 1) {
      this.currentPage++;
      this.cargarActas(this.currentPage, this.pageSize);
    }
  }

  lastPage(): void {
    this.currentPage = this.totalPages - 1;
    this.cargarActas(this.currentPage, this.pageSize);
  }

  onCrearActa(acta: Acta) {
    console.log('=== onCrearActa ===');
    console.log('Recibido del formulario:', acta);
    console.log('Tipos de datos:');
    console.log('  IdExpediente:', typeof acta.IdExpediente, acta.IdExpediente);
    console.log('  Fecha:', typeof acta.Fecha, acta.Fecha);
    console.log('  IdAutoridad:', typeof acta.IdAutoridad, acta.IdAutoridad);
    
    this.actaService.create(acta).subscribe({
      next: () => {
        console.log('Acta creada exitosamente');
        this.cargarActas();
        this.mostrarFormulario = false;
      },
      error: (error) => {
        console.error('Error al crear acta:', error);
        console.error('Response status:', error.status);
        console.error('Response body:', error.error);
        console.error('Error detail:', error.error?.detail);
        if (error.error?.detail && Array.isArray(error.error.detail)) {
          error.error.detail.forEach((detail: any, index: number) => {
            console.error(`Error ${index + 1}:`, detail);
          });
        }
      }
    });
  }

  onEditarActa(acta: Acta) {
    this.actaEdit = { ...acta };
    this.editando = true;
    this.mostrarFormulario = true;
  }

  onActualizarActa(acta: Acta) {
    this.actaService.update(acta.IdActa, acta).subscribe({
      next: () => {
        this.cargarActas();
        this.editando = false;
        this.actaEdit = null;
        this.mostrarFormulario = false;
      }
    });
  }

  onCancelarActa() {
    this.mostrarFormulario = false;
    this.editando = false;
    this.actaEdit = null;
  }

  verActa(acta: Acta, event?: MouseEvent) {
    if (event) {
      event.stopPropagation();
    }
    this.router.navigate(['/expedientes', this.idExpediente, 'acta', acta.IdActa]);
  }
}
