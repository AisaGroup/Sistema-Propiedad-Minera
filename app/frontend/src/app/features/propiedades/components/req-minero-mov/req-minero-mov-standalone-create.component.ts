import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, FormGroup, FormControl, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatSelectModule } from '@angular/material/select';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatChipsModule } from '@angular/material/chips';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { ReqMineroMovCreate, ReqMinero, ReqMineroMovService } from '../../services/req-minero-mov.service';
import { ExpedienteService } from '../../../expedientes/services/expediente.service';
import { Expediente } from '../../../expedientes/models/expediente.model';
import { SharedDatepickerModule } from '../../../../shared/shared-datepicker.module';
import { Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';

@Component({
  selector: 'app-req-minero-mov-standalone-create',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatDatepickerModule,
    MatIconModule,
    MatCardModule,
    MatSelectModule,
    MatAutocompleteModule,
    MatChipsModule,
    MatSnackBarModule,
    SharedDatepickerModule
  ],
  template: `
    <div class="create-container">
      <mat-card>
        <mat-card-header>
          <mat-card-title>
            <mat-icon>add_business</mat-icon>
            Crear Requerimiento Minero
          </mat-card-title>
        </mat-card-header>
        <mat-card-content>
          <form [formGroup]="reqMineroForm" (ngSubmit)="onSubmit()">
            <!-- Campo de Expedientes con autocomplete y chips -->
            <div class="form-row horizontal-field">
              <label class="field-label">Expedientes:</label>
              <div class="field-content">
                <!-- Chips de expedientes seleccionados -->
                <div class="expedientes-chips" *ngIf="expedientesSeleccionados.length > 0">
                  <mat-chip-set>
                    <mat-chip *ngFor="let exp of expedientesSeleccionados" 
                              (removed)="removeExpediente(exp)"
                              class="expediente-chip">
                      <mat-icon>folder</mat-icon>
                      {{ exp.CodigoExpediente }}
                      <button matChipRemove>
                        <mat-icon>cancel</mat-icon>
                      </button>
                    </mat-chip>
                  </mat-chip-set>
                </div>
                
                <!-- Input con autocomplete -->
                <mat-form-field appearance="outline" class="full-width">
                  <input matInput
                         [formControl]="expedienteInput"
                         [matAutocomplete]="autoExpediente"
                         placeholder="Buscar y agregar expedientes...">
                  <mat-icon matIconSuffix>search</mat-icon>
                  <mat-autocomplete #autoExpediente="matAutocomplete"
                                    (optionSelected)="addExpediente($event)">
                    <mat-option *ngFor="let expediente of filteredExpedientes | async" 
                                [value]="expediente">
                      {{ expediente.CodigoExpediente || 'Sin código' }} - {{ expediente.Caratula || 'Sin carátula' }}
                    </mat-option>
                  </mat-autocomplete>
                  <mat-hint>Escriba para buscar expedientes</mat-hint>
                </mat-form-field>
              </div>
            </div>

            <!-- Campo de Tipo de Requerimiento -->
            <div class="form-row horizontal-field">
              <label class="field-label">Tipo de Requerimiento:</label>
              <div class="field-content">
                <mat-form-field appearance="outline" class="full-width">
                  <mat-select formControlName="IdReqMinero" placeholder="Seleccione un tipo de requerimiento">
                    <mat-option *ngFor="let reqMinero of reqMineros" [value]="reqMinero.IdReqMinero">
                      {{ reqMinero.Tipo || 'Sin tipo' }}
                    </mat-option>
                  </mat-select>
                  <mat-error *ngIf="reqMineroForm.get('IdReqMinero')?.hasError('required')">
                    El tipo de requerimiento es requerido
                  </mat-error>
                </mat-form-field>
              </div>
            </div>

            <!-- Fila Fecha Inicio -->
            <div class="form-row">
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Desde</mat-label>
                <input matInput 
                       [matDatepicker]="pickerInicio" 
                       formControlName="FechaInicio" 
                       placeholder="Seleccione la fecha de inicio" 
                       appDateFormat>
                <mat-datepicker-toggle matIconSuffix [for]="pickerInicio"></mat-datepicker-toggle>
                <mat-datepicker #pickerInicio></mat-datepicker>
              </mat-form-field>
            </div>

            <!-- Fila Fecha Fin -->
            <div class="form-row">
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Hasta</mat-label>
                <input matInput 
                       [matDatepicker]="pickerFin" 
                       formControlName="FechaFin" 
                       placeholder="Seleccione la fecha de fin" 
                       appDateFormat>
                <mat-datepicker-toggle matIconSuffix [for]="pickerFin"></mat-datepicker-toggle>
                <mat-datepicker #pickerFin></mat-datepicker>
              </mat-form-field>
            </div>

            <!-- Campo Descripción -->
            <div class="form-row">
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Descripción</mat-label>
                <textarea matInput 
                          formControlName="Descripcion"
                          placeholder="Ingrese la descripción del requerimiento"
                          rows="3"
                          maxlength="500">
                </textarea>
                <mat-hint align="end">{{reqMineroForm.get('Descripcion')?.value?.length || 0}}/500</mat-hint>
                <mat-error *ngIf="reqMineroForm.get('Descripcion')?.hasError('required')">
                  La descripción es requerida
                </mat-error>
              </mat-form-field>
            </div>

            <!-- Campo Importe - Solo aparece si se selecciona Canon (ID = 1) o Plan de Inversión (ID = 3) -->
            <div class="form-row" *ngIf="reqMineroForm.get('IdReqMinero')?.value === 1 || reqMineroForm.get('IdReqMinero')?.value === 3">
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Importe</mat-label>
                <input matInput 
                       type="number"
                       formControlName="Importe"
                       placeholder="Ej: 1234.56"
                       step="0.01">
                <span matTextPrefix>$ </span>
                <mat-hint align="start">
                  Ingrese el importe. Use punto para decimales. Ej: <b>1234.56</b>
                </mat-hint>
                <mat-error *ngIf="reqMineroForm.get('Importe')?.hasError('min')">
                  El importe debe ser mayor a 0
                </mat-error>
              </mat-form-field>
            </div>

            <!-- Botones de acción -->
            <div class="form-actions">
              <button mat-button 
                      type="button" 
                      (click)="onCancel()"
                      color="warn">
                <mat-icon>cancel</mat-icon>
                Cancelar
              </button>
              <button mat-raised-button 
                      type="submit" 
                      color="primary"
                      [disabled]="reqMineroForm.invalid || isSubmitting"
                      class="btn-crear-requerimiento">
                <mat-icon>save</mat-icon>
                {{ isSubmitting ? 'Guardando...' : 'Crear Requerimiento' }}
              </button>
            </div>
          </form>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .create-container {
      max-width: 800px;
      margin: 24px auto;
      padding: 0 16px;
    }

    .form-row {
      margin-bottom: 16px;
    }
    
    /* Diseño horizontal para campos específicos */
    .horizontal-field {
      display: grid;
      grid-template-columns: 200px 1fr;
      gap: 16px;
      align-items: center;
      margin-bottom: 16px;
    }
    
    .field-label {
      font-weight: 500;
      color: rgba(0,0,0,0.7);
      font-size: 14px;
      text-align: right;
      padding-right: 8px;
    }
    
    .field-content {
      width: 100%;
    }
    
    /* Remover labels de Angular Material para campos horizontales */
    .horizontal-field .mat-mdc-form-field .mat-mdc-form-field-label {
      display: none !important;
    }
    
    /* Ajustar padding para campos horizontales */
    .horizontal-field .mat-mdc-form-field-infix {
      padding-top: 16px !important;
      padding-bottom: 16px !important;
      padding-left: 16px !important;
    }
    
    .full-width {
      width: 100%;
    }

    .form-actions {
      display: flex;
      justify-content: flex-end;
      gap: 12px;
      margin-top: 24px;
      padding-top: 16px;
      border-top: 1px solid #e0e0e0;
    }

    mat-card {
      max-width: 100%;
    }

    mat-card-title {
      display: flex;
      align-items: center;
      gap: 8px;
      color: #333;
    }

    textarea {
      resize: vertical;
      min-height: 80px;
    }

    .btn-crear-requerimiento {
      cursor: pointer !important;
      pointer-events: auto !important;
    }

    .btn-crear-requerimiento:disabled {
      cursor: not-allowed !important;
    }

    /* Estilos para chips de expedientes */
    .expedientes-chips {
      margin-bottom: 12px;
    }

    .expediente-chip {
      margin: 4px;
      background-color: #e8f5e9 !important;
      color: #2e7d32 !important;
      font-weight: 500;
      border: 2px solid #4caf50;
      box-shadow: 0 2px 4px rgba(76, 175, 80, 0.2);
    }

    .expediente-chip mat-icon {
      color: #2e7d32;
      font-size: 18px;
      width: 18px;
      height: 18px;
    }

    .expediente-chip button[matChipRemove] {
      opacity: 0.7;
    }

    .expediente-chip button[matChipRemove]:hover {
      opacity: 1;
    }
    
    /* Estilos normales para campos regulares */
    .mat-mdc-form-field {
      width: 100% !important;
      margin-bottom: 8px !important;
    }
    
    .mat-mdc-form-field-label {
      position: relative !important;
      top: auto !important;
      left: auto !important;
      background: transparent !important;
      padding: 0 !important;
      z-index: auto !important;
      font-size: 16px !important;
      color: rgba(0,0,0,0.6) !important;
      transform: auto !important;
      transition: auto !important;
      white-space: normal !important;
      max-width: none !important;
      overflow: visible !important;
      text-overflow: clip !important;
    }
    
    .mat-mdc-form-field-infix {
      padding-top: 16px !important;
      padding-bottom: 16px !important;
      padding-left: 16px !important;
      min-height: auto !important;
    }
    
    .mat-mdc-form-field-outline {
      top: auto !important;
    }
    
    .mat-mdc-select-trigger,
    .mat-mdc-input-element {
      padding-top: auto !important;
      padding-bottom: auto !important;
      padding-left: auto !important;
      line-height: auto !important;
      min-height: auto !important;
    }
    
    .mat-mdc-select-value {
      line-height: auto !important;
      padding-top: auto !important;
    }
    
    .mat-mdc-form-field-subscript-wrapper {
      margin-top: auto !important;
      margin-left: auto !important;
    }

    @media (max-width: 768px) {
      .horizontal-field {
        grid-template-columns: 1fr;
        gap: 8px;
      }

      .field-label {
        text-align: left;
        padding-right: 0;
      }
    }
  `]
})
export class ReqMineroMovStandaloneCreateComponent implements OnInit {
  reqMineroForm: FormGroup;
  reqMineros: ReqMinero[] = [];
  expedientes: Expediente[] = [];
  expedientesSeleccionados: Expediente[] = [];
  expedienteInput = new FormControl('');
  filteredExpedientes: any;
  isSubmitting = false;

