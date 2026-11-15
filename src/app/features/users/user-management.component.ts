// ==============================================================================
// USER MANAGEMENT COMPONENT - ADMIN USER DIRECTORY & RBAC ASSIGNMENT
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
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzDatePickerModule } from 'ng-zorro-antd/date-picker';
import { NzAvatarModule } from 'ng-zorro-antd/avatar';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzPopconfirmModule } from 'ng-zorro-antd/popconfirm';
import { NzToolTipModule } from 'ng-zorro-antd/tooltip';

import { UserService } from '../../core/services/user.service';
import { RoleService } from '../../core/services/role.service';
import { Role, User, UserCreateRequest, UserUpdateRequest } from '../../core/models/dental.models';

@Component({
  selector: 'app-user-management',
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
    NzAvatarModule,
    NzPopconfirmModule,
    NzToolTipModule
  ],
  templateUrl: './user-management.component.html',
  styleUrls: ['./user-management.component.scss']
})
export class UserManagementComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly userService = inject(UserService);
  private readonly roleService = inject(RoleService);
  private readonly message = inject(NzMessageService);

  // Data State Signals
  readonly users = signal<User[]>([]);
  readonly roles = signal<Role[]>([]);
  readonly isLoading = signal<boolean>(false);
  readonly totalElements = signal<number>(0);
  readonly pageIndex = signal<number>(1);
  readonly pageSize = signal<number>(10);
  readonly searchKeyword = signal<string>('');

  // Modals Visibility
  readonly isCreateModalVisible = signal<boolean>(false);
  readonly isEditModalVisible = signal<boolean>(false);
  readonly selectedUser = signal<User | null>(null);

  // Reactive Forms
  createForm: FormGroup = this.fb.group({
    fullname: ['', [Validators.required, Validators.maxLength(100)]],
    phone: ['', [Validators.required, Validators.pattern('^[0-9]{9,15}$')]],
    email: ['', [Validators.required, Validators.email, Validators.maxLength(100)]],
    password: ['', [Validators.required, Validators.minLength(6), Validators.maxLength(50)]],
    birthDate: [null],
    address: [''],
    roleId: [null, [Validators.required]]
  });

  editForm: FormGroup = this.fb.group({
    fullname: ['', [Validators.required, Validators.maxLength(100)]],
    phone: ['', [Validators.required, Validators.pattern('^[0-9]{9,15}$')]],
    email: ['', [Validators.required, Validators.email, Validators.maxLength(100)]],
    birthDate: [null],
    address: [''],
    roleId: [null, [Validators.required]]
  });

  ngOnInit(): void {
    this.loadUsers();
    this.loadRoles();
  }

  // ----------------------------------------------------------------------------
  // DATA LOADING
  // ----------------------------------------------------------------------------

  loadUsers(): void {
    this.isLoading.set(true);
    this.userService
      .getUsers({
        keyword: this.searchKeyword() || undefined,
        page: this.pageIndex() - 1,
        size: this.pageSize(),
        sortBy: 'id',
        sortDir: 'desc'
      })
      .subscribe({
        next: res => {
          if (res.success && res.data) {
            this.users.set(res.data.items);
            this.totalElements.set(res.data.totalElements);
          }
          this.isLoading.set(false);
        },
        error: () => {
          this.message.error('Không thể tải danh sách tài khoản.');
          this.isLoading.set(false);
        }
      });
  }

  loadRoles(): void {
    this.roleService.getRoles().subscribe({
      next: res => {
        if (res.success && res.data) {
          this.roles.set(res.data);
        }
      }
    });
  }

  onSearch(keyword: any): void {
    this.searchKeyword.set(keyword ? String(keyword) : '');
    this.pageIndex.set(1);
    this.loadUsers();
  }

  onPageChange(page: number): void {
    this.pageIndex.set(page);
    this.loadUsers();
  }

  onPageSizeChange(size: number): void {
    this.pageSize.set(size);
    this.pageIndex.set(1);
    this.loadUsers();
  }

  // ----------------------------------------------------------------------------
  // CREATE USER
  // ----------------------------------------------------------------------------

  openCreateModal(): void {
    this.createForm.reset({
      roleId: this.roles().find(r => r.name.includes('PATIENT'))?.id || null
    });
    this.isCreateModalVisible.set(true);
  }

  submitCreate(): void {
    if (this.createForm.invalid) {
      this.createForm.markAllAsTouched();
      return;
    }

    const val = this.createForm.value;
    const request: UserCreateRequest = {
      fullname: val.fullname,
      phone: val.phone,
      email: val.email,
      password: val.password,
      birthDate: val.birthDate ? this.formatDate(val.birthDate) : undefined,
      address: val.address || undefined,
      roleId: val.roleId
    };

    this.userService.createUser(request).subscribe({
      next: () => {
        this.message.success('Tạo tài khoản người dùng mới thành công!');
        this.isCreateModalVisible.set(false);
        this.loadUsers();
      },
      error: err => {
        const msg = err.error?.message || 'Lỗi khi tạo tài khoản người dùng.';
        this.message.error(msg);
      }
    });
  }

  // ----------------------------------------------------------------------------
  // EDIT USER
  // ----------------------------------------------------------------------------

  openEditModal(user: User): void {
    this.selectedUser.set(user);
    this.editForm.reset({
      fullname: user.fullname,
      phone: user.phone,
      email: user.email,
      birthDate: user.birthDate ? new Date(user.birthDate) : null,
      address: user.address || '',
      roleId: user.role?.id || null
    });
    this.isEditModalVisible.set(true);
  }

  submitEdit(): void {
    if (this.editForm.invalid) {
      this.editForm.markAllAsTouched();
      return;
    }

    const current = this.selectedUser();
    if (!current) return;

    const val = this.editForm.value;
    const request: UserUpdateRequest = {
      fullname: val.fullname,
      phone: val.phone,
      email: val.email,
      birthDate: val.birthDate ? this.formatDate(val.birthDate) : undefined,
      address: val.address || undefined,
      roleId: val.roleId
    };

    this.userService.updateUser(current.id, request).subscribe({
      next: () => {
        this.message.success('Cập nhật tài khoản người dùng thành công!');
        this.isEditModalVisible.set(false);
        this.loadUsers();
      },
      error: err => {
        const msg = err.error?.message || 'Lỗi khi cập nhật tài khoản.';
        this.message.error(msg);
      }
    });
  }

  // ----------------------------------------------------------------------------
  // DELETE USER
  // ----------------------------------------------------------------------------

  deleteUser(id: number): void {
    this.userService.deleteUser(id).subscribe({
      next: () => {
        this.message.success('Đã xóa tài khoản thành công.');
        this.loadUsers();
      },
      error: err => {
        const msg = err.error?.message || 'Không thể xóa tài khoản này.';
        this.message.error(msg);
      }
    });
  }

  getRoleBadgeColor(roleName: string): string {
    if (roleName.includes('ADMIN')) return 'purple';
    if (roleName.includes('DOCTOR')) return 'blue';
    return 'cyan';
  }

  private formatDate(d: Date): string {
    const pad = (n: number) => n.toString().padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  }
}

