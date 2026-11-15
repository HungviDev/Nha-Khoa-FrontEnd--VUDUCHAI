// ==============================================================================
// SIDEBAR MENU CONFIGURATION - ROLE-BASED DYNAMIC NAVIGATION
// ==============================================================================

export interface MenuItem {
  title: string;
  route?: string;
  icon: string;
  badge?: string;
  children?: MenuItem[];
}

export const SIDEBAR_MENU_CONFIG: Record<'PATIENT' | 'DOCTOR' | 'ADMIN', MenuItem[]> = {
  // ----------------------------------------------------------------------------
  // PATIENT MENU CONFIGURATION
  // ----------------------------------------------------------------------------
  PATIENT: [
    {
      title: 'Trang chủ / Đặt lịch khám',
      route: '/patient/booking',
      icon: 'calendar'
    },
    {
      title: 'Lịch hẹn của tôi',
      route: '/patient/appointments',
      icon: 'schedule'
    },
    {
      title: 'Phác đồ & Tiến độ điều trị',
      route: '/patient/treatment-routes',
      icon: 'branches'
    },
    {
      title: 'Hồ sơ bệnh án cá nhân',
      route: '/patient/medical-records',
      icon: 'file-text'
    },
    {
      title: 'Hóa đơn & Thanh toán',
      route: '/patient/payments',
      icon: 'credit-card'
    },
    {
      title: 'Hồ sơ cá nhân',
      route: '/profile',
      icon: 'user'
    }
  ],

  // ----------------------------------------------------------------------------
  // DOCTOR MENU CONFIGURATION
  // ----------------------------------------------------------------------------
  DOCTOR: [
    {
      title: 'Lịch khám trong ngày',
      route: '/doctor/appointments',
      icon: 'calendar'
    },
    {
      title: 'Phác đồ & Giai đoạn điều trị',
      route: '/doctor/treatments',
      icon: 'medicine-box'
    },
    {
      title: 'Quản lý Hồ sơ bệnh án',
      route: '/doctor/medical-records',
      icon: 'solution'
    },
    {
      title: 'Tra cứu Bệnh nhân',
      route: '/doctor/patients',
      icon: 'team'
    },
    {
      title: 'Hồ sơ Chuyên môn Bác sĩ',
      route: '/doctor/profile',
      icon: 'idcard'
    }
  ],

  // ----------------------------------------------------------------------------
  // ADMIN MENU CONFIGURATION
  // ----------------------------------------------------------------------------
  ADMIN: [
    {
      title: 'Tổng quan Viện Nha khoa',
      route: '/admin/dashboard',
      icon: 'dashboard'
    },
    {
      title: 'Tài khoản & Phân quyền',
      icon: 'usergroup-add',
      children: [
        {
          title: 'Quản lý Tài khoản',
          route: '/admin/users',
          icon: 'user'
        },
        {
          title: 'Quản lý Vai trò (Roles)',
          route: '/admin/roles',
          icon: 'safety-certificate'
        }
      ]
    },
    {
      title: 'Quản lý Đội ngũ Bác sĩ',
      route: '/admin/doctors',
      icon: 'medicine-box'
    },
    {
      title: 'Quản lý Dịch vụ Nha khoa',
      route: '/admin/services',
      icon: 'appstore'
    },
    {
      title: 'Điều phối Lịch hẹn Toàn viện',
      route: '/admin/appointments',
      icon: 'calendar'
    },
    {
      title: 'Giám sát Phác đồ & Bệnh án',
      icon: 'file-protect',
      children: [
        {
          title: 'Phác đồ điều trị',
          route: '/admin/treatments',
          icon: 'branches'
        },
        {
          title: 'Hồ sơ bệnh án toàn viện',
          route: '/admin/medical-records',
          icon: 'solution'
        }
      ]
    },
    {
      title: 'Hóa đơn & Đối soát',
      route: '/admin/payments',
      icon: 'dollar'
    }
  ]
};

