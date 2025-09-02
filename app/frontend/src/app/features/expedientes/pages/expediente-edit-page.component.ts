import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { ExpedienteFormComponent } from '../components/expediente-form.component';
import { ExpedienteService } from '../services/expediente.service';
import { Expediente } from '../models/expediente.model';

@Component({
  selector: 'app-expediente-edit-page',
  standalone: true,
  imports: [CommonModule, ExpedienteFormComponent],
  template: `
    <app-expediente-form
      *ngIf="expediente"
      [form]="form"
      [modo]="'editar'"
      (create)="onUpdate($event)"
    ></app-expediente-form>
    <div *ngIf="loading" class="loading">Cargando expediente...</div>
    <div *ngIf="error" class="error">{{ error }}</div>
  `,
  styles: [`
    .loading { text-align: center; margin-top: 2rem; color: #888; }
    .error { color: #c00; text-align: center; margin-top: 2rem; }
  `]
})
export class ExpedienteEditPageComponent implements OnInit {
  expediente: Expediente | null = null;
  form!: FormGroup;
  loading = false;
  error: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private expedienteService: ExpedienteService
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    // Inicializar el form vacío para evitar errores de instancia
    this.form = new FormGroup({
      CodigoExpediente: new FormControl(''),
      PrimerDueno: new FormControl(''),
      Ano: new FormControl(''),
      FechaInicio: new FormControl(''),
      FechaFin: new FormControl(''),
      Estado: new FormControl(''),
      Dependencia: new FormControl(''),
      Caratula: new FormControl(''),
      Descripcion: new FormControl(''),
      Observaciones: new FormControl(''),
      IdPropiedadMinera: new FormControl(null),
      IdTipoExpediente: new FormControl(null),
    });
    if (id) {
      this.loading = true;
      this.expedienteService.getExpedienteById(+id).subscribe({
        next: (expediente) => {
          this.expediente = expediente;
          // Setear los valores en el form si el expediente existe
          if (expediente) {
            this.form.patchValue({
              CodigoExpediente: expediente.CodigoExpediente ?? '',
              PrimerDueno: expediente.PrimerDueno ?? '',
              Ano: expediente.Ano ?? '',
              FechaInicio: expediente.FechaInicio ?? '',
              FechaFin: expediente.FechaFin ?? '',
              Estado: expediente.Estado ?? '',
              Dependencia: expediente.Dependencia ?? '',
              Caratula: expediente.Caratula ?? '',
              Descripcion: expediente.Descripcion ?? '',
              Observaciones: expediente.Observaciones ?? '',
              IdPropiedadMinera: expediente.IdPropiedadMinera ?? null,
              IdTipoExpediente: expediente.IdTipoExpediente ?? null,
            });
          }
          this.loading = false;
        },
        error: () => {
          this.error = 'No se pudo cargar el expediente.';
          this.loading = false;
        }
      });
    }
  }

  onUpdate(data: any) {
    if (!this.expediente) return;
    this.expedienteService.updateExpediente(this.expediente.IdExpediente, data).subscribe({
      next: () => {
        this.router.navigate(['/expedientes', this.expediente!.IdExpediente]);
      },
      error: () => {
        this.error = 'Error al actualizar el expediente.';
      }
    });
  }
}
