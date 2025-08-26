/**
 * 🧮 CALCULADORA DE DESGLOSE DE DESCUENTOS POR ITEM
 * Reconstruye el paso a paso de descuentos para un producto individual en una orden
 * Basada en la lógica de EcommerceCalculator pero para items individuales
 */

export interface ItemDiscountStep {
  label: string;
  value: number;
  percentage?: number;
  isDiscount?: boolean;
}

export interface ItemDiscountBreakdown {
  originalPricePerUnit: number;
  quantity: number;
  steps: ItemDiscountStep[];
  finalPricePerUnit: number;
  finalTotal: number;
  totalDiscounts: number;
  hasDiscounts: boolean;
}

/**
 * Calcula el desglose detallado de descuentos para un item de orden
 * Reconstruye los pasos: Precio Normal → Descuento vendedor → Descuento volumen → Cupón
 */
export function calculateItemDiscountBreakdown(
  item: any,
  orderData?: {
    pricingBreakdown?: any;
    appliedCouponPercentage?: number;
  }
): ItemDiscountBreakdown {
  
  const quantity = item.quantity || 1;
  // Usar los nuevos campos que vienen del backend
  const originalPricePerUnit = item.original_price_per_unit || item.originalPrice / quantity || item.price / quantity || 0;
  const finalPricePerUnit = item.price / quantity || 0;
  
  console.log(`🔍 Calculando desglose para item:`, {
    name: item.name,
    quantity,
    originalPricePerUnit,
    finalPricePerUnit,
    volumeDiscountPercentage: item.volumeDiscountPercentage,
    orderData
  });

  const steps: ItemDiscountStep[] = [];
  let currentPricePerUnit = originalPricePerUnit;

  // PASO 1: Precio Normal
  steps.push({
    label: "Precio Normal",
    value: roundForDisplay(originalPricePerUnit),
    isDiscount: false
  });

  // PASO 2: Descuento del Vendedor (usar el valor que viene del backend)
  const sellerDiscountPercentage = item.seller_discount_percentage || calculateSellerDiscountFromItem(item, originalPricePerUnit);
  if (sellerDiscountPercentage > 0) {
    const sellerDiscountAmount = originalPricePerUnit * (sellerDiscountPercentage / 100);
    currentPricePerUnit = originalPricePerUnit - sellerDiscountAmount;
    
    steps.push({
      label: `Descuento Vendedor ${sellerDiscountPercentage}%`,
      value: roundForDisplay(currentPricePerUnit),
      percentage: sellerDiscountPercentage,
      isDiscount: true
    });
  }

  // PASO 3: Descuento por Volumen (usar el valor que viene del backend)
  const volumeDiscountPercentage = item.volume_discount_percentage || item.volumeDiscountPercentage || 0;
  if (volumeDiscountPercentage > 0) {
    const volumeDiscountAmount = currentPricePerUnit * (volumeDiscountPercentage / 100);
    currentPricePerUnit = currentPricePerUnit - volumeDiscountAmount;
    
    steps.push({
      label: `Descuento por Volumen ${volumeDiscountPercentage}%`,
      value: roundForDisplay(currentPricePerUnit),
      percentage: volumeDiscountPercentage,
      isDiscount: true
    });
  }

  // PASO 4: Descuento por Cupón (si existe)
  const couponDiscount = calculateCouponDiscountFromOrder(currentPricePerUnit, orderData);
  if (couponDiscount.percentage > 0) {
    const couponDiscountAmount = currentPricePerUnit * (couponDiscount.percentage / 100);
    currentPricePerUnit = currentPricePerUnit - couponDiscountAmount;
    
    steps.push({
      label: `Descuento Cupón ${couponDiscount.percentage}%`,
      value: roundForDisplay(currentPricePerUnit),
      percentage: couponDiscount.percentage,
      isDiscount: true
    });
  }

  // Cálculos finales
  const finalTotal = roundForDisplay(currentPricePerUnit * quantity);
  const totalDiscounts = roundForDisplay((originalPricePerUnit - currentPricePerUnit) * quantity);
  const hasDiscounts = steps.some(step => step.isDiscount);

  console.log(`✅ Desglose calculado:`, {
    originalPricePerUnit: roundForDisplay(originalPricePerUnit),
    finalPricePerUnit: roundForDisplay(currentPricePerUnit),
    finalTotal,
    totalDiscounts,
    stepsCount: steps.length
  });

  return {
    originalPricePerUnit: roundForDisplay(originalPricePerUnit),
    quantity,
    steps,
    finalPricePerUnit: roundForDisplay(currentPricePerUnit),
    finalTotal,
    totalDiscounts,
    hasDiscounts
  };
}

