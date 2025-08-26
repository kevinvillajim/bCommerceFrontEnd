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
  // ✅ CAMPOS ESPECÍFICOS DEL SELLER
  seller_net_earning_per_unit?: number;
  platform_commission_rate?: number;
  platform_commission_amount?: number;
}

export interface OrderBreakdownResponse {
  order_id: number;
  items: OrderItemBreakdown[];
  has_coupon?: boolean;
  coupon_percentage?: number;
  summary?: {
    total_items: number;
    total_quantity: number;
    total_original_amount: number;
    total_final_amount: number;
    total_savings: number;
    // ✅ INFORMACIÓN ESPECÍFICA DEL SELLER
    seller_commission_info?: {
      platform_commission_rate: number;
      total_commission: number;
      seller_earnings_from_products: number;
      shipping_distribution: any;
    };
  };
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
   * ✅ NUEVA FUNCIÓN: Adapta los datos del seller al formato de breakdown esperado
   */
  private adaptSellerDataToBreakdownFormat(sellerData: any): OrderBreakdownResponse {
    const items: OrderItemBreakdown[] = [];

    if (sellerData.items && Array.isArray(sellerData.items)) {
      sellerData.items.forEach((item: any) => {
        // Crear los pasos del breakdown basados en los datos del seller
        const breakdown_steps: ItemBreakdownStep[] = [];
        
        // Paso 1: Precio original
        breakdown_steps.push({
          step: 1,
          label: 'Precio original',
          price_per_unit: item.original_unit_price || item.unit_price || 0,
          percentage: 0,
          is_discount: false
        });

        // Paso 2: Descuento del seller (si existe)
        if (item.seller_discount_percentage && item.seller_discount_percentage > 0) {
          breakdown_steps.push({
            step: 2,
            label: `Descuento del seller (${item.seller_discount_percentage}%)`,
            price_per_unit: item.unit_price || 0,
            percentage: item.seller_discount_percentage,
            is_discount: true
          });
        }

        // Paso 3: Descuento por volumen (si existe)
        if (item.volume_discount_percentage && item.volume_discount_percentage > 0) {
          breakdown_steps.push({
            step: breakdown_steps.length + 1,
            label: `Descuento por volumen (${item.volume_discount_percentage}%)`,
            price_per_unit: item.unit_price || 0,
            percentage: item.volume_discount_percentage,
            is_discount: true
          });
        }

        const itemResult = {
          id: item.id,
          product_id: item.product_id,
          product_name: item.product_name || 'Producto',
          product_image: item.product_image,
          quantity: item.quantity || 1, // ✅ CANTIDAD CRÍTICA
          original_price_per_unit: item.original_unit_price || item.unit_price || 0,
          final_price_per_unit: item.unit_price || 0,
          subtotal: item.total_price || 0,
          total_savings: item.total_savings || 0,
          breakdown_steps,
          has_seller_discount: (item.seller_discount_percentage || 0) > 0,
          has_volume_discount: (item.volume_discount_percentage || 0) > 0,
          has_coupon_discount: false, // Por implementar si es necesario
          // ✅ AGREGAR CAMPOS ESPECÍFICOS DEL SELLER PARA CÁLCULOS
          seller_net_earning_per_unit: item.seller_net_earning_from_products || 0,
          platform_commission_rate: item.platform_commission_rate || 0,
          platform_commission_amount: item.platform_commission_amount || 0,
        };
        
        items.push(itemResult);
      });
    }

    return {
      order_id: sellerData.id || 0,
      items,
      summary: {
        total_items: items.length,
        total_quantity: items.reduce((sum, item) => sum + item.quantity, 0),
        total_original_amount: items.reduce((sum, item) => sum + (item.original_price_per_unit * item.quantity), 0),
        total_final_amount: items.reduce((sum, item) => sum + item.subtotal, 0),
        total_savings: items.reduce((sum, item) => sum + item.total_savings, 0),
        // ✅ AGREGAR INFORMACIÓN ESPECÍFICA DEL SELLER - MANEJAR AMBOS FORMATOS
        seller_commission_info: (() => {
          const orderSummary = sellerData.order_summary || sellerData.orderSummary || {};
          return {
            platform_commission_rate: orderSummary.shipping_distribution?.platform_commission_rate || 10,
            total_commission: orderSummary.total_platform_commission || 0,
            seller_earnings_from_products: orderSummary.total_seller_earnings_from_products || 0,
            shipping_distribution: orderSummary.shipping_distribution || { seller_amount: 0 }
          };
        })()
      }
    };
  }

