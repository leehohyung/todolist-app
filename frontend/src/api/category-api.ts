import apiClient from './client';
import { API_ENDPOINTS } from '../constants/api';
import type { Category, CreateCategoryRequest } from '../types';

export const getCategories = async (): Promise<Category[]> => {
  const response = await apiClient.get<{ categories: Category[] }>(API_ENDPOINTS.CATEGORIES.BASE);
  return response.data.categories;
};

export const createCategory = async (data: CreateCategoryRequest): Promise<Category> => {
  const response = await apiClient.post<{ category: Category }>(API_ENDPOINTS.CATEGORIES.BASE, data);
  return response.data.category;
};

export const deleteCategory = async (categoryId: string): Promise<void> => {
  await apiClient.delete(API_ENDPOINTS.CATEGORIES.BY_ID(categoryId));
};
