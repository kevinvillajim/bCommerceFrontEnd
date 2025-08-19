import ApiClient from "../../infrastructure/api/apiClient";
import { API_ENDPOINTS } from "../../constants/apiEndpoints";

export interface ShippingConfigData {
  enabled: boolean;
  freeThreshold: number;
  defaultCost: number;
}

class ShippingConfigService {
  private static instance: ShippingConfigService;
  private cachedConfig: ShippingConfigData | null = null;
  private cacheTime: number = 0;
  private readonly CACHE_DURATION = 30 * 1000; // 30 segundos para testing
  private readonly CACHE_KEY = 'bcommerce_shipping_config';

  public static getInstance(): ShippingConfigService {
    if (!ShippingConfigService.instance) {
      ShippingConfigService.instance = new ShippingConfigService();
    }
    return ShippingConfigService.instance;
  }

  /**
   * Carga la configuración desde sessionStorage si existe y es válida
   */
  private loadFromSessionStorage(): ShippingConfigData | null {
    try {
      const cached = sessionStorage.getItem(this.CACHE_KEY);
      if (cached) {
        const data = JSON.parse(cached);
        const now = Date.now();
        
        // Verificar si el cache no ha expirado
        if (data.timestamp && (now - data.timestamp) < this.CACHE_DURATION) {
          return data.config;
        }
      }
    } catch (error) {
      console.warn('Error loading shipping config from sessionStorage:', error);
    }
    return null;
  }

  /**
   * Guarda la configuración en sessionStorage
   */
  private saveToSessionStorage(config: ShippingConfigData): void {
    try {
      const data = {
        config,
        timestamp: Date.now()
      };
      sessionStorage.setItem(this.CACHE_KEY, JSON.stringify(data));
    } catch (error) {
      console.warn('Error saving shipping config to sessionStorage:', error);
    }
  }

  /**
   * Obtiene la configuración de envío con cache
   */
  async getShippingConfig(): Promise<ShippingConfigData> {
    const now = Date.now();
    
    // Intentar usar cache de sessionStorage primero
    const sessionConfig = this.loadFromSessionStorage();
    if (sessionConfig) {
      console.log('📦 getShippingConfig: usando sessionStorage');
      this.cachedConfig = sessionConfig;
      this.cacheTime = now;
      return sessionConfig;
    }
    
    // Usar cache en memoria si es válido
    if (this.cachedConfig && (now - this.cacheTime) < this.CACHE_DURATION) {
      console.log('🧠 getShippingConfig: usando cache memoria');
      return this.cachedConfig;
    }
    
    console.log('🌐 getShippingConfig: consultando API');
    try {
      const response = await ApiClient.get<{
        status: string;
        data: ShippingConfigData;
      }>('/configurations/shipping-public');

      if (response?.status === 'success' && response.data) {
        console.log('✅ getShippingConfig: API retornó:', response.data);
        this.cachedConfig = response.data;
        this.cacheTime = now;
        this.saveToSessionStorage(response.data);
        return response.data;
      }
    } catch (error) {
      console.warn('Error al obtener configuración de envío:', error);
    }

    // Valores por defecto si falla la API
    const defaultConfig: ShippingConfigData = {
      enabled: true,
      freeThreshold: 60,
      defaultCost: 8
    };

    this.cachedConfig = defaultConfig;
    this.cacheTime = now;
    return defaultConfig;
  }

  /**
   * Obtiene solo el umbral de envío gratis
   */
  async getFreeShippingThreshold(): Promise<number> {
    const config = await this.getShippingConfig();
    return config.freeThreshold;
  }

  /**
   * Obtiene solo el costo por defecto
   */
  async getDefaultShippingCost(): Promise<number> {
    const config = await this.getShippingConfig();
    return config.defaultCost;
  }

  /**
   * Verifica si el envío está habilitado
   */
  async isShippingEnabled(): Promise<boolean> {
    const config = await this.getShippingConfig();
    return config.enabled;
  }

  /**
   * Actualiza el cache con nueva configuración
   */
  updateCache(config: ShippingConfigData): void {
    this.cachedConfig = config;
    this.cacheTime = Date.now();
    this.saveToSessionStorage(config);
  }

  /**
   * Limpia SOLO el cache de shipping config (no afecta otros caches)
   */
  clearCache(): void {
    console.log('🧹 ShippingConfigService: Limpiando cache específico de shipping');
    this.cachedConfig = null;
    this.cacheTime = 0;
    try {
      sessionStorage.removeItem(this.CACHE_KEY);
    } catch (error) {
      console.warn('Error clearing shipping config from sessionStorage:', error);
    }
  }

  /**
   * Calcula si aplica envío gratis para un subtotal dado
   */
  async calculateShippingCost(subtotal: number): Promise<{
    cost: number;
    isFree: boolean;
    threshold: number;
  }> {
    const config = await this.getShippingConfig();
    
    if (!config.enabled) {
      return {
        cost: 0,
        isFree: true,
        threshold: 0
      };
    }

    const isFree = subtotal >= config.freeThreshold;
    
    return {
      cost: isFree ? 0 : config.defaultCost,
      isFree,
      threshold: config.freeThreshold
    };
  }
}

export default ShippingConfigService;