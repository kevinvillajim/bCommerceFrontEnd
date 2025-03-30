// src/presentation/contexts/FavoriteContext.tsx
import React, { createContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import ApiClient from '../../infrastructure/api/ApiClient';
import { API_ENDPOINTS } from '../../constants/apiEndpoints';
import type { Favorite, FavoriteListResponse } from '../../core/domain/entities/Favorite';
import { useAuth } from '../hooks/useAuth';

interface FavoriteContextProps {
  favorites: Favorite[];
  loading: boolean;
  error: string | null;
  favoriteCount: number;
  toggleFavorite: (productId: number) => Promise<boolean>;
  checkIsFavorite: (productId: number) => Promise<boolean>;
  fetchFavorites: () => Promise<void>;
}

export const FavoriteContext = createContext<FavoriteContextProps>({
  favorites: [],
  loading: false,
  error: null,
  favoriteCount: 0,
  toggleFavorite: async () => false,
  checkIsFavorite: async () => false,
  fetchFavorites: async () => {}
});

interface FavoriteProviderProps {
  children: ReactNode;
}

export const FavoriteProvider: React.FC<FavoriteProviderProps> = ({ children }) => {
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [favoriteCount, setFavoriteCount] = useState<number>(0);
  const { isAuthenticated } = useAuth();

  // Cargar favoritos cuando el usuario está autenticado
  useEffect(() => {
    if (isAuthenticated) {
      fetchFavorites();
    } else {
      setFavorites([]);
      setFavoriteCount(0);
    }
  }, [isAuthenticated]);

  // Obtener lista de favoritos
  const fetchFavorites = async (): Promise<void> => {
    if (!isAuthenticated) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await ApiClient.get<FavoriteListResponse>(API_ENDPOINTS.FAVORITES.LIST);
      if (response && response.data) {
      setFavorites(response.data);
      setFavoriteCount(response.data.length);
    } else {
      setFavorites([]);
      setFavoriteCount(0);
    }
  } catch (err) {
    setError(err instanceof Error ? err.message : 'Error al cargar favoritos');
    console.error('Error fetching favorites:', err);
  } finally {
    setLoading(false);
  }
};

  // Toggle favorito (añadir/quitar)
  const toggleFavorite = async (productId: number): Promise<boolean> => {
    if (!isAuthenticated) return false;
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await ApiClient.post<{ isFavorite: boolean }>(
      API_ENDPOINTS.FAVORITES.TOGGLE,
      { productId }
    );
      
      // Actualizar la lista de favoritos después del toggle
      await fetchFavorites();
      
      return response.isFavorite || false;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al actualizar favorito');
      console.error('Error toggling favorite:', err);
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Verificar si un producto está en favoritos
  const checkIsFavorite = async (productId: number): Promise<boolean> => {
    if (!isAuthenticated) return false;
    
    try {
        const response = await ApiClient.get<{ favorites: Favorite[]; unread_count: number }>(
      API_ENDPOINTS.FAVORITES.LIST
    );
      return response.favorites.some(fav => fav.id === productId);
    } catch (err) {
      console.error('Error checking favorite status:', err);
      return false;
    }
  };

  return (
    <FavoriteContext.Provider value={{
      favorites,
      loading,
      error,
      favoriteCount,
      toggleFavorite,
      checkIsFavorite,
      fetchFavorites
    }}>
      {children}
    </FavoriteContext.Provider>
  );
};