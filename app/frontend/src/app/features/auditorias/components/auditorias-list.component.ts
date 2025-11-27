import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { Subscription } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import { AuditoriaService } from '../services/auditoria.service';
import { AuditoriaDescripcionEntry, AuditoriaRaw } from '../models/auditoria.model';

type AuditoriaView = Omit<AuditoriaRaw, 'AudFecha'> & {
  AudFecha: Date | null;
  descripcionEntries: AuditoriaDescripcionEntry[];
};

type FilterFormValue = {
  usuario: string;
  entidad: string;
  accion: string;
  fechaDesde: Date | null;
  fechaHasta: Date | null;
};

@Component({
  selector: 'app-auditorias-list',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatTableModule,
    MatPaginatorModule,
    MatCardModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
  ],
  templateUrl: './auditorias-list.component.html',
  styleUrls: ['./auditorias-list.component.scss'],
})
export class AuditoriasListComponent implements OnInit, OnDestroy {
  displayedColumns: string[] = [
    'IdAuditoria',
    'Accion',
    'Entidad',
    'AudFecha',
    'AudUsuario',
    'Descripcion',
  ];
  dataSource = new MatTableDataSource<AuditoriaView>([]);

  filterForm: FormGroup;
  availableAcciones: string[] = [];
  totalItems = 0;

  loading = false;
  error: string | null = null;
  expandedAuditoriaId: number | null = null;

  private dataSubscription?: Subscription;
  private filterSubscription?: Subscription;
  private allAuditorias: AuditoriaView[] = [];

  private _paginator?: MatPaginator;

  @ViewChild(MatPaginator)
  set paginator(paginator: MatPaginator | undefined) {
    if (paginator) {
      this._paginator = paginator;
      this.dataSource.paginator = paginator;
    }
  }

  get paginator(): MatPaginator | undefined {
    return this._paginator;
  }

  constructor(private auditoriaService: AuditoriaService, private fb: FormBuilder) {
    this.filterForm = this.fb.group({
      usuario: [''],
      entidad: [''],
      accion: [''],
      fechaDesde: [null],
      fechaHasta: [null],
    });
  }

  ngOnInit(): void {
    this.setupFilterListener();
    this.fetchAuditorias();
  }

  ngOnDestroy(): void {
    this.dataSubscription?.unsubscribe();
    this.filterSubscription?.unsubscribe();
  }

  fetchAuditorias(): void {
    this.loading = true;
    this.error = null;

    this.dataSubscription = this.auditoriaService.getAuditorias().subscribe({
      next: (auditorias) => {
        this.allAuditorias = auditorias.map((item) => this.toViewModel(item));
        this.totalItems = this.allAuditorias.length;
        this.updateAvailableAcciones();
        this.applyFilters(false);
        if (this.paginator) {
          this.paginator.firstPage();
        }
        this.loading = false;
      },
      error: (err) => {
        console.error('Error al cargar auditorías:', err);
        this.error = 'Ocurrió un error al cargar las auditorías.';
        this.loading = false;
      },
    });
  }

  clearFilters(): void {
    this.filterForm.reset({
      usuario: '',
      entidad: '',
      accion: '',
      fechaDesde: null,
      fechaHasta: null,
    });
  }

  get hasActiveFilters(): boolean {
    const { usuario, entidad, accion, fechaDesde, fechaHasta } = this.filterForm
      .value as FilterFormValue;
    return Boolean(
      (usuario && usuario.trim()) ||
        (entidad && entidad.trim()) ||
        accion ||
        fechaDesde ||
        fechaHasta
    );
  }

  getAccionClass(accion: string | null | undefined): string {
    const normalized = (accion || '').toLowerCase();
    if (['create', 'update', 'delete', 'login'].includes(normalized)) {
      return normalized;
    }
    return 'default';
  }

  trackByEntry(_: number, entry: AuditoriaDescripcionEntry): string {
    return `${entry.label}-${entry.value}`;
  }

  isDetalleVisible(auditoria: AuditoriaView): boolean {
    return this.expandedAuditoriaId === auditoria.IdAuditoria;
  }

