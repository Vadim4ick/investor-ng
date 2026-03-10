import { Category } from './categories.types';

export type TransactionTypeVariant = 'EXPENDITURE' | 'INCOME';

export interface Transaction {
  id: number;
  price: number;
  type: TransactionTypeVariant;
  categoryId: number;
  category: Category;
  description?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTransactionDto {
  price: number;
  type: TransactionTypeVariant;
  categoryId: number;
  description?: string;
}

export interface UpdateTransactionDto extends Partial<CreateTransactionDto> {}
