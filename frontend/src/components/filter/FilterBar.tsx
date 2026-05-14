import { useState } from 'react';
import { useFilterStore } from '../../stores/filter-store';
import { useCategories } from '../../hooks/category/useCategories';
import type { CompletionStatus } from '../../types';
import Button from '../common/Button';

const COMPLETION_OPTIONS: { value: CompletionStatus; label: string }[] = [
  { value: 'all', label: '전체' },
  { value: 'incomplete', label: '미완료' },
  { value: 'completed', label: '완료됨' },
];

const FilterBar = () => {
  const { data: categories = [] } = useCategories();
  const filterStore = useFilterStore();

  const [draft, setDraft] = useState({
    categoryId: filterStore.categoryId,
    dueDate: filterStore.dueDate,
    completionStatus: filterStore.completionStatus,
  });
  const [isOpen, setIsOpen] = useState(false);

  const handleApply = () => {
    filterStore.setFilter(draft);
    setIsOpen(false);
  };

  const handleReset = () => {
    const reset = { categoryId: '', dueDate: '', completionStatus: 'all' as CompletionStatus };
    setDraft(reset);
    filterStore.resetFilters();
    setIsOpen(false);
  };

  const filterContent = (
    <div className="flex flex-col lg:flex-row lg:items-end gap-3 lg:gap-4">
      <div className="flex flex-col gap-1 lg:flex-1">
        <label htmlFor="filter-category" className="text-xs font-medium text-text-secondary">카테고리</label>
        <select
          id="filter-category"
          value={draft.categoryId}
          onChange={(e) => setDraft((d) => ({ ...d, categoryId: e.target.value }))}
          className="w-full border border-border rounded-md px-3 py-2 text-sm text-text-primary bg-white focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
        >
          <option value="">전체</option>
          {categories.map((c) => (
            <option key={c.categoryId} value={c.categoryId}>{c.name}</option>
          ))}
        </select>
      </div>

      <div className="flex flex-col gap-1 lg:flex-1">
        <label htmlFor="filter-due" className="text-xs font-medium text-text-secondary">마감일</label>
        <input
          id="filter-due"
          type="date"
          value={draft.dueDate}
          onChange={(e) => setDraft((d) => ({ ...d, dueDate: e.target.value }))}
          className="w-full border border-border rounded-md px-3 py-2 text-sm text-text-primary bg-white focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
        />
      </div>

      <fieldset className="flex flex-col gap-1 lg:flex-1">
        <legend className="text-xs font-medium text-text-secondary mb-1">완료 여부</legend>
        <div className="flex gap-4">
          {COMPLETION_OPTIONS.map((opt) => (
            <label key={opt.value} className="flex items-center gap-1.5 text-sm text-text-primary cursor-pointer">
              <input
                type="radio"
                name="completion-status"
                value={opt.value}
                checked={draft.completionStatus === opt.value}
                onChange={() => setDraft((d) => ({ ...d, completionStatus: opt.value }))}
                className="accent-accent"
              />
              {opt.label}
            </label>
          ))}
        </div>
      </fieldset>

      <div className="flex gap-2 lg:shrink-0">
        <Button variant="primary" onClick={handleApply} className="flex-1 lg:flex-none">
          적용
        </Button>
        <Button variant="ghost" onClick={handleReset} className="flex-1 lg:flex-none">
          초기화
        </Button>
      </div>
    </div>
  );

  return (
    <div className="bg-white border border-border rounded-lg shadow-card p-4">
      <div className="lg:hidden">
        <button
          type="button"
          onClick={() => setIsOpen((v) => !v)}
          aria-expanded={isOpen}
          className="flex w-full items-center justify-between text-sm font-medium text-text-primary"
        >
          <span>필터</span>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
            viewBox="0 0 20 20"
            fill="currentColor"
            aria-hidden="true"
          >
            <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </button>
        {isOpen && <div className="mt-3">{filterContent}</div>}
      </div>

      <div className="hidden lg:block">{filterContent}</div>
    </div>
  );
};

export default FilterBar;
