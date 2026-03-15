import { Injectable, computed, inject, signal } from '@angular/core';
import { CategoriesService } from '@/services/categories.service';
import { TransactionsService } from '@/services/transactions.service';
import { PaginationType, PaginatedResponse } from '@/shared/types/api.types';
import { Transaction } from '@/shared/types/transactions.types';
import { TransactionsCacheService } from '@/shared/cache/transactions-cache.service';
import { buildPagination } from '@/shared/lib/pagination.utils';

@Injectable()
export class CalculationFacade {
  private readonly transactionsService = inject(TransactionsService);
  private readonly categoriesService = inject(CategoriesService);
  private readonly cache = inject(TransactionsCacheService);

  readonly limit = 5;

  readonly open = signal(false);
  readonly options = signal<{ value: string; label: string; userId: number | null }[]>([]);
  readonly editingTransaction = signal<Transaction | null>(null);
  readonly modalMode = signal<'create' | 'edit'>('create');

  readonly isLoading = signal(false);
  readonly transactions = signal<Transaction[]>([]);
  readonly errorMessage = signal('');
  readonly meta = signal<PaginationType | null>(null);
  readonly currentPage = signal(1);

  readonly paginationView = computed(() => {
    const meta = this.meta();
    if (!meta) {
      return {
        pages: [],
        showLeftEllipsis: false,
        showRightEllipsis: false,
      };
    }

    return buildPagination(this.currentPage(), meta.totalPages, 5);
  });

  init(): void {
    this.loadTransactions();
    this.loadCategories();
  }

  private setTransactionsState(response: PaginatedResponse<Transaction>): void {
    this.transactions.set(response.data.items ?? []);
    this.meta.set(response.data.meta);
    this.currentPage.set(response.data.meta.page);
  }

  loadTransactions(page = this.currentPage(), force = false): void {
    if (!force) {
      const cached = this.cache.get(page, this.limit);
      if (cached) {
        this.setTransactionsState(cached);
        return;
      }
    }

    this.isLoading.set(true);
    this.errorMessage.set('');

    this.transactionsService.getAll(page, this.limit).subscribe({
      next: (response) => {
        this.cache.set(page, this.limit, response);
        this.setTransactionsState(response);
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('Ошибка загрузки транзакций:', error);
        this.errorMessage.set('Не удалось загрузить транзакции');
        this.isLoading.set(false);
      },
    });
  }

  loadCategories(): void {
    this.categoriesService.getAll().subscribe({
      next: (response) => {
        this.options.set(
          (response.data ?? []).map((category) => ({
            label: category.name,
            value: String(category.id),
            userId: category.userId,
          })),
        );
      },
      error: (error) => {
        console.error('Ошибка загрузки категорий:', error);
      },
    });
  }

  goToPage(page: number): void {
    const pagination = this.meta();
    if (!pagination) return;
    if (page < 1 || page > pagination.totalPages || page === this.currentPage()) return;

    this.loadTransactions(page);
  }

  goToPrevPage(): void {
    if (!this.meta()?.hasPrevPage) return;
    this.goToPage(this.currentPage() - 1);
  }

  goToNextPage(): void {
    if (!this.meta()?.hasNextPage) return;
    this.goToPage(this.currentPage() + 1);
  }

  onDeleteTransaction(transactionId: number): void {
    this.transactionsService.remove(transactionId).subscribe({
      next: () => {
        this.cache.clear();
        this.loadTransactions();
      },
      error: (error) => {
        console.error('Ошибка удаления транзакции:', error);
      },
    });
  }

  handleTransactionCreated(): void {
    this.cache.clear();
    this.currentPage.set(1);
    this.loadTransactions(1, true);
  }

  handleTransactionUpdated(): void {
    this.cache.clear();
    this.loadTransactions(this.currentPage(), true);
  }

  onCategoryCreated(category: { value: string; label: string; userId: number | null }): void {
    this.options.update((prev) => {
      const exists = prev.some((item) => item.value === category.value);
      if (exists) return prev;

      return [...prev, category].sort((a, b) => Number(a.value) - Number(b.value));
    });
  }

  onCategoryDeleted(categoryId: string): void {
    this.options.update((prev) => prev.filter((item) => item.value !== categoryId));
  }

  openModalEditTransaction(transaction: Transaction): void {
    this.modalMode.set('edit');
    this.editingTransaction.set(transaction);
    this.open.set(true);
  }

  openModalCreateTransaction(): void {
    this.modalMode.set('create');
    this.editingTransaction.set(null);
    this.open.set(true);
  }
}
