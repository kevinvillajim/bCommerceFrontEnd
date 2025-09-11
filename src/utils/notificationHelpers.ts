// src/utils/notificationHelpers.ts
import type { Notification } from '../core/domain/entities/Notification';

// NotificationPage.tsx - Sección a actualizar

/**
 * Obtiene la fecha de creación normalizada de una notificación
 * Intenta usar createdAt primero, luego created_at como fallback
 */
export const getNotificationCreatedAt = (notification: Notification): string => {
  return notification.createdAt || notification.created_at || '';
};

/**
 * Obtiene la fecha de lectura normalizada de una notificación
 * Intenta usar readAt primero, luego read_at como fallback
 */
export const getNotificationReadAt = (notification: Notification): string | null => {
  return notification.readAt || notification.read_at || null;
};

/**
 * Normaliza una notificación convirtiendo snake_case a camelCase
 * Esta función asegura que las fechas estén en el formato correcto
 */
export const normalizeNotification = (notification: any): Notification => {
  return {
    ...notification,
    createdAt: notification.createdAt || notification.created_at || '',
    readAt: notification.readAt || notification.read_at || undefined,
    // Mantener los campos originales para compatibilidad
    created_at: notification.created_at,
    read_at: notification.read_at
  };
};

/**
 * Normaliza un array de notificaciones
 */
export const normalizeNotifications = (notifications: any[]): Notification[] => {
  return notifications.map(normalizeNotification);
};

/**
 * Función mejorada para formatear tiempo relativo
 * Maneja tanto createdAt como created_at
 */
export const formatRelativeTime = (dateString: string): string => {
  // ✅ Validación básica
  if (!dateString || dateString.trim() === '') {
    console.warn('⚠️ formatRelativeTime: fecha vacía o undefined');
    return 'Fecha desconocida';
  }

  try {
    // ✅ Crear fecha directamente desde ISO string
    const date = new Date(dateString);
    
    // ✅ Verificar que la fecha es válida
    if (isNaN(date.getTime())) {
      console.error('❌ formatRelativeTime: fecha inválida:', dateString);
      return 'Fecha inválida';
    }

    // ✅ Calcular diferencia
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffSeconds = Math.floor(diffMs / 1000);
    const diffMinutes = Math.floor(diffSeconds / 60);
    const diffHours = Math.floor(diffMinutes / 60);
    const diffDays = Math.floor(diffHours / 24);

    // ✅ Lógica de formateo
    if (diffSeconds < 0) {
      // Fecha en el futuro
      return date.toLocaleDateString('es-EC', { 
        month: 'short', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    }
    
    if (diffSeconds < 60) {
      return 'Ahora mismo';
    }
    
    if (diffMinutes < 60) {
      return `${diffMinutes} ${diffMinutes === 1 ? 'minuto' : 'minutos'}`;
    }
    
    if (diffHours < 24) {
      return `${diffHours} ${diffHours === 1 ? 'hora' : 'horas'}`;
    }
    
    if (diffDays < 7) {
      return `${diffDays} ${diffDays === 1 ? 'día' : 'días'}`;
    }
    
    // Para fechas más antiguas, mostrar fecha absoluta
    const currentYear = now.getFullYear();
    const dateYear = date.getFullYear();
    
    return date.toLocaleDateString('es-EC', {
      day: 'numeric',
      month: 'short',
      ...(dateYear !== currentYear && { year: 'numeric' })
    });

  } catch (error) {
    console.error('💥 Error en formatRelativeTime:', error, 'Input:', dateString);
    return 'Error en fecha';
  }
};