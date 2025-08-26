/**
 * 🧪 JORDAN FASE 1: Tests unitarios para ConfigurationManager
 * Garantiza robustez y confiabilidad del sistema de configuración unificada
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import ConfigurationManager from '../ConfigurationManager';
import ApiClient from '../../../infrastructure/api/apiClient';
import type { UnifiedConfig, ConfigurationResult } from '../ConfigurationManager';

// Mock del ApiClient
vi.mock('../../../infrastructure/api/apiClient');
const mockApiClient = vi.mocked(ApiClient);

describe('ConfigurationManager', () => {
  let configManager: ConfigurationManager;
  
  beforeEach(() => {
    // Resetear singleton para cada test
    // @ts-ignore - Acceso a propiedades privadas para testing
    ConfigurationManager.instance = undefined;
    configManager = ConfigurationManager.getInstance();
    
    // Limpiar mocks
    vi.clearAllMocks();
    
    // Mock console.log/warn para tests limpios
    vi.spyOn(console, 'log').mockImplementation(() => {});
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    // Limpiar cache después de cada test
    configManager.invalidateCache();
    vi.restoreAllMocks();
  });

  describe('Singleton Pattern', () => {
    it('debería devolver la misma instancia', () => {
      const instance1 = ConfigurationManager.getInstance();
      const instance2 = ConfigurationManager.getInstance();
      expect(instance1).toBe(instance2);
    });
  });

  describe('getUnifiedConfig - Casos Exitosos', () => {
    it('debería obtener configuración completa desde API', async () => {
      // Arrange - Mock de respuestas exitosas
      const mockResponses = {
        commission: { data: { platform_commission_rate: 10.0 } },
        shipping: { data: { enabled: true, default_cost: 5.0, free_threshold: 50.0 } },
        volume: { data: { default_tiers: [{ quantity: 5, discount: 10, label: '5+' }] } },
        shippingDist: { data: { single_seller_max_percentage: 80.0, multiple_sellers_percentage_each: 40.0 } },
        tax: { data: { tax_rate: 15.0 } }
      };

      mockApiClient.get.mockImplementation((endpoint: string) => {
        if (endpoint.includes('platform-commission')) return Promise.resolve(mockResponses.commission);
        if (endpoint.includes('shipping-public')) return Promise.resolve(mockResponses.shipping);
        if (endpoint.includes('volume-discounts')) return Promise.resolve(mockResponses.volume);
        if (endpoint.includes('shipping-distribution')) return Promise.resolve(mockResponses.shippingDist);
        if (endpoint.includes('tax-public')) return Promise.resolve(mockResponses.tax);
        return Promise.reject(new Error('Unknown endpoint'));
      });

      // Act
      const result: ConfigurationResult = await configManager.getUnifiedConfig();

      // Assert
      expect(result.source).toBe('api');
      expect(result.is_stale).toBe(false);
      expect(result.errors).toEqual([]);
      expect(result.config).toBeDefined();
      expect(result.config.tax_rate).toBe(0.15); // 15.0 / 100
      expect(result.config.platform_commission_rate).toBe(0.10); // 10.0 / 100
      expect(result.config.shipping.default_cost).toBe(5.0);
      expect(result.config.shipping.free_threshold).toBe(50.0);
      expect(result.config.volume_discounts).toHaveLength(1);
      expect(result.config.volume_discounts[0].discount).toBe(0.10); // 10 / 100
    });

    it('debería usar cache en la segunda llamada', async () => {
      // Arrange
      const mockResponse = { data: { platform_commission_rate: 10.0 } };
      mockApiClient.get.mockResolvedValue(mockResponse);

      // Act - Primera llamada
      await configManager.getUnifiedConfig();
      const firstCallCount = mockApiClient.get.mock.calls.length;

      // Act - Segunda llamada (debería usar cache)
      const result = await configManager.getUnifiedConfig();

      // Assert
      expect(mockApiClient.get.mock.calls.length).toBe(firstCallCount); // No llamadas adicionales
      expect(result.source).toBe('cache');
      expect(result.is_stale).toBe(false);
    });

    it('debería refrescar cache cuando se fuerza', async () => {
      // Arrange
      const mockResponse = { data: { platform_commission_rate: 10.0 } };
      mockApiClient.get.mockResolvedValue(mockResponse);

      // Act - Primera llamada
      await configManager.getUnifiedConfig();
      const firstCallCount = mockApiClient.get.mock.calls.length;

      // Act - Segunda llamada con forceRefresh
      const result = await configManager.getUnifiedConfig(true);

      // Assert
      expect(mockApiClient.get.mock.calls.length).toBeGreaterThan(firstCallCount);
      expect(result.source).toBe('api');
    });
  });

  describe('Manejo de Errores', () => {
    it('debería usar fallback cuando TODOS los endpoints fallan', async () => {
      // Arrange - Todos los endpoints fallan
      mockApiClient.get.mockRejectedValue(new Error('Network error'));

      // Act
      const result = await configManager.getUnifiedConfig();

      // Assert
      expect(result.source).toBe('fallback');
      expect(result.is_stale).toBe(true);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0]).toContain('Todos los endpoints de configuración fallaron');
      expect(result.config.tax_rate).toBe(0.15); // Valor por defecto
    });

    it('debería usar api con warnings cuando algunos endpoints fallan', async () => {
      // Arrange - Algunos endpoints funcionan, otros fallan
      mockApiClient.get.mockImplementation((endpoint: string) => {
        if (endpoint.includes('platform-commission')) return Promise.resolve({ data: { platform_commission_rate: 10.0 } });
        if (endpoint.includes('tax-public')) return Promise.resolve({ data: { tax_rate: 15.0 } });
        // Otros endpoints fallan
        return Promise.reject(new Error('Endpoint not available'));
      });

      // Act
      const result = await configManager.getUnifiedConfig();

      // Assert
      expect(result.source).toBe('api');
      expect(result.is_stale).toBe(false);
      expect(result.warnings.length).toBeGreaterThan(0);
      expect(result.warnings.some(w => w.includes('endpoints fallaron'))).toBe(true);
      expect(result.config.tax_rate).toBe(0.15); // Desde API
      expect(result.config.platform_commission_rate).toBe(0.10); // Desde API
      // Otros valores deberían usar fallbacks
      expect(result.config.shipping.default_cost).toBe(5.0); // Fallback
    });

    it('debería usar cache expirado cuando API falla completamente', async () => {
      // Arrange - Configurar cache válido primero
      const mockResponse = { data: { platform_commission_rate: 10.0 } };
      mockApiClient.get.mockResolvedValue(mockResponse);
      await configManager.getUnifiedConfig();

      // Expirar cache manualmente
      // @ts-ignore - Acceso a propiedades privadas para testing  
      configManager.cacheExpiry = Date.now() - 1000;

      // TODOS los endpoints fallan en segunda llamada
      mockApiClient.get.mockRejectedValue(new Error('API Error'));

      // Act
      const result = await configManager.getUnifiedConfig();

      // Assert
      expect(result.source).toBe('cache');
      expect(result.is_stale).toBe(true);
      expect(result.errors).toHaveLength(1);
      expect(result.warnings).toContain('Cache expirado usado por fallo de API');
    });

    it('debería validar configuración incorrecta', async () => {
      // Arrange - Configuración inválida
      const invalidResponse = {
        commission: { data: { platform_commission_rate: -10.0 } }, // Inválido
        tax: { data: { tax_rate: 150.0 } } // Inválido
      };

      mockApiClient.get.mockImplementation((endpoint: string) => {
        if (endpoint.includes('platform-commission')) return Promise.resolve(invalidResponse.commission);
        if (endpoint.includes('tax-public')) return Promise.resolve(invalidResponse.tax);
        return Promise.resolve({ data: {} });
      });

      // Act
      const result = await configManager.getUnifiedConfig();

      // Assert
      expect(result.source).toBe('fallback');
      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.warnings).toContain('Usando configuración de respaldo debido a errores en API');
    });
  });

  describe('Funciones de Extracción', () => {
    it('debería extraer correctamente platform commission', () => {
      // Arrange
      const mockResponse = { data: { platform_commission_rate: 10.0 } };
      
      // Act
      // @ts-ignore - Acceso a método privado para testing
      const result = configManager.extractPlatformCommission(mockResponse);

      // Assert
      expect(result).toBe(0.10); // 10.0 / 100
    });

    it('debería usar fallback para platform commission inválido', () => {
      // Arrange
      const mockResponse = { data: {} };
      
      // Act
      // @ts-ignore - Acceso a método privado para testing
      const result = configManager.extractPlatformCommission(mockResponse);

      // Assert
      expect(result).toBe(0.10); // Fallback 10%
    });

    it('debería extraer correctamente tax rate', () => {
      // Arrange
      const mockResponse = { data: { tax_rate: 15.0 } };
      
      // Act
      // @ts-ignore - Acceso a método privado para testing
      const result = configManager.extractTaxRate(mockResponse);

      // Assert
      expect(result).toBe(0.15); // 15.0 / 100
    });

    it('debería extraer correctamente shipping config', () => {
      // Arrange
      const shippingResponse = { 
        data: { enabled: true, default_cost: 5.0, free_threshold: 50.0 } 
      };
      const distributionResponse = { 
        data: { single_seller_max_percentage: 80.0, multiple_sellers_percentage_each: 40.0 } 
      };
      
      // Act
      // @ts-ignore - Acceso a método privado para testing
      const result = configManager.extractShippingConfig(shippingResponse, distributionResponse);

      // Assert
      expect(result.enabled).toBe(true);
      expect(result.default_cost).toBe(5.0);
      expect(result.free_threshold).toBe(50.0);
      expect(result.seller_percentage_single).toBe(0.80); // 80.0 / 100
      expect(result.seller_percentage_max_multi).toBe(0.40); // 40.0 / 100
    });

    it('debería extraer correctamente volume discounts', () => {
      // Arrange
      const mockResponse = { 
        status: 'success',
        data: { 
          default_tiers: [
            { quantity: 3, discount: 5, label: '3+' },
            { quantity: 6, discount: 10, label: '6+' }
          ] 
        } 
      };
      
      // Act
      // @ts-ignore - Acceso a método privado para testing
      const result = configManager.extractVolumeDiscounts(mockResponse);

      // Assert
      expect(result).toHaveLength(2);
      expect(result[0].quantity).toBe(3);
      expect(result[0].discount).toBe(0.05); // 5 / 100
      expect(result[1].quantity).toBe(6);
      expect(result[1].discount).toBe(0.10); // 10 / 100
    });
  });

  describe('Cache Management', () => {
    it('debería invalidar cache correctamente', async () => {
      // Arrange
      const mockResponse = { data: { platform_commission_rate: 10.0 } };
      mockApiClient.get.mockResolvedValue(mockResponse);
      
      // Configurar cache
      await configManager.getUnifiedConfig();
      
      // Act
      configManager.invalidateCache();
      
      // Assert - Próxima llamada debería ir a API, no cache
      await configManager.getUnifiedConfig();
      expect(mockApiClient.get.mock.calls.length).toBeGreaterThan(5); // Llamadas a múltiples endpoints
    });

    it('debería devolver null para getConfigSync sin cache', () => {
      // Act
      const result = configManager.getConfigSync();

      // Assert
      expect(result).toBeNull();
    });

    it('debería devolver config para getConfigSync con cache válido', async () => {
      // Arrange
      const mockResponse = { data: { platform_commission_rate: 10.0 } };
      mockApiClient.get.mockResolvedValue(mockResponse);
      await configManager.getUnifiedConfig();

      // Act
      const result = configManager.getConfigSync();

      // Assert
      expect(result).not.toBeNull();
      expect(result?.platform_commission_rate).toBe(0.10);
    });
  });

  describe('Estadísticas y Debugging', () => {
    it('debería devolver estadísticas correctas', async () => {
      // Arrange
      const mockResponse = { data: { platform_commission_rate: 10.0 } };
      mockApiClient.get.mockResolvedValue(mockResponse);
      await configManager.getUnifiedConfig();

      // Act
      const stats = configManager.getStats();

      // Assert
      expect(stats).toHaveProperty('cache_valid');
      expect(stats).toHaveProperty('cache_age_seconds');
      expect(stats).toHaveProperty('version');
      expect(stats).toHaveProperty('last_config_source');
      expect(stats.cache_valid).toBe(true);
      expect(stats.version).toBe('1.0.0');
      expect(stats.last_config_source).toBe('loaded');
    });

    it('debería devolver estadísticas con cache inválido', () => {
      // Act
      const stats = configManager.getStats();

      // Assert
      expect(stats.cache_valid).toBe(false);
      expect(stats.cache_age_seconds).toBeNull();
      expect(stats.last_config_source).toBe('none');
    });
  });

  describe('Validación de Configuración', () => {
    it('debería validar configuración correcta', () => {
      // Arrange
      const validConfig: UnifiedConfig = {
        tax_rate: 0.15,
        platform_commission_rate: 0.10,
        shipping: {
          enabled: true,
          default_cost: 5.0,
          free_threshold: 50.0,
          seller_percentage_single: 0.80,
          seller_percentage_max_multi: 0.40
        },
        shipping_distribution: {
          seller_percentage_single: 0.80,
          seller_percentage_max_multi: 0.40
        },
        volume_discounts: [
          { quantity: 3, discount: 0.05, label: '3+' }
        ],
        updated_at: new Date().toISOString(),
        version: '1.0.0',
        is_valid: true
      };

      // Act
      // @ts-ignore - Acceso a método privado para testing
      const result = configManager.validateConfiguration(validConfig);

      // Assert
      expect(result.is_valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('debería detectar errores en configuración inválida', () => {
      // Arrange
      const invalidConfig: UnifiedConfig = {
        tax_rate: 1.50, // > 1, inválido
        platform_commission_rate: -0.10, // < 0, inválido
        shipping: {
          enabled: true,
          default_cost: -5.0, // < 0, inválido
          free_threshold: -50.0, // < 0, inválido
          seller_percentage_single: 0.80,
          seller_percentage_max_multi: 0.40
        },
        shipping_distribution: {
          seller_percentage_single: 0.80,
          seller_percentage_max_multi: 0.40
        },
        volume_discounts: [],
        updated_at: new Date().toISOString(),
        version: '1.0.0',
        is_valid: true
      };

      // Act
      // @ts-ignore - Acceso a método privado para testing
      const result = configManager.validateConfiguration(invalidConfig);

      // Assert
      expect(result.is_valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.warnings).toContain('No hay descuentos por volumen configurados');
    });
  });
});