import { useQuery } from '@tanstack/react-query';
import { getTodos } from '../../api/todo-api';
import { useFilterStore } from '../../stores/filter-store';
import type { TodoFilter } from '../../types';

export const useTodoList = () => {
  const categoryId = useFilterStore((state) => state.categoryId);
  const dueDate = useFilterStore((state) => state.dueDate);
  const completionStatus = useFilterStore((state) => state.completionStatus);

  const filters: TodoFilter = {};
  if (categoryId) filters.categoryId = categoryId;
  if (dueDate) filters.dueDate = dueDate;
  if (completionStatus === 'completed') filters.isCompleted = true;
  else if (completionStatus === 'incomplete') filters.isCompleted = false;

  return useQuery({
    queryKey: ['todos', filters],
    queryFn: () => getTodos(filters),
  });
};
