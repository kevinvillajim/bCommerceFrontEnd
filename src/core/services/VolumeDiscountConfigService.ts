// src/core/services/VolumeDiscountConfigService.ts

import ApiClient from "../../infrastructure/api/apiClient";

export interface VolumeDiscountTier {
  quantity: number;
  discount: number;
  label: string;
}

export interface VolumeDiscountConfig {
  enabled: boolean;
  stackable: boolean;
  default_tiers: VolumeDiscountTier[];
  show_savings_message: boolean;
}

class VolumeDiscountConfigService {
  private static instance: VolumeDiscountConfigService;
  private cachedConfig: VolumeDiscountConfig | null = null;
  private cacheTime: number = 0;
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutos
  private readonly CACHE_KEY = 'bcommerce_volume_discount_config';
  private cachedVersion: number = 0;

  public static getInstance(): VolumeDiscountConfigService {
    if (!VolumeDiscountConfigService.instance) {
      VolumeDiscountConfigService.instance = new VolumeDiscountConfigService();
    }
    return VolumeDiscountConfigService.instance;
  }

  /**
   * Verifica si hay una nueva versión disponible
   */
  private async checkVersion(): Promise<boolean> {
    try {
      const response = await ApiClient.get('/config/version/volume_discounts');
      if (response?.success && response.data?.version) {
        const serverVersion = response.data.version;
        if (serverVersion > this.cachedVersion) {
          console.log('🔄 Nueva versión de configuración detectada:', {
            cached: this.cachedVersion,
            server: serverVersion
          });
          return true;
        }
      }
    } catch (error) {
      console.warn('Error verificando versión:', error);
    }
    return false;
  }

  /**
   * Carga la configuración desde sessionStorage si existe y es válida
   */
  private loadFromSessionStorage(): VolumeDiscountConfig | null {
    try {
      const cached = sessionStorage.getItem(this.CACHE_KEY);
      if (cached) {
        const data = JSON.parse(cached);
        const now = Date.now();
        
        // Verificar si el cache no ha expirado
        if (data.timestamp && (now - data.timestamp) < this.CACHE_DURATION) {
          this.cachedVersion = data.version || 0;
          return data.config;
        }
      }
    } catch (error) {
      console.warn('Error loading volume discount config from sessionStorage:', error);
    }
    return null;
  }

  /**
   * Guarda la configuración en sessionStorage con versión
   */
  private saveToSessionStorage(config: VolumeDiscountConfig, version?: number): void {
    try {
      const data = {
        config,
        timestamp: Date.now(),
        version: version || this.cachedVersion
      };
      sessionStorage.setItem(this.CACHE_KEY, JSON.stringify(data));
    } catch (error) {
      console.warn('Error saving volume discount config to sessionStorage:', error);
    }
  }