  constructor(
    private fb: FormBuilder,
    private reqMineroMovService: ReqMineroMovService,
    private expedienteService: ExpedienteService,
    private snackBar: MatSnackBar,
    private router: Router
  ) {
    this.reqMineroForm = this.createForm();
  }

  ngOnInit() {
    this.loadReqMineros();
    this.loadExpedientes();

    // Escuchar cambios en IdReqMinero para manejar el campo Importe
    this.reqMineroForm.get('IdReqMinero')?.valueChanges.subscribe(value => {
      if (value !== 1 && value !== 3) {
        this.reqMineroForm.patchValue({ Importe: null });
      }
    });

    // Configurar filtro de expedientes (solo por código)
    this.filteredExpedientes = this.expedienteInput.valueChanges.pipe(
      startWith(''),
      map(value => {
        const filterValue = typeof value === 'string' ? value.toLowerCase() : '';
        return this.expedientes.filter(exp => 
          !this.expedientesSeleccionados.find(selected => selected.IdExpediente === exp.IdExpediente) &&
          exp.CodigoExpediente?.toLowerCase().includes(filterValue)
        );
      })
    );
  }

  private loadReqMineros() {
    this.reqMineroMovService.getReqMineros().subscribe({
      next: (reqMineros) => {
        this.reqMineros = reqMineros;
      },
      error: (error) => {
        console.error('Error loading req mineros:', error);
        this.reqMineros = [];
        this.snackBar.open('Error al cargar los tipos de requerimientos', 'Cerrar', {
          duration: 3000
        });
      }
    });
  }

