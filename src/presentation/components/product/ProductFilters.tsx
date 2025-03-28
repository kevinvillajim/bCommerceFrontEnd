import React, { useState, useEffect, useRef } from 'react';
import { X, Check, Star, ChevronDown, ChevronUp } from 'lucide-react';

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
  selectedCategories?: string[]; // Cambiado de selectedCategory a selectedCategories (array)
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
  selectedCategories: propSelectedCategories = [], // Ahora es un array
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
    price: true,
    rating: true,
    discount: true
  });

  const prevPropRef = useRef(propSelectedCategories);

  // Actualizar estados locales cuando cambian las props
  useEffect(() => {
    if (JSON.stringify(prevPropRef.current) !== JSON.stringify(propSelectedCategories)) {
      setLocalSelectedCategories(propSelectedCategories);
      prevPropRef.current = propSelectedCategories;
    }
  }, [propSelectedCategories]);

  useEffect(() => {
    if (selectedPriceRange !== null) {
      setMinPrice(selectedPriceRange?.min || priceRange.min);
      setMaxPrice(selectedPriceRange?.max || priceRange.max);
    }
  }, [selectedPriceRange, priceRange]);

  useEffect(() => {
    setSelectedDiscountValue(selectedDiscount ? 10 : null);
  }, [selectedDiscount]);

  // Handler para selección de categoría - ahora mantiene múltiples selecciones
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
  };

  // Toggle para expandir/colapsar secciones
  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

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

      {/* Filtro de Categorías - Corregido para selección múltiple y checkboxes interactivos */}
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
          <div className="px-4 pb-4 space-y-2">
            {categories.map((category) => (
              <label 
                key={category} 
                className="flex items-center cursor-pointer hover:bg-gray-50 p-2 rounded-md w-full"
              >
                {/* Checkbox clickable */}
                <div 
                  className={`w-5 h-5 border rounded flex items-center justify-center cursor-pointer ${
                    localSelectedCategories.includes(category) 
                      ? 'bg-primary-600 border-primary-600' 
                      : 'border-gray-300'
                  }`}
                  onClick={(e) => {
                    e.stopPropagation(); // Evitar propagación
                    handleCategoryChange(category);
                  }}
                >
                  {localSelectedCategories.includes(category) && (
                    <Check size={14} className="text-white" />
                  )}
                </div>
                {/* Texto clickable */}
                <span 
                  className="ml-2 text-gray-700 w-full"
                  onClick={(e) => {
                    e.stopPropagation(); // Evitar propagación
                    handleCategoryChange(category);
                  }}
                >
                  {category}
                </span>
              </label>
            ))}
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
                    handleDiscountChange(discount);
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

export default ProductFilters;