  /**
   * Obtiene la configuración de descuentos por volumen con verificación de versión
   */
  async getVolumeDiscountConfig(): Promise<VolumeDiscountConfig> {
    const now = Date.now();
    
    // Verificar si hay nueva versión disponible
    const hasNewVersion = await this.checkVersion();
    
    // Si hay nueva versión, invalidar cache
    if (hasNewVersion) {
      console.log('🔄 Invalidando cache por nueva versión');
      this.cachedConfig = null;
      this.cacheTime = 0;
      sessionStorage.removeItem(this.CACHE_KEY);
    }
    
    // Intentar usar cache de sessionStorage si no hay nueva versión
    if (!hasNewVersion) {
      const sessionConfig = this.loadFromSessionStorage();
      if (sessionConfig) {
        console.log('📦 getVolumeDiscountConfig: usando sessionStorage');
        this.cachedConfig = sessionConfig;
        this.cacheTime = now;
        return sessionConfig;
      }
    }
    
    // Usar cache en memoria si es válido y no hay nueva versión
    if (!hasNewVersion && this.cachedConfig && (now - this.cacheTime) < this.CACHE_DURATION) {
      console.log('🧠 getVolumeDiscountConfig: usando cache memoria');
      return this.cachedConfig;
    }
    
    console.log('🌐 getVolumeDiscountConfig: consultando API');
    try {
      const response = await ApiClient.get<{
        status: string;
        data: VolumeDiscountConfig;
      }>('/configurations/volume-discounts-public');

      if (response?.status === 'success' && response.data) {
        console.log('✅ getVolumeDiscountConfig: API retornó:', response.data);
        
        // Obtener nueva versión del servidor
        try {
          const versionResponse = await ApiClient.get('/config/version/volume_discounts');
          if (versionResponse?.success && versionResponse.data?.version) {
            this.cachedVersion = versionResponse.data.version;
          }
        } catch (e) {
          console.warn('Error obteniendo versión:', e);
        }
        
        this.cachedConfig = response.data;
        this.cacheTime = now;
        this.saveToSessionStorage(response.data, this.cachedVersion);
        return response.data;
      }
    } catch (error) {
      console.warn('Error al obtener configuración de descuentos por volumen:', error);
    }

    // Valores por defecto si falla la API
    const defaultConfig: VolumeDiscountConfig = {
      enabled: true,
      stackable: true,
      default_tiers: [
        { quantity: 5, discount: 5, label: "Descuento 5+" },
        { quantity: 6, discount: 10, label: "Descuento 10+" },
        { quantity: 19, discount: 15, label: "Descuento 15+" }
      ],
      show_savings_message: true
    };

    this.cachedConfig = defaultConfig;
    this.cacheTime = now;
    return defaultConfig;
  }

  /**
   * Verifica si los descuentos por volumen están habilitados
   */
  async isEnabled(): Promise<boolean> {
    const config = await this.getVolumeDiscountConfig();
    return config.enabled;
  }

  /**
   * Obtiene los tiers de descuento configurados
   */
  async getDiscountTiers(): Promise<VolumeDiscountTier[]> {
    const config = await this.getVolumeDiscountConfig();
    return config.default_tiers;
  }

  /**
   * Verifica si se debe mostrar el mensaje de ahorro
   */
  async shouldShowSavingsMessage(): Promise<boolean> {
    const config = await this.getVolumeDiscountConfig();
    return config.show_savings_message;
  }

  /**
   * Verifica si los descuentos son acumulables
   */
  async isStackable(): Promise<boolean> {
    const config = await this.getVolumeDiscountConfig();
    return config.stackable;
  }

  /**
   * Actualiza el cache con nueva configuración
   */
  updateCache(config: VolumeDiscountConfig): void {
    this.cachedConfig = config;
    this.cacheTime = Date.now();
    this.saveToSessionStorage(config);
  }

  /**
   * Limpia SOLO el cache de configuración de descuentos (no afecta otros caches)
   */
  clearCache(): void {
    console.log('🧹 VolumeDiscountConfigService: Limpiando cache específico de descuentos por volumen');
    this.cachedConfig = null;
    this.cacheTime = 0;
    try {
      sessionStorage.removeItem(this.CACHE_KEY);
    } catch (error) {
      console.warn('Error clearing volume discount config from sessionStorage:', error);
    }
  }

  /**
   * Calcula el descuento aplicable para una cantidad dada
   */
  async calculateDiscountForQuantity(quantity: number): Promise<{
    discountPercentage: number;
    tierLabel: string | null;
  }> {
    const config = await this.getVolumeDiscountConfig();
    
    if (!config.enabled || !config.default_tiers.length) {
      return {
        discountPercentage: 0,
        tierLabel: null
      };
    }

    // Ordenar tiers por cantidad descendente para encontrar el mayor aplicable
    const sortedTiers = [...config.default_tiers].sort((a, b) => b.quantity - a.quantity);
    
    // Encontrar el tier aplicable
    const applicableTier = sortedTiers.find(tier => quantity >= tier.quantity);
    
    if (!applicableTier) {
      return {
        discountPercentage: 0,
        tierLabel: null
      };
    }

    return {
      discountPercentage: applicableTier.discount,
      tierLabel: applicableTier.label
    };
  }
}

export default VolumeDiscountConfigService;