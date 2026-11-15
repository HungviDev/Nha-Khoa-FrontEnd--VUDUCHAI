// ==============================================================================
// UNAUTHORIZED COMPONENT - ACCESS DENIED (403) DISPLAY
// ==============================================================================

import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { NzResultModule } from 'ng-zorro-antd/result';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-unauthorized',
  standalone: true,
  imports: [CommonModule, NzResultModule, NzButtonModule],
  template: `
    <div class="unauthorized-page">
      <nz-result
        nzStatus="403"
        nzTitle="403 - Quyền Truy Cập Bị Hạn Chế"
        nzSubTitle="Xin lỗi, tài khoản của bạn không có đủ thẩm quyền y tế để truy cập vào phân hệ này."
      >
        <div nz-result-extra>
          <button nz-button nzType="primary" (click)="goHome()">
            Quay về Bảng điều khiển của tôi
          </button>
        </div>
      </nz-result>
    </div>
  `,
  styles: [`
    .unauthorized-page {
      min-height: 80vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 32px;
    }
  `]
})
export class UnauthorizedComponent {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  goHome(): void {
    const route = this.authService.getDefaultRouteForRole();
    this.router.navigate([route]);
  }
}

