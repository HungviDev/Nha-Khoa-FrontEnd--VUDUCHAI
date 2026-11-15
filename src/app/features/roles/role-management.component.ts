// ==============================================================================
// ROLE MANAGEMENT COMPONENT - ADMIN RBAC ROLES DIRECTORY & CRUD
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
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzPopconfirmModule } from 'ng-zorro-antd/popconfirm';
import { NzToolTipModule } from 'ng-zorro-antd/tooltip';

import { RoleService } from '../../core/services/role.service';
import { Role, RoleRequest } from '../../core/models/dental.models';

@Component({
  selector: 'app-role-management',
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
    NzPopconfirmModule,
    NzToolTipModule
  ],
  templateUrl: './role-management.component.html',
  styleUrls: ['./role-management.component.scss']
})
export class RoleManagementComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly roleService = inject(RoleService);
  private readonly message = inject(NzMessageService);

  readonly roles = signal<Role[]>([]);
  readonly isLoading = signal<boolean>(false);
  readonly isCreateModalVisible = signal<boolean>(false);
  readonly isEditModalVisible = signal<boolean>(false);
  readonly selectedRole = signal<Role | null>(null);

  roleForm: FormGroup = this.fb.group({
    name: ['', [Validators.required, Validators.maxLength(50)]]
  });

  ngOnInit(): void {
    this.loadRoles();
  }

  loadRoles(): void {
    this.isLoading.set(true);
    this.roleService.getRoles().subscribe({
      next: res => {
        if (res.success && res.data) {
          this.roles.set(res.data);
        }
        this.isLoading.set(false);
      },
      error: () => {
        this.message.error('Không thể tải danh sách vai trò.');
        this.isLoading.set(false);
      }
    });
  }

  openCreateModal(): void {
    this.roleForm.reset();
    this.isCreateModalVisible.set(true);
  }

  submitCreate(): void {
    if (this.roleForm.invalid) {
      this.roleForm.markAllAsTouched();
      return;
    }

    const payload: RoleRequest = {
      name: this.roleForm.value.name.trim().toUpperCase()
    };

    this.roleService.createRole(payload).subscribe({
      next: () => {
        this.message.success('Thêm vai trò mới thành công!');
        this.isCreateModalVisible.set(false);
        this.loadRoles();
      },
      error: err => {
        const msg = err.error?.message || 'Lỗi khi tạo vai trò.';
        this.message.error(msg);
      }
    });
  }

  openEditModal(role: Role): void {
    this.selectedRole.set(role);
    this.roleForm.reset({
      name: role.name
    });
    this.isEditModalVisible.set(true);
  }

  submitEdit(): void {
    if (this.roleForm.invalid) {
      this.roleForm.markAllAsTouched();
      return;
    }

    const current = this.selectedRole();
    if (!current) return;

    const payload: RoleRequest = {
      name: this.roleForm.value.name.trim().toUpperCase()
    };

    this.roleService.updateRole(current.id, payload).subscribe({
      next: () => {
        this.message.success('Cập nhật vai trò thành công!');
        this.isEditModalVisible.set(false);
        this.loadRoles();
      },
      error: err => {
        const msg = err.error?.message || 'Lỗi khi sửa vai trò.';
        this.message.error(msg);
      }
    });
  }

  deleteRole(id: number): void {
    this.roleService.deleteRole(id).subscribe({
      next: () => {
        this.message.success('Đã xóa vai trò thành công.');
        this.loadRoles();
      },
      error: err => {
        const msg = err.error?.message || 'Không thể xóa vai trò đang được gán cho người dùng.';
        this.message.error(msg);
      }
    });
  }

  getRoleColor(roleName: string): string {
    if (roleName.includes('ADMIN')) return 'purple';
    if (roleName.includes('DOCTOR')) return 'blue';
    return 'cyan';
  }
}

