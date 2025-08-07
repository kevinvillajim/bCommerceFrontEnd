// src/utils/volumeDiscountCalculator.ts

// ✅ TIPOS ACTUALIZADOS para compatibilidad con CartPage
export interface VolumeDiscountTier {
  quantity: number;
  discount: number;
  label: string;
}

export interface VolumeDiscountResult {
  originalPrice: number;
  discountedPrice: number;
  discountPercentage: number;
  savings: number;
  savingsTotal: number;
  hasDiscount: boolean;
  tierLabel: string | null;
}

// ✅ NUEVO: Interface para items del carrito con descuentos aplicados
export interface CartItemWithDiscounts {
  id: number;
  productId: number;
  quantity: number;
  price: number; // Precio base original
  product: any;
  imageUrl: string;
  // ✅ NUEVO: Información de descuentos calculados
  discount: {
    originalPrice: number;
    discountedPrice: number;
    discountPercentage: number;
    savings: number;
    savingsTotal: number;
    hasDiscount: boolean;
    sellerDiscountAmount: number;
    volumeDiscountAmount: number;
    finalPricePerUnit: number;
  };
}

/**
 * Configuración de descuentos por volumen por defecto
 */
const DEFAULT_VOLUME_DISCOUNTS: VolumeDiscountTier[] = [
  { quantity: 3, discount: 5, label: "5% off en 3+" },
  { quantity: 5, discount: 8, label: "8% off en 5+" },
  { quantity: 6, discount: 10, label: "10% off en 6+" },
  { quantity: 10, discount: 15, label: "15% off en 10+" }
];

/**
 * Calcula descuentos por volumen para un item del carrito
 */
export function calculateVolumeDiscount(
  basePrice: number,
  quantity: number,
  customTiers?: VolumeDiscountTier[]
): VolumeDiscountResult {
  
  const tiers = customTiers || DEFAULT_VOLUME_DISCOUNTS;
  
  // Buscar el descuento aplicable para la cantidad
  let applicableTier: VolumeDiscountTier | null = null;
  
  for (const tier of tiers) {
    if (quantity >= tier.quantity) {
      applicableTier = tier;
    } else {
      break; // Los tiers están ordenados por cantidad
    }
  }

  if (!applicableTier) {
    return {
      originalPrice: roundToPrecision(basePrice),
      discountedPrice: roundToPrecision(basePrice),
      discountPercentage: 0,
      savings: 0,
      savingsTotal: 0,
      hasDiscount: false,
      tierLabel: null
    };
  }

  const discountedPrice = roundToPrecision(basePrice * (1 - applicableTier.discount / 100));
  const savings = roundToPrecision(basePrice - discountedPrice);
  const savingsTotal = roundToPrecision(savings * quantity);

  return {
    originalPrice: roundToPrecision(basePrice),
    discountedPrice: discountedPrice,
    discountPercentage: applicableTier.discount,
    savings: savings,
    savingsTotal: savingsTotal,
    hasDiscount: true,
    tierLabel: applicableTier.label
  };
}

// Helper function for precise decimal calculations
function roundToPrecision(value: number, decimals: number = 2): number {
  return Math.round(value * Math.pow(10, decimals)) / Math.pow(10, decimals);
}

/**
 * ✅ FUNCIÓN PRINCIPAL: Calcula todos los descuentos para un item del carrito
 * Incluye descuento del seller + descuento por volumen
 * SECUENCIA EXACTA: Precio Normal → Descuento del vendedor → Descuento por volumen → Descuento cupón → IVA
 */
export function calculateCartItemDiscounts(cartItem: any): CartItemWithDiscounts['discount'] {
  
  const originalPrice = cartItem.product?.price || cartItem.price || 0;
  const sellerDiscountPercentage = cartItem.product?.discount_percentage || 0;
  const quantity = cartItem.quantity || 1;
  
  // 1. Calcular descuento del seller (sobre precio original)
  const sellerDiscountAmount = roundToPrecision(originalPrice * (sellerDiscountPercentage / 100));
  const priceAfterSellerDiscount = roundToPrecision(originalPrice - sellerDiscountAmount);
  
  // 2. Calcular descuento por volumen (sobre precio ya con descuento del seller)
  const volumeDiscount = calculateVolumeDiscount(priceAfterSellerDiscount, quantity);
  
  // 3. Precio final por unidad (después de ambos descuentos)
  const finalPricePerUnit = roundToPrecision(volumeDiscount.discountedPrice);
  
  // 4. Ahorros totales (precisos)
  const totalSellerSavings = roundToPrecision(sellerDiscountAmount * quantity);
  const totalVolumeSavings = roundToPrecision(volumeDiscount.savingsTotal);
  const totalSavings = roundToPrecision(totalSellerSavings + totalVolumeSavings);
  
  // 5. Determinar descuento principal a mostrar
  const hasVolumeDiscount = volumeDiscount.hasDiscount;
  const displayDiscountPercentage = hasVolumeDiscount ? 
    volumeDiscount.discountPercentage : sellerDiscountPercentage;
  
  return {
    originalPrice: roundToPrecision(originalPrice),
    discountedPrice: finalPricePerUnit,
    discountPercentage: displayDiscountPercentage,
    savings: roundToPrecision(originalPrice - finalPricePerUnit),
    savingsTotal: totalSavings,
    hasDiscount: sellerDiscountPercentage > 0 || hasVolumeDiscount,
    sellerDiscountAmount: roundToPrecision(sellerDiscountAmount),
    volumeDiscountAmount: roundToPrecision(volumeDiscount.savings),
    finalPricePerUnit: finalPricePerUnit
  };
}