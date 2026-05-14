import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import { useTodoList } from '../todo/useTodoList';
import { useFilterStore } from '../../stores/filter-store';
import * as todoApi from '../../api/todo-api';

vi.mock('../../api/todo-api');

const createWrapper = () => {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

const mockTodo = {
  todoId: 'todo-1',
  userId: 'user-1',
  categoryId: 'cat-1',
  title: '테스트 할일',
  description: null,
  dueDate: null,
  isCompleted: false,
  completedAt: null,
  overdue: false,
  createdAt: '2024-01-01',
  updatedAt: '2024-01-01',
};

describe('useTodoList', () => {
  beforeEach(() => {
    act(() => {
      useFilterStore.getState().resetFilters();
    });
    vi.clearAllMocks();
  });

  it('할일 목록을 성공적으로 불러온다', async () => {
    vi.mocked(todoApi.getTodos).mockResolvedValue([mockTodo]);

    const { result } = renderHook(() => useTodoList(), { wrapper: createWrapper() });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toHaveLength(1);
  });

  it('필터 변경 시 새로운 쿼리가 실행된다', async () => {
    vi.mocked(todoApi.getTodos).mockResolvedValue([]);

    const { result } = renderHook(() => useTodoList(), { wrapper: createWrapper() });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    act(() => {
      useFilterStore.getState().setFilter({ categoryId: 'cat-1' });
    });

    await waitFor(() => {
      expect(todoApi.getTodos).toHaveBeenCalledWith(expect.objectContaining({ categoryId: 'cat-1' }));
    });
  });
});
