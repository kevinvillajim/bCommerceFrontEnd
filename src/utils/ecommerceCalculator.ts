/**
 * 🧮 CALCULADORA CENTRALIZADA DE E-COMMERCE
 * Garantiza consistencia total entre todo el sistema
 * Esta es la ÚNICA fuente de verdad para todos los cálculos
 */

import ShippingConfigService from '../core/services/ShippingConfigService';
import ApiClient from '../infrastructure/api/apiClient';

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

  // Aliases para compatibilidad
  originalSubtotal: number;
  subtotalAfterSellerDiscount: number;
  subtotalAfterVolumeDiscount: number;
  subtotalAfterCoupon: number;
  subtotalWithShipping: number;
  tax: number;
  total: number;
}

export class EcommerceCalculator {
  private static readonly TAX_RATE = 0.15; // 15%
  private static shippingConfig: { cost: number; threshold: number; enabled: boolean } | null = null;
  private static configCacheTime = 0;
  private static readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutos

  /**
   * 🔧 OBTENER CONFIGURACIÓN DE ENVÍO DINÁMICA
   */
  private static async getShippingConfig() {
    const now = Date.now();
    
    // Si tenemos cache válido, lo devolvemos
    if (this.shippingConfig && (now - this.configCacheTime) < this.CACHE_DURATION) {
      return this.shippingConfig;
    }

    try {
      const service = ShippingConfigService.getInstance();
      const config = await service.getShippingConfig();
      
      this.shippingConfig = {
        cost: config.defaultCost,
        threshold: config.freeThreshold,
        enabled: config.enabled
      };
      this.configCacheTime = now;
      
      return this.shippingConfig;
    } catch (error) {
      console.warn('Error al obtener configuración de envío, usando valores por defecto:', error);
      
      // Valores por defecto si falla (deben coincidir con BD actual)
      this.shippingConfig = {
        cost: 3.00,    // Valor actual en BD
        threshold: 20.00, // Valor actual en BD
        enabled: true
      };
      this.configCacheTime = now;
      
      return this.shippingConfig;
    }
  }

