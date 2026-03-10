export type ApiResponse<T> = {
  message: string;
  data: T;
};

export type PaginationType = {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasPrevPage: boolean;
  hasNextPage: boolean;
};

export interface Paginated<T> {
  items: T[];
  meta: PaginationType;
}
export interface PaginatedResponse<T> {
  message: string;
  data: Paginated<T>;
}
