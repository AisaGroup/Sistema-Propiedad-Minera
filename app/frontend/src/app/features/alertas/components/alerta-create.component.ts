import { Component, EventEmitter, Input, Output } from '@angular/core';
import { AlertaService } from '../services/alerta.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatSelectModule } from '@angular/material/select';
import { AlertaCreate } from '../models/alerta.model';
import { ReactiveFormsModule } from '@angular/forms';
import { MatNativeDateModule } from '@angular/material/core';
import { TipoAlertaService } from '../services/tipo-alerta.service';
import { EstadoAlertaService } from '../services/estado-alerta.service';
import type { EstadoAlerta } from '../models/estado-alerta.model';
import { trigger, transition, style, animate } from '@angular/animations';
import { DateFormatDirective } from '../../../shared/directives/date-format.directive';

@Component({
  selector: 'app-alerta-create',
  standalone: true,
  imports: [CommonModule, MatFormFieldModule, MatInputModule, MatButtonModule, MatDatepickerModule, MatSelectModule, MatNativeDateModule, ReactiveFormsModule, DateFormatDirective],
  template: `
    <form [@fadeInUp] [formGroup]="form" (ngSubmit)="onSubmit()" class="alerta-form">
      <div class="row-fields">
        <mat-form-field appearance="fill" class="third-width">
          <mat-label>Tipo de Alerta</mat-label>
          <mat-select formControlName="IdTipoAlerta" required>
            <mat-option *ngFor="let tipo of tiposAlerta" [value]="tipo.IdTipoAlerta">{{ tipo.Descripcion }}</mat-option>
          </mat-select>
        </mat-form-field>
        <mat-form-field appearance="fill" class="third-width">
          <mat-label>Asunto</mat-label>
          <input matInput formControlName="Asunto" required>
        </mat-form-field>
        <mat-form-field appearance="fill" class="third-width">
          <mat-label>Mensaje</mat-label>
          <textarea matInput formControlName="Mensaje" required></textarea>
        </mat-form-field>
      </div>
      <div class="row-fields">
        <mat-form-field appearance="fill" class="third-width">
          <mat-label>Estado</mat-label>
          <mat-select formControlName="IdEstado" required>
            <mat-option *ngFor="let estado of estadosAlerta" [value]="estado.IdEstado">{{ estado.nombre }}</mat-option>
          </mat-select>
        </mat-form-field>
        <mat-form-field appearance="fill" class="third-width">
          <mat-label>Medio</mat-label>
          <input matInput formControlName="Medio">
        </mat-form-field>
        <mat-form-field appearance="fill" class="third-width">
          <mat-label>Periodicidad</mat-label>
          <input matInput formControlName="Periodicidad">
        </mat-form-field>
      </div>
      <div class="row-fields">
        <mat-form-field appearance="fill" class="third-width">
          <mat-label>Fecha Inicio</mat-label>
          <input matInput [matDatepicker]="pickerInicio" formControlName="FechaInicio" appDateFormat>
          <mat-datepicker-toggle matSuffix [for]="pickerInicio"></mat-datepicker-toggle>
          <mat-datepicker #pickerInicio></mat-datepicker>
        </mat-form-field>
        <mat-form-field appearance="fill" class="third-width">
          <mat-label>Fecha Fin</mat-label>
          <input matInput [matDatepicker]="pickerFin" formControlName="FechaFin" appDateFormat>
          <mat-datepicker-toggle matSuffix [for]="pickerFin"></mat-datepicker-toggle>
          <mat-datepicker #pickerFin></mat-datepicker>
        </mat-form-field>
        <mat-form-field appearance="fill" class="third-width">
          <mat-label>Observaciones</mat-label>
          <textarea matInput formControlName="Obs"></textarea>
        </mat-form-field>
      </div>
      <div class="button-row">
        <button mat-raised-button color="primary" type="submit">
          {{ editando ? 'Guardar Cambios' : 'Crear Alerta' }}
        </button>
      </div>
    </form>
  `,
  styles: [`
    .alerta-form { display: flex; flex-direction: column; gap: 1.5rem; max-width: 900px; margin: 0 auto; position: relative; }
    .row-fields { display: flex; gap: 1rem; }
    .third-width { width: 33%; min-width: 180px; }
    .button-row { display: flex; justify-content: center; margin-top: 2rem; }
    .close-btn { display: block; margin: 1.5rem auto 1.5rem auto; position: static; background: #fff; border-radius: 6px; z-index: 2; }
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
export class AlertaCreateComponent {
  @Input() idTransaccion: number | null = null;
  @Input() alerta: any = null;
  @Input() editando: boolean = false;
  @Output() create = new EventEmitter<any>();
  @Output() cancelar = new EventEmitter<void>();
  form: FormGroup;
  tiposAlerta: any[] = [];
  estadosAlerta: EstadoAlerta[] = [];

  constructor(private fb: FormBuilder, private alertaService: AlertaService, private tipoAlertaService: TipoAlertaService, private estadoAlertaService: EstadoAlertaService) {
    this.form = this.fb.group({
      IdTipoAlerta: [null, Validators.required],
      Asunto: ['', Validators.required],
      Mensaje: ['', Validators.required],
      IdEstado: [null, Validators.required],
      Estado: [''],
      Medio: [''],
      Periodicidad: [''],
      FechaInicio: [null],
      FechaFin: [null],
      Obs: ['']
    });
  }

  ngOnInit() {
    this.tipoAlertaService.getTiposAlerta().subscribe(tipos => this.tiposAlerta = tipos);
    this.estadoAlertaService.getEstadosAlerta().subscribe(estados => this.estadosAlerta = estados);
    if (this.idTransaccion) {
      this.form.addControl('IdTransaccion', this.fb.control(this.idTransaccion));
    }
    if (this.editando && this.alerta) {
      this.form.patchValue({
        Asunto: this.alerta.Asunto,
        Mensaje: this.alerta.Mensaje,
        IdEstado: this.alerta.IdEstado,
        Estado: this.alerta.Estado,
        Medio: this.alerta.Medio,
        Periodicidad: this.alerta.Periodicidad,
        FechaInicio: this.alerta.FechaInicio,
        FechaFin: this.alerta.FechaFin,
        Obs: this.alerta.Obs
      });
    }
  }

  ngOnChanges() {
    if (this.editando && this.alerta) {
      this.form.patchValue({
        Asunto: this.alerta.Asunto,
        Mensaje: this.alerta.Mensaje,
        IdEstado: this.alerta.IdEstado,
        Estado: this.alerta.Estado,
        Medio: this.alerta.Medio,
        Periodicidad: this.alerta.Periodicidad,
        FechaInicio: this.alerta.FechaInicio,
        FechaFin: this.alerta.FechaFin,
        Obs: this.alerta.Obs
      });
    } else {
      this.form.reset();
    }
  }

  onSubmit() {
    console.log('=== ALERTA onSubmit ===');
    console.log('Form valid:', this.form.valid);
    console.log('Form value:', this.form.value);
    console.log('Form errors:', this.form.errors);
    
    if (this.form.invalid) {
      console.log('Formulario de alerta inválido - deteniendo');
      this.form.markAllAsTouched();
      return;
    }
    
    const value: AlertaCreate = {
      ...this.form.value,
      IdTransaccion: this.idTransaccion
    };
    
    console.log('Valor a enviar:', value);
    
    if (this.editando && this.alerta && this.alerta.idAlerta) {
      console.log('Editando alerta ID:', this.alerta.idAlerta);
      this.alertaService.updateAlerta(this.alerta.idAlerta, value).subscribe({
        next: (resp) => {
          console.log('Alerta editada exitosamente:', resp);
          this.create.emit(resp);
          this.form.reset();
        },
        error: (err) => {
          console.error('[AlertaCreate] Error al editar alerta:', err);
        }
      });
    } else {
      console.log('Creando nueva alerta');
      this.alertaService.createAlerta(value).subscribe({
        next: (resp) => {
          console.log('Alerta creada exitosamente:', resp);
          this.create.emit(resp);
          this.form.reset();
        },
        error: (err) => {
          console.error('[AlertaCreate] Error al crear alerta:', err);
        }
      });
    }
  }
}
