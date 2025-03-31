import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import useFilterState from '../../hooks/useFilterState';
import CategoryFilterSection from './CategoryFilterSection';
import PriceFilterSection from './PriceFilterSection';
import RatingFilterSection from './RatingFilterSection';
import DiscountFilterSection from './DiscountFilterSection';

interface ProductFiltersProps {
  categories: string[];
  priceRange: { min: number; max: number };
  onCategoryChange: (categories: string[]) => void;
  onPriceRangeChange: (range: { min: number; max: number }) => void;
  onRatingChange: (rating: number) => void;
  onDiscountChange: (discount: number) => void;
  onClearFilters: () => void;
  className?: string;
  // Props para sincronizar el estado con ProductPage
  selectedCategories?: string[];
  selectedPriceRange?: { min: number; max: number } | null;
  selectedDiscount?: boolean;
}

/**
 * Componente de filtros para productos
 * Versión optimizada que utiliza subcomponentes y hooks personalizados
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
  selectedCategories: propSelectedCategories = [],
  selectedPriceRange = null,
  selectedDiscount = false,
}) => {
  // Determinar si es móvil
  const [isMobile, setIsMobile] = useState(false);
  
  // Usar el hook personalizado para manejar el estado de los filtros
  const {
    selectedCategories: localSelectedCategories,
    selectedPriceRange: localSelectedPriceRange,
    selectedRating,
    selectedDiscount: localSelectedDiscount,
    expandedSections,
    handleCategoryChange,
    handlePriceChange,
    handleRatingChange,
    handleDiscountChange,
    toggleSection,
    clearAllFilters,
    setSelectedCategories,
    setSelectedPriceRange,
    setSelectedDiscount
  } = useFilterState({
    initialCategories: propSelectedCategories,
    initialPriceRange: selectedPriceRange,
    initialDiscount: selectedDiscount
  });
  
  // Sincronizar estados locales con props cuando cambian
  useEffect(() => {
    setSelectedCategories(propSelectedCategories);
  }, [propSelectedCategories, setSelectedCategories]);
  
  useEffect(() => {
    setSelectedPriceRange(selectedPriceRange);
  }, [selectedPriceRange, setSelectedPriceRange]);
  
  useEffect(() => {
    setSelectedDiscount(selectedDiscount ? 10 : null);
  }, [selectedDiscount, setSelectedDiscount]);
  
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
  
  // Propagar cambios al componente padre
  useEffect(() => {
    onCategoryChange(localSelectedCategories);
  }, [localSelectedCategories, onCategoryChange]);
  
  // Handler para categorías
  const handleCategorySelection = (category: string, isSelected: boolean) => {
    const newCategories = isSelected
      ? [...localSelectedCategories, category]
      : localSelectedCategories.filter(c => c !== category);
    
    setSelectedCategories(newCategories);
    onCategoryChange(newCategories);
  };
  
  // Wrapper para propagar cambios de rango de precio
  const handleApplyPriceRange = (min: number, max: number) => {
    handlePriceChange(min, max);
    onPriceRangeChange({ min, max });
  };
  
  // Wrapper para propagar cambios de calificación
  const handleRatingFilterChange = (rating: number) => {
    handleRatingChange(rating);
    onRatingChange(rating);
  };
  
  // Wrapper para propagar cambios de descuento
  const handleDiscountFilterChange = (discount: number) => {
    handleDiscountChange(discount);
    onDiscountChange(discount);
  };
  
  // Wrapper para limpiar todos los filtros
  const handleClearFilters = () => {
    clearAllFilters();
    onClearFilters();
  };
  
  // Renderizado del componente
  return (
    <div className={`bg-white rounded-xl shadow-sm overflow-hidden ${className}`}>
      <div className="p-4 border-b border-gray-100 flex justify-between items-center">
        <h3 className="font-bold text-gray-800 text-lg">Filtros</h3>
        <button 
          onClick={handleClearFilters}
          className="text-primary-600 text-sm font-medium hover:text-primary-700 flex items-center"
        >
          <X size={16} className="mr-1" />
          Limpiar filtros
        </button>
      </div>

      {/* Filtro de Categorías */}
      <CategoryFilterSection
        categories={categories}
        selectedCategories={localSelectedCategories}
        isExpanded={expandedSections.categories}
        onToggle={() => toggleSection('categories')}
        onCategoryChange={handleCategorySelection}
        isMobile={isMobile}
      />

      {/* Filtro de Rango de Precio */}
      <PriceFilterSection
        initialMin={priceRange.min}
        initialMax={priceRange.max}
        selectedRange={localSelectedPriceRange}
        isExpanded={expandedSections.price}
        onToggle={() => toggleSection('price')}
        onApply={handleApplyPriceRange}
      />

      {/* Filtro de Calificación */}
      <RatingFilterSection
        selectedRating={selectedRating}
        isExpanded={expandedSections.rating}
        onToggle={() => toggleSection('rating')}
        onRatingChange={handleRatingFilterChange}
      />

      {/* Filtro de Descuentos */}
      <DiscountFilterSection
        selectedDiscount={localSelectedDiscount}
        isExpanded={expandedSections.discount}
        onToggle={() => toggleSection('discount')}
        onDiscountChange={handleDiscountFilterChange}
      />
    </div>
  );
};

export default React.memo(ProductFilters);