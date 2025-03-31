import { ProductService } from '../../core/services/ProductService';
import ApiClient from '../api/ApiClient';
import CacheService from './CacheService';
import appConfig from '../../config/appConfig';
import { API_ENDPOINTS } from '../../constants/apiEndpoints';
import type { ProductFilterParams } from '../../core/domain/entities/Product';

// Instancia del servicio de productos
const productService = new ProductService();

// Interfaz para respuestas de la API
interface ApiResponse<T = any> {
  data?: T;
  meta?: any;
  [key: string]: any;
}

/**
 * Servicio para precarga de datos frecuentemente utilizados
 * Ayuda a mejorar el rendimiento previniendo solicitudes repetidas
 */
export class PrefetchService {
  /**
   * Precarga las categorías principales
   * @returns Promise con el resultado de la petición
   */
  static async prefetchCategories(): Promise<void> {
    const cacheKey = 'categories_all';
    
    // Verificar si ya están en caché
    if (CacheService.hasValidItem(cacheKey)) {
      console.log('Las categorías ya están en caché');
      return;
    }
    
    try {
      console.log('Precargando categorías...');
      const response = await ApiClient.get<ApiResponse>(API_ENDPOINTS.CATEGORIES.LIST);
      
      if (response && response.data) {
        // Guardar en caché con tiempo de vida según configuración
        CacheService.setItem(
          cacheKey,
          response.data,
          appConfig.cache.categoryCacheTime
        );
        console.log('Categorías precargadas y almacenadas en caché');
      }
    } catch (error) {
      console.error('Error al precargar categorías:', error);
    }
  }

  /**
   * Precarga productos destacados
   * @param limit Número de productos a precargar
   */
  static async prefetchFeaturedProducts(limit: number = 8): Promise<void> {
    const cacheKey = `featured_products_${limit}`;
    
    // Verificar si ya están en caché
    if (CacheService.hasValidItem(cacheKey)) {
      console.log('Los productos destacados ya están en caché');
      return;
    }
    
    try {
      console.log('Precargando productos destacados...');
      const featuredParams: ProductFilterParams = {
        limit,
        featured: true,
        sortBy: 'featured',
        sortDir: 'desc'
      };
      
      const response = await productService.getProducts(featuredParams);
      
      if (response) {
        // Guardar en caché
        CacheService.setItem(
          cacheKey,
          response,
          appConfig.cache.productCacheTime
        );
        console.log('Productos destacados precargados y almacenados en caché');
      }
    } catch (error) {
      console.error('Error al precargar productos destacados:', error);
    }
  }

  /**
   * Precargar productos por categoría popular
   * @param categoryId ID de la categoría
   * @param limit Número de productos a precargar
   */
  static async prefetchCategoryProducts(categoryId: number, limit: number = 8): Promise<void> {
    const cacheKey = `category_products_${categoryId}_${limit}`;
    
    // Verificar si ya están en caché
    if (CacheService.hasValidItem(cacheKey)) {
      console.log(`Los productos de la categoría ${categoryId} ya están en caché`);
      return;
    }
    
    try {
      console.log(`Precargando productos de la categoría ${categoryId}...`);
      const params: ProductFilterParams = {
        categoryId,
        limit,
        sortBy: 'featured',
        sortDir: 'desc'
      };
      
      const response = await productService.getProducts(params);
      
      if (response) {
        // Guardar en caché
        CacheService.setItem(
          cacheKey,
          response,
          appConfig.cache.productCacheTime
        );
        console.log(`Productos de la categoría ${categoryId} precargados y almacenados en caché`);
      }
    } catch (error) {
      console.error(`Error al precargar productos de la categoría ${categoryId}:`, error);
    }
  }

  /**
   * Iniciar precarga de datos más importantes al cargar la aplicación
   */
  static initPrefetch(): void {
    // Ejecutar sin bloquear
    setTimeout(() => {
      this.prefetchCategories();
      this.prefetchFeaturedProducts();
      
      // Precargar productos de categorías populares
      // IDs de ejemplo, deberían ser tus categorías más visitadas
      [1, 2, 3].forEach(categoryId => {
        this.prefetchCategoryProducts(categoryId);
      });
    }, 500); // Pequeño retraso para no competir con la carga inicial
  }
}

export default PrefetchService;