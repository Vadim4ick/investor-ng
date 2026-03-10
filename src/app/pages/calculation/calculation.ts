import { Component, inject, signal } from '@angular/core';
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

  options = signal<{ value: string; label: string }[]>([]);

  isLoading = signal(false);
  transactions = signal<Transaction[]>([]);
  errorMessage = signal('');

  open = false;

  ngOnInit(): void {
    this.loadTransactions();
    this.loadCategories();
  }

  loadTransactions(): void {
    this.isLoading.set(true);
    this.errorMessage.set('');

    this.transactionsService.getAll().subscribe({
      next: (response) => {
        this.transactions.set(response.data ?? []);
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
        this.loadTransactions();
      },
      error: (error) => {
        console.error('Ошибка создания транзакции:', error);
        this.createErrorMessage.set('Не удалось сохранить операцию');
        this.isCreating.set(false);
      },
    });
  }
}
