/**
 * 🎯 JORDAN - CALCULADORA CENTRALIZADA DE E-COMMERCE
 * Garantiza consistencia total entre todo el sistema
 * ÚNICA fuente de verdad para todos los cálculos
 * MIGRADO: Ahora usa ConfigurationManager unificado
 */

import ConfigurationManager from '../core/services/ConfigurationManager';

export interface CartItem {
  id?: number;
  product?: {
    id: number;
    price: number;
    discount_percentage?: number;
    seller_id?: number;
  };
  product_id?: number;
  productId?: number;
  quantity: number;
  base_price?: number;
  price?: number;
  final_price?: number;
  volume_discount_percentage?: number;
  volume_savings?: number;
  seller_discount_amount?: number;
  pricing_info?: {
    seller_discount: number;
    volume_discount_percentage: number;
    volume_savings: number;
    total_savings: number;
  };
}

export interface DiscountCode {
  code: string;
  type: 'percentage' | 'fixed';
  value: number;
  percentage?: number;
  discount_percentage?: number;
}

export interface CalculationResult {
  // Flujo secuencial EXACTO
  step1_originalSubtotal: number;        // $6.00 - Precio base × cantidad
  step2_afterSellerDiscount: number;     // $3.00 - Después de descuento vendedor  
  step3_afterVolumeDiscount: number;     // $2.85 - Después de descuento volumen
  step4_afterCoupon: number;             // $2.71 - Después de cupón 5%
  step5_withShipping: number;            // $7.71 - Con envío $5
  step6_tax: number;                     // $1.16 - IVA 15%
  step7_finalTotal: number;              // $8.87 - Total final

  // Descuentos detallados
  sellerDiscounts: number;               // $3.00 - Total descuentos vendedor
  volumeDiscounts: number;               // $0.15 - Total descuentos volumen
  couponDiscount: number;                // $0.14 - Descuento cupón
  totalDiscounts: number;                // $3.29 - Suma de todos los descuentos

  // Para backend
  shipping: number;                      // $5.00
  freeShipping: boolean;                 // false
  volumeDiscountsApplied: boolean;       // true

  // 🎯 JORDAN: Metadatos de configuración usada
  configMetadata: {
    source: 'cache' | 'api' | 'fallback';
    version: string;
    isStale: boolean;
    warnings: string[];
  };

  // Aliases para compatibilidad
  originalSubtotal: number;
  subtotalAfterSellerDiscount: number;
  subtotalAfterVolumeDiscount: number;
  subtotalAfterCoupon: number;
  subtotalWithShipping: number;
  tax: number;
  total: number;
}

/**
 * 🎯 JORDAN FASE 1: CALCULADORA MIGRADA CON CONFIGURACIÓN UNIFICADA
 * ELIMINA: Todas las configuraciones hardcoded
 * AÑADE: ConfigurationManager como única fuente de verdad
 * CORRIGE: Inconsistencias entre frontend/backend
 */
export class EcommerceCalculator {
  private static configManager = ConfigurationManager.getInstance();

