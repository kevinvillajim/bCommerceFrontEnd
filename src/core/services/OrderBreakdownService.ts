/**
 * Servicio para obtener el desglose detallado de items de una orden
 */
import ApiClient from '../../infrastructure/api/apiClient';

export interface ItemBreakdownStep {
  step: number;
  label: string;
  price_per_unit: number;
  percentage: number;
  is_discount: boolean;
}

export interface OrderItemBreakdown {
  id: number;
  product_id: number;
  product_name: string;
  product_image: string | null;
  quantity: number;
  original_price_per_unit: number;
  final_price_per_unit: number;
  subtotal: number;
  total_savings: number;
  breakdown_steps: ItemBreakdownStep[];
  has_seller_discount: boolean;
  has_volume_discount: boolean;
  has_coupon_discount: boolean;
}

export interface OrderBreakdownResponse {
  order_id: number;
  items: OrderItemBreakdown[];
  has_coupon: boolean;
  coupon_percentage: number;
}

class OrderBreakdownService {
  private static instance: OrderBreakdownService;

  static getInstance(): OrderBreakdownService {
    if (!OrderBreakdownService.instance) {
      OrderBreakdownService.instance = new OrderBreakdownService();
    }
    return OrderBreakdownService.instance;
  }

  /**
   * Obtiene el desglose detallado de descuentos para todos los items de una orden
   */
  async getOrderItemsBreakdown(orderId: string | number): Promise<OrderBreakdownResponse> {
    try {
      console.log(`📊 Obteniendo desglose de items para orden ${orderId}`);
      
      const response = await ApiClient.get(`/user/orders/${orderId}/items-breakdown`);
      
      if (response.success && response.data) {
        console.log('✅ Desglose recibido:', response.data);
        return response.data as OrderBreakdownResponse;
      }
      
      throw new Error('No se pudo obtener el desglose de items');
    } catch (error) {
      console.error('❌ Error al obtener desglose:', error);
      throw error;
    }
  }
}

export default OrderBreakdownService;