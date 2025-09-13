// src/presentation/components/UniversalToast/useToast.ts
import { useContext } from 'react';
import { ToastContext } from './UniversalToastProvider';
import type { ToastContextValue } from './types';

export const useToast = (): ToastContextValue => {
  const context = useContext(ToastContext);

  if (!context) {
    throw new Error('useToast must be used within a UniversalToastProvider');
  }

  return context;
};