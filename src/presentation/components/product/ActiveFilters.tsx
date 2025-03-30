import React from 'react';
import { X, Filter } from 'lucide-react';

interface ActiveFiltersProps {
  selectedCategories: string[];
  selectedPriceRange: { min: number; max: number } | null;
  showingDiscounted: boolean;
  onRemoveCategory: (category: string) => void;
  onClearPriceRange: () => void;
  onToggleDiscount: () => void;
  onClearAllFilters: () => void;
  onToggleFilters: () => void;
}

const ActiveFilters: React.FC<ActiveFiltersProps> = ({
  selectedCategories,
  selectedPriceRange,
  showingDiscounted,
  onRemoveCategory,
  onClearPriceRange,
  onToggleDiscount,
  onClearAllFilters,
  onToggleFilters
}) => {
  // Verificar si hay algún filtro activo
  const hasActiveFilters = selectedCategories.length > 0 || selectedPriceRange || showingDiscounted;

  return (
    <div className="flex flex-wrap items-center gap-2 mb-4 md:mb-0">
      {/* Mobile Filter Toggle */}
      <button
        onClick={onToggleFilters}
        className="md:hidden flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg shadow-sm"
      >
        <Filter size={16} />
        Filtros
      </button>
      
      {/* Selected Categories */}
      {selectedCategories.map(category => (
        <div key={category} className="flex items-center gap-1 px-3 py-1 bg-primary-100 text-primary-800 rounded-full text-sm">
          {category}
          <button onClick={() => onRemoveCategory(category)} className="ml-1">
            <X size={14} />
          </button>
        </div>
      ))}
      
      {/* Selected Price Range */}
      {selectedPriceRange && (
        <div className="flex items-center gap-1 px-3 py-1 bg-primary-100 text-primary-800 rounded-full text-sm">
          {selectedPriceRange.max === 999999 
            ? `Más de $${selectedPriceRange.min}`
            : `$${selectedPriceRange.min} - $${selectedPriceRange.max}`}
          <button onClick={onClearPriceRange} className="ml-1">
            <X size={14} />
          </button>
        </div>
      )}
      
      {/* Discount Filter */}
      {showingDiscounted && (
        <div className="flex items-center gap-1 px-3 py-1 bg-primary-100 text-primary-800 rounded-full text-sm">
          Con descuento
          <button onClick={onToggleDiscount} className="ml-1">
            <X size={14} />
          </button>
        </div>
      )}
      
      {/* Clear All Filters */}
      {hasActiveFilters && (
        <button 
          onClick={onClearAllFilters}
          className="text-gray-500 hover:text-primary-600 text-sm"
        >
          Limpiar filtros
        </button>
      )}
    </div>
  );
};

export default ActiveFilters;