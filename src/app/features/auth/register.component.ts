// ==============================================================================
// REGISTER COMPONENT - PATIENT SELF-REGISTRATION
// ==============================================================================

import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';

// Ng-Zorro Modules
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzDatePickerModule } from 'ng-zorro-antd/date-picker';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzAlertModule } from 'ng-zorro-antd/alert';

import { AuthService } from '../../core/services/auth.service';
import { RegisterRequest } from '../../core/models/dental.models';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    NzFormModule,
    NzInputModule,
    NzButtonModule,
    NzIconModule,
    NzDatePickerModule,
    NzAlertModule
  ],
  template: `
    <div class="register-wrapper">
      <div class="register-card">
        <div class="register-brand">
          <div class="logo-icon">
            <span nz-icon nzType="medicine-box"></span>
          </div>
          <h1>OCEAN DENTAL</h1>
          <p>Đăng Ký Hồ Sơ Khám Bệnh Nhân Mới</p>
        </div>

        @if (errorMessage()) {
          <nz-alert
            nzType="error"
            [nzMessage]="errorMessage()!"
            nzShowIcon
            class="mb-4"
          ></nz-alert>
        }

        <form [formGroup]="registerForm" (ngSubmit)="submitRegister()" nz-form nzLayout="vertical">
          <nz-form-item>
            <nz-form-label nzRequired>Họ và tên</nz-form-label>
            <nz-form-control nzErrorTip="Vui lòng nhập họ và tên!">
              <nz-input-group nzPrefixIcon="user">
                <input nz-input formControlName="fullname" placeholder="Nguyễn Văn A" />
              </nz-input-group>
            </nz-form-control>
          </nz-form-item>

          <div class="grid-2-cols">
            <nz-form-item>
              <nz-form-label nzRequired>Số điện thoại</nz-form-label>
              <nz-form-control nzErrorTip="Số điện thoại từ 9 đến 15 chữ số!">
                <nz-input-group nzPrefixIcon="phone">
                  <input nz-input formControlName="phone" placeholder="0901234567" />
                </nz-input-group>
              </nz-form-control>
            </nz-form-item>

            <nz-form-item>
              <nz-form-label nzRequired>Email</nz-form-label>
              <nz-form-control nzErrorTip="Vui lòng nhập email hợp lệ!">
                <nz-input-group nzPrefixIcon="mail">
                  <input nz-input formControlName="email" type="email" placeholder="patient@gmail.com" />
                </nz-input-group>
              </nz-form-control>
            </nz-form-item>
          </div>

          <div class="grid-2-cols">
            <nz-form-item>
              <nz-form-label nzRequired>Mật khẩu</nz-form-label>
              <nz-form-control nzErrorTip="Mật khẩu tối thiểu 6 ký tự!">
                <nz-input-group nzPrefixIcon="lock">
                  <input nz-input formControlName="password" type="password" placeholder="Mật khẩu bảo mật" />
                </nz-input-group>
              </nz-form-control>
            </nz-form-item>

            <nz-form-item>
              <nz-form-label>Ngày sinh</nz-form-label>
              <nz-form-control>
                <nz-date-picker formControlName="birthDate" class="w-full" nzFormat="yyyy-MM-dd"></nz-date-picker>
              </nz-form-control>
            </nz-form-item>
          </div>

          <nz-form-item>
            <nz-form-label>Địa chỉ thường trú</nz-form-label>
            <nz-form-control>
              <input nz-input formControlName="address" placeholder="Số nhà, đường, quận/huyện..." />
            </nz-form-control>
          </nz-form-item>

          <button
            nz-button
            nzType="primary"
            nzBlock
            [nzLoading]="isLoading()"
            class="register-btn"
          >
            Đăng Ký Tài Khoản Bệnh Nhân
          </button>
        </form>

        <div class="bottom-links">
          <span>Đã có tài khoản?</span>
          <a routerLink="/auth/login" class="login-link">Đăng nhập ngay</a>
        </div>
      </div>
    </div>
  `,
  styles: [`
    @use '../../../styles/variables' as *;

    .register-wrapper {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: radial-gradient(circle at 50% 50%, #e0f2fe 0%, #f0f9ff 50%, #ffffff 100%);
      padding: 32px 20px;
    }

    .register-card {
      width: 100%;
      max-width: 520px;
      background: #ffffff;
      border-radius: 16px;
      box-shadow: 0 10px 40px rgba(2, 132, 199, 0.12);
      border: 1px solid #bae6fd;
      padding: 36px 32px;

      .register-brand {
        text-align: center;
        margin-bottom: 24px;

        .logo-icon {
          width: 50px;
          height: 50px;
          margin: 0 auto 10px;
          border-radius: 12px;
          background: linear-gradient(135deg, #0284c7 0%, #0ea5e9 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          color: #ffffff;
          font-size: 26px;
          box-shadow: 0 4px 14px rgba(2, 132, 199, 0.35);
        }

        h1 {
          font-size: 20px;
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

      .register-btn {
        height: 44px;
        font-size: 15px;
        font-weight: 600;
        margin-top: 12px;
      }

      .bottom-links {
        margin-top: 20px;
        text-align: center;
        font-size: 13px;
        color: #64748b;

        .login-link {
          color: #0284c7;
          font-weight: 600;
          margin-left: 6px;
        }
      }

      .mb-4 {
        margin-bottom: 16px;
      }
    }

    .grid-2-cols {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;

      @media (max-width: 540px) {
        grid-template-columns: 1fr;
      }
    }

    .w-full {
      width: 100%;
    }
  `]
})
export class RegisterComponent {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly message = inject(NzMessageService);

  readonly isLoading = signal<boolean>(false);
  readonly errorMessage = signal<string | null>(null);

  registerForm: FormGroup = this.fb.group({
    fullname: ['', [Validators.required, Validators.maxLength(100)]],
    phone: ['', [Validators.required, Validators.pattern('^[0-9]{9,15}$')]],
    email: ['', [Validators.required, Validators.email, Validators.maxLength(100)]],
    password: ['', [Validators.required, Validators.minLength(6), Validators.maxLength(50)]],
    birthDate: [null],
    address: ['']
  });

  submitRegister(): void {
    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set(null);

    const val = this.registerForm.value;
    const request: RegisterRequest = {
      fullname: val.fullname,
      phone: val.phone,
      email: val.email,
      password: val.password,
      birthDate: val.birthDate ? this.formatDate(val.birthDate) : undefined,
      address: val.address || undefined
    };

    this.authService.register(request).subscribe({
      next: () => {
        this.isLoading.set(false);
        this.message.success('Đăng ký tài khoản thành công! Vui lòng đăng nhập.');
        this.router.navigate(['/auth/login']);
      },
      error: err => {
        this.isLoading.set(false);
        const msg = err.error?.message || 'Lỗi khi đăng ký tài khoản bệnh nhân.';
        this.errorMessage.set(msg);
      }
    });
  }

  private formatDate(d: Date): string {
    const pad = (n: number) => n.toString().padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  }
}

