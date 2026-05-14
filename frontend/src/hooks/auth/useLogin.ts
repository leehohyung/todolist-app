import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { login } from '../../api/auth-api';
import { useAuthStore } from '../../stores/auth-store';
import type { LoginRequest } from '../../types';

export const useLogin = () => {
  const navigate = useNavigate();
  const setTokens = useAuthStore((state) => state.setTokens);

  return useMutation({
    mutationFn: (data: LoginRequest) => login(data),
    onSuccess: (response) => {
      const { accessToken, refreshToken, userId, userName } = response;
      setTokens(accessToken, refreshToken, userId, userName);
      navigate('/todos');
    },
  });
};
