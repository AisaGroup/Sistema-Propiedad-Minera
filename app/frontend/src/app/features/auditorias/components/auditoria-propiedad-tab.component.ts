import { Component, Input, OnChanges, OnDestroy, OnInit, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { Subscription } from 'rxjs';
import { AuditoriaService } from '../services/auditoria.service';
import { AuditoriaDescripcionEntry, AuditoriaRaw } from '../models/auditoria.model';

type AuditoriaView = Omit<AuditoriaRaw, 'AudFecha'> & {
  AudFecha: Date | null;
  descripcionEntries: AuditoriaDescripcionEntry[];
};

@Component({
  selector: 'app-auditoria-propiedad-tab',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatTableModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
    MatButtonModule,
    MatSnackBarModule,
  ],
  template: `
    <div class="tab-content">
      <mat-card class="info-card">
        <mat-card-header>
          <mat-card-title class="card-title">
            <mat-icon aria-hidden="true">history</mat-icon>
            Auditoría de la Propiedad
          </mat-card-title>
          <mat-card-subtitle class="card-subtitle">
            Historial de cambios registrados para esta propiedad minera
          </mat-card-subtitle>
        </mat-card-header>

        <mat-card-content>
          <div *ngIf="loading" class="state-container loading">
            <mat-spinner diameter="40"></mat-spinner>
            <p>Cargando auditoría...</p>
          </div>

          <div *ngIf="error && !loading" class="state-container error">
            <mat-icon aria-hidden="true" color="warn">error_outline</mat-icon>
            <p>{{ error }}</p>
          </div>

          <div
            *ngIf="!loading && !error && auditoriasFiltradas.length === 0"
            class="state-container empty"
          >
            <mat-icon aria-hidden="true">inventory_2</mat-icon>
            <p>No se encontraron registros de auditoría para esta propiedad minera.</p>
          </div>

          <div *ngIf="!loading && !error && auditoriasFiltradas.length > 0">
            <table mat-table [dataSource]="auditoriasFiltradas" class="full-width-table">
              <!-- ID Auditoría -->
              <ng-container matColumnDef="IdAuditoria">
                <th mat-header-cell *matHeaderCellDef>ID</th>
                <td mat-cell *matCellDef="let a">
                  <span class="id-pill">{{ a.IdAuditoria }}</span>
                </td>
              </ng-container>

              <!-- Fecha -->
              <ng-container matColumnDef="AudFecha">
                <th mat-header-cell *matHeaderCellDef>Fecha</th>
                <td mat-cell *matCellDef="let a">
                  {{
                    a.AudFecha
                      ? (a.AudFecha
                        | date : 'dd/MM/yyyy - HH:mm:ss' : 'America/Argentina/Buenos_Aires')
                      : 'Sin registro'
                  }}
                </td>
              </ng-container>

              <!-- Acción -->
              <ng-container matColumnDef="Accion">
                <th mat-header-cell *matHeaderCellDef>Acción</th>
                <td mat-cell *matCellDef="let a">
                  <span class="accion-pill">{{ a.Accion }}</span>
                </td>
              </ng-container>

              <!-- Usuario -->
              <ng-container matColumnDef="Usuario">
                <th mat-header-cell *matHeaderCellDef>Usuario</th>
                <td mat-cell *matCellDef="let a">
                  <ng-container
                    *ngIf="a.AudUsuario !== null && a.AudUsuario !== undefined; else sinUsuario"
                  >
                    <span *ngIf="a.UsuarioNombre; else soloId">
                      {{ a.UsuarioNombre }} (ID: {{ a.AudUsuario }})
                    </span>
                    <ng-template #soloId>
                      <span>ID: {{ a.AudUsuario }}</span>
                    </ng-template>
                  </ng-container>
                  <ng-template #sinUsuario>
                    <span>Sin dato</span>
                  </ng-template>
                </td>
              </ng-container>

              <!-- Descripción resumida -->
              <ng-container matColumnDef="Descripcion">
                <th mat-header-cell *matHeaderCellDef>Detalle</th>
                <td mat-cell *matCellDef="let a">
                  <div class="descripcion-cell">
                    <div
                      class="descripcion-resumen"
                      (mouseenter)="showCustomTooltip(a.IdAuditoria, $event)"
                      (mouseleave)="hideCustomTooltip()"
                    >
                      <span>{{ getDescripcionBase(a) }}</span>
                      <span
                        *ngIf="a.descripcionEntries && a.descripcionEntries.length > 1"
                        class="campos-count"
                      >
                        (+{{ a.descripcionEntries.length - 1 }} campos)
                        <button
                          mat-icon-button
                          class="copy-icon-btn"
                          matTooltip="Copiar detalle"
                          matTooltipPosition="right"
                          (click)="copyDetalle(a, $event)"
                        >
                          <mat-icon>content_copy</mat-icon>
                        </button>
                      </span>
                    </div>
                    <!-- Tooltip personalizado con HTML -->
                    <div
                      *ngIf="visibleTooltipId === a.IdAuditoria"
                      class="custom-detalle-tooltip"
                      [class.tooltip-visible]="tooltipVisible && !tooltipHiding"
                      [class.tooltip-hiding]="tooltipHiding === a.IdAuditoria"
                      [style.left.px]="tooltipPosition.x"
                      [style.top.px]="tooltipPosition.y"
                      (mouseenter)="onTooltipMouseEnter()"
                      (mouseleave)="hideCustomTooltip()"
                    >
                      <div class="tooltip-content-html">
                        <div *ngFor="let entry of a.descripcionEntries" class="tooltip-entry">
                          <strong class="tooltip-label">{{ entry.label }}:</strong>
                          <span class="tooltip-value">{{ entry.value }}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </td>
              </ng-container>

              <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
              <tr mat-row *matRowDef="let row; columns: displayedColumns"></tr>
            </table>
          </div>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [
    `
      .card-title {
        padding: 10px 0 10px 0;
        font-size: 1.25rem;
        font-weight: 600;
        color: #1f4136;
      }

      .card-subtitle {
        padding: 0 0 28px 0;
        font-size: 1rem;
        font-weight: 400;
        color: #666;
      }

      .tab-content {
        padding: 0;
      }

      .info-card {
        box-shadow: 0 4px 15px rgba(65, 103, 89, 0.08);
        border-radius: 16px;
        border: 1px solid #e1f0ec;
        background: linear-gradient(135deg, #fdfdfd 0%, #f9fdf9 100%);
      }

      .state-container {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: 40px 16px;
        text-align: center;
        gap: 12px;
      }

      .state-container.loading p {
        margin: 0;
        color: #2d5a48;
        font-weight: 500;
      }

      .state-container.empty p {
        margin: 0;
        color: #666;
      }

      .state-container.error p {
        margin: 0;
        color: #c62828;
      }

      .full-width-table {
        width: 100%;
        overflow: visible !important;
      }

      th.mat-header-cell,
      td.mat-cell {
        padding: 8px 12px;
        overflow: visible !important;
        position: relative;
      }

      tr.mat-mdc-row {
        position: relative;
        z-index: 1;
      }

      tr.mat-mdc-row:hover {
        z-index: 2;
      }

      .accion-pill {
        display: inline-flex;
        padding: 4px 10px;
        border-radius: 999px;
        background-color: rgba(63, 104, 89, 0.1);
        color: #1f4136;
        font-weight: 600;
        font-size: 0.85rem;
      }

      .id-pill {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        min-width: 48px;
        padding: 4px 10px;
        border-radius: 999px;
        background-color: rgba(63, 104, 89, 0.1);
        color: #1f4136;
        font-weight: 600;
        font-size: 0.85rem;
      }

      .descripcion-cell {
        position: relative;
        max-width: 420px;
      }

      .descripcion-resumen {
        cursor: default;
        display: flex;
        align-items: center;
        gap: 4px;
        white-space: nowrap;
        overflow: hidden;
      }

      .campos-count {
        display: inline-flex;
        align-items: center;
        gap: 4px;
      }

      .copy-icon-btn {
        width: 20px;
        height: 20px;
        line-height: 20px;
        padding: 0;
        margin-left: 4px;
      }

      .copy-icon-btn mat-icon {
        font-size: 16px;
        width: 16px;
        height: 16px;
        line-height: 16px;
        color: #416759;
      }

      .copy-icon-btn:hover mat-icon {
        color: #1f4136;
      }

      /* Tooltip personalizado con HTML */
      .custom-detalle-tooltip {
        position: fixed;
        z-index: 10000;
        min-width: 300px;
        max-width: 420px;
        width: max-content;
        background: #ffffff;
        border-radius: 8px;
        box-shadow: 0 6px 18px rgba(0, 0, 0, 0.18);
        border: 1px solid #e0ece7;
        pointer-events: auto;
        opacity: 0;
        transform: translateY(calc(-100% + 6px)) scale(0.98);
        transition: opacity 0.2s cubic-bezier(0.16, 1, 0.3, 1),
          transform 0.2s cubic-bezier(0.16, 1, 0.3, 1);
      }

      .custom-detalle-tooltip.tooltip-visible {
        opacity: 1;
        transform: translateY(-100%) scale(1);
      }

      .custom-detalle-tooltip.tooltip-hiding {
        opacity: 0;
        transform: translateY(calc(-100% + 3px)) scale(0.98);
        transition: opacity 0.12s cubic-bezier(0.4, 0, 1, 1),
          transform 0.12s cubic-bezier(0.4, 0, 1, 1);
      }

      .tooltip-content-html {
        max-height: 360px;
        overflow-y: auto;
        padding: 10px 12px;
        font-size: 12px;
        line-height: 1.6;
        user-select: text;
        -webkit-user-select: text;
        -moz-user-select: text;
        -ms-user-select: text;
        cursor: text;
      }

      .tooltip-entry {
        margin-bottom: 6px;
        word-break: break-word;
      }

      .tooltip-entry:last-child {
        margin-bottom: 0;
      }

      .tooltip-label {
        font-weight: 700;
        color: #1f4136;
        margin-right: 4px;
      }

      .tooltip-value {
        color: #4a5a54;
      }

      /* Tooltip de detalle: permitir interacción en el panel */
      ::ng-deep .auditoria-detalle-tooltip {
        pointer-events: auto !important;
      }

      /* Contenido del tooltip: formato multilínea, fondo, scroll y texto seleccionable */
      ::ng-deep .auditoria-detalle-tooltip .mdc-tooltip__surface {
        z-index: 10000;
        white-space: pre-line;
        max-width: 420px;
        max-height: 4200px;
        overflow-y: auto;
        font-size: 12px;
        line-height: 1.4;
        padding: 10px 12px;
        border-radius: 8px;
        background: #ffffff;
        color: #1f4136;
        box-shadow: 0 6px 18px rgba(0, 0, 0, 0.18);
        border: 1px solid #e0ece7;
        user-select: text;
        -webkit-user-select: text;
        -moz-user-select: text;
        -ms-user-select: text;
        display: block;
        cursor: text;
      }
    `,
  ],
})
export class AuditoriaPropiedadTabComponent implements OnInit, OnChanges, OnDestroy {
  @Input() propiedadId: number | null = null;

  displayedColumns: string[] = ['IdAuditoria', 'AudFecha', 'Accion', 'Usuario', 'Descripcion'];

  loading = false;
  error: string | null = null;

  private allAuditorias: AuditoriaView[] = [];
  auditoriasFiltradas: AuditoriaView[] = [];

  visibleTooltipId: number | null = null;
  tooltipVisible: boolean = false;
  tooltipHiding: number | null = null;
  tooltipPosition = { x: 0, y: 0 };
  private tooltipTimeout: any;
  private hideTimeout: any;
  private showTimeout: any;

  private dataSubscription?: Subscription;

  constructor(private auditoriaService: AuditoriaService, private snackBar: MatSnackBar) {}

  ngOnInit(): void {
    if (this.propiedadId) {
      this.fetchAuditorias();
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['propiedadId'] && !changes['propiedadId'].firstChange) {
      this.fetchAuditorias();
    }
  }

  ngOnDestroy(): void {
    this.dataSubscription?.unsubscribe();
    if (this.tooltipTimeout) {
      clearTimeout(this.tooltipTimeout);
    }
    if (this.hideTimeout) {
      clearTimeout(this.hideTimeout);
    }
    if (this.showTimeout) {
      clearTimeout(this.showTimeout);
    }
  }

  showCustomTooltip(auditoriaId: number, event: MouseEvent): void {
    // Cancelar cualquier timeout pendiente
    if (this.tooltipTimeout) {
      clearTimeout(this.tooltipTimeout);
    }
    if (this.hideTimeout) {
      clearTimeout(this.hideTimeout);
    }
    if (this.showTimeout) {
      clearTimeout(this.showTimeout);
    }

    // Resetear estados
    this.tooltipHiding = null;
    this.visibleTooltipId = auditoriaId;

    // Calcular posición del tooltip (arriba del elemento)
    const target = event.target as HTMLElement;
    const rect = target.getBoundingClientRect();
    this.tooltipPosition = {
      x: rect.left,
      y: rect.top - 8,
    };

    // Pequeño delay para activar la animación de entrada (permite que el DOM se actualice)
    requestAnimationFrame(() => {
      this.showTimeout = setTimeout(() => {
        if (this.visibleTooltipId === auditoriaId) {
          this.tooltipVisible = true;
        }
      }, 5);
    });
  }

  onTooltipMouseEnter(): void {
    // Cancelar todos los timeouts de ocultación
    if (this.tooltipTimeout) {
      clearTimeout(this.tooltipTimeout);
      this.tooltipTimeout = null;
    }
    if (this.hideTimeout) {
      clearTimeout(this.hideTimeout);
      this.hideTimeout = null;
    }
    // Restaurar tooltip a visible si el mouse entró mientras se estaba ocultando
    this.tooltipHiding = null;
    this.tooltipVisible = true;
  }

  hideCustomTooltip(): void {
    // Iniciar animación de salida inmediatamente
    this.tooltipVisible = false;
    this.tooltipHiding = this.visibleTooltipId;

    // Pequeño delay solo para permitir que el mouse se mueva al tooltip sin desaparecer
    this.tooltipTimeout = setTimeout(() => {
      // Si el mouse no entró al tooltip, removerlo después de la animación
      if (this.tooltipHiding !== null) {
        this.hideTimeout = setTimeout(() => {
          this.visibleTooltipId = null;
          this.tooltipHiding = null;
        }, 130); // Duración de animación (120ms) + pequeño buffer
      }
    }, 50);
  }

  private fetchAuditorias(): void {
    if (!this.propiedadId) {
      this.auditoriasFiltradas = [];
      return;
    }

    this.loading = true;
    this.error = null;

    this.dataSubscription?.unsubscribe();
    this.dataSubscription = this.auditoriaService.getAuditorias().subscribe({
      next: (auditorias) => {
        this.allAuditorias = auditorias.map((a) => this.toViewModel(a));
        this.applyFilterForPropiedad();
        this.loading = false;
      },
      error: (err) => {
        console.error('Error al cargar auditorías:', err);
        this.error = 'Ocurrió un error al cargar la auditoría de la propiedad.';
        this.loading = false;
      },
    });
  }

  private applyFilterForPropiedad(): void {
    if (!this.propiedadId) {
      this.auditoriasFiltradas = [];
      return;
    }

    const idStr = String(this.propiedadId);
    const idLower = idStr.toLowerCase();

    this.auditoriasFiltradas = this.allAuditorias
      .filter((auditoria) => this.matchesPropiedadId(auditoria, idLower))
      .sort((a, b) => {
        const timeA = a.AudFecha ? a.AudFecha.getTime() : 0;
        const timeB = b.AudFecha ? b.AudFecha.getTime() : 0;
        return timeB - timeA; // más nuevos primero
      });
  }

  private matchesPropiedadId(auditoria: AuditoriaView, idFilter: string): boolean {
    // Primero intento buscar una entry con label que haga referencia explícita a IdPropiedadMinera
    const explicitMatch = auditoria.descripcionEntries.some((entry) => {
      const label = (entry.label || '').toLowerCase();
      const value = (entry.value || '').toLowerCase();
      const isPropiedadField =
        label.includes('idpropiedadminera') ||
        label.includes('id_propiedad_minera') ||
        label.includes('propiedadminera') ||
        label.includes('propiedad_minera');

      return isPropiedadField && value === idFilter;
    });

    if (explicitMatch) {
      return true;
    }

    // Si no hay un campo explícito, busco el id como substring en los valores de descripción
    const anyValueContainsId = auditoria.descripcionEntries.some((entry) =>
      (entry.value || '').toLowerCase().includes(idFilter)
    );

    if (anyValueContainsId) {
      return true;
    }

    // Fallback: si Descripcion era un string plano y se devolvió como un único entry "Detalle"
    // el chequeo anterior también lo toma, pero por las dudas verifico el raw Descripcion
    // (no está en el view model, así que se cubre con descripcionEntries).
    return false;
  }

  private toViewModel(raw: AuditoriaRaw): AuditoriaView {
    return {
      ...raw,
      descripcionEntries: this.parseDescripcion(raw.Descripcion),
      AudFecha: this.parseAudFecha(raw.AudFecha),
    };
  }

  private parseAudFecha(value: string | null): Date | null {
    if (!value) return null;

    if (/[zZ]$/.test(value) || /[+-]\d\d:\d\d$/.test(value)) {
      return new Date(value);
    }

    return new Date(value + 'Z');
  }

  private parseDescripcion(descripcion: string | null): AuditoriaDescripcionEntry[] {
    if (!descripcion) {
      return [];
    }

    try {
      const parsed = JSON.parse(descripcion);
      return this.flattenDescripcion(parsed);
    } catch (error) {
      console.warn('No se pudo parsear la descripción de la auditoría:', descripcion, error);
      return [
        {
          label: 'Detalle',
          value: descripcion,
        },
      ];
    }
  }

  private flattenDescripcion(value: unknown, prefix = ''): AuditoriaDescripcionEntry[] {
    if (value === null || value === undefined) {
      return [
        {
          label: this.cleanLabel(prefix) || 'Valor',
          value: 'Sin datos',
        },
      ];
    }

    if (Array.isArray(value)) {
      if (value.length === 0) {
        return [
          {
            label: this.cleanLabel(prefix) || 'Valor',
            value: '[]',
          },
        ];
      }

      return value.flatMap((item, index) =>
        this.flattenDescripcion(item, prefix ? `${prefix}[${index}]` : `[${index}]`)
      );
    }

    if (typeof value === 'object') {
      return Object.entries(value as Record<string, unknown>).flatMap(([key, val]) => {
        const newPrefix = prefix ? `${prefix}.${key}` : key;
        return this.flattenDescripcion(val, newPrefix);
      });
    }

    return [
      {
        label: this.cleanLabel(prefix) || 'Valor',
        value: String(value),
      },
    ];
  }

  private cleanLabel(label: string): string {
    return label.replace(/^(data|changes)\./i, '');
  }

  getDescripcionResumen(auditoria: AuditoriaView): string {
    if (!auditoria.descripcionEntries || auditoria.descripcionEntries.length === 0) {
      return 'Sin detalle disponible';
    }

    const first = auditoria.descripcionEntries[0];
    const base = `${first.label}: ${first.value}`;
    return auditoria.descripcionEntries.length > 1
      ? base + ` (+${auditoria.descripcionEntries.length - 1} campos)`
      : base;
  }

  getDescripcionBase(auditoria: AuditoriaView): string {
    if (!auditoria.descripcionEntries || auditoria.descripcionEntries.length === 0) {
      return 'Sin detalle disponible';
    }

    const first = auditoria.descripcionEntries[0];
    return `${first.label}: ${first.value}`;
  }

  getDescripcionCompleta(auditoria: AuditoriaView): string {
    if (!auditoria.descripcionEntries || auditoria.descripcionEntries.length === 0) {
      return 'Sin detalle disponible';
    }

    // Multilínea para que el tooltip se lea correctamente
    return auditoria.descripcionEntries.map((e) => `${e.label}: ${e.value}`).join('\n');
  }

  copyDetalle(auditoria: AuditoriaView, event: MouseEvent): void {
    event.stopPropagation();
    const text = this.getDescripcionCompleta(auditoria);

    if (navigator && 'clipboard' in navigator) {
      (navigator as any).clipboard
        .writeText(text)
        .then(() => {
          this.snackBar.open('Detalle copiado al portapapeles.', 'Cerrar', {
            duration: 2000,
          });
        })
        .catch(() => {
          this.snackBar.open('No se pudo copiar el detalle.', 'Cerrar', {
            duration: 2500,
          });
        });
    } else {
      this.snackBar.open('La copia al portapapeles no es compatible en este navegador.', 'Cerrar', {
        duration: 3000,
      });
    }
  }
}
