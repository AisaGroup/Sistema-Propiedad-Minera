import { Routes } from '@angular/router';

export const EXPEDIENTES_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./components/expediente-list.component').then(m => m.ExpedientesListComponent)
  },
  {
    path: 'nuevo',
    loadComponent: () => import('./components/expediente-create.component').then(m => m.ExpedienteCreateComponent)
  },
  {
    path: ':id',
    loadComponent: () => import('./components/expediente-detail.component').then(m => m.ExpedienteDetailComponent)
  },
  {
    path: ':id/acta/:actaId',
    loadComponent: () => import('../actas/components/acta-detalle.component').then(m => m.ActaDetalleComponent)
  },
  {
    path: ':id/resolucion/:resolucionId',
    loadComponent: () => import('../resoluciones/components/resolucion-detail.component').then(m => m.ResolucionDetalleComponent)
  },
  {
    path: ':id/editar',
    loadComponent: () => import('./pages/expediente-edit-page.component').then(m => m.ExpedienteEditPageComponent)
  }
];
