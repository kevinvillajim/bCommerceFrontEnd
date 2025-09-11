/**
 * 🔄 MIGRACIÓN A CALCULADORA CENTRALIZADA
 * Este archivo ahora redirige a EcommerceCalculator para mantener compatibilidad
 * TODO: Eventualmente, migrar todos los imports directamente a EcommerceCalculator
 */

import { EcommerceCalculator } from "./ecommerceCalculator";
import type { CalculationResult } from "./ecommerceCalculator";

// Helper para DISPLAY ÚNICAMENTE - NO usar en cálculos (mantenido por compatibilidad)
export function roundToPrecision(value: number, decimals: number = 2): number {
  console.warn("⚠️ roundToPrecision está obsoleto - usar priceFormatter.roundForDisplay() para display");
  return Math.round(value * Math.pow(10, decimals)) / Math.pow(10, decimals);
}

/**
 * ✅ FUNCIÓN PRINCIPAL MIGRADA
 * Ahora usa EcommerceCalculator para garantizar consistencia total
 */
export async function calculateTotals(cartItems: any[], appliedDiscount: any = null): Promise<CalculationResult> {
  console.log("⚠️ USANDO FUNCIÓN LEGACY - MIGRAR A EcommerceCalculator.calculateTotals()");
  
  // ✅ DELEGAR A CALCULADORA CENTRALIZADA
  return await EcommerceCalculator.calculateTotals(cartItems, appliedDiscount);
}

// Exportar tipos para compatibilidad
export type { CalculationResult } from "./ecommerceCalculator";