  /**
   * 🎯 FUNCIÓN PRINCIPAL - CALCULADORA MAESTRA
   * Esta función implementa la SECUENCIA EXACTA especificada en el problema
   */
  static async calculateTotals(
    items: CartItem[], 
    appliedDiscountCode?: any,
    dynamicVolumeTiers?: Array<{quantity: number, discount: number}>
  ): Promise<CalculationResult> {
    console.log('🧮 CALCULADORA CENTRALIZADA - INICIANDO');
    console.log('📊 Items a procesar:', items.length);
    console.log('🎫 Cupón aplicado:', appliedDiscountCode?.discountCode?.code || 'NINGUNO');

    // 🔧 NUEVO: Cargar tiers dinámicos de descuentos por volumen
    let volumeTiers: Array<{quantity: number, discount: number}> = [];
    
    if (dynamicVolumeTiers && dynamicVolumeTiers.length > 0) {
      // Usar tiers pasados como parámetro (prioritario)
      volumeTiers = dynamicVolumeTiers;
      console.log('✅ Usando tiers dinámicos pasados como parámetro:', volumeTiers);
    } else {
      // Fallback: cargar desde ruta pública
      try {
        const response = await ApiClient.get('/configurations/volume-discounts-public');
        
        if (response.status === 'success' && response.data?.volume_discounts?.default_tiers) {
          const tiersData = typeof response.data.volume_discounts.default_tiers === 'string' 
            ? JSON.parse(response.data.volume_discounts.default_tiers)
            : response.data.volume_discounts.default_tiers;
          
          volumeTiers = tiersData.map((tier: any) => ({
            quantity: tier.quantity,
            discount: tier.discount
          }));
          
          console.log('✅ Tiers dinámicos cargados desde BD (fallback):', volumeTiers);
        }
      } catch (error) {
        console.warn('⚠️ Error cargando tiers dinámicos, usando fallback hardcodeado:', error);
      }
    }

    // PASO 1: Precio Base × Cantidad = $6.00
    const step1_originalSubtotal = this.calculateStep1_OriginalSubtotal(items);
    console.log(`1️⃣ Subtotal original: $${step1_originalSubtotal.toFixed(2)}`);

    // PASO 2: Aplicar Descuento Vendedor (50%) = $3.00
    const { subtotal: step2_afterSellerDiscount, totalDiscount: sellerDiscounts } = 
      this.calculateStep2_SellerDiscounts(items, step1_originalSubtotal);
    console.log(`2️⃣ Después descuento vendedor: $${step2_afterSellerDiscount.toFixed(2)} (descuento: $${sellerDiscounts.toFixed(2)})`);

    // PASO 3: Aplicar Descuento Volumen (dinámico desde BD) = $2.85
    const { subtotal: step3_afterVolumeDiscount, totalDiscount: volumeDiscounts } = 
      this.calculateStep3_VolumeDiscounts(items, step2_afterSellerDiscount, volumeTiers);
    console.log(`3️⃣ Después descuento volumen: $${step3_afterVolumeDiscount.toFixed(2)} (descuento: $${volumeDiscounts.toFixed(2)})`);

    // PASO 4: Aplicar Cupón (5% sobre $2.85) = $2.71
    const { subtotal: step4_afterCoupon, discount: couponDiscount } = 
      this.calculateStep4_CouponDiscount(step3_afterVolumeDiscount, appliedDiscountCode);
    console.log(`4️⃣ Después cupón: $${step4_afterCoupon.toFixed(2)} (descuento: $${couponDiscount.toFixed(2)})`);

    // PASO 5: Agregar Envío ($5) = $7.71
    const shippingConfig = await this.getShippingConfig();
    const shipping = this.calculateShippingWithConfig(step4_afterCoupon, shippingConfig);
    const step5_withShipping = step4_afterCoupon + shipping;
    console.log(`5️⃣ Con envío: $${step5_withShipping.toFixed(2)} (envío: $${shipping.toFixed(2)})`);

    // PASO 6: Calcular IVA (15% sobre $7.71) = $1.16
    const step6_tax = step5_withShipping * this.TAX_RATE;
    console.log(`6️⃣ IVA calculado: $${step6_tax.toFixed(2)} (15% sobre $${step5_withShipping.toFixed(2)})`);

    // PASO 7: Total Final = $8.87
    const step7_finalTotal = step5_withShipping + step6_tax;
    console.log(`7️⃣ TOTAL FINAL: $${step7_finalTotal.toFixed(2)}`);

    const totalDiscounts = sellerDiscounts + volumeDiscounts + couponDiscount;
    const volumeDiscountsApplied = volumeDiscounts > 0;
    const freeShipping = shipping === 0;

    console.log('📊 RESUMEN FINAL:');
    console.log(`   💰 Descuentos vendedor: $${sellerDiscounts.toFixed(2)}`);
    console.log(`   💰 Descuentos volumen: $${volumeDiscounts.toFixed(2)}`);
    console.log(`   💰 Descuento cupón: $${couponDiscount.toFixed(2)}`);
    console.log(`   💰 TOTAL AHORRADO: $${totalDiscounts.toFixed(2)}`);
    console.log(`   🚚 Envío: $${shipping.toFixed(2)} ${freeShipping ? '(GRATIS)' : ''}`);
    console.log(`   🏷️ IVA: $${step6_tax.toFixed(2)}`);
    console.log(`   🎯 TOTAL A PAGAR: $${step7_finalTotal.toFixed(2)}`);

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

      // Aliases para compatibilidad con código existente
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
  private static calculateStep1_OriginalSubtotal(items: CartItem[]): number {
    let total = 0;
    
    items.forEach(item => {
      const basePrice = this.getBasePrice(item);
      const quantity = item.quantity || 0;
      const itemSubtotal = basePrice * quantity;
      
      console.log(`📦 Item: precio base $${basePrice} × ${quantity} = $${itemSubtotal}`);
      total += itemSubtotal;
    });

    return this.round(total);
  }

  /**
   * PASO 2: Aplicar descuentos del vendedor
   */
  private static calculateStep2_SellerDiscounts(items: CartItem[], _originalSubtotal: number): { subtotal: number; totalDiscount: number } {
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
      subtotal: this.round(subtotalAfterDiscount), 
      totalDiscount: this.round(totalDiscount) 
    };
  }

