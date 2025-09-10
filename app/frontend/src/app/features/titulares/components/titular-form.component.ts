import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { TitularMineroService, TitularMinero, TitularMineroCreate } from '../services/titular.service';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-titular-create-form',
  standalone: true,
  imports: [
    CommonModule, 
    ReactiveFormsModule, 
    MatFormFieldModule, 
    MatInputModule, 
    MatButtonModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule
  ],
  template: `
    <div class="form-container">
      <div class="form-header">
        <h2>Crear Nuevo Titular Minero</h2>
      </div>
      <form [formGroup]="form" (ngSubmit)="onSubmit()" class="titular-form">
        <!-- Información Personal -->
        <div class="section-title">Información Personal</div>
        <div class="form-row">
          <mat-form-field appearance="outline">
            <mat-label>Tipo Persona *</mat-label>
            <mat-select formControlName="TipoPersona" required>
              <mat-option value="Física">Persona Física</mat-option>
              <mat-option value="Jurídica">Persona Jurídica</mat-option>
            </mat-select>
            <mat-error *ngIf="form.get('TipoPersona')?.hasError('required')">
              El tipo de persona es requerido
            </mat-error>
          </mat-form-field>
          
          <mat-form-field appearance="outline">
            <mat-label>Nombre/Razón Social *</mat-label>
            <input matInput formControlName="Nombre" required />
            <mat-error *ngIf="form.get('Nombre')?.hasError('required')">
              El nombre es requerido
            </mat-error>
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>DNI/CUIT *</mat-label>
            <input matInput formControlName="DniCuit" required />
            <mat-error *ngIf="form.get('DniCuit')?.hasError('required')">
              El DNI/CUIT es requerido
            </mat-error>
          </mat-form-field>
        </div>

        <div class="form-row">
          <mat-form-field appearance="outline">
            <mat-label>Representante Legal *</mat-label>
            <input matInput formControlName="RepresentanteLegal" required />
            <mat-error *ngIf="form.get('RepresentanteLegal')?.hasError('required')">
              El representante legal es requerido
            </mat-error>
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Email *</mat-label>
            <input matInput type="email" formControlName="Email" required />
            <mat-error *ngIf="form.get('Email')?.hasError('required')">
              El email es requerido
            </mat-error>
            <mat-error *ngIf="form.get('Email')?.hasError('email')">
              Ingrese un email válido
            </mat-error>
          </mat-form-field>
          
          <mat-form-field appearance="outline">
            <mat-label>Teléfono *</mat-label>
            <input matInput formControlName="Telefono" required />
            <mat-error *ngIf="form.get('Telefono')?.hasError('required')">
              El teléfono es requerido
            </mat-error>
          </mat-form-field>
        </div>

        <!-- Información de Contacto -->
        <div class="section-title">Información de Contacto y Asignación</div>
        <div class="form-row">
          <mat-form-field appearance="outline">
            <mat-label>Domicilio *</mat-label>
            <input matInput formControlName="Domicilio" required />
            <mat-error *ngIf="form.get('Domicilio')?.hasError('required')">
              El domicilio es requerido
            </mat-error>
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Fecha de Asignación *</mat-label>
            <input matInput [matDatepicker]="picker" formControlName="FechaAsignacion" required>
            <mat-hint>DD/MM/AAAA</mat-hint>
            <mat-datepicker-toggle matIconSuffix [for]="picker"></mat-datepicker-toggle>
            <mat-datepicker #picker></mat-datepicker>
            <mat-error *ngIf="form.get('FechaAsignacion')?.hasError('required')">
              La fecha de asignación es requerida
            </mat-error>
          </mat-form-field>
          
          <mat-form-field appearance="outline">
            <mat-label>Estado *</mat-label>
            <mat-select formControlName="Estado" required>
              <mat-option value="Activo">Activo</mat-option>
              <mat-option value="Inactivo">Inactivo</mat-option>
              <mat-option value="Suspendido">Suspendido</mat-option>
            </mat-select>
            <mat-error *ngIf="form.get('Estado')?.hasError('required')">
              El estado es requerido
            </mat-error>
          </mat-form-field>
        </div>

        <!-- Información Adicional -->
        <div class="section-title">Información Adicional</div>
        <div class="form-row">
          <mat-form-field appearance="outline">
            <mat-label>Descripción</mat-label>
            <textarea matInput formControlName="Descripcion" rows="2"></textarea>
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Observaciones</mat-label>
            <textarea matInput formControlName="Observaciones" rows="2"></textarea>
          </mat-form-field>

          <!-- Campo vacío para mantener la estructura de 3 columnas -->
          <div class="empty-field"></div>
        </div>

        <div class="form-actions">
          <button mat-button type="button" (click)="testClick()">
            Test Click
          </button>
          <button mat-button type="button" (click)="onCancel()" class="cancel-btn">
            Cancelar
          </button>
          <button mat-raised-button color="primary" type="button" (click)="onSubmit()">
            {{ loading ? 'Creando...' : 'Crear Titular' }}
          </button>
        </div>
      </form>
    </div>
  `,
  styles: [`
    .form-container {
      max-width: 1000px;
      margin: 0 auto;
    }
    .form-header {
      background: #416759;
      color: #fff;
      padding: 18px 24px 10px 24px;
      border-radius: 8px 8px 0 0;
      margin-bottom: 0;
    }
    .form-header h2 {
      margin: 0;
      font-weight: 600;
      font-size: 1.3rem;
    }
    .titular-form {
      background: #fff;
      padding: 24px;
      border-radius: 0 0 8px 8px;
      box-shadow: 0 2px 8px rgba(65, 103, 89, 0.08);
    }
    .section-title {
      font-size: 1.1rem;
      font-weight: 600;
      color: #416759;
      margin: 24px 0 16px 0;
      padding-bottom: 8px;
      border-bottom: 2px solid #e8f0ec;
    }
    .section-title:first-of-type {
      margin-top: 0;
    }
    .form-row {
      display: grid;
      grid-template-columns: 1fr 1fr 1fr;
      gap: 16px;
      margin-bottom: 16px;
    }
    .form-row mat-form-field {
      width: 100%;
    }
    .empty-field {
      /* Campo vacío para mantener la estructura de 3 columnas */
    }
    .form-actions {
      display: flex;
      gap: 12px;
      justify-content: flex-end;
      margin-top: 32px;
      padding-top: 20px;
      border-top: 1px solid #e0e0e0;
    }
    .form-actions button {
      min-width: 120px;
      height: 40px;
      cursor: pointer !important;
      pointer-events: auto !important;
    }
    .cancel-btn {
      color: #666;
    }
    mat-error {
      font-size: 0.85rem;
    }
    
    /* Responsive para pantallas más pequeñas */
    @media (max-width: 768px) {
      .form-row {
        grid-template-columns: 1fr;
      }
      .form-container {
        max-width: 100%;
        margin: 0 16px;
      }
    }
    
    @media (max-width: 1024px) and (min-width: 769px) {
      .form-row {
        grid-template-columns: 1fr 1fr;
      }
    }
  `]
})
export class TitularCreateFormComponent {
  form: FormGroup;
  loading = false;

