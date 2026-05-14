import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../stores/auth-store';

export const useLogout = () => {
  const navigate = useNavigate();
  const clearTokens = useAuthStore((state) => state.clearTokens);

  const logout = () => {
    clearTokens();
    navigate('/login');
  };

  return { logout };
};
