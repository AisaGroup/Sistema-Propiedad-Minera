import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { MatTabsModule } from '@angular/material/tabs';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDividerModule } from '@angular/material/divider';
import { MatTableModule } from '@angular/material/table';
import { MatChipsModule } from '@angular/material/chips';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { PropiedadMineraService } from '../services/propiedad-minera.service';
import { ReqMineroMovService, ReqMineroMov, ReqMineroMovCreate } from '../services/req-minero-mov.service';
import { ReqMineroService, ReqMinero } from '../services/req-minero.service';
import { TitularMineroService } from '../../titulares/services/titular.service';
import { PropiedadMinera } from '../models/propiedad-minera.model';
import { ReqMineroMovCreateComponent } from './req-minero-mov/req-minero-mov-create.component';
import { ReqMineroMovEditComponent } from './req-minero-mov/req-minero-mov-edit.component';
import { ExpedienteService } from '../../expedientes/services/expediente.service';
import { Expediente } from '../../expedientes/models/expediente.model';
import { AlertasListComponent } from '../../alertas/components/alertas-list.component';
import { ObservacionesTabComponent } from '../../observaciones/components/observaciones-tab.component';
import { ArchivosExpedienteComponent } from '../../expedientes/components/archivos/archivos-expediente.component';

@Component({
  selector: 'app-propiedad-detail',
  standalone: true,
  imports: [
    CommonModule,
    MatTabsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatDividerModule,
    MatTableModule,
    MatChipsModule,
    MatMenuModule,
    MatTooltipModule,
    ReqMineroMovCreateComponent,
    ReqMineroMovEditComponent,
    AlertasListComponent,
    ObservacionesTabComponent,
    ArchivosExpedienteComponent
  ],
  template: `
    <div class="detail-container">
      <!-- Header -->
      <div class="detail-header">
        <div class="header-content">
          <button mat-icon-button (click)="goBack()" class="back-button">
            <mat-icon>arrow_back</mat-icon>
          </button>
          <div class="header-info">
            <h1 *ngIf="propiedad">Propiedad minera {{ propiedad.Nombre || 'Propiedad Minera' }}</h1>
            <h1 *ngIf="!propiedad && !loading">Propiedad Minera</h1>
          </div>
        </div>
      </div>

      <!-- Loading -->
      <div *ngIf="loading" class="loading-container">
        <mat-spinner></mat-spinner>
        <p>Cargando datos de la propiedad...</p>
      </div>

      <!-- Content with Tabs -->
      <div *ngIf="!loading && propiedad" class="tabs-container">
        <mat-tab-group animationDuration="300ms">
          <!-- Tab 1: Datos de Propiedad Minera -->
          <mat-tab>
            <ng-template mat-tab-label>
              <mat-icon>info</mat-icon>
              Datos de Propiedad
            </ng-template>
            <div class="tab-content">
              <mat-card class="info-card">
                <mat-card-header>
                  <mat-card-title>Información General</mat-card-title>
                  <div class="spacer"></div>
                  <button mat-flat-button class="editar-prop-btn" (click)="editPropiedad()" *ngIf="propiedad">
                    <mat-icon>edit</mat-icon>
                    Editar Propiedad
                  </button>
                </mat-card-header>
                <mat-card-content>
                  <div class="info-grid">
                    <div class="info-item">
                      <label>Nombre de la Propiedad:</label>
                      <span>{{ propiedad.Nombre || 'No especificado' }}</span>
                    </div>
                    <div class="info-item">
                      <label>Titular:</label>
                      <span>{{ titularNombre || 'Cargando...' }}</span>
                    </div>
                    <div class="info-item">
                      <label>Provincia:</label>
                      <span>{{ propiedad.Provincia || 'No especificada' }}</span>
                    </div>
                    <div class="info-item">
                      <label>Área (Hectáreas):</label>
                      <span>{{ propiedad.AreaHectareas || 'No especificada' }}</span>
                    </div>
                    <div class="info-item">
                      <label>Descubrimiento Directo:</label>
                      <span>{{ propiedad.DescubrimientoDirecto || 'No especificado' }}</span>
                    </div>
                    <div class="info-item">
                      <label>Referente:</label>
                      <span>{{ propiedad.Referente === true ? 'Sí' : propiedad.Referente === false ? 'No' : 'No especificado' }}</span>
                    </div>
                  </div>
                </mat-card-content>
              </mat-card>

              <mat-card class="info-card">
                <mat-card-header>
                  <mat-card-title>Fechas Importantes</mat-card-title>
                </mat-card-header>
                <mat-card-content>
                  <div class="info-grid">
                    <div class="info-item">
                      <label>Fecha de Solicitud:</label>
                      <span>{{ formatDate(propiedad.Solicitud) }}</span>
                    </div>
                    <div class="info-item">
                      <label>Fecha de Registro:</label>
                      <span>{{ formatDate(propiedad.Registro) }}</span>
                    </div>
                    <div class="info-item">
                      <label>Fecha de Notificación:</label>
                      <span>{{ formatDate(propiedad.Notificacion) }}</span>
                    </div>
                    <div class="info-item">
                      <label>Fecha de Mensura:</label>
                      <span>{{ formatDate(propiedad.Mensura) }}</span>
                    </div>
                  </div>
                </mat-card-content>
              </mat-card>
            </div>
          </mat-tab>

          <!-- Tab 2: Requerimientos Mineros -->
          <mat-tab>
            <ng-template mat-tab-label>
              <mat-icon>assignment</mat-icon>
              Requerimientos Mineros
            </ng-template>
            <div class="tab-content">
              <!-- Formulario de creación (solo si está activo) -->
              <div *ngIf="mostrandoFormularioCreacion" class="formulario-container">
                <app-req-minero-mov-create 
                  [idPropiedadMinera]="propiedadId"
                  (create)="onCrearRequerimiento($event)"
                  (cancelar)="ocultarFormularioCreacion()">
                </app-req-minero-mov-create>
              </div>

              <!-- Formulario de edición (solo si está activo) -->
              <div *ngIf="mostrandoFormularioEdicion && requerimientoEnEdicion" class="formulario-container">
                <app-req-minero-mov-edit 
                  [reqMineroMov]="requerimientoEnEdicion"
                  (update)="onActualizarRequerimiento($event)"
                  (cancelar)="ocultarFormularioEdicion()">
                </app-req-minero-mov-edit>
              </div>

              <!-- Lista de requerimientos (solo si no hay formularios activos) -->
              <mat-card class="info-card" *ngIf="!mostrandoFormularioCreacion && !mostrandoFormularioEdicion">
                <mat-card-header>
                  <mat-card-title>Requerimientos Mineros</mat-card-title>
                  <mat-card-subtitle>Documentos y requisitos de la propiedad minera</mat-card-subtitle>
                  <div class="spacer"></div>
                  <button mat-flat-button 
                          class="editar-prop-btn"
                          (click)="mostrarFormularioCreacion()"
                          *ngIf="!mostrandoFormularioCreacion && !mostrandoFormularioEdicion">
                    <mat-icon>add</mat-icon>
                    Nuevo Requerimiento
                  </button>
                </mat-card-header>
                <mat-card-content>
                  <!-- Loading de requerimientos -->
                  <div *ngIf="loadingRequerimientos" class="loading-requerimientos">
                    <mat-spinner diameter="40"></mat-spinner>
                    <p>Cargando requerimientos...</p>
                  </div>

                  <!-- Tabla de requerimientos -->
                  <div *ngIf="!loadingRequerimientos" class="requerimientos-table">
                    <table mat-table [dataSource]="requerimientos" class="full-width-table">
                      <!-- Columna Fecha Inicio -->
                      <ng-container matColumnDef="fechaInicio">
                        <th mat-header-cell *matHeaderCellDef>Desde</th>
                        <td mat-cell *matCellDef="let req">
                          {{ req.FechaInicio ? (req.FechaInicio | date:'dd/MM/yyyy') : '-' }}
                        </td>
                      </ng-container>

                      <!-- Columna Fecha Fin -->
                      <ng-container matColumnDef="fechaFin">
                        <th mat-header-cell *matHeaderCellDef>Hasta</th>
                        <td mat-cell *matCellDef="let req">
                          {{ req.FechaFin ? (req.FechaFin | date:'dd/MM/yyyy') : '-' }}
                        </td>
                      </ng-container>

                      <!-- Columna Nombre Requerimiento Minero -->
                      <ng-container matColumnDef="nombreReqMinero">
                        <th mat-header-cell *matHeaderCellDef>Tipo de Requerimiento</th>
                        <td mat-cell *matCellDef="let req">
                          {{ req.IdReqMinero ? getTipoRequerimientoNombre(req.IdReqMinero) : 'Sin tipo especificado' }}
                        </td>
                      </ng-container>

                      <!-- Columna Descripción -->
                      <ng-container matColumnDef="descripcion">
                        <th mat-header-cell *matHeaderCellDef>Descripción</th>
                        <td mat-cell *matCellDef="let req">
                          {{ req.Descripcion || 'Sin descripción' }}
                        </td>
                      </ng-container>

                      <!-- Columna Importe (solo si es Canon) -->
                      <ng-container matColumnDef="importe">
                        <th mat-header-cell *matHeaderCellDef>Importe</th>
                        <td mat-cell *matCellDef="let req">
                          <span *ngIf="getTipoRequerimientoNombre(req.IdReqMinero) === 'Canon' && req.Importe">
                            {{ formatCurrency(req.Importe) }}
                          </span>
                          <span *ngIf="getTipoRequerimientoNombre(req.IdReqMinero) !== 'Canon' || !req.Importe">-</span>
                        </td>
                      </ng-container>

                      <!-- Columna Acciones -->
                      <ng-container matColumnDef="acciones">
                        <th mat-header-cell *matHeaderCellDef>Acciones</th>
                        <td mat-cell *matCellDef="let req">
                          <button mat-icon-button [matMenuTriggerFor]="reqMenu" 
                                  [matMenuTriggerData]="{requerimiento: req}">
                            <mat-icon>more_vert</mat-icon>
                          </button>
                        </td>
                      </ng-container>

                      <tr mat-header-row *matHeaderRowDef="requerimientosColumns"></tr>
                      <tr mat-row *matRowDef="let row; columns: requerimientosColumns;"></tr>
                    </table>

                    <!-- Mensaje si no hay requerimientos -->
                    <div *ngIf="requerimientos.length === 0" class="no-requerimientos">
                      <mat-icon>assignment</mat-icon>
                      <h3>No hay requerimientos registrados</h3>
                      <p>Aún no se han agregado requerimientos para esta propiedad minera.</p>
                    </div>
                  </div>

                  <!-- Paginación personalizada de requerimientos -->
                  <div class="custom-pagination" *ngIf="requerimientosTotal > 0">
                    <div class="page-size-selector">
                      <span>Mostrar:</span>
                      <button mat-button [class.active]="requerimientosPageSize === 5" (click)="changeRequerimientosPageSize(5)">5</button>
                      <button mat-button [class.active]="requerimientosPageSize === 10" (click)="changeRequerimientosPageSize(10)">10</button>
                      <button mat-button [class.active]="requerimientosPageSize === 25" (click)="changeRequerimientosPageSize(25)">25</button>
                    </div>

                    <div class="pagination-info">
                      {{ (requerimientosCurrentPage * requerimientosPageSize) + 1 }} - {{ Math.min((requerimientosCurrentPage + 1) * requerimientosPageSize, requerimientosTotal) }} de {{ requerimientosTotal }}
                    </div>

                    <div class="pagination-controls">
                      <button mat-icon-button [disabled]="requerimientosCurrentPage === 0" (click)="firstRequerimientosPage()" matTooltip="Primera página">
                        <mat-icon>first_page</mat-icon>
                      </button>
                      <button mat-icon-button [disabled]="requerimientosCurrentPage === 0" (click)="previousRequerimientosPage()" matTooltip="Anterior">
                        <mat-icon>chevron_left</mat-icon>
                      </button>
                      <span class="page-number">Página {{ requerimientosCurrentPage + 1 }} de {{ requerimientosTotalPages }}</span>
                      <button mat-icon-button [disabled]="requerimientosCurrentPage >= requerimientosTotalPages - 1" (click)="nextRequerimientosPage()" matTooltip="Siguiente">
                        <mat-icon>chevron_right</mat-icon>
                      </button>
                      <button mat-icon-button [disabled]="requerimientosCurrentPage >= requerimientosTotalPages - 1" (click)="lastRequerimientosPage()" matTooltip="Última página">
                        <mat-icon>last_page</mat-icon>
                      </button>
                    </div>
                  </div>
                </mat-card-content>
              </mat-card>
            </div>
          </mat-tab>

          <!-- Tab 3: Expediente -->
          <mat-tab>
            <ng-template mat-tab-label>
              <mat-icon>folder_open</mat-icon>
              Expedientes
            </ng-template>
            <div class="tab-content">
              <mat-card class="info-card">
                <mat-card-header>
                  <mat-card-title>Expedientes de la Propiedad Minera</mat-card-title>
                </mat-card-header>
                <mat-card-content>
                  <div *ngIf="loadingExpedientes">
                    <mat-spinner></mat-spinner>
                    <p>Cargando expedientes...</p>
                  </div>
                  <table mat-table [dataSource]="expedientesPaged" *ngIf="!loadingExpedientes && expedientes.length > 0" class="full-width-table">
                    <ng-container matColumnDef="codigo">
                      <th mat-header-cell *matHeaderCellDef>Código</th>
                      <td mat-cell *matCellDef="let exp">{{ exp.CodigoExpediente }}</td>
                    </ng-container>
                    <ng-container matColumnDef="caratula">
                      <th mat-header-cell *matHeaderCellDef>Carátula</th>
                      <td mat-cell *matCellDef="let exp">{{ exp.Caratula }}</td>
                    </ng-container>
                    <ng-container matColumnDef="estado">
                      <th mat-header-cell *matHeaderCellDef>Estado</th>
                      <td mat-cell *matCellDef="let exp">{{ exp.Estado }}</td>
                    </ng-container>
                    <ng-container matColumnDef="ano">
                      <th mat-header-cell *matHeaderCellDef>Año</th>
                      <td mat-cell *matCellDef="let exp">{{ exp.Ano }}</td>
                    </ng-container>
                    <tr mat-header-row *matHeaderRowDef="expedientesColumns"></tr>
                    <tr mat-row *matRowDef="let row; columns: expedientesColumns;" (click)="irADetalleExpediente(row)" style="cursor:pointer"></tr>
                  </table>
                  
                  <!-- Paginación personalizada de expedientes -->
                  <div class="custom-pagination" *ngIf="!loadingExpedientes && expedientesTotal > 0">
                    <div class="page-size-selector">
                      <span>Mostrar:</span>
                      <button mat-button [class.active]="expedientesPageSize === 5" (click)="changeExpedientesPageSize(5)">5</button>
                      <button mat-button [class.active]="expedientesPageSize === 10" (click)="changeExpedientesPageSize(10)">10</button>
                      <button mat-button [class.active]="expedientesPageSize === 25" (click)="changeExpedientesPageSize(25)">25</button>
                    </div>

                    <div class="pagination-info">
                      {{ (expedientesCurrentPage * expedientesPageSize) + 1 }} - {{ Math.min((expedientesCurrentPage + 1) * expedientesPageSize, expedientesTotal) }} de {{ expedientesTotal }}
                    </div>

                    <div class="pagination-controls">
                      <button mat-icon-button [disabled]="expedientesCurrentPage === 0" (click)="firstExpedientesPage()" matTooltip="Primera página">
                        <mat-icon>first_page</mat-icon>
                      </button>
                      <button mat-icon-button [disabled]="expedientesCurrentPage === 0" (click)="previousExpedientesPage()" matTooltip="Anterior">
                        <mat-icon>chevron_left</mat-icon>
                      </button>
                      <span class="page-number">Página {{ expedientesCurrentPage + 1 }} de {{ expedientesTotalPages }}</span>
                      <button mat-icon-button [disabled]="expedientesCurrentPage >= expedientesTotalPages - 1" (click)="nextExpedientesPage()" matTooltip="Siguiente">
                        <mat-icon>chevron_right</mat-icon>
                      </button>
                      <button mat-icon-button [disabled]="expedientesCurrentPage >= expedientesTotalPages - 1" (click)="lastExpedientesPage()" matTooltip="Última página">
                        <mat-icon>last_page</mat-icon>
                      </button>
                    </div>
                  </div>
                  
                  <div *ngIf="!loadingExpedientes && expedientes.length === 0">
                    <mat-icon>assignment</mat-icon>
                    <h3>No hay expedientes registrados para esta propiedad minera.</h3>
                  </div>
                </mat-card-content>
              </mat-card>
            </div>
          </mat-tab>

          <!-- Tab 4: Alertas -->
          <mat-tab>
            <ng-template mat-tab-label>
              <mat-icon>notifications</mat-icon>
              Alertas
            </ng-template>
            <div class="tab-content">
              <mat-card class="info-card">
                <mat-card-header>
                  <mat-card-title>Alertas asociadas a la propiedad minera</mat-card-title>
                </mat-card-header>
                <mat-card-content>
                  <app-alertas-list [idTransaccion]="propiedad.IdTransaccion ?? null"></app-alertas-list>
                </mat-card-content>
              </mat-card>
            </div>
          </mat-tab>

          <!-- Tab 5: Observaciones -->
          <mat-tab>
            <ng-template mat-tab-label>
              <mat-icon>note</mat-icon>
              Observaciones
            </ng-template>
            <div class="tab-content">
              <mat-card class="info-card">
                <mat-card-header>
                  <mat-card-title>Observaciones asociadas a la propiedad minera</mat-card-title>
                </mat-card-header>
                <mat-card-content>
                  <app-observaciones-tab [idTransaccion]="propiedad.IdTransaccion ?? null"></app-observaciones-tab>
                </mat-card-content>
              </mat-card>
            </div>
          </mat-tab>

          <!-- Tab 6: Archivos -->
          <mat-tab>
            <ng-template mat-tab-label>
              <mat-icon>attach_file</mat-icon>
              Archivos
            </ng-template>
            <div class="tab-content">
              <mat-card class="info-card">
                <mat-card-header>
                  <mat-card-title>Archivos asociados a la propiedad minera</mat-card-title>
                </mat-card-header>
                <mat-card-content>
                  <app-archivos-expediente [idEntidad]="propiedad.IdTransaccion ?? 0" [entidad]="'propiedad-minera'"></app-archivos-expediente>
                </mat-card-content>
              </mat-card>
            </div>
          </mat-tab>
        </mat-tab-group>
      </div>

      <!-- Menú de acciones para requerimientos -->
      <mat-menu #reqMenu="matMenu">
        <ng-template matMenuContent let-requerimiento="requerimiento">
          <button mat-menu-item (click)="editarRequerimiento(requerimiento)">
            <mat-icon>edit</mat-icon>
            <span>Editar</span>
          </button>
          <button mat-menu-item (click)="verDetalleRequerimiento(requerimiento)">
            <mat-icon>visibility</mat-icon>
            <span>Ver Detalle</span>
          </button>
          <button mat-menu-item (click)="eliminarRequerimiento(requerimiento)">
            <mat-icon>delete</mat-icon>
            <span>Eliminar</span>
          </button>
        </ng-template>
      </mat-menu>

      <!-- Error State -->
      <div *ngIf="!loading && !propiedad" class="error-container">
        <mat-icon color="warn">error</mat-icon>
        <h2>Propiedad no encontrada</h2>
        <p>No se pudo cargar la información de la propiedad minera.</p>
        <button mat-raised-button color="primary" (click)="goBack()">
          Volver al listado
        </button>
      </div>
    </div>
  `,
  styles: [`
    .detail-container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 24px;
    }

    .detail-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 32px;
      padding-bottom: 16px;
      border-bottom: 2px solid #e0e0e0;
    }

    .header-content {
      display: flex;
      align-items: center;
      gap: 16px;
    }

    .back-button {
      color: #666;
    }

    .header-info h1 {
      margin: 0;
      color: #000000;
      font-size: 1.8rem;
      font-weight: 500;
    }

    .subtitle {
      margin: 4px 0 0 0;
      color: #666;
      font-size: 0.9rem;
    }

    .header-actions {
      display: flex;
      gap: 12px;
    }

    .loading-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 80px 20px;
      text-align: center;
      background: linear-gradient(135deg, #f8fffe 0%, #f1f8f6 100%);
      border-radius: 16px;
      border: 1px solid #e1f0ec;
      margin: 20px;
      box-shadow: 0 4px 15px rgba(65, 103, 89, 0.08);
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    }

    .loading-container:hover {
      box-shadow: 0 8px 25px rgba(65, 103, 89, 0.12);
      transform: translateY(-2px);
    }

    .loading-container p {
      margin-top: 16px;
      color: #2d5a48;
      font-weight: 500;
      font-size: 1.1rem;
    }

    .tabs-container {
      background: #fff;
      border-radius: 12px;
      box-shadow: 0 4px 15px rgba(65, 103, 89, 0.08);
      border: 1px solid #e1f0ec;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      overflow: hidden;
    }

    .tabs-container:hover {
      box-shadow: 0 8px 25px rgba(65, 103, 89, 0.12);
    }

    /* Estilos personalizados para mat-tab-group */
    .tabs-container ::ng-deep .mat-mdc-tab-labels {
      background: #f5f7f6;
      border-radius: 8px 8px 0 0;
    }

    .tabs-container ::ng-deep .mat-mdc-tab {
      color: #416759 !important;
      font-weight: 500;
      font-size: 16px;
      opacity: 1 !important;
    }

    .tabs-container ::ng-deep .mat-mdc-tab:hover {
      background: #e8f0ec;
    }

    .tabs-container ::ng-deep .mat-mdc-tab.mdc-tab--active {
      background: #fff;
      color: #416759 !important;
    }

    .tabs-container ::ng-deep .mat-mdc-tab .mdc-tab__text-label {
      color: #416759;
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .tabs-container ::ng-deep .mat-mdc-tab-label-container {
      background: #f5f7f6;
    }

    .tabs-container ::ng-deep .mdc-tab-indicator__content--underline {
      border-color: #416759 !important;
      border-width: 3px;
    }

    .tabs-container ::ng-deep .mat-mdc-tab-body-wrapper {
      background: #fff;
      border-radius: 0 0 8px 8px;
    }

    .tab-content {
      padding: 24px;
      min-height: 400px;
    }

    .formulario-container {
      margin-bottom: 24px;
    }

    .info-card {
      margin-bottom: 24px;
      box-shadow: 0 4px 15px rgba(65, 103, 89, 0.08);
      border-radius: 16px;
      border: 1px solid #e1f0ec;
      background: linear-gradient(135deg, #fdfdfd 0%, #f9fdf9 100%);
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      overflow: hidden;
    }

    .info-card:hover {
      box-shadow: 0 8px 25px rgba(65, 103, 89, 0.12);
      transform: translateY(-2px);
    }

    .info-card mat-card-header {
      display: flex !important;
      align-items: center;
      justify-content: space-between;
    }

    .info-card mat-card-header button {
      z-index: 10;
      pointer-events: auto;
    }

    .btn-nuevo-requerimiento {
      cursor: pointer !important;
      user-select: none;
    }

    .spacer {
      flex: 1;
    }

    .info-card:last-child {
      margin-bottom: 0;
    }

    .info-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 20px;
      margin-top: 20px;
    }

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

    /* Estilos modernos para botones */
    button[mat-raised-button] {
      background: linear-gradient(135deg, #416759 0%, #5a8070 100%) !important;
      border-radius: 12px !important;
      padding: 12px 20px !important;
      font-weight: 600 !important;
      text-transform: uppercase !important;
      letter-spacing: 0.5px !important;
      box-shadow: 0 4px 15px rgba(65, 103, 89, 0.25) !important;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
      border: none !important;
    }

    button[mat-raised-button]:hover {
      transform: translateY(-2px) !important;
      box-shadow: 0 8px 25px rgba(65, 103, 89, 0.35) !important;
    }

    button[mat-raised-button] mat-icon {
      margin-right: 8px;
    }

    .back-button {
      color: #416759 !important;
      background: rgba(65, 103, 89, 0.1) !important;
      border-radius: 50% !important;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
    }

    .back-button:hover {
      background: rgba(65, 103, 89, 0.2) !important;
      transform: translateX(-2px) !important;
    }

    .requerimientos-container {
      margin-top: 16px;
    }

    .requerimiento-item {
      display: flex;
      align-items: flex-start;
      gap: 16px;
      padding: 16px 0;
    }

    .requerimiento-info {
      flex: 1;
    }

    .requerimiento-info h4 {
      margin: 0 0 8px 0;
      color: #333;
      font-size: 1.1rem;
    }

    .requerimiento-info p {
      margin: 0 0 8px 0;
      color: #666;
      font-size: 0.9rem;
    }

    .status {
      padding: 4px 12px;
      border-radius: 16px;
      font-size: 0.8rem;
      font-weight: 500;
      text-transform: uppercase;
    }

    .status.completed {
      background: #e8f5e8;
      color: #2e7d32;
    }

    .status.pending {
      background: #fff3e0;
      color: #f57c00;
    }

    .status.in-progress {
      background: #e3f2fd;
      color: #1976d2;
    }



    .loading-requerimientos {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 40px;
      text-align: center;
    }

    .loading-requerimientos p {
      margin-top: 16px;
      color: #666;
    }

    .requerimientos-table {
      margin-top: 16px;
    }

    .requerimientos-table table.full-width-table {
      width: 100%;
      border-collapse: separate;
      border-spacing: 0;
    }
    .requerimientos-table th, .requerimientos-table td {
      border-right: 1px solid #888;
      padding: 8px 12px;
    }
    .requerimientos-table tr {
      border-bottom: 1px solid #888;
    }
    .requerimientos-table th {
      background: #f5f5f5;
      font-weight: 600;
      text-align: left;
    }
    .requerimientos-table tr {
      border-bottom: 1px solid #e0e0e0;
    }
    .requerimientos-table tr:last-child {
      border-bottom: none;
    }
    .importe {
      font-weight: bold;
      color: #2e7d32;
    }
    .no-importe {
      color: #aaa;
    }
    .full-width-table {
      width: 100%;
    }
    .error-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 80px 20px;
      text-align: center;
    }

    .error-container mat-icon {
      font-size: 48px;
      width: 48px;
      height: 48px;
      margin-bottom: 16px;
    }

    .error-container h2 {
      margin: 0 0 8px 0;
      color: #666;
    }

    .error-container p {
      margin: 0 0 24px 0;
      color: #999;
    }

    /* Responsive */
    @media (max-width: 768px) {
      .detail-container {
        padding: 16px;
      }

      .detail-header {
        flex-direction: column;
        gap: 16px;
        align-items: flex-start;
      }

      .header-content {
        width: 100%;
      }

      .header-actions {
        width: 100%;
        justify-content: flex-end;
      }

      .info-grid {
        grid-template-columns: 1fr;
      }
    }

    .editar-prop-btn {
      background: #fff !important;
      color: #219653 !important;
      border: 2px solid #219653 !important;
      box-shadow: none !important;
      opacity: 1 !important;
      filter: none !important;
      font-weight: 700;
    }
    .editar-prop-btn mat-icon {
      color: #219653 !important;
    }
    .editar-prop-btn:hover,
    .editar-prop-btn:focus {
      background: #e8f5e9 !important;
      color: #17693b !important;
      border-color: #17693b !important;
      box-shadow: 0 0 0 2px #e8f5e9 !important;
    }

    .mat-column-importe {
      min-width: 120px;
      max-width: 200px;
      white-space: nowrap;
    }

    /* Estilos de paginación personalizada */
    .custom-pagination {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 16px;
      background: #fafafa;
      border-top: 1px solid #e0e0e0;
      margin-top: 8px;
    }
    .page-size-selector {
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .page-size-selector span {
      font-size: 14px;
      color: #666;
    }
    .page-size-selector button {
      min-width: 40px;
      height: 32px;
      line-height: 32px;
      padding: 0 8px;
      font-size: 13px;
      color: #666;
    }
    .page-size-selector button.active {
      background-color: #416759;
      color: white;
    }
    .pagination-info {
      font-size: 14px;
      color: #666;
    }
    .pagination-controls {
      display: flex;
      align-items: center;
      gap: 4px;
    }
    .page-number {
      margin: 0 8px;
      font-size: 14px;
      color: #333;
    }
  `]
})
export class PropiedadDetailComponent implements OnInit {
  propiedad: PropiedadMinera | null = null;
  loading = true;
  propiedadId: number | null = null;
  titularNombre: string = '';
  
