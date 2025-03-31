import React, { useMemo } from 'react';
import { X, Filter } from 'lucide-react';

interface ActiveFiltersProps {
  selectedCategories: string[];
  selectedPriceRange: { min: number; max: number } | null;
  showingDiscounted: boolean;
  selectedRating?: number | null;
  searchTerm?: string;
  onRemoveCategory: (category: string) => void;
  onClearPriceRange: () => void;
  onToggleDiscount: () => void;
  onClearRating?: () => void;
  onClearSearch?: () => void;
  onClearAllFilters: () => void;
  onToggleFilters: () => void;
}

const ActiveFilters: React.FC<ActiveFiltersProps> = ({
  selectedCategories,
  selectedPriceRange,
  showingDiscounted,
  selectedRating,
  searchTerm,
  onRemoveCategory,
  onClearPriceRange,
  onToggleDiscount,
  onClearRating,
  onClearSearch,
  onClearAllFilters,
  onToggleFilters
}) => {
  // Verificar si hay algún filtro activo para mostrar el botón de limpiar todo
  const hasActiveFilters = useMemo(() => {
    return selectedCategories.length > 0 || 
           selectedPriceRange !== null || 
           showingDiscounted || 
           (selectedRating !== undefined && selectedRating !== null) ||
           (searchTerm !== undefined && searchTerm !== '');
  }, [selectedCategories, selectedPriceRange, showingDiscounted, selectedRating, searchTerm]);

  return (
    <div className="flex flex-wrap items-center gap-2 mb-4 md:mb-0">
      {/* Mobile Filter Toggle */}
      <button
        onClick={onToggleFilters}
        className="md:hidden flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg shadow-sm"
        aria-label="Mostrar filtros"
      >
        <Filter size={16} />
        <span>Filtros</span>
        {hasActiveFilters && (
          <span className="ml-1 inline-flex items-center justify-center w-5 h-5 text-xs font-medium bg-primary-100 text-primary-800 rounded-full">
            {selectedCategories.length + 
             (selectedPriceRange ? 1 : 0) + 
             (showingDiscounted ? 1 : 0) + 
             (selectedRating ? 1 : 0) +
             (searchTerm && searchTerm !== '' ? 1 : 0)}
          </span>
        )}
      </button>
      
      {/* Término de búsqueda */}
      {searchTerm && searchTerm !== '' && onClearSearch && (
        <div className="flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
          <span>Búsqueda: {searchTerm}</span>
          <button 
            onClick={onClearSearch} 
            className="ml-1 text-blue-800 hover:text-blue-900"
            aria-label="Eliminar filtro de búsqueda"
          >
            <X size={14} />
          </button>
        </div>
      )}
      
      {/* Selected Categories */}
      {selectedCategories.map(category => (
        <div key={category} className="flex items-center gap-1 px-3 py-1 bg-primary-100 text-primary-800 rounded-full text-sm">
          <span>{category}</span>
          <button 
            onClick={() => onRemoveCategory(category)}
            className="ml-1 text-primary-800 hover:text-primary-900"
            aria-label={`Eliminar filtro de categoría ${category}`}
          >
            <X size={14} />
          </button>
        </div>
      ))}
      
      {/* Selected Price Range */}
      {selectedPriceRange && (
        <div className="flex items-center gap-1 px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
          <span>
            {selectedPriceRange.max === 999999 
              ? `Más de $${selectedPriceRange.min}`
              : `$${selectedPriceRange.min} - $${selectedPriceRange.max}`}
          </span>
          <button 
            onClick={onClearPriceRange}
            className="ml-1 text-green-800 hover:text-green-900"
            aria-label="Eliminar filtro de precio"
          >
            <X size={14} />
          </button>
        </div>
      )}
      
      {/* Selected Rating */}
      {selectedRating && onClearRating && (
        <div className="flex items-center gap-1 px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm">
          <span>{selectedRating}★ o más</span>
          <button 
            onClick={onClearRating}
            className="ml-1 text-yellow-800 hover:text-yellow-900"
            aria-label="Eliminar filtro de calificación"
          >
            <X size={14} />
          </button>
        </div>
      )}
      
      {/* Discount Filter */}
      {showingDiscounted && (
        <div className="flex items-center gap-1 px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm">
          <span>Con descuento</span>
          <button 
            onClick={onToggleDiscount}
            className="ml-1 text-red-800 hover:text-red-900"
            aria-label="Eliminar filtro de descuento"
          >
            <X size={14} />
          </button>
        </div>
      )}
      
      {/* Clear All Filters */}
      {hasActiveFilters && (
        <button 
          onClick={onClearAllFilters}
          className="text-gray-600 hover:text-primary-600 text-sm font-medium"
          aria-label="Limpiar todos los filtros"
        >
          Limpiar todos
        </button>
      )}
    </div>
  );
};

export default React.memo(ActiveFilters);