import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatTableModule } from '@angular/material/table';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatPaginatorModule, MatPaginator, PageEvent } from '@angular/material/paginator';
import { FormsModule } from '@angular/forms';
import { NotificacionService } from '../../../services/notificacion.service';

@Component({
  selector: 'app-notificacion-list',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatCardModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
    MatPaginatorModule,
    FormsModule
  ],
  templateUrl: './notificacion-list.component.html',
  styleUrls: ['./notificacion-list.component.scss']
})
export class NotificacionListComponent implements OnInit {
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  notificaciones: any[] = [];
  isLoading = true;
  filters = {
    funcionario: '',
    expediente: ''
  };

  // Configuración del paginado
  totalRecords = 0;
  pageSize = 10;
  currentPage = 0;
  pageSizeOptions = [5, 10, 25, 50];

  // Para usar Math en el template
  Math = Math;

  // Getter para calcular total de páginas
  get totalPages(): number {
    return Math.ceil(this.totalRecords / this.pageSize);
  }

  constructor(
    private notificacionService: NotificacionService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.loadNotificaciones();

    // Suscribirse a cambios en las notificaciones
    this.notificacionService.getNotificaciones().subscribe(() => {
      this.loadNotificaciones();
    });
  }

  private loadNotificaciones(): void {
    console.log('[DEBUG] Cargando notificaciones...');
    this.isLoading = true;
    
    this.notificacionService.getNotificacionesPaginated(
      this.currentPage, 
      this.pageSize, 
      this.filters.funcionario,
      this.filters.expediente
    ).subscribe(
      (response: any) => {
        console.log('[DEBUG] Respuesta del backend:', response);
        this.notificaciones = response.data || response.items || [];
        this.totalRecords = response.total || response.count || 0;
        console.log('[DEBUG] Notificaciones asignadas:', this.notificaciones);
        console.log('[DEBUG] Total de registros:', this.totalRecords);
        this.isLoading = false;
      },
      (error: any) => {
        console.error('Error al cargar notificaciones:', error);
        this.isLoading = false;
      }
    );
  }

  crearNotificacion(): void {
    this.router.navigate(['/notificaciones/crear']);
  }

  verDetalle(notificacion: any): void {
    this.router.navigate(['/notificaciones/detalle', notificacion.IdNotificacion]);
  }

  editarNotificacion(notificacion: any): void {
    this.router.navigate(['/notificaciones/editar', notificacion.IdNotificacion]);
  }

  eliminarNotificacion(id: number): void {
    if (confirm('¿Está seguro de que desea eliminar esta notificación?')) {
      this.notificacionService.deleteNotificacion(id).subscribe(
        () => {
          this.loadNotificaciones(); // Recargar la lista
        },
        (error: any) => {
          console.error('Error al eliminar notificación:', error);
        }
      );
    }
  }

  onFilterChange(): void {
    // Reiniciar a la primera página cuando se filtra
    this.currentPage = 0;
    if (this.paginator) {
      this.paginator.firstPage();
    }
    console.log('Filtro cambiado:', this.filters.funcionario);
    this.loadNotificaciones();
  }

  clearFilters(): void {
    this.filters.funcionario = '';
    this.filters.expediente = '';
    this.currentPage = 0;
    if (this.paginator) {
      this.paginator.firstPage();
    }
    this.loadNotificaciones();
  }

  onPageChange(event: PageEvent): void {
    console.log('[DEBUG] Cambio de página:', event);
    this.currentPage = event.pageIndex;
    this.pageSize = event.pageSize;
    this.loadNotificaciones();
  }

  formatDate(dateString: string): string {
    console.log('Formatting date:', dateString);
    if (!dateString) {
      console.warn('Fecha inválida:', dateString);
      return 'Fecha inválida';
    }

    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      console.warn('No se pudo interpretar la fecha:', dateString);
      return 'Fecha inválida';
    }

    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  // Métodos de paginación personalizada
  changePageSize(size: number): void {
    this.pageSize = size;
    this.currentPage = 0;
    this.loadNotificaciones();
  }

  firstPage(): void {
    this.currentPage = 0;
    this.loadNotificaciones();
  }

  previousPage(): void {
    if (this.currentPage > 0) {
      this.currentPage--;
      this.loadNotificaciones();
    }
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages - 1) {
      this.currentPage++;
      this.loadNotificaciones();
    }
  }

  lastPage(): void {
    this.currentPage = this.totalPages - 1;
    this.loadNotificaciones();
  }
}