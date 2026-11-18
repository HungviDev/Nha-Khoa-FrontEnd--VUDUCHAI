// ==============================================================================
// AUTH SERVICE - ANGULAR SIGNALS-BASED AUTHENTICATION & SESSION MANAGEMENT
// ==============================================================================

import { Injectable, computed, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, catchError, map, of, tap, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  ApiResponse,
  AuthResponse,
  LoginRequest,
  RefreshTokenRequest,
  RegisterRequest,
  User,
  UserRole
} from '../models/dental.models';

const ACCESS_TOKEN_KEY = 'dental_access_token';
const REFRESH_TOKEN_KEY = 'dental_refresh_token';
const USER_KEY = 'dental_current_user';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);
  private readonly baseUrl = `${environment.apiUrl}/auth`;

  // ----------------------------------------------------------------------------
  // SIGNALS STATE
  // ----------------------------------------------------------------------------
  readonly currentUser = signal<User | null>(this.getStoredUser());
  readonly isLoading = signal<boolean>(false);

  /**
   * Computed signal for user's normalized role: 'ADMIN' | 'DOCTOR' | 'PATIENT' | null
   */
  readonly userRole = computed<string | null>(() => {
    const user = this.currentUser();
    if (user && user.role) {
      if (typeof user.role === 'object' && 'name' in user.role && user.role.name) {
        return user.role.name.replace(/^ROLE_/, '').toUpperCase();
      }
      if (typeof user.role === 'string') {
        return (user.role as string).replace(/^ROLE_/, '').toUpperCase();
      }
    }

    // Fallback: extract role claim directly from decoded JWT token
    return this.getRoleFromToken();
  });

  /**
     * Computed signal checking if user is currently authenticated
     */
  readonly isAuthenticated = computed<boolean>(() => {
    return !!this.getAccessToken();
  });

  constructor() {
    // If token exists on app launch, fetch latest profile from backend
    // if (this.getAccessToken()) {
    //   this.getMe().subscribe({
    //     error: () => this.clearSession()
    //   });
    // }
  }

  // ----------------------------------------------------------------------------
  // TOKEN STORAGE UTILITIES
  // ----------------------------------------------------------------------------

  getAccessToken(): string | null {
    return localStorage.getItem(ACCESS_TOKEN_KEY);
  }

  getRefreshToken(): string | null {
    return localStorage.getItem(REFRESH_TOKEN_KEY);
  }

  /**
   * Safely decode payload from stored JWT token to extract roles claim
   */
  getRoleFromToken(): string | null {
    const token = this.getAccessToken();
    if (!token) return null;
    try {
      const parts = token.split('.');
      if (parts.length < 2) return null;
      let base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
      while (base64.length % 4) {
        base64 += '=';
      }
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      const payload = JSON.parse(jsonPayload);
      if (Array.isArray(payload.roles) && payload.roles.length > 0) {
        return String(payload.roles[0]).replace(/^ROLE_/, '').toUpperCase();
      }
      if (payload.role) {
        return String(payload.role).replace(/^ROLE_/, '').toUpperCase();
      }
    } catch {
      return null;
    }
    return null;
  }

  setTokens(accessToken: string, refreshToken: string): void {
    localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
    localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
  }

  setStoredUser(user: User): void {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
    this.currentUser.set(user);
  }

  getStoredUser(): User | null {
    const raw = localStorage.getItem(USER_KEY);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as User;
    } catch {
      return null;
    }
  }

  clearSession(): void {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    this.currentUser.set(null);
  }

  // ----------------------------------------------------------------------------
  // AUTHENTICATION API ENDPOINTS
  // ----------------------------------------------------------------------------

  /**
   * POST /api/v1/auth/register
   * Register a new patient account
   */
  register(request: RegisterRequest): Observable<ApiResponse<User>> {
    this.isLoading.set(true);
    return this.http.post<ApiResponse<User>>(`${this.baseUrl}/register`, request).pipe(
      tap(() => this.isLoading.set(false)),
      catchError(err => {
        this.isLoading.set(false);
        return throwError(() => err);
      })
    );
  }

  /**
   * POST /api/v1/auth/login
   * Login with email or phone number
   */
  login(request: LoginRequest): Observable<ApiResponse<AuthResponse>> {
    this.isLoading.set(true);
    return this.http.post<ApiResponse<AuthResponse>>(`${this.baseUrl}/login`, request).pipe(
      tap(response => {
        this.isLoading.set(false);
        if (response.success && response.data) {
          this.setSession(response.data);
        }
      }),
      catchError(err => {
        this.isLoading.set(false);
        return throwError(() => err);
      })
    );
  }

  /**
   * POST /api/v1/auth/refresh-token
   * Request a new access token using stored refresh token
   */
  refreshToken(): Observable<ApiResponse<AuthResponse>> {
    const token = this.getRefreshToken();
    if (!token) {
      this.clearSession();
      return throwError(() => new Error('No refresh token available'));
    }

    const payload: RefreshTokenRequest = { refreshToken: token };
    return this.http.post<ApiResponse<AuthResponse>>(`${this.baseUrl}/refresh-token`, payload).pipe(
      tap(response => {
        if (response.success && response.data) {
          this.setSession(response.data);
        }
      }),
      catchError(err => {
        this.clearSession();
        return throwError(() => err);
      })
    );
  }

  /**
   * GET /api/v1/auth/me
   * Get currently authenticated user profile
   */
  getMe(): Observable<ApiResponse<User>> {
    return this.http.get<ApiResponse<User>>(`${this.baseUrl}/me`).pipe(
      tap(response => {
        if (response.success && response.data) {
          this.setStoredUser(response.data);
        }
      }),
      catchError(err => {
        return throwError(() => err);
      })
    );
  }

  /**
   * Logout user and redirect to login page
   */
  logout(redirectUrl: string = '/auth/login'): void {
    this.clearSession();
    this.router.navigate([redirectUrl]);
  }

  /**
   * Save session state from AuthResponse
   */
  private setSession(authData: AuthResponse): void {
    this.setTokens(authData.accessToken, authData.refreshToken);
    if (authData.user) {
      this.setStoredUser(authData.user);
    }
  }

  /**
   * Check if current user has any of the given roles
   */
  hasRole(roles: string[]): boolean {
    const current = this.userRole();
    if (!current) return false;
    const normalizedInputRoles = roles.map(r => r.replace(/^ROLE_/, '').toUpperCase());
    return normalizedInputRoles.includes(current);
  }

  /**
   * Return the default home dashboard route for the current user's role
   */
  getDefaultRouteForRole(): string {
    const role = this.userRole();
    switch (role) {
      case 'ADMIN':
        return '/admin/dashboard';
      case 'DOCTOR':
        return '/doctor/appointments';
      case 'PATIENT':
        return '/patient/booking';
      default:
        return '/auth/login';
    }
  }
}

