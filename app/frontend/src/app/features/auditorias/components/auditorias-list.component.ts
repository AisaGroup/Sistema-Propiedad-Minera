import { AfterViewInit, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatButtonModule } from '@angular/material/button';
import { Subscription } from 'rxjs';
import { AuditoriaService } from '../services/auditoria.service';
import { AuditoriaDescripcionEntry, AuditoriaRaw } from '../models/auditoria.model';

type AuditoriaView = AuditoriaRaw & {
  descripcionEntries: AuditoriaDescripcionEntry[];
};

@Component({
  selector: 'app-auditorias-list',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatPaginatorModule,
    MatCardModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatButtonModule,
  ],
  templateUrl: './auditorias-list.component.html',
  styleUrls: ['./auditorias-list.component.scss'],
})
export class AuditoriasListComponent implements OnInit, AfterViewInit, OnDestroy {
  displayedColumns: string[] = [
    'IdAuditoria',
    'Accion',
    'Entidad',
    'AudFecha',
    'AudUsuario',
    'Descripcion',
  ];
  dataSource = new MatTableDataSource<AuditoriaView>([]);

  loading = false;
  error: string | null = null;

  private subscription?: Subscription;

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  constructor(private auditoriaService: AuditoriaService) {}

  ngOnInit(): void {
    this.fetchAuditorias();
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
  }

  fetchAuditorias(): void {
    this.loading = true;
    this.error = null;

    this.subscription = this.auditoriaService.getAuditorias().subscribe({
      next: (auditorias) => {
        this.dataSource.data = auditorias.map((item) => this.toViewModel(item));
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

  getAccionClass(accion: string | null | undefined): string {
    const normalized = (accion || '').toLowerCase();
    if (['create', 'update', 'delete'].includes(normalized)) {
      return normalized;
    }
    return 'default';
  }

  trackByEntry(_: number, entry: AuditoriaDescripcionEntry): string {
    return `${entry.label}-${entry.value}`;
  }

  private toViewModel(raw: AuditoriaRaw): AuditoriaView {
    return {
      ...raw,
      descripcionEntries: this.parseDescripcion(raw.Descripcion),
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
}
