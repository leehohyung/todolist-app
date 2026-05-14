import { create } from 'zustand';

interface AuthState {
  accessToken: string | null;
  refreshToken: string | null;
  userId: string | null;
  userName: string | null;
  isLoggedIn: boolean;
  setTokens: (accessToken: string, refreshToken: string, userId: string, userName: string) => void;
  clearTokens: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  accessToken: null,
  refreshToken: null,
  userId: null,
  userName: null,
  isLoggedIn: false,
  setTokens: (accessToken, refreshToken, userId, userName) =>
    set({ accessToken, refreshToken, userId, userName, isLoggedIn: true }),
  clearTokens: () =>
    set({ accessToken: null, refreshToken: null, userId: null, userName: null, isLoggedIn: false }),
}));
