import { Component, HostListener, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
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
  entidad: string[];
  accion: string[];
  idTransaccion: string;
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
    MatCardModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatSnackBarModule,
    MatTooltipModule,
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
    'Diff',
    'Descripcion',
  ];

  allAuditorias: AuditoriaView[] = [];
  filteredAuditorias: AuditoriaView[] = [];
  paginatedAuditorias: AuditoriaView[] = [];

  filterForm: FormGroup;
  availableAcciones: string[] = [];
  availableEntidades: string[] = [];
  totalItems = 0;

  // Paginación
  currentPage = 0;
  pageSize = 10;
  Math = Math;

  loading = false;
  error: string | null = null;
  expandedAuditoriaId: number | null = null;
  exportingPdf = false;

  private dataSubscription?: Subscription;
  private filterSubscription?: Subscription;

  get totalPages(): number {
    return Math.ceil(this.filteredAuditorias.length / this.pageSize);
  }

  constructor(
    private auditoriaService: AuditoriaService,
    private fb: FormBuilder,
    private snackBar: MatSnackBar
  ) {
    this.filterForm = this.fb.group({
      usuario: [''],
      entidad: [[]],
      accion: [[]],
      idTransaccion: [''],
      fechaDesde: [null],
      fechaHasta: [null],
    });
  }

  ngOnInit(): void {
    this.setupFilterListener();
    this.fetchAuditorias();
  }

  @HostListener('window:keydown', ['$event'])
  onGlobalKeydown(event: KeyboardEvent): void {
    if ((event.ctrlKey || event.metaKey) && event.key?.toLowerCase() === 'p') {
      event.preventDefault();
      this.exportPdf();
    }
  }

  exportPdf(): void {
    if (this.exportingPdf) {
      return;
    }

    this.exportingPdf = true;

    const { usuario, entidad, accion, idTransaccion, fechaDesde, fechaHasta } = this.filterForm
      .value as FilterFormValue;

    const filters = {
      usuario: usuario && usuario.trim() ? usuario.trim() : null,
      entidad: entidad || [],
      accion: accion || [],
      idTransaccion: idTransaccion && idTransaccion.trim() ? idTransaccion.trim() : null,
      fechaDesde: fechaDesde ? fechaDesde.toISOString() : null,
      fechaHasta: fechaHasta ? fechaHasta.toISOString() : null,
    };

    this.auditoriaService.exportAuditoriasPdf(filters).subscribe({
      next: (blob) => {
        this.exportingPdf = false;
        if (!blob || blob.size === 0) {
          this.snackBar.open('El archivo PDF generado está vacío.', 'Cerrar', {
            duration: 5000,
          });
          return;
        }

        const blobUrl = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = blobUrl;
        a.download = 'auditorias.pdf';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(blobUrl);
      },
      error: (err) => {
        console.error('Error al generar el PDF de auditorías:', err);
        this.exportingPdf = false;
        this.snackBar.open('Ocurrió un error al generar el PDF de auditorías.', 'Cerrar', {
          duration: 5000,
        });
      },
    });
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
        this.updateAvailableEntidades();
        this.applyFilters(false);
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
      entidad: [],
      accion: [],
      idTransaccion: '',
      fechaDesde: null,
      fechaHasta: null,
    });
  }

  get hasActiveFilters(): boolean {
    const { usuario, entidad, accion, idTransaccion, fechaDesde, fechaHasta } = this.filterForm
      .value as FilterFormValue;
    return Boolean(
      (usuario && usuario.trim()) ||
        (entidad && entidad.length) ||
        (accion && accion.length) ||
        (idTransaccion && idTransaccion.trim()) ||
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
    this.filteredAuditorias = this.filterAuditorias();
    if (resetPaginator) {
      this.currentPage = 0;
    }
    this.updatePaginatedData();
  }

  updatePaginatedData(): void {
    const startIndex = this.currentPage * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    this.paginatedAuditorias = this.filteredAuditorias.slice(startIndex, endIndex);
  }

  changePageSize(size: number): void {
    this.pageSize = size;
    this.currentPage = 0;
    this.updatePaginatedData();
  }

  firstPage(): void {
    this.currentPage = 0;
    this.updatePaginatedData();
  }

  previousPage(): void {
    if (this.currentPage > 0) {
      this.currentPage--;
      this.updatePaginatedData();
    }
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages - 1) {
      this.currentPage++;
      this.updatePaginatedData();
    }
  }

  lastPage(): void {
    this.currentPage = this.totalPages - 1;
    this.updatePaginatedData();
  }

  private filterAuditorias(): AuditoriaView[] {
    if (!this.allAuditorias.length) {
      return [];
    }

    const { usuario, entidad, accion, idTransaccion, fechaDesde, fechaHasta } = this.filterForm
      .value as FilterFormValue;
    const usuarioFilter = (usuario || '').trim().toLowerCase();
    const entidadFilter = (entidad || []).map((e) => e.toLowerCase());
    const accionFilter = (accion || []).map((a) => a.toLowerCase());
    const idTransaccionFilter = (idTransaccion || '').trim().toLowerCase();

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

      const matchesEntidad =
        entidadFilter.length > 0
          ? entidadFilter.includes((auditoria.Entidad || '').toLowerCase())
          : true;
      const matchesAccion =
        accionFilter.length > 0
          ? accionFilter.includes((auditoria.Accion || '').toLowerCase())
          : true;

      const matchesIdTransaccion = idTransaccionFilter
        ? this.matchesIdTransaccion(auditoria, idTransaccionFilter)
        : true;

      const matchesFecha = this.matchesDateRange(auditoria.AudFecha, startDate, endDate);

      return (
        matchesUsuario && matchesEntidad && matchesAccion && matchesIdTransaccion && matchesFecha
      );
    });
  }

  private matchesText(value: string | null | undefined, filter: string): boolean {
    return (value || '').toLowerCase().includes(filter);
  }

  private matchesIdTransaccion(auditoria: AuditoriaView, filter: string): boolean {
    if (!auditoria.descripcionEntries || auditoria.descripcionEntries.length === 0) {
      return false;
    }
    return auditoria.descripcionEntries.some(
      (entry) =>
        entry.label.toLowerCase().includes('idtransaccion') &&
        entry.value.toLowerCase().includes(filter)
    );
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

  /**
   * Extrae el ID de la entidad desde la descripción JSON
   */
  private extractEntityId(auditoria: AuditoriaView): number | null {
    if (!auditoria.Descripcion) {
      return null;
    }

    try {
      const parsed = JSON.parse(auditoria.Descripcion);
      if (parsed && typeof parsed.id === 'number') {
        return parsed.id;
      }
    } catch (error) {
      // Si no es JSON válido, retornar null
    }
    return null;
  }

  /**
   * Encuentra el registro anterior con el mismo ID de entidad y Entidad
   * La lista está ordenada por fecha descendente (más nuevos primero),
   * así que buscamos hacia adelante (índices mayores) para encontrar registros más antiguos
   */
  private findPreviousRecord(
    currentIndex: number,
    currentEntityId: number | null,
    currentEntidad: string
  ): AuditoriaView | null {
    if (currentEntityId === null) {
      return null;
    }

    // Buscar hacia adelante en la lista filtrada (ordenada por fecha descendente)
    // Los índices mayores corresponden a registros más antiguos (anteriores)
    for (let i = currentIndex + 1; i < this.filteredAuditorias.length; i++) {
      const prevAuditoria = this.filteredAuditorias[i];
      const prevEntityId = this.extractEntityId(prevAuditoria);

      if (prevEntityId === currentEntityId && prevAuditoria.Entidad === currentEntidad) {
        return prevAuditoria;
      }
    }

    return null;
  }

  /**
   * Calcula la diferencia entre el registro actual y el anterior
   */
  getDiff(auditoria: AuditoriaView): string {
    const entityId = this.extractEntityId(auditoria);
    if (entityId === null) {
      return '—';
    }

    // Encontrar el índice en filteredAuditorias
    const indexInFiltered = this.filteredAuditorias.findIndex(
      (a) => a.IdAuditoria === auditoria.IdAuditoria
    );

    if (indexInFiltered === -1) {
      return '—';
    }

    const previousRecord = this.findPreviousRecord(indexInFiltered, entityId, auditoria.Entidad);
    if (!previousRecord) {
      return 'Primer registro';
    }

    try {
      const currentDesc = auditoria.Descripcion ? JSON.parse(auditoria.Descripcion) : null;
      const previousDesc = previousRecord.Descripcion
        ? JSON.parse(previousRecord.Descripcion)
        : null;

      if (!currentDesc || !previousDesc) {
        return '—';
      }

      // Para UPDATE, comparar los campos que cambiaron
      if (auditoria.Accion === 'UPDATE' && currentDesc.changes) {
        const changes = currentDesc.changes;

        // Obtener el estado anterior completo (puede estar en "data" o "changes" del registro anterior)
        let previousState: Record<string, any> = {};
        if (previousDesc.data) {
          previousState = previousDesc.data;
        } else if (previousDesc.changes) {
          previousState = previousDesc.changes;
        }

        const diffFields: string[] = [];
        for (const [key, value] of Object.entries(changes)) {
          const prevValue = previousState[key];
          if (JSON.stringify(value) !== JSON.stringify(prevValue)) {
            diffFields.push(key);
          }
        }

        if (diffFields.length === 0) {
          return 'Sin cambios';
        }

        return diffFields.length === 1
          ? `Cambió: ${diffFields[0]}`
          : `${diffFields.length} campos cambiados`;
      }

      // Para CREATE, mostrar que es nuevo
      if (auditoria.Accion === 'CREATE') {
        return 'Registro nuevo';
      }

      // Para DELETE, mostrar que fue eliminado
      if (auditoria.Accion === 'DELETE') {
        return 'Registro eliminado';
      }

      // Comparación general si no es UPDATE
      const currentKeys = Object.keys(currentDesc).filter((k) => k !== 'id');
      const previousKeys = Object.keys(previousDesc).filter((k) => k !== 'id');

      if (JSON.stringify(currentKeys.sort()) !== JSON.stringify(previousKeys.sort())) {
        return 'Estructura diferente';
      }

      return '—';
    } catch (error) {
      return '—';
    }
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

  private updateAvailableEntidades(): void {
    const uniqueEntidades = new Set(
      this.allAuditorias
        .map((auditoria) => auditoria.Entidad)
        .filter((entidad): entidad is string => Boolean(entidad))
    );
    this.availableEntidades = Array.from(uniqueEntidades).sort((a, b) =>
      a.localeCompare(b, 'es', { sensitivity: 'base' })
    );
  }
}
