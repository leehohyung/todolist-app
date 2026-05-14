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
}

const TodoFormModal = ({ isOpen, onClose, editTodo, categories }: TodoFormModalProps) => {
  const isEdit = !!editTodo;
  const createTodo = useCreateTodo();
  const updateTodo = useUpdateTodo();
  const addToast = useUiStore((s) => s.addToast);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [titleError, setTitleError] = useState('');
  const [categoryError, setCategoryError] = useState('');

  useEffect(() => {
    if (isOpen) {
      setTitle(editTodo?.title ?? '');
      setDescription(editTodo?.description ?? '');
      setCategoryId(editTodo?.categoryId ?? (categories[0]?.categoryId ?? ''));
      setDueDate(editTodo?.dueDate ? editTodo.dueDate.slice(0, 10) : '');
      setTitleError('');
      setCategoryError('');
    }
  }, [isOpen, editTodo, categories]);

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
      dueDate: dueDate || undefined,
    };

    if (isEdit && editTodo) {
      updateTodo.mutate(
        { todoId: editTodo.todoId, data: payload },
        {
          onSuccess: () => {
            addToast('success', TODO.UPDATE_SUCCESS);
            onClose();
          },
          onError: () => addToast('error', '수정 중 오류가 발생했습니다.'),
        },
      );
    } else {
      createTodo.mutate(payload, {
        onSuccess: () => {
          addToast('success', TODO.CREATE_SUCCESS);
          onClose();
        },
        onError: () => addToast('error', '추가 중 오류가 발생했습니다.'),
      });
    }
  };

  return (
    <Modal isOpen={isOpen} title={isEdit ? '할일 수정' : '할일 추가'} onClose={onClose}>
      <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
        <Input
          label="제목"
          id="todo-title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          error={titleError}
          required
          placeholder="할일 제목을 입력하세요"
        />

        <div className="flex flex-col gap-1">
          <label htmlFor="todo-desc" className="text-sm font-medium text-text-primary">
            설명
          </label>
          <textarea
            id="todo-desc"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            placeholder="상세 내용을 입력하세요 (선택)"
            className="w-full border border-border rounded-md px-3 py-2.5 text-sm text-text-primary bg-white placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent transition-shadow resize-none"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="todo-category" className="text-sm font-medium text-text-primary">
            카테고리<span className="ml-1 text-danger" aria-hidden="true">*</span>
          </label>
          <select
            id="todo-category"
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            aria-invalid={!!categoryError}
            className="w-full border border-border rounded-md px-3 py-2.5 text-sm text-text-primary bg-white focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
          >
            <option value="">카테고리 선택</option>
            {categories.map((c) => (
              <option key={c.categoryId} value={c.categoryId}>
                {c.name}
              </option>
            ))}
          </select>
          {categoryError && (
            <p role="alert" className="text-xs text-danger">{categoryError}</p>
          )}
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="todo-due" className="text-sm font-medium text-text-primary">
            마감일
          </label>
          <input
            id="todo-due"
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            className="w-full border border-border rounded-md px-3 py-2.5 text-sm text-text-primary bg-white focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
          />
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <Button type="button" variant="ghost" onClick={onClose}>
            취소
          </Button>
          <Button type="submit" variant="primary" isLoading={isPending}>
            {isEdit ? '수정' : '추가'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default TodoFormModal;
