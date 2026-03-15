import { Injectable, computed, inject, signal } from '@angular/core';
import { TransactionsService } from '@/services/transactions.service';
import { GetSummaryQueryDto, GetSummaryResponse } from '@/shared/types/transactions.types';

@Injectable()
export class SummaryFacade {
  private readonly transactionsService = inject(TransactionsService);

  readonly summary = signal<GetSummaryResponse | null>(null);
  readonly summaryLoading = signal(false);
  readonly summaryError = signal('');

  readonly totals = computed(() => {
    return (
      this.summary()?.totals ?? {
        income: 0,
        expense: 0,
        balance: 0,
        savingsPercent: 0,
      }
    );
  });

  init(): void {
    this.loadSummary();
  }

  loadSummary(dto: GetSummaryQueryDto = {}): void {
    this.summaryLoading.set(true);
    this.summaryError.set('');

    this.transactionsService.getSummary(dto).subscribe({
      next: (response) => {
        this.summary.set(response.data);
        this.summaryLoading.set(false);
      },
      error: (error) => {
        console.error('Ошибка загрузки summary:', error);
        this.summaryError.set('Не удалось загрузить сводку');
        this.summaryLoading.set(false);
      },
    });
  }
}
