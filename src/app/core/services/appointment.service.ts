// ==============================================================================
// APPOINTMENT SERVICE - MANAGE CLINIC BOOKINGS & STATUS WORKFLOWS
// ==============================================================================

import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  ApiResponse,
  Appointment,
  AppointmentCreateRequest,
  AppointmentFilterParams,
  AppointmentStatusUpdateRequest,
  AppointmentUpdateRequest,
  PageResponse
} from '../models/dental.models';

@Injectable({
  providedIn: 'root'
})
export class AppointmentService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/appointments`;

  /**
   * GET /api/v1/appointments
   * Get appointments with multi-criteria filters (userId, doctorId, status) and pagination
   */
  getAppointments(params?: AppointmentFilterParams): Observable<ApiResponse<PageResponse<Appointment>>> {
    let httpParams = new HttpParams();
    if (params) {
      if (params.userId !== undefined) httpParams = httpParams.set('userId', params.userId.toString());
      if (params.doctorId !== undefined) httpParams = httpParams.set('doctorId', params.doctorId.toString());
      if (params.status) httpParams = httpParams.set('status', params.status);
      if (params.page !== undefined) httpParams = httpParams.set('page', params.page.toString());
      if (params.size !== undefined) httpParams = httpParams.set('size', params.size.toString());
      if (params.sortBy) httpParams = httpParams.set('sortBy', params.sortBy);
      if (params.sortDir) httpParams = httpParams.set('sortDir', params.sortDir);
    }
    return this.http.get<ApiResponse<PageResponse<Appointment>>>(this.baseUrl, { params: httpParams });
  }

  /**
   * GET /api/v1/appointments/{id}
   * Get detailed appointment information by ID
   */
  getAppointmentById(id: number): Observable<ApiResponse<Appointment>> {
    return this.http.get<ApiResponse<Appointment>>(`${this.baseUrl}/${id}`);
  }

  /**
   * POST /api/v1/appointments
   * Book an appointment with 30-minute collision prevention
   */
  createAppointment(request: AppointmentCreateRequest): Observable<ApiResponse<Appointment>> {
    return this.http.post<ApiResponse<Appointment>>(this.baseUrl, request);
  }

  /**
   * PUT /api/v1/appointments/{id}
   * Update appointment details (Doctor, service, date, notes)
   */
  updateAppointment(id: number, request: AppointmentUpdateRequest): Observable<ApiResponse<Appointment>> {
    return this.http.put<ApiResponse<Appointment>>(`${this.baseUrl}/${id}`, request);
  }

  /**
   * PATCH /api/v1/appointments/{id}/status
   * Transition status (CONFIRMED, COMPLETED, CANCELLED) - ADMIN/DOCTOR
   */
  updateAppointmentStatus(id: number, request: AppointmentStatusUpdateRequest): Observable<ApiResponse<Appointment>> {
    return this.http.patch<ApiResponse<Appointment>>(`${this.baseUrl}/${id}/status`, request);
  }

  /**
   * POST /api/v1/appointments/{id}/cancel
   * Cancel appointment with optional reason
   */
  cancelAppointment(id: number, reason?: string): Observable<ApiResponse<void>> {
    let httpParams = new HttpParams();
    if (reason) {
      httpParams = httpParams.set('reason', reason);
    }
    return this.http.post<ApiResponse<void>>(`${this.baseUrl}/${id}/cancel`, null, { params: httpParams });
  }
}

