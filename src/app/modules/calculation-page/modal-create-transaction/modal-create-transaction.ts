import { Component, inject, input, model, output, signal, effect } from '@angular/core';
import { Dialog } from '@/shared/ui/dialog/dialog';
import { UbInputDirective } from '@/shared/ui/input';
import { UbMoneyInputDirective } from '@/shared/ui/ub-money-input';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { CreateTransactionDto } from '@/shared/types/transactions.types';
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
  }

  onCreateCategory() {
    this.createCategory.set(true);
  }

  onCancelCreateCategory() {
    this.createCategory.set(false);
  }

  resetCreateForm(): void {
    this.categoryCtrl.reset();
    this.descriptionCtrl.reset('', { emitEvent: false });
    this.amountCtrl.reset('', { emitEvent: false });
    this.createErrorMessage.set('');
    this.createCategory.set(false);
  }

  deleteCategory(categoryId: string) {
    this.categoriesService.remove(Number(categoryId)).subscribe({
      next: () => {},
      error: (error) => {
        console.error('Ошибка удаления категории:', error);
      },
    });
  }

  onConfirmCreateCategory() {
    console.log(this.newCategory.value);
    this.categoriesService.create({ name: this.newCategory.value ?? '' }).subscribe({
      next: () => {
        this.createCategory.set(false);
        this.newCategory.reset('', { emitEvent: false });
      },
      error: (error) => {
        console.error('Ошибка создания категории:', error);
      },
    });
  }

  closeModal(): void {
    this.resetCreateForm();
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

    this.isCreating.set(true);

    this.transactionsService.create(payload).subscribe({
      next: () => {
        this.isCreating.set(false);
        this.resetCreateForm();
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
}
