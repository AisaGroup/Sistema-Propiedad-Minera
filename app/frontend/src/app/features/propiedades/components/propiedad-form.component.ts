import { Component, EventEmitter, Output, OnInit, Input, OnChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatCardModule } from '@angular/material/card';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { SharedDatepickerModule } from '../../../shared/shared-datepicker.module';
import { PropiedadMineraCreate, PropiedadMinera } from '../models/propiedad-minera.model';
import { PropiedadMineraService } from '../services/propiedad-minera.service';
import { TitularMineroService, TitularMinero } from '../../titulares/services/titular.service';

@Component({
  selector: 'app-propiedad-form',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule,
    MatCardModule,
    MatDatepickerModule,
    SharedDatepickerModule
  ],
  template: `
    <mat-card class="propiedad-form-card">
      <h2 class="form-title">{{ modo === 'editar' ? 'Editar' : 'Crear' }} Propiedad Minera</h2>
      <form [formGroup]="form" (ngSubmit)="onSubmit()" class="propiedad-form-grid">
        
        <!-- Fila 1: Nombre, Titular, Transacción -->
        <mat-form-field appearance="fill">
          <mat-label>Nombre de la Propiedad</mat-label>
          <input matInput formControlName="Nombre" placeholder="Ingrese el nombre">
          <mat-error *ngIf="form.get('Nombre')?.hasError('required') && form.get('Nombre')?.touched">
            <span style="color: red;">El nombre es obligatorio</span>
          </mat-error>
        </mat-form-field>

        <mat-form-field appearance="fill">
          <mat-label>Titular Minero</mat-label>
          <mat-select formControlName="IdTitular">
            <mat-option value="">Seleccione un titular</mat-option>
            <mat-option *ngFor="let titular of titulares" [value]="titular.IdTitular">
              {{titular.Nombre}} - {{titular.DniCuit}}
            </mat-option>
          </mat-select>
        </mat-form-field>

        <mat-form-field appearance="fill">
          <mat-label>ID Transacción</mat-label>
          <input matInput formControlName="IdTransaccion" type="number" placeholder="ID de transacción">
        </mat-form-field>

        <!-- Fila 2: Provincia, Labor Legal, Área -->
        <mat-form-field appearance="fill">
          <mat-label>Provincia</mat-label>
          <mat-select formControlName="Provincia">
            <mat-option value="">Seleccione una provincia</mat-option>
            <mat-option *ngFor="let provincia of provincias" [value]="provincia">
              {{provincia}}
            </mat-option>
          </mat-select>
        </mat-form-field>

        <mat-form-field appearance="fill">
          <mat-label>Labor Legal</mat-label>
          <mat-select formControlName="LaborLegal">
            <mat-option value="">Seleccione una labor</mat-option>
            <mat-option *ngFor="let labor of laboresLegales" [value]="labor">
              {{labor}}
            </mat-option>
          </mat-select>
        </mat-form-field>

        <mat-form-field appearance="fill">
          <mat-label>Área (Hectáreas)</mat-label>
          <input matInput formControlName="AreaHectareas" type="number" step="0.01" placeholder="0.00">
        </mat-form-field>

        <!-- Fila 3: Fechas -->
        <mat-form-field appearance="fill">
          <mat-label>Fecha de Solicitud</mat-label>
          <input matInput [matDatepicker]="solicitudPicker" formControlName="Solicitud" 
                 placeholder="dd/mm/yyyy" dateFormat>
          <mat-datepicker-toggle matIconSuffix [for]="solicitudPicker"></mat-datepicker-toggle>
          <mat-datepicker #solicitudPicker></mat-datepicker>
        </mat-form-field>

        <mat-form-field appearance="fill">
          <mat-label>Fecha de Registro</mat-label>
          <input matInput [matDatepicker]="registroPicker" formControlName="Registro" 
                 placeholder="dd/mm/yyyy" dateFormat>
          <mat-datepicker-toggle matIconSuffix [for]="registroPicker"></mat-datepicker-toggle>
          <mat-datepicker #registroPicker></mat-datepicker>
        </mat-form-field>

        <mat-form-field appearance="fill">
          <mat-label>Fecha de Notificación</mat-label>
          <input matInput [matDatepicker]="notificacionPicker" formControlName="Notificacion" 
                 placeholder="dd/mm/yyyy" dateFormat>
          <mat-datepicker-toggle matIconSuffix [for]="notificacionPicker"></mat-datepicker-toggle>
          <mat-datepicker #notificacionPicker></mat-datepicker>
        </mat-form-field>

        <!-- Fila 4: Mensura y Descubrimiento -->
        <mat-form-field appearance="fill">
          <mat-label>Fecha de Mensura</mat-label>
          <input matInput [matDatepicker]="mensuraPicker" formControlName="Mensura" 
                 placeholder="dd/mm/yyyy" dateFormat>
          <mat-datepicker-toggle matIconSuffix [for]="mensuraPicker"></mat-datepicker-toggle>
          <mat-datepicker #mensuraPicker></mat-datepicker>
        </mat-form-field>

        <mat-form-field appearance="fill" class="full-width">
          <mat-label>Descubrimiento Directo</mat-label>
          <textarea matInput formControlName="DescubrimientoDirecto" 
                    placeholder="Describa el descubrimiento directo" rows="3"></textarea>
        </mat-form-field>

        <!-- Botones -->
        <div class="form-actions full-width">
          <button mat-raised-button color="primary" type="submit">
            {{ modo === 'editar' ? 'Guardar Cambios' : 'Crear Propiedad Minera' }}
          </button>
          <button mat-button type="button" (click)="onCancel()" style="margin-left: 1rem;">
            Cancelar
          </button>
        </div>
      </form>
    </mat-card>
  `,
  styles: [`
    .propiedad-form-card {
      max-width: 1200px;
      margin: 2rem auto;
      padding: 2rem 2.5rem 1.5rem 2.5rem;
    }
    .form-title {
      color: #416759;
      font-size: 1.5rem;
      font-weight: 700;
      margin-bottom: 1.5rem;
      text-align: center;
    }
    .propiedad-form-grid {
      display: grid;
      grid-template-columns: 1fr 1fr 1fr;
      gap: 1.2rem 2rem;
    }
    .full-width {
      grid-column: 1 / 4;
    }
    .form-actions {
      display: flex;
      justify-content: center;
      align-items: center;
      margin-top: 1rem;
    }
    mat-form-field {
      width: 100%;
    }
  `]
})
export class PropiedadFormComponent implements OnInit, OnChanges {
  @Input() modo: 'crear' | 'editar' = 'crear';
  @Input() propiedad: PropiedadMinera | null = null;
  @Output() create = new EventEmitter<PropiedadMineraCreate>();
  @Output() update = new EventEmitter<{id: number, data: Partial<PropiedadMineraCreate>}>();
  @Output() cancel = new EventEmitter<void>();

