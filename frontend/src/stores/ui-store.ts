import { create } from 'zustand';

type ModalType = 'createTodo' | 'editTodo' | 'createCategory' | 'profile' | null;

interface ConfirmDialogOptions {
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel?: () => void;
}

export type ToastType = 'success' | 'error' | 'info';

export interface Toast {
  id: string;
  type: ToastType;
  message: string;
}

interface UiState {
  isModalOpen: boolean;
  modalType: ModalType;
  confirmDialog: ConfirmDialogOptions | null;
  toasts: Toast[];
  openModal: (type: ModalType) => void;
  closeModal: () => void;
  showConfirmDialog: (options: ConfirmDialogOptions) => void;
  hideConfirmDialog: () => void;
  addToast: (type: ToastType, message: string) => void;
  removeToast: (id: string) => void;
}

export const useUiStore = create<UiState>((set) => ({
  isModalOpen: false,
  modalType: null,
  confirmDialog: null,
  toasts: [],
  openModal: (type) => set({ isModalOpen: true, modalType: type }),
  closeModal: () => set({ isModalOpen: false, modalType: null }),
  showConfirmDialog: (options) => set({ confirmDialog: options }),
  hideConfirmDialog: () => set({ confirmDialog: null }),
  addToast: (type, message) =>
    set((state) => ({
      toasts: [...state.toasts, { id: crypto.randomUUID(), type, message }],
    })),
  removeToast: (id) =>
    set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) })),
}));
