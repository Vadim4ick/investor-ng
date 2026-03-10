import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

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

  constructor(private readonly http: HttpClient) {}

  getAll(): Observable<ApiResponse<Transaction[]>> {
    return this.http.get<ApiResponse<Transaction[]>>(this.API);
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
