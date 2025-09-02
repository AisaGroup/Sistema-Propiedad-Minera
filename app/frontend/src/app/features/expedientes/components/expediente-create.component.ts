import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ExpedienteService } from '../services/expediente.service';
import { ExpedienteCreate } from '../models/expediente.model';
import { ExpedienteFormComponent } from './expediente-form.component';

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
  imports: [CommonModule, ExpedienteFormComponent],
  template: `
    <h2 class="form-title">Crear Expediente</h2>
    <app-expediente-form (create)="onCreate($event)"></app-expediente-form>
    <div *ngIf="success" style="color: green; margin-top: 1rem;">Expediente creado correctamente.</div>
    <div *ngIf="error" style="color: red; margin-top: 1rem;">Ocurrió un error al crear el expediente.</div>
  `
})
export class ExpedienteCreateComponent {
  success = false;
  error = false;

  constructor(private expedienteService: ExpedienteService, private router: Router) {}

  onCreate(expediente: ExpedienteCreate) {
    this.success = false;
    this.error = false;
    this.expedienteService.createExpediente(expediente).subscribe({
      next: () => {
        this.success = true;
        setTimeout(() => this.router.navigate(['/expedientes']), 1200);
      },
      error: () => {
        this.error = true;
      }
    });
  }
}
