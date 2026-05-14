import type { Todo, Category } from '../../types';
import TodoItem from './TodoItem';

interface EmptyStateProps {
  message: string;
  action?: { label: string; onClick: () => void };
  filtered?: boolean;
}

const EmptyState = ({ message, action, filtered }: EmptyStateProps) => (
  <div className="flex flex-col items-center justify-center py-20 text-text-muted">
    <div className={`flex h-14 w-14 items-center justify-center rounded-full mb-4 ${filtered ? 'bg-warning-light' : 'bg-bg-tertiary'}`}>
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={`h-7 w-7 ${filtered ? 'text-warning' : 'text-text-muted'}`} aria-hidden="true">
        {filtered ? (
          <><path d="M3 6h18M7 12h10M11 18h2" /></>
        ) : (
          <><path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2" /><rect x="9" y="3" width="6" height="4" rx="2" /></>
        )}
      </svg>
    </div>
    <p className="text-sm font-medium text-text-secondary">{message}</p>
    {action && (
      <button type="button" onClick={action.onClick} className="mt-3 text-sm text-accent hover:underline underline-offset-2 font-medium">
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

const TodoList = ({ todos, categories, onToggle, onEdit, onDelete, emptyAction, isFiltered, onResetFilter }: TodoListProps) => {
  const getCategoryIndex = (categoryId: string) => categories.findIndex((c) => c.categoryId === categoryId);
  const getCategoryName = (categoryId: string) => categories.find((c) => c.categoryId === categoryId)?.name ?? '미분류';

  if (todos.length === 0) {
    return isFiltered
      ? <EmptyState message="조건에 맞는 할일이 없습니다." action={onResetFilter ? { label: '필터 초기화', onClick: onResetFilter } : undefined} filtered />
      : <EmptyState message="등록된 할일이 없습니다." action={emptyAction} />;
  }

  const pending = todos.filter((t) => !t.isCompleted);
  const completed = todos.filter((t) => t.isCompleted);

  return (
    <div className="space-y-1">
      {pending.map((todo) => {
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

      {completed.length > 0 && (
        <div className="pt-4">
          <p className="text-xs font-medium text-text-muted uppercase tracking-wide px-1 mb-2">
            완료됨 {completed.length}개
          </p>
          <div className="space-y-1 opacity-70">
            {completed.map((todo) => {
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
        </div>
      )}
    </div>
  );
};

export default TodoList;
