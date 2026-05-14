import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateProfile } from '../../api/user-api';
import type { UpdateProfileRequest } from '../../types';

export const useUpdateProfile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateProfileRequest) => updateProfile(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
    },
  });
};
