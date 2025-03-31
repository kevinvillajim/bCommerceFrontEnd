import { useState, useCallback, useMemo } from 'react';
import { ProductService } from '../../core/services/ProductService';
import CacheService from '../../infrastructure/services/CacheService';
import appConfig from '../../config/appConfig';
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

// Crear una clave de caché basada en los parámetros de filtro
const getCacheKey = (params?: ProductFilterParams): string => {
  if (!params) return 'products_default';
  return `products_${JSON.stringify(params)}`;
};

/**
 * Hook optimizado para operaciones de productos
 * Incluye sistema de caché y memoización
 */
export const useProducts = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [product, setProduct] = useState<ProductDetail | null>(null);
  const [meta, setMeta] = useState<{ total: number, limit: number, offset: number } | null>(null);

  // Función para adaptar el formato de la API al formato de la aplicación
  const adaptApiProductToProduct = useCallback((apiProduct: ApiProduct): Product => {
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
  }, []);

  /**
   * Fetch products with optional filtering
   * Versión optimizada con caché
   */
  const fetchProducts = useCallback(async (filterParams?: ProductFilterParams) => {
    setLoading(true);
    setError(null);
    
    // Generar clave de caché basada en los parámetros
    const cacheKey = getCacheKey(filterParams);
    
    try {
      // Intentar obtener datos de la caché primero
      const cachedData = CacheService.getItem(cacheKey);
      
      if (cachedData) {
        console.log("Usando datos en caché para:", filterParams);
        setProducts(cachedData.data);
        setMeta(cachedData.meta);
        setLoading(false);
        return cachedData;
      }
      
      console.log("Fetching products from API with params:", filterParams);
      const response = await productService.getProducts(filterParams);
      
      if (response && response.data) {
        // Adaptamos los datos al formato esperado
        // Primero convertimos la respuesta a ApiProduct[]
        const apiProducts = response.data as unknown as ApiProduct[];
        const adaptedProducts = apiProducts.map(adaptApiProductToProduct);
        
        const result = {
          data: adaptedProducts,
          meta: {
            total: response.meta.total || 0,
            limit: response.meta.limit || 10,
            offset: response.meta.offset || 0
          }
        };
        
        // Guardar en caché
        CacheService.setItem(
          cacheKey, 
          result,
          appConfig.cache.productCacheTime
        );
        
        setProducts(adaptedProducts);
        setMeta(result.meta);
        
        return result;
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
  }, [adaptApiProductToProduct]);

  /**
   * Fetch product details by ID
   * Versión optimizada con caché
   */
  const fetchProductById = useCallback(async (id: number) => {
    setLoading(true);
    setError(null);
    
    const cacheKey = `product_${id}`;
    
    try {
      // Intentar obtener de caché primero
      const cachedProduct = CacheService.getItem(cacheKey);
      
      if (cachedProduct) {
        console.log(`Usando producto en caché con ID ${id}`);
        setProduct(cachedProduct);
        setLoading(false);
        return cachedProduct;
      }
      
      const productDetailResponse = await productService.getProductById(id);
      
      if (productDetailResponse) {
        // Guardar en caché
        CacheService.setItem(
          cacheKey, 
          productDetailResponse,
          appConfig.cache.productCacheTime
        );
        
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

  return {
    loading,
    error,
    products,
    product,
    meta,
    fetchProducts,
    fetchProductById
  };
};

export default useProducts;