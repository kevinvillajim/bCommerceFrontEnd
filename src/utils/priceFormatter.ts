/**
 * 🎨 UTILIDADES DE FORMATEO PARA LA VISTA
 * 
 * Estas funciones se usan ÚNICAMENTE para mostrar valores al usuario.
 * NUNCA usar en cálculos o lógica de negocio.
 * 
 * El core de cálculos no redondea - solo el display.
 */

/**
 * Formatea un precio para mostrar al usuario con símbolo de moneda
 * @param price - Precio sin redondear del sistema
 * @param currency - Símbolo de moneda (por defecto '$')
 * @returns Precio formateado para display (ej: "$12.99")
 */
export function formatPrice(price: number, currency: string = '$'): string {
  const roundedPrice = Math.round(price * 100) / 100;
  return `${currency}${roundedPrice.toFixed(2)}`;
}

/**
 * Formatea un precio sin símbolo de moneda para display
 * @param price - Precio sin redondear del sistema
 * @returns Precio formateado (ej: "12.99")
 */
export function formatPriceValue(price: number): string {
  const roundedPrice = Math.round(price * 100) / 100;
  return roundedPrice.toFixed(2);
}

/**
 * Formatea un porcentaje para display
 * @param percentage - Porcentaje como número (ej: 15.5)
 * @returns Porcentaje formateado (ej: "15.5%")
 */
export function formatPercentage(percentage: number): string {
  const roundedPercentage = Math.round(percentage * 10) / 10;
  return `${roundedPercentage}%`;
}

/**
 * Redondea un valor SOLO para display - NO usar en cálculos
 * @param value - Valor sin redondear del sistema
 * @param decimals - Número de decimales (por defecto 2)
 * @returns Valor redondeado SOLO para mostrar al usuario
 */
export function roundForDisplay(value: number, decimals: number = 2): number {
  const factor = Math.pow(10, decimals);
  return Math.round(value * factor) / factor;
}

/**
 * Formatea ahorros con contexto para el usuario
 * @param savings - Ahorros sin redondear del sistema
 * @param currency - Símbolo de moneda
 * @returns Texto formateado (ej: "Ahorras $5.50")
 */
export function formatSavings(savings: number, currency: string = '$'): string {
  if (savings <= 0) return '';
  return `Ahorras ${formatPrice(savings, currency)}`;
}

/**
 * Formatea un total con separadores de miles para display
 * @param total - Total sin redondear del sistema
 * @param currency - Símbolo de moneda
 * @returns Total formateado (ej: "$1,234.56")
 */
export function formatTotal(total: number, currency: string = '$'): string {
  const roundedTotal = Math.round(total * 100) / 100;
  return `${currency}${roundedTotal.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })}`;
}

/**
 * Formatea descuento con etiqueta para el usuario
 * @param discountPercentage - Porcentaje de descuento
 * @param originalPrice - Precio original sin redondear
 * @param finalPrice - Precio final sin redondear
 * @returns Texto formateado (ej: "-15% ($3.00)")
 */
export function formatDiscountLabel(
  discountPercentage: number, 
  originalPrice: number, 
  finalPrice: number
): string {
  if (discountPercentage <= 0) return '';
  const savings = originalPrice - finalPrice;
  return `-${formatPercentage(discountPercentage)} (${formatPrice(savings)})`;
}

export default {
  formatPrice,
  formatPriceValue,
  formatPercentage,
  roundForDisplay,
  formatSavings,
  formatTotal,
  formatDiscountLabel
};