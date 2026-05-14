import { useState } from 'react';
import type { Todo, Category } from '../../types';
import TodoItem from './TodoItem';
import { hasTime, formatTimeShort } from '../../utils/date-utils';

const CAT_COLORS = [
  '#BFE1FF', '#B8EDD4', '#FDE68A', '#DDD6FE',
  '#FBCFE8', '#FED7AA', '#99F6E4', '#F5D0FE',
];

const DAY_LABELS = ['일', '월', '화', '수', '목', '금', '토'];

interface CalendarViewProps {
  todos: Todo[];
  categories: Category[];
  onCreateWithDate: (date: string) => void;
  onEdit: (todo: Todo) => void;
  onDelete: (todo: Todo) => void;
  onToggle: (todoId: string) => void;
}

function toDateStr(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${dd}`;
}

function formatSelectedDate(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00');
  const days = ['일', '월', '화', '수', '목', '금', '토'];
  return `${d.getMonth() + 1}월 ${d.getDate()}일 (${days[d.getDay()]})`;
}

function getCalendarDays(year: number, month: number): Date[] {
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const days: Date[] = [];

  for (let i = firstDay.getDay(); i > 0; i--) {
    days.push(new Date(year, month, 1 - i));
  }

  for (let d = 1; d <= lastDay.getDate(); d++) {
    days.push(new Date(year, month, d));
  }

  const remaining = 42 - days.length;
  for (let i = 1; i <= remaining; i++) {
    days.push(new Date(year, month + 1, i));
  }

  return days;
}

const CalendarView = ({ todos, categories, onCreateWithDate, onEdit, onDelete, onToggle }: CalendarViewProps) => {
  const todayStr = new Date().toISOString().slice(0, 10);
  const todayDate = new Date(todayStr + 'T00:00:00');

  const [year, setYear] = useState(todayDate.getFullYear());
  const [month, setMonth] = useState(todayDate.getMonth());
  const [selectedDate, setSelectedDate] = useState(todayStr);

  const calendarDays = getCalendarDays(year, month);

  const todosByDate = todos.reduce<Record<string, Todo[]>>((acc, todo) => {
    if (!todo.dueDate) return acc;
    const key = todo.dueDate.slice(0, 10);
    if (!acc[key]) acc[key] = [];
    acc[key].push(todo);
    return acc;
  }, {});

  const getCategoryIndex = (categoryId: string) =>
    categories.findIndex((c) => c.categoryId === categoryId);

  const getCategoryName = (categoryId: string) =>
    categories.find((c) => c.categoryId === categoryId)?.name ?? '';

  const goToPrevMonth = () => {
    if (month === 0) { setYear(y => y - 1); setMonth(11); }
    else setMonth(m => m - 1);
  };

  const goToNextMonth = () => {
    if (month === 11) { setYear(y => y + 1); setMonth(0); }
    else setMonth(m => m + 1);
  };

  const goToToday = () => {
    setYear(todayDate.getFullYear());
    setMonth(todayDate.getMonth());
    setSelectedDate(todayStr);
  };

  const selectedTodos = selectedDate ? [...(todosByDate[selectedDate] ?? [])].sort((a, b) => {
    const aHasTime = hasTime(a.dueDate);
    const bHasTime = hasTime(b.dueDate);
    if (aHasTime && !bHasTime) return -1;
    if (!aHasTime && bHasTime) return 1;
    if (aHasTime && bHasTime) return new Date(a.dueDate!).getTime() - new Date(b.dueDate!).getTime();
    return 0;
  }) : [];

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={goToPrevMonth}
          className="p-1.5 rounded-md text-text-muted hover:bg-bg-secondary transition-colors"
          aria-label="이전 달"
        >
          <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
            <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
        </button>
        <span className="text-sm font-semibold text-text-primary min-w-[80px] text-center">
          {year}년 {month + 1}월
        </span>
        <button
          type="button"
          onClick={goToNextMonth}
          className="p-1.5 rounded-md text-text-muted hover:bg-bg-secondary transition-colors"
          aria-label="다음 달"
        >
          <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
            <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
          </svg>
        </button>
        <button
          type="button"
          onClick={goToToday}
          className="ml-1 px-2.5 py-1 text-xs font-medium rounded-md border border-border text-text-secondary hover:bg-bg-secondary transition-colors"
        >
          오늘
        </button>
      </div>

      <div className="bg-white rounded-xl border border-border overflow-hidden">
        <div className="grid grid-cols-7">
          {DAY_LABELS.map((label, i) => (
            <div
              key={label}
              className={`py-2 text-center text-xs font-medium ${
                i === 0 ? 'text-danger' : i === 6 ? 'text-accent' : 'text-text-muted'
              }`}
            >
              {label}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7 border-t border-border">
          {calendarDays.map((day, idx) => {
            const dateStr = toDateStr(day);
            const isCurrentMonth = day.getMonth() === month;
            const isToday = dateStr === todayStr;
            const isSelected = dateStr === selectedDate;
            const dayTodos = todosByDate[dateStr] ?? [];
            const visibleTodos = dayTodos.slice(0, 2);
            const extraCount = dayTodos.length - 2;
            const dow = day.getDay();

            return (
              <div
                key={idx}
                onClick={() => setSelectedDate(dateStr)}
                className={`min-h-[88px] p-1.5 border-b border-r border-border cursor-pointer transition-colors ${
                  isSelected ? 'bg-accent-light/50' : 'hover:bg-bg-secondary'
                } ${!isCurrentMonth ? 'opacity-40' : ''}`}
              >
                <div className="flex justify-center mb-1">
                  <span
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${
                      isToday
                        ? 'bg-accent text-white'
                        : dow === 0
                        ? 'text-danger'
                        : dow === 6
                        ? 'text-accent'
                        : 'text-text-secondary'
                    }`}
                  >
                    {day.getDate()}
                  </span>
                </div>
                <div className="space-y-0.5">
                  {visibleTodos.map((todo) => {
                    const catIdx = getCategoryIndex(todo.categoryId);
                    const isOverdue = todo.overdue && !todo.isCompleted;
                    const chipStyle = todo.isCompleted
                      ? 'line-through text-text-muted bg-bg-tertiary'
                      : isOverdue
                      ? 'bg-danger/10 text-danger'
                      : '';
                    const bgColor = !todo.isCompleted && !isOverdue && catIdx >= 0
                      ? CAT_COLORS[catIdx % CAT_COLORS.length]
                      : undefined;

                    return (
                      <div
                        key={todo.todoId}
                        onClick={(e) => { e.stopPropagation(); onEdit(todo); }}
                        className={`text-xs px-1.5 py-0.5 rounded truncate cursor-pointer ${chipStyle}`}
                        style={bgColor ? { backgroundColor: bgColor + 'e6' } : undefined}
                        title={todo.title}
                      >
                        {hasTime(todo.dueDate) && (
                          <span className="text-[10px] opacity-70 mr-0.5">{formatTimeShort(todo.dueDate)}</span>
                        )}
                        {todo.title}
                      </div>
                    );
                  })}
                  {extraCount > 0 && (
                    <div className="text-xs text-text-muted pl-1">+{extraCount}</div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="bg-white rounded-xl border border-border p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-text-primary">
            {formatSelectedDate(selectedDate)}
          </h3>
          <button
            type="button"
            onClick={() => onCreateWithDate(selectedDate)}
            className="text-xs font-medium text-accent hover:text-accent-hover transition-colors"
          >
            + 할일 추가
          </button>
        </div>

        {selectedTodos.length === 0 ? (
          <div className="py-6 text-center">
            <p className="text-sm text-text-muted mb-2">이 날의 할일이 없습니다.</p>
            <button
              type="button"
              onClick={() => onCreateWithDate(selectedDate)}
              className="text-sm text-accent hover:text-accent-hover transition-colors"
            >
              이 날 할일 추가하기
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            {selectedTodos.map((todo) => (
              <TodoItem
                key={todo.todoId}
                todo={todo}
                categoryName={getCategoryName(todo.categoryId)}
                categoryIndex={getCategoryIndex(todo.categoryId)}
                onToggle={onToggle}
                onEdit={onEdit}
                onDelete={onDelete}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CalendarView;