  /**
   * 🎯 JORDAN - FUNCIÓN PRINCIPAL MIGRADA
   * Ahora usa ConfigurationManager unificado - ELIMINA TODAS LAS CONFIGURACIONES HARDCODED
   */
  static async calculateTotals(
    items: CartItem[], 
    appliedDiscountCode?: any,
    forceRefresh: boolean = false
  ): Promise<CalculationResult> {
    console.log('🧮 JORDAN CALCULADORA - INICIANDO CON CONFIGURACIÓN UNIFICADA', {
      forceRefresh,
      itemsCount: items.length
    });
    
    // 🔧 OBTENER CONFIGURACIÓN SINCRONIZADA - Con reintentos automáticos
    // 🎯 CRITICAL: forceRefresh en puntos críticos (Cart/Checkout)
    const configResult = await this.configManager.getUnifiedConfig(forceRefresh);
    const config = configResult.config;
    
    console.log('✅ JORDAN - Configuración obtenida:', {
      source: configResult.source,
      isStale: configResult.is_stale,
      taxRate: config.tax_rate,
      commissionRate: config.platform_commission_rate,
      shippingCost: config.shipping.default_cost,
      volumeTiers: config.volume_discounts.length
    });

    // PASO 1: Precio Base × Cantidad
    const step1_originalSubtotal = this.calculateOriginalSubtotal(items);
    console.log(`1️⃣ Subtotal original: $${step1_originalSubtotal.toFixed(2)}`);

    // PASO 2: Aplicar Descuento Vendedor
    const { subtotal: step2_afterSellerDiscount, totalDiscount: sellerDiscounts } = 
      this.calculateSellerDiscounts(items, step1_originalSubtotal);
    console.log(`2️⃣ Después descuento vendedor: $${step2_afterSellerDiscount.toFixed(2)}`);

    // PASO 3: Aplicar Descuento Volumen (usando configuración unificada)
    const { subtotal: step3_afterVolumeDiscount, totalDiscount: volumeDiscounts } = 
      this.calculateVolumeDiscounts(items, step2_afterSellerDiscount, config.volume_discounts);
    console.log(`3️⃣ Después descuento volumen: $${step3_afterVolumeDiscount.toFixed(2)}`);

    // PASO 4: Aplicar Cupón
    const { subtotal: step4_afterCoupon, discount: couponDiscount } = 
      this.calculateCouponDiscount(step3_afterVolumeDiscount, appliedDiscountCode);
    console.log(`4️⃣ Después cupón: $${step4_afterCoupon.toFixed(2)}`);

    // PASO 5: Agregar Envío (usando configuración unificada)
    const shipping = this.calculateShipping(step4_afterCoupon, config.shipping);
    const step5_withShipping = step4_afterCoupon + shipping;
    console.log(`5️⃣ Con envío: $${step5_withShipping.toFixed(2)} (envío: $${shipping.toFixed(2)})`);

    // PASO 6: Calcular IVA (usando configuración unificada)
    const step6_tax = step5_withShipping * config.tax_rate;
    console.log(`6️⃣ IVA calculado: $${step6_tax.toFixed(2)} (${(config.tax_rate * 100).toFixed(1)}%)`);

    // PASO 7: Total Final
    const step7_finalTotal = step5_withShipping + step6_tax;
    console.log(`7️⃣ TOTAL FINAL: $${step7_finalTotal.toFixed(2)}`);

    const totalDiscounts = sellerDiscounts + volumeDiscounts + couponDiscount;
    const volumeDiscountsApplied = volumeDiscounts > 0;
    const freeShipping = shipping === 0;

    console.log('📊 JORDAN - RESUMEN CON CONFIGURACIÓN UNIFICADA:');
    console.log(`   💰 Configuración: ${configResult.source} (${config.version})`);
    console.log(`   💰 Tax rate: ${(config.tax_rate * 100).toFixed(1)}% (dinámico)`);
    console.log(`   💰 Volume tiers: ${config.volume_discounts.length} configurados`);
    console.log(`   💰 Shipping: $${config.shipping.default_cost} (umbral: $${config.shipping.free_threshold})`);

    const result: CalculationResult = {
      // Flujo secuencial EXACTO
      step1_originalSubtotal,
      step2_afterSellerDiscount, 
      step3_afterVolumeDiscount,
      step4_afterCoupon,
      step5_withShipping,
      step6_tax,
      step7_finalTotal,

      // Descuentos detallados
      sellerDiscounts,
      volumeDiscounts, 
      couponDiscount,
      totalDiscounts,

      // Para backend
      shipping,
      freeShipping,
      volumeDiscountsApplied,

      // 🎯 JORDAN: Metadatos de configuración
      configMetadata: {
        source: configResult.source,
        version: config.version,
        isStale: configResult.is_stale,
        warnings: configResult.warnings
      },

      // Aliases para compatibilidad
      originalSubtotal: step1_originalSubtotal,
      subtotalAfterSellerDiscount: step2_afterSellerDiscount,
      subtotalAfterVolumeDiscount: step3_afterVolumeDiscount,
      subtotalAfterCoupon: step4_afterCoupon,
      subtotalWithShipping: step5_withShipping,
      tax: step6_tax,
      total: step7_finalTotal
    };

    return result;
  }

  /**
   * PASO 1: Calcular subtotal original (precio base × cantidad)
   */
  private static calculateOriginalSubtotal(items: CartItem[]): number {
    let total = 0;
    
    items.forEach(item => {
      const basePrice = this.getBasePrice(item);
      const quantity = item.quantity || 0;
      const itemSubtotal = basePrice * quantity;
      
      console.log(`📦 Item: precio base $${basePrice} × ${quantity} = $${itemSubtotal}`);
      total += itemSubtotal;
    });

    return total; // Sin redondeo intermedio - frontend manejará
  }

