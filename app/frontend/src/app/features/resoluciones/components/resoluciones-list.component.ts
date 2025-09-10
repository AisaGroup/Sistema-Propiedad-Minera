import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatPaginator, MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { HttpResponse } from '@angular/common/http';
import { ResolucionService, Resolucion } from '../services/resolucion.service';
import { Router } from '@angular/router';
import { ResolucionCreateComponent } from './resolucion-create.component';
import { ResolucionEditComponent } from './resolucion-edit.component';

@Component({
  selector: 'app-resoluciones-list',
  standalone: true,
  imports: [CommonModule, MatTableModule, MatButtonModule, MatIconModule, MatChipsModule, MatTooltipModule, MatProgressSpinnerModule, MatPaginatorModule, ResolucionCreateComponent, ResolucionEditComponent],
  template: `
    <div>
      <div class="header-row">
        <span class="section-title">Resoluciones Asociadas</span>
        <mat-chip *ngIf="totalResoluciones > 0" class="count-chip">{{ totalResoluciones }}</mat-chip>
        <span class="spacer"></span>
        <button *ngIf="!mostrarFormulario" mat-raised-button color="primary" (click)="abrirCrear()">
          <mat-icon>add</mat-icon> Nueva Resolución
        </button>
      </div>
      <button *ngIf="mostrarFormulario" mat-stroked-button class="close-btn" (click)="cerrarFormulario()" aria-label="Cerrar">
        Cerrar
      </button>
      <div *ngIf="mostrarFormulario && !editando">
        <app-resolucion-create [idExpediente]="idExpediente" (create)="onCrearResolucion($event)" (cancelar)="cerrarFormulario()"></app-resolucion-create>
      </div>
      <div *ngIf="mostrarFormulario && editando">
        <app-resolucion-edit [resolucion]="resolucionEdit" (update)="onActualizarResolucion($event)" (cancelar)="cerrarFormulario()"></app-resolucion-edit>
      </div>
      <div class="table-container" *ngIf="resoluciones && resoluciones.length > 0 && !loadingResoluciones && !mostrarFormulario">
        <table mat-table [dataSource]="resoluciones" class="resoluciones-table mat-elevation-4">
          <!-- Columnas -->
          <ng-container matColumnDef="Numero">
            <th mat-header-cell *matHeaderCellDef>Número</th>
            <td mat-cell *matCellDef="let resolucion">{{ resolucion.Numero }}</td>
          </ng-container>
          <ng-container matColumnDef="Titulo">
            <th mat-header-cell *matHeaderCellDef>Título</th>
            <td mat-cell *matCellDef="let resolucion">{{ resolucion.Titulo }}</td>
          </ng-container>
          <ng-container matColumnDef="Estado">
            <th mat-header-cell *matHeaderCellDef>Estado</th>
            <td mat-cell *matCellDef="let resolucion">{{ resolucion.Estado }}</td>
          </ng-container>
          <ng-container matColumnDef="Fecha">
            <th mat-header-cell *matHeaderCellDef>Fecha de Emisión</th>
            <td mat-cell *matCellDef="let resolucion">{{ resolucion.Fecha_emision | date:'dd/MM/yyyy' }}</td>
          </ng-container>
          <ng-container matColumnDef="actions">
            <th mat-header-cell *matHeaderCellDef>Acciones</th>
            <td mat-cell *matCellDef="let resolucion">
              <button mat-icon-button color="primary" matTooltip="Ver" (click)="verResolucion(resolucion); $event.stopPropagation()">
                <mat-icon>visibility</mat-icon>
              </button>
              <button mat-icon-button color="primary" matTooltip="Editar" (click)="editarResolucion(resolucion); $event.stopPropagation()">
                <mat-icon>edit</mat-icon>
              </button>
            </td>
          </ng-container>
          <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
          <tr mat-row *matRowDef="let row; columns: displayedColumns;" (click)="verResolucion(row)" style="cursor:pointer"></tr>
        </table>
        <mat-paginator [length]="totalResoluciones" [pageSize]="pageSize" [pageIndex]="pageIndex" [pageSizeOptions]="[5, 10, 20]" (page)="onPageChange($event)"></mat-paginator>
      </div>
      <div *ngIf="resoluciones && resoluciones.length === 0 && !loadingResoluciones && !mostrarFormulario" class="no-data">
        No hay resoluciones asociadas.
      </div>
    </div>
  `,
  styles: [`
    .header-row { display: flex; align-items: center; margin-bottom: 12px; }
    .section-title { font-size: 1.1rem; font-weight: 600; color: #333; }
    .spacer { flex: 1 1 auto; }
    .count-chip { background: #416759; color: #fff; margin-left: 8px; }
    .table-container { overflow-x: auto; }
    .resoluciones-table th, .resoluciones-table td { color: #333; }
    .no-data { color: #888; font-style: italic; margin-top: 16px; }
    .loading-container { display: flex; align-items: center; gap: 12px; margin: 16px 0; }
    .close-btn { display: block; margin: 0 0 1.5rem 0; position: relative; left: 0; top: 0; background: #fff; border-radius: 6px; z-index: 2; }
  `]
})
export class ResolucionesListComponent implements OnInit {
  @Input() idExpediente!: number;
  resoluciones: Resolucion[] = [];
  loadingResoluciones = false;
  displayedColumns = ['Numero', 'Titulo', 'Estado', 'Fecha', 'actions'];
  totalResoluciones = 0;
  pageSize = 10;
  pageIndex = 0;
  mostrarFormulario = false;
  editando = false;
  resolucionEdit: Resolucion | null = null;

