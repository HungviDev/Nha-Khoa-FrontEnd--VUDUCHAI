// ==============================================================================
// APP CONFIGURATION - STANDALONE BOOTSTRAP CONFIG & CORE PROVIDERS
// ==============================================================================

import { ApplicationConfig, provideZoneChangeDetection, importProvidersFrom } from '@angular/core';
import { provideRouter, withComponentInputBinding, withViewTransitions } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { registerLocaleData } from '@angular/common';
import vi from '@angular/common/locales/vi';

// Ng-Zorro Ant Design
import { NZ_I18N, vi_VN } from 'ng-zorro-antd/i18n';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzNotificationModule } from 'ng-zorro-antd/notification';
import { NzMessageModule } from 'ng-zorro-antd/message';

// Ant Design Icons Registration
import {
  UserOutline,
  LockOutline,
  CalendarOutline,
  ScheduleOutline,
  BranchesOutline,
  FileTextOutline,
  CreditCardOutline,
  MedicineBoxOutline,
  SolutionOutline,
  TeamOutline,
  IdcardOutline,
  DashboardOutline,
  UsergroupAddOutline,
  SafetyCertificateOutline,
  AppstoreOutline,
  FileProtectOutline,
  DollarOutline,
  PlusOutline,
  PlusCircleOutline,
  CheckOutline,
  CloseCircleOutline,
  EditOutline,
  DeleteOutline,
  ReloadOutline,
  MenuFoldOutline,
  MenuUnfoldOutline,
  HomeOutline,
  DownOutline,
  LogoutOutline,
  ClockCircleOutline,
  FieldTimeOutline,
  ArrowUpOutline,
  InfoCircleOutline,
  RightOutline,
  PlayCircleOutline
} from '@ant-design/icons-angular/icons';

import { routes } from './app.routes';
import { jwtInterceptor } from './core/interceptors/jwt.interceptor';

registerLocaleData(vi);

const icons = [
  UserOutline,
  LockOutline,
  CalendarOutline,
  ScheduleOutline,
  BranchesOutline,
  FileTextOutline,
  CreditCardOutline,
  MedicineBoxOutline,
  SolutionOutline,
  TeamOutline,
  IdcardOutline,
  DashboardOutline,
  UsergroupAddOutline,
  SafetyCertificateOutline,
  AppstoreOutline,
  FileProtectOutline,
  DollarOutline,
  PlusOutline,
  PlusCircleOutline,
  CheckOutline,
  CloseCircleOutline,
  EditOutline,
  DeleteOutline,
  ReloadOutline,
  MenuFoldOutline,
  MenuUnfoldOutline,
  HomeOutline,
  DownOutline,
  LogoutOutline,
  ClockCircleOutline,
  FieldTimeOutline,
  ArrowUpOutline,
  InfoCircleOutline,
  RightOutline,
  PlayCircleOutline
];

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes, withComponentInputBinding(), withViewTransitions()),
    provideHttpClient(withInterceptors([jwtInterceptor])),
    provideAnimationsAsync(),
    { provide: NZ_I18N, useValue: vi_VN },
    importProvidersFrom(NzIconModule.forRoot(icons)),
    importProvidersFrom(NzNotificationModule),
    importProvidersFrom(NzMessageModule)
  ]
};

