// src/services/CheckoutItemsService.ts - CORREGIDO CON CALCULADORA CENTRALIZADA
import { EcommerceCalculator } from "../../utils/ecommerceCalculator";

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
  couponDiscount: number; // Descuento por cupón específico
  tax: number; // IVA
  shipping: number; // Costo de envío
  total: number; // Total final
  freeShipping: boolean; // Si aplica envío gratis
}

/**
 * 🎯 SERVICIO PRINCIPAL: Prepara items del carrito para checkout
 * AHORA USA LA CALCULADORA CENTRALIZADA - GARANTIZA CONSISTENCIA TOTAL
 */
export class CheckoutItemsService {
  
  /**
   * ✅ CORREGIDO: Prepara items usando calculadora centralizada con configuración dinámica
   */
  static async prepareItemsForCheckout(
    cartItems: any[], 
    appliedDiscount: any = null,
    forceRefresh: boolean = false
  ): Promise<CheckoutItem[]> {
    console.log("🛒 JORDAN CheckoutItemsService - Preparando items con configuración unificada", { forceRefresh });
    console.log("🎫 Cupón para items:", appliedDiscount?.discountCode?.code || "NINGUNO");
    
    // ✅ JORDAN: USAR CALCULADORA MIGRADA CON CONFIGURACIÓN DINÁMICA
    // 🎯 CRITICAL: forceRefresh para garantizar configuraciones frescas
    const { items } = await EcommerceCalculator.prepareCheckoutData(cartItems, appliedDiscount, forceRefresh);
    
    const checkoutItems = items.map((item, index) => {
      console.log(`✅ Item ${index + 1} preparado para checkout:`, {
        product_id: item.product_id,
        quantity: item.quantity,
        price: item.price,
        base_price: item.base_price,
        final_price: item.final_price
      });
      
      return item as CheckoutItem;
    });

    return checkoutItems;
  }

  /**
   * ✅ CORREGIDO: Calcula totales usando calculadora centralizada  
   * GARANTIZA EXACTAMENTE EL MISMO RESULTADO QUE CARTPAGE
   */
  static async calculateCheckoutTotals(
    cartItems: any[], 
    appliedDiscount: any = null,
    forceRefresh: boolean = false
  ): Promise<CheckoutTotals> {
    console.log("🔍 JORDAN - FLUJO CHECKOUT MIGRADO CON CONFIGURACIÓN UNIFICADA:", { forceRefresh });
    
    // ✅ JORDAN: USAR CALCULADORA MIGRADA - CONFIGURACIÓN DINÁMICA DESDE BD
    // 🎯 CRITICAL: forceRefresh en puntos críticos (Checkout)
    const result = await EcommerceCalculator.calculateTotals(cartItems, appliedDiscount, forceRefresh);
    
    console.log("📊 PASO A PASO:");
    console.log(`   1️⃣ Subtotal original (sin descuentos): ${result.step1_originalSubtotal}`);
    console.log(`   2️⃣ Después de seller + volume: ${result.step3_afterVolumeDiscount} ✅ DEBE SER $2.85`);
    console.log(`   3️⃣ - Cupón 5% sobre subtotal: ${result.couponDiscount} -> Subtotal: ${result.step4_afterCoupon}`);
    console.log(`   4️⃣ + Envío: ${result.step5_withShipping}`);
    console.log(`   5️⃣ + IVA 15% sobre ${result.step5_withShipping} : ${result.step6_tax}`);
    console.log(`   6️⃣ TOTAL FINAL: ${result.step7_finalTotal} ✅ DEBE SER $8.87`);
    
    console.log("💰 DESGLOSE COMPLETO:");
    console.log(`   - Descuentos seller: ${result.sellerDiscounts}`);
    console.log(`   - Descuentos volume: ${result.volumeDiscounts}`);
    console.log(`   - Descuento cupón: ${result.couponDiscount}`);
    console.log(`   - Total descuentos: ${result.totalDiscounts}`);
    console.log(`   - Envío: ${result.shipping}`);
    console.log(`   - IVA (15%): ${result.tax}`);
    console.log(`🎯 VALOR CORRECTO PARA BACKEND: ${result.total}`);

    return {
      subtotal: result.step3_afterVolumeDiscount, // CORREGIDO: Subtotal después de descuentos por volumen (antes del cupón)
      originalSubtotal: result.originalSubtotal,
      sellerDiscounts: result.sellerDiscounts,
      volumeDiscounts: result.volumeDiscounts,
      totalDiscounts: result.totalDiscounts,
      couponDiscount: result.couponDiscount,
      tax: result.tax,
      shipping: result.shipping,
      total: result.total, // ✅ ESTE ES EL VALOR CRÍTICO: $8.87
      freeShipping: result.freeShipping
    };
  }

  /**
   * ✅ SIMPLIFICADO: Validación básica (la calculadora centralizada maneja la lógica)
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
   * ✅ SIMPLIFICADO: Debug helper usando calculadora centralizada
   */
  static async debugItemPricing(cartItems: any[], checkoutItems: CheckoutItem[]): Promise<void> {
  console.log("🔍 DEBUG: Comparación usando calculadora centralizada");

  const checkoutData = await EcommerceCalculator.prepareCheckoutData(cartItems);
  const calculatedItems = checkoutData.items;

  cartItems.forEach((cartItem, index) => {
    const checkoutItem = checkoutItems[index];
    const calculatedItem = calculatedItems[index];

    console.log(`📦 Item ${index + 1}:`, {
      product_id: cartItem.productId || cartItem.product?.id,
      quantity: cartItem.quantity,
      calculated_final_price: calculatedItem?.price,
      checkout_price: checkoutItem?.price,
      prices_match: Math.abs((checkoutItem?.price || 0) - (calculatedItem?.price || 0)) < 0.01,
      "✅": "USANDO CALCULADORA CENTRALIZADA"
    });
  });
}

}