import React, { useState, useEffect, useRef } from 'react';
import { X, Check, Star, ChevronDown, ChevronUp, ChevronRight, ChevronLeft, Filter, Plus } from 'lucide-react';

interface FilterProps {
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

const ProductFilters: React.FC<FilterProps> = ({
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
  // State para cada filtro
  const [localSelectedCategories, setLocalSelectedCategories] = useState<string[]>(propSelectedCategories);
  const [minPrice, setMinPrice] = useState(selectedPriceRange?.min || priceRange.min);
  const [maxPrice, setMaxPrice] = useState(selectedPriceRange?.max || priceRange.max);
  const [selectedRating, setSelectedRating] = useState<number | null>(null);
  const [selectedDiscountValue, setSelectedDiscountValue] = useState<number | null>(
    selectedDiscount ? 10 : null
  );
  
  // State para expandir/colapsar secciones
  const [expandedSections, setExpandedSections] = useState({
    categories: true,
    price: false, // Inicialmente colapsado en móvil
    rating: false, // Inicialmente colapsado en móvil
    discount: false // Inicialmente colapsado en móvil
  });

  // State para modal y modo de visualización
  const [showAllFiltersModal, setShowAllFiltersModal] = useState(false);
  const [activeModalTab, setActiveModalTab] = useState<'categories' | 'price' | 'rating' | 'discount'>('price');
  const [isMobile, setIsMobile] = useState(false);
  const [showMobileFilterDrawer, setShowMobileFilterDrawer] = useState(false);

  // Para chips de filtros seleccionados
  const [appliedFilters, setAppliedFilters] = useState<{
    categories: string[],
    price: boolean,
    rating: number | null,
    discount: number | null
  }>({
    categories: [],
    price: false,
    rating: null,
    discount: null
  });

  const MAX_VISIBLE_CATEGORIES = 6; // Mostrar solo 6 categorías en móvil

  const prevPropRef = useRef(propSelectedCategories);

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

  // Actualizar estados locales cuando cambian las props
  useEffect(() => {
    if (JSON.stringify(prevPropRef.current) !== JSON.stringify(propSelectedCategories)) {
      setLocalSelectedCategories(propSelectedCategories);
      setAppliedFilters(prev => ({...prev, categories: propSelectedCategories}));
      prevPropRef.current = propSelectedCategories;
    }
  }, [propSelectedCategories]);

  useEffect(() => {
    if (selectedPriceRange !== null) {
      setMinPrice(selectedPriceRange?.min || priceRange.min);
      setMaxPrice(selectedPriceRange?.max || priceRange.max);
      setAppliedFilters(prev => ({...prev, price: true}));
    }
  }, [selectedPriceRange, priceRange]);

  useEffect(() => {
    setSelectedDiscountValue(selectedDiscount ? 10 : null);
    if (selectedDiscount) {
      setAppliedFilters(prev => ({...prev, discount: 10}));
    }
  }, [selectedDiscount]);

  // Actualizar filtros aplicados
  useEffect(() => {
    setAppliedFilters({
      categories: localSelectedCategories,
      price: minPrice !== priceRange.min || maxPrice !== priceRange.max,
      rating: selectedRating,
      discount: selectedDiscountValue
    });
  }, [
    localSelectedCategories, 
    minPrice, maxPrice, priceRange,
    selectedRating, 
    selectedDiscountValue
  ]);

  // Handler para selección de categoría
  const handleCategoryChange = (category: string) => {
    const newCategories = localSelectedCategories.includes(category)
      ? localSelectedCategories.filter(c => c !== category)
      : [...localSelectedCategories, category];
    
    setLocalSelectedCategories(newCategories);
    onCategoryChange(newCategories);
  };

  // Handler para rango de precios
  const handlePriceApply = () => {
    onPriceRangeChange({ min: minPrice, max: maxPrice });
    if (isMobile) {
      setShowMobileFilterDrawer(false);
    }
  };

  // Handler para selección de calificación
  const handleRatingChange = (rating: number) => {
    const newRating = selectedRating === rating ? null : rating;
    setSelectedRating(newRating);
    onRatingChange(newRating || 0);
  };

  // Handler para selección de descuento
  const handleDiscountChange = (discount: number) => {
    const newDiscount = selectedDiscountValue === discount ? null : discount;
    setSelectedDiscountValue(newDiscount);
    onDiscountChange(newDiscount || 0);
  };

  // Handler para limpiar todos los filtros
  const handleClearFilters = () => {
    setLocalSelectedCategories([]);
    setMinPrice(priceRange.min);
    setMaxPrice(priceRange.max);
    setSelectedRating(null);
    setSelectedDiscountValue(null);
    onClearFilters();
    
    if (isMobile) {
      setShowMobileFilterDrawer(false);
    }
  };

  // Toggle para expandir/colapsar secciones
  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  // Contar total de filtros aplicados
  const countAppliedFilters = () => {
    let count = 0;
    count += appliedFilters.categories.length;
    if (appliedFilters.price) count += 1;
    if (appliedFilters.rating !== null) count += 1;
    if (appliedFilters.discount !== null) count += 1;
    return count;
  };
  
  // Renderizado para versión móvil
  const renderMobileVersion = () => {
    return (
      <>
        {/* Barra superior con botón de filtros */}
        <div className="sticky top-0 bg-white z-10 p-3 border-b flex justify-between items-center">
          <h3 className="font-bold text-gray-800">Filtros</h3>
          <button 
            onClick={() => setShowMobileFilterDrawer(true)}
            className="flex items-center space-x-1 px-3 py-2 bg-primary-50 text-primary-600 rounded-full text-sm"
          >
            <Filter size={16} />
            <span>Filtrar</span>
            {countAppliedFilters() > 0 && (
              <span className="inline-flex items-center justify-center w-5 h-5 bg-primary-600 text-white rounded-full text-xs">
                {countAppliedFilters()}
              </span>
            )}
          </button>
        </div>
        
        {/* Chips de filtros aplicados (scrollable horizontalmente) */}
        {countAppliedFilters() > 0 && (
          <div className="bg-white px-3 py-2 overflow-x-auto whitespace-nowrap">
            <div className="inline-flex space-x-2">
              {appliedFilters.categories.map(category => (
                <div key={category} className="inline-flex items-center bg-gray-100 px-3 py-1 rounded-full text-sm">
                  <span className="truncate max-w-[120px]">{category}</span>
                  <button 
                    onClick={() => handleCategoryChange(category)}
                    className="ml-1 text-gray-500"
                  >
                    <X size={14} />
                  </button>
                </div>
              ))}
              
              {appliedFilters.price && (
                <div className="inline-flex items-center bg-gray-100 px-3 py-1 rounded-full text-sm">
                  <span>${minPrice} - ${maxPrice}</span>
                  <button 
                    onClick={() => {
                      setMinPrice(priceRange.min);
                      setMaxPrice(priceRange.max);
                      onPriceRangeChange({ min: priceRange.min, max: priceRange.max });
                    }}
                    className="ml-1 text-gray-500"
                  >
                    <X size={14} />
                  </button>
                </div>
              )}
              
              {appliedFilters.rating !== null && (
                <div className="inline-flex items-center bg-gray-100 px-3 py-1 rounded-full text-sm">
                  <span>{appliedFilters.rating}★ o más</span>
                  <button 
                    onClick={() => {
                      setSelectedRating(null);
                      onRatingChange(0);
                    }}
                    className="ml-1 text-gray-500"
                  >
                    <X size={14} />
                  </button>
                </div>
              )}
              
              {appliedFilters.discount !== null && (
                <div className="inline-flex items-center bg-gray-100 px-3 py-1 rounded-full text-sm">
                  <span>Dto {appliedFilters.discount}%+</span>
                  <button 
                    onClick={() => {
                      setSelectedDiscountValue(null);
                      onDiscountChange(0);
                    }}
                    className="ml-1 text-gray-500"
                  >
                    <X size={14} />
                  </button>
                </div>
              )}
              
              {countAppliedFilters() > 1 && (
                <button 
                  onClick={handleClearFilters}
                  className="inline-flex items-center bg-primary-50 text-primary-600 px-3 py-1 rounded-full text-sm"
                >
                  Limpiar todo
                </button>
              )}
            </div>
          </div>
        )}
        
        {/* Grid compacta de categorías populares */}
        <div className="p-3">
          <div className="flex justify-between items-center mb-3">
            <h4 className="font-medium text-gray-800">Categorías populares</h4>
            <button 
              onClick={() => {
                setShowMobileFilterDrawer(true);
                setActiveModalTab('categories');
              }}
              className="text-primary-600 text-sm"
            >
              Ver todas
            </button>
          </div>
          
          <div className="grid grid-cols-2 gap-2">
            {categories.slice(0, MAX_VISIBLE_CATEGORIES).map((category) => (
              <label 
                key={category} 
                className={`flex items-center cursor-pointer p-2 rounded-md border ${
                  localSelectedCategories.includes(category) 
                    ? 'border-primary-600 bg-primary-50' 
                    : 'border-gray-300'
                }`}
              >
                <input
                  type="checkbox"
                  className="hidden"
                  checked={localSelectedCategories.includes(category)}
                  onChange={() => handleCategoryChange(category)}
                />
                <span className="text-sm truncate">{category}</span>
              </label>
            ))}
          </div>
        </div>
        
        {/* Modal de filtros en pantalla completa */}
        {showMobileFilterDrawer && (
          <div className="fixed inset-0 bg-white z-50 flex flex-col">
            <div className="flex justify-between items-center p-4 border-b">
              <h3 className="font-bold text-gray-800 text-lg">Filtros</h3>
              <button 
                onClick={() => setShowMobileFilterDrawer(false)}
                className="text-gray-500"
              >
                <X size={24} />
              </button>
            </div>
            
            <div className="flex border-b overflow-x-auto">
              <button 
                onClick={() => setActiveModalTab('categories')}
                className={`px-4 py-3 font-medium whitespace-nowrap ${
                  activeModalTab === 'categories' 
                    ? 'text-primary-600 border-b-2 border-primary-600' 
                    : 'text-gray-600'
                }`}
              >
                Categorías
              </button>
              <button 
                onClick={() => setActiveModalTab('price')}
                className={`px-4 py-3 font-medium whitespace-nowrap ${
                  activeModalTab === 'price' 
                    ? 'text-primary-600 border-b-2 border-primary-600' 
                    : 'text-gray-600'
                }`}
              >
                Precio
              </button>
              <button 
                onClick={() => setActiveModalTab('rating')}
                className={`px-4 py-3 font-medium whitespace-nowrap ${
                  activeModalTab === 'rating' 
                    ? 'text-primary-600 border-b-2 border-primary-600' 
                    : 'text-gray-600'
                }`}
              >
                Calificación
              </button>
              <button 
                onClick={() => setActiveModalTab('discount')}
                className={`px-4 py-3 font-medium whitespace-nowrap ${
                  activeModalTab === 'discount' 
                    ? 'text-primary-600 border-b-2 border-primary-600' 
                    : 'text-gray-600'
                }`}
              >
                Descuentos
              </button>
            </div>
            
            <div className="flex-grow overflow-y-auto p-4">
              {activeModalTab === 'categories' && (
                <div className="grid grid-cols-2 gap-2">
                  {categories.map((category) => (
                    <label 
                      key={category} 
                      className={`flex items-center cursor-pointer p-3 rounded-md border ${
                        localSelectedCategories.includes(category) 
                          ? 'border-primary-600 bg-primary-50' 
                          : 'border-gray-300'
                      }`}
                    >
                      <input
                        type="checkbox"
                        className="hidden"
                        checked={localSelectedCategories.includes(category)}
                        onChange={() => handleCategoryChange(category)}
                      />
                      <span className="text-sm">{category}</span>
                    </label>
                  ))}
                </div>
              )}
              
              {activeModalTab === 'price' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm text-gray-600 mb-1">Mínimo</label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                        <input
                          type="number"
                          value={minPrice}
                          onChange={(e) => setMinPrice(Number(e.target.value))}
                          min={0}
                          max={maxPrice}
                          className="w-full pl-8 pr-3 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-300 focus:border-primary-500"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm text-gray-600 mb-1">Máximo</label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                        <input
                          type="number"
                          value={maxPrice}
                          onChange={(e) => setMaxPrice(Number(e.target.value))}
                          min={minPrice}
                          className="w-full pl-8 pr-3 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-300 focus:border-primary-500"
                        />
                      </div>
                    </div>
                  </div>
                  
                  <button
                    onClick={handlePriceApply}
                    className="w-full py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-md transition-colors"
                  >
                    Aplicar
                  </button>
                </div>
              )}
              
              {activeModalTab === 'rating' && (
                <div className="space-y-3">
                  {[4, 3, 2, 1].map((rating) => (
                    <label 
                      key={rating} 
                      className={`flex items-center cursor-pointer p-3 rounded-md border ${
                        selectedRating === rating 
                          ? 'border-primary-600 bg-primary-50' 
                          : 'border-gray-300'
                      }`}
                    >
                      <input
                        type="radio"
                        className="hidden"
                        checked={selectedRating === rating}
                        onChange={() => handleRatingChange(rating)}
                      />
                      <div className="flex items-center">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            size={18}
                            className={`${i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
                          />
                        ))}
                        <span className="ml-2 text-sm">y superior</span>
                      </div>
                    </label>
                  ))}
                </div>
              )}
              
              {activeModalTab === 'discount' && (
                <div className="space-y-3">
                  {[10, 20, 30, 40].map((discount) => (
                    <label 
                      key={discount} 
                      className={`flex items-center cursor-pointer p-3 rounded-md border ${
                        selectedDiscountValue === discount 
                          ? 'border-primary-600 bg-primary-50' 
                          : 'border-gray-300'
                      }`}
                    >
                      <input
                        type="radio"
                        className="hidden"
                        checked={selectedDiscountValue === discount}
                        onChange={() => handleDiscountChange(discount)}
                      />
                      <span>{discount}% o más</span>
                    </label>
                  ))}
                </div>
              )}
            </div>
            
            <div className="border-t p-4 bg-white">
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={handleClearFilters}
                  className="py-3 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
                >
                  Limpiar filtros
                </button>
                <button
                  onClick={() => setShowMobileFilterDrawer(false)}
                  className="py-3 bg-primary-600 text-white rounded-md hover:bg-primary-700"
                >
                  Ver resultados
                </button>
              </div>
            </div>
          </div>
        )}
      </>
    );
  };

  // Renderizado para versión desktop (original con mejoras)
  const renderDesktopVersion = () => {
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
        <div className="border-b border-gray-100">
          <div 
            className="p-4 flex justify-between items-center cursor-pointer" 
            onClick={() => toggleSection('categories')}
          >
            <h4 className="font-medium text-gray-800">Categorías</h4>
            {expandedSections.categories ? 
              <ChevronUp size={18} className="text-gray-500" /> : 
              <ChevronDown size={18} className="text-gray-500" />
            }
          </div>
          
          {expandedSections.categories && (
            <div className="px-4 pb-4">
              <div className="grid grid-cols-1 gap-2 max-h-64 overflow-y-auto pr-2">
                {categories.map((category) => (
                  <label 
                    key={category} 
                    className="flex items-center cursor-pointer hover:bg-gray-50 p-2 rounded-md w-full"
                  >
                    <div 
                      className={`w-5 h-5 border rounded flex items-center justify-center cursor-pointer ${
                        localSelectedCategories.includes(category) 
                          ? 'bg-primary-600 border-primary-600' 
                          : 'border-gray-300'
                      }`}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleCategoryChange(category);
                      }}
                    >
                      {localSelectedCategories.includes(category) && (
                        <Check size={14} className="text-white" />
                      )}
                    </div>
                    <span 
                      className="ml-2 text-gray-700 w-full"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleCategoryChange(category);
                      }}
                    >
                      {category}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Filtro de Rango de Precio */}
        <div className="border-b border-gray-100">
          <div 
            className="p-4 flex justify-between items-center cursor-pointer" 
            onClick={() => toggleSection('price')}
          >
            <h4 className="font-medium text-gray-800">Rango de precio</h4>
            {expandedSections.price ? 
              <ChevronUp size={18} className="text-gray-500" /> : 
              <ChevronDown size={18} className="text-gray-500" />
            }
          </div>
          
          {expandedSections.price && (
            <div className="px-4 pb-4">
              <div className="grid grid-cols-2 gap-3 mb-3">
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Mínimo</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                    <input
                      type="number"
                      value={minPrice}
                      onChange={(e) => setMinPrice(Number(e.target.value))}
                      min={0}
                      max={maxPrice}
                      className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-300 focus:border-primary-500"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Máximo</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                    <input
                      type="number"
                      value={maxPrice}
                      onChange={(e) => setMaxPrice(Number(e.target.value))}
                      min={minPrice}
                      className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-300 focus:border-primary-500"
                    />
                  </div>
                </div>
              </div>
              <button
                onClick={handlePriceApply}
                className="w-full py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-md transition-colors text-sm"
              >
                Aplicar
              </button>
            </div>
          )}
        </div>

        {/* Filtro de Calificación */}
        <div className="border-b border-gray-100">
          <div 
            className="p-4 flex justify-between items-center cursor-pointer" 
            onClick={() => toggleSection('rating')}
          >
            <h4 className="font-medium text-gray-800">Calificación</h4>
            {expandedSections.rating ? 
              <ChevronUp size={18} className="text-gray-500" /> : 
              <ChevronDown size={18} className="text-gray-500" />
            }
          </div>
          
          {expandedSections.rating && (
            <div className="px-4 pb-4 space-y-2">
              {[4, 3, 2, 1].map((rating) => (
                <label 
                  key={rating} 
                  className="flex items-center cursor-pointer hover:bg-gray-50 p-2 rounded-md w-full"
                >
                  <div 
                    className={`w-5 h-5 border rounded flex items-center justify-center cursor-pointer ${
                      selectedRating === rating 
                        ? 'bg-primary-600 border-primary-600' 
                        : 'border-gray-300'
                    }`}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRatingChange(rating);
                    }}
                  >
                    {selectedRating === rating && (
                      <Check size={14} className="text-white" />
                    )}
                  </div>
                  <div 
                    className="ml-2 flex items-center w-full"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRatingChange(rating);
                    }}
                  >
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        size={16}
                        className={`${i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
                      />
                    ))}
                    <span className="ml-1 text-sm text-gray-700">y superior</span>
                  </div>
                </label>
              ))}
            </div>
          )}
        </div>

        {/* Filtro de Descuentos */}
        <div>
          <div 
            className="p-4 flex justify-between items-center cursor-pointer" 
            onClick={() => toggleSection('discount')}
          >
            <h4 className="font-medium text-gray-800">Descuentos</h4>
            {expandedSections.discount ? 
              <ChevronUp size={18} className="text-gray-500" /> : 
              <ChevronDown size={18} className="text-gray-500" />
            }
          </div>
          
          {expandedSections.discount && (
            <div className="px-4 pb-4 space-y-2">
              {[10, 20, 30, 40].map((discount) => (
                <label 
                  key={discount} 
                  className="flex items-center cursor-pointer hover:bg-gray-50 p-2 rounded-md w-full"
                >
                  <div 
                    className={`w-5 h-5 border rounded flex items-center justify-center cursor-pointer ${
                      selectedDiscountValue === discount 
                        ? 'bg-primary-600 border-primary-600' 
                        : 'border-gray-300'
                    }`}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDiscountChange(price);
                    }}
                  >
                    {selectedDiscountValue === discount && (
                      <Check size={14} className="text-white" />
                    )}
                  </div>
                  <span 
                    className="ml-2 text-gray-700 w-full"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDiscountChange(discount);
                    }}
                  >
                    {discount}% o más
                  </span>
                </label>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  };

  return isMobile ? renderMobileVersion() : renderDesktopVersion();
};

export default ProductFilters;