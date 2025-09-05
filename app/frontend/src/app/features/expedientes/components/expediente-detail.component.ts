import { Component, OnInit, ViewChildren, QueryList, ElementRef, AfterViewInit } from '@angular/core';
import { trigger, state, style, animate, transition } from '@angular/animations';
import { CommonModule, DatePipe } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTabsModule } from '@angular/material/tabs';
import { MatListModule } from '@angular/material/list';
import { MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSnackBar } from '@angular/material/snack-bar';

import { ExpedienteService } from '../services/expediente.service';
import { Expediente } from '../models/expediente.model';
import { ActasComponent } from '../../actas/components/actas.component';
import { ResolucionesListComponent } from '../../resoluciones/components/resoluciones-list.component';
import { ObservacionesTabComponent } from '../../observaciones/components/observaciones-tab.component';
import { AlertaCreateComponent } from '../../alertas/components/alerta-create.component';
import { AlertasListComponent } from '../../alertas/components/alertas-list.component';
import { ReactiveFormsModule } from '@angular/forms';
import { ExpedienteFormComponent } from './expediente-form.component';

@Component({
  selector: 'app-expediente-detail',
  standalone: true,
  imports: [
  CommonModule,
  RouterModule,
  MatCardModule,
  MatButtonModule,
  MatIconModule,
  MatDividerModule,
  MatChipsModule,
  MatProgressSpinnerModule,
  MatTabsModule,
  MatListModule,
  MatTableModule,
  MatTooltipModule,
  DatePipe,
  ActasComponent,
  ResolucionesListComponent,
  ObservacionesTabComponent,
  AlertasListComponent,
  ReactiveFormsModule,
  ExpedienteFormComponent
  ],
  templateUrl: './expediente-detail.component.html',
  styleUrls: ['./expediente-detail.component.scss'],
  animations: [
    trigger('slideContent', [
      transition(':increment', [
        style({ transform: 'translateX(100%)', opacity: 0 }),
        animate('400ms cubic-bezier(.35,0,.25,1)', style({ transform: 'translateX(0%)', opacity: 1 }))
      ]),
      transition(':decrement', [
        style({ transform: 'translateX(-100%)', opacity: 0 }),
        animate('400ms cubic-bezier(.35,0,.25,1)', style({ transform: 'translateX(0%)', opacity: 1 }))
      ])
    ])
  ]
})
export class ExpedienteDetailComponent implements OnInit, AfterViewInit {
  @ViewChildren('tabLabel', { read: ElementRef }) tabLabels!: QueryList<ElementRef>;
  mostrarFormularioAlerta = false;
  onCrearAlerta(alerta: any) {
    console.log('[ExpedienteDetail] Recibido evento create alerta:', alerta);
    if (this.expediente) {
      if (!this.expediente.alertas) this.expediente.alertas = [];
      this.expediente.alertas.push({ ...alerta, idAlerta: Math.floor(Math.random() * 100000) });
      this.tabs[3].chipValue = this.expediente.alertas.length;
    }
    this.mostrarFormularioAlerta = false;
  }
  expediente: Expediente | null = null;
  loading = false;
  error: string | null = null;
  expedienteId: number | null = null;
  underlineWidth = 0;
  underlineLeft = 0;
  editando: boolean = false;
  eliminando: boolean = false;

  tabs = [
    { label: 'Información General', icon: 'info', chip: false },
    { label: 'Actas', icon: 'description', chip: false },
    { label: 'Resoluciones', icon: 'gavel', chip: false },
    { label: 'Alertas', icon: 'warning', chip: true, chipValue: 0 },
    { label: 'Observaciones', icon: 'note', chip: false } // Nuevo tab de Observaciones
  ];
  selectedTabIndex = 0;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private expedienteService: ExpedienteService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.expedienteId = +params['id'];
      if (this.expedienteId) {
        this.loadExpediente();
      }
    });
  }

  ngAfterViewInit(): void {
    setTimeout(() => this.updateUnderline(), 10);
    this.tabLabels.changes.subscribe(() => {
      setTimeout(() => this.updateUnderline(), 10);
    });
  }

  loadExpediente(): void {
    if (!this.expedienteId) return;

    this.loading = true;
    this.error = null;

    this.expedienteService.getExpedienteById(this.expedienteId).subscribe({
      next: (expediente) => {
        this.expediente = expediente;
        // Actualizar chip de alertas
        this.tabs[3].chipValue = expediente.alertas?.length || 0;
        this.loading = false;
      },
      error: (error) => {
        this.error = 'No se pudo cargar el expediente. Verifique que el ID sea correcto.';
        this.loading = false;
      }
    });
  }

  selectTab(index: number): void {
    this.selectedTabIndex = index;
    setTimeout(() => this.updateUnderline(), 10);
  }

  updateUnderline() {
    if (!this.tabLabels || !this.tabLabels.toArray()[this.selectedTabIndex]) return;
    const el = this.tabLabels.toArray()[this.selectedTabIndex].nativeElement as HTMLElement;
    this.underlineWidth = el.offsetWidth;
    this.underlineLeft = el.offsetLeft;
  }

  goBack(): void {
    if (this.editando) {
      this.cancelarEdicion();
    } else {
      this.router.navigate(['/expedientes']);
    }
  }

  editarExpediente(): void {
    this.editando = true;
  }
  cancelarEdicion() {
    this.editando = false;
    this.loadExpediente();
  }
  onExpedienteEditado(datos: any) {
    if (!this.expedienteId) return;
    this.expedienteService.updateExpediente(this.expedienteId, datos).subscribe({
      next: () => {
        this.editando = false;
        this.loadExpediente();
        this.snackBar.open('Expediente actualizado correctamente', 'Cerrar', {
          duration: 3000,
          panelClass: ['snackbar-success']
        });
      },
      error: () => {
        this.snackBar.open('Error al guardar los cambios', 'Cerrar', {
          duration: 4000,
          panelClass: ['snackbar-error']
        });
      }
    });
  }

  eliminarExpediente(): void {
    this.eliminando = true;
  }
  confirmarEliminar() {
    if (!this.expedienteId || !this.expediente) return;
    this.expedienteService.deleteExpediente(this.expedienteId).subscribe({
      next: () => {
        this.router.navigate(['/expedientes']);
      },
      error: () => {
        alert('Error al eliminar el expediente. Intente nuevamente.');
        this.eliminando = false;
      }
    });
  }
  cancelarEliminar() {
    this.eliminando = false;
  }
}
