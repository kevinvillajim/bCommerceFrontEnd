// src/utils/volumeDiscountCalculator.ts

import VolumeDiscountConfigService from '../core/services/VolumeDiscountConfigService';

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
 * Servicio para obtener configuración dinámica desde BD
 */
const volumeDiscountService = VolumeDiscountConfigService.getInstance();

/**
 * 🔧 CORREGIDO: Configuración de descuentos por volumen por defecto actualizada
 * Debe coincidir con la configuración actual del backend: "3+ = 50% 'Nuevo descuento'"
 */
const DEFAULT_VOLUME_DISCOUNTS: VolumeDiscountTier[] = [
  { quantity: 3, discount: 50, label: "Nuevo descuento" }
];

/**
 * Calcula descuentos por volumen para un item del carrito
 * NOTA: Esta es la versión síncrona. Para aplicaciones real-time, usar calculateVolumeDiscountAsync
 */
export function calculateVolumeDiscount(
  basePrice: number,
  quantity: number,
  customTiers?: VolumeDiscountTier[]
): VolumeDiscountResult {
  
  // Si se proveen tiers personalizados, usarlos. Si no, usar los por defecto
  // NOTA: Esta función es síncrona para compatibilidad con código existente
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
 * Calcula descuentos por volumen de manera asíncrona usando configuración de BD
 */
export async function calculateVolumeDiscountAsync(
  basePrice: number,
  quantity: number,
  customTiers?: VolumeDiscountTier[]
): Promise<VolumeDiscountResult> {
  
  let tiers = customTiers;
  
  // Si no se proveen tiers personalizados, obtenerlos de la BD
  if (!tiers) {
    try {
      const config = await volumeDiscountService.getVolumeDiscountConfig();
      if (config.enabled) {
        tiers = config.default_tiers;
      }
    } catch (error) {
      console.warn('Error obteniendo configuración de descuentos, usando defaults:', error);
      tiers = DEFAULT_VOLUME_DISCOUNTS;
    }
  }
  
  if (!tiers || tiers.length === 0) {
    tiers = DEFAULT_VOLUME_DISCOUNTS;
  }
  
  // Buscar el descuento aplicable para la cantidad
  let applicableTier: VolumeDiscountTier | null = null;
  
  // Ordenar tiers por cantidad ascendente
  const sortedTiers = [...tiers].sort((a, b) => a.quantity - b.quantity);
  
  for (const tier of sortedTiers) {
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

/**
 * ✅ FUNCIÓN PRINCIPAL: Calcula todos los descuentos para un item del carrito
 * Incluye descuento del seller + descuento por volumen
 * SECUENCIA EXACTA: Precio Normal → Descuento del vendedor → Descuento por volumen → Descuento cupón → IVA
 * NOTA: Esta es la versión síncrona para compatibilidad. Para tiers dinámicos usar calculateCartItemDiscountsAsync
 */
export function calculateCartItemDiscounts(cartItem: any): CartItemWithDiscounts['discount'] {
  
  const originalPrice = cartItem.product?.price || cartItem.price || 0;
  const sellerDiscountPercentage = cartItem.product?.discount_percentage || 0;
  const quantity = cartItem.quantity || 1;
  
  // 1. Calcular descuento del seller (sobre precio original)
  const sellerDiscountAmount = roundToPrecision(originalPrice * (sellerDiscountPercentage / 100));
  const priceAfterSellerDiscount = roundToPrecision(originalPrice - sellerDiscountAmount);
  
  // 2. Calcular descuento por volumen (sobre precio ya con descuento del seller)
  // NOTA: Usando versión síncrona con defaults para compatibilidad
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

/**
 * ✅ FUNCIÓN PRINCIPAL ASÍNCRONA: Calcula todos los descuentos con configuración dinámica de BD
 * Incluye descuento del seller + descuento por volumen desde BD
 * SECUENCIA EXACTA: Precio Normal → Descuento del vendedor → Descuento por volumen → Descuento cupón → IVA
 */
export async function calculateCartItemDiscountsAsync(cartItem: any, customTiers?: VolumeDiscountTier[]): Promise<CartItemWithDiscounts['discount']> {
  
  const originalPrice = cartItem.product?.price || cartItem.price || 0;
  const sellerDiscountPercentage = cartItem.product?.discount_percentage || 0;
  const quantity = cartItem.quantity || 1;
  
  // 1. Calcular descuento del seller (sobre precio original)
  const sellerDiscountAmount = roundToPrecision(originalPrice * (sellerDiscountPercentage / 100));
  const priceAfterSellerDiscount = roundToPrecision(originalPrice - sellerDiscountAmount);
  
  // 2. Calcular descuento por volumen (sobre precio ya con descuento del seller)
  // NOTA: Usando versión asíncrona que obtiene tiers de BD si no se proveen
  const volumeDiscount = await calculateVolumeDiscountAsync(priceAfterSellerDiscount, quantity, customTiers);
  
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