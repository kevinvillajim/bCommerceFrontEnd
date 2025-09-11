import React from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface FilterSectionProps {
  title: string;
  isExpanded: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}

/**
 * Componente reutilizable para las secciones de filtro
 */
const FilterSection: React.FC<FilterSectionProps> = ({
  title,
  isExpanded,
  onToggle,
  children
}) => {
  return (
    <div className="border-b border-gray-100">
      <div 
        className="p-4 flex justify-between items-center cursor-pointer" 
        onClick={onToggle}
      >
        <h4 className="font-medium text-gray-800">{title}</h4>
        {isExpanded ? 
          <ChevronUp size={18} className="text-gray-500" /> : 
          <ChevronDown size={18} className="text-gray-500" />
        }
      </div>
      
      {isExpanded && (
        <div className="px-4 pb-4">
          {children}
        </div>
      )}
    </div>
  );
};

export default React.memo(FilterSection);