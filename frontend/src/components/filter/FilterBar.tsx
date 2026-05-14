import { useState } from 'react';
import { useFilterStore } from '../../stores/filter-store';
import { useCategories } from '../../hooks/category/useCategories';
import type { CompletionStatus } from '../../types';

const STATUS_TABS: { value: CompletionStatus; label: string }[] = [
  { value: 'all', label: '전체' },
  { value: 'incomplete', label: '미완료' },
  { value: 'completed', label: '완료됨' },
];

const FilterBar = () => {
  const { data: categories = [] } = useCategories();
  const filterStore = useFilterStore();
  const [showMore, setShowMore] = useState(false);

  const hasDateFilter = !!filterStore.dueDate;
  const hasCatFilter = !!filterStore.categoryId;
  const hasAnyFilter = hasDateFilter || hasCatFilter || filterStore.completionStatus !== 'all';

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 overflow-x-auto pb-0.5 hide-scrollbar">
        {STATUS_TABS.map((tab) => (
          <button
            key={tab.value}
            type="button"
            onClick={() => filterStore.setFilter({ completionStatus: tab.value })}
            className={`shrink-0 px-3.5 py-1.5 rounded-full text-sm font-medium transition-all duration-150 ${
              filterStore.completionStatus === tab.value
                ? 'bg-accent text-white shadow-xs'
                : 'bg-white border border-border text-text-secondary hover:border-border-strong hover:text-text-primary'
            }`}
          >
            {tab.label}
          </button>
        ))}

        <div className="h-5 w-px bg-border mx-1 shrink-0" aria-hidden="true" />

        <button
          type="button"
          onClick={() => setShowMore((v) => !v)}
          className={`shrink-0 flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-sm font-medium border transition-all duration-150 ${
            hasDateFilter || hasCatFilter
              ? 'bg-accent-light border-accent/30 text-accent'
              : 'bg-white border-border text-text-secondary hover:border-border-strong hover:text-text-primary'
          }`}
          aria-expanded={showMore}
        >
          <svg viewBox="0 0 16 16" fill="currentColor" className="h-3.5 w-3.5" aria-hidden="true">
            <path d="M6 10.5a.5.5 0 01.5-.5h3a.5.5 0 010 1h-3a.5.5 0 01-.5-.5zm-2-3a.5.5 0 01.5-.5h7a.5.5 0 010 1h-7a.5.5 0 01-.5-.5zm-2-3a.5.5 0 01.5-.5h11a.5.5 0 010 1h-11a.5.5 0 01-.5-.5z"/>
          </svg>
          필터
          {(hasDateFilter || hasCatFilter) && (
            <span className="flex h-4 w-4 items-center justify-center rounded-full bg-accent text-white text-[10px] font-bold">
              {(hasDateFilter ? 1 : 0) + (hasCatFilter ? 1 : 0)}
            </span>
          )}
        </button>

        {hasAnyFilter && (
          <button
            type="button"
            onClick={() => filterStore.resetFilters()}
            className="shrink-0 px-3 py-1.5 rounded-full text-xs font-medium text-text-muted hover:text-danger hover:bg-danger-light transition-colors"
          >
            초기화
          </button>
        )}
      </div>

      {showMore && (
        <div className="bg-white border border-border rounded-xl p-4 space-y-4 animate-slide-up shadow-sm">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="filter-category" className="block text-xs font-medium text-text-secondary mb-1.5">카테고리</label>
              <select
                id="filter-category"
                value={filterStore.categoryId}
                onChange={(e) => filterStore.setFilter({ categoryId: e.target.value })}
                className="w-full border border-border rounded-lg px-3 py-2 text-sm text-text-primary bg-white focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent transition-colors"
              >
                <option value="">전체 카테고리</option>
                {categories.map((c) => (
                  <option key={c.categoryId} value={c.categoryId}>{c.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="filter-due" className="block text-xs font-medium text-text-secondary mb-1.5">마감일</label>
              <input
                id="filter-due"
                type="date"
                value={filterStore.dueDate}
                onChange={(e) => filterStore.setFilter({ dueDate: e.target.value })}
                className="w-full border border-border rounded-lg px-3 py-2 text-sm text-text-primary bg-white focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent transition-colors"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FilterBar;
