// src/presentation/pages/NotificationPage.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
  MoreVertical
} from 'lucide-react';
import { useNotifications } from '../hooks/useNotifications';
import { useAuth } from '../hooks/useAuth';
import type { Notification } from '../../core/domain/entities/Notification';

// Función para obtener el icono según el tipo de notificación
const getNotificationIcon = (type: string) => {
  switch (type) {
    case 'new_message':
      return <MessageCircle className="text-blue-500" size={20} />;
    case 'order_status':
      return <Package className="text-green-500" size={20} />;
    case 'shipping_update':
      return <Truck className="text-purple-500" size={20} />;
    case 'product_update':
      return <TrendingUp className="text-orange-500" size={20} />;
    case 'rating_received':
    case 'seller_rated':
      return <Star className="text-yellow-500" size={20} />;
    case 'new_order':
      return <ShoppingCart className="text-green-600" size={20} />;
    case 'low_stock':
      return <AlertTriangle className="text-red-500" size={20} />;
    case 'feedback_response':
      return <FileText className="text-indigo-500" size={20} />;
    case 'promotion':
    case 'discount':
      return <Gift className="text-pink-500" size={20} />;
    default:
      return <Bell className="text-gray-500" size={20} />;
  }
};

// Función para obtener el color de fondo según el tipo
const getNotificationColor = (type: string) => {
  switch (type) {
    case 'new_message':
      return 'bg-blue-50 border-blue-200';
    case 'order_status':
      return 'bg-green-50 border-green-200';
    case 'shipping_update':
      return 'bg-purple-50 border-purple-200';
    case 'product_update':
      return 'bg-orange-50 border-orange-200';
    case 'rating_received':
    case 'seller_rated':
      return 'bg-yellow-50 border-yellow-200';
    case 'new_order':
      return 'bg-emerald-50 border-emerald-200';
    case 'low_stock':
      return 'bg-red-50 border-red-200';
    case 'feedback_response':
      return 'bg-indigo-50 border-indigo-200';
    case 'promotion':
    case 'discount':
      return 'bg-pink-50 border-pink-200';
    default:
      return 'bg-gray-50 border-gray-200';
  }
};

// Función mejorada para formatear tiempo relativo
const formatRelativeTime = (dateString: string): string => {
  // ✅ Validación básica
  if (!dateString) {
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

    // 🐛 DEBUG: Agregar logging temporal (puedes quitarlo después)
    console.log('🔍 formatRelativeTime debug:', {
      input: dateString,
      parsed: date.toISOString(),
      now: now.toISOString(),
      diffSeconds,
      diffMinutes,
      diffHours,
      diffDays
    });

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

// Componente para mostrar el menú de acciones de notificación
interface NotificationActionsProps {
  notification: Notification;
  onMarkAsRead: (id: number) => void;
  onDelete: (id: number) => void;
  isOpen: boolean;
  onToggle: () => void;
}

const NotificationActions: React.FC<NotificationActionsProps> = ({
  notification,
  onMarkAsRead,
  onDelete,
  isOpen,
  onToggle
}) => {
  return (
    <div className="relative">
      <button
        onClick={(e) => {
          e.stopPropagation();
          onToggle();
        }}
        className="p-1 rounded-full hover:bg-gray-200 transition-colors"
      >
        <MoreVertical size={16} className="text-gray-500" />
      </button>
      
      {isOpen && (
        <div className="absolute right-0 top-8 bg-white rounded-lg shadow-lg border z-10 min-w-[150px]">
          {!notification.read && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onMarkAsRead(notification.id!);
                onToggle();
              }}
              className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center"
            >
              <Check size={14} className="mr-2" />
              Marcar como leída
            </button>
          )}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete(notification.id!);
              onToggle();
            }}
            className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center"
          >
            <Trash2 size={14} className="mr-2" />
            Eliminar
          </button>
        </div>
      )}
    </div>
  );
};

