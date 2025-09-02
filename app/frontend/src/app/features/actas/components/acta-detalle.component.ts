import { Component, OnInit, AfterViewInit, ViewChildren, QueryList, ElementRef } from '@angular/core';
import { trigger, transition, style, animate } from '@angular/animations';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ActaService, ActaDetalleResponse } from '../services/acta.service';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTabsModule } from '@angular/material/tabs';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';

@Component({
  selector: 'app-acta-detalle',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatButtonModule, MatChipsModule, MatProgressSpinnerModule, MatListModule, MatIconModule, MatDividerModule],
  template: `
    <div class="acta-detail-container">
      <div *ngIf="loading" class="loading-container">
        <mat-progress-spinner mode="indeterminate" diameter="40"></mat-progress-spinner>
        <p>Cargando acta...</p>
      </div>
      <div *ngIf="!loading && acta">
        <div class="detail-header">
          <button mat-icon-button (click)="goBack()" class="back-button">
            <mat-icon>arrow_back</mat-icon>
          </button>
          <h1>{{ acta.Descripcion || 'Acta' }}</h1>
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
                        <div class="info-item">
                          <label>ID Acta:</label>
                          <span>{{ acta.IdActa }}</span>
                        </div>
                        <div class="info-item">
                          <label>Fecha:</label>
                          <span>{{ acta.Fecha ? (acta.Fecha | date:'dd/MM/yyyy') : 'Sin fecha' }}</span>
                        </div>
                        <div class="info-item">
                          <label>Tipo:</label>
                          <span>{{ acta.IdTipoActa || 'Sin tipo' }}</span>
                        </div>
                        <div class="info-item">
                          <label>Lugar:</label>
                          <span>{{ acta.Lugar || 'Sin lugar' }}</span>
                        </div>
                        <div class="info-item">
                          <label>Autoridad:</label>
                          <span>{{ acta.IdAutoridad || 'Sin autoridad' }}</span>
                        </div>
                        <div class="info-item">
                          <label>Descripción:</label>
                          <span>{{ acta.Descripcion || 'Sin descripción' }}</span>
                        </div>
                      </div>
                    </mat-card-content>
                  </mat-card>
                </div>
              </ng-container>
              <!-- Alertas -->
              <ng-container *ngSwitchCase="1">
                <div class="tab-content">
                  <div *ngIf="acta.alertas && acta.alertas.length > 0" class="alertas-section">
                    <mat-list>
                      <mat-list-item *ngFor="let alerta of acta.alertas">
                        <mat-icon matListIcon color="primary">warning</mat-icon>
                        <div matLine><b>{{ alerta.Asunto || 'Alerta' }}</b></div>
                        <div matLine>{{ alerta.Mensaje }}</div>
                        <mat-chip color="primary" *ngIf="alerta.Estado">{{ alerta.Estado }}</mat-chip>
                      </mat-list-item>
                    </mat-list>
                  </div>
                  <div *ngIf="!acta.alertas || acta.alertas.length === 0" class="alertas-section">
                    <em>No hay alertas asociadas a esta acta.</em>
                  </div>
                </div>
              </ng-container>
              <!-- Observaciones -->
              <ng-container *ngSwitchCase="2">
                <div class="tab-content">
                  <mat-card>
                    <mat-card-content>
                      <div><b>Observaciones:</b></div>
                      <div>{{ acta.Obs || 'Sin observaciones' }}</div>
                    </mat-card-content>
                  </mat-card>
                </div>
              </ng-container>
              <!-- Archivos -->
              <ng-container *ngSwitchCase="3">
                <div class="tab-content">
                  <mat-card>
                    <mat-card-content>
                      <div><b>Archivos:</b></div>
                      <div><em>(Aquí va el listado o integración de archivos asociados al acta)</em></div>
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
    .acta-detail-container { padding: 20px; max-width: 1200px; margin: 0 auto; }
    .detail-header { display: flex; align-items: center; gap: 16px; margin-bottom: 24px; padding-bottom: 16px; border-bottom: 1px solid #e0e0e0; }
    .detail-header h1 { flex: 1; margin: 0; font-size: 28px; font-weight: 500; }
    .back-button { color: #666; }
    .custom-tab-header-wrapper { overflow: hidden; margin-bottom: 0.5rem; }
    .custom-tab-header { display: flex; background: #f5f7f6; border-radius: 8px 8px 0 0; box-shadow: 0 2px 8px rgba(0,0,0,0.03); transition: box-shadow 0.3s; position: relative; }
    .custom-tab-label { padding: 14px 32px 12px 32px; cursor: pointer; font-weight: 500; color: #416759; font-size: 16px; display: flex; align-items: center; gap: 8px; border-bottom: 3px solid transparent; transition: background 0.2s, color 0.2s; position: relative; }
    .custom-tab-label.active { background: #fff; color: #416759; z-index: 2; }
    .custom-tab-label:not(.active):hover { background: #e8f0ec; }
    .custom-tab-underline { position: absolute; left: 0; bottom: 0; height: 3px; background: #416759; transition: transform 0.4s cubic-bezier(.35,0,.25,1), width 0.4s cubic-bezier(.35,0,.25,1); will-change: transform, width; z-index: 3; }
    .custom-tab-content-wrapper { min-height: 200px; background: #fff; border-radius: 0 0 8px 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.03); overflow: hidden; position: relative; }
    .custom-tab-content-wrapper > div { width: 100%; height: 100%; }
    .tab-content { padding: 24px 0; }
    .info-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 16px; margin-top: 16px; }
    .info-item { display: flex; flex-direction: column; gap: 4px; }
    .alertas-section { margin-top: 16px; }
    mat-chip { margin-left: 8px; background: #416759; color: #fff; }
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
export class ActaDetalleComponent implements OnInit, AfterViewInit {
  @ViewChildren('tabLabel', { read: ElementRef }) tabLabels!: QueryList<ElementRef>;
  underlineWidth = 0;
  underlineLeft = 0;
  acta: ActaDetalleResponse | null = null;
  loading = true;
  tabs = [
    { label: 'Información General', icon: 'info', chip: false },
    { label: 'Alertas', icon: 'warning', chip: true, chipValue: 0 },
    { label: 'Observaciones', icon: 'comment', chip: false },
    { label: 'Archivos', icon: 'attach_file', chip: false }
  ];
  selectedTabIndex = 0;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private actaService: ActaService
  ) {}

  ngOnInit() {
    const id = Number(this.route.snapshot.paramMap.get('actaId'));
    if (id) {
      this.actaService.getActaById(id).subscribe({
        next: (resp: ActaDetalleResponse) => {
          this.acta = resp;
          this.tabs[1].chipValue = resp.alertas?.length || 0;
          this.loading = false;
          setTimeout(() => this.updateUnderline(), 10);
        },
        error: () => {
          this.acta = null;
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
    this.router.navigate(['/expedientes']);
  }
}
