// ==============================================================================
// USER PROFILE COMPONENT - ACCOUNT SETTINGS & DOCTOR CREDENTIALS
// ==============================================================================

import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';

// Ng-Zorro Modules
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzInputNumberModule } from 'ng-zorro-antd/input-number';
import { NzDatePickerModule } from 'ng-zorro-antd/date-picker';
import { NzAvatarModule } from 'ng-zorro-antd/avatar';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzDividerModule } from 'ng-zorro-antd/divider';

import { AuthService } from '../../core/services/auth.service';
import { UserService } from '../../core/services/user.service';
import { DoctorService } from '../../core/services/doctor.service';
import { Doctor, UserUpdateRequest } from '../../core/models/dental.models';

@Component({
  selector: 'app-user-profile',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    NzCardModule,
    NzButtonModule,
    NzIconModule,
    NzTagModule,
    NzFormModule,
    NzInputModule,
    NzInputNumberModule,
    NzDatePickerModule,
    NzAvatarModule,
    NzDividerModule
  ],
  templateUrl: './user-profile.component.html',
  styleUrls: ['./user-profile.component.scss']
})
export class UserProfileComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  readonly authService = inject(AuthService);
  private readonly userService = inject(UserService);
  private readonly doctorService = inject(DoctorService);
  private readonly message = inject(NzMessageService);

  readonly currentUser = this.authService.currentUser;
  readonly userRole = this.authService.userRole;
  readonly isDoctor = computed(() => this.userRole() === 'DOCTOR');

  readonly doctorProfile = signal<Doctor | null>(null);
  readonly isSaving = signal<boolean>(false);

  profileForm: FormGroup = this.fb.group({
    fullname: ['', [Validators.required, Validators.maxLength(100)]],
    phone: ['', [Validators.required, Validators.pattern('^[0-9]{9,15}$')]],
    email: ['', [Validators.required, Validators.email]],
    birthDate: [null],
    address: [''],
    avatar: ['']
  });

  doctorForm: FormGroup = this.fb.group({
    specialization: ['', [Validators.required, Validators.maxLength(100)]],
    experienceYears: [1, [Validators.required, Validators.min(0)]]
  });

  ngOnInit(): void {
    this.populateUserData();
    if (this.isDoctor()) {
      this.loadDoctorProfile();
    }
  }

  populateUserData(): void {
    const user = this.currentUser();
    if (!user) return;

    this.profileForm.patchValue({
      fullname: user.fullname,
      phone: user.phone,
      email: user.email,
      birthDate: user.birthDate ? new Date(user.birthDate) : null,
      address: user.address || '',
      avatar: user.avatar || ''
    });
  }

  loadDoctorProfile(): void {
    const user = this.currentUser();
    if (!user) return;

    this.doctorService.getDoctorByUserId(user.id).subscribe({
      next: res => {
        if (res.success && res.data) {
          this.doctorProfile.set(res.data);
          this.doctorForm.patchValue({
            specialization: res.data.specialization,
            experienceYears: res.data.experienceYears
          });
        }
      }
    });
  }

  submitProfileUpdate(): void {
    if (this.profileForm.invalid) {
      this.profileForm.markAllAsTouched();
      return;
    }

    const user = this.currentUser();
    if (!user) return;

    this.isSaving.set(true);
    const val = this.profileForm.value;
    const request: UserUpdateRequest = {
      fullname: val.fullname,
      phone: val.phone,
      email: val.email,
      birthDate: val.birthDate ? this.formatDate(val.birthDate) : undefined,
      address: val.address || undefined,
      avatar: val.avatar || undefined
    };

    this.userService.updateUser(user.id, request).subscribe({
      next: res => {
        this.message.success('Cập nhật hồ sơ tài khoản thành công!');
        if (res.success && res.data) {
          this.authService.currentUser.set(res.data);
        }
        this.isSaving.set(false);
      },
      error: err => {
        const msg = err.error?.message || 'Lỗi khi cập nhật hồ sơ.';
        this.message.error(msg);
        this.isSaving.set(false);
      }
    });
  }

  submitDoctorUpdate(): void {
    if (this.doctorForm.invalid) {
      this.doctorForm.markAllAsTouched();
      return;
    }

    const doc = this.doctorProfile();
    if (!doc) return;

    this.isSaving.set(true);
    const val = this.doctorForm.value;
    this.doctorService.updateDoctor(doc.id, val).subscribe({
      next: () => {
        this.message.success('Cập nhật hồ sơ chuyên môn bác sĩ thành công!');
        this.isSaving.set(false);
      },
      error: err => {
        const msg = err.error?.message || 'Lỗi khi cập nhật hồ sơ bác sĩ.';
        this.message.error(msg);
        this.isSaving.set(false);
      }
    });
  }

  private formatDate(d: Date): string {
    const pad = (n: number) => n.toString().padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  }
}

