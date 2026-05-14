import { useMutation, useQueryClient } from '@tanstack/react-query';
import { deleteTodo } from '../../api/todo-api';

export const useDeleteTodo = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (todoId: string) => deleteTodo(todoId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['todos'] });
    },
  });
};
