import { describe, it, expect, beforeEach } from 'vitest';
import { useFilterStore } from '../filter-store';
import { act } from '@testing-library/react';

describe('useFilterStore', () => {
  beforeEach(() => {
    act(() => {
      useFilterStore.getState().resetFilters();
    });
  });

  it('초기 상태는 빈 필터이다', () => {
    const state = useFilterStore.getState();
    expect(state.categoryId).toBe('');
    expect(state.dueDate).toBe('');
    expect(state.completionStatus).toBe('all');
  });

  it('setFilter로 특정 필터만 변경된다', () => {
    act(() => {
      useFilterStore.getState().setFilter({ categoryId: 'cat-1' });
    });
    const state = useFilterStore.getState();
    expect(state.categoryId).toBe('cat-1');
    expect(state.completionStatus).toBe('all');
  });

  it('resetFilters 호출 시 초기 상태로 돌아간다', () => {
    act(() => {
      useFilterStore.getState().setFilter({ categoryId: 'cat-1', completionStatus: 'completed' });
    });
    act(() => {
      useFilterStore.getState().resetFilters();
    });
    const state = useFilterStore.getState();
    expect(state.categoryId).toBe('');
    expect(state.completionStatus).toBe('all');
  });

  it('toApiFilter: completionStatus=all이면 isCompleted 필드 없음', () => {
    const filter = useFilterStore.getState().toApiFilter();
    expect(filter.isCompleted).toBeUndefined();
  });

  it('toApiFilter: completionStatus=completed이면 isCompleted=true', () => {
    act(() => {
      useFilterStore.getState().setFilter({ completionStatus: 'completed' });
    });
    const filter = useFilterStore.getState().toApiFilter();
    expect(filter.isCompleted).toBe(true);
  });

  it('toApiFilter: completionStatus=incomplete이면 isCompleted=false', () => {
    act(() => {
      useFilterStore.getState().setFilter({ completionStatus: 'incomplete' });
    });
    const filter = useFilterStore.getState().toApiFilter();
    expect(filter.isCompleted).toBe(false);
  });

  it('toApiFilter: categoryId 없으면 필드 없음', () => {
    const filter = useFilterStore.getState().toApiFilter();
    expect(filter.categoryId).toBeUndefined();
  });

  it('toApiFilter: categoryId 있으면 포함', () => {
    act(() => {
      useFilterStore.getState().setFilter({ categoryId: 'cat-1' });
    });
    const filter = useFilterStore.getState().toApiFilter();
    expect(filter.categoryId).toBe('cat-1');
  });
});
