import { Component, EventEmitter, Input, Output, OnInit, OnChanges } from '@angular/core';
import { Location } from '@angular/common';
import { AlertaService } from '../services/alerta.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { AlertaCreate } from '../models/alerta.model';
import { ReactiveFormsModule } from '@angular/forms';
import { TipoAlertaService } from '../services/tipo-alerta.service';
import { EstadoAlertaService } from '../services/estado-alerta.service';
import { PeriodicidadAlertaService } from '../../periodicidad-alerta/services/periodicidad-alerta.service';
import type { EstadoAlerta } from '../models/estado-alerta.model';
import type { PeriodicidadAlerta } from '../../periodicidad-alerta/models/periodicidad-alerta.model';
import { trigger, transition, style, animate } from '@angular/animations';
import { DateFormatDirective } from '../../../shared/directives/date-format.directive';
import { SharedDatepickerModule } from '../../../shared/shared-datepicker.module';
import { TransaccionService, TransaccionInfo } from '../../transacciones/services/transaccion.service';

@Component({
  selector: 'app-alerta-create',
  standalone: true,
  imports: [CommonModule, MatFormFieldModule, MatInputModule, MatButtonModule, MatSelectModule, ReactiveFormsModule, DateFormatDirective, SharedDatepickerModule],
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
          <input matInput formControlName="Asunto" required maxlength="50">
        </mat-form-field>
        <mat-form-field appearance="fill" class="third-width">
          <mat-label>Mensaje</mat-label>
          <textarea matInput formControlName="Mensaje" required maxlength="5000"></textarea>
        </mat-form-field>
      </div>
      <div class="row-fields">
        <mat-form-field appearance="fill" class="third-width">
          <mat-label>Medio</mat-label>
          <mat-select formControlName="Medio">
            <mat-option *ngFor="let opcion of opcionesMedio" [value]="opcion.value" [disabled]="opcion.disabled">
              {{ opcion.label }}
            </mat-option>
          </mat-select>
        </mat-form-field>
        <mat-form-field appearance="fill" class="third-width">
          <mat-label>Periodicidad</mat-label>
          <mat-select formControlName="IdPeriodicidad" required>
            <mat-option *ngFor="let periodicidad of periodicidades" [value]="periodicidad.IdPeriodicidad">
              {{ periodicidad.Nombre }}
            </mat-option>
          </mat-select>
        </mat-form-field>
        <mat-form-field appearance="fill" class="third-width" *ngIf="mostrarDiasPersonalizados()">
          <mat-label>Días Personalizados</mat-label>
          <input matInput formControlName="DiasPers" type="number" placeholder="Número de días">
        </mat-form-field>
      </div>
      <div class="row-fields">
        <mat-form-field appearance="fill" class="full-width">
          <mat-label>{{ getLabelDestinatarios() }}</mat-label>
          <textarea 
            matInput 
            formControlName="Destinatarios" 
            rows="3" 
            maxlength="5000" 
            required
            [placeholder]="getPlaceholderDestinatarios()">
          </textarea>
          <mat-hint *ngIf="form.get('Destinatarios')?.valid && form.get('Medio')?.value === 'Whatsapp'">
            Ingrese un único número con código de país
          </mat-hint>
          <mat-hint *ngIf="form.get('Destinatarios')?.valid && form.get('Medio')?.value === 'Email'">
            Puede ingresar múltiples emails separados por comas
          </mat-hint>
          <mat-error *ngIf="form.get('Destinatarios')?.invalid">
            {{ getErrorDestinatarios() }}
          </mat-error>
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
          <textarea matInput formControlName="Obs" maxlength="5000"></textarea>
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
    .half-width { width: 48%; min-width: 200px; }
    .full-width { width: 100%; }
    .button-row { display: flex; justify-content: center; margin-top: 2rem; }
    .close-btn { display: block; margin: 1.5rem auto 1.5rem auto; position: static; background: #fff; border-radius: 6px; z-index: 2; }
    
    /* Estilos para errores visibles */
    mat-error {
      display: block !important;
      color: #f44336 !important;
      font-size: 0.75rem !important;
      margin-top: 4px !important;
    }
    
    mat-hint {
      color: #666 !important;
      font-size: 0.75rem !important;
    }
    
    /* Resaltar campo con error */
    .mat-mdc-form-field.mat-form-field-invalid .mat-mdc-text-field-wrapper {
      border-color: #f44336 !important;
    }
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
export class AlertaCreateComponent implements OnInit, OnChanges {
  @Input() idTransaccion: number | null = null;
  @Input() alerta: any = null;
  @Input() editando: boolean = false;
  @Input() tipoPadre: string = 'acta'; // tipo de entidad padre
  @Input() idPadre: number | null = null; // ID de la entidad padre
  @Output() create = new EventEmitter<any>();
  @Output() cancelar = new EventEmitter<void>();
  form: FormGroup;
  tiposAlerta: any[] = [];
  estadosAlerta: EstadoAlerta[] = [];
  periodicidades: PeriodicidadAlerta[] = [];
  transaccionInfo: TransaccionInfo[] = [];
  
  // Opciones para el menú desplegable de Medio
  opcionesMedio = [
    { value: 'Email', label: 'Email', disabled: false },
    { value: 'Whatsapp', label: 'Whatsapp', disabled: false }
  ];

  constructor(
    private fb: FormBuilder, 
    private alertaService: AlertaService, 
    private tipoAlertaService: TipoAlertaService, 
    private estadoAlertaService: EstadoAlertaService,
    private periodicidadAlertaService: PeriodicidadAlertaService,
    private transaccionService: TransaccionService,
    private location: Location
  ) {
    this.form = this.fb.group({
      IdTipoAlerta: [null, Validators.required],
      Asunto: ['', Validators.required],
      Mensaje: ['', Validators.required],
      IdEstado: [1], // Estado por defecto como 1 (pendiente)
      Estado: [''],
      Medio: ['Email'], // Medio por defecto como 'Email'
      IdPeriodicidad: [null, Validators.required],
      DiasPers: [null], // Campo para días personalizados
      FechaInicio: [null],
      FechaFin: [null],
      Destinatarios: ['', Validators.required],
      Obs: [''],
      AudFecha: [new Date().toISOString()] // Fecha actual automáticamente

    });
  }

  ngOnInit() {
    this.tipoAlertaService.getTiposAlerta().subscribe(tipos => this.tiposAlerta = tipos);
    this.estadoAlertaService.getEstadosAlerta().subscribe(estados => this.estadosAlerta = estados);
    this.periodicidadAlertaService.getPeriodicidades().subscribe(periodicidades => this.periodicidades = periodicidades);
    
    // Aplicar validaciones iniciales según el medio por defecto
     const medioInicial = this.form.get('Medio')?.value || 'Email';
     this.actualizarValidacionesDestinatarios(medioInicial);
    
    // Escuchar cambios en el campo de periodicidad para validaciones dinámicas
    this.form.get('IdPeriodicidad')?.valueChanges.subscribe(value => {
      this.actualizarValidacionesDiasPers(value);
    });
    
    // Cambios en Medio (Email/Whatsapp) para validaciones dinámicas
    this.form.get('Medio')?.valueChanges.subscribe(medio => {
      this.actualizarValidacionesDestinatarios(medio);
    });
    
    if (this.idTransaccion) {
      this.form.addControl('IdTransaccion', this.fb.control(this.idTransaccion));
      // Cargar información de la transacción
      this.cargarInformacionTransaccion();
    }
    if (this.editando && this.alerta) {
      this.form.patchValue({
        Asunto: this.alerta.Asunto,
        Mensaje: this.alerta.Mensaje,
        IdEstado: this.alerta.IdEstado,
        Estado: this.alerta.Estado,
        Medio: this.alerta.Medio,
        IdPeriodicidad: this.alerta.IdPeriodicidad,
        DiasPers: this.alerta.DiasPers,
        FechaInicio: this.alerta.FechaInicio,
        FechaFin: this.alerta.FechaFin,
        Destinatarios: this.alerta.Destinatarios,
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
        IdPeriodicidad: this.alerta.IdPeriodicidad,
        DiasPers: this.alerta.DiasPers,
        FechaInicio: this.alerta.FechaInicio,
        FechaFin: this.alerta.FechaFin,
        Destinatarios: this.alerta.Destinatarios,
        Obs: this.alerta.Obs,
        AudFecha: this.alerta.AudFecha || new Date().toISOString() // Usar fecha existente o actual
      });
    } else {
      // Cuando no se está editando, mantener valores por defecto
      this.form.reset({
        IdTipoAlerta: null,
        Asunto: '',
        Mensaje: '',
        IdEstado: 1, // Estado por defecto "Pendiente"
        Estado: '',
        Medio: 'Email', // Medio por defecto "Email"
        IdPeriodicidad: null,
        DiasPers: null,
        FechaInicio: null,
        FechaFin: null,
        Destinatarios: '',
        Obs: '',
        AudFecha: new Date().toISOString() // Fecha actual por defecto
      });
    }
  }

  /**
   * Carga la información completa de la transacción para usar en el formateo del asunto
   */
  private async cargarInformacionTransaccion(): Promise<void> {
    if (!this.idTransaccion) return;
    
    try {
      this.transaccionInfo = await this.transaccionService.getInformacionCompletaTransaccion(this.idTransaccion);
      console.log('Información de transacción cargada:', this.transaccionInfo);
    } catch (error) {
      console.error('Error cargando información de transacción:', error);
      this.transaccionInfo = [];
    }
  }

  /**
   * Formatea el asunto de la alerta según el patrón:
   * {Asunto ingresado por el usuario} ({Tabla} {Detalle})
   * Respeta el límite de 50 caracteres de la BD
   */
  private formatearAsunto(asuntoUsuario: string): string {
    if (!this.transaccionInfo || this.transaccionInfo.length === 0) {
      return this.truncarAsunto(asuntoUsuario); // Truncar por seguridad
    }

    const info = this.transaccionInfo[0]; // Tomar la primera (principal)
    const tabla = info.Tabla || '';
    const detalle = info.Detalle || '';
    
    // Formatear con paréntesis: "Asunto (Tabla Detalle)"
    let asuntoCompleto = `${asuntoUsuario} (${tabla} ${detalle})`.trim();
    
    // Truncar si excede el límite de la BD (50 caracteres)
    return this.truncarAsunto(asuntoCompleto);
  }

  /**
   * Trunca el asunto a máximo 50 caracteres (límite de la BD)
   * Si es necesario truncar, agrega "..." al final
   */
  private truncarAsunto(asunto: string): string {
    const LIMITE_CARACTERES = 50;
    
    if (asunto.length <= LIMITE_CARACTERES) {
      return asunto;
    }
    
    // Truncar y agregar puntos suspensivos
    return asunto.substring(0, LIMITE_CARACTERES - 3) + '...';
  }

  /**
   * Genera la URL actual donde se está creando la alerta
   * Usa el servicio nativo Location de Angular
   */
  private generarUrlContexto(): string {
    const baseUrl = window.location.origin;
    const currentPath = this.location.path();
    
    return `${baseUrl}${currentPath}`;
  }

  /**
   * Formatea el mensaje agregando la jerarquía de transacciones y la URL al final
   * Patrón: {Mensaje usuario}\n\nAlerta generada en /{Tabla2}{Detalle2}/{Tabla1}{Detalle1}/{Tabla}{Detalle}\nURL: [link]
   * Si el medio es Whatsapp, formatea como texto plano. Si es Email, formatea como HTML.
   */
  private formatearMensaje(mensajeUsuario: string): string {
    if (!this.transaccionInfo || this.transaccionInfo.length === 0) {
      return mensajeUsuario; // Si no hay info, usar solo el mensaje del usuario
    }

    const info = this.transaccionInfo[0]; // Información principal
    
    // Construir la ruta jerárquica
    const rutaJerarquia = this.construirRutaJerarquia(info);
    
    // Generar la URL actual usando Location service
    const urlContexto = this.generarUrlContexto();
    
    // Obtener el medio seleccionado
    const medio = this.form.get('Medio')?.value;
    
    // Formatear según el medio
    if (medio === 'Whatsapp') {
      // Formato de texto plano para WhatsApp
      return `${mensajeUsuario}.\n\nAlerta generada en ${rutaJerarquia}\n\nLink de alerta: ${urlContexto}`;
    } else {
      // Formato HTML para Email (comportamiento actual)
      return `<strong>${mensajeUsuario}.</strong> <br/> Alerta generada en ${rutaJerarquia}<br/><a href="${urlContexto}" target="_blank">Link de alerta.</a>`;
    }
  }

  /**
   * Construye la ruta jerárquica desde la raíz hasta la transacción actual
   * Ejemplo: /PropiedadMinera Punilla Oeste II/Expediente 109-M-08/Acta Por incumplimiento...
   */
  private construirRutaJerarquia(info: TransaccionInfo): string {
    const segmentos: string[] = [];
    
    // Nivel 2 (raíz) - si existe
    if (info.Tabla2 && info.Detalle2) {
      segmentos.push(`${info.Tabla2} ${info.Detalle2}`);
    }
    
    // Nivel 1 (intermedio) - si existe
    if (info.Tabla1 && info.Detalle1) {
      segmentos.push(`${info.Tabla1} ${info.Detalle1}`);
    }
    
    // Nivel 0 (actual) - siempre existe
    if (info.Tabla && info.Detalle) {
      segmentos.push(`${info.Tabla} ${info.Detalle}`);
    }
    
    // Construir la ruta con separadores "/"
    return segmentos.join(' -> ');
  }

  onSubmit() {
    console.log('=== ALERTA onSubmit ===');
    console.log('Form valid:', this.form.valid);
    console.log('Form value:', this.form.value);
    console.log('Form errors:', this.form.errors);
    
    if (this.form.invalid) {
      console.log('Formulario de alerta inválido - deteniendo');
      console.log('Errores por campo:');
      Object.keys(this.form.controls).forEach(key => {
        const control = this.form.get(key);
        if (control?.invalid) {
          console.log(`  ${key}:`, control.errors);
        }
      });
      this.form.markAllAsTouched();
      return;
    }
    
    // Obtener el valor del formulario y formatear asunto y mensaje
    const formValue = this.form.value;
    const asuntoFormateado = this.formatearAsunto(formValue.Asunto);
    const mensajeFormateado = this.formatearMensaje(formValue.Mensaje);
    
    const value: AlertaCreate = {
      ...formValue,
      Asunto: asuntoFormateado, // Usar el asunto formateado
      Mensaje: mensajeFormateado, // Usar el mensaje formateado
      IdTransaccion: this.idTransaccion,
      AudFecha: new Date().toISOString() // Establecer fecha actual en cada submit
    };
    
    console.log('Asunto original:', formValue.Asunto);
    console.log('Asunto formateado:', asuntoFormateado);
    console.log('Mensaje original:', formValue.Mensaje);
    console.log('Mensaje formateado:', mensajeFormateado);
    console.log('URL del contexto:', this.generarUrlContexto());
    console.log('AudFecha establecida:', value.AudFecha);
    console.log('Longitud del asunto:', asuntoFormateado.length);
    console.log('Valor a enviar:', value);
    
    if (this.editando && this.alerta && this.alerta.idAlerta) {
      console.log('Editando alerta ID:', this.alerta.idAlerta);
      this.alertaService.updateAlerta(this.alerta.idAlerta, value).subscribe({
        next: (resp) => {
          console.log('Alerta editada exitosamente:', resp);
          this.create.emit(resp);
          this.form.reset({
            IdEstado: 1,
            Medio: 'Email',
            AudFecha: new Date().toISOString()
          });
        },
        error: (err) => {
          console.error('[AlertaCreate] Error al editar alerta:', err);
        }
      });
    } else {
      console.log('Creando nueva alerta');
      console.log('Tipo de padre:', this.tipoPadre);
      console.log('ID de padre:', this.idPadre);
      
      // Usar el método específico según el tipo de padre
      let createObservable;
      if (this.tipoPadre === 'notificacion' && this.idPadre) {
        createObservable = this.alertaService.createAlertaForNotificacion(this.idPadre, value);
      } else {
        createObservable = this.alertaService.createAlerta(value);
      }
      
      createObservable.subscribe({
        next: (resp) => {
          console.log('Alerta creada exitosamente:', resp);
          this.create.emit(resp);
          this.form.reset({
            IdEstado: 1,
            Medio: 'Email',
            AudFecha: new Date().toISOString()
          });
        },
        error: (err) => {
          console.error('[AlertaCreate] Error al crear alerta:', err);
        }
      });
    }
  }
  

  // Función para determinar si se debe mostrar el campo de días personalizados
  mostrarDiasPersonalizados(): boolean {
    const periodicidadSeleccionada = this.form.get('IdPeriodicidad')?.value;
    return periodicidadSeleccionada === 5; // 5 es el ID para "personalizada"
  }

  // Función para actualizar las validaciones del campo DiasPers
  actualizarValidacionesDiasPers(periodicidadId: number): void {
    const diasPersControl = this.form.get('DiasPers');
    
    if (periodicidadId === 5) { // Periodicidad personalizada
      // Agregar validación requerida cuando es periodicidad personalizada
      diasPersControl?.setValidators([Validators.required, Validators.min(1)]);
    } else {
      // Remover validaciones y limpiar el valor cuando no es personalizada
      diasPersControl?.clearValidators();
      diasPersControl?.setValue(null);
    }
    
    diasPersControl?.updateValueAndValidity();
  }

  /**
   * Actualiza las validaciones del campo Destinatarios según el medio seleccionado
   */
  actualizarValidacionesDestinatarios(medio: string): void {
    const destinatariosControl = this.form.get('Destinatarios');
    console.log('[DEBUG] Actualizando validaciones para medio:', medio);
    console.log('[DEBUG] Valor actual de Destinatarios:', destinatariosControl?.value);
    
    if (medio === 'Whatsapp') {
      // Para WhatsApp, validar formato de un único número telefónico
      // Formato esperado: +549XXXXXXXXXX (un solo número, sin espacios ni letras)
      destinatariosControl?.setValidators([
        Validators.required,
        Validators.pattern(/^\+?\d{10,15}$/)
      ]);
    } else {
      // Para Email, validar formato de correos electrónicos (uno o múltiples separados por comas)
      // Formato esperado: email@dominio.com o email1@dominio.com, email2@dominio.com
      // Regex más estricto: requiere usuario, @, dominio y extensión válida
      destinatariosControl?.setValidators([
        Validators.required,
        Validators.pattern(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}(\s*,\s*[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})*$/)
      ]);
    }
    
    // Marcar el campo como touched y dirty para mostrar errores inmediatamente
    destinatariosControl?.markAsTouched();
    destinatariosControl?.markAsDirty();
    destinatariosControl?.updateValueAndValidity();
    
    console.log('[DEBUG] Validaciones aplicadas. Campo válido:', destinatariosControl?.valid);
    console.log('[DEBUG] Errores:', destinatariosControl?.errors);
  }

  /**
   * Obtiene el label dinámico para el campo Destinatarios según el medio
   */
  getLabelDestinatarios(): string {
    const medio = this.form.get('Medio')?.value;
    return medio === 'Whatsapp' ? 'Número de WhatsApp' : 'Destinatarios (Email)';
  }

  /**
   * Obtiene el placeholder dinámico para el campo Destinatarios según el medio
   */
  getPlaceholderDestinatarios(): string {
    const medio = this.form.get('Medio')?.value;
    return medio === 'Whatsapp' 
      ? 'Ej: +5493515123456' 
      : 'Ej: usuario@ejemplo.com, otro@ejemplo.com';
  }

  /**
   * Obtiene el mensaje de error dinámico para el campo Destinatarios
   */
  getErrorDestinatarios(): string {
    const destinatariosControl = this.form.get('Destinatarios');
    const medio = this.form.get('Medio')?.value;
    
    if (destinatariosControl?.hasError('required')) {
      return medio === 'Whatsapp' 
        ? 'El número de WhatsApp es requerido' 
        : 'Los correos electrónicos son requeridos';
    }
    
    if (destinatariosControl?.hasError('pattern')) {
      return medio === 'Whatsapp'
        ? 'Formato inválido. Use un número con código de país (Ej: +5493515123456)'
        : 'Formato de email inválido. Use formato válido (Ej: usuario@ejemplo.com, otro@ejemplo.com)';
    }
    
    return 'El destinatario es requerido.';
  }
}