  constructor(
    private fb: FormBuilder, 
    private titularService: TitularMineroService,
    private router: Router
  ) {
    this.form = this.fb.group({
      Nombre: ['', Validators.required],
      TipoPersona: ['', Validators.required],
      DniCuit: ['', Validators.required],
      Domicilio: ['', Validators.required],
      Telefono: ['', Validators.required],
      Email: ['', [Validators.required, Validators.email]],
      FechaAsignacion: ['', Validators.required],
      Estado: ['Activo', Validators.required],
      RepresentanteLegal: ['', Validators.required],
      Observaciones: [''],
      Descripcion: ['']
    });
  }

  onSubmit() {
    console.log('onSubmit llamado');
    console.log('Form valid:', this.form.valid);
    console.log('Form value:', this.form.value);
    console.log('Form errors:', this.form.errors);
    
    if (this.form.valid) {
      console.log('Formulario válido, iniciando creación...');
      this.loading = true;
      const titularData: TitularMineroCreate = this.form.value;
      
      this.titularService.create(titularData).subscribe({
        next: (response: TitularMinero) => {
          console.log('Titular creado exitosamente:', response);
          alert('Titular minero creado exitosamente');
          this.loading = false;
          this.router.navigate(['/titulares']); // Navegar a la lista
        },
        error: (error: any) => {
          console.error('Error al crear titular:', error);
          alert('Error al crear el titular minero');
          this.loading = false;
        }
      });
    } else {
      console.log('Formulario inválido');
      this.form.markAllAsTouched();
      
      // Mostrar errores específicos de cada campo
      Object.keys(this.form.controls).forEach(key => {
        const control = this.form.get(key);
        if (control && control.errors) {
          console.log(`Error en ${key}:`, control.errors);
        }
      });
    }
  }

  onCancel() {
    this.router.navigate(['/titulares']);
  }

  testClick() {
    console.log('Test click funcionando!');
    alert('El botón responde!');
  }
}
