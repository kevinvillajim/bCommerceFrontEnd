import React from 'react';
import { Check, Star } from 'lucide-react';
import FilterSection from './FilterSection';

interface RatingFilterSectionProps {
  selectedRating: number | null;
  isExpanded: boolean;
  onToggle: () => void;
  onRatingChange: (rating: number) => void;
}

const RatingFilterSection: React.FC<RatingFilterSectionProps> = ({
  selectedRating,
  isExpanded,
  onToggle,
  onRatingChange
}) => {
  // Generar opciones de rating (de 5 a 1 estrellas)
  const ratingOptions = [5, 4, 3, 2, 1];
  
  // Manejar clic en opción de rating
  const handleRatingClick = (rating: number) => {
    // Si el rating ya está seleccionado, lo deseleccionamos
    if (selectedRating === rating) {
      onRatingChange(0); // 0 significa sin filtro de rating
    } else {
      onRatingChange(rating);
    }
  };
  
  return (
    <FilterSection
      title="Calificación"
      isExpanded={isExpanded}
      onToggle={onToggle}
    >
      <div className="space-y-2">
        {ratingOptions.map((rating) => (
          <div 
            key={rating} 
            className={`flex items-center cursor-pointer hover:bg-gray-50 p-2 rounded-md w-full ${
              selectedRating === rating ? 'bg-primary-50' : ''
            }`}
            onClick={() => handleRatingClick(rating)}
          >
            <div 
              className={`w-5 h-5 border rounded flex items-center justify-center ${
                selectedRating === rating 
                  ? 'bg-primary-600 border-primary-600' 
                  : 'border-gray-300'
              }`}
            >
              {selectedRating === rating && (
                <Check size={14} className="text-white" />
              )}
            </div>
            <div 
              className="ml-2 flex items-center w-full"
            >
              {/* Mostrar estrellas según el rating */}
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  size={16}
                  className={`${i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
                />
              ))}
              <span className="ml-1 text-sm text-gray-700">y más</span>
            </div>
          </div>
        ))}
      </div>
    </FilterSection>
  );
};

export default React.memo(RatingFilterSection);