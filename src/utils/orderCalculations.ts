// src/utils/orderCalculations.ts - Unified order calculation utilities

import { calculateCartItemDiscounts } from './volumeDiscountCalculator';
// import ShippingConfigService from '../core/services/ShippingConfigService'; // 🎯 JORDAN: Migrado a ConfigurationManager
import ConfigurationManager from '../core/services/ConfigurationManager';


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
  // 🎯 JORDAN: Get configuration once for entire calculation
  const configManager = ConfigurationManager.getInstance();
  const configResult = await configManager.getUnifiedConfig();
  
  let originalSubtotal = 0;
  let subtotal = 0;
  let sellerDiscounts = 0;
  let volumeDiscounts = 0;

  // 1. Calculate item-level discounts
  items.forEach(item => {
    const discount = calculateCartItemDiscounts(item);
    
    const originalItemTotal = discount.originalPrice * item.quantity; // Sin redondeo - frontend manejará
    const discountedItemTotal = discount.finalPricePerUnit * item.quantity; // Sin redondeo - frontend manejará
    const sellerDiscountTotal = discount.sellerDiscountAmount * item.quantity; // Sin redondeo - frontend manejará
    const volumeDiscountTotal = discount.volumeDiscountAmount * item.quantity; // Sin redondeo - frontend manejará

    originalSubtotal = originalSubtotal + originalItemTotal; // Sin redondeo - frontend manejará
    subtotal = subtotal + discountedItemTotal; // Sin redondeo - frontend manejará
    sellerDiscounts = sellerDiscounts + sellerDiscountTotal; // Sin redondeo - frontend manejará
    volumeDiscounts = volumeDiscounts + volumeDiscountTotal; // Sin redondeo - frontend manejará
  });

  // 2. Apply coupon discount to subtotal
  let couponDiscount = 0;
  if (appliedDiscountCode) {
    couponDiscount = subtotal * (appliedDiscountCode.discount_percentage / 100); // Sin redondeo - frontend manejará
    subtotal = subtotal - couponDiscount; // Sin redondeo - frontend manejará
  }

  // 3. Calculate shipping with dynamic configuration - 🎯 JORDAN: Unificado
  const shipping = !configResult.config.shipping.enabled ? 0 : 
    (subtotal >= configResult.config.shipping.free_threshold ? 0 : configResult.config.shipping.default_cost);
  const freeShipping = shipping === 0;

  // 4. Calculate tax on subtotal + shipping - 🎯 JORDAN: Tax rate dinámico
  const taxRate = configResult.config.tax_rate;
  const subtotalWithShipping = subtotal + shipping; // Sin redondeo - frontend manejará
  const tax = subtotalWithShipping * taxRate; // Sin redondeo - frontend manejará

  // 5. Final total
  const total = subtotal + shipping + tax; // Sin redondeo - frontend manejará
  const totalDiscounts = sellerDiscounts + volumeDiscounts + couponDiscount; // Sin redondeo - frontend manejará

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
    discount_amount: (discount.originalPrice - discount.finalPricePerUnit) * cartItem.quantity, // Sin redondeo - frontend manejará
    item_total: discount.finalPricePerUnit * cartItem.quantity // Sin redondeo - frontend manejará
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