import { useAuthStore } from '../../stores/auth-store';

export const useAuth = () => {
  const isLoggedIn = useAuthStore((state) => state.isLoggedIn);
  const userId = useAuthStore((state) => state.userId);
  const userName = useAuthStore((state) => state.userName);
  return { isLoggedIn, userId, userName };
};
