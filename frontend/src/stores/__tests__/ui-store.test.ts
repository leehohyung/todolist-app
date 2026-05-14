import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useUiStore } from '../ui-store';
import { act } from '@testing-library/react';

describe('useUiStore', () => {
  beforeEach(() => {
    act(() => {
      useUiStore.getState().closeModal();
      useUiStore.getState().hideConfirmDialog();
    });
  });

  it('초기 상태는 모달이 닫혀있다', () => {
    const state = useUiStore.getState();
    expect(state.isModalOpen).toBe(false);
    expect(state.modalType).toBeNull();
    expect(state.confirmDialog).toBeNull();
  });

  it('openModal 호출 시 모달이 열린다', () => {
    act(() => {
      useUiStore.getState().openModal('createTodo');
    });
    const state = useUiStore.getState();
    expect(state.isModalOpen).toBe(true);
    expect(state.modalType).toBe('createTodo');
  });

  it('closeModal 호출 시 모달이 닫힌다', () => {
    act(() => {
      useUiStore.getState().openModal('editTodo');
    });
    act(() => {
      useUiStore.getState().closeModal();
    });
    const state = useUiStore.getState();
    expect(state.isModalOpen).toBe(false);
    expect(state.modalType).toBeNull();
  });

  it('showConfirmDialog 호출 시 confirmDialog가 설정된다', () => {
    const onConfirm = vi.fn();
    act(() => {
      useUiStore.getState().showConfirmDialog({
        title: '삭제 확인',
        message: '삭제하시겠습니까?',
        onConfirm,
      });
    });
    const state = useUiStore.getState();
    expect(state.confirmDialog).not.toBeNull();
    expect(state.confirmDialog?.title).toBe('삭제 확인');
  });

  it('hideConfirmDialog 호출 시 confirmDialog가 초기화된다', () => {
    act(() => {
      useUiStore.getState().showConfirmDialog({
        title: '삭제 확인',
        message: '삭제하시겠습니까?',
        onConfirm: vi.fn(),
      });
    });
    act(() => {
      useUiStore.getState().hideConfirmDialog();
    });
    expect(useUiStore.getState().confirmDialog).toBeNull();
  });
});
