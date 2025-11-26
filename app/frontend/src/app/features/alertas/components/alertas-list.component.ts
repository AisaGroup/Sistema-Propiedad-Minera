import { Component, Input, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { AlertaCreateComponent } from '../components/alerta-create.component';
import { AlertaEditComponent } from './alerta-edit.component';
import { AlertaService } from '../services/alerta.service';
import { EstadoAlertaService } from '../services/estado-alerta.service';
import type { EstadoAlerta } from '../models/estado-alerta.model';

@Component({
  selector: 'app-alertas-list',
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
    AlertaCreateComponent,
    AlertaEditComponent
  ],
  template: `
    <div>
      <div class="header-row">
        <span class="section-title">Alertas Asociadas</span>
        <mat-chip *ngIf="!mostrarFormulario && alertas.length > 0" class="count-chip">{{ alertas.length }}</mat-chip>
        <span class="spacer"></span>
        <button mat-raised-button color="primary" *ngIf="!mostrarFormulario" (click)="mostrarFormulario = true">
          <mat-icon>add_alert</mat-icon> Nueva Alerta
        </button>
      </div>
      <button *ngIf="mostrarFormulario" mat-stroked-button class="close-btn" (click)="mostrarFormulario = false; editando = false; alertaEdit = null;" aria-label="Cerrar">
        Cerrar
      </button>
      <div *ngIf="mostrarFormulario && !editando">
        <app-alerta-create [idTransaccion]="idTransaccion" [tipoPadre]="tipoPadre" [idPadre]="idPadre" (create)="onCrearAlerta($event)" (cancelar)="mostrarFormulario = false; editando = false; alertaEdit = null;"></app-alerta-create>
      </div>
      <div *ngIf="mostrarFormulario && editando">
        <app-alerta-edit [idTransaccion]="idTransaccion" [alerta]="alertaEdit" (update)="onActualizarAlerta($event)" (cancelar)="mostrarFormulario = false; editando = false; alertaEdit = null;"></app-alerta-edit>
      </div>
      <div *ngIf="!mostrarFormulario">
        <div *ngIf="loading" class="loading-container">
          <mat-spinner diameter="32"></mat-spinner>
          <p>Cargando alertas...</p>
        </div>
        <div class="table-container" *ngIf="dataSource.data.length > 0 && !loading">
          <table mat-table [dataSource]="dataSource" class="alertas-table mat-elevation-4">
            <ng-container matColumnDef="Fecha de Creación">
              <th mat-header-cell *matHeaderCellDef>Fecha de Creación</th>
              <td mat-cell *matCellDef="let alerta">{{ alerta.AudFecha | date: 'short' }}</td>
            </ng-container>
            <ng-container matColumnDef="Estado">
              <th mat-header-cell *matHeaderCellDef>Estado</th>
              <td mat-cell *matCellDef="let alerta">{{ getEstadoNombre(alerta.IdEstado) }}</td>
            </ng-container>
            <ng-container matColumnDef="Asunto">
              <th mat-header-cell *matHeaderCellDef>Asunto</th>
              <td mat-cell *matCellDef="let alerta">{{ alerta.Asunto }}</td>
            </ng-container>
            <ng-container matColumnDef="Mensaje">
              <th mat-header-cell *matHeaderCellDef>Mensaje</th>
              <td mat-cell *matCellDef="let alerta" [innerHTML]="alerta.Mensaje"></td>
            </ng-container>
            <ng-container matColumnDef="actions">
              <th mat-header-cell *matHeaderCellDef>Acciones</th>
              <td mat-cell *matCellDef="let alerta">
                <button mat-icon-button color="primary" matTooltip="Ver">
                  <mat-icon>visibility</mat-icon>
                </button>
                <button mat-icon-button color="primary" matTooltip="Editar" (click)="onEditarAlerta(alerta)">
                  <mat-icon>edit</mat-icon>
                </button>
              </td>
            </ng-container>
            <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
            <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
          </table>
        </div>
        <div *ngIf="dataSource.data.length === 0 && !loading" class="no-data">
          <mat-icon>info</mat-icon>
          <p>No hay alertas asociadas a este expediente.</p>
        </div>
        <mat-paginator *ngIf="totalAlertas > 0" [length]="totalAlertas" [pageSize]="pageSize" [pageSizeOptions]="[5, 10, 25]" (page)="onPageChange($event)">
        </mat-paginator>
      </div>
    </div>
  `,
  styles: [`
    .header-row { display: flex; align-items: center; margin-bottom: 12px; }
    .section-title { font-size: 1.1rem; font-weight: 600; color: #333; }
    .spacer { flex: 1 1 auto; }
    .count-chip { background: #416759; color: #fff; margin-left: 8px; }
    .close-btn { display: block; margin: 0 0 1.5rem 0; position: relative; left: 0; top: 0; background: #fff; border-radius: 6px; z-index: 2; }
    .table-container { overflow-x: auto; }
    .alertas-table th, .alertas-table td { color: #333; }
    .no-data { color: #888; font-style: italic; margin-top: 16px; }
    .loading-container { display: flex; align-items: center; gap: 12px; margin: 16px 0; }
    .clickable-row { cursor: pointer; transition: background 0.2s; }
    .clickable-row:hover { background: #e6f2ed; }
  `]
})
export class AlertasListComponent implements OnInit, OnChanges {
  alertas: any[] = [];
  dataSource = new MatTableDataSource<any>([]);
  totalAlertas = 0;
  pageSize = 5;
  currentPage = 0;
  loading = false;
  estadosAlerta: EstadoAlerta[] = [];
  @Input() idTransaccion: number | null = null;
  @Input() tipoPadre: string = 'acta'; // Por defecto 'acta', pero puede ser 'expediente', 'resolucion', etc.
  @Input() idPadre: number | null = null; // ID del padre (IdNotificacion, IdExpediente, etc.)
  mostrarFormulario = false;
  editando = false;
  alertaEdit: any = null;
  displayedColumns: string[] = ['Fecha de Creación', 'Estado', 'Asunto', 'Mensaje', 'actions'];

