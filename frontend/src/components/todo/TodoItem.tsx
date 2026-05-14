import type { Todo } from '../../types';
import { formatDate } from '../../utils/date-utils';

const CATEGORY_COLORS = ['#93c5fd', '#86efac', '#fde68a', '#c4b5fd', '#f9a8d4', '#fdba74', '#5eead4'];

interface TodoItemProps {
  todo: Todo;
  categoryName: string;
  categoryIndex: number;
  onToggle: (todoId: string) => void;
  onEdit: (todo: Todo) => void;
  onDelete: (todo: Todo) => void;
}

const TodoItem = ({ todo, categoryName, categoryIndex, onToggle, onEdit, onDelete }: TodoItemProps) => {
  const color = CATEGORY_COLORS[categoryIndex % CATEGORY_COLORS.length];
  const formattedDue = formatDate(todo.dueDate);

  return (
    <div
      className={`bg-white rounded-lg shadow-card border p-4 flex items-start gap-3 ${
        todo.overdue ? 'bg-red-50 border-red-200' : 'border-border'
      }`}
    >
      <input
        type="checkbox"
        checked={todo.isCompleted}
        onChange={() => onToggle(todo.todoId)}
        aria-label={`${todo.title} 완료 토글`}
        className="mt-1 h-5 w-5 rounded border-border text-accent cursor-pointer shrink-0 accent-accent"
      />

      <div className="flex-1 min-w-0">
        <p
          className={`text-sm font-medium break-words ${
            todo.isCompleted ? 'line-through text-text-muted' : 'text-text-primary'
          }`}
        >
          {todo.title}
        </p>

        {todo.description && (
          <p className="mt-1 text-xs text-text-secondary line-clamp-2">{todo.description}</p>
        )}

        <div className="mt-2 flex flex-wrap items-center gap-2">
          <span
            className="inline-block rounded-full px-2 py-0.5 text-xs font-medium text-text-primary"
            style={{ backgroundColor: color }}
          >
            {categoryName}
          </span>

          {formattedDue && (
            <span
              className={`text-xs ${
                todo.overdue ? 'text-danger font-semibold' : 'text-text-secondary'
              }`}
            >
              {formattedDue}
            </span>
          )}

          {todo.overdue && (
            <span className="rounded-full bg-danger px-2 py-0.5 text-xs font-medium text-white">
              기한 초과
            </span>
          )}
        </div>
      </div>

      <div className="flex gap-1 shrink-0">
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
    </div>
  );
};

export default TodoItem;
