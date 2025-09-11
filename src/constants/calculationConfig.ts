/**
 * 🧮 CONFIGURACIÓN DE CÁLCULOS Y PRECISIÓN
 * Configuraciones centralizadas para tolerancias de precisión y validaciones de cálculos
 */

// Obtener configuraciones del environment o usar valores por defecto
const getNumericEnvVar = (key: string, defaultValue: number): number => {
  const value = import.meta.env?.[key];
  if (value && !isNaN(Number(value))) {
    return Number(value);
  }
  return defaultValue;
};

export const CALCULATION_CONFIG = {
  
  // 💰 CONFIGURACIÓN DE PRECISIÓN FINANCIERA
  PRECISION: {
    // Tolerancia para comparaciones de totales entre frontend y backend
    // Recomendado: 0.001 para evitar errores de precisión flotante sin ser demasiado permisivo
    PRICE_COMPARISON_TOLERANCE: getNumericEnvVar('VITE_PRICE_TOLERANCE', 0.001),
    
    // Decimales para mostrar precios al usuario
    DISPLAY_DECIMALS: getNumericEnvVar('VITE_PRICE_DECIMALS', 2),
    
    // Tolerancia para validaciones de descuentos
    DISCOUNT_TOLERANCE: getNumericEnvVar('VITE_DISCOUNT_TOLERANCE', 0.001),
  },

  // 🧮 CONFIGURACIÓN DE VALIDACIONES
  VALIDATIONS: {
    // Tolerancia para validaciones de totales de checkout
    CHECKOUT_TOLERANCE: getNumericEnvVar('VITE_CHECKOUT_TOLERANCE', 0.001),
    
    // Tolerancia para comparaciones de subtotales
    SUBTOTAL_TOLERANCE: getNumericEnvVar('VITE_SUBTOTAL_TOLERANCE', 0.001),
    
    // Tolerancia para comparaciones de impuestos
    TAX_TOLERANCE: getNumericEnvVar('VITE_TAX_TOLERANCE', 0.001),
  },

  // 🔍 CONFIGURACIÓN DE DEBUG
  DEBUG: {
    // Mostrar logs detallados de cálculos (solo en desarrollo)
    SHOW_CALCULATION_LOGS: import.meta.env?.VITE_DEBUG_CALCULATIONS === 'true' || import.meta.env?.NODE_ENV === 'development',
    
    // Mostrar diferencias de precisión en consola
    SHOW_PRECISION_WARNINGS: import.meta.env?.VITE_DEBUG_PRECISION === 'true' || import.meta.env?.NODE_ENV === 'development',
  }
  
} as const;

/**
 * 🛠️ UTILITARIO: Comparar dos valores numéricos con tolerancia
 */
export const isNumberEqual = (a: number, b: number, tolerance: number = CALCULATION_CONFIG.PRECISION.PRICE_COMPARISON_TOLERANCE): boolean => {
  const difference = Math.abs(a - b);
  const isEqual = difference <= tolerance;
  
  // Log en desarrollo si hay diferencias detectables
  if (CALCULATION_CONFIG.DEBUG.SHOW_PRECISION_WARNINGS && difference > 0 && difference <= tolerance) {
    console.warn(`⚠️ Diferencia de precisión detectada: ${a} vs ${b} (diff: ${difference.toFixed(6)}, tolerance: ${tolerance})`);
  }
  
  return isEqual;
};

/**
 * 🛠️ UTILITARIO: Validar que dos totales sean equivalentes
 */
export const validateTotalsEquality = (
  frontendTotal: number, 
  backendTotal: number, 
  context: string = 'Comparación de totales',
  customTolerance?: number
): boolean => {
  const tolerance = customTolerance ?? CALCULATION_CONFIG.VALIDATIONS.CHECKOUT_TOLERANCE;
  const difference = Math.abs(frontendTotal - backendTotal);
  const isValid = difference <= tolerance;
  
  if (CALCULATION_CONFIG.DEBUG.SHOW_CALCULATION_LOGS) {
    console.log(`🔍 ${context}:`, {
      frontendTotal: frontendTotal.toFixed(6),
      backendTotal: backendTotal.toFixed(6),
      difference: difference.toFixed(6),
      tolerance: tolerance.toFixed(6),
      isValid,
      status: isValid ? '✅ VÁLIDO' : '❌ DISCREPANCIA'
    });
  }
  
  return isValid;
};

export default CALCULATION_CONFIG;