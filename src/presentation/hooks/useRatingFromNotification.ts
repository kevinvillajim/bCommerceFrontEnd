// src/presentation/hooks/useRatingFromNotification.ts - CORREGIDO
import { useState, useCallback } from 'react';
import ApiClient from '../../infrastructure/api/apiClient';
import { API_ENDPOINTS } from '../../constants/apiEndpoints';

// ✅ NUEVA INTERFACE AGREGADA para tipear responses
interface ApiResponse<T = any> {
  status: string;
  data: T;
  message?: string;
}

interface RatingSubmissionData {
  rating: number;
  title?: string;
  comment?: string;
  entityId: number;
  orderId: number;
}

interface UseRatingFromNotificationReturn {
  isSubmitting: boolean;
  error: string | null;
  submitProductRating: (data: RatingSubmissionData) => Promise<void>;
  submitSellerRating: (data: RatingSubmissionData) => Promise<void>;
  submitOrderRating: (data: Omit<RatingSubmissionData, 'entityId'>) => Promise<void>;
  clearError: () => void;
}

/**
 * Hook para manejar valoraciones desde notificaciones
 * Funciona con el sistema de rating existente
 */
export const useRatingFromNotification = (): UseRatingFromNotificationReturn => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const submitProductRating = useCallback(async (data: RatingSubmissionData) => {
    try {
      setIsSubmitting(true);
      setError(null);

      // ✅ CORREGIDO: Tipear response como ApiResponse
      const response: ApiResponse = await ApiClient.post(API_ENDPOINTS.RATINGS.RATE_PRODUCT, {
        product_id: data.entityId,
        order_id: data.orderId,
        rating: data.rating,
        title: data.title,
        comment: data.comment
      });

      if (response.status !== 'success') {
        throw new Error(response.message || 'Error al enviar valoración del producto');
      }

      console.log('✅ Valoración de producto enviada exitosamente');
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al enviar valoración del producto';
      setError(errorMessage);
      console.error('❌ Error enviando valoración de producto:', err);
      throw err;
    } finally {
      setIsSubmitting(false);
    }
  }, []);

  const submitSellerRating = useCallback(async (data: RatingSubmissionData) => {
    try {
      setIsSubmitting(true);
      setError(null);

      // ✅ CORREGIDO: Tipear response como ApiResponse
      const response: ApiResponse = await ApiClient.post(API_ENDPOINTS.RATINGS.RATE_SELLER, {
        seller_id: data.entityId,
        order_id: data.orderId,
        rating: data.rating,
        title: data.title,
        comment: data.comment
      });

      if (response.status !== 'success') {
        throw new Error(response.message || 'Error al enviar valoración del vendedor');
      }

      console.log('✅ Valoración de vendedor enviada exitosamente');
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al enviar valoración del vendedor';
      setError(errorMessage);
      console.error('❌ Error enviando valoración de vendedor:', err);
      throw err;
    } finally {
      setIsSubmitting(false);
    }
  }, []);

  // Método para valorar directamente por orden (obtiene vendedor automáticamente)
  const submitOrderRating = useCallback(async (data: Omit<RatingSubmissionData, 'entityId'>) => {
    try {
      setIsSubmitting(true);
      setError(null);

      // ✅ CORREGIDO: Tipear orderResponse como ApiResponse
      const orderResponse: ApiResponse = await ApiClient.get(`/orders/${data.orderId}`);
      
      if (orderResponse.status !== 'success') {
        throw new Error('No se pudo obtener información de la orden');
      }

      const sellerId = orderResponse.data.seller_id;
      if (!sellerId) {
        throw new Error('No se encontró el vendedor para esta orden');
      }

      // Enviar valoración del vendedor
      await submitSellerRating({
        ...data,
        entityId: sellerId
      });

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al procesar la valoración';
      setError(errorMessage);
      console.error('❌ Error procesando valoración de orden:', err);
      throw err;
    } finally {
      setIsSubmitting(false);
    }
  }, [submitSellerRating]);

  return {
    isSubmitting,
    error,
    submitProductRating,
    submitSellerRating,
    submitOrderRating,
    clearError
  };
};