export interface Category {
  id: number;
  name: string;
  userId: number;
  createdAt: string;
}

export interface CreateCategoryDto {
  name: string;
}

export interface UpdateCategoryDto {
  name?: string;
}
