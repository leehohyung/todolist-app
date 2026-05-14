import { describe, it, expect, beforeEach } from 'vitest';
import { useAuthStore } from '../auth-store';
import { act } from '@testing-library/react';

describe('useAuthStore', () => {
  beforeEach(() => {
    act(() => {
      useAuthStore.getState().clearTokens();
    });
  });

  it('초기 상태는 비로그인 상태이다', () => {
    const state = useAuthStore.getState();
    expect(state.accessToken).toBeNull();
    expect(state.refreshToken).toBeNull();
    expect(state.userId).toBeNull();
    expect(state.userName).toBeNull();
    expect(state.isLoggedIn).toBe(false);
  });

  it('setTokens 호출 시 토큰과 isLoggedIn이 설정된다', () => {
    act(() => {
      useAuthStore.getState().setTokens('access-token', 'refresh-token', 'user-1', '홍길동');
    });
    const state = useAuthStore.getState();
    expect(state.accessToken).toBe('access-token');
    expect(state.refreshToken).toBe('refresh-token');
    expect(state.userId).toBe('user-1');
    expect(state.userName).toBe('홍길동');
    expect(state.isLoggedIn).toBe(true);
  });

  it('clearTokens 호출 시 모든 상태가 초기화된다', () => {
    act(() => {
      useAuthStore.getState().setTokens('access-token', 'refresh-token', 'user-1', '홍길동');
    });
    act(() => {
      useAuthStore.getState().clearTokens();
    });
    const state = useAuthStore.getState();
    expect(state.accessToken).toBeNull();
    expect(state.refreshToken).toBeNull();
    expect(state.userId).toBeNull();
    expect(state.userName).toBeNull();
    expect(state.isLoggedIn).toBe(false);
  });
});
