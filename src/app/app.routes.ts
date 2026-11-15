// ==============================================================================
// APP ROUTING CONFIGURATION - ENTERPRISE MODULAR LAZY-LOADED RBAC ROUTES
// ==============================================================================

import { inject } from '@angular/core';
import { Routes, Router } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { roleGuard } from './core/guards/role.guard';
import { AuthService } from './core/services/auth.service';
import { MainLayoutComponent } from './layouts/main-layout/main-layout.component';

export const routes: Routes = [
  // ----------------------------------------------------------------------------
  // 1. PUBLIC ROUTES
  // ----------------------------------------------------------------------------
  {
    path: 'auth/login',
    loadComponent: () => import('./features/auth/login.component').then(m => m.LoginComponent)
  },
  {
    path: 'auth/register',
    loadComponent: () => import('./features/auth/register.component').then(m => m.RegisterComponent)
  },
  {
    path: 'unauthorized',
    loadComponent: () => import('./features/auth/unauthorized.component').then(m => m.UnauthorizedComponent)
  },

  // ----------------------------------------------------------------------------
  // 2. AUTHENTICATED WORKSPACE (WRAPPED IN MAIN LAYOUT SHELL)
  // ----------------------------------------------------------------------------
  {
    path: '',
    component: MainLayoutComponent,
    canActivate: [authGuard],
    children: [
      // ------------------------------------------------------------------------
      // PATIENT SUB-SYSTEM
      // ------------------------------------------------------------------------
      {
        path: 'patient/booking',
        canActivate: [roleGuard],
        data: { roles: ['PATIENT', 'ADMIN'] },
        loadComponent: () =>
          import('./features/appointments/appointment-management.component').then(m => m.AppointmentManagementComponent)
      },
      {
        path: 'patient/appointments',
        canActivate: [roleGuard],
        data: { roles: ['PATIENT', 'ADMIN'] },
        loadComponent: () =>
          import('./features/appointments/appointment-management.component').then(m => m.AppointmentManagementComponent)
      },
      {
        path: 'patient/treatment-routes',
        canActivate: [roleGuard],
        data: { roles: ['PATIENT', 'ADMIN'] },
        loadComponent: () =>
          import('./features/treatments/treatment-route-detail.component').then(m => m.TreatmentRouteDetailComponent)
      },
      {
        path: 'patient/medical-records',
        canActivate: [roleGuard],
        data: { roles: ['PATIENT', 'ADMIN'] },
        loadComponent: () =>
          import('./features/medical-records/medical-record-list.component').then(m => m.MedicalRecordListComponent)
      },
      {
        path: 'patient/payments',
        canActivate: [roleGuard],
        data: { roles: ['PATIENT', 'ADMIN'] },
        loadComponent: () =>
          import('./features/payments/payment-management.component').then(m => m.PaymentManagementComponent)
      },

      // ------------------------------------------------------------------------
      // DOCTOR SUB-SYSTEM
      // ------------------------------------------------------------------------
      {
        path: 'doctor/appointments',
        canActivate: [roleGuard],
        data: { roles: ['DOCTOR', 'ADMIN'] },
        loadComponent: () =>
          import('./features/appointments/appointment-management.component').then(m => m.AppointmentManagementComponent)
      },
      {
        path: 'doctor/treatments',
        canActivate: [roleGuard],
        data: { roles: ['DOCTOR', 'ADMIN'] },
        loadComponent: () =>
          import('./features/treatments/treatment-route-detail.component').then(m => m.TreatmentRouteDetailComponent)
      },
      {
        path: 'doctor/treatments/:id',
        canActivate: [roleGuard],
        data: { roles: ['DOCTOR', 'ADMIN'] },
        loadComponent: () =>
          import('./features/treatments/treatment-route-detail.component').then(m => m.TreatmentRouteDetailComponent)
      },
      {
        path: 'doctor/medical-records',
        canActivate: [roleGuard],
        data: { roles: ['DOCTOR', 'ADMIN'] },
        loadComponent: () =>
          import('./features/medical-records/medical-record-list.component').then(m => m.MedicalRecordListComponent)
      },
      {
        path: 'doctor/patients',
        canActivate: [roleGuard],
        data: { roles: ['DOCTOR', 'ADMIN'] },
        loadComponent: () =>
          import('./features/users/user-management.component').then(m => m.UserManagementComponent)
      },
      {
        path: 'doctor/profile',
        canActivate: [roleGuard],
        data: { roles: ['DOCTOR', 'ADMIN'] },
        loadComponent: () =>
          import('./features/profile/user-profile.component').then(m => m.UserProfileComponent)
      },

      // ------------------------------------------------------------------------
      // ADMIN SUB-SYSTEM
      // ------------------------------------------------------------------------
      {
        path: 'admin/dashboard',
        canActivate: [roleGuard],
        data: { roles: ['ADMIN'] },
        loadComponent: () =>
          import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent)
      },
      {
        path: 'admin/users',
        canActivate: [roleGuard],
        data: { roles: ['ADMIN'] },
        loadComponent: () =>
          import('./features/users/user-management.component').then(m => m.UserManagementComponent)
      },
      {
        path: 'admin/roles',
        canActivate: [roleGuard],
        data: { roles: ['ADMIN'] },
        loadComponent: () =>
          import('./features/roles/role-management.component').then(m => m.RoleManagementComponent)
      },
      {
        path: 'admin/doctors',
        canActivate: [roleGuard],
        data: { roles: ['ADMIN'] },
        loadComponent: () =>
          import('./features/doctors/doctor-management.component').then(m => m.DoctorManagementComponent)
      },
      {
        path: 'admin/services',
        canActivate: [roleGuard],
        data: { roles: ['ADMIN'] },
        loadComponent: () =>
          import('./features/services/service-catalog.component').then(m => m.ServiceCatalogComponent)
      },
      {
        path: 'admin/appointments',
        canActivate: [roleGuard],
        data: { roles: ['ADMIN'] },
        loadComponent: () =>
          import('./features/appointments/appointment-management.component').then(m => m.AppointmentManagementComponent)
      },
      {
        path: 'admin/treatments',
        canActivate: [roleGuard],
        data: { roles: ['ADMIN'] },
        loadComponent: () =>
          import('./features/treatments/treatment-route-detail.component').then(m => m.TreatmentRouteDetailComponent)
      },
      {
        path: 'admin/medical-records',
        canActivate: [roleGuard],
        data: { roles: ['ADMIN'] },
        loadComponent: () =>
          import('./features/medical-records/medical-record-list.component').then(m => m.MedicalRecordListComponent)
      },
      {
        path: 'admin/payments',
        canActivate: [roleGuard],
        data: { roles: ['ADMIN'] },
        loadComponent: () =>
          import('./features/payments/payment-management.component').then(m => m.PaymentManagementComponent)
      },

      // ------------------------------------------------------------------------
      // SHARED USER PROFILE
      // ------------------------------------------------------------------------
      {
        path: 'profile',
        loadComponent: () =>
          import('./features/profile/user-profile.component').then(m => m.UserProfileComponent)
      },

      // Dynamic Role-Based Default Dashboard Route
      {
        path: '',
        pathMatch: 'full',
        redirectTo: () => {
          const authService = inject(AuthService);
          const defaultRoute = authService.getDefaultRouteForRole();
          return defaultRoute && defaultRoute !== '/auth/login'
            ? defaultRoute.replace(/^\//, '')
            : 'patient/booking';
        }
      }
    ]
  },

  // ----------------------------------------------------------------------------
  // 3. FALLBACK CATCH-ALL ROUTE
  // ----------------------------------------------------------------------------
  {
    path: '**',
    redirectTo: 'auth/login'
  }
];

