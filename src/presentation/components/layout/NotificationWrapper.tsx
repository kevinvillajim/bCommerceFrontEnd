// src/presentation/components/layout/NotificationWrapper.tsx
import React, { useState, useEffect, useRef } from 'react';
import { NotificationToastContainer } from '../notifications/NotificationToast';
import { useAuth } from '../../hooks/useAuth';
import { useNotifications } from '../../hooks/useNotifications';
import type { Notification } from '../../../core/domain/entities/Notification';

interface NotificationWrapperProps {
  children: React.ReactNode;
}

/**
 * Wrapper component SÚPER SIMPLIFICADO para notificaciones en tiempo real
 * Sistema anti-bucles infinitos con control estricto
 */
const NotificationWrapper: React.FC<NotificationWrapperProps> = ({ children }) => {
  const [toastNotifications, setToastNotifications] = useState<Notification[]>([]);
  
  const { isAuthenticated } = useAuth();
  const { unreadCount } = useNotifications();
  
  // Refs para control estricto sin re-renders
  const lastUnreadCountRef = useRef<number>(0);
  const isInitializedRef = useRef<boolean>(false);
  const lastToastTimeRef = useRef<number>(0);
  const currentToastIdRef = useRef<number | null>(null);

  // Función para eliminar un toast
  const removeToast = (id: number) => {
    console.log(`🗑️ Removiendo toast ${id}`);
    setToastNotifications(prev => prev.filter(notification => notification.id !== id));
    
    // Limpiar la referencia del toast actual si es el que se está removiendo
    if (currentToastIdRef.current === id) {
      currentToastIdRef.current = null;
    }
  };

  // Función para crear y mostrar un toast (MUY CONTROLADA)
  const showNewNotificationToast = (newCount: number) => {
    const now = Date.now();
    
    // CONTROL 1: No mostrar si ya hay un toast activo
    if (currentToastIdRef.current !== null) {
      console.log(`⚠️ Toast bloqueado: ya hay uno activo (${currentToastIdRef.current})`);
      return;
    }
    
    // CONTROL 2: Debounce agresivo - mínimo 10 segundos entre toasts
    if (now - lastToastTimeRef.current < 10000) {
      console.log(`⏱️ Toast bloqueado: muy pronto desde el último (${now - lastToastTimeRef.current}ms)`);
      return;
    }
    
    // CONTROL 3: No mostrar si estamos en la página de notificaciones
    if (window.location.pathname === '/notifications') {
      console.log(`📄 Toast bloqueado: estamos en /notifications`);
      return;
    }
    
    // Crear el toast
    const toastId = Date.now();
    const newToast: Notification = {
      id: toastId,
      userId: 0,
      type: 'info',
      title: 'Nueva notificación',
      message: `Tienes ${newCount} notificación${newCount > 1 ? 'es' : ''} sin leer`,
      data: { action_url: '/notifications' },
      read: false,
      createdAt: new Date().toISOString()
    };

    console.log(`✨ Creando toast ${toastId} para ${newCount} notificaciones`);
    
    // Actualizar referencias de control
    lastToastTimeRef.current = now;
    currentToastIdRef.current = toastId;
    
    // Mostrar el toast
    setToastNotifications([newToast]);

    // Auto-remover después de 8 segundos
    setTimeout(() => {
      console.log(`⏰ Auto-removiendo toast ${toastId}`);
      removeToast(toastId);
    }, 8000);
  };

  // Efecto PRINCIPAL - Detectar cambios en unreadCount
  useEffect(() => {
    console.log(`🔔 NotificationWrapper: unreadCount=${unreadCount}, isAuth=${isAuthenticated}, isInit=${isInitializedRef.current}`);
    
    if (!isAuthenticated) {
      console.log(`🚪 Usuario no autenticado, limpiando toasts`);
      setToastNotifications([]);
      lastUnreadCountRef.current = 0;
      isInitializedRef.current = false;
      currentToastIdRef.current = null;
      return;
    }

    // En la primera carga, solo establecer la línea base
    if (!isInitializedRef.current) {
      console.log(`🔄 Inicializando NotificationWrapper con unreadCount=${unreadCount}`);
      lastUnreadCountRef.current = unreadCount;
      isInitializedRef.current = true;
      return;
    }

    const previousCount = lastUnreadCountRef.current;
    const currentCount = unreadCount;
    
    console.log(`📊 Comparando: anterior=${previousCount}, actual=${currentCount}`);

    // Solo mostrar toast si REALMENTE hay MÁS notificaciones que antes
    if (currentCount > previousCount && previousCount >= 0) {
      console.log(`🎯 NUEVA NOTIFICACIÓN DETECTADA: ${previousCount} → ${currentCount}`);
      showNewNotificationToast(currentCount);
    } else if (currentCount < previousCount) {
      console.log(`📉 Notificaciones disminuyeron: ${previousCount} → ${currentCount}`);
    } else {
      console.log(`➡️ Sin cambios en notificaciones: ${currentCount}`);
    }

    // Actualizar la referencia para la próxima comparación
    lastUnreadCountRef.current = currentCount;
  }, [unreadCount, isAuthenticated]);

  // Efecto para limpiar toasts cuando se navega a /notifications
  useEffect(() => {
    const currentPath = window.location.pathname;
    console.log(`🛣️ Ruta actual: ${currentPath}`);
    
    if (currentPath === '/notifications') {
      console.log(`🧹 Limpiando todos los toasts por navegación a /notifications`);
      setToastNotifications([]);
      currentToastIdRef.current = null;
    }
  }, []);

  // Logs para debugging
  useEffect(() => {
    console.log(`📱 NotificationWrapper renderizado:`, {
      isAuthenticated,
      unreadCount,
      toastCount: toastNotifications.length,
      lastUnreadCount: lastUnreadCountRef.current,
      isInitialized: isInitializedRef.current
    });
  });

  return (
    <>
      {children}
      
      {/* Mostrar toasts solo si el usuario está autenticado y hay toasts */}
      {isAuthenticated && toastNotifications.length > 0 && (
        <NotificationToastContainer
          notifications={toastNotifications}
          onRemove={removeToast}
          maxToasts={1} // MÁXIMO 1 toast a la vez
        />
      )}
    </>
  );
};

export default NotificationWrapper;