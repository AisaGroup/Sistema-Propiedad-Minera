import { Component, EventEmitter, Input, Output } from '@angular/core';
import { AlertaService } from '../services/alerta.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { EstadoAlertaService } from '../services/estado-alerta.service';
import type { EstadoAlerta } from '../models/estado-alerta.model';
import { MatSelectModule } from '@angular/material/select';
import { AlertaCreate } from '../models/alerta.model';
import { ReactiveFormsModule } from '@angular/forms';
import { TipoAlertaService } from '../services/tipo-alerta.service';
import { PeriodicidadAlertaService } from '../../periodicidad-alerta/services/periodicidad-alerta.service';
import type { PeriodicidadAlerta } from '../../periodicidad-alerta/models/periodicidad-alerta.model';
import { DateFormatDirective } from '../../../shared/directives/date-format.directive';
import { SharedDatepickerModule } from '../../../shared/shared-datepicker.module';

@Component({
  selector: 'app-alerta-edit',
  standalone: true,
  imports: [
    CommonModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule,
    ReactiveFormsModule,
    DateFormatDirective,
    SharedDatepickerModule
  ],
  templateUrl: './alerta-edit.component.html',
  styleUrls: ['./alerta-edit.component.css']
})
export class AlertaEditComponent {
  @Input() idTransaccion: number | null = null;
  @Input() alerta: any = null;
  @Output() update = new EventEmitter<any>();
  @Output() cancelar = new EventEmitter<void>();
  form: FormGroup;
  tiposAlerta: any[] = [];
  estadosAlerta: EstadoAlerta[] = [];
  periodicidades: PeriodicidadAlerta[] = [];

  constructor(
    private fb: FormBuilder,
    private alertaService: AlertaService,
    private tipoAlertaService: TipoAlertaService,
    private estadoAlertaService: EstadoAlertaService,
    private periodicidadAlertaService: PeriodicidadAlertaService
  ) {
    this.form = this.fb.group({
      IdTipoAlerta: [null, Validators.required],
      Asunto: ['', Validators.required],
      Mensaje: ['', Validators.required],
      IdEstado: [null, Validators.required],
      Estado: [''],
      Medio: [''],
      IdPeriodicidad: [null, Validators.required],
      FechaInicio: [null],
      FechaFin: [null],
      Destinatarios: [''],
      Obs: ['']
    });
  }

  ngOnInit() {
    this.estadoAlertaService.getEstadosAlerta().subscribe(estados => this.estadosAlerta = estados);
    this.tipoAlertaService.getTiposAlerta().subscribe(tipos => this.tiposAlerta = tipos);
    this.periodicidadAlertaService.getPeriodicidades().subscribe(periodicidades => this.periodicidades = periodicidades);
    if (this.alerta) {
      this.form.patchValue(this.alerta);
    }
  }

  onSubmit() {
    console.log('=== ALERTA EDIT onSubmit ===');
    console.log('Form valid:', this.form.valid);
    console.log('Form value:', this.form.value);
    console.log('Form errors:', this.form.errors);
    console.log('Alerta data:', this.alerta);
    
    // Verificar errores en cada campo
    Object.keys(this.form.controls).forEach(key => {
      const control = this.form.get(key);
      if (control && control.errors) {
        console.log(`ERROR en campo ${key}:`, control.errors);
      }
    });
    
    if (this.form.valid) {
      console.log('Emitiendo evento update con:', this.form.value);
      this.update.emit(this.form.value);
    } else {
      console.log('Formulario de edición de alerta inválido - deteniendo');
      this.form.markAllAsTouched();
    }
  }

  onCancel() {
    this.cancelar.emit();
  }
}
