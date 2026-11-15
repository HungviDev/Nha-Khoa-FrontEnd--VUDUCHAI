// ==============================================================================
// PAYMENT SERVICE - MANAGE INVOICES, BILLING & RECONCILIATION
// ==============================================================================

import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  ApiResponse,
  PageParams,
  PageResponse,
  Payment,
  PaymentConfirmRequest,
  PaymentCreateRequest,
  PaymentFilterParams
} from '../models/dental.models';

@Injectable({
  providedIn: 'root'
})
export class PaymentService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/payments`;

  /**
   * GET /api/v1/payments
   * Get all payments and billing transactions with filters (ADMIN only)
   */
  getPayments(params?: PaymentFilterParams): Observable<ApiResponse<PageResponse<Payment>>> {
    let httpParams = new HttpParams();
    if (params) {
      if (params.userId !== undefined) httpParams = httpParams.set('userId', params.userId.toString());
      if (params.status) httpParams = httpParams.set('status', params.status);
      if (params.page !== undefined) httpParams = httpParams.set('page', params.page.toString());
      if (params.size !== undefined) httpParams = httpParams.set('size', params.size.toString());
      if (params.sortBy) httpParams = httpParams.set('sortBy', params.sortBy);
      if (params.sortDir) httpParams = httpParams.set('sortDir', params.sortDir);
    }
    return this.http.get<ApiResponse<PageResponse<Payment>>>(this.baseUrl, { params: httpParams });
  }

  /**
   * GET /api/v1/payments/user/{userId}
   * Get payment history for a specific patient (ADMIN or Owner)
   */
  getPaymentsByUserId(userId: number, params?: PageParams): Observable<ApiResponse<PageResponse<Payment>>> {
    let httpParams = new HttpParams();
    if (params) {
      if (params.page !== undefined) httpParams = httpParams.set('page', params.page.toString());
      if (params.size !== undefined) httpParams = httpParams.set('size', params.size.toString());
      if (params.sortBy) httpParams = httpParams.set('sortBy', params.sortBy);
      if (params.sortDir) httpParams = httpParams.set('sortDir', params.sortDir);
    }
    return this.http.get<ApiResponse<PageResponse<Payment>>>(`${this.baseUrl}/user/${userId}`, { params: httpParams });
  }

  /**
   * GET /api/v1/payments/{id}
   * Get invoice transaction details by ID
   */
  getPaymentById(id: number): Observable<ApiResponse<Payment>> {
    return this.http.get<ApiResponse<Payment>>(`${this.baseUrl}/${id}`);
  }

  /**
   * POST /api/v1/payments
   * Initiate a payment transaction (Always starts in PENDING status)
   */
  createPayment(request: PaymentCreateRequest): Observable<ApiResponse<Payment>> {
    return this.http.post<ApiResponse<Payment>>(this.baseUrl, request);
  }

  /**
   * POST /api/v1/payments/{id}/confirm
   * Complete payment verification and confirm transaction (ADMIN only)
   */
  confirmPayment(id: number, request: PaymentConfirmRequest): Observable<ApiResponse<Payment>> {
    return this.http.post<ApiResponse<Payment>>(`${this.baseUrl}/${id}/confirm`, request);
  }
}

