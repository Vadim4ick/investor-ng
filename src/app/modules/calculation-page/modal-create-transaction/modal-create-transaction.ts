import { Component, inject, input, model, output, signal, effect } from '@angular/core';
import { Dialog } from '@/shared/ui/dialog/dialog';
import { UbInputDirective } from '@/shared/ui/input';
import { UbMoneyInputDirective } from '@/shared/ui/ub-money-input';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { CreateTransactionDto, Transaction } from '@/shared/types/transactions.types';
import { TransactionsService } from '@/services/transactions.service';
import { UbButtonDirective } from '@/shared/ui/button';
import { CategoriesService } from '@/services/categories.service';

@Component({
  selector: 'modal-create-transaction',
  imports: [
    Dialog,
    UbInputDirective,
    UbMoneyInputDirective,
    ReactiveFormsModule,
    UbButtonDirective,
  ],
  templateUrl: './modal-create-transaction.html',
})
export class ModalCreateTransaction {
  open = model.required<boolean>();
  options = input.required<{ value: string; label: string; userId: number | null }[]>();

  created = output<void>();

  mode = input<'create' | 'edit'>('create');
  transactionToEdit = input<Transaction | null>(null);

  updated = output<void>();

  categoryCreated = output<{ value: string; label: string; userId: number | null }>();
  categoryDeleted = output<string>(); // id категории

  private readonly transactionsService = inject(TransactionsService);
  private readonly categoriesService = inject(CategoriesService);

  createErrorMessage = signal('');
  isCreating = signal(false);
  createCategory = signal(false);

  categoryCtrl = new FormControl<string | null>(null, Validators.required);
  descriptionCtrl = new FormControl<string>('', [Validators.required, Validators.minLength(2)]);
  amountCtrl = new FormControl<string>('', Validators.required);

  newCategory = new FormControl<string>('', Validators.required);

  constructor() {
    effect(() => {
      const isCreatingCategory = this.createCategory();

      if (isCreatingCategory) {
        this.descriptionCtrl.disable({ emitEvent: false });
        this.amountCtrl.disable({ emitEvent: false });
        this.categoryCtrl.disable({ emitEvent: false });
      } else {
        this.descriptionCtrl.enable({ emitEvent: false });
        this.amountCtrl.enable({ emitEvent: false });
        this.categoryCtrl.enable({ emitEvent: false });
      }
    });

    effect(() => {
      const isOpen = this.open();
      const mode = this.mode();
      const transaction = this.transactionToEdit();

      if (!isOpen) return;

      if (mode === 'edit' && transaction) {
        this.fillFormForEdit(transaction);
      }

      if (mode === 'create' && !transaction) {
        this.resetForm();
      }
    });
  }

  private fillFormForEdit(transaction: Transaction): void {
    this.categoryCtrl.setValue(String(transaction.category.id), { emitEvent: false });
    this.descriptionCtrl.setValue(transaction.description ?? '', { emitEvent: false });
    this.amountCtrl.setValue(String(transaction.price ?? ''), { emitEvent: false });

    this.createErrorMessage.set('');
    this.createCategory.set(false);
    this.newCategory.reset('', { emitEvent: false });
  }

  onCreateCategory() {
    this.createCategory.set(true);
  }

  onCancelCreateCategory() {
    this.createCategory.set(false);
  }

  resetForm(): void {
    this.categoryCtrl.reset();
    this.descriptionCtrl.reset('', { emitEvent: false });
    this.amountCtrl.reset('', { emitEvent: false });
    this.newCategory.reset('', { emitEvent: false });
    this.createErrorMessage.set('');
    this.createCategory.set(false);
  }

  deleteCategory(categoryId: string): void {
    this.categoriesService.remove(Number(categoryId)).subscribe({
      next: () => {
        this.categoryDeleted.emit(categoryId);

        if (this.categoryCtrl.value === categoryId) {
          this.categoryCtrl.reset();
        }
      },
      error: (error) => {
        console.error('Ошибка удаления категории:', error);
      },
    });
  }

  onConfirmCreateCategory(): void {
    this.newCategory.markAsTouched();

    if (this.newCategory.invalid) {
      return;
    }

    const name = this.newCategory.value?.trim() ?? '';

    if (!name) return;

    this.categoriesService.create({ name }).subscribe({
      next: (response) => {
        const category = response.data;

        this.categoryCreated.emit({
          value: String(category.id),
          label: category.name,
          userId: category.userId,
        });

        this.createCategory.set(false);
        this.newCategory.reset('', { emitEvent: false });
      },
      error: (error) => {
        console.error('Ошибка создания категории:', error);
      },
    });
  }

  closeModal(): void {
    this.resetForm();
    this.open.set(false);
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

    if (this.mode() === 'edit') {
      this.updateTransaction(payload);
      return;
    }

    this.createTransaction(payload);
  }

  private createTransaction(payload: CreateTransactionDto): void {
    this.isCreating.set(true);

    this.transactionsService.create(payload).subscribe({
      next: () => {
        this.isCreating.set(false);
        this.resetForm();
        this.open.set(false);
        this.created.emit();
      },
      error: (error) => {
        console.error('Ошибка создания транзакции:', error);
        this.createErrorMessage.set('Не удалось сохранить операцию');
        this.isCreating.set(false);
      },
    });
  }

  private updateTransaction(payload: CreateTransactionDto): void {
    const transaction = this.transactionToEdit();

    if (!transaction) return;

    this.isCreating.set(true);

    this.transactionsService.update(transaction.id, payload).subscribe({
      next: () => {
        this.isCreating.set(false);
        this.resetForm();
        this.open.set(false);
        this.updated.emit();
      },
      error: (error) => {
        console.error('Ошибка обновления транзакции:', error);
        this.createErrorMessage.set('Не удалось обновить операцию');
        this.isCreating.set(false);
      },
    });
  }
}