/**
 * Calcula el porcentaje de descuento del vendedor basándose en los datos del item
 */
function calculateSellerDiscountFromItem(item: any, originalPricePerUnit: number): number {
  // Si tenemos información directa del descuento del vendedor
  if (item.seller_discount_percentage) {
    return item.seller_discount_percentage;
  }

  // Si tenemos volume discount, necesitamos calcular qué parte era del seller
  if (item.volumeDiscountPercentage && item.originalPrice && item.price) {
    const finalPricePerUnit = item.price / item.quantity;
    // const totalDiscountPerUnit = originalPricePerUnit - finalPricePerUnit;
    
    // Calcular el descuento por volumen
    const priceBeforeVolume = finalPricePerUnit / (1 - item.volumeDiscountPercentage / 100);
    const sellerDiscountAmount = originalPricePerUnit - priceBeforeVolume;
    
    if (sellerDiscountAmount > 0) {
      return roundForDisplay((sellerDiscountAmount / originalPricePerUnit) * 100);
    }
  }

  // Fallback: si hay descuento pero no volumen, asumimos que es todo del seller
  if (originalPricePerUnit > (item.price / item.quantity)) {
    const discountAmount = originalPricePerUnit - (item.price / item.quantity);
    if (!item.volumeDiscountPercentage) {
      return roundForDisplay((discountAmount / originalPricePerUnit) * 100);
    }
  }

  return 0;
}

/**
 * Calcula el descuento de cupón basándose en los datos de la orden
 */
function calculateCouponDiscountFromOrder(
  currentPrice: number, 
  orderData?: { pricingBreakdown?: any; appliedCouponPercentage?: number }
): { percentage: number; amount: number } {
  
  if (!orderData) {
    return { percentage: 0, amount: 0 };
  }

  // Buscar información del cupón en pricing_breakdown
  if (orderData.pricingBreakdown) {
    let pricingData: any = {};
    try {
      pricingData = typeof orderData.pricingBreakdown === 'string' 
        ? JSON.parse(orderData.pricingBreakdown)
        : orderData.pricingBreakdown;
    } catch (e) {
      console.warn('Error parsing pricing_breakdown:', e);
    }

    // Si hay descuento por feedback/cupón en los datos
    if (pricingData.feedback_discount && pricingData.feedback_discount > 0) {
      // El cupón se aplica sobre el subtotal, necesitamos estimar el porcentaje
      // Típicamente los cupones son 5% o 10%
      const estimatedPercentage = 5; // Valor común para cupones de feedback
      return { 
        percentage: estimatedPercentage, 
        amount: roundForDisplay(currentPrice * (estimatedPercentage / 100)) 
      };
    }
  }

  // Usar parámetro directo si está disponible
  if (orderData.appliedCouponPercentage && orderData.appliedCouponPercentage > 0) {
    return { 
      percentage: orderData.appliedCouponPercentage,
      amount: roundForDisplay(currentPrice * (orderData.appliedCouponPercentage / 100))
    };
  }

  return { percentage: 0, amount: 0 };
}

/**
 * Redondeo para DISPLAY ÚNICAMENTE - Este archivo es para presentación
 */
function roundForDisplayForDisplay(value: number): number {
  return parseFloat(value.toFixed(2));
}