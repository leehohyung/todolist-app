import { useState } from 'react';
import type { Category } from '../../types';
import { useDeleteCategory } from '../../hooks/category/useDeleteCategory';
import { useUiStore } from '../../stores/ui-store';
import { CATEGORY } from '../../constants/messages';
import ConfirmDialog from '../common/ConfirmDialog';

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
      onSuccess: () => { addToast('success', CATEGORY.DELETE_SUCCESS); setConfirmTarget(null); },
      onError: () => { addToast('error', '삭제 중 오류가 발생했습니다.'); setConfirmTarget(null); },
    });
  };

  if (categories.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-text-muted">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-bg-tertiary mb-3">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6">
            <path d="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z" />
            <line x1="7" y1="7" x2="7.01" y2="7" />
          </svg>
        </div>
        <p className="text-sm text-text-secondary">카테고리가 없습니다.</p>
      </div>
    );
  }

  return (
    <>
      <ul className="space-y-2" role="list">
        {categories.map((cat, idx) => {
          const color = CAT_COLORS[idx % CAT_COLORS.length];
          return (
            <li
              key={cat.categoryId}
              className="group flex items-center justify-between bg-white rounded-xl border border-border px-4 py-3.5 hover:border-border-strong transition-colors"
            >
              <div className="flex items-center gap-3">
                <span
                  className="h-8 w-8 rounded-lg flex items-center justify-center text-sm font-bold shrink-0"
                  style={{ backgroundColor: color.bg, color: color.text }}
                  aria-hidden="true"
                >
                  {cat.name.charAt(0)}
                </span>
                <div>
                  <p className="text-sm font-medium text-text-primary">{cat.name}</p>
                  {cat.isDefault && (
                    <p className="text-xs text-text-muted mt-0.5">기본 카테고리</p>
                  )}
                </div>
              </div>

              {!cat.isDefault ? (
                <button
                  type="button"
                  onClick={() => setConfirmTarget(cat)}
                  aria-label={`${cat.name} 삭제`}
                  className="opacity-0 group-hover:opacity-100 p-2 rounded-lg text-text-muted hover:text-danger hover:bg-danger-light transition-all"
                >
                  <svg viewBox="0 0 16 16" fill="currentColor" className="h-4 w-4" aria-hidden="true">
                    <path d="M5.5 5.5A.5.5 0 016 6v6a.5.5 0 01-1 0V6a.5.5 0 01.5-.5zm2.5 0a.5.5 0 01.5.5v6a.5.5 0 01-1 0V6a.5.5 0 01.5-.5zm3 .5a.5.5 0 00-1 0v6a.5.5 0 001 0V6z"/>
                    <path fillRule="evenodd" d="M14.5 3a1 1 0 01-1 1H13v9a2 2 0 01-2 2H5a2 2 0 01-2-2V4h-.5a1 1 0 01-1-1V2a1 1 0 011-1H6a1 1 0 011-1h2a1 1 0 011 1h3.5a1 1 0 011 1v1zM4.118 4L4 4.059V13a1 1 0 001 1h6a1 1 0 001-1V4.059L11.882 4H4.118zM2.5 3V2h11v1h-11z"/>
                  </svg>
                </button>
              ) : (
                <span className="text-xs text-text-muted bg-bg-tertiary px-2 py-1 rounded-md">기본</span>
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