  constructor(
    private alertaService: AlertaService,
    private estadoAlertaService: EstadoAlertaService
  ) {}

  ngOnInit() {
    this.estadoAlertaService.getEstadosAlerta().subscribe(estados => {
      this.estadosAlerta = estados;
    });
    if (this.idTransaccion) {
      this.loadAlertas();
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['idTransaccion'] && changes['idTransaccion'].currentValue) {
      this.currentPage = 0;
      this.loadAlertas(0, this.pageSize);
    }
  }

  loadAlertas(page: number = 0, size: number = this.pageSize) {
    if (!this.idTransaccion) return;
    this.loading = true;
    this.alertaService.getByTransaccion(this.idTransaccion, page, size).subscribe({
      next: (resp) => {
        // Ordenar por fecha descendente (más recientes primero)
        const datosOrdenados = resp.data.sort((a: any, b: any) => {
          const fechaA = new Date(a.AudFecha).getTime();
          const fechaB = new Date(b.AudFecha).getTime();
          return fechaB - fechaA;
        });
        
        this.alertas = datosOrdenados;
        this.dataSource.data = datosOrdenados;
        this.totalAlertas = resp.total;
        this.loading = false;
      },
      error: () => {
        this.alertas = [];
        this.dataSource.data = [];
        this.totalAlertas = 0;
        this.loading = false;
      }
    });
  }

  onPageChange(event: PageEvent) {
    this.currentPage = event.pageIndex;
    this.pageSize = event.pageSize;
    this.loadAlertas(this.currentPage, this.pageSize);
  }

  onCrearAlerta(alerta: any) {
    this.loadAlertas(this.currentPage, this.pageSize);
    this.mostrarFormulario = false;
  }

  onActualizarAlerta(alerta: any) {
    console.log('=== onActualizarAlerta recibido ===');
    console.log('Datos para actualizar:', alerta);
    console.log('Alerta original:', this.alertaEdit);
    
    if (this.alertaEdit && this.alertaEdit.idAlerta) {
      console.log('Actualizando alerta ID:', this.alertaEdit.idAlerta);
      this.alertaService.updateAlerta(this.alertaEdit.idAlerta, alerta).subscribe({
        next: (resp) => {
          console.log('Alerta actualizada exitosamente:', resp);
          this.loadAlertas(this.currentPage, this.pageSize);
          this.editando = false;
          this.alertaEdit = null;
          this.mostrarFormulario = false;
        },
        error: (err) => {
          console.error('Error al actualizar alerta:', err);
        }
      });
    } else {
      console.error('No se encontró el ID de la alerta para actualizar');
    }
  }

  onEditarAlerta(alerta: any) {
    this.alertaEdit = { ...alerta };
    this.editando = true;
    this.mostrarFormulario = true;
  }

  getEstadoNombre(idEstado: number): string {
    if (!idEstado || !this.estadosAlerta.length) return '';
    const estado = this.estadosAlerta.find(e => e.IdEstado === idEstado);
    return estado ? estado.nombre : '';
  }
}