  // Requerimientos
  requerimientos: ReqMineroMov[] = [];
  loadingRequerimientos = false;
  requerimientosColumns: string[] = [
    'fechaInicio',
    'fechaFin',
    'nombreReqMinero',
    'descripcion',
    'importe',
    'acciones'
  ];
  requerimientosTotal = 0;
  requerimientosPageSize = 10;
  requerimientosCurrentPage = 0;
  
  // Para usar Math en el template
  Math = Math;
  
  // Getter para calcular total de páginas de requerimientos
  get requerimientosTotalPages(): number {
    return Math.ceil(this.requerimientosTotal / this.requerimientosPageSize);
  }
  
  // Lista de tipos de requerimientos para hacer el mapeo
  tiposRequerimientos: ReqMinero[] = [];

  // Estados de formularios
  mostrandoFormularioCreacion = false;
  mostrandoFormularioEdicion = false;
  requerimientoEnEdicion: ReqMineroMov | null = null;

  // Expedientes
  expedientes: Expediente[] = [];
  expedientesPaged: Expediente[] = [];
  expedientesColumns: string[] = ['codigo', 'caratula', 'estado', 'ano'];
  loadingExpedientes = false;
  expedientesTotal = 0;
  expedientesPageSize = 10;
  expedientesCurrentPage = 0;
  
