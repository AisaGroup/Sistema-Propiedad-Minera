import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AlertaGlobalService } from '../services/alerta-global.service';

@Component({
  selector: 'app-alertas-global-list',
  standalone: true,
  imports: [CommonModule, MatTableModule, MatPaginatorModule, MatProgressSpinnerModule],
  template: `
    <div>
      <h2>Alertas del Sistema</h2>
      <div *ngIf="loading" class="loading-container">
        <mat-spinner diameter="32"></mat-spinner>
        <p>Cargando alertas...</p>
      </div>
      <div class="table-container" *ngIf="!loading && alertas.length > 0">
        <table mat-table [dataSource]="alertas" class="mat-elevation-2">
          <ng-container matColumnDef="idAlerta">
            <th mat-header-cell *matHeaderCellDef>ID</th>
            <td mat-cell *matCellDef="let alerta">{{ alerta.idAlerta }}</td>
          </ng-container>
            <ng-container matColumnDef="Estado">
              <th mat-header-cell *matHeaderCellDef>Estado</th>
              <td mat-cell *matCellDef="let alerta">{{ alerta.estado_nombre }}</td>
            </ng-container>
          <ng-container matColumnDef="Asunto">
            <th mat-header-cell *matHeaderCellDef>Asunto</th>
            <td mat-cell *matCellDef="let alerta">{{ alerta.Asunto }}</td>
          </ng-container>
          <ng-container matColumnDef="Mensaje">
            <th mat-header-cell *matHeaderCellDef>Mensaje</th>
            <td mat-cell *matCellDef="let alerta">{{ alerta.Mensaje }}</td>
          </ng-container>
  displayedColumns: string[] = ['idAlerta', 'Estado', 'Asunto', 'Mensaje'];
          <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
          <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
        </table>
      </div>
      <div *ngIf="!loading && alertas.length === 0" class="no-data">
        <p>No hay alertas en el sistema.</p>
      </div>
      <mat-paginator *ngIf="totalAlertas > 0" [length]="totalAlertas" [pageSize]="pageSize" [pageSizeOptions]="[5, 10, 25]" (page)="onPageChange($event)"></mat-paginator>
    </div>
  `,
  styles: [`
    :host {
      display: block;
      background: #fff;
      box-shadow: 0 2px 8px rgba(0,0,0,0.04);
      border-radius: 8px;
      padding: 24px;
    }
    .loading-container { display: flex; align-items: center; gap: 12px; margin: 16px 0; }
    .table-container { overflow-x: auto; margin-top: 1rem; }
    .no-data { color: #888; font-style: italic; margin-top: 16px; }
  `]
})
export class AlertasGlobalListComponent implements OnInit {
  alertas: any[] = [];
  totalAlertas = 0;
  pageSize = 10;
  currentPage = 0;
  loading = false;
  displayedColumns: string[] = ['idAlerta', 'Estado', 'Asunto', 'Mensaje'];

  constructor(private alertaGlobalService: AlertaGlobalService) {}

  ngOnInit() {
    this.loadAlertas();
  }

  loadAlertas(page: number = 0, size: number = this.pageSize) {
    this.loading = true;
    this.alertaGlobalService.getAllPaginated(page, size).subscribe({
      next: (resp) => {
        this.alertas = resp.data;
        this.totalAlertas = resp.total;
        this.loading = false;
      },
      error: () => {
        this.alertas = [];
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
}
