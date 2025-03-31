import { useState, useCallback } from 'react';
import ApiClient from '../../infrastructure/api/ApiClient';
import CacheService from '../../infrastructure/services/CacheService';
import appConfig from '../../config/appConfig';
import { API_ENDPOINTS } from '../../constants/apiEndpoints';
import type { Category, CategoryListResponse } from '../../core/domain/entities/Category';

/**
 * Hook optimizado para operaciones con categorías
 * Incluye sistema de caché para mejorar el rendimiento
 */
export const useCategories = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);

  /**
   * Fetch all categories
   * Versión optimizada con caché
   */
  const fetchCategories = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    const cacheKey = 'categories_all';
    
    try {
      // Intentar obtener datos de la caché primero
      const cachedData = CacheService.getItem(cacheKey);
      
      if (cachedData) {
        console.log("Usando categorías en caché");
        setCategories(cachedData);
        setLoading(false);
        return cachedData;
      }
      
      // Si no hay caché, hacer la petición a la API
      const response = await ApiClient.get<CategoryListResponse>(API_ENDPOINTS.CATEGORIES.LIST);
      
      if (response && response.data) {
        // Guardar en caché
        CacheService.setItem(
          cacheKey, 
          response.data,
          appConfig.cache.categoryCacheTime
        );
        
        setCategories(response.data);
        return response.data;
      }
      
      setCategories([]);
      return [];
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al obtener categorías';
      setError(errorMessage);
      setCategories([]);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Fetch products by category
   */
  const fetchProductsByCategory = useCallback(async (categoryId: number) => {
    setLoading(true);
    setError(null);
    
    const cacheKey = `category_products_${categoryId}`;
    
    try {
      // Intentar obtener de caché primero
      const cachedData = CacheService.getItem(cacheKey);
      
      if (cachedData) {
        console.log(`Usando productos en caché para categoría ${categoryId}`);
        setLoading(false);
        return cachedData;
      }
      
      const response = await ApiClient.get(API_ENDPOINTS.CATEGORIES.PRODUCTS(categoryId));
      
      // Guardar en caché
      CacheService.setItem(
        cacheKey, 
        response,
        appConfig.cache.productCacheTime
      );
      
      return response;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al obtener productos por categoría';
      setError(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    error,
    categories,
    fetchCategories,
    fetchProductsByCategory
  };
};

export default useCategories;