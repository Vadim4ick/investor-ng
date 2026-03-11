import { Component, inject, input, model, output, signal } from '@angular/core';
import { Dialog } from '@/shared/ui/dialog/dialog';
import { UbInputDirective } from '@/shared/ui/input';
import { UbMoneyInputDirective } from '@/shared/ui/ub-money-input';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { CreateTransactionDto } from '@/shared/types/transactions.types';
import { TransactionsService } from '@/services/transactions.service';
import { UbButtonDirective } from '@/shared/ui/button';

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
  options = input.required<{ value: string; label: string }[]>();

  openChange = output<boolean>();
  created = output<void>();

  private readonly transactionsService = inject(TransactionsService);

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

  deleteCategory(categoryId: string) {
    console.log(categoryId);
  }

  openCreateCategory() {}

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
        this.resetCreateForm();
        this.openChange.emit(false);
        this.created.emit();
      },
      error: (error) => {
        console.error('Ошибка создания транзакции:', error);
        this.createErrorMessage.set('Не удалось сохранить операцию');
        this.isCreating.set(false);
      },
    });
  }
}
