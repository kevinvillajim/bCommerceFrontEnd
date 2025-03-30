import { API_ENDPOINTS } from '../../constants/apiEndpoints';
import axiosInstance from '../../infrastructure/api/axiosConfig';
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
 * Implementación del servicio de productos
 */
export class ProductService implements IProductService {
  /**
   * Obtiene una lista de productos con filtros opcionales
   */
  async getProducts(filterParams?: ProductFilterParams): Promise<ProductListResponse> {
    const response: AxiosResponse = await axiosInstance.get(
      API_ENDPOINTS.PRODUCTS.LIST,
      { params: filterParams }
    );
    return response.data;
  }

  /**
   * Obtiene un producto por su ID
   */
  async getProductById(id: number): Promise<ProductDetail> {
    const response: AxiosResponse = await axiosInstance.get(
      API_ENDPOINTS.PRODUCTS.DETAILS(id)
    );
    return response.data;
  }

  /**
   * Obtiene un producto por su slug
   */
  async getProductBySlug(slug: string): Promise<ProductDetail> {
    const response: AxiosResponse = await axiosInstance.get(
      API_ENDPOINTS.PRODUCTS.DETAILS_BY_SLUG(slug)
    );
    return response.data;
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
    
    const response: AxiosResponse = await axiosInstance.post(
      API_ENDPOINTS.PRODUCTS.CREATE,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      }
    );
    
    return response.data;
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
    
    const response: AxiosResponse = await axiosInstance.put(
      API_ENDPOINTS.PRODUCTS.UPDATE(data.id),
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      }
    );
    
    return response.data;
  }

  /**
   * Elimina un producto
   */
  async deleteProduct(id: number): Promise<boolean> {
    const response: AxiosResponse = await axiosInstance.delete(
      API_ENDPOINTS.PRODUCTS.DELETE(id)
    );
    return response.data?.success || false;
  }

  /**
   * Obtiene productos destacados
   */
  async getFeaturedProducts(limit = 8): Promise<Product[]> {
    const response: AxiosResponse = await axiosInstance.get(
      API_ENDPOINTS.PRODUCTS.FEATURED,
      { params: { limit } }
    );
    return response.data;
  }

  /**
   * Obtiene productos relacionados a un producto específico
   */
  async getRelatedProducts(productId: number, limit = 4): Promise<Product[]> {
    const response: AxiosResponse = await axiosInstance.get(
      API_ENDPOINTS.PRODUCTS.DETAILS(productId) + '/related',
      { params: { limit } }
    );
    return response.data;
  }

  /**
   * Registra una visualización de producto
   */
  async trackProductView(productId: number): Promise<void> {
    await axiosInstance.post(API_ENDPOINTS.PRODUCTS.INCREMENT_VIEW(productId));
  }
}