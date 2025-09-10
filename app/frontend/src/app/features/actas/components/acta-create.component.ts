import { Component, EventEmitter, Output, Input } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { ReactiveFormsModule } from '@angular/forms';
import { Acta } from '../services/acta.service';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { Location } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { Router } from '@angular/router';
import { trigger, transition, style, animate } from '@angular/animations';
import { AutoridadService, Autoridad } from '../../autoridades/services/autoridad.service';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { DateFormatDirective } from '../../../shared/directives/date-format.directive';

@Component({
  selector: 'app-acta-create',
  standalone: true,
  imports: [CommonModule, MatFormFieldModule, MatInputModule, MatButtonModule, ReactiveFormsModule, MatAutocompleteModule, MatDatepickerModule, MatNativeDateModule, DateFormatDirective],
  template: `
    <form [formGroup]="form" (ngSubmit)="onSubmit()" class="acta-form">
      <mat-form-field appearance="fill" class="full-width">
        <mat-label>Descripción*</mat-label>
        <input matInput formControlName="Descripcion" required>
      </mat-form-field>
      <mat-form-field appearance="fill" class="full-width">
        <mat-label>Observaciones</mat-label>
        <textarea matInput formControlName="Obs"></textarea>
      </mat-form-field>
      <div class="row-fields">
        <mat-form-field appearance="fill" class="half-width">
          <mat-label>Fecha*</mat-label>
          <input matInput [matDatepicker]="picker" formControlName="Fecha" required appDateFormat>
          <mat-datepicker-toggle matSuffix [for]="picker"></mat-datepicker-toggle>
          <mat-datepicker #picker></mat-datepicker>
        </mat-form-field>
        <mat-form-field appearance="fill" class="half-width">
          <mat-label>Tipo de Acta*</mat-label>
          <input matInput formControlName="IdTipoActa" required>
        </mat-form-field>
      </div>
      <div class="row-fields">
        <mat-form-field appearance="fill" class="half-width" style="background: #ffffffff;">
          <mat-label>Autoridad*</mat-label>
          <input type="text" matInput [matAutocomplete]="auto" [matAutocompletePosition]="'below'" formControlName="IdAutoridad" (input)="filtrarAutoridades()">
          <mat-autocomplete #auto="matAutocomplete" [displayWith]="displayAutoridad">
            <mat-option *ngFor="let autoridad of autoridadesFiltradas" [value]="autoridad">
              {{ autoridad.Nombre }}
            </mat-option>
          </mat-autocomplete>
        </mat-form-field>
        <mat-form-field appearance="fill" class="half-width">
          <mat-label>Lugar*</mat-label>
          <input matInput formControlName="Lugar" required>
        </mat-form-field>
      </div>
      <div class="button-row">
        <button mat-raised-button color="primary" type="submit">Crear Acta</button>
      </div>
    </form>
  `,
  styles: [`
    .acta-form { display: flex; flex-direction: column; gap: 1.5rem; max-width: 500px; margin: 0 auto; }
    .full-width { width: 100%; }
    .row-fields { display: flex; gap: 1rem; }
    .half-width { width: 100%; }
    .button-row { display: flex; justify-content: center; margin-top: 2rem; }
  `],
  animations: [
    trigger('fadeInUp', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(30px)' }),
        animate('400ms cubic-bezier(.35,0,.25,1)', style({ opacity: 1, transform: 'none' }))
      ])
    ])
  ]
})
export class ActaCreateComponent {
  form: FormGroup;
  @Input() idExpediente!: number;
  @Output() create = new EventEmitter<Acta>();
  @Output() cancelar = new EventEmitter<void>();

  autoridades: Autoridad[] = [];
  autoridadesFiltradas: Autoridad[] = [];

  constructor(
    private fb: FormBuilder,
    private location: Location,
    private router: Router,
    private autoridadService: AutoridadService
  ) {
    this.form = this.fb.group({
      Descripcion: ['', Validators.required],
      Obs: [''],
      Fecha: [null, Validators.required],
      IdTipoActa: ['', Validators.required],
      Lugar: ['', Validators.required],
      IdAutoridad: ['', Validators.required]
    });
  }

  ngOnInit() {
    this.autoridadService.getAll().subscribe((autoridades) => {
      this.autoridades = autoridades;
      this.autoridadesFiltradas = autoridades;
    });
  }

  formatDateToISO(date: Date): string {
    return date.toISOString().split('T')[0];
  }

  displayAutoridad(autoridad: Autoridad): string {
    return autoridad ? autoridad.Nombre : '';
  }

  onSubmit() {
    console.log('=== ACTA onSubmit ===');
    console.log('Form valid:', this.form.valid);
    console.log('Form value:', this.form.value);
    console.log('Form errors:', this.form.errors);
    console.log('IdExpediente:', this.idExpediente);
    
    // Verificar errores en cada campo
    Object.keys(this.form.controls).forEach(key => {
      const control = this.form.get(key);
      if (control && control.errors) {
        console.log(`ERROR en campo ${key}:`, control.errors);
      }
    });
    
    if (!this.idExpediente) {
      console.log('No hay IdExpediente - deteniendo');
      return;
    }
    
    if (this.form.invalid) {
      console.log('Formulario inválido - deteniendo');
      this.form.markAllAsTouched();
      return;
    }
    
    const value: Acta = {
      IdExpediente: this.idExpediente,
      ...this.form.value,
      IdAutoridad: this.form.value.IdAutoridad && typeof this.form.value.IdAutoridad === 'object' 
        ? this.form.value.IdAutoridad.IdAutoridad 
        : this.form.value.IdAutoridad,
      IdTipoActa: this.form.value.IdTipoActa ? String(this.form.value.IdTipoActa) : null,
      Fecha: this.form.value.Fecha ? this.formatDateToISO(this.form.value.Fecha) : null
    };
    
    console.log('Datos finales a enviar:', value);
    console.log('Tipo de IdExpediente:', typeof value.IdExpediente, value.IdExpediente);
    console.log('Tipo de Fecha:', typeof value.Fecha, value.Fecha);
    console.log('Tipo de IdAutoridad:', typeof value.IdAutoridad, value.IdAutoridad);
    console.log('Tipo de IdTipoActa:', typeof value.IdTipoActa, value.IdTipoActa);
    
    this.create.emit(value);
    this.form.reset();
  }

  volver() {
    this.cancelar.emit();
  }

  filtrarAutoridades() {
    const valor = this.form.get('IdAutoridad')?.value;
    if (typeof valor === 'string' && valor.length > 0) {
      this.autoridadesFiltradas = this.autoridades.filter(a => 
        a.Nombre.toLowerCase().includes(valor.toLowerCase())
      );
    } else {
      this.autoridadesFiltradas = this.autoridades;
    }
  }
}
