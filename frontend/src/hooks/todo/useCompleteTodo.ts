import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toggleTodoComplete } from '../../api/todo-api';
import type { Todo } from '../../types';

export const useCompleteTodo = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (todoId: string) => toggleTodoComplete(todoId),
    onMutate: async (todoId) => {
      await queryClient.cancelQueries({ queryKey: ['todos'] });

      const previousTodos = queryClient.getQueriesData<Todo[]>({ queryKey: ['todos'] });

      queryClient.setQueriesData<Todo[]>({ queryKey: ['todos'] }, (old) => {
        if (!old) return old;
        return old.map((todo) =>
          todo.todoId === todoId
            ? { ...todo, isCompleted: !todo.isCompleted, completedAt: !todo.isCompleted ? new Date().toISOString() : null }
            : todo,
        );
      });

      return { previousTodos };
    },
    onError: (_err, _todoId, context) => {
      if (context?.previousTodos) {
        context.previousTodos.forEach(([queryKey, data]) => {
          queryClient.setQueryData(queryKey, data);
        });
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['todos'] });
    },
  });
};
