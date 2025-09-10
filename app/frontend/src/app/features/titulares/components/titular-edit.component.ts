import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { TitularMineroService, TitularMinero, TitularMineroCreate } from '../services/titular.service';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { Router, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-titular-edit-form',
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
        <h2>Editar Titular Minero</h2>
      </div>
      <form [formGroup]="form" (ngSubmit)="onSubmit()" class="titular-form" *ngIf="!loading">
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

          <!-- Información de Contacto -->
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

        <div class="form-row">
          <mat-form-field appearance="outline">
            <mat-label>Domicilio *</mat-label>
            <input matInput formControlName="Domicilio" required />
            <mat-error *ngIf="form.get('Domicilio')?.hasError('required')">
              El domicilio es requerido
            </mat-error>
          </mat-form-field>

          <!-- Información de Asignación -->
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
              <mat-option value="Pendiente">Pendiente</mat-option>
            </mat-select>
            <mat-error *ngIf="form.get('Estado')?.hasError('required')">
              El estado es requerido
            </mat-error>
          </mat-form-field>
        </div>

        <!-- Información Adicional -->
        <div class="section-title">Información Adicional</div>
        <div class="form-row full-width">
          <mat-form-field appearance="outline">
            <mat-label>Descripción</mat-label>
            <textarea matInput formControlName="Descripcion" rows="2"></textarea>
          </mat-form-field>
        </div>

        <div class="form-row full-width">
          <mat-form-field appearance="outline">
            <mat-label>Observaciones</mat-label>
            <textarea matInput formControlName="Observaciones" rows="3"></textarea>
          </mat-form-field>
        </div>

        <div class="form-actions">
          <button mat-button type="button" (click)="onCancel()" class="cancel-btn">
            Cancelar
          </button>
          <button mat-raised-button color="primary" type="button" (click)="onSubmit()">
            {{ saving ? 'Guardando...' : 'Actualizar Titular' }}
          </button>
        </div>
      </form>
      
      <div *ngIf="loading" class="loading-container">
        <p>Cargando datos del titular...</p>
      </div>
    </div>
  `,
  styles: [`
    .form-container {
      max-width: 1200px;
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
    .loading-container {
      background: #fff;
      padding: 24px;
      border-radius: 0 0 8px 8px;
      box-shadow: 0 2px 8px rgba(65, 103, 89, 0.08);
      text-align: center;
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
export class TitularEditFormComponent implements OnInit {
  form: FormGroup;
  loading = true;
  saving = false;
  titularId: number | null = null;

  constructor(
    private fb: FormBuilder, 
    private titularService: TitularMineroService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.form = this.fb.group({
      Nombre: ['', Validators.required],
      TipoPersona: ['', Validators.required],
      DniCuit: ['', Validators.required],
      Domicilio: ['', Validators.required],
      Telefono: ['', Validators.required],
      Email: ['', [Validators.required, Validators.email]],
      FechaAsignacion: ['', Validators.required],
      Estado: ['', Validators.required],
      RepresentanteLegal: ['', Validators.required],
      Observaciones: [''],
      Descripcion: ['']
    });
  }

  ngOnInit() {
    this.route.params.subscribe(params => {
      this.titularId = +params['id'];
      if (this.titularId) {
        this.loadTitular(this.titularId);
      }
    });
  }

  loadTitular(id: number) {
    this.loading = true;
    this.titularService.getById(id).subscribe({
      next: (titular: TitularMinero) => {
        // Convertir la fecha para el datepicker
        const fechaAsignacion = new Date(titular.FechaAsignacion);
        
        this.form.patchValue({
          Nombre: titular.Nombre,
          TipoPersona: titular.TipoPersona,
          DniCuit: titular.DniCuit,
          Domicilio: titular.Domicilio,
          Telefono: titular.Telefono,
          Email: titular.Email,
          FechaAsignacion: fechaAsignacion,
          Estado: titular.Estado,
          RepresentanteLegal: titular.RepresentanteLegal,
          Observaciones: titular.Observaciones,
          Descripcion: titular.Descripcion
        });
        this.loading = false;
      },
      error: (error: any) => {
        console.error('Error al cargar titular:', error);
        alert('Error al cargar los datos del titular');
        this.router.navigate(['/titulares']);
      }
    });
  }

  onSubmit() {
    console.log('onSubmit llamado - EDICIÓN');
    console.log('Form valid:', this.form.valid);
    console.log('Form value:', this.form.value);
    console.log('titularId:', this.titularId);
    
    if (this.form.valid && this.titularId) {
      console.log('Formulario válido, iniciando actualización...');
      this.saving = true;
      const titularData: Partial<TitularMineroCreate> = this.form.value;
      
      this.titularService.update(this.titularId, titularData).subscribe({
        next: (response: TitularMinero) => {
          console.log('Titular actualizado exitosamente:', response);
          alert('Titular minero actualizado exitosamente');
          this.saving = false;
          this.router.navigate(['/titulares']);
        },
        error: (error: any) => {
          console.error('Error al actualizar titular:', error);
          alert('Error al actualizar el titular minero');
          this.saving = false;
        }
      });
    } else {
      console.log('Formulario inválido o titularId faltante');
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
}
