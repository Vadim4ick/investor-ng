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
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { UbMoneyInputDirective } from '@/shared/ui/ub-money-input';
import { TransactionsService } from '@/services/transactions.service';
import { Transaction, TransactionTypeVariant } from '@/shared/types/transactions.types';
import { isPlatformBrowser } from '@angular/common';

@Component({
  selector: 'calculation',
  imports: [
    AppContainerComponent,
    UbPaginationEllipsisComponent,
    UbPaginationDirective,
    UbPaginationContentDirective,
    UbPaginationItemDirective,
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

  isLoading = signal(false);
  transactions = signal<Transaction[]>([]);
  errorMessage = signal('');

  open = false;

  ngOnInit(): void {
    this.loadTransactions();
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

  isIncome(type: TransactionTypeVariant): boolean {
    return type === 'INCOME';
  }

  formatAmount(amount: number | string) {
    const value = Number(amount);
    return new Intl.NumberFormat('ru-RU').format(Math.abs(value));
  }

  options = [
    { label: 'Еда', value: 'food' },
    { label: 'Шоппинг', value: 'shop' },
    { label: 'Квартира', value: 'apartment', disabled: false },
  ];

  categoryCtrl = new FormControl<string | null>(null);

  confirm() {
    this.open = false;
  }
}
