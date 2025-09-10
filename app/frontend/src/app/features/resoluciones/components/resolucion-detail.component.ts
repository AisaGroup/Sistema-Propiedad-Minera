import { Component, OnInit, AfterViewInit, ViewChildren, QueryList, ElementRef } from '@angular/core';
import { trigger, transition, style, animate } from '@angular/animations';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTabsModule } from '@angular/material/tabs';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { ResolucionService, ResolucionDetalleResponse } from '../services/resolucion.service';
import { AlertasListComponent } from '../../alertas/components/alertas-list.component';
import { ObservacionesTabComponent } from '../../observaciones/components/observaciones-tab.component';
import { AlertaService } from '../../alertas/services/alerta.service';
import { ObservacionesService } from '../../observaciones/services/observaciones.service';

@Component({
  selector: 'app-resolucion-detalle',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatButtonModule, MatChipsModule, MatProgressSpinnerModule, MatListModule, MatIconModule, MatDividerModule, AlertasListComponent, ObservacionesTabComponent],
  template: `
    <div class="resolucion-detail-container">
      <div *ngIf="loading" class="loading-container">
        <mat-progress-spinner mode="indeterminate" diameter="40"></mat-progress-spinner>
        <p>Cargando resolución...</p>
      </div>
      <div *ngIf="!loading && resolucion">
        <div class="detail-header">
          <button mat-icon-button (click)="goBack()" class="back-button">
            <mat-icon>arrow_back</mat-icon>
          </button>
          <h1>Resolución {{ resolucion.Titulo || 'Resolución' }}</h1>
        </div>
        <!-- Custom Tabs Header (fixed) -->
        <div class="custom-tab-header-wrapper">
          <div class="custom-tab-header">
            <div *ngFor="let tab of tabs; let i = index"
                 #tabLabel
                 class="custom-tab-label"
                 [class.active]="selectedTabIndex === i"
                 (click)="selectTab(i)">
              <mat-icon *ngIf="tab.icon">{{tab.icon}}</mat-icon>
              {{tab.label}}
              <mat-chip *ngIf="tab.chip && tab.chipValue" class="count-chip">{{tab.chipValue}}</mat-chip>
            </div>
            <div class="custom-tab-underline" [style.width.px]="underlineWidth" [style.transform]="'translateX(' + underlineLeft + 'px)'">
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
                        <div class="info-item"><label>N° Resolución:</label><span>{{ resolucion.Numero || 'Sin número' }}</span></div>
                        <div class="info-item"><label>Título:</label><span>{{ resolucion.Titulo || 'Sin título' }}</span></div>
                        <div class="info-item"><label>Fecha de Emisión:</label><span>{{ resolucion.Fecha_emision ? (resolucion.Fecha_emision | date:'dd/MM/yyyy') : 'Sin fecha' }}</span></div>
                        <div class="info-item"><label>Fecha de Publicación:</label><span>{{ resolucion.Fecha_publicacion ? (resolucion.Fecha_publicacion | date:'dd/MM/yyyy') : 'Sin fecha' }}</span></div>
                        <div class="info-item"><label>Estado Actual:</label><span>{{ resolucion.Estado || 'Sin estado' }}</span></div>
                        <div class="info-item"><label>Organismo Emisor:</label><span>{{ resolucion.Organismo_emisor || 'Sin organismo' }}</span></div>
                        <div class="info-item"><label>Descripción:</label><span>{{ resolucion.Descripcion || 'Sin descripción' }}</span></div>
                      </div>
                    </mat-card-content>
                  </mat-card>
                </div>
              </ng-container>
              <!-- Alertas -->
              <ng-container *ngSwitchCase="1">
                <div class="tab-content">
                  <app-alertas-list [idTransaccion]="resolucion.IdTransaccion ?? null"></app-alertas-list>
                </div>
              </ng-container>
              <!-- Observaciones -->
              <ng-container *ngSwitchCase="2">
                <div class="tab-content">
                  <app-observaciones-tab [idTransaccion]="resolucion.IdTransaccion ?? null"></app-observaciones-tab>
                </div>
              </ng-container>
              <!-- Archivos -->
              <ng-container *ngSwitchCase="3">
                <div class="tab-content">
                  <mat-card>
                    <mat-card-content>
                      <div><b>Archivos:</b></div>
                      <div><em>(Aquí va el listado o integración de archivos asociados a la resolución)</em></div>
                    </mat-card-content>
                  </mat-card>
                </div>
              </ng-container>
            </ng-container>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .resolucion-detail-container { padding: 20px; max-width: 1200px; margin: 0 auto; }
    .detail-header { display: flex; align-items: center; gap: 16px; margin-bottom: 24px; padding-bottom: 16px; border-bottom: 1px solid #e0e0e0; }
    .detail-header h1 { flex: 1; margin: 0; font-size: 28px; font-weight: 500; }
    .back-button { color: #666; }
    .custom-tab-header-wrapper { overflow: hidden; margin-bottom: 0.5rem; }
    .custom-tab-header { display: flex; background: #f5f7f6; border-radius: 8px 8px 0 0; box-shadow: 0 2px 8px rgba(0,0,0,0.03); transition: box-shadow 0.3s; position: relative; }
    .custom-tab-label { padding: 14px 32px 12px 32px; cursor: pointer; font-weight: 500; color: #416759; font-size: 16px; display: flex; align-items: center; gap: 8px; border-bottom: 3px solid transparent; transition: background 0.2s, color 0.2s; position: relative; }
    .custom-tab-label.active { background: #fff; color: #416759; z-index: 2; }
    .custom-tab-label:not(.active):hover { background: #e8f0ec; }
    .custom-tab-underline { position: absolute; left: 0; bottom: 0; height: 3px; background: #416759; transition: transform 0.4s cubic-bezier(.35,0,.25,1), width 0.4s cubic-bezier(.35,0,.25,1); will-change: transform, width; z-index: 3; }
    .custom-tab-content-wrapper { min-height: 300px; background: #fff; border-radius: 0 0 8px 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.03); position: relative; }
    .custom-tab-content-wrapper > div { width: 100%; height: 100%; }
    .tab-content { padding: 24px 0; }
    .info-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 20px; margin-top: 20px; }
    .info-item { 
      display: flex; 
      flex-direction: column; 
      gap: 8px; 
      padding: 16px;
      background: linear-gradient(135deg, #f8fffe 0%, #f1f8f6 100%);
      border-radius: 12px;
      border: 1px solid #e1f0ec;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      position: relative;
      overflow: hidden;
    }
    .info-item::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      width: 4px;
      height: 100%;
      background: linear-gradient(180deg, #416759 0%, #5a8070 100%);
      opacity: 0;
      transition: opacity 0.3s ease;
    }
    .info-item:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 25px rgba(65, 103, 89, 0.12);
      border-color: #c8e0d7;
    }
    .info-item:hover::before {
      opacity: 1;
    }
    .info-item label { 
      font-weight: 600; 
      color: #2d5a48; 
      font-size: 0.9rem;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-bottom: 4px;
      position: relative;
    }
    .info-item span { 
      color: #1a4435; 
      font-size: 1rem;
      font-weight: 500;
      line-height: 1.4;
    }
    .alertas-section { margin-top: 16px; }
    mat-chip { margin-left: 8px; background: #416759; color: #fff; }
    mat-chip.count-chip {
      background: #fff;
      color: #3F6858;
      border: 1.5px solid #3F6858;
      font-weight: 600;
      border-radius: 8px;
      font-size: 1.1em;
      padding: 0 8px;
      height: 32px;
      min-width: 32px;
      width: auto;
      max-width: 40px;
      display: inline-flex;
      align-items: center;
      box-sizing: border-box;
      justify-content: center;
    }
    mat-list-item { margin-bottom: 8px; }
    em { color: #888; }
  `],
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
export class ResolucionDetalleComponent implements OnInit, AfterViewInit {
  @ViewChildren('tabLabel', { read: ElementRef }) tabLabels!: QueryList<ElementRef>;
  underlineWidth = 0;
  underlineLeft = 0;
  resolucion: ResolucionDetalleResponse | null = null;
  loading = true;
  tabs = [
    { label: 'Información General', icon: 'info', chip: false },
    { label: 'Alertas', icon: 'warning', chip: true, chipValue: 0 },
    { label: 'Observaciones', icon: 'comment', chip: false },
    { label: 'Archivos', icon: 'attach_file', chip: false }
  ];
  selectedTabIndex = 0;
  alertas: any[] = [];
  totalAlertas = 0;
  observaciones: any[] = [];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private resolucionService: ResolucionService,
    private alertaService: AlertaService,
    private observacionesService: ObservacionesService
  ) {}

  ngOnInit() {
    const id = Number(this.route.snapshot.paramMap.get('resolucionId'));
    if (id) {
      this.resolucionService.getResolucionById(id).subscribe({
        next: (resp: ResolucionDetalleResponse) => {
          this.resolucion = resp;
          this.tabs[1].chipValue = 0;
          this.alertas = [];
          this.totalAlertas = 0;
          this.observaciones = [];
          if (resp.IdTransaccion) {
            this.alertaService
              .getByResolucionId(resp.IdResolucion, 0, 5)
              .subscribe(result => {
                this.alertas = result.data;
                this.totalAlertas = result.total;
                this.tabs[1].chipValue = this.totalAlertas;
              });
            this.observacionesService
              .getByTransaccion(resp.IdTransaccion)
              .subscribe(obs => {
                this.observaciones = Array.isArray(obs) ? obs : (obs ? [obs] : []);
              });
          }
          this.loading = false;
          setTimeout(() => this.updateUnderline(), 10);
        },
        error: () => {
          this.resolucion = null;
          this.loading = false;
        }
      });
    }
  }

  ngAfterViewInit(): void {
    setTimeout(() => this.updateUnderline(), 10);
    this.tabLabels.changes.subscribe(() => {
      setTimeout(() => this.updateUnderline(), 10);
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

  goBack() {
    if (this.resolucion && this.resolucion.IdExpediente) {
      this.router.navigate(['/expedientes', this.resolucion.IdExpediente]);
    } else {
      this.router.navigate(['/expedientes']);
    }
  }
}
