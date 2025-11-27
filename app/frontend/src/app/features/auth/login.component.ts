import { AuthService } from './auth.service';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule
  ],
  template: `
    <div class="login-bg">
      <div class="login-center-box unified-login">
        <div class="login-title-box">
          <h1 class="login-title">Sistema de Gestión<br>Propiedad Minera</h1>
        </div>
        <mat-card class="login-card login-card-merged">
          <mat-card-header>
            <mat-card-title>
              <mat-icon class="login-avatar" color="primary">lock</mat-icon>
              <span>Iniciar Sesión</span>
            </mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <form [formGroup]="loginForm" (ngSubmit)="onSubmit()">
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Usuario</mat-label>
                <input matInput formControlName="username" required autocomplete="username">
                <mat-icon matPrefix>person</mat-icon>
              </mat-form-field>
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Contraseña</mat-label>
                <input matInput [type]="hide ? 'password' : 'text'" formControlName="password" required autocomplete="current-password">
                <button mat-icon-button matSuffix type="button" (click)="hide = !hide" tabindex="-1">
                  <mat-icon>{{hide ? 'visibility_off' : 'visibility'}}</mat-icon>
                </button>
              </mat-form-field>
              <div *ngIf="errorMessage" class="login-error">{{ errorMessage }}</div>
              <button mat-raised-button color="primary" class="full-width login-btn" [disabled]="loginForm.invalid || loading">
                <mat-icon>login</mat-icon> {{ loading ? 'Entrando...' : 'Entrar' }}
              </button>
            </form>
          </mat-card-content>
        </mat-card>
      </div>
    </div>
  `,
  styles: [`
    .login-bg {
      min-height: 100vh;
      width: 100vw;
      background: url('/assets/logo_Minas_Argentinas_web_2.png') center center/cover no-repeat, linear-gradient(135deg, #e8f4f1 0%, #3F6858 100%);
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      animation: fadeInBg 1.2s;
      position: relative;
    }
    .unified-login {
      display: flex;
      flex-direction: column;
      align-items: stretch;
      justify-content: center;
      gap: 0;
      background: #FFFFFF; // color de la card
      border-radius: 24px;
      box-shadow: 0 8px 32px rgba(65, 103, 89, 0.18);
      padding: 0 0 32px 0;
      max-width: 520px;
      width: 100%;
      margin: 48px auto 0 auto;
      animation: popIn 0.8s cubic-bezier(.4,0,.2,1);
    }
    .login-title-box {
      width: 100%;
      text-align: center;
      margin-bottom: 0;
      background: linear-gradient(90deg, #3F6858 0%, #58ae9a 100%);
      border-radius: 24px 24px 0 0;
      box-shadow: none;
      padding: 22px 36px 14px 36px;
      max-width: 100%;
      margin-left: 0;
      margin-right: 0;
      animation: fadeInTitle 1.1s cubic-bezier(.4,0,.2,1), glowTitle 2.5s infinite alternate;
      box-sizing: border-box;
    }
    @keyframes fadeInTitle {
      from { transform: translateY(-40px); opacity: 0; }
      to { transform: translateY(0); opacity: 1; }
    }
    @keyframes glowTitle {
      from { box-shadow: none; }
      to { box-shadow: 0 0 32px 4px #58ae9a55; }
    }
    .login-title {
      text-align: center;
      font-size: 2.2rem;
      font-weight: 800;
      color: #fff;
      margin: 0;
      letter-spacing: 0.5px;
      font-family: 'Roboto', Arial, sans-serif;
      line-height: 1.1;
      text-shadow: 0 2px 8px rgba(65, 103, 89, 0.13), 0 0 12px #58ae9a55;
      transition: text-shadow 0.3s;
    }
    .login-title-box:hover .login-title {
      text-shadow: 0 2px 16px #58ae9a, 0 0 24px #3F6858;
    }
    .login-card.login-card-merged {
      width: 100%;
      border-radius: 0 0 24px 24px;
      margin-top: 0;
      box-shadow: none;
      background: transparent;
      padding: 32px 36px 28px 36px;
      animation: none;
      max-width: 100%;
      box-sizing: border-box;
    }
    .login-center-box {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      z-index: 2;
    }
    .login-card {
      width: 370px;
      padding: 32px 20px 28px 20px;
      border-radius: 18px;
      box-shadow: 0 8px 32px rgba(65, 103, 89, 0.18);
      background: rgba(255,255,255,0.98);
      backdrop-filter: blur(2px);
      animation: popIn 0.8s;
    }
    @keyframes popIn {
      from { transform: scale(0.95); opacity: 0; }
      to { transform: scale(1); opacity: 1; }
    }
    .login-avatar {
      font-size: 2.5rem;
      vertical-align: middle;
      margin-right: 10px;
      color: #3F6858;
      background: #e8f4f1;
      border-radius: 50%;
      padding: 8px;
      box-shadow: 0 2px 8px rgba(65, 103, 89, 0.10);
      display: inline-flex;
      align-items: center;
      justify-content: center;
    }
    mat-card-title {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      color: #416759;
      font-weight: 700;
      font-size: 1.3rem;
      margin-bottom: 8px;
    }
    mat-card-header {
      padding-bottom: 0;
    }
    mat-card-content {
      margin-top: 10px;
    }
    form {
      width: 100%;
    }
    mat-form-field.full-width {
      width: 100%;
      font-size: 1.08rem;
      min-width: 220px;
      /* Evita que el label se corte */
    }
    .mat-form-field-label {
      white-space: nowrap;
      overflow: visible;
      text-overflow: unset;
      max-width: 100%;
    }
    input[matInput] {
      font-size: 1.08rem;
      padding: 8px 12px;
      height: 32px;
      box-sizing: border-box;
      line-height: 1.4;
    }
    .mat-form-field-infix {
      min-height: 40px;
      display: flex;
      align-items: center;
    }
    .mat-form-field-wrapper {
      padding-bottom: 2px !important;
    }
    .mat-form-field-appearance-outline .mat-form-field-outline {
      border-width: 2px;
    }
    mat-form-field .mat-icon {
      color: #416759;
    }
    button[mat-icon-button][matSuffix] {
      margin-right: 4px;
    }
    .login-error {
      color: #d32f2f;
      margin-bottom: 10px;
      text-align: center;
      font-weight: 500;
      font-size: 1rem;
      animation: shake 0.3s;
    }
    @keyframes shake {
      0% { transform: translateX(0); }
      25% { transform: translateX(-5px); }
      50% { transform: translateX(5px); }
      75% { transform: translateX(-5px); }
      100% { transform: translateX(0); }
    }
  `]
})
export class LoginComponent {
  loginForm: FormGroup;
  hide: boolean = true;
  errorMessage: string = '';
  loading: boolean = false;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private authService: AuthService
  ) {
    this.loginForm = this.fb.group({
      username: ['', Validators.required],
      password: ['', Validators.required]
    });
  }

  onSubmit() {
    if (this.loginForm.valid) {
      this.errorMessage = '';
      this.loading = true;
      const { username, password } = this.loginForm.value;
      this.authService.login(username, password).subscribe({
        next: () => {
          this.loading = false;
          this.router.navigate(['/']);
        },
        error: (err) => {
          this.loading = false;
          // Manejo específico de errores
          if (err?.error?.detail?.includes('Usuario inactivo')) {
            this.errorMessage = 'Su cuenta no está activa.';
          } else if (err?.status === 401) {
            this.errorMessage = 'Usuario, email o contraseña incorrectos.';
          } else if (err?.error?.detail) {
            this.errorMessage = err.error.detail;
          } else {
            this.errorMessage = 'Credenciales incorrectas o error de conexión.';
          }
        }
      });
    }
  }
}