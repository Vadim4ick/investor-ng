import { Component, computed, inject, signal } from '@angular/core';
import { AppContainerComponent } from '@/shared/layouts/app-container';
import {
  UbPaginationEllipsisComponent,
  UbPaginationDirective,
  UbPaginationContentDirective,
  UbPaginationItemDirective,
  UbPaginationPreviousDirective,
  UbPaginationNextDirective,
  UbPaginationLinkDirective,
} from '@/shared/ui/pagination';
import { Dialog } from '@/shared/ui/dialog/dialog';
import { UbButtonDirective } from '@/shared/ui/button';
import { UbInputDirective } from '@/shared/ui/input';
import { CustomSelectComponent } from '@/shared/ui/select/select';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { UbMoneyInputDirective } from '@/shared/ui/ub-money-input';
import { TransactionsService } from '@/services/transactions.service';
import {
  CreateTransactionDto,
  Transaction,
  TransactionTypeVariant,
} from '@/shared/types/transactions.types';
import { CategoriesService } from '@/services/categories.service';
import { DatePipe } from '@angular/common';
import { PaginationType, PaginatedResponse } from '@/shared/types/api.types';

@Component({
  selector: 'calculation',
  imports: [
    AppContainerComponent,
    UbPaginationEllipsisComponent,
    UbPaginationDirective,
    UbPaginationContentDirective,
    UbPaginationItemDirective,
    DatePipe,
    UbPaginationPreviousDirective,
    UbPaginationNextDirective,
    UbPaginationLinkDirective,
    Dialog,
    UbButtonDirective,
    ReactiveFormsModule,
    UbInputDirective,
    CustomSelectComponent,
    UbMoneyInputDirective,
  ],
  templateUrl: './calculation.html',
})
export class Calculation {
  private readonly transactionsService = inject(TransactionsService);
  private readonly categoriesService = inject(CategoriesService);

  private readonly transactionsCache = new Map<string, PaginatedResponse<Transaction>>();

  options = signal<{ value: string; label: string }[]>([]);

  isLoading = signal(false);
  transactions = signal<Transaction[]>([]);
  errorMessage = signal('');
  meta = signal<PaginationType | null>(null);

  currentPage = signal(1);
  readonly limit = 5;

  open = false;

  ngOnInit(): void {
    this.loadTransactions();
    this.loadCategories();
  }

  private getCacheKey(page: number, limit: number): string {
    return `${page}-${limit}`;
  }

  private setTransactionsState(response: PaginatedResponse<Transaction>): void {
    this.transactions.set(response.data.items ?? []);
    this.meta.set(response.data.meta);
    this.currentPage.set(response.data.meta.page);
  }

  private clearTransactionsCache(): void {
    this.transactionsCache.clear();
  }

  loadTransactions(page = this.currentPage(), force = false): void {
    const cacheKey = this.getCacheKey(page, this.limit);

    if (!force) {
      const cachedResponse = this.transactionsCache.get(cacheKey);

      if (cachedResponse) {
        this.setTransactionsState(cachedResponse);
        return;
      }
    }

    this.isLoading.set(true);
    this.errorMessage.set('');

    this.transactionsService.getAll(page, this.limit).subscribe({
      next: (response) => {
        this.transactionsCache.set(cacheKey, response);
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
          })),
        );
      },
      error: (error) => {
        console.error('Ошибка загрузки категорий:', error);
      },
    });
  }

  isIncome(type: TransactionTypeVariant): boolean {
    return type === 'INCOME';
  }

  formatAmount(amount: number | string) {
    const value = Number(amount);
    return new Intl.NumberFormat('ru-RU').format(Math.abs(value));
  }

  createErrorMessage = signal('');
  isCreating = signal(false);

  categoryCtrl = new FormControl<string | null>(null, Validators.required);
  descriptionCtrl = new FormControl<string>('', [Validators.required, Validators.minLength(2)]);
  amountCtrl = new FormControl<string>('', Validators.required);

  resetCreateForm(): void {
    this.categoryCtrl.reset();
    this.descriptionCtrl.reset('', { emitEvent: false });
    this.amountCtrl.reset('', { emitEvent: false });
    this.createErrorMessage.set('');
  }

  confirm(): void {
    this.createErrorMessage.set('');

    this.categoryCtrl.markAsTouched();
    this.descriptionCtrl.markAsTouched();
    this.amountCtrl.markAsTouched();

    if (this.categoryCtrl.invalid || this.descriptionCtrl.invalid || this.amountCtrl.invalid) {
      this.createErrorMessage.set('Заполните все поля');
      return;
    }

    const payload: CreateTransactionDto = {
      categoryId: Number(this.categoryCtrl.value),
      description: this.descriptionCtrl.value?.trim() ?? '',
      price: Number(this.amountCtrl.value) ?? 0,
      type: 'INCOME',
    };

    this.isCreating.set(true);

    this.transactionsService.create(payload).subscribe({
      next: () => {
        this.isCreating.set(false);
        this.open = false;
        this.resetCreateForm();

        this.clearTransactionsCache();
        this.currentPage.set(1);
        this.loadTransactions(1, true);
      },
      error: (error) => {
        console.error('Ошибка создания транзакции:', error);
        this.createErrorMessage.set('Не удалось сохранить операцию');
        this.isCreating.set(false);
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
    const pagination = this.meta();
    if (!pagination?.hasPrevPage) return;

    this.goToPage(this.currentPage() - 1);
  }

  goToNextPage(): void {
    const pagination = this.meta();
    if (!pagination?.hasNextPage) return;

    this.goToPage(this.currentPage() + 1);
  }

  visiblePages = computed(() => {
    const pagination = this.meta();
    if (!pagination) return [];

    const totalPages = pagination.totalPages;
    const current = this.currentPage();
    const maxVisible = 5;

    if (totalPages <= maxVisible) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    let start = Math.max(1, current - 2);
    let end = Math.min(totalPages, start + maxVisible - 1);

    if (end - start + 1 < maxVisible) {
      start = Math.max(1, end - maxVisible + 1);
    }

    return Array.from({ length: end - start + 1 }, (_, i) => start + i);
  });

  showLeftEllipsis = computed(() => {
    const pages = this.visiblePages();
    return pages.length > 0 && pages[0] > 2;
  });

  showRightEllipsis = computed(() => {
    const pages = this.visiblePages();
    const pagination = this.meta();
    if (!pagination || pages.length === 0) return false;

    return pages[pages.length - 1] < pagination.totalPages - 1;
  });
}
