import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import { useCompleteTodo } from '../todo/useCompleteTodo';
import * as todoApi from '../../api/todo-api';

vi.mock('../../api/todo-api');

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

describe('useCompleteTodo', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } });
    vi.clearAllMocks();
  });

  const createWrapper = () =>
    ({ children }: { children: React.ReactNode }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );

  it('낙관적 업데이트: mutate 호출 즉시 캐시가 업데이트된다', async () => {
    queryClient.setQueryData(['todos', {}], [mockTodo]);

    vi.mocked(todoApi.toggleTodoComplete).mockResolvedValue({
      ...mockTodo,
      isCompleted: true,
      completedAt: new Date().toISOString(),
    });

    const { result } = renderHook(() => useCompleteTodo(), { wrapper: createWrapper() });

    act(() => {
      result.current.mutate('todo-1');
    });

    await waitFor(() => {
      const cached = queryClient.getQueryData<typeof mockTodo[]>(['todos', {}]);
      expect(cached?.[0].isCompleted).toBe(true);
    });
  });

  it('API 실패 시 캐시가 롤백된다', async () => {
    queryClient.setQueryData(['todos', {}], [mockTodo]);

    vi.mocked(todoApi.toggleTodoComplete).mockRejectedValue(new Error('Server error'));

    const { result } = renderHook(() => useCompleteTodo(), { wrapper: createWrapper() });

    act(() => {
      result.current.mutate('todo-1');
    });

    await waitFor(() => expect(result.current.isError).toBe(true));

    const cached = queryClient.getQueryData<typeof mockTodo[]>(['todos', {}]);
    expect(cached?.[0].isCompleted).toBe(false);
  });
});
