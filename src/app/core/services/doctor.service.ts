// ==============================================================================
// DOCTOR SERVICE - MANAGE DOCTORS DIRECTORY & SPECIALIZATIONS
// ==============================================================================

import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  ApiResponse,
  Doctor,
  DoctorCreateRequest,
  DoctorUpdateRequest,
  PageParams,
  PageResponse
} from '../models/dental.models';

export interface DoctorFilterParams extends PageParams {
  keyword?: string;
}

@Injectable({
  providedIn: 'root'
})
export class DoctorService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/doctors`;

  /**
   * GET /api/v1/doctors
   * Get list of doctors with optional keyword search & pagination
   */
  getDoctors(params?: DoctorFilterParams): Observable<ApiResponse<PageResponse<Doctor>>> {
    let httpParams = new HttpParams();
    if (params) {
      if (params.keyword) httpParams = httpParams.set('keyword', params.keyword);
      if (params.page !== undefined) httpParams = httpParams.set('page', params.page.toString());
      if (params.size !== undefined) httpParams = httpParams.set('size', params.size.toString());
      if (params.sortBy) httpParams = httpParams.set('sortBy', params.sortBy);
      if (params.sortDir) httpParams = httpParams.set('sortDir', params.sortDir);
    }
    return this.http.get<ApiResponse<PageResponse<Doctor>>>(this.baseUrl, { params: httpParams });
  }

  /**
   * GET /api/v1/doctors/{id}
   * Get doctor details by Doctor ID
   */
  getDoctorById(id: number): Observable<ApiResponse<Doctor>> {
    return this.http.get<ApiResponse<Doctor>>(`${this.baseUrl}/${id}`);
  }

  /**
   * GET /api/v1/doctors/user/{userId}
   * Get doctor profile associated with a User ID
   */
  getDoctorByUserId(userId: number): Observable<ApiResponse<Doctor>> {
    return this.http.get<ApiResponse<Doctor>>(`${this.baseUrl}/user/${userId}`);
  }

  /**
   * POST /api/v1/doctors
   * Create doctor profile for existing user account (Admin only)
   */
  createDoctor(request: DoctorCreateRequest): Observable<ApiResponse<Doctor>> {
    return this.http.post<ApiResponse<Doctor>>(this.baseUrl, request);
  }

  /**
   * PUT /api/v1/doctors/{id}
   * Update doctor specialization and experience years (Admin or doctor owner)
   */
  updateDoctor(id: number, request: DoctorUpdateRequest): Observable<ApiResponse<Doctor>> {
    return this.http.put<ApiResponse<Doctor>>(`${this.baseUrl}/${id}`, request);
  }

  /**
   * DELETE /api/v1/doctors/{id}
   * Remove doctor profile (Admin only)
   */
  deleteDoctor(id: number): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.baseUrl}/${id}`);
  }
}