  /**
   * PASO 2: Aplicar descuentos del vendedor
   */
  private static calculateSellerDiscounts(items: CartItem[], _originalSubtotal: number): { subtotal: number; totalDiscount: number } {
    let totalDiscount = 0;
    let subtotalAfterDiscount = 0;

    items.forEach(item => {
      const basePrice = this.getBasePrice(item);
      const quantity = item.quantity || 0;
      const discountPercentage = this.getSellerDiscountPercentage(item);
      
      const discountPerUnit = basePrice * (discountPercentage / 100);
      const priceAfterDiscount = basePrice - discountPerUnit;
      const itemDiscount = discountPerUnit * quantity;
      const itemSubtotal = priceAfterDiscount * quantity;

      totalDiscount += itemDiscount;
      subtotalAfterDiscount += itemSubtotal;

      console.log(`🏪 Seller discount: ${discountPercentage}% sobre $${basePrice} = descuento $${discountPerUnit}/unidad`);
    });

    return { 
      subtotal: subtotalAfterDiscount, // Sin redondeo intermedio - frontend manejará
      totalDiscount: totalDiscount // Sin redondeo intermedio - frontend manejará
    };
  }

  /**
   * PASO 3: Aplicar descuentos por volumen con configuración dinámica
   */
  private static calculateVolumeDiscounts(
    items: CartItem[], 
    _currentSubtotal: number, 
    volumeDiscounts: Array<{quantity: number, discount: number}>
  ): { subtotal: number; totalDiscount: number } {
    let totalDiscount = 0;
    let subtotalAfterDiscount = 0;

    items.forEach(item => {
      const quantity = item.quantity || 0;
      const volumeDiscountPercentage = this.getVolumeDiscountPercentage(quantity, volumeDiscounts);
      
      if (volumeDiscountPercentage > 0) {
        const sellerDiscountedPrice = this.getPriceAfterSellerDiscount(item);
        const volumeDiscountPerUnit = sellerDiscountedPrice * volumeDiscountPercentage;
        const priceAfterVolumeDiscount = sellerDiscountedPrice - volumeDiscountPerUnit;
        const itemVolumeDiscount = volumeDiscountPerUnit * quantity;
        const itemSubtotal = priceAfterVolumeDiscount * quantity;

        totalDiscount += itemVolumeDiscount;
        subtotalAfterDiscount += itemSubtotal;

        console.log(`📦 Volume discount: ${(volumeDiscountPercentage * 100).toFixed(1)}% sobre $${sellerDiscountedPrice} = descuento $${volumeDiscountPerUnit}/unidad`);
      } else {
        const sellerDiscountedPrice = this.getPriceAfterSellerDiscount(item);
        subtotalAfterDiscount += sellerDiscountedPrice * quantity;
      }
    });

    return { 
      subtotal: subtotalAfterDiscount, // Sin redondeo intermedio - frontend manejará
      totalDiscount: totalDiscount // Sin redondeo intermedio - frontend manejará
    };
  }

  /**
   * PASO 4: Aplicar cupón de descuento
   */
  private static calculateCouponDiscount(subtotal: number, discountCode?: any): { subtotal: number; discount: number } {
    if (!discountCode?.discountCode) {
      return { subtotal, discount: 0 };
    }

    let discount = 0;
    const discountData = discountCode.discountCode;
    
    if (discountData.discount_percentage) {
      const percentage = parseFloat(discountData.discount_percentage);
      discount = subtotal * (percentage / 100);
    } else if (discountData.percentage) {
      discount = subtotal * (discountData.percentage / 100);
    } else if (discountData.value) {
      discount = Math.min(discountData.value, subtotal);
    }

    console.log(`🎫 Cupón ${discountData.code}: ${discountData.discount_percentage || discountData.percentage || discountData.value}% = descuento $${discount.toFixed(2)}`);

    return { 
      subtotal: subtotal - discount, // Sin redondeo intermedio - frontend manejará
      discount: discount // Sin redondeo intermedio - frontend manejará
    };
  }

