import { Routes } from '@angular/router';

export const TITULARES_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./components/titular-list.component').then(m => m.TitularesMinerosComponent)
  },
  {
    path: 'crear',
    loadComponent: () => import('./components/titular-form.component').then(m => m.TitularCreateFormComponent)
  },
  {
    path: 'editar/:id',
    loadComponent: () => import('./components/titular-edit.component').then(m => m.TitularEditFormComponent)
  }
];
