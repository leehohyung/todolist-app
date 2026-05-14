import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createCategory } from '../../api/category-api';
import type { CreateCategoryRequest } from '../../types';

export const useCreateCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateCategoryRequest) => createCategory(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
  });
};
