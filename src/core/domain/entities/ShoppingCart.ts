// src/core/domain/entities/ShoppingCart.ts - ACTUALIZADO CON VOLUME DISCOUNTS

/**
 * ✅ ACTUALIZADA: Interfaz para item del carrito con descuentos por volumen
 */
export interface CartItem {
  id: number;
  productId: number;
  quantity: number;
  price: number; // Precio base del producto
  subtotal: number; // Subtotal sin descuentos por volumen
  attributes?: Record<string, any>;
  
  // ✅ NUEVOS: Campos para descuentos por volumen
  volume_discount?: number; // Porcentaje de descuento por volumen aplicado
  discounted_price?: number; // Precio por unidad con descuento por volumen
  total_savings?: number; // Ahorro total por descuento por volumen
  discount_label?: string; // Etiqueta del descuento aplicado
  
  // Información del producto
  product?: {
    id: number;
    name: string;
    slug?: string;
    price: number;
    final_price?: number;
    discount_percentage?: number;
    rating?: number;
    rating_count?: number;
    image?: string;
    main_image?: string;
    stockAvailable: number;
    sellerId?: number;
    seller_id?: number;
    seller?: any;
    user_id?: number;
    stock: number;
    is_in_stock?: boolean;
    
    // ✅ NUEVOS: Descuentos por volumen en el producto del carrito
    has_volume_discounts?: boolean;
    volume_discounts?: Array<{
      quantity: number;
      discount: number;
      label: string;
    }>;
  };
}

/**
 * ✅ ACTUALIZADA: Interfaz para el carrito de compras con descuentos por volumen
 */
export interface ShoppingCart {
  id: number;
  items: CartItem[];
  total: number;
  item_count?: number;
  
  // ✅ NUEVOS: Campos para descuentos por volumen
  subtotal?: number; // Subtotal con descuentos por volumen aplicados
  total_volume_savings?: number; // Total de ahorros por descuentos por volumen
  volume_discounts_applied?: boolean; // Si se aplicaron descuentos por volumen
}

/**
 * ✅ ACTUALIZADA: Interfaz para agregar items al carrito
 */
export interface AddToCartRequest {
  productId: number;
  quantity: number;
  attributes?: Record<string, any>;
  
  // ✅ NUEVO: Información de descuentos por volumen (para validación)
  expected_volume_discount?: number;
  expected_discounted_price?: number;
}

/**
 * ✅ ACTUALIZADA: Interfaz para actualizar items del carrito
 */
export interface CartItemUpdateData {
  itemId: number;
  quantity: number;
  
  // ✅ NUEVO: Recalcular descuentos por volumen al actualizar
  recalculate_volume_discounts?: boolean;
}

/**
 * ✅ ACTUALIZADA: Respuesta del servicio de carrito con descuentos por volumen
 */
export interface ShoppingCartResponse {
  status: string;
  message?: string;
  data: {
    id: number;
    total: number;
    subtotal?: number;
    total_volume_savings?: number;
    volume_discounts_applied?: boolean;
    items: Array<{
      id: number;
      product: {
        id: number;
        name: string;
        slug?: string;
        price: number;
        final_price?: number;
        discount_percentage?: number;
        rating?: number;
        rating_count?: number;
        main_image?: string;
        seller_id?: number;
        stock: number;
        is_in_stock?: boolean;
        
        // ✅ NUEVOS: Descuentos por volumen en respuesta
        has_volume_discounts?: boolean;
        volume_discounts?: Array<{
          quantity: number;
          discount: number;
          label: string;
        }>;
      };
      quantity: number;
      price: number;
      subtotal: number;
      attributes?: Record<string, any>;
      
      // ✅ NUEVOS: Información de descuentos por volumen en respuesta
      volume_discount?: number;
      discounted_price?: number;
      total_savings?: number;
      discount_label?: string;
    }>;
    item_count: number;
  };
}

/**
 * ✅ NUEVA: Interfaz para información de descuentos por volumen de un producto
 */
