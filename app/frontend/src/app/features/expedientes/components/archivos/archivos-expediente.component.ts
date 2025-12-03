import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTabsModule } from '@angular/material/tabs';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ArchivoService, Archivo } from '../../../archivos/services/archivo.service';
import { ArchivoCreateComponent } from './archivo-create.component';
import { ArchivoEditComponent } from './archivo-edit.component';

@Component({
  selector: 'app-archivos-expediente',
  standalone: true,
  imports: [
  CommonModule,
  MatTabsModule,
  MatCardModule,
  MatButtonModule,
  MatIconModule,
  MatTableModule,
  MatProgressSpinnerModule,
  MatTooltipModule,
  ArchivoCreateComponent,
  ArchivoEditComponent
  ],
  template: `
    <div class="archivos-container">
      <!-- Header con botón para agregar archivo -->
      <div class="archivos-header">
        <h3>Archivos del Expediente</h3>
        <button mat-raised-button color="primary" (click)="mostrarFormularioCreacion()">
          <mat-icon>add</mat-icon>
          Subir Archivo
        </button>
      </div>

      <!-- Loading spinner -->
      <div *ngIf="loading" class="loading-container">
        <mat-spinner></mat-spinner>
        <p>Cargando archivos...</p>
      </div>

      <!-- Formulario de creación -->
      <app-archivo-create
        *ngIf="mostrandoFormCreacion"
        [idEntidad]="idEntidad"
        [entidad]="entidad"
        (archivoCreado)="onArchivoCreado($event)"
        (cancelar)="onCancelarCreacion()">
      </app-archivo-create>

      <!-- Formulario de edición -->
      <app-archivo-edit
        *ngIf="archivoEnEdicion"
        [archivo]="archivoEnEdicion"
        (archivoActualizado)="onArchivoActualizado($event)"
        (cancelar)="onCancelarEdicion()">
      </app-archivo-edit>

      <!-- Tabla de archivos -->
      <div *ngIf="!loading && !mostrandoFormCreacion && !archivoEnEdicion" class="archivos-table">
        <mat-card>
          <mat-card-content>
            <table mat-table [dataSource]="archivos" class="full-width-table">
              <!-- Columna Nombre -->
              <ng-container matColumnDef="nombre">
                <th mat-header-cell *matHeaderCellDef>Nombre del Archivo</th>
                <td mat-cell *matCellDef="let archivo">
                  {{ archivo.Nombre }}
                </td>
              </ng-container>

              <!-- Columna Descripción -->
              <ng-container matColumnDef="descripcion">
                <th mat-header-cell *matHeaderCellDef>Descripción</th>
                <td mat-cell *matCellDef="let archivo">
                  {{ archivo.Descripcion || 'Sin descripción' }}
                </td>
              </ng-container>

              <!-- Columna Fecha -->
              <ng-container matColumnDef="fecha">
                <th mat-header-cell *matHeaderCellDef>Fecha de Subida</th>
                <td mat-cell *matCellDef="let archivo">
                  {{ formatDate(archivo.AudFecha) }}
                </td>
              </ng-container>

              <!-- Columna Acciones -->
              <ng-container matColumnDef="acciones">
                <th mat-header-cell *matHeaderCellDef>Acciones</th>
                <td mat-cell *matCellDef="let archivo">
                  <button mat-icon-button (click)="descargarArchivo(archivo)" title="Descargar">
                    <mat-icon>download</mat-icon>
                  </button>
                  <button mat-icon-button (click)="editarArchivo(archivo)" title="Editar">
                    <mat-icon>edit</mat-icon>
                  </button>
                  <button mat-icon-button (click)="eliminarArchivo(archivo)" title="Eliminar" color="warn">
                    <mat-icon>delete</mat-icon>
                  </button>
                </td>
              </ng-container>

              <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
              <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
            </table>

            <!-- Mensaje cuando no hay archivos -->
            <div *ngIf="archivos.length === 0" class="no-archivos">
              <mat-icon>folder_open</mat-icon>
              <p>No hay archivos subidos para este expediente</p>
            </div>
          </mat-card-content>
        </mat-card>
      </div>

      <!-- Paginación personalizada -->
      <div class="custom-pagination" *ngIf="totalItems > 0 && !mostrandoFormCreacion && !archivoEnEdicion">
        <div class="page-size-selector">
          <span>Mostrar:</span>
          <button mat-button [class.active]="pageSize === 5" (click)="changePageSize(5)">5</button>
          <button mat-button [class.active]="pageSize === 10" (click)="changePageSize(10)">10</button>
          <button mat-button [class.active]="pageSize === 25" (click)="changePageSize(25)">25</button>
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
          <span class="page-number">Página {{ currentPage + 1 }} de {{ totalPagesCalc }}</span>
          <button mat-icon-button [disabled]="currentPage >= totalPagesCalc - 1" (click)="nextPage()" matTooltip="Siguiente">
            <mat-icon>chevron_right</mat-icon>
          </button>
          <button mat-icon-button [disabled]="currentPage >= totalPagesCalc - 1" (click)="lastPage()" matTooltip="Última página">
            <mat-icon>last_page</mat-icon>
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .archivos-container {
      padding: 16px;
      padding-bottom: 64px; /* Espacio extra para el dropdown del paginator */
    }

    .archivos-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 16px;
    }

    .loading-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 32px;
    }

    .full-width-table {
      width: 100%;
    }

    .no-archivos {
      text-align: center;
      padding: 32px;
      color: #666;
    }

    .no-archivos mat-icon {
      font-size: 48px;
      width: 48px;
      height: 48px;
      margin-bottom: 16px;
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
export class ArchivosExpedienteComponent implements OnInit {
  @Input() idEntidad!: number;
  @Input() entidad: string = 'expediente';

  archivos: Archivo[] = [];
  loading = false;
  mostrandoFormCreacion = false;
  archivoEnEdicion: Archivo | null = null;
  displayedColumns: string[] = ['nombre', 'descripcion', 'fecha', 'acciones'];

  // Paginación
  currentPage: number = 0;
  pageSize: number = 10;
  totalPages: number = 1;
  totalItems: number = 0;

  // Para usar Math en el template
  Math = Math;

  // Getter para calcular total de páginas
  get totalPagesCalc(): number {
    return Math.ceil(this.totalItems / this.pageSize);
  }

  constructor(private archivoService: ArchivoService) {}

  ngOnInit() {
    if (this.idEntidad) {
      this.cargarArchivos();
    }
  }

  cargarArchivos(page: number = this.currentPage, size: number = this.pageSize) {
    this.loading = true;
    // API espera páginas desde 1, pero internamente usamos desde 0
    this.archivoService.getArchivosByEntidad(this.entidad, this.idEntidad, page + 1, size).subscribe({
      next: (response: any) => {
        this.archivos = response.archivos || [];
        // Leer paginación desde response.pagination
        const pag = response.pagination || {};
        this.totalItems = pag.total_items || 0;
        this.totalPages = pag.total_pages || 1;
        this.loading = false;
      },
      error: (error: any) => {
        console.error('Error al cargar archivos:', error);
        this.loading = false;
      }
    });
  }

  mostrarFormularioCreacion() {
    this.mostrandoFormCreacion = true;
  }

  onArchivoCreado(archivo: Archivo) {
  // Recargar archivos para reflejar el nuevo archivo en la paginación
  this.mostrandoFormCreacion = false;
  this.cargarArchivos();
  }

  onCancelarCreacion() {
    this.mostrandoFormCreacion = false;
  }

  editarArchivo(archivo: Archivo) {
    this.archivoEnEdicion = archivo;
  }

  onArchivoActualizado(archivo: Archivo) {
    const index = this.archivos.findIndex(a => a.IdArchivo === archivo.IdArchivo);
    if (index !== -1) {
      this.archivos[index] = archivo;
    }
    this.archivoEnEdicion = null;
  }

  onCancelarEdicion() {
    this.archivoEnEdicion = null;
  }

  descargarArchivo(archivo: Archivo) {
    const link = archivo.Link || '';
    const nombre = archivo.Nombre || '';
    
    this.archivoService.downloadArchivo(link, nombre).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = nombre;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      },
      error: (error) => {
        console.error('Error al descargar archivo:', error);
      }
    });
  }

  eliminarArchivo(archivo: Archivo) {
    if (confirm('¿Está seguro de que desea eliminar este archivo?')) {
      this.archivoService.deleteArchivo(archivo.IdArchivo).subscribe({
        next: () => {
          // Recargar archivos para reflejar la eliminación
          this.cargarArchivos();
        },
        error: (error) => {
          console.error('Error al eliminar archivo:', error);
        }
      });
    }
  }


  formatDate(date: Date | string | null | undefined): string {
    if (!date) return '-';
    try {
      const dateObj = typeof date === 'string' ? new Date(date) : date;
      return dateObj.toLocaleDateString('es-ES', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return '-';
    }
  }

  // Métodos de paginación personalizada
  changePageSize(size: number): void {
    this.pageSize = size;
    this.currentPage = 0;
    this.cargarArchivos(this.currentPage, this.pageSize);
  }

  firstPage(): void {
    this.currentPage = 0;
    this.cargarArchivos(this.currentPage, this.pageSize);
  }

  previousPage(): void {
    if (this.currentPage > 0) {
      this.currentPage--;
      this.cargarArchivos(this.currentPage, this.pageSize);
    }
  }

  nextPage(): void {
    if (this.currentPage < this.totalPagesCalc - 1) {
      this.currentPage++;
      this.cargarArchivos(this.currentPage, this.pageSize);
    }
  }

  lastPage(): void {
    this.currentPage = this.totalPagesCalc - 1;
    this.cargarArchivos(this.currentPage, this.pageSize);
  }
}
