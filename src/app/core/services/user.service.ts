// ==============================================================================
// USER SERVICE - MANAGE USER ACCOUNTS & PATIENT DIRECTORY
// ==============================================================================

import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  ApiResponse,
  PageParams,
  PageResponse,
  User,
  UserCreateRequest,
  UserUpdateRequest
} from '../models/dental.models';

export interface UserFilterParams extends PageParams {
  keyword?: string;
}

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/users`;

  /**
   * GET /api/v1/users
   * Get paginated users with optional keyword search
   */
  getUsers(params?: UserFilterParams): Observable<ApiResponse<PageResponse<User>>> {
    let httpParams = new HttpParams();
    if (params) {
      if (params.keyword) httpParams = httpParams.set('keyword', params.keyword);
      if (params.page !== undefined) httpParams = httpParams.set('page', params.page.toString());
      if (params.size !== undefined) httpParams = httpParams.set('size', params.size.toString());
      if (params.sortBy) httpParams = httpParams.set('sortBy', params.sortBy);
      if (params.sortDir) httpParams = httpParams.set('sortDir', params.sortDir);
    }
    return this.http.get<ApiResponse<PageResponse<User>>>(this.baseUrl, { params: httpParams });
  }

  /**
   * GET /api/v1/users/{id}
   * Get user details by ID
   */
  getUserById(id: number): Observable<ApiResponse<User>> {
    return this.http.get<ApiResponse<User>>(`${this.baseUrl}/${id}`);
  }

  /**
   * POST /api/v1/users
   * Create a new user (Admin only)
   */
  createUser(request: UserCreateRequest): Observable<ApiResponse<User>> {
    return this.http.post<ApiResponse<User>>(this.baseUrl, request);
  }

  /**
   * PUT /api/v1/users/{id}
   * Update user details (Admin or profile owner)
   */
  updateUser(id: number, request: UserUpdateRequest): Observable<ApiResponse<User>> {
    return this.http.put<ApiResponse<User>>(`${this.baseUrl}/${id}`, request);
  }

  /**
   * DELETE /api/v1/users/{id}
   * Delete user account (Admin only)
   */
  deleteUser(id: number): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.baseUrl}/${id}`);
  }
}

