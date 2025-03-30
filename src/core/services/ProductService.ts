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

/**
 * Implementación del servicio de productos
 */
export class ProductService implements IProductService {
  /**
   * Obtiene una lista de productos con filtros opcionales
   */
  async getProducts(filterParams?: ProductFilterParams): Promise<ProductListResponse> {
    try {
      const response = await ApiClient.get<ProductListResponse>(
        API_ENDPOINTS.PRODUCTS.LIST,
        filterParams
      );
      return response;
    } catch (error) {
      console.error('Error al obtener productos:', error);
      // Devolver un objeto vacío en caso de error
      return { data: [], meta: { total: 0, limit: 0, offset: 0 } };
    }
  }

  /**
   * Obtiene un producto por su ID
   */
  async getProductById(id: number): Promise<ProductDetail> {
    try {
      const response = await ApiClient.get<ProductDetail>(
        API_ENDPOINTS.PRODUCTS.DETAILS(id)
      );
      return response;
    } catch (error) {
      console.error(`Error al obtener el producto ${id}:`, error);
      throw error;
    }
  }

  /**
   * Obtiene un producto por su slug
   */
  async getProductBySlug(slug: string): Promise<ProductDetail> {
    try {
      const response = await ApiClient.get<ProductDetail>(
        API_ENDPOINTS.PRODUCTS.DETAILS_BY_SLUG(slug)
      );
      return response;
    } catch (error) {
      console.error(`Error al obtener el producto con slug ${slug}:`, error);
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
      console.error('Error al crear producto:', error);
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
      console.error(`Error al actualizar producto ${data.id}:`, error);
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
      console.error(`Error al eliminar producto ${id}:`, error);
      return false;
    }
  }

  /**
   * Obtiene productos destacados
   */
  async getFeaturedProducts(limit = 8): Promise<Product[]> {
    try {
      const response = await ApiClient.get<{ data: Product[] }>(
        API_ENDPOINTS.PRODUCTS.FEATURED,
        { limit }
      );
      return response.data || [];
    } catch (error) {
      console.error('Error al obtener productos destacados:', error);
      return [];
    }
  }

  /**
   * Obtiene productos relacionados a un producto específico
   */
  async getRelatedProducts(productId: number, limit = 4): Promise<Product[]> {
    try {
      const response = await ApiClient.get<{ data: Product[] }>(
        `${API_ENDPOINTS.PRODUCTS.DETAILS(productId)}/related`,
        { limit }
      );
      return response.data || [];
    } catch (error) {
      console.error(`Error al obtener productos relacionados para ${productId}:`, error);
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
      console.error(`Error al registrar visualización de producto ${productId}:`, error);
    }
  }
}