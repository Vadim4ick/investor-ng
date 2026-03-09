export type User = {
  id: number;
  email: string | null;
  username?: string | null;
  avatar?: string | null;
  authProvider?: 'LOCAL' | 'TELEGRAM';
  telegramId?: string | null;
  createdAt?: string;
  updatedAt?: string;
};
