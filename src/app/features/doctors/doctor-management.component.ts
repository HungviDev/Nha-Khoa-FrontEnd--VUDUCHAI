// ==============================================================================
// DOCTOR MANAGEMENT COMPONENT - ADMIN DOCTORS DIRECTORY & SPECIALIZATION
// ==============================================================================

import { Component, OnInit, inject, signal } from '@angular/core';
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
import { NzAvatarModule } from 'ng-zorro-antd/avatar';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzPopconfirmModule } from 'ng-zorro-antd/popconfirm';
import { NzToolTipModule } from 'ng-zorro-antd/tooltip';

import { DoctorService } from '../../core/services/doctor.service';
import { UserService } from '../../core/services/user.service';
import { Doctor, DoctorCreateRequest, DoctorUpdateRequest, User } from '../../core/models/dental.models';

@Component({
  selector: 'app-doctor-management',
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
    NzAvatarModule,
    NzPopconfirmModule,
    NzToolTipModule
  ],
  templateUrl: './doctor-management.component.html',
  styleUrls: ['./doctor-management.component.scss']
})
export class DoctorManagementComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly doctorService = inject(DoctorService);
  private readonly userService = inject(UserService);
  private readonly message = inject(NzMessageService);

  readonly doctors = signal<Doctor[]>([]);
  readonly users = signal<User[]>([]);
  readonly isLoading = signal<boolean>(false);
  readonly totalElements = signal<number>(0);
  readonly pageIndex = signal<number>(1);
  readonly pageSize = signal<number>(10);
  readonly searchKeyword = signal<string>('');

  readonly isCreateModalVisible = signal<boolean>(false);
  readonly isEditModalVisible = signal<boolean>(false);
  readonly selectedDoctor = signal<Doctor | null>(null);

  createForm: FormGroup = this.fb.group({
    userId: [null, [Validators.required]],
    specialization: ['', [Validators.required, Validators.maxLength(100)]],
    experienceYears: [1, [Validators.required, Validators.min(0)]]
  });

  editForm: FormGroup = this.fb.group({
    specialization: ['', [Validators.required, Validators.maxLength(100)]],
    experienceYears: [1, [Validators.required, Validators.min(0)]]
  });

  ngOnInit(): void {
    this.loadDoctors();
    this.loadDoctorEligibleUsers();
  }

  loadDoctors(): void {
    this.isLoading.set(true);
    this.doctorService
      .getDoctors({
        keyword: this.searchKeyword() || undefined,
        page: this.pageIndex() - 1,
        size: this.pageSize(),
        sortBy: 'id',
        sortDir: 'desc'
      })
      .subscribe({
        next: res => {
          if (res.success && res.data) {
            this.doctors.set(res.data.items);
            this.totalElements.set(res.data.totalElements);
          }
          this.isLoading.set(false);
        },
        error: () => {
          this.message.error('Không thể tải danh sách bác sĩ.');
          this.isLoading.set(false);
        }
      });
  }

  loadDoctorEligibleUsers(): void {
    this.userService.getUsers({ size: 100 }).subscribe({
      next: res => {
        if (res.success && res.data) {
          // Filter users who have role DOCTOR
          this.users.set(res.data.items.filter(u => u.role?.name?.includes('DOCTOR')));
        }
      }
    });
  }

  onSearch(keyword: any): void {
    this.searchKeyword.set(keyword ? String(keyword) : '');
    this.pageIndex.set(1);
    this.loadDoctors();
  }

  onPageChange(page: number): void {
    this.pageIndex.set(page);
    this.loadDoctors();
  }

  onPageSizeChange(size: number): void {
    this.pageSize.set(size);
    this.pageIndex.set(1);
    this.loadDoctors();
  }

  openCreateModal(): void {
    this.createForm.reset({
      experienceYears: 3
    });
    this.isCreateModalVisible.set(true);
  }

  submitCreate(): void {
    if (this.createForm.invalid) {
      this.createForm.markAllAsTouched();
      return;
    }

    const payload: DoctorCreateRequest = this.createForm.value;
    this.doctorService.createDoctor(payload).subscribe({
      next: () => {
        this.message.success('Tạo hồ sơ bác sĩ thành công!');
        this.isCreateModalVisible.set(false);
        this.loadDoctors();
      },
      error: err => {
        const msg = err.error?.message || 'Lỗi khi tạo hồ sơ bác sĩ.';
        this.message.error(msg);
      }
    });
  }

  openEditModal(doc: Doctor): void {
    this.selectedDoctor.set(doc);
    this.editForm.reset({
      specialization: doc.specialization,
      experienceYears: doc.experienceYears
    });
    this.isEditModalVisible.set(true);
  }

  submitEdit(): void {
    if (this.editForm.invalid) {
      this.editForm.markAllAsTouched();
      return;
    }

    const current = this.selectedDoctor();
    if (!current) return;

    const payload: DoctorUpdateRequest = this.editForm.value;
    this.doctorService.updateDoctor(current.id, payload).subscribe({
      next: () => {
        this.message.success('Cập nhật thông tin bác sĩ thành công!');
        this.isEditModalVisible.set(false);
        this.loadDoctors();
      },
      error: err => {
        const msg = err.error?.message || 'Lỗi khi cập nhật hồ sơ bác sĩ.';
        this.message.error(msg);
      }
    });
  }

  deleteDoctor(id: number): void {
    this.doctorService.deleteDoctor(id).subscribe({
      next: () => {
        this.message.success('Đã xóa hồ sơ bác sĩ thành công.');
        this.loadDoctors();
      },
      error: err => {
        const msg = err.error?.message || 'Không thể xóa hồ sơ bác sĩ này.';
        this.message.error(msg);
      }
    });
  }
}

