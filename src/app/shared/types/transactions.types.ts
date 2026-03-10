export type TransactionTypeVariant = 'EXPENDITURE' | 'INCOME';

export interface Transaction {
  id: number;
  price: number;
  type: TransactionTypeVariant;
  categoryId: number;
  description?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTransactionDto {
  price: number;
  type: TransactionTypeVariant;
  userId: number;
  categoryId: number;
  description?: string;
}

export interface UpdateTransactionDto extends Partial<CreateTransactionDto> {}