  /**
   * Obtiene el desglose detallado de descuentos para todos los items de una orden
   */
  async getOrderItemsBreakdown(orderId: string | number, viewType: 'customer' | 'seller' = 'customer'): Promise<OrderBreakdownResponse> {
    try {
      console.log(`📊 Obteniendo desglose de items para orden ${orderId} (vista: ${viewType})`);
      console.log('🔍 OrderBreakdownService.getOrderItemsBreakdown llamado');
      
      // ✅ USAR ENDPOINT CORRECTO SEGÚN EL TIPO DE VISTA
      const endpoint = viewType === 'seller' 
        ? `/seller/orders/${orderId}`  // Usar el endpoint de seller que ya corregimos
        : `/user/orders/${orderId}/items-breakdown`; // Endpoint para customers
      
      console.log('🔍 Endpoint a usar:', endpoint);
      console.log('🔍 OrderID que se está usando:', orderId);
      console.log('🔍 ViewType:', viewType);
      
      const response = await ApiClient.get(endpoint);
      
      const responseData = response as any;
      
      // ✅ MANEJAR DIFERENTES FORMATOS DE RESPUESTA
      let orderData = null;
      
      if (responseData.success && responseData.data) {
        orderData = responseData.data;
      } else if (responseData.data) {
        orderData = responseData.data;
      } else if (responseData.id && responseData.items) {
        orderData = responseData;
      }
      
      if (orderData) {
        
        // ✅ ADAPTAR LA ESTRUCTURA DE DATOS SEGÚN EL TIPO DE VISTA
        if (viewType === 'seller') {
          return this.adaptSellerDataToBreakdownFormat(orderData);
        } else {
          // ✅ NUEVO: Adaptar datos del endpoint de customer
          return this.adaptCustomerDataToBreakdownFormat(orderData);
        }
      }
      
      throw new Error('No se pudo obtener el desglose de items');
    } catch (error) {
      console.error('❌ Error al obtener desglose:', error);
      console.error('❌ Error específico:', error);
      console.error('❌ Error mensaje:', error instanceof Error ? error.message : 'Error desconocido');
      console.error('❌ Error status:', (error as any)?.response?.status);
      console.error('❌ Error data:', (error as any)?.response?.data);
      throw error;
    }
  }

  /**
   * ✅ NUEVO: Adapta los datos del endpoint /user/orders/{id}/items-breakdown al formato esperado
   */
  private adaptCustomerDataToBreakdownFormat(customerData: any): OrderBreakdownResponse {
    const items: OrderItemBreakdown[] = [];

    if (customerData.items && Array.isArray(customerData.items)) {
      customerData.items.forEach((item: any) => {
        items.push({
          id: item.id,
          product_id: item.product_id,
          product_name: item.product_name || 'Producto',
          product_image: item.product_image,
          quantity: item.quantity || 1,
          // ✅ MAPEAR CORRECTAMENTE LOS NOMBRES DE CAMPOS
          original_price_per_unit: item.original_unit_price || 0,
          final_price_per_unit: item.unit_price || 0,
          subtotal: item.total_price || 0,
          total_savings: item.total_savings || 0,
          breakdown_steps: item.breakdown_steps || [],
          has_seller_discount: (item.seller_discount_percentage || 0) > 0,
          has_volume_discount: (item.volume_discount_percentage || 0) > 0,
          has_coupon_discount: false, // Por ahora sin cupones en customer breakdown
        });
      });
    }

    return {
      order_id: customerData.order_id || 0,
      items,
      summary: {
        total_items: items.length,
        total_quantity: items.reduce((sum, item) => sum + item.quantity, 0),
        total_original_amount: items.reduce((sum, item) => sum + (item.original_price_per_unit * item.quantity), 0),
        total_final_amount: items.reduce((sum, item) => sum + item.subtotal, 0),
        total_savings: items.reduce((sum, item) => sum + item.total_savings, 0),
      }
    };
  }
}

export default OrderBreakdownService;