import { Routes } from '@angular/router';

export const AUDITORIAS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('../components/auditorias-list.component').then(m => m.AuditoriasListComponent)
  }
];

