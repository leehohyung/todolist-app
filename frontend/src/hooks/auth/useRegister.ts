import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { register } from '../../api/auth-api';
import type { RegisterRequest } from '../../types';

export const useRegister = () => {
  const navigate = useNavigate();

  return useMutation({
    mutationFn: (data: RegisterRequest) => register(data),
    onSuccess: () => {
      navigate('/login');
    },
  });
};