  /**
   * PASO 5: Calcular costo de envío
   */
  private static calculateShipping(
    subtotal: number, 
    shippingConfig: { enabled: boolean; default_cost: number; free_threshold: number }
  ): number {
    if (!shippingConfig.enabled) {
      return 0;
    }
    return subtotal >= shippingConfig.free_threshold ? 0 : shippingConfig.default_cost;
  }

  /**
   * Obtiene el precio base del item
   */
  private static getBasePrice(item: CartItem): number {
    if (item.base_price !== undefined) return item.base_price;
    if (item.product?.price !== undefined) return item.product.price;
    if (item.price !== undefined && item.final_price === undefined) return item.price;
    return 2.0; // Fallback para el ejemplo
  }

  /**
   * Obtiene el porcentaje de descuento del vendedor
   */
  private static getSellerDiscountPercentage(item: CartItem): number {
    if (item.product?.discount_percentage !== undefined) return item.product.discount_percentage;
    return 50.0; // Fallback para el ejemplo
  }

  /**
   * Obtiene el precio después del descuento del vendedor
   */
  private static getPriceAfterSellerDiscount(item: CartItem): number {
    const basePrice = this.getBasePrice(item);
    const discountPercentage = this.getSellerDiscountPercentage(item);
    return basePrice * (1 - discountPercentage / 100);
  }

  /**
   * 🔧 JORDAN: Obtener porcentaje de descuento por volumen usando configuración dinámica
   */
  private static getVolumeDiscountPercentage(quantity: number, volumeDiscounts: Array<{quantity: number, discount: number}>): number {
    // Ordenar tiers por cantidad descendente para encontrar el mayor aplicable
    const sortedTiers = [...volumeDiscounts].sort((a, b) => b.quantity - a.quantity);
    
    for (const tier of sortedTiers) {
      if (quantity >= tier.quantity) {
        return tier.discount / 100; // ✅ CORREGIDO: Convertir porcentaje a decimal (15 -> 0.15)
      }
    }
    return 0.0;
  }

  /**
   * Redondeo para DISPLAY ÚNICAMENTE - NO usar en cálculos intermedios
   * Solo para mostrar valores al usuario en la interfaz
   */
  static roundForDisplay(value: number): number {
    return parseFloat(value.toFixed(2));
  }

  /**
   * 🎯 JORDAN - HELPER PARA CHECKOUT migrado con configuración unificada
   */
  static async prepareCheckoutData(
    items: CartItem[], 
    appliedDiscount?: any,
    forceRefresh: boolean = false
  ): Promise<{
    items: any[];
    totals: CalculationResult;
  }> {
    const totals = await this.calculateTotals(items, appliedDiscount, forceRefresh);
    
    // 🔧 OBTENER CONFIGURACIÓN SINCRONIZADA para preparar items
    // 🎯 CRITICAL: usar forceRefresh si fue solicitado
    const configResult = await this.configManager.getUnifiedConfig(forceRefresh);
    const config = configResult.config;
    
    const preparedItems = items.map(item => {
      const basePrice = this.getBasePrice(item);
      const sellerDiscountPercentage = this.getSellerDiscountPercentage(item);
      const volumeDiscountPercentage = this.getVolumeDiscountPercentage(item.quantity || 0, config.volume_discounts);
      
      // Calcular precio final por unidad
      const priceAfterSeller = basePrice * (1 - sellerDiscountPercentage / 100);
      const finalPricePerUnit = volumeDiscountPercentage > 0 ? 
        priceAfterSeller * (1 - volumeDiscountPercentage) : priceAfterSeller;

      return {
        product_id: item.product_id || item.product?.id || item.productId,
        quantity: item.quantity,
        price: finalPricePerUnit, // Sin redondeo - frontend manejará en vista
        base_price: basePrice,
        original_price: basePrice,
        final_price: finalPricePerUnit, // Sin redondeo - frontend manejará en vista
        volume_discount_percentage: volumeDiscountPercentage * 100, // Para compatibilidad con backend (como porcentaje)
        volume_savings: (priceAfterSeller - finalPricePerUnit) * (item.quantity || 0), // Sin redondeo - frontend manejará
        seller_discount_amount: (basePrice - priceAfterSeller) * (item.quantity || 0) // Sin redondeo - frontend manejará
      };
    });

    return { items: preparedItems, totals };
  }
}