import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface SimplePaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

/**
 * Componente de paginación simplificada para dispositivos móviles
 */
const SimplePagination: React.FC<SimplePaginationProps> = ({ 
  currentPage, 
  totalPages, 
  onPageChange 
}) => {
  // Si no hay páginas o solo hay una, no mostrar paginación
  if (totalPages <= 1) return null;

  return (
    <div className="flex justify-center items-center space-x-4 mt-6">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className={`p-2 rounded-full border ${
          currentPage > 1 
            ? 'border-gray-300 text-gray-700 hover:bg-gray-100' 
            : 'border-gray-200 text-gray-400 cursor-not-allowed'
        }`}
        aria-label="Página anterior"
      >
        <ChevronLeft size={20} />
      </button>
      
      <div className="text-sm">
        <span className="font-medium text-gray-700">{currentPage}</span>
        <span className="text-gray-500"> de </span>
        <span className="font-medium text-gray-700">{totalPages}</span>
      </div>
      
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className={`p-2 rounded-full border ${
          currentPage < totalPages 
            ? 'border-gray-300 text-gray-700 hover:bg-gray-100' 
            : 'border-gray-200 text-gray-400 cursor-not-allowed'
        }`}
        aria-label="Página siguiente"
      >
        <ChevronRight size={20} />
      </button>
    </div>
  );
};

export default React.memo(SimplePagination);