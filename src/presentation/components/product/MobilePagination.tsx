import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface MobilePaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

/**
 * Componente de paginación optimizado para dispositivos móviles
 * Diseño intuitivo con indicadores visibles para la página actual
 */
const MobilePagination: React.FC<MobilePaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange
}) => {
  // Si no hay múltiples páginas, no mostrar paginación
  if (totalPages <= 1) return null;

  // Determinar qué páginas mostrar (máximo 5)
  const getPageNumbers = () => {
    const pageNumbers = [];
    
    if (totalPages <= 5) {
      // Si hay 5 o menos páginas, mostrar todas
      for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i);
      }
    } else {
      // Para más páginas, mostrar un rango centrado en la página actual
      let startPage;
      
      if (currentPage <= 3) {
        // Cerca del inicio
        startPage = 1;
      } else if (currentPage >= totalPages - 2) {
        // Cerca del final
        startPage = totalPages - 4;
      } else {
        // En medio
        startPage = currentPage - 2;
      }
      
      for (let i = 0; i < 5; i++) {
        pageNumbers.push(startPage + i);
      }
    }
    
    return pageNumbers;
  };

  return (
    <div className="flex flex-col items-center mt-6 space-y-4">
      {/* Indicador de página */}
      <div className="text-sm text-gray-500">
        Página <span className="font-medium text-gray-900">{currentPage}</span> de <span className="font-medium text-gray-900">{totalPages}</span>
      </div>
      
      {/* Botones de paginación */}
      <div className="flex justify-center items-center space-x-1">
        {/* Botón Anterior */}
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className={`flex items-center justify-center w-10 h-10 rounded-lg border ${
            currentPage > 1 
              ? 'border-gray-300 text-gray-700 hover:bg-gray-50' 
              : 'border-gray-200 text-gray-400 cursor-not-allowed'
          }`}
          aria-label="Página anterior"
        >
          <ChevronLeft size={20} />
        </button>
        
        {/* Botones de número de página */}
        {getPageNumbers().map(pageNum => (
          <button
            key={pageNum}
            onClick={() => onPageChange(pageNum)}
            className={`flex items-center justify-center w-10 h-10 rounded-lg text-sm ${
              currentPage === pageNum
                ? 'bg-primary-600 text-white font-medium shadow-sm'
                : 'border border-gray-300 text-gray-700 hover:bg-gray-50'
            }`}
            aria-label={`Página ${pageNum}`}
            aria-current={currentPage === pageNum ? 'page' : undefined}
          >
            {pageNum}
          </button>
        ))}
        
        {/* Botón Siguiente */}
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className={`flex items-center justify-center w-10 h-10 rounded-lg border ${
            currentPage < totalPages 
              ? 'border-gray-300 text-gray-700 hover:bg-gray-50' 
              : 'border-gray-200 text-gray-400 cursor-not-allowed'
          }`}
          aria-label="Página siguiente"
        >
          <ChevronRight size={20} />
        </button>
      </div>
    </div>
  );
};

export default MobilePagination;