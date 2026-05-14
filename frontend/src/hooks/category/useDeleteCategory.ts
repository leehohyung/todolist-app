import { useMutation, useQueryClient } from '@tanstack/react-query';
import { deleteCategory } from '../../api/category-api';

export const useDeleteCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (categoryId: string) => deleteCategory(categoryId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      queryClient.invalidateQueries({ queryKey: ['todos'] });
    },
  });
};
