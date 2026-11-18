// ==============================================================================
// MEDICAL RECORD LIST COMPONENT - PATIENT CLINICAL HISTORY & DIAGNOSES
// ==============================================================================

import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
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
import { NzAvatarModule } from 'ng-zorro-antd/avatar';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzPopconfirmModule } from 'ng-zorro-antd/popconfirm';
import { NzToolTipModule } from 'ng-zorro-antd/tooltip';
import { NzStepsModule } from 'ng-zorro-antd/steps';
import { NzTimelineModule } from 'ng-zorro-antd/timeline';
import { NzSpinModule } from 'ng-zorro-antd/spin';

import { MedicalRecordService } from '../../core/services/medical-record.service';
import { DoctorService } from '../../core/services/doctor.service';
import { UserService } from '../../core/services/user.service';
import { DentalServiceService } from '../../core/services/dental-service.service';
import { TreatmentRouteService } from '../../core/services/treatment-route.service';
import { TreatmentStageService } from '../../core/services/treatment-stage.service';
import { AuthService } from '../../core/services/auth.service';
import {
  DentalService,
  Doctor,
  MedicalRecord,
  MedicalRecordCreateRequest,
  TreatmentRoute,
  TreatmentStage,
  TreatmentStageStatus,
  User
} from '../../core/models/dental.models';

