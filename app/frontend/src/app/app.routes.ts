import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./layout/main-layout.component').then(m => m.MainLayoutComponent),
    children: [
      {
        path: '',
        redirectTo: '/propiedades',
        pathMatch: 'full'
      },
      {
        path: 'propiedades',
        loadComponent: () => import('./features/propiedades/propiedades-list.component').then(m => m.PropiedadesListComponent)
      },
      {
        path: 'expedientes',
        loadChildren: () => import('./features/expedientes/routes/expedientes.routes').then(r => r.EXPEDIENTES_ROUTES)
      },
      {
        path: 'titulares',
        loadComponent: () => import('./features/titulares/components/titular-list.component').then(m => m.TitularesMinerosComponent)
      }
    ]
  }
];
