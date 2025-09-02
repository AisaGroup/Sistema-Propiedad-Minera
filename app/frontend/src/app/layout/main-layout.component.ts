import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatToolbarModule,
    MatSidenavModule,
    MatListModule,
    MatIconModule,
    MatButtonModule,
    MatMenuModule
  ],
  template: `
    <mat-sidenav-container class="sidenav-container">
      <!-- Sidebar -->
      <mat-sidenav #drawer mode="side" opened class="sidenav">
        <div class="sidenav-header">
          <img src="assets/logo.jpeg" alt="Minas Argentinas S.A." class="sidebar-logo" />
         
        </div>
        
        <mat-nav-list>
          <a mat-list-item routerLink="/propiedades" routerLinkActive="active">
            <mat-icon matListItemIcon>terrain</mat-icon>
            <span matListItemTitle>Propiedades Mineras</span>
          </a>
          <a mat-list-item routerLink="/expedientes" routerLinkActive="active">
            <mat-icon matListItemIcon>folder</mat-icon>
            <span matListItemTitle>Expedientes</span>
          </a>
          <a mat-list-item routerLink="/alertas" routerLinkActive="active">
            <mat-icon matListItemIcon>warning</mat-icon>
            <span matListItemTitle>Alertas</span>
          </a>
          <mat-divider></mat-divider>
          <mat-list-item [matMenuTriggerFor]="maestrosMenu">
            <mat-icon matListItemIcon>menu_book</mat-icon>
            <span matListItemTitle>Maestros</span>
          </mat-list-item>
          <mat-menu #maestrosMenu="matMenu">
            <button mat-menu-item routerLink="/titulares">
              <mat-icon>people</mat-icon>
              <span>Titulares Mineros</span>
            </button>
            <button mat-menu-item routerLink="/auditoria">
              <mat-icon>history</mat-icon>
              <span>Auditoría</span>
            </button>
          </mat-menu>
        </mat-nav-list>
      </mat-sidenav>

      <!-- Main content -->
      <mat-sidenav-content>
        <!-- Top toolbar -->
        <mat-toolbar color="primary" class="toolbar">
          <button mat-icon-button (click)="drawer.toggle()" class="menu-button">
            <mat-icon>menu</mat-icon>
          </button>
          
          <div class="logo-container">
            
          </div>
          
          <span class="spacer"></span>
          
          <!-- User menu -->
          <button mat-icon-button [matMenuTriggerFor]="userMenu">
            <mat-icon>account_circle</mat-icon>
          </button>
          
          <mat-menu #userMenu="matMenu">
            <button mat-menu-item>
              <mat-icon>person</mat-icon>
              <span>Perfil</span>
            </button>
            <button mat-menu-item>
              <mat-icon>settings</mat-icon>
              <span>Configuración</span>
            </button>
            <mat-divider></mat-divider>
            <button mat-menu-item>
              <mat-icon>logout</mat-icon>
              <span>Cerrar Sesión</span>
            </button>
          </mat-menu>
        </mat-toolbar>

        <!-- Page content -->
        <main class="main-content">
          <router-outlet></router-outlet>
        </main>
      </mat-sidenav-content>
    </mat-sidenav-container>
  `,
  styles: [`
    .sidenav-container {
      height: 100vh;
    }

    .sidenav {
      width: 250px;
      background: #ffffff;
      border-right: 1px solid #e8f0ec;
      box-shadow: 2px 0 8px rgba(65, 103, 89, 0.08);
    }

    .sidenav-header {
      padding: 8px 8px 10px 8px;
      background: linear-gradient(135deg, #416759 0%, #335248 100%);
      color: white;
      text-align: center;
    }

    .sidenav-header h2 {
      margin: 0 0 8px 0;
      font-size: 1.2rem;
      font-weight: 500;
      color: #222 !important;
      text-shadow: none;
    }

    .sidenav-header p {
      margin: 0;
      font-size: 0.9rem;
      opacity: 0.9;
      color: #222 !important;
      text-shadow: none;
    }

    .toolbar {
      position: sticky;
      top: 0;
      z-index: 100;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
      background-color: white !important;
      border-bottom: 1px solid #e8f0ec;
    }

    .menu-button {
      margin-right: 16px;
      color: #416759 !important;
    }

    .menu-button:hover {
      background-color: rgba(65, 103, 89, 0.1) !important;
    }

    .logo-container {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .company-logo {
      height: 38px;
      width: auto;
      object-fit: contain;
      display: block;
    }

    .company-name {
      font-size: 1.3rem;
      font-weight: 500;
      color: #416759;
      letter-spacing: 0.5px;
    }

    .spacer {
      flex: 1 1 auto;
    }

    .main-content {
      padding: 24px;
      background: var(--corporate-white, #fff);
      min-height: calc(100vh - 64px);
      color: var(--corporate-black, #222);
    }

    .mat-mdc-nav-list .mdc-list-item {
      border-radius: 0 25px 25px 0;
      margin: 4px 8px 4px 0;
    }

    .mat-mdc-nav-list .mdc-list-item.active {
      background-color: var(--corporate-green, #416759) !important;
    }

    .mat-mdc-nav-list .mdc-list-item:hover {
      background-color: #f0f4f2;
    }

    .mat-mdc-nav-list .mdc-list-item.active:hover {
      background-color: #e8f4f1;
    }

    /* Iconos del sidebar */
    .mat-mdc-nav-list .mat-mdc-list-item .mat-icon {
      color: #416759;
      margin-right: 12px;
    }

    .mat-mdc-nav-list .mdc-list-item.active .mat-icon {
      color: #416759;
    }

    /* Botones del toolbar */
    .toolbar .mat-mdc-icon-button {
      color: #416759 !important;
    }

    .toolbar .mat-mdc-icon-button:hover {
      background-color: rgba(65, 103, 89, 0.1) !important;
    }

    /* Menu items del user menu */
    .mat-mdc-menu-item {
      color: #416759 !important;
    }

    .mat-mdc-menu-item:hover {
      background-color: rgba(65, 103, 89, 0.1) !important;
    }

    .mat-mdc-menu-item .mat-icon {
      color: #416759 !important;
    }

    /* Divider personalizado */
    .mat-divider {
      border-top-color: #e8f0ec;
      margin: 8px 0;
    }

    .sidebar-logo {
      display: block;
      margin: 0 auto;
      max-width: 98%;
      max-height: 110px;
      width: 100%;
      height: auto;
      object-fit: contain;
      border-radius: 6px;
      background: white;
      box-shadow: 0 1px 4px rgba(0,0,0,0.07);
    }

    .mat-mdc-nav-list .mdc-list-item,
    .mat-mdc-nav-list .mdc-list-item .mat-icon,
    .mat-mdc-nav-list .mdc-list-item span[matListItemTitle] {
      color: #222 !important;
      font-weight: 500;
      font-size: 1.08rem;
    }

    .mat-mdc-nav-list .mdc-list-item.active span[matListItemTitle] {
      color: #fff !important;
    }

    h1, h2, h3, .page-title, .section-title, .mat-card-title, .mat-card-header .mat-card-title {
      color: #222 !important;
      font-weight: 600;
    }

    .mat-menu-item,
    .mat-menu-item .mat-icon,
    .mat-menu-item span {
      color: #222 !important;
    }
    .mat-menu-item.cdk-focused,
    .mat-menu-item.cdk-program-focused,
    .mat-menu-item.cdk-mouse-focused,
    .mat-menu-item:hover,
    .mat-menu-item:active {
      color: #222 !important;
      background: #e8f4f1 !important;
    }
    /* Refuerzo para Angular encapsulado */
    .mat-mdc-menu-item[ng-reflect-router-link],
    .mat-mdc-menu-item[ng-reflect-router-link] .mat-icon,
    .mat-mdc-menu-item[ng-reflect-router-link] span,
    .mat-mdc-menu-item[_ngcontent-ng-c894228337],
    .mat-mdc-menu-item[_ngcontent-ng-c894228337] .mat-icon,
    .mat-mdc-menu-item[_ngcontent-ng-c894228337] span {
      color: #222 !important;
    }
    .mat-mdc-menu-item[_ngcontent-ng-c894228337]:hover,
    .mat-mdc-menu-item[_ngcontent-ng-c894228337]:active,
    .mat-mdc-menu-item[_ngcontent-ng-c894228337].cdk-focused,
    .mat-mdc-menu-item[_ngcontent-ng-c894228337].cdk-program-focused,
    .mat-mdc-menu-item[_ngcontent-ng-c894228337].cdk-mouse-focused {
      color: #222 !important;
      background: #e8f4f1 !important;
    }

    .mat-list-item[matmenutriggerfor],
    .mat-list-item[matmenutriggerfor] .mat-icon,
    .mat-list-item[matmenutriggerfor] span[matListItemTitle] {
      color: #222 !important;
      font-weight: 600;
    }
  `]
})
export class MainLayoutComponent {
  // No longer need pageTitle since we're using the company logo
}
