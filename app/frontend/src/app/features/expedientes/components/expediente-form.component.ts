import { Component, EventEmitter, Output, OnInit, Input, SimpleChanges, OnChanges, ViewEncapsulation } from '@angular/core';
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
import { MatIconModule } from '@angular/material/icon';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { SharedDatepickerModule } from '../../../shared/shared-datepicker.module';
import { DateFormatDirective } from '../../../shared/directives/date-format.directive';
import { ExpedienteCreate } from '../models/expediente.model';
import { TipoExpedienteService, TipoExpediente } from '../services/tipo-expediente.service';

@Component({
  selector: 'app-expediente-form',
  standalone: true,
  encapsulation: ViewEncapsulation.None,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, MatFormFieldModule, MatInputModule, MatButtonModule, MatSelectModule, MatCardModule, MatIconModule, SharedDatepickerModule, MatAutocompleteModule, DateFormatDirective],
  template: `
    <mat-card class="expediente-form-card">
      <mat-card-title class="form-title">{{ modo === 'editar' ? 'Editar Expediente' : 'Datos del Expediente' }}</mat-card-title>
      <form [formGroup]="form" (ngSubmit)="onSubmit()" class="expediente-form-grid" autocomplete="off" novalidate>
        <!-- Fila 1: Código, Año, Estado -->
        <mat-form-field appearance="fill">
          <mat-label>Código de Expediente *</mat-label>
          <input matInput formControlName="CodigoExpediente" maxlength="50">
          <mat-error *ngIf="form.get('CodigoExpediente')?.hasError('required')">
            Código de Expediente es requerido
          </mat-error>
        </mat-form-field>
        <mat-form-field appearance="fill">
          <mat-label>Año *</mat-label>
          <input matInput formControlName="Ano" type="number" min="1800" max="2100">
          <mat-error *ngIf="form.get('Ano')?.hasError('required')">
            Año es requerido
          </mat-error>
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
          <mat-label>Desde</mat-label>
          <input matInput [matDatepicker]="pickerInicio" formControlName="FechaInicio" appDateFormat>
          <mat-datepicker-toggle matSuffix [for]="pickerInicio"></mat-datepicker-toggle>
          <mat-datepicker #pickerInicio></mat-datepicker>
        </mat-form-field>
        <mat-form-field appearance="fill">
          <mat-label>Hasta</mat-label>
          <input matInput [matDatepicker]="pickerFin" formControlName="FechaFin" appDateFormat>
          <mat-datepicker-toggle matSuffix [for]="pickerFin"></mat-datepicker-toggle>
          <mat-datepicker #pickerFin></mat-datepicker>
        </mat-form-field>
        <mat-form-field appearance="fill">
          <mat-label>Propiedad Minera *</mat-label>
          <input matInput type="text" [formControl]="propiedadMineraControl" [matAutocomplete]="auto" [ngStyle]="{background:'#fff'}" placeholder="Busque y seleccione una propiedad">
          <mat-autocomplete #auto="matAutocomplete" (optionSelected)="onPropiedadMineraSelected($event)">
            <mat-option *ngFor="let propiedad of propiedadesMineraFiltradas$ | async" [value]="propiedad.Nombre">
              {{propiedad.Nombre}}
            </mat-option>
          </mat-autocomplete>
          <mat-error *ngIf="propiedadMineraControl.hasError('required')">
            Debe buscar y seleccionar una Propiedad Minera
          </mat-error>
          <mat-error *ngIf="propiedadMineraControl.hasError('invalid')">
            Seleccione una Propiedad Minera válida de la lista
          </mat-error>
        </mat-form-field>
        <!-- Fila 4: ID Tipo de Expediente -->
          <mat-form-field appearance="fill">
            <mat-label>Tipo de Expediente *</mat-label>
            <mat-select formControlName="IdTipoExpediente">
              <mat-option *ngFor="let tipo of tiposExpedienteLista" [value]="tipo.IdTipoExpediente">
                {{ tipo.Nombre }}
              </mat-option>
            </mat-select>
            <mat-error *ngIf="form.get('IdTipoExpediente')?.hasError('required')">
              Tipo de Expediente es requerido
            </mat-error>
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
        <div class="error-message full-width" *ngIf="errorMessage">
          <mat-icon>error</mat-icon>
          <span>{{ errorMessage }}</span>
        </div>
        <div class="form-actions full-width">
          <button mat-raised-button color="primary" type="submit">
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
      background: #fff !important;
      border-radius: 6px;
    }
    mat-form-field.mat-focused {
      background: #fff !important;
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
    
    /* FONDO SÓLIDO BLANCO PARA FORM FIELDS Y SELECTS */
    ::ng-deep .mat-form-field {
      background: #fff !important;
      border-radius: 6px !important;
    }
    ::ng-deep .mat-form-field-flex {
      background: #fff !important;
      border-radius: 6px !important;
    }
    ::ng-deep .mat-form-field-infix {
      background: #fff !important;
      border-radius: 6px !important;
    }
    ::ng-deep .mat-form-field-wrapper {
      background: #fff !important;
      border-radius: 6px !important;
    }
    
    /* FONDO ESPECÍFICO PARA SELECTS */
    ::ng-deep .mat-select-trigger {
      background: #fff !important;
      border-radius: 6px !important;
      color: #111 !important;
    }
    ::ng-deep .mat-select-value {
      background: #fff !important;
      color: #111 !important;
    }
    ::ng-deep .mat-select-value-text {
      background: #fff !important;
      color: #111 !important;
    }
    ::ng-deep .mat-select {
      background: #fff !important;
      border-radius: 6px !important;
    }
    
    /* FONDO PARA INPUTS ESPECÍFICAMENTE */
    ::ng-deep .mat-input-element {
      background: #fff !important;
      color: #111 !important;
    }
    
    /* PANEL DESPLEGABLE DE SELECTS */
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
    
    /* Estilos para mensaje de error de Propiedad Minera */
    .error-text-red {
      color: #f44336 !important;
      font-size: 0.85rem !important;
      font-weight: 500 !important;
      margin-top: 0.3rem !important;
      background: transparent !important;
    }
    
    ::ng-deep .mat-error {
      color: #f44336 !important;
      font-size: 0.85rem !important;
      font-weight: 500 !important;
      margin-top: 0.3rem !important;
    }
    
    ::ng-deep .error-text-red {
      color: #f44336 !important;
      font-size: 0.85rem !important;
      font-weight: 500 !important;
      margin-top: 0.3rem !important;
      display: block !important;
    }
    
    ::ng-deep mat-form-field.mat-form-field-invalid .mat-form-field-outline {
      border-color: #f44336 !important;
    }
    
    ::ng-deep mat-form-field.mat-form-field-invalid .mat-form-field-label {
      color: #f44336 !important;
    }
    
    /* Estilos específicos para datepickers */
    ::ng-deep .mat-mdc-form-field input[matInput] {
      background: #fff !important;
    }
    
    ::ng-deep .mat-datepicker-input {
      background: #fff !important;
    }
    
    ::ng-deep .mdc-text-field--filled .mdc-text-field__input {
      background: #fff !important;
    }
    
    /* Estilos para mensaje de error general */
    .error-message {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      background-color: #ffebee;
      border: 1px solid #f44336;
      border-radius: 6px;
      padding: 1rem;
      margin-top: 0.5rem;
      color: #c62828;
      font-weight: 500;
    }
    
    .error-message mat-icon {
      color: #f44336;
    }
  `]
})


