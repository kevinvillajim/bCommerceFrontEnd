import { useState, useEffect } from 'react';
import SellerOrderServiceAdapter from '../../core/adapters/SellerOrderServiceAdapter';

interface OrderDetail {
  id: number;
  orderNumber: string;
  orderDate: string;
  status: string;
  total: number;
  items: Array<{
    id: number;
    product_id: number;
    product_name: string;
    quantity: number;
    price: number;
    subtotal: number;
    product_image?: string;
  }>;
  customer: {
    id: number;
    name: string;
    email: string;
  };
  payment: {
    method: string;
    status: string;
    payment_id?: string;
  };
  shipping?: {
    id: number;
    tracking_number?: string;
    status: string;
    carrier_name?: string;
    estimated_delivery?: string;
  };
  shippingAddress: string;
}

export const useSellerOrderDetail = (orderId: string | number) => {
  const [orderDetail, setOrderDetail] = useState<OrderDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const orderAdapter = new SellerOrderServiceAdapter();

  useEffect(() => {
    const fetchOrderDetail = async () => {
      if (!orderId) {
        setError('ID de orden no válido');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        
        console.log(`useSellerOrderDetail: Obteniendo orden ${orderId}`);
        
        // Usar el adaptador corregido
        const data = await orderAdapter.getOrderDetails(orderId);
        
        console.log('useSellerOrderDetail: Datos recibidos:', data);
        
        setOrderDetail(data);
      } catch (err) {
        console.error('useSellerOrderDetail: Error al obtener orden:', err);
        setError(err instanceof Error ? err.message : 'Error al cargar la orden');
      } finally {
        setLoading(false);
      }
    };

    fetchOrderDetail();
  }, [orderId]);

  const updateOrderStatus = async (newStatus: string) => {
    if (!orderId) return false;
    
    try {
      const success = await orderAdapter.updateOrderStatus(String(orderId), newStatus as any);
      
      if (success && orderDetail) {
        // Actualizar el estado local
        setOrderDetail({
          ...orderDetail,
          status: newStatus
        });
      }
      
      return success;
    } catch (error) {
      console.error('Error al actualizar estado:', error);
      return false;
    }
  };

  const updateShippingInfo = async (shippingInfo: {
    tracking_number?: string;
    shipping_company?: string;
    estimated_delivery?: string;
    notes?: string;
  }) => {
    if (!orderId) return false;
    
    try {
      const success = await orderAdapter.updateShippingInfo(orderId, shippingInfo);
      
      // Si es exitoso, recargar los datos
      if (success) {
        const updatedData = await orderAdapter.getOrderDetails(orderId);
        setOrderDetail(updatedData);
      }
      
      return success;
    } catch (error) {
      console.error('Error al actualizar envío:', error);
      return false;
    }
  };

  return {
    orderDetail,
    loading,
    error,
    updateOrderStatus,
    updateShippingInfo,
    refetch: () => {
      if (orderId) {
        setLoading(true);
        orderAdapter.getOrderDetails(orderId)
          .then(setOrderDetail)
          .catch((err) => setError(err.message))
          .finally(() => setLoading(false));
      }
    }
  };
};