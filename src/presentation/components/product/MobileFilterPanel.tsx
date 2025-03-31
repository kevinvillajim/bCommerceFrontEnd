import React, { useState, useEffect } from 'react';
import { X, ChevronLeft, ChevronRight, Star } from 'lucide-react';
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
  selectedRating?: number | null;
  showingDiscounted: boolean;
  onCategoryChange: (category: string, isSelected: boolean) => void;
  onPriceRangeChange: (min: number, max: number) => void;
  onRatingChange?: (rating: number) => void;
  onDiscountToggle: () => void;
  onClearFilters: () => void;
  productCountByCategory?: Record<string, number>;
}

/**
 * Panel de filtros mejorado para móviles
 * Con mejor manejo de estados y animaciones
 */
const MobileFilterPanel: React.FC<MobileFilterPanelProps> = ({
  isOpen,
  onClose,
  categories,
  selectedCategories,
  priceRanges,
  selectedRangeId,
  selectedRating = null,
  showingDiscounted,
  onCategoryChange,
  onPriceRangeChange,
  onRatingChange,
  onDiscountToggle,
  onClearFilters,
  productCountByCategory = {}
}) => {
  const [activeTab, setActiveTab] = useState<'categories' | 'price' | 'rating' | 'discount'>('categories');
  
  // Para paginación de categorías
  const CATEGORIES_PER_PAGE = 14;
  const [currentCategoryPage, setCurrentCategoryPage] = useState(0);
  const [sortedCategories, setSortedCategories] = useState<Category[]>([]);
  
  useEffect(() => {
    // Ordenar categorías por cantidad de productos si está disponible
    if (categories.length > 0) {
      if (Object.keys(productCountByCategory).length > 0) {
        const sorted = [...categories].sort((a, b) => {
          const countA = productCountByCategory[a.name] || 0;
          const countB = productCountByCategory[b.name] || 0;
          return countB - countA; // De mayor a menor
        });
        setSortedCategories(sorted);
      } else {
        setSortedCategories(categories);
      }
    }
  }, [categories, productCountByCategory]);
  
  // Si no está abierto, no renderizar nada
  if (!isOpen) return null;
  
  // Obtener categorías para la página actual
  const getPagedCategories = () => {
    const start = currentCategoryPage * CATEGORIES_PER_PAGE;
    const end = start + CATEGORIES_PER_PAGE;
    return sortedCategories.slice(start, end);
  };
  
  const totalCategoryPages = Math.ceil(sortedCategories.length / CATEGORIES_PER_PAGE);

  // Calcular número de filtros activos por sección
  const getActiveCounts = () => {
    return {
      categories: selectedCategories.length,
      price: selectedRangeId ? 1 : 0,
      rating: selectedRating ? 1 : 0,
      discount: showingDiscounted ? 1 : 0
    };
  };

  const activeCounts = getActiveCounts();
  const totalActiveFilters = Object.values(activeCounts).reduce((sum, count) => sum + count, 0);

  // Extraer min y max de selectedRangeId
  const handlePriceSelection = (rangeId: string) => {
    const [min, max] = rangeId.split('-').map(Number);
    onPriceRangeChange(min, max);
  };
  
  // Para ratings
  const ratingOptions = [5, 4, 3, 2, 1];

  return (
    <div className="md:hidden fixed inset-0 bg-gray-900 bg-opacity-50 z-40 flex items-end">
      <div className="bg-white w-full rounded-t-xl max-h-[85vh] flex flex-col animate-slide-up">
        <div className="flex justify-between items-center p-4 border-b border-gray-200">
          <h3 className="font-bold text-lg">Filtros ({totalActiveFilters})</h3>
          <button 
            onClick={onClose} 
            className="text-gray-500 hover:text-gray-700"
            aria-label="Cerrar panel de filtros"
          >
            <X size={24} />
          </button>
        </div>
        
        {/* Tabs para navegación con indicadores de cantidad */}
        <div className="flex overflow-x-auto border-b border-gray-200">
          <button
            className={`px-4 py-2 font-medium relative ${
              activeTab === 'categories' 
                ? 'text-primary-600 border-b-2 border-primary-600' 
                : 'text-gray-600'
            }`}
            onClick={() => setActiveTab('categories')}
          >
            Categorías
            {activeCounts.categories > 0 && (
              <span className="absolute -top-1 -right-1 bg-primary-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                {activeCounts.categories}
              </span>
            )}
          </button>
          <button
            className={`px-4 py-2 font-medium relative ${
              activeTab === 'price' 
                ? 'text-primary-600 border-b-2 border-primary-600' 
                : 'text-gray-600'
            }`}
            onClick={() => setActiveTab('price')}
          >
            Precio
            {activeCounts.price > 0 && (
              <span className="absolute -top-1 -right-1 bg-primary-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                {activeCounts.price}
              </span>
            )}
          </button>
          {onRatingChange && (
            <button
              className={`px-4 py-2 font-medium relative ${
                activeTab === 'rating' 
                  ? 'text-primary-600 border-b-2 border-primary-600' 
                  : 'text-gray-600'
              }`}
              onClick={() => setActiveTab('rating')}
            >
              Valoraciones
              {activeCounts.rating > 0 && (
                <span className="absolute -top-1 -right-1 bg-primary-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {activeCounts.rating}
                </span>
              )}
            </button>
          )}
          <button
            className={`px-4 py-2 font-medium relative ${
              activeTab === 'discount' 
                ? 'text-primary-600 border-b-2 border-primary-600' 
                : 'text-gray-600'
            }`}
            onClick={() => setActiveTab('discount')}
          >
            Descuentos
            {activeCounts.discount > 0 && (
              <span className="absolute -top-1 -right-1 bg-primary-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                {activeCounts.discount}
              </span>
            )}
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
                    <div className={`w-full p-3 rounded-lg text-sm text-center border ${
                      selectedCategories.includes(category.name)
                        ? 'bg-primary-50 text-primary-700 border-primary-300'
                        : 'border-gray-300 text-gray-700'
                    }`}>
                      <div className="flex flex-col items-center">
                        <span className="font-medium">{category.name}</span>
                        {productCountByCategory[category.name] > 0 && (
                          <span className="text-xs text-gray-500 mt-1">
                            ({productCountByCategory[category.name]})
                          </span>
                        )}
                      </div>
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
                    className={`p-1 rounded-full border ${
                      currentCategoryPage > 0 
                        ? 'text-gray-700 border-gray-300 hover:bg-gray-100' 
                        : 'text-gray-400 border-gray-200 cursor-not-allowed'
                    }`}
                    aria-label="Página anterior"
                  >
                    <ChevronLeft size={18} />
                  </button>
                  
                  <span className="text-sm text-gray-500">
                    Página {currentCategoryPage + 1} de {totalCategoryPages}
                  </span>
                  
                  <button
                    onClick={() => setCurrentCategoryPage(prev => Math.min(totalCategoryPages - 1, prev + 1))}
                    disabled={currentCategoryPage >= totalCategoryPages - 1}
                    className={`p-1 rounded-full border ${
                      currentCategoryPage < totalCategoryPages - 1 
                        ? 'text-gray-700 border-gray-300 hover:bg-gray-100' 
                        : 'text-gray-400 border-gray-200 cursor-not-allowed'
                    }`}
                    aria-label="Página siguiente"
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
                  className={`flex items-center p-3 border rounded-lg cursor-pointer ${
                    selectedRangeId === range.id ? 'bg-primary-50 border-primary-300' : 'border-gray-300 bg-white'
                  }`}
                >
                  <input
                    type="radio"
                    checked={selectedRangeId === range.id}
                    onChange={() => handlePriceSelection(range.id)}
                    className="h-5 w-5 text-primary-600 rounded-full focus:ring-primary-500"
                  />
                  <span className="ml-3 text-gray-700">{range.label}</span>
                </label>
              ))}
            </div>
          )}
          
          {activeTab === 'rating' && onRatingChange && (
            <div className="space-y-3">
              {ratingOptions.map((rating) => (
                <label 
                  key={rating} 
                  className={`flex items-center p-3 border rounded-lg cursor-pointer ${
                    selectedRating === rating ? 'bg-primary-50 border-primary-300' : 'border-gray-300 bg-white'
                  }`}
                >
                  <input
                    type="radio"
                    checked={selectedRating === rating}
                    onChange={() => onRatingChange(rating)}
                    className="h-5 w-5 text-primary-600 rounded-full focus:ring-primary-500"
                  />
                  <span className="ml-3 flex items-center">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        size={16}
                        className={`${i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
                      />
                    ))}
                    <span className="ml-2 text-gray-700">y más</span>
                  </span>
                </label>
              ))}
            </div>
          )}
          
          {activeTab === 'discount' && (
            <div className="space-y-3">
              <label 
                className={`flex items-center p-3 border rounded-lg cursor-pointer ${
                  showingDiscounted ? 'bg-primary-50 border-primary-300' : 'border-gray-300 bg-white'
                }`}
              >
                <input
                  type="checkbox"
                  checked={showingDiscounted}
                  onChange={onDiscountToggle}
                  className="h-5 w-5 text-primary-600 rounded focus:ring-primary-500"
                />
                <span className="ml-3 text-gray-700">Productos con descuento</span>
              </label>
              <p className="mt-2 text-sm text-gray-500 px-2">
                Muestra solo productos que tienen algún descuento aplicado actualmente.
              </p>
            </div>
          )}
        </div>
        
        {/* Botones de acción */}
        <div className="p-4 border-t border-gray-200 bg-white">
          <div className="grid grid-cols-2 gap-3">
            <button 
              onClick={onClearFilters}
              className="py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              disabled={totalActiveFilters === 0}
              aria-label="Limpiar todos los filtros"
            >
              Limpiar filtros {totalActiveFilters > 0 && `(${totalActiveFilters})`}
            </button>
            <button 
              onClick={onClose}
              className="py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
              aria-label="Aplicar filtros y ver resultados"
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

// Añadimos la animación de slide-up
const style = document.createElement('style');
style.textContent = `
  @keyframes slide-up {
    from {
      transform: translateY(100%);
    }
    to {
      transform: translateY(0);
    }
  }
  .animate-slide-up {
    animation: slide-up 0.3s ease-out forwards;
  }
`;
document.head.appendChild(style);