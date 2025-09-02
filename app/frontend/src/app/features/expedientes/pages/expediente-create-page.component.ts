import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { ExpedienteService } from '../services/expediente.service';
import { ExpedienteCreate } from '../models/expediente.model';
import { ExpedienteFormComponent } from '../components/expediente-form.component';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-expediente-create-page',
  standalone: true,
  imports: [CommonModule, ExpedienteFormComponent],
  template: `
    <h2>Crear Expediente</h2>
    <app-expediente-form (create)="onCreate($event)"></app-expediente-form>
    <div *ngIf="success" style="color: green; margin-top: 1rem;">Expediente creado correctamente.</div>
    <div *ngIf="error" style="color: red; margin-top: 1rem;">Ocurrió un error al crear el expediente.</div>
  `
})
export class ExpedienteCreatePageComponent {
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
