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

export interface GetSummaryQueryDto {
  from?: string;
  to?: string;
}

export interface SummaryCategoryItem {
  categoryId: number | null;
  categoryName: string;
  amount: number;
}

export interface GetSummaryResponse {
  totals: {
    income: number;
    expense: number;
    balance: number;
    savingsPercent: number;
  };
  incomeByCategory: SummaryCategoryItem[];
  expenseByCategory: SummaryCategoryItem[];
  period: {
    from: string | null;
    to: string | null;
  };
}
