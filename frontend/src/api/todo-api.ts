import apiClient from './client';
import { API_ENDPOINTS } from '../constants/api';
import type { Todo, CreateTodoRequest, UpdateTodoRequest, TodoFilter } from '../types';

export const getTodos = async (filters?: TodoFilter): Promise<Todo[]> => {
  const response = await apiClient.get<Todo[]>(API_ENDPOINTS.TODOS.BASE, { params: filters });
  return response.data;
};

export const createTodo = async (data: CreateTodoRequest): Promise<Todo> => {
  const response = await apiClient.post<Todo>(API_ENDPOINTS.TODOS.BASE, data);
  return response.data;
};

export const updateTodo = async (todoId: string, data: UpdateTodoRequest): Promise<Todo> => {
  const response = await apiClient.patch<Todo>(API_ENDPOINTS.TODOS.BY_ID(todoId), data);
  return response.data;
};

export const deleteTodo = async (todoId: string): Promise<void> => {
  await apiClient.delete(API_ENDPOINTS.TODOS.BY_ID(todoId));
};

export const toggleTodoComplete = async (todoId: string): Promise<Todo> => {
  const response = await apiClient.patch<Todo>(API_ENDPOINTS.TODOS.COMPLETE(todoId));
  return response.data;
};
