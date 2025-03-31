import { useState, useCallback } from 'react';

export interface FilterState {
  selectedCategories: string[];
  selectedPriceRange: { min: number; max: number } | null;
  selectedRating: number | null;
  selectedDiscount: number | null;
  expandedSections: {
    categories: boolean;
    price: boolean;
    rating: boolean;
    discount: boolean;
  };
}

export interface UseFilterStateProps {
  initialCategories?: string[];
  initialPriceRange?: { min: number; max: number } | null;
  initialRating?: number | null;
  initialDiscount?: boolean;
}

/**
 * Hook personalizado para manejar el estado de los filtros
 * Centraliza toda la lógica relacionada con los filtros
 */
export const useFilterState = ({
  initialCategories = [],
  initialPriceRange = null,
  initialRating = null,
  initialDiscount = false
}: UseFilterStateProps = {}) => {
  // Estados para cada filtro
  const [selectedCategories, setSelectedCategories] = useState<string[]>(initialCategories);
  const [selectedPriceRange, setSelectedPriceRange] = useState<{ min: number; max: number } | null>(initialPriceRange);
  const [selectedRating, setSelectedRating] = useState<number | null>(initialRating);
  const [selectedDiscount, setSelectedDiscount] = useState<number | null>(initialDiscount ? 10 : null);
  
  // Estado para secciones expandidas (con precio abierto por defecto)
  const [expandedSections, setExpandedSections] = useState({
    categories: false,
    price: true, // Pestaña de precio abierta por defecto
    rating: false,
    discount: false
  });
  
  // Funciones para manejar los cambios de estado
  const handleCategoryChange = useCallback((category: string) => {
    setSelectedCategories(prev => {
      if (prev.includes(category)) {
        return prev.filter(c => c !== category);
      } else {
        return [...prev, category];
      }
    });
  }, []);
  
  const handlePriceChange = useCallback((min: number, max: number) => {
    setSelectedPriceRange(prev => {
      // Si se selecciona el mismo rango, deseleccionarlo
      if (prev && prev.min === min && prev.max === max) {
        return null;
      }
      return { min, max };
    });
  }, []);
  
  const handleRatingChange = useCallback((rating: number) => {
    setSelectedRating(prev => prev === rating ? null : rating);
  }, []);
  
  const handleDiscountChange = useCallback((discount: number) => {
    setSelectedDiscount(prev => prev === discount ? null : discount);
  }, []);
  
  const toggleSection = useCallback((section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  }, []);
  
  const clearAllFilters = useCallback(() => {
    setSelectedCategories([]);
    setSelectedPriceRange(null);
    setSelectedRating(null);
    setSelectedDiscount(null);
  }, []);
  
  return {
    // Estados
    selectedCategories,
    selectedPriceRange,
    selectedRating,
    selectedDiscount,
    expandedSections,
    
    // Funciones
    handleCategoryChange,
    handlePriceChange,
    handleRatingChange,
    handleDiscountChange,
    toggleSection,
    clearAllFilters,
    
    // Setters directos (por si se necesitan)
    setSelectedCategories,
    setSelectedPriceRange,
    setSelectedRating,
    setSelectedDiscount,
    setExpandedSections
  };
};

export default useFilterState;