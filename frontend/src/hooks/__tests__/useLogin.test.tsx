import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router-dom';
import React from 'react';
import { useLogin } from '../auth/useLogin';
import { useAuthStore } from '../../stores/auth-store';
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

describe('useLogin', () => {
  beforeEach(() => {
    act(() => {
      useAuthStore.getState().clearTokens();
    });
    vi.clearAllMocks();
  });

  it('로그인 성공 시 토큰이 저장된다', async () => {
    vi.mocked(authApi.login).mockResolvedValue({
      accessToken: 'access-token',
      refreshToken: 'refresh-token',
      user: { userId: 'user-1', email: 'test@test.com', name: '홍길동' },
    });

    const { result } = renderHook(() => useLogin(), { wrapper: createWrapper() });

    act(() => {
      result.current.mutate({ email: 'test@test.com', password: 'password123' });
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    const state = useAuthStore.getState();
    expect(state.accessToken).toBe('access-token');
    expect(state.isLoggedIn).toBe(true);
  });

  it('로그인 실패 시 에러 상태가 된다', async () => {
    vi.mocked(authApi.login).mockRejectedValue(new Error('Invalid credentials'));

    const { result } = renderHook(() => useLogin(), { wrapper: createWrapper() });

    act(() => {
      result.current.mutate({ email: 'test@test.com', password: 'wrong' });
    });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(useAuthStore.getState().isLoggedIn).toBe(false);
  });
});
