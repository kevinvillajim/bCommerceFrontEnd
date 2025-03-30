import React from 'react';
import { X } from 'lucide-react';
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
  if (!isOpen) return null;

  return (
    <div className="md:hidden fixed inset-0 bg-gray-900 bg-opacity-50 z-40 flex items-end">
      <div className="bg-white w-full rounded-t-xl p-6 max-h-[80vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-bold text-lg">Filtros</h3>
          <button onClick={onClose} className="text-gray-500">
            <X size={24} />
          </button>
        </div>
        
        {/* Categorías */}
        <div className="mb-6">
          <h4 className="font-medium mb-2">Categorías</h4>
          <div className="space-y-3">
            {categories.map((category) => (
              <label key={category.id} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={selectedCategories.includes(category.name)}
                  onChange={(e) => onCategoryChange(category.name, e.target.checked)}
                  className="rounded text-primary-600 focus:ring-primary-500 h-5 w-5"
                />
                <span className="text-gray-700">{category.name}</span>
              </label>
            ))}
          </div>
        </div>
        
        {/* Rangos de Precio */}
        <div className="mb-6">
          <h4 className="font-medium mb-2">Rango de Precio</h4>
          <div className="space-y-3">
            {priceRanges.map((range) => (
              <label key={range.id} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={selectedRangeId === range.id}
                  onChange={() => {
                    const [min, max] = range.id.split('-').map(Number);
                    onPriceRangeChange(min, max);
                  }}
                  className="rounded text-primary-600 focus:ring-primary-500 h-5 w-5"
                />
                <span className="text-gray-700">{range.label}</span>
              </label>
            ))}
          </div>
        </div>
        
        {/* Filtro de Descuentos */}
        <div className="mb-6">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={showingDiscounted}
              onChange={onDiscountToggle}
              className="rounded text-primary-600 focus:ring-primary-500 h-5 w-5"
            />
            <span className="text-gray-700">Productos con descuento</span>
          </label>
        </div>
        
        {/* Botones de Acción */}
        <div className="mt-6 flex gap-3">
          <button 
            onClick={onClearFilters}
            className="flex-1 py-2 border border-gray-300 rounded-lg"
          >
            Limpiar
          </button>
          <button 
            onClick={onClose}
            className="flex-1 py-2 bg-primary-600 text-white rounded-lg"
          >
            Ver resultados
          </button>
        </div>
      </div>
    </div>
  );
};

export default MobileFilterPanel;