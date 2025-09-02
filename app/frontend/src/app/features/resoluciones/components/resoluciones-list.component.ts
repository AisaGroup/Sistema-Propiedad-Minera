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

@Component({
  selector: 'app-resoluciones-list',
  standalone: true,
  imports: [CommonModule, MatTableModule, MatButtonModule, MatIconModule, MatChipsModule, MatTooltipModule, MatProgressSpinnerModule, MatPaginatorModule],
  template: `
    <div>
      <div class="header-row">
        <span class="section-title">Resoluciones Asociadas</span>
        <mat-chip *ngIf="totalResoluciones > 0" class="count-chip">{{ totalResoluciones }}</mat-chip>
        <span class="spacer"></span>
        <button mat-raised-button color="primary" (click)="crearResolucion()">
          <mat-icon>add</mat-icon> Nueva Resolución
        </button>
      </div>
      <div *ngIf="loadingResoluciones" class="loading-container">
        <mat-spinner diameter="32"></mat-spinner>
        <p>Cargando resoluciones...</p>
      </div>
      <div class="table-container" *ngIf="resoluciones && resoluciones.length > 0 && !loadingResoluciones">
        <table mat-table [dataSource]="resoluciones" class="resoluciones-table mat-elevation-4">
          <!-- Columnas -->
          <ng-container matColumnDef="IdResolucion">
            <th mat-header-cell *matHeaderCellDef>ID</th>
            <td mat-cell *matCellDef="let resolucion">{{ resolucion.IdResolucion }}</td>
          </ng-container>
          <ng-container matColumnDef="Fecha">
            <th mat-header-cell *matHeaderCellDef>Fecha</th>
            <td mat-cell *matCellDef="let resolucion">{{ resolucion.Fecha_emision | date:'dd/MM/yyyy' }}</td>
          </ng-container>
          <ng-container matColumnDef="Tipo">
            <th mat-header-cell *matHeaderCellDef>Tipo</th>
            <td mat-cell *matCellDef="let resolucion">{{ resolucion.Titulo }}</td>
          </ng-container>
          <ng-container matColumnDef="Descripcion">
            <th mat-header-cell *matHeaderCellDef>Descripción</th>
            <td mat-cell *matCellDef="let resolucion">{{ resolucion.Descripcion }}</td>
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
      <div *ngIf="resoluciones && resoluciones.length === 0 && !loadingResoluciones" class="no-data">
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
  `]
})
export class ResolucionesListComponent implements OnInit {
  @Input() idExpediente!: number;
  resoluciones: Resolucion[] = [];
  loadingResoluciones = false;
  displayedColumns = ['IdResolucion', 'Fecha', 'Tipo', 'Descripcion', 'actions'];
  totalResoluciones = 0;
  pageSize = 10;
  pageIndex = 0;

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

  crearResolucion() {
    // Lógica para crear resolución
  }
  verResolucion(resolucion: Resolucion) {
    this.router.navigate(['/expedientes', this.idExpediente, 'resolucion', resolucion.IdResolucion]);
  }
  editarResolucion(resolucion: Resolucion) {
    // Lógica para editar resolución
  }
}
