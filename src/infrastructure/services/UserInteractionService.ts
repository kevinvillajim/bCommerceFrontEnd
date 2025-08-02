import { RecommendationService } from "./RecommendationService";
/** * Tipos de interacciones disponibles */ export enum InteractionType {
  VIEW = "view",
  CLICK = "click",
  ADD_TO_CART = "add_to_cart",
  ADD_TO_WISHLIST = "add_to_wishlist",
  REMOVE_FROM_WISHLIST = "remove_from_wishlist",
  SEARCH = "search",
  CATEGORY_VIEW = "category_view",
  PURCHASE = "purchase",
  TIME_SPENT = "time_spent",
  RATING = "rating",
}
/** * Interfaz para metadatos de interacciones */ interface InteractionMetadata {
  timestamp?: string;
  source?: string;
  action?: string;
  quantity?: number;
  search_term?: string;
  results_count?: number;
  category_name?: string;
  total_amount?: number;
  order_id?: number;
  time_spent_seconds?: number;
  rating_value?: number;
  [key: string]: any;
}
/** * Configuración del servicio */ interface ServiceConfig {
  enableLogging: boolean;
  batchInteractions: boolean;
  batchSize: number;
  batchDelay: number;
  minTimeSpent: number;
}
/** * Servicio profesional para el registro de interacciones de usuario * Optimizado para rendimiento y experiencia de usuario */ export class UserInteractionService {
  private static config: ServiceConfig = {
    enableLogging: true,
    batchInteractions: false,
    batchSize: 5,
    batchDelay: 2000,
    minTimeSpent: 10,
  };
  private static interactionQueue: Array<{
    type: InteractionType;
    itemId: number;
    metadata: InteractionMetadata;
  }> = [];
  private static batchTimeout: NodeJS.Timeout | null = null;
  /**   * Verifica si el usuario está autenticado   */ private static isAuthenticated(): boolean {
    const token = localStorage.getItem("auth_token");
    return !!(token && token.trim() !== "");
  }
  /**   * Logger interno para debugging   */ private static log(
    message: string,
    data?: any
  ): void {
    if (this.config.enableLogging) {
      console.log(`🔍 UserInteractionService: ${message}`, data || "");
    }
  }
  /**   * Registra una interacción individual   */ private static async recordInteraction(
    type: InteractionType,
    itemId: number,
    metadata: InteractionMetadata = {}
  ): Promise<boolean> {
    if (!this.isAuthenticated()) {
      this.log(
        `Usuario no autenticado - omitiendo ${type} para item ${itemId}`
      );
      return false;
    }
    try {
      const enrichedMetadata: InteractionMetadata = {
        timestamp: new Date().toISOString(),
        action: type,
        ...metadata,
      };
      await RecommendationService.trackInteraction(
        type,
        itemId,
        enrichedMetadata
      );
      this.log(`✅ ${type} registrado exitosamente`, {
        itemId,
        metadata: enrichedMetadata,
      });
      return true;
    } catch (error) {
      this.log(`❌ Error registrando ${type}:`, error);
      return false;
    }
  }
  /**   * Registra una vista de producto   */ public static async trackProductView(
    productId: number,
    source: string = "unknown",
    additionalData: Record<string, any> = {}
  ): Promise<boolean> {
    return await this.recordInteraction(InteractionType.VIEW, productId, {
      source,
      ...additionalData,
    });
  }
  /**   * Registra un click en producto   */ public static async trackProductClick(
    productId: number,
    source: string = "unknown",
    additionalData: Record<string, any> = {}
  ): Promise<boolean> {
    return await this.recordInteraction(InteractionType.CLICK, productId, {
      source,
      ...additionalData,
    });
  }
  /**   * Registra añadir al carrito   */ public static async trackAddToCart(
    productId: number,
    quantity: number = 1,
    source: string = "unknown"
  ): Promise<boolean> {
    return await this.recordInteraction(
      InteractionType.ADD_TO_CART,
      productId,
      { quantity, source }
    );
  }
  /**   * Registra añadir a favoritos   */ public static async trackAddToWishlist(
    productId: number,
    source: string = "unknown"
  ): Promise<boolean> {
    return await this.recordInteraction(
      InteractionType.ADD_TO_WISHLIST,
      productId,
      { source }
    );
  }
  /**   * Registra remover de favoritos   */ public static async trackRemoveFromWishlist(
    productId: number,
    source: string = "unknown"
  ): Promise<boolean> {
    return await this.recordInteraction(
      InteractionType.REMOVE_FROM_WISHLIST,
      productId,
      { source }
    );
  }
  /**   * Registra una búsqueda   */ public static async trackSearch(
    searchTerm: string,
    resultsCount: number = 0,
    source: string = "search_bar"
  ): Promise<boolean> {
    return await this.recordInteraction(InteractionType.SEARCH, 0, {
      search_term: searchTerm.toLowerCase().trim(),
      results_count: resultsCount,
      source,
    });
  }
  /**   * Registra navegación por categoría   */ public static async trackCategoryView(
    categoryId: number,
    categoryName: string,
    source: string = "navigation"
  ): Promise<boolean> {
    return await this.recordInteraction(
      InteractionType.CATEGORY_VIEW,
      categoryId,
      { category_name: categoryName, source }
    );
  }
  /**   * Registra una compra completada   */ public static async trackPurchase(
    productIds: number[],
    totalAmount: number,
    orderId?: number
  ): Promise<boolean[]> {
    const results: boolean[] = [];
    for (const productId of productIds) {
      const result = await this.recordInteraction(
        InteractionType.PURCHASE,
        productId,
        {
          total_amount: totalAmount,
          order_id: orderId,
          product_count: productIds.length,
        }
      );
      results.push(result);
    }
    return results;
  }
  /**   * Registra tiempo en página de producto   */ public static async trackTimeOnProduct(
    productId: number,
    timeSpentSeconds: number,
    source: string = "product_page"
  ): Promise<boolean> {
    if (timeSpentSeconds < this.config.minTimeSpent) {
      this.log(`Tiempo insuficiente (${timeSpentSeconds}s) - no se registra`);
      return false;
    }
    return await this.recordInteraction(InteractionType.TIME_SPENT, productId, {
      time_spent_seconds: timeSpentSeconds,
      source,
    });
  }
  /**   * Registra una valoración/rating   */ public static async trackRating(
    productId: number,
    ratingValue: number,
    source: string = "product_page"
  ): Promise<boolean> {
    return await this.recordInteraction(InteractionType.RATING, productId, {
      rating_value: ratingValue,
      source,
    });
  }
  /**   * Actualiza la configuración del servicio   */ public static updateConfig(
    newConfig: Partial<ServiceConfig>
  ): void {
    this.config = { ...this.config, ...newConfig };
    this.log("Configuración actualizada:", this.config);
  }
  /**   * Obtiene la configuración actual   */ public static getConfig(): ServiceConfig {
    return { ...this.config };
  }
  /**   * Habilita/deshabilita el logging   */ public static setLogging(
    enabled: boolean
  ): void {
    this.config.enableLogging = enabled;
  }
}
export default UserInteractionService;