@Component({
  selector: 'app-medical-record-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
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
    NzAvatarModule,
    NzPopconfirmModule,
    NzToolTipModule,
    NzStepsModule,
    NzTimelineModule,
    NzSpinModule
  ],
  templateUrl: './medical-record-list.component.html',
  styleUrls: ['./medical-record-list.component.scss']
})
export class MedicalRecordListComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly medicalRecordService = inject(MedicalRecordService);
  private readonly doctorService = inject(DoctorService);
  private readonly userService = inject(UserService);
  private readonly dentalService = inject(DentalServiceService);
  private readonly routeService = inject(TreatmentRouteService);
  private readonly stageService = inject(TreatmentStageService);
  readonly authService = inject(AuthService);
  private readonly message = inject(NzMessageService);

  readonly TreatmentStageStatus = TreatmentStageStatus;

  readonly currentUser = this.authService.currentUser;
  readonly userRole = this.authService.userRole;
  readonly isDoctorOrAdmin = computed(() => {
    const role = this.userRole();
    return role === 'ADMIN' || role === 'DOCTOR';
  });

  readonly records = signal<MedicalRecord[]>([]);
  readonly patients = signal<User[]>([]);
  readonly doctors = signal<Doctor[]>([]);
  readonly services = signal<DentalService[]>([]);
  readonly routes = signal<TreatmentRoute[]>([]);

  readonly isLoading = signal<boolean>(false);
  readonly totalElements = signal<number>(0);
  readonly pageIndex = signal<number>(1);
  readonly pageSize = signal<number>(10);
  readonly searchKeyword = signal<string>('');

  readonly isCreateModalVisible = signal<boolean>(false);
  readonly isDetailModalVisible = signal<boolean>(false);
  readonly selectedRecord = signal<MedicalRecord | null>(null);

  // Assign Treatment Route State
  readonly isAssignRouteModalVisible = signal<boolean>(false);
  readonly targetRecordForAssign = signal<MedicalRecord | null>(null);
  readonly selectedRouteIdToAssign = signal<number | null>(null);
  readonly isAssigningRoute = signal<boolean>(false);

  // Treatment Stages Progression Modal State
  readonly isStagesModalVisible = signal<boolean>(false);
  readonly activeRecordForStages = signal<MedicalRecord | null>(null);
  readonly stagesForActiveRecord = signal<TreatmentStage[]>([]);
  readonly isLoadingStages = signal<boolean>(false);

  recordForm: FormGroup = this.fb.group({
    userId: [null, [Validators.required]],
    doctorId: [null, [Validators.required]],
    serviceId: [null, [Validators.required]],
    treatmentRouteId: [null],
    diagnosis: ['', [Validators.required, Validators.minLength(5)]]
  });

  ngOnInit(): void {
    this.loadRecords();
    if (this.isDoctorOrAdmin()) {
      this.loadPatients();
      this.loadDoctors();
      this.loadServices();
      this.loadRoutes();
    }
  }

  loadRecords(): void {
    this.isLoading.set(true);
    const role = this.userRole();
    const user = this.currentUser();

    if (role === 'PATIENT' && user) {
      // Patient only sees their own medical records
      this.medicalRecordService
        .getMedicalRecordsByPatient(user.id, {
          page: this.pageIndex() - 1,
          size: this.pageSize(),
          sortBy: 'createdAt',
          sortDir: 'desc'
        })
        .subscribe({
          next: res => {
            if (res.success && res.data) {
              this.records.set(res.data.items);
              this.totalElements.set(res.data.totalElements);
            }
            this.isLoading.set(false);
          },
          error: () => {
            this.message.error('Không thể tải hồ sơ bệnh án cá nhân.');
            this.isLoading.set(false);
          }
        });
    } else {
      // Admin / Doctor can view system-wide medical records
      this.medicalRecordService
        .getMedicalRecords({
          keyword: this.searchKeyword() || undefined,
          page: this.pageIndex() - 1,
          size: this.pageSize(),
          sortBy: 'createdAt',
          sortDir: 'desc'
        })
        .subscribe({
          next: res => {
            if (res.success && res.data) {
              this.records.set(res.data.items);
              this.totalElements.set(res.data.totalElements);
            }
            this.isLoading.set(false);
          },
          error: () => {
            this.message.error('Không thể tải danh sách bệnh án.');
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

  loadDoctors(): void {
    this.doctorService.getDoctors({ size: 50 }).subscribe({
      next: res => {
        if (res.success && res.data) {
          this.doctors.set(res.data.items);
        }
      }
    });
  }

  loadServices(): void {
    this.dentalService.getServices({ size: 50 }).subscribe({
      next: res => {
        if (res.success && res.data) {
          this.services.set(res.data.items);
        }
      }
    });
  }

  loadRoutes(): void {
    this.routeService.getRoutes({ size: 50 }).subscribe({
      next: res => {
        if (res.success && res.data) {
          this.routes.set(res.data.items);
        }
      }
    });
  }

  onSearch(keyword: any): void {
    this.searchKeyword.set(keyword ? String(keyword) : '');
    this.pageIndex.set(1);
    this.loadRecords();
  }

  onPageChange(page: number): void {
    this.pageIndex.set(page);
    this.loadRecords();
  }

  onPageSizeChange(size: number): void {
    this.pageSize.set(size);
    this.pageIndex.set(1);
    this.loadRecords();
  }

  openCreateModal(): void {
    this.recordForm.reset();
    this.isCreateModalVisible.set(true);
  }

  submitCreate(): void {
    if (this.recordForm.invalid) {
      this.recordForm.markAllAsTouched();
      return;
    }

    const payload: MedicalRecordCreateRequest = this.recordForm.value;
    this.medicalRecordService.createMedicalRecord(payload).subscribe({
      next: () => {
        this.message.success('Tạo hồ sơ bệnh án mới thành công!');
        this.isCreateModalVisible.set(false);
        this.loadRecords();
      },
      error: err => {
        const msg = err.error?.message || 'Lỗi khi tạo bệnh án.';
        this.message.error(msg);
      }
    });
  }

  viewDetail(record: MedicalRecord): void {
    this.selectedRecord.set(record);
    this.isDetailModalVisible.set(true);
  }

  deleteRecord(id: number): void {
    this.medicalRecordService.deleteMedicalRecord(id).subscribe({
      next: () => {
        this.message.success('Đã xóa bệnh án thành công.');
        this.loadRecords();
      },
      error: err => {
        const msg = err.error?.message || 'Không thể xóa hồ sơ bệnh án.';
        this.message.error(msg);
      }
    });
  }

  // ----------------------------------------------------------------------------
  // ASSIGN TREATMENT ROUTE (ONLY WHEN ROUTE IS NULL)
  // ----------------------------------------------------------------------------

  openAssignRouteModal(record: MedicalRecord): void {
    if (record.treatmentRouteId || record.treatmentRoute) {
      this.message.warning('Bệnh án này đã có lộ trình điều trị, không thể chọn lại!');
      return;
    }
    this.targetRecordForAssign.set(record);
    this.selectedRouteIdToAssign.set(null);
    this.isAssignRouteModalVisible.set(true);
  }

  submitAssignRoute(): void {
    const record = this.targetRecordForAssign();
    const routeId = this.selectedRouteIdToAssign();
    if (!record) return;
    if (!routeId) {
      this.message.warning('Vui lòng chọn một phác đồ điều trị!');
      return;
    }

    this.isAssigningRoute.set(true);
    this.medicalRecordService
      .updateMedicalRecord(record.id, { treatmentRouteId: routeId })
      .subscribe({
        next: () => {
          this.message.success('Gán lộ trình điều trị cho bệnh án thành công!');
          this.isAssignRouteModalVisible.set(false);
          this.isAssigningRoute.set(false);
          this.loadRecords();
        },
        error: err => {
          const msg = err.error?.message || 'Không thể gán lộ trình điều trị.';
          this.message.error(msg);
          this.isAssigningRoute.set(false);
        }
      });
  }

  // ----------------------------------------------------------------------------
  // TREATMENT STAGES TRACKING & TRANSITIONS
  // ----------------------------------------------------------------------------

  openStagesModal(record: MedicalRecord): void {
    const routeId = record.treatmentRoute?.id || record.treatmentRouteId;
    if (!routeId) {
      this.message.warning('Hồ sơ bệnh án này chưa được gán lộ trình điều trị.');
      return;
    }

    this.activeRecordForStages.set(record);
    this.isStagesModalVisible.set(true);
    this.loadStagesForActiveRecord(routeId);
  }

  loadStagesForActiveRecord(routeId: number): void {
    this.isLoadingStages.set(true);
    this.stageService.getStagesByRouteId(routeId).subscribe({
      next: res => {
        this.stagesForActiveRecord.set(res.data || []);
        this.isLoadingStages.set(false);
      },
      error: () => {
        this.message.error('Không thể tải các bước giai đoạn của lộ trình.');
        this.isLoadingStages.set(false);
      }
    });
  }

  updateStageStatus(stage: TreatmentStage, newStatus: TreatmentStageStatus): void {
    this.stageService.updateStageStatus(stage.id, newStatus).subscribe({
      next: () => {
        this.message.success(`Đã chuyển trạng thái bước "${stage.stageName}" sang: ${newStatus}`);
        const rec = this.activeRecordForStages();
        const routeId = rec?.treatmentRoute?.id || rec?.treatmentRouteId;
        if (routeId) {
          this.loadStagesForActiveRecord(routeId);
        }
      },
      error: err => {
        const msg = err.error?.message || 'Không thể cập nhật trạng thái bước điều trị.';
        this.message.error(msg);
      }
    });
  }

  getStageActiveStep(stages: TreatmentStage[]): number {
    if (!stages || stages.length === 0) return 0;
    const inProgressIndex = stages.findIndex(s => s.status === TreatmentStageStatus.IN_PROGRESS);
    if (inProgressIndex !== -1) return inProgressIndex;
    const pendingIndex = stages.findIndex(s => s.status === TreatmentStageStatus.PENDING);
    if (pendingIndex !== -1) return pendingIndex;
    return stages.length - 1;
  }
}

