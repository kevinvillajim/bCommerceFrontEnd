import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import type { ExtendedProductFilterParams } from '../types/ProductFilterParams';
import type { Category } from '../../core/domain/entities/Category';
import appConfig from '../../config/appConfig';

interface ProductFiltersState {
  categories: string[];
  priceRange: { min: number; max: number } | null;
  rating: number | null;
  discount: boolean;
  sortBy: string;
  page: number;
}

export const useProductFilters = (
  allCategories: Category[],
  defaultPageSize: number = appConfig.pagination.defaultPageSize
) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [filtersState, setFiltersState] = useState<ProductFiltersState>({
    categories: [],
    priceRange: null,
    rating: null,
    discount: false,
    sortBy: 'featured',
    page: 1
  });
  
  // Flag para evitar ciclos infinitos durante la sincronización URL <-> estado
  const [isUpdatingFromUrl, setIsUpdatingFromUrl] = useState(true);
  
  // Inicializar filtros desde URL (solo una vez al montar el componente)
  useEffect(() => {
    const categoryParam = searchParams.get('category');
    const minPriceParam = searchParams.get('minPrice');
    const maxPriceParam = searchParams.get('maxPrice');
    const ratingParam = searchParams.get('rating');
    const discountParam = searchParams.get('discount');
    const sortParam = searchParams.get('sort');
    const pageParam = searchParams.get('page');
    
    const newFilters: ProductFiltersState = {
      categories: categoryParam ? categoryParam.split(',') : [],
      priceRange: (minPriceParam && maxPriceParam) 
        ? { min: parseInt(minPriceParam), max: parseInt(maxPriceParam) }
        : null,
      rating: ratingParam ? parseInt(ratingParam) : null,
      discount: discountParam === 'true',
      sortBy: sortParam || 'featured',
      page: pageParam ? parseInt(pageParam) : 1
    };
    
    setFiltersState(newFilters);
    setIsUpdatingFromUrl(false);
  }, []); // Solo se ejecuta una vez al montar
  
  // Actualizar URL cuando cambian los filtros (pero no si estamos actualizando desde la URL)
  useEffect(() => {
    if (isUpdatingFromUrl) return;
    
    const newParams = new URLSearchParams(searchParams);
    
    // Gestionar categorías
    if (filtersState.categories.length > 0) {
      newParams.set('category', filtersState.categories.join(','));
    } else {
      newParams.delete('category');
    }
    
    // Gestionar rango de precio
    if (filtersState.priceRange) {
      newParams.set('minPrice', filtersState.priceRange.min.toString());
      newParams.set('maxPrice', filtersState.priceRange.max.toString());
    } else {
      newParams.delete('minPrice');
      newParams.delete('maxPrice');
    }
    
    // Gestionar rating
    if (filtersState.rating) {
      newParams.set('rating', filtersState.rating.toString());
    } else {
      newParams.delete('rating');
    }
    
    // Gestionar descuento
    if (filtersState.discount) {
      newParams.set('discount', 'true');
    } else {
      newParams.delete('discount');
    }
    
    // Gestionar ordenamiento
    if (filtersState.sortBy !== 'featured') {
      newParams.set('sort', filtersState.sortBy);
    } else {
      newParams.delete('sort');
    }
    
    // Gestionar página
    if (filtersState.page > 1) {
      newParams.set('page', filtersState.page.toString());
    } else {
      newParams.delete('page');
    }
    
    setSearchParams(newParams, { replace: true });
  }, [filtersState, isUpdatingFromUrl, searchParams, setSearchParams]);
  
  // Construir parámetros para la API de productos
  const buildFilterParams = useCallback((): ExtendedProductFilterParams => {
    const params: ExtendedProductFilterParams = {
      limit: defaultPageSize,
      offset: (filtersState.page - 1) * defaultPageSize
    };
    
    // Manejar selección múltiple de categorías
    if (filtersState.categories.length > 0) {
      const categoryIds = filtersState.categories
        .map(catName => {
          const category = allCategories.find(c => 
            c.name.toLowerCase() === catName.toLowerCase()
          );
          return category?.id;
        })
        .filter(id => id !== undefined) as number[];
      
      if (categoryIds.length > 0) {
        params.categoryIds = categoryIds;
      }
    }
    
    // Añadir rango de precio si está seleccionado
    if (filtersState.priceRange) {
      params.minPrice = filtersState.priceRange.min;
      
      // Solo añadir maxPrice si no es el valor máximo (para filtros como "Más de $X")
      if (filtersState.priceRange.max < 999999) {
        params.maxPrice = filtersState.priceRange.max;
      }
    }
    
    // Añadir filtro de rating
    if (filtersState.rating) {
      params.rating = filtersState.rating;
    }
    
    // Añadir filtro de descuento
    if (filtersState.discount) {
      params.minDiscount = 5; // Productos con al menos 5% de descuento
    }
    
    // Añadir ordenamiento
    switch (filtersState.sortBy) {
      case 'price-asc':
        params.sortBy = 'price';
        params.sortDir = 'asc';
        break;
      case 'price-desc':
        params.sortBy = 'price';
        params.sortDir = 'desc';
        break;
      case 'name-asc':
        params.sortBy = 'name';
        params.sortDir = 'asc';
        break;
      case 'name-desc':
        params.sortBy = 'name';
        params.sortDir = 'desc';
        break;
      case 'newest':
        params.sortBy = 'created_at';
        params.sortDir = 'desc';
        break;
      case 'featured':
      default:
        params.sortBy = 'featured';
        params.sortDir = 'desc';
        break;
    }
    
    return params;
  }, [filtersState, allCategories, defaultPageSize]);
  
  // Manejadores para actualizar filtros
  const setCategories = useCallback((categories: string[]) => {
    setFiltersState(prev => ({
      ...prev,
      categories,
      page: 1 // Resetear página al cambiar filtros
    }));
  }, []);
  
  const setPriceRange = useCallback((priceRange: { min: number; max: number } | null) => {
    setFiltersState(prev => ({
      ...prev,
      priceRange,
      page: 1
    }));
  }, []);
  
  const setRating = useCallback((rating: number | null) => {
    setFiltersState(prev => ({
      ...prev,
      rating,
      page: 1
    }));
  }, []);
  
  const setDiscount = useCallback((discount: boolean) => {
    setFiltersState(prev => ({
      ...prev,
      discount,
      page: 1
    }));
  }, []);
  
  const setSortBy = useCallback((sortBy: string) => {
    setFiltersState(prev => ({
      ...prev,
      sortBy,
      page: 1
    }));
  }, []);
  
  const setPage = useCallback((page: number) => {
    setFiltersState(prev => ({
      ...prev,
      page
    }));
  }, []);
  
  const clearFilters = useCallback(() => {
    setFiltersState({
      categories: [],
      priceRange: null,
      rating: null,
      discount: false,
      sortBy: 'featured',
      page: 1
    });
    
    // Limpiar URL directamente para evitar efectos en cascada
    setSearchParams(new URLSearchParams(), { replace: true });
  }, [setSearchParams]);
  
  // Utilidad para alternar una categoría (añadir/quitar)
  const toggleCategory = useCallback((category: string) => {
    setFiltersState(prev => {
      const isSelected = prev.categories.includes(category);
      const newCategories = isSelected
        ? prev.categories.filter(c => c !== category)
        : [...prev.categories, category];
      
      return {
        ...prev,
        categories: newCategories,
        page: 1
      };
    });
  }, []);
  
  return {
    filters: filtersState,
    buildFilterParams,
    setCategories,
    setPriceRange,
    setRating,
    setDiscount,
    setSortBy,
    setPage,
    clearFilters,
    toggleCategory
  };
};

export default useProductFilters;