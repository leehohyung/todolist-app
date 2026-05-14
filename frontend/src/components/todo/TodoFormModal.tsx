import { useState, useEffect, type FormEvent } from 'react';
import type { Todo, Category } from '../../types';
import { useCreateTodo } from '../../hooks/todo/useCreateTodo';
import { useUpdateTodo } from '../../hooks/todo/useUpdateTodo';
import { useUiStore } from '../../stores/ui-store';
import { validateTodoTitle } from '../../utils/validate';
import { TODO } from '../../constants/messages';
import Modal from '../common/Modal';
import Input from '../common/Input';
import Button from '../common/Button';

interface TodoFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  editTodo?: Todo;
  categories: Category[];
  defaultDueDate?: string;
}

const TodoFormModal = ({ isOpen, onClose, editTodo, categories, defaultDueDate }: TodoFormModalProps) => {
  const isEdit = !!editTodo;
  const createTodo = useCreateTodo();
  const updateTodo = useUpdateTodo();
  const addToast = useUiStore((s) => s.addToast);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [dueTime, setDueTime] = useState('');
  const [titleError, setTitleError] = useState('');
  const [categoryError, setCategoryError] = useState('');

  useEffect(() => {
    if (isOpen) {
      setTitle(editTodo?.title ?? '');
      setDescription(editTodo?.description ?? '');
      setCategoryId(editTodo?.categoryId ?? (categories[0]?.categoryId ?? ''));
      setTitleError('');
      setCategoryError('');

      const rawDate = editTodo?.dueDate ?? (defaultDueDate ?? '');
      const dateOnly = rawDate ? rawDate.slice(0, 10) : '';
      const timeOnly = rawDate && rawDate.length > 10 ? (() => {
        const d = new Date(rawDate);
        const h = d.getUTCHours();
        const m = d.getUTCMinutes();
        return (h !== 0 || m !== 0) ? `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}` : '';
      })() : '';
      setDueDate(dateOnly);
      setDueTime(timeOnly);
    }
  }, [isOpen, editTodo, categories, defaultDueDate]);

  const validate = () => {
    const tErr = validateTodoTitle(title);
    const cErr = categoryId ? '' : '카테고리를 선택해 주세요.';
    setTitleError(tErr);
    setCategoryError(cErr);
    return !tErr && !cErr;
  };

  const isPending = createTodo.isPending || updateTodo.isPending;

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const payload = {
      title: title.trim(),
      categoryId,
      description: description.trim() || undefined,
      dueDate: dueDate ? `${dueDate}T${dueTime || '00:00'}:00` : undefined,
    };

    if (isEdit && editTodo) {
      updateTodo.mutate(
        { todoId: editTodo.todoId, data: payload },
        {
          onSuccess: () => { addToast('success', TODO.UPDATE_SUCCESS); onClose(); },
          onError: () => addToast('error', '수정 중 오류가 발생했습니다.'),
        },
      );
    } else {
      createTodo.mutate(payload, {
        onSuccess: () => { addToast('success', TODO.CREATE_SUCCESS); onClose(); },
        onError: () => addToast('error', '추가 중 오류가 발생했습니다.'),
      });
    }
  };

  return (
    <Modal isOpen={isOpen} title={isEdit ? '할일 수정' : '새 할일 추가'} onClose={onClose}>
      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        <Input
          label="제목"
          id="todo-title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          error={titleError}
          required
          placeholder="무엇을 해야 하나요?"
          autoFocus
        />

        <div className="space-y-1.5">
          <label htmlFor="todo-desc" className="block text-sm font-medium text-text-primary">메모</label>
          <textarea
            id="todo-desc"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            placeholder="추가 메모를 입력하세요 (선택)"
            className="w-full border border-border rounded-md px-3 py-2.5 text-sm text-text-primary bg-white placeholder:text-text-placeholder focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent transition-colors resize-none"
          />
        </div>

        <div className="space-y-1.5">
          <label htmlFor="todo-category" className="block text-sm font-medium text-text-primary">
            카테고리<span className="ml-1 text-danger" aria-hidden="true">*</span>
          </label>
          <select
            id="todo-category"
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            aria-invalid={!!categoryError}
            className="w-full border border-border rounded-md px-3 py-2.5 text-sm text-text-primary bg-white focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent transition-colors"
          >
            <option value="">선택</option>
            {categories.map((c) => (
              <option key={c.categoryId} value={c.categoryId}>{c.name}</option>
            ))}
          </select>
          {categoryError && (
            <p role="alert" className="text-xs text-danger">{categoryError}</p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <label htmlFor="todo-due" className="block text-sm font-medium text-text-primary">마감일</label>
            <input
              id="todo-due"
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="w-full border border-border rounded-md px-3 py-2.5 text-sm text-text-primary bg-white focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent transition-colors"
            />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="todo-time" className="block text-sm font-medium text-text-primary">
              시간 <span className="text-text-muted font-normal text-xs">(선택)</span>
            </label>
            <input
              id="todo-time"
              type="time"
              value={dueTime}
              onChange={(e) => setDueTime(e.target.value)}
              disabled={!dueDate}
              className="w-full border border-border rounded-md px-3 py-2.5 text-sm text-text-primary bg-white focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            />
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-1">
          <Button type="button" variant="ghost" onClick={onClose}>취소</Button>
          <Button type="submit" variant="primary" isLoading={isPending}>
            {isEdit ? '수정 완료' : '추가'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default TodoFormModal;
