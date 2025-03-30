// src/presentation/contexts/NotificationContext.tsx
import React, { createContext, useState, useEffect} from 'react';
import type { ReactNode } from 'react';
import ApiClient from '../../infrastructure/api/ApiClient';
import { API_ENDPOINTS } from '../../constants/apiEndpoints';
import type { Notification, NotificationCountResponse } from '../../core/domain/entities/Notification';
import { useAuth } from '../hooks/useAuth';

interface NotificationContextProps {
  notifications: Notification[];
  loading: boolean;
  error: string | null;
  unreadCount: number;
  fetchNotifications: () => Promise<void>;
  markAsRead: (id: number) => Promise<boolean>;
  markAllAsRead: () => Promise<boolean>;
}

export const NotificationContext = createContext<NotificationContextProps>({
  notifications: [],
  loading: false,
  error: null,
  unreadCount: 0,
  fetchNotifications: async () => {},
  markAsRead: async () => false,
  markAllAsRead: async () => false
});

interface NotificationProviderProps {
  children: ReactNode;
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({ children }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const { isAuthenticated } = useAuth();

  // Cargar notificaciones cuando el usuario está autenticado
  useEffect(() => {
    if (isAuthenticated) {
      fetchUnreadCount();
    } else {
      setNotifications([]);
      setUnreadCount(0);
    }
  }, [isAuthenticated]);

  // Obtener lista de notificaciones
  const fetchNotifications = async (): Promise<void> => {
    if (!isAuthenticated) return;
    
    setLoading(true);
    setError(null);
    
    try {
    const response = await ApiClient.get<{ notifications: Notification[]; unread_count: number }>(
      API_ENDPOINTS.NOTIFICATIONS.LIST
        );
      setNotifications(response.notifications || []);
      setUnreadCount(response.unread_count || 0);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar notificaciones');
      console.error('Error fetching notifications:', err);
    } finally {
      setLoading(false);
    }
  };

  // Obtener solo el contador de no leídas (más ligero que obtener todas las notificaciones)
  const fetchUnreadCount = async (): Promise<void> => {
    if (!isAuthenticated) return;
    
    try {
      const response = await ApiClient.get<NotificationCountResponse>(API_ENDPOINTS.NOTIFICATIONS.COUNT);
      setUnreadCount(response.count || 0);
    } catch (err) {
      console.error('Error fetching notification count:', err);
    }
  };

  // Marcar notificación como leída
  const markAsRead = async (id: number): Promise<boolean> => {
    if (!isAuthenticated) return false;
    
    setLoading(true);
    setError(null);
    
    try {
      await ApiClient.post(API_ENDPOINTS.NOTIFICATIONS.MARK_AS_READ(id));
      
      // Actualizar la lista y el contador
      await fetchUnreadCount();
      
      // Actualizar el estado local
      setNotifications(prev => 
        prev.map(notif => 
          notif.id === id ? { ...notif, read: true, readAt: new Date().toISOString() } : notif
        )
      );
      
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al marcar notificación como leída');
      console.error('Error marking notification as read:', err);
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Marcar todas las notificaciones como leídas
  const markAllAsRead = async (): Promise<boolean> => {
    if (!isAuthenticated) return false;
    
    setLoading(true);
    setError(null);
    
    try {
      await ApiClient.post(API_ENDPOINTS.NOTIFICATIONS.MARK_ALL_AS_READ);
      
      // Actualizar la lista y el contador
      setUnreadCount(0);
      setNotifications(prev => 
        prev.map(notif => ({ ...notif, read: true, readAt: new Date().toISOString() }))
      );
      
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al marcar todas las notificaciones como leídas');
      console.error('Error marking all notifications as read:', err);
      return false;
    } finally {
      setLoading(false);
    }
  };

  return (
    <NotificationContext.Provider value={{
      notifications,
      loading,
      error,
      unreadCount,
      fetchNotifications,
      markAsRead,
      markAllAsRead
    }}>
      {children}
    </NotificationContext.Provider>
  );
};