  constructor(private resolucionService: ResolucionService, private router: Router) {}

  ngOnInit() {
    if (this.idExpediente) {
      this.cargarResoluciones();
    }
  }

  cargarResoluciones() {
    this.loadingResoluciones = true;
    this.resolucionService.getResolucionesByExpedientePaged(this.idExpediente, this.pageIndex, this.pageSize)
      .subscribe({
        next: (resp: HttpResponse<Resolucion[]>) => {
          this.resoluciones = resp.body || [];
          const contentRange = resp.headers.get('Content-Range');
          if (contentRange) {
            const match = contentRange.match(/\d+-\d+\/(\d+)/);
            this.totalResoluciones = match ? +match[1] : this.resoluciones.length;
          } else {
            this.totalResoluciones = this.resoluciones.length;
          }
          this.loadingResoluciones = false;
        },
        error: () => {
          this.resoluciones = [];
          this.totalResoluciones = 0;
          this.loadingResoluciones = false;
        }
      });
  }

  onPageChange(event: PageEvent) {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    this.cargarResoluciones();
  }

  abrirCrear() {
    this.mostrarFormulario = true;
    this.editando = false;
    this.resolucionEdit = null;
  }
  cerrarFormulario() {
    this.mostrarFormulario = false;
    this.editando = false;
    this.resolucionEdit = null;
  }
  onCrearResolucion(resolucion: Resolucion) {
    this.resolucionService.createResolucion(resolucion).subscribe({
      next: () => {
        this.cargarResoluciones();
        this.cerrarFormulario();
      }
    });
  }
  verResolucion(resolucion: Resolucion) {
    this.router.navigate(['/expedientes', this.idExpediente, 'resolucion', resolucion.IdResolucion]);
  }
  editarResolucion(resolucion: Resolucion) {
    this.resolucionEdit = { ...resolucion };
    this.editando = true;
    this.mostrarFormulario = true;
  }
  onActualizarResolucion(resolucion: Resolucion) {
    if (!resolucion.IdResolucion) return;
    this.resolucionService.updateResolucion(resolucion.IdResolucion, resolucion).subscribe({
      next: () => {
        this.cargarResoluciones();
        this.cerrarFormulario();
      }
    });
  }
}