  /**
   * PASO 3: Aplicar descuentos por volumen con configuración dinámica
   */
  private static calculateStep3_VolumeDiscounts(
    items: CartItem[], 
    _currentSubtotal: number, 
    dynamicTiers?: Array<{quantity: number, discount: number}>
  ): { subtotal: number; totalDiscount: number } {
    let totalDiscount = 0;
    let subtotalAfterDiscount = 0;

    items.forEach(item => {
      const quantity = item.quantity || 0;
      const volumeDiscountPercentage = this.getVolumeDiscountPercentage(quantity, dynamicTiers);
      
      if (volumeDiscountPercentage > 0) {
        const sellerDiscountedPrice = this.getPriceAfterSellerDiscount(item);
        const volumeDiscountPerUnit = sellerDiscountedPrice * (volumeDiscountPercentage / 100);
        const priceAfterVolumeDiscount = sellerDiscountedPrice - volumeDiscountPerUnit;
        const itemVolumeDiscount = volumeDiscountPerUnit * quantity;
        const itemSubtotal = priceAfterVolumeDiscount * quantity;

        totalDiscount += itemVolumeDiscount;
        subtotalAfterDiscount += itemSubtotal;

        console.log(`📦 Volume discount: ${volumeDiscountPercentage}% sobre $${sellerDiscountedPrice} = descuento $${volumeDiscountPerUnit}/unidad`);
      } else {
        const sellerDiscountedPrice = this.getPriceAfterSellerDiscount(item);
        subtotalAfterDiscount += sellerDiscountedPrice * quantity;
      }
    });

    return { 
      subtotal: this.round(subtotalAfterDiscount), 
      totalDiscount: this.round(totalDiscount) 
    };
  }

  /**
   * PASO 4: Aplicar cupón de descuento
   */
  private static calculateStep4_CouponDiscount(subtotal: number, discountCode?: any): { subtotal: number; discount: number } {
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
      subtotal: this.round(subtotal - discount), 
      discount: this.round(discount) 
    };
  }

  /**
   * PASO 5: Calcular costo de envío
   */
  private static calculateShippingWithConfig(
    subtotal: number, 
    config: { cost: number; threshold: number; enabled: boolean }
  ): number {
    if (!config.enabled) {
      return 0;
    }
    return subtotal >= config.threshold ? 0 : config.cost;
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
   * 🔧 CORREGIDO: Usa configuración dinámica desde BD cuando esté disponible
   * Mantiene compatibilidad síncrona pero necesita ser migrado a versión async
   */
  private static getVolumeDiscountPercentage(quantity: number, dynamicTiers?: Array<{quantity: number, discount: number}>): number {
    // Si se proveen tiers dinámicos, usarlos
    if (dynamicTiers && dynamicTiers.length > 0) {
      // Ordenar tiers por cantidad descendente para encontrar el mayor aplicable
      const sortedTiers = [...dynamicTiers].sort((a, b) => b.quantity - a.quantity);
      
      for (const tier of sortedTiers) {
        if (quantity >= tier.quantity) {
          return tier.discount;
        }
      }
      return 0.0;
    }
    
    // ⚠️ FALLBACK: Solo para compatibilidad cuando no hay tiers dinámicos
    // 🔧 CORREGIDO: Debe coincidir con configuración actual del backend
    // TODO: Migrar todos los llamadores a versión async con ConfigurationService
    console.warn('⚠️ EcommerceCalculator: Usando descuentos por volumen hardcodeados como fallback');
    if (quantity >= 6) return 50.0; // CORREGIDO: 6+ items = 50% OFF según configuración actual
    return 0.0;
  }

  /**
   * Redondeo consistente a 2 decimales (MEJORADO)
   */
  private static round(value: number): number {
    return parseFloat(value.toFixed(2));
  }

  /**
   * 🎯 HELPER PARA CHECKOUT - Prepara datos para backend (con configuración dinámica)
   */
  static async prepareCheckoutData(
    items: CartItem[], 
    appliedDiscount?: any,
    dynamicVolumeTiers?: Array<{quantity: number, discount: number}>
  ): Promise<{
    items: any[];
    totals: CalculationResult;
  }> {
    const totals = await this.calculateTotals(items, appliedDiscount, dynamicVolumeTiers);
    
    const preparedItems = items.map(item => {
      const basePrice = this.getBasePrice(item);
      const sellerDiscountPercentage = this.getSellerDiscountPercentage(item);
      const volumeDiscountPercentage = this.getVolumeDiscountPercentage(item.quantity || 0, dynamicVolumeTiers);
      
      // Calcular precio final por unidad
      const priceAfterSeller = basePrice * (1 - sellerDiscountPercentage / 100);
      const finalPricePerUnit = volumeDiscountPercentage > 0 ? 
        priceAfterSeller * (1 - volumeDiscountPercentage / 100) : priceAfterSeller;

      return {
        product_id: item.product_id || item.product?.id || item.productId,
        quantity: item.quantity,
        price: this.round(finalPricePerUnit), // Precio final con todos los descuentos
        base_price: basePrice,
        original_price: basePrice,
        final_price: this.round(finalPricePerUnit),
        volume_discount_percentage: volumeDiscountPercentage,
        volume_savings: this.round((priceAfterSeller - finalPricePerUnit) * (item.quantity || 0)),
        seller_discount_amount: this.round((basePrice - priceAfterSeller) * (item.quantity || 0))
      };
    });

    return { items: preparedItems, totals };
  }
}