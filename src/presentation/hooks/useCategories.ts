// src/presentation/hooks/useCategories.ts
import { useState, useCallback } from 'react';
import ApiClient from '../../infrastructure/api/ApiClient';
import { API_ENDPOINTS } from '../../constants/apiEndpoints';
import type { Category, CategoryListResponse } from '../../core/domain/entities/Category';

/**
 * Hook for category operations
 */
export const useCategories = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);

  /**
   * Fetch all categories
   */
  const fetchCategories = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await ApiClient.get<CategoryListResponse>(API_ENDPOINTS.CATEGORIES.LIST);
      
      if (response && response.data) {
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
    
    try {
      const response = await ApiClient.get(API_ENDPOINTS.CATEGORIES.PRODUCTS(categoryId));
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