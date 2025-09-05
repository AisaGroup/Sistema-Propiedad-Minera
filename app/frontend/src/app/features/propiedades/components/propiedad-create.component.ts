import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { PropiedadFormComponent } from './propiedad-form.component';
import { PropiedadMineraCreate } from '../models/propiedad-minera.model';
import { PropiedadMineraService } from '../services/propiedad-minera.service';

@Component({
  selector: 'app-propiedad-create',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    PropiedadFormComponent
  ],
  template: `
    <div class="create-container">
      <div class="header-section">
        <button mat-button class="back-fancy-btn" (click)="volver()">
          <mat-icon>arrow_back</mat-icon>
          Volver a Propiedades
        </button>
        <h1>Nueva Propiedad Minera</h1>
      </div>
      
      <app-propiedad-form 
        modo="crear"
        (create)="onCreate($event)"
        (cancel)="volver()">
      </app-propiedad-form>
      
      <div *ngIf="success" class="success-message">
        ✅ Propiedad minera creada correctamente
      </div>
      <div *ngIf="error" class="error-message">
        ❌ Ocurrió un error al crear la propiedad minera
      </div>
    </div>
  `,
  styles: [`
    .create-container {
      max-width: 1400px;
      margin: 0 auto;
      padding: 1rem;
    }
    .header-section {
      display: flex;
      align-items: center;
      gap: 2rem;
      margin-bottom: 2rem;
    }
    .header-section h1 {
      color: #416759;
      font-size: 1.8rem;
      font-weight: 600;
      margin: 0;
    }
    .back-fancy-btn {
      box-shadow: 0 2px 8px rgba(65,103,89,0.10), 0 1.5px 4px rgba(0,0,0,0.10);
      border-radius: 16px;
      background: #fff;
      color: #416759;
      border: 1.5px solid #e0e0e0;
      transition: box-shadow 0.25s cubic-bezier(.4,0,.2,1), transform 0.18s cubic-bezier(.4,0,.2,1);
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 8px 16px;
    }
    .back-fancy-btn:hover {
      box-shadow: 0 4px 16px rgba(65,103,89,0.18), 0 3px 8px rgba(0,0,0,0.13);
      background: #f4faf7;
      color: #335248;
      transform: translateY(-2px) scale(1.02);
    }
    .success-message {
      color: #2e7d32;
      background: #e8f5e9;
      padding: 1rem;
      border-radius: 8px;
      margin-top: 1rem;
      text-align: center;
      font-weight: 500;
    }
    .error-message {
      color: #d32f2f;
      background: #ffebee;
      padding: 1rem;
      border-radius: 8px;
      margin-top: 1rem;
      text-align: center;
      font-weight: 500;
    }
  `]
})
export class PropiedadCreateComponent implements OnInit {
  success = false;
  error = false;

  constructor(
    private propiedadService: PropiedadMineraService,
    private router: Router
  ) {}

  ngOnInit() {
    // Limpiar mensajes al inicializar
    this.success = false;
    this.error = false;
  }

  onCreate(propiedad: PropiedadMineraCreate) {
    this.success = false;
    this.error = false;

    this.propiedadService.createPropiedad(propiedad).subscribe({
      next: (result) => {
        console.log('Propiedad creada:', result);
        this.success = true;
        // Redirigir después de 2 segundos
        setTimeout(() => {
          this.router.navigate(['/propiedades']);
        }, 2000);
      },
      error: (error) => {
        console.error('Error creando propiedad:', error);
        this.error = true;
        // Limpiar mensaje de error después de 5 segundos
        setTimeout(() => {
          this.error = false;
        }, 5000);
      }
    });
  }

  volver() {
    this.router.navigate(['/propiedades']);
  }
}
