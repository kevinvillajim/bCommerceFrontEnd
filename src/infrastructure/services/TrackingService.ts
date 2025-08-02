import { ApiClient } from '../api/apiClient';

/**
 * Servicio avanzado para tracking de interacciones de usuario
 * Utiliza los nuevos endpoints del backend para recomendaciones
 */
export class TrackingService {
  private static readonly BASE_PATH = '/recommendations';
  
  /**
   * Verifica si el usuario está autenticado
   */
  private static isAuthenticated(): boolean {
    const token = localStorage.getItem('auth_token');
    return !!(token && token.trim() !== '');
  }

  /**
   * Registra tiempo que el usuario pasa en una página de producto
   */
  public static async trackPageTime(
    productId: number,
    timeSpent: number,
    pageType: 'product' | 'category' | 'search' = 'product',
    additionalData: Record<string, any> = {}
  ): Promise<void> {
    if (!this.isAuthenticated() || timeSpent < 5) return; // Mínimo 5 segundos
    
    try {
      console.log('📊 TrackingService: Registrando tiempo en página:', {
        productId,
        timeSpent,
        pageType
      });

      await ApiClient.post(`${this.BASE_PATH}/track-page-time`, {
        product_id: productId,
        time_spent: timeSpent,
        page_type: pageType,
        additional_data: {
          timestamp: new Date().toISOString(),
          ...additionalData
        }
      });

      console.log('✅ TrackingService: Tiempo en página registrado');
    } catch (error) {
      console.error('❌ TrackingService: Error registrando tiempo en página:', error);
    }
  }

  /**
   * Registra búsquedas del usuario
   */
  public static async trackSearch(
    searchTerm: string,
    resultsCount: number = 0,
    clickedProductId?: number,
    searchFilters: Record<string, any> = {}
  ): Promise<void> {
    if (!this.isAuthenticated() || !searchTerm.trim()) return;
    
    try {
      console.log('🔍 TrackingService: Registrando búsqueda:', {
        searchTerm,
        resultsCount,
        clickedProductId
      });

      await ApiClient.post(`${this.BASE_PATH}/track-search`, {
        search_term: searchTerm.trim(),
        results_count: resultsCount,
        clicked_product_id: clickedProductId,
        search_filters: searchFilters
      });

      console.log('✅ TrackingService: Búsqueda registrada');
    } catch (error) {
      console.error('❌ TrackingService: Error registrando búsqueda:', error);
    }
  }

  /**
   * Registra clicks en productos desde diferentes fuentes
   */
  public static async trackProductClick(
    productId: number,
    source: string, // 'featured', 'trending', 'category', 'search', etc.
    position?: number,
    section?: string
  ): Promise<void> {
    if (!this.isAuthenticated()) return;
    
    try {
      console.log('👆 TrackingService: Registrando click en producto:', {
        productId,
        source,
        position,
        section
      });

      await ApiClient.post(`${this.BASE_PATH}/track-product-click`, {
        product_id: productId,
        source,
        position,
        section
      });

      console.log('✅ TrackingService: Click en producto registrado');
    } catch (error) {
      console.error('❌ TrackingService: Error registrando click en producto:', error);
    }
  }

  /**
   * Registra interés en categorías
   */
  public static async trackCategoryInterest(
    categoryId: number,
    action: 'visit' | 'browse' | 'filter',
    timeSpent?: number,
    productsViewed: number[] = []
  ): Promise<void> {
    if (!this.isAuthenticated()) return;
    
    try {
      console.log('📂 TrackingService: Registrando interés en categoría:', {
        categoryId,
        action,
        timeSpent,
        productsViewed: productsViewed.length
      });

      await ApiClient.post(`${this.BASE_PATH}/track-category-interest`, {
        category_id: categoryId,
        action,
        time_spent: timeSpent,
        products_viewed: productsViewed
      });

      console.log('✅ TrackingService: Interés en categoría registrado');
    } catch (error) {
      console.error('❌ TrackingService: Error registrando interés en categoría:', error);
    }
  }

  /**
   * Registra comportamiento de visualización
   */
  public static async trackViewBehavior(
    productId: number,
    viewedPercentage: number,
    imagesViewed: string[] = [],
    descriptionRead: boolean = false,
    reviewsChecked: boolean = false
  ): Promise<void> {
    if (!this.isAuthenticated() || viewedPercentage < 10) return; // Mínimo 10%
    
    try {
      console.log('👁️ TrackingService: Registrando comportamiento de visualización:', {
        productId,
        viewedPercentage,
        imagesViewed: imagesViewed.length,
        descriptionRead,
        reviewsChecked
      });

      await ApiClient.post(`${this.BASE_PATH}/track-view-behavior`, {
        product_id: productId,
        viewed_percentage: Math.round(viewedPercentage),
        images_viewed: imagesViewed,
        description_read: descriptionRead,
        reviews_checked: reviewsChecked
      });

      console.log('✅ TrackingService: Comportamiento de visualización registrado');
    } catch (error) {
      console.error('❌ TrackingService: Error registrando comportamiento de visualización:', error);
    }
  }

  /**
   * Registra interacción básica (backward compatibility)
   */
  public static async trackInteraction(
    interactionType: string,
    itemId: number,
    metadata: Record<string, any> = {}
  ): Promise<void> {
    if (!this.isAuthenticated()) return;
    
    try {
      console.log('🔄 TrackingService: Registrando interacción básica:', {
        interactionType,
        itemId,
        metadata
      });

      await ApiClient.post(`${this.BASE_PATH}/track-interaction`, {
        interaction_type: interactionType,
        item_id: itemId,
        metadata: {
          timestamp: new Date().toISOString(),
          ...metadata
        }
      });

      console.log('✅ TrackingService: Interacción básica registrada');
    } catch (error) {
      console.error('❌ TrackingService: Error registrando interacción básica:', error);
    }
  }

  /**
   * Helper: Registra evento combinado de click + tiempo
   */
  public static async trackProductEngagement(
    productId: number,
    source: string,
    timeSpent: number,
    position?: number,
    section?: string
  ): Promise<void> {
    // Registrar click
    await this.trackProductClick(productId, source, position, section);
    
    // Si pasó suficiente tiempo, registrar también tiempo en página
    if (timeSpent >= 5) {
      await this.trackPageTime(productId, timeSpent, 'product', {
        click_source: source,
        position,
        section
      });
    }
  }

  /**
   * Helper: Registra búsqueda con resultado clickeado
   */
  public static async trackSearchWithClick(
    searchTerm: string,
    resultsCount: number,
    clickedProductId: number,
    clickPosition?: number
  ): Promise<void> {
    // Registrar búsqueda
    await this.trackSearch(searchTerm, resultsCount, clickedProductId);
    
    // Registrar click en resultado
    await this.trackProductClick(clickedProductId, 'search', clickPosition, 'search_results');
  }
}

export default TrackingService;
