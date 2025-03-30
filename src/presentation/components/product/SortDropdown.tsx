import React, { useRef, useEffect, useState } from 'react';
import { ChevronDown, Check } from 'lucide-react';

interface SortOption {
  id: string;
  label: string;
}

interface SortDropdownProps {
  options: SortOption[];
  selectedOption: string;
  onSortChange: (sortId: string) => void;
}

const SortDropdown: React.FC<SortDropdownProps> = ({
  options,
  selectedOption,
  onSortChange
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    
    const handleScroll = () => {
      setIsOpen(false);
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleOutsideClick);
      window.addEventListener('scroll', handleScroll);
    }

    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
      window.removeEventListener('scroll', handleScroll);
    };
  }, [isOpen]);

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  const handleOptionSelect = (optionId: string) => {
    onSortChange(optionId);
    setIsOpen(false);
  };

  // Encontrar la etiqueta del ordenamiento seleccionado
  const selectedLabel = options.find(option => option.id === selectedOption)?.label || 'Ordenar por';

  return (
    <div className="relative" ref={dropdownRef}>
      <button 
        onClick={toggleDropdown}
        className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg shadow-sm cursor-pointer"
      >
        <span>Ordenar por: {selectedLabel}</span>
        <ChevronDown size={16} />
      </button>
      
      {isOpen && (
        <div className="absolute right-0 z-10 mt-2 w-56 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
          <div className="py-1">
            {options.map((option) => (
              <button
                key={option.id}
                onClick={() => handleOptionSelect(option.id)}
                className="flex items-center gap-2 w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              >
                {selectedOption === option.id && <Check size={16} className="text-primary-600" />}
                <span className={selectedOption === option.id ? "text-primary-600 font-medium" : ""}>
                  {option.label}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default SortDropdown;