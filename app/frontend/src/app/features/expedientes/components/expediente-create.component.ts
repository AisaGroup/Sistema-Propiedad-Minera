import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ExpedienteService } from '../services/expediente.service';
import { ExpedienteCreate } from '../models/expediente.model';
import { ExpedienteFormComponent } from './expediente-form.component';
import { MatIconModule } from '@angular/material/icon';

// Ejemplo de nomenclatura y modularización para expedientes:
// - components/expediente-list.component.ts
// - components/expediente-create.component.ts
// - components/expediente-detail.component.ts
// - models/expediente.model.ts
// - services/expediente.service.ts
//
// Lo mismo para actas, resoluciones, titulares, etc.
//
// Los archivos y componentes deben ser renombrados y movidos a sus carpetas correspondientes siguiendo la convención en inglés.

@Component({
  selector: 'app-expediente-create',
  standalone: true,
  imports: [CommonModule, ExpedienteFormComponent, MatIconModule],
  template: `
    <div style="display: flex; align-items: center; gap: 1rem; margin-bottom: 1.5rem;">
      <button mat-raised-button class="back-fancy-btn" (click)="volver()">
        <mat-icon>arrow_back</mat-icon>
      </button>
      <h2 class="form-title" style="margin: 0;">Crear Expediente</h2>
    </div>
    <app-expediente-form (create)="onCreate($event)"></app-expediente-form>
    <div *ngIf="success" style="color: green; margin-top: 1rem;">Expediente creado correctamente.</div>
    <div *ngIf="error" style="color: red; margin-top: 1rem;">Ocurrió un error al crear el expediente.</div>
  `,
  styles: [`
    .back-fancy-btn {
      box-shadow: 0 2px 8px rgba(65,103,89,0.10), 0 1.5px 4px rgba(0,0,0,0.10);
      border-radius: 16px;
      background: #fff;
      color: #416759;
      border: 1.5px solid #e0e0e0;
      transition: box-shadow 0.25s cubic-bezier(.4,0,.2,1), transform 0.18s cubic-bezier(.4,0,.2,1);
    }
    .back-fancy-btn:hover {
      box-shadow: 0 4px 16px rgba(65,103,89,0.18), 0 3px 8px rgba(0,0,0,0.13);
      background: #f4faf7;
      color: #335248;
      transform: translateY(-2px) scale(1.07);
    }
  `]
})
export class ExpedienteCreateComponent {
  success = false;
  error = false;

  constructor(private expedienteService: ExpedienteService, private router: Router) {}

  onCreate(expediente: ExpedienteCreate) {
    this.success = false;
    this.error = false;
    this.expedienteService.createExpediente(expediente).subscribe({
      next: (result) => {
        this.success = true;
        setTimeout(() => this.router.navigate(['/expedientes']), 1200);
      },
      error: (err) => {
        console.error('Error al crear expediente:', err);
        this.error = true;
      }
    });
  }

  volver() {
    this.router.navigate(['/expedientes']);
  }
}
