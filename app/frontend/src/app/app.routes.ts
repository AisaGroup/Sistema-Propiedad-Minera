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
        loadChildren: () => import('./features/propiedades/propiedades.routes').then(r => r.PROPIEDADES_ROUTES)
      },
      {
        path: 'expedientes',
        loadChildren: () => import('./features/expedientes/routes/expedientes.routes').then(r => r.EXPEDIENTES_ROUTES)
      },
      {
        path: 'titulares',
        loadChildren: () => import('./features/titulares/titulares.routes').then(r => r.TITULARES_ROUTES)
      },
      {
        path: 'alertas',
        loadComponent: () => import('./features/alertas/components/alertas-global-list.component').then(m => m.AlertasGlobalListComponent)
      }
    ]
  }
];
