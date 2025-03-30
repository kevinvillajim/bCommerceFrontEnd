import React from 'react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

const Pagination: React.FC<PaginationProps> = ({ 
  currentPage, 
  totalPages, 
  onPageChange 
}) => {
  // Si no hay páginas o solo hay una, no mostrar paginación
  if (totalPages <= 1) return null;

  // Calcular qué páginas mostrar
  const getPageNumbers = () => {
    const pageNumbers: number[] = [];
    const maxPagesToShow = 5;
    
    if (totalPages <= maxPagesToShow) {
      // Si hay menos páginas que el máximo a mostrar, mostrar todas
      for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i);
      }
    } else {
      // Calcular rango de páginas a mostrar
      let startPage: number;
      
      if (currentPage <= 3) {
        // Cerca del inicio: mostrar 1-5
        startPage = 1;
      } else if (currentPage >= totalPages - 2) {
        // Cerca del final: mostrar las últimas 5
        startPage = totalPages - 4;
      } else {
        // En medio: mostrar actual -2, -1, actual, +1, +2
        startPage = currentPage - 2;
      }
      
      for (let i = 0; i < maxPagesToShow; i++) {
        pageNumbers.push(startPage + i);
      }
    }
    
    return pageNumbers;
  };

  return (
    <div className="flex justify-center mt-8">
      <div className="flex flex-wrap items-center justify-center gap-2">
        {/* Botón Anterior */}
        <button
          className="px-3 py-1 border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed text-sm"
          disabled={currentPage === 1}
          onClick={() => onPageChange(currentPage - 1)}
        >
          Anterior
        </button>
        
        {/* Botones de páginas */}
        {getPageNumbers().map(pageNum => (
          <button
            key={pageNum}
            className={`w-8 h-8 flex items-center justify-center rounded-md text-sm ${
              currentPage === pageNum
                ? 'bg-primary-600 text-white'
                : 'border border-gray-300 text-gray-700 hover:bg-gray-100'
            }`}
            onClick={() => onPageChange(pageNum)}
          >
            {pageNum}
          </button>
        ))}
        
        {/* Botón Siguiente */}
        <button
          className="px-3 py-1 border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed text-sm"
          disabled={currentPage === totalPages}
          onClick={() => onPageChange(currentPage + 1)}
        >
          Siguiente
        </button>
      </div>
    </div>
  );
};

export default Pagination;