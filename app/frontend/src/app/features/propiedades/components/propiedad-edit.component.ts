import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { PropiedadFormComponent } from './propiedad-form.component';
import { PropiedadMinera, PropiedadMineraCreate } from '../models/propiedad-minera.model';
import { PropiedadMineraService } from '../services/propiedad-minera.service';

@Component({
  selector: 'app-propiedad-edit',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    PropiedadFormComponent
  ],
  template: `
    <div class="edit-container">
      <div class="header-section">
        <button mat-button class="back-fancy-btn" (click)="volver()">
          <mat-icon>arrow_back</mat-icon>
          Volver a Propiedades
        </button>
        <h1>Editar Propiedad Minera</h1>
      </div>

      <div *ngIf="loading" class="loading-message">
        Cargando propiedad minera...
      </div>
      
      <app-propiedad-form 
        *ngIf="!loading && propiedad"
        modo="editar"
        [propiedad]="propiedad"
        (update)="onUpdate($event)"
        (cancel)="volver()">
      </app-propiedad-form>

      <div *ngIf="!loading && !propiedad && !loadError" class="not-found-message">
        Propiedad minera no encontrada
      </div>

      <div *ngIf="loadError" class="error-message">
        Error al cargar la propiedad minera: {{ loadError }}
      </div>
      
      <div *ngIf="success" class="success-message">
        ✅ Propiedad minera actualizada correctamente
      </div>
      <div *ngIf="updateError" class="error-message">
        ❌ Error al actualizar la propiedad minera: {{ updateError }}
      </div>
    </div>
  `,
  styles: [`
    .edit-container {
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
    .loading-message {
      color: #666;
      text-align: center;
      padding: 2rem;
      font-size: 1.1rem;
    }
    .not-found-message {
      color: #ff9800;
      background: #fff3e0;
      padding: 1rem;
      border-radius: 8px;
      text-align: center;
      font-weight: 500;
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
export class PropiedadEditComponent implements OnInit {
  propiedad: PropiedadMinera | null = null;
  loading = true;
  loadError: string | null = null;
  success = false;
  updateError: string | null = null;
  propiedadId: number;

  constructor(
    private propiedadService: PropiedadMineraService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.propiedadId = +this.route.snapshot.params['id'];
  }

  ngOnInit() {
    this.loadPropiedad();
  }

  private loadPropiedad() {
    this.loading = true;
    this.loadError = null;

    this.propiedadService.getPropiedadById(this.propiedadId).subscribe({
      next: (propiedad) => {
        this.propiedad = propiedad;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error cargando propiedad:', error);
        this.loadError = error.message || 'Error desconocido';
        this.loading = false;
      }
    });
  }

  onUpdate(event: {id: number, data: Partial<PropiedadMineraCreate>}) {
    this.success = false;
    this.updateError = null;

    this.propiedadService.updatePropiedad(event.id, event.data).subscribe({
      next: (result) => {
        console.log('Propiedad actualizada:', result);
        this.success = true;
        // Actualizar los datos locales
        if (this.propiedad) {
          this.propiedad = { ...this.propiedad, ...result };
        }
        // Redirigir después de 2 segundos
        setTimeout(() => {
          this.router.navigate(['/propiedades']);
        }, 2000);
      },
      error: (error) => {
        console.error('Error actualizando propiedad:', error);
        this.updateError = error.message || 'Error desconocido';
        // Limpiar mensaje de error después de 5 segundos
        setTimeout(() => {
          this.updateError = null;
        }, 5000);
      }
    });
  }

  volver() {
    this.router.navigate(['/propiedades']);
  }
}
