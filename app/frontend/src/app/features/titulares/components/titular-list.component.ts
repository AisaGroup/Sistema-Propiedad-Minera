import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TitularMineroService, TitularMinero } from '../services/titular.service';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';

@Component({
  selector: 'app-titulares-mineros',
  standalone: true,
  imports: [CommonModule, MatTableModule, MatIconModule, MatTooltipModule],
  template: `
    <h2 class="section-title">Titulares Mineros</h2>
    <table mat-table [dataSource]="titulares" class="mat-elevation-z1 full-width-table" *ngIf="titulares.length">
      <ng-container matColumnDef="IdTitular">
        <th mat-header-cell *matHeaderCellDef>ID</th>
        <td mat-cell *matCellDef="let titular">{{ titular.IdTitular }}</td>
      </ng-container>
      <ng-container matColumnDef="Nombre">
        <th mat-header-cell *matHeaderCellDef>Nombre</th>
        <td mat-cell *matCellDef="let titular">{{ titular.Nombre }}</td>
      </ng-container>
      <ng-container matColumnDef="TipoPersona">
        <th mat-header-cell *matHeaderCellDef>Tipo Persona</th>
        <td mat-cell *matCellDef="let titular">{{ titular.TipoPersona }}</td>
      </ng-container>
      <ng-container matColumnDef="DniCuit">
        <th mat-header-cell *matHeaderCellDef>DNI/CUIT</th>
        <td mat-cell *matCellDef="let titular">{{ titular.DniCuit }}</td>
      </ng-container>
      <ng-container matColumnDef="Domicilio">
        <th mat-header-cell *matHeaderCellDef>Domicilio</th>
        <td mat-cell *matCellDef="let titular">{{ titular.Domicilio }}</td>
      </ng-container>
      <ng-container matColumnDef="Telefono">
        <th mat-header-cell *matHeaderCellDef>Teléfono</th>
        <td mat-cell *matCellDef="let titular">{{ titular.Telefono }}</td>
      </ng-container>
      <ng-container matColumnDef="Email">
        <th mat-header-cell *matHeaderCellDef>Email</th>
        <td mat-cell *matCellDef="let titular">{{ titular.Email }}</td>
      </ng-container>
      <ng-container matColumnDef="FechaAsignacion">
        <th mat-header-cell *matHeaderCellDef>Fecha Asignación</th>
        <td mat-cell *matCellDef="let titular">{{ titular.FechaAsignacion | date:'dd/MM/yyyy' }}</td>
      </ng-container>
      <ng-container matColumnDef="Estado">
        <th mat-header-cell *matHeaderCellDef>Estado</th>
        <td mat-cell *matCellDef="let titular">{{ titular.Estado }}</td>
      </ng-container>
      <ng-container matColumnDef="RepresentanteLegal">
        <th mat-header-cell *matHeaderCellDef>Representante Legal</th>
        <td mat-cell *matCellDef="let titular">{{ titular.RepresentanteLegal }}</td>
      </ng-container>
      <ng-container matColumnDef="Observaciones">
        <th mat-header-cell *matHeaderCellDef>Observaciones</th>
        <td mat-cell *matCellDef="let titular">{{ titular.Observaciones }}</td>
      </ng-container>
      <ng-container matColumnDef="Descripcion">
        <th mat-header-cell *matHeaderCellDef>Descripción</th>
        <td mat-cell *matCellDef="let titular">{{ titular.Descripcion }}</td>
      </ng-container>
      <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
      <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
    </table>
    <div *ngIf="!titulares.length">Cargando...</div>
  `,
  styles: [`
    .full-width-table { width: 100%; background: #fff; border-radius: 8px; box-shadow: 0 2px 8px rgba(65, 103, 89, 0.08); }
    th.mat-mdc-header-cell, .mat-mdc-table .mat-mdc-header-cell {
      background: #416759 !important;
      color: #fff !important;
      font-weight: 700;
      font-size: 1.08rem;
      border-bottom: 2px solid #335248;
      letter-spacing: 0.02em;
      text-transform: none;
    }
    tr.mat-header-row {
      height: 48px;
    }
    td.mat-mdc-cell {
      color: #222;
      font-size: 1.01rem;
      border-bottom: 1px solid #e8f0ec;
    }
    th, td { color: #222; }
    .section-title { color: #222; font-weight: 700; margin-bottom: 18px; font-size: 1.35rem; letter-spacing: 0.01em; }
  `]
})
export class TitularesMinerosComponent implements OnInit {
  titulares: TitularMinero[] = [];
  displayedColumns = [
    'IdTitular', 'Nombre', 'TipoPersona', 'DniCuit', 'Domicilio', 'Telefono', 'Email',
    'FechaAsignacion', 'Estado', 'RepresentanteLegal', 'Observaciones', 'Descripcion'
  ];

  constructor(private titularService: TitularMineroService) {}

  ngOnInit() {
    this.titularService.getAll().subscribe(data => {
      this.titulares = data;
    });
  }
}
