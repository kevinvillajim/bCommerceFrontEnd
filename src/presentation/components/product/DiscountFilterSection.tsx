import React from 'react';
import { Check } from 'lucide-react';
import FilterSection from './FilterSection';

interface DiscountFilterSectionProps {
  selectedDiscount: number | null;
  isExpanded: boolean;
  onToggle: () => void;
  onDiscountChange: (discount: number) => void;
}

const DiscountFilterSection: React.FC<DiscountFilterSectionProps> = ({
  selectedDiscount,
  isExpanded,
  onToggle,
  onDiscountChange
}) => {
  // Valores de descuento disponibles
  const discountOptions = [
    { value: 10, label: '10% o más' },
    { value: 20, label: '20% o más' },
    { value: 30, label: '30% o más' },
    { value: 40, label: '40% o más' }
  ];
  
  // Manejar clic en opción de descuento
  const handleDiscountClick = (discount: number) => {
    // Si el descuento ya está seleccionado, lo deseleccionamos
    if (selectedDiscount === discount) {
      onDiscountChange(0); // 0 significa sin descuento
    } else {
      onDiscountChange(discount);
    }
  };
  
  return (
    <FilterSection
      title="Descuentos"
      isExpanded={isExpanded}
      onToggle={onToggle}
    >
      <div className="space-y-2">
        {discountOptions.map((option) => (
          <div 
            key={option.value} 
            className={`flex items-center cursor-pointer hover:bg-gray-50 p-2 rounded-md w-full ${
              selectedDiscount === option.value ? 'bg-primary-50' : ''
            }`}
            onClick={() => handleDiscountClick(option.value)}
          >
            <div 
              className={`w-5 h-5 border rounded flex items-center justify-center ${
                selectedDiscount === option.value 
                  ? 'bg-primary-600 border-primary-600' 
                  : 'border-gray-300'
              }`}
            >
              {selectedDiscount === option.value && (
                <Check size={14} className="text-white" />
              )}
            </div>
            <span className="ml-2 text-gray-700 w-full">
              {option.label}
            </span>
          </div>
        ))}
      </div>
    </FilterSection>
  );
};

export default React.memo(DiscountFilterSection);