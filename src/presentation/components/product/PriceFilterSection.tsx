import React, { useState, useEffect } from 'react';
import FilterSection from './FilterSection';

interface PriceFilterSectionProps {
  initialMin: number;
  initialMax: number;
  selectedRange: { min: number; max: number } | null;
  isExpanded: boolean;
  onToggle: () => void;
  onApply: (min: number, max: number) => void;
  onClear: () => void;
}

const PriceFilterSection: React.FC<PriceFilterSectionProps> = ({
  initialMin,
  initialMax,
  selectedRange,
  isExpanded,
  onToggle,
  onApply,
  onClear
}) => {
  const [min, setMin] = useState(selectedRange?.min || initialMin);
  const [max, setMax] = useState(selectedRange?.max || initialMax);
  
  // Actualizar estado local cuando cambia el rango seleccionado
  useEffect(() => {
    if (selectedRange) {
      setMin(selectedRange.min);
      setMax(selectedRange.max);
    } else {
      setMin(initialMin);
      setMax(initialMax);
    }
  }, [selectedRange, initialMin, initialMax]);
  
  const handleMinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Number(e.target.value);
    if (isNaN(value)) return;
    
    // Asegurar que min no sea mayor que max
    setMin(value > max ? max : value);
  };
  
  const handleMaxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Number(e.target.value);
    if (isNaN(value)) return;
    
    // Asegurar que max no sea menor que min
    setMax(value < min ? min : value);
  };
  
  const handleApply = () => {
    onApply(min, max);
  };
  
  const handleClear = () => {
    onClear();
    setMin(initialMin);
    setMax(initialMax);
  };
  
  return (
    <FilterSection
      title="Rango de precio"
      isExpanded={isExpanded}
      onToggle={onToggle}
    >
      <div className="grid grid-cols-2 gap-3 mb-3">
        <div>
          <label className="block text-sm text-gray-600 mb-1">Mínimo</label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
            <input
              type="number"
              value={min}
              onChange={handleMinChange}
              min={0}
              max={max}
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
              value={max}
              onChange={handleMaxChange}
              min={min}
              className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-300 focus:border-primary-500"
            />
          </div>
        </div>
      </div>
      <div className="flex gap-2">
        <button
          onClick={handleApply}
          className="flex-1 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-md transition-colors text-sm"
        >
          Aplicar
        </button>
        {selectedRange && (
          <button
            onClick={handleClear}
            className="py-2 px-3 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-100 text-sm"
          >
            Limpiar
          </button>
        )}
      </div>
    </FilterSection>
  );
};

export default React.memo(PriceFilterSection);