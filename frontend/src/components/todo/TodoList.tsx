import type { Todo, Category } from '../../types';
import TodoItem from './TodoItem';
import { formatDate } from '../../utils/date-utils';

const CATEGORY_COLORS = ['#93c5fd', '#86efac', '#fde68a', '#c4b5fd', '#f9a8d4', '#fdba74', '#5eead4'];

interface EmptyStateProps {
  message: string;
  action?: { label: string; onClick: () => void };
}

const EmptyState = ({ message, action }: EmptyStateProps) => (
  <div className="flex flex-col items-center justify-center py-16 text-text-muted">
    <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mb-4 opacity-40" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
    </svg>
    <p className="text-sm">{message}</p>
    {action && (
      <button
        type="button"
        onClick={action.onClick}
        className="mt-4 text-sm text-accent hover:underline font-medium"
      >
        {action.label}
      </button>
    )}
  </div>
);

interface TodoListProps {
  todos: Todo[];
  categories: Category[];
  onToggle: (todoId: string) => void;
  onEdit: (todo: Todo) => void;
  onDelete: (todo: Todo) => void;
  emptyAction?: { label: string; onClick: () => void };
  isFiltered?: boolean;
  onResetFilter?: () => void;
}

const TodoList = ({
  todos,
  categories,
  onToggle,
  onEdit,
  onDelete,
  emptyAction,
  isFiltered,
  onResetFilter,
}: TodoListProps) => {
  const getCategoryIndex = (categoryId: string) =>
    categories.findIndex((c) => c.categoryId === categoryId);
  const getCategoryName = (categoryId: string) =>
    categories.find((c) => c.categoryId === categoryId)?.name ?? '미분류';

  if (todos.length === 0) {
    if (isFiltered) {
      return (
        <EmptyState
          message="조건에 맞는 할일이 없습니다."
          action={onResetFilter ? { label: '필터 초기화', onClick: onResetFilter } : undefined}
        />
      );
    }
    return <EmptyState message="등록된 할일이 없습니다." action={emptyAction} />;
  }

  return (
    <>
      <div className="flex flex-col gap-3 lg:hidden">
        {todos.map((todo) => {
          const idx = getCategoryIndex(todo.categoryId);
          return (
            <TodoItem
              key={todo.todoId}
              todo={todo}
              categoryName={getCategoryName(todo.categoryId)}
              categoryIndex={idx >= 0 ? idx : 0}
              onToggle={onToggle}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          );
        })}
      </div>

      <div className="hidden lg:block overflow-x-auto">
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="border-b border-border text-text-secondary">
              <th className="py-3 px-2 w-10 text-left font-medium">완료</th>
              <th className="py-3 px-3 text-left font-medium">제목</th>
              <th className="py-3 px-3 text-left font-medium">카테고리</th>
              <th className="py-3 px-3 text-left font-medium">마감일</th>
              <th className="py-3 px-3 text-left font-medium">상태</th>
              <th className="py-3 px-3 text-right font-medium">작업</th>
            </tr>
          </thead>
          <tbody>
            {todos.map((todo) => {
              const idx = getCategoryIndex(todo.categoryId);
              const color = CATEGORY_COLORS[idx >= 0 ? idx % CATEGORY_COLORS.length : 0];
              return (
                <tr
                  key={todo.todoId}
                  className={`border-b border-border last:border-0 ${
                    todo.overdue ? 'bg-red-50' : 'hover:bg-bg-secondary'
                  } transition-colors`}
                >
                  <td className="py-3 px-2">
                    <input
                      type="checkbox"
                      checked={todo.isCompleted}
                      onChange={() => onToggle(todo.todoId)}
                      aria-label={`${todo.title} 완료 토글`}
                      className="h-4 w-4 accent-accent cursor-pointer"
                    />
                  </td>
                  <td className="py-3 px-3">
                    <span
                      className={`font-medium ${
                        todo.isCompleted ? 'line-through text-text-muted' : 'text-text-primary'
                      }`}
                    >
                      {todo.title}
                    </span>
                    {todo.description && (
                      <p className="text-xs text-text-secondary mt-0.5 line-clamp-1">
                        {todo.description}
                      </p>
                    )}
                  </td>
                  <td className="py-3 px-3">
                    <span
                      className="inline-block rounded-full px-2 py-0.5 text-xs font-medium text-text-primary"
                      style={{ backgroundColor: color }}
                    >
                      {getCategoryName(todo.categoryId)}
                    </span>
                  </td>
                  <td className="py-3 px-3">
                    <span
                      className={`text-xs ${
                        todo.overdue ? 'text-danger font-semibold' : 'text-text-secondary'
                      }`}
                    >
                      {formatDate(todo.dueDate) || '-'}
                    </span>
                  </td>
                  <td className="py-3 px-3">
                    {todo.isCompleted ? (
                      <span className="rounded-full bg-success/10 text-success px-2 py-0.5 text-xs font-medium">완료</span>
                    ) : todo.overdue ? (
                      <span className="rounded-full bg-danger text-white px-2 py-0.5 text-xs font-medium">기한 초과</span>
                    ) : (
                      <span className="rounded-full bg-gray-100 text-text-secondary px-2 py-0.5 text-xs font-medium">진행 중</span>
                    )}
                  </td>
                  <td className="py-3 px-3 text-right">
                    <div className="inline-flex gap-1">
                      <button
                        type="button"
                        onClick={() => onEdit(todo)}
                        aria-label={`${todo.title} 수정`}
                        className="rounded-md p-1.5 text-text-muted hover:text-accent hover:bg-blue-50 transition-colors"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                          <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                        </svg>
                      </button>
                      <button
                        type="button"
                        onClick={() => onDelete(todo)}
                        aria-label={`${todo.title} 삭제`}
                        className="rounded-md p-1.5 text-text-muted hover:text-danger hover:bg-red-50 transition-colors"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                          <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </>
  );
};

export default TodoList;
