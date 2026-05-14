import { useState, type FormEvent } from 'react';
import { useCreateCategory } from '../../hooks/category/useCreateCategory';
import { useUiStore } from '../../stores/ui-store';
import { validateCategoryName } from '../../utils/validate';
import { CATEGORY } from '../../constants/messages';
import Input from '../common/Input';
import Button from '../common/Button';

interface CategoryFormProps {
  onClose?: () => void;
}

const CategoryForm = ({ onClose }: CategoryFormProps) => {
  const createCategory = useCreateCategory();
  const addToast = useUiStore((s) => s.addToast);
  const [name, setName] = useState('');
  const [nameError, setNameError] = useState('');

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const err = validateCategoryName(name);
    if (err) { setNameError(err); return; }
    setNameError('');

    createCategory.mutate(
      { name: name.trim() },
      {
        onSuccess: () => {
          addToast('success', CATEGORY.CREATE_SUCCESS);
          setName('');
          onClose?.();
        },
        onError: () => addToast('error', '추가 중 오류가 발생했습니다.'),
      },
    );
  };

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
      <Input
        label="카테고리 이름"
        id="category-name"
        value={name}
        onChange={(e) => { setName(e.target.value); if (nameError) setNameError(''); }}
        error={nameError}
        required
        placeholder="카테고리 이름을 입력하세요"
        autoFocus
      />
      <div className="flex justify-end gap-3">
        {onClose && (
          <Button type="button" variant="ghost" onClick={onClose}>
            취소
          </Button>
        )}
        <Button type="submit" variant="primary" isLoading={createCategory.isPending}>
          추가
        </Button>
      </div>
    </form>
  );
};

export default CategoryForm;
