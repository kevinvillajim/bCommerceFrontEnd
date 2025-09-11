// src/presentation/components/notifications/ChatFilterToast.tsx
import React, { useState, useEffect } from 'react';
import { X, AlertTriangle, Shield, Ban } from 'lucide-react';

interface ChatFilterToastProps {
  isVisible: boolean;
  onClose: () => void;
  type: 'user_warning' | 'seller_strike' | 'seller_blocked';
  message: string;
  censoredContent?: string;
  strikeCount?: number;
  autoClose?: boolean;
  autoCloseTime?: number;
}

const ChatFilterToast: React.FC<ChatFilterToastProps> = ({
  isVisible,
  onClose,
  type,
  message,
  censoredContent,
  strikeCount,
  autoClose = true,
  autoCloseTime = 8000
}) => {
  const [progress, setProgress] = useState(100);

  // Auto-cerrar y barra de progreso
  useEffect(() => {
    if (autoClose && isVisible) {
      const progressInterval = setInterval(() => {
        setProgress((prev) => {
          const newProgress = prev - (100 / (autoCloseTime / 100));
          if (newProgress <= 0) {
            onClose();
            return 0;
          }
          return newProgress;
        });
      }, 100);

      return () => clearInterval(progressInterval);
    }
  }, [autoClose, autoCloseTime, isVisible, onClose]);

  // Obtener configuración según el tipo
  const getToastConfig = () => {
    switch (type) {
      case 'user_warning':
        return {
          icon: <AlertTriangle className="text-yellow-500" size={24} />,
          bgColor: 'bg-yellow-50',
          borderColor: 'border-yellow-200',
          titleColor: 'text-yellow-800',
          textColor: 'text-yellow-700',
          progressColor: 'bg-yellow-500',
          title: 'Mensaje no permitido'
        };
      case 'seller_strike':
        return {
          icon: <Shield className="text-orange-500" size={24} />,
          bgColor: 'bg-orange-50',
          borderColor: 'border-orange-200',
          titleColor: 'text-orange-800',
          textColor: 'text-orange-700',
          progressColor: 'bg-orange-500',
          title: 'Strike aplicado'
        };
      case 'seller_blocked':
        return {
          icon: <Ban className="text-red-500" size={24} />,
          bgColor: 'bg-red-50',
          borderColor: 'border-red-200',
          titleColor: 'text-red-800',
          textColor: 'text-red-700',
          progressColor: 'bg-red-500',
          title: 'Cuenta bloqueada'
        };
      default:
        return {
          icon: <AlertTriangle className="text-gray-500" size={24} />,
          bgColor: 'bg-gray-50',
          borderColor: 'border-gray-200',
          titleColor: 'text-gray-800',
          textColor: 'text-gray-700',
          progressColor: 'bg-gray-500',
          title: 'Notificación'
        };
    }
  };

  if (!isVisible) return null;

  const config = getToastConfig();

  return (
    <div className="fixed top-4 right-4 z-50 max-w-sm w-full">
      <div className={`
        ${config.bgColor} ${config.borderColor} border rounded-lg shadow-lg
        transform transition-all duration-300 animate-slide-in-right
      `}>
        {/* Barra de progreso */}
        {autoClose && (
          <div className="h-1 bg-gray-200 rounded-t-lg overflow-hidden">
            <div 
              className={`h-full ${config.progressColor} transition-all duration-100 ease-linear`}
              style={{ width: `${progress}%` }}
            />
          </div>
        )}

        <div className="p-4">
          <div className="flex items-start">
            <div className="flex-shrink-0 mr-3">
              {config.icon}
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h4 className={`text-sm font-medium ${config.titleColor} mb-1`}>
                    {config.title}
                  </h4>
                  <p className={`text-sm ${config.textColor} mb-2`}>
                    {message}
                  </p>
                  
                  {/* Mostrar contenido censurado si existe */}
                  {censoredContent && (
                    <div className="mt-2 p-2 bg-white bg-opacity-50 rounded border">
                      <p className="text-xs text-gray-600 mb-1">Mensaje filtrado:</p>
                      <p className="text-sm font-mono text-gray-800">{censoredContent}</p>
                    </div>
                  )}
                  
                  {/* Mostrar contador de strikes */}
                  {typeof strikeCount === 'number' && strikeCount > 0 && (
                    <div className="mt-2">
                      <div className="flex items-center space-x-2">
                        <div className="flex space-x-1">
                          {[1, 2, 3].map((strike) => (
                            <div
                              key={strike}
                              className={`w-3 h-3 rounded-full ${
                                strike <= strikeCount 
                                  ? 'bg-red-500' 
                                  : 'bg-gray-300'
                              }`}
                            />
                          ))}
                        </div>
                        <span className="text-xs text-gray-600">
                          {strikeCount}/3 strikes
                        </span>
                      </div>
                      {strikeCount >= 3 && (
                        <p className="text-xs text-red-600 mt-1 font-medium">
                          Tu cuenta ha sido bloqueada por acumular 3 strikes.
                        </p>
                      )}
                    </div>
                  )}
                </div>
                
                <button
                  onClick={onClose}
                  className="ml-2 flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X size={16} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Hook para manejar notificaciones de filtro de chat
export const useChatFilterNotifications = () => {
  const [notification, setNotification] = useState<{
    isVisible: boolean;
    type: 'user_warning' | 'seller_strike' | 'seller_blocked';
    message: string;
    censoredContent?: string;
    strikeCount?: number;
  } | null>(null);

  const showNotification = (
    type: 'user_warning' | 'seller_strike' | 'seller_blocked',
    message: string,
    censoredContent?: string,
    strikeCount?: number
  ) => {
    setNotification({
      isVisible: true,
      type,
      message,
      censoredContent,
      strikeCount
    });
  };

  const hideNotification = () => {
    setNotification(prev => prev ? { ...prev, isVisible: false } : null);
    // Limpiar completamente después de la animación
    setTimeout(() => setNotification(null), 300);
  };

  const showUserWarning = (message: string, censoredContent?: string) => {
    showNotification('user_warning', message, censoredContent);
  };

  const showSellerStrike = (message: string, strikeCount: number, censoredContent?: string) => {
    showNotification('seller_strike', message, censoredContent, strikeCount);
  };

  const showSellerBlocked = (message: string) => {
    showNotification('seller_blocked', message);
  };

  const NotificationComponent = () => {
    if (!notification) return null;

    return (
      <ChatFilterToast
        isVisible={notification.isVisible}
        onClose={hideNotification}
        type={notification.type}
        message={notification.message}
        censoredContent={notification.censoredContent}
        strikeCount={notification.strikeCount}
      />
    );
  };

  return {
    showUserWarning,
    showSellerStrike,
    showSellerBlocked,
    hideNotification,
    NotificationComponent
  };
};

export default ChatFilterToast;