  private loadExpedientes() {
    // Cargar todos los expedientes (ajusta el límite según necesites)
    this.expedienteService.getExpedientes(0, 1000).subscribe({
      next: (response) => {
        this.expedientes = response.data;
      },
      error: (error) => {
        console.error('Error loading expedientes:', error);
        this.expedientes = [];
        this.snackBar.open('Error al cargar los expedientes', 'Cerrar', {
          duration: 3000
        });
      }
    });
  }

  private createForm(): FormGroup {
    return this.fb.group({
      IdExpedientes: [[]],  // Array para múltiples expedientes
      IdReqMinero: [null, [Validators.required, Validators.min(1)]],
      FechaInicio: [null],
      FechaFin: [null],
      Descripcion: ['', [Validators.required, Validators.maxLength(500)]],
      Importe: [null, [Validators.min(0)]]
    });
  }

  onSubmit() {
    if (this.reqMineroForm.valid && !this.isSubmitting) {
      this.isSubmitting = true;
      const formValue = this.reqMineroForm.value;

      // Convertir Importe argentino a número para backend
      let importe = formValue.Importe;
      if (typeof importe === 'string') {
        importe = importe.replace(/\./g, '').replace(',', '.');
        importe = parseFloat(importe);
      }

      const reqMineroData: ReqMineroMovCreate = {
        IdPropiedadMinera: undefined, // No tiene propiedad minera asociada
        IdReqMinero: formValue.IdReqMinero,
        FechaInicio: formValue.FechaInicio,
        FechaFin: formValue.FechaFin,
        Descripcion: formValue.Descripcion?.trim(),
        Importe: isNaN(importe) ? null : importe
      };

      // Crear el requerimiento minero primero
      this.reqMineroMovService.createReqMineroMov(reqMineroData).subscribe({
        next: (response) => {
          const idReqMineroMov = response.IdReqMineroMov;
          const expedientesSeleccionados = formValue.IdExpedientes || [];

          // Si hay expedientes seleccionados, crear las relaciones
          if (expedientesSeleccionados.length > 0) {
            this.crearRelacionesExpedientes(idReqMineroMov, expedientesSeleccionados);
          } else {
            this.snackBar.open('Requerimiento minero creado exitosamente', 'Cerrar', {
              duration: 3000,
              panelClass: ['success-snackbar']
            });
            this.isSubmitting = false;
            this.router.navigate(['/req-minero-movs']);
          }
        },
        error: (error) => {
          console.error('Error creating req minero mov:', error);
          this.snackBar.open('Error al crear el requerimiento minero', 'Cerrar', {
            duration: 3000,
            panelClass: ['error-snackbar']
          });
          this.isSubmitting = false;
        }
      });
    }
  }

