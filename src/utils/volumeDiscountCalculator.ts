// src/utils/volumeDiscountCalculator.ts

// import VolumeDiscountConfigService from '../core/services/VolumeDiscountConfigService'; // 🎯 JORDAN: Migrado a ConfigurationManager
import ConfigurationManager from '../core/services/ConfigurationManager';

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
 * 🎯 JORDAN: Servicio unificado para obtener configuración dinámica desde BD
 */
const configManager = ConfigurationManager.getInstance();

/**
 * 🔧 CORREGIDO: Configuración de descuentos por volumen por defecto actualizada
 * Coincide con ConfigurationManager: 3+ = 5%, 6+ = 10%, 12+ = 15%
 */
const DEFAULT_VOLUME_DISCOUNTS: VolumeDiscountTier[] = [
  { quantity: 3, discount: 5, label: "3+" },
  { quantity: 6, discount: 10, label: "6+" },
  { quantity: 12, discount: 15, label: "12+" }
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
      originalPrice: basePrice, // Sin redondeo - frontend manejará en vista
      discountedPrice: basePrice, // Sin redondeo - frontend manejará en vista
      discountPercentage: 0,
      savings: 0,
      savingsTotal: 0,
      hasDiscount: false,
      tierLabel: null
    };
  }

  const discountedPrice = basePrice * (1 - applicableTier.discount / 100); // Sin redondeo - frontend manejará
  const savings = basePrice - discountedPrice; // Sin redondeo - frontend manejará
  const savingsTotal = savings * quantity; // Sin redondeo - frontend manejará

  return {
    originalPrice: basePrice, // Sin redondeo - frontend manejará en vista
    discountedPrice: discountedPrice, // Sin redondeo - frontend manejará en vista
    discountPercentage: applicableTier.discount,
    savings: savings, // Sin redondeo - frontend manejará en vista
    savingsTotal: savingsTotal, // Sin redondeo - frontend manejará en vista
    hasDiscount: true,
    tierLabel: applicableTier.label
  };
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
  
  // 🎯 JORDAN: Si no se proveen tiers personalizados, obtenerlos desde ConfigurationManager
  if (!tiers) {
    try {
      const configResult = await configManager.getUnifiedConfig();
      if (configResult.config.volume_discounts && Array.isArray(configResult.config.volume_discounts) && configResult.config.volume_discounts.length > 0) {
        tiers = configResult.config.volume_discounts;
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
      originalPrice: basePrice, // Sin redondeo - frontend manejará en vista
      discountedPrice: basePrice, // Sin redondeo - frontend manejará en vista
      discountPercentage: 0,
      savings: 0,
      savingsTotal: 0,
      hasDiscount: false,
      tierLabel: null
    };
  }

  const discountedPrice = basePrice * (1 - applicableTier.discount / 100); // Sin redondeo - frontend manejará
  const savings = basePrice - discountedPrice; // Sin redondeo - frontend manejará
  const savingsTotal = savings * quantity; // Sin redondeo - frontend manejará

  return {
    originalPrice: basePrice, // Sin redondeo - frontend manejará en vista
    discountedPrice: discountedPrice, // Sin redondeo - frontend manejará en vista
    discountPercentage: applicableTier.discount,
    savings: savings, // Sin redondeo - frontend manejará en vista
    savingsTotal: savingsTotal, // Sin redondeo - frontend manejará en vista
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
  const sellerDiscountAmount = originalPrice * (sellerDiscountPercentage / 100); // Sin redondeo - frontend manejará
  const priceAfterSellerDiscount = originalPrice - sellerDiscountAmount; // Sin redondeo - frontend manejará
  
  // 2. Calcular descuento por volumen (sobre precio ya con descuento del seller)
  // NOTA: Usando versión síncrona con defaults para compatibilidad
  const volumeDiscount = calculateVolumeDiscount(priceAfterSellerDiscount, quantity);
  
  // 3. Precio final por unidad (después de ambos descuentos)
  const finalPricePerUnit = volumeDiscount.discountedPrice; // Sin redondeo - frontend manejará
  
  // 4. Ahorros totales (precisos)
  const totalSellerSavings = sellerDiscountAmount * quantity; // Sin redondeo - frontend manejará
  const totalVolumeSavings = volumeDiscount.savingsTotal; // Sin redondeo - frontend manejará
  const totalSavings = totalSellerSavings + totalVolumeSavings; // Sin redondeo - frontend manejará
  
  // 5. Determinar descuento principal a mostrar
  const hasVolumeDiscount = volumeDiscount.hasDiscount;
  const displayDiscountPercentage = hasVolumeDiscount ? 
    volumeDiscount.discountPercentage : sellerDiscountPercentage;
  
  return {
    originalPrice: originalPrice, // Sin redondeo - frontend manejará en vista
    discountedPrice: finalPricePerUnit, // Sin redondeo - frontend manejará en vista
    discountPercentage: displayDiscountPercentage,
    savings: originalPrice - finalPricePerUnit, // Sin redondeo - frontend manejará en vista
    savingsTotal: totalSavings, // Sin redondeo - frontend manejará en vista
    hasDiscount: sellerDiscountPercentage > 0 || hasVolumeDiscount,
    sellerDiscountAmount: sellerDiscountAmount, // Sin redondeo - frontend manejará en vista
    volumeDiscountAmount: volumeDiscount.savings, // Sin redondeo - frontend manejará en vista
    finalPricePerUnit: finalPricePerUnit // Sin redondeo - frontend manejará en vista
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
  const sellerDiscountAmount = originalPrice * (sellerDiscountPercentage / 100); // Sin redondeo - frontend manejará
  const priceAfterSellerDiscount = originalPrice - sellerDiscountAmount; // Sin redondeo - frontend manejará
  
  // 2. Calcular descuento por volumen (sobre precio ya con descuento del seller)
  // NOTA: Usando versión asíncrona que obtiene tiers de BD si no se proveen
  const volumeDiscount = await calculateVolumeDiscountAsync(priceAfterSellerDiscount, quantity, customTiers);
  
  // 3. Precio final por unidad (después de ambos descuentos)
  const finalPricePerUnit = volumeDiscount.discountedPrice; // Sin redondeo - frontend manejará
  
  // 4. Ahorros totales (precisos)
  const totalSellerSavings = sellerDiscountAmount * quantity; // Sin redondeo - frontend manejará
  const totalVolumeSavings = volumeDiscount.savingsTotal; // Sin redondeo - frontend manejará
  const totalSavings = totalSellerSavings + totalVolumeSavings; // Sin redondeo - frontend manejará
  
  // 5. Determinar descuento principal a mostrar
  const hasVolumeDiscount = volumeDiscount.hasDiscount;
  const displayDiscountPercentage = hasVolumeDiscount ? 
    volumeDiscount.discountPercentage : sellerDiscountPercentage;
  
  return {
    originalPrice: originalPrice, // Sin redondeo - frontend manejará en vista
    discountedPrice: finalPricePerUnit, // Sin redondeo - frontend manejará en vista
    discountPercentage: displayDiscountPercentage,
    savings: originalPrice - finalPricePerUnit, // Sin redondeo - frontend manejará en vista
    savingsTotal: totalSavings, // Sin redondeo - frontend manejará en vista
    hasDiscount: sellerDiscountPercentage > 0 || hasVolumeDiscount,
    sellerDiscountAmount: sellerDiscountAmount, // Sin redondeo - frontend manejará en vista
    volumeDiscountAmount: volumeDiscount.savings, // Sin redondeo - frontend manejará en vista
    finalPricePerUnit: finalPricePerUnit // Sin redondeo - frontend manejará en vista
  };
}