import { useEffect, useCallback, useMemo, useRef } from "react";
import { useAuth } from "./useAuth";
import { useLocation } from "react-router-dom";
import { useNotifications } from "./useNotifications";

interface AdminNotificationCounts {
  users: number;
  sellers: number;
  solicitudes: number;  // Solicitudes de vendedor
  orders: number;
  shipping: number;
  ratings: number;
  feedback: number;
  logs: number;
  invoices: number;
}

interface UseAdminNotificationsReturn {
  counts: AdminNotificationCounts;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  markSectionAsRead: (section: keyof AdminNotificationCounts) => Promise<void>;
}

const SECTION_PATHS = {
  users: '/admin/users',
  sellers: '/admin/sellers',
  solicitudes: '/admin/solicitudes',
  orders: '/admin/orders',
  shipping: '/admin/shipping',
  ratings: '/admin/ratings',
  feedback: '/admin/feedback',
  logs: '/admin/logs',
  invoices: '/admin/invoices'
};

// Mapeo de tipos de notificación de admin a secciones
const NOTIFICATION_TYPE_TO_SECTION: Record<string, keyof AdminNotificationCounts> = {
  // Usuarios y vendedores
  'user_registered': 'users',
  'user_blocked': 'users',
  'user_reported': 'users',
  'seller_application': 'solicitudes',
  'seller_approved': 'sellers',
  'seller_suspended': 'sellers',
  'seller_issue': 'sellers',
  
  // Pedidos y envíos
  'order_created': 'orders',
  'order_cancelled': 'orders',
  'order_refund': 'orders',
  'payment_issue': 'orders',
  'shipping_problem': 'shipping',
  'delivery_issue': 'shipping',
  
  // Contenido y moderación
  'rating_reported': 'ratings',
  'rating_flagged': 'ratings',
  'content_violation': 'ratings',
  'feedback_submitted': 'feedback',
  'complaint_received': 'feedback',
  'feedback_flagged': 'feedback',
  
  // Sistema
  'system_error': 'logs',
  'critical_error': 'logs',
  'security_alert': 'logs',
  'payment_failed': 'invoices',
  'invoice_overdue': 'invoices',
};

export const useAdminNotifications = (): UseAdminNotificationsReturn => {
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
    if (!isAuthenticated || !roleInfo.isAdmin || !notifications.length) {
      return { 
        users: 0, 
        sellers: 0, 
        solicitudes: 0, 
        orders: 0, 
        shipping: 0, 
        ratings: 0, 
        feedback: 0, 
        logs: 0, 
        invoices: 0 
      };
    }

    const sectionCounts = {
      users: 0,
      sellers: 0,
      solicitudes: 0,
      orders: 0,
      shipping: 0,
      ratings: 0,
      feedback: 0,
      logs: 0,
      invoices: 0,
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
  }, [notifications, isAuthenticated, roleInfo.isAdmin]);

  // Marcar notificaciones de una sección como leídas
  const markSectionAsRead = useCallback(async (section: keyof AdminNotificationCounts) => {
    if (!isAuthenticated || !roleInfo.isAdmin) return;

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
      console.error(`Error marking ${section} notifications as read:`, err);
    }
  }, [isAuthenticated, roleInfo.isAdmin, notifications, markAsRead]);

  // Refs para evitar bucles infinitos
  const countsRef = useRef(counts);
  const markSectionAsReadRef = useRef(markSectionAsRead);

  // Actualizar refs
  countsRef.current = counts;
  markSectionAsReadRef.current = markSectionAsRead;

  // Detectar cambios de ruta y marcar como leídas automáticamente
  useEffect(() => {
    const currentPath = location.pathname;
    
    // Verificar si estamos en alguna de las secciones de admin
    for (const [section, path] of Object.entries(SECTION_PATHS)) {
      if (currentPath.startsWith(path)) {
        const sectionKey = section as keyof AdminNotificationCounts;
        // Solo marcar si hay notificaciones no leídas en esa sección
        if (countsRef.current[sectionKey] > 0) {
          markSectionAsReadRef.current(sectionKey);
        }
        break;
      }
    }
  }, [location.pathname]);

  // Cargar notificaciones al montar el componente
  useEffect(() => {
    if (isAuthenticated && roleInfo.isAdmin) {
      fetchNotifications(1, false); // Cargar todas las notificaciones
    }
  }, [isAuthenticated, roleInfo.isAdmin, fetchNotifications]);

  const refetch = useCallback(async () => {
    if (isAuthenticated && roleInfo.isAdmin) {
      await fetchNotifications(1, false);
    }
  }, [isAuthenticated, roleInfo.isAdmin, fetchNotifications]);

  return {
    counts,
    loading,
    error,
    refetch,
    markSectionAsRead,
  };
};