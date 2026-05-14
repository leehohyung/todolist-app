import { create } from 'zustand';

type ModalType = 'createTodo' | 'editTodo' | 'createCategory' | 'profile' | null;

interface ConfirmDialogOptions {
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel?: () => void;
}

interface UiState {
  isModalOpen: boolean;
  modalType: ModalType;
  confirmDialog: ConfirmDialogOptions | null;
  openModal: (type: ModalType) => void;
  closeModal: () => void;
  showConfirmDialog: (options: ConfirmDialogOptions) => void;
  hideConfirmDialog: () => void;
}

export const useUiStore = create<UiState>((set) => ({
  isModalOpen: false,
  modalType: null,
  confirmDialog: null,
  openModal: (type) => set({ isModalOpen: true, modalType: type }),
  closeModal: () => set({ isModalOpen: false, modalType: null }),
  showConfirmDialog: (options) => set({ confirmDialog: options }),
  hideConfirmDialog: () => set({ confirmDialog: null }),
}));
