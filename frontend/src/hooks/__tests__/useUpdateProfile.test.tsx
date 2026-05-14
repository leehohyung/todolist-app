import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router-dom';
import React from 'react';
import { useUpdateProfile } from '../auth/useUpdateProfile';
import * as userApi from '../../api/user-api';

vi.mock('../../api/user-api');

const createWrapper = () => {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } });
  return ({ children }: { children: React.ReactNode }) => (
    <MemoryRouter>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </MemoryRouter>
  );
};

describe('useUpdateProfile', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('이름 변경 성공 시 User 객체를 반환한다', async () => {
    const mockUser = {
      userId: 'user-1', email: 'test@test.com', name: '새이름',
      provider: 'local', createdAt: '2024-01-01T00:00:00Z', updatedAt: '2024-01-01T00:00:00Z',
    };
    vi.mocked(userApi.updateProfile).mockResolvedValue(mockUser);

    const { result } = renderHook(() => useUpdateProfile(), { wrapper: createWrapper() });

    act(() => { result.current.mutate({ name: '새이름' }); });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data?.name).toBe('새이름');
  });

  it('잘못된 현재 비밀번호 입력 시 에러 상태가 된다', async () => {
    vi.mocked(userApi.updateProfile).mockRejectedValue(new Error('UNAUTHORIZED'));

    const { result } = renderHook(() => useUpdateProfile(), { wrapper: createWrapper() });

    act(() => { result.current.mutate({ currentPassword: '틀린비번', newPassword: 'NewPass1234!' }); });

    await waitFor(() => expect(result.current.isError).toBe(true));
  });
});