  toggleDetalle(auditoria: AuditoriaView, event: MouseEvent): void {
    event.stopPropagation();
    this.expandedAuditoriaId =
      this.expandedAuditoriaId === auditoria.IdAuditoria ? null : auditoria.IdAuditoria;
  }

  private setupFilterListener(): void {
    this.filterSubscription = this.filterForm.valueChanges
      .pipe(debounceTime(250))
      .subscribe(() => this.applyFilters());
  }

  private applyFilters(resetPaginator = true): void {
    const filteredData = this.filterAuditorias();
    this.dataSource.data = filteredData;
    if (resetPaginator && this.paginator) {
      this.paginator.firstPage();
    }
  }

  private filterAuditorias(): AuditoriaView[] {
    if (!this.allAuditorias.length) {
      return [];
    }

    const { usuario, entidad, accion, fechaDesde, fechaHasta } = this.filterForm
      .value as FilterFormValue;
    const usuarioFilter = (usuario || '').trim().toLowerCase();
    const entidadFilter = (entidad || '').trim().toLowerCase();
    const accionFilter = (accion || '').trim().toLowerCase();

    const startDate = fechaDesde ? this.startOfDay(fechaDesde).getTime() : null;
    const endDate = fechaHasta ? this.endOfDay(fechaHasta).getTime() : null;

    return this.allAuditorias.filter((auditoria) => {
      const matchesUsuario = usuarioFilter
        ? this.matchesText(auditoria.UsuarioNombre, usuarioFilter) ||
          this.matchesText(
            auditoria.AudUsuario !== null && auditoria.AudUsuario !== undefined
              ? String(auditoria.AudUsuario)
              : null,
            usuarioFilter
          )
        : true;

      const matchesEntidad = entidadFilter
        ? this.matchesText(auditoria.Entidad, entidadFilter)
        : true;
      const matchesAccion = accionFilter
        ? (auditoria.Accion || '').toLowerCase() === accionFilter
        : true;

      const matchesFecha = this.matchesDateRange(auditoria.AudFecha, startDate, endDate);

      return matchesUsuario && matchesEntidad && matchesAccion && matchesFecha;
    });
  }

  private matchesText(value: string | null | undefined, filter: string): boolean {
    return (value || '').toLowerCase().includes(filter);
  }

  private matchesDateRange(date: Date | null, start: number | null, end: number | null): boolean {
    if (!start && !end) {
      return true;
    }
    if (!date) {
      return false;
    }
    const time = date.getTime();
    if (start && time < start) {
      return false;
    }
    if (end && time > end) {
      return false;
    }
    return true;
  }

  private startOfDay(date: Date): Date {
    const newDate = new Date(date);
    newDate.setHours(0, 0, 0, 0);
    return newDate;
  }

  private endOfDay(date: Date): Date {
    const newDate = new Date(date);
    newDate.setHours(23, 59, 59, 999);
    return newDate;
  }

  private parseAudFecha(value: string | null): Date | null {
    if (!value) return null;

    // si viene con Z o con offset, devuelvo la fecha tal cual
    if (/[zZ]$/.test(value) || /[+-]\d\d:\d\d$/.test(value)) {
      return new Date(value);
    }

    // si viene sin zona, asumo que es UTC y la agrego
    return new Date(value + 'Z');
  }

  private toViewModel(raw: AuditoriaRaw): AuditoriaView {
    return {
      ...raw,
      descripcionEntries: this.parseDescripcion(raw.Descripcion),
      AudFecha: this.parseAudFecha(raw.AudFecha),
    };
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
    // Saco el prefijo "data." o "changes." del principio de la etiqueta
    return label.replace(/^(data|changes)\./i, '');
  }

  private updateAvailableAcciones(): void {
    const uniqueAcciones = new Set(
      this.allAuditorias
        .map((auditoria) => auditoria.Accion)
        .filter((accion): accion is string => Boolean(accion))
    );
    this.availableAcciones = Array.from(uniqueAcciones).sort((a, b) =>
      a.localeCompare(b, 'es', { sensitivity: 'base' })
    );
  }
}
