export interface Category {
  categoryId: string;
  userId: string | null;
  name: string;
  isDefault: boolean;
  createdAt: string;
}

export interface CreateCategoryRequest {
  name: string;
}