const NotificationPage: React.FC = () => {
  const [filter, setFilter] = useState<'all' | 'unread'>('all');
  const [activeMenu, setActiveMenu] = useState<number | null>(null);
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  
  const {
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
    getNotificationUrl
  } = useNotifications();

  // Redirigir si no está autenticado
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: '/notifications' } });
    }
  }, [isAuthenticated, navigate]);

  // Cargar notificaciones iniciales
  useEffect(() => {
    if (isAuthenticated) {
      fetchNotifications(1, filter === 'unread');
    }
  }, [isAuthenticated, filter]);

  useEffect(() => {
    if (notifications.length > 0) {
      console.log('📊 Notificaciones recibidas:', notifications.slice(0, 2));
    }
  }, [notifications]);

  // Manejar click en notificación
  const handleNotificationClick = async (notification: Notification) => {
    // Cerrar menú de acciones si está abierto
    setActiveMenu(null);
    
    // Marcar como leída si no lo está
    if (!notification.read) {
      await markAsRead(notification.id!);
    }
    
    // Navegar a la URL correspondiente
    const url = getNotificationUrl(notification);
    if (url) {
      navigate(url);
    }
  };

  // Manejar eliminación de notificación
  const handleDelete = async (id: number) => {
    await deleteNotification(id);
  };

  // Manejar marcar como leída
  const handleMarkAsRead = async (id: number) => {
    await markAsRead(id);
  };

  // Manejar marcar todas como leídas
  const handleMarkAllAsRead = async () => {
    await markAllAsRead();
  };

  // Cargar más notificaciones
  const loadMore = () => {
    if (hasMore && !loading) {
      fetchNotifications(currentPage + 1, filter === 'unread');
    }
  };

  // Cambiar filtro
  const handleFilterChange = (newFilter: 'all' | 'unread') => {
    setFilter(newFilter);
    setActiveMenu(null);
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="container mx-auto px-4 lg:px-8 py-10 max-w-4xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Notificaciones</h1>
          <p className="text-gray-600 mt-1">
            {totalNotifications > 0 && (
              <>
                {totalNotifications} {totalNotifications === 1 ? 'notificación' : 'notificaciones'}
                {unreadCount > 0 && (
                  <span className="text-primary-600 font-medium">
                    , {unreadCount} sin leer
                  </span>
                )}
              </>
            )}
          </p>
        </div>

        <div className="flex items-center space-x-3">
          {/* Filtros */}
          <div className="flex items-center space-x-2 bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => handleFilterChange('all')}
              className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                filter === 'all'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Todas
            </button>
            <button
              onClick={() => handleFilterChange('unread')}
              className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors relative ${
                filter === 'unread'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              No leídas
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {unreadCount > 99 ? '99' : unreadCount}
                </span>
              )}
            </button>
          </div>

          {/* Marcar todas como leídas */}
          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllAsRead}
              disabled={loading}
              className="px-4 py-2 bg-primary-600 text-white text-sm font-medium rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 flex items-center"
            >
              <CheckCheck size={16} className="mr-2" />
              Marcar todas
            </button>
          )}
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
          {error}
          <button 
            className="ml-2 underline" 
            onClick={() => fetchNotifications(1, filter === 'unread')}
          >
            Reintentar
          </button>
        </div>
      )}

      {/* Loading inicial */}
      {loading && notifications.length === 0 ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
        </div>
      ) : notifications.length === 0 ? (
        /* Estado vacío */
        <div className="text-center py-20 bg-gradient-to-b from-gray-50 to-white rounded-xl shadow-md">
          <Bell className="mx-auto h-16 w-16 text-gray-300 mb-6" />
          <h2 className="text-2xl font-semibold text-gray-700 mb-3">
            {filter === 'unread' ? 'No tienes notificaciones sin leer' : 'No tienes notificaciones'}
          </h2>
          <p className="text-gray-500 mb-8 max-w-md mx-auto">
            {filter === 'unread' 
              ? 'Todas tus notificaciones están al día. Te avisaremos cuando tengas algo nuevo.'
              : 'Cuando tengas actualizaciones importantes, aparecerán aquí.'
            }
          </p>
          {filter === 'unread' && (
            <button
              onClick={() => handleFilterChange('all')}
              className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-primary-600 hover:bg-primary-700 shadow-sm hover:shadow transition-all"
            >
              Ver todas las notificaciones
            </button>
          )}
        </div>
      ) : (
        /* Lista de notificaciones */
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          {notifications.map((notification, index) => (
            <div
              key={notification.id}
              onClick={() => handleNotificationClick(notification)}
              className={`
                relative border-l-4 cursor-pointer transition-all duration-200 hover:shadow-sm
                ${!notification.read 
                  ? 'bg-blue-50 border-l-primary-500 hover:bg-blue-100' 
                  : 'bg-white border-l-gray-200 hover:bg-gray-50'
                }
                ${index !== notifications.length - 1 ? 'border-b border-gray-100' : ''}
              `}
            >
              <div className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4 flex-1">
                    {/* Icono */}
                    <div className={`
                      flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center
                      ${getNotificationColor(notification.type)}
                    `}>
                      {getNotificationIcon(notification.type)}
                    </div>

                    {/* Contenido */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-1">
                        <h3 className={`text-base font-medium ${
                          !notification.read ? 'text-gray-900' : 'text-gray-700'
                        }`}>
                          {notification.title}
                        </h3>
                        {!notification.read && (
                          <div className="w-2 h-2 bg-primary-500 rounded-full"></div>
                        )}
                      </div>
                      
                      <p className={`text-sm ${
                        !notification.read ? 'text-gray-700' : 'text-gray-600'
                      } mb-2`}>
                        {notification.message}
                      </p>
                      
                      <div className="flex items-center text-xs text-gray-500">
                      <span>{(() => {
  console.log('🔍 Debug notificación:', {
    id: notification.id,
  createdAt: notification.createdAt,
  created_at: notification.created_at, // ← AGREGAR ESTA LÍNEA
  readAt: notification.readAt,
  read_at: notification.read_at, // ← AGREGAR ESTA LÍNEA
  notification: notification
  });
  
  if (!notification.createdAt) {
    return 'Sin fecha';
  }
  
  return formatRelativeTime(notification.createdAt);
})()}</span>
                        {notification.readAt && (
                          <span className="ml-2 flex items-center">
                            <Check size={12} className="mr-1" />
                            Leída el {<span>Leída el {(() => {
  if (!notification.readAt) {
    return 'nunca';
  }
  return formatRelativeTime(notification.readAt);
})()}</span>}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Menú de acciones */}
                  <NotificationActions
                    notification={notification}
                    onMarkAsRead={handleMarkAsRead}
                    onDelete={handleDelete}
                    isOpen={activeMenu === notification.id}
                    onToggle={() => setActiveMenu(
                      activeMenu === notification.id ? null : notification.id!
                    )}
                  />
                </div>
              </div>
            </div>
          ))}

          {/* Botón cargar más */}
          {hasMore && (
            <div className="p-6 bg-gray-50 border-t">
              <button
                onClick={loadMore}
                disabled={loading}
                className="w-full px-4 py-3 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 font-medium"
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-gray-400 mr-2"></div>
                    Cargando...
                  </div>
                ) : (
                  'Cargar más notificaciones'
                )}
              </button>
            </div>
          )}
        </div>
      )}

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

export default NotificationPage;