  form: FormGroup;
  titulares: TitularMinero[] = [];
  provincias: string[] = [];
  laboresLegales: string[] = [];

  constructor(
    private fb: FormBuilder,
    private propiedadService: PropiedadMineraService,
    private titularService: TitularMineroService
  ) {
    this.form = this.fb.group({
      IdTransaccion: [null],
      IdTitular: [null],
      Nombre: ['', Validators.required],
      Solicitud: [null],
      Registro: [null],
      Notificacion: [null],
      Provincia: [''],
      Mensura: [null],
      AreaHectareas: [null],
      LaborLegal: [''],
      DescubrimientoDirecto: ['']
    });
  }

  ngOnInit() {
    this.loadTitulares();
    this.loadProvincias();
    this.loadLaboresLegales();
    
    if (this.modo === 'editar' && this.propiedad) {
      this.loadPropiedadData();
    }
  }

  ngOnChanges() {
    if (this.modo === 'editar' && this.propiedad) {
      this.loadPropiedadData();
    } else if (this.modo === 'crear') {
      this.form.reset();
    }
  }

  private loadTitulares() {
    this.titularService.getAll().subscribe({
      next: (titulares) => {
        this.titulares = titulares;
      },
      error: (error) => {
        console.error('Error cargando titulares:', error);
      }
    });
  }

  private loadProvincias() {
    this.provincias = this.propiedadService.getProvincias();
  }

  private loadLaboresLegales() {
    this.laboresLegales = this.propiedadService.getLaboresLegales();
  }

  private loadPropiedadData() {
    if (this.propiedad) {
      this.form.patchValue({
        IdTransaccion: this.propiedad.IdTransaccion,
        IdTitular: this.propiedad.IdTitular,
        Nombre: this.propiedad.Nombre,
        Solicitud: this.propiedad.Solicitud,
        Registro: this.propiedad.Registro,
        Notificacion: this.propiedad.Notificacion,
        Provincia: this.propiedad.Provincia,
        Mensura: this.propiedad.Mensura,
        AreaHectareas: this.propiedad.AreaHectareas,
        LaborLegal: this.propiedad.LaborLegal,
        DescubrimientoDirecto: this.propiedad.DescubrimientoDirecto
      });
    }
  }

  onSubmit() {
    console.log('onSubmit llamado');
    console.log('Formulario válido:', this.form.valid);
    console.log('Valores del formulario:', this.form.value);
    
    if (this.form.valid) {
      const formData = this.form.value;
      
      if (this.modo === 'crear') {
        console.log('Emitiendo evento create con:', formData);
        this.create.emit(formData);
      } else if (this.modo === 'editar' && this.propiedad) {
        console.log('Emitiendo evento update con:', formData);
        this.update.emit({
          id: this.propiedad.IdPropiedadMinera,
          data: formData
        });
      }
    } else {
      // Marcar todos los campos como touched para mostrar errores
      this.form.markAllAsTouched();
      console.log('Formulario inválido:', this.form.errors);
      
      // Mostrar qué campos específicos tienen errores
      Object.keys(this.form.controls).forEach(key => {
        const control = this.form.get(key);
        if (control && control.errors) {
          console.log(`Campo ${key} tiene errores:`, control.errors);
        }
      });
    }
  }

  onCancel() {
    this.cancel.emit();
  }
}
