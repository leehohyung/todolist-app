import { create } from 'zustand';

const SESSION_KEY = 'auth_session';

interface SessionData {
  accessToken: string;
  refreshToken: string;
  userId: string;
  userName: string;
}

const loadSession = (): SessionData | null => {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY);
    return raw ? (JSON.parse(raw) as SessionData) : null;
  } catch {
    return null;
  }
};

const saveSession = (data: SessionData) => {
  try {
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(data));
  } catch {}
};

const clearSession = () => {
  try {
    sessionStorage.removeItem(SESSION_KEY);
  } catch {}
};

interface AuthState {
  accessToken: string | null;
  refreshToken: string | null;
  userId: string | null;
  userName: string | null;
  isLoggedIn: boolean;
  setTokens: (accessToken: string, refreshToken: string, userId: string, userName: string) => void;
  clearTokens: () => void;
}

const saved = loadSession();

export const useAuthStore = create<AuthState>((set) => ({
  accessToken: saved?.accessToken ?? null,
  refreshToken: saved?.refreshToken ?? null,
  userId: saved?.userId ?? null,
  userName: saved?.userName ?? null,
  isLoggedIn: saved !== null,
  setTokens: (accessToken, refreshToken, userId, userName) => {
    saveSession({ accessToken, refreshToken, userId, userName });
    set({ accessToken, refreshToken, userId, userName, isLoggedIn: true });
  },
  clearTokens: () => {
    clearSession();
    set({ accessToken: null, refreshToken: null, userId: null, userName: null, isLoggedIn: false });
  },
}));
