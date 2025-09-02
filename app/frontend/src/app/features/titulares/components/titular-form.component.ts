import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { TitularMineroService } from '../services/titular.service';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-titular-minero-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatFormFieldModule, MatInputModule, MatButtonModule],
  template: `
    <div class="form-header">
      <h2>Nuevo Titular Minero</h2>
    </div>
    <form [formGroup]="form" (ngSubmit)="onSubmit()" class="titular-form">
      <mat-form-field appearance="outline">
        <mat-label>Nombre</mat-label>
        <input matInput formControlName="Nombre" required />
      </mat-form-field>
      <mat-form-field appearance="outline">
        <mat-label>Tipo Persona</mat-label>
        <input matInput formControlName="TipoPersona" required />
      </mat-form-field>
      <mat-form-field appearance="outline">
        <mat-label>DNI/CUIT</mat-label>
        <input matInput formControlName="DniCuit" required />
      </mat-form-field>
      <mat-form-field appearance="outline">
        <mat-label>Domicilio</mat-label>
        <input matInput formControlName="Domicilio" />
      </mat-form-field>
      <mat-form-field appearance="outline">
        <mat-label>Teléfono</mat-label>
        <input matInput formControlName="Telefono" />
      </mat-form-field>
      <mat-form-field appearance="outline">
        <mat-label>Email</mat-label>
        <input matInput formControlName="Email" />
      </mat-form-field>
      <mat-form-field appearance="outline">
        <mat-label>Representante Legal</mat-label>
        <input matInput formControlName="RepresentanteLegal" />
      </mat-form-field>
      <mat-form-field appearance="outline">
        <mat-label>Observaciones</mat-label>
        <input matInput formControlName="Observaciones" />
      </mat-form-field>
      <mat-form-field appearance="outline">
        <mat-label>Descripción</mat-label>
        <input matInput formControlName="Descripcion" />
      </mat-form-field>
      <button mat-raised-button color="primary" type="submit" [disabled]="form.invalid">Guardar</button>
    </form>
  `,
  styles: [`
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
      display: flex;
      flex-wrap: wrap;
      gap: 18px 24px;
      max-width: 700px;
    }
    mat-form-field {
      flex: 1 1 220px;
      min-width: 180px;
    }
    button[type="submit"] {
      margin-top: 18px;
      align-self: flex-end;
    }
  `]
})
export class TitularMineroFormComponent {
  form: FormGroup;

  constructor(private fb: FormBuilder, private titularService: TitularMineroService) {
    this.form = this.fb.group({
      Nombre: ['', Validators.required],
      TipoPersona: ['', Validators.required],
      DniCuit: ['', Validators.required],
      Domicilio: [''],
      Telefono: [''],
      Email: [''],
      RepresentanteLegal: [''],
      Observaciones: [''],
      Descripcion: ['']
    });
  }

  onSubmit() {
    if (this.form.valid) {
      // Aquí deberías llamar al método de alta en el servicio
      // this.titularService.create(this.form.value).subscribe(...)
      alert('Formulario válido. Implementar alta en el servicio.');
    }
  }
}
