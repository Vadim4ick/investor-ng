import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { AuthService } from '@/services/auth.service';
import { ApiResponse } from '@/shared/types/api.types';
import {
  CreateTransactionDto,
  Transaction,
  UpdateTransactionDto,
} from '@/shared/types/transactions.types';
import { environment } from 'src/environments/environment';

export interface MessageResponse {
  message: string;
}

@Injectable({
  providedIn: 'root',
})
export class TransactionsService {
  private readonly API = `${environment.apiUrl}/transactions`;

  constructor(
    private readonly http: HttpClient,
    private readonly authService: AuthService,
  ) {}

  getAll(): Observable<ApiResponse<Transaction[]>> {
    return this.authService.withAutoRefresh(() =>
      this.http.get<ApiResponse<Transaction[]>>(this.API, {
        headers: this.authService.authHeaders(),
      }),
    );
  }

  getById(id: number): Observable<Transaction> {
    return this.authService.withAutoRefresh(() =>
      this.http.get<Transaction>(`${this.API}/${id}`, {
        headers: this.authService.authHeaders(),
      }),
    );
  }

  create(dto: CreateTransactionDto): Observable<ApiResponse<Transaction>> {
    return this.authService.withAutoRefresh(() =>
      this.http.post<ApiResponse<Transaction>>(this.API, dto, {
        headers: this.authService.authHeaders(),
      }),
    );
  }

  update(id: number, dto: UpdateTransactionDto): Observable<Transaction> {
    return this.authService.withAutoRefresh(() =>
      this.http.patch<Transaction>(`${this.API}/${id}`, dto, {
        headers: this.authService.authHeaders(),
      }),
    );
  }

  remove(id: number): Observable<ApiResponse<MessageResponse>> {
    return this.authService.withAutoRefresh(() =>
      this.http.delete<ApiResponse<MessageResponse>>(`${this.API}/${id}`, {
        headers: this.authService.authHeaders(),
      }),
    );
  }
}
