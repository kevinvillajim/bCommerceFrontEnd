import React from 'react';
import { Check, Star } from 'lucide-react';
import FilterSection from './FilterSection';

interface RatingFilterSectionProps {
  selectedRating: number | null;
  isExpanded: boolean;
  onToggle: () => void;
  onRatingChange: (rating: number) => void;
}

/**
 * Componente para la sección de filtrado por calificación
 */
const RatingFilterSection: React.FC<RatingFilterSectionProps> = ({
  selectedRating,
  isExpanded,
  onToggle,
  onRatingChange
}) => {
  return (
    <FilterSection
      title="Calificación"
      isExpanded={isExpanded}
      onToggle={onToggle}
    >
      <div className="space-y-2">
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
                onRatingChange(rating);
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
                onRatingChange(rating);
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
    </FilterSection>
  );
};

export default React.memo(RatingFilterSection);