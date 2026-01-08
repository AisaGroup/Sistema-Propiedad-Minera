import { Component, OnInit, ViewChildren, QueryList, ElementRef, AfterViewInit } from '@angular/core';
import { trigger, state, style, animate, transition } from '@angular/animations';
import { Location } from '@angular/common';
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
import { MatSnackBar } from '@angular/material/snack-bar';

import { ReqMineroMovService, ReqMineroMov } from '../../services/req-minero-mov.service';
import { ObservacionesTabComponent } from '../../../observaciones/components/observaciones-tab.component';
import { ArchivosExpedienteComponent } from '../../../expedientes/components/archivos/archivos-expediente.component';
import { AlertasListComponent } from '../../../alertas/components';

@Component({
  selector: 'app-req-minero-mov-detail',
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
    ObservacionesTabComponent,
    ArchivosExpedienteComponent,
    AlertasListComponent
  ],
  templateUrl: './req-minero-mov-detail.component.html',
  styleUrls: ['./req-minero-mov-detail.component.scss'],
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
export class ReqMineroMovDetailComponent implements OnInit, AfterViewInit {
  @ViewChildren('tabLabel', { read: ElementRef }) tabLabels!: QueryList<ElementRef>;

  requerimiento: ReqMineroMov | null = null;
  tipoRequerimiento: string = '';
  loading = true;
  selectedTabIndex = 0;
  underlineWidth = 0;
  underlineLeft = 0;
  mostrarFormularioAlerta = false;

  tabs = [
    { label: 'Información General', icon: 'info', chip: false, chipValue: 0 },
    { label: 'Alertas', icon: 'add_alert', chip: true, chipValue: 0 },
    { label: 'Observaciones', icon: 'note', chip: true, chipValue: 0 },
    { label: 'Archivos', icon: 'attach_file', chip: true, chipValue: 0 }
  ];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private location: Location,
    private reqMineroMovService: ReqMineroMovService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      const id = +params['id'];
      if (id) {
        this.loadRequerimiento(id);
      }
    });
  }

  ngAfterViewInit(): void {
    // Configurar el subrayado inicial después de que la vista esté cargada
    setTimeout(() => {
      this.updateUnderline();
    }, 100);
  }

  private loadRequerimiento(id: number): void {
    this.loading = true;
    this.reqMineroMovService.getReqMineroMovById(id).subscribe({
      next: (data: ReqMineroMov) => {
        this.requerimiento = data;
        console.log('[ReqMineroMovDetail] Requerimiento cargado:', this.requerimiento);
        
        // Cargar tipo de requerimiento si está disponible
        if (data.IdReqMinero) {
          this.loadTipoRequerimiento(data.IdReqMinero);
        }
        
        this.loading = false;
        
        // Actualizar contadores de chips
        this.updateChipCounts();
      },
      error: (error: any) => {
        console.error('Error al cargar requerimiento:', error);
        this.loading = false;
        this.snackBar.open('Error al cargar el requerimiento', 'Cerrar', { duration: 3000 });
      }
    });
  }

  private loadTipoRequerimiento(idReqMinero: number): void {
    this.reqMineroMovService.getReqMineros().subscribe({
      next: (reqMineros) => {
        const reqMinero = reqMineros.find(r => r.IdReqMinero === idReqMinero);
        this.tipoRequerimiento = reqMinero?.Tipo || 'No especificado';
      },
      error: (error) => {
        console.error('Error al cargar tipo de requerimiento:', error);
        this.tipoRequerimiento = 'No especificado';
      }
    });
  }

  onCrearAlerta(alerta: any): void {
    console.log('[ReqMineroMovDetail] Recibido evento create alerta:', alerta);
    if (this.requerimiento) {
      alerta.IdTransaccion = this.requerimiento.IdTransaccion;
      // Lógica para manejar la creación de alertas
    }
    this.mostrarFormularioAlerta = false;
  }

  private updateChipCounts(): void {
    if (this.requerimiento?.IdTransaccion) {
      console.log(`[ReqMineroMovDetail] IdTransaccion disponible: ${this.requerimiento.IdTransaccion}`);
      // Los contadores se actualizarán automáticamente desde los componentes hijos
      this.tabs[1].chipValue = 0; // Alertas
    } else {
      console.log(`[ReqMineroMovDetail] No hay IdTransaccion disponible`);
      this.tabs[1].chipValue = 0;
    }
    
    // Filtrar tabs si no hay IdTransaccion
    this.updateTabsVisibility();
  }
  
  private updateTabsVisibility(): void {
    // Si no hay IdTransaccion, mostrar solo información general
    if (!this.requerimiento?.IdTransaccion) {
      // Mantener solo la pestaña de información general visible
      // pero permitir ver las otras con mensaje de advertencia
    }
  }

  selectTab(index: number): void {
    this.selectedTabIndex = index;
    setTimeout(() => {
      this.updateUnderline();
    }, 10);
  }

  private updateUnderline(): void {
    if (this.tabLabels && this.tabLabels.length > 0) {
      const activeTab = this.tabLabels.toArray()[this.selectedTabIndex];
      if (activeTab && activeTab.nativeElement) {
        const element = activeTab.nativeElement;
        this.underlineWidth = element.offsetWidth;
        this.underlineLeft = element.offsetLeft;
      }
    }
  }

  goBack(): void {
    this.location.back();
  }

  formatDate(dateString: string | Date | null | undefined): string {
    if (!dateString) {
      return 'No especificada';
    }
    
    const date = dateString instanceof Date ? dateString : new Date(dateString);
    if (isNaN(date.getTime())) {
      return 'Fecha inválida';
    }
    
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  formatCurrency(value: number | null | undefined): string {
    if (value === null || value === undefined) {
      return 'No especificado';
    }
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR'
    }).format(value);
  }

  get idTransaccion(): number | null {
    return this.requerimiento?.IdTransaccion || null;
  }

  get idReqMineroMov(): number | null {
    return this.requerimiento?.IdReqMineroMov || null;
  }
}
