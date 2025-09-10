import { Component, Input, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
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
    MatChipsModule
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
        <div *ngIf="loading" class="loading">Cargando...</div>
        
        <div *ngIf="!loading && reqMineros.length === 0" class="no-data">
          No hay requerimientos mineros registrados.
        </div>
        
        <table mat-table [dataSource]="reqMineros" *ngIf="!loading && reqMineros.length > 0" class="full-width">
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
              <button mat-icon-button color="primary" (click)="onEditReqMinero(req)" title="Editar">
                <mat-icon>edit</mat-icon>
              </button>
              <button mat-icon-button color="warn" (click)="onDeleteReqMinero(req)" title="Eliminar">
                <mat-icon>delete</mat-icon>
              </button>
            </td>
          </ng-container>

          <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
          <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
        </table>
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
  `]
})
export class ReqMineroListComponent implements OnInit, OnChanges {
  @Input() idTransaccion?: number;

  reqMineros: ReqMinero[] = [];
  loading = false;
  displayedColumns: string[] = ['IdReqMinero', 'Tipo', 'Descripcion', 'IdTransaccion', 'acciones'];

  constructor(private reqMineroService: ReqMineroService) {}

  ngOnInit() {
    this.loadReqMineros();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['idTransaccion'] && this.idTransaccion) {
      this.loadReqMinerosByTransaccion();
    }
  }

  loadReqMineros() {
    this.loading = true;
    this.reqMineroService.getReqMineros().subscribe({
      next: (response) => {
        this.reqMineros = Array.isArray(response) ? response : response.data || [];
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading req mineros:', error);
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
          this.loadReqMineros();
        },
        error: (error) => {
          console.error('Error deleting req minero:', error);
          alert('Error al eliminar el requerimiento minero');
        }
      });
    }
  }
}
