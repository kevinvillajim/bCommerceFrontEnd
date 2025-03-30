import { useContext } from 'react';
import { FavoriteContext } from '../contexts/FavoriteContext';

export const useFavorites = () => {
  return useContext(FavoriteContext);
};