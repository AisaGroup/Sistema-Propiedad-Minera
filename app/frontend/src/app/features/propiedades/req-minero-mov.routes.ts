import { Routes } from '@angular/router';

export const REQ_MINERO_MOV_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./components/req-minero-mov/req-minero-mov-list.component').then(m => m.ReqMineroMovListComponent)
  }
];
