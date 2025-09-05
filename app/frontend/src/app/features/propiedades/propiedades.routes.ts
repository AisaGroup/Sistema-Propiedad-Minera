import { Routes } from '@angular/router';

export const PROPIEDADES_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./propiedades-list.component').then(m => m.PropiedadesListComponent)
  },
  {
    path: 'nueva',
    loadComponent: () => import('./components/propiedad-create.component').then(m => m.PropiedadCreateComponent)
  },
  {
    path: ':id/editar',
    loadComponent: () => import('./components/propiedad-edit.component').then(m => m.PropiedadEditComponent)
  }
];
