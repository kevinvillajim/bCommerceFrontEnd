import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { useAuth } from "./useAuth";
import { useLocation } from "react-router-dom";
import { useNotifications } from "./useNotifications";

interface SellerNotificationCounts {
  orders: number;
  shipping: number;
  ratings: number;
  messages: number;
}

interface UseSellerNotificationsReturn {
  counts: SellerNotificationCounts;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  markSectionAsRead: (section: keyof SellerNotificationCounts) => Promise<void>;
}

const SECTION_PATHS = {
  orders: '/seller/orders',
  shipping: '/seller/shipping', 
  ratings: '/seller/ratings',
  messages: '/seller/messages'
};

// Mapeo de tipos de notificación a secciones
const NOTIFICATION_TYPE_TO_SECTION: Record<string, keyof SellerNotificationCounts> = {
  'new_order': 'orders',
  'order_status': 'orders',
  'order_update': 'orders',
  'shipping_update': 'shipping',
  'shipping_status': 'shipping',
  'rating_received': 'ratings',
  'seller_rated': 'ratings',
  'rating_request': 'ratings',
  'new_message': 'messages',
  'message_received': 'messages',
};

export const useSellerNotifications = (): UseSellerNotificationsReturn => {
  const { isAuthenticated, roleInfo } = useAuth();
  const location = useLocation();
  
  // Usar el hook de notificaciones existente
  const {
    notifications,
    loading,
    error,
    fetchNotifications,
    markAsRead,
  } = useNotifications();

  // Calcular contadores basados en notificaciones no leídas
  const counts = useMemo(() => {
    if (!isAuthenticated || !roleInfo.isSeller || !notifications.length) {
      return { orders: 0, shipping: 0, ratings: 0, messages: 0 };
    }

    const sectionCounts = {
      orders: 0,
      shipping: 0,
      ratings: 0,
      messages: 0,
    };

    // Contar notificaciones no leídas por sección
    notifications
      .filter(notification => !notification.read) // Solo las no leídas
      .forEach(notification => {
        const section = NOTIFICATION_TYPE_TO_SECTION[notification.type];
        if (section) {
          sectionCounts[section]++;
        }
      });


    return sectionCounts;
  }, [notifications, isAuthenticated, roleInfo.isSeller]);

  // Marcar notificaciones de una sección como leídas
  const markSectionAsRead = useCallback(async (section: keyof SellerNotificationCounts) => {
    if (!isAuthenticated || !roleInfo.isSeller) return;

    try {

      
      // Encontrar todas las notificaciones no leídas de esta sección
      const sectionNotifications = notifications
        .filter(notification => 
          !notification.read && 
          NOTIFICATION_TYPE_TO_SECTION[notification.type] === section
        );
      
      // Marcar cada una como leída
      for (const notification of sectionNotifications) {
        await markAsRead(notification.id!);
      }
      

      
    } catch (err: any) {

    }
  }, [isAuthenticated, roleInfo.isSeller, notifications, markAsRead]);

  // Refs para evitar bucles infinitos
  const countsRef = useRef(counts);
  const markSectionAsReadRef = useRef(markSectionAsRead);

  // Actualizar refs
  countsRef.current = counts;
  markSectionAsReadRef.current = markSectionAsRead;

  // Detectar cambios de ruta y marcar como leídas
  useEffect(() => {
    const currentPath = location.pathname;
    
    // Verificar si estamos en alguna de las secciones
    for (const [section, path] of Object.entries(SECTION_PATHS)) {
      if (currentPath.startsWith(path)) {
        const sectionKey = section as keyof SellerNotificationCounts;
        // Solo marcar si hay notificaciones no leídas en esa sección
        if (countsRef.current[sectionKey] > 0) {
          markSectionAsReadRef.current(sectionKey);
        }
        break;
      }
    }
  }, [location.pathname]); // Removido counts y markSectionAsRead para evitar bucles

  // Cargar notificaciones al montar el componente
  useEffect(() => {
    if (isAuthenticated && roleInfo.isSeller) {
      fetchNotifications(1, false); // Cargar todas las notificaciones
    }
  }, [isAuthenticated, roleInfo.isSeller, fetchNotifications]);

  const refetch = useCallback(async () => {
    if (isAuthenticated && roleInfo.isSeller) {
      await fetchNotifications(1, false);
    }
  }, [isAuthenticated, roleInfo.isSeller, fetchNotifications]);

  return {
    counts,
    loading,
    error,
    refetch,
    markSectionAsRead,
  };
};
