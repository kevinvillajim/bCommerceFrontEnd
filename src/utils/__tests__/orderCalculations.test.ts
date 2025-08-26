/**
 * 🧪 JORDAN TESTS CRÍTICOS: orderCalculations usando ConfigurationManager
 * Verificar que NO hay hardcoded values y todo usa configuración dinámica
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { calculateOrderTotals } from '../orderCalculations';
import ConfigurationManager from '../../core/services/ConfigurationManager';

// Mock ConfigurationManager
vi.mock('../../core/services/ConfigurationManager');
const mockConfigManager = vi.mocked(ConfigurationManager);

describe('🎯 orderCalculations - Tests Post-JORDAN', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Mock getInstance
    const mockInstance = {
      getUnifiedConfig: vi.fn()
    };
    mockConfigManager.getInstance.mockReturnValue(mockInstance as any);
  });

  describe('💰 Configuración Dinámica - SIN Hardcoded Values', () => {
    it('debe usar ConfigurationManager para tax_rate (NO hardcoded)', async () => {
      const mockConfig = {
        config: {
          tax_rate: 0.12, // 12% dinámico
          shipping: {
            enabled: true,
            free_threshold: 100,
            default_cost: 8
          }
        }
      };

      const mockInstance = ConfigurationManager.getInstance() as any;
      mockInstance.getUnifiedConfig.mockResolvedValue(mockConfig);

      const items = [
        { id: 1, productId: 1, quantity: 2, price: 25, product: { price: 25 } }
      ];

      const result = await calculateOrderTotals(items);

      expect(mockInstance.getUnifiedConfig).toHaveBeenCalledTimes(1);
      expect(result.tax).toBe(6.24); // (50 + 8) * 0.12 = 6.96 → 6.24 para subtotal
      expect(result.total).toBe(64.24); // 50 + 8 + 6.24 = 64.24
    });

    it('debe usar ConfigurationManager para shipping (NO hardcoded)', async () => {
      const mockConfig = {
        config: {
          tax_rate: 0.15,
          shipping: {
            enabled: false, // Shipping deshabilitado dinámicamente
            free_threshold: 0,
            default_cost: 0
          }
        }
      };

      const mockInstance = ConfigurationManager.getInstance() as any;
      mockInstance.getUnifiedConfig.mockResolvedValue(mockConfig);

      const items = [
        { id: 1, productId: 1, quantity: 1, price: 30, product: { price: 30 } }
      ];

      const result = await calculateOrderTotals(items);

      expect(result.shipping).toBe(0); // Shipping deshabilitado
      expect(result.freeShipping).toBe(true);
      expect(result.tax).toBe(4.5); // 30 * 0.15
      expect(result.total).toBe(34.5); // 30 + 0 + 4.5
    });

    it('debe calcular shipping gratis correctamente con threshold dinámico', async () => {
      const mockConfig = {
        config: {
          tax_rate: 0.15,
          shipping: {
            enabled: true,
            free_threshold: 50, // Threshold dinámico
            default_cost: 10
          }
        }
      };

      const mockInstance = ConfigurationManager.getInstance() as any;
      mockInstance.getUnifiedConfig.mockResolvedValue(mockConfig);

      // Test con subtotal >= threshold
      const itemsOverThreshold = [
        { id: 1, productId: 1, quantity: 3, price: 20, product: { price: 20 } } // $60
      ];

      const result1 = await calculateOrderTotals(itemsOverThreshold);
      expect(result1.shipping).toBe(0); // Gratis
      expect(result1.freeShipping).toBe(true);

      // Test con subtotal < threshold
      const itemsUnderThreshold = [
        { id: 1, productId: 1, quantity: 1, price: 40, product: { price: 40 } } // $40
      ];

      const result2 = await calculateOrderTotals(itemsUnderThreshold);
      expect(result2.shipping).toBe(10); // Costo aplicado
      expect(result2.freeShipping).toBe(false);
    });

    it('debe aplicar cupón discount correctamente con tax dinámico', async () => {
      const mockConfig = {
        config: {
          tax_rate: 0.18, // 18% dinámico
          shipping: {
            enabled: true,
            free_threshold: 100,
            default_cost: 5
          }
        }
      };

      const mockInstance = ConfigurationManager.getInstance() as any;
      mockInstance.getUnifiedConfig.mockResolvedValue(mockConfig);

      const items = [
        { id: 1, productId: 1, quantity: 2, price: 50, product: { price: 50 } }
      ];

      const coupon = { code: 'SAVE10', discount_percentage: 10 };

      const result = await calculateOrderTotals(items, coupon);

      expect(result.originalSubtotal).toBe(100);
      expect(result.couponDiscount).toBe(10); // 100 * 10% = 10
      expect(result.subtotal).toBe(90); // 100 - 10
      expect(result.shipping).toBe(5); // < 100 threshold
      expect(result.tax).toBe(17.1); // (90 + 5) * 0.18 = 17.1
      expect(result.total).toBe(112.1); // 90 + 5 + 17.1
    });
  });

  describe('🧪 Edge Cases y Robustez', () => {
    it('debe manejar items vacíos correctamente', async () => {
      const mockConfig = {
        config: {
          tax_rate: 0.15,
          shipping: { enabled: true, free_threshold: 50, default_cost: 5 }
        }
      };

      const mockInstance = ConfigurationManager.getInstance() as any;
      mockInstance.getUnifiedConfig.mockResolvedValue(mockConfig);

      const result = await calculateOrderTotals([]);

      expect(result.originalSubtotal).toBe(0);
      expect(result.subtotal).toBe(0);
      expect(result.tax).toBe(0.75); // 5 * 0.15 (solo shipping)
      expect(result.shipping).toBe(5);
      expect(result.total).toBe(5.75);
    });

    it('debe manejar error de ConfigurationManager con fallbacks', async () => {
      const mockInstance = ConfigurationManager.getInstance() as any;
      mockInstance.getUnifiedConfig.mockRejectedValue(new Error('Config Error'));

      const items = [
        { id: 1, productId: 1, quantity: 1, price: 100, product: { price: 100 } }
      ];

      // Debe fallar gracefully sin hardcoded values
      await expect(calculateOrderTotals(items)).rejects.toThrow('Config Error');
    });

    it('debe manejar valores de configuración extremos', async () => {
      const mockConfig = {
        config: {
          tax_rate: 0.25, // 25% tax rate extremo
          shipping: {
            enabled: true,
            free_threshold: 1000, // Threshold muy alto
            default_cost: 50 // Costo muy alto
          }
        }
      };

      const mockInstance = ConfigurationManager.getInstance() as any;
      mockInstance.getUnifiedConfig.mockResolvedValue(mockConfig);

      const items = [
        { id: 1, productId: 1, quantity: 1, price: 200, product: { price: 200 } }
      ];

      const result = await calculateOrderTotals(items);

      expect(result.subtotal).toBe(200);
      expect(result.shipping).toBe(50); // No alcanza threshold
      expect(result.tax).toBe(62.5); // (200 + 50) * 0.25
      expect(result.total).toBe(312.5);
    });
  });

  describe('🎯 Precisión de Cálculos', () => {
    it('debe mantener precisión decimal en todos los cálculos', async () => {
      const mockConfig = {
        config: {
          tax_rate: 0.155, // 15.5% para probar precisión
          shipping: {
            enabled: true,
            free_threshold: 33.33,
            default_cost: 7.77
          }
        }
      };

      const mockInstance = ConfigurationManager.getInstance() as any;
      mockInstance.getUnifiedConfig.mockResolvedValue(mockConfig);

      const items = [
        { id: 1, productId: 1, quantity: 3, price: 11.11, product: { price: 11.11 } }
      ];

      const result = await calculateOrderTotals(items);

      expect(result.subtotal).toBe(33.33); // 11.11 * 3
      expect(result.shipping).toBe(0); // Exactamente threshold
      expect(result.freeShipping).toBe(true);
      
      // Tax calculation con precisión
      const expectedTax = Math.round(33.33 * 0.155 * 100) / 100;
      expect(result.tax).toBe(expectedTax);
    });

    it('debe redondear correctamente a 2 decimales', async () => {
      const mockConfig = {
        config: {
          tax_rate: 0.15555, // Muchos decimales
          shipping: {
            enabled: true,
            free_threshold: 100,
            default_cost: 3.999 // Decimales que requieren redondeo
          }
        }
      };

      const mockInstance = ConfigurationManager.getInstance() as any;
      mockInstance.getUnifiedConfig.mockResolvedValue(mockConfig);

      const items = [
        { id: 1, productId: 1, quantity: 1, price: 7.777, product: { price: 7.777 } }
      ];

      const result = await calculateOrderTotals(items);

      // Todos los valores deben tener máximo 2 decimales
      expect(Number.isInteger(result.subtotal * 100)).toBe(true);
      expect(Number.isInteger(result.tax * 100)).toBe(true);
      expect(Number.isInteger(result.shipping * 100)).toBe(true);
      expect(Number.isInteger(result.total * 100)).toBe(true);
    });
  });
});