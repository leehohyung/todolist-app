import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useAuth } from '../auth/useAuth';
import { useAuthStore } from '../../stores/auth-store';

describe('useAuth', () => {
  beforeEach(() => {
    act(() => {
      useAuthStore.getState().clearTokens();
    });
  });

  it('비로그인 상태에서 isLoggedIn은 false이다', () => {
    const { result } = renderHook(() => useAuth());
    expect(result.current.isLoggedIn).toBe(false);
    expect(result.current.userId).toBeNull();
    expect(result.current.userName).toBeNull();
  });

  it('로그인 후 isLoggedIn은 true이고 userId와 userName이 설정된다', () => {
    act(() => {
      useAuthStore.getState().setTokens('token', 'refresh', 'user-1', '홍길동');
    });
    const { result } = renderHook(() => useAuth());
    expect(result.current.isLoggedIn).toBe(true);
    expect(result.current.userId).toBe('user-1');
    expect(result.current.userName).toBe('홍길동');
  });
});
