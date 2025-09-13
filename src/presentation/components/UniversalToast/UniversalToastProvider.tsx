// src/presentation/components/UniversalToast/UniversalToastProvider.tsx
import React, { createContext, useState, useCallback } from 'react';
import type { ReactNode } from 'react';
import type { ToastContextValue, ToastType, ToastOptions, UniversalToastProps, ToastPosition } from './types';
import UniversalToast from './UniversalToast';

export const ToastContext = createContext<ToastContextValue | null>(null);

interface UniversalToastProviderProps {
  children: ReactNode;
  defaultPosition?: ToastPosition;
  maxToasts?: number;
}

export const UniversalToastProvider: React.FC<UniversalToastProviderProps> = ({
  children,
  defaultPosition = 'bottom-right',
  maxToasts = 5
}) => {
  const [toasts, setToasts] = useState<UniversalToastProps[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  }, []);

  const showToast = useCallback((
    type: ToastType,
    message: string,
    options: ToastOptions = {}
  ) => {
    const id = Date.now().toString() + Math.random().toString(36).substr(2, 9);

    const newToast: UniversalToastProps = {
      id,
      type,
      message,
      duration: options.duration ?? 5000,
      position: options.position ?? defaultPosition,
      showProgress: options.showProgress ?? true,
      actionButton: options.actionButton,
      persistent: options.persistent ?? false,
      onClose: removeToast
    };

    setToasts(prev => {
      const updatedToasts = [...prev, newToast];
      // Limitar número máximo de toasts
      if (updatedToasts.length > maxToasts) {
        return updatedToasts.slice(-maxToasts);
      }
      return updatedToasts;
    });
  }, [removeToast, defaultPosition, maxToasts]);

  const clearAllToasts = useCallback(() => {
    setToasts([]);
  }, []);

  // Agrupar toasts por posición
  const toastsByPosition = toasts.reduce((acc, toast) => {
    if (!acc[toast.position]) {
      acc[toast.position] = [];
    }
    acc[toast.position].push(toast);
    return acc;
  }, {} as Record<ToastPosition, UniversalToastProps[]>);

  // Estilos de posicionamiento para containers
  const getPositionStyles = (position: ToastPosition): string => {
    const baseStyles = "fixed z-50 flex flex-col pointer-events-none";

    switch (position) {
      case 'top-left':
        return `${baseStyles} top-4 left-4`;
      case 'top-center':
        return `${baseStyles} top-4 left-1/2 transform -translate-x-1/2`;
      case 'top-right':
        return `${baseStyles} top-4 right-4`;
      case 'bottom-left':
        return `${baseStyles} bottom-4 left-4`;
      case 'bottom-center':
        return `${baseStyles} bottom-4 left-1/2 transform -translate-x-1/2`;
      case 'bottom-right':
        return `${baseStyles} bottom-4 right-4`;
      default:
        return `${baseStyles} bottom-4 right-4`;
    }
  };

  const contextValue: ToastContextValue = {
    toasts,
    showToast,
    removeToast,
    clearAllToasts
  };

  return (
    <ToastContext.Provider value={contextValue}>
      {children}

      {/* Renderizar containers de toasts por posición */}
      {Object.entries(toastsByPosition).map(([position, positionToasts]) => (
        <div
          key={position}
          className={getPositionStyles(position as ToastPosition)}
        >
          <div className="space-y-2 pointer-events-auto">
            {positionToasts.map(toast => (
              <UniversalToast key={toast.id} {...toast} />
            ))}
          </div>
        </div>
      ))}
    </ToastContext.Provider>
  );
};