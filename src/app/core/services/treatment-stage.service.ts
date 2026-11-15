// ==============================================================================
// TREATMENT STAGE SERVICE - MANAGE STAGE SEQUENCES & CLINICAL PROGRESS
// ==============================================================================

import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  ApiResponse,
  TreatmentStage,
  TreatmentStageCreateRequest,
  TreatmentStageStatus,
  TreatmentStageUpdateRequest
} from '../models/dental.models';

@Injectable({
  providedIn: 'root'
})
export class TreatmentStageService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/treatment-stages`;

  /**
   * GET /api/v1/treatment-stages/route/{routeId}
   * Get all sequential stages of a treatment protocol ordered by sequence
   */
  getStagesByRouteId(routeId: number): Observable<ApiResponse<TreatmentStage[]>> {
    return this.http.get<ApiResponse<TreatmentStage[]>>(`${this.baseUrl}/route/${routeId}`);
  }

  /**
   * GET /api/v1/treatment-stages/{id}
   * Get treatment stage details by ID
   */
  getStageById(id: number): Observable<ApiResponse<TreatmentStage>> {
    return this.http.get<ApiResponse<TreatmentStage>>(`${this.baseUrl}/${id}`);
  }

  /**
   * POST /api/v1/treatment-stages
   * Add a new sequential stage to a treatment protocol (ADMIN/DOCTOR)
   */
  createStage(request: TreatmentStageCreateRequest): Observable<ApiResponse<TreatmentStage>> {
    return this.http.post<ApiResponse<TreatmentStage>>(this.baseUrl, request);
  }

  /**
   * PUT /api/v1/treatment-stages/{id}
   * Update stage details, sequence order, cost, delay (ADMIN/DOCTOR)
   */
  updateStage(id: number, request: TreatmentStageUpdateRequest): Observable<ApiResponse<TreatmentStage>> {
    return this.http.put<ApiResponse<TreatmentStage>>(`${this.baseUrl}/${id}`, request);
  }

  /**
   * PATCH /api/v1/treatment-stages/{id}/status?status=...
   * Update clinical progress status (IN_PROGRESS, COMPLETED, CANCELLED) - ADMIN/DOCTOR
   */
  updateStageStatus(id: number, status: TreatmentStageStatus): Observable<ApiResponse<TreatmentStage>> {
    let httpParams = new HttpParams().set('status', status);
    return this.http.patch<ApiResponse<TreatmentStage>>(`${this.baseUrl}/${id}/status`, null, { params: httpParams });
  }

  /**
   * DELETE /api/v1/treatment-stages/{id}
   * Delete stage from protocol (ADMIN only)
   */
  deleteStage(id: number): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.baseUrl}/${id}`);
  }
}

