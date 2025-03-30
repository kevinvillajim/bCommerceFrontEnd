// src/core/services/ProductService.ts
import { API_ENDPOINTS } from '../../constants/apiEndpoints';
import type {
  Product,
  ProductDetail,
  ProductListResponse,
  ProductCreationData,
  ProductUpdateData,
  ProductFilterParams
} from '../domain/entities/Product';
import type { IProductService } from '../domain/interfaces/IProductService';
import ApiClient from '../../infrastructure/api/ApiClient';

// Interfaz para la respuesta cruda de la API
interface ApiProductListResponse {
  data: any[];
  meta: {
    total: number;
    count?: number;
    limit?: number;
    offset?: number;
    term?: string;
    filters?: any[];
  };
}

/**
 * Implementación del servicio de productos
 */
export class ProductService implements IProductService {
  /**
   * Obtiene una lista de productos con filtros opcionales
   */
  async getProducts(filterParams?: ProductFilterParams): Promise<ProductListResponse> {
    try {
      console.log("Fetching products from API with params:", filterParams);
      
      // Adaptamos los nombres de los parámetros si es necesario
      const apiParams: Record<string, any> = {};
      
      if (filterParams) {
        // Mapeamos los parámetros de nuestra aplicación a los que espera la API
        if (filterParams.limit) apiParams.limit = filterParams.limit;
        if (filterParams.offset) apiParams.offset = filterParams.offset;
        if (filterParams.term) apiParams.term = filterParams.term;
        if (filterParams.categoryId) apiParams.category_id = filterParams.categoryId;
        if (filterParams.minPrice) apiParams.min_price = filterParams.minPrice;
        if (filterParams.maxPrice) apiParams.max_price = filterParams.maxPrice;
        
        // Añadir otros parámetros según sea necesario
        if (filterParams.sortBy) {
          apiParams.sort_by = filterParams.sortBy;
          if (filterParams.sortDir) {
            apiParams.sort_dir = filterParams.sortDir;
          }
        }
      }
      
      const response = await ApiClient.get<ApiProductListResponse>(
        API_ENDPOINTS.PRODUCTS.LIST,
        apiParams
      );
      
      console.log("API response:", response);
      
      // Devolvemos la respuesta tal cual, la transformación se hace en el hook useProducts
      return response as unknown as ProductListResponse;
    } catch (error) {
      console.error('Error getting products:', error);
      // Devolver un objeto vacío en caso de error
      return { data: [], meta: { total: 0, limit: 0, offset: 0 } };
    }
  }

  /**
   * Obtiene un producto por su ID
   */
  async getProductById(id: number): Promise<ProductDetail> {
    try {
      const response = await ApiClient.get<any>(
        API_ENDPOINTS.PRODUCTS.DETAILS(id)
      );
      
      // Si la API devuelve un objeto con una propiedad 'data', extraemos eso
      const productData = response.data ? response.data : response;
      
      // Aquí podríamos adaptar los datos si es necesario, pero lo hacemos en el hook
      return productData as unknown as ProductDetail;
    } catch (error) {
      console.error(`Error getting product ${id}:`, error);
      throw error;
    }
  }

  /**
   * Obtiene un producto por su slug
   */
  async getProductBySlug(slug: string): Promise<ProductDetail> {
    try {
      const response = await ApiClient.get<any>(
        API_ENDPOINTS.PRODUCTS.DETAILS_BY_SLUG(slug)
      );
      
      // Si la API devuelve un objeto con una propiedad 'data', extraemos eso
      const productData = response.data ? response.data : response;
      
      return productData as unknown as ProductDetail;
    } catch (error) {
      console.error(`Error getting product with slug ${slug}:`, error);
      throw error;
    }
  }

  /**
   * Crea un nuevo producto
   */
  async createProduct(data: ProductCreationData): Promise<Product> {
    const formData = new FormData();
    
    // Agregamos todos los campos no-archivo al FormData
    Object.entries(data).forEach(([key, value]) => {
      if (key !== 'images') {
        if (Array.isArray(value) || typeof value === 'object') {
          formData.append(key, JSON.stringify(value));
        } else if (value !== undefined && value !== null) {
          formData.append(key, String(value));
        }
      }
    });
    
    // Adaptamos los nombres si es necesario
    if (data.categoryId) {
      formData.append('category_id', String(data.categoryId));
    }
    
    // Agregamos los archivos de imágenes
    if (data.images && data.images.length > 0) {
      data.images.forEach((image, index) => {
        formData.append(`images[${index}]`, image);
      });
    }
    
    try {
      const response = await ApiClient.uploadFile<Product>(
        API_ENDPOINTS.PRODUCTS.CREATE,
        formData
      );
      return response;
    } catch (error) {
      console.error('Error creating product:', error);
      throw error;
    }
  }

  /**
   * Actualiza un producto existente
   */
  async updateProduct(data: ProductUpdateData): Promise<Product> {
    const formData = new FormData();
    
    // Agregamos todos los campos no-archivo al FormData
    Object.entries(data).forEach(([key, value]) => {
      if (key !== 'images') {
        if (Array.isArray(value) || typeof value === 'object') {
          formData.append(key, JSON.stringify(value));
        } else if (value !== undefined && value !== null) {
          formData.append(key, String(value));
        }
      }
    });
    
    // Adaptamos los nombres si es necesario
    if (data.categoryId) {
      formData.append('category_id', String(data.categoryId));
    }
    
    // Agregamos los archivos de imágenes
    if (data.images && data.images.length > 0) {
      data.images.forEach((image, index) => {
        formData.append(`images[${index}]`, image);
      });
    }
    
    try {
      const response = await ApiClient.uploadFile<Product>(
        API_ENDPOINTS.PRODUCTS.UPDATE(data.id),
        formData
      );
      return response;
    } catch (error) {
      console.error(`Error updating product ${data.id}:`, error);
      throw error;
    }
  }

  /**
   * Elimina un producto
   */
  async deleteProduct(id: number): Promise<boolean> {
    try {
      const response = await ApiClient.delete<{ success: boolean }>(
        API_ENDPOINTS.PRODUCTS.DELETE(id)
      );
      return response.success || false;
    } catch (error) {
      console.error(`Error deleting product ${id}:`, error);
      return false;
    }
  }

  /**
   * Obtiene productos destacados
   */
  async getFeaturedProducts(limit = 8): Promise<Product[]> {
    try {
      const response = await ApiClient.get<any>(
        API_ENDPOINTS.PRODUCTS.FEATURED,
        { limit }
      );
      
      // Adaptar la respuesta según la estructura de la API
      const featuredProducts = response.data || [];
      
      return featuredProducts;
    } catch (error) {
      console.error('Error getting featured products:', error);
      return [];
    }
  }

  /**
   * Obtiene productos relacionados a un producto específico
   */
  async getRelatedProducts(productId: number, limit = 4): Promise<Product[]> {
    try {
      const response = await ApiClient.get<any>(
        `${API_ENDPOINTS.PRODUCTS.DETAILS(productId)}/related`,
        { limit }
      );
      
      // Adaptar la respuesta según la estructura de la API
      const relatedProducts = response.data || [];
      
      return relatedProducts;
    } catch (error) {
      console.error(`Error getting related products for ${productId}:`, error);
      return [];
    }
  }

  /**
   * Registra una visualización de producto
   */
  async trackProductView(productId: number): Promise<void> {
    try {
      await ApiClient.post(API_ENDPOINTS.PRODUCTS.INCREMENT_VIEW(productId));
    } catch (error) {
      console.error(`Error tracking product view ${productId}:`, error);
    }
  }
}