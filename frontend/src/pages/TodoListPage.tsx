import { useState } from 'react';
import { useAuth } from '../hooks/auth/useAuth';
import { useTodoList } from '../hooks/todo/useTodoList';
import { useCompleteTodo } from '../hooks/todo/useCompleteTodo';
import { useDeleteTodo } from '../hooks/todo/useDeleteTodo';
import { useCategories } from '../hooks/category/useCategories';
import { useFilterStore } from '../stores/filter-store';
import { useUiStore } from '../stores/ui-store';
import { TODO } from '../constants/messages';
import type { Todo } from '../types';
import AppLayout from '../components/common/AppLayout';
import Loading from '../components/common/Loading';
import ConfirmDialog from '../components/common/ConfirmDialog';
import TodoList from '../components/todo/TodoList';
import TodoFormModal from '../components/todo/TodoFormModal';
import CalendarView from '../components/todo/CalendarView';
import FilterBar from '../components/filter/FilterBar';
import Button from '../components/common/Button';

const PlusIcon = () => (
  <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4" aria-hidden="true">
    <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
  </svg>
);

const TodoListPage = () => {
  const { userName } = useAuth();
  const { data: todos, isLoading, isError } = useTodoList();
  const { data: categories = [] } = useCategories();
  const completeTodo = useCompleteTodo();
  const deleteTodo = useDeleteTodo();
  const addToast = useUiStore((s) => s.addToast);
  const resetFilters = useFilterStore((s) => s.resetFilters);
  const hasFilter = useFilterStore(
    (s) => !!s.categoryId || !!s.dueDate || s.completionStatus !== 'all',
  );

  const [view, setView] = useState<'calendar' | 'list'>('calendar');
  const [formOpen, setFormOpen] = useState(false);
  const [editTodo, setEditTodo] = useState<Todo | undefined>();
  const [deleteTarget, setDeleteTarget] = useState<Todo | null>(null);
  const [selectedDateForCreate, setSelectedDateForCreate] = useState<string | undefined>();

  const openCreate = (date?: string) => {
    if (date) setSelectedDateForCreate(date);
    setEditTodo(undefined);
    setFormOpen(true);
  };

  const totalCount = todos?.length ?? 0;
  const completedCount = todos?.filter((t) => t.isCompleted).length ?? 0;
  const overdueCount = todos?.filter((t) => t.overdue && !t.isCompleted).length ?? 0;

  return (
    <AppLayout
      title={`안녕하세요, ${userName ?? ''}님 👋`}
      action={
        <div className="flex items-center gap-2">
          <div className="flex rounded-lg border border-border overflow-hidden">
            <button
              type="button"
              onClick={() => setView('calendar')}
              title="캘린더 보기"
              className={`p-2 transition-colors ${view === 'calendar' ? 'bg-accent text-white' : 'bg-white text-text-muted hover:bg-bg-secondary'}`}
            >
              <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
                <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
              </svg>
            </button>
            <button
              type="button"
              onClick={() => setView('list')}
              title="목록 보기"
              className={`p-2 transition-colors ${view === 'list' ? 'bg-accent text-white' : 'bg-white text-text-muted hover:bg-bg-secondary'}`}
            >
              <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
                <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
          <Button variant="primary" size="md" onClick={() => openCreate()} className="gap-1.5">
            <PlusIcon />
            새 할일
          </Button>
        </div>
      }
    >
      {isLoading && <Loading />}

      {isError && (
        <div className="flex items-center justify-center py-16">
          <p className="text-sm text-danger">데이터를 불러오는 중 오류가 발생했습니다.</p>
        </div>
      )}

      {!isLoading && !isError && view === 'calendar' && (
        <CalendarView
          todos={todos ?? []}
          categories={categories}
          onCreateWithDate={(date) => { setSelectedDateForCreate(date); setEditTodo(undefined); setFormOpen(true); }}
          onEdit={(todo) => { setEditTodo(todo); setFormOpen(true); }}
          onDelete={setDeleteTarget}
          onToggle={(todoId) => completeTodo.mutate(todoId)}
        />
      )}

      {!isLoading && !isError && view === 'list' && (
        <>
          {totalCount > 0 && (
            <div className="grid grid-cols-3 gap-3 mb-6">
              <div className="bg-white rounded-xl border border-border p-4">
                <p className="text-xs text-text-muted font-medium uppercase tracking-wide">전체</p>
                <p className="text-2xl font-bold text-text-primary mt-1">{totalCount}</p>
              </div>
              <div className="bg-white rounded-xl border border-border p-4">
                <p className="text-xs text-text-muted font-medium uppercase tracking-wide">완료</p>
                <p className="text-2xl font-bold text-success mt-1">{completedCount}</p>
              </div>
              <div className="bg-white rounded-xl border border-border p-4">
                <p className="text-xs text-text-muted font-medium uppercase tracking-wide">기한 초과</p>
                <p className={`text-2xl font-bold mt-1 ${overdueCount > 0 ? 'text-danger' : 'text-text-muted'}`}>
                  {overdueCount}
                </p>
              </div>
            </div>
          )}

          <div className="mb-4">
            <FilterBar />
          </div>

          <TodoList
            todos={todos ?? []}
            categories={categories}
            onToggle={(todoId) => completeTodo.mutate(todoId)}
            onEdit={(todo) => { setEditTodo(todo); setFormOpen(true); }}
            onDelete={setDeleteTarget}
            isFiltered={hasFilter}
            onResetFilter={resetFilters}
            emptyAction={{ label: '+ 첫 번째 할일 추가하기', onClick: openCreate }}
          />
        </>
      )}

      <button
        type="button"
        onClick={() => openCreate()}
        aria-label="새 할일 추가"
        className="md:hidden fixed bottom-6 right-5 z-30 h-13 w-13 rounded-full bg-accent text-white shadow-lg hover:bg-accent-hover transition-all active:scale-95 flex items-center justify-center"
        style={{ height: '52px', width: '52px' }}
      >
        <PlusIcon />
      </button>

      <TodoFormModal
        isOpen={formOpen}
        onClose={() => { setFormOpen(false); setEditTodo(undefined); setSelectedDateForCreate(undefined); }}
        editTodo={editTodo}
        categories={categories}
        defaultDueDate={selectedDateForCreate}
      />

      {deleteTarget && (
        <ConfirmDialog
          title="할일 삭제"
          message={TODO.DELETE_CONFIRM}
          onConfirm={() => {
            deleteTodo.mutate(deleteTarget.todoId, {
              onSuccess: () => addToast('success', TODO.DELETE_SUCCESS),
              onError: () => addToast('error', '삭제 중 오류가 발생했습니다.'),
              onSettled: () => setDeleteTarget(null),
            });
          }}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </AppLayout>
  );
};

export default TodoListPage;
