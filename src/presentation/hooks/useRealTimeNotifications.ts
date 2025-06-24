// src/presentation/hooks/useRealTimeNotifications.ts
import { useState, useEffect, useCallback, useRef } from 'react';
import { useNotifications } from './useNotifications';
import { useAuth } from './useAuth';
import type { Notification } from '../../core/domain/entities/Notification';

interface UseRealTimeNotificationsReturn {
  toastNotifications: Notification[];
  removeToast: (id: number) => void;
  clearAllToasts: () => void;
}

export const useRealTimeNotifications = (): UseRealTimeNotificationsReturn => {
  const [toastNotifications, setToastNotifications] = useState<Notification[]>([]);
  const { isAuthenticated } = useAuth();
  const { unreadCount, refreshUnreadCount } = useNotifications();
  
  // Refs para mantener valores sin causar re-renders
  const lastUnreadCountRef = useRef<number>(0);
  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const isPollingRef = useRef(false);
  const isInitializedRef = useRef(false);
  const autoRemoveTimersRef = useRef<Map<number, NodeJS.Timeout>>(new Map());

  // Función para eliminar un toast
  const removeToast = useCallback((id: number) => {
    setToastNotifications(prev => prev.filter(notification => notification.id !== id));
    
    // Limpiar timer de auto-remove si existe
    const timer = autoRemoveTimersRef.current.get(id);
    if (timer) {
      clearTimeout(timer);
      autoRemoveTimersRef.current.delete(id);
    }
  }, []);

  // Función para limpiar todos los toasts
  const clearAllToasts = useCallback(() => {
    setToastNotifications([]);
    
    // Limpiar todos los timers de auto-remove
    autoRemoveTimersRef.current.forEach(timer => clearTimeout(timer));
    autoRemoveTimersRef.current.clear();
  }, []);

  // Función para agregar una nueva notificación toast
  const addToastNotification = useCallback((notification: Notification) => {
    setToastNotifications(prev => {
      // Evitar duplicados
      const exists = prev.some(n => n.id === notification.id);
      if (exists) return prev;
      
      // Añadir nueva notificación al inicio y limitar a 3
      const updated = [notification, ...prev].slice(0, 3);
      
      // Configurar auto-remove para la nueva notificación
      if (notification.id) {
        const timer = setTimeout(() => {
          removeToast(notification.id!);
        }, 8000);
        autoRemoveTimersRef.current.set(notification.id, timer);
      }
      
      return updated;
    });
  }, [removeToast]);

  // Función para detectar y mostrar nuevas notificaciones
  const checkForNewNotifications = useCallback(async () => {
    if (!isAuthenticated || isPollingRef.current) {
      return;
    }

    try {
      isPollingRef.current = true;
      
      // Refrescar el contador
      await refreshUnreadCount();
      
    } catch (error) {
      console.error('Error refreshing notification count:', error);
    } finally {
      isPollingRef.current = false;
    }
  }, [isAuthenticated, refreshUnreadCount]);

  // Efecto para detectar cambios en unreadCount y mostrar toasts
  useEffect(() => {
    // Solo procesar si ya está inicializado y el usuario está autenticado
    if (!isInitializedRef.current || !isAuthenticated) {
      return;
    }

    const previousCount = lastUnreadCountRef.current;
    const currentCount = unreadCount;

    // Si hay nuevas notificaciones no leídas
    if (currentCount > previousCount && previousCount >= 0) {
      // Solo mostrar toast si no estamos en la página de notificaciones
      if (window.location.pathname !== '/notifications') {
        // Crear una notificación toast genérica
        const newToast: Notification = {
          id: Date.now(), // ID temporal único
          userId: 0,
          type: 'info',
          title: 'Nueva notificación',
          message: `Tienes ${currentCount} notificación${currentCount > 1 ? 'es' : ''} sin leer`,
          data: {},
          read: false,
          createdAt: new Date().toISOString()
        };
        
        addToastNotification(newToast);
      }
    }

    // Actualizar la referencia
    lastUnreadCountRef.current = currentCount;
  }, [unreadCount, isAuthenticated, addToastNotification]);

  // Efecto de inicialización
  useEffect(() => {
    if (isAuthenticated) {
      // Configurar el contador inicial sin mostrar toasts
      lastUnreadCountRef.current = unreadCount;
      isInitializedRef.current = true;
      
      // Iniciar polling cada 60 segundos (reducido para evitar spam)
      if (!pollIntervalRef.current) {
        pollIntervalRef.current = setInterval(() => {
          checkForNewNotifications();
        }, 60000);
      }
    } else {
      // Reset cuando no está autenticado
      setToastNotifications([]);
      lastUnreadCountRef.current = 0;
      isInitializedRef.current = false;
      
      // Limpiar polling
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
        pollIntervalRef.current = null;
      }
      
      // Limpiar timers
      autoRemoveTimersRef.current.forEach(timer => clearTimeout(timer));
      autoRemoveTimersRef.current.clear();
    }

    return () => {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
        pollIntervalRef.current = null;
      }
    };
  }, [isAuthenticated, unreadCount, checkForNewNotifications]);

  // Limpiar toasts cuando se navega a la página de notificaciones
  useEffect(() => {
    const handleRouteChange = () => {
      if (window.location.pathname === '/notifications') {
        clearAllToasts();
      }
    };

    // Verificar ruta actual
    handleRouteChange();

    // Escuchar cambios de ruta (popstate no es suficiente para SPAs)
    const originalPushState = window.history.pushState;
    const originalReplaceState = window.history.replaceState;

    window.history.pushState = function(...args) {
      originalPushState.apply(window.history, args);
      setTimeout(handleRouteChange, 0);
    };

    window.history.replaceState = function(...args) {
      originalReplaceState.apply(window.history, args);
      setTimeout(handleRouteChange, 0);
    };

    window.addEventListener('popstate', handleRouteChange);

    return () => {
      window.history.pushState = originalPushState;
      window.history.replaceState = originalReplaceState;
      window.removeEventListener('popstate', handleRouteChange);
    };
  }, [clearAllToasts]);

  // Cleanup al desmontar
  useEffect(() => {
    return () => {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
      }
      autoRemoveTimersRef.current.forEach(timer => clearTimeout(timer));
      autoRemoveTimersRef.current.clear();
    };
  }, []);

  return {
    toastNotifications,
    removeToast,
    clearAllToasts
  };
};