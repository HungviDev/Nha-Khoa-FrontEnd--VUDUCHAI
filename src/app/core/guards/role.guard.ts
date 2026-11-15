// ==============================================================================
// ROLE GUARD - FUNCTIONAL RBAC (ROLE-BASED ACCESS CONTROL) GUARD
// ==============================================================================

import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { AuthService } from '../services/auth.service';

export const roleGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const notification = inject(NzNotificationService);

  // If not logged in, redirect to login
  if (!authService.getAccessToken()) {
    const isDefault = !state.url || state.url === '/' || state.url === '/patient/booking';
    return router.createUrlTree(['/auth/login'], {
      queryParams: isDefault ? {} : { returnUrl: state.url }
    });
  }

  const expectedRoles = (route.data?.['roles'] as string[]) || [];

  // If no specific roles required on route, grant access
  if (expectedRoles.length === 0) {
    return true;
  }

  // Check if current user role matches any expected roles
  if (authService.hasRole(expectedRoles)) {
    return true;
  }

  // Unauthorized role: Notify user and redirect to appropriate dashboard or /unauthorized
  notification.warning(
    'Hạn chế quyền truy cập',
    'Tài khoản của bạn không có quyền truy cập vào phân hệ này.',
    { nzDuration: 4000 }
  );

  const defaultRoute = authService.getDefaultRouteForRole();
  // Prevent infinite redirection loops
  if (state.url !== defaultRoute && defaultRoute !== '/auth/login') {
    return router.createUrlTree([defaultRoute]);
  }

  return router.createUrlTree(['/unauthorized']);
};

