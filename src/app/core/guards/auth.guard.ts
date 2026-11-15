// ==============================================================================
// AUTH GUARD - FUNCTIONAL ROUTE GUARD FOR AUTHENTICATION CHECK
// ==============================================================================

import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.getAccessToken()) {
    return true;
  }

  // Not authenticated: redirect to login
  // Avoid trapping default route or root as returnUrl
  const isDefaultOrRoot = !state.url || state.url === '/' || state.url === '/patient/booking';
  return router.createUrlTree(['/auth/login'], {
    queryParams: isDefaultOrRoot ? {} : { returnUrl: state.url }
  });
};

