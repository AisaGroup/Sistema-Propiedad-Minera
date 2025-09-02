import { Routes } from '@angular/router';
import { ExpedientesListComponent } from '../components/expediente-list.component';
import { ExpedienteDetailComponent } from '../components/expediente-detail.component';
import { ActaDetalleComponent } from '../../actas/components/acta-detalle.component';

export const EXPEDIENTES_ROUTES: Routes = [
  {
    path: '',
    component: ExpedientesListComponent
  },
  {
    path: 'nuevo',
  loadComponent: () => import('../components/expediente-create.component').then(m => m.ExpedienteCreateComponent)
  },
  {
    path: ':id',
  component: ExpedienteDetailComponent
  },
  {
    path: ':id/acta/:actaId',
    loadComponent: () => import('../../actas/components/acta-detalle.component').then(m => m.ActaDetalleComponent)
  },
  {
    path: ':id/resolucion/:resolucionId',
    loadComponent: () => import('../../resoluciones/components/resolucion-detail.component').then(m => m.ResolucionDetalleComponent)
  },
  {
    path: ':id/editar',
    loadComponent: () => import('../pages/expediente-edit-page.component').then(m => m.ExpedienteEditPageComponent)
  }
];
