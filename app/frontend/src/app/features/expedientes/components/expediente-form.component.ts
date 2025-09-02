import { Component, EventEmitter, Output, OnInit, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { Observable, of } from 'rxjs';
import { debounceTime, switchMap, startWith, map } from 'rxjs/operators';
import { PropiedadMinera } from '../../propiedades/models/propiedad-minera.model';
import { PropiedadMineraService } from '../../propiedades/services/propiedad-minera.service';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatCardModule } from '@angular/material/card';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { ExpedienteCreate } from '../models/expediente.model';
import { TipoExpedienteService, TipoExpediente } from '../services/tipo-expediente.service';

@Component({
  selector: 'app-expediente-form',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, MatFormFieldModule, MatInputModule, MatButtonModule, MatSelectModule, MatCardModule, MatDatepickerModule, MatNativeDateModule, MatAutocompleteModule],
  template: `
    <mat-card class="expediente-form-card">
      <mat-card-title class="form-title">{{ modo === 'editar' ? 'Editar Expediente' : 'Datos del Expediente' }}</mat-card-title>
      <form [formGroup]="form" (ngSubmit)="onSubmit()" class="expediente-form-grid" autocomplete="off" novalidate>
        <!-- Fila 1: Código, Año, Estado -->
        <mat-form-field appearance="fill">
          <mat-label>Código de Expediente</mat-label>
          <input matInput formControlName="CodigoExpediente" maxlength="50">
        </mat-form-field>
        <mat-form-field appearance="fill">
          <mat-label>Año</mat-label>
          <input matInput formControlName="Ano" type="number" min="1800" max="2100">
        </mat-form-field>
        <mat-form-field appearance="fill">
          <mat-label>Estado</mat-label>
          <input matInput formControlName="Estado" maxlength="50">
        </mat-form-field>
        <!-- Fila 2: Carátula, Primer Dueño, Dependencia -->
        <mat-form-field appearance="fill">
          <mat-label>Carátula</mat-label>
          <input matInput formControlName="Caratula" maxlength="200">
        </mat-form-field>
        <mat-form-field appearance="fill">
          <mat-label>Primer Dueño</mat-label>
          <input matInput formControlName="PrimerDueno" maxlength="50">
        </mat-form-field>
        <mat-form-field appearance="fill">
          <mat-label>Dependencia</mat-label>
          <input matInput formControlName="Dependencia" maxlength="100">
        </mat-form-field>
        <!-- Fila 3: Fechas y Propiedad Minera -->
        <mat-form-field appearance="fill">
          <mat-label>Fecha de Inicio</mat-label>
          <input matInput [matDatepicker]="pickerInicio" formControlName="FechaInicio">
          <mat-datepicker-toggle matSuffix [for]="pickerInicio"></mat-datepicker-toggle>
          <mat-datepicker #pickerInicio></mat-datepicker>
        </mat-form-field>
        <mat-form-field appearance="fill">
          <mat-label>Fecha de Fin</mat-label>
          <input matInput [matDatepicker]="pickerFin" formControlName="FechaFin">
          <mat-datepicker-toggle matSuffix [for]="pickerFin"></mat-datepicker-toggle>
          <mat-datepicker #pickerFin></mat-datepicker>
        </mat-form-field>
        <mat-form-field appearance="fill">
          <mat-label>Propiedad Minera</mat-label>
          <mat-select formControlName="IdPropiedadMinera">
            <mat-option *ngFor="let propiedad of propiedadesMineraLista" [value]="propiedad.IdPropiedadMinera">
              {{propiedad.Nombre}}
            </mat-option>
          </mat-select>
        </mat-form-field>
        <!-- Fila 4: ID Tipo de Expediente -->
          <mat-form-field appearance="fill">
            <mat-label>Tipo de Expediente</mat-label>
            <mat-select formControlName="IdTipoExpediente">
              <mat-option *ngFor="let tipo of tiposExpedienteLista" [value]="tipo.IdTipoExpediente">
                {{ tipo.Nombre }}
              </mat-option>
            </mat-select>
          </mat-form-field>
        <!-- Fila 5 (full width): Descripción -->
        <mat-form-field appearance="fill" class="full-width">
          <mat-label>Descripción</mat-label>
          <input matInput formControlName="Descripcion" maxlength="50">
        </mat-form-field>
        <!-- Fila 6 (full width): Observaciones -->
        <mat-form-field appearance="fill" class="full-width">
          <mat-label>Observaciones</mat-label>
          <textarea matInput formControlName="Observaciones" maxlength="500"></textarea>
        </mat-form-field>
        <div class="form-actions full-width">
          <button mat-raised-button color="primary" type="submit" [disabled]="form.invalid">
            {{ modo === 'editar' ? 'Guardar cambios' : 'Crear Expediente' }}
          </button>
        </div>
      </form>
    </mat-card>
  `,
  styles: [`
    .expediente-form-card {
      max-width: 1100px;
      margin: 2rem auto;
      background: #fff;
      border-radius: 10px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.08);
      padding: 2rem 2.5rem 1.5rem 2.5rem;
    }
    .form-title {
      color: #416759;
      font-size: 1.5rem;
      font-weight: 700;
      margin-bottom: 1.5rem;
      text-align: center;
    }
    .expediente-form-grid {
      display: grid;
      grid-template-columns: 1fr 1fr 1fr;
      gap: 1.2rem 2rem;
    }
    .full-width {
      grid-column: 1 / 4;
    }
    mat-form-field {
      width: 100%;
      /* background: #e8f5e9;  Eliminado fondo verde claro */
      border-radius: 6px;
    }
    mat-form-field.mat-focused {
      /* background: #d0e7db;  Eliminado fondo verde claro al enfocar */
    }
    mat-select, input, textarea {
      color: #111 !important;
    }
    .mat-datepicker-toggle, .mat-select-arrow {
      color: #416759 !important;
      background: #e8f5e9 !important;
      border-radius: 50%;
    }
    /* Estilo sólido para el panel del datepicker y selects */
    /* Forzar fondo blanco en el panel del datepicker y selects, usando ::ng-deep para asegurar prioridad */
    ::ng-deep .mat-calendar-table, 
    ::ng-deep .mat-calendar-body, 
    ::ng-deep .mat-select-panel {
      background: #fff !important;
    }
    ::ng-deep .mat-calendar-arrow, 
    ::ng-deep .mat-calendar-period-button, 
    ::ng-deep .mat-calendar-previous-button, 
    ::ng-deep .mat-calendar-next-button {
      color: #416759 !important;
      background: #fff !important;
      border-radius: 50%;
    }
    ::ng-deep .mat-form-field {
      background: #fff !important;
      border-radius: 6px !important;
    }
    ::ng-deep .mat-form-field-flex {
      background: #fff !important;
      border-radius: 6px !important;
    }
    ::ng-deep .mat-select-trigger {
      background: #fff !important;
      border-radius: 6px !important;
      color: #111 !important;
    }
    ::ng-deep .mat-select-value {
      background: #fff !important;
      color: #111 !important;
    }
    ::ng-deep .mat-select-panel {
      background: #fff !important;
      color: #111 !important;
      box-shadow: 0 2px 8px rgba(0,0,0,0.12) !important;
      border-radius: 8px !important;
    }
    ::ng-deep .mat-option {
      background: #fff !important;
      color: #111 !important;
    }
    ::ng-deep .mat-option.mat-selected {
      background: #d0e7db !important;
      color: #111 !important;
    }
    ::ng-deep .mat-select {
      background: #fff !important;
      border-radius: 6px !important;
    }
    /* Paginador sólido */
    .mat-paginator, .mat-paginator-range-label, .mat-paginator-icon {
      background: #e8f5e9 !important;
      color: #111 !important;
    }
    .form-actions {
      display: flex;
      justify-content: flex-end;
      margin-top: 1.5rem;
    }
    button[mat-raised-button] {
      background: #416759;
      color: #fff;
      font-weight: 600;
      border-radius: 5px;
      padding: 0.6rem 2.2rem;
      font-size: 1rem;
    }
    @media (max-width: 1100px) {
      .expediente-form-card {
        padding: 1rem;
      }
      .expediente-form-grid {
        grid-template-columns: 1fr 1fr;
      }
      .full-width {
        grid-column: 1 / 3;
      }
    }
    @media (max-width: 700px) {
      .expediente-form-grid {
        grid-template-columns: 1fr;
      }
      .full-width {
        grid-column: 1 / 2;
      }
    }
  `]
})
export class ExpedienteFormComponent implements OnInit {
  @Output() create = new EventEmitter<ExpedienteCreate>();
  @Input() form!: FormGroup;
  @Input() modo: 'crear' | 'editar' = 'crear';
  propiedadesMineraLista: PropiedadMinera[] = [];
  tiposExpedienteLista: TipoExpediente[] = [];

  constructor(
    private fb: FormBuilder,
    private propiedadMineraService: PropiedadMineraService,
    private tipoExpedienteService: TipoExpedienteService
  ) {
    // Si el form no viene por input, crear uno nuevo (modo creación)
    if (!this.form) {
      this.form = this.fb.group({
        CodigoExpediente: [''],
        PrimerDueno: [''],
        Ano: [''],
        FechaInicio: [''],
        FechaFin: [''],
        Estado: [''],
        Dependencia: [''],
        Caratula: [''],
        Descripcion: [''],
        Observaciones: [''],
        IdPropiedadMinera: [null],
        IdTipoExpediente: [null],
      });
    }
  }

  ngOnInit(): void {
    this.propiedadMineraService.getPropiedades({}).subscribe((res: any) => {
      this.propiedadesMineraLista = res?.data ?? [];
    });
    this.tipoExpedienteService.getTipos().subscribe((res: any) => {
      this.tiposExpedienteLista = res ?? [];
    });
  }

  onSubmit(): void {
    if (this.form && this.form.valid) {
      this.create.emit(this.form.value);
      if (this.modo === 'crear') {
        this.form.reset();
      }
    }
  }
}
