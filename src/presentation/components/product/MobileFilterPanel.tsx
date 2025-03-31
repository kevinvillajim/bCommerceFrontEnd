import React, { useState } from 'react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import type { Category } from '../../../core/domain/entities/Category';

interface PriceRange {
  id: string;
  label: string;
}

interface MobileFilterPanelProps {
  isOpen: boolean;
  onClose: () => void;
  categories: Category[];
  selectedCategories: string[];
  priceRanges: PriceRange[];
  selectedRangeId: string | null;
  showingDiscounted: boolean;
  onCategoryChange: (category: string, isSelected: boolean) => void;
  onPriceRangeChange: (min: number, max: number) => void;
  onDiscountToggle: () => void;
  onClearFilters: () => void;
}

/**
 * Panel de filtros para móviles (optimizado)
 * Incluye paginación para categorías (máximo 14 por página)
 * Bordes consistentes en todos los filtros
 */
const MobileFilterPanel: React.FC<MobileFilterPanelProps> = ({
  isOpen,
  onClose,
  categories,
  selectedCategories,
  priceRanges,
  selectedRangeId,
  showingDiscounted,
  onCategoryChange,
  onPriceRangeChange,
  onDiscountToggle,
  onClearFilters
}) => {
  const [activeTab, setActiveTab] = useState<'categories' | 'price' | 'ratings' | 'discounts'>('price'); // Pestaña de precio por defecto
  
  // Para paginación de categorías
  const CATEGORIES_PER_PAGE = 14;
  const [currentCategoryPage, setCurrentCategoryPage] = useState(0);
  
  if (!isOpen) return null;
  
  // Obtener categorías para la página actual
  const getPagedCategories = () => {
    const start = currentCategoryPage * CATEGORIES_PER_PAGE;
    const end = start + CATEGORIES_PER_PAGE;
    return categories.slice(start, end);
  };
  
  const totalCategoryPages = Math.ceil(categories.length / CATEGORIES_PER_PAGE);

  return (
    <div className="md:hidden fixed inset-0 bg-gray-900 bg-opacity-50 z-40 flex items-end">
      <div className="bg-white w-full rounded-t-xl max-h-[85vh] flex flex-col">
        <div className="flex justify-between items-center p-4 border-b border-gray-200">
          <h3 className="font-bold text-lg">Filtros</h3>
          <button onClick={onClose} className="text-gray-500">
            <X size={24} />
          </button>
        </div>
        
        {/* Tabs para navegación */}
        <div className="flex overflow-x-auto border-b border-gray-200">
          <button
            className={`px-4 py-2 font-medium ${
              activeTab === 'categories' 
                ? 'text-primary-600 border-b-2 border-primary-600' 
                : 'text-gray-600'
            }`}
            onClick={() => setActiveTab('categories')}
          >
            Categorías
          </button>
          <button
            className={`px-4 py-2 font-medium ${
              activeTab === 'price' 
                ? 'text-primary-600 border-b-2 border-primary-600' 
                : 'text-gray-600'
            }`}
            onClick={() => setActiveTab('price')}
          >
            Precio
          </button>
          <button
            className={`px-4 py-2 font-medium ${
              activeTab === 'ratings' 
                ? 'text-primary-600 border-b-2 border-primary-600' 
                : 'text-gray-600'
            }`}
            onClick={() => setActiveTab('ratings')}
          >
            Valoraciones
          </button>
          <button
            className={`px-4 py-2 font-medium ${
              activeTab === 'discounts' 
                ? 'text-primary-600 border-b-2 border-primary-600' 
                : 'text-gray-600'
            }`}
            onClick={() => setActiveTab('discounts')}
          >
            Descuentos
          </button>
        </div>
        
        {/* Contenido principal - scroll */}
        <div className="flex-grow overflow-y-auto p-4">
          {activeTab === 'categories' && (
            <>
              <div className="grid grid-cols-2 gap-3">
                {getPagedCategories().map((category) => (
                  <label 
                    key={category.id} 
                    className="flex items-center gap-2 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={selectedCategories.includes(category.name)}
                      onChange={(e) => onCategoryChange(category.name, e.target.checked)}
                      className="hidden"
                    />
                    <div className={`w-full p-3 rounded-lg text-center border border-gray-300 ${
                      selectedCategories.includes(category.name)
                        ? 'bg-primary-50 text-primary-700'
                        : 'text-gray-700'
                    }`}>
                      {category.name}
                    </div>
                  </label>
                ))}
              </div>
              
              {/* Paginación de categorías */}
              {totalCategoryPages > 1 && (
                <div className="flex justify-between items-center mt-4 pt-3 border-t border-gray-200">
                  <button
                    onClick={() => setCurrentCategoryPage(prev => Math.max(0, prev - 1))}
                    disabled={currentCategoryPage === 0}
                    className={`p-1 rounded-full border border-gray-300 ${
                      currentCategoryPage > 0 
                        ? 'text-gray-700 hover:bg-gray-100' 
                        : 'text-gray-400 cursor-not-allowed'
                    }`}
                  >
                    <ChevronLeft size={18} />
                  </button>
                  
                  <span className="text-sm text-gray-500">
                    Página {currentCategoryPage + 1} de {totalCategoryPages}
                  </span>
                  
                  <button
                    onClick={() => setCurrentCategoryPage(prev => Math.min(totalCategoryPages - 1, prev + 1))}
                    disabled={currentCategoryPage >= totalCategoryPages - 1}
                    className={`p-1 rounded-full border border-gray-300 ${
                      currentCategoryPage < totalCategoryPages - 1 
                        ? 'text-gray-700 hover:bg-gray-100' 
                        : 'text-gray-400 cursor-not-allowed'
                    }`}
                  >
                    <ChevronRight size={18} />
                  </button>
                </div>
              )}
            </>
          )}
          
          {activeTab === 'price' && (
            <div className="space-y-3">
              {priceRanges.map((range) => (
                <label 
                  key={range.id} 
                  className={`flex items-center p-3 border border-gray-300 rounded-lg cursor-pointer ${
                    selectedRangeId === range.id ? 'bg-primary-50' : 'bg-white'
                  }`}
                >
                  <input
                    type="radio"
                    checked={selectedRangeId === range.id}
                    onChange={() => {
                      const [min, max] = range.id.split('-').map(Number);
                      onPriceRangeChange(min, max);
                    }}
                    className="h-5 w-5 text-primary-600 rounded-full focus:ring-primary-500"
                  />
                  <span className="ml-3">{range.label}</span>
                </label>
              ))}
            </div>
          )}
          
          {activeTab === 'ratings' && (
            <div className="space-y-3">
              {[4, 3, 2, 1].map((rating) => (
                <label 
                  key={rating} 
                  className="flex items-center p-3 border border-gray-300 rounded-lg cursor-pointer"
                >
                  <input
                    type="checkbox"
                    className="h-5 w-5 text-primary-600 rounded focus:ring-primary-500"
                  />
                  <span className="ml-3">{rating} estrellas o más</span>
                </label>
              ))}
            </div>
          )}
          
          {activeTab === 'discounts' && (
            <div className="space-y-3">
              <label 
                className="flex items-center p-3 border border-gray-300 rounded-lg cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={showingDiscounted}
                  onChange={onDiscountToggle}
                  className="h-5 w-5 text-primary-600 rounded focus:ring-primary-500"
                />
                <span className="ml-3">Productos con descuento</span>
              </label>
            </div>
          )}
        </div>
        
        {/* Botones de acción */}
        <div className="p-4 border-t border-gray-200 bg-white">
          <div className="grid grid-cols-2 gap-3">
            <button 
              onClick={onClearFilters}
              className="py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
            >
              Limpiar filtros
            </button>
            <button 
              onClick={onClose}
              className="py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
            >
              Ver resultados
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default React.memo(MobileFilterPanel);