import { useState, useEffect, useCallback } from 'react';
import { ProductService } from '../../core/services/ProductService';
import type { 
  Product, 
  ProductDetail, 
  ProductFilterParams, 
  ProductListResponse 
} from '../../core/domain/entities/Product';

// Create instance of product service
const productService = new ProductService();

/**
 * Hook for product operations
 */
export const useProducts = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [product, setProduct] = useState<ProductDetail | null>(null);
  const [meta, setMeta] = useState<{ total: number, limit: number, offset: number } | null>(null);

  /**
   * Fetch products with optional filtering
   */
  const fetchProducts = useCallback(async (filterParams?: ProductFilterParams) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await productService.getProducts(filterParams);
      setProducts(response.data);
      setMeta(response.meta);
      return response;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch products');
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
      const productDetail = await productService.getProductById(id);
      setProduct(productDetail);
      return productDetail;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch product details');
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
      setError(err instanceof Error ? err.message : 'Failed to fetch product details');
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
      setError(err instanceof Error ? err.message : 'Failed to fetch featured products');
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
      setError(err instanceof Error ? err.message : 'Failed to fetch related products');
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