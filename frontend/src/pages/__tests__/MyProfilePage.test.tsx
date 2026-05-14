import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router-dom';
import React from 'react';
import MyProfilePage from '../MyProfilePage';
import { useAuthStore } from '../../stores/auth-store';
import * as userApi from '../../api/user-api';

vi.mock('../../api/user-api');
vi.mock('../../api/category-api', () => ({
  getCategories: vi.fn().mockResolvedValue([]),
}));

const createWrapper = () => {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } });
  return ({ children }: { children: React.ReactNode }) => (
    <MemoryRouter initialEntries={['/profile']}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </MemoryRouter>
  );
};

describe('MyProfilePage', () => {
  beforeEach(() => {
    useAuthStore.getState().setTokens('access', 'refresh', 'user-1', '테스트유저');
    vi.clearAllMocks();
  });

  it('프로필 페이지가 정상적으로 렌더링된다', () => {
    render(<MyProfilePage />, { wrapper: createWrapper() });
    expect(screen.getByText('이름 변경')).toBeInTheDocument();
    expect(screen.getByText('비밀번호 변경')).toBeInTheDocument();
    expect(screen.getByText('계정 정보를 관리하세요')).toBeInTheDocument();
  });

  it('현재 이름이 읽기전용 입력에 표시된다', () => {
    render(<MyProfilePage />, { wrapper: createWrapper() });
    const currentNameInput = screen.getByLabelText('현재 이름');
    expect(currentNameInput).toHaveValue('테스트유저');
    expect(currentNameInput).toHaveAttribute('readonly');
  });

  it('이름 변경 폼 제출 시 API가 호출된다', async () => {
    const mockUser = {
      userId: 'user-1', email: 'test@test.com', name: '새이름',
      provider: 'local', createdAt: '2024-01-01T00:00:00Z', updatedAt: '2024-01-02T00:00:00Z',
    };
    vi.mocked(userApi.updateProfile).mockResolvedValue(mockUser);

    render(<MyProfilePage />, { wrapper: createWrapper() });

    const newNameInput = screen.getByLabelText(/새 이름/);
    fireEvent.change(newNameInput, { target: { value: '새이름' } });

    const submitButtons = screen.getAllByRole('button', { name: '저장' });
    fireEvent.click(submitButtons[0]);

    await waitFor(() => {
      expect(userApi.updateProfile).toHaveBeenCalledWith({ name: '새이름' });
    });
  });

  it('새 이름 입력 없이 제출 시 유효성 검사 에러가 표시된다', () => {
    render(<MyProfilePage />, { wrapper: createWrapper() });

    const submitButtons = screen.getAllByRole('button', { name: '저장' });
    fireEvent.click(submitButtons[0]);

    expect(screen.getByRole('alert')).toBeInTheDocument();
    expect(userApi.updateProfile).not.toHaveBeenCalled();
  });

  it('비밀번호 변경 폼에서 현재 비밀번호 미입력 시 에러가 표시된다', () => {
    render(<MyProfilePage />, { wrapper: createWrapper() });

    const submitButtons = screen.getAllByRole('button', { name: '저장' });
    fireEvent.click(submitButtons[1]);

    expect(screen.getByText('현재 비밀번호를 입력해 주세요.')).toBeInTheDocument();
    expect(userApi.updateProfile).not.toHaveBeenCalled();
  });

  it('비밀번호 변경 성공 시 API가 올바른 인자로 호출된다', async () => {
    const mockUser = {
      userId: 'user-1', email: 'test@test.com', name: '테스트유저',
      provider: 'local', createdAt: '2024-01-01T00:00:00Z', updatedAt: '2024-01-02T00:00:00Z',
    };
    vi.mocked(userApi.updateProfile).mockResolvedValue(mockUser);

    render(<MyProfilePage />, { wrapper: createWrapper() });

    fireEvent.change(screen.getByLabelText(/현재 비밀번호/), { target: { value: 'Current1234!' } });
    fireEvent.change(screen.getByLabelText(/새 비밀번호/), { target: { value: 'NewPass1234!' } });
    fireEvent.change(screen.getByLabelText(/비밀번호 확인/), { target: { value: 'NewPass1234!' } });

    const submitButtons = screen.getAllByRole('button', { name: '저장' });
    fireEvent.click(submitButtons[1]);

    await waitFor(() => {
      expect(userApi.updateProfile).toHaveBeenCalledWith({
        currentPassword: 'Current1234!',
        newPassword: 'NewPass1234!',
      });
    });
  });
});
