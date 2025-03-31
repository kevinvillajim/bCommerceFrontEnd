import React, { useRef } from 'react';
import { Search, X } from 'lucide-react';

interface SearchBarProps {
  searchTerm: string;
  onSearchChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSearch: (e: React.FormEvent) => void;
  onClear?: () => void;
  isLoading?: boolean;
}

const SearchBar: React.FC<SearchBarProps> = ({ 
  searchTerm, 
  onSearchChange, 
  onSearch,
  onClear,
  isLoading = false
}) => {
  // Ref para mantener el foco después de limpiar
  const inputRef = useRef<HTMLInputElement>(null);

  // Manejar limpieza de la búsqueda y restaurar el foco
  const handleClear = () => {
    if (onClear) {
      onClear();
      // Restaurar el foco al input después de limpiar
      setTimeout(() => {
        if (inputRef.current) {
          inputRef.current.focus();
        }
      }, 0);
    }
  };

  return (
    <div className="mb-8">
      <form onSubmit={onSearch} className="relative">
        <input 
          ref={inputRef}
          type="text" 
          placeholder="Buscar productos..." 
          className="w-full py-3 px-4 pr-16 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-300 focus:border-transparent"
          value={searchTerm}
          onChange={onSearchChange}
          disabled={isLoading}
          autoComplete="off"
        />
        
        {/* Botón para limpiar la búsqueda, solo visible si hay texto */}
        {searchTerm && (
          <button 
            type="button" 
            onClick={handleClear}
            className="absolute right-12 top-3 text-gray-400 hover:text-gray-600 focus:outline-none"
            aria-label="Limpiar búsqueda"
            disabled={isLoading}
          >
            <X size={20} />
          </button>
        )}
        
        <button 
          type="submit" 
          className="absolute right-3 top-3 text-gray-400 hover:text-primary-600 focus:outline-none"
          aria-label="Buscar"
          disabled={isLoading}
        >
          {isLoading ? (
            <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-primary-600"></div>
          ) : (
            <Search size={20} />
          )}
        </button>
      </form>
    </div>
  );
};

export default React.memo(SearchBar);