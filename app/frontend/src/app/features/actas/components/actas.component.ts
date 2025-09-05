import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatPaginator, MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { ActaService, Acta } from '../services/acta.service';
import { HttpResponse } from '@angular/common/http';
import { ActaCreateComponent } from './acta-create.component';
import { ActaEditComponent } from './acta-edit.component';
import { Router } from '@angular/router';

@Component({
  selector: 'app-actas',
  standalone: true,
  imports: [CommonModule, MatTableModule, MatButtonModule, MatIconModule, MatChipsModule, MatTooltipModule, MatProgressSpinnerModule, MatPaginatorModule, ActaCreateComponent, ActaEditComponent],
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
          <ng-container matColumnDef="IdActa">
            <th mat-header-cell *matHeaderCellDef>ID</th>
            <td mat-cell *matCellDef="let acta">{{ acta.IdActa }}</td>
          </ng-container>
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
        <mat-paginator [length]="totalActas" [pageSize]="pageSize" [pageIndex]="pageIndex" [pageSizeOptions]="[5, 10, 20]" (page)="onPageChange($event)"></mat-paginator>
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
  `]
})
export class ActasComponent implements OnInit {
  @Input() idExpediente!: number;
  actas: Acta[] = [];
  loadingActas = false;
  displayedColumns = ['IdActa', 'Fecha', 'Descripcion', 'actions'];
  totalActas = 0;
  pageSize = 10;
  pageIndex = 0;
  mostrarFormulario = false;
  editando = false;
  actaEdit: Acta | null = null;

  constructor(private actaService: ActaService, private router: Router) {}

  ngOnInit() {
    if (this.idExpediente) {
      this.cargarActas();
    }
  }

  cargarActas() {
    this.loadingActas = true;
    this.actaService.getActasByExpedientePaged(this.idExpediente, this.pageIndex, this.pageSize)
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

  onPageChange(event: PageEvent) {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    this.cargarActas();
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
