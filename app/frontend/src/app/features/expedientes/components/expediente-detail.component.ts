import { Component, OnInit } from '@angular/core';
import { trigger, transition, style, animate, query, group } from '@angular/animations';
import { CommonModule } from '@angular/common';
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

import { ExpedienteService } from '../services/expediente.service';
import { Expediente } from '../models/expediente.model';
import { ActasComponent } from '../../actas/components/actas.component';
import { ResolucionesListComponent } from '../../resoluciones/components/resoluciones-list.component';
import { ObservacionesTabComponent } from '../../observaciones/components/observaciones-tab.component';

@Component({
  selector: 'app-expedientes-detail',
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
    ActasComponent,
  ActasComponent,
  ResolucionesListComponent,
  ObservacionesTabComponent
  ],
  template: `
    <div class="expediente-detail-container">
      <!-- Loading spinner -->
      <div *ngIf="loading" class="loading-container">
        <mat-progress-spinner mode="indeterminate" diameter="40"></mat-progress-spinner>
        <p>Cargando expediente...</p>
      </div>

      <!-- Expediente detail -->
      <div *ngIf="expediente && !loading">
        <!-- Header with actions -->
        <div class="detail-header">
          <button mat-icon-button (click)="goBack()" class="back-button">
            <mat-icon>arrow_back</mat-icon>
          </button>
          <h1>Expediente {{ expediente.CodigoExpediente || '#' + expediente.IdExpediente }}</h1>
          <div class="header-actions">
            <button mat-raised-button color="primary" (click)="editarExpediente()">
              <mat-icon>edit</mat-icon>
              Editar
            </button>
            <button mat-raised-button color="warn" (click)="eliminarExpediente()">
              <mat-icon>delete</mat-icon>
              Eliminar
            </button>
          </div>
        </div>

        <!-- Custom Tabs Header (fixed) -->
        <div class="custom-tab-header-wrapper">
          <div class="custom-tab-header classic">
            <div *ngFor="let tab of tabs; let i = index"
                 class="custom-tab-label classic"
                 [class.active]="selectedTabIndex === i"
                 (click)="selectTab(i)">
              <mat-icon *ngIf="tab.icon">{{tab.icon}}</mat-icon>
              {{tab.label}}
              <mat-chip *ngIf="tab.chip && tab.chipValue" class="count-chip">{{tab.chipValue}}</mat-chip>
            </div>
          </div>
        </div>

        <!-- Custom Tabs Content (animated) -->
        <div class="custom-tab-content-wrapper">
          <div [@slideContent]="selectedTabIndex">
            <ng-container [ngSwitch]="selectedTabIndex">
              <!-- Información General -->
              <ng-container *ngSwitchCase="0">
                <div class="tab-content">
                  <mat-card>
                    <mat-card-header>
                      <mat-card-title>Datos Básicos</mat-card-title>
                    </mat-card-header>
                    <mat-card-content>
                      <div class="info-grid">
                        <div class="info-item"><label>ID Expediente:</label><span>{{ expediente.IdExpediente }}</span></div>
                        <div class="info-item"><label>Código:</label><span>{{ expediente.CodigoExpediente || 'Sin código' }}</span></div>
                        <div class="info-item"><label>Primer Dueño:</label><span>{{ expediente.PrimerDueno || 'Sin especificar' }}</span></div>
                        <div class="info-item"><label>Estado:</label><span>{{ expediente.Estado || 'Sin estado' }}</span></div>
                        <div class="info-item"><label>Dependencia:</label><span>{{ expediente.Dependencia || 'Sin dependencia' }}</span></div>
                        <div class="info-item"><label>Año:</label><span>{{ expediente.Ano ? (expediente.Ano | date:'yyyy') : 'Sin año' }}</span></div>
                        <div class="info-item"><label>Fecha Inicio:</label><span>{{ expediente.FechaInicio ? (expediente.FechaInicio | date:'dd/MM/yyyy') : 'Sin fecha' }}</span></div>
                        <div class="info-item"><label>Fecha Fin:</label><span>{{ expediente.FechaFin ? (expediente.FechaFin | date:'dd/MM/yyyy') : 'Sin fecha' }}</span></div>
                        <div class="info-item"><label>Carátula:</label><span>{{ expediente.Caratula || 'Sin carátula' }}</span></div>
                        <div class="info-item"><label>Descripción:</label><span>{{ expediente.Descripcion || 'Sin descripción' }}</span></div>
                        <div class="info-item"><label>Observaciones:</label><span>{{ expediente.Observaciones || 'Sin observaciones' }}</span></div>
                      </div>
                    </mat-card-content>
                  </mat-card>
                  <mat-card *ngIf="expediente.Caratula || expediente.Descripcion || expediente.Observaciones">
                    <mat-card-header>
                      <mat-card-title>Descripción y Observaciones</mat-card-title>
                    </mat-card-header>
                    <mat-card-content>
                      <div class="description-section">
                        <div *ngIf="expediente.Caratula" class="description-item">
                          <label>Carátula:</label>
                          <p>{{ expediente.Caratula }}</p>
                        </div>
                        <mat-divider *ngIf="expediente.Caratula && expediente.Descripcion"></mat-divider>
                        <div *ngIf="expediente.Descripcion" class="description-item">
                          <label>Descripción:</label>
                          <p>{{ expediente.Descripcion }}</p>
                        </div>
                        <mat-divider *ngIf="(expediente.Caratula || expediente.Descripcion) && expediente.Observaciones"></mat-divider>
                        <div *ngIf="expediente.Observaciones" class="description-item">
                          <label>Observaciones:</label>
                          <p>{{ expediente.Observaciones }}</p>
                        </div>
                      </div>
                    </mat-card-content>
                  </mat-card>
                </div>
              </ng-container>
              <!-- Actas -->
              <ng-container *ngSwitchCase="1">
                <div class="tab-content">
                  <app-actas [idExpediente]="expediente.IdExpediente"></app-actas>
                </div>
              </ng-container>
              <!-- Resoluciones -->
              <ng-container *ngSwitchCase="2">
                <div class="tab-content">
                  <app-resoluciones-list [idExpediente]="expediente.IdExpediente"></app-resoluciones-list>
                </div>
              </ng-container>
              <!-- Alertas -->
              <ng-container *ngSwitchCase="3">
                <div class="tab-content">
                  <mat-card>
                    <mat-card-header>
                      <mat-card-title>
                        Alertas Asociadas
                        <mat-chip *ngIf="expediente.alertas?.length" class="count-chip">
                          {{ expediente.alertas?.length }}
                        </mat-chip>
                      </mat-card-title>
                    </mat-card-header>
                    <mat-card-content>
                      <mat-list *ngIf="expediente.alertas && expediente.alertas.length > 0">
                        <mat-list-item *ngFor="let alerta of expediente.alertas">
                          <div class="alerta-item">
                            <div class="alerta-info">
                              <span class="alerta-id">Alerta #{{ alerta.idAlerta }}</span>
                              <span class="alerta-transaccion">Transacción: {{ alerta.IdTransaccion }}</span>
                            </div>
                            <mat-chip [ngClass]="'estado-' + (alerta.Estado || 'sin-estado').toLowerCase()">
                              {{ alerta.Estado || 'Sin estado' }}
                            </mat-chip>
                          </div>
                        </mat-list-item>
                      </mat-list>
                      <div *ngIf="!expediente.alertas || expediente.alertas.length === 0" class="no-data">
                        <mat-icon>info</mat-icon>
                        <p>No hay alertas asociadas a este expediente.</p>
                      </div>
                    </mat-card-content>
                  </mat-card>
                </div>
              </ng-container>
              <!-- Observaciones (nuevo tab modularizado) -->
              <ng-container *ngSwitchCase="4">
                <div class="tab-content">
                  <app-observaciones-tab [observaciones]="expediente && expediente.observaciones ? expediente.observaciones : []"></app-observaciones-tab>
                </div>
              </ng-container>
            </ng-container>
          </div>
        </div>
      </div>

      <!-- Error state -->
      <div *ngIf="error && !loading" class="error-container">
        <mat-card>
          <mat-card-content>
            <div class="error-content">
              <mat-icon color="warn">error</mat-icon>
              <h3>Error al cargar el expediente</h3>
              <p>{{ error }}</p>
              <button mat-raised-button color="primary" (click)="loadExpediente()">
                <mat-icon>refresh</mat-icon>
                Reintentar
              </button>
            </div>
          </mat-card-content>
        </mat-card>
      </div>
    </div>
  `,
  styleUrls: ['./expediente-detail.component.scss'],
  animations: [
    trigger('slideTabs', [
      transition(':increment', [
        group([
          query('.custom-tab-header', [
            style({ transform: 'translateX(100%)' }),
            animate('400ms cubic-bezier(.35,0,.25,1)', style({ transform: 'translateX(0%)' }))
          ], { optional: true })
        ])
      ]),
      transition(':decrement', [
        group([
          query('.custom-tab-header', [
            style({ transform: 'translateX(-100%)' }),
            animate('400ms cubic-bezier(.35,0,.25,1)', style({ transform: 'translateX(0%)' }))
          ], { optional: true })
        ])
      ])
    ]),
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
export class ExpedientesDetailComponent implements OnInit {
  expediente: Expediente | null = null;
  loading = false;
  error: string | null = null;
  expedienteId: number | null = null;

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
    private expedienteService: ExpedienteService
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.expedienteId = +params['id'];
      if (this.expedienteId) {
        this.loadExpediente();
      }
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
  }

  goBack(): void {
    this.router.navigate(['/expedientes']);
  }

  editarExpediente(): void {
    if (this.expedienteId) {
      this.router.navigate(['/expedientes', this.expedienteId, 'editar']);
    }
  }

  eliminarExpediente(): void {
    if (!this.expedienteId || !this.expediente) return;

    if (confirm(`¿Está seguro que desea eliminar el expediente ${this.expediente.CodigoExpediente || '#' + this.expediente.IdExpediente}?`)) {
      this.expedienteService.deleteExpediente(this.expedienteId).subscribe({
        next: () => {
          this.router.navigate(['/expedientes']);
        },
        error: (error) => {
          alert('Error al eliminar el expediente. Intente nuevamente.');
        }
      });
    }
  }
}
