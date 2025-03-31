import React, { useState, useEffect, useCallback } from 'react';
import { X } from 'lucide-react';
import type { Category } from '../../../core/domain/entities/Category';

// Importamos los componentes de filtro mejorados
import CategoryFilterSection from './CategoryFilterSection';
import PriceFilterSection from './PriceFilterSection';
import RatingFilterSection from './RatingFilterSection';
import DiscountFilterSection from './DiscountFilterSection';

interface ProductFiltersProps {
  categories: string[];
  priceRange: { min: number; max: number };
  onCategoryChange: (categories: string[]) => void;
  onPriceRangeChange: (range: { min: number; max: number } | null) => void;
  onRatingChange: (rating: number) => void;
  onDiscountChange: (discount: boolean) => void;
  onClearFilters: () => void;
  className?: string;
  // Props para sincronizar el estado externo
  selectedCategories?: string[];
  selectedPriceRange?: { min: number; max: number } | null;
  selectedRating?: number | null;
  selectedDiscount?: boolean;
  // Datos extra
  productCountByCategory?: Record<string, number>;
}

/**
 * Componente de filtros para productos
 * Versión optimizada que utiliza subcomponentes mejorados
 */
const ProductFilters: React.FC<ProductFiltersProps> = ({
  categories = [],
  priceRange = { min: 0, max: 2000 },
  onCategoryChange,
  onPriceRangeChange,
  onRatingChange,
  onDiscountChange,
  onClearFilters,
  className = '',
  selectedCategories = [],
  selectedPriceRange = null,
  selectedRating = null,
  selectedDiscount = false,
  productCountByCategory = {}
}) => {
  // Determinar si es móvil
  const [isMobile, setIsMobile] = useState(false);
  
  // Estado para secciones expandidas
  const [expandedSections, setExpandedSections] = useState({
    categories: true,  // Categorías expandidas por defecto
    price: true,       // Precio expandido por defecto
    rating: false,
    discount: false
  });
  
  // Detectar si es dispositivo móvil
  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkIfMobile();
    window.addEventListener('resize', checkIfMobile);
    
    return () => {
      window.removeEventListener('resize', checkIfMobile);
    };
  }, []);
  
  // Alternar una sección
  const toggleSection = useCallback((section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  }, []);
  
  // Handler para categorías
  const handleCategorySelection = useCallback((category: string, isSelected: boolean) => {
    const newCategories = isSelected
      ? [...selectedCategories, category]
      : selectedCategories.filter(c => c !== category);
    
    onCategoryChange(newCategories);
  }, [selectedCategories, onCategoryChange]);
  
  // Handler para rango de precio
  const handlePriceRangeChange = useCallback((min: number, max: number) => {
    onPriceRangeChange({ min, max });
  }, [onPriceRangeChange]);
  
  // Handler para limpiar precio
  const handleClearPriceRange = useCallback(() => {
    onPriceRangeChange(null);
  }, [onPriceRangeChange]);
  
  // Handler para rating
  const handleRatingChange = useCallback((rating: number) => {
    onRatingChange(rating);
  }, [onRatingChange]);
  
  // Handler para descuento
  const handleDiscountChange = useCallback((discount: number) => {
    onDiscountChange(discount > 0);
  }, [onDiscountChange]);
  
  return (
    <div className={`bg-white rounded-xl shadow-sm overflow-hidden ${className}`}>
      <div className="p-4 border-b border-gray-100 flex justify-between items-center">
        <h3 className="font-bold text-gray-800 text-lg">Filtros</h3>
        <button 
          onClick={onClearFilters}
          className="text-primary-600 text-sm font-medium hover:text-primary-700 flex items-center"
          aria-label="Limpiar todos los filtros"
        >
          <X size={16} className="mr-1" />
          Limpiar filtros
        </button>
      </div>

      {/* Filtro de Categorías */}
      <CategoryFilterSection
        categories={categories}
        selectedCategories={selectedCategories}
        isExpanded={expandedSections.categories}
        onToggle={() => toggleSection('categories')}
        onCategoryChange={handleCategorySelection}
        isMobile={isMobile}
        productCountByCategory={productCountByCategory}
      />

      {/* Filtro de Rango de Precio */}
      <PriceFilterSection
        initialMin={priceRange.min}
        initialMax={priceRange.max}
        selectedRange={selectedPriceRange}
        isExpanded={expandedSections.price}
        onToggle={() => toggleSection('price')}
        onApply={handlePriceRangeChange}
        onClear={handleClearPriceRange}
      />

      {/* Filtro de Calificación */}
      <RatingFilterSection
        selectedRating={selectedRating}
        isExpanded={expandedSections.rating}
        onToggle={() => toggleSection('rating')}
        onRatingChange={handleRatingChange}
      />

      {/* Filtro de Descuentos */}
      <DiscountFilterSection
        selectedDiscount={selectedDiscount ? 10 : null}
        isExpanded={expandedSections.discount}
        onToggle={() => toggleSection('discount')}
        onDiscountChange={handleDiscountChange}
      />
    </div>
  );
};

export default React.memo(ProductFilters);