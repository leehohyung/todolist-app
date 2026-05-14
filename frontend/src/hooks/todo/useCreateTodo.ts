import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createTodo } from '../../api/todo-api';
import type { CreateTodoRequest } from '../../types';

export const useCreateTodo = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateTodoRequest) => createTodo(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['todos'] });
    },
  });
};
