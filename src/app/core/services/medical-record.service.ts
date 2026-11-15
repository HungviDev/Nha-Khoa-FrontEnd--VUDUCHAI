// ==============================================================================
// MEDICAL RECORD SERVICE - MANAGE PATIENT CLINICAL HISTORY & DIAGNOSES
// ==============================================================================

import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  ApiResponse,
  MedicalRecord,
  MedicalRecordCreateRequest,
  MedicalRecordFilterParams,
  MedicalRecordUpdateRequest,
  PageParams,
  PageResponse
} from '../models/dental.models';

@Injectable({
  providedIn: 'root'
})
export class MedicalRecordService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/medical-records`;

  /**
   * GET /api/v1/medical-records
   * Get all medical records with filters (userId, doctorId, keyword) and pagination (ADMIN/DOCTOR)
   */
  getMedicalRecords(params?: MedicalRecordFilterParams): Observable<ApiResponse<PageResponse<MedicalRecord>>> {
    let httpParams = new HttpParams();
    if (params) {
      if (params.userId !== undefined) httpParams = httpParams.set('userId', params.userId.toString());
      if (params.doctorId !== undefined) httpParams = httpParams.set('doctorId', params.doctorId.toString());
      if (params.keyword) httpParams = httpParams.set('keyword', params.keyword);
      if (params.page !== undefined) httpParams = httpParams.set('page', params.page.toString());
      if (params.size !== undefined) httpParams = httpParams.set('size', params.size.toString());
      if (params.sortBy) httpParams = httpParams.set('sortBy', params.sortBy);
      if (params.sortDir) httpParams = httpParams.set('sortDir', params.sortDir);
    }
    return this.http.get<ApiResponse<PageResponse<MedicalRecord>>>(this.baseUrl, { params: httpParams });
  }

  /**
   * GET /api/v1/medical-records/patient/{userId}
   * Get clinical history for a specific patient (ADMIN, DOCTOR, or Patient Owner)
   */
  getMedicalRecordsByPatient(userId: number, params?: PageParams): Observable<ApiResponse<PageResponse<MedicalRecord>>> {
    let httpParams = new HttpParams();
    if (params) {
      if (params.page !== undefined) httpParams = httpParams.set('page', params.page.toString());
      if (params.size !== undefined) httpParams = httpParams.set('size', params.size.toString());
      if (params.sortBy) httpParams = httpParams.set('sortBy', params.sortBy);
      if (params.sortDir) httpParams = httpParams.set('sortDir', params.sortDir);
    }
    return this.http.get<ApiResponse<PageResponse<MedicalRecord>>>(`${this.baseUrl}/patient/${userId}`, { params: httpParams });
  }

  /**
   * GET /api/v1/medical-records/{id}
   * Get medical record details by ID
   */
  getMedicalRecordById(id: number): Observable<ApiResponse<MedicalRecord>> {
    return this.http.get<ApiResponse<MedicalRecord>>(`${this.baseUrl}/${id}`);
  }

  /**
   * POST /api/v1/medical-records
   * Create a new diagnosis record (ADMIN/DOCTOR)
   */
  createMedicalRecord(request: MedicalRecordCreateRequest): Observable<ApiResponse<MedicalRecord>> {
    return this.http.post<ApiResponse<MedicalRecord>>(this.baseUrl, request);
  }

  /**
   * PUT /api/v1/medical-records/{id}
   * Update clinical diagnosis details (ADMIN/DOCTOR)
   */
  updateMedicalRecord(id: number, request: MedicalRecordUpdateRequest): Observable<ApiResponse<MedicalRecord>> {
    return this.http.put<ApiResponse<MedicalRecord>>(`${this.baseUrl}/${id}`, request);
  }

  /**
   * DELETE /api/v1/medical-records/{id}
   * Delete medical record (ADMIN only)
   */
  deleteMedicalRecord(id: number): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.baseUrl}/${id}`);
  }
}