export interface VolumeDiscountInfoResponse {
  status: string;
  data: {
    enabled: boolean;
    product?: {
      id: number;
      name: string;
      base_price: number;
      final_price: number;
    };
    current_quantity: number;
    tiers: Array<{
      quantity: number;
      discount: number;
      label: string;
      price_per_unit: number;
      total_price: number;
      savings_per_unit: number;
      total_savings: number;
      is_current: boolean;
    }>;
  };
}

/**
 * ✅ NUEVA: Interfaz para mostrar resumen de descuentos en el carrito
 */
export interface CartVolumeDiscountSummary {
  total_items: number;
  total_original_price: number;
  total_discounted_price: number;
  total_savings: number;
  discounts_applied: Array<{
    product_id: number;
    product_name: string;
    quantity: number;
    original_price: number;
    discounted_price: number;
    savings: number;
    discount_label: string;
  }>;
}

/**
 * ✅ NUEVA: Hook personalizado para manejar descuentos por volumen en el carrito
 */
export interface UseVolumeDiscountsResult {
  // Estado
  volumeDiscountsEnabled: boolean;
  loading: boolean;
  error: string | null;
  
  // Datos
  discountInfo: VolumeDiscountInfoResponse['data'] | null;
  cartSummary: CartVolumeDiscountSummary | null;
  
  // Funciones
  getVolumeDiscountInfo: (productId: number, quantity?: number) => Promise<void>;
  calculatePotentialSavings: (productId: number, newQuantity: number) => Promise<number>;
  getNextDiscountTier: (productId: number, currentQuantity: number) => Promise<{
    quantity: number;
    discount: number;
    items_needed: number;
  } | null>;
}

/**
 * ✅ NUEVA: Interfaz para configurar descuentos por volumen desde admin
 */
export interface AdminVolumeDiscountConfig {
  enabled: boolean;
  stackable: boolean;
  show_savings_message: boolean;
  default_tiers: Array<{
    quantity: number;
    discount: number;
    label: string;
  }>;
}

/**
 * ✅ NUEVA: Interfaz para gestionar descuentos de un producto desde admin
 */
export interface ProductVolumeDiscountsAdmin {
  product: {
    id: number;
    name: string;
    price: number;
  };
  discounts: Array<{
    id?: number;
    min_quantity: number;
    discount_percentage: number;
    label: string;
    active: boolean;
  }>;
}

/**
 * ✅ NUEVA: Respuesta de estadísticas de descuentos por volumen
 */
export interface VolumeDiscountStats {
  total_products_with_discounts: number;
  total_discount_tiers: number;
  average_discount_percentage: number;
  most_common_quantity: number;
  enabled_globally: boolean;
}

// Tipos de utilidad
export type CartItemId = number;
export type ProductId = number;
export type Quantity = number;

/**
 * ✅ NUEVAS: Funciones helper para descuentos por volumen en carrito
 */
export const calculateCartVolumeDiscount = (items: CartItem[]): CartVolumeDiscountSummary => {
  const summary: CartVolumeDiscountSummary = {
    total_items: 0,
    total_original_price: 0,
    total_discounted_price: 0,
    total_savings: 0,
    discounts_applied: []
  };

  items.forEach(item => {
    summary.total_items += item.quantity;
    
    const originalPrice = item.price * item.quantity;
    const discountedPrice = (item.discounted_price || item.price) * item.quantity;
    const savings = item.total_savings || 0;
    
    summary.total_original_price += originalPrice;
    summary.total_discounted_price += discountedPrice;
    summary.total_savings += savings;
    
    if (savings > 0 && item.discount_label) {
      summary.discounts_applied.push({
        product_id: item.productId,
        product_name: item.product?.name || 'Producto',
        quantity: item.quantity,
        original_price: originalPrice,
        discounted_price: discountedPrice,
        savings: savings,
        discount_label: item.discount_label
      });
    }
  });

  return summary;
};

export const hasVolumeDiscountsInCart = (items: CartItem[]): boolean => {
  return items.some(item => (item.total_savings || 0) > 0);
};

export const getTotalVolumeDiscountSavings = (items: CartItem[]): number => {
  return items.reduce((total, item) => total + (item.total_savings || 0), 0);
};