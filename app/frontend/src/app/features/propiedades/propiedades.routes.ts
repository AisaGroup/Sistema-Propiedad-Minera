import { Routes } from '@angular/router';

export const PROPIEDADES_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./propiedades-list.component').then(m => m.PropiedadesListComponent)
  }
  // TODO: Crear estos componentes más adelante
  // {
  //   path: 'nueva',
  //   loadComponent: () => import('./propiedad-form.component').then(m => m.PropiedadFormComponent)
  // },
  // {
  //   path: ':id',
  //   loadComponent: () => import('./propiedad-detail.component').then(m => m.PropiedadDetailComponent)
  // },
  // {
  //   path: ':id/editar',
  //   loadComponent: () => import('./propiedad-form.component').then(m => m.PropiedadFormComponent)
  // }
];
