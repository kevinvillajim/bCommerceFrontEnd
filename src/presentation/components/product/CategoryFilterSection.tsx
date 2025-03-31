// src/presentation/components/product/CategoryFilterSection.tsx
import React, { useState, useCallback } from 'react';
import { Check, ChevronLeft, ChevronRight } from 'lucide-react';
import FilterSection from './FilterSection';

interface CategoryFilterSectionProps {
  categories: string[];
  selectedCategories: string[];
  isExpanded: boolean;
  onToggle: () => void;
  onCategoryChange: (category: string, isSelected: boolean) => void;
  isMobile?: boolean;
}

/**
 * Componente para la sección de filtrado por categorías
 * Incluye paginación para dispositivos móviles
 * Soporta selección múltiple de categorías
 */
const CategoryFilterSection: React.FC<CategoryFilterSectionProps> = ({
  categories,
  selectedCategories,
  isExpanded,
  onToggle,
  onCategoryChange,
  isMobile = false
}) => {
  const ITEMS_PER_PAGE = 14; // Máximo 14 categorías por página en móvil
  const [currentPage, setCurrentPage] = useState(0);
  
  // Para paginación
  const getPagedCategories = useCallback(() => {
    if (!isMobile) return categories; // En desktop mostrar todas
    
    const start = currentPage * ITEMS_PER_PAGE;
    const end = start + ITEMS_PER_PAGE;
    return categories.slice(start, end);
  }, [categories, currentPage, isMobile]);
  
  const totalPages = Math.ceil(categories.length / ITEMS_PER_PAGE);
  
  const handlePreviousPage = useCallback(() => {
    setCurrentPage(prev => Math.max(0, prev - 1));
  }, []);
  
  const handleNextPage = useCallback(() => {
    setCurrentPage(prev => Math.min(totalPages - 1, prev + 1));
  }, [totalPages]);

  // Manejo de clic en categoría con memo para mejorar rendimiento
  const handleCategoryClick = useCallback((category: string, isCurrentlySelected: boolean) => {
    onCategoryChange(category, !isCurrentlySelected);
  }, [onCategoryChange]);

  return (
    <FilterSection
      title="Categorías"
      isExpanded={isExpanded}
      onToggle={onToggle}
    >
      <div className="grid grid-cols-1 gap-2 max-h-64 overflow-y-auto pr-2">
        {getPagedCategories().map((category) => (
          <label 
            key={category} 
            className="flex items-center cursor-pointer hover:bg-gray-50 p-2 rounded-md w-full"
          >
            <div 
              className={`w-5 h-5 border rounded flex items-center justify-center cursor-pointer ${
                selectedCategories.includes(category) 
                  ? 'bg-primary-600 border-primary-600' 
                  : 'border-gray-300'
              }`}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleCategoryClick(category, selectedCategories.includes(category));
              }}
            >
              {selectedCategories.includes(category) && (
                <Check size={14} className="text-white" />
              )}
            </div>
            <span 
              className="ml-2 text-gray-700 w-full"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleCategoryClick(category, selectedCategories.includes(category));
              }}
            >
              {category}
            </span>
          </label>
        ))}
      </div>
      
      {/* Controles de paginación para móvil */}
      {isMobile && totalPages > 1 && (
        <div className="flex justify-between items-center mt-4 pt-3 border-t border-gray-100">
          <button
            onClick={handlePreviousPage}
            disabled={currentPage === 0}
            className={`p-1 rounded-full border ${
              currentPage > 0 
                ? 'text-gray-700 border-gray-300 hover:bg-gray-100' 
                : 'text-gray-400 border-gray-200 cursor-not-allowed'
            }`}
          >
            <ChevronLeft size={16} />
          </button>
          
          <span className="text-sm text-gray-500">
            Página {currentPage + 1} de {totalPages}
          </span>
          
          <button
            onClick={handleNextPage}
            disabled={currentPage >= totalPages - 1}
            className={`p-1 rounded-full border ${
              currentPage < totalPages - 1 
                ? 'text-gray-700 border-gray-300 hover:bg-gray-100' 
                : 'text-gray-400 border-gray-200 cursor-not-allowed'
            }`}
          >
            <ChevronRight size={16} />
          </button>
        </div>
      )}
    </FilterSection>
  );
};

export default React.memo(CategoryFilterSection);