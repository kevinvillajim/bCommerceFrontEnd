// src/presentation/components/UniversalToast/types.ts
import { NotificationType } from '../../types/NotificationTypes';
import type { ToastType as BaseToastType } from '../../types/NotificationTypes';

// Usar el tipo centralizado
export type ToastType = NotificationType | BaseToastType;

export type ToastPosition =
  | 'top-left'
  | 'top-center'
  | 'top-right'
  | 'bottom-left'
  | 'bottom-center'
  | 'bottom-right';

export interface ToastActionButton {
  label: string;
  onClick: () => void;
}

export interface ToastOptions {
  duration?: number;
  position?: ToastPosition;
  showProgress?: boolean;
  actionButton?: ToastActionButton;
  persistent?: boolean; // No auto-close
}

export interface UniversalToastProps {
  id: string;
  type: ToastType;
  message: string;
  duration: number;
  position: ToastPosition;
  showProgress: boolean;
  actionButton?: ToastActionButton;
  persistent: boolean;
  onClose: (id: string) => void;
}

export interface ToastContextValue {
  toasts: UniversalToastProps[];
  showToast: (type: ToastType, message: string, options?: ToastOptions) => void;
  removeToast: (id: string) => void;
  clearAllToasts: () => void;
}