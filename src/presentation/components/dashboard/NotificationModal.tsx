import React, { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import {
  Bell,
  Check,
  CheckCheck,
  Trash2,
  Package,
  ShoppingCart,
  MessageCircle,
  Star,
  TrendingUp,
  AlertTriangle,
  Gift,
  Truck,
  FileText,
  MoreVertical,
  Shield,
  Ban,
  X,
} from "lucide-react";
import { useNotifications } from "../../hooks/useNotifications";
import { useAuth } from "../../hooks/useAuth";
import type { Notification } from "../../../core/domain/entities/Notification";
import { formatRelativeTime } from "../../../utils/dateUtils";

interface NotificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  isAdmin?: boolean;
}

// Función para obtener el icono según el tipo de notificación
const getNotificationIcon = (type: string) => {
  switch (type) {
    case "new_message":
      return <MessageCircle className="text-blue-500" size={16} />;
    case "order_status":
      return <Package className="text-green-500" size={16} />;
    case "shipping_update":
      return <Truck className="text-purple-500" size={16} />;
    case "product_update":
      return <TrendingUp className="text-orange-500" size={16} />;
    case "rating_received":
    case "seller_rated":
      return <Star className="text-yellow-500" size={16} />;
    case "new_order":
      return <ShoppingCart className="text-green-600" size={16} />;
    case "low_stock":
      return <AlertTriangle className="text-red-500" size={16} />;
    case "feedback_response":
      return <FileText className="text-indigo-500" size={16} />;
    case "promotion":
    case "discount":
      return <Gift className="text-pink-500" size={16} />;
    case "seller_strike":
      return <Shield className="text-orange-500" size={16} />;
    case "account_blocked":
      return <Ban className="text-red-500" size={16} />;
    default:
      return <Bell className="text-gray-500" size={16} />;
  }
};

// Función para obtener URL de notificación según el rol
const getNotificationUrl = (notification: Notification, isSeller: boolean): string | null => {
  const { type, data } = notification;

  switch (type) {
    case "new_message":
      if (data.chat_id) {
        return isSeller ? `/seller/messages/${data.chat_id}` : `/chats/${data.chat_id}`;
      }
      return isSeller ? "/seller/messages" : "/chats";

    case "order_status":
      if (data.order_id) {
        return isSeller ? `/seller/orders/${data.order_id}` : `/orders/${data.order_id}`;
      }
      return isSeller ? "/seller/orders" : "/orders";

    case "shipping_update":
      if (data.tracking_number) {
        return `/tracking/${data.tracking_number}`;
      } else if (data.order_id) {
        return isSeller ? `/seller/orders/${data.order_id}` : `/orders/${data.order_id}`;
      }
      return null;

    case "rating_received":
    case "seller_rated":
      if (data.rating_id) {
        return `/ratings/${data.rating_id}`;
      }
      return isSeller ? "/seller/ratings" : "/profile";

    case "new_order":
      if (data.order_id) {
        return isSeller ? `/seller/orders/${data.order_id}` : null;
      }
      return isSeller ? "/seller/orders" : null;

    default:
      return null;
  }
};

