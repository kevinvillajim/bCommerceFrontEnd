// src/presentation/hooks/useProducts.ts
import { useState, useCallback } from 'react';
import { ProductService } from '../../core/services/ProductService';
import type { 
  Product, 
  ProductDetail, 
  ProductFilterParams, 
} from '../../core/domain/entities/Product';

// Create instance of product service
const productService = new ProductService();

// Interfaz para la respuesta de la API
interface ApiProduct {
  id: number;
  user_id: number;
  category_id: number;
  name: string;
  slug: string;
  description: string;
  price: number;
  stock: number;
  discount_percentage: number;
  view_count: number;
  sales_count: number;
  created_at: string;
  updated_at: string;
  featured: boolean;
  published: boolean;
  status: string;
  images: Array<{
    original: string;
    thumbnail: string;
    medium: string;
    large: string;
  }>;
  [key: string]: any; // Para cualquier otra propiedad
}

// Interfaz para la respuesta completa de la API
interface ApiProductResponse {
  data: ApiProduct[];
  meta: {
    total: number;
    limit?: number;
    offset?: number;
    count?: number;
  };
}

/**
 * Hook for product operations
 */
export const useProducts = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [product, setProduct] = useState<ProductDetail | null>(null);
  const [meta, setMeta] = useState<{ total: number, limit: number, offset: number } | null>(null);

  // Función para adaptar el formato de la API al formato de la aplicación
  const adaptApiProductToProduct = (apiProduct: ApiProduct): Product => {
    return {
      id: apiProduct.id,
      userId: apiProduct.user_id,
      categoryId: apiProduct.category_id,
      name: apiProduct.name,
      slug: apiProduct.slug,
      description: apiProduct.description,
      price: apiProduct.price,
      stock: apiProduct.stock,
      // Extraer solo las URLs de las imágenes
      images: apiProduct.images?.map(img => img.original) || [],
      featured: apiProduct.featured,
      published: apiProduct.published,
      status: apiProduct.status,
      viewCount: apiProduct.view_count,
      salesCount: apiProduct.sales_count,
      discountPercentage: apiProduct.discount_percentage,
      createdAt: apiProduct.created_at,
      updatedAt: apiProduct.updated_at,
      // Añadir otras propiedades según sea necesario
      colors: apiProduct.colors,
      sizes: apiProduct.sizes,
      tags: apiProduct.tags,
      attributes: apiProduct.attributes
    };
  };

  /**
   * Fetch products with optional filtering
   */
  const fetchProducts = useCallback(async (filterParams?: ProductFilterParams) => {
    setLoading(true);
    setError(null);
    
    try {
      console.log("Fetching products with params:", filterParams);
      const response = await productService.getProducts(filterParams);
      console.log("API Response:", response);
      
      if (response && response.data) {
        // Adaptamos los datos al formato esperado
        // Primero convertimos la respuesta a ApiProduct[]
        const apiProducts = response.data as unknown as ApiProduct[];
        const adaptedProducts = apiProducts.map(adaptApiProductToProduct);
        setProducts(adaptedProducts);
        
        setMeta({
          total: response.meta.total || 0,
          limit: response.meta.limit || 10,
          offset: response.meta.offset || 0
        });
        
        return {
          data: adaptedProducts,
          meta: response.meta
        };
      } else {
        setProducts([]);
        setMeta({ total: 0, limit: 0, offset: 0 });
        return { data: [], meta: { total: 0, limit: 0, offset: 0 } };
      }
    } catch (err) {
      console.error("Error fetching products:", err);
      const errorMessage = err instanceof Error ? err.message : 'Error al obtener productos';
      setError(errorMessage);
      setProducts([]);
      setMeta({ total: 0, limit: 0, offset: 0 });
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Fetch product details by ID
   */
  const fetchProductById = useCallback(async (id: number) => {
    setLoading(true);
    setError(null);
    
    try {
      const productDetailResponse = await productService.getProductById(id);
      
      if (productDetailResponse) {
        // Aquí también podríamos necesitar adaptar los datos si la API los devuelve en otro formato
        setProduct(productDetailResponse);
        return productDetailResponse;
      }
      
      setProduct(null);
      return null;
    } catch (err) {
      console.error("Error fetching product details:", err);
      const errorMessage = err instanceof Error ? err.message : 'Error al obtener detalles del producto';
      setError(errorMessage);
      setProduct(null);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Fetch product details by slug
   */
  const fetchProductBySlug = useCallback(async (slug: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const productDetail = await productService.getProductBySlug(slug);
      setProduct(productDetail);
      return productDetail;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al obtener detalles del producto';
      setError(errorMessage);
      setProduct(null);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Fetch featured products
   */
  const fetchFeaturedProducts = useCallback(async (limit?: number) => {
    setLoading(true);
    setError(null);
    
    try {
      const featuredProducts = await productService.getFeaturedProducts(limit);
      return featuredProducts;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al obtener productos destacados';
      setError(errorMessage);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Fetch related products
   */
  const fetchRelatedProducts = useCallback(async (productId: number, limit?: number) => {
    setLoading(true);
    setError(null);
    
    try {
      const relatedProducts = await productService.getRelatedProducts(productId, limit);
      return relatedProducts;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al obtener productos relacionados';
      setError(errorMessage);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    error,
    products,
    product,
    meta,
    fetchProducts,
    fetchProductById,
    fetchProductBySlug,
    fetchFeaturedProducts,
    fetchRelatedProducts
  };
};