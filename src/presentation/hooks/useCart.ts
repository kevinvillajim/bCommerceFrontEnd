// src/presentation/hooks/useCart.ts
import { useContext } from 'react';
import { CartContext } from '../contexts/CartContext';

export const useCart = () => {
  const cartContext = useContext(CartContext);
  return cartContext;
};

// src/presentation/hooks/useProducts.ts
import { useState, useCallback } from 'react';
import { ProductService } from '../../core/services/ProductService';
import type { ProductFilterParams, Product, ProductDetail } from '../../core/domain/entities/Product';

const productService = new ProductService();

export const useProducts = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [productDetail, setProductDetail] = useState<ProductDetail | null>(null);

  const getProducts = useCallback(async (params?: ProductFilterParams) => {
    setLoading(true);
    try {
      const response = await productService.getProducts(params);
      setProducts(response.data);
      return response;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al obtener productos');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Añadir otros métodos para getProductById, etc.

  return {
    loading,
    error,
    products,
    productDetail,
    getProducts,
    // otros métodos
  };
};