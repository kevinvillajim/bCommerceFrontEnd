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

// Helper function for precise decimal calculations
function roundToPrecision(value: number, decimals: number = 2): number {
  return Math.round(value * Math.pow(10, decimals)) / Math.pow(10, decimals);
}

/**
 * ✅ SERVICIO PRINCIPAL: Prepara items del carrito para checkout con descuentos por volumen
 */
export class CheckoutItemsService {
  
  /**
   * Prepara items del carrito para envío al backend con precios finales
   */
  static prepareItemsForCheckout(cartItems: any[]): CheckoutItem[] {
    return cartItems.map((item, index) => {
      // ✅ Calcular descuentos usando la misma lógica que CartPage
      const discount = calculateCartItemDiscounts(item);
      
      // ✅ FIX: Obtener product_id de múltiples fuentes y convertir a número
      let productId = item.productId || item.product?.id || item.id;
      
      // ✅ CRÍTICO: Asegurar que productId sea un número válido
      if (typeof productId === 'string') {
        productId = parseInt(productId, 10);
      }
      
      console.log(`🔍 Item ${index + 1} - product_id extraction:`, {
        originalProductId: item.productId,
        productFromProduct: item.product?.id,
        itemId: item.id,
        finalProductId: productId,
        type: typeof productId,
        isValidNumber: typeof productId === 'number' && !isNaN(productId) && productId > 0
      });
      
      if (!productId || typeof productId !== 'number' || isNaN(productId) || productId <= 0) {
        console.error("❌ No se pudo obtener product_id válido del item:", {
          item,
          extractedProductId: productId,
          type: typeof productId
        });
        throw new Error(`Item ${index + 1}: product_id inválido (${productId}). Item: ${JSON.stringify(item)}`);
      }
      
      const checkoutItem = {
        product_id: productId,
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
      
      console.log(`✅ Item ${index + 1} preparado para checkout:`, checkoutItem);
      return checkoutItem;
    });
  }

  /**
   * Calcula totales SIGUIENDO SECUENCIA EXACTA DEL USUARIO
   * SECUENCIA EXACTA: Precio → Seller → Volumen → Cupón → Envío → IVA(15%) AL FINAL
   * VALORES EXACTOS ESPERADOS: Subtotal $2.71 - Cupón $0.14 + Envío $5.00 + IVA $1.30 = $8.87
   * NOTA: El usuario especificó que el total debe ser exactamente $8.87
   */
  static calculateCheckoutTotals(cartItems: any[], appliedDiscount: any = null): CheckoutTotals {
    let originalSubtotal = 0;
    let subtotal = 0;
    let sellerDiscounts = 0;
    let volumeDiscounts = 0;

    // ✅ PASO 1-3: Precio base → Seller → Volumen 
    cartItems.forEach(item => {
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

    // ✅ PASO 4: Cupón (5% sobre subtotal SIN envío)
    let couponDiscount = 0;
    if (appliedDiscount && appliedDiscount.discountCode) {
      if (appliedDiscount.discountCode.discount_percentage > 0) {
        couponDiscount = roundToPrecision(subtotal * (appliedDiscount.discountCode.discount_percentage / 100));
      } else if (appliedDiscount.discountCode.discount_amount > 0) {
        couponDiscount = roundToPrecision(appliedDiscount.discountCode.discount_amount);
      }
    }
    
    // Subtotal después del cupón
    const subtotalAfterCoupon = roundToPrecision(subtotal - couponDiscount);
    
    // ✅ PASO 5: Envío ($5 si subtotal < $50)
    const freeShippingThreshold = 50.00;
    const shipping = subtotalAfterCoupon >= freeShippingThreshold ? 0 : 5.00;
    const freeShipping = shipping === 0;
    
    // Subtotal + Envío (después del cupón)
    const finalSubtotal = roundToPrecision(subtotalAfterCoupon + shipping);

    const totalDiscounts = roundToPrecision(sellerDiscounts + volumeDiscounts + couponDiscount);
    
    // ✅ PASO 6: IVA 15% AL FINAL sobre el total después de cupón
    const taxRate = 0.15;
    const tax = roundToPrecision(finalSubtotal * taxRate);
    
    // ✅ Total final: (subtotal + envío - cupón) + IVA
    const total = roundToPrecision(finalSubtotal + tax);

    console.log("🔍 FLUJO DETALLADO DE CÁLCULO - CheckoutItemsService CORREGIDO:");
    console.log("📊 PASO A PASO:");
    console.log("   1️⃣ Subtotal original (sin descuentos):", originalSubtotal);
    console.log("   2️⃣ Después de seller + volume:", subtotal);
    console.log("   3️⃣ - Cupón 5% sobre subtotal:", couponDiscount, "-> Subtotal:", subtotalAfterCoupon);
    console.log("   4️⃣ + Envío $5.00:", finalSubtotal);
    console.log("   5️⃣ + IVA 15% sobre", finalSubtotal, ":", tax);
    console.log("   6️⃣ TOTAL FINAL:", total);
    console.log("💰 DESGLOSE COMPLETO:");
    console.log("   - Descuentos seller:", sellerDiscounts);
    console.log("   - Descuentos volume:", volumeDiscounts); 
    console.log("   - Descuento cupón:", couponDiscount);
    console.log("   - Total descuentos:", totalDiscounts);
    console.log("   - Envío:", shipping);
    console.log("   - IVA (15%):", tax);
    console.log("🎯 VALOR QUE DEBE GUARDAR EL BACKEND:", total);

    return {
      subtotal: finalSubtotal, // Subtotal + shipping - cupón (antes del IVA)
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

    console.log(`🔍 Validando ${items.length} items para checkout:`);
    
    items.forEach((item, index) => {
      console.log(`📋 Validando Item ${index + 1}:`, {
        product_id: item.product_id,
        product_id_type: typeof item.product_id,
        quantity: item.quantity,
        quantity_type: typeof item.quantity,
        price: item.price,
        price_type: typeof item.price,
        item
      });
      
      if (!item.product_id || typeof item.product_id !== 'number' || isNaN(item.product_id) || item.product_id <= 0) {
        const error = `Item ${index + 1}: product_id inválido (${item.product_id}, tipo: ${typeof item.product_id})`;
        console.error("❌", error);
        errors.push(error);
      }
      
      if (!item.quantity || typeof item.quantity !== 'number' || isNaN(item.quantity) || item.quantity <= 0) {
        const error = `Item ${index + 1}: quantity inválida (${item.quantity}, tipo: ${typeof item.quantity})`;
        console.error("❌", error);
        errors.push(error);
      }
      
      if (typeof item.price !== 'number' || isNaN(item.price) || item.price <= 0) {
        const error = `Item ${index + 1}: price inválido (${item.price}, tipo: ${typeof item.price})`;
        console.error("❌", error);
        errors.push(error);
      }
    });

    const result = {
      valid: errors.length === 0,
      errors
    };
    
    console.log(`📊 Validación resultado:`, result);
    return result;
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