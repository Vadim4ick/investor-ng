import type { ClassValue } from 'clsx';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { TransactionTypeVariant } from '../types/transactions.types';

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

export function formatAmount(amount: number | string): string {
  return new Intl.NumberFormat('ru-RU').format(Math.abs(Number(amount)));
}

export function isIncome(type: TransactionTypeVariant): boolean {
  return type === 'INCOME';
}
