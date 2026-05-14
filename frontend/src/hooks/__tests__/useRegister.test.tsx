import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router-dom';
import React from 'react';
import { useRegister } from '../auth/useRegister';
import * as authApi from '../../api/auth-api';

vi.mock('../../api/auth-api');

const createWrapper = () => {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } });
  return ({ children }: { children: React.ReactNode }) => (
    <MemoryRouter>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </MemoryRouter>
  );
};

describe('useRegister', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('회원가입 성공 시 isSuccess 상태가 된다', async () => {
    vi.mocked(authApi.register).mockResolvedValue(undefined);

    const { result } = renderHook(() => useRegister(), { wrapper: createWrapper() });

    act(() => {
      result.current.mutate({ email: 'new@test.com', password: 'password123', name: '새사용자' });
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
  });

  it('회원가입 실패 시 isError 상태가 된다', async () => {
    vi.mocked(authApi.register).mockRejectedValue(new Error('Duplicate email'));

    const { result } = renderHook(() => useRegister(), { wrapper: createWrapper() });

    act(() => {
      result.current.mutate({ email: 'existing@test.com', password: 'password123', name: '중복사용자' });
    });

    await waitFor(() => expect(result.current.isError).toBe(true));
  });
});
