// ==============================================================================
// DASHBOARD COMPONENT - ADMIN CLINIC KPI & OVERVIEW
// ==============================================================================

import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

// Ng-Zorro Modules
import { NzStatisticModule } from 'ng-zorro-antd/statistic';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzButtonModule } from 'ng-zorro-antd/button';

import { AuthService } from '../../core/services/auth.service';
import { AppointmentService } from '../../core/services/appointment.service';
import { Appointment } from '../../core/models/dental.models';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    NzStatisticModule,
    NzCardModule,
    NzGridModule,
    NzIconModule,
    NzTableModule,
    NzTagModule,
    NzButtonModule
  ],
  template: `
    <div class="dashboard-page">
      <!-- KPI STATS CARDS -->
      <div nz-row [nzGutter]="[20, 20]">
        <div nz-col [nzXs]="24" [nzSm]="12" [nzLg]="6">
          <div class="dental-card kpi-card">
            <div class="kpi-icon kpi-icon--blue">
              <span nz-icon nzType="calendar"></span>
            </div>
            <div class="kpi-info">
              <nz-statistic [nzValue]="48" [nzTitle]="'Lịch Khám Hôm Nay'"></nz-statistic>
              <span class="kpi-trend text-success">
                <span nz-icon nzType="arrow-up"></span> +12% so với hôm qua
              </span>
            </div>
          </div>
        </div>

        <div nz-col [nzXs]="24" [nzSm]="12" [nzLg]="6">
          <div class="dental-card kpi-card">
            <div class="kpi-icon kpi-icon--teal">
              <span nz-icon nzType="medicine-box"></span>
            </div>
            <div class="kpi-info">
              <nz-statistic [nzValue]="16" [nzTitle]="'Bác Sĩ Trực Ban'"></nz-statistic>
              <span class="kpi-trend text-ocean">100% Sẵn sàng tiếp nhận</span>
            </div>
          </div>
        </div>

        <div nz-col [nzXs]="24" [nzSm]="12" [nzLg]="6">
          <div class="dental-card kpi-card">
            <div class="kpi-icon kpi-icon--green">
              <span nz-icon nzType="dollar"></span>
            </div>
            <div class="kpi-info">
              <nz-statistic [nzValue]="125800000" [nzTitle]="'Doanh Thu Tháng (VNĐ)'"></nz-statistic>
              <span class="kpi-trend text-success">
                <span nz-icon nzType="arrow-up"></span> +8.5% mục tiêu
              </span>
            </div>
          </div>
        </div>

        <div nz-col [nzXs]="24" [nzSm]="12" [nzLg]="6">
          <div class="dental-card kpi-card">
            <div class="kpi-icon kpi-icon--amber">
              <span nz-icon nzType="usergroup-add"></span>
            </div>
            <div class="kpi-info">
              <nz-statistic [nzValue]="320" [nzTitle]="'Bệnh Nhân Mới'"></nz-statistic>
              <span class="kpi-trend text-ocean">Tăng trưởng ổn định</span>
            </div>
          </div>
        </div>
      </div>

      <!-- RECENT APPOINTMENTS QUICK TABLE -->
      <div class="dental-card mt-6">
        <div class="dental-card__header">
          <h3>
            <span nz-icon nzType="clock-circle"></span>
            Lịch Hẹn Khám Gần Nhất Cần Điều Phối
          </h3>
          <button nz-button nzType="link" routerLink="/admin/appointments">
            Xem tất cả lịch hẹn <span nz-icon nzType="right"></span>
          </button>
        </div>

        <nz-table #recentTable [nzData]="recentAppointments()" [nzShowPagination]="false" nzSize="middle">
          <thead>
            <tr>
              <th>Mã LH</th>
              <th>Bệnh nhân</th>
              <th>Bác sĩ</th>
              <th>Dịch vụ</th>
              <th>Thời gian</th>
              <th>Trạng thái</th>
            </tr>
          </thead>
          <tbody>
            @for (item of recentTable.data; track item.id) {
              <tr>
                <td><strong>#{{ item.id }}</strong></td>
                <td>{{ item.user?.fullname }}</td>
                <td>{{ item.doctor?.user?.fullname }}</td>
                <td>{{ item.service?.name }}</td>
                <td>{{ item.appointmentDate }}</td>
                <td>
                  <span class="status-badge status-badge--pending">{{ item.status }}</span>
                </td>
              </tr>
            }
          </tbody>
        </nz-table>
      </div>
    </div>
  `,
  styles: [`
    @use '../../../styles/variables' as *;

    .dashboard-page {
      display: flex;
      flex-direction: column;
      gap: 20px;
    }

    .kpi-card {
      display: flex;
      align-items: center;
      gap: 16px;
      padding: 20px;

      .kpi-icon {
        width: 52px;
        height: 52px;
        border-radius: 12px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 24px;

        &--blue {
          background-color: #f0f9ff;
          color: #0284c7;
        }

        &--teal {
          background-color: #ecfeff;
          color: #0891b2;
        }

        &--green {
          background-color: #ecfdf5;
          color: #10b981;
        }

        &--amber {
          background-color: #fffbeb;
          color: #f59e0b;
        }
      }

      .kpi-info {
        flex: 1;

        .kpi-trend {
          font-size: 11px;
          font-weight: 500;
          display: block;
          margin-top: 4px;
        }
      }
    }

    .mt-6 {
      margin-top: 24px;
    }
  `]
})
export class DashboardComponent implements OnInit {
  private readonly appointmentService = inject(AppointmentService);
  readonly recentAppointments = signal<Appointment[]>([]);

  ngOnInit(): void {
    this.appointmentService.getAppointments({ page: 0, size: 5, sortBy: 'appointmentDate', sortDir: 'desc' }).subscribe({
      next: res => {
        if (res.success && res.data) {
          this.recentAppointments.set(res.data.items);
        }
      }
    });
  }
}

