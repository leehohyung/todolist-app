import { create } from 'zustand';
import type { CompletionStatus, TodoFilter } from '../types';

interface FilterStoreState {
  categoryId: string;
  dueDate: string;
  completionStatus: CompletionStatus;
  setFilter: (filter: Partial<{ categoryId: string; dueDate: string; completionStatus: CompletionStatus }>) => void;
  resetFilters: () => void;
  toApiFilter: () => TodoFilter;
}

const initialState = {
  categoryId: '',
  dueDate: '',
  completionStatus: 'all' as CompletionStatus,
};

export const useFilterStore = create<FilterStoreState>((set, get) => ({
  ...initialState,
  setFilter: (filter) => set((state) => ({ ...state, ...filter })),
  resetFilters: () => set(initialState),
  toApiFilter: () => {
    const { categoryId, dueDate, completionStatus } = get();
    const filter: TodoFilter = {};
    if (categoryId) filter.categoryId = categoryId;
    if (dueDate) filter.dueDate = dueDate;
    if (completionStatus === 'completed') filter.isCompleted = true;
    else if (completionStatus === 'incomplete') filter.isCompleted = false;
    return filter;
  },
}));
