import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateTodo } from '../../api/todo-api';
import type { UpdateTodoRequest } from '../../types';

export const useUpdateTodo = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ todoId, data }: { todoId: string; data: UpdateTodoRequest }) =>
      updateTodo(todoId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['todos'] });
    },
  });
};
