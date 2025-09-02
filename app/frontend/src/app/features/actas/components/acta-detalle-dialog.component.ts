import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { Alerta, Acta } from '../services/acta.service';

@Component({
  selector: 'app-acta-detalle-dialog',
  standalone: true,
  imports: [CommonModule, MatDialogModule],
  template: `
    <h2 mat-dialog-title>Detalle de Acta</h2>
    <mat-dialog-content>
      <div><b>ID:</b> {{ data.acta.IdActa }}</div>
      <div><b>Fecha:</b> {{ data.acta.Fecha | date:'dd/MM/yyyy' }}</div>
      <div><b>Tipo:</b> {{ data.acta.IdTipoActa }}</div>
      <div><b>Descripción:</b> {{ data.acta.Descripcion }}</div>
      <div><b>Lugar:</b> {{ data.acta.Lugar }}</div>
      <div><b>Autoridad:</b> {{ data.acta.IdAutoridad }}</div>
      <div><b>Observaciones:</b> {{ data.acta.Obs }}</div>
      <div><b>Auditoría Fecha:</b> {{ data.acta.AudFecha }}</div>
      <div><b>Auditoría Usuario:</b> {{ data.acta.AudUsuario }}</div>
      <div *ngIf="data.alertas && data.alertas.length > 0" class="alertas-section">
        <h3>Alertas asociadas</h3>
        <ul>
          <li *ngFor="let alerta of data.alertas">
            <b>ID:</b> {{ alerta.idAlerta }} | <b>Estado:</b> {{ alerta.Estado }} | <b>Mensaje:</b> {{ alerta.Mensaje }}
          </li>
        </ul>
      </div>
      <div *ngIf="!data.alertas || data.alertas.length === 0" class="alertas-section">
        <em>No hay alertas asociadas a esta acta.</em>
      </div>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button mat-dialog-close>Cerrar</button>
    </mat-dialog-actions>
  `,
  styles: [`
    .alertas-section { margin-top: 16px; }
    h3 { color: #416759; margin-bottom: 8px; }
    ul { padding-left: 18px; }
    li { margin-bottom: 4px; }
  `]
})
export class ActaDetalleDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<ActaDetalleDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { acta: Acta, alertas: Alerta[] }
  ) {}
}
