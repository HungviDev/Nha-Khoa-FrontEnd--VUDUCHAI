// ==============================================================================
// LOGIN COMPONENT - OCEAN DENTAL SECURE AUTHENTICATION SCREEN
// ==============================================================================

import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';

// Ng-Zorro Modules
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzCheckboxModule } from 'ng-zorro-antd/checkbox';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzAlertModule } from 'ng-zorro-antd/alert';

import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    NzFormModule,
    NzInputModule,
    NzButtonModule,
    NzIconModule,
    NzCheckboxModule,
    NzAlertModule
  ],
  template: `
    <div class="login-wrapper">
      <div class="login-card">
        <div class="login-brand">
          <div class="logo-icon">
            <span nz-icon nzType="medicine-box"></span>
          </div>
          <h1>Nha khoa An Tâm</h1>
          <p>Hệ thống Quản lý Khám Chữa Bệnh Nha Khoa</p>
        </div>

        @if (errorMessage()) {
          <nz-alert
            nzType="error"
            [nzMessage]="errorMessage()!"
            nzShowIcon
            class="mb-4"
          ></nz-alert>
        }

        <form [formGroup]="loginForm" (ngSubmit)="submitLogin()" nz-form nzLayout="vertical">
          <nz-form-item>
            <nz-form-label nzRequired>Email hoặc Số điện thoại</nz-form-label>
            <nz-form-control nzErrorTip="Vui lòng nhập Email hoặc SĐT đăng nhập!">
              <nz-input-group nzPrefixIcon="user">
                <input
                  type="text"
                  nz-input
                  formControlName="username"
                  placeholder="admin@dental.com / doctor / 0987654321"
                />
              </nz-input-group>
            </nz-form-control>
          </nz-form-item>

          <nz-form-item>
            <nz-form-label nzRequired>Mật khẩu</nz-form-label>
            <nz-form-control nzErrorTip="Vui lòng nhập mật khẩu!">
              <nz-input-group nzPrefixIcon="lock">
                <input
                  type="password"
                  nz-input
                  formControlName="password"
                  placeholder="Nhập mật khẩu"
                />
              </nz-input-group>
            </nz-form-control>
          </nz-form-item>

          <div class="login-options">
            <label nz-checkbox formControlName="remember">Ghi nhớ đăng nhập</label>
            <a class="forgot-link">Quên mật khẩu?</a>
          </div>

          <button
            nz-button
            nzType="primary"
            nzBlock
            [nzLoading]="isLoading()"
            class="login-btn"
          >
            Đăng Nhập Hệ Thống
          </button>

          <div class="register-prompt">
            <span>Chưa có tài khoản?</span>
            <a routerLink="/auth/register" class="register-link">Đăng ký khám ngay</a>
          </div>
        </form>

        <div class="quick-demo-accounts">
          <small class="demo-title">Tài khoản thử nghiệm nhanh (Demo):</small>
          <div class="demo-badges">
            <button nz-button nzSize="small" (click)="fillDemo('admin@dental.com', 'Admin@123')">
              Admin
            </button>
            <button nz-button nzSize="small" (click)="fillDemo('doctor@dental.com', 'Doctor@123')">
              Bác sĩ
            </button>
            <button nz-button nzSize="small" (click)="fillDemo('patient@dental.com', 'Patient@123')">
              Bệnh nhân
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    @use '../../../styles/variables' as *;

    .login-wrapper {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: radial-gradient(circle at 50% 50%, #e0f2fe 0%, #f0f9ff 50%, #ffffff 100%);
      padding: 24px;
    }

    .login-card {
      width: 100%;
      max-width: 440px;
      background: #ffffff;
      border-radius: 16px;
      box-shadow: 0 10px 40px rgba(2, 132, 199, 0.12);
      border: 1px solid #bae6fd;
      padding: 36px 32px;

      .login-brand {
        text-align: center;
        margin-bottom: 28px;

        .logo-icon {
          width: 54px;
          height: 54px;
          margin: 0 auto 12px;
          border-radius: 14px;
          background: linear-gradient(135deg, #0284c7 0%, #0ea5e9 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          color: #ffffff;
          font-size: 28px;
          box-shadow: 0 6px 16px rgba(2, 132, 199, 0.35);
        }

        h1 {
          font-size: 22px;
          font-weight: 800;
          color: #075985;
          margin: 0;
          letter-spacing: 0.8px;
        }

        p {
          font-size: 13px;
          color: #64748b;
          margin: 4px 0 0;
        }
      }

      .login-options {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 20px;
        font-size: 13px;

        .forgot-link {
          color: #0284c7;
        }
      }

      .login-btn {
        height: 44px;
        font-size: 15px;
        font-weight: 600;
      }

      .register-prompt {
        text-align: center;
        margin-top: 14px;
        font-size: 13px;
        color: #64748b;

        .register-link {
          color: #0284c7;
          font-weight: 600;
          margin-left: 6px;
        }
      }

      .quick-demo-accounts {
        margin-top: 24px;
        padding-top: 16px;
        border-top: 1px dashed #e2e8f0;
        text-align: center;

        .demo-title {
          color: #64748b;
          display: block;
          margin-bottom: 8px;
        }

        .demo-badges {
          display: flex;
          gap: 8px;
          justify-content: center;
        }
      }

      .mb-4 {
        margin-bottom: 16px;
      }
    }
  `]
})
export class LoginComponent {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly message = inject(NzMessageService);

