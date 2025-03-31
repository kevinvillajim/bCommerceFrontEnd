import { useState, useEffect, useCallback, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';

export const useProductSearch = (debounceTimeMs: number = 500) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchTerm, setSearchTerm] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  
  // Referencia para el temporizador de debounce
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  
  // Inicializar desde URL
  useEffect(() => {
    const searchParam = searchParams.get('search');
    if (searchParam) {
      setSearchTerm(searchParam);
    }
    setIsInitialized(true);
  }, [searchParams]);
  
  // Manejar cambios en el campo de búsqueda con debounce
  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);
    
    // Solo debounce la actualización de la URL, no el estado del input
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    
    // Configurar nuevo temporizador
    debounceTimerRef.current = setTimeout(() => {
      if (isInitialized) {
        updateSearchInUrl(value);
      }
    }, debounceTimeMs);
  }, [debounceTimeMs, isInitialized]);
  
  // Actualizar la URL con el término de búsqueda
  const updateSearchInUrl = useCallback((term: string) => {
    setIsSearching(true);
    
    const newParams = new URLSearchParams(searchParams);
    
    if (term) {
      newParams.set('search', term);
    } else {
      newParams.delete('search');
    }
    
    // Resetear a la página 1 cuando se busca
    newParams.delete('page');
    
    setSearchParams(newParams, { replace: true });
    
    // Dar tiempo para que la URL se actualice antes de permitir nuevas búsquedas
    setTimeout(() => {
      setIsSearching(false);
    }, 100);
  }, [searchParams, setSearchParams]);
  
  // Manejar envío del formulario (búsqueda inmediata sin esperar debounce)
  const handleSearchSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    
    // Limpiar el temporizador pendiente
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
      debounceTimerRef.current = null;
    }
    
    // Actualizar inmediatamente
    updateSearchInUrl(searchTerm);
  }, [searchTerm, updateSearchInUrl]);
  
  // Limpiar la búsqueda
  const clearSearch = useCallback(() => {
    setSearchTerm('');
    
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
      debounceTimerRef.current = null;
    }
    
    const newParams = new URLSearchParams(searchParams);
    newParams.delete('search');
    setSearchParams(newParams, { replace: true });
  }, [searchParams, setSearchParams]);
  
  // Limpiar temporizador al desmontar
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);
  
  return {
    searchTerm,
    isSearching,
    handleSearchChange,
    handleSearchSubmit,
    clearSearch
  };
};

export default useProductSearch;