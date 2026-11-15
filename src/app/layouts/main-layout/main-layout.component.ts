// ==============================================================================
// MAIN LAYOUT COMPONENT - RESPONSIVE SHELL WITH DYNAMIC ROLE-BASED NAVIGATION
// ==============================================================================

import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';

// Ng-Zorro Modules
import { NzLayoutModule } from 'ng-zorro-antd/layout';
import { NzMenuModule } from 'ng-zorro-antd/menu';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzDropDownModule } from 'ng-zorro-antd/dropdown';
import { NzAvatarModule } from 'ng-zorro-antd/avatar';
import { NzBadgeModule } from 'ng-zorro-antd/badge';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzBreadCrumbModule } from 'ng-zorro-antd/breadcrumb';

import { AuthService } from '../../core/services/auth.service';
import { MenuItem, SIDEBAR_MENU_CONFIG } from './menu.config';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    NzLayoutModule,
    NzMenuModule,
    NzIconModule,
    NzDropDownModule,
    NzAvatarModule,
    NzBadgeModule,
    NzButtonModule,
    NzTagModule,
    NzBreadCrumbModule
  ],
  templateUrl: './main-layout.component.html',
  styleUrls: ['./main-layout.component.scss']
})
export class MainLayoutComponent {
  readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  // Layout State Signals
  readonly isCollapsed = signal<boolean>(false);
  readonly currentUser = this.authService.currentUser;
  readonly userRole = this.authService.userRole;

  /**
   * Dynamically compute the menu items for the authenticated user's role
   */
  readonly menuItems = computed<MenuItem[]>(() => {
    const role = this.userRole();
    if (role === 'ADMIN') return SIDEBAR_MENU_CONFIG.ADMIN;
    if (role === 'DOCTOR') return SIDEBAR_MENU_CONFIG.DOCTOR;
    if (role === 'PATIENT') return SIDEBAR_MENU_CONFIG.PATIENT;
    return [];
  });

  /**
   * Human-friendly label for current user role
   */
  readonly roleLabel = computed<string>(() => {
    const role = this.userRole();
    switch (role) {
      case 'ADMIN':
        return 'Quản trị viên';
      case 'DOCTOR':
        return 'Bác sĩ Nha khoa';
      case 'PATIENT':
        return 'Bệnh nhân';
      default:
        return 'Khách hàng';
    }
  });

  /**
   * Role badge color
   */
  readonly roleBadgeColor = computed<string>(() => {
    const role = this.userRole();
    switch (role) {
      case 'ADMIN':
        return 'purple';
      case 'DOCTOR':
        return 'blue';
      case 'PATIENT':
        return 'cyan';
      default:
        return 'default';
    }
  });

  toggleCollapsed(): void {
    this.isCollapsed.update(val => !val);
  }

  logout(): void {
    this.authService.logout('/auth/login');
  }

  navigateToProfile(): void {
    const role = this.userRole();
    if (role === 'DOCTOR') {
      this.router.navigate(['/doctor/profile']);
    } else {
      this.router.navigate(['/profile']);
    }
  }
}

