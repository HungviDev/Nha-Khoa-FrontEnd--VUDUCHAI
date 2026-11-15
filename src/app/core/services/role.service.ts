// ==============================================================================
// ROLE SERVICE - MANAGE SYSTEM ROLES & PERMISSIONS
// ==============================================================================

import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse, Role, RoleRequest } from '../models/dental.models';

@Injectable({
  providedIn: 'root'
})
export class RoleService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/roles`;

  /**
   * GET /api/v1/roles
   * Get all available system roles
   */
  getRoles(): Observable<ApiResponse<Role[]>> {
    return this.http.get<ApiResponse<Role[]>>(this.baseUrl);
  }

  /**
   * GET /api/v1/roles/{id}
   * Get role details by ID
   */
  getRoleById(id: number): Observable<ApiResponse<Role>> {
    return this.http.get<ApiResponse<Role>>(`${this.baseUrl}/${id}`);
  }

  /**
   * POST /api/v1/roles
   * Create a new role (Admin only)
   */
  createRole(request: RoleRequest): Observable<ApiResponse<Role>> {
    return this.http.post<ApiResponse<Role>>(this.baseUrl, request);
  }

  /**
   * PUT /api/v1/roles/{id}
   * Update role name (Admin only)
   */
  updateRole(id: number, request: RoleRequest): Observable<ApiResponse<Role>> {
    return this.http.put<ApiResponse<Role>>(`${this.baseUrl}/${id}`, request);
  }

  /**
   * DELETE /api/v1/roles/{id}
   * Delete a role (Admin only)
   */
  deleteRole(id: number): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.baseUrl}/${id}`);
  }
}

