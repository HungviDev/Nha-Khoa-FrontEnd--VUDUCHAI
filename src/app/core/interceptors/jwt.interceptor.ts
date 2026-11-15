// ==============================================================================
// JWT INTERCEPTOR - FUNCTIONAL HTTP INTERCEPTOR WITH REFRESH TOKEN QUEUE
// ==============================================================================

import { HttpErrorResponse, HttpHandlerFn, HttpInterceptorFn, HttpRequest } from '@angular/common/http';
import { inject } from '@angular/core';
import { BehaviorSubject, catchError, filter, switchMap, take, throwError } from 'rxjs';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { AuthService } from '../services/auth.service';

let isRefreshing = false;
const refreshTokenSubject = new BehaviorSubject<string | null>(null);

/**
 * Functional JWT Interceptor for Angular 18+
 */
export const jwtInterceptor: HttpInterceptorFn = (req: HttpRequest<unknown>, next: HttpHandlerFn) => {
  const authService = inject(AuthService);
  const notification = inject(NzNotificationService);

  // Check if endpoint is public auth endpoint
  const isAuthEndpoint = req.url.includes('/auth/login') ||
    req.url.includes('/auth/register') ||
    req.url.includes('/auth/refresh-token');

  let authReq = req;
  const token = authService.getAccessToken();

  if (token && !isAuthEndpoint) {
    authReq = addTokenHeader(req, token);
  }

  return next(authReq).pipe(
    catchError((error: any) => {
      if (error instanceof HttpErrorResponse) {
        // Handle 401 Unauthorized (Expired or invalid token)
        if (error.status === 401 && !isAuthEndpoint) {
          return handle401Error(authReq, next, authService);
        }

        // Handle 403 Forbidden (Insufficient permissions)
        if (error.status === 403) {
          notification.error(
            'Truy cập bị từ chối',
            'Bạn không có quyền thực hiện thao tác này.',
            { nzDuration: 4000 }
          );
        }
      }

      return throwError(() => error);
    })
  );
};

/**
 * Attach Bearer token to Authorization header
 */
function addTokenHeader(request: HttpRequest<unknown>, token: string): HttpRequest<unknown> {
  return request.clone({
    setHeaders: {
      Authorization: `Bearer ${token}`
    }
  });
}

/**
 * Manage Refresh Token Queue with BehaviorSubject to retry pending HTTP requests
 */
function handle401Error(
  request: HttpRequest<unknown>,
  next: HttpHandlerFn,
  authService: AuthService
) {
  if (!isRefreshing) {
    isRefreshing = true;
    refreshTokenSubject.next(null);

    return authService.refreshToken().pipe(
      switchMap((response: any) => {
        isRefreshing = false;
        const newAccessToken = response.data.accessToken;
        refreshTokenSubject.next(newAccessToken);
        return next(addTokenHeader(request, newAccessToken));
      }),
      catchError((err: any) => {
        isRefreshing = false;
        refreshTokenSubject.next(null);
        authService.logout();
        return throwError(() => err);
      })
    );
  } else {
    // If refresh token request is already in-flight, wait until token is updated
    return refreshTokenSubject.pipe(
      filter((token: any) => token !== null),
      take(1),
      switchMap((token: any) => {
        return next(addTokenHeader(request, token!));
      })
    );
  }
}