  private crearRelacionesExpedientes(idReqMineroMov: number, expedientes: number[]) {
    // Crear las relaciones en la tabla intermedia ReqMinExp
    this.reqMineroMovService.createReqMinExpRelations(idReqMineroMov, expedientes).subscribe({
      next: () => {
        this.snackBar.open(
          `Requerimiento minero creado exitosamente con ${expedientes.length} expediente(s) asociado(s)`,
          'Cerrar',
          { 
            duration: 3000,
            panelClass: ['success-snackbar']
          }
        );
        this.isSubmitting = false;
        this.router.navigate(['/req-minero-movs']);
      },
      error: (error) => {
        console.error('Error creating expediente relations:', error);
        this.snackBar.open(
          'Requerimiento creado pero hubo un error al asociar los expedientes',
          'Cerrar',
          { 
            duration: 4000,
            panelClass: ['error-snackbar']
          }
        );
        this.isSubmitting = false;
        this.router.navigate(['/req-minero-movs']);
      }
    });
  }

  addExpediente(event: any) {
    const expediente = event.option.value;
    if (!this.expedientesSeleccionados.find(exp => exp.IdExpediente === expediente.IdExpediente)) {
      this.expedientesSeleccionados.push(expediente);
      this.updateExpedientesFormControl();
    }
    this.expedienteInput.setValue('');
  }

  removeExpediente(expediente: Expediente) {
    const index = this.expedientesSeleccionados.indexOf(expediente);
    if (index >= 0) {
      this.expedientesSeleccionados.splice(index, 1);
      this.updateExpedientesFormControl();
    }
  }

  private updateExpedientesFormControl() {
    const ids = this.expedientesSeleccionados.map(exp => exp.IdExpediente);
    this.reqMineroForm.patchValue({ IdExpedientes: ids });
  }

  onCancel() {
    this.router.navigate(['/req-minero-movs']);
  }
}