export class ExpedienteFormComponent implements OnInit, OnChanges {
  onPropiedadMineraSelected(event: any) {
    const nombre = event?.option?.value;
    if (!nombre) return;
    this.propiedadMineraService.getPropiedades({ Nombre: nombre }).subscribe(res => {
      const propiedad = res.data.find((p: PropiedadMinera) => p.Nombre === nombre);
      this.selectedPropiedadMinera = propiedad ? propiedad : null;
      if (propiedad) {
        this.form.patchValue({ IdPropiedadMinera: propiedad.IdPropiedadMinera });
        // Limpiar errores cuando se selecciona una propiedad válida
        this.propiedadMineraControl.setErrors(null);
        this.errorMessage = '';
      } else {
        this.form.patchValue({ IdPropiedadMinera: null });
        this.propiedadMineraControl.setErrors({ 'invalid': true });
      }
    });
  }
  propiedadMineraControl: FormControl = new FormControl('', [Validators.required]);
  errorMessage: string = '';
  propiedadesMineraFiltradas$: Observable<PropiedadMinera[]> = of([]);
  selectedPropiedadMinera: PropiedadMinera | null = null;
  @Output() create = new EventEmitter<ExpedienteCreate>();
  @Output() edit = new EventEmitter<any>();
  @Input() form!: FormGroup;
  @Input() expediente: any = null;
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
        CodigoExpediente: ['', [Validators.required, Validators.maxLength(50)]],
        PrimerDueno: ['', [Validators.maxLength(50)]],
        Ano: [null, [Validators.required]],
        FechaInicio: [null],
        FechaFin: [null],
        Estado: ['', [Validators.maxLength(50)]],
        Dependencia: ['', [Validators.maxLength(100)]],
        Caratula: ['', [Validators.maxLength(200)]],
        Descripcion: ['', [Validators.maxLength(50)]],
        Observaciones: ['', [Validators.maxLength(500)]],
        IdPropiedadMinera: [null, [Validators.required, Validators.min(1)]],
        IdTipoExpediente: [null, [Validators.required, Validators.min(1)]],
      });
    }
  }

  ngOnInit(): void {
    // Filtro reactivo para propiedad minera
    this.propiedadesMineraFiltradas$ = this.propiedadMineraControl.valueChanges.pipe(
      startWith(''),
      debounceTime(300),
      switchMap((value: string) => {
        if (!value || value.length < 1) {
          return of([]);
        }
        return this.propiedadMineraService.getPropiedades({ Nombre: value }).pipe(
          map(res => res.data)
        );
      })
    );
    this.tipoExpedienteService.getTipos().subscribe((res: any) => {
      this.tiposExpedienteLista = res ?? [];
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['expediente'] && this.modo === 'editar' && this.expediente) {
      const patch = { ...this.expediente };
        // Corrige fechas: si viene string, pásala a Date object
        if (patch.FechaInicio && typeof patch.FechaInicio === 'string') {
          const date = this.parseDate(patch.FechaInicio);
          patch.FechaInicio = date;
        }
        if (patch.FechaFin && typeof patch.FechaFin === 'string') {
          const date = this.parseDate(patch.FechaFin);
          patch.FechaFin = date;
        }
      // Corrige año: si viene string o número, pásalo a número
      if (patch.Ano) {
        patch.Ano = Number(patch.Ano) || '';
      }
      this.form.patchValue(patch);
      
      // Cargar propiedad minera si existe
      if (this.expediente.IdPropiedadMinera) {
        this.loadPropiedadMineraForEdit(this.expediente.IdPropiedadMinera);
      }
      
      // Setea el nombre en el autocomplete si corresponde
      if (this.expediente.PropiedadMineraNombre) {
        this.propiedadMineraControl.setValue(this.expediente.PropiedadMineraNombre);
      }
    }
  }

  private parseDate(dateString: string): Date | null {
    if (!dateString) return null;
    
    // Intenta parsear YYYY-MM-DD del backend
    const isoMatch = dateString.match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (isoMatch) {
      const [, year, month, day] = isoMatch;
      return new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    }
    
    // Intenta parsear DD/MM/YYYY
    const dmyMatch = dateString.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})/);
    if (dmyMatch) {
      const [, day, month, year] = dmyMatch;
      return new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    }
    
    return null;
  }

  private formatDateToISO(date: any): string {
    if (!date) return '';
    
    if (date instanceof Date) {
      const year = date.getFullYear();
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      const day = date.getDate().toString().padStart(2, '0');
      return `${year}-${month}-${day}`;
    }
    
    if (typeof date === 'string') {
      const parsedDate = this.parseDate(date);
      if (parsedDate) {
        return this.formatDateToISO(parsedDate);
      }
    }
    
    return '';
  }

  private loadPropiedadMineraForEdit(idPropiedadMinera: number): void {
    this.propiedadMineraService.getPropiedades({}).subscribe(res => {
      const propiedad = res.data.find((p: PropiedadMinera) => p.IdPropiedadMinera === idPropiedadMinera);
      if (propiedad) {
        this.selectedPropiedadMinera = propiedad;
        this.propiedadMineraControl.setValue(propiedad.Nombre);
        this.form.patchValue({ IdPropiedadMinera: propiedad.IdPropiedadMinera });
      }
    });
  }

  onSubmit(): void {
    console.log('=== EXPEDIENTE onSubmit ===');
    console.log('Form valid:', this.form.valid);
    console.log('Form value:', this.form.value);
    console.log('Propiedad Minera Control valid:', this.propiedadMineraControl.valid);
    console.log('Selected Propiedad Minera:', this.selectedPropiedadMinera);
    
    // Marcar todos los campos como tocados para mostrar errores
    this.form.markAllAsTouched();
    this.propiedadMineraControl.markAsTouched();
    
    // Validar campos requeridos específicos
    const errores: string[] = [];
    
    if (!this.form.get('CodigoExpediente')?.value) {
      errores.push('Código de Expediente');
    }
    if (!this.form.get('Ano')?.value) {
      errores.push('Año');
    }
    if (!this.form.get('IdTipoExpediente')?.value) {
      errores.push('Tipo de Expediente');
    }
    if (!this.selectedPropiedadMinera || !this.propiedadMineraControl.value) {
      errores.push('Propiedad Minera');
      this.propiedadMineraControl.setErrors({ 'required': true });
    }
    
    // Si hay errores, mostrar alerta y detener
    if (errores.length > 0) {
      this.errorMessage = `Por favor complete los siguientes campos requeridos: ${errores.join(', ')}`;
      alert(this.errorMessage);
      console.log('Formulario inválido - campos faltantes:', errores);
      return;
    }
    
    // Validar que el formulario principal sea válido
    if (this.form.invalid) {
      this.errorMessage = 'Por favor corrija los errores en el formulario antes de continuar.';
      alert(this.errorMessage);
      console.log('Formulario inválido - deteniendo');
      return;
    }
    
    // Limpiar mensaje de error si todo está bien
    this.errorMessage = '';

    const value = { ...this.form.value };
    console.log('Valor antes de formatear:', value);
    
    // Formatear fechas a ISO antes de emitir
    if (value.FechaInicio) {
      value.FechaInicio = this.formatDateToISO(value.FechaInicio);
    }
    if (value.FechaFin) {
      value.FechaFin = this.formatDateToISO(value.FechaFin);
    }
    // Asegura que el año sea número
    if (value.Ano) {
      value.Ano = Number(value.Ano) || null;
    }
    // Asignar el ID de la propiedad minera seleccionada (si hay una)
    const selectedPropiedad = this.selectedPropiedadMinera;
    if (selectedPropiedad) {
      value.IdPropiedadMinera = selectedPropiedad.IdPropiedadMinera;
    } else {
      value.IdPropiedadMinera = null;
    }
    
    console.log('Valor final a enviar:', value);
    console.log('Modo:', this.modo);
    
    if (this.modo === 'editar') {
      console.log('Emitiendo edit');
      this.edit.emit(value);
      return;
    }
    console.log('Emitiendo create');
    this.create.emit(value);
    if (this.modo === 'crear') {
      this.form.reset();
      this.propiedadMineraControl.setValue('');
      this.selectedPropiedadMinera = null;
    }
  }
}
