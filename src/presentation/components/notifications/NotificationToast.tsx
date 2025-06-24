// src/presentation/components/notifications/NotificationToast.tsx
import React, { useState, useEffect } from 'react';
import { X, Bell, CheckCircle, AlertCircle, Gift } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import type { Notification } from '../../../core/domain/entities/Notification';

interface NotificationToastProps {
  notification: Notification;
  onClose: () => void;
  autoClose?: boolean;
  autoCloseTime?: number;
}

const NotificationToast: React.FC<NotificationToastProps> = ({
  notification,
  onClose,
  autoClose = true,
  autoCloseTime = 8000
}) => {
  const [visible, setVisible] = useState(true);
  const [progress, setProgress] = useState(100);
  const navigate = useNavigate();

  // Auto-cerrar y barra de progreso
  useEffect(() => {
    if (autoClose && visible) {
      const progressInterval = setInterval(() => {
        setProgress((prev) => {
          const newProgress = prev - (100 / (autoCloseTime / 100));
          if (newProgress <= 0) {
            setVisible(false);
            setTimeout(onClose, 300); // Delay para animación
            return 0;
          }
          return newProgress;
        });
      }, 100);

      return () => clearInterval(progressInterval);
    }
  }, [autoClose, autoCloseTime, visible, onClose]);

  // Obtener icono según tipo de notificación
  const getIcon = () => {
    switch (notification.type) {
      case 'order_status':
      case 'shipping_update':
        return <CheckCircle className="text-green-500" size={20} />;
      case 'low_stock':
      case 'error':
        return <AlertCircle className="text-red-500" size={20} />;
      case 'promotion':
      case 'discount':
        return <Gift className="text-purple-500" size={20} />;
      default:
        return <Bell className="text-blue-500" size={20} />;
    }
  };

  // Obtener colores según tipo
  const getColors = () => {
    switch (notification.type) {
      case 'order_status':
      case 'shipping_update':
        return {
          bg: 'bg-green-50',
          border: 'border-green-200',
          progress: 'bg-green-500'
        };
      case 'low_stock':
      case 'error':
        return {
          bg: 'bg-red-50',
          border: 'border-red-200',
          progress: 'bg-red-500'
        };
      case 'promotion':
      case 'discount':
        return {
          bg: 'bg-purple-50',
          border: 'border-purple-200',
          progress: 'bg-purple-500'
        };
      default:
        return {
          bg: 'bg-blue-50',
          border: 'border-blue-200',
          progress: 'bg-blue-500'
        };
    }
  };

  // Manejar click en la notificación - SIMPLIFICADO
  const handleClick = () => {
    console.log(`🖱️ Click en toast ${notification.id}`);
    
    // Solo navegar a la página de notificaciones
    navigate('/notifications');
    
    // Cerrar toast
    onClose();
  };

  // Cerrar manualmente
  const handleClose = (e: React.MouseEvent) => {
    e.stopPropagation();
    console.log(`❌ Cerrando toast ${notification.id} manualmente`);
    setVisible(false);
    setTimeout(onClose, 300);
  };

  const colors = getColors();

  if (!visible) return null;

  return (
    <div className={`
      notification-toast
      ${visible ? 'animate-slide-in-right' : 'animate-slide-out-right'}
      max-w-sm w-full ${colors.bg} ${colors.border} border rounded-lg shadow-lg cursor-pointer
      transform transition-all duration-300 hover:scale-105 hover:shadow-xl
    `}>
      {/* Barra de progreso */}
      {autoClose && (
        <div className="h-1 bg-gray-200 rounded-t-lg overflow-hidden">
          <div 
            className={`h-full ${colors.progress} transition-all duration-100 ease-linear`}
            style={{ width: `${progress}%` }}
          />
        </div>
      )}

      <div className="p-4" onClick={handleClick}>
        <div className="flex items-start">
          <div className="flex-shrink-0 mr-3 mt-0.5">
            {getIcon()}
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900 mb-1">
                  {notification.title}
                </p>
                <p className="text-xs text-gray-600 line-clamp-2">
                  {notification.message}
                </p>
              </div>
              
              <button
                onClick={handleClose}
                className="ml-2 flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X size={16} />
              </button>
            </div>
            
            {/* Indicador de no leída */}
            {!notification.read && (
              <div className="flex items-center mt-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
                <span className="text-xs text-blue-600 font-medium">Nueva</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Contenedor de toasts SIMPLIFICADO
interface NotificationToastContainerProps {
  notifications: Notification[];
  onRemove: (id: number) => void;
  maxToasts?: number;
}

export const NotificationToastContainer: React.FC<NotificationToastContainerProps> = ({
  notifications,
  onRemove,
  maxToasts = 1 // Reducido a 1 para evitar spam
}) => {
  // Mostrar solo las últimas notificaciones
  const displayNotifications = notifications.slice(0, maxToasts);

  console.log(`📦 NotificationToastContainer: mostrando ${displayNotifications.length} de ${notifications.length} toasts`);

  return (
    <div className="fixed bottom-4 right-4 z-50 space-y-3">
      {displayNotifications.map((notification, index) => (
        <div
          key={notification.id}
          style={{ 
            animationDelay: `${index * 100}ms`,
            zIndex: 50 - index
          }}
        >
          <NotificationToast
            notification={notification}
            onClose={() => {
              console.log(`🔄 NotificationToastContainer: removiendo toast ${notification.id}`);
              if (notification.id) {
                onRemove(notification.id);
              }
            }}
          />
        </div>
      ))}
    </div>
  );
};

export default NotificationToast;