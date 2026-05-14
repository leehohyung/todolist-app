export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL as string;
export const REQUEST_TIMEOUT_MS = 30000;

export const API_ENDPOINTS = {
  AUTH: {
    REGISTER: '/auth/register',
    LOGIN: '/auth/login',
    REFRESH: '/auth/refresh',
  },
  USERS: {
    ME: '/users/me',
  },
  CATEGORIES: {
    BASE: '/categories',
    BY_ID: (id: string) => `/categories/${id}`,
  },
  TODOS: {
    BASE: '/todos',
    BY_ID: (id: string) => `/todos/${id}`,
    COMPLETE: (id: string) => `/todos/${id}/complete`,
  },
} as const;
