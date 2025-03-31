import React from 'react';
import { Check } from 'lucide-react';
import FilterSection from './FilterSection';

interface DiscountFilterSectionProps {
  selectedDiscount: number | null;
  isExpanded: boolean;
  onToggle: () => void;
  onDiscountChange: (discount: number) => void;
}

/**
 * Componente para la sección de filtrado por descuentos
 */
const DiscountFilterSection: React.FC<DiscountFilterSectionProps> = ({
  selectedDiscount,
  isExpanded,
  onToggle,
  onDiscountChange
}) => {
  return (
    <FilterSection
      title="Descuentos"
      isExpanded={isExpanded}
      onToggle={onToggle}
    >
      <div className="space-y-2">
        {[10, 20, 30, 40].map((discount) => (
          <label 
            key={discount} 
            className="flex items-center cursor-pointer hover:bg-gray-50 p-2 rounded-md w-full"
          >
            <div 
              className={`w-5 h-5 border rounded flex items-center justify-center cursor-pointer ${
                selectedDiscount === discount 
                  ? 'bg-primary-600 border-primary-600' 
                  : 'border-gray-300'
              }`}
              onClick={(e) => {
                e.stopPropagation();
                onDiscountChange(discount);
              }}
            >
              {selectedDiscount === discount && (
                <Check size={14} className="text-white" />
              )}
            </div>
            <span 
              className="ml-2 text-gray-700 w-full"
              onClick={(e) => {
                e.stopPropagation();
                onDiscountChange(discount);
              }}
            >
              {discount}% o más
            </span>
          </label>
        ))}
      </div>
    </FilterSection>
  );
};

export default React.memo(DiscountFilterSection);