// ==============================================================================
// TREATMENT ROUTE SERVICE - MANAGE CLINICAL TREATMENT PROTOCOLS
// ==============================================================================

import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  ApiResponse,
  PageParams,
  PageResponse,
  TreatmentRoute,
  TreatmentRouteCreateRequest,
  TreatmentRouteUpdateRequest
} from '../models/dental.models';

export interface TreatmentRouteFilterParams extends PageParams {
  keyword?: string;
}

@Injectable({
  providedIn: 'root'
})
export class TreatmentRouteService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/treatment-routes`;

  /**
   * GET /api/v1/treatment-routes
   * Get treatment protocols with keyword search and pagination
   */
  getRoutes(params?: TreatmentRouteFilterParams): Observable<ApiResponse<PageResponse<TreatmentRoute>>> {
    let httpParams = new HttpParams();
    if (params) {
      if (params.keyword) httpParams = httpParams.set('keyword', params.keyword);
      if (params.page !== undefined) httpParams = httpParams.set('page', params.page.toString());
      if (params.size !== undefined) httpParams = httpParams.set('size', params.size.toString());
      if (params.sortBy) httpParams = httpParams.set('sortBy', params.sortBy);
      if (params.sortDir) httpParams = httpParams.set('sortDir', params.sortDir);
    }
    return this.http.get<ApiResponse<PageResponse<TreatmentRoute>>>(this.baseUrl, { params: httpParams });
  }

  /**
   * GET /api/v1/treatment-routes/{id}
   * Get treatment route details by ID
   */
  getRouteById(id: number): Observable<ApiResponse<TreatmentRoute>> {
    return this.http.get<ApiResponse<TreatmentRoute>>(`${this.baseUrl}/${id}`);
  }

  /**
   * POST /api/v1/treatment-routes
   * Create a new treatment protocol (ADMIN/DOCTOR)
   */
  createRoute(request: TreatmentRouteCreateRequest): Observable<ApiResponse<TreatmentRoute>> {
    return this.http.post<ApiResponse<TreatmentRoute>>(this.baseUrl, request);
  }

  /**
   * PUT /api/v1/treatment-routes/{id}
   * Update treatment protocol title and description (ADMIN/DOCTOR)
   */
  updateRoute(id: number, request: TreatmentRouteUpdateRequest): Observable<ApiResponse<TreatmentRoute>> {
    return this.http.put<ApiResponse<TreatmentRoute>>(`${this.baseUrl}/${id}`, request);
  }

  /**
   * DELETE /api/v1/treatment-routes/{id}
   * Delete treatment protocol (ADMIN only)
   */
  deleteRoute(id: number): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.baseUrl}/${id}`);
  }
}

