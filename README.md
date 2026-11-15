# Hệ Thống Quản Lý Phòng Khám Nha Khoa (Dental Clinic Management System) - Frontend

Dự án Base Frontend được thiết kế chuẩn kiến trúc doanh nghiệp (**Enterprise Angular Architecture**) theo hướng tiếp cận **Standalone Components 100%**, quản lý Reactive State hoàn toàn bằng **Angular Signals** (`signal`, `computed`), cú pháp Control Flow thế hệ mới (`@if`, `@for`, `@switch`), và hệ thống UI Component cao cấp **Ng-Zorro-Antd** kết hợp phong cách thiết kế **Ocean Dental Theme**.

---

## 1. Công nghệ & Kiến trúc (Tech Stack)

- **Framework**: Angular 18/19 (Standalone Components, Signals, new Control Flow)
- **UI Library**: [Ng-Zorro-Antd](https://ng.ant.design/) (Ant Design for Angular)
- **Icon Set**: `@ant-design/icons-angular`
- **Styling**: SCSS với kiến trúc Design Tokens phân tầng (`_variables.scss`, `styles.scss`)
- **Tone màu chủ đạo**: **Ocean Dental Theme**
  - Primary (Xanh nước biển đậm): `#0284C7` (Ocean Blue)
  - Secondary / Accent (Xanh ngọc): `#0EA5E9` / `#38BDF8`
  - Background Light: `#F0F9FF` (Alice Blue)
  - Surface / Card: `#FFFFFF` với đổ bóng y tế mềm mại `0 4px 20px rgba(2, 132, 199, 0.08)`
  - Status Badges:
    - `CONFIRMED` / `COMPLETED` / `SUCCESS`: `#10B981` (Emerald Green)
    - `PENDING` / `IN_PROGRESS`: `#F59E0B` (Amber)
    - `CANCELLED` / `FAILED`: `#EF4444` (Rose Red)
- **State & HTTP**: Angular Signals, `provideHttpClient(withInterceptors([jwtInterceptor]))`, `ReactiveFormsModule`.

---

## 2. Cấu trúc thư mục chuẩn Doanh nghiệp (Enterprise Structure)

```text
frontend/
├── package.json
├── angular.json
├── tsconfig.json
├── tsconfig.app.json
├── README.md
└── src/
    ├── index.html
    ├── main.ts
    ├── styles.scss                     # Global style & Ant Design overrides
    ├── styles/
    │   └── _variables.scss             # Design tokens & Ocean Dental theme palette
    ├── environments/
    │   ├── environment.ts              # Local dev API configuration (http://localhost:8080/api/v1)
    │   └── environment.prod.ts         # Production API configuration
    └── app/
        ├── app.component.ts
        ├── app.config.ts               # Standalone bootstrap, vi_VN i18n, icons, HTTP interceptors
        ├── app.routes.ts               # Phân hệ định tuyến RBAC (Admin, Doctor, Patient)
        │
        ├── core/                       # Singleton services, models, guards, interceptors
        │   ├── models/
        │   │   └── dental.models.ts    # Full TypeScript Interfaces, DTOs & Enums
        │   ├── guards/
        │   │   ├── auth.guard.ts       # Functional Guard kiểm tra phiên đăng nhập
        │   │   └── role.guard.ts       # Functional RBAC Guard kiểm tra quyền theo Role
        │   ├── interceptors/
        │   │   └── jwt.interceptor.ts  # Tự động gắn Bearer Token & Hàng đợi Refresh Token 401
        │   └── services/               # 10 API Services tương ứng 10 nhóm Endpoints Backend
        │       ├── auth.service.ts
        │       ├── user.service.ts
        │       ├── role.service.ts
        │       ├── doctor.service.ts
        │       ├── dental-service.service.ts
        │       ├── appointment.service.ts
        │       ├── treatment-route.service.ts
        │       ├── treatment-stage.service.ts
        │       ├── medical-record.service.ts
        │       └── payment.service.ts
        │
        ├── layouts/
        │   └── main-layout/            # Shell Layout chính (Sidebar động + Topbar + User Profile)
        │       ├── main-layout.component.ts
        │       ├── main-layout.component.html
        │       ├── main-layout.component.scss
        │       └── menu.config.ts      # Cấu hình danh mục Menu động theo 3 Role
        │
        └── features/                   # Các Module tính năng phân hệ
            ├── auth/
            │   ├── login.component.ts         # Màn hình đăng nhập bảo mật
            │   └── unauthorized.component.ts  # Trang 403 Forbidden
            ├── dashboard/
            │   └── dashboard.component.ts     # Tổng quan viện & KPI dành cho Admin
            ├── appointments/
            │   ├── appointment-management.component.ts
            │   ├── appointment-management.component.html
            │   └── appointment-management.component.scss
            ├── treatments/
            │   ├── treatment-route-detail.component.ts
            │   ├── treatment-route-detail.component.html
            │   └── treatment-route-detail.component.scss
            └── placeholder/
                └── placeholder.component.ts   # Component dự phòng cho các trang đang mở rộng
```

---

## 3. Cơ chế Bảo mật & Phân quyền (Core Security)

### 3.1. `AuthService` với Angular Signals
- `currentUser = signal<User | null>(...)`
- `userRole = computed(() => this.currentUser()?.role.name.replace('ROLE_', ''))`
- `isAuthenticated = computed(() => !!this.currentUser() && !!this.getAccessToken())`
- Lưu trữ an toàn `dental_access_token` và `dental_refresh_token` trong `localStorage`.

### 3.2. `jwtInterceptor` & Refresh Token Queue
- Tự động đính kèm `Authorization: Bearer <token>` vào mọi request đến `/api/v1/**` (loại trừ `/auth/login`, `/auth/register`, `/auth/refresh-token`).
- **Xử lý 401 Unauthorized**:
  - Khi token hết hạn, request đầu tiên kích hoạt gọi `POST /api/v1/auth/refresh-token`.
  - Sử dụng `BehaviorSubject<string | null>` làm hàng đợi. Các request đồng thời khác sẽ dừng chờ cho đến khi token mới được cấp, sau đó tự động retry request gốc.
  - Nếu refresh thất bại, hệ thống tự động xóa storage và điều hướng người dùng về `/auth/login`.
- **Xử lý 403 Forbidden**: Tự động thông báo qua `NzNotificationService`: *"Bạn không có quyền thực hiện thao tác này."*

### 3.3. `roleGuard` & Functional Guards
- Kiểm tra trực tiếp trên Route `data: { roles: ['ADMIN', 'DOCTOR', 'PATIENT'] }`.
- Nếu truy cập trái quyền, thông báo cảnh báo và tự động điều hướng về Dashboard đúng vai trò hoặc trang `/unauthorized`.

---

## 4. Danh sách 10 Services Gọi API Chuẩn Chỉnh

| Service | Endpoint chính | Chức năng nghiệp vụ |
| :--- | :--- | :--- |
| `AuthService` | `/api/v1/auth` | Đăng nhập, đăng ký bệnh nhân, cấp mới token, lấy thông tin tài khoản |
| `UserService` | `/api/v1/users` | Quản lý danh bạ tài khoản, cập nhật thông tin cá nhân |
| `RoleService` | `/api/v1/roles` | Quản trị vai trò hệ thống (`ROLE_ADMIN`, `ROLE_DOCTOR`, `ROLE_PATIENT`) |
| `DoctorService` | `/api/v1/doctors` | Hồ sơ bác sĩ, số năm kinh nghiệm, chuyên khoa |
| `DentalServiceService` | `/api/v1/services` | Danh mục dịch vụ nha khoa, đơn giá niêm yết |
| `AppointmentService` | `/api/v1/appointments` | Đặt lịch, hủy lịch kèm lý do, cập nhật trạng thái (`CONFIRMED`, `COMPLETED`, `CANCELLED`) |
| `TreatmentRouteService` | `/api/v1/treatment-routes` | Khởi tạo, chỉnh sửa và quản lý phác đồ điều trị tổng thể |
| `TreatmentStageService` | `/api/v1/treatment-stages` | Quản lý chuỗi giai đoạn tuần tự (`sequence`), cập nhật tiến độ, chi phí, độ trễ |
| `MedicalRecordService` | `/api/v1/medical-records` | Bệnh án khám chữa bệnh, lịch sử lâm sàng của từng bệnh nhân |
| `PaymentService` | `/api/v1/payments` | Hóa đơn thanh toán (`PENDING`), đối soát giao dịch (`/confirm`) |

---

## 5. Hướng dẫn Cài đặt & Khởi động Dự án

### Bước 1: Cài đặt các gói phụ thuộc (Dependencies)
```bash
cd frontend
npm install
```

### Bước 2: Khởi động Development Server
```bash
npm start
# hoặc
ng serve --port 4200
```

### Bước 3: Truy cập Ứng dụng
Mở trình duyệt tại: **[http://localhost:4200](http://localhost:4200)**

Hệ thống đã chuẩn bị sẵn nút điền nhanh tài khoản Demo tại trang Đăng nhập:
- **Admin**: `admin@dental.com` / `Admin@123`
- **Bác sĩ**: `doctor@dental.com` / `Doctor@123`
- **Bệnh nhân**: `patient@dental.com` / `Patient@123`

