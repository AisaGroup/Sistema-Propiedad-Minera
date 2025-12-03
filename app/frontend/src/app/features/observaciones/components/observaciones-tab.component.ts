import { Component, Input, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { Observacion } from '../models/observacion.model';
import { ObservacionesService } from '../services/observaciones.service';
import { ObservacionCreateComponent } from './observacion-create.component';
import { ObservacionEditComponent } from './observacion-edit.component';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-observaciones-tab',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatTooltipModule,
    MatProgressSpinnerModule,
    ObservacionCreateComponent,
    ObservacionEditComponent
  ],
  templateUrl: './observaciones-tab.component.html',
  styleUrls: ['./observaciones-tab.component.scss'],
  styles: [`
    .header-row { display: flex; align-items: center; margin-bottom: 1rem; }
    .section-title { font-size: 1.2rem; font-weight: 600; }
    .spacer { flex: 1 1 auto; }
    .count-chip { margin-left: 0.5rem; }
    .table-container { 
      margin-top: 1rem; 
      overflow: hidden !important;
      width: 100% !important;
    }
    .no-data { color: #888; text-align: center; margin-top: 2rem; }
    .observaciones-table {
      width: 100% !important;
      table-layout: fixed !important;
    }
    .observaciones-table td {
      word-wrap: break-word !important;
      word-break: break-word !important;
      white-space: normal !important;
      max-width: 300px !important;
      overflow: hidden !important;
      text-overflow: ellipsis;
      vertical-align: top !important;
      padding: 8px !important;
    }
    .observaciones-table th {
      word-wrap: break-word !important;
      padding: 8px !important;
    }
    .observaciones-table .mat-column-Descripcion {
      width: 30% !important;
      max-width: 250px !important;
    }
    .observaciones-table .mat-column-Observaciones {
      width: 50% !important;
      max-width: 350px !important;
    }
    .observaciones-table .mat-column-IdTransaccion {
      width: 10% !important;
      max-width: 80px !important;
    }
    .observaciones-table .mat-column-actions {
      width: 10% !important;
      max-width: 80px !important;
    }
    .loading-container {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 12px;
      margin: 16px 0;
    }
    .close-btn {
      display: block;
      margin: 0 0 1.5rem 0;
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
export class ObservacionesTabComponent implements OnInit, OnChanges {
  observaciones: Observacion[] = [];
  @Input() idTransaccion: number | null = null;
  @Input() tipoPadre: string = 'expediente'; // tipo de entidad padre
  @Input() idPadre: number | null = null; // ID de la entidad padre
  totalObservaciones = 0;
  pageSize = 10;
  currentPage = 0;
  loading = false;
  mostrarFormulario = false;
  
  // Para usar Math en el template
  Math = Math;
  
  // Getter para calcular total de páginas
  get totalPages(): number {
    return Math.ceil(this.totalObservaciones / this.pageSize);
  }
  editando = false;
  observacionEdit: Observacion | null = null;

  constructor(private observacionesService: ObservacionesService) {}

  ngOnInit() {
    if (this.idTransaccion) {
      this.loadObservaciones();
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['idTransaccion'] && changes['idTransaccion'].currentValue) {
      this.currentPage = 0;
      this.loadObservaciones(0, this.pageSize);
    }
  }

  loadObservaciones(page: number = 0, size: number = this.pageSize) {
    if (!this.idTransaccion) return;
    this.loading = true;
    this.observacionesService.getByTransaccion(this.idTransaccion, page, size).subscribe({
      next: (resp) => {
        this.observaciones = resp.data;
        this.totalObservaciones = resp.total;
        this.loading = false;
      },
      error: () => {
        this.observaciones = [];
        this.totalObservaciones = 0;
        this.loading = false;
      }
    });
  }

  // Métodos de paginación personalizada
  changePageSize(size: number): void {
    this.pageSize = size;
    this.currentPage = 0;
    this.loadObservaciones(this.currentPage, this.pageSize);
  }

  firstPage(): void {
    this.currentPage = 0;
    this.loadObservaciones(this.currentPage, this.pageSize);
  }

  previousPage(): void {
    if (this.currentPage > 0) {
      this.currentPage--;
      this.loadObservaciones(this.currentPage, this.pageSize);
    }
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages - 1) {
      this.currentPage++;
      this.loadObservaciones(this.currentPage, this.pageSize);
    }
  }

  lastPage(): void {
    this.currentPage = this.totalPages - 1;
    this.loadObservaciones(this.currentPage, this.pageSize);
  }

  onCrearObservacion(obs: Observacion) {
    console.log('Observación creada recibida en tab:', obs);
    this.editando = false;
    this.observacionEdit = null;
    // Solo recargar la lista, la observación ya fue creada por el componente
    this.loadObservaciones(this.currentPage, this.pageSize);
    this.mostrarFormulario = false;
  }

  onEditarObservacion(obs: Observacion) {
    this.observacionEdit = { ...obs };
    this.editando = true;
    this.mostrarFormulario = true;
  }

  onActualizarObservacion(obs: Observacion) {
    if (this.editando && this.observacionEdit) {
      this.observacionesService.updateObservacion(this.observacionEdit.IdTransaccion, obs).subscribe({
        next: (resp) => {
          this.loadObservaciones(this.currentPage, this.pageSize);
          this.editando = false;
          this.observacionEdit = null;
          this.mostrarFormulario = false;
        }
      });
    }
  }

  onNuevaObservacion() {
    this.editando = false;
    this.observacionEdit = null;
    this.mostrarFormulario = true;
  }
}
