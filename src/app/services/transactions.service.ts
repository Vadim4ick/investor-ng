import { inject, Injectable, PLATFORM_ID } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { EMPTY, Observable } from 'rxjs';

import { ApiResponse, PaginatedResponse } from '@/shared/types/api.types';
import {
  CreateTransactionDto,
  GetSummaryQueryDto,
  GetSummaryResponse,
  Transaction,
  UpdateTransactionDto,
} from '@/shared/types/transactions.types';
import { environment } from 'src/environments/environment';
import { isPlatformBrowser } from '@angular/common';

export interface MessageResponse {
  message: string;
}

@Injectable({
  providedIn: 'root',
})
export class TransactionsService {
  private readonly API = `${environment.apiUrl}/transactions`;
  private readonly platformId = inject(PLATFORM_ID);

  constructor(private readonly http: HttpClient) {}

  getAll(page: number, limit: number): Observable<PaginatedResponse<Transaction>> {
    if (!isPlatformBrowser(this.platformId)) {
      return EMPTY;
    }

    return this.http.get<PaginatedResponse<Transaction>>(this.API, { params: { page, limit } });
  }

  getSummary(dto: GetSummaryQueryDto) {
    if (!isPlatformBrowser(this.platformId)) {
      return EMPTY;
    }

    return this.http.get<ApiResponse<GetSummaryResponse>>(`${this.API}/summary`, {
      params: { ...dto },
    });
  }

  getById(id: number): Observable<Transaction> {
    return this.http.get<Transaction>(`${this.API}/${id}`);
  }

  create(dto: CreateTransactionDto): Observable<ApiResponse<Transaction>> {
    return this.http.post<ApiResponse<Transaction>>(this.API, dto);
  }

  update(id: number, dto: UpdateTransactionDto): Observable<Transaction> {
    return this.http.patch<Transaction>(`${this.API}/${id}`, dto);
  }

  remove(id: number): Observable<ApiResponse<MessageResponse>> {
    return this.http.delete<ApiResponse<MessageResponse>>(`${this.API}/${id}`);
  }
}
