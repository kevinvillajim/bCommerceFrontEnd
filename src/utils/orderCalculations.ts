// src/utils/orderCalculations.ts - Unified order calculation utilities

import { calculateCartItemDiscounts } from './volumeDiscountCalculator';
import ShippingConfigService from '../core/services/ShippingConfigService';

// Helper function for precise decimal calculations
function roundToPrecision(value: number, decimals: number = 2): number {
  return Math.round(value * Math.pow(10, decimals)) / Math.pow(10, decimals);
}

export interface OrderTotals {
  subtotal: number;
  originalSubtotal: number;
  sellerDiscounts: number;
  volumeDiscounts: number;
  couponDiscount: number;
  totalDiscounts: number;
  tax: number;
  shipping: number;
  total: number;
  freeShipping: boolean;
}

export interface OrderItemCalculated {
  id: number;
  productId: number;
  product_name: string;
  product_image?: string;
  quantity: number;
  price: number; // Final price per unit after discounts
  original_price: number; // Original price before discounts
  discount_amount: number; // Total discount amount for this item
  item_total: number; // Total for this item (price * quantity)
}

/**
 * Calculate order totals with exact same logic as cart and checkout
 * SECUENCIA: Precio Normal → Descuento Seller → Descuento Volumen → Descuento Cupón → IVA + Envío
 */
export async function calculateOrderTotals(
  items: any[], 
  appliedDiscountCode?: { code: string; discount_percentage: number }
): Promise<OrderTotals> {
  let originalSubtotal = 0;
  let subtotal = 0;
  let sellerDiscounts = 0;
  let volumeDiscounts = 0;

  // 1. Calculate item-level discounts
  items.forEach(item => {
    const discount = calculateCartItemDiscounts(item);
    
    const originalItemTotal = roundToPrecision(discount.originalPrice * item.quantity);
    const discountedItemTotal = roundToPrecision(discount.finalPricePerUnit * item.quantity);
    const sellerDiscountTotal = roundToPrecision(discount.sellerDiscountAmount * item.quantity);
    const volumeDiscountTotal = roundToPrecision(discount.volumeDiscountAmount * item.quantity);

    originalSubtotal = roundToPrecision(originalSubtotal + originalItemTotal);
    subtotal = roundToPrecision(subtotal + discountedItemTotal);
    sellerDiscounts = roundToPrecision(sellerDiscounts + sellerDiscountTotal);
    volumeDiscounts = roundToPrecision(volumeDiscounts + volumeDiscountTotal);
  });

  // 2. Apply coupon discount to subtotal
  let couponDiscount = 0;
  if (appliedDiscountCode) {
    couponDiscount = roundToPrecision(subtotal * (appliedDiscountCode.discount_percentage / 100));
    subtotal = roundToPrecision(subtotal - couponDiscount);
  }

  // 3. Calculate shipping with dynamic configuration
  const shippingService = ShippingConfigService.getInstance();
  const shippingConfig = await shippingService.getShippingConfig();
  
  const shipping = !shippingConfig.enabled ? 0 : 
    (subtotal >= shippingConfig.freeThreshold ? 0 : shippingConfig.defaultCost);
  const freeShipping = shipping === 0;

  // 4. Calculate tax on subtotal + shipping
  const taxRate = 0.15; // 15% IVA
  const subtotalWithShipping = roundToPrecision(subtotal + shipping);
  const tax = roundToPrecision(subtotalWithShipping * taxRate);

  // 5. Final total
  const total = roundToPrecision(subtotal + shipping + tax);
  const totalDiscounts = roundToPrecision(sellerDiscounts + volumeDiscounts + couponDiscount);

  return {
    subtotal,
    originalSubtotal,
    sellerDiscounts,
    volumeDiscounts,
    couponDiscount,
    totalDiscounts,
    tax,
    shipping,
    total,
    freeShipping
  };
}

/**
 * Calculate individual order item with discounts applied
 */
export function calculateOrderItem(cartItem: any): OrderItemCalculated {
  const discount = calculateCartItemDiscounts(cartItem);
  
  return {
    id: cartItem.id,
    productId: cartItem.productId,
    product_name: cartItem.product?.name || 'Producto',
    product_image: cartItem.product?.image,
    quantity: cartItem.quantity,
    price: discount.finalPricePerUnit,
    original_price: discount.originalPrice,
    discount_amount: roundToPrecision((discount.originalPrice - discount.finalPricePerUnit) * cartItem.quantity),
    item_total: roundToPrecision(discount.finalPricePerUnit * cartItem.quantity)
  };
}

/**
 * Format order summary text for display
 */
export function formatOrderSummary(totals: OrderTotals): string {
  let summary = [];
  
  if (totals.totalDiscounts > 0) {
    summary.push(`Ahorros: ${formatCurrency(totals.totalDiscounts)}`);
  }
  
  if (totals.freeShipping) {
    summary.push('Envío gratis');
  }
  
  return summary.length > 0 ? summary.join(' • ') : '';
}

/**
 * Helper to format currency consistently
 */
function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('es-EC', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount);
}

export { formatCurrency };