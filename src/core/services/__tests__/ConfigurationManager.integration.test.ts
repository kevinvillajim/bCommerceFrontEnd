/**
 * 🧪 JORDAN FASE CRÍTICA: Tests de integración exhaustivos para ConfigurationManager
 * Verificar que TODA la arquitectura funcione correctamente después de la limpieza
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import ConfigurationManager from '../ConfigurationManager';
import ApiClient from '../../../infrastructure/api/apiClient';

// Mock ApiClient
vi.mock('../../../infrastructure/api/apiClient');
const mockApiClient = vi.mocked(ApiClient);

describe('🎯 ConfigurationManager - Tests Críticos Post-Limpieza', () => {
  let configManager: ConfigurationManager;

  beforeEach(() => {
    // Limpiar singleton antes de cada test
    (ConfigurationManager as any).instance = null;
    configManager = ConfigurationManager.getInstance();
    
    // Limpiar cache antes de cada test
    configManager.invalidateCache();
    
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('🏗️ Arquitectura Limpia - Sin Fragmentación', () => {
    it('debe ser único singleton después de limpieza', () => {
      const instance1 = ConfigurationManager.getInstance();
      const instance2 = ConfigurationManager.getInstance();
      
      expect(instance1).toBe(instance2);
      expect(instance1).toBe(configManager);
    });

    it('debe gestionar cache correctamente sin servicios legacy', async () => {
      // Mock respuestas exitosas
      mockApiClient.get.mockResolvedValueOnce({ platform_commission_rate: 10.0 });
      mockApiClient.get.mockResolvedValueOnce({ 
        enabled: true, 
        free_threshold: 50.0, 
        default_cost: 5.0 
      });
      mockApiClient.get.mockResolvedValueOnce([
        { quantity: 3, discount: 5, label: "3+" }
      ]);
      mockApiClient.get.mockResolvedValueOnce({
        seller_percentage_single: 80.0,
        seller_percentage_max_multi: 40.0
      });
      mockApiClient.get.mockResolvedValueOnce({ tax_rate: 15.0 });

      // Primera llamada - debe hacer requests a APIs
      const result1 = await configManager.getUnifiedConfig();
      expect(mockApiClient.get).toHaveBeenCalledTimes(5);

      // Segunda llamada - debe usar cache
      const result2 = await configManager.getUnifiedConfig();
      expect(mockApiClient.get).toHaveBeenCalledTimes(5); // Sin llamadas adicionales

      expect(result1).toEqual(result2);
      expect(result1.source).toBe('api');
      expect(result2.source).toBe('cache');
    });

    it('debe invalidar cache correctamente', async () => {
      // Mock inicial
      mockApiClient.get.mockResolvedValueOnce({ platform_commission_rate: 10.0 });
      mockApiClient.get.mockResolvedValueOnce({ 
        enabled: true, 
        free_threshold: 50.0, 
        default_cost: 5.0 
      });
      mockApiClient.get.mockResolvedValueOnce([]);
      mockApiClient.get.mockResolvedValueOnce({
        seller_percentage_single: 80.0,
        seller_percentage_max_multi: 40.0
      });
      mockApiClient.get.mockResolvedValueOnce({ tax_rate: 15.0 });

      await configManager.getUnifiedConfig();
      expect(mockApiClient.get).toHaveBeenCalledTimes(5);

      // Invalidar cache
      configManager.invalidateCache();

      // Mock para segunda llamada
      mockApiClient.get.mockResolvedValueOnce({ platform_commission_rate: 12.0 });
      mockApiClient.get.mockResolvedValueOnce({ 
        enabled: false, 
        free_threshold: 0, 
        default_cost: 0 
      });
      mockApiClient.get.mockResolvedValueOnce([]);
      mockApiClient.get.mockResolvedValueOnce({
        seller_percentage_single: 70.0,
        seller_percentage_max_multi: 35.0
      });
      mockApiClient.get.mockResolvedValueOnce({ tax_rate: 12.0 });

      const result = await configManager.getUnifiedConfig();
      expect(mockApiClient.get).toHaveBeenCalledTimes(10); // 5 + 5 nuevas llamadas
      expect(result.config.platform_commission_rate).toBe(0.12); // 12% → 0.12
      expect(result.config.tax_rate).toBe(0.12); // 12% → 0.12
    });
  });

  describe('💰 Configuraciones Financieras Críticas', () => {
    it('debe convertir tax_rate correctamente (% → decimal)', async () => {
      mockApiClient.get.mockResolvedValueOnce({ platform_commission_rate: 10.0 });
      mockApiClient.get.mockResolvedValueOnce({ 
        enabled: true, 
        free_threshold: 50.0, 
        default_cost: 5.0 
      });
      mockApiClient.get.mockResolvedValueOnce([]);
      mockApiClient.get.mockResolvedValueOnce({
        seller_percentage_single: 80.0,
        seller_percentage_max_multi: 40.0
      });
      mockApiClient.get.mockResolvedValueOnce({ tax_rate: 15.0 }); // 15%

      const result = await configManager.getUnifiedConfig();
      
      expect(result.config.tax_rate).toBe(0.15); // Debe ser decimal
      expect(result.config.platform_commission_rate).toBe(0.10); // Debe ser decimal
    });

    it('debe convertir shipping configuration correctamente', async () => {
      mockApiClient.get.mockResolvedValueOnce({ platform_commission_rate: 10.0 });
      mockApiClient.get.mockResolvedValueOnce({ 
        enabled: true, 
        free_threshold: 50.0, 
        default_cost: 5.0 
      });
      mockApiClient.get.mockResolvedValueOnce([]);
      mockApiClient.get.mockResolvedValueOnce({
        seller_percentage_single: 80.0,
        seller_percentage_max_multi: 40.0
      });
      mockApiClient.get.mockResolvedValueOnce({ tax_rate: 15.0 });

      const result = await configManager.getUnifiedConfig();
      
      expect(result.config.shipping.enabled).toBe(true);
      expect(result.config.shipping.free_threshold).toBe(50.0);
      expect(result.config.shipping.default_cost).toBe(5.0);
    });

    it('debe manejar volume discounts correctamente', async () => {
      mockApiClient.get.mockResolvedValueOnce({ platform_commission_rate: 10.0 });
      mockApiClient.get.mockResolvedValueOnce({ 
        enabled: true, 
        free_threshold: 50.0, 
        default_cost: 5.0 
      });
      mockApiClient.get.mockResolvedValueOnce([
        { quantity: 3, discount: 5, label: "3+" },
        { quantity: 5, discount: 8, label: "5+" },
        { quantity: 10, discount: 15, label: "10+" }
      ]);
      mockApiClient.get.mockResolvedValueOnce({
        seller_percentage_single: 80.0,
        seller_percentage_max_multi: 40.0
      });
      mockApiClient.get.mockResolvedValueOnce({ tax_rate: 15.0 });

      const result = await configManager.getUnifiedConfig();
      
      expect(result.config.volume_discounts).toHaveLength(3);
      expect(result.config.volume_discounts[0]).toEqual({
        quantity: 3,
        discount: 5,
        label: "3+"
      });
    });
  });

  describe('🚨 Manejo de Errores Robusto', () => {
    it('debe usar fallbacks cuando todas las APIs fallan', async () => {
      mockApiClient.get.mockRejectedValue(new Error('Network Error'));

      const result = await configManager.getUnifiedConfig();
      
      expect(result.errors).toHaveLength(5); // Una por cada endpoint
      expect(result.config.tax_rate).toBe(0.15); // Fallback
      expect(result.config.platform_commission_rate).toBe(0.10); // Fallback
      expect(result.config.shipping.enabled).toBe(true); // Fallback
    });

    it('debe manejar APIs parcialmente fallidas', async () => {
      mockApiClient.get.mockResolvedValueOnce({ platform_commission_rate: 12.0 }); // ✅
      mockApiClient.get.mockRejectedValueOnce(new Error('Shipping API Error')); // ❌
      mockApiClient.get.mockResolvedValueOnce([]); // ✅
      mockApiClient.get.mockResolvedValueOnce({
        seller_percentage_single: 75.0,
        seller_percentage_max_multi: 35.0
      }); // ✅
      mockApiClient.get.mockRejectedValueOnce(new Error('Tax API Error')); // ❌

      const result = await configManager.getUnifiedConfig();
      
      expect(result.errors).toHaveLength(2); // Solo 2 APIs fallaron
      expect(result.config.platform_commission_rate).toBe(0.12); // De API
      expect(result.config.tax_rate).toBe(0.15); // Fallback
      expect(result.config.shipping.enabled).toBe(true); // Fallback
    });
  });

  describe('⚡ Performance y Métricas', () => {
    it('debe rastrear métricas de rendimiento', async () => {
      mockApiClient.get.mockResolvedValue({});

      const result = await configManager.getUnifiedConfig();
      
      expect(result.source).toBeDefined();
      expect(result.is_stale).toBeDefined();
    });

    it('debe completar configuración en menos de 1 segundo', async () => {
      mockApiClient.get.mockResolvedValue({});
      
      const startTime = Date.now();
      await configManager.getUnifiedConfig();
      const endTime = Date.now();
      
      expect(endTime - startTime).toBeLessThan(1000);
    });

    it('debe rastrear cache hits correctamente', async () => {
      mockApiClient.get.mockResolvedValue({});

      // Primera llamada
      const result1 = await configManager.getUnifiedConfig();
      expect(result1.source).toBe('api');

      // Segunda llamada (cache hit)
      const result2 = await configManager.getUnifiedConfig();
      expect(result2.source).toBe('cache');
    });
  });

  describe('🔧 Validaciones de Integridad', () => {
    it('debe validar estructura de configuración unificada', async () => {
      mockApiClient.get.mockResolvedValue({});

      const result = await configManager.getUnifiedConfig();
      
      // Verificar estructura completa
      expect(result.config).toHaveProperty('tax_rate');
      expect(result.config).toHaveProperty('platform_commission_rate');
      expect(result.config).toHaveProperty('shipping');
      expect(result.config).toHaveProperty('volume_discounts');
      expect(result.config).toHaveProperty('shipping_distribution');

      // Verificar tipos
      expect(typeof result.config.tax_rate).toBe('number');
      expect(typeof result.config.platform_commission_rate).toBe('number');
      expect(typeof result.config.shipping.enabled).toBe('boolean');
      expect(Array.isArray(result.config.volume_discounts)).toBe(true);
    });

    it('debe validar rangos de valores financieros', async () => {
      mockApiClient.get.mockResolvedValue({});

      const result = await configManager.getUnifiedConfig();
      
      // Tax rate debe estar entre 0 y 1 (0% a 100%)
      expect(result.config.tax_rate).toBeGreaterThanOrEqual(0);
      expect(result.config.tax_rate).toBeLessThanOrEqual(1);

      // Commission rate debe estar entre 0 y 1
      expect(result.config.platform_commission_rate).toBeGreaterThanOrEqual(0);
      expect(result.config.platform_commission_rate).toBeLessThanOrEqual(1);

      // Shipping costs deben ser no negativos
      expect(result.config.shipping.free_threshold).toBeGreaterThanOrEqual(0);
      expect(result.config.shipping.default_cost).toBeGreaterThanOrEqual(0);
    });
  });
});