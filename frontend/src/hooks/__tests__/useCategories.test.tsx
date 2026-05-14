import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import { useCategories } from '../category/useCategories';
import * as categoryApi from '../../api/category-api';

vi.mock('../../api/category-api');

const createWrapper = () => {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe('useCategories', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('카테고리 목록을 성공적으로 불러온다', async () => {
    vi.mocked(categoryApi.getCategories).mockResolvedValue([
      { categoryId: 'cat-1', name: '업무', userId: null, isDefault: true, createdAt: '2024-01-01' },
    ]);

    const { result } = renderHook(() => useCategories(), { wrapper: createWrapper() });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toHaveLength(1);
    expect(result.current.data?.[0].name).toBe('업무');
  });

  it('API 실패 시 isError 상태가 된다', async () => {
    vi.mocked(categoryApi.getCategories).mockRejectedValue(new Error('Network error'));

    const { result } = renderHook(() => useCategories(), { wrapper: createWrapper() });

    await waitFor(() => expect(result.current.isError).toBe(true));
  });
});
