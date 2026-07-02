import { create } from 'zustand';

interface AlertState {
  isOpen: boolean;
  message: string;
  isConfirm: boolean;
  onConfirm?: () => void;
  showAlert: (msg: string) => void;
  showConfirm: (msg: string, onConfirm: () => void) => void;
  closeAlert: () => void;
}

export const useAlertStore = create<AlertState>((set) => ({
  isOpen: false,
  message: '',
  isConfirm: false,
  showAlert: (msg: string) => set({ isOpen: true, message: msg, isConfirm: false, onConfirm: undefined }),
  showConfirm: (msg: string, onConfirm: () => void) => set({ isOpen: true, message: msg, isConfirm: true, onConfirm }),
  closeAlert: () => set({ isOpen: false, message: '', isConfirm: false, onConfirm: undefined }),
}));
