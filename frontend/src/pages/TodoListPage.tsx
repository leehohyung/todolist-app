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
import Header from '../components/common/Header';
import Loading from '../components/common/Loading';
import ConfirmDialog from '../components/common/ConfirmDialog';
import TodoList from '../components/todo/TodoList';
import TodoFormModal from '../components/todo/TodoFormModal';
import FilterBar from '../components/filter/FilterBar';

const TodoListPage = () => {
  const { userName } = useAuth();
  const { data: todos, isLoading, isError } = useTodoList();
  const { data: categories = [] } = useCategories();
  const completeTodo = useCompleteTodo();
  const deleteTodo = useDeleteTodo();
  const addToast = useUiStore((s) => s.addToast);
  const resetFilters = useFilterStore((s) => s.resetFilters);

  const [formOpen, setFormOpen] = useState(false);
  const [editTodo, setEditTodo] = useState<Todo | undefined>();
  const [deleteTarget, setDeleteTarget] = useState<Todo | null>(null);

  const hasFilter = useFilterStore(
    (s) => !!s.categoryId || !!s.dueDate || s.completionStatus !== 'all',
  );

  const handleToggle = (todoId: string) => {
    completeTodo.mutate(todoId);
  };

  const handleEdit = (todo: Todo) => {
    setEditTodo(todo);
    setFormOpen(true);
  };

  const handleDelete = (todo: Todo) => {
    setDeleteTarget(todo);
  };

  const handleDeleteConfirm = () => {
    if (!deleteTarget) return;
    deleteTodo.mutate(deleteTarget.todoId, {
      onSuccess: () => addToast('success', TODO.DELETE_SUCCESS),
      onError: () => addToast('error', '삭제 중 오류가 발생했습니다.'),
      onSettled: () => setDeleteTarget(null),
    });
  };

  const handleFormClose = () => {
    setFormOpen(false);
    setEditTodo(undefined);
  };

  return (
    <div className="min-h-screen bg-bg-secondary">
      <Header />

      <main className="max-w-5xl mx-auto px-4 py-6 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-text-primary">
            안녕하세요, {userName}님! 👋
          </h2>
          <button
            type="button"
            onClick={() => { setEditTodo(undefined); setFormOpen(true); }}
            aria-label="할일 추가"
            className="hidden lg:inline-flex items-center gap-2 bg-accent text-white rounded-md px-4 py-2 text-sm font-medium hover:bg-blue-600 transition-colors min-h-[44px]"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
              <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
            </svg>
            할일 추가
          </button>
        </div>

        <FilterBar />

        {isLoading && <Loading />}

        {isError && (
          <div className="flex flex-col items-center justify-center py-16 text-text-muted">
            <p className="text-sm text-danger">데이터를 불러오는 중 오류가 발생했습니다.</p>
          </div>
        )}

        {!isLoading && !isError && (
          <TodoList
            todos={todos ?? []}
            categories={categories}
            onToggle={handleToggle}
            onEdit={handleEdit}
            onDelete={handleDelete}
            isFiltered={hasFilter}
            onResetFilter={resetFilters}
            emptyAction={{ label: '할일 추가', onClick: () => setFormOpen(true) }}
          />
        )}
      </main>

      <button
        type="button"
        onClick={() => { setEditTodo(undefined); setFormOpen(true); }}
        aria-label="할일 추가"
        className="lg:hidden fixed bottom-6 right-6 z-30 h-14 w-14 rounded-full bg-accent text-white shadow-lg hover:bg-blue-600 transition-colors flex items-center justify-center"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
          <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
        </svg>
      </button>

      <TodoFormModal
        isOpen={formOpen}
        onClose={handleFormClose}
        editTodo={editTodo}
        categories={categories}
      />

      {deleteTarget && (
        <ConfirmDialog
          title="할일 삭제"
          message={TODO.DELETE_CONFIRM}
          onConfirm={handleDeleteConfirm}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </div>
  );
};

export default TodoListPage;
