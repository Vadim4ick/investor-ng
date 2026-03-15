import { Injectable } from '@angular/core';
import { PaginatedResponse } from '@/shared/types/api.types';
import { Transaction } from '@/shared/types/transactions.types';

@Injectable()
export class TransactionsCacheService {
  private readonly cache = new Map<string, PaginatedResponse<Transaction>>();

  get(page: number, limit: number): PaginatedResponse<Transaction> | undefined {
    return this.cache.get(this.getKey(page, limit));
  }

  set(page: number, limit: number, response: PaginatedResponse<Transaction>): void {
    this.cache.set(this.getKey(page, limit), response);
  }

  clear(): void {
    this.cache.clear();
  }

  private getKey(page: number, limit: number): string {
    return `${page}-${limit}`;
  }
}
