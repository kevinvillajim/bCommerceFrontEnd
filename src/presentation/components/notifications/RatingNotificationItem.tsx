// src/presentation/components/notifications/RatingNotificationItem.tsx
import React, { useState } from 'react';
import { Star, Package, ChevronRight, Clock, Truck } from 'lucide-react';
import RatingModal from '../rating/RatingModal';
import type { Notification } from '../../../core/domain/entities/Notification';
import { formatRelativeTime } from '../../../utils/dateUtils';

interface RatingNotificationItemProps {
  notification: Notification;
  onMarkAsRead: (id: number) => void;
  onRatingSubmitted?: () => void;
}

const RatingNotificationItem: React.FC<RatingNotificationItemProps> = ({
  notification,
  onMarkAsRead,
  onRatingSubmitted
}) => {
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Extraer datos de la notificación
  const data = notification.data || {};
  const orderId = data.order_id;
  const orderNumber = data.order_number;
  const trackingNumber = data.tracking_number;
  const isExpired = data.expires_at && new Date(data.expires_at) < new Date();
  const source = data.source || 'order_completed';
  const isFromShipping = source === 'shipping_delivered';

  const handleOpenRating = () => {
    // Marcar como leída al abrir el modal
    if (!notification.read && notification.id) {
      onMarkAsRead(notification.id);
    }
    setShowRatingModal(true);
  };

  const handleRatingSubmit = async (ratingData: {
    rating: number;
    title?: string;
    comment?: string;
    entityId: number;
    orderId: number;
  }) => {
    try {
      setIsSubmitting(true);
      
      // Aquí llamarías a tu API para enviar la valoración
      // await submitRating(ratingData);
      
      console.log('Rating submitted:', ratingData);
      
      setShowRatingModal(false);
      onRatingSubmitted?.();
      
    } catch (error) {
      console.error('Error submitting rating:', error);
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <div className={`
        relative border-l-4 transition-all duration-200 hover:shadow-md
        ${isFromShipping 
          ? 'border-l-green-500 bg-gradient-to-r from-green-50 to-emerald-50 hover:from-green-100 hover:to-emerald-100' 
          : 'border-l-yellow-500 bg-gradient-to-r from-yellow-50 to-orange-50 hover:from-yellow-100 hover:to-orange-100'
        }
        ${!notification.read ? 'shadow-md' : 'shadow-sm'}
        ${isExpired ? 'opacity-75' : ''}
      `}>
        <div className="p-4">
          <div className="flex items-start justify-between">
            <div className="flex items-start space-x-3 flex-1">
              {/* Icono */}
              <div className={`
                flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center
                ${isFromShipping ? 'bg-green-100' : 'bg-yellow-100'}
              `}>
                {isFromShipping ? (
                  <Truck className="text-green-600" size={20} />
                ) : (
                  <Star className="text-yellow-600" size={20} />
                )}
              </div>

              {/* Contenido */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2 mb-1">
                  <h3 className="text-base font-semibold text-gray-900">
                    {notification.title}
                  </h3>
                  {!notification.read && (
                    <div className={`
                      w-2 h-2 rounded-full
                      ${isFromShipping ? 'bg-green-500' : 'bg-yellow-500'}
                    `}></div>
                  )}
                </div>

                <p className="text-sm text-gray-700 mb-3">
                  {notification.message}
                </p>

                {/* Información de la orden */}
                <div className="flex items-center space-x-4 text-xs text-gray-600 mb-3">
                  {orderId && orderNumber && (
                    <div className="flex items-center">
                      <Package size={12} className="mr-1" />
                      <span>Pedido #{orderNumber}</span>
                    </div>
                  )}
                  
                  {trackingNumber && (
                    <div className="flex items-center">
                      <Truck size={12} className="mr-1" />
                      <span>#{trackingNumber}</span>
                    </div>
                  )}
                  
                  <div className="flex items-center">
                    <Clock size={12} className="mr-1" />
                    <span>{formatRelativeTime(notification.createdAt)}</span>
                  </div>
                </div>

                {/* Estado de expiración */}
                {isExpired && (
                  <div className="text-xs text-orange-600 mb-2 font-medium bg-orange-50 px-2 py-1 rounded">
                    ⏰ Esta solicitud de valoración ha expirado
                  </div>
                )}

                {/* Indicador de fuente */}
                <div className="text-xs text-gray-500">
                  {isFromShipping ? (
                    <span className="inline-flex items-center px-2 py-1 rounded-full bg-green-100 text-green-700">
                      <Truck size={10} className="mr-1" />
                      Entregado
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-2 py-1 rounded-full bg-blue-100 text-blue-700">
                      <Package size={10} className="mr-1" />
                      Completado
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Botón de acción */}
            {!isExpired && (
              <button
                onClick={handleOpenRating}
                disabled={isSubmitting}
                className={`
                  ml-4 px-4 py-2 text-white text-sm font-medium rounded-lg transition-all duration-200 
                  disabled:opacity-50 flex items-center space-x-2 hover:shadow-lg transform hover:scale-105
                  ${isFromShipping 
                    ? 'bg-green-500 hover:bg-green-600' 
                    : 'bg-yellow-500 hover:bg-yellow-600'
                  }
                `}
              >
                <Star size={16} />
                <span>Valorar</span>
                <ChevronRight size={14} />
              </button>
            )}
          </div>

          {/* Información adicional de expiración */}
          {!isExpired && data.expires_at && (
            <div className="mt-3 pt-3 border-t border-gray-200/50">
              <div className="flex items-center justify-between text-xs text-gray-500">
                <span>
                  {isFromShipping ? '📦 Entregado por courier' : '✅ Pedido completado'}
                </span>
                <span>
                  Vence: {new Date(data.expires_at).toLocaleDateString('es-EC', {
                    day: 'numeric',
                    month: 'short'
                  })}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modal de Valoración */}
      {showRatingModal && orderId && (
        <RatingModal
          type="seller" // Puedes ajustar según necesites
          entityId={1} // Aquí necesitarías obtener el ID del vendedor
          entityName={`Pedido #${orderNumber}`}
          orderId={orderId}
          isOpen={showRatingModal}
          onClose={() => setShowRatingModal(false)}
          onSubmit={handleRatingSubmit}
        />
      )}
    </>
  );
};

export default RatingNotificationItem;