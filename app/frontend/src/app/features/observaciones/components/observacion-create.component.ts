import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { ReactiveFormsModule } from '@angular/forms';
import { Observacion } from '../models/observacion.model';
import { trigger, transition, style, animate } from '@angular/animations';

@Component({
  selector: 'app-observacion-create',
  standalone: true,
  imports: [CommonModule, MatFormFieldModule, MatInputModule, MatButtonModule, ReactiveFormsModule],
  template: `
    <form [@fadeInUp] [formGroup]="form" (ngSubmit)="onSubmit()" class="observacion-form">
      <mat-form-field appearance="fill">
        <mat-label>Descripción</mat-label>
        <input matInput formControlName="Descripcion" required>
      </mat-form-field>
      <mat-form-field appearance="fill">
        <mat-label>Observaciones</mat-label>
        <textarea matInput formControlName="Observaciones"></textarea>
      </mat-form-field>
      <button mat-raised-button color="primary" type="submit">Crear Observación</button>
    </form>
  `,
  styles: [`
    .observacion-form { display: flex; flex-direction: column; gap: 1.5rem; max-width: 500px; margin: 0 auto; position: relative; }
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
export class ObservacionCreateComponent {
  @Input() idTransaccion: number | null = null;
  @Output() create = new EventEmitter<Observacion>();
  @Output() cancelar = new EventEmitter<void>();
  form: FormGroup;

  constructor(private fb: FormBuilder) {
    this.form = this.fb.group({
      Descripcion: ['', Validators.required],
      Observaciones: ['']
    });
  }

  onSubmit() {
    if (!this.idTransaccion || this.form.invalid) {
      console.log('Formulario inválido o falta IdTransaccion');
      return;
    }
    
    const formValue = this.form.value;
    
    // Validaciones más estrictas
    if (!formValue.Descripcion || formValue.Descripcion.trim().length === 0) {
      console.warn('Descripción vacía');
      return;
    }
    
    // Validar que la descripción no contenga mensajes de error de la consola
    const descripcion = formValue.Descripcion.trim();
    const invalidKeywords = ['ERROR', 'XMLHttpRequest', 'CORS', 'TypeError', 'console.', 'stack trace'];
    
    if (invalidKeywords.some(keyword => descripcion.includes(keyword))) {
      console.warn('Datos inválidos detectados en descripción, cancelando operación');
      alert('Error: Se detectaron datos inválidos en el formulario. Por favor, revise los campos.');
      return;
    }
    
    // Limitar longitud de descripción
    if (descripcion.length > 200) {
      alert('La descripción no puede exceder 200 caracteres');
      return;
    }
    
    const value: Observacion = {
      IdTransaccion: this.idTransaccion,
      Descripcion: descripcion,
      Observaciones: formValue.Observaciones?.trim() || ''
    };
    
    console.log('Creando observación válida:', value);
    this.create.emit(value);
    this.form.reset();
  }

  volver() {
    this.cancelar.emit();
  }
}
