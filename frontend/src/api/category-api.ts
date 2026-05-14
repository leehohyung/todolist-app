import apiClient from './client';
import { API_ENDPOINTS } from '../constants/api';
import type { Category, CreateCategoryRequest } from '../types';

export const getCategories = async (): Promise<Category[]> => {
  const response = await apiClient.get<Category[]>(API_ENDPOINTS.CATEGORIES.BASE);
  return response.data;
};

export const createCategory = async (data: CreateCategoryRequest): Promise<Category> => {
  const response = await apiClient.post<Category>(API_ENDPOINTS.CATEGORIES.BASE, data);
  return response.data;
};

export const deleteCategory = async (categoryId: string): Promise<void> => {
  await apiClient.delete(API_ENDPOINTS.CATEGORIES.BY_ID(categoryId));
};
