// src/services/CheckoutItemsService.ts
import {calculateCartItemDiscounts} from "../../utils/volumeDiscountCalculator";

export interface CheckoutItem {
  product_id: number;
  quantity: number;
  price: number; // ✅ Precio final con todos los descuentos aplicados
  base_price?: number; // Precio original del producto
  original_price?: number; // Precio original sin descuentos
  final_price?: number; // Precio final con descuentos
  discounted_price?: number; // Alias para final_price
  volume_discount_percentage?: number;
  volume_savings?: number;
  seller_discount_amount?: number;
}

export interface CheckoutTotals {
  subtotal: number; // Subtotal con descuentos aplicados
  originalSubtotal: number; // Subtotal sin descuentos
  sellerDiscounts: number; // Total de descuentos del seller
  volumeDiscounts: number; // Total de descuentos por volumen
  totalDiscounts: number; // Total de todos los descuentos
  tax: number; // IVA
  shipping: number; // Costo de envío
  total: number; // Total final
  freeShipping: boolean; // Si aplica envío gratis
}

/**
 * ✅ SERVICIO PRINCIPAL: Prepara items del carrito para checkout con descuentos por volumen
 */
export class CheckoutItemsService {
  
  /**
   * Prepara items del carrito para envío al backend con precios finales
   */
  static prepareItemsForCheckout(cartItems: any[]): CheckoutItem[] {
    return cartItems.map(item => {
      // ✅ Calcular descuentos usando la misma lógica que CartPage
      const discount = calculateCartItemDiscounts(item);
      
      return {
        product_id: item.productId,
        quantity: item.quantity,
        price: discount.finalPricePerUnit, // ✅ CRÍTICO: Enviar precio final al backend
        base_price: item.product?.price || item.price || 0,
        original_price: discount.originalPrice,
        final_price: discount.finalPricePerUnit,
        discounted_price: discount.finalPricePerUnit,
        volume_discount_percentage: discount.volumeDiscountAmount > 0 ? discount.discountPercentage : 0,
        volume_savings: discount.volumeDiscountAmount * item.quantity,
        seller_discount_amount: discount.sellerDiscountAmount * item.quantity
      };
    });
  }

  /**
   * Calcula totales para el checkout usando la misma lógica que CartPage
   */
  static calculateCheckoutTotals(cartItems: any[]): CheckoutTotals {
    let originalSubtotal = 0;
    let subtotal = 0;
    let sellerDiscounts = 0;
    let volumeDiscounts = 0;

    cartItems.forEach(item => {
      const discount = calculateCartItemDiscounts(item);
      
      const originalItemTotal = discount.originalPrice * item.quantity;
      const discountedItemTotal = discount.finalPricePerUnit * item.quantity;
      const sellerDiscountTotal = discount.sellerDiscountAmount * item.quantity;
      const volumeDiscountTotal = discount.volumeDiscountAmount * item.quantity;

      originalSubtotal += originalItemTotal;
      subtotal += discountedItemTotal;
      sellerDiscounts += sellerDiscountTotal;
      volumeDiscounts += volumeDiscountTotal;
    });

    const totalDiscounts = sellerDiscounts + volumeDiscounts;
    const taxRate = 0.15; // 15% IVA
    const tax = subtotal * taxRate;
    
    // Calcular envío
    const freeShippingThreshold = 50.00;
    const shipping = subtotal >= freeShippingThreshold ? 0 : 5.00;
    const freeShipping = shipping === 0;
    
    const total = subtotal + tax + shipping;

    return {
      subtotal,
      originalSubtotal,
      sellerDiscounts,
      volumeDiscounts,
      totalDiscounts,
      tax,
      shipping,
      total,
      freeShipping
    };
  }

  /**
   * Valida que los items tengan precios correctos antes del checkout
   */
  static validateItemsForCheckout(items: CheckoutItem[]): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    items.forEach((item, index) => {
      if (!item.product_id || typeof item.product_id !== 'number') {
        errors.push(`Item ${index + 1}: product_id inválido`);
      }
      
      if (!item.quantity || typeof item.quantity !== 'number' || item.quantity <= 0) {
        errors.push(`Item ${index + 1}: quantity inválida`);
      }
      
      if (typeof item.price !== 'number' || item.price <= 0) {
        errors.push(`Item ${index + 1}: price inválido (${item.price})`);
      }
    });

    return {
      valid: errors.length === 0,
      errors
    };
  }

  /**
   * Debug helper para verificar consistencia de precios
   */
  static debugItemPricing(cartItems: any[], checkoutItems: CheckoutItem[]): void {
    console.log("🔍 DEBUG: Comparación de precios Cart vs Checkout");
    
    cartItems.forEach((cartItem, index) => {
      const checkoutItem = checkoutItems[index];
      const discount = calculateCartItemDiscounts(cartItem);
      
      console.log(`📦 Item ${index + 1}:`, {
        product_id: cartItem.productId,
        quantity: cartItem.quantity,
        cart_original_price: cartItem.product?.price || cartItem.price,
        calculated_final_price: discount.finalPricePerUnit,
        checkout_price: checkoutItem?.price,
        seller_discount: discount.sellerDiscountAmount,
        volume_discount: discount.volumeDiscountAmount,
        total_savings: discount.savingsTotal,
        prices_match: Math.abs((checkoutItem?.price || 0) - discount.finalPricePerUnit) < 0.01
      });
    });
  }
}