import { useState } from 'react';
import type { Category } from '../../types';
import { useDeleteCategory } from '../../hooks/category/useDeleteCategory';
import { useUiStore } from '../../stores/ui-store';
import { CATEGORY } from '../../constants/messages';
import ConfirmDialog from '../common/ConfirmDialog';

const CATEGORY_COLORS = ['#93c5fd', '#86efac', '#fde68a', '#c4b5fd', '#f9a8d4', '#fdba74', '#5eead4'];

interface CategoryMenuProps {
  categories: Category[];
}

const CategoryMenu = ({ categories }: CategoryMenuProps) => {
  const deleteCategory = useDeleteCategory();
  const addToast = useUiStore((s) => s.addToast);
  const [confirmTarget, setConfirmTarget] = useState<Category | null>(null);

  const handleDeleteConfirm = () => {
    if (!confirmTarget) return;
    deleteCategory.mutate(confirmTarget.categoryId, {
      onSuccess: () => {
        addToast('success', CATEGORY.DELETE_SUCCESS);
        setConfirmTarget(null);
      },
      onError: () => {
        addToast('error', '삭제 중 오류가 발생했습니다.');
        setConfirmTarget(null);
      },
    });
  };

  return (
    <>
      <ul className="flex flex-col gap-2" role="list">
        {categories.map((cat, idx) => {
          const color = CATEGORY_COLORS[idx % CATEGORY_COLORS.length];
          return (
            <li
              key={cat.categoryId}
              className="group flex items-center justify-between bg-white rounded-lg border border-border px-4 py-3 shadow-card"
            >
              <div className="flex items-center gap-3">
                <span
                  className="h-3 w-3 rounded-full shrink-0"
                  style={{ backgroundColor: color }}
                  aria-hidden="true"
                />
                <span className="text-sm font-medium text-text-primary">{cat.name}</span>
                {cat.isDefault && (
                  <span className="flex items-center gap-1 rounded-full bg-gray-100 px-2 py-0.5 text-xs text-text-secondary">
                    <span aria-hidden="true">🔒</span> 기본
                  </span>
                )}
              </div>

              {!cat.isDefault && (
                <button
                  type="button"
                  onClick={() => setConfirmTarget(cat)}
                  aria-label={`${cat.name} 카테고리 삭제`}
                  className="opacity-0 group-hover:opacity-100 rounded-md p-1.5 text-text-muted hover:text-danger hover:bg-red-50 transition-all"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </button>
              )}
            </li>
          );
        })}
      </ul>

      {confirmTarget && (
        <ConfirmDialog
          title="카테고리 삭제"
          message={CATEGORY.DELETE_CONFIRM(confirmTarget.name)}
          onConfirm={handleDeleteConfirm}
          onCancel={() => setConfirmTarget(null)}
        />
      )}
    </>
  );
};

export default CategoryMenu;
