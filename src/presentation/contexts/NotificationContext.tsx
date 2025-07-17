// src/presentation/contexts/NotificationContext.tsx
import React, { createContext, useState, useEffect, useCallback, useRef } from 'react';
import type { ReactNode } from 'react';
import ApiClient from '../../infrastructure/api/apiClient';
import { API_ENDPOINTS } from '../../constants/apiEndpoints';
import type { Notification } from '../../core/domain/entities/Notification';
import { useAuth } from '../hooks/useAuth';
import {useInvalidateCounters} from "../hooks/useInvalidateCounters";

interface NotificationContextProps {
  notifications: Notification[];
  loading: boolean;
  error: string | null;
  unreadCount: number;
  hasMore: boolean;
  currentPage: number;
  totalNotifications: number;
  fetchNotifications: (page?: number, showUnreadOnly?: boolean) => Promise<void>;
  markAsRead: (id: number) => Promise<boolean>;
  markAllAsRead: () => Promise<boolean>;
  deleteNotification: (id: number) => Promise<boolean>;
  refreshUnreadCount: () => Promise<void>;
  getNotificationUrl: (notification: Notification) => string | null;
}

/**
 * Normaliza una notificación desde el formato del backend
 * Convierte snake_case a camelCase para compatibilidad
 */
const normalizeNotification = (notification: any): Notification => {
  return {
    ...notification,
    // Asegurar que siempre tenemos las propiedades en camelCase
    createdAt: notification.createdAt || notification.created_at || '',
    readAt: notification.readAt || notification.read_at || undefined,
    // Mantener compatibilidad hacia atrás
    created_at: notification.created_at,
    read_at: notification.read_at
  };
};

/**
 * Normaliza un array de notificaciones
 */
const normalizeNotifications = (notifications: any[]): Notification[] => {
  return notifications.map(normalizeNotification);
};

export const NotificationContext = createContext<NotificationContextProps>({
  notifications: [],
  loading: false,
  error: null,
  unreadCount: 0,
  hasMore: false,
  currentPage: 1,
  totalNotifications: 0,
  fetchNotifications: async () => {},
  markAsRead: async () => false,
  markAllAsRead: async () => false,
  deleteNotification: async () => false,
  refreshUnreadCount: async () => {},
  getNotificationUrl: () => null
});

interface NotificationProviderProps {
  children: ReactNode;
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({ children }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [hasMore, setHasMore] = useState<boolean>(false);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalNotifications, setTotalNotifications] = useState<number>(0);

  const { isAuthenticated } = useAuth();
  const isInitialized = useRef(false);
  const refreshTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const {invalidateNotifications} = useInvalidateCounters();

  // Limpiar timeouts al desmontar
  useEffect(() => {
    return () => {
      if (refreshTimeoutRef.current) {
        clearTimeout(refreshTimeoutRef.current);
      }
    };
  }, []);

