// ==============================================================================
// TREATMENT ROUTE DETAIL COMPONENT - CLINICAL PROTOCOL & SEQUENTIAL STAGES
// ==============================================================================

import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';

// Ng-Zorro Modules
import { NzStepsModule } from 'ng-zorro-antd/steps';
import { NzTimelineModule } from 'ng-zorro-antd/timeline';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzInputNumberModule } from 'ng-zorro-antd/input-number';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzDatePickerModule } from 'ng-zorro-antd/date-picker';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzPopconfirmModule } from 'ng-zorro-antd/popconfirm';
import { NzToolTipModule } from 'ng-zorro-antd/tooltip';

import { AuthService } from '../../core/services/auth.service';
import { TreatmentRouteService } from '../../core/services/treatment-route.service';
import { TreatmentStageService } from '../../core/services/treatment-stage.service';
import {
  TreatmentRoute,
  TreatmentStage,
  TreatmentStageCreateRequest,
  TreatmentStageStatus,
  TreatmentStageUpdateRequest
} from '../../core/models/dental.models';

@Component({
  selector: 'app-treatment-route-detail',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    ReactiveFormsModule,
    NzStepsModule,
    NzTimelineModule,
    NzButtonModule,
    NzIconModule,
    NzTagModule,
    NzModalModule,
    NzFormModule,
    NzInputModule,
    NzInputNumberModule,
    NzSelectModule,
    NzDatePickerModule,
    NzPopconfirmModule,
    NzToolTipModule
  ],
  templateUrl: './treatment-route-detail.component.html',
  styleUrls: ['./treatment-route-detail.component.scss']
})
export class TreatmentRouteDetailComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly fb = inject(FormBuilder);
  private readonly message = inject(NzMessageService);
  readonly authService = inject(AuthService);
  private readonly routeService = inject(TreatmentRouteService);
  private readonly stageService = inject(TreatmentStageService);

  // User State
  readonly currentUser = this.authService.currentUser;
  readonly userRole = this.authService.userRole;
  readonly isDoctorOrAdmin = computed(() => {
    const role = this.userRole();
    return role === 'ADMIN' || role === 'DOCTOR';
  });

  // Clinical Data Signals
  readonly allRoutes = signal<TreatmentRoute[]>([]);
  readonly routeId = signal<number>(1);
  readonly treatmentRoute = signal<TreatmentRoute | null>(null);
  readonly stages = signal<TreatmentStage[]>([]);
  readonly isLoading = signal<boolean>(false);

  // Stepper Current Index Signal
  readonly currentActiveStep = computed<number>(() => {
    const list = this.stages();
    if (list.length === 0) return 0;
    const inProgressIndex = list.findIndex(s => s.status === TreatmentStageStatus.IN_PROGRESS);
    if (inProgressIndex !== -1) return inProgressIndex;
    const pendingIndex = list.findIndex(s => s.status === TreatmentStageStatus.PENDING);
    if (pendingIndex !== -1) return pendingIndex;
    return list.length - 1;
  });

  // Financial & Timeline Summary Computations
  readonly totalTreatmentCost = computed<number>(() => {
    return this.stages().reduce((acc, stage) => acc + (stage.cost || 0), 0);
  });

  readonly completedTreatmentCost = computed<number>(() => {
    return this.stages()
      .filter(s => s.status === TreatmentStageStatus.COMPLETED)
      .reduce((acc, stage) => acc + (stage.cost || 0), 0);
  });

  readonly totalDelayDays = computed<number>(() => {
    return this.stages().reduce((acc, stage) => acc + (stage.delay || 0), 0);
  });

  // Modals Visibility
  readonly isCreateRouteModalVisible = signal<boolean>(false);
  readonly isCreateStageModalVisible = signal<boolean>(false);
  readonly isEditStageModalVisible = signal<boolean>(false);
  readonly currentSelectedStage = signal<TreatmentStage | null>(null);

  // Forms
  routeForm: FormGroup = this.fb.group({
    title: ['', [Validators.required, Validators.maxLength(150)]],
    description: ['']
  });

  stageForm: FormGroup = this.fb.group({
    stageName: ['', [Validators.required, Validators.maxLength(150)]],
    sequenceOrder: [1, [Validators.required, Validators.min(1)]],
    cost: [0, [Validators.required, Validators.min(0)]],
    delay: [0, [Validators.required, Validators.min(0)]],
    appointmentDate: [null],
    note: ['']
  });

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    const parsedId = idParam ? parseInt(idParam, 10) : 1;
    this.routeId.set(parsedId);

    this.loadAllRoutes();
    this.loadRouteDetails();
    this.loadStages();
  }

  // ----------------------------------------------------------------------------
  // DATA LOADING
  // ----------------------------------------------------------------------------

  loadAllRoutes(): void {
    this.routeService.getRoutes({ size: 100, sortBy: 'id', sortDir: 'asc' }).subscribe({
      next: res => {
        if (res.success && res.data && res.data.items.length > 0) {
          this.allRoutes.set(res.data.items);
          const hasCurrent = this.allRoutes().some(r => r.id === this.routeId());
          if (!hasCurrent) {
            this.selectRoute(this.allRoutes()[0].id);
          }
        }
      }
    });
  }

  selectRoute(id: number): void {
    this.routeId.set(id);
    this.loadRouteDetails();
    this.loadStages();
  }

  openCreateRouteModal(): void {
    this.routeForm.reset({ title: '', description: '' });
    this.isCreateRouteModalVisible.set(true);
  }

  submitCreateRoute(): void {
    if (this.routeForm.invalid) {
      this.routeForm.markAllAsTouched();
      return;
    }
    const val = this.routeForm.value;
    this.routeService.createRoute({ title: val.title, description: val.description }).subscribe({
      next: res => {
        this.message.success('Tạo lộ trình điều trị mới thành công!');
        this.isCreateRouteModalVisible.set(false);
        this.loadAllRoutes();
        if (res.data) {
          this.selectRoute(res.data.id);
        }
      },
      error: err => {
        this.message.error(err.error?.message || 'Lỗi khi tạo lộ trình.');
      }
    });
  }

  deleteCurrentRoute(): void {
    const currentId = this.routeId();
    this.routeService.deleteRoute(currentId).subscribe({
      next: () => {
        this.message.success('Đã xóa lộ trình điều trị thành công.');
        this.loadAllRoutes();
      },
      error: () => this.message.error('Không thể xóa lộ trình này.')
    });
  }

  loadRouteDetails(): void {
    this.routeService.getRouteById(this.routeId()).subscribe({
      next: res => {
        if (res.success && res.data) {
          this.treatmentRoute.set(res.data);
        }
      },
      error: () => {
        // Fallback for demonstration/mock preview if route not found
        this.treatmentRoute.set({
          id: this.routeId(),
          title: 'Phác Đồ Cấy Ghép Implant Nha Khoa Toàn Diện',
          description: 'Quy trình phục hình răng mất bằng trụ Titanium sinh học, bao gồm các bước thăm khám chụp CT 3D, cấy trụ, gắn Abutment và phục hình răng sứ.',
          createdAt: '2026-03-01 08:30:00'
        });
      }
    });
  }

  loadStages(): void {
    this.isLoading.set(true);
    this.stageService.getStagesByRouteId(this.routeId()).subscribe({
      next: res => {
        if (res.success && res.data && res.data.length > 0) {
          this.stages.set(res.data);
        } else {
          this.stages.set(this.getMockStages());
        }
        this.isLoading.set(false);
      },
      error: () => {
        this.stages.set(this.getMockStages());
        this.isLoading.set(false);
      }
    });
  }

  // ----------------------------------------------------------------------------
  // STATUS TRANSITION (PATCH /api/v1/treatment-stages/{id}/status?status=...)
  // ----------------------------------------------------------------------------

  updateStatus(stage: TreatmentStage, status: TreatmentStageStatus | 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED'): void {
    this.stageService.updateStageStatus(stage.id, status as TreatmentStageStatus).subscribe({
      next: res => {
        this.message.success(`Đã cập nhật tiến độ sang trạng thái: ${status}`);
        this.loadStages();
      },
      error: err => {
        const errorMsg = err.error?.message || 'Không thể cập nhật trạng thái giai đoạn.';
        this.message.error(errorMsg);
      }
    });
  }

  // ----------------------------------------------------------------------------
  // CREATE STAGE MODAL
  // ----------------------------------------------------------------------------

  openCreateStageModal(): void {
    const nextSeq = this.stages().length + 1;
    this.stageForm.reset({
      stageName: '',
      sequenceOrder: nextSeq,
      cost: 0,
      delay: 0,
      appointmentDate: null,
      note: ''
    });
    this.isCreateStageModalVisible.set(true);
  }

  submitCreateStage(): void {
    if (this.stageForm.invalid) {
      this.stageForm.markAllAsTouched();
      return;
    }

    const val = this.stageForm.value;
    const request: TreatmentStageCreateRequest = {
      treatmentRouteId: this.routeId(),
      stageName: val.stageName,
      sequenceOrder: val.sequenceOrder,
      cost: val.cost,
      delay: val.delay,
      note: val.note,
      appointmentDate: val.appointmentDate ? this.formatDateTime(val.appointmentDate) : undefined,
      status: TreatmentStageStatus.PENDING
    };

    this.stageService.createStage(request).subscribe({
      next: () => {
        this.message.success('Thêm giai đoạn điều trị mới thành công!');
        this.isCreateStageModalVisible.set(false);
        this.loadStages();
      },
      error: err => {
        const msg = err.error?.message || 'Lỗi khi thêm giai đoạn điều trị.';
        this.message.error(msg);
      }
    });
  }

  // ----------------------------------------------------------------------------
  // EDIT STAGE MODAL
  // ----------------------------------------------------------------------------

  openEditStageModal(stage: TreatmentStage): void {
    this.currentSelectedStage.set(stage);
    this.stageForm.reset({
      stageName: stage.stageName,
      sequenceOrder: stage.sequenceOrder,
      cost: stage.cost,
      delay: stage.delay,
      appointmentDate: stage.appointmentDate ? new Date(stage.appointmentDate) : null,
      note: stage.note || ''
    });
    this.isEditStageModalVisible.set(true);
  }

  submitEditStage(): void {
    if (this.stageForm.invalid) {
      this.stageForm.markAllAsTouched();
      return;
    }

    const current = this.currentSelectedStage();
    if (!current) return;

    const val = this.stageForm.value;
    const request: TreatmentStageUpdateRequest = {
      stageName: val.stageName,
      sequenceOrder: val.sequenceOrder,
      cost: val.cost,
      delay: val.delay,
      note: val.note,
      appointmentDate: val.appointmentDate ? this.formatDateTime(val.appointmentDate) : undefined
    };

    this.stageService.updateStage(current.id, request).subscribe({
      next: () => {
        this.message.success('Cập nhật giai đoạn điều trị thành công!');
        this.isEditStageModalVisible.set(false);
        this.loadStages();
      },
      error: err => {
        const msg = err.error?.message || 'Lỗi khi sửa giai đoạn.';
        this.message.error(msg);
      }
    });
  }

  deleteStage(id: number): void {
    this.stageService.deleteStage(id).subscribe({
      next: () => {
        this.message.success('Đã xóa giai đoạn thành công.');
        this.loadStages();
      },
      error: () => this.message.error('Không thể xóa giai đoạn này.')
    });
  }

  private formatDateTime(date: Date): string {
    const pad = (n: number) => n.toString().padStart(2, '0');
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
  }

  private getMockStages(): TreatmentStage[] {
    return [
      {
        id: 101,
        treatmentRouteId: this.routeId(),
        stageName: 'Thăm khám lâm sàng & Chụp phim Cone Beam CT 3D',
        sequenceOrder: 1,
        status: TreatmentStageStatus.COMPLETED,
        appointmentDate: '2026-03-05 09:00:00',
        cost: 500000,
        delay: 0,
        note: 'Đã hoàn tất đánh giá thể tích xương hàm, mật độ xương D2 đủ điều kiện cấy ghép.'
      },
      {
        id: 102,
        treatmentRouteId: this.routeId(),
        stageName: 'Phẫu thuật cấy ghép trụ Titanium Implant Straumann',
        sequenceOrder: 2,
        status: TreatmentStageStatus.IN_PROGRESS,
        appointmentDate: '2026-03-12 14:00:00',
        cost: 18000000,
        delay: 7,
        note: 'Tiến hành gây tê tại chỗ, đặt trụ Implant #36 kèm ghép màng xương tự tiêu.'
      },
      {
        id: 103,
        treatmentRouteId: this.routeId(),
        stageName: 'Tái khám tích hợp xương & Gắn trụ Abutment kết nối',
        sequenceOrder: 3,
        status: TreatmentStageStatus.PENDING,
        appointmentDate: '2026-06-15 10:00:00',
        cost: 3000000,
        delay: 90,
        note: 'Kiểm tra độ tích hợp osseointegration bằng máy đo ISQ trước khi lấy dấu răng.'
      },
      {
        id: 104,
        treatmentRouteId: this.routeId(),
        stageName: 'Lấy dấu mẫu hàm số hóa 3D & Chế tác mão răng toàn sứ',
        sequenceOrder: 4,
        status: TreatmentStageStatus.PENDING,
        appointmentDate: '2026-06-25 15:30:00',
        cost: 6500000,
        delay: 10,
        note: 'Công nghệ CAD/CAM chế tác mão răng Cercon HT khớp cắn chuẩn xác.'
      },
      {
        id: 105,
        treatmentRouteId: this.routeId(),
        stageName: 'Gắn mão sứ hoàn thiện & Hướng dẫn vệ sinh định kỳ',
        sequenceOrder: 5,
        status: TreatmentStageStatus.PENDING,
        appointmentDate: '2026-07-02 09:00:00',
        cost: 0,
        delay: 7,
        note: 'Bàn giao thẻ bảo hành chính hãng và lên lịch kiểm tra định kỳ 6 tháng.'
      }
    ];
  }
}