  // Getter para calcular total de páginas de expedientes
  get expedientesTotalPages(): number {
    return Math.ceil(this.expedientesTotal / this.expedientesPageSize);
  }

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private propiedadService: PropiedadMineraService,
    private reqMineroMovService: ReqMineroMovService,
    private reqMineroService: ReqMineroService,
    private titularService: TitularMineroService,
    private expedienteService: ExpedienteService
  ) {}

  ngOnInit() {
    // Cargar tipos de requerimientos primero
    this.cargarTiposRequerimientos();
    
    this.route.params.subscribe(params => {
      this.propiedadId = +params['id'];
      if (this.propiedadId) {
        this.loadPropiedad(this.propiedadId);
      } else {
        this.loading = false;
      }
    });
  }

  loadPropiedad(id: number) {
    this.loading = true;
    this.propiedadService.getPropiedadById(id).subscribe({
      next: (propiedad: PropiedadMinera) => {
        this.propiedad = propiedad;
        this.loading = false;
        // Cargar requerimientos cuando se carga la propiedad
        this.loadRequerimientos(id);
        // Cargar nombre del titular
        if (propiedad.IdTitular) {
          this.cargarTitular(propiedad.IdTitular);
        }
        // Cargar expedientes
        this.cargarExpedientes();
      },
      error: (error: any) => {
        console.error('Error al cargar propiedad:', error);
        this.loading = false;
      }
    });
  }

  loadRequerimientos(idPropiedadMinera: number, page: number = this.requerimientosCurrentPage, size: number = this.requerimientosPageSize) {
    this.loadingRequerimientos = true;
    const skip = page * size;
    const limit = size;
    this.reqMineroMovService.getReqMineroMovsByPropiedad(idPropiedadMinera, skip, limit).subscribe({
      next: (result) => {
        this.requerimientos = result.data;
        this.requerimientosTotal = result.total;
        this.loadingRequerimientos = false;
      },
      error: (error: any) => {
        console.error('Error al cargar requerimientos:', error);
        this.requerimientos = [];
        this.requerimientosTotal = 0;
        this.loadingRequerimientos = false;
      }
    });
  }

  // Métodos de paginación personalizada para requerimientos
  changeRequerimientosPageSize(size: number): void {
    this.requerimientosPageSize = size;
    this.requerimientosCurrentPage = 0;
    if (this.propiedadId) {
      this.loadRequerimientos(this.propiedadId, this.requerimientosCurrentPage, this.requerimientosPageSize);
    }
  }

  firstRequerimientosPage(): void {
    this.requerimientosCurrentPage = 0;
    if (this.propiedadId) {
      this.loadRequerimientos(this.propiedadId, this.requerimientosCurrentPage, this.requerimientosPageSize);
    }
  }

  previousRequerimientosPage(): void {
    if (this.requerimientosCurrentPage > 0) {
      this.requerimientosCurrentPage--;
      if (this.propiedadId) {
        this.loadRequerimientos(this.propiedadId, this.requerimientosCurrentPage, this.requerimientosPageSize);
      }
    }
  }

  nextRequerimientosPage(): void {
    if (this.requerimientosCurrentPage < this.requerimientosTotalPages - 1) {
      this.requerimientosCurrentPage++;
      if (this.propiedadId) {
        this.loadRequerimientos(this.propiedadId, this.requerimientosCurrentPage, this.requerimientosPageSize);
      }
    }
  }

  lastRequerimientosPage(): void {
    this.requerimientosCurrentPage = this.requerimientosTotalPages - 1;
    if (this.propiedadId) {
      this.loadRequerimientos(this.propiedadId, this.requerimientosCurrentPage, this.requerimientosPageSize);
    }
  }

  cargarTitular(idTitular: number) {
    this.titularService.getAll().subscribe({
      next: (titulares) => {
        const titular = titulares.find(t => t.IdTitular === idTitular);
        this.titularNombre = titular ? titular.Nombre : 'Titular no encontrado';
      },
      error: () => {
        this.titularNombre = 'Error al cargar titular';
      }
    });
  }

  private cargarTiposRequerimientos(): void {
    this.reqMineroService.getReqMineros().subscribe({
      next: (response: {data: ReqMinero[], total: number}) => {
        this.tiposRequerimientos = response.data || [];
        console.log('Tipos de requerimientos cargados:', this.tiposRequerimientos);
      },
      error: (error: any) => {
        console.error('Error al cargar tipos de requerimientos:', error);
      }
    });
  }

  getTipoRequerimientoNombre(idReqMinero: number): string {
    if (!idReqMinero) {
      return 'ID no disponible';
    }
    
    console.log('Buscando tipo para ID:', idReqMinero);
    console.log('Tipos disponibles:', this.tiposRequerimientos);
    
    const tipo = this.tiposRequerimientos.find(t => t.IdReqMinero === idReqMinero);
    console.log('Tipo encontrado:', tipo);
    
    return tipo?.Tipo || `No especificado (ID: ${idReqMinero})`;
  }

  formatDate(date: Date | string | null | undefined): string {
    if (!date) return 'No especificada';
    
    try {
      const dateObj = typeof date === 'string' ? new Date(date) : date;
      return dateObj.toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch {
      return 'Fecha inválida';
    }
  }

  formatCurrency(amount: number): string {
    // Formatea el número en formato argentino: puntos para miles, coma para decimales, siempre dos decimales
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount).replace(/\s/, '');
  }

  // Métodos para manejar formularios
  mostrarFormularioCreacion() {
    console.log('mostrarFormularioCreacion called'); // Debug
    this.mostrandoFormularioCreacion = true;
    this.mostrandoFormularioEdicion = false;
    this.requerimientoEnEdicion = null;
  }

  ocultarFormularioCreacion() {
    this.mostrandoFormularioCreacion = false;
  }

  mostrarFormularioEdicion(requerimiento: ReqMineroMov) {
    this.mostrandoFormularioCreacion = false;
    this.mostrandoFormularioEdicion = true;
    this.requerimientoEnEdicion = { ...requerimiento };
  }

  ocultarFormularioEdicion() {
    this.mostrandoFormularioEdicion = false;
    this.requerimientoEnEdicion = null;
  }

  onCrearRequerimiento(reqData: ReqMineroMovCreate) {
    if (!this.propiedadId) return;

    this.reqMineroMovService.createReqMineroMovForPropiedad(this.propiedadId, reqData).subscribe({
      next: (response) => {
        console.log('Requerimiento creado exitosamente:', response);
        this.ocultarFormularioCreacion();
        this.loadRequerimientos(this.propiedadId!);
      },
      error: (error) => {
        console.error('Error al crear requerimiento:', error);
        alert('Error al crear el requerimiento. Por favor, intente nuevamente.');
      }
    });
  }

  onActualizarRequerimiento(reqData: Partial<ReqMineroMovCreate>) {
    if (!this.requerimientoEnEdicion?.IdReqMineroMov) return;

    this.reqMineroMovService.updateReqMineroMov(this.requerimientoEnEdicion.IdReqMineroMov, reqData).subscribe({
      next: (response) => {
        console.log('Requerimiento actualizado exitosamente:', response);
        this.ocultarFormularioEdicion();
        this.loadRequerimientos(this.propiedadId!);
      },
      error: (error) => {
        console.error('Error al actualizar requerimiento:', error);
        alert('Error al actualizar el requerimiento. Por favor, intente nuevamente.');
      }
    });
  }

  // Cargar expedientes relacionados con la propiedad minera
  cargarExpedientes(): void {
    if (!this.propiedadId) return;
    this.loadingExpedientes = true;
    this.expedienteService.getExpedientesPorPropiedadMinera(this.propiedadId).subscribe({
      next: (data) => {
        this.expedientes = data;
        this.expedientesTotal = data.length;
        this.setExpedientesPaged();
        this.loadingExpedientes = false;
      },
      error: () => {
        this.expedientes = [];
        this.expedientesTotal = 0;
        this.setExpedientesPaged();
        this.loadingExpedientes = false;
      }
    });
  }

  setExpedientesPaged(): void {
    const start = this.expedientesCurrentPage * this.expedientesPageSize;
    const end = start + this.expedientesPageSize;
    this.expedientesPaged = this.expedientes.slice(start, end);
  }

  // Métodos de paginación personalizada para expedientes
  changeExpedientesPageSize(size: number): void {
    this.expedientesPageSize = size;
    this.expedientesCurrentPage = 0;
    this.setExpedientesPaged();
  }

  firstExpedientesPage(): void {
    this.expedientesCurrentPage = 0;
    this.setExpedientesPaged();
  }

  previousExpedientesPage(): void {
    if (this.expedientesCurrentPage > 0) {
      this.expedientesCurrentPage--;
      this.setExpedientesPaged();
    }
  }

  nextExpedientesPage(): void {
    if (this.expedientesCurrentPage < this.expedientesTotalPages - 1) {
      this.expedientesCurrentPage++;
      this.setExpedientesPaged();
    }
  }

  lastExpedientesPage(): void {
    this.expedientesCurrentPage = this.expedientesTotalPages - 1;
    this.setExpedientesPaged();
  }

  // Métodos para acciones de requerimientos
  agregarRequerimiento() {
    this.mostrarFormularioCreacion();
  }

  editarRequerimiento(requerimiento: ReqMineroMov) {
    this.mostrarFormularioEdicion(requerimiento);
  }

  verDetalleRequerimiento(requerimiento: ReqMineroMov) {
    console.log('Ver detalle requerimiento:', requerimiento);
    // TODO: Implementar modal de detalle
    alert(`Detalle requerimiento: ${requerimiento.Descripcion}`);
  }

  eliminarRequerimiento(requerimiento: ReqMineroMov) {
    if (confirm(`¿Está seguro de que desea eliminar el requerimiento "${requerimiento.Descripcion}"?`)) {
      this.reqMineroMovService.deleteReqMineroMov(requerimiento.IdReqMineroMov).subscribe({
        next: () => {
          console.log('Requerimiento eliminado correctamente');
          // Recargar la lista de requerimientos
          if (this.propiedadId) {
            this.loadRequerimientos(this.propiedadId);
          }
        },
        error: (error: any) => {
          console.error('Error al eliminar requerimiento:', error);
          alert('Error al eliminar el requerimiento');
        }
      });
    }
  }

  exportarRequerimientos() {
    console.log('Exportar requerimientos');
    // TODO: Implementar exportación
    alert('Función de exportar requerimientos - Por implementar');
  }

  recargarRequerimientos() {
    if (this.propiedadId) {
      this.loadRequerimientos(this.propiedadId);
    }
  }

  goBack() {
    this.router.navigate(['/propiedades']);
  }

  editPropiedad() {
    if (this.propiedadId) {
      this.router.navigate(['/propiedades', this.propiedadId, 'editar']);
    }
  }

  irADetalleExpediente(expediente: Expediente): void {
    this.router.navigate(['/expedientes', expediente.IdExpediente]);
  }
}