const NotificationModal: React.FC<NotificationModalProps> = ({
  isOpen,
  onClose,
  isAdmin = false,
}) => {
  const [activeMenu, setActiveMenu] = useState<number | null>(null);
  const { roleInfo } = useAuth();

  const {
    notifications,
    loading,
    error,
    unreadCount,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
  } = useNotifications();

  // Fetch notificaciones cuando se abre el modal
  useEffect(() => {
    if (isOpen) {
      fetchNotifications(1, false); // Cargar primera página, todas las notificaciones
    }
  }, [isOpen, fetchNotifications]);

  // Manejar click en notificación
  const handleNotificationClick = useCallback(
    async (notification: Notification) => {
      setActiveMenu(null);

      // Marcar como leída si no lo está
      if (!notification.read) {
        await markAsRead(notification.id!);
      }

      // Cerrar modal
      onClose();

      // Obtener URL de destino y navegar
      const url = getNotificationUrl(notification, roleInfo.isSeller);
      if (url) {
        window.location.href = url;
      }
    },
    [markAsRead, onClose, roleInfo.isSeller]
  );

  // Manejar marcar todas como leídas
  const handleMarkAllAsRead = useCallback(async () => {
    await markAllAsRead();
  }, [markAllAsRead]);

  // Manejar eliminación
  const handleDelete = useCallback(
    async (id: number) => {
      await deleteNotification(id);
      setActiveMenu(null);
    },
    [deleteNotification]
  );

  // Manejar marcar como leída individual
  const handleMarkAsRead = useCallback(
    async (id: number) => {
      await markAsRead(id);
      setActiveMenu(null);
    },
    [markAsRead]
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative flex items-start justify-center min-h-screen px-4 pt-16 pb-20">
        <div className="relative bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[80vh] flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Notificaciones</h2>
              {unreadCount > 0 && (
                <p className="text-sm text-gray-600 mt-1">
                  {unreadCount} sin leer
                </p>
              )}
            </div>
            
            <div className="flex items-center space-x-3">
              {/* 🔧 MEJORADO: Botón marcar todas como leídas más visible */}
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllAsRead}
                  disabled={loading}
                  className="px-4 py-2 bg-primary-100 text-primary-700 hover:bg-primary-200 disabled:opacity-50 flex items-center rounded-lg transition-all duration-200 text-sm font-medium border border-primary-200 hover:border-primary-300"
                  title={`Marcar ${unreadCount} notificación${unreadCount > 1 ? 'es' : ''} como leída${unreadCount > 1 ? 's' : ''}`}
                >
                  <CheckCheck size={16} className="mr-2" />
                  Marcar todas ({unreadCount})
                </button>
              )}
              
              {/* Cerrar */}
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                title="Cerrar notificaciones"
              >
                <X size={20} className="text-gray-500" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto">
            {loading && notifications.length === 0 ? (
              <div className="flex justify-center items-center h-32">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary-600"></div>
              </div>
            ) : error ? (
              <div className="p-6 text-center text-red-600">
                <p>{error}</p>
                <button
                  onClick={() => fetchNotifications(1, false)}
                  className="mt-2 text-sm underline"
                >
                  Reintentar
                </button>
              </div>
            ) : notifications.length === 0 ? (
              <div className="p-8 text-center">
                <Bell className="mx-auto h-12 w-12 text-gray-300 mb-4" />
                <h3 className="text-lg font-medium text-gray-700 mb-2">
                  No tienes notificaciones
                </h3>
                <p className="text-gray-500">
                  Cuando tengas actualizaciones importantes, aparecerán aquí.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {notifications.slice(0, 10).map((notification) => (
                  <div
                    key={notification.id}
                    onClick={() => handleNotificationClick(notification)}
                    className={`p-4 hover:bg-gray-50 cursor-pointer transition-colors ${
                      !notification.read ? "bg-primary-50" : "bg-white"
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-3 flex-1">
                        {/* Icono */}
                        <div className="flex-shrink-0 mt-1">
                          {getNotificationIcon(notification.type)}
                        </div>

                        {/* Contenido */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2 mb-1">
                            <h4 className={`text-sm font-medium ${
                              !notification.read ? "text-gray-900" : "text-gray-700"
                            }`}>
                              {notification.title}
                            </h4>
                            {!notification.read && (
                              <div className="w-1.5 h-1.5 bg-primary-500 rounded-full"></div>
                            )}
                          </div>

                          <p className="text-sm text-gray-600 mb-1">
                            {notification.message}
                          </p>

                          <p className="text-xs text-gray-400">
                            {formatRelativeTime(notification.createdAt)}
                          </p>
                        </div>
                      </div>

                      {/* Menú de acciones */}
                      <div className="relative">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveMenu(
                              activeMenu === notification.id ? null : notification.id!
                            );
                          }}
                          className="p-1 rounded-full hover:bg-gray-200 transition-colors"
                        >
                          <MoreVertical size={14} className="text-gray-500" />
                        </button>

                        {activeMenu === notification.id && (
                          <div className="absolute right-0 top-8 bg-white rounded-lg shadow-lg border border-gray-200 z-10 min-w-[140px]">
                            {!notification.read && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleMarkAsRead(notification.id!);
                                }}
                                className="w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center"
                              >
                                <Check size={12} className="mr-2" />
                                Marcar como leída
                              </button>
                            )}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDelete(notification.id!);
                              }}
                              className="w-full px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center"
                            >
                              <Trash2 size={12} className="mr-2" />
                              Eliminar
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-gray-200 bg-gray-50">
            <Link
              to={isAdmin ? "/admin/notifications" : "/seller/notifications"}
              onClick={onClose}
              className="block w-full text-center py-2 px-4 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors text-sm font-medium"
            >
              Ver todas las notificaciones
            </Link>
          </div>
        </div>
      </div>

      {/* Click outside para cerrar menús */}
      {activeMenu !== null && (
        <div
          className="fixed inset-0 z-0"
          onClick={() => setActiveMenu(null)}
        />
      )}
    </div>
  );
};

export default NotificationModal;
