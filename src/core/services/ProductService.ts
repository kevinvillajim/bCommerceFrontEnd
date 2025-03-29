import { ApiClient } from '../../infrastructure/api/ApiClient';
import { API_ENDPOINTS } from '../../constants/apiEndpoints';
import type { AxiosResponse } from 'axios';
import type {
  Product,
  ProductDetail,
  ProductListResponse,
  ProductCreationData,
  ProductUpdateData,
  ProductFilterParams
} from '../domain/entities/Product';
import type { IProductService } from '../domain/interfaces/IProductService';

/**
 * Interfaz para las respuestas de la API
 */
interface ApiResponse<T> {
  status: string;
  message?: string;
  data: T;
}

/**
 * Implementación del servicio de productos
 */
export class ProductService implements IProductService {
  /**
   * Obtiene una lista de productos con filtros opcionales
   */
  async getProducts(filterParams?: ProductFilterParams): Promise<ProductListResponse> {
    const response: AxiosResponse<ApiResponse<ProductListResponse>> = await ApiClient.get(
      API_ENDPOINTS.PRODUCTS.LIST,
      { params: filterParams }
    );
    return response.data.data;
  }

  /**
   * Obtiene un producto por su ID
   */
  async getProductById(id: number): Promise<ProductDetail> {
    const response: AxiosResponse<ApiResponse<ProductDetail>> = await ApiClient.get(
      API_ENDPOINTS.PRODUCTS.DETAILS(id)
    );
    return response.data.data;
  }

  /**
   * Obtiene un producto por su slug
   */
  async getProductBySlug(slug: string): Promise<ProductDetail> {
    const response: AxiosResponse<ApiResponse<ProductDetail>> = await ApiClient.get(
      API_ENDPOINTS.PRODUCTS.DETAILS_BY_SLUG(slug)
    );
    return response.data.data;
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
    
    const response: AxiosResponse<ApiResponse<Product>> = await ApiClient.post(
      API_ENDPOINTS.PRODUCTS.CREATE,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      }
    );
    
    return response.data.data;
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
    
    const response: AxiosResponse<ApiResponse<Product>> = await ApiClient.put(
      API_ENDPOINTS.PRODUCTS.UPDATE(data.id),
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      }
    );
    
    return response.data.data;
  }

  /**
   * Elimina un producto
   */
  async deleteProduct(id: number): Promise<boolean> {
    const response: AxiosResponse<ApiResponse<{ success: boolean }>> = await ApiClient.delete(
      API_ENDPOINTS.PRODUCTS.DELETE(id)
    );
    return response.data.data.success;
  }

  /**
   * Obtiene productos destacados
   */
  async getFeaturedProducts(limit = 8): Promise<Product[]> {
    const response: AxiosResponse<ApiResponse<Product[]>> = await ApiClient.get(
      API_ENDPOINTS.PRODUCTS.FEATURED,
      { params: { limit } }
    );
    return response.data.data;
  }

  /**
   * Obtiene productos relacionados a un producto específico
   */
  async getRelatedProducts(productId: number, limit = 4): Promise<Product[]> {
    const response: AxiosResponse<ApiResponse<Product[]>> = await ApiClient.get(
      API_ENDPOINTS.PRODUCTS.DETAILS(productId) + '/related',
      { params: { limit } }
    );
    return response.data.data;
  }

  /**
   * Registra una visualización de producto
   */
  async trackProductView(productId: number): Promise<void> {
    await ApiClient.post(API_ENDPOINTS.PRODUCTS.INCREMENT_VIEW(productId));
  }
}