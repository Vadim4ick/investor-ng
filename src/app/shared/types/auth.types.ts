import { User } from './user.types';

export type LoginDto = {
  email: string;
  password: string;
};

export type RegisterDto = {
  email: string;
  password: string;
};

export type AuthData = {
  accessToken: string;
  user: User | null;
};
