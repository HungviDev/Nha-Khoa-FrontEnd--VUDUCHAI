// ==============================================================================
// SERVICE CATALOG COMPONENT - DENTAL SERVICES & PRICING MANAGEMENT
// ==============================================================================

import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';

// Ng-Zorro Modules
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzInputNumberModule } from 'ng-zorro-antd/input-number';
import { NzAvatarModule } from 'ng-zorro-antd/avatar';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzPopconfirmModule } from 'ng-zorro-antd/popconfirm';
import { NzToolTipModule } from 'ng-zorro-antd/tooltip';

import { DentalServiceService } from '../../core/services/dental-service.service';
import { AuthService } from '../../core/services/auth.service';
import { DentalService, MedicalServiceRequest } from '../../core/models/dental.models';

@Component({
  selector: 'app-service-catalog',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    NzTableModule,
    NzButtonModule,
    NzIconModule,
    NzModalModule,
    NzFormModule,
    NzInputModule,
    NzInputNumberModule,
    NzAvatarModule,
    NzPopconfirmModule,
    NzToolTipModule
  ],
  templateUrl: './service-catalog.component.html',
  styleUrls: ['./service-catalog.component.scss']
})
export class ServiceCatalogComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly dentalService = inject(DentalServiceService);
  private readonly authService = inject(AuthService);
  private readonly message = inject(NzMessageService);

  readonly userRole = this.authService.userRole;
  readonly isAdmin = computed(() => this.userRole() === 'ADMIN');

  readonly services = signal<DentalService[]>([]);
  readonly isLoading = signal<boolean>(false);
  readonly totalElements = signal<number>(0);
  readonly pageIndex = signal<number>(1);
  readonly pageSize = signal<number>(10);
  readonly searchKeyword = signal<string>('');

  readonly isCreateModalVisible = signal<boolean>(false);
  readonly isEditModalVisible = signal<boolean>(false);
  readonly selectedService = signal<DentalService | null>(null);

  serviceForm: FormGroup = this.fb.group({
    name: ['', [Validators.required, Validators.maxLength(150)]],
    price: [0, [Validators.required, Validators.min(0)]],
    description: [''],
    image: ['']
  });

  ngOnInit(): void {
    this.loadServices();
  }

  loadServices(): void {
    this.isLoading.set(true);
    this.dentalService
      .getServices({
        keyword: this.searchKeyword() || undefined,
        page: this.pageIndex() - 1,
        size: this.pageSize(),
        sortBy: 'id',
        sortDir: 'desc'
      })
      .subscribe({
        next: res => {
          if (res.success && res.data) {
            this.services.set(res.data.items);
            this.totalElements.set(res.data.totalElements);
          }
          this.isLoading.set(false);
        },
        error: () => {
          this.message.error('Không thể tải bảng giá dịch vụ.');
          this.isLoading.set(false);
        }
      });
  }

  onSearch(keyword: any): void {
    this.searchKeyword.set(keyword ? String(keyword) : '');
    this.pageIndex.set(1);
    this.loadServices();
  }

  onPageChange(page: number): void {
    this.pageIndex.set(page);
    this.loadServices();
  }

  onPageSizeChange(size: number): void {
    this.pageSize.set(size);
    this.pageIndex.set(1);
    this.loadServices();
  }

  openCreateModal(): void {
    this.serviceForm.reset({
      price: 500000
    });
    this.isCreateModalVisible.set(true);
  }

  submitCreate(): void {
    if (this.serviceForm.invalid) {
      this.serviceForm.markAllAsTouched();
      return;
    }

    const val = this.serviceForm.value;
    const request: MedicalServiceRequest = {
      name: val.name,
      price: val.price,
      description: val.description || undefined,
      image: val.image || undefined
    };

    this.dentalService.createService(request).subscribe({
      next: () => {
        this.message.success('Thêm dịch vụ nha khoa mới thành công!');
        this.isCreateModalVisible.set(false);
        this.loadServices();
      },
      error: err => {
        const msg = err.error?.message || 'Lỗi khi thêm dịch vụ.';
        this.message.error(msg);
      }
    });
  }

  openEditModal(service: DentalService): void {
    this.selectedService.set(service);
    this.serviceForm.reset({
      name: service.name,
      price: service.price,
      description: service.description || '',
      image: service.image || ''
    });
    this.isEditModalVisible.set(true);
  }

  submitEdit(): void {
    if (this.serviceForm.invalid) {
      this.serviceForm.markAllAsTouched();
      return;
    }

    const current = this.selectedService();
    if (!current) return;

    const val = this.serviceForm.value;
    const request: MedicalServiceRequest = {
      name: val.name,
      price: val.price,
      description: val.description || undefined,
      image: val.image || undefined
    };

    this.dentalService.updateService(current.id, request).subscribe({
      next: () => {
        this.message.success('Cập nhật dịch vụ thành công!');
        this.isEditModalVisible.set(false);
        this.loadServices();
      },
      error: err => {
        const msg = err.error?.message || 'Lỗi khi cập nhật dịch vụ.';
        this.message.error(msg);
      }
    });
  }

  deleteService(id: number): void {
    this.dentalService.deleteService(id).subscribe({
      next: () => {
        this.message.success('Đã xóa dịch vụ thành công.');
        this.loadServices();
      },
      error: err => {
        const msg = err.error?.message || 'Không thể xóa dịch vụ này.';
        this.message.error(msg);
      }
    });
  }
}

