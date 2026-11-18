// ==============================================================================
// PAYMENT MANAGEMENT COMPONENT - BILLING & RECONCILIATION
// ==============================================================================

import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';

// Ng-Zorro Modules
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzInputNumberModule } from 'ng-zorro-antd/input-number';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzToolTipModule } from 'ng-zorro-antd/tooltip';
import { NzTabsModule } from 'ng-zorro-antd/tabs';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzStatisticModule } from 'ng-zorro-antd/statistic';
import { NzAlertModule } from 'ng-zorro-antd/alert';

import { PaymentService } from '../../core/services/payment.service';
import { UserService } from '../../core/services/user.service';
import { AppointmentService } from '../../core/services/appointment.service';
import { AuthService } from '../../core/services/auth.service';
import {
  Appointment,
  AppointmentInvoicePreview,
  CreateAppointmentInvoiceRequest,
  Payment,
  PaymentConfirmRequest,
  PaymentCreateRequest,
  PaymentMethod,
  PaymentStatus,
  RouteFinancialStatistics,
  User
} from '../../core/models/dental.models';

@Component({
  selector: 'app-payment-management',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    NzTableModule,
    NzButtonModule,
    NzIconModule,
    NzTagModule,
    NzModalModule,
    NzFormModule,
    NzInputModule,
    NzInputNumberModule,
    NzSelectModule,
    NzToolTipModule,
    NzTabsModule,
    NzCardModule,
    NzStatisticModule,
    NzAlertModule
  ],
  templateUrl: './payment-management.component.html',
  styleUrls: ['./payment-management.component.scss']
})
export class PaymentManagementComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly paymentService = inject(PaymentService);
  private readonly userService = inject(UserService);
  private readonly appointmentService = inject(AppointmentService);
  readonly authService = inject(AuthService);
  private readonly message = inject(NzMessageService);

  readonly currentUser = this.authService.currentUser;
  readonly userRole = this.authService.userRole;
  readonly isAdmin = computed(() => this.userRole() === 'ADMIN');

  readonly payments = signal<Payment[]>([]);
  readonly patients = signal<User[]>([]);
  readonly isLoading = signal<boolean>(false);
  readonly totalElements = signal<number>(0);
  readonly pageIndex = signal<number>(1);
  readonly pageSize = signal<number>(10);
  readonly selectedStatusFilter = signal<PaymentStatus | null>(null);

  readonly isCreateModalVisible = signal<boolean>(false);
  readonly isConfirmModalVisible = signal<boolean>(false);
  readonly selectedPayment = signal<Payment | null>(null);

  // Route Financial Statistics Signals
  readonly isRouteStatsModalVisible = signal<boolean>(false);
  readonly routeStats = signal<RouteFinancialStatistics[]>([]);
  readonly isLoadingRouteStats = signal<boolean>(false);

  // Appointment Invoice Creation Signals
  readonly isApptInvoiceModalVisible = signal<boolean>(false);
  readonly appointmentsList = signal<Appointment[]>([]);
  readonly selectedApptId = signal<number | null>(null);
  readonly invoicePreview = signal<AppointmentInvoicePreview | null>(null);
  readonly isLoadingPreview = signal<boolean>(false);
  readonly isCreatingApptInvoice = signal<boolean>(false);
  readonly apptInvoiceMethod = signal<PaymentMethod>(PaymentMethod.CASH);

  readonly paymentMethods = [
    { label: 'Chuyển khoản Ngân hàng (QR)', value: PaymentMethod.BANK_TRANSFER },
    { label: 'Cổng VNPAY', value: PaymentMethod.VNPAY },
    { label: 'Ví MoMo', value: PaymentMethod.MOMO },
    { label: 'Tiền mặt tại quầy', value: PaymentMethod.CASH },
    { label: 'Thẻ tín dụng / Ghi nợ', value: PaymentMethod.CREDIT_CARD }
  ];

  createForm: FormGroup = this.fb.group({
    userId: [null, [Validators.required]],
    amount: [500000, [Validators.required, Validators.min(1000)]],
    method: [PaymentMethod.BANK_TRANSFER, [Validators.required]]
  });

  confirmForm: FormGroup = this.fb.group({
    status: [PaymentStatus.SUCCESS, [Validators.required]],
    transactionRef: ['', [Validators.required, Validators.minLength(4)]],
    note: ['']
  });

  ngOnInit(): void {
    this.loadPayments();
    if (this.isAdmin()) {
      this.loadPatients();
    }
  }

  loadPayments(): void {
    this.isLoading.set(true);
    const role = this.userRole();
    const user = this.currentUser();

    if (role === 'PATIENT' && user) {
      this.paymentService
        .getPaymentsByUserId(user.id, {
          page: this.pageIndex() - 1,
          size: this.pageSize(),
          sortBy: 'createdAt',
          sortDir: 'desc'
        })
        .subscribe({
          next: res => {
            if (res.success && res.data) {
              this.payments.set(res.data.items);
              this.totalElements.set(res.data.totalElements);
            }
            this.isLoading.set(false);
          },
          error: () => {
            this.message.error('Không thể tải lịch sử thanh toán.');
            this.isLoading.set(false);
          }
        });
    } else {
      this.paymentService
        .getPayments({
          status: this.selectedStatusFilter() || undefined,
          page: this.pageIndex() - 1,
          size: this.pageSize(),
          sortBy: 'createdAt',
          sortDir: 'desc'
        })
        .subscribe({
          next: res => {
            if (res.success && res.data) {
              this.payments.set(res.data.items);
              this.totalElements.set(res.data.totalElements);
            }
            this.isLoading.set(false);
          },
          error: () => {
            this.message.error('Không thể tải danh sách hóa đơn.');
            this.isLoading.set(false);
          }
        });
    }
  }

  loadPatients(): void {
    this.userService.getUsers({ size: 100 }).subscribe({
      next: res => {
        if (res.success && res.data) {
          this.patients.set(res.data.items);
        }
      }
    });
  }

  filterByStatus(status: any): void {
    this.selectedStatusFilter.set(status as PaymentStatus | null);
    this.pageIndex.set(1);
    this.loadPayments();
  }

  onPageChange(page: number): void {
    this.pageIndex.set(page);
    this.loadPayments();
  }

  onPageSizeChange(size: number): void {
    this.pageSize.set(size);
    this.pageIndex.set(1);
    this.loadPayments();
  }

  openCreateModal(): void {
    const user = this.currentUser();
    this.createForm.reset({
      userId: this.isAdmin() ? null : user?.id,
      amount: 1000000,
      method: PaymentMethod.BANK_TRANSFER
    });
    this.isCreateModalVisible.set(true);
  }

  submitCreate(): void {
    if (this.createForm.invalid) {
      this.createForm.markAllAsTouched();
      return;
    }

    const val = this.createForm.value;
    const request: PaymentCreateRequest = {
      userId: val.userId,
      amount: val.amount,
      method: val.method
    };

    this.paymentService.createPayment(request).subscribe({
      next: () => {
        this.message.success('Khởi tạo giao dịch thanh toán thành công (Trạng thái: PENDING)!');
        this.isCreateModalVisible.set(false);
        this.loadPayments();
      },
      error: err => {
        const msg = err.error?.message || 'Lỗi khi khởi tạo hóa đơn.';
        this.message.error(msg);
      }
    });
  }

  openConfirmModal(payment: Payment): void {
    this.selectedPayment.set(payment);
    this.confirmForm.reset({
      status: PaymentStatus.SUCCESS,
      transactionRef: 'TXN_' + Date.now(),
      note: 'Đối soát thành công'
    });
    this.isConfirmModalVisible.set(true);
  }

  submitConfirm(): void {
    if (this.confirmForm.invalid) {
      this.confirmForm.markAllAsTouched();
      return;
    }

    const current = this.selectedPayment();
    if (!current) return;

    const request: PaymentConfirmRequest = this.confirmForm.value;
    this.paymentService.confirmPayment(current.id, request).subscribe({
      next: () => {
        this.message.success('Xác nhận giao dịch đối soát thành công!');
        this.isConfirmModalVisible.set(false);
        this.loadPayments();
      },
      error: err => {
        const msg = err.error?.message || 'Lỗi khi xác nhận giao dịch.';
        this.message.error(msg);
      }
    });
  }

  getStatusBadgeClass(status: string): string {
    switch (status) {
      case 'SUCCESS':
        return 'status-badge--success';
      case 'PENDING':
        return 'status-badge--pending';
      case 'FAILED':
        return 'status-badge--failed';
      default:
        return 'status-badge--neutral';
    }
  }

  // =========================================================================
  // ROUTE FINANCIAL STATISTICS MODAL
  // =========================================================================

  openRouteStatsModal(): void {
    this.isLoadingRouteStats.set(true);
    this.isRouteStatsModalVisible.set(true);
    this.paymentService.getAllRouteStatistics().subscribe({
      next: res => {
        if (res.success && res.data) {
          this.routeStats.set(res.data);
        }
        this.isLoadingRouteStats.set(false);
      },
      error: () => {
        this.message.error('Không thể tải thống kê tài chính theo lộ trình.');
        this.isLoadingRouteStats.set(false);
      }
    });
  }

  // =========================================================================
  // APPOINTMENT INVOICE CREATION BASED ON COMPLETED STAGES
  // =========================================================================

  openCreateAppointmentInvoiceModal(preselectedApptId?: number): void {
    this.invoicePreview.set(null);
    this.apptInvoiceMethod.set(PaymentMethod.CASH);
    this.isApptInvoiceModalVisible.set(true);

    this.appointmentService.getAppointments({ size: 100, sortBy: 'appointmentDate', sortDir: 'desc' }).subscribe({
      next: res => {
        if (res.success && res.data) {
          this.appointmentsList.set(res.data.items);
          if (preselectedApptId) {
            this.selectedApptId.set(preselectedApptId);
            this.onSelectAppointmentForInvoice(preselectedApptId);
          } else if (res.data.items.length > 0) {
            this.selectedApptId.set(res.data.items[0].id);
            this.onSelectAppointmentForInvoice(res.data.items[0].id);
          }
        }
      }
    });
  }

  onSelectAppointmentForInvoice(apptId: number): void {
    this.selectedApptId.set(apptId);
    if (!apptId) {
      this.invoicePreview.set(null);
      return;
    }
    this.isLoadingPreview.set(true);
    this.paymentService.previewAppointmentInvoice(apptId).subscribe({
      next: res => {
        if (res.success && res.data) {
          this.invoicePreview.set(res.data);
        }
        this.isLoadingPreview.set(false);
      },
      error: () => {
        this.message.error('Không thể kiểm tra thông tin phác đồ và các bước cho cuộc hẹn này.');
        this.isLoadingPreview.set(false);
      }
    });
  }

  submitCreateAppointmentInvoice(): void {
    const apptId = this.selectedApptId();
    if (!apptId) {
      this.message.warning('Vui lòng chọn cuộc hẹn cần xuất hóa đơn!');
      return;
    }

    const payload: CreateAppointmentInvoiceRequest = {
      method: this.apptInvoiceMethod()
    };

    this.isCreatingApptInvoice.set(true);
    this.paymentService.createInvoiceForAppointment(apptId, payload).subscribe({
      next: res => {
        this.message.success(`Đã tạo hóa đơn mã [#${res.data?.id}] cho cuộc hẹn thành công!`);
        this.isApptInvoiceModalVisible.set(false);
        this.isCreatingApptInvoice.set(false);
        this.loadPayments();
      },
      error: err => {
        const msg = err.error?.message || 'Không thể tạo hóa đơn cho cuộc hẹn.';
        this.message.error(msg);
        this.isCreatingApptInvoice.set(false);
      }
    });
  }
}

