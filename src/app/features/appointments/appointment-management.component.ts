// ==============================================================================
// APPOINTMENT MANAGEMENT COMPONENT - ADAPTIVE CLINIC BOOKING MANAGEMENT
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
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzDatePickerModule } from 'ng-zorro-antd/date-picker';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzPopconfirmModule } from 'ng-zorro-antd/popconfirm';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { NzToolTipModule } from 'ng-zorro-antd/tooltip';

import { AuthService } from '../../core/services/auth.service';
import { AppointmentService } from '../../core/services/appointment.service';
import { DoctorService } from '../../core/services/doctor.service';
import { DentalServiceService } from '../../core/services/dental-service.service';
import {
  Appointment,
  AppointmentCreateRequest,
  AppointmentStatus,
  AppointmentStatusUpdateRequest,
  DentalService,
  Doctor
} from '../../core/models/dental.models';

@Component({
  selector: 'app-appointment-management',
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
    NzSelectModule,
    NzDatePickerModule,
    NzPopconfirmModule,
    NzCardModule,
    NzDividerModule,
    NzToolTipModule
  ],
  templateUrl: './appointment-management.component.html',
  styleUrls: ['./appointment-management.component.scss']
})
export class AppointmentManagementComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly message = inject(NzMessageService);
  readonly authService = inject(AuthService);
  private readonly appointmentService = inject(AppointmentService);
  private readonly doctorService = inject(DoctorService);
  private readonly dentalServiceService = inject(DentalServiceService);

  // User Context Signals
  readonly currentUser = this.authService.currentUser;
  readonly userRole = this.authService.userRole;
  readonly canChangeStatus = computed(() => {
    const role = this.userRole();
    return role === 'ADMIN' || role === 'DOCTOR';
  });

  // Data State Signals
  readonly appointments = signal<Appointment[]>([]);
  readonly doctors = signal<Doctor[]>([]);
  readonly services = signal<DentalService[]>([]);
  readonly isLoading = signal<boolean>(false);
  readonly totalElements = signal<number>(0);
  readonly pageIndex = signal<number>(1);
  readonly pageSize = signal<number>(10);
  readonly selectedStatusFilter = signal<AppointmentStatus | null>(null);

  // Modals Visibility
  readonly isStatusModalVisible = signal<boolean>(false);
  readonly isBookingModalVisible = signal<boolean>(false);
  readonly isCancelModalVisible = signal<boolean>(false);
  readonly currentSelectedAppointment = signal<Appointment | null>(null);

  // Status List & Form
  readonly appointmentStatuses = [
    { label: 'Chờ khám (PENDING)', value: AppointmentStatus.PENDING },
    { label: 'Đã xác nhận (CONFIRMED)', value: AppointmentStatus.CONFIRMED },
    { label: 'Đã hoàn thành (COMPLETED)', value: AppointmentStatus.COMPLETED },
    { label: 'Đã hủy (CANCELLED)', value: AppointmentStatus.CANCELLED }
  ];

  statusForm: FormGroup = this.fb.group({
    status: ['', [Validators.required]],
    note: ['']
  });

  bookingForm: FormGroup = this.fb.group({
    doctorId: [null, [Validators.required]],
    serviceId: [null, [Validators.required]],
    appointmentDate: [null, [Validators.required]],
    stageName: ['Khám khởi đầu'],
    note: ['']
  });

  cancelForm: FormGroup = this.fb.group({
    reason: ['', [Validators.required, Validators.minLength(5)]]
  });

  ngOnInit(): void {
    this.loadAppointments();
    this.loadDoctors();
    this.loadServices();
  }

  // ----------------------------------------------------------------------------
  // DATA LOADING
  // ----------------------------------------------------------------------------

  loadAppointments(): void {
    this.isLoading.set(true);
    const role = this.userRole();
    const user = this.currentUser();

    const queryParams: any = {
      page: this.pageIndex() - 1,
      size: this.pageSize(),
      sortBy: 'appointmentDate',
      sortDir: 'desc'
    };

    if (this.selectedStatusFilter()) {
      queryParams.status = this.selectedStatusFilter();
    }

    // Role-specific scoping
    if (role === 'PATIENT' && user?.id) {
      queryParams.userId = user.id;
    } else if (role === 'DOCTOR') {
      // If doctor, find their doctor ID from doctor service
      this.doctorService.getDoctorByUserId(user!.id).subscribe({
        next: docResp => {
          if (docResp.success && docResp.data) {
            queryParams.doctorId = docResp.data.id;
          }
          this.fetchAppointmentsData(queryParams);
        },
        error: () => this.fetchAppointmentsData(queryParams)
      });
      return;
    }

    this.fetchAppointmentsData(queryParams);
  }

  private fetchAppointmentsData(params: any): void {
    this.appointmentService.getAppointments(params).subscribe({
      next: res => {
        if (res.success && res.data) {
          this.appointments.set(res.data.items);
          this.totalElements.set(res.data.totalElements);
        }
        this.isLoading.set(false);
      },
      error: () => {
        this.message.error('Không thể tải danh sách lịch hẹn.');
        this.isLoading.set(false);
      }
    });
  }

  loadDoctors(): void {
    this.doctorService.getDoctors({ page: 0, size: 50 }).subscribe({
      next: res => {
        if (res.success && res.data) {
          this.doctors.set(res.data.items);
        }
      }
    });
  }

  loadServices(): void {
    this.dentalServiceService.getServices({ page: 0, size: 50 }).subscribe({
      next: res => {
        if (res.success && res.data) {
          this.services.set(res.data.items);
        }
      }
    });
  }

  // ----------------------------------------------------------------------------
  // ACTIONS: STATUS UPDATE (ADMIN / DOCTOR)
  // ----------------------------------------------------------------------------

  openStatusModal(appointment: Appointment): void {
    this.currentSelectedAppointment.set(appointment);
    this.statusForm.reset({
      status: appointment.status,
      note: appointment.note || ''
    });
    this.isStatusModalVisible.set(true);
  }

  submitStatusUpdate(): void {
    if (this.statusForm.invalid) {
      this.statusForm.markAllAsTouched();
      return;
    }

    const appt = this.currentSelectedAppointment();
    if (!appt) return;

    const request: AppointmentStatusUpdateRequest = this.statusForm.value;
    this.appointmentService.updateAppointmentStatus(appt.id, request).subscribe({
      next: res => {
        this.message.success('Cập nhật trạng thái lịch hẹn thành công!');
        this.isStatusModalVisible.set(false);
        this.loadAppointments();
      },
      error: err => {
        const msg = err.error?.message || 'Lỗi khi cập nhật trạng thái.';
        this.message.error(msg);
      }
    });
  }

  // ----------------------------------------------------------------------------
  // ACTIONS: BOOKING APPOINTMENT (PATIENT / ALL)
  // ----------------------------------------------------------------------------

  openBookingModal(): void {
    this.bookingForm.reset({
      stageName: 'Khám và tư vấn ban đầu'
    });
    this.isBookingModalVisible.set(true);
  }

  submitBooking(): void {
    if (this.bookingForm.invalid) {
      this.bookingForm.markAllAsTouched();
      return;
    }

    const raw = this.bookingForm.value;
    const user = this.currentUser();
    if (!user) return;

    // Format Date to 'yyyy-MM-dd HH:mm:ss'
    const dateObj: Date = raw.appointmentDate;
    const formattedDate = this.formatDateTime(dateObj);

    const payload: AppointmentCreateRequest = {
      userId: user.id,
      doctorId: raw.doctorId,
      serviceId: raw.serviceId,
      appointmentDate: formattedDate,
      stageName: raw.stageName,
      note: raw.note
    };

    this.appointmentService.createAppointment(payload).subscribe({
      next: res => {
        this.message.success('Đặt lịch khám thành công! Hệ thống đã ghi nhận lịch hẹn.');
        this.isBookingModalVisible.set(false);
        this.loadAppointments();
      },
      error: err => {
        const errorMsg = err.error?.message || 'Trùng lịch khám hoặc ngày khám không hợp lệ!';
        this.message.error(errorMsg);
      }
    });
  }

  // ----------------------------------------------------------------------------
  // ACTIONS: CANCEL APPOINTMENT
  // ----------------------------------------------------------------------------

  openCancelModal(appointment: Appointment): void {
    this.currentSelectedAppointment.set(appointment);
    this.cancelForm.reset();
    this.isCancelModalVisible.set(true);
  }

  submitCancel(): void {
    if (this.cancelForm.invalid) {
      this.cancelForm.markAllAsTouched();
      return;
    }

    const appt = this.currentSelectedAppointment();
    if (!appt) return;

    const reason = this.cancelForm.value.reason;
    this.appointmentService.cancelAppointment(appt.id, reason).subscribe({
      next: () => {
        this.message.success('Đã hủy lịch hẹn khám thành công.');
        this.isCancelModalVisible.set(false);
        this.loadAppointments();
      },
      error: err => {
        const errorMsg = err.error?.message || 'Không thể hủy lịch hẹn.';
        this.message.error(errorMsg);
      }
    });
  }

  // ----------------------------------------------------------------------------
  // PAGINATION & FILTER HANDLERS
  // ----------------------------------------------------------------------------

  onPageChange(page: number): void {
    this.pageIndex.set(page);
    this.loadAppointments();
  }

  onPageSizeChange(size: number): void {
    this.pageSize.set(size);
    this.pageIndex.set(1);
    this.loadAppointments();
  }

  filterByStatus(status: any): void {
    this.selectedStatusFilter.set(status as AppointmentStatus | null);
    this.pageIndex.set(1);
    this.loadAppointments();
  }

  private formatDateTime(date: Date): string {
    const pad = (n: number) => n.toString().padStart(2, '0');
    const year = date.getFullYear();
    const month = pad(date.getMonth() + 1);
    const day = pad(date.getDate());
    const hours = pad(date.getHours());
    const minutes = pad(date.getMinutes());
    const seconds = pad(date.getSeconds());
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
  }
}

