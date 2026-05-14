import type { Todo } from '../../types';
import { formatDate } from '../../utils/date-utils';

const CAT_COLORS = [
  { bg: '#BFE1FF', text: '#1D4ED8' },
  { bg: '#B8EDD4', text: '#15803D' },
  { bg: '#FDE68A', text: '#92400E' },
  { bg: '#DDD6FE', text: '#5B21B6' },
  { bg: '#FBCFE8', text: '#9D174D' },
  { bg: '#FED7AA', text: '#92400E' },
  { bg: '#99F6E4', text: '#065F46' },
  { bg: '#F5D0FE', text: '#6B21A8' },
];

interface TodoItemProps {
  todo: Todo;
  categoryName: string;
  categoryIndex: number;
  onToggle: (todoId: string) => void;
  onEdit: (todo: Todo) => void;
  onDelete: (todo: Todo) => void;
}

const TodoItem = ({ todo, categoryName, categoryIndex, onToggle, onEdit, onDelete }: TodoItemProps) => {
  const color = CAT_COLORS[categoryIndex % CAT_COLORS.length];
  const formattedDue = formatDate(todo.dueDate);

  return (
    <div
      className={`group flex items-start gap-3 px-4 py-3 rounded-lg border transition-all duration-150 hover:shadow-sm ${
        todo.overdue && !todo.isCompleted
          ? 'bg-danger-light/30 border-danger/20 hover:border-danger/40'
          : 'bg-white border-border hover:border-border-strong'
      }`}
    >
      <button
        type="button"
        onClick={() => onToggle(todo.todoId)}
        aria-label={`${todo.title} ${todo.isCompleted ? '미완료로 변경' : '완료로 변경'}`}
        className="mt-0.5 shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded"
      >
        <div
          className={`h-4.5 w-4.5 rounded border-2 flex items-center justify-center transition-all duration-150 ${
            todo.isCompleted
              ? 'bg-accent border-accent'
              : 'border-border-strong hover:border-accent'
          }`}
          style={{ height: '18px', width: '18px' }}
        >
          {todo.isCompleted && (
            <svg viewBox="0 0 12 12" fill="white" className="h-2.5 w-2.5">
              <path d="M1.5 6.5l3 3 6-6" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" fill="none" />
            </svg>
          )}
        </div>
      </button>

      <div className="flex-1 min-w-0 py-0.5">
        <p className={`text-sm font-medium leading-snug break-words ${
          todo.isCompleted ? 'line-through text-text-muted' : 'text-text-primary'
        }`}>
          {todo.title}
        </p>

        {todo.description && (
          <p className="mt-1 text-xs text-text-secondary line-clamp-2 leading-relaxed">{todo.description}</p>
        )}

        <div className="mt-2 flex flex-wrap items-center gap-1.5">
          <span
            className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium"
            style={{ backgroundColor: color.bg, color: color.text }}
          >
            {categoryName}
          </span>

          {formattedDue && (
            <span className={`text-xs flex items-center gap-1 ${
              todo.overdue && !todo.isCompleted ? 'text-danger font-medium' : 'text-text-muted'
            }`}>
              <svg viewBox="0 0 16 16" fill="currentColor" className="h-3 w-3" aria-hidden="true">
                <path d="M5.5 0a.5.5 0 01.5.5V1h4V.5a.5.5 0 011 0V1h1a2 2 0 012 2v11a2 2 0 01-2 2H2a2 2 0 01-2-2V3a2 2 0 012-2h1V.5a.5.5 0 01.5-.5zM2 2a1 1 0 00-1 1v1h14V3a1 1 0 00-1-1H2zm13 3H1v9a1 1 0 001 1h12a1 1 0 001-1V5z"/>
              </svg>
              {formattedDue}
              {todo.overdue && !todo.isCompleted && ' · 기한 초과'}
            </span>
          )}

          {todo.isCompleted && (
            <span className="text-xs text-success font-medium flex items-center gap-1">
              <svg viewBox="0 0 20 20" fill="currentColor" className="h-3 w-3" aria-hidden="true">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              완료
            </span>
          )}
        </div>
      </div>

      <div className="flex items-center gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity duration-150 ml-1">
        <button
          type="button"
          onClick={() => onEdit(todo)}
          aria-label={`${todo.title} 수정`}
          className="p-1.5 rounded-md text-text-muted hover:text-accent hover:bg-accent-light transition-colors"
        >
          <svg viewBox="0 0 16 16" fill="currentColor" className="h-3.5 w-3.5" aria-hidden="true">
            <path d="M12.146.146a.5.5 0 01.708 0l3 3a.5.5 0 010 .708l-10 10a.5.5 0 01-.168.11l-5 2a.5.5 0 01-.65-.65l2-5a.5.5 0 01.11-.168l10-10zM11.207 2.5L13.5 4.793 14.793 3.5 12.5 1.207 11.207 2.5zm1.586 3L10.5 3.207 4 9.707V10h.5a.5.5 0 01.5.5v.5h.5a.5.5 0 01.5.5v.5h.293l6.5-6.5zm-9.761 5.175l-.106.106-1.528 3.821 3.821-1.528.106-.106A.5.5 0 015 12.5V12h-.5a.5.5 0 01-.5-.5V11h-.5a.5.5 0 01-.468-.325z"/>
          </svg>
        </button>
        <button
          type="button"
          onClick={() => onDelete(todo)}
          aria-label={`${todo.title} 삭제`}
          className="p-1.5 rounded-md text-text-muted hover:text-danger hover:bg-danger-light transition-colors"
        >
          <svg viewBox="0 0 16 16" fill="currentColor" className="h-3.5 w-3.5" aria-hidden="true">
            <path d="M5.5 5.5A.5.5 0 016 6v6a.5.5 0 01-1 0V6a.5.5 0 01.5-.5zm2.5 0a.5.5 0 01.5.5v6a.5.5 0 01-1 0V6a.5.5 0 01.5-.5zm3 .5a.5.5 0 00-1 0v6a.5.5 0 001 0V6z"/>
            <path fillRule="evenodd" d="M14.5 3a1 1 0 01-1 1H13v9a2 2 0 01-2 2H5a2 2 0 01-2-2V4h-.5a1 1 0 01-1-1V2a1 1 0 011-1H6a1 1 0 011-1h2a1 1 0 011 1h3.5a1 1 0 011 1v1zM4.118 4L4 4.059V13a1 1 0 001 1h6a1 1 0 001-1V4.059L11.882 4H4.118zM2.5 3V2h11v1h-11z"/>
          </svg>
        </button>
      </div>
    </div>
  );
};

export default TodoItem;