  readonly isLoading = signal<boolean>(false);
  readonly errorMessage = signal<string | null>(null);

  loginForm: FormGroup = this.fb.group({
    username: ['', [Validators.required]],
    password: ['', [Validators.required, Validators.minLength(4)]],
    remember: [true]
  });

  submitLogin(): void {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set(null);

    const { username, password } = this.loginForm.value;
    this.authService.login({ username, password }).subscribe({
      next: (res) => {
        if (res.success) {
          this.authService.setTokens(res.data.accessToken, res.data.refreshToken);
          console.log(this.authService.getAccessToken(), 'token khi set vao local');
          this.isLoading.set(false);
          this.message.success('Đăng nhập thành công!');
          const defaultRoute = this.authService.getDefaultRouteForRole();
          const rawReturnUrl = this.route.snapshot.queryParams['returnUrl'];
          let targetRoute = defaultRoute;
          if (
            rawReturnUrl &&
            rawReturnUrl !== '/' &&
            !rawReturnUrl.includes('/auth/') &&
            rawReturnUrl !== '/unauthorized'
          ) {
            const role = this.authService.userRole();
            // If returnUrl was defaulted to /patient/booking but user is an ADMIN or DOCTOR,
            // prioritize directing them to their own role's Dashboard
            if (role === 'ADMIN') {
              targetRoute = rawReturnUrl.startsWith('/patient/booking') ? defaultRoute : rawReturnUrl;
            } else if (role === 'DOCTOR') {
              targetRoute =
                rawReturnUrl.startsWith('/doctor/') || rawReturnUrl === '/profile'
                  ? rawReturnUrl
                  : defaultRoute;
            } else if (role === 'PATIENT') {
              targetRoute =
                rawReturnUrl.startsWith('/patient/') || rawReturnUrl === '/profile'
                  ? rawReturnUrl
                  : defaultRoute;
            }
          }

          this.router.navigateByUrl(targetRoute).catch(() => {
            this.router.navigate([defaultRoute]);
          });
        }

      },
      error: err => {
        this.isLoading.set(false);
        const msg = err.error?.message || 'Tài khoản hoặc mật khẩu không chính xác.';
        this.errorMessage.set(msg);
      }
    });
  }

  fillDemo(u: string, p: string): void {
    this.loginForm.patchValue({ username: u, password: p });
  }
}

