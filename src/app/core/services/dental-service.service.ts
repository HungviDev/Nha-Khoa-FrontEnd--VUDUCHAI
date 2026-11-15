// ==============================================================================
// DENTAL SERVICE SERVICE - MANAGE CLINIC SERVICES & PRICING
// ==============================================================================

import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  ApiResponse,
  DentalService,
  MedicalServiceRequest,
  PageParams,
  PageResponse
} from '../models/dental.models';

export interface ServiceFilterParams extends PageParams {
  keyword?: string;
}

@Injectable({
  providedIn: 'root'
})
export class DentalServiceService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/services`;

  /**
   * GET /api/v1/services
   * Get clinic services catalog with pagination and optional search
   */
  getServices(params?: ServiceFilterParams): Observable<ApiResponse<PageResponse<DentalService>>> {
    let httpParams = new HttpParams();
    if (params) {
      if (params.keyword) httpParams = httpParams.set('keyword', params.keyword);
      if (params.page !== undefined) httpParams = httpParams.set('page', params.page.toString());
      if (params.size !== undefined) httpParams = httpParams.set('size', params.size.toString());
      if (params.sortBy) httpParams = httpParams.set('sortBy', params.sortBy);
      if (params.sortDir) httpParams = httpParams.set('sortDir', params.sortDir);
    }
    return this.http.get<ApiResponse<PageResponse<DentalService>>>(this.baseUrl, { params: httpParams });
  }

  /**
   * GET /api/v1/services/{id}
   * Get medical service details by ID
   */
  getServiceById(id: number): Observable<ApiResponse<DentalService>> {
    return this.http.get<ApiResponse<DentalService>>(`${this.baseUrl}/${id}`);
  }

  /**
   * POST /api/v1/services
   * Create new medical service (Admin only)
   */
  createService(request: MedicalServiceRequest): Observable<ApiResponse<DentalService>> {
    return this.http.post<ApiResponse<DentalService>>(this.baseUrl, request);
  }

  /**
   * PUT /api/v1/services/{id}
   * Update service pricing and details (Admin only)
   */
  updateService(id: number, request: MedicalServiceRequest): Observable<ApiResponse<DentalService>> {
    return this.http.put<ApiResponse<DentalService>>(`${this.baseUrl}/${id}`, request);
  }

  /**
   * DELETE /api/v1/services/{id}
   * Delete dental service from catalog (Admin only)
   */
  deleteService(id: number): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.baseUrl}/${id}`);
  }
}