  // Obtener lista de notificaciones con paginación
  const fetchNotifications = useCallback(async (page: number = 1, showUnreadOnly: boolean = false): Promise<void> => {
    if (!isAuthenticated) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const endpoint = showUnreadOnly 
        ? API_ENDPOINTS.NOTIFICATIONS.UNREAD 
        : API_ENDPOINTS.NOTIFICATIONS.LIST;
      
      const params = {
        page,
        limit: 20,
        ...(showUnreadOnly && { unread: true })
      };

      const response = await ApiClient.get<{
        status: string;
        data: {
          notifications: Notification[];
          unread_count: number;
          total: number;
        };
      }>(endpoint, params);

      if (response.status === 'success' && response.data) {
        const { notifications: newNotifications, unread_count, total } = response.data;
        
        if (page === 1) {
          setNotifications(normalizeNotifications(newNotifications));
        } else {
          setNotifications(prev => [...prev, ...normalizeNotifications(newNotifications)]);
        }
        
        setUnreadCount(unread_count);
        setTotalNotifications(total);
        setCurrentPage(page);
        setHasMore(newNotifications.length === 20); // Si recibimos 20, probablemente hay más
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar notificaciones');
      console.error('Error fetching notifications:', err);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  // Obtener solo el contador de no leídas (más ligero)
  const refreshUnreadCount = useCallback(async (): Promise<void> => {
    if (!isAuthenticated) return;
    
    try {
      const response = await ApiClient.get<{
        status: string;
        data: {
          unread_count: number;
        };
      }>(API_ENDPOINTS.NOTIFICATIONS.COUNT);

      if (response.status === 'success' && response.data) {
        setUnreadCount(response.data.unread_count);
      }
    } catch (err) {
      console.error('Error fetching notification count:', err);
    }
  }, [isAuthenticated]);

  // Marcar notificación como leída
  const markAsRead = useCallback(
		async (id: number): Promise<boolean> => {
			if (!isAuthenticated) return false;

			try {
				const response = await ApiClient.post<{
					status: string;
					data: {
						unread_count: number;
					};
				}>(`${API_ENDPOINTS.NOTIFICATIONS.MARK_AS_READ(id)}`);

				if (response.status === "success") {
					// Actualizar el estado local
					setNotifications((prev) =>
						prev.map((notif) =>
							normalizeNotification({
								...notif,
								read: true,
								readAt: new Date().toISOString(),
							})
						)
					);

					// Actualizar contador
					if (response.data?.unread_count !== undefined) {
						setUnreadCount(response.data.unread_count);
					} else {
						setUnreadCount((prev) => Math.max(0, prev - 1));
					}

					invalidateNotifications();

					return true;
				}

				return false;
			} catch (err) {
				setError(
					err instanceof Error
						? err.message
						: "Error al marcar notificación como leída"
				);
				console.error("Error marking notification as read:", err);
				return false;
			}
		},
		[isAuthenticated, invalidateNotifications]
	);

  // Marcar todas las notificaciones como leídas
  const markAllAsRead = useCallback(async (): Promise<boolean> => {
		if (!isAuthenticated) return false;

		setLoading(true);
		setError(null);

		try {
			const response = await ApiClient.post<{
				status: string;
				data: {
					unread_count: number;
				};
			}>(API_ENDPOINTS.NOTIFICATIONS.MARK_ALL_AS_READ);

			if (response.status === "success") {
				// Actualizar la lista
				setNotifications((prev) =>
					prev.map((notif) => ({
						...notif,
						read: true,
						readAt: new Date().toISOString(),
					}))
				);

				// Reset contador
				setUnreadCount(0);
				invalidateNotifications();

				return true;
			}

			return false;
		} catch (err) {
			setError(
				err instanceof Error
					? err.message
					: "Error al marcar todas las notificaciones como leídas"
			);
			console.error("Error marking all notifications as read:", err);
			return false;
		} finally {
			setLoading(false);
		}
	}, [isAuthenticated, invalidateNotifications]);

  // Eliminar notificación
  const deleteNotification = useCallback(
		async (id: number): Promise<boolean> => {
			if (!isAuthenticated) return false;

			try {
				const response = await ApiClient.delete<{
					status: string;
					data: {
						unread_count: number;
					};
				}>(`${API_ENDPOINTS.NOTIFICATIONS.DELETE(id)}`);

				if (response.status === "success") {
					// Encontrar la notificación antes de eliminarla
					const notification = notifications.find((n) => n.id === id);
					const wasUnread = notification && !notification.read;

					// Remover de la lista local
					setNotifications((prev) => prev.filter((notif) => notif.id !== id));

					// Actualizar contador si la notificación no estaba leída
					if (wasUnread) {
						if (response.data?.unread_count !== undefined) {
							setUnreadCount(response.data.unread_count);
						} else {
							setUnreadCount((prev) => Math.max(0, prev - 1));
						}
					}

					// Actualizar total
					setTotalNotifications((prev) => Math.max(0, prev - 1));

					invalidateNotifications();

					return true;
				}

				return false;
			} catch (err) {
				setError(
					err instanceof Error ? err.message : "Error al eliminar notificación"
				);
				console.error("Error deleting notification:", err);
				return false;
			}
		},
		[isAuthenticated, notifications, invalidateNotifications]
	);

  // Cargar notificaciones y contador cuando el usuario está autenticado
  useEffect(() => {
    if (isAuthenticated) {
      if (!isInitialized.current) {
        fetchNotifications(1);
        refreshUnreadCount();
        isInitialized.current = true;
      }
    } else {
      // Reset cuando no está autenticado
      setNotifications([]);
      setUnreadCount(0);
      setCurrentPage(1);
      setTotalNotifications(0);
      setHasMore(false);
      isInitialized.current = false;
    }
  }, [isAuthenticated, fetchNotifications, refreshUnreadCount]);

  // Obtener URL de destino según el tipo de notificación
  const getNotificationUrl = useCallback((notification: Notification): string | null => {
    const { type, data } = notification;
    
    switch (type) {
      case 'new_message':
        return data.chat_id ? `/chats/${data.chat_id}` : null;
        
      case 'feedback_response':
        return data.feedback_id ? `/feedback/${data.feedback_id}` : '/feedback';
        
      case 'order_status':
        return data.order_id ? `/orders/${data.order_id}` : '/orders';
        
      case 'product_update':
        return data.product_id ? `/products/${data.product_id}` : null;
        
      case 'shipping_update':
        return data.tracking_number ? `/tracking/${data.tracking_number}` : (data.order_id ? `/orders/${data.order_id}` : null);
        
      case 'rating_received':
      case 'seller_rated':
        return data.rating_id ? `/ratings/${data.rating_id}` : '/profile';
        
      case 'new_order':
        return data.order_id ? `/seller/orders/${data.order_id}` : '/seller/orders';
        
      case 'low_stock':
        return data.product_id ? `/seller/products/${data.product_id}` : '/seller/products';
        
      default:
        return null;
    }
  }, []);

  return (
    <NotificationContext.Provider value={{
      notifications,
      loading,
      error,
      unreadCount,
      hasMore,
      currentPage,
      totalNotifications,
      fetchNotifications,
      markAsRead,
      markAllAsRead,
      deleteNotification,
      refreshUnreadCount,
      getNotificationUrl
    }}>
      {children}
    </NotificationContext.Provider>
  );
};