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
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
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
    MatPaginatorModule,
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
    .table-container { margin-top: 1rem; }
    .no-data { color: #888; text-align: center; margin-top: 2rem; }
  `]
})
export class ObservacionesTabComponent implements OnInit, OnChanges {
  observaciones: Observacion[] = [];
  @Input() idTransaccion: number | null = null;
  totalObservaciones = 0;
  pageSize = 5;
  currentPage = 0;
  loading = false;
  mostrarFormulario = false;
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

  onPageChange(event: PageEvent) {
    this.currentPage = event.pageIndex;
    this.pageSize = event.pageSize;
    this.loadObservaciones(this.currentPage, this.pageSize);
  }

  onCrearObservacion(obs: Observacion) {
    this.editando = false;
    this.observacionEdit = null;
    this.observacionesService.createObservacion(obs).subscribe({
      next: (resp) => {
        this.loadObservaciones(this.currentPage, this.pageSize);
        this.mostrarFormulario = false;
      }
